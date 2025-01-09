import { getMonthlyAttendance } from '@/app/actions/attendance';
import { AttendanceByDay } from '@/app/types';
import CalendarComp from '@/Components/calendar'
import React from 'react'

export default async function page({ searchParams }: { searchParams: { year?: string, month?: string } }) {
    const year = searchParams?.year ? +searchParams.year : new Date().getFullYear();
    const month = searchParams?.month ? +searchParams.month : new Date().getMonth() + 1;
    const attendanceDetails = await getMonthlyAttendance(year, month);
    return (
        <>
            <CalendarComp attendanceDetails={attendanceDetails as AttendanceByDay} />
        </>
    )
}
