import { InvoiceData } from '@/app/types';

export function renderInvoice({ invoiceData }: { invoiceData: InvoiceData }) {
  const { invoiceNumber, dateIssued, dateDue, invoiceTo, billTo, items, salesperson, subtotal, discount, tax, total } = invoiceData;

  // Helper function to format date
  const formatDate = (timestamp?: Date) => {
    return timestamp ? new Date(timestamp).toLocaleDateString() : '';
  };

  return `
        <div class="container">
        <div class="header">
          <div class="logo">
            <img src="/bigfolio-logo.svg" alt="Bigfolio Logo" style="height: 30px;">
            <img src="/bigfolio-text.svg" alt="Bigfolio Text" style="height: 24px;">
          </div>
          <div class="invoice-details">
            <h2>Invoice #${invoiceNumber}</h2>
            <p>Date Issued: ${formatDate(dateIssued)}</p>
            <p>Date Due: ${formatDate(dateDue)}</p>
          </div>
        </div>

        <div class="details">
          <div>
            <h3>Invoice To:</h3>
            ${invoiceTo.map(item => `<p>${item.invoiceItem}</p>`).join('')}
          </div>
          <div>
            <h3>Bill To:</h3>
            ${billTo.map(item => `<p>${item.billToHeading}: ${item.billToValue}</p>`).join('')}
          </div>
        </div>

        <table class="table">
          <thead>
            <tr>
              <th>Ticket</th>
              <th>Hours</th>
              <th>Price</th>
            </tr>
          </thead>
          <tbody>
            ${items.map(item => `
              <tr>
                <td>${item.ticket}</td>
                <td>${item.hours}</td>
                <td>$${item.price}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="summary">
          <div>
            <p><strong>Salesperson:</strong> ${salesperson}</p>
            <p>Thanks for your business!</p>
          </div>
          <div>
            <p>Subtotal: <strong>$${subtotal}</strong></p>
            <p>Discount: <strong>$${discount}</strong></p>
            <p>Tax: <strong>$${tax}</strong></p>
            <hr style="margin: 10px 0; border: 0.5px solid #ddd;">
            <p>Total: <strong>$${total}</strong></p>
          </div>
        </div>

        <p class="note"><strong>Note:</strong> This invoice is system-generated and does not require any stamps.</p>

        <div class="footer">
          <div>
            Business Centre, Sharjah Publishing City Free Zone, Sharjah, UAE
          </div>
          <div>
            +971 58 549 2071<br>
            <a href="mailto:hello@bigfolio.co">hello@bigfolio.co</a>
          </div>
        </div>
      </div>
    `;
}
