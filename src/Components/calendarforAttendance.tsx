"use client";
import React, { useState } from "react";
import {
    Badge,
    Button,
    Calendar,
    Card,
    Row,
    Col,
    Typography,
    Popover,
    List,
} from "antd";
import type { Dayjs } from "dayjs";
import { AttendanceByDay, AttendanceRecord, SessionUser } from "@/app/types";
import EditAttendanceModal from './editAttendanceModal';

interface CalendarCompProps {
    attendanceDetails: AttendanceByDay;
}

const getListData = (value: Dayjs, attendanceDetails: AttendanceByDay) => {
    const userMap: Record<string, { checkInTime: string; checkOutTime: string; breaks: string[] }> = {};

    const dateKey = `${value.date().toString().padStart(2, "0")}-${(value.month() + 1).toString().padStart(2, "0")}-${value.year()}`;

    if (attendanceDetails[dateKey]) {
        attendanceDetails[dateKey].forEach((entry: AttendanceRecord) => {
            const userName = entry.userName || "Unknown User";
            const checkInTime = entry.checkInTime
                ? new Date(entry.checkInTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                : "No Check-In";
            const checkOutTime = entry.checkOutTime
                ? new Date(entry.checkOutTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                : "No Check-Out";

            if (!userMap[userName]) {
                userMap[userName] = { checkInTime, breaks: [], checkOutTime };
            }

            if (entry.breaks && entry.breaks.length > 0) {
                entry.breaks.forEach((br) => {
                    const breakStart = new Date(br.breakStart).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
                    const breakEnd = br.breakEnd
                        ? new Date(br.breakEnd).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                        : "Ongoing";
                    userMap[userName].breaks.push(`${breakStart} - ${breakEnd}`);
                });
            }
        });
    }

    return Object.entries(userMap).map(([userName, data]) => ({
        userName,
        checkInTime: data.checkInTime,
        checkOutTime: data.checkOutTime,
        breaks: data.breaks,
    }));
};

const CalendarComp: React.FC<CalendarCompProps> = ({ attendanceDetails }) => {
    const [attendanceData, setAttendanceData] = useState<AttendanceRecord | null>(null);

    const dateCellRender = (value: Dayjs) => {
        const dateKey = `${value.date().toString().padStart(2, "0")}-${(value.month() + 1).toString().padStart(2, "0")}-${value.year()}`;
        const userData = getListData(value, attendanceDetails);
        const [attendanceModal, setAttendanceModal] = useState<boolean>(false);
        const onClose = (): void => {
            setAttendanceModal(!attendanceModal)
        }

        return userData.length > 0 ? (
            <Popover
                content={
                    <>
                        <List
                            size="small"
                            dataSource={userData}
                            renderItem={(user) => (
                                <List.Item>
                                    <div>
                                        <Typography.Text strong>{user.userName}</Typography.Text>
                                        <div>
                                            <Badge status="success" text={`Checked in at ${user.checkInTime}`} />
                                        </div>
                                        {user.checkOutTime !== "No Check-Out" && (
                                            <div>
                                                <Badge status="warning" text={`Checked out at ${user.checkOutTime}`} />
                                            </div>
                                        )}
                                        {user.breaks.length > 0 && (
                                            <div>
                                                <Typography.Text type="secondary">Breaks:</Typography.Text>
                                                {user.breaks.map((br, index) => (
                                                    <div key={index}>
                                                        <Badge status="processing" text={br} />
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </List.Item>
                            )}
                        />
                        <Button size='small' onClick={() => {
                            setAttendanceData(attendanceDetails[dateKey][0])
                            onClose()
                        }} className='ml-3 mt-2' type='primary'>Change Attendance</Button>
                        <EditAttendanceModal visible={attendanceModal} onClose={onClose} attendance={attendanceData as AttendanceRecord & null} />
                    </>
                }
                title="Attendance Details"
                trigger="click"
            >
                <div style={{ cursor: "pointer" }}>
                    <ul className="events">
                        {userData.map((user, index) => (
                            <li key={index}>
                                <Badge status="success" text={user.userName} />
                            </li>
                        ))}
                    </ul>
                </div>
            </Popover>
        ) : null;
    };

    return (
        <Card title="Attendance Tracker" bordered={false} style={{ borderRadius: 10 }}>
            <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
                <Col>
                    <Typography.Title level={4}>Track Your Attendance</Typography.Title>
                </Col>
            </Row>
            <Calendar cellRender={dateCellRender} />
        </Card>
    );
};

export default CalendarComp;
