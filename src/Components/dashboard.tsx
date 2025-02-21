"use client"; // Required for Antd Charts in Next.js 14

import { Card, Row, Col, Statistic } from "antd";
import { ArrowUpOutlined, ArrowDownOutlined } from "@ant-design/icons";
import { Column, Pie } from '@ant-design/plots';

const DashboardPage = () => {
    const attendanceData = [
        { month: "Jan", present: 120, absent: 10 },
        { month: "Feb", present: 150, absent: 5 },
        { month: "Mar", present: 200, absent: 8 },
        { month: "Apr", present: 180, absent: 12 },
        { month: "May", present: 220, absent: 15 },
    ];

    const salaryDistributionData = [
        { type: "Basic", value: 40 },
        { type: "Allowances", value: 30 },
        { type: "Deductions", value: 10 },
        { type: "Bonuses", value: 20 },
    ];

    const attendanceChartConfig = {
        data: attendanceData,
        xField: "month",
        yField: "present",
        color: "#6366f1",
        label: {
            style: {
                fill: "#FFFFFF",
            },
        },
    };

    const salaryChartConfig = {
        data: salaryDistributionData,
        angleField: "value",
        colorField: "type",
        radius: 0.8,
        interactions: [{ type: "element-active" }],
    };

    return (
        <div className="!bg-[#f5f5f5] min-h-screen">
            <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

            <Row gutter={[16, 16]} className="mb-6">
                <Col xs={12} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="Total Employees"
                            value={250}
                            valueStyle={{ color: "#3f8600" }}
                            prefix={<ArrowUpOutlined />}
                        />
                    </Card>
                </Col>
                <Col xs={12} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="Present Today"
                            value={220}
                            valueStyle={{ color: "#3f8600" }}
                            prefix={<ArrowUpOutlined />}
                        />
                    </Card>
                </Col>
                <Col xs={12} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="Absent Today"
                            value={30}
                            valueStyle={{ color: "#cf1322" }}
                            prefix={<ArrowDownOutlined />}
                        />
                    </Card>
                </Col>
                <Col xs={12} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="Salary Slips Sent"
                            value={200}
                            valueStyle={{ color: "#3f8600" }}
                            prefix={<ArrowUpOutlined />}
                        />
                    </Card>
                </Col>
            </Row>

            <Row gutter={[16, 16]} className="mb-6">
                <Col xs={24} md={12}>
                    <Card title="Attendance Trend">
                        <Column {...attendanceChartConfig} />
                    </Card>
                </Col>
                <Col xs={24} md={12}>
                    <Card title="Salary Distribution">
                        <Pie {...salaryChartConfig} />
                    </Card>
                </Col>
            </Row>

            <Card title="Recent Activity" >
                <div className="space-y-4">
                    <p>✅ Salary slip sent to John Doe</p>
                    <p>✅ Attendance marked for Jane Smith</p>
                    <p>⚠️ Absent marked for Alice Johnson</p>
                </div>
            </Card>
        </div>
    );
};

export default DashboardPage;