import { dataImg, logoTextImg } from '../../../public/pdfImg';

export function generateInvoiceHTML(invoiceData) {
  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <style>
          * {
            box-sizing: border-box;
          }
          html, body {
            height: 100%;
            margin: 0;
            padding: 0;
          }
          body {
            display: flex;
            flex-direction: column;
            font-family: Arial, sans-serif;
            background: white;
            font-size: 14px;
          }
          .invoice-container {
            flex: 1;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            width: 782px;
            margin: 0 auto;
            background: #fff;
            padding: 32px;
          }
          .header {
          
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
          }
          .logo-area {
            display: flex;
            align-items: center;
            gap: 8px;
          }
          .logo-area img:first-child {
            width: 22px;
            height: 30px;
          }
          .logo-area img:nth-child(2) {
            width: 83px;
            height: 25px;
          }
          .logo-area p {
            font-size: 8px;
            color: #656565;
            margin: 0;
          }
          .invoice-details {
            text-align: right;
          }
          .invoice-details h2 {
            margin: 0;
            font-size: 24px;
            font-weight: 600;
          }
          .invoice-details p {
            margin: 2px 0;
          }
          .info-section {
            display: flex;
            justify-content: space-between;
            margin-top: 32px;
          }
          .info-box {
            width: 48%;
          }
          .info-box h3 {
            font-size: 14px;
            margin-bottom: 12px;
            font-weight: 600;
          }
          .info-box p {
            margin: 4px 0;
          }
          table {
            width: 100%;
            margin-top: 32px;
            border-collapse: collapse;
            border: 1px solid #E6E9EB;
          }
          thead tr {
            text-align: left;
            height: 40px;
            border-bottom: 1px solid #E6E9EB;
            font-weight: 600;
          }
          tbody tr {
            height: 40px;
            border-bottom: 1px solid #E6E9EB;
          }
          th, td {
            padding: 12px 24px;
          }
          .summary {
            margin-top: 32px;
            width: 100%;
            display: flex;
            justify-content: flex-end;
          }
          .summary-box {
            width: 220px;
          }
          .summary-box p {
            display: flex;
            justify-content: space-between;
            margin: 6px 0;
          }
          .divider {
            width: 100%;
            border-top: 1px solid #656565;
            opacity: 0.2;
            margin: 1rem 0;
          }
          .summary-box hr {
            border: none;
            border-top: 1px solid #ccc;
            margin: 16px 0;
          }
          .footer-section {
            margin-top: auto;
          }
          .note {
            margin-top: 40px;
            font-size: 14px;
          }
          .note strong {
            font-weight: bold;
          }
          .footer {
            display: flex;
            justify-content: space-between;
            margin-top: auto;
          }
            .bill-line {
  display: flex;
  max-width: 400px;
  line-height: 18px;
  margin: 0;
}
.bill-label {
  min-width: 120px;
}
.bill-value {
  flex-grow: 1;
  text-align: left;
}

        </style>
      </head>
      <body>
        <div class="invoice-container">
          <div class="header">
            <div class="logo-area">
              <img src=${dataImg} alt="Logo" />
              <img src=${logoTextImg} alt="Text Logo" />
              <p>FZE LLC</p>
            </div>
            <div class="invoice-details">
              <h2>Invoice #${invoiceData.invoiceNumber}</h2>
              <p>Date Issued: ${invoiceData.dateRange[0]}</p>
              <p>Date Due: ${invoiceData.dateRange[1]}</p>
            </div>
          </div>

          <div class="info-section">
            <div class="info-box">
              <h3>Invoice To:</h3>
              ${invoiceData.invoiceTo.map((item) => `<p>${item}</p>`).join('')}
            </div>
            <div class="info-box">
              <h3>Bill To:</h3>
             ${invoiceData.billTo
      .map(
        (item) =>
          `<p class="bill-line"><span class="bill-label">${item.label}:</span><span class="bill-value">${item.value}</span></p>`
      )
      .join('')}
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Ticket</th>
                <th>Hours</th>
                <th>Price</th>
              </tr>
            </thead>
            <tbody>
              ${invoiceData.items
      .map(
        (item) =>
          `<tr><td>${item.Ticket}</td><td>${item.Hours}</td><td>$${item.Price}</td></tr>`
      )
      .join('')}
            </tbody>
          </table>

          <div class="summary">
            <div class="summary-box">
              <p>Subtotal: <strong>$${invoiceData.subtotal}</strong></p>
              <p>Discount: <strong>$${invoiceData.discount}</strong></p>
              <p>Tax: <strong>$${invoiceData.tax}</strong></p>
              <hr />
              <p>Total: <strong>$${invoiceData.total}</strong></p>
            </div>
          </div>

          <div class="footer-section">
            <div class="note">
              <strong>Note:</strong> This invoice is system generated and does not require any stamps.
            </div>
            <div class="divider"></div>
            <div class="footer">
              <div>
                Business Centre, Sharjah Publishing City<br />
                Free Zone, Sharjah, United Arab Emirates
              </div>
              <div>
                +971 58 549 2071<br />
                hello@bigfolio.co
              </div>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;
}