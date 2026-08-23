import { useEffect, useState } from 'react';
import { Search, Plus, Package, Download } from 'lucide-react';
import StockItemCard from './StockItemCard';
import ItemFormSheet from './ItemFormSheet';
import EmptyState from '../common/EmptyState';
import { getAllItems } from '../../db/queries';
import { exportStockCSV } from '../../utils/csvExport';
import { exportStockReportPDF } from '../../utils/pdfExport';
import type { StockItem, ItemCategory, AppSettings } from '../../types';
import { CATEGORY_LABELS } from '../../types';

interface Props {
  settings: AppSettings;
  refreshKey: number;
}

export default function StockPage({ settings, refreshKey }: Props) {
  const [items, setItems] = useState<StockItem[]>([]);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState<ItemCategory | 'all'>('all');
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<StockItem | null>(null);

  useEffect(() => {
    getAllItems().then(setItems);
  }, [refreshKey, sheetOpen]);

  const categories = Array.from(new Set(items.map((i) => i.category)));
  const filtered = items.filter((i) => {
    const matchesSearch = (i.name + ' ' + (i.variant || '')).toLowerCase().includes(search.toLowerCase());
    const matchesCategory = filterCategory === 'all' || i.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const totalStockValue = items.reduce((s, i) => s + i.currentStock * i.purchasePrice, 0);

  return (
    <div className="px-4 pt-4 pb-4 max-w-lg mx-auto">
      {/* Header row */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-[11px] text-gray-400 font-medium">Total Stock Value</p>
          <p className="text-[19px] font-bold text-gray-900">
            {settings.currency} {totalStockValue.toLocaleString()}
          </p>
        </div>
        <button
          onClick={() => exportStockReportPDF(items, settings)}
          className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center tap-scale"
        >
          <Download size={16} className="text-gray-500" />
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-3">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search items..."
          className="w-full bg-white border border-gray-200 rounded-2xl pl-10 pr-4 py-2.5 text-[13.5px] outline-none focus:border-brand-400"
        />
      </div>

      {/* Category chips */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar mb-4 -mx-4 px-4">
        <Chip label="All" active={filterCategory === 'all'} onClick={() => setFilterCategory('all')} />
        {categories.map((c) => (
          <Chip key={c} label={CATEGORY_LABELS[c]} active={filterCategory === c} onClick={() => setFilterCategory(c)} />
        ))}
      </div>

      {/* Items list */}
      {filtered.length === 0 ? (
        <EmptyState icon={Package} title="No items found" subtitle="Tap the + button to add your first stock item" />
      ) : (
        <div className="flex flex-col gap-2 mb-4">
          {filtered.map((item) => (
            <StockItemCard
              key={item.id}
              item={item}
              settings={settings}
              onEdit={() => { setEditingItem(item); setSheetOpen(true); }}
            />
          ))}
        </div>
      )}

      {items.length > 0 && (
        <button
          onClick={() => exportStockCSV(items)}
          className="w-full py-2.5 rounded-xl bg-gray-50 text-gray-500 text-[12px] font-semibold border border-gray-100 mb-2"
        >
          Export Stock List (CSV)
        </button>
      )}

      {/* FAB */}
      <button
        onClick={() => { setEditingItem(null); setSheetOpen(true); }}
        className="fixed bottom-24 right-5 w-14 h-14 rounded-full bg-brand-500 shadow-xl shadow-brand-500/30 flex items-center justify-center tap-scale z-30"
      >
        <Plus size={26} className="text-white" strokeWidth={2.5} />
      </button>

      <ItemFormSheet isOpen={sheetOpen} onClose={() => setSheetOpen(false)} editingItem={editingItem} />
    </div>
  );
}

function Chip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 px-3.5 py-1.5 rounded-full text-[12px] font-semibold tap-scale ${
        active ? 'bg-brand-500 text-white' : 'bg-white border border-gray-200 text-gray-500'
      }`}
    >
      {label}
    </button>
  );
}
