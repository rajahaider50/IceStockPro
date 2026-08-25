import { useEffect, useState } from 'react';
import { Plus, Trash2, AlertTriangle } from 'lucide-react';
import BottomSheet from '../common/BottomSheet';
import ConfirmDialog from '../common/ConfirmDialog';
import { getAllItems, addWastage, getAllWastage, deleteWastage } from '../../db/queries';
import { useAppStore } from '../../store/useAppStore';
import { formatCurrency, formatDate } from '../../utils/calculations';
import type { StockItem, WastageRecord, WastageReason } from '../../types';

const REASONS: { key: WastageReason; label: string; ur: string }[] = [
  { key: 'melted', label: 'Melted', ur: 'پگھلا' },
  { key: 'damaged', label: 'Damaged', ur: 'خراب' },
  { key: 'expired', label: 'Expired', ur: 'میعاد ختم' },
  { key: 'other', label: 'Other', ur: 'دیگر' },
];

interface Props {
  isOpen: boolean;
  onClose: () => void;
  settings: { currency: string };
}

export default function WastageSheet({ isOpen, onClose, settings }: Props) {
  const [items, setItems] = useState<StockItem[]>([]);
  const [records, setRecords] = useState<WastageRecord[]>([]);
  const [formOpen, setFormOpen] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
  const [qty, setQty] = useState(1);
  const [reason, setReason] = useState<WastageReason>('melted');
  const [deleting, setDeleting] = useState<WastageRecord | null>(null);
  const showToast = useAppStore((s) => s.showToast);

  useEffect(() => {
    if (isOpen) load();
  }, [isOpen]);

  async function load() {
    const [allItems, allRecords] = await Promise.all([getAllItems(), getAllWastage()]);
    setItems(allItems);
    setRecords(allRecords);
  }

  async function handleAdd() {
    if (!selectedItemId) return;
    const item = items.find((i) => i.id === selectedItemId);
    if (!item) return;
    if (qty <= 0 || qty > item.currentStock) {
      showToast(`Max stock: ${item.currentStock}`, 'error');
      return;
    }
    try {
      await addWastage({
        itemId: selectedItemId,
        itemNameSnapshot: item.variant ? `${item.name} (${item.variant})` : item.name,
        qty,
        unitCost: item.purchasePrice,
        reason,
      });
      showToast('Wastage recorded');
      setFormOpen(false);
      setSelectedItemId(null);
      setQty(1);
      setReason('melted');
      load();
    } catch (err: any) {
      showToast(err.message || 'Failed', 'error');
    }
  }

  async function handleDelete() {
    if (!deleting?.id) return;
    try {
      await deleteWastage(deleting.id);
      showToast('Wastage removed, stock restored');
      setDeleting(null);
      load();
    } catch (err: any) {
      showToast(err.message || 'Failed', 'error');
    }
  }

  const selectedItem = items.find((i) => i.id === selectedItemId);
  const previewLoss = selectedItem ? qty * selectedItem.purchasePrice : 0;
  const totalLoss = records.reduce((s, r) => s + r.totalLoss, 0);

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Wastage / ضیاع">
      <div className="flex flex-col gap-3 pb-2">
        {/* Summary */}
        <div className="bg-red-50 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <p className="text-[11px] text-red-400 font-medium">Total Loss</p>
            <p className="text-[20px] font-bold text-red-600">{formatCurrency(totalLoss, settings.currency)}</p>
          </div>
          <p className="text-[11px] text-red-400">{records.length} entries</p>
        </div>

        {/* Add form */}
        {!formOpen ? (
          <button onClick={() => setFormOpen(true)}
            className="w-full py-3 rounded-2xl bg-red-50 text-red-600 font-semibold text-[13px] flex items-center justify-center gap-2 tap-scale border border-dashed border-red-200">
            <Plus size={15} /> Record Wastage
          </button>
        ) : (
          <div className="bg-gray-50 rounded-2xl p-3 flex flex-col gap-2">
            {/* Item picker */}
            <select value={selectedItemId ?? ''} onChange={(e) => setSelectedItemId(Number(e.target.value) || null)}
              className="input-field">
              <option value="">Select item *</option>
              {items.map((i) => (
                <option key={i.id} value={i.id}>
                  {i.name}{i.variant ? ` (${i.variant})` : ''} — stock: {i.currentStock} {i.unit}
                </option>
              ))}
            </select>

            {/* Qty stepper */}
            {selectedItem && (
              <div>
                <p className="text-[11px] text-gray-500 mb-1">Quantity (max {selectedItem.currentStock})</p>
                <div className="flex items-center gap-3">
                  <button onClick={() => setQty(Math.max(1, qty - 1))}
                    className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center font-bold text-gray-600 tap-scale">-</button>
                  <span className="text-[18px] font-bold text-gray-900 w-10 text-center">{qty}</span>
                  <button onClick={() => setQty(Math.min(selectedItem.currentStock, qty + 1))}
                    className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center font-bold text-gray-600 tap-scale">+</button>
                </div>
              </div>
            )}

            {/* Reason chips */}
            <div className="flex flex-wrap gap-2">
              {REASONS.map((r) => (
                <button key={r.key} onClick={() => setReason(r.key)}
                  className={`px-3 py-1.5 rounded-full text-[11px] font-semibold tap-scale ${
                    reason === r.key ? 'bg-brand-500 text-white' : 'bg-white border border-gray-200 text-gray-600'
                  }`}>
                  {r.label} / {r.ur}
                </button>
              ))}
            </div>

            {/* Loss preview */}
            {selectedItem && (
              <div className="bg-red-50 rounded-xl p-3 flex items-center gap-2">
                <AlertTriangle size={14} className="text-red-500" />
                <p className="text-[12px] text-red-600 font-semibold">
                  Loss: {formatCurrency(previewLoss, settings.currency)}
                </p>
              </div>
            )}

            <div className="flex gap-2">
              <button onClick={() => { setFormOpen(false); setSelectedItemId(null); setQty(1); setReason('melted'); }}
                className="flex-1 py-2.5 rounded-xl bg-gray-100 text-gray-600 text-[12px] font-semibold tap-scale">
                Cancel
              </button>
              <button onClick={handleAdd}
                disabled={!selectedItemId || qty <= 0}
                className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-[12px] font-semibold tap-scale disabled:opacity-40">
                Record
              </button>
            </div>
          </div>
        )}

        {/* History */}
        {records.length === 0 ? (
          <p className="text-center text-gray-400 text-[13px] py-6">No wastage recorded</p>
        ) : (
          <div className="flex flex-col gap-2">
            {records.map((r) => {
              const reasonObj = REASONS.find((x) => x.key === r.reason);
              return (
                <div key={r.id} className="flex items-center gap-3 bg-white border border-gray-100 rounded-xl p-3">
                  <div className="w-9 h-9 rounded-xl bg-red-100 flex items-center justify-center">
                    <AlertTriangle size={15} className="text-red-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12.5px] font-semibold text-gray-800 truncate">{r.itemNameSnapshot}</p>
                    <p className="text-[10.5px] text-gray-400">
                      {r.qty} units · {reasonObj?.label} · {formatDate(r.date)}
                    </p>
                  </div>
                  <p className="text-[13px] font-bold text-red-600 shrink-0">
                    -{formatCurrency(r.totalLoss, settings.currency)}
                  </p>
                  <button onClick={() => setDeleting(r)} className="tap-scale">
                    <Trash2 size={14} className="text-red-400" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={!!deleting}
        title="Remove this wastage?"
        message="Stock will be restored for this item."
        onConfirm={handleDelete}
        onCancel={() => setDeleting(null)}
      />
    </BottomSheet>
  );
}
