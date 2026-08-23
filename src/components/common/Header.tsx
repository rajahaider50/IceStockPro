import { Bell, Settings, IceCreamCone } from 'lucide-react';

interface Props {
  shopName: string;
  lowStockCount: number;
  onBellClick: () => void;
  onSettingsClick: () => void;
}

export default function Header({ shopName, lowStockCount, onBellClick, onSettingsClick }: Props) {
  return (
    <header className="sticky top-0 z-30 bg-gradient-to-r from-brand-600 to-brand-500 safe-top">
      <div className="flex items-center justify-between px-4 py-3.5 max-w-lg mx-auto">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
            <IceCreamCone size={20} className="text-white" strokeWidth={2} />
          </div>
          <div className="min-w-0">
            <h1 className="text-white font-bold text-[15px] leading-tight truncate">{shopName}</h1>
            <p className="text-brand-100 text-[11px] leading-tight">IceStock Pro</p>
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={onBellClick}
            className="relative w-9 h-9 rounded-full bg-white/15 flex items-center justify-center tap-scale"
          >
            <Bell size={18} className="text-white" />
            {lowStockCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center border border-brand-600">
                {lowStockCount}
              </span>
            )}
          </button>
          <button
            onClick={onSettingsClick}
            className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center tap-scale"
          >
            <Settings size={18} className="text-white" />
          </button>
        </div>
      </div>
    </header>
  );
}
