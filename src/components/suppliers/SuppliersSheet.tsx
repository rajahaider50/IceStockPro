import { useEffect, useState } from 'react';
import { Plus, Phone, Edit2, Trash2 } from 'lucide-react';
import BottomSheet from '../common/BottomSheet';
import ConfirmDialog from '../common/ConfirmDialog';
import { addSupplier, updateSupplier, deleteSupplier, getSupplierPurchaseStats } from '../../db/queries';
import { useAppStore } from '../../store/useAppStore';
import { formatCurrency } from '../../utils/calculations';
import type { Supplier } from '../../types';

type SupplierWithStats = Supplier & { totalPurchased: number; purchaseCount: number };

interface Props {
  isOpen: boolean;
  onClose: () => void;
  settings: { currency: string };
}

export default function SuppliersSheet({ isOpen, onClose, settings }: Props) {
  const [suppliers, setSuppliers] = useState<SupplierWithStats[]>([]);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Supplier | null>(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [note, setNote] = useState('');
  const [deleting, setDeleting] = useState<SupplierWithStats | null>(null);
  const showToast = useAppStore((s) => s.showToast);

  useEffect(() => {
    if (isOpen) load();
  }, [isOpen]);

  async function load() {
    setSuppliers(await getSupplierPurchaseStats());
  }

  function openAdd() {
    setEditing(null);
    setName('');
    setPhone('');
    setNote('');
    setFormOpen(true);
  }

  function openEdit(s: Supplier) {
    setEditing(s);
    setName(s.name);
    setPhone(s.phone || '');
    setNote(s.note || '');
    setFormOpen(true);
  }

  async function handleSave() {
    if (!name.trim()) return;
    try {
      if (editing?.id) {
        await updateSupplier(editing.id, { name: name.trim(), phone: phone.trim() || undefined, note: note.trim() || undefined });
        showToast('Supplier updated');
      } else {
        await addSupplier({ name: name.trim(), phone: phone.trim() || undefined, note: note.trim() || undefined });
        showToast('Supplier added');
      }
      setFormOpen(false);
      setEditing(null);
      setName('');
      setPhone('');
      setNote('');
      load();
    } catch (err: any) {
      showToast(err.message || 'Failed', 'error');
    }
  }

  async function handleDelete() {
    if (!deleting?.id) return;
    await deleteSupplier(deleting.id);
    showToast('Supplier deleted');
    setDeleting(null);
    load();
  }

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Suppliers / سپلائرز">
      <div className="flex flex-col gap-3 pb-2">
        {!formOpen ? (
          <button onClick={openAdd}
            className="w-full py-3 rounded-2xl bg-brand-50 text-brand-600 font-semibold text-[13px] flex items-center justify-center gap-2 tap-scale border border-dashed border-brand-200">
            <Plus size={15} /> Add Supplier
          </button>
        ) : (
          <div className="bg-gray-50 rounded-2xl p-3 flex flex-col gap-2">
            <input value={name} onChange={(e) => setName(e.target.value)}
              placeholder="Supplier name *" className="input-field" autoFocus />
            <input value={phone} onChange={(e) => setPhone(e.target.value)}
              placeholder="Phone (optional)" className="input-field" type="tel" />
            <input value={note} onChange={(e) => setNote(e.target.value)}
              placeholder="Note (optional)" className="input-field" />
            <div className="flex gap-2">
              <button onClick={() => { setFormOpen(false); setEditing(null); }}
                className="flex-1 py-2.5 rounded-xl bg-gray-100 text-gray-600 text-[12px] font-semibold tap-scale">
                Cancel
              </button>
              <button onClick={handleSave}
                className="flex-1 py-2.5 rounded-xl bg-brand-500 text-white text-[12px] font-semibold tap-scale">
                {editing ? 'Update' : 'Save'}
              </button>
            </div>
          </div>
        )}

        {suppliers.length === 0 ? (
          <p className="text-center text-gray-400 text-[13px] py-6">No suppliers yet</p>
        ) : (
          <div className="flex flex-col gap-2">
            {suppliers.map((s) => (
              <div key={s.id} className="flex items-center gap-3 bg-white border border-gray-100 rounded-xl p-3">
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-bold text-gray-900 truncate">{s.name}</p>
                  {s.phone && <p className="text-[11px] text-gray-400">{s.phone}</p>}
                  <p className="text-[10.5px] text-gray-400">
                    {s.purchaseCount} purchases · {formatCurrency(s.totalPurchased, settings.currency)}
                  </p>
                </div>
                {s.phone && (
                  <a href={`tel:${s.phone}`} className="tap-scale">
                    <Phone size={14} className="text-brand-500" />
                  </a>
                )}
                <button onClick={() => openEdit(s)} className="tap-scale">
                  <Edit2 size={14} className="text-gray-400" />
                </button>
                <button onClick={() => setDeleting(s)} className="tap-scale">
                  <Trash2 size={14} className="text-red-400" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={!!deleting}
        title={`Delete ${deleting?.name}?`}
        message="This supplier will be permanently removed."
        onConfirm={handleDelete}
        onCancel={() => setDeleting(null)}
      />
    </BottomSheet>
  );
}
