"use client";
import React, { useEffect, useState } from "react";
import { Form, Input, InputNumber, Select, Button, DatePicker, Row, Col, Card, Upload, message, Avatar, Image } from "antd";
import { Employee } from "@/app/types";
import dayjs from "dayjs";
import { PlusOutlined, UploadOutlined, UserOutlined, MailOutlined, PhoneOutlined, DollarOutlined, CalendarOutlined, DeleteOutlined } from '@ant-design/icons';

const roleOptions = [
    { label: "Frontend Developer", value: "frontend_developer" },
    { label: "Backend Developer", value: "backend_developer" },
    { label: "MERN Stack Developer", value: "mern_stack_developer" },
    { label: "Full Stack Developer", value: "full_stack_developer" },
    { label: "UI/UX Designer", value: "ui_ux_designer" },
    { label: "Graphic Designer", value: "graphic_designer" },
    { label: "Business Developer", value: "business_developer" },
    { label: "Project Manager", value: "project_manager" },
    { label: "CEO", value: "ceo" },
    { label: "COO", value: "coo" },
    { label: "SEO Specialist", value: "seo_specialist" },
    { label: "Shopify Developer", value: "shopify_developer" },
    { label: "Admin", value: "admin" }
];

interface FormProps {
    employee?: Employee;
    onSubmit: (data: Employee) => void;
    loading: boolean;
}

const { Option } = Select;

