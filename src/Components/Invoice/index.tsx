"use client";

import React, { useState } from "react";
import { Button, Input, Form, Row, Col, message, DatePicker, Layout } from "antd";
import dayjs from "dayjs";
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { InvoiceData, InvoiceItem } from '@/app/types';
import { trpc } from '@/utils/trpcClient';
const { Content, Sider } = Layout;
const { RangePicker } = DatePicker;

const siderStyle: React.CSSProperties = {
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

const Invoice: React.FC = () => {
    const [form] = Form.useForm<InvoiceData>();
    const [invoiceData, setInvoiceData] = useState<InvoiceData>({
        invoiceNumber: "",
        customerName: "Thomas Shelby",
        items: [],
        subtotal: 0,
        discount: 0,
        tax: 0,
        total: 0,
        salesperson: "Tommy Shelby",
        invoiceTo: [],
        billTo: []
    });
    const { mutate, isLoading } = trpc.employee.sendInvoice.useMutation()
    const handleFormSubmit = (values: InvoiceData) => {
        const newItem = values.items.map((item: InvoiceItem) => ({
            ticket: item.ticket,
            hours: item.hours,
            price: item.price,
        }));
        const invoiceNumber = `BF${Math.floor(1000 + Math.random() * 9000)}`;
        const updatedItems = [...newItem];
        const subtotal = updatedItems.reduce((sum, item) => sum + item.hours * item.price, 0);
        const total = subtotal - Number(values.discount) + Number(values.tax);
        const invoiceTo = values?.invoiceTo ?? [];
        const billTo = values?.billTo ?? [];
        const [dateIssued, dateDue] = values.dateRange || [null, null];

        const updatedInvoiceData = {
            ...invoiceData,
            items: updatedItems,
            dateIssued: dateIssued ? dayjs(dateIssued).toDate() : undefined,
            dateDue: dateDue ? dayjs(dateDue).toDate() : undefined,
            subtotal,
            total,
            invoiceTo,
            billTo,
            invoiceNumber,
            salesperson: values.salesperson,
            tax: values.tax ? values.tax : 0,
            discount: values.discount ? values.discount : 0
        };

        setInvoiceData(updatedInvoiceData);
        localStorage.setItem("invoiceData", JSON.stringify(updatedInvoiceData));

        form.resetFields();
        message.success("Invoice item added successfully!");
    };

    const handleAutoFill = () => {
        const savedData = localStorage.getItem("invoiceData");
        if (savedData) {

            const parsedData = JSON.parse(savedData);
            form.setFieldsValue({
                items: parsedData.items.length ? parsedData.items as InvoiceItem[] : undefined,
                dateRange: parsedData.dateIssued && parsedData.dateDue ? [
                    dayjs(parsedData.dateIssued), // Convert to dayjs object
                    dayjs(parsedData.dateDue) // Convert to dayjs object
                ] : undefined,
                salesperson: parsedData.salesperson,
                invoiceTo: parsedData.invoiceTo.length ? parsedData.invoiceTo : undefined,
                billTo: parsedData.billTo.length ? parsedData.billTo : undefined,
                discount: Number(parsedData.discount),
                tax: parsedData.tax
            });
            message.success("Form auto-filled successfully!");
        } else {
            message.warning("No saved data found in local storage.");
        }
    };

    const formatDate = (timestamp: Date | undefined) => {
        const formattedDate = dayjs(timestamp).format("DD/MM/YYYY");
        return formattedDate ?? '';
    };
    console.log({ invoiceData })
    return (
        <div>
            <Button loading={isLoading} onClick={() => {
                mutate({ email: 'asad@bigfolio.co', invoiceData })
            }}>Send invoice</Button>
            <h1 className="text-2xl font-bold mb-6">Client Invoice</h1>
            <Layout hasSider>
                <Sider style={siderStyle} theme="light" width={400}>
                    <div className="demo-logo-vertical" />
                    <Form form={form} onFinish={handleFormSubmit} layout="vertical">
                        {/* Items Section */}
                        <Row gutter={16} style={{ paddingBottom: 16 }}>
                            <Col span={12}>
                                <Button
                                    type="primary"
                                    onClick={handleAutoFill}
                                    block
                                    style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
                                >
                                    Auto Fill
                                </Button>
                            </Col>
                            <Col span={12}>
                                <Button type="primary" htmlType="submit" block>
                                    Add to Invoice
                                </Button>
                            </Col>
                        </Row>
                        <div className="p-6 bg-white border border-gray-200 rounded-lg mb-5">
                            <h2 className="text-lg font-semibold mb-4">Table Items</h2>
                            <Form.List name="items">
                                {(fields, { add, remove }) => (
                                    <>
                                        {fields.map(({ key, name, ...restField }) => (
                                            <Row key={key} gutter={16} className='flex items-center' style={{ marginBottom: 16 }}>
                                                <Col span={8}>
                                                    <Form.Item
                                                        {...restField}
                                                        name={[name, 'ticket']}
                                                        label="Ticket"
                                                        rules={[{ required: true, message: 'Please enter a ticket name' }]}
                                                    >
                                                        <Input placeholder="e.g., Project X" />
                                                    </Form.Item>
                                                </Col>
                                                <Col span={7}>
                                                    <Form.Item
                                                        {...restField}
                                                        name={[name, 'hours']}
                                                        label="Hours"
                                                        rules={[{ required: true, message: 'Please enter hours worked' }]}
                                                    >
                                                        <Input type="number" placeholder="e.g., 10" min={0} />
                                                    </Form.Item>
                                                </Col>
                                                <Col span={7}>
                                                    <Form.Item
                                                        {...restField}
                                                        name={[name, 'price']}
                                                        label="Price"
                                                        rules={[{ required: true, message: 'Please enter the price' }]}
                                                    >
                                                        <Input type="number" placeholder="e.g., 100" min={0} />
                                                    </Form.Item>
                                                </Col>
                                                <Col span={1}>
                                                    <Button
                                                        danger
                                                        onClick={() => remove(name)}
                                                        icon={<DeleteOutlined />}
                                                        shape="circle"
                                                    />
                                                </Col>
                                            </Row>
                                        ))}
                                        <Form.Item>
                                            <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                                                Add Item
                                            </Button>
                                        </Form.Item>
                                    </>
                                )}
                            </Form.List>
                        </div>

                        {/* Invoice To Section */}
                        <div className="p-6 bg-white border border-gray-200 rounded-lg mb-5">
                            <h2 className="text-lg font-semibold mb-4">Invoice to details</h2>
                            <Form.List name="invoiceTo">
                                {(fields, { add, remove }) => (
                                    <>
                                        {fields.map(({ key, name, ...restField }) => (
                                            <Row key={key} gutter={16} style={{ marginBottom: 16 }}>
                                                <Col span={22}>
                                                    <Form.Item
                                                        {...restField}
                                                        name={[name, 'invoiceItem']}
                                                        rules={[{ required: true, message: 'Please enter an invoice item' }]}
                                                    >
                                                        <Input placeholder="e.g., Client Name or Company" />
                                                    </Form.Item>
                                                </Col>
                                                <Col span={2}>
                                                    <Button
                                                        danger
                                                        onClick={() => remove(name)}
                                                        icon={<DeleteOutlined />}
                                                        shape="circle"
                                                    />
                                                </Col>
                                            </Row>
                                        ))}
                                        <Form.Item>
                                            <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                                                Add Invoice To
                                            </Button>
                                        </Form.Item>
                                    </>
                                )}
                            </Form.List>
                        </div>

                        {/* Bill To Section */}
                        <div className="p-6 bg-white border border-gray-200 rounded-lg mb-5">
                            <h2 className="text-lg font-semibold mb-4">Bill to details</h2>
                            <Form.List name="billTo">
                                {(fields, { add, remove }) => (
                                    <>
                                        {fields.map(({ key, name, ...restField }) => (
                                            <Row key={key} gutter={16} style={{ marginBottom: 16 }}>
                                                <Col span={11}>
                                                    <Form.Item
                                                        {...restField}
                                                        name={[name, 'billToHeading']}
                                                        rules={[{ required: true, message: 'Please enter a heading' }]}
                                                    >
                                                        <Input placeholder="e.g., Address, Email" />
                                                    </Form.Item>
                                                </Col>
                                                <Col span={11}>
                                                    <Form.Item
                                                        {...restField}
                                                        name={[name, 'billToValue']}
                                                        rules={[{ required: true, message: 'Please enter a value' }]}
                                                    >
                                                        <Input placeholder="e.g., 123 Main St, john@example.com" />
                                                    </Form.Item>
                                                </Col>
                                                <Col span={2}>
                                                    <Button
                                                        danger
                                                        onClick={() => remove(name)}
                                                        icon={<DeleteOutlined />}
                                                        shape="circle"
                                                    />
                                                </Col>
                                            </Row>
                                        ))}
                                        <Form.Item>
                                            <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                                                Add Bill To
                                            </Button>
                                        </Form.Item>
                                    </>
                                )}
                            </Form.List>
                        </div>

                        {/* Date Range and Salesperson Section */}
                        <div className="p-6 bg-white border border-gray-200 rounded-lg mb-5">
                            <h2 className="text-lg font-semibold mb-4">Date Range</h2>
                            <Form.Item
                                label="Date Range"
                                name="dateRange"
                                rules={[{ required: true, message: 'Please select the date range' }]}
                            >
                                <RangePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
                            </Form.Item>
                            <Form.Item label="Salesperson" name="salesperson">
                                <Input placeholder="e.g., John Doe" />
                            </Form.Item>
                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item label="Discount" name="discount">
                                        <Input type='number' placeholder="discount" />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item label="Tax" name="tax">
                                        <Input type='number' placeholder="tax" />
                                    </Form.Item>
                                </Col>
                            </Row>
                            <Form.Item label="Receiver Email" name="email">
                                <Input placeholder="Receiver Email...." />
                            </Form.Item>
                        </div>

                        {/* Actions Section */}

                    </Form>
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
                                        <p className="text-black">Date Issued: {formatDate(invoiceData?.dateIssued)}</p>
                                        <p className="text-black">Date Due: {formatDate(invoiceData?.dateDue)}</p>
                                    </div>
                                </div>

                                {/* Invoice Details */}
                                <div className="grid grid-cols-2 gap-8 mt-8 px-[29.9px]">
                                    <div>
                                        <h3 className="font-semibold">Invoice To:</h3>
                                        {invoiceData?.invoiceTo?.map((item, index) => (
                                            <p key={index} className="text-black">{item?.invoiceItem}</p>
                                        ))}
                                    </div>
                                    <div>
                                        <h3 className="font-semibold">Bill To:</h3>
                                        {invoiceData?.billTo?.map((item, index) => (
                                            <p className="text-black" key={index}>{item?.billToHeading}: {item?.billToValue}</p>
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
                                                <td className="px-6 py-3">{item.ticket}</td>
                                                <td className="px-6 py-3">{item.hours}</td>
                                                <td className="px-6 py-3">${item.price}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                {/* Summary */}
                                <div className="mt-6 flex justify-between">
                                    <div>
                                        <p className="font-semibold">Salesperson: <span className="font-normal">{invoiceData.salesperson}</span></p>
                                        <p >Thanks for your business</p>
                                    </div>
                                    <div className="w-36">
                                        <p className="font-normal flex justify-between ">Subtotal: <span className="font-semibold">${invoiceData.subtotal}</span></p>
                                        <p className="font-normal flex justify-between">Discount: <span className="font-semibold">${invoiceData.discount}</span></p>
                                        <p className="font-normal flex justify-between">Tax: <span className="font-semibold">${invoiceData.tax}</span></p>
                                        <div className="w-full border-t border-[#656565] opacity-20 my-4"></div>
                                        <p className="font-normal flex justify-between">Total: <span className="font-semibold">${invoiceData.total}</span></p>
                                    </div>
                                </div>
                                <div>
                                    <p className="font-poppins font-normal mt-[70px] text-[14px] leading-[15.7px] tracking-[0.07px]">
                                        <span className='font-bold'>Note:</span> This invoice is system generated and does not requires any stamps.
                                    </p>
                                </div>
                                <div className="w-full border-t border-[#656565] opacity-20 my-4"></div>
                                <div className="flex space-x-4">
                                    <div className="flex-1">Business Centre,Sharjah Publishing City<br /> Free Zone, Sharjah, United Arab Emirates</div>
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