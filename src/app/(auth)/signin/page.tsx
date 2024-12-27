"use client";
import React from "react";
import { Form, Input, Button, Typography, Card, Alert, message } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import login from '@/app/actions/login';
import { LoginFormData } from '@/app/types';

export default function LoginPage(): JSX.Element {
    const [form] = Form.useForm();
    const [error, setError] = React.useState<string | null>(null);
    const [loading, setLoading] = React.useState<boolean>(false);

    const onFinish = async (values: LoginFormData): Promise<void> => {
        setLoading(true)
        try {
            const result = await login(values as LoginFormData);
            if (result.ok) {
                message.success("Login successful");
                window.location.href = "/";
            }
            if (result?.error) {
                setError(result.error);
            } else {
                setError(null);
            }
        } catch (err) {
            console.error("Login failed: ", err);
            setError("An unexpected error occurred. Please try again.");
        }
        setLoading(false)
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
                        Welcome Back!
                    </Typography.Title>
                    <Typography.Paragraph className='!text-white' style={{ fontSize: "16px", marginTop: "16px" }}>
                        Login to continue accessing your account and exploring amazing features.
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
                        Login
                    </Typography.Title>

                    {error && <Alert message={error} type="error" showIcon style={{ marginBottom: 16 }} />}

                    <Form
                        form={form}
                        name="login"
                        layout="vertical"
                        onFinish={onFinish}
                        onFinishFailed={onFinishFailed}
                    >
                        <Form.Item
                            label="Email"
                            name="email"
                            rules={[
                                {
                                    required: true,
                                    message: "Please enter your email!",
                                    type: "email",
                                },
                            ]}
                        >
                            <Input prefix={<UserOutlined />} placeholder="Enter your email" />
                        </Form.Item>

                        <Form.Item
                            label="Password"
                            name="password"
                            rules={[
                                {
                                    required: true,
                                    message: "Please enter your password!",
                                    min: 6,
                                },
                            ]}
                        >
                            <Input.Password prefix={<LockOutlined />} placeholder="Enter your password" />
                        </Form.Item>

                        <Form.Item>
                            <Button
                                type="primary"
                                htmlType="submit"
                                block
                                loading={loading} // Add the loading prop to show the loading spinner
                            >
                                Log in
                            </Button>
                        </Form.Item>
                    </Form>
                </Card>
            </div>
        </div>
    );
}
