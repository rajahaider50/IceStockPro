import { useEffect, useState } from 'react';
import { Wallet, TrendingUp, ShoppingBag, PackageX, IceCreamCone, GlassWater, BarChart3, Users, ReceiptText } from 'lucide-react';
import { LineChart, Line, XAxis, ResponsiveContainer, Tooltip } from 'recharts';
import StatCard from '../common/StatCard';
import EmptyState from '../common/EmptyState';
import AnalyticsSheet from '../common/AnalyticsSheet';
import { getSalesInRange, getAllPurchases, getLowStockItems, getOutstandingTotal, getExpensesTotal } from '../../db/queries';
import { startOfDay, endOfDay, startOfWeek, startOfMonth, computeStats, formatCurrency, getTopSellingItems, getLast7DaysTrend } from '../../utils/calculations';
import type { SaleRecord, PurchaseRecord, StockItem, AppSettings } from '../../types';

type Period = 'today' | 'week' | 'month';

interface Props {
  settings: AppSettings;
  refreshKey: number;
  onViewLowStock: () => void;
}

export default function Dashboard({ settings, refreshKey, onViewLowStock }: Props) {
  const [period, setPeriod] = useState<Period>('today');
  const [sales, setSales] = useState<SaleRecord[]>([]);
  const [purchases, setPurchases] = useState<PurchaseRecord[]>([]);
  const [lowStock, setLowStock] = useState<StockItem[]>([]);
  const [allSales, setAllSales] = useState<SaleRecord[]>([]);
  const [outstandingUdhaar, setOutstandingUdhaar] = useState(0);
  const [todayExpenses, setTodayExpenses] = useState(0);
  const [loading, setLoading] = useState(true);
  const [analyticsOpen, setAnalyticsOpen] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const now = Date.now();
      let start = startOfDay(now);
      const end = endOfDay(now);
      if (period === 'week') start = startOfWeek(now);
      if (period === 'month') start = startOfMonth(now);

      const [periodSales, allPurchases, low, sevenDaySales] = await Promise.all([
        getSalesInRange(start, end),
        getAllPurchases(),
        getLowStockItems(),
        getSalesInRange(now - 7 * 24 * 60 * 60 * 1000, now),
      ]);
      setSales(periodSales);
      setPurchases(allPurchases.filter((p) => p.date >= start && p.date <= end));
      setLowStock(low);
      setAllSales(sevenDaySales);

      const [udhaar, exp] = await Promise.all([
        getOutstandingTotal(),
        getExpensesTotal(startOfDay(now), endOfDay(now)),
      ]);
      setOutstandingUdhaar(udhaar);
      setTodayExpenses(exp);
      setLoading(false);
    }
    load();
  }, [period, refreshKey]);

  const stats = computeStats(sales, purchases);
  const trend = getLast7DaysTrend(allSales);
  const topItems = getTopSellingItems(sales, 4);
  const currency = settings.currency;

  const iceCreamSales = sales.filter((s) => s.machineType === 'ice_cream').reduce((s, r) => s + r.totalAmount, 0);
  const juiceSales = sales.filter((s) => s.machineType === 'juice').reduce((s, r) => s + r.totalAmount, 0);

  return (
    <div className="px-4 pt-4 pb-4 max-w-lg mx-auto">
      {/* Period toggle */}
      <div className="flex bg-gray-100 rounded-2xl p-1 mb-4">
        {(['today', 'week', 'month'] as Period[]).map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`flex-1 py-2 rounded-xl text-[12.5px] font-semibold capitalize tap-scale transition-colors ${
              period === p ? 'bg-white text-brand-600 shadow-sm' : 'text-gray-500'
            }`}
          >
            {p}
          </button>
        ))}
      </div>

      {/* Daily Target Ring */}
      {settings.dailyTarget && settings.dailyTarget > 0 && (
        <div className="flex items-center gap-3 bg-white border border-gray-100 rounded-2xl p-4 mb-4">
          <TargetRing current={stats.totalSales} target={settings.dailyTarget} />
          <div className="flex-1">
            <p className="text-[11px] text-gray-400 font-medium">Today&apos;s Target</p>
            <p className="text-[15px] font-bold text-gray-900">{formatCurrency(settings.dailyTarget, currency)}</p>
            <p className="text-[11px] text-gray-500">{Math.min(100, Math.round((stats.totalSales / settings.dailyTarget) * 100))}% achieved</p>
          </div>
        </div>
      )}

      {loading ? (
        <div className="py-20 text-center text-gray-400 text-sm">Loading...</div>
      ) : (
        <>
          {/* Low stock alert banner */}
          {lowStock.length > 0 && (
            <button
              onClick={onViewLowStock}
              className="w-full flex items-center gap-3 bg-red-50 border border-red-100 rounded-2xl px-4 py-3 mb-4 tap-scale"
            >
              <div className="w-9 h-9 rounded-xl bg-red-500 flex items-center justify-center shrink-0">
                <PackageX size={18} className="text-white" />
              </div>
              <div className="text-left flex-1 min-w-0">
                <p className="text-[13px] font-bold text-red-700">{lowStock.length} items running low</p>
                <p className="text-[11px] text-red-500 truncate">
                  {lowStock.slice(0, 3).map((i) => i.name).join(', ')}
                </p>
              </div>
            </button>
          )}

          {/* Stat cards grid */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <StatCard label="Total Sales" value={formatCurrency(stats.totalSales, currency)} icon={Wallet} color="brand" />
            <StatCard label="Total Profit" value={formatCurrency(stats.totalProfit, currency)} icon={TrendingUp} color="emerald" />
            <StatCard label="Items Sold" value={String(stats.itemsSoldCount)} icon={ShoppingBag} color="violet" />
            <StatCard label="Purchases" value={formatCurrency(stats.totalPurchaseCost, currency)} icon={PackageX} color="amber" />
          </div>

          {/* Udhaar + Expenses */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <StatCard label="Udhaar" value={formatCurrency(outstandingUdhaar, currency)} icon={Users} color="red" />
            <StatCard label="Expenses" value={formatCurrency(todayExpenses, currency)} icon={ReceiptText} color="amber" />
          </div>

          {/* Machine split */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="rounded-2xl bg-white border border-gray-100 p-3.5 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-pink-100 flex items-center justify-center shrink-0">
                <IceCreamCone size={20} className="text-pink-500" />
              </div>
              <div className="min-w-0">
                <p className="text-[13px] font-bold text-gray-900 truncate">{formatCurrency(iceCreamSales, currency)}</p>
                <p className="text-[10.5px] text-gray-400">Ice Cream</p>
              </div>
            </div>
            <div className="rounded-2xl bg-white border border-gray-100 p-3.5 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center shrink-0">
                <GlassWater size={20} className="text-orange-500" />
              </div>
              <div className="min-w-0">
                <p className="text-[13px] font-bold text-gray-900 truncate">{formatCurrency(juiceSales, currency)}</p>
                <p className="text-[10.5px] text-gray-400">Juice</p>
              </div>
            </div>
          </div>

          {/* 7-day trend chart */}
          <div className="rounded-2xl bg-white border border-gray-100 p-4 mb-4">
            <p className="text-[13px] font-bold text-gray-900 mb-2">Last 7 Days</p>
            <ResponsiveContainer width="100%" height={140}>
              <LineChart data={trend}>
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <Tooltip
                  formatter={(v) => formatCurrency(Number(v), currency)}
                  contentStyle={{ borderRadius: 12, fontSize: 12, border: '1px solid #eee' }}
                />
                <Line type="monotone" dataKey="sales" stroke="#059bf2" strokeWidth={2.5} dot={{ r: 3, fill: '#059bf2' }} />
                <Line type="monotone" dataKey="profit" stroke="#14b8a6" strokeWidth={2.5} dot={{ r: 3, fill: '#14b8a6' }} />
              </LineChart>
            </ResponsiveContainer>
            <div className="flex items-center gap-4 mt-1 justify-center">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-brand-500" />
                <span className="text-[11px] text-gray-500">Sales</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-mint-500" />
                <span className="text-[11px] text-gray-500">Profit</span>
              </div>
            </div>
          </div>

          {/* Top selling items */}
          <div className="rounded-2xl bg-white border border-gray-100 p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[13px] font-bold text-gray-900">Top Selling Items</p>
              <button
                onClick={() => setAnalyticsOpen(true)}
                className="flex items-center gap-1 text-[11px] font-semibold text-brand-600 tap-scale"
              >
                <BarChart3 size={13} /> Full Analytics
              </button>
            </div>
            {topItems.length === 0 ? (
              <EmptyState icon={ShoppingBag} title="No sales yet" subtitle="Sales will appear here once you start selling" />
            ) : (
              <div className="flex flex-col gap-2.5">
                {topItems.map((item, idx) => (
                  <div key={item.name} className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-brand-50 text-brand-600 text-[11px] font-bold flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12.5px] font-semibold text-gray-800 truncate">{item.name}</p>
                      <p className="text-[10.5px] text-gray-400">{item.qty} sold</p>
                    </div>
                    <p className="text-[12.5px] font-bold text-gray-900 shrink-0">{formatCurrency(item.revenue, currency)}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      <AnalyticsSheet
        isOpen={analyticsOpen}
        onClose={() => setAnalyticsOpen(false)}
        settings={settings}
        refreshKey={refreshKey}
      />
    </div>
  );
}

function TargetRing({ current, target }: { current: number; target: number }) {
  const pct = Math.min(1, current / target);
  const r = 28;
  const circumference = 2 * Math.PI * r;
  const offset = circumference * (1 - pct);
  return (
    <div className="relative w-16 h-16 shrink-0">
      <svg viewBox="0 0 64 64" className="w-full h-full -rotate-90">
        <circle cx="32" cy="32" r={r} fill="none" stroke="#e5e9f0" strokeWidth="5" />
        <circle
          cx="32" cy="32" r={r} fill="none"
          stroke={pct >= 1 ? '#14b8a6' : '#059bf2'}
          strokeWidth="5" strokeDasharray={circumference} strokeDashoffset={offset}
          strokeLinecap="round" className="transition-all duration-500"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-[11px] font-bold text-gray-700">{Math.round(pct * 100)}%</span>
      </div>
    </div>
  );
}
