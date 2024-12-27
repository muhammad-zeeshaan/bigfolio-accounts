"use client";
import React from "react";
import { Form, Input, InputNumber, Select, Button } from "antd";
import { Employee } from '@/app/types';


interface FormProps {
    employee?: Employee;
    onSubmit: (data: Employee) => void;
    loading: boolean
}

const { Option } = Select;

const EmployeeForm: React.FC<FormProps> = ({ employee, onSubmit, loading }) => {
    const [form] = Form.useForm();

    const initialFormData = employee || {
        name: "",
        email: "",
        phone: "",
        salaryStatus: "Pending",
        basicSalary: 0,
        allowance: 0,
        bonus: 0,
        overtime: 0,
        tax: 0,
        designation: ''
    };

    React.useEffect(() => {
        form.setFieldsValue(initialFormData);
    }, [employee, form, initialFormData]);

    const handleSubmit = (values: Employee) => {
        onSubmit(values);
    };

    return (
        <Form
            form={form}
            onFinish={handleSubmit}
            layout="vertical"

        >
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
                {employee ? "Edit Employee" : "Add Employee"}
            </h2>

            <Form.Item
                label="Name"
                name="name"
                rules={[{ required: true, message: "Please enter employee name" }]}
            >
                <Input placeholder="Enter employee name" />
            </Form.Item>

            <Form.Item
                label="Email"
                name="email"
                rules={[
                    { required: true, message: "Please enter employee email" },
                    { type: "email", message: "Please enter a valid email" },
                ]}
            >
                <Input placeholder="Enter employee email" />
            </Form.Item>

            <Form.Item
                label="Phone"
                name="phone"
                rules={[{ required: true, message: "Please enter phone number" }]}
            >
                <Input placeholder="Enter phone number" />
            </Form.Item>

            <Form.Item
                label="Salary Status"
                name="salaryStatus"
                rules={[{ required: true, message: "Please select salary status" }]}
            >
                <Select placeholder="Select salary status">
                    <Option value="Send">Send</Option>
                    <Option value="Pending">Pending</Option>
                </Select>
            </Form.Item>
            <Form.Item
                label="Employee Designation"
                name="designation"
                rules={[{ required: true, message: "Please select salary status" }]}
            >
                <Input placeholder="Enter Employee Designation" />
            </Form.Item>

            <Form.Item
                label="Basic Salary"
                name="basicSalary"
                rules={[
                    { required: true, message: "Please enter basic salary" },
                    { type: "number", message: "Please enter a valid salary" },
                ]}
            >
                <InputNumber
                    min={0}
                    style={{ width: "100%" }}
                    placeholder="Enter basic salary"
                />
            </Form.Item>

            <Form.Item
                label="Allowance"
                name="allowance"
                rules={[
                    { required: true, message: "Please enter allowance amount" },
                    { type: "number", message: "Please enter a valid allowance" },
                ]}
            >
                <InputNumber
                    min={0}
                    style={{ width: "100%" }}
                    placeholder="Enter allowance"
                />
            </Form.Item>

            <Form.Item
                label="Bonus"
                name="bonus"
                rules={[
                    { required: true, message: "Please enter bonus amount" },
                    { type: "number", message: "Please enter a valid bonus" },
                ]}
            >
                <InputNumber
                    min={0}
                    style={{ width: "100%" }}
                    placeholder="Enter bonus amount"
                />
            </Form.Item>

            <Form.Item
                label="Overtime"
                name="overtime"
                rules={[
                    { required: true, message: "Please enter overtime in days" },
                    { type: "number", message: "Please enter a valid overtime" },
                ]}
            >
                <InputNumber
                    min={0}
                    style={{ width: "100%" }}
                    placeholder="Enter overtime amount"
                />
            </Form.Item>
            <Form.Item
                label="Holiday"
                name="holiday"
                rules={[
                    { required: true, message: "Please enter total holiday" },
                    { type: "number", message: "Please enter a valid value in number" },
                ]}
            >
                <InputNumber
                    min={0}
                    style={{ width: "100%" }}
                    placeholder="Enter holidays"
                />
            </Form.Item>

            <Form.Item
                label="Tax"
                name="tax"
                rules={[
                    { required: true, message: "Please enter tax amount" },
                    { type: "number", message: "Please enter a valid tax amount" },
                ]}
            >
                <InputNumber
                    min={0}
                    style={{ width: "100%" }}
                    placeholder="Enter tax amount"
                />
            </Form.Item>

            <Form.Item>
                <Button
                    htmlType="submit"
                    type='primary'
                    loading={loading}
                >
                    Submit
                </Button>
            </Form.Item>
        </Form>
    );
};

export default EmployeeForm;
