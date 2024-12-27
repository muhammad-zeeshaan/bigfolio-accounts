"use server"
import Attendance from '@/models/Attendance';
import mongoose from 'mongoose';

export const checkIn = async (userId: string) => {
    try {
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
export const getMonthlyAttendance = async (year: number, month: number) => {

    try {
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0);

        const attendanceRecords = await Attendance.find({
            date: {
                $gte: startDate,
                $lt: endDate,
            },
        })
            .populate({
                path: 'userId',
                model: 'User',
                select: 'name',
            })
            .lean();

        const attendanceByDay: { [key: number]: any[] } = {};

        attendanceRecords.forEach((record) => {
            const day = record.date.getDate();
            if (!attendanceByDay[day]) {
                attendanceByDay[day] = [];
            }
            attendanceByDay[day].push({
                userId: record.userId._id,
                userName: record.userId.name,
                checkInTime: record.checkInTime,
                checkOutTime: record.checkOutTime,
            });
        });

        return attendanceByDay;
    } catch (error) {
        console.error('Error fetching attendance records:', error);
        throw new Error('Error fetching attendance records');
    }
};