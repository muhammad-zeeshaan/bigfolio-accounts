"use server"
import Attendance from '@/models/Attendance';
import mongoose from 'mongoose';
import { AttendanceByDay, breakDTO, SessionUser } from '../../app/types';
import loadSession from '@/utils/session';
import { CheckInType, CheckOutType, EndBreakType, StartBreakType, UpdateAttendanceType } from '@/app/validations/attendanceSchema';

export const checkIn = async (input: CheckInType) => {
  const { userId } = input;
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check for previous unattended check-out
    const previousOpenAttendance = await Attendance.findOne({
      userId: new mongoose.Types.ObjectId(userId),
      $or: [
        { checkOutTime: { $exists: false } },
        { checkOutTime: null }
      ]
    })
      .sort({ date: -1 })
      .limit(1);
    if (previousOpenAttendance) {
      const previousDate = previousOpenAttendance.date.toLocaleDateString();
      return {
        message: `Cannot check in. You have an open attendance from ${previousDate}. `, attendance: null
      }
    }
    // Check for existing attendance today
    const existingAttendance = await Attendance.findOne({
      userId: new mongoose.Types.ObjectId(userId),
      date: {
        $gte: today,
        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
      },
    });

    if (existingAttendance) {
      const checkInTime = existingAttendance.checkInTime;
      return {
        message: `You already checked in today at ${checkInTime.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit'
        })}`,
        attendance: null
      };
    }

    // Create new check-in
    const attendance = await Attendance.create({
      userId: new mongoose.Types.ObjectId(userId),
      checkInTime: new Date(),
      date: new Date(),
    });

    return { message: 'Check-in successful.', attendance };
  } catch (error) {
    console.error('Error during check-in:', error);
    throw new Error(
      error instanceof Error ? error.message : 'Failed to process check-in'
    );
  }
};
export const getMonthlyAttendance = async (year: number, month: number): Promise<AttendanceByDay> => {
  const session = await loadSession();
  if (!session) {
    throw new Error('You must be logged in to view attendance records.');
  }

  try {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month - 1, new Date(year, month, 0).getDate(), 23, 59, 59, 999);

    const query: { date: { $gte: Date; $lte: Date; }; userId?: mongoose.Types.ObjectId } = {
      date: {
        $gte: startDate,
        $lte: endDate,
      },
    };
    const currentUser = session.user as SessionUser;
    if (currentUser?.role !== 'admin') {
      query.userId = new mongoose.Types.ObjectId(currentUser?.id);
    }

    const attendanceRecords = await Attendance.find(query)
      .populate({
        path: 'userId',
        model: 'User',
        select: 'name',
      })
      .lean();

    const attendanceByDay: AttendanceByDay = {};

    attendanceRecords.forEach((record) => {
      const day = new Date(record.date);
      const dateKey = `${day.getDate().toString().padStart(2, '0')}-${(day.getMonth() + 1).toString().padStart(2, '0')}-${day.getFullYear()}`;
      if (!attendanceByDay[dateKey]) {
        attendanceByDay[dateKey] = [];
      }
      attendanceByDay[dateKey].push({
        _id: String(record._id),
        userId: record.userId._id as string,
        userName: record.userId.name,
        checkInTime: record.checkInTime,
        checkOutTime: record.checkOutTime,
        breaks: record.breaks || [],
      });
    });

    return attendanceByDay;
  } catch (error) {
    console.error('Error fetching attendance records:', error);
    return {}
  }
};
export const checkOut = async (input: CheckOutType) => {
  const { userId } = input;
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existingAttendance = await Attendance.findOne({
      userId: new mongoose.Types.ObjectId(userId),
      date: {
        $gte: today,
        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
      },
    });
    const withOutCheckOutRecord = await Attendance.findOne({
      userId: new mongoose.Types.ObjectId(userId),
      $or: [
        { checkOutTime: { $exists: false } },
        { checkOutTime: null }
      ]
    })
      .sort({ date: -1 })
      .limit(1);
    if (withOutCheckOutRecord) {
      const ongoingBreak = withOutCheckOutRecord.breaks?.some(
        (breakEntry: breakDTO) => breakEntry.breakStart && !breakEntry.breakEnd
      );

      if (ongoingBreak) {
        return { message: 'You cannot check out while on a break!', attendance: null };
      }
      withOutCheckOutRecord.checkOutTime = new Date();
      await withOutCheckOutRecord.save();
      return { message: 'Check-out successful.', attendance: withOutCheckOutRecord };
    }
    if (!existingAttendance) {
      return { message: 'You have not checked in today!', attendance: null };
    }

    if (existingAttendance.checkOutTime) {
      return {
        message: `You already checked out today at ${existingAttendance.checkOutTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`,
        attendance: existingAttendance,
      };
    }

    // Check if user is on a break (i.e. if there is an ongoing break)
    const ongoingBreak = existingAttendance.breaks?.some(
      (breakEntry: breakDTO) => breakEntry.breakStart && !breakEntry.breakEnd
    );

    if (ongoingBreak) {
      return { message: 'You cannot check out while on a break!', attendance: null };
    }

    existingAttendance.checkOutTime = new Date();
    await existingAttendance.save();

    return { message: 'Check-out successful.', attendance: existingAttendance };
  } catch (error) {
    console.error('Error during check-out:', error);
    return { message: 'Something went wrong during check-out!', attendance: null };
  }
};
export const startBreak = async (input: StartBreakType) => {
  const { userId } = input
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const withOutCheckOutRecord = await Attendance.findOne({
      userId: new mongoose.Types.ObjectId(userId),
      $or: [
        { checkOutTime: { $exists: false } },
        { checkOutTime: null }
      ]
    })
      .sort({ date: -1 })
      .limit(1);
    if (withOutCheckOutRecord) {
      const lastBreak = withOutCheckOutRecord.breaks[withOutCheckOutRecord.breaks.length - 1];
      if (lastBreak && !lastBreak.breakEnd) {
        return { message: 'You are already on a break!', attendance: null };
      } else {
        withOutCheckOutRecord.breaks.push({ breakStart: new Date() });
        await withOutCheckOutRecord.save();
        return { message: 'Break started successfully.', attendance: withOutCheckOutRecord.toObject() };
      }
    }
    const attendance = await Attendance.findOne({
      userId: new mongoose.Types.ObjectId(userId),
      date: {
        $gte: today,
        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
      },
    });

    if (!attendance) {
      return { message: 'You have not checked in today!', attendance: null };
    }
    if (attendance.checkOutTime) {
      return { message: 'You have already checked out! Cannot start a break.', attendance: null };
    }

    const lastBreak = attendance.breaks[attendance.breaks.length - 1];
    if (lastBreak && !lastBreak.breakEnd) {

      return { message: 'You are already on a break!', attendance: null };
    }

    attendance.breaks.push({ breakStart: new Date() });
    await attendance.save();

    return { message: 'Break started successfully.', attendance: attendance.toObject() };
  } catch (error) {
    console.error('Error starting break:', error);
    return { message: 'Error starting break', attendance: null };
  }
};

