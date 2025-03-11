import { Tag } from 'antd';
import { HistoryDTO } from '../types';

const columns = () => [
    {
        title: "Name",
        dataIndex: ["user", "name"],
        key: "name",
    },
    {
        title: "Email",
        dataIndex: ["user", "email"],
        key: "email",
    },
    {
        title: "Value Date",
        dataIndex: "dispatchDate",
        key: "dispatchDate",
        render: (value: unknown) => new Date(value as string).toLocaleDateString(),
    },
    {
        title: "Salary Status",
        dataIndex: "salaryStatus",
        key: "salaryStatus",
        render: (value: unknown) => {
            let color: string;
            const status = value as string;
            switch (status) {
                case "Send":
                    color = "green";
                    break;
                case "Pending":
                    color = "orange";
                    break;
                case "Failed":
                    color = "red";
                    break;
                default:
                    color = "default";
            }
            return <Tag color={color}>{status}</Tag>;
        },
    },
    {
        title: "Basic Salary",
        dataIndex: "basicSalary",
        key: "basicSalary",
    },
    {
        title: "Allowance",
        dataIndex: "allowance",
        key: "allowance",
    },
    {
        title: "Bonus",
        dataIndex: "bonus",
        key: "bonus",
    },
    {
        title: "Overtime",
        dataIndex: "overtime",
        key: "overtime",
    },
    {
        title: "Tax",
        dataIndex: "tax",
        key: "tax",
    },
    {
        title: "Holiday",
        dataIndex: "holiday",
        key: "holiday",
    },
    {
        title: "Total Salary Amount",
        key: "totalSalaryAmount",
        render: (_: unknown, record: HistoryDTO) => {
            const {
                basicSalary = 0,
                allowance = 0,
                bonus = 0,
                overtime = 0,
                tax = 0,
                holiday = 0,
            } = record;

            const currentDate = new Date();
            const totalDaysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();

            // Calculate total weekdays in the month (excluding weekends)
            const weekdaysInMonth = Array.from(
                { length: totalDaysInMonth },
                (_, day) => new Date(currentDate.getFullYear(), currentDate.getMonth(), day + 1)
            ).filter(date => date.getDay() !== 0 && date.getDay() !== 6).length;

            const oneDaySalary = basicSalary / weekdaysInMonth;
            const overtimePayment = overtime * oneDaySalary;
            const workingDays = weekdaysInMonth - holiday;
            const workingDaysPayment = workingDays * oneDaySalary;

            const totalSalary = workingDaysPayment + overtimePayment + bonus + allowance - tax;
            return <>{`$${totalSalary.toFixed(2).toLocaleString()}`}</>;
        },
    },
];

export default columns;
