import type { LucideIcon } from 'lucide-react';

interface Props {
  icon: LucideIcon;
  title: string;
  subtitle?: string;
}

export default function EmptyState({ icon: Icon, title, subtitle }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-14 px-6 text-center">
      <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-3">
        <Icon size={26} className="text-gray-400" strokeWidth={1.6} />
      </div>
      <p className="text-[14px] font-semibold text-gray-700">{title}</p>
      {subtitle && <p className="text-[12px] text-gray-400 mt-1 max-w-[240px]">{subtitle}</p>}
    </div>
  );
}
