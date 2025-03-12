import useQueryParams from '@/app/hooks/useQueryParams';
import { AttendanceSummary, Employee, ErrorResponse, SalaryFormData } from '@/app/types';
import { Modal, Form, InputNumber, Button, Row, Col, Card } from 'antd';
import { useEffect, useState } from 'react';

export const InvoiceModal: React.FC<{
    visible: boolean;
    onCancel: () => void;
    attendanceDetails: AttendanceSummary;
    onFinish: (values: SalaryFormData) => void;
    userData: Employee | ErrorResponse;
}> = ({ visible, onCancel, attendanceDetails, onFinish, userData }) => {
    const [form] = Form.useForm();
    const params = useQueryParams()
    const isEmployee = (data: Employee | ErrorResponse): data is Employee => {
        return (data as Employee).email !== undefined;
    };
    const data = {
        basicSalary: isEmployee(userData) ? userData?.basicSalary : 0,
        allowance: isEmployee(userData) ? userData?.allowance : 0,
        bonus: 0,
        overtime: attendanceDetails.overtimeDays || 0,
        tax: 0,
    }
    const [salaryData, setSalaryData] = useState(data);
    const disableKeys = ['basicSalary', 'overtime']
    useEffect(() => {
        if (attendanceDetails) {
            form.setFieldsValue({
                totalPresent: attendanceDetails.totalPresent,
                totalAbsent: attendanceDetails.totalAbsents,
                overtimeDays: attendanceDetails.overtimeDays,
                ...salaryData,
            })
        }
    }, [attendanceDetails, form, salaryData, visible]);
    useEffect(() => {
        setSalaryData(data)
    }, [visible, attendanceDetails])
    const getWeekdaysInMonth: () => number = () => {
        const date = new Date();
        const year = date.getFullYear();
        const monthParam = params.get('month');
        const month = monthParam ? parseInt(monthParam, 10) - 1 : date.getMonth();
        const totalDays = new Date(year, month + 1, 0).getDate();
        return Array.from({ length: totalDays }, (_, i) => new Date(year, month, i + 1))
            .filter(d => d.getDay() !== 0 && d.getDay() !== 6).length;
    };
    const oneDaySalary = salaryData.basicSalary / getWeekdaysInMonth();
    const workingDays = Number(attendanceDetails.totalPresent || 0) + Number(attendanceDetails.overtimeDays || 0);
    const workingDaysPayment = Number(attendanceDetails.totalPresent || 0) * oneDaySalary;
    const overtimePayment = salaryData.overtime * oneDaySalary;
    const totalSalary = (workingDaysPayment + overtimePayment + salaryData.bonus + salaryData.allowance) - salaryData.tax;
    return (
        <Modal
            title="Generate Invoice"
            open={visible}
            onCancel={onCancel}
            footer={[
                <Button key="cancel" onClick={onCancel}>Cancel</Button>,
                <Button key="submit" type="primary" onClick={() => form.submit()}>Generate Invoice</Button>,
            ]}
        >
            <Form form={form} layout="vertical" onFinish={(e) => onFinish({ ...e, total: totalSalary, overTimePayment: overtimePayment, totalWorkingDays: getWeekdaysInMonth(), subTotal: workingDaysPayment })}>
                <Row gutter={16}>
                    <Col span={12}><Form.Item label="Total Present" name="totalPresent"><InputNumber disabled style={{ width: "100%" }} /></Form.Item></Col>
                    <Col span={12}><Form.Item label="Total Absent" name="totalAbsent"><InputNumber disabled style={{ width: "100%" }} /></Form.Item></Col>
                </Row>
                <Row gutter={16}>
                    {Object.entries(salaryData).map(([key, value]) => (
                        <Col span={12} key={key}>
                            <Form.Item name={key} label={key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}>
                                <InputNumber min={0} disabled={disableKeys.includes(key)} value={value} onChange={(val) => setSalaryData(prev => ({ ...prev, [key]: val || 0 }))} style={{ width: "100%" }} />
                            </Form.Item>
                        </Col>
                    ))}
                </Row>
                <Card title={<div className='!text-left'>Salary Breakdown</div>} bordered={false} style={{ marginTop: 5, textAlign: 'right' }}>
                    <p>Basic Salary: ({workingDays} out of {getWeekdaysInMonth()} days) - <strong>{workingDaysPayment.toFixed(2)} PKR</strong></p>
                    <p>Overtime Payment: <strong>{overtimePayment.toFixed(2)} PKR</strong></p>
                    <p style={{ fontSize: "18px", fontWeight: "bold", color: '#1577ff' }}>Total Salary: <strong>{totalSalary.toFixed(2)} PKR</strong></p>
                </Card>
            </Form>
        </Modal>
    );
};
