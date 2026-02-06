import { formatDateToEuropean } from '../utils/dateFormatter';

/**
 * Generate a provider order HTML document (A4-print optimized)
 * @param {Object} order - The provider order object
 * @returns {string} HTML content for the order
 */
export const generateProviderOrderHTML = (order) => {
  if (!order?.items || order.items.length === 0) {
    throw new Error('No items in this order to print');
  }

  const printedAt = new Date();
  const day = String(printedAt.getDate()).padStart(2, '0');
  const month = String(printedAt.getMonth() + 1).padStart(2, '0');
  const year = printedAt.getFullYear();
  const formattedPrintedDate = `${day}/${month}/${year}`;

  let rowsHtml = '';
  let totalItems = 0;
  order.items.forEach((item, index) => {
    const categoryName = item.adminItem?.category?.name || 'Uncategorized';
    totalItems++;
    rowsHtml += `
      <tr>
        <td class="col-num">${index + 1}</td>
        <td class="col-code">${escapeHtml(item.productCode || '-')}</td>
        <td class="col-name">${escapeHtml(item.itemName)}</td>
        <td class="col-cat">${escapeHtml(categoryName)}</td>
        <td class="col-qty">${escapeHtml(String(item.quantity))}</td>
        <td class="col-unit">${escapeHtml(item.unit)}</td>
        <td class="col-price">₺${(item.pricePerUnit || 0).toFixed(2)}</td>
        <td class="col-total">₺${(item.totalPrice || 0).toFixed(2)}</td>
      </tr>
    `;
  });

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Purchase Order #${escapeHtml(String(order.id))} - ${escapeHtml(order.provider?.name || 'Unknown')}</title>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <style>
    @page {
      size: A4;
      margin: 15mm;
    }

    * { box-sizing: border-box; }
    html, body {
      margin: 0;
      padding: 0;
      color: #111;
      background: #fff;
      font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display",
                   "Segoe UI", Roboto, Arial, sans-serif;
      font-size: 11px;
      line-height: 1.4;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    .sheet {
      width: 100%;
      max-width: 210mm;
      margin: 0 auto;
    }

    /* Header */
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding-bottom: 15px;
      border-bottom: 3px solid #137fec;
      margin-bottom: 20px;
    }

    .logo {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .logo-icon {
      font-size: 32px;
    }

    .logo-text {
      font-size: 24px;
      font-weight: 800;
      color: #137fec;
    }

    .order-info {
      text-align: right;
    }

    .order-title {
      font-size: 22px;
      font-weight: 800;
      color: #111;
      margin-bottom: 5px;
    }

    .order-id {
      font-size: 14px;
      color: #555;
    }

    /* Meta Grid */
    .meta {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-bottom: 25px;
    }

    .meta-box {
      padding: 15px;
      background: #f7f7f7;
      border-radius: 8px;
      border: 1px solid #e6e6e6;
    }

    .meta-title {
      font-size: 10px;
      color: #666;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 8px;
      font-weight: 700;
    }

    .meta-content {
      font-size: 13px;
      font-weight: 600;
      color: #111;
    }

    .meta-sub {
      font-size: 11px;
      color: #555;
      margin-top: 4px;
    }

    /* Summary Bar */
    .summary-bar {
      display: flex;
      justify-content: space-between;
      padding: 12px 20px;
      background: #137fec;
      color: white;
      border-radius: 8px;
      margin-bottom: 15px;
    }

    .summary-item {
      text-align: center;
    }

    .summary-label {
      font-size: 9px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      opacity: 0.9;
    }

    .summary-value {
      font-size: 16px;
      font-weight: 800;
      margin-top: 2px;
    }

    /* Table */
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
    }

    thead { display: table-header-group; }

    th, td {
      border: 1px solid #d9d9d9;
      padding: 8px 6px;
      vertical-align: middle;
    }

    th {
      background: #111;
      color: #fff;
      font-size: 9px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.3px;
    }

    tbody tr:nth-child(odd) td {
      background: #fcfcfc;
    }

    tr { break-inside: avoid; page-break-inside: avoid; }

    .col-num { width: 5%; text-align: center; }
    .col-code { width: 12%; font-family: monospace; font-size: 10px; }
    .col-name { width: 28%; font-weight: 600; }
    .col-cat { width: 15%; }
    .col-qty { width: 8%; text-align: center; font-weight: 700; }
    .col-unit { width: 8%; text-align: center; }
    .col-price { width: 12%; text-align: right; }
    .col-total { width: 12%; text-align: right; font-weight: 700; }

    .total-row td {
      background: #f0f7ff !important;
      font-weight: 800;
      font-size: 13px;
    }

    /* Notes */
    .notes {
      padding: 12px 15px;
      background: #fffde7;
      border-left: 4px solid #ffc107;
      border-radius: 0 8px 8px 0;
      margin-bottom: 25px;
    }

    .notes-title {
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      color: #666;
      margin-bottom: 5px;
    }

    /* Footer */
    .footer {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #e6e6e6;
    }

    .sign-box {
      border: 1px solid #d9d9d9;
      border-radius: 8px;
      padding: 15px;
    }

    .sign-title {
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      color: #666;
      margin-bottom: 10px;
    }

    .sign-line {
      height: 40px;
      border-bottom: 1.5px solid #111;
      margin-bottom: 8px;
    }

    .sign-date {
      font-size: 10px;
      color: #666;
    }

    .print-info {
      margin-top: 20px;
      text-align: center;
      font-size: 9px;
      color: #888;
      padding-top: 15px;
      border-top: 1px solid #e6e6e6;
    }

    @media screen {
      body { background: #eee; padding: 20px; }
      .sheet {
        background: #fff;
        padding: 20mm;
        box-shadow: 0 4px 20px rgba(0,0,0,0.1);
      }
    }

    @media print {
      body { background: #fff; padding: 0; }
      .sheet { padding: 0; box-shadow: none; }
    }
  </style>
</head>
<body>
  <div class="sheet">
    <div class="header">
      <div class="logo">
        <span class="logo-icon">🚚</span>
        <span class="logo-text">Wholesale Hub</span>
      </div>
      <div class="order-info">
        <div class="order-title">Purchase Order</div>
        <div class="order-id">#${escapeHtml(String(order.id))}</div>
      </div>
    </div>

    <div class="meta">
      <div class="meta-box">
        <div class="meta-title">Provider</div>
        <div class="meta-content">${escapeHtml(order.provider?.name || 'Unknown')}</div>
        <div class="meta-sub">${escapeHtml(order.provider?.email || '')}</div>
        ${order.provider?.phone ? `<div class="meta-sub">${escapeHtml(order.provider.phone)}</div>` : ''}
        ${order.provider?.address ? `<div class="meta-sub">${escapeHtml(order.provider.address)}</div>` : ''}
      </div>
      <div class="meta-box">
        <div class="meta-title">Order Details</div>
        <div class="meta-content">Date: ${escapeHtml(formatDateToEuropean(order.createdAt))}</div>
        <div class="meta-sub">Status: ${escapeHtml(order.status)}</div>
        <div class="meta-sub">Printed: ${escapeHtml(formattedPrintedDate)}</div>
      </div>
    </div>

    <div class="summary-bar">
      <div class="summary-item">
        <div class="summary-label">Total Items</div>
        <div class="summary-value">${totalItems}</div>
      </div>
      <div class="summary-item">
        <div class="summary-label">Order Status</div>
        <div class="summary-value">${escapeHtml(order.status)}</div>
      </div>
      <div class="summary-item">
        <div class="summary-label">Total Amount</div>
        <div class="summary-value">₺${(order.totalAmount || 0).toFixed(2)}</div>
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th class="col-num">#</th>
          <th class="col-code">Code</th>
          <th class="col-name">Item Name</th>
          <th class="col-cat">Category</th>
          <th class="col-qty">Qty</th>
          <th class="col-unit">Unit</th>
          <th class="col-price">Price</th>
          <th class="col-total">Total</th>
        </tr>
      </thead>
      <tbody>
        ${rowsHtml}
        <tr class="total-row">
          <td colspan="7" style="text-align: right; padding-right: 15px;">TOTAL AMOUNT:</td>
          <td class="col-total">₺${(order.totalAmount || 0).toFixed(2)}</td>
        </tr>
      </tbody>
    </table>

    ${order.notes ? `
    <div class="notes">
      <div class="notes-title">Notes</div>
      <div>${escapeHtml(order.notes)}</div>
    </div>
    ` : ''}

    <div class="footer">
      <div class="sign-box">
        <div class="sign-title">Authorized By (Wholesale Hub)</div>
        <div class="sign-line"></div>
        <div class="sign-date">Date: ____________________</div>
      </div>
      <div class="sign-box">
        <div class="sign-title">Received By (Provider)</div>
        <div class="sign-line"></div>
        <div class="sign-date">Date: ____________________</div>
      </div>
    </div>

    <div class="print-info">
      This is an official purchase order from Wholesale Hub.<br>
      Please confirm receipt and expected delivery date.
    </div>
  </div>
</body>
</html>`;
};

/**
 * Open print dialog for provider order
 * @param {Object} order - The provider order object
 */
export const printProviderOrder = (order) => {
  try {
    const htmlContent = generateProviderOrderHTML(order);
    const printWindow = window.open('', '_blank');

    if (!printWindow) throw new Error('Pop-up blocked. Please allow pop-ups for printing.');

    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();

    printWindow.onload = () => {
      printWindow.focus();
      printWindow.print();
    };
  } catch (error) {
    alert(error.message);
  }
};

/** Minimal HTML escaping for safety in templates */
function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

