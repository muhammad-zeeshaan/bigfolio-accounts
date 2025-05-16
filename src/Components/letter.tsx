"use client";

import React, { useState } from "react";
import { Editor } from "@tinymce/tinymce-react";
import Input from 'antd/es/input/Input';
import { Button, message } from 'antd';
import { trpc } from '@/utils/trpcClient';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export default function Letter() {
    const [submit, setSubmit] = useState<boolean>(true);
    const [heading, setHeading] = useState<string>("Cover Letter");
    const [content, setContent] = useState(`
        <p>12-02-2024<br><strong>Dear Muhammad Arsalan uddin,<br></strong><br>&nbsp;is pleased to formally offer you the position of Business Developer Manager, with an expected start date of January 20th, 2025. We are eager to have you join our team and are confident that your expertise will significantly contribute to our organization's success.<br><br>Following our discussions, your compensation package will comprise a monthly salary of PKR 150K (inclusive of taxes), which includes a fuel allowance of PKR 10K. This salary is based on an 8-hour workday, and payments will be processed on the 1st week of each month.<br><br>Furthermore, you will be eligible for incentive bonuses at the close of each fiscal quarter, which will be awarded based on the company's criteria, encompassing objective and subjective performance metrics.<br>Bigfolio is pleased to formally offer you the position of Business Developer Manager, with an expected start date of January 20th, 2025. We are eager to have you join our team and are confident that your expertise will significantly contribute to our organization's success.<br><br>Following our discussions, your compensation package will comprise a monthly salary of PKR 150K (inclusive of taxes), which includes a fuel allowance of PKR 10K. This salary is based on an 8-hour workday, and payments will be processed on the 1st week of each month.<br><br>Furthermore, you will be eligible for incentive bonuses at the close of each fiscal quarter, which will be awarded based on the company's criteria, encompassing objective and subjective performance metrics.Bigfolio is pleased to formally offer you the position of Business Developer Manager, with an expected start date of January 20th, 2025. We are eager to have you join our team and are confident that your expertise will significantly contribute to our organization's success.<br><br>Bigfolio is pleased to formally offer you the position of Business Developer Manager, with an expected start date of January 20th, 2025. We are eager to have you join our team and are confident that your expertise will significantly contribute to our organization's success.<br><br>Following our discussions, your compensation package will comprise a monthly salary of PKR 150K (inclusive of taxes), which includes a fuel allowance of PKR 10K. This salary is based</p>
    `);
    const [loading, setLoading] = useState<boolean>(false);
    const [emails, setEmails] = useState<string>("");
    const [ccEmail, setCCEmail] = useState<string>("");

    const { mutateAsync, isLoading } = trpc.employee.sendInvoiceEmail.useMutation();

    const handleEditorChange = (content: string) => {
        setContent(content);
    };

    const checkEmailValidation = (emails: string) => {
        const receiverEmails = emails.trim().split(",").map((email) => email.trim());
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const isValid = receiverEmails.every((email) => emailRegex.test(email));

        return isValid;
    };
    const checkCCEmailValidation = (emails: string) => {
        if (!emails) return true
        const receiverEmails = emails.trim().split(",").map((email) => email.trim());
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const isValid = receiverEmails.every((email) => emailRegex.test(email));

        return isValid;
    };

    const generatePDF = async (type: string) => {
        setLoading(true)
        const input = document.getElementById('invoice');
        if (input) {
            html2canvas(input, { scale: 2 }).then(async (canvas) => {
                const imgData = canvas.toDataURL('image/png');
                const pdf = new jsPDF('p', 'mm', 'a4');
                const imgWidth = 210;
                const imgHeight = (canvas.height * imgWidth) / canvas.width;

                const pageHeight = 297;
                let position = 0;

                pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);

                let remainingHeight = imgHeight - pageHeight;

                while (remainingHeight > 0) {
                    position = -pageHeight;
                    pdf.addPage();
                    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                    remainingHeight -= pageHeight;
                }

                if (type === 'download') {
                    pdf.save('invoice.pdf');
                } else {
                    if (!checkEmailValidation(emails)) {
                        message.error('Invalid email address.')
                        return
                    }
                    const recEmails = emails.trim().split(",").map((email) => email.trim());
                    const ccEmails = ccEmail.trim().split(",").map((email) => email.trim());
                    const pdfBase64 = pdf.output('datauristring');

                    try {
                        await mutateAsync({ emails: recEmails, pdfBase64, ccEmails: ccEmails });
                        message.success('Invoice sent successfully!');
                    } catch (error) {
                        message.error('Failed to send invoice.');
                        console.error(error);
                        setLoading(false)
                    }
                }
                setLoading(false)
            });
        }
    };
    const handleParseEmails = (str: string) => {
        console.log(str.trim().split(",").map((email) => email.trim()))
        setEmails(str)
    }
    return (
        <div>
            <div className='flex justify-between'>
                <h1 className="text-2xl font-bold mb-6">Letter Head</h1>
                <div className='flex gap-4'>
                    <Button loading={loading && !isLoading} onClick={() => {
                        generatePDF("download")
                    }}
                    >
                        Download PDF </Button>
                    <Button type="primary" disabled={!checkEmailValidation(emails) || !checkCCEmailValidation(ccEmail)} loading={isLoading} onClick={() => generatePDF("email")}>
                        Send invoice
                    </Button>
                </div>
            </div>
            <div className="flex justify-between items-start gap-8 p-8 bg-gray-50 min-h-screen">
                <div className="w-[350px] rounded-xl bg-white p-4 border border-gray-200 space-y-6">
                    {/* Heading Section */}
                    <div className="space-y-2">
                        <label className="block text-sm text-gray-600">Letter Heading</label>
                        <Input
                            type="text"
                            value={heading}
                            onChange={(e) => setHeading(e.target.value)}
                            placeholder="Enter heading"
                            className="!w-full"
                        />
                        {submit ? (
                            <Button type="primary" onClick={() => setSubmit(false)} className="!w-full">
                                Edit
                            </Button>
                        ) : (
                            <Button
                                type="primary"
                                onClick={() => setSubmit(true)}
                                className="!w-full py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold"
                                danger
                            >
                                Submit
                            </Button>
                        )}
                    </div>

                    {/* Receiver Emails */}
                    <div className="space-y-2">
                        <label className="block text-sm text-gray-600">Receiver Emails (comma separated)</label>
                        <Input
                            placeholder="Receiver Email"
                            value={emails}
                            onChange={(e) => handleParseEmails(e.target.value)}
                            className="!w-full"
                        />
                    </div>

                    {/* CC Email */}
                    <div className="space-y-2">
                        <label className="block text-sm text-gray-600">CC Email</label>
                        <Input
                            placeholder="CC Email"
                            value={ccEmail}
                            onChange={(e) => setCCEmail(e.target.value)}
                            className="!w-full"
                        />
                    </div>
                </div>


                <div className='w-full flex justify-center'>
                    <div id="invoice" className="w-[782px] bg-white p-8 rounded-[8px] border border-gray-200">
                        <div className="flex justify-between items-start mb-8">
                            <div className="flex items-center gap-x-2">
                                <img
                                    src="/Bigfolio-logo.svg"
                                    alt="Bigfolio Logo"
                                    className="w-[22px] h-[30px]"
                                />
                                <img
                                    src="/bigfolio-text.svg"
                                    alt="Bigfolio Logo"
                                    className="w-[83.37px] h-[24.58px]"
                                />
                                <p className="font-poppins flex flex-col justify-center font-medium text-[8px] leading-[142%] tracking-[10%] text-[#656565]">
                                    FZE LLC
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="font-poppins font-semibold text-[18px] text-gray-800">
                                    {heading}
                                </p>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="mt-8">
                            {!submit ? (
                                <Editor
                                    value={content}
                                    apiKey="ootvnqk3gfzqj30whhefn6nxm1pi0www26ghg12fz077yzmf"
                                    init={{
                                        height: 500,
                                        menubar: false,
                                        plugins: [
                                            "advlist autolink lists link image charmap print preview anchor",
                                            "searchreplace visualblocks code fullscreen",
                                            "insertdatetime media table paste code help wordcount",
                                        ],
                                        toolbar:
                                            "undo redo | formatselect | bold italic backcolor | \
                            alignleft aligncenter alignright alignjustify | \
                            bullist numlist outdent indent | removeformat | help",
                                    }}
                                    onEditorChange={handleEditorChange}
                                />
                            ) : (
                                <div
                                    className="prose max-w-full"
                                    dangerouslySetInnerHTML={{ __html: content }}
                                />
                            )}
                        </div>
                        <div className="w-full border-t border-gray-300 opacity-50 my-6"></div>
                        <div className="flex space-x-8 text-sm">
                            <div className="flex-1">
                                <p>Business Centre, Sharjah Publishing City</p>
                                <p>Free Zone, Sharjah, United Arab Emirates</p>
                            </div>
                            <div className="flex-1">
                                <p>+1 435-328-2694</p>
                                <p>hello@bigfolio.co</p>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}