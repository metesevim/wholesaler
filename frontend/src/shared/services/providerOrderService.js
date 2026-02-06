import { formatDateToEuropean } from '../utils/dateFormatter';

/**
 * Generate a provider order HTML document (A4-print optimized)
 * Matches the picking list style
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
  order.items.forEach((item) => {
    const categoryName = item.adminItem?.category?.name || 'Uncategorized';
    rowsHtml += `
      <tr>
        <td class="col-code">${escapeHtml(item.productCode || item.adminItem?.productCode || '-')}</td>
        <td class="col-name">${escapeHtml(item.itemName)}</td>
        <td class="col-cat">${escapeHtml(categoryName)}</td>
        <td class="col-qty">${escapeHtml(String(item.quantity))}</td>
        <td class="col-unit">${escapeHtml(item.unit)}</td>
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
      margin: 12mm;
      margin-top: 15mm;
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
      line-height: 1.35;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    .sheet {
      width: 100%;
    }

    /* ---------- Header ---------- */
    .topbar {
      display: grid;
      grid-template-columns: 1fr auto;
      gap: 12px;
      align-items: end;
      padding-bottom: 10px;
      border-bottom: 2px solid #111;
      margin-bottom: 10px;
    }

    .title {
      font-size: 18px;
      font-weight: 800;
      letter-spacing: 0.6px;
      text-transform: uppercase;
    }

    .orderNo {
      text-align: right;
    }
    .orderNo .label { font-size: 9px; color: #555; text-transform: uppercase; letter-spacing: 0.3px; }
    .orderNo .value { font-size: 14px; font-weight: 800; }

    /* ---------- Meta grid ---------- */
    .meta {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 8px;
      padding: 10px;
      border: 1px solid #e6e6e6;
      background: #f7f7f7;
      border-radius: 6px;
      margin-bottom: 10px;
    }

    .metaItem {
      display: flex;
      flex-direction: column;
      gap: 2px;
      min-width: 0;
    }
    .metaItem .k {
      font-size: 9px;
      color: #666;
      text-transform: uppercase;
      letter-spacing: 0.3px;
      font-weight: 700;
    }
    .metaItem .v {
      font-size: 11px;
      color: #111;
      font-weight: 700;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    /* ---------- Table ---------- */
    table {
      width: 100%;
      border-collapse: collapse;
      table-layout: fixed;
      margin-top: 6px;
    }

    thead { display: table-header-group; }

    th, td {
      border: 1px solid #d9d9d9;
      padding: 7px 6px;
      vertical-align: middle;
      word-break: break-word;
      overflow-wrap: anywhere;
    }

    th {
      background: #111;
      color: #fff;
      font-size: 9px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.35px;
    }

    tbody tr:nth-child(odd) td {
      background: #fcfcfc;
    }

    tr { break-inside: avoid; page-break-inside: avoid; }

    .col-code  { width: 12%; font-family: monospace; font-size: 10px; }
    .col-name  { width: 30%; font-weight: 600; }
    .col-cat   { width: 15%; }
    .col-qty   { width: 10%; text-align: center; font-weight: 800; }
    .col-unit  { width: 10%; text-align: center; }
    .col-price { width: 11%; text-align: right; }
    .col-total { width: 12%; text-align: right; font-weight: 800; }

    .total-row td {
      background: #f0f7ff !important;
      font-weight: 800;
      font-size: 12px;
    }

    /* ---------- Notes ---------- */
    .notes {
      margin-top: 12px;
      padding: 10px 12px;
      background: #fffde7;
      border-left: 4px solid #ffc107;
      border-radius: 0 6px 6px 0;
    }
    .notes-title {
      font-size: 9px;
      font-weight: 700;
      text-transform: uppercase;
      color: #666;
      margin-bottom: 4px;
    }

    /* ---------- Footer ---------- */
    .bottom {
      margin-top: 12px;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 14px;
      align-items: start;
      break-inside: avoid;
      page-break-inside: avoid;
    }

    .sign {
      border: 1px solid #d9d9d9;
      border-radius: 6px;
      padding: 10px;
      min-height: 70px;
      position: relative;
    }

    .sign .label {
      font-size: 9px;
      color: #555;
      text-transform: uppercase;
      letter-spacing: 0.3px;
      font-weight: 800;
      margin-bottom: 6px;
    }

    .sign .line {
      height: 36px;
      border-bottom: 1.5px solid #111;
    }

    .sign .date {
      margin-top: 6px;
      font-size: 9px;
      color: #444;
    }

    .printInfo {
      margin-top: 10px;
      border-top: 1px solid #e6e6e6;
      padding-top: 8px;
      font-size: 9px;
      color: #666;
      text-align: center;
    }

    @media screen {
      body { background: #eee; padding: 20px; }
      .sheet {
        background: #fff;
        max-width: 210mm;
        margin: auto;
        padding: 15mm;
        box-shadow: 0 2px 10px rgba(0,0,0,.1);
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
    <div class="topbar">
      <div class="title">Wholesale Hub - Purchase Order</div>
      <div class="orderNo">
        <div class="label">Order ID</div>
        <div class="value">#${escapeHtml(String(order.id))}</div>
      </div>
    </div>

    <div class="meta">
      <div class="metaItem">
        <div class="k">Provider</div>
        <div class="v">${escapeHtml(order.provider?.name || 'Unknown')}</div>
      </div>
      <div class="metaItem">
        <div class="k">Email</div>
        <div class="v">${escapeHtml(order.provider?.email || '-')}</div>
      </div>
      <div class="metaItem">
        <div class="k">Order Date</div>
        <div class="v">${escapeHtml(formatDateToEuropean(order.createdAt))}</div>
      </div>
      <div class="metaItem">
        <div class="k">Total Items</div>
        <div class="v">${order.items.length}</div>
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th class="col-code">Code</th>
          <th class="col-name">Item Name</th>
          <th class="col-cat">Category</th>
          <th class="col-qty">Qty</th>
          <th class="col-unit">Unit</th>
        </tr>
      </thead>
      <tbody>
        ${rowsHtml}
      </tbody>
    </table>

    ${order.notes ? `
    <div class="notes">
      <div class="notes-title">Notes</div>
      <div>${escapeHtml(order.notes)}</div>
    </div>
    ` : ''}


    <div class="printInfo">
      This is an official purchase order from Wholesale Hub.<br>
      Please confirm receipt and expected delivery date.<br>
      Printed: ${escapeHtml(formattedPrintedDate)}
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
