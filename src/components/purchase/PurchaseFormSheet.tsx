import { useEffect, useState } from 'react';
import { Settings2, Plus } from 'lucide-react';
import BottomSheet from '../common/BottomSheet';
import NumberInput from '../common/NumberInput';
import PhotoPicker from '../common/PhotoPicker';
import ItemFormSheet from '../stock/ItemFormSheet';
import { getAllItems, addPurchase } from '../../db/queries';
import { useAppStore } from '../../store/useAppStore';
import type { StockItem } from '../../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function PurchaseFormSheet({ isOpen, onClose }: Props) {
  const [items, setItems] = useState<StockItem[]>([]);
  const [itemId, setItemId] = useState<number | null>(null);
  const [quantity, setQuantity] = useState(0);
  const [purchasePrice, setPurchasePrice] = useState(0);
  const [supplierName, setSupplierName] = useState('');
  const [notes, setNotes] = useState('');
  const [receiptPhoto, setReceiptPhoto] = useState('');
  const [saving, setSaving] = useState(false);
  const [itemFormOpen, setItemFormOpen] = useState(false);
  const [editingExistingItem, setEditingExistingItem] = useState<StockItem | null>(null);
  const showToast = useAppStore((s) => s.showToast);
  const triggerRefresh = useAppStore((s) => s.triggerRefresh);
  const appRefreshKey = useAppStore((s) => s.refreshKey);

  async function reloadItems(preferId?: number) {
    const all = await getAllItems();
    setItems(all);
    if (preferId) {
      setItemId(preferId);
    } else if (all.length > 0 && !itemId) {
      setItemId(all[0].id!);
    }
  }

  useEffect(() => {
    if (isOpen) {
      reloadItems();
      setQuantity(0);
      setSupplierName('');
      setNotes('');
      setReceiptPhoto('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  useEffect(() => {
    if (!itemFormOpen) reloadItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemFormOpen, appRefreshKey]);

  useEffect(() => {
    const selected = items.find((i) => i.id === itemId);
    if (selected) setPurchasePrice(selected.purchasePrice);
  }, [itemId, items]);

  async function handleSave() {
    if (!itemId || quantity <= 0) {
      showToast('Select item and quantity', 'error');
      return;
    }
    const item = items.find((i) => i.id === itemId);
    if (!item) return;
    setSaving(true);
    try {
      await addPurchase({
        itemId,
        itemNameSnapshot: item.variant ? `${item.name} (${item.variant})` : item.name,
        quantity,
        purchasePrice,
        supplierName: supplierName || undefined,
        date: Date.now(),
        receiptPhotoPath: receiptPhoto || undefined,
        notes: notes || undefined,
      });
      showToast('Purchase recorded, stock updated');
      triggerRefresh();
      onClose();
    } catch {
      showToast('Failed to save purchase', 'error');
    } finally {
      setSaving(false);
    }
  }

  const selectedItem = items.find((i) => i.id === itemId) || null;

  return (
    <>
      <BottomSheet isOpen={isOpen} onClose={onClose} title="Record Purchase">
        <div className="flex flex-col gap-4 pb-6">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[11.5px] font-semibold text-gray-500">Item</label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => { setEditingExistingItem(selectedItem); setItemFormOpen(true); }}
                  disabled={!selectedItem}
                  className="flex items-center gap-1 text-[11px] font-semibold text-brand-600 tap-scale disabled:opacity-30"
                >
                  <Settings2 size={12} /> Edit
                </button>
                <button
                  onClick={() => { setEditingExistingItem(null); setItemFormOpen(true); }}
                  className="flex items-center gap-1 text-[11px] font-semibold text-brand-600 tap-scale"
                >
                  <Plus size={12} /> New Item
                </button>
              </div>
            </div>
            {items.length === 0 ? (
              <button
                onClick={() => { setEditingExistingItem(null); setItemFormOpen(true); }}
                className="w-full input-field text-left text-gray-400"
              >
                No items yet — tap "New Item" to create one
              </button>
            ) : (
              <select value={itemId ?? ''} onChange={(e) => setItemId(Number(e.target.value))} className="input-field">
                {items.map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.name}{i.variant ? ` (${i.variant})` : ''} — {i.currentStock} {i.unit} left
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11.5px] font-semibold text-gray-500 mb-1.5 block">Quantity Bought</label>
              <NumberInput value={quantity} onChange={setQuantity} />
            </div>
            <div>
              <label className="text-[11.5px] font-semibold text-gray-500 mb-1.5 block">Unit Cost</label>
              <NumberInput value={purchasePrice} onChange={setPurchasePrice} />
            </div>
          </div>

          <div className="bg-brand-50 rounded-xl px-3.5 py-2.5 text-[12.5px] font-semibold text-brand-700">
            Total Cost: {(quantity * purchasePrice).toLocaleString()}
          </div>

          <div>
            <label className="text-[11.5px] font-semibold text-gray-500 mb-1.5 block">Supplier (optional)</label>
            <input value={supplierName} onChange={(e) => setSupplierName(e.target.value)} placeholder="Shop / supplier name" className="input-field" />
          </div>

          <div>
            <label className="text-[11.5px] font-semibold text-gray-500 mb-1.5 block">Notes (optional)</label>
            <input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Any notes" className="input-field" />
          </div>

          <div>
            <label className="text-[11.5px] font-semibold text-gray-500 mb-1.5 block text-center">Receipt Photo (optional)</label>
            <PhotoPicker value={receiptPhoto} onChange={setReceiptPhoto} size={64} />
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full py-3.5 rounded-2xl bg-brand-500 text-white font-bold text-[14px] tap-scale disabled:opacity-60"
          >
            {saving ? 'Saving...' : 'Save Purchase'}
          </button>
        </div>
      </BottomSheet>

      <ItemFormSheet
        isOpen={itemFormOpen}
        onClose={() => setItemFormOpen(false)}
        editingItem={editingExistingItem}
      />
    </>
  );
}
