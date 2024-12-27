import { Employee } from '@/app/types';
import React from "react";

const SalarySlip = ({ employeedetail }: { employeedetail: Employee }) => {
    const { name, designation, basicSalary, bonus, allowance, overtime, tax, holiday } = employeedetail
    const salaryMonth = (): string => {
        const currentDate: Date = new Date();

        const options: Intl.DateTimeFormatOptions = { month: 'short' };
        const month: string = currentDate
            .toLocaleString('en-US', options)
            .toUpperCase();

        const year: string = currentDate.getFullYear().toString().slice(-2);

        return `${month} ${year}`;
    };
    const getWeekdaysInMonth = (): number => {
        const currentDate: Date = new Date();
        const currentYear: number = currentDate.getFullYear();
        const currentMonth: number = currentDate.getMonth();

        const totalDaysInMonth: number = new Date(currentYear, currentMonth + 1, 0).getDate();
        let weekdaysCount: number = 0;

        for (let day = 1; day <= totalDaysInMonth; day++) {
            const date: Date = new Date(currentYear, currentMonth, day);
            const dayOfWeek: number = date.getDay();

            if (dayOfWeek !== 0 && dayOfWeek !== 6) {
                weekdaysCount++;
            }
        }
        return weekdaysCount;
    };
    const oneDaySalaryOfEmployee = (): number => {
        return basicSalary / getWeekdaysInMonth()
    }
    const overTimePayment = (): number => {
        const oneDaySalary = oneDaySalaryOfEmployee()
        return (overtime * oneDaySalary)
    }

    const employeeWorkingDays = (): number => {
        return getWeekdaysInMonth() - holiday
    }
    const employeeWorkingDaysPayment = (): number => {
        return employeeWorkingDays() * oneDaySalaryOfEmployee()
    }
    const totalSalary = (): number => {
        const totalOverTimePayment = overTimePayment()
        const total = (totalOverTimePayment + bonus + allowance + employeeWorkingDaysPayment()) - tax
        return total

    }
    return (
        <div className="max-w-4xl mx-auto ">
            {/* Header Section */}
            <div
                className="flex items-center mt-10 justify-end mb-6 bg-[#013a4d] py-1 w-60 pr-3"
                style={{
                    borderTopRightRadius: '63px',
                }}
            >
                <img
                    src="/Bigfolio-Logo-Landscape-White.png"
                    alt="Bigfolio"
                    className="h-10"
                    style={{ marginLeft: "auto" }}
                />
            </div>

            <div className='lg:px-20 max-lg:px-4'>
                {/* Employee Details */}
                <div className="grid grid-cols-2 p-6 gap-y-2 mb-6 text-sm">
                    <div className='space-y-1'>
                        <p>Name: <span >{name}</span></p>
                        <p>Designation: <span >{designation}</span></p>
                        <p>Salary Package: <span >{basicSalary.toString()}</span></p>
                    </div>
                    <div className="space-y-1 text-right">
                        <p className="font-bold text-sm">Salary Month: {salaryMonth()}</p>
                        <p className="text-sm">Dispatch Date: 15/12/2024</p>
                    </div>
                </div>

                {/* Table Section */}
                <div>
                    <div className="bg-[rgb(255_231_177)] py-2 px-6 font-bold flex justify-between">
                        <span>Details</span>
                        <span>AMOUNT</span>
                    </div>
                    <div className="">
                        <div className="flex justify-between py-2 px-4">
                            <span>Basic Salary: ({employeeWorkingDays()} out of {getWeekdaysInMonth()} working days)</span>
                            <span>{employeeWorkingDaysPayment().toFixed(2)} PKR</span>
                        </div>
                        <div className="flex justify-between py-2 px-4">
                            <span>Over Time:</span>
                            <span>{overTimePayment().toFixed(2)} PKR</span>
                        </div>
                        <div className="flex justify-between py-2 px-4">
                            <span>Allowance:</span>
                            <span>{allowance} PKR</span>
                        </div>
                        <div className="flex justify-between py-2 px-4">
                            <span>Bonus:</span>
                            <span>{bonus} PKR</span>
                        </div>
                        <div className="flex justify-between py-2 px-4">
                            <span>Withheld Tax:</span>
                            <span>{tax} PKR</span>
                        </div>
                    </div>
                </div>

                {/* Total Section */}
                <div className="flex justify-between font-bold text-lg border-t mt-20 pt-2 px-4">
                    <span>Total:</span>
                    <span>{totalSalary().toFixed(2)} PKR</span>
                </div>
            </div>

            {/* Signatures Section */}
            <div className="mt-8 grid grid-cols-2 gap-12">
                <div className="text-center">
                    <p className="font-bold">Muhammad Zeeshan</p>
                    <p className="text-sm text-gray-600">CEO Bigfolio LLC</p>
                    <div className="border-t mt-2"></div>
                </div>
                <div className="text-center">
                    <p className="font-bold">XXXXXX</p>
                    <p className="text-sm text-gray-600">Graphic Designer</p>
                    <div className="border-t mt-2"></div>
                </div>
            </div>

            {/* Footer Section */}
            <div className="bg-[rgb(255_231_177)] mt-8 px-14 py-4 text-sm text-gray-700">
                <div className="flex justify-between">
                    <div className="flex space-x-2 items-center">
                        <span>🌐</span>
                        <a href="https://www.bigfolio.co" className="hover:underline">
                            www.bigfolio.co
                        </a>
                    </div>
                    <div className="flex space-x-2 items-center">
                        <span>✉️</span>
                        <a href="mailto:hello@bigfolio.co" className="hover:underline">
                            hello@bigfolio.co
                        </a>
                    </div>
                    <div className="flex space-x-2 items-center">
                        <span>📞</span>
                        <a href="tel:+923147866976" className="hover:underline">
                            +92 314-7866976
                        </a>
                    </div>
                    <div className="flex space-x-2 items-center">
                        <span>📍</span>
                        <span>24, C3, MM Alam Road, Gulberg III, Lahore</span>
                    </div>
                </div>
            </div>
            <div className="bg-[rgb(2_58_76)] h-[70px]" />
        </div>
    );
};

export default SalarySlip;
