import { Tag } from 'antd';

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
        title: "Dispatch Date",
        dataIndex: "dispatchDate",
        key: "dispatchDate",
        render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
        title: "Salary Status",
        dataIndex: "salaryStatus",
        key: "salaryStatus",
        render: (status: string) => {
            let color = "";
            if (status === "Send") color = "green";
            else if (status === "Pending") color = "orange";
            else if (status === "Failed") color = "red";
            else color = "default";

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
        render: (_: any, record: any) => {
            const {
                basicSalary = 0,
                allowance = 0,
                bonus = 0,
                overtime = 0,
                tax = 0,
                holiday = 0
            } = record;
            const currentDate = new Date();
            const totalDaysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
            const weekdaysInMonth = Array.from({ length: totalDaysInMonth }, (_, day) => new Date(currentDate.getFullYear(), currentDate.getMonth(), day + 1))
                .filter(date => date.getDay() !== 0 && date.getDay() !== 6).length;

            const oneDaySalary = basicSalary / weekdaysInMonth;
            const overtimePayment = overtime * oneDaySalary;
            const workingDays = weekdaysInMonth - holiday;
            const workingDaysPayment = workingDays * oneDaySalary;
            const totalSalary = (workingDaysPayment + overtimePayment + bonus + allowance) - tax;
            return `$${totalSalary.toFixed(2).toLocaleString()}`;
        },
    },
];
export default columns