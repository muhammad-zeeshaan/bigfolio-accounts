"use client";
import React, { useEffect, useState } from "react";
import {
    Badge,
    Button,
    Calendar,
    Card,
    message,
    Row,
    Col,
    Typography,
    Popover,
    List,
} from "antd";
import type { Dayjs } from "dayjs";
import { getSession } from "next-auth/react";
import { AttendanceByDay, AttendanceRecord, SessionUser } from "@/app/types";
import { useRouter } from "next/navigation";
import {
    CheckCircleOutlined,
    LogoutOutlined,
    CoffeeOutlined,
    ArrowLeftOutlined
} from "@ant-design/icons";
import { trpc } from '@/utils/trpcClient';
import useQueryParams from "@/app/hooks/useQueryParams";

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
    const params = useQueryParams();
    const router = useRouter();
    const [userId, setUserId] = useState<string>("");

    useEffect(() => {
        getSession().then((session) => {
            const user: SessionUser = session?.user as SessionUser;
            setUserId(user?.id ?? "");
        });
    }, []);

    const checkInMutation = trpc.attendance.checkIn.useMutation({
        onSuccess: (res) => {
            if (res.attendance) {
                message.success(res.message)
            } else {
                message.warning(res.message);
            }
            router.refresh();
        },
        onError: () => message.error("Error during check-in"),
    });

    const checkOutMutation = trpc.attendance.checkOut.useMutation({
        onSuccess: (res) => {
            if (res.attendance) {
                message.success(res.message)
            } else {
                message.warning(res.message);
            }
            router.refresh();
        },
        onError: () => message.error("Error during check-out"),
    });

    const startBreakMutation = trpc.attendance.startBreak.useMutation({
        onSuccess: (res) => {
            if (res.attendance) {
                message.success(res.message)
            } else {
                message.warning(res.message);
            }
            router.refresh();
        },
        onError: () => message.error("Error starting break"),
    });

    const endBreakMutation = trpc.attendance.endBreak.useMutation({
        onSuccess: (res) => {
            if (res.attendance) {
                message.success(res.message)
            } else { message.warning(res.message); }
            router.refresh();
        },
        onError: () => message.error("Error ending break"),
    });

    const dateCellRender = (value: Dayjs) => {
        const userData = getListData(value, attendanceDetails);

        return userData.length > 0 ? (
            <Popover
                content={
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
    const onPanelChange = (value: Dayjs) => {
        const year = value.year(); 
        const month = value.month() + 1;
        params.set('year', year ?? '');
        params.set('month', month ?? '');
        params.update();
    };
    
    

    return (
        <Card bordered={false}>
            <Row justify="space-between" align="middle" className="mb-4">
                <Col>
                    <h1 className="text-xl sm:text-2xl font-bold mb-4">Track Your Attendance</h1>
                </Col>
                <Col xs={24} sm={12} >
                    <div className="grid grid-cols-2 gap-2 sm:flex md:justify-end sm:space-x-2">
                        <Button type="primary" loading={checkInMutation.isLoading} icon={<CheckCircleOutlined />} onClick={() => checkInMutation.mutate({ userId })}>
                            Check In
                        </Button>
                        <Button type="default" loading={startBreakMutation.isLoading} icon={<CoffeeOutlined />} onClick={() => startBreakMutation.mutate({ userId })}>
                            Break
                        </Button>
                        <Button type="dashed" loading={endBreakMutation.isLoading} icon={<ArrowLeftOutlined />} onClick={() => endBreakMutation.mutate({ userId })}>
                            Back
                        </Button>
                        <Button type="primary" danger loading={checkOutMutation.isLoading} icon={<LogoutOutlined />} onClick={() => checkOutMutation.mutate({ userId })}>
                            Check Out
                        </Button>
                    </div>
                </Col>
            </Row>

            <Calendar cellRender={dateCellRender} onPanelChange={onPanelChange}/>
        </Card>
    );
};

export default CalendarComp;
