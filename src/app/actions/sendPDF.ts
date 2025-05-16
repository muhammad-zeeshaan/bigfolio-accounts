"use server"
import { Employee, HistoryDTOWITHOUTID } from '../types/index';
import puppeteer from 'puppeteer';
import { ObjectId } from "mongodb";
import User from '@/models/User';
import transporter from '@/utils/mailer';
import SlipTemplate from '@/Components/SlipTemplate';
import History from '@/models/History';
import { SendInvoiceRequestType, SendSalarySlipRequest } from '../validations/userSchema';
import InvoiceTemplate from '@/Components/InvoiceTemplate';
import { generateInvoiceHTML } from '../lib/generateInvoiceHTML';
import { dataImg, logoTextImg } from '../../../public/pdfImg';

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
export async function SendInvoice(req: SendInvoiceRequestType): Promise<{ message: string; error?: string }> {
    const { email, invoiceData } = req;

    if (!invoiceData) {
        return { message: 'Invoice not found' };
    }

    try {
        const html = InvoiceTemplate({ invoiceData: { ...invoiceData, items: invoiceData.items.map(item => ({ Ticket: item.ticket, Hours: item.hours, Price: item.price })) } });
        const pdfBuffer = await generatePDF(html);

        const mailOptions: MailOptions = {
            from: process.env.EMAIL || '',
            to: email,
            subject: 'Invoice',
            text: 'Please find your invoice attached.',
            attachments: [
                {
                    filename: 'Invoice.pdf',
                    content: pdfBuffer,
                    contentType: 'application/pdf',
                },
            ],
        };

        await transporter.sendMail(mailOptions);

        return { message: 'Invoice sent successfully' };
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        return { message: 'Internal server error', error: errorMessage };
    }
}

export const sendInvoiceEmail = async (emails: string[],
    pdfBase64: string,
    ccEmails?: string[]) => {
    try {
        // Convert Base64 string to a buffer
        const pdfBuffer = Buffer.from(pdfBase64.split(',')[1], 'base64');

        // Email options
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: emails.join(','),
            cc: ccEmails && ccEmails.length > 0 ? ccEmails.join(',') : undefined,
            subject: 'Your Invoice',
            text: 'Please find your invoice attached.',
            attachments: [
                {
                    filename: 'invoice.pdf',
                    content: pdfBuffer,
                    contentType: 'application/pdf',
                },
            ],
        };

        await transporter.sendMail(mailOptions);

        return { success: true, message: 'Email sent successfully!' };
    } catch (error) {
        console.error('Error sending email:', error);
        throw new Error('Failed to send email.');
    }
};


export async function generatePDFinvoice(input: any) {
    const html = generateInvoiceHTML(input.invoiceData);
    console.log(input)
    // Extracted and styled header matching the original HTML
    const headerTemplate = `
    <div style="width: 100%; font-family: Arial, sans-serif; font-size: 10px; padding: 0 32px 0; box-sizing: border-box; display: flex; justify-content: space-between; align-items: center;">
      <div style="display: flex; align-items: center; gap: 8px;">
        <img src=${dataImg} style="width: 22px; height: 30px;" />
        <img src=${logoTextImg} style="width: 83px; height: 25px;" />
        <p style="font-size: 8px; color: #656565; margin: 0;">FZE LLC</p>
      </div>
      <div style="text-align: right;">
        <h2 style="margin: 0; font-size: 24px; font-weight: 600;">Invoice #${input.invoiceData.invoiceNumber}</h2>
        <p style="margin: 2px 0; font-size: 14px;">Date Issued: ${input.invoiceData.dateRange[0]}</p>
        <p style="margin: 2px 0; font-size: 14px;">Date Due: ${input.invoiceData.dateRange[1]}</p>
      </div>
    </div>
  `;

    // Extracted and styled footer matching the original HTML
    const footerTemplate = `
    <div style="width: 100%; font-family: Arial, sans-serif; padding: 0 32px; box-sizing: border-box;">
      <div style="font-size: 14px; margin-bottom: 6px;">
        <strong style=" font-weight: bold;">Note:</strong> This invoice is system-generated and does not require a signature or official stamp.
      </div>
      <div style="width: 100%; border-top: 1px solid #656565; opacity: 0.2; margin: 10px 0;"></div>
      <div style="display: flex; justify-content: space-between; font-size: 14px; gap: 32px;">
        <div>
          Business Centre, Sharjah Publishing City<br />
          Free Zone, Sharjah, United Arab Emirates
        </div>
        <div style="text-align: right; font-size: 14px;">
          +1 435-328-2694<br />
          hello@bigfolio.co
        </div>
      </div>
    </div>
  `;

    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });

    const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        displayHeaderFooter: true,
        headerTemplate,
        footerTemplate,
        margin: {
            top: '100px', // Adequate space for header
            bottom: '100px', // Adequate space for footer
            // left: '40px',
            // right: '40px'
        }
    });

    await browser.close();

    const base64PDF = Buffer.from(pdfBuffer).toString('base64');
    return { pdfBase64: base64PDF };
}

