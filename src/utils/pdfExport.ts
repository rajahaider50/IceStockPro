import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { SaleRecord, PurchaseRecord, StockItem, AppSettings } from '../types';
import { formatCurrency, formatDate, formatDateTime, computeStats } from './calculations';

export function exportSalesReportPDF(
  sales: SaleRecord[],
  purchases: PurchaseRecord[],
  settings: AppSettings,
  periodLabel: string
) {
  const doc = new jsPDF();
  const stats = computeStats(sales, purchases);

  // Header
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(settings.shopName, 14, 18);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Sales Report — ${periodLabel}`, 14, 25);
  doc.text(`Generated: ${formatDateTime(Date.now())}`, 14, 30);

  // Summary box
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Summary', 14, 40);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  const summaryLines = [
    `Total Sales: ${formatCurrency(stats.totalSales, settings.currency)}`,
    `Total Cost: ${formatCurrency(stats.totalCost, settings.currency)}`,
    `Total Profit: ${formatCurrency(stats.totalProfit, settings.currency)}`,
    `Items Sold: ${stats.itemsSoldCount}`,
    `Transactions: ${stats.transactionCount}`,
  ];
  summaryLines.forEach((line, i) => {
    doc.text(line, 14, 47 + i * 5);
  });

  const tableStartY = 47 + summaryLines.length * 5 + 8;

  // Sales table
  const rows = sales.map((s) => [
    formatDateTime(s.date),
    s.machineType === 'ice_cream' ? 'Ice Cream' : 'Juice',
    s.items.map((i) => `${i.itemNameSnapshot} x${i.qty}`).join(', '),
    formatCurrency(s.totalAmount, settings.currency),
    formatCurrency(s.totalProfit, settings.currency),
  ]);

  autoTable(doc, {
    startY: tableStartY,
    head: [['Date/Time', 'Machine', 'Items', 'Total', 'Profit']],
    body: rows,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [59, 130, 246] },
    columnStyles: { 2: { cellWidth: 70 } },
  });

  doc.save(`sales-report-${Date.now()}.pdf`);
}

export function exportStockReportPDF(items: StockItem[], settings: AppSettings) {
  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(settings.shopName, 14, 18);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Stock Inventory Report', 14, 25);
  doc.text(`Generated: ${formatDateTime(Date.now())}`, 14, 30);

  const totalStockValue = items.reduce((s, i) => s + i.currentStock * i.purchasePrice, 0);
  doc.setFont('helvetica', 'bold');
  doc.text(`Total Stock Value: ${formatCurrency(totalStockValue, settings.currency)}`, 14, 40);

  const rows = items.map((i) => [
    i.name + (i.variant ? ` (${i.variant})` : ''),
    i.category,
    `${i.currentStock} ${i.unit}`,
    formatCurrency(i.purchasePrice, settings.currency),
    formatCurrency(i.sellPrice, settings.currency),
    i.currentStock <= i.lowStockThreshold ? 'LOW STOCK' : 'OK',
  ]);

  autoTable(doc, {
    startY: 46,
    head: [['Item', 'Category', 'Stock', 'Cost', 'Price', 'Status']],
    body: rows,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [59, 130, 246] },
  });

  doc.save(`stock-report-${Date.now()}.pdf`);
}

export function exportPurchaseReportPDF(
  purchases: PurchaseRecord[],
  settings: AppSettings,
  periodLabel: string
) {
  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(settings.shopName, 14, 18);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Purchase Report — ${periodLabel}`, 14, 25);
  doc.text(`Generated: ${formatDateTime(Date.now())}`, 14, 30);

  const total = purchases.reduce((s, p) => s + p.totalCost, 0);
  doc.setFont('helvetica', 'bold');
  doc.text(`Total Purchases: ${formatCurrency(total, settings.currency)}`, 14, 40);

  const rows = purchases.map((p) => [
    formatDate(p.date),
    p.itemNameSnapshot,
    String(p.quantity),
    formatCurrency(p.purchasePrice, settings.currency),
    formatCurrency(p.totalCost, settings.currency),
    p.supplierName || '-',
  ]);

  autoTable(doc, {
    startY: 46,
    head: [['Date', 'Item', 'Qty', 'Unit Cost', 'Total', 'Supplier']],
    body: rows,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [59, 130, 246] },
  });

  doc.save(`purchase-report-${Date.now()}.pdf`);
}
