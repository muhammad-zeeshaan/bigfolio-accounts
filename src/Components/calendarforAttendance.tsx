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
  Avatar,
  Descriptions,
  Statistic,
  Upload,
  Form,
  Input,
  Modal,
  message,
} from "antd";
import type { Dayjs } from "dayjs";
import { AttendanceRecord, AttendanceSummary, Employee, ErrorResponse } from "@/app/types";
import EditAttendanceModal from './editAttendanceModal';
import { ArrowDownOutlined, ArrowUpOutlined, EditOutlined, RetweetOutlined } from '@ant-design/icons';
import { Pie } from "@ant-design/plots";
import type { UploadChangeParam } from 'antd/es/upload';
import type { RcFile, UploadFile } from 'antd/es/upload/interface';
import useQueryParams from "@/app/hooks/useQueryParams";

interface CalendarCompProps {
  attendanceDetails: AttendanceSummary;
  userData: Employee | ErrorResponse;
}

const getListData = (value: Dayjs, attendanceDetails: AttendanceSummary) => {
    const userMap: Record<string, { checkInTime: string; checkOutTime: string; breaks: string[] }> = {};

    const dateKey = `${value.date().toString().padStart(2, "0")}-${(value.month() + 1).toString().padStart(2, "0")}-${value.year()}`;

  if (attendanceDetails?.attendanceByDay[dateKey]) {
    attendanceDetails?.attendanceByDay[dateKey].forEach((entry: AttendanceRecord) => {
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

const CalendarComp: React.FC<CalendarCompProps> = ({ attendanceDetails, userData }) => {
  const params = useQueryParams();
  const [attendanceData, setAttendanceData] = useState<AttendanceRecord | null>(null);
  const [attendanceModal, setAttendanceModal] = useState<boolean>(false);
  const [passwordModalVisible, setPasswordModalVisible] = useState<boolean>(false);
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  const onClose = (): void => {
    setAttendanceModal(!attendanceModal);
  };

  const isEmployee = (data: Employee | ErrorResponse): data is Employee => {
    return (data as Employee).email !== undefined;
  };

  const data = [
    { type: "Overtime Days", value: attendanceDetails.overtimeDays },
    { type: "Total Absents", value: attendanceDetails.totalAbsents },
    { type: "Total Present", value: attendanceDetails.totalPresent },
  ];

  const config = {
    data,
    angleField: "value",
    colorField: "type",
    color: ["#1890ff", "#ff4d4f", "#52c41a"],
    radius: 0.9,
    innerRadius: 0.6,
    interactions: [{ type: "element-active" }],
    legend: {
      color: {
        itemMarker: 'circle',
        cols: 3,
        colPadding: 4,
        title: false,
        position: "bottom",
        rowPadding: 25,
      },
    },
  };

    const dateCellRender = (value: Dayjs) => {
        const dateKey = `${value.date().toString().padStart(2, "0")}-${(value.month() + 1).toString().padStart(2, "0")}-${value.year()}`;
      const userData = getListData(value, attendanceDetails);

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
                  setAttendanceData(attendanceDetails?.attendanceByDay[dateKey][0]);
                  onClose();
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

  const handleProfilePhotoChange = (info: UploadChangeParam<UploadFile>) => {
    let fileList = [...info.fileList];
    fileList = fileList.slice(-1);
    setFileList(fileList);

    if (info.file.status === 'done') {
      message.success(`${info.file.name} file uploaded successfully`);
    } else if (info.file.status === 'error') {
      message.error(`${info.file.name} file upload failed.`);
    }
  };

  const handlePasswordChange = (values: unknown) => {
    console.log('Received values of form: ', values);
    setPasswordModalVisible(false);
    message.success('Password changed successfully');
  };

  const onPanelChange = (value: Dayjs) => {
          const year = value.year(); 
          const month = value.month() + 1;
          params.set('year', year ?? '');
          params.set('month', month ?? '');
          params.update();
      };

    return (
      <>
        <h1 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Profile Page</h1>
        <div className="!my-3">
          <Row gutter={[16, 16]} justify="center">
            {[
              { title: "Overtime Days", value: attendanceDetails.overtimeDays, color: "#1890ff", bg: "#e6f7ff", icon: <RetweetOutlined style={{ fontSize: "24px", color: "#1890ff" }} /> },
              { title: "Total Absents", value: attendanceDetails.totalAbsents, color: "#ff4d4f", bg: "#fff1f0", icon: <ArrowDownOutlined style={{ fontSize: "24px", color: "#ff4d4f" }} /> },
              { title: "Total Present", value: attendanceDetails.totalPresent, color: "#52c41a", bg: "#f6ffed", icon: <ArrowUpOutlined style={{ fontSize: "24px", color: "#52c41a" }} /> },
            ].map((stat, index) => (
              <Col xs={index !== 2 ? 12 : 24} sm={12} md={8} key={index}>
                <Card bordered={false} className="rounded-lg shadow-md text-center" style={{ background: stat.bg }}>
                  <Statistic
                    title={stat.title}
                    value={stat.value}
                    valueStyle={{ color: stat.color, fontSize: "22px", fontWeight: "bold" }}
                    prefix={stat.icon}
                  />
                </Card>
              </Col>
            ))}
          </Row>

        </div>

        <Row gutter={[16, 16]} className="mt-4">
          <Col xs={24} md={12} lg={6}>
            <Card bordered={false} className="rounded-lg text-center">
              {isEmployee(userData) ? (
                <>
                  <Upload
                    fileList={fileList}
                    onChange={handleProfilePhotoChange}
                    beforeUpload={(file: RcFile) => {
                      const isImage = file.type.startsWith("image/");
                      if (!isImage) message.error("You can only upload image files!");
                      return isImage;
                    }}
                    showUploadList={false}
                  >
                    <Avatar size={128} src={fileList.length > 0 ? URL.createObjectURL(fileList[0].originFileObj as RcFile) : userData.profileImage} />
                  </Upload>

                  <Descriptions title="User Info" column={1} size="small">
                    <Descriptions.Item label="Name">{userData.name}</Descriptions.Item>
                    <Descriptions.Item label="Email">{userData.email}</Descriptions.Item>
                    <Descriptions.Item label="Personal Email">{userData.personalEmail}</Descriptions.Item>
                    <Descriptions.Item label="Phone">{userData.phone}</Descriptions.Item>
                    <Descriptions.Item label="Designation">{userData.designation}</Descriptions.Item>
                    <Descriptions.Item label="Joining Date">{new Date(userData.joiningDate).toLocaleDateString()}</Descriptions.Item>
                    {userData.leavingDate && <Descriptions.Item label="Leaving Date">{new Date(userData.leavingDate).toLocaleDateString()}</Descriptions.Item>}
                  </Descriptions>
                  <div className="flex flex-wrap justify-start gap-2 mt-4">
                    <Button icon={<EditOutlined />} onClick={() => setPasswordModalVisible(true)} className="z-50">
                      Change Password
                    </Button>
                  </div>
                  <div className="mt-6">
                    <Pie {...config} />
                  </div>
                </>
              ) : (
                <Typography.Text type="danger">{userData.message}</Typography.Text>
              )}
            </Card>
          </Col>

          <Col xs={24} md={12} lg={18}>
            <Card bordered={false} className="rounded-lg">
              <Calendar cellRender={dateCellRender} onPanelChange={onPanelChange} />
            </Card>
          </Col>
        </Row>

        <Modal title="Change Password" open={passwordModalVisible} onCancel={() => setPasswordModalVisible(false)} footer={null}>
          <Form onFinish={handlePasswordChange}>
            <Form.Item name="oldPassword" label="Old Password" rules={[{ required: true, message: "Please input your old password!" }]}>
              <Input.Password />
            </Form.Item>
            <Form.Item name="newPassword" label="New Password" rules={[{ required: true, message: "Please input your new password!" }]}>
              <Input.Password />
            </Form.Item>
            <Form.Item
              name="confirmPassword"
              label="Confirm New Password"
              dependencies={["newPassword"]}
              rules={[
                { required: true, message: "Please confirm your new password!" },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("newPassword") === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error("The two passwords that you entered do not match!"));
                  },
                }),
              ]}
            >
              <Input.Password />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit">
                Change Password
              </Button>
            </Form.Item>
          </Form>
        </Modal>
      </>

    );
};

export default CalendarComp;