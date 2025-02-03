import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, DatePicker, Button, InputNumber, Row, Col, Space } from 'antd';
import moment from 'moment';
import { IAttendance } from '@/models/Attendance';
import { Employee } from '@/app/types';

interface EditAttendanceModalProps {
    visible: boolean;
    onClose: () => void;
    attendance: Employee | null;
    onSubmit: (data: Employee) => void;
}

const EditAttendanceModal: React.FC<EditAttendanceModalProps> = ({ visible, onClose, attendance, onSubmit }) => {
    const [form] = Form.useForm();

    useEffect(() => {
        if (attendance) {
            form.setFieldsValue({
                checkInTime: moment(attendance.checkInTime),
                checkOutTime: attendance.checkOutTime ? moment(attendance.checkOutTime) : null,
                breaks: attendance.breaks?.map(b => ({
                    breakStart: b.breakStart ? moment(b.breakStart) : null,
                    breakEnd: b.breakEnd ? moment(b.breakEnd) : null,
                })),
            });
        }
    }, [attendance, form]);

    const handleSubmit = (values: any) => {
        if (attendance) {
            const updatedAttendance = {
                ...attendance,
                checkInTime: values.checkInTime,
                checkOutTime: values.checkOutTime,
                breaks: values.breaks,
            };
            // onSubmit(updatedAttendance);
        }
        console.log(values);
        onClose();
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
                            />
                        </Form.Item>
                    </Col>
                </Row>

                <Form.List
                    name="breaks"
                    initialValue={attendance?.breaks || []}
                    rules={[
                        {
                            validator: async (_, breaks) => {
                                if (!breaks || breaks.length < 1) {
                                    return Promise.reject(new Error('At least one break should be added'));
                                }
                            },
                        },
                    ]}
                >
                    {(fields, { add, remove }) => (
                        <>
                            {fields.map(({ key, fieldKey, name, fieldKey: _fieldKey }) => (
                                <Row gutter={16} key={key}>
                                    <Col span={10}>
                                        <Form.Item
                                            label="Break Start"
                                            name={[name, 'breakStart']}
                                            fieldKey={[fieldKey, 'breakStart']}
                                            rules={[{ required: true, message: 'Please select the break start time!' }]}
                                        >
                                            <DatePicker
                                                style={{ width: '100%' }}
                                                showTime
                                                format="YYYY-MM-DD HH:mm"
                                            />
                                        </Form.Item>
                                    </Col>
                                    <Col span={10}>
                                        <Form.Item
                                            label="Break End"
                                            name={[name, 'breakEnd']}
                                            fieldKey={[fieldKey, 'breakEnd']}
                                            rules={[{ required: true, message: 'Please select the break end time!' }]}
                                        >
                                            <DatePicker
                                                style={{ width: '100%' }}
                                                showTime
                                                format="YYYY-MM-DD HH:mm"
                                            />
                                        </Form.Item>
                                    </Col>
                                    <Col span={2}>
                                        <Button
                                            type="danger"
                                            onClick={() => remove(name)}
                                            style={{ marginTop: '30px' }}
                                        >
                                            Remove
                                        </Button>
                                    </Col>
                                </Row>
                            ))}
                            <Form.Item>
                                <Button
                                    type="dashed"
                                    onClick={() => add()}
                                    block
                                >
                                    Add Break
                                </Button>
                            </Form.Item>
                        </>
                    )}
                </Form.List>

                <Form.Item>
                    <Button type="primary" htmlType="submit" block>
                        Save Changes
                    </Button>
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default EditAttendanceModal;
