"use server"
import Attendance from '@/models/Attendance';
import mongoose from 'mongoose';
import { AttendanceByDay, AttendanceSummary, SessionUser } from '../types';
import loadSession from '@/utils/session';
import User from '@/models/User';

export const checkIn = async (userId: string) => {
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

        if (existingAttendance) {
            const checkInTime = existingAttendance.checkInTime;
            return { message: `You already checked in today at ${checkInTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`, attendance: existingAttendance };
        }

        const attendance = await Attendance.create({
            userId: new mongoose.Types.ObjectId(userId),
            checkInTime: new Date(),
            date: new Date(),
        });

        return { message: 'Check-in successful', attendance };
    } catch (error) {
        console.error('Error during check-in:', error);
        throw new Error('Error during check-in');
    }
};
export const getMonthlyAttendance = async (year: number, month: number): Promise<AttendanceByDay> => {
    const session = await loadSession();
    if (!session) {
        throw new Error('You must be logged in to view attendance records');
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
            if (!record.userId) {
                return; // Skip this record
            }

            const day = new Date(record.date);
            const dateKey = `${day.getDate().toString().padStart(2, '0')}-${(day.getMonth() + 1).toString().padStart(2, '0')}-${day.getFullYear()}`;

            if (!attendanceByDay[dateKey]) {
                attendanceByDay[dateKey] = [];
            }

            attendanceByDay[dateKey].push({
                _id: String(record?._id),
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
        return {};
    }
};

export const getMonthlyUserAttendance = async (
    year: number,
    month: number,
    userId: string
): Promise<AttendanceSummary> => {
    const session = await loadSession();
    if (!session) {
        throw new Error("You must be logged in to view attendance records");
    }

    try {
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month - 1, new Date(year, month, 0).getDate(), 23, 59, 59, 999);
        const today = new Date();
        const isCurrentMonth = year === today.getFullYear() && month === today.getMonth() + 1;
        const lastValidDay = isCurrentMonth ? today.getDate() : new Date(year, month, 0).getDate();

        const user = await User.findById(userId).select("joiningDate");
        if (!user) {
            throw new Error("User not found");
        }
        const joiningDate = user.joiningDate ? new Date(user.joiningDate) : null;

        const query: { date: { $gte: Date; $lte: Date }; userId?: mongoose.Types.ObjectId } = {
            date: {
                $gte: startDate,
                $lte: endDate,
            },
        };

        query.userId = new mongoose.Types.ObjectId(userId);

        const attendanceRecords = await Attendance.find(query)
            .populate({
                path: "userId",
                model: "User",
                select: "name",
            })
            .lean();

        const attendanceByDay: AttendanceByDay = {};
        let totalPresent = 0;
        let totalAbsents = 0;
        let overtimeDays = 0;
        const presentDays = new Set<string>(); 

        attendanceRecords.forEach((record) => {
            const day = new Date(record.date);
            const dateKey = `${day.getDate().toString().padStart(2, "0")}-${(day.getMonth() + 1).toString().padStart(2, "0")}-${day.getFullYear()}`;

            if (!attendanceByDay[dateKey]) {
                attendanceByDay[dateKey] = [];
            }

            const isWeekend = day.getDay() === 6 || day.getDay() === 0; // Saturday (6) & Sunday (0)
            if (isWeekend) {
                overtimeDays++;
            }

            attendanceByDay[dateKey].push({
                _id: String(record?._id),
                userId: record?.userId?._id as string,
                userName: record.userId.name,
                checkInTime: record.checkInTime,
                checkOutTime: record.checkOutTime,
                breaks: record.breaks || [],
            });

            presentDays.add(dateKey);
        });

        // Calculate total absents (excluding weekends) after joining date
        for (let day = 1; day <= lastValidDay; day++) {
            const date = new Date(year, month - 1, day);
            const dateKey = `${day.toString().padStart(2, "0")}-${month.toString().padStart(2, "0")}-${year}`;

            const isWeekend = date.getDay() === 6 || date.getDay() === 0;

            // Only count absences after the joining date
            if (!isWeekend && (!joiningDate || date >= joiningDate) && !presentDays.has(dateKey)) {
                totalAbsents++;
            }
        }

        totalPresent = presentDays.size;

        return {
            attendanceByDay,
            totalPresent,
            totalAbsents,
            overtimeDays,
        };
    } catch (error) {
        console.error("Error fetching attendance records:", error);
        return {
            attendanceByDay: {},
            totalPresent: 0,
            totalAbsents: 0,
            overtimeDays: 0,
        };
    }
};


export const checkOut = async (userId: string) => {
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

        if (!existingAttendance) {
            return { message: 'You have not checked in today!', attendance: null };
        }

        if (existingAttendance.checkOutTime) {
            const checkOutTime = existingAttendance.checkOutTime;
            return { message: `You already checked out today at ${checkOutTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`, attendance: existingAttendance };
        }

        existingAttendance.checkOutTime = new Date();
        await existingAttendance.save();

        return { message: 'Check-out successful', attendance: existingAttendance };
    } catch (error) {
        console.error('Error during check-out:', error);
        return { message: 'You have not checked in today!', attendance: null };
    }
};

export const startBreak = async (userId: string) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

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
            return { message: 'You have already checked out! Cannot start a break.', attendance: attendance.toObject() };
        }

        const lastBreak = attendance.breaks[attendance.breaks.length - 1];
        if (lastBreak && !lastBreak.breakEnd) {
            return { message: 'You are already on a break!', attendance: attendance.toObject() };
        }

        attendance.breaks.push({ breakStart: new Date() });
        await attendance.save();

        return { message: 'Break started successfully', attendance: attendance.toObject() };
    } catch (error) {
        console.error('Error starting break:', error);
        return { message: 'Error starting break', attendance: null };
    }
};

export const endBreak = async (userId: string) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

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
            return { message: 'You are not on a break!', attendance: attendance.toObject() };
        }

        lastBreak.breakEnd = new Date();
        await attendance.save();

        return { message: 'Break ended successfully', attendance: attendance.toObject() };
    } catch (error) {
        console.error('Error ending break:', error);
        return { message: 'Error ending break', attendance: null };
    }
};
