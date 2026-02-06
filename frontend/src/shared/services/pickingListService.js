import { formatDateToEuropean } from '../utils/dateFormatter';

/**
 * Generate a warehouse picking list HTML document (A4-print optimized)
 * @param {Object} order - The order object containing items and customer info
 * @returns {string} HTML content for the picking list
 */
export const generatePickingListHTML = (order) => {
  if (!order?.items || order.items.length === 0) {
    throw new Error('No items in this order to print');
  }

  const sortedItems = [...order.items].sort((a, b) => {
    const priorityA = a.adminItem?.category?.priority ?? 999;
    const priorityB = b.adminItem?.category?.priority ?? 999;
    return priorityA - priorityB;
  });

  const printedAt = new Date();

  // Format printed date as DD/MM/YYYY
  const day = String(printedAt.getDate()).padStart(2, '0');
  const month = String(printedAt.getMonth() + 1).padStart(2, '0');
  const year = printedAt.getFullYear();
  const formattedPrintedDate = `${day}/${month}/${year}`;

  let rowsHtml = '';
  sortedItems.forEach((item) => {
    const categoryName = item.adminItem?.category?.name || 'Uncategorized';
    const name = item.itemName || `Item ${item.adminItemId}`;
    const qty = item.quantity ?? '';
    const unit = item.unit ?? '';

    rowsHtml += `
      <tr>
        <td class="col-check"><span class="box"></span></td>
        <td class="col-name">
          <div class="name">${escapeHtml(name)}</div>
          ${
        item.adminItem?.sku
            ? `<div class="sub">SKU: ${escapeHtml(String(item.adminItem.sku))}</div>`
            : ''
    }
        </td>
        <td class="col-cat">${escapeHtml(categoryName)}</td>
        <td class="col-qty">${escapeHtml(String(qty))}</td>
        <td class="col-unit">${escapeHtml(String(unit))}</td>
      </tr>
    `;
  });

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Order List - Order ID:${escapeHtml(String(order.id))} - ${escapeHtml(formatDateToEuropean(order.createdAt))}</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
  <style>
    /* ---------- Print page setup ---------- */
    @page {
      size: A4;
      margin: 12mm;
      margin-top: 15mm;
    }

    /* ---------- Base ---------- */
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

    thead {
      display: table-header-group; /* repeat header on each page */
    }

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

    /* prevent row splitting across pages */
    tr { break-inside: avoid; page-break-inside: avoid; }

    .col-check { width: 10mm; text-align: center; }
    .col-name  { width: 55%; }
    .col-cat   { width: 23%; }
    .col-qty   { width: 12%; text-align: center; font-weight: 800; }
    .col-unit  { width: 12%; text-align: center; font-weight: 800; }

    .box {
      display: inline-block;
      width: 12px;
      height: 12px;
      border: 1.8px solid #111;
      border-radius: 2px;
      vertical-align: middle;
    }

    .name { font-weight: 800; }
    .sub  { margin-top: 2px; font-size: 9px; color: #666; }

    /* ---------- Footer (signature + print info) ---------- */
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

    /* Page numbering (works in Chromium-based printing) */
    .pageCounter {
      position: fixed;
      bottom: 8mm;
      right: 12mm;
      font-size: 9px;
      color: #666;
    }
    .pageCounter:after {
      content: "Page " counter(page) " / " counter(pages);
    }

    /* Screen preview tweaks */
    @media screen {
      body { background: #eee; padding: 16px; }
      .sheet {
        max-width: 210mm;
        margin: 0 auto;
        background: #fff;
        padding: 12mm;
        box-shadow: 0 6px 24px rgba(0,0,0,0.12);
      }
    }

    /* Print-only tweaks */
    @media print {
      body { background: #fff; padding: 0; }
      .sheet { padding: 12mm; box-shadow: none; }
    }
  </style>
</head>
<body>
  <div class="pageCounter"></div>

  <div class="sheet">
    <div class="topbar">
      <div>
        <div class="title">Order List</div>
      </div>
      <div class="orderNo">
        <div class="label">Order ID</div>
        <div class="value">${escapeHtml(String(order.id))}</div>
      </div>
    </div>

    <div class="meta">
      <div class="metaItem">
        <div class="k">Customer</div>
        <div class="v">${escapeHtml(order.customer?.name || 'Unknown')}</div>
      </div>
      <div class="metaItem">
        <div class="k">Order date</div>
        <div class="v">${escapeHtml(formatDateToEuropean(order.createdAt))}</div>
      </div>
      <div class="metaItem">
        <div class="k">Total items</div>
        <div class="v">${escapeHtml(String(sortedItems.length))}</div>
      </div>
      <div class="metaItem">
        <div class="k">Printed</div>
        <div class="v">${escapeHtml(formattedPrintedDate)}</div>
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th class="col-check">Pick</th>
          <th class="col-name">Item</th>
          <th class="col-cat">Category</th>
          <th class="col-qty">Qty</th>
          <th class="col-unit">Unit</th>
        </tr>
      </thead>
      <tbody>
        ${rowsHtml}
      </tbody>
    </table>

    <div class="bottom">
      <div class="sign">
        <div class="label">Staff</div>
        <div class="line"></div>
        <div class="date">Date: ____________________</div>
      </div>
      <div class="sign">
        <div class="label">Receiver</div>
        <div class="line"></div>
        <div class="date">Date: ____________________</div>
      </div>
    </div>

    <div class="printInfo">
      Printed: ${escapeHtml(formattedPrintedDate)}<br>
      Verify all items and check boxes as picked. Both parties must sign for proof of delivery.
    </div>
  </div>
</body>
</html>`;
};

/**
 * Open print dialog for picking list
 * @param {Object} order - The order object
 */
export const printPickingList = (order) => {
  try {
    const htmlContent = generatePickingListHTML(order);
    const printWindow = window.open('', '_blank');

    if (!printWindow) throw new Error('Pop-up blocked. Please allow pop-ups for printing.');

    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();

    // wait for layout/fonts
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
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
}
