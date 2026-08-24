import { useEffect, useState } from 'react';
import { FileDown, FileText, BarChart3, Calendar, Search, IceCreamCone, GlassWater } from 'lucide-react';
import { getSalesInRange, getPurchasesInRange } from '../../db/queries';
import { startOfDay, endOfDay, startOfWeek, startOfMonth, computeStats, formatCurrency, formatDateTime } from '../../utils/calculations';
import { exportSalesReportPDF, exportPurchaseReportPDF } from '../../utils/pdfExport';
import { exportSalesCSV, exportPurchasesCSV } from '../../utils/csvExport';
import type { SaleRecord, PurchaseRecord, AppSettings } from '../../types';

type Period = 'today' | 'week' | 'month' | 'all' | 'custom';

interface Props {
  settings: AppSettings;
  refreshKey: number;
}

const periodLabels: Record<Period, string> = {
  today: 'Today',
  week: 'This Week',
  month: 'This Month',
  all: 'All Time',
  custom: 'Custom Range',
};

function toDateInputValue(ts: number): string {
  const d = new Date(ts);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export default function ReportsPage({ settings, refreshKey }: Props) {
  const [period, setPeriod] = useState<Period>('today');
  const [sales, setSales] = useState<SaleRecord[]>([]);
  const [purchases, setPurchases] = useState<PurchaseRecord[]>([]);

  // Custom range state
  const now = Date.now();
  const oneMonthAgo = now - 30 * 24 * 60 * 60 * 1000;
  const [customStart, setCustomStart] = useState(toDateInputValue(oneMonthAgo));
  const [customEnd, setCustomEnd] = useState(toDateInputValue(now));
  const [customApplied, setCustomApplied] = useState(false);

  useEffect(() => {
    if (period === 'custom' && !customApplied) return; // wait for search tap
    async function load() {
      const nowTs = Date.now();
      let start = 0;
      let end = nowTs;
      if (period === 'today') { start = startOfDay(nowTs); end = endOfDay(nowTs); }
      if (period === 'week') { start = startOfWeek(nowTs); end = endOfDay(nowTs); }
      if (period === 'month') { start = startOfMonth(nowTs); end = endOfDay(nowTs); }
      if (period === 'custom') {
        start = new Date(customStart + 'T00:00:00').getTime();
        end = new Date(customEnd + 'T23:59:59').getTime();
      }

      const [s, p] = await Promise.all([
        getSalesInRange(start, end),
        getPurchasesInRange(start, end),
      ]);
      setSales(s);
      setPurchases(p);
    }
    load();
  }, [period, refreshKey, customApplied, customStart, customEnd]);

  function handleCustomSearch() {
    setCustomApplied(true);
  }

  const stats = computeStats(sales, purchases);
  const rangeLabel = period === 'custom'
    ? `${customStart} to ${customEnd}`
    : periodLabels[period];

  return (
    <div className="px-4 pt-4 pb-4 max-w-lg mx-auto">
      {/* Period selector */}
      <div className="grid grid-cols-3 gap-2 mb-2">
        {(['today', 'week', 'month'] as Period[]).map((p) => (
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
      <div className="grid grid-cols-2 gap-2 mb-4">
        <button
          onClick={() => setPeriod('all')}
          className={`py-2 rounded-xl text-[11.5px] font-semibold tap-scale ${
            period === 'all' ? 'bg-brand-500 text-white' : 'bg-white border border-gray-200 text-gray-500'
          }`}
        >
          All Time
        </button>
        <button
          onClick={() => setPeriod('custom')}
          className={`py-2 rounded-xl text-[11.5px] font-semibold tap-scale flex items-center justify-center gap-1 ${
            period === 'custom' ? 'bg-brand-500 text-white' : 'bg-white border border-gray-200 text-gray-500'
          }`}
        >
          <Calendar size={13} /> Custom Range
        </button>
      </div>

      {/* Custom date range pickers */}
      {period === 'custom' && (
        <div className="bg-white border border-gray-100 rounded-2xl p-3.5 mb-4">
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="text-[11px] font-semibold text-gray-500 mb-1 block">From Date</label>
              <input
                type="date"
                value={customStart}
                max={customEnd}
                onChange={(e) => { setCustomStart(e.target.value); setCustomApplied(false); }}
                className="input-field text-[12.5px]"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-gray-500 mb-1 block">To Date</label>
              <input
                type="date"
                value={customEnd}
                min={customStart}
                max={toDateInputValue(Date.now())}
                onChange={(e) => { setCustomEnd(e.target.value); setCustomApplied(false); }}
                className="input-field text-[12.5px]"
              />
            </div>
          </div>
          <button
            onClick={handleCustomSearch}
            className="w-full py-2.5 rounded-xl bg-brand-500 text-white font-bold text-[12.5px] flex items-center justify-center gap-2 tap-scale"
          >
            <Search size={14} /> Search History
          </button>
        </div>
      )}

      {/* Summary card */}
      <div className="rounded-2xl bg-gradient-to-br from-brand-600 to-brand-500 p-5 mb-4 text-white">
        <p className="text-[12px] text-brand-100 font-medium mb-1">Net Profit — {rangeLabel}</p>
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
          onClick={() => exportSalesReportPDF(sales, purchases, settings, rangeLabel)}
        />
        <ExportRow
          icon={FileDown}
          label="Sales Data (CSV)"
          onClick={() => exportSalesCSV(sales)}
        />
        <ExportRow
          icon={FileText}
          label="Purchase Report (PDF)"
          onClick={() => exportPurchaseReportPDF(purchases, settings, rangeLabel)}
        />
        <ExportRow
          icon={FileDown}
          label="Purchase Data (CSV)"
          onClick={() => exportPurchasesCSV(purchases)}
        />
      </div>

      {/* Transaction history list (most useful for custom range) */}
      {sales.length > 0 && (
        <>
          <p className="text-[12px] font-bold text-gray-500 mb-2 px-1">Transaction History ({sales.length})</p>
          <div className="flex flex-col gap-2 mb-2 max-h-[340px] overflow-y-auto no-scrollbar">
            {sales
              .slice()
              .sort((a, b) => b.date - a.date)
              .map((s) => (
                <div key={s.id} className="flex items-center gap-3 bg-white rounded-2xl border border-gray-100 p-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${s.machineType === 'ice_cream' ? 'bg-pink-100' : 'bg-orange-100'}`}>
                    {s.machineType === 'ice_cream' ? (
                      <IceCreamCone size={16} className="text-pink-500" />
                    ) : (
                      <GlassWater size={16} className="text-orange-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-semibold text-gray-800 truncate">
                      {s.items.map((i) => `${i.itemNameSnapshot} x${i.qty}`).join(', ')}
                    </p>
                    <p className="text-[10.5px] text-gray-400">{formatDateTime(s.date)} · {s.paymentMode}</p>
                  </div>
                  <p className="text-[12.5px] font-bold text-gray-900 shrink-0">{formatCurrency(s.totalAmount, settings.currency)}</p>
                </div>
              ))}
          </div>
        </>
      )}

      {sales.length === 0 && (
        <div className="flex flex-col items-center py-8 text-center">
          <BarChart3 size={24} className="text-gray-300 mb-2" />
          <p className="text-[12.5px] text-gray-400">
            {period === 'custom' && !customApplied ? 'Pick a date range and tap Search' : 'No sales recorded for this period yet'}
          </p>
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
