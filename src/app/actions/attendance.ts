"use server"
import Attendance from '@/models/Attendance';
import mongoose from 'mongoose';
import { AttendanceByDay } from '../types';

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
    try {
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month - 1, new Date(year, month, 0).getDate(), 23, 59, 59, 999); 

        const attendanceRecords = await Attendance.find({
            date: {
                $gte: startDate,
                $lte: endDate, 
            },
        })
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
                userId: record.userId._id as string,
                userName: record.userId.name,
                checkInTime: record.checkInTime,
            });
        });

        return attendanceByDay;
    } catch (error) {
        console.error('Error fetching attendance records:', error);
        throw new Error('Error fetching attendance records');
    }
};
