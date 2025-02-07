import { getMonthlyUserAttendance } from '@/app/actions/attendance';
import { AttendanceSummary } from '@/app/types';
import CalendarComp from '@/Components/calendarforAttendance';
import { getEmployeeById } from '@/trpc/user/controller';
import React from 'react'

export default async function page({ searchParams, params }: { searchParams: { year?: string, month?: string }, params: { user: string } }) {
    const year = searchParams?.year ? +searchParams.year : new Date().getFullYear();
    const { user } = params
    const month = searchParams?.month ? +searchParams.month : new Date().getMonth() + 1;
    const attendanceDetails = await getMonthlyUserAttendance(year, month, user);
    const userData = await getEmployeeById(user);
    return (
        <>
            <CalendarComp attendanceDetails={attendanceDetails as AttendanceSummary} userData={userData} />
        </>
    )
}
