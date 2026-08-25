import { LayoutGrid, Package, ShoppingCart, Truck, BarChart3 } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { getLabels } from '../../utils/i18n';

export type TabKey = 'dashboard' | 'stock' | 'sales' | 'purchase' | 'reports';

interface Props {
  active: TabKey;
  onChange: (tab: TabKey) => void;
}

export default function BottomNav({ active, onChange }: Props) {
  const lang = useAppStore((s) => s.settings?.language);
  const labels = getLabels(lang);

  const tabs: { key: TabKey; label: string; icon: typeof LayoutGrid }[] = [
    { key: 'dashboard', label: labels.navDashboard, icon: LayoutGrid },
    { key: 'stock', label: labels.navStock, icon: Package },
    { key: 'sales', label: labels.navSales, icon: ShoppingCart },
    { key: 'purchase', label: labels.navPurchase, icon: Truck },
    { key: 'reports', label: labels.navReports, icon: BarChart3 },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-xl border-t border-gray-200/70 safe-bottom">
      <div className="flex items-stretch justify-between px-1 pt-1.5 pb-1 max-w-lg mx-auto">
        {tabs.map(({ key, label, icon: Icon }) => {
          const isActive = active === key;
          return (
            <button
              key={key}
              onClick={() => onChange(key)}
              className="flex-1 flex flex-col items-center justify-center gap-0.5 py-1.5 tap-scale relative"
            >
              <div
                className={`flex items-center justify-center rounded-2xl transition-all duration-200 ${
                  isActive ? 'bg-brand-500/10 px-4 py-1' : 'px-4 py-1'
                }`}
              >
                <Icon
                  size={22}
                  strokeWidth={isActive ? 2.4 : 1.9}
                  className={isActive ? 'text-brand-600' : 'text-gray-400'}
                />
              </div>
              <span
                className={`text-[10px] font-medium leading-none ${
                  isActive ? 'text-brand-600' : 'text-gray-400'
                }`}
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
