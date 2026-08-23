import { Pencil, ImageIcon } from 'lucide-react';
import type { StockItem, AppSettings } from '../../types';
import { formatCurrency } from '../../utils/calculations';

interface Props {
  item: StockItem;
  settings: AppSettings;
  onEdit: () => void;
}

export default function StockItemCard({ item, settings, onEdit }: Props) {
  const isLow = item.currentStock <= item.lowStockThreshold;

  return (
    <button
      onClick={onEdit}
      className="w-full flex items-center gap-3 bg-white rounded-2xl border border-gray-100 p-3 tap-scale text-left"
    >
      <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center shrink-0 overflow-hidden">
        {item.photoPath ? (
          <img src={item.photoPath} alt={item.name} className="w-full h-full object-cover" />
        ) : (
          <ImageIcon size={18} className="text-gray-300" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-bold text-gray-900 truncate">
          {item.name}
          {item.variant ? <span className="text-gray-400 font-medium"> · {item.variant}</span> : null}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className={`text-[11px] font-semibold ${isLow ? 'text-red-500' : 'text-gray-400'}`}>
            {item.currentStock} {item.unit} left
          </span>
          {isLow && (
            <span className="text-[9px] font-bold bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full">LOW</span>
          )}
        </div>
      </div>
      <div className="text-right shrink-0">
        <p className="text-[13px] font-bold text-gray-900">{formatCurrency(item.sellPrice, settings.currency)}</p>
        <p className="text-[10px] text-gray-400">cost {formatCurrency(item.purchasePrice, settings.currency)}</p>
      </div>
      <Pencil size={14} className="text-gray-300 shrink-0" />
    </button>
  );
}
