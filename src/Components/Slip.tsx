import { EmployeeSalaryDTO } from '@/app/types';
import React from "react";

const SalarySlip = ({ employeedetail }: { employeedetail: EmployeeSalaryDTO }) => {
    const { bonus, allowance, overtime, tax, totalWorkingDays, overTimePayment, totalPresent, subTotal, total } = employeedetail;

    const salaryMonth = (): string => {
        const currentDate = new Date();
        const day = String(currentDate.getDate()).padStart(2, '0');
        const month = String(currentDate.getMonth() + 1).padStart(2, '0');
        const year = currentDate.getFullYear();

        return `${day}/${month}/${year}`;
    };

    const workingDays = totalPresent + overtime;
    function capitalizeFirstLetter(str: string) {
        if (!str) return str;
        const updatedString = str.split('_').join(' ')
        return updatedString.charAt(0).toUpperCase() + str.slice(1);
    }

    return (
        <div className='mt-6'>
            {/* Header */}
            <div className="flex justify-between items-start ">
                <div className="flex items-center gap-x-[5px]">
                    <img src="/public/Bigfolio-logo.svg" alt="Bigfolio Logo" className="w-[22px] h-[30px]" />
                    <img src="/public/bigfolio-text.svg" alt="Bigfolio Logo" className="w-[83.37px] h-[24.58px]" />
                </div>
                <div className="text-right">
                    <p className="text-black">Value date: {salaryMonth()}</p>
                </div>
            </div>
            <div className='mt-8'>
                <h3 className="font-semibold">Invoice To:</h3>
                <p className="text-black">Name: {capitalizeFirstLetter(employeedetail?.name ?? '')}</p>
                <p className="text-black">Designation: {capitalizeFirstLetter(employeedetail?.designation ?? '')}</p>
                <p className="text-black">Salary Package: {employeedetail?.basicSalary ?? ''}</p>
            </div>

            {/* Salary Breakdown Table */}
            <table className="w-full mt-8 border border-gray-300 border-collapse">
                <thead>
                    <tr className="border-b border-gray-300 h-[40px] text-left font-semibold">
                        <th className="px-6 py-3 w-[67%]">Details</th>
                        <th className="px-6 py-3 w-[33%] text-right">Amount (PKR)</th>
                    </tr>
                </thead>
                <tbody>
                    <tr className="border-b border-gray-300 h-[40px]">
                        <td className="px-6 py-3">Basic Salary ({workingDays} out of {totalWorkingDays} working days)</td>
                        <td className="px-6 py-3 text-right">{subTotal.toFixed(2)}</td>
                    </tr>
                    <tr className="border-b border-gray-300 h-[40px]">
                        <td className="px-6 py-3">Overtime</td>
                        <td className="px-6 py-3 text-right">{overTimePayment.toFixed(2)}</td>
                    </tr>
                    <tr className="border-b border-gray-300 h-[40px]">
                        <td className="px-6 py-3">Allowance</td>
                        <td className="px-6 py-3 text-right">{allowance.toFixed(2)}</td>
                    </tr>
                    <tr className="border-b border-gray-300 h-[40px]">
                        <td className="px-6 py-3">Bonus</td>
                        <td className="px-6 py-3 text-right">{bonus.toFixed(2)}</td>
                    </tr>
                    <tr className="border-b border-gray-300 h-[40px]">
                        <td className="px-6 py-3">Tax</td>
                        <td className="px-6 py-3 text-right">-{tax.toFixed(2)}</td>
                    </tr>
                </tbody>
            </table>

            <div className='mt-6 flex justify-end'>
                <div className="w-36">
                    <p className="font-normal flex justify-between ">Subtotal: <span className="font-semibold">${subTotal.toFixed(2)}</span></p>
                    <p className="font-normal flex justify-between">Tax: <span className="font-semibold">${tax}</span></p>
                    <div className="w-full border-t border-[#656565] opacity-20 my-4"></div>
                    <p className="font-normal flex justify-between">Total: <span className="font-semibold">{total.toFixed(2)} PKR</span></p>
                </div>
            </div>
            <p className='font-semibold mt-3'>Note:<span className='font-normal'>This invoice is system generated and does not requires any stamps.</span></p>
            {/* Footer */}
            <div className="w-full border-t border-[#656565] opacity-20 my-4"></div>
            <div className="flex space-x-4">
                <div className="flex-1">Business Centre, Sharjah Publishing City Free Zone, UAE</div>
                <div className="flex-1">+971 58 549 2071<br />hello@bigfolio.co</div>
            </div>
        </div>
    );
};

export default SalarySlip;
