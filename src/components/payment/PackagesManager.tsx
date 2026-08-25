import { useState, useEffect } from 'react';
import { Save, RotateCcw, Package, Plus, Trash2, Edit3 } from 'lucide-react';
import { getCustomPackages, saveCustomPackages } from '../../db/queries';
import { PACKAGES, formatPackagePrice, type Package as Pkg } from '../../utils/packages';
import { useAppStore } from '../../store/useAppStore';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const COLORS = ['gray', 'blue', 'indigo', 'violet', 'emerald', 'teal', 'amber', 'orange', 'red', 'rose'];
const NAMES = ['Original', 'Premium Lite', 'Business', 'Smart Choice', 'Best Value', 'Power User', 'Super Saver', 'Mega Deal', 'Budget Pro', 'Starter'];

function calcFromFullPrice(fullPrice: number, index: number): Omit<Pkg, 'id' | 'fullName' | 'name' | 'color' | 'badge'> {
  const originalPrice = 5000;
  const saveAmount = Math.max(0, originalPrice - fullPrice);
  const discount = originalPrice > 0 ? Math.round((saveAmount / originalPrice) * 100) : 0;
  return {
    fullPrice,
    discount,
    saveAmount,
    daily: Math.round(fullPrice / 10),
    weekly: Math.round(fullPrice / 5),
    monthly: Math.round(fullPrice / 2.5),
  };
}

export default function PackagesManager({ isOpen, onClose }: Props) {
  const [prices, setPrices] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const showToast = useAppStore((s) => s.showToast);

  useEffect(() => {
    if (!isOpen) return;
    async function load() {
      setLoading(true);
      try {
        const json = await getCustomPackages();
        if (json) {
          const custom = JSON.parse(json) as Pkg[];
          setPrices(custom.map((p) => p.fullPrice));
        } else {
          setPrices(PACKAGES.map((p) => p.fullPrice));
        }
      } catch {
        setPrices(PACKAGES.map((p) => p.fullPrice));
      }
      setLoading(false);
    }
    load();
  }, [isOpen]);

  if (!isOpen) return null;

  function updatePrice(index: number, value: string) {
    const num = parseInt(value.replace(/[^0-9]/g, ''), 10);
    if (isNaN(num)) return;
    setPrices((prev) => {
      const next = [...prev];
      next[index] = num;
      return next;
    });
  }

  async function handleSave() {
    const packages: Pkg[] = prices.map((price, i) => {
      const calc = calcFromFullPrice(price, i);
      return {
        id: PACKAGES[i]?.id || `pkg-${i}`,
        name: NAMES[i] || `Package ${i + 1}`,
        fullName: `${NAMES[i] || `Package ${i + 1}`} Package`,
        color: COLORS[i] || 'gray',
        badge: calc.discount > 0 ? `Save ${formatPackagePrice(calc.saveAmount)}` : undefined,
        ...calc,
      };
    });
    try {
      await saveCustomPackages(JSON.stringify(packages));
      showToast('Packages saved successfully');
      onClose();
    } catch (e) {
      console.error('Save packages error:', e);
      showToast('Failed to save', 'error');
    }
  }

  function handleReset() {
    setPrices(PACKAGES.map((p) => p.fullPrice));
    showToast('Reset to defaults');
  }

  return (
    <div className="fixed inset-0 z-[90] bg-black/40 flex items-end sm:items-center justify-center">
      <div className="bg-surface w-full max-w-sm sm:rounded-3xl rounded-t-3xl max-h-[85vh] flex flex-col animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-100 flex items-center justify-center">
              <Package size={18} className="text-brand-600" />
            </div>
            <div>
              <h2 className="text-[15px] font-bold text-gray-900">Manage Packages</h2>
              <p className="text-[11px] text-gray-400">Set full price — discounts auto-calculate</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 tap-scale">
            <span className="text-[13px] text-gray-400 font-bold">Done</span>
          </button>
        </div>

        {loading ? (
          <div className="py-10 flex justify-center">
            <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* Package List */}
            <div className="flex-1 overflow-y-auto px-5 py-3 space-y-2">
              {prices.map((price, i) => {
                const calc = calcFromFullPrice(price, i);
                const isOriginal = i === 0;
                return (
                  <div key={i} className={`bg-white border rounded-2xl p-3 ${isOriginal ? 'border-brand-300 bg-brand-50/30' : 'border-gray-200'}`}>
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-[9px] font-bold ${
                        isOriginal ? 'bg-brand-500 text-white' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {i + 1}
                      </div>
                      <div className="flex-1">
                        <p className="text-[12px] font-bold text-gray-900">{NAMES[i]}</p>
                        {isOriginal && <p className="text-[9px] text-brand-600 font-medium">Original Price</p>}
                      </div>
                      {calc.discount > 0 && (
                        <span className="text-[9px] font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                          {calc.discount}% off
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[11px] text-gray-400 shrink-0">Full</span>
                      <div className="relative flex-1">
                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[11px] text-gray-400">Rs</span>
                        <input
                          type="number"
                          value={price}
                          onChange={(e) => updatePrice(i, e.target.value)}
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl py-1.5 pl-9 pr-2 text-[12px] font-bold text-gray-900 text-right focus:outline-none focus:border-brand-400"
                          disabled={isOriginal}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-1.5">
                      <div className="bg-gray-50 rounded-xl py-1.5 px-2 text-center">
                        <p className="text-[9px] text-gray-400">Daily</p>
                        <p className="text-[11px] font-bold text-gray-700">{formatPackagePrice(calc.daily)}</p>
                      </div>
                      <div className="bg-gray-50 rounded-xl py-1.5 px-2 text-center">
                        <p className="text-[9px] text-gray-400">Weekly</p>
                        <p className="text-[11px] font-bold text-gray-700">{formatPackagePrice(calc.weekly)}</p>
                      </div>
                      <div className="bg-gray-50 rounded-xl py-1.5 px-2 text-center">
                        <p className="text-[9px] text-gray-400">Monthly</p>
                        <p className="text-[11px] font-bold text-gray-700">{formatPackagePrice(calc.monthly)}</p>
                      </div>
                    </div>

                    {calc.saveAmount > 0 && (
                      <p className="text-[10px] text-emerald-600 font-medium text-center mt-1.5">
                        Save {formatPackagePrice(calc.saveAmount)}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            <div className="px-5 py-4 border-t border-gray-100 flex gap-2 shrink-0">
              <button onClick={handleReset}
                className="px-4 py-2.5 rounded-xl bg-gray-100 text-gray-600 text-[12px] font-semibold flex items-center gap-1.5 tap-scale">
                <RotateCcw size={13} /> Reset
              </button>
              <button onClick={handleSave}
                className="flex-1 py-2.5 rounded-xl bg-brand-500 text-white text-[13px] font-bold flex items-center justify-center gap-1.5 tap-scale">
                <Save size={14} /> Save All Packages
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
