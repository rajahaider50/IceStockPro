import { Wallet, TrendingUp, ReceiptText, PackageX, PiggyBank } from 'lucide-react';
import BottomSheet from './BottomSheet';
import { formatCurrency } from '../../utils/calculations';
import type { NetProfitBreakdown } from '../../utils/calculations';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  breakdown: NetProfitBreakdown | null;
  currency: string;
}

export default function NetProfitSheet({ isOpen, onClose, breakdown, currency }: Props) {
  if (!breakdown) return null;

  const rows = [
    { label: 'Gross Profit (Sales)', value: breakdown.grossProfit, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Expenses', value: breakdown.expenses, icon: ReceiptText, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Wastage Loss', value: breakdown.wastage, icon: PackageX, color: 'text-red-600', bg: 'bg-red-50' },
  ];

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Net Profit Breakdown">
      <div className="rounded-2xl bg-brand-50 border border-brand-100 p-5 mb-4 text-center">
        <PiggyBank size={22} className="mx-auto mb-2 text-brand-600" />
        <p className="text-[11px] uppercase tracking-wide text-brand-500 font-semibold">Net Profit</p>
        <p className="text-[30px] font-extrabold text-gray-900 mt-1">
          {formatCurrency(breakdown.netProfit, currency)}
        </p>
        <p className="text-[11px] text-gray-500 mt-1">
          Sales profit minus expenses and wastage
        </p>
      </div>

      <div className="flex flex-col gap-2.5">
        {rows.map((row) => (
          <div key={row.label} className="flex items-center gap-3 bg-white border border-gray-100 rounded-2xl p-3.5">
            <div className={`w-9 h-9 rounded-xl ${row.bg} flex items-center justify-center shrink-0`}>
              <row.icon size={17} className={row.color} />
            </div>
            <p className="flex-1 text-[13px] text-gray-600">{row.label}</p>
            <p className={`text-[14px] font-bold ${row.color}`}>{formatCurrency(row.value, currency)}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 rounded-2xl bg-gray-50 border border-gray-100 p-4 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gray-200 flex items-center justify-center shrink-0">
          <Wallet size={17} className="text-gray-600" />
        </div>
        <p className="text-[12px] text-gray-500 leading-snug">
          Net profit is what you actually keep after paying expenses and accounting for spoiled stock.
        </p>
      </div>
    </BottomSheet>
  );
}
