"use client";

import React, { useState } from "react";
import { Editor } from "@tinymce/tinymce-react";
import Input from 'antd/es/input/Input';
import { Button } from 'antd';

export default function Letter() {
    const [submit, setSubmit] = useState(true);
    const [heading, setHeading] = useState("Cover Letter");
    const [content, setContent] = useState(`
        <p>12-02-2024<br><strong>Dear Muhammad Arsalan uddin,<br></strong><br>&nbsp;is pleased to formally offer you the position of Business Developer Manager, with an expected start date of January 20th, 2025. We are eager to have you join our team and are confident that your expertise will significantly contribute to our organization's success.<br><br>Following our discussions, your compensation package will comprise a monthly salary of PKR 150K (inclusive of taxes), which includes a fuel allowance of PKR 10K. This salary is based on an 8-hour workday, and payments will be processed on the 1st week of each month.<br><br>Furthermore, you will be eligible for incentive bonuses at the close of each fiscal quarter, which will be awarded based on the company's criteria, encompassing objective and subjective performance metrics.<br>Bigfolio is pleased to formally offer you the position of Business Developer Manager, with an expected start date of January 20th, 2025. We are eager to have you join our team and are confident that your expertise will significantly contribute to our organization's success.<br><br>Following our discussions, your compensation package will comprise a monthly salary of PKR 150K (inclusive of taxes), which includes a fuel allowance of PKR 10K. This salary is based on an 8-hour workday, and payments will be processed on the 1st week of each month.<br><br>Furthermore, you will be eligible for incentive bonuses at the close of each fiscal quarter, which will be awarded based on the company's criteria, encompassing objective and subjective performance metrics.Bigfolio is pleased to formally offer you the position of Business Developer Manager, with an expected start date of January 20th, 2025. We are eager to have you join our team and are confident that your expertise will significantly contribute to our organization's success.<br><br>Bigfolio is pleased to formally offer you the position of Business Developer Manager, with an expected start date of January 20th, 2025. We are eager to have you join our team and are confident that your expertise will significantly contribute to our organization's success.<br><br>Following our discussions, your compensation package will comprise a monthly salary of PKR 150K (inclusive of taxes), which includes a fuel allowance of PKR 10K. This salary is based</p>
    `);

    const handleEditorChange = (content: string) => {
        setContent(content);
    };
    return (
        <div className="flex justify-center items-start gap-8 p-8 bg-gray-50 min-h-screen">
            {/* Left Side: Input and Button */}
            <div className="mb-4 flex flex-col gap-4 w-[300px]">
                <Input
                    type="text"
                    value={heading}
                    className="!w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onChange={(e) => setHeading(e.target.value)}
                    placeholder="Enter heading"
                />
                {submit ? (
                    <Button
                        type="primary"
                        onClick={() => setSubmit(false)}
                        className="!w-full py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                    >
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

            {/* Right Side: Content Container */}
            <div className="w-[700px] mx-auto bg-white p-8 shadow-xl rounded-lg border border-gray-200">
                {/* Header */}
                <div className="flex justify-between items-start mb-8">
                    <>
                        <div className="flex items-center gap-x-1">
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
                    </>
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

                {/* Signature */}
                <div className="flex justify-end mt-6">
                    <img src="/signature.png" alt="signature" className="w-32" />
                </div>

                {/* Footer */}
                <div className="w-full border-t border-gray-300 opacity-50 my-6"></div>
                <div className="flex space-x-8 text-sm text-gray-600">
                    <div className="flex-1">
                        <p className="font-semibold">Business Centre, Sharjah Publishing City</p>
                        <p>Free Zone, Sharjah, United Arab Emirates</p>
                    </div>
                    <div className="flex-1">
                        <p className="font-semibold">+971 58 549 2071</p>
                        <p>hello@bigfolio.co</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