export const endBreak = async (input: EndBreakType) => {
  const { userId } = input
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const withOutCheckOutRecord = await Attendance.findOne({
      userId: new mongoose.Types.ObjectId(userId),
      $or: [
        { checkOutTime: { $exists: false } },
        { checkOutTime: null }
      ]
    })
      .sort({ date: -1 })
      .limit(1);
    if (withOutCheckOutRecord) {
      const lastBreak = withOutCheckOutRecord.breaks[withOutCheckOutRecord.breaks.length - 1];
      if (lastBreak && !lastBreak.breakEnd) {
        lastBreak.breakEnd = new Date();
        await withOutCheckOutRecord.save();
        return { message: 'Break ended successfully.', attendance: withOutCheckOutRecord.toObject() };
      }
    }
    const attendance = await Attendance.findOne({
      userId: new mongoose.Types.ObjectId(userId),
      date: {
        $gte: today,
        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
      },
    });

    if (!attendance) {
      return { message: 'You have not checked in today!', attendance: null };
    }

    const lastBreak = attendance.breaks[attendance.breaks.length - 1];
    if (!lastBreak || lastBreak.breakEnd) {
      return { message: 'You are not on a break!', attendance: null };
    }

    lastBreak.breakEnd = new Date();
    await attendance.save();

    return { message: 'Break ended successfully.', attendance: attendance.toObject() };
  } catch (error) {
    console.error('Error ending break:', error);
    return { message: 'Error ending break', attendance: null };
  }
};

export const updateAttendance = async (input: UpdateAttendanceType) => {
  try {
    const { _id, checkInTime, checkOutTime, breaks } = input;

    if (_id && !mongoose.Types.ObjectId.isValid(_id)) {
      throw new Error("Invalid Attendance ID");
    }

    const updatedAttendance = await Attendance.findByIdAndUpdate(
      _id,
      { checkInTime, checkOutTime, breaks },
      { new: true }
    );

    if (!updatedAttendance) {
      throw new Error("Attendance record not found");
    }

    return { success: true, message: "Attendance updated successfully", data: updatedAttendance };
  } catch (error) {
    console.error('Error updating attendance:', error);
    return { success: false, message: "Error updating attendance" };
  }
};