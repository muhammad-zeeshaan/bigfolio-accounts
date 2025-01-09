"use client"
import React, { useEffect } from 'react';
import type { BadgeProps, CalendarProps } from 'antd';
import { Badge, Button, Calendar, message, Typography } from 'antd';
import type { Dayjs } from 'dayjs';
import { checkIn } from '@/app/actions/attendance';
import { getSession } from 'next-auth/react';
import { AttendanceByDay, AttendanceRecord, SessionUser } from '@/app/types';
import useQueryParams from '@/app/hooks/useQueryParams';
interface CalendarCompProps {
    attendanceDetails: AttendanceByDay;
}
const getListData = (value: Dayjs, attendanceDetails: AttendanceByDay) => {
    const listData: { type: string; content: string }[] = [];
    const dateKey = `${value.date().toString().padStart(2, '0')}-${(value.month() + 1).toString().padStart(2, '0')}-${value.year()}`;

    if (attendanceDetails[dateKey]) {
        attendanceDetails[dateKey].forEach((entry: AttendanceRecord) => {
            const userName = entry.userName || "Unknown User";
            const checkInTime = entry.checkInTime
                ? new Date(entry.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                : "No Check-In";

            listData.push({
                type: 'success',
                content: `${userName} checked in at ${checkInTime}.`,
            });
        });
    }

    return listData;
};
const getMonthData = (value: Dayjs) => {
    if (value.month() === 8) {
        return 1394;
    }
};

const CalendarComp: React.FC<CalendarCompProps> = ({ attendanceDetails }) => {
    const params = useQueryParams();
    const [userId, setUserId] = React.useState<string>('')
    const [loading, setLoading] = React.useState<boolean>(false)
    const monthCellRender = (value: Dayjs) => {
        const num = getMonthData(value);
        return num ? (
            <div className="notes-month">
                <section>{num}</section>
                <span>Backlog number</span>
            </div>
        ) : null;
    };
    useEffect(() => {
        getSession().then((session) => {
            const user: SessionUser = session?.user as SessionUser;
            setUserId(user?.id ?? '');
        })
    }, [])
    const dateCellRender = (value: Dayjs) => {
        const listData = getListData(value, attendanceDetails);
        return (
            <ul className="events">
                {listData.map((item) => (
                    <li key={item.content}>
                        <Badge status={item.type as BadgeProps['status']} text={item.content} />
                    </li>
                ))}
            </ul>
        );
    };

    const cellRender: CalendarProps<Dayjs>['cellRender'] = (current, info) => {
        if (info.type === 'date') return dateCellRender(current);
        if (info.type === 'month') return monthCellRender(current);
        return info.originNode;
    };
    const handleCheckIn = async () => {
        setLoading(true);
        try {
            const res = await checkIn(userId);
            message.warning(res.message);
        } catch (error) {
            console.error('Error during check-in:', error);
        } finally {
            setLoading(false);
        }
    };
    const onFilterChange = (data: Dayjs) => {
        params.set('year', data.year());
        params.set('month', data.month() + 1);
        params.update();
    }
    return (
        <>
            <div className='flex justify-between items-center'>
                <Typography.Title >Check In</Typography.Title>
                <Button type="primary" loading={loading} onClick={handleCheckIn}>Check In</Button>
            </div >
            <Calendar cellRender={cellRender} onPanelChange={onFilterChange} />
        </>
    );
};

export default CalendarComp;