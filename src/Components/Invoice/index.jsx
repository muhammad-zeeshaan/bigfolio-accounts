"use client";

import React, { useState } from "react";
import { Button, Input, DatePicker, Layout, message, Row, Col } from "antd";
import dayjs from "dayjs";
import { trpc } from '@/utils/trpcClient';
import TextArea from 'antd/es/input/TextArea';
const { Content, Sider } = Layout;
const { RangePicker } = DatePicker;

const siderStyle = {
    overflowY: 'auto',
    height: '100vh',
    position: 'sticky',
    insetInlineStart: 0,
    top: 0,
    bottom: 0,
    scrollbarWidth: 'thin',
    scrollbarGutter: 'stable',
    overflowX: 'hidden',
    padding: 10,
};

const Invoice = () => {
    const [invoiceData, setInvoiceData] = useState({
        invoiceNumber: "",
        customerName: "Thomas Shelby",
        items: [],
        subtotal: 0,
        discount: 0,
        tax: 0,
        total: 0,
        salesperson: "Tommy Shelby",
        invoiceTo: [],
        billTo: [],
        dateRange: [null, null],
    });
    const [loading, setLoading] = useState(false)
    const [emails, setEmails] = useState("")
    const [ccEmail, setCCEmail] = useState("")
    const { mutateAsync, isLoading } = trpc.employee.sendInvoiceEmail.useMutation();
    const checkEmailValidation = (emails) => {
        const receiverEmails = emails.trim().split(",").map((email) => email.trim());
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const isValid = receiverEmails.every((email) => emailRegex.test(email));

        return isValid;
    };
    const checkCCEmailValidation = (emails) => {
        if (!emails) return true
        const receiverEmails = emails.trim().split(",").map((email) => email.trim());
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const isValid = receiverEmails.every((email) => emailRegex.test(email));

        return isValid;
    };

    const generatePDF = async (type) => {
        setLoading(true);
        let dataCopy = { ...invoiceData };
        dataCopy.dateRange = dataCopy.dateRange.map((date) =>
            date ? dayjs(date).format("DD/MM/YYYY") : null
        );

        try {
            const res = await fetch("/api/generate-invoice", {
                method: "POST",
                body: JSON.stringify(dataCopy),
                headers: {
                    "Content-Type": "application/json",
                },
            });

            const blob = await res.blob();

            if (type === "download") {
                // Download logic
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.href = url;
                link.download = "invoice.pdf";
                link.click();
            } else {
               // Email logic
               if (!checkEmailValidation(emails)) {
                message.error("Invalid email address.");
                setLoading(false);
                return;
            }

               const recEmails = emails.trim().split(",").map((email) => email.trim());
               const ccEmails = ccEmail.trim().split(",").map((email) => email.trim());

               // Convert blob to Base64
               const base64 = await new Promise((resolve, reject) => {
                   const reader = new FileReader();
                   reader.onloadend = () => {
                       const result = reader.result;
                       const base64String = result.split(",")[1]; // Remove data:application/pdf;base64,
                       resolve(base64String);
                   };
                   reader.onerror = reject;
                   reader.readAsDataURL(blob);
               });

               await mutateAsync({
                   emails: recEmails,
                   pdfBase64: base64,
                   ccEmails: ccEmails,
               });

                message.success("Invoice sent successfully!");
            }
        } catch (error) {
            message.error("Something went wrong!");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };


    const handleParseItems = (text) => {
        const lines = text.trim().split("\n");
        if (lines.length < 2) return;
        const headers = lines[0].split("\t");
        console.log(headers)
        const dataRows = lines.slice(1);
        const dataArray = dataRows
            .map((row) => {
                const values = row.split("\t").map((v) => v.trim());
                if (values.every((v) => v === "")) return null;

            return {
                Ticket: values[0], // "Tickets"
                Hours: parseFloat(values[1]) || 0,
                Price: parseFloat(values[2]) || 0,
            };
            })
            .filter(Boolean);

        const subtotal = dataArray.reduce((sum, item) => sum + item.Price, 0);
        const total = subtotal - invoiceData.discount + invoiceData.tax;

        setInvoiceData((prev) => ({
            ...prev,
            items: dataArray,
            subtotal,
            total,
        }));
    };

    const handleInvoiceToParse = (text) => {
        const lines = text.trim().split("\n");
        setInvoiceData((prev) => ({
            ...prev,
            invoiceTo: lines,
        }));
    };

    const handleBillToParse = (text = "") => {
        if (!text) {
            setInvoiceData((prev) => ({
                ...prev,
                billTo: [],
            }));
            return
        };
        const lines = text.split('\n');

        const formattedLines = lines.map((line) => {
            const [key, value] = line.split(':');
            return { label: key ?? '', value: value ?? "" }
        });

        setInvoiceData((prev) => ({
            ...prev,
            billTo: formattedLines,
        }));
    };
    const handleDiscountChange = (e) => {
        const discount = parseFloat(e.target.value) || 0;
        const total = invoiceData.subtotal - discount + invoiceData.tax;

        setInvoiceData((prev) => ({
            ...prev,
            discount,
            total,
        }));
    };

    const handleTaxChange = (e) => {
        const tax = parseFloat(e.target.value) || 0;
        const total = invoiceData.subtotal - invoiceData.discount + tax;

        setInvoiceData((prev) => ({
            ...prev,
            tax,
            total,
        }));
    };

    const handleDateRangeChange = (dates) => {
        const invoiceNumber = `BF${Math.floor(1000 + Math.random() * 9000)}`;
        setInvoiceData((prev) => ({
            ...prev,
            dateRange: dates,
            invoiceNumber
        }));
    };

    const formatDate = (timestamp) => {
        const formattedDate = dayjs(timestamp).format("DD/MM/YYYY");
        return formattedDate ?? '';
    };
    const handleParseEmails = (str) => {
        console.log(str.trim().split(",").map((email) => email.trim()))
        setEmails(str)
    }
    return (
        <div>
            <div className='flex justify-between'>
            <h1 className="text-2xl font-bold mb-6">Client Invoice</h1>
                <div className='flex gap-4'>
                    <Button loading={loading && !isLoading} onClick={() => {
                        generatePDF("download")
                    }}
                    >
                        Download PDF </Button>
                    <Button type="primary" disabled={!checkEmailValidation(emails) || !checkCCEmailValidation(ccEmail)} loading={isLoading} onClick={generatePDF}>
                        Send invoice
                    </Button>
                </div>
            </div>
            <Layout hasSider>
                <Sider style={siderStyle} theme="light" width={400}>
                    <div className="demo-logo-vertical" />
                    <div>
                        <Row gutter={16} style={{ paddingBottom: 16 }}>
                            <Col span={24}>
                            </Col>
                        </Row>
                        <div className="p-6 bg-white border border-gray-200 rounded-lg mb-5">
                            <h2 className="text-lg font-semibold mb-4">Invoice to</h2>
                            <TextArea onChange={(e) => handleInvoiceToParse(e.target.value)} rows={4} />
                        </div>
                        <div className="p-6 bg-white border border-gray-200 rounded-lg mb-5">
                            <h2 className="text-lg font-semibold mb-4">Bill to</h2>
                            <TextArea
                                style={{ whiteSpace: "pre-wrap" }}
                                onChange={(e) => handleBillToParse(e.target.value)}
                                rows={4}
                            />

                        </div>
                        <div className="p-6 bg-white border border-gray-200 rounded-lg mb-5">
                            <h2 className="text-lg font-semibold mb-4">Table Items</h2>
                            <TextArea onChange={(e) => handleParseItems(e.target.value)} rows={4} />
                        </div>
                        <div className="p-6 bg-white border border-gray-200 rounded-lg mb-5">
                            <h2 className="text-lg font-semibold mb-4">Date Range</h2>
                            <RangePicker
                                style={{ width: '100%' }}
                                format="YYYY-MM-DD"
                                value={invoiceData.dateRange}
                                onChange={handleDateRangeChange}
                            />
                            <Row gutter={16} style={{ marginTop: 16 }}>
                                <Col span={12}>
                                    <p>Discount</p>
                                    <Input
                                        type="number"
                                        placeholder="Discount"
                                        value={invoiceData.discount}
                                        onChange={handleDiscountChange}
                                    />
                                </Col>
                                <Col span={12}>
                                    <p>Tax</p>
                                    <Input
                                        type="number"
                                        placeholder="Tax"
                                        value={invoiceData.tax}
                                        onChange={handleTaxChange}
                                    />
                                </Col>
                            </Row>
                            <p className='mt-2'>Receiver Emails coma sprated </p>
                            <Input
                                placeholder="Receiver Email"
                                value={emails}
                                onChange={(e) => handleParseEmails(e.target.value)}
                            />
                            <p className='mt-2'>CC Email </p>
                            <Input
                                placeholder="CC Email"
                                value={ccEmail}
                                onChange={(e) => setCCEmail(e.target.value)}
                            />
                        </div>
                    </div>
                </Sider>
                <Layout>
                    <Content style={{ overflow: 'initial' }}>
                        <>
                            <div id="invoice" className="w-[817px] mx-auto bg-white p-8 shadow-lg border border-gray-200">
                                {/* Header */}
                                <div className="flex justify-between items-start">
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
                                    <div className="text-right">
                                        <h2 className="text-2xl font-semibold">Invoice #{invoiceData.invoiceNumber}</h2>
                                        <p className="text-black">Date Issued: {formatDate(invoiceData.dateRange[0])}</p>
                                        <p className="text-black">Date Due: {formatDate(invoiceData.dateRange[1])}</p>
                                    </div>
                                </div>

                                {/* Invoice Details */}
                                <div className="grid grid-cols-2 gap-8 mt-8 px-[29.9px]">
                                    <div className='font-[14px]'>
                                        <h3 className="font-semibold mb-3">Invoice To:</h3>
                                        {invoiceData.invoiceTo.map((item, index) => (
                                            <p key={index} className="text-black leading-[18px]" >{item}</p>
                                        ))}
                                    </div>
                                    <div className='font-[14px]'>
                                        <h3 className="font-semibold mb-3">Bill To:</h3>
                                        {invoiceData.billTo.map((item, index) => (
                                            <p key={index} className='leading-[18px]' style={{ display: "flex", maxWidth: "400px" }}>
                                                <span style={{ minWidth: "120px" }}>{item.label}:</span>
                                                <span style={{ flexGrow: 1, textAlign: "left" }}>{item.value}</span>
                                            </p>
                                        ))}
                                    </div>

                                </div>

                                {/* Table */}
                                <table className="w-full mt-8 border border-gray-300 border-collapse">
                                    <thead>
                                        <tr className="border-b-[0.7px] border-[#E6E9EB] h-[40px] text-left font-semibold">
                                            <th className="px-6 py-3 w-[67%]">Ticket</th>
                                            <th className="px-6 py-3 w-[13.7%]">Hours</th>
                                            <th className="px-6 py-3 w-[19.2%]">Price</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {invoiceData.items.map((item, index) => (
                                            <tr key={index} className="border-b border-gray-300 h-[40px]">
                                                <td className="px-6 ">{item.Ticket}</td>
                                                <td className="px-6 ">{item.Hours}</td>
                                                <td className="px-6 ">${item.Price}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                {/* Summary */}
                                <div className="mt-6 flex justify-between">
                                    <div>
                                    </div>
                                    <div className="w-36">
                                        <p className="font-normal flex justify-between">Subtotal: <span className="font-semibold">${invoiceData.subtotal}</span></p>
                                        <p className="font-normal flex justify-between">Discount: <span className="font-semibold">${invoiceData.discount}</span></p>
                                        <p className="font-normal flex justify-between">Tax: <span className="font-semibold">${invoiceData.tax}</span></p>
                                        <div className="w-full border-t border-[#656565] opacity-20 my-4"></div>
                                        <p className="font-normal flex justify-between">Total: <span className="font-semibold">${invoiceData.total}</span></p>
                                    </div>
                                </div>
                                <div>
                                    <p className="font-poppins font-normal mt-[70px] text-[14px] leading-[15.7px] tracking-[0.07px]">
                                        <span className='font-bold'>Note:</span> This invoice is system generated and does not require any stamps.
                                    </p>
                                </div>
                                <div className="w-full border-t border-[#656565] opacity-20 my-4"></div>
                                <div className="flex space-x-4">
                                    <div className="flex-1">Business Centre, Sharjah Publishing City<br /> Free Zone, Sharjah, United Arab Emirates</div>
                                    <div className="flex-1">+971 58 549 2071<br />
                                        hello@bigfolio.co</div>
                                </div>
                            </div>
                        </>
                    </Content>
                </Layout>
            </Layout>
        </div>
    );
};

export default Invoice;