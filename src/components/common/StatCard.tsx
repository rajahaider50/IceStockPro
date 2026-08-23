import type { LucideIcon } from 'lucide-react';

interface Props {
  label: string;
  value: string;
  icon: LucideIcon;
  color: 'brand' | 'emerald' | 'amber' | 'red' | 'violet';
  trend?: string;
}

const colorMap = {
  brand: { bg: 'bg-brand-50', text: 'text-brand-600', iconBg: 'bg-brand-500' },
  emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', iconBg: 'bg-emerald-500' },
  amber: { bg: 'bg-amber-50', text: 'text-amber-600', iconBg: 'bg-amber-500' },
  red: { bg: 'bg-red-50', text: 'text-red-600', iconBg: 'bg-red-500' },
  violet: { bg: 'bg-violet-50', text: 'text-violet-600', iconBg: 'bg-violet-500' },
};

export default function StatCard({ label, value, icon: Icon, color, trend }: Props) {
  const c = colorMap[color];
  return (
    <div className={`rounded-2xl ${c.bg} p-3.5 flex flex-col gap-2`}>
      <div className="flex items-center justify-between">
        <div className={`w-8 h-8 rounded-xl ${c.iconBg} flex items-center justify-center`}>
          <Icon size={16} className="text-white" strokeWidth={2.2} />
        </div>
        {trend && <span className={`text-[10px] font-semibold ${c.text}`}>{trend}</span>}
      </div>
      <div>
        <p className="text-[18px] font-bold text-gray-900 leading-tight">{value}</p>
        <p className="text-[11px] text-gray-500 font-medium leading-tight mt-0.5">{label}</p>
      </div>
    </div>
  );
}
