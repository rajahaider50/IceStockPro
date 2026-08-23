import { useEffect, useState } from 'react';
import { Camera } from 'lucide-react';
import BottomSheet from '../common/BottomSheet';
import { getAllItems, addPurchase } from '../../db/queries';
import { fileToCompressedBase64 } from '../../utils/photoStorage';
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
  const showToast = useAppStore((s) => s.showToast);
  const triggerRefresh = useAppStore((s) => s.triggerRefresh);

  useEffect(() => {
    if (isOpen) {
      getAllItems().then((all) => {
        setItems(all);
        if (all.length > 0 && !itemId) setItemId(all[0].id!);
      });
      setQuantity(0);
      setSupplierName('');
      setNotes('');
      setReceiptPhoto('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  useEffect(() => {
    const selected = items.find((i) => i.id === itemId);
    if (selected) setPurchasePrice(selected.purchasePrice);
  }, [itemId, items]);

  async function handlePhotoSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const base64 = await fileToCompressedBase64(file);
      setReceiptPhoto(base64);
    } catch {
      showToast('Photo select failed', 'error');
    }
  }

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

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Record Purchase">
      <div className="flex flex-col gap-4 pb-6">
        <div>
          <label className="text-[11.5px] font-semibold text-gray-500 mb-1.5 block">Item</label>
          <select value={itemId ?? ''} onChange={(e) => setItemId(Number(e.target.value))} className="input-field">
            {items.map((i) => (
              <option key={i.id} value={i.id}>
                {i.name}{i.variant ? ` (${i.variant})` : ''} — {i.currentStock} {i.unit} left
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[11.5px] font-semibold text-gray-500 mb-1.5 block">Quantity Bought</label>
            <input type="number" inputMode="decimal" value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} className="input-field" />
          </div>
          <div>
            <label className="text-[11.5px] font-semibold text-gray-500 mb-1.5 block">Unit Cost</label>
            <input type="number" inputMode="decimal" value={purchasePrice} onChange={(e) => setPurchasePrice(Number(e.target.value))} className="input-field" />
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

        <div className="flex justify-center">
          <label className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center overflow-hidden relative cursor-pointer tap-scale">
            {receiptPhoto ? (
              <img src={receiptPhoto} className="w-full h-full object-cover" alt="" />
            ) : (
              <Camera size={18} className="text-gray-400" />
            )}
            <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handlePhotoSelect} />
          </label>
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
  );
}
