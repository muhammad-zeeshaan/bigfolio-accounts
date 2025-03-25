"use client";
import React, { useEffect, useState } from "react";
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
import { AttendanceRecord, AttendanceSummary, Employee, EmployeeSalaryDTO, ErrorResponse, SalaryFormData, SessionUser } from "@/app/types";
import EditAttendanceModal from './editAttendanceModal';
import { ArrowDownOutlined, ArrowLeftOutlined, ArrowUpOutlined, CheckCircleOutlined, CoffeeOutlined, EditOutlined, LogoutOutlined, RetweetOutlined } from '@ant-design/icons';
import { Pie } from "@ant-design/plots";
import type { UploadChangeParam } from 'antd/es/upload';
import type { RcFile, UploadFile } from 'antd/es/upload/interface';
import useQueryParams from "@/app/hooks/useQueryParams";
import { InvoiceModal } from './invoiceModal';
import { trpc } from '@/utils/trpcClient';
import SalarySlip from './Slip';
import { useRouter } from 'next/navigation';
import { getSession } from 'next-auth/react';

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
  const router = useRouter()
  const [attendanceData, setAttendanceData] = useState<AttendanceRecord | null>(null);
  const [attendanceModal, setAttendanceModal] = useState<boolean>(false);
  const [passwordModalVisible, setPasswordModalVisible] = useState<boolean>(false);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [invoiceModalVisible, setInvoiceModalVisible] = useState<boolean>(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isSalaryModalOpen, setSalaryModalOpen] = useState<boolean>(false);
  const [singleEmployee, setSingleEmployee] = useState<EmployeeSalaryDTO | null>(null);
  const [userId, setUserId] = useState<string>("");
  const [sessionUser, seSessionUser] = useState<SessionUser>();
  useEffect(() => {
    getSession().then((session) => {
      const user: SessionUser = session?.user as SessionUser;
      seSessionUser(user);
      setUserId(user?.id ?? "");
    });
  }, []);
  const { mutate: updateProfileImage } = trpc.employee.updateEmployeeProfileImage.useMutation({
    onSuccess: () => {
      message.success('Profile Image updated successfully');
    },
    onError: () => {
      message.error("Failed to update profile image");
    },
  })
  const onClose = (): void => {
    setAttendanceModal(!attendanceModal);
  };

  const isEmployee = (data: Employee | ErrorResponse): data is Employee => {
    return (data as Employee).email !== undefined;
  };
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

  const dateCellRender = (value: Dayjs, isAdmin: boolean) => {
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
                {isAdmin && <Button size='small' onClick={() => {
                  setAttendanceData(attendanceDetails?.attendanceByDay[dateKey][0]);
                  onClose();
                }} className='ml-3 mt-2' type='primary'>Change Attendance</Button>}
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

  const handleProfilePhotoChange = async (info: UploadChangeParam<UploadFile>) => {
    const file = info.file.originFileObj as RcFile;
    if (!file) return;

    const toBase64 = (file: RcFile): Promise<string> =>
      new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (error) => reject(error);
      });

    try {
      const base64String = await toBase64(file);
      setPreviewImage(base64String); // Set preview
      updateProfileImage({ profileImage: base64String, employeeId: isEmployee(userData) ? userData?._id : "" });
      setFileList([{ uid: file.uid, name: file.name, status: "done", url: base64String }]);
      message.success(`${file.name} uploaded successfully`);
    } catch (error) {
      message.error("Failed to convert image to Base64");
      console.log(error)
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
  const handleInvoiceSubmit = (values: SalaryFormData) => {
    const dataCopy = { ...userData, ...values }
    setSingleEmployee(dataCopy as unknown as EmployeeSalaryDTO)
    setSalaryModalOpen(true)
  };
  // console.log()

    return (
      <>
        <h1 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Profile Page</h1>
        <Row justify="space-between" align="middle" className="mb-4">
          <Col>
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
                    <Avatar size={128} src={previewImage || userData.profileImage} />
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
                  <div className="flex flex-wrap justify-between gap-2 mt-4">
                    {false && <Button icon={<EditOutlined />} onClick={() => setPasswordModalVisible(true)} className="z-50">
                      Change Password
                    </Button>}
                    {(Boolean(sessionUser && sessionUser?.role === "admin")) && <Button type="primary" onClick={() => setInvoiceModalVisible(true)}>
                      Generate Invoice
                    </Button>}
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
              <Calendar cellRender={(e) => dateCellRender(e, (Boolean(sessionUser && sessionUser?.role === "admin")))} onPanelChange={onPanelChange} />
            </Card>
          </Col>
        </Row>
        <InvoiceModal
          visible={invoiceModalVisible}
          onCancel={() => setInvoiceModalVisible(false)}
          attendanceDetails={attendanceDetails}
          onFinish={handleInvoiceSubmit}
          userData={userData}
        />
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
        <Modal open={isSalaryModalOpen} footer={null} width={782} onCancel={() => setSalaryModalOpen(false)}>
          {singleEmployee && <SalarySlip employeedetail={singleEmployee} />}
        </Modal>
      </>

    );
};

export default CalendarComp;