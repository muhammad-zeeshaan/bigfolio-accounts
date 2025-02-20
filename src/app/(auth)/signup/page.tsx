"use client";
import React from "react";
import { Form, Input, Button, Typography, Card, Alert, message } from "antd";
import { UserOutlined, LockOutlined, MailOutlined, PhoneOutlined } from "@ant-design/icons";
import Link from 'next/link';
import { SignUpFormData } from '@/app/types';
import { signUp } from '@/app/actions/signup';
// import signUp from "@/app/actions/signUp"; // Adjusted to use a signUp action

export default function SignUpPage(): JSX.Element {
    const [form] = Form.useForm();
    const [error, setError] = React.useState<string | null>(null);
    const [loading, setLoading] = React.useState<boolean>(false);

    const onFinish = async (values: SignUpFormData): Promise<void> => {
        console.log(values)
        setLoading(true);
        try {
            const result = await signUp(values);
            if (result.success) {
                message.success(result?.message);
                window.location.href = "/signin";
            }
            else {
                message.error(result?.message);
            }
        } catch (err) {
            console.error("Sign-up failed: ", err);
            setError("An unexpected error occurred. Please try again.");
        }
        setLoading(false);
    };

    const onFinishFailed = (): void => {
        setError("Please check the fields and try again.");
    };

    return (
        <div style={{ display: "flex", minHeight: "100vh", flexDirection: "row" }}>
            <div
                style={{
                    flex: 1,
                    background: "linear-gradient(90deg, rgba(2,0,36,1) 0%, rgba(9,9,121,1) 35%, rgba(0,212,255,1) 100%)",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    color: "white",
                    textAlign: "center",
                }}
            >
                <div>
                    <Typography.Title level={2} style={{ color: "white" }}>
                        Join Us Today!
                    </Typography.Title>
                    <Typography.Paragraph className="!text-white" style={{ fontSize: "16px", marginTop: "16px" }}>
                        Create your account to explore amazing features and stay connected.
                    </Typography.Paragraph>
                </div>
            </div>

            <div
                style={{
                    flex: 1,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    backgroundColor: "#f0f2f5",
                }}
            >
                <Card style={{ width: 400, boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)" }}>
                    <Typography.Title level={3} style={{ textAlign: "center", marginBottom: 24 }}>
                        Sign Up
                    </Typography.Title>

                    {error && <Alert message={error} type="error" showIcon style={{ marginBottom: 16 }} />}

                    <Form
                        form={form}
                        name="signUp"
                        layout="vertical"
                        onFinish={onFinish}
                        onFinishFailed={onFinishFailed}
                    >
                        <Form.Item
                            label="Full Name"
                            name="name"
                            rules={[
                                {
                                    required: true,
                                    message: "Please enter your full name!",
                                },
                            ]}
                        >
                            <Input prefix={<UserOutlined />} placeholder="Enter your full name" />
                        </Form.Item>

                        <Form.Item
                            label="Designation"
                            name="designation"
                            rules={[
                                {
                                    required: true,
                                    message: "Please enter your designation!",
                                },
                                {
                                    validator(_, value) {
                                        if (value && value.toLowerCase() === "admin") {
                                            return Promise.reject(new Error("Designation cannot be 'admin'"));
                                        }
                                        return Promise.resolve();
                                    },
                                },
                            ]}
                        >
                            <Input placeholder="Enter your designation" />
                        </Form.Item>

                        <Form.Item
                            label="Email"
                            name="email"
                            rules={[
                                {
                                    required: true,
                                    message: "Please enter a valid email!",
                                    type: "email",
                                },
                            ]}
                        >
                            <Input prefix={<MailOutlined />} placeholder="Enter your email" />
                        </Form.Item>
                        <Form.Item
                            label="Personal Email"
                            name="personalEmail"
                            rules={[
                                {
                                    required: true,
                                    message: "Please enter a valid email!",
                                    type: "email",
                                },
                            ]}
                        >
                            <Input prefix={<MailOutlined />} placeholder="Enter your personal email" />
                        </Form.Item>

                        <Form.Item
                            label="Phone"
                            name="phone"
                            rules={[
                                {
                                    required: true,
                                    message: "Please enter your phone number!",
                                },
                                {
                                    pattern: /^[0-9]{11}$/,
                                    message: "Please enter a valid phone number with 10 digits.",
                                },
                            ]}
                        >
                            <Input prefix={<PhoneOutlined />} placeholder="Enter your phone number" />
                        </Form.Item>

                        <Form.Item
                            label="Password"
                            name="password"
                            rules={[
                                {
                                    required: true,
                                    message: "Please enter a password!",
                                    min: 6,
                                },
                            ]}
                        >
                            <Input.Password prefix={<LockOutlined />} placeholder="Enter your password" />
                        </Form.Item>

                        <Form.Item
                            label="Confirm Password"
                            name="confirmPassword"
                            dependencies={['password']}
                            rules={[
                                {
                                    required: true,
                                    message: "Please confirm your password!",
                                },
                                ({ getFieldValue }) => ({
                                    validator(_, value) {
                                        if (!value || getFieldValue("password") === value) {
                                            return Promise.resolve();
                                        }
                                        return Promise.reject(new Error("Passwords do not match!"));
                                    },
                                }),
                            ]}
                        >
                            <Input.Password prefix={<LockOutlined />} placeholder="Confirm your password" />
                        </Form.Item>

                        <Form.Item>
                            <Button
                                type="primary"
                                htmlType="submit"
                                block
                                loading={loading}
                            >
                                Sign Up
                            </Button>
                        </Form.Item>
                    </Form>

                    <Typography.Paragraph style={{ textAlign: "center", marginTop: 16 }}>
                        Already have an account? <Link href="/signin">Log in</Link>
                    </Typography.Paragraph>
                </Card>
            </div>
        </div>
    );
}
