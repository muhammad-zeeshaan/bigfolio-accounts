"use server"
import { Employee, HistoryDTO } from './../../types/index';
import puppeteer from 'puppeteer';
import { ObjectId } from "mongodb";
import User from '@/models/User';
import transporter from '@/utils/mailer';
import SlipTemplate from '@/Components/SlipTemplate';
import React from 'react';
import History from '@/models/History';

async function generatePDF(html: string) {
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });
    await browser.close();
    return pdfBuffer;
}

export async function SendSalarySlip(req: { employeeIds: React.Key[] }) {
    const { employeeIds } = req;
    if (!employeeIds.length) {
        return {
            message: 'Missing required parameters'
        };
    }
    const objectIds = employeeIds.map((id: React.Key) => new ObjectId(id as string));
    const query = { _id: { $in: objectIds } };
    const employees = await User.find(query).lean<Employee[]>();
    try {
        for (const employeeDetails of employees) {
            const html = SlipTemplate({ employeeDetails } as { employeeDetails: Employee })
            const pdfBuffer = await generatePDF(html);
            const mailOptions = {
                from: 'dev.superu@gmail.com',
                to: employeeDetails.email,
                subject: 'Salary Slip',
                text: 'Please find your salary slip attached.',
                attachments: [
                    {
                        filename: 'SalarySlip.pdf',
                        content: pdfBuffer,
                        contentType: 'application/pdf',
                    },
                ],
            };
            const history: HistoryDTO = { ...employeeDetails, user: employeeDetails?._id, dispatchDate: new Date(), }
            delete history._id;
            try {
                const dev = await History.create(history);
            } catch (historyError) {
                console.error('Error creating history:', historyError);
            }
            await transporter.sendMail(mailOptions as any);
        }
        return ({ message: 'Emails sent successfully' });
    } catch (error: any) {
        return { message: 'Internal server error', error: error.message }
    }
}

