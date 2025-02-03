"use server"
import { Employee, HistoryDTOWITHOUTID } from '../types/index';
import puppeteer from 'puppeteer';
import { ObjectId } from "mongodb";
import User from '@/models/User';
import transporter from '@/utils/mailer';
import SlipTemplate from '@/Components/SlipTemplate';
import React from 'react';
import History from '@/models/History';
import { SendSalarySlipRequest } from '../validations/userSchema';

async function generatePDF(html: string): Promise<Buffer> {
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });
    await browser.close();
    return Buffer.from(pdfBuffer);
}

interface MailOptions {
    from: string;
    to: string;
    subject: string;
    text: string;
    attachments: {
        filename: string;
        content: Buffer;
        contentType: string;
    }[];
}

export async function SendSalarySlip(req: SendSalarySlipRequest): Promise<{ message: string; error?: string }> {
    const { employeeIds } = req;

    if (!employeeIds.length) {
        return {
            message: 'Missing required parameters',
        };
    }

    const objectIds = employeeIds.map((id: unknown) => new ObjectId(id as string));
    const query = { _id: { $in: objectIds } };
    const employees = await User.find(query).lean<Employee[]>();

    try {
        for (const employeeDetails of employees) {
            const html = SlipTemplate({ employeeDetails } as { employeeDetails: Employee });
            const pdfBuffer = await generatePDF(html);

            const mailOptions: MailOptions = {
                from: process.env.EMAIL || '',
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

            const history: HistoryDTOWITHOUTID = {
                ...employeeDetails,
                user: employeeDetails?._id ?? '',
                dispatchDate: new Date(),
            };
            delete history._id;
            try {
                await History.create(history);
            } catch (historyError) {
                console.error('Error creating history:', historyError);
            }

            await transporter.sendMail(mailOptions);
        }

        return { message: 'Emails sent successfully' };
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        return { message: 'Internal server error', error: errorMessage };
    }
}
