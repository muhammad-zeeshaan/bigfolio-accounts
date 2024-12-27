import { getMonthlyAttendance } from '@/app/actions/attendance';
import CalendarComp from '@/Components/calendar'
import React from 'react'

export default async function page() {
    const year = 2024;
    const month = 12; // December

    const attendanceDetails = await getMonthlyAttendance(year, month);
    console.log(attendanceDetails);
    return (
        <div>
            <CalendarComp attendanceDetails={attendanceDetails} />
        </div>
    )
}
