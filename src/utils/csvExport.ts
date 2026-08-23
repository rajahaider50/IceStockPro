import type { SaleRecord, PurchaseRecord, StockItem } from '../types';
import { formatDateTime, formatDate } from './calculations';

function downloadCSV(filename: string, rows: (string | number)[][]) {
  const csvContent = rows
    .map((row) =>
      row
        .map((cell) => {
          const str = String(cell);
          if (str.includes(',') || str.includes('"') || str.includes('\n')) {
            return `"${str.replace(/"/g, '""')}"`;
          }
          return str;
        })
        .join(',')
    )
    .join('\n');

  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportSalesCSV(sales: SaleRecord[]) {
  const rows: (string | number)[][] = [
    ['Date/Time', 'Machine', 'Items', 'Total Amount', 'Total Cost', 'Profit', 'Payment Mode'],
  ];
  sales.forEach((s) => {
    rows.push([
      formatDateTime(s.date),
      s.machineType,
      s.items.map((i) => `${i.itemNameSnapshot} x${i.qty}`).join(' | '),
      s.totalAmount,
      s.totalCost,
      s.totalProfit,
      s.paymentMode,
    ]);
  });
  downloadCSV(`sales-export-${Date.now()}.csv`, rows);
}

export function exportStockCSV(items: StockItem[]) {
  const rows: (string | number)[][] = [
    ['Name', 'Variant', 'Category', 'Current Stock', 'Unit', 'Purchase Price', 'Sell Price', 'Low Stock Threshold'],
  ];
  items.forEach((i) => {
    rows.push([
      i.name,
      i.variant || '',
      i.category,
      i.currentStock,
      i.unit,
      i.purchasePrice,
      i.sellPrice,
      i.lowStockThreshold,
    ]);
  });
  downloadCSV(`stock-export-${Date.now()}.csv`, rows);
}

export function exportPurchasesCSV(purchases: PurchaseRecord[]) {
  const rows: (string | number)[][] = [
    ['Date', 'Item', 'Quantity', 'Unit Cost', 'Total Cost', 'Supplier', 'Notes'],
  ];
  purchases.forEach((p) => {
    rows.push([
      formatDate(p.date),
      p.itemNameSnapshot,
      p.quantity,
      p.purchasePrice,
      p.totalCost,
      p.supplierName || '',
      p.notes || '',
    ]);
  });
  downloadCSV(`purchases-export-${Date.now()}.csv`, rows);
}