const EmployeeForm: React.FC<FormProps> = ({ employee, onSubmit, loading }) => {
    const [form] = Form.useForm();
    const [imageBase64, setImageBase64] = useState<string | null>(employee?.profileImage || null);
    const [documentImages, setDocumentImages] = useState<string[]>([]);

    useEffect(() => {
        if (employee) {
            form.setFieldsValue({
                ...employee,
                joiningDate: employee.joiningDate ? dayjs(employee.joiningDate) : null,
                leavingDate: employee.leavingDate ? dayjs(employee.leavingDate) : null,
            });
            setImageBase64(employee?.profileImage || null);
            setDocumentImages(employee?.documents || []);
        }
    }, [employee, form]);

    const handleSubmit = (values: Employee) => {
        onSubmit({ ...values, profileImage: imageBase64 ?? '', documents: documentImages });
    };

    const handleImageUpload = (file: File) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            if (typeof reader.result === "string") {
                setImageBase64(reader.result);
                message.success("Image uploaded successfully");
            }
        };
        reader.onerror = (error) => {
            console.error("Image upload error:", error);
            message.error("Failed to upload image");
        };
        return false; // Prevent upload to a server
    };

    const handleDocumentUpload = (file: File) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            setDocumentImages(prev => [...prev, reader.result as string]);
        };
        return false;
    };

    return (
        <Form form={form} onFinish={handleSubmit} layout="vertical">
            <Card title="Personal Information" style={{ marginBottom: 16 }}>
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item label="Name" name="name" rules={[{ required: true, message: "Please enter employee name" }]}>
                            <Input prefix={<UserOutlined />} placeholder="Employee Name" />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item label="Email" name="email" rules={[{ required: true, message: "Please enter employee email" }, { type: "email" }]}>
                            <Input prefix={<MailOutlined />} placeholder="Employee Email" />
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item label="Personal Email" name="personalEmail" rules={[{ required: true, message: "Please enter personal email" }, { type: "email" }]}>
                            <Input prefix={<MailOutlined />} placeholder="Personal Email" />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item label="Phone" name="phone" rules={[{ required: true, message: "Please enter phone number" }]}>
                            <Input prefix={<PhoneOutlined />} placeholder="Phone Number" />
                        </Form.Item>
                    </Col>
                </Row>
                <Form.Item label="Address" name="address" rules={[{ required: true, message: "Please enter address" }]}>
                    <Input.TextArea rows={2} placeholder="Employee Address" />
                </Form.Item>
            </Card>

            <Card title="Job Information" style={{ marginBottom: 16 }}>
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item label="Job Status" name="jobStatus" rules={[{ required: true, message: "Please select job status" }]}>
                            <Select placeholder="Select Job Status">
                                <Option value="permanent">Permanent</Option>
                                <Option value="underReview">Under Review</Option>
                                <Option value="partTime">Part-Time</Option>
                                <Option value="newJoinee">New Joinee</Option>
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item label="Designation" name="designation" rules={[{ required: true, message: "Please select designation" }]}>
                            <Select placeholder="Select Designation" showSearch options={roleOptions} />
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item label="Joining Date" name="joiningDate">
                            <DatePicker style={{ width: "100%" }} suffixIcon={<CalendarOutlined />} />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item label="Leaving Date" name="leavingDate">
                            <DatePicker style={{ width: "100%" }} suffixIcon={<CalendarOutlined />} />
                        </Form.Item>
                    </Col>
                </Row>
            </Card>

            <Card title="Salary Information" style={{ marginBottom: 16 }}>
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item label="Basic Salary" name="basicSalary" rules={[{ required: true, message: "Please enter basic salary" }]}>
                            <InputNumber min={0} style={{ width: "100%" }} prefix={<DollarOutlined />} placeholder="Basic Salary" />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item label="Allowance" name="allowance" rules={[{ required: true, message: "Please enter allowance" }]}>
                            <InputNumber min={0} style={{ width: "100%" }} prefix={<DollarOutlined />} placeholder="Allowance" />
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item label="Bonus" name="bonus" rules={[{ required: true, message: "Please enter bonus" }]}>
                            <InputNumber min={0} style={{ width: "100%" }} prefix={<DollarOutlined />} placeholder="Bonus" />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item label="Overtime" name="overtime" rules={[{ required: true, message: "Please enter overtime" }]}>
                            <InputNumber min={0} style={{ width: "100%" }} prefix={<DollarOutlined />} placeholder="Overtime" />
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item label="Holiday" name="holiday" rules={[{ required: true, message: "Please enter holiday" }]}>
                            <InputNumber min={0} style={{ width: "100%" }} prefix={<DollarOutlined />} placeholder="Holiday" />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item label="Tax" name="tax" rules={[{ required: true, message: "Please enter tax" }]}>
                            <InputNumber min={0} style={{ width: "100%" }} prefix={<DollarOutlined />} placeholder="Tax" />
                        </Form.Item>
                    </Col>
                </Row>
                <Form.Item label="Salary Status" name="salaryStatus" rules={[{ required: true, message: "Please select salary status" }]}>
                    <Select placeholder="Select Salary Status">
                        <Option value="Send">Send</Option>
                        <Option value="Pending">Pending</Option>
                    </Select>
                </Form.Item>
            </Card>

            <Card title="Profile Image & Documents" style={{ marginBottom: 16 }}>
                <Form.Item label="Profile Image" >
                    <Upload beforeUpload={handleImageUpload} showUploadList={false} accept="image/*">
                        <Button icon={<UploadOutlined />} >
                            Upload Image
                        </Button>
                    </Upload>

                    {imageBase64 && (
                        <div style={{ position: "relative", display: "inline-block", marginTop: 10 }}>
                            <Image
                                src={imageBase64}
                                width={90}
                                height={90}
                                className='object-cover'
                                style={{ borderRadius: "50%", boxShadow: "0 4px 8px rgba(0,0,0,0.1)" }}
                            />
                            <Button
                                type="primary"
                                danger
                                shape="circle"
                                icon={<DeleteOutlined />}
                                size="small"
                                onClick={() => setImageBase64(null)}
                                style={{
                                    position: "absolute",
                                    top: -1,
                                    left: 70,
                                    boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
                                    backgroundColor: "#ff4d4f",
                                    border: '2px solid white'
                                }}
                            />
                        </div>
                    )}
                </Form.Item>


                <Form.Item label="Documents (Multiple Images)">
                    <Upload beforeUpload={handleDocumentUpload} listType="picture-card" accept="image/*">
                        <div>
                            <PlusOutlined />
                            <div style={{ marginTop: 8 }}>Upload</div>
                        </div>
                    </Upload>
                    <Row gutter={[12, 12]} className='pt-2' justify="center">
                        {documentImages.map((img, index) => (
                            <Col key={index} xs={12} sm={8} md={6} lg={4}>
                                <Card
                                    hoverable
                                    style={{
                                        display: "flex",
                                        justifyContent: "center",
                                        alignItems: "center",
                                        padding: 10,
                                        borderRadius: 8,
                                        boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                                    }}
                                >
                                    <Avatar
                                        src={img}
                                        size={90}
                                        shape="square"
                                        style={{
                                            transition: "transform 0.3s",
                                        }}

                                    />
                                </Card>
                            </Col>
                        ))}
                    </Row>
                </Form.Item>
            </Card>

            <Form.Item>
                <Button type="primary" htmlType="submit" loading={loading} className="px-6 py-2">
                    Submit
                </Button>
            </Form.Item>
        </Form>
    );
};

export default EmployeeForm;