import { useEffect, useState } from 'react';
import { Plus, Truck, ImageIcon } from 'lucide-react';
import PurchaseFormSheet from './PurchaseFormSheet';
import EmptyState from '../common/EmptyState';
import { getAllPurchases } from '../../db/queries';
import { formatCurrency, formatDateTime } from '../../utils/calculations';
import type { PurchaseRecord, AppSettings } from '../../types';

interface Props {
  settings: AppSettings;
  refreshKey: number;
}

export default function PurchasePage({ settings, refreshKey }: Props) {
  const [purchases, setPurchases] = useState<PurchaseRecord[]>([]);
  const [sheetOpen, setSheetOpen] = useState(false);

  useEffect(() => {
    getAllPurchases().then(setPurchases);
  }, [refreshKey, sheetOpen]);

  const totalSpent = purchases.reduce((s, p) => s + p.totalCost, 0);

  return (
    <div className="px-4 pt-4 pb-4 max-w-lg mx-auto">
      <div className="mb-4">
        <p className="text-[11px] text-gray-400 font-medium">Total Purchases (All Time)</p>
        <p className="text-[19px] font-bold text-gray-900">{formatCurrency(totalSpent, settings.currency)}</p>
      </div>

      {purchases.length === 0 ? (
        <EmptyState icon={Truck} title="No purchases recorded" subtitle="Tap + to record stock you bought" />
      ) : (
        <div className="flex flex-col gap-2">
          {purchases.map((p) => (
            <div key={p.id} className="flex items-center gap-3 bg-white rounded-2xl border border-gray-100 p-3">
              <div className="w-11 h-11 rounded-xl bg-gray-100 flex items-center justify-center shrink-0 overflow-hidden">
                {p.receiptPhotoPath ? (
                  <img src={p.receiptPhotoPath} className="w-full h-full object-cover" alt="" />
                ) : (
                  <ImageIcon size={16} className="text-gray-300" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-bold text-gray-900 truncate">{p.itemNameSnapshot}</p>
                <p className="text-[11px] text-gray-400">
                  {p.quantity} units · {formatDateTime(p.date)}
                  {p.supplierName ? ` · ${p.supplierName}` : ''}
                </p>
              </div>
              <p className="text-[13px] font-bold text-gray-900 shrink-0">{formatCurrency(p.totalCost, settings.currency)}</p>
            </div>
          ))}
        </div>
      )}

      <button
        onClick={() => setSheetOpen(true)}
        className="fixed bottom-24 right-5 w-14 h-14 rounded-full bg-brand-500 shadow-xl shadow-brand-500/30 flex items-center justify-center tap-scale z-30"
      >
        <Plus size={26} className="text-white" strokeWidth={2.5} />
      </button>

      <PurchaseFormSheet isOpen={sheetOpen} onClose={() => setSheetOpen(false)} />
    </div>
  );
}
