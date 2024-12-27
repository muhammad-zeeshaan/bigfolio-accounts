"use client"
import React, { useEffect } from 'react';
import type { BadgeProps, CalendarProps } from 'antd';
import { Badge, Button, Calendar, Typography } from 'antd';
import type { Dayjs } from 'dayjs';
import { checkIn } from '@/app/actions/attendance';
import { getSession } from 'next-auth/react';

const getListData = (value: Dayjs) => {
    let listData: { type: string; content: string }[] = [];
    switch (value.date().toString()) {
        case '26':
            listData = [
                { type: 'warning', content: 'This is warning event.' },
                { type: 'success', content: 'This is usual event.' },
            ];
            break;
        case 10:
            listData = [
                { type: 'warning', content: 'This is warning event.' },
                { type: 'success', content: 'This is usual event.' },
                { type: 'error', content: 'This is error event.' },
            ];
            break;
        case 15:
            listData = [
                { type: 'warning', content: 'This is warning event' },
                { type: 'success', content: 'This is very long usual event......' },
                { type: 'error', content: 'This is error event 1.' },
                { type: 'error', content: 'This is error event 2.' },
                { type: 'error', content: 'This is error event 3.' },
                { type: 'error', content: 'This is error event 4.' },
            ];
            break;
        default:
    }
    return listData || [];
};

const getMonthData = (value: Dayjs) => {
    if (value.month() === 8) {
        return 1394;
    }
};

const CalendarComp: React.FC = ({ attendanceDetails }) => {
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
            setUserId(session?.user?.id as string)
        })
    }, [])
    const dateCellRender = (value: Dayjs) => {
        const listData = getListData(value);
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
            await checkIn(userId);
        } catch (error) {
            console.error('Error during check-in:', error);
        } finally {
            setLoading(false);
        }
    };
    return (
        <>
            <div className='flex justify-between items-center bg-red-100'>
                <Typography.Title >Check In</Typography.Title>
                <Button type="primary" loading={loading} onClick={handleCheckIn}>Check In</Button>
            </div >
            <Calendar cellRender={cellRender} />
        </>
    );
};

export default CalendarComp;