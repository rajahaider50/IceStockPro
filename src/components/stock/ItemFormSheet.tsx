import { useEffect, useState } from 'react';
import { Trash2 } from 'lucide-react';
import BottomSheet from '../common/BottomSheet';
import ConfirmDialog from '../common/ConfirmDialog';
import NumberInput from '../common/NumberInput';
import PhotoPicker from '../common/PhotoPicker';
import type { StockItem, ItemCategory, Unit } from '../../types';
import { CATEGORY_LABELS } from '../../types';
import { addItem, updateItem, deleteItem } from '../../db/queries';
import { useAppStore } from '../../store/useAppStore';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  editingItem: StockItem | null;
}

const categories: ItemCategory[] = [
  'ice_cream_cup', 'juice_cup', 'cone', 'stick', 'spoon', 'shopper', 'rubber_band', 'flavor', 'syrup', 'other',
];
const units: Unit[] = ['piece', 'ml', 'liter', 'gram', 'kg'];

const emptyForm = {
  name: '',
  variant: '',
  category: 'ice_cream_cup' as ItemCategory,
  unit: 'piece' as Unit,
  currentStock: 0,
  lowStockThreshold: 10,
  purchasePrice: 0,
  sellPrice: 0,
  photoPath: '',
};

export default function ItemFormSheet({ isOpen, onClose, editingItem }: Props) {
  const [form, setForm] = useState(emptyForm);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [saving, setSaving] = useState(false);
  const showToast = useAppStore((s) => s.showToast);
  const triggerRefresh = useAppStore((s) => s.triggerRefresh);

  useEffect(() => {
    if (editingItem) {
      setForm({
        name: editingItem.name,
        variant: editingItem.variant || '',
        category: editingItem.category,
        unit: editingItem.unit,
        currentStock: editingItem.currentStock,
        lowStockThreshold: editingItem.lowStockThreshold,
        purchasePrice: editingItem.purchasePrice,
        sellPrice: editingItem.sellPrice,
        photoPath: editingItem.photoPath || '',
      });
    } else {
      setForm(emptyForm);
    }
  }, [editingItem, isOpen]);

  async function handleSave() {
    if (!form.name.trim()) {
      showToast('Item name is required', 'error');
      return;
    }
    setSaving(true);
    try {
      if (editingItem?.id) {
        await updateItem(editingItem.id, { ...form, variant: form.variant || undefined });
        showToast('Item updated');
      } else {
        await addItem({
          ...form,
          variant: form.variant || undefined,
          isActive: true,
        });
        showToast('Item added');
      }
      triggerRefresh();
      onClose();
    } catch {
      showToast('Failed to save item', 'error');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (editingItem?.id) {
      await deleteItem(editingItem.id);
      showToast('Item removed');
      triggerRefresh();
    }
    setConfirmDelete(false);
    onClose();
  }

  return (
    <>
      <BottomSheet isOpen={isOpen} onClose={onClose} title={editingItem ? 'Edit Item' : 'Add New Item'}>
        <div className="flex flex-col gap-4 pb-6">
          <PhotoPicker value={form.photoPath} onChange={(p) => setForm((f) => ({ ...f, photoPath: p }))} />

          <Field label="Item Name">
            <input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Ice Cream Cup"
              className="input-field"
            />
          </Field>

          <Field label="Variant (optional)">
            <input
              value={form.variant}
              onChange={(e) => setForm((f) => ({ ...f, variant: e.target.value }))}
              placeholder="e.g. 20 Rs, Mango, Large"
              className="input-field"
            />
          </Field>

          <Field label="Category">
            <select
              value={form.category}
              onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as ItemCategory }))}
              className="input-field"
            >
              {categories.map((c) => (
                <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>
              ))}
            </select>
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Unit">
              <select
                value={form.unit}
                onChange={(e) => setForm((f) => ({ ...f, unit: e.target.value as Unit }))}
                className="input-field"
              >
                {units.map((u) => <option key={u} value={u}>{u}</option>)}
              </select>
            </Field>
            <Field label="Current Stock">
              <NumberInput value={form.currentStock} onChange={(v) => setForm((f) => ({ ...f, currentStock: v }))} />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Purchase Price">
              <NumberInput value={form.purchasePrice} onChange={(v) => setForm((f) => ({ ...f, purchasePrice: v }))} />
            </Field>
            <Field label="Sell Price">
              <NumberInput value={form.sellPrice} onChange={(v) => setForm((f) => ({ ...f, sellPrice: v }))} />
            </Field>
          </div>

          <Field label="Low Stock Alert Threshold">
            <NumberInput value={form.lowStockThreshold} onChange={(v) => setForm((f) => ({ ...f, lowStockThreshold: v }))} />
          </Field>

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full py-3.5 rounded-2xl bg-brand-500 text-white font-bold text-[14px] tap-scale mt-2 disabled:opacity-60"
          >
            {saving ? 'Saving...' : editingItem ? 'Update Item' : 'Add Item'}
          </button>

          {editingItem && (
            <button
              onClick={() => setConfirmDelete(true)}
              className="w-full py-3 rounded-2xl bg-red-50 text-red-600 font-semibold text-[13px] flex items-center justify-center gap-2 tap-scale"
            >
              <Trash2 size={15} /> Remove Item
            </button>
          )}
        </div>
      </BottomSheet>

      <ConfirmDialog
        isOpen={confirmDelete}
        title="Remove this item?"
        message="This item will be removed from active stock. Past sales/purchase history stays intact."
        confirmLabel="Remove"
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(false)}
      />
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-[11.5px] font-semibold text-gray-500 mb-1.5 block">{label}</label>
      {children}
    </div>
  );
}
