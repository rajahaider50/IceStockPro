import { useEffect, useState } from 'react';
import { PackageX } from 'lucide-react';
import BottomSheet from '../common/BottomSheet';
import EmptyState from '../common/EmptyState';
import { getLowStockItems } from '../../db/queries';
import type { StockItem, AppSettings } from '../../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  refreshKey: number;
}

export default function LowStockSheet({ isOpen, onClose, refreshKey }: Props) {
  const [items, setItems] = useState<StockItem[]>([]);

  useEffect(() => {
    if (isOpen) getLowStockItems().then(setItems);
  }, [isOpen, refreshKey]);

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Low Stock Alerts">
      {items.length === 0 ? (
        <EmptyState icon={PackageX} title="All stocked up!" subtitle="No items are running low right now" />
      ) : (
        <div className="flex flex-col gap-2 pb-4">
          {items.map((item) => (
            <div key={item.id} className="flex items-center justify-between bg-red-50 rounded-2xl p-3.5">
              <div>
                <p className="text-[13px] font-bold text-gray-900">
                  {item.name}{item.variant ? ` · ${item.variant}` : ''}
                </p>
                <p className="text-[11px] text-red-500 font-semibold">
                  Only {item.currentStock} {item.unit} left (alert at {item.lowStockThreshold})
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </BottomSheet>
  );
}
