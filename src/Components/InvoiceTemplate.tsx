import { InvoiceData } from "@/app/types";
import { renderInvoice } from "./invoicePDF";

export default function InvoiceTemplate({ invoiceData }: { invoiceData: InvoiceData }) {
  return `
   <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; color: #000; margin: 0; padding: 0; background: #fff; }
          .container { width: 631px; margin: auto; background: white; padding: 20px; border: 1px solid #ccc; }
          .header { display: flex; justify-content: space-between; align-items: center; }
          .logo { display: flex; align-items: center; gap: 5px; }
          .invoice-details { text-align: right; }
          .invoice-details h2 { margin: 0; font-size: 20px; }
          .details { display: flex; justify-content: space-between; margin-top: 20px; }
          .table { width: 100%; margin-top: 20px; border-spacing: 0; border: 1px solid #ddd; }
          .table th, .table td { border: 1px solid #ddd; padding: 12px; text-align: left; }
          .table th { background: #f8f8f8; font-weight: bold; padding: 15px; }
          .table tr:nth-child(even) { background: #f9f9f9; }
          .table td { font-size: 14px; }
          .summary { display: flex; justify-content: space-between; margin-top: 20px; font-size: 14px; }
          .note { margin-top: 40px; font-size: 12px; }
          .footer { margin-top: 40px; display: flex; justify-content: space-between; font-size: 12px; color: #555; }
        </style>
      </head>
      <body>
        ${renderInvoice({ invoiceData })}
      </body>
    </html>
  `;
}
