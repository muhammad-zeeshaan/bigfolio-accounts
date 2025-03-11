"use client";
import React from "react";
import { Form, Input, Button, Typography, Card } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import login from '@/app/actions/login';
import { LoginFormData } from '@/app/types';
import Link from 'next/link';
import showNotification from '@/Components/notification';

export default function LoginPage(): JSX.Element {
    const [form] = Form.useForm();
    const [loading, setLoading] = React.useState<boolean>(false);

    const onFinish = async (values: LoginFormData): Promise<void> => {
        setLoading(true);
        try {
            const result = await login(values);
            if (result.ok) {
                showNotification({ type: "success", message: "Login Successful", description: "Redirecting..." });

                setTimeout(() => {
                    window.location.href = result.user?.role === 'admin' ? "/admin" : "/calendar";
                }, 1500);
            } else if (result.error) {
                showNotification({ type: "error", message: "Login Failed", description: result.error });
            }
        } catch (err) {
            console.error("Login failed: ", err);
            showNotification({ type: "error", message: "Unexpected Error", description: "Please try again." });
        }
        setLoading(false);
    };

    const onFinishFailed = (): void => {
        showNotification({ type: "error", message: "Validation Error", description: "Please check the fields and try again." });
    };

    return (
        <div className="flex flex-col md:flex-row min-h-screen">
            <div className="hidden md:flex flex-1 bg-gradient-to-r from-indigo-900 via-indigo-600 to-cyan-400 justify-center items-center text-white text-center p-6">
                <div>
                    <Typography.Title level={2} className="text-white">
                        Welcome Back!
                    </Typography.Title>
                    <Typography.Paragraph className="text-white text-lg mt-4">
                        Login to continue accessing your account and exploring amazing features.
                    </Typography.Paragraph>
                </div>
            </div>

            <div className="flex flex-1 justify-center items-center bg-gray-100 p-4">
                <Card className="w-full max-w-sm shadow-md">
                    <Typography.Title level={3} className="text-center mb-4">
                        Login
                    </Typography.Title>
                    <Form form={form} name="login" layout="vertical" onFinish={onFinish} onFinishFailed={onFinishFailed}>
                        <Form.Item
                            label="Email"
                            name="email"
                            rules={[{ required: true, message: "Please enter your email!", type: "email" }]}
                        >
                            <Input prefix={<UserOutlined />} placeholder="Enter your email" />
                        </Form.Item>

                        <Form.Item
                            label="Password"
                            name="password"
                            rules={[{ required: true, message: "Please enter your password!", min: 6 }]}
                        >
                            <Input.Password prefix={<LockOutlined />} placeholder="Enter your password" />
                        </Form.Item>

                        <Form.Item>
                            <Button type="primary" htmlType="submit" block loading={loading}>
                                Log in
                            </Button>
                        </Form.Item>
                    </Form>
                    <Typography.Paragraph className="text-center mt-4">
                        Need an account? <Link href="/signup">Sign Up</Link>
                    </Typography.Paragraph>
                </Card>
            </div>
        </div>
    );
}
