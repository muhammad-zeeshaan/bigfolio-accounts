import { generateInvoiceHTML } from '@/app/lib/generateInvoiceHTML';
import { NextRequest, NextResponse } from 'next/server';
import puppeteer from 'puppeteer';

export async function POST(req: NextRequest) {
    const invoiceData = await req.json();

    const html = generateInvoiceHTML(invoiceData);

    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });

    const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
    });

    await browser.close();

    return new NextResponse(pdfBuffer, {
        status: 200,
        headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': 'attachment; filename=invoice.pdf',
        },
    });
}
