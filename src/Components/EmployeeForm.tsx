"use client";
import React, { useEffect } from "react";
import { Form, Input, InputNumber, Select, Button, DatePicker, Row, Col, Card } from "antd";
import { Employee } from "@/app/types";
import dayjs from "dayjs";

const roleOptions = [
    { "label": "Frontend Developer", "value": "frontend_developer" },
    { "label": "Backend Developer", "value": "backend_developer" },
    { "label": "MERN Stack Developer", "value": "mern_stack_developer" },
    { "label": "Full Stack Developer", "value": "full_stack_developer" },
    { "label": "UI/UX Designer", "value": "ui_ux_designer" },
    { "label": "Graphic Designer", "value": "graphic_designer" },
    { "label": "Business Developer", "value": "business_developer" },
    { "label": "Project Manager", "value": "project_manager" },
    { "label": "CEO", "value": "ceo" },
    { "label": "COO", "value": "coo" },
    { "label": "SEO Specialist", "value": "seo_specialist" },
    { "label": "Shopify Developer", "value": "shopify_developer" },
    { "label": "Admin", "value": "admin" }
]

interface FormProps {
    employee?: Employee;
    onSubmit: (data: Employee) => void;
    loading: boolean;
}

const { Option } = Select;

const EmployeeForm: React.FC<FormProps> = ({ employee, onSubmit, loading }) => {
    const [form] = Form.useForm();

    const initialFormData = employee || {
        name: "",
        email: "",
        personalEmail: "",
        phone: "",
        jobStatus: "newJoinee",
        joiningDate: null,
        leavingDate: null,
        address: "",
        password: "",
        salaryStatus: "Pending",
        basicSalary: 0,
        allowance: 0,
        bonus: 0,
        overtime: 0,
        tax: 0,
        holiday: 0,
        designation: "",
    };

    useEffect(() => {
        if (employee) {
            form.setFieldsValue({
                ...employee,
                joiningDate: employee.joiningDate ? dayjs(employee.joiningDate) : null,
                leavingDate: employee.leavingDate ? dayjs(employee.leavingDate) : null,
            });
        }
    }, [employee, form, initialFormData]);

    const handleSubmit = (values: Employee) => {
        onSubmit(values);
    };

    return (
        < >
            <Form form={form} onFinish={handleSubmit} layout="vertical">
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item label="Name" name="name" rules={[{ required: true, message: "Enter employee name" }]}>
                            <Input placeholder="Employee Name" />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item label="Email" name="email" rules={[{ required: true, message: "Enter employee email" }, { type: "email" }]}>
                            <Input placeholder="Employee Email" />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item label="Personal Email" name="personalEmail" rules={[{ required: true, message: "Enter personal email" }, { type: "email" }]}>
                            <Input placeholder="Personal Email" />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item label="Phone" name="phone" rules={[{ required: true, message: "Enter phone number" }]}>
                            <Input placeholder="Phone Number" />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item label="Job Status" name="jobStatus" rules={[{ required: true }]}>
                            <Select placeholder="Select Job Status">
                                <Option value="permanent">Permanent</Option>
                                <Option value="underReview">Under Review</Option>
                                <Option value="partTime">Part-Time</Option>
                                <Option value="newJoinee">New Joinee</Option>
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item label="Designation" name="designation" rules={[{ required: true }]}>
                            <Select placeholder="Select Designation" showSearch options={roleOptions}>
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item label="Joining Date" name="joiningDate">
                            <DatePicker style={{ width: "100%" }} />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item label="Leaving Date" name="leavingDate">
                            <DatePicker style={{ width: "100%" }} />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item label="Basic Salary" name="basicSalary" rules={[{ required: true }]}>
                            <InputNumber min={0} style={{ width: "100%" }} placeholder="Basic Salary" />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item label="Allowance" name="allowance" rules={[{ required: true }]}>
                            <InputNumber min={0} style={{ width: "100%" }} placeholder="Allowance" />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item label="Bonus" name="bonus" rules={[{ required: true }]}>
                            <InputNumber min={0} style={{ width: "100%" }} placeholder="Bonus" />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item label="Overtime" name="overtime" rules={[{ required: true }]}>
                            <InputNumber min={0} style={{ width: "100%" }} placeholder="Overtime" />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item label="Holiday" name="holiday" rules={[{ required: true }]}>
                            <InputNumber min={0} style={{ width: "100%" }} placeholder="Holiday" />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item label="Tax" name="tax" rules={[{ required: true }]}>
                            <InputNumber min={0} style={{ width: "100%" }} placeholder="Tax" />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item label="Salary Status" name="salaryStatus" rules={[{ required: true }]}>
                            <Select placeholder="Select Salary Status">
                                <Option value="Send">Send</Option>
                                <Option value="Pending">Pending</Option>
                            </Select>
                        </Form.Item>

                    </Col>
                    {!employee?.email && <Col span={12}>
                        <Form.Item label="Password" name="password" rules={[{ required: true }]}>
                            <Input.Password placeholder="Enter Password" />
                        </Form.Item>
                    </Col>}
                </Row>
                <Form.Item label="Address" name="address" rules={[{ required: true }]}>
                    <Input.TextArea rows={2} placeholder="Employee Address" />
                </Form.Item>
                <Button type="primary" htmlType="submit" loading={loading} className="px-6 py-2">
                    Submit
                </Button>
            </Form>
        </>
    );
};

export default EmployeeForm;
