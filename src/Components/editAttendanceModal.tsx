import React, { useEffect } from 'react';
import { Modal, Form, DatePicker, Button, Row, Col, Typography, Space, Tooltip, message } from 'antd';
import dayjs from "dayjs";
import { PlusOutlined, DeleteOutlined, SaveOutlined } from '@ant-design/icons';
import { AttendanceRecord } from '@/app/types';
import { trpc } from '@/utils/trpcClient';
import { useRouter } from 'next/navigation';
import { UpdateAttendanceType } from '@/app/validations/attendanceSchema';

const { Title } = Typography;
interface EditAttendanceModalProps {
    visible: boolean;
    onClose: () => void;
    attendance: AttendanceRecord | null;
}

const EditAttendanceModal: React.FC<EditAttendanceModalProps> = ({ visible, onClose, attendance }) => {
    const [form] = Form.useForm();
    const router = useRouter()
    const updateAttendance = trpc.attendance.updateAttendance.useMutation({
        onSuccess: (data) => {
            if (data?.success) {
                message.success(data.message)
            } else {
                message.warning(data.message)
            }
            onClose();
            router.refresh()
        },
        onError: (error) => {
            message.error(error.message || "Failed to update attendance");
        },
    });
    const initialValues = () => {
        return attendance?.breaks && attendance.breaks.length > 0
            ? attendance.breaks.map(b => ({
                breakStart: b.breakStart ? dayjs(b.breakStart) : null,
                breakEnd: b.breakEnd ? dayjs(b.breakEnd) : null,
            }))
            : [];
    }
    useEffect(() => {
        if (attendance) {
            const formattedAttendance = {
                checkInTime: attendance.checkInTime ? dayjs(attendance.checkInTime) : null,
                checkOutTime: attendance.checkOutTime ? dayjs(attendance.checkOutTime) : null,
                breaks: initialValues(),
            };
            form.setFieldsValue(formattedAttendance);
        }
    }, [attendance, form]);

    const handleSubmit = (values: UpdateAttendanceType) => {
        if (attendance) {
            const updatedAttendance = { ...values, _id: attendance._id, userId: attendance.userId }
            updateAttendance.mutate(updatedAttendance);
        }
    };
    return (
        <Modal
            open={visible}
            title="Edit Attendance"
            onCancel={onClose}
            footer={null}
            width={600}
        >
            <Form form={form} onFinish={handleSubmit} layout="vertical">
                <Title level={4} style={{ marginBottom: '24px' }}>Attendance Details</Title>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            label="Check-in Time"
                            name="checkInTime"
                            rules={[{ required: true, message: 'Please select the check-in time!' }]}
                        >
                            <DatePicker
                                style={{ width: '100%' }}
                                showTime
                                format="YYYY-MM-DD HH:mm"
                                placeholder="Select check-in time"
                            />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            label="Check-out Time"
                            name="checkOutTime"
                            rules={[{ required: false }]}
                        >
                            <DatePicker
                                style={{ width: '100%' }}
                                showTime
                                format="YYYY-MM-DD HH:mm"
                                placeholder="Select check-out time"
                            />
                        </Form.Item>
                    </Col>
                </Row>

                <Title level={5} style={{ marginBottom: '16px' }}>Breaks</Title>
                <Form.List
                    name="breaks"
                    initialValue={initialValues()}
                >
                    {(fields, { add, remove }) => (
                        <>
                            {fields.map(({ key, name, fieldKey }) => (
                                <Space key={key} className='flex !items-center' style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                                    <Form.Item
                                        label="Break Start"
                                        name={[name, 'breakStart']}
                                        fieldKey={[fieldKey ?? 0, 'breakStart']}
                                    >
                                        <DatePicker
                                            style={{ width: '100%' }}
                                            showTime
                                            format="YYYY-MM-DD HH:mm"
                                            placeholder="Select break start time"
                                        />
                                    </Form.Item>
                                    <Form.Item
                                        label="Break End"
                                        name={[name, 'breakEnd']}
                                        fieldKey={[fieldKey ?? 0, 'breakEnd']}
                                    >
                                        <DatePicker
                                            style={{ width: '100%' }}
                                            showTime
                                            format="YYYY-MM-DD HH:mm"
                                            placeholder="Select break end time"
                                        />
                                    </Form.Item>
                                    <Tooltip title="Remove Break">
                                        <Button
                                            type="text"
                                            danger
                                            icon={<DeleteOutlined />}
                                            onClick={() => remove(name)}
                                        />
                                    </Tooltip>
                                </Space>
                            ))}
                            <Form.Item>
                                <Button
                                    type="dashed"
                                    onClick={() => add()}
                                    block
                                    icon={<PlusOutlined />}
                                >
                                    Add Break
                                </Button>
                            </Form.Item>
                        </>
                    )}
                </Form.List>

                <Form.Item>
                    <Button type="primary" loading={updateAttendance.isLoading} htmlType="submit" block icon={<SaveOutlined />}>
                        Save Changes
                    </Button>
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default EditAttendanceModal;
