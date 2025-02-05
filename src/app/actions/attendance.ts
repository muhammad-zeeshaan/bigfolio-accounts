"use server"
import Attendance from '@/models/Attendance';
import mongoose from 'mongoose';
import { AttendanceByDay, SessionUser } from '../types';
import loadSession from '@/utils/session';

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

        let query: { date: { $gte: Date; $lte: Date; }; userId?: mongoose.Types.ObjectId } = {
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
export const getMonthlyUserAttendance = async (year: number, month: number, userId: string): Promise<AttendanceByDay> => {
    const session = await loadSession();
    if (!session) {
        throw new Error('You must be logged in to view attendance records');
    }

    try {
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month - 1, new Date(year, month, 0).getDate(), 23, 59, 59, 999);

        let query: { date: { $gte: Date; $lte: Date; }; userId?: mongoose.Types.ObjectId } = {
            date: {
                $gte: startDate,
                $lte: endDate,
            },
        };
        const currentUser = session.user as SessionUser;
        query.userId = new mongoose.Types.ObjectId(userId);

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

        // Check if the user is already on a break
        const lastBreak = attendance.breaks[attendance.breaks.length - 1];
        if (lastBreak && !lastBreak.breakEnd) {
            return { message: 'You are already on a break!', attendance: attendance.toObject() }; // Convert to plain object
        }

        // Start a new break
        attendance.breaks.push({ breakStart: new Date() });
        await attendance.save();

        return { message: 'Break started successfully', attendance: attendance.toObject() }; // Convert to plain object
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
