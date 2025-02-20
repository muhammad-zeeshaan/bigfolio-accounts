import { getMonthlyUserAttendance } from '@/app/actions/attendance';
import { AttendanceSummary, SessionDTO } from '@/app/types';
import CalendarComp from '@/Components/calendarforAttendance';
import { getEmployeeById } from '@/trpc/user/controller';
import loadSession from '@/utils/session';
import React from 'react'

export default async function page({ searchParams }: { searchParams: { year?: string, month?: string } }) {
    const year = searchParams?.year ? +searchParams.year : new Date().getFullYear();
    const month = searchParams?.month ? +searchParams.month : new Date().getMonth() + 1;
    const session = await loadSession() as SessionDTO | undefined;
    const user = session?.user?.id ?? ''
    const attendanceDetails = await getMonthlyUserAttendance(year, month, user);
    const userData = await getEmployeeById(user);
    return (
        <>
            <CalendarComp attendanceDetails={attendanceDetails as AttendanceSummary} userData={userData} />
        </>
    )
}
