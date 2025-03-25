import { EmployeeSalaryDTO } from '@/app/types';
import React, { useState } from "react";
import { trpc } from '@/utils/trpcClient';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Button, message } from 'antd';
// import { jsPDF } from "jspdf";

const SalarySlip = ({ employeedetail }: { employeedetail: EmployeeSalaryDTO }) => {
    const { bonus, allowance, overtime, tax, totalWorkingDays, overTimePayment, totalPresent, subTotal, total } = employeedetail;
    const [loading, setLoading] = useState<boolean>(false);
    const { mutateAsync, isLoading } = trpc.employee.sendInvoiceEmail.useMutation();
    const salaryMonth = (): string => {
        const currentDate = new Date();
        const day = String(currentDate.getDate()).padStart(2, '0');
        const month = String(currentDate.getMonth() + 1).padStart(2, '0');
        const year = currentDate.getFullYear();

        return `${day}/${month}/${year}`;
    };
    console.log(loading, isLoading)
    const workingDays = totalPresent + overtime;
    function capitalizeFirstLetter(str: string) {
        if (!str) return str;
        const updatedString = str.split('_').join(' ')
        return updatedString.charAt(0).toUpperCase() + str.slice(1);
    }
    const generatePDF = async (type: string) => {
        setLoading(true);
        const input = document.getElementById('invoice');

        if (input) {
            const canvas = await html2canvas(input, {
                scale: 3,
                useCORS: true,
                backgroundColor: '#ffffff',
            });

            const imgData = canvas.toDataURL('image/png');

            const pdf = new jsPDF({
                orientation: 'p', // Portrait mode
                unit: 'mm',
                format: 'a4',
            });

            const imgWidth = 210;
            const pageHeight = 297;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            let yPosition = 0;

            if (imgHeight > pageHeight) {
                while (yPosition < imgHeight) {
                    pdf.addImage(imgData, 'PNG', 0, -yPosition, imgWidth, imgHeight);
                    yPosition += pageHeight;
                    if (yPosition < imgHeight) pdf.addPage();
                }
            } else {
                pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
            }

            if (type === 'download') {
                pdf.save('invoice.pdf');
            } else {
                const pdfBase64 = pdf.output('datauristring');
                try {
                    await mutateAsync({ emails: [employeedetail.email ?? ""], pdfBase64 });
                    message.success('Invoice sent successfully!');
                } catch (error) {
                    message.error('Failed to send invoice.');
                    console.error(error);
                    setLoading(false)
                }
            }
            setLoading(false);
        }
    };
    const details = [
        { label: `Basic Salary (${workingDays} out of ${totalWorkingDays} working days)`, value: subTotal },
        { label: "Overtime", value: overTimePayment },
        { label: "Allowance", value: allowance },
        { label: "Bonus", value: bonus },
        { label: "Tax", value: -tax },
    ];
    console.log({ employeedetail })
    return (
        <div>
            <div id='invoice' className='mt-6 p-10'>
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
                        {details.map((item, index) => (
                            <tr key={index} className="border-b border-gray-300 h-[40px]">
                                <td className="px-6 py-3">{item.label}</td>
                                <td className="px-6 py-3 text-right">{item.value.toFixed(2)}</td>
                            </tr>
                        ))}
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
            <div className='flex justify-end gap-2'>
                <Button onClick={() => generatePDF("download")}>Download Slip</Button>
                <Button type='primary' onClick={() => generatePDF("send")}>Send Slip</Button>
            </div>
        </div>
    );
};

export default SalarySlip;
