import { useEffect, useState } from 'react';
import { FileDown, FileText, BarChart3 } from 'lucide-react';
import { getSalesInRange, getPurchasesInRange } from '../../db/queries';
import { startOfDay, endOfDay, startOfWeek, startOfMonth, computeStats, formatCurrency } from '../../utils/calculations';
import { exportSalesReportPDF, exportPurchaseReportPDF } from '../../utils/pdfExport';
import { exportSalesCSV, exportPurchasesCSV } from '../../utils/csvExport';
import type { SaleRecord, PurchaseRecord, AppSettings } from '../../types';

type Period = 'today' | 'week' | 'month' | 'all';

interface Props {
  settings: AppSettings;
  refreshKey: number;
}

const periodLabels: Record<Period, string> = {
  today: 'Today',
  week: 'This Week',
  month: 'This Month',
  all: 'All Time',
};

export default function ReportsPage({ settings, refreshKey }: Props) {
  const [period, setPeriod] = useState<Period>('today');
  const [sales, setSales] = useState<SaleRecord[]>([]);
  const [purchases, setPurchases] = useState<PurchaseRecord[]>([]);

  useEffect(() => {
    async function load() {
      const now = Date.now();
      let start = 0;
      let end = now;
      if (period === 'today') { start = startOfDay(now); end = endOfDay(now); }
      if (period === 'week') { start = startOfWeek(now); end = endOfDay(now); }
      if (period === 'month') { start = startOfMonth(now); end = endOfDay(now); }

      const [s, p] = await Promise.all([
        getSalesInRange(start, end),
        getPurchasesInRange(start, end),
      ]);
      setSales(s);
      setPurchases(p);
    }
    load();
  }, [period, refreshKey]);

  const stats = computeStats(sales, purchases);

  return (
    <div className="px-4 pt-4 pb-4 max-w-lg mx-auto">
      {/* Period selector */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        {(['today', 'week', 'month', 'all'] as Period[]).map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`py-2 rounded-xl text-[11.5px] font-semibold tap-scale ${
              period === p ? 'bg-brand-500 text-white' : 'bg-white border border-gray-200 text-gray-500'
            }`}
          >
            {periodLabels[p]}
          </button>
        ))}
      </div>

      {/* Summary card */}
      <div className="rounded-2xl bg-gradient-to-br from-brand-600 to-brand-500 p-5 mb-4 text-white">
        <p className="text-[12px] text-brand-100 font-medium mb-1">Net Profit — {periodLabels[period]}</p>
        <p className="text-[28px] font-bold mb-4">{formatCurrency(stats.totalProfit, settings.currency)}</p>
        <div className="grid grid-cols-2 gap-3 pt-3 border-t border-white/20">
          <div>
            <p className="text-[11px] text-brand-100">Total Sales</p>
            <p className="text-[15px] font-bold">{formatCurrency(stats.totalSales, settings.currency)}</p>
          </div>
          <div>
            <p className="text-[11px] text-brand-100">Total Purchases</p>
            <p className="text-[15px] font-bold">{formatCurrency(stats.totalPurchaseCost, settings.currency)}</p>
          </div>
          <div>
            <p className="text-[11px] text-brand-100">Items Sold</p>
            <p className="text-[15px] font-bold">{stats.itemsSoldCount}</p>
          </div>
          <div>
            <p className="text-[11px] text-brand-100">Transactions</p>
            <p className="text-[15px] font-bold">{stats.transactionCount}</p>
          </div>
        </div>
      </div>

      {/* Export options */}
      <p className="text-[12px] font-bold text-gray-500 mb-2 px-1">Export Reports</p>
      <div className="flex flex-col gap-2 mb-4">
        <ExportRow
          icon={FileText}
          label="Sales Report (PDF)"
          onClick={() => exportSalesReportPDF(sales, purchases, settings, periodLabels[period])}
        />
        <ExportRow
          icon={FileDown}
          label="Sales Data (CSV)"
          onClick={() => exportSalesCSV(sales)}
        />
        <ExportRow
          icon={FileText}
          label="Purchase Report (PDF)"
          onClick={() => exportPurchaseReportPDF(purchases, settings, periodLabels[period])}
        />
        <ExportRow
          icon={FileDown}
          label="Purchase Data (CSV)"
          onClick={() => exportPurchasesCSV(purchases)}
        />
      </div>

      {sales.length === 0 && (
        <div className="flex flex-col items-center py-8 text-center">
          <BarChart3 size={24} className="text-gray-300 mb-2" />
          <p className="text-[12.5px] text-gray-400">No sales recorded for this period yet</p>
        </div>
      )}
    </div>
  );
}

function ExportRow({ icon: Icon, label, onClick }: { icon: typeof FileText; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-3 bg-white rounded-2xl border border-gray-100 p-3.5 tap-scale"
    >
      <div className="w-9 h-9 rounded-xl bg-brand-50 flex items-center justify-center shrink-0">
        <Icon size={16} className="text-brand-600" />
      </div>
      <span className="text-[13px] font-semibold text-gray-800 flex-1 text-left">{label}</span>
    </button>
  );
}
