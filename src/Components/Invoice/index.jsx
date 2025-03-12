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

    const { mutate, isLoading } = trpc.employee.sendInvoice.useMutation();

    const handleParseItems = (text) => {
        const lines = text.trim().split("\n");

        if (lines.length < 2) return;

        const headers = lines[0].split("\t");
        console.log(headers)
        const dataRows = lines.slice(1);

        const dataArray = dataRows.map((row) => {
            const values = row.split("\t");
            return {
                Ticket: values[0], // "Tickets"
                Hours: parseFloat(values[1]), // "Hours" (convert to number)
                Price: parseFloat(values[2]), // "Amount" (convert to number)
            };
        });

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

    const handleBillToParse = (text) => {
        const lines = text.trim().split("\n");
        setInvoiceData((prev) => ({
            ...prev,
            billTo: lines,
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
        setInvoiceData((prev) => ({
            ...prev,
            dateRange: dates,
        }));
    };

    const handleFormSubmit = () => {
        const invoiceNumber = `BF${Math.floor(1000 + Math.random() * 9000)}`;
        const updatedInvoiceData = {
            ...invoiceData,
            invoiceNumber,
        };

        setInvoiceData(updatedInvoiceData);
        localStorage.setItem("invoiceData", JSON.stringify(updatedInvoiceData));

        message.success("Invoice item added successfully!");
    };

    const formatDate = (timestamp) => {
        const formattedDate = dayjs(timestamp).format("DD/MM/YYYY");
        return formattedDate ?? '';
    };

    return (
        <div>
            <Button className='!hidden' loading={isLoading} onClick={() => {
                mutate({ email: 'asad@bigfolio.co', invoiceData });
            }}>Send invoice</Button>
            <h1 className="text-2xl font-bold mb-6">Client Invoice</h1>
            <Layout hasSider>
                <Sider style={siderStyle} theme="light" width={400}>
                    <div className="demo-logo-vertical" />
                    <div>
                        {/* Items Section */}
                        <Row gutter={16} style={{ paddingBottom: 16 }}>
                            <Col span={24}>
                                <Button type="primary" onClick={handleFormSubmit} block>
                                    Add to Invoice
                                </Button>
                            </Col>
                        </Row>
                        <div className="p-6 bg-white border border-gray-200 rounded-lg mb-5">
                            <h2 className="text-lg font-semibold mb-4">Table Items</h2>
                            <TextArea onChange={(e) => handleParseItems(e.target.value)} rows={4} />
                        </div>

                        {/* Invoice To Section */}
                        <div className="p-6 bg-white border border-gray-200 rounded-lg mb-5">
                            <h2 className="text-lg font-semibold mb-4">Invoice to details</h2>
                            <TextArea onChange={(e) => handleInvoiceToParse(e.target.value)} rows={4} />
                        </div>

                        {/* Bill To Section */}
                        <div className="p-6 bg-white border border-gray-200 rounded-lg mb-5">
                            <h2 className="text-lg font-semibold mb-4">Bill to details</h2>
                            <TextArea
                                style={{ whiteSpace: "pre-wrap" }}
                                onChange={(e) => handleBillToParse(e.target.value)}
                                rows={4}
                            />

                        </div>

                        {/* Date Range and Salesperson Section */}
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
                            <Input
                                placeholder="Receiver Email"
                                style={{ marginTop: 16 }}
                            />
                        </div>
                    </div>
                </Sider>
                <Layout>
                    <Content style={{ overflow: 'initial' }}>
                        <>
                            <div className="w-[631px] mx-auto bg-white p-8 shadow-lg border border-gray-200">
                                {/* Header */}
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-x-[5px]">
                                        <img src="/public/Bigfolio-logo.svg" alt="Bigfolio Logo" className="w-[22px] h-[30px]" />
                                        <img src="/public/bigfolio-text.svg" alt="Bigfolio Logo" className="w-[83.37px] h-[24.58px]" />
                                    </div>
                                    <div className="text-right">
                                        <h2 className="text-2xl font-semibold">Invoice #{invoiceData.invoiceNumber}</h2>
                                        <p className="text-black">Date Issued: {formatDate(invoiceData.dateRange[0])}</p>
                                        <p className="text-black">Date Due: {formatDate(invoiceData.dateRange[1])}</p>
                                    </div>
                                </div>

                                {/* Invoice Details */}
                                <div className="grid grid-cols-2 gap-8 mt-8 px-[29.9px]">
                                    <div>
                                        <h3 className="font-semibold">Invoice To:</h3>
                                        {invoiceData.invoiceTo.map((item, index) => (
                                            <p key={index} className="text-black">{item}</p>
                                        ))}
                                    </div>
                                    <div>
                                        <h3 className="font-semibold">Bill To:</h3>
                                        {invoiceData.billTo.map((item, index) => (
                                            <p key={index} dangerouslySetInnerHTML={{ __html: item.replace(/ /g, "&nbsp;") }} />
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
                                                <td className="px-6 py-3">{item.Ticket}</td>
                                                <td className="px-6 py-3">{item.Hours}</td>
                                                <td className="px-6 py-3">${item.Price}</td>
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