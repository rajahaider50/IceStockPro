import { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, Minus, Sparkles, Trophy } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from 'recharts';
import BottomSheet from './BottomSheet';
import EmptyState from './EmptyState';
import { getSalesInRange } from '../../db/queries';
import { getProductRankings, startOfWeek, formatCurrency, type ProductRank } from '../../utils/calculations';
import type { AppSettings } from '../../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  refreshKey: number;
}

const rankColors = ['#f59e0b', '#94a3b8', '#c2703d']; // gold, silver, bronze
const barColors = ['#f59e0b', '#94a3b8', '#c2703d', '#059bf2', '#059bf2', '#059bf2', '#059bf2', '#059bf2'];

export default function AnalyticsSheet({ isOpen, onClose, settings, refreshKey }: Props) {
  const [rankings, setRankings] = useState<ProductRank[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isOpen) return;
    async function load() {
      setLoading(true);
      const now = Date.now();
      const thisWeekStart = startOfWeek(now);
      const lastWeekStart = thisWeekStart - 7 * 24 * 60 * 60 * 1000;
      const lastWeekEnd = thisWeekStart - 1;

      const [thisWeekSales, lastWeekSales] = await Promise.all([
        getSalesInRange(thisWeekStart, now),
        getSalesInRange(lastWeekStart, lastWeekEnd),
      ]);

      setRankings(getProductRankings(thisWeekSales, lastWeekSales, 8));
      setLoading(false);
    }
    load();
  }, [isOpen, refreshKey]);

  const chartData = rankings.map((r) => ({ name: r.name.length > 12 ? r.name.slice(0, 12) + '…' : r.name, qty: r.qty }));

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Weekly Analytics" maxHeight="88vh">
      {loading ? (
        <div className="py-16 text-center text-gray-400 text-sm">Loading...</div>
      ) : rankings.length === 0 ? (
        <EmptyState icon={Sparkles} title="No sales this week yet" subtitle="Rankings will appear once you start selling" />
      ) : (
        <div className="flex flex-col gap-5 pb-6">
          <div className="flex items-center gap-2">
            <Trophy size={16} className="text-amber-500" />
            <p className="text-[13px] font-bold text-gray-900">This Week's Best Sellers</p>
          </div>

          {/* Bar chart */}
          <div className="bg-gray-50 rounded-2xl p-3">
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={chartData} layout="vertical" margin={{ left: 0, right: 12 }}>
                <XAxis type="number" hide />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={90}
                  tick={{ fontSize: 10, fill: '#6b7280' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  formatter={(v) => [`${v} sold`, '']}
                  contentStyle={{ borderRadius: 12, fontSize: 12, border: '1px solid #eee' }}
                />
                <Bar dataKey="qty" radius={[0, 8, 8, 0]} barSize={16}>
                  {chartData.map((_, idx) => (
                    <Cell key={idx} fill={barColors[idx] ?? '#059bf2'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Ranked list */}
          <div className="flex flex-col gap-2">
            {rankings.map((r) => (
              <div key={r.name} className="flex items-center gap-3 bg-white rounded-2xl border border-gray-100 p-3">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-white text-[12px] font-bold"
                  style={{ backgroundColor: rankColors[r.rank - 1] ?? '#059bf2' }}
                >
                  {r.rank}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[12.5px] font-bold text-gray-900 truncate">{r.name}</p>
                  <p className="text-[10.5px] text-gray-400">
                    {r.qty} sold · {formatCurrency(r.revenue, settings.currency)}
                  </p>
                </div>
                <TrendBadge trend={r.trend} prevRank={r.prevRank} rank={r.rank} />
              </div>
            ))}
          </div>

          <p className="text-[10.5px] text-gray-400 text-center leading-relaxed">
            Comparing this week (since Sunday) against the same period last week.
          </p>
        </div>
      )}
    </BottomSheet>
  );
}

function TrendBadge({ trend, prevRank, rank }: { trend: ProductRank['trend']; prevRank: number | null; rank: number }) {
  if (trend === 'new') {
    return (
      <span className="text-[9.5px] font-bold bg-brand-50 text-brand-600 px-2 py-1 rounded-full shrink-0">NEW</span>
    );
  }
  if (trend === 'same') {
    return (
      <span className="flex items-center gap-0.5 text-[10px] font-semibold text-gray-400 shrink-0">
        <Minus size={12} />
      </span>
    );
  }
  const diff = prevRank !== null ? Math.abs(prevRank - rank) : 0;
  if (trend === 'up') {
    return (
      <span className="flex items-center gap-0.5 text-[10px] font-bold text-emerald-500 shrink-0">
        <TrendingUp size={13} /> {diff}
      </span>
    );
  }
  return (
    <span className="flex items-center gap-0.5 text-[10px] font-bold text-red-400 shrink-0">
      <TrendingDown size={13} /> {diff}
    </span>
  );
}
