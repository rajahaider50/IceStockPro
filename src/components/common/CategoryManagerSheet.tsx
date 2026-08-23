import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Tag, IceCreamCone, GlassWater, Layers } from 'lucide-react';
import BottomSheet from './BottomSheet';
import ConfirmDialog from './ConfirmDialog';
import { getAllCategories, addCategory, updateCategory, deleteCategory } from '../../db/queries';
import { useAppStore } from '../../store/useAppStore';
import type { Category, MachineScope } from '../../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const scopeOptions: { value: MachineScope; label: string; icon: typeof Tag }[] = [
  { value: 'ice_cream', label: 'Ice Cream', icon: IceCreamCone },
  { value: 'juice', label: 'Juice', icon: GlassWater },
  { value: 'both', label: 'Both', icon: Layers },
];

export default function CategoryManagerSheet({ isOpen, onClose }: Props) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [name, setName] = useState('');
  const [scope, setScope] = useState<MachineScope>('both');
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [blockedMsg, setBlockedMsg] = useState('');
  const showToast = useAppStore((s) => s.showToast);
  const triggerRefresh = useAppStore((s) => s.triggerRefresh);

  async function load() {
    const all = await getAllCategories();
    setCategories(all);
  }

  useEffect(() => {
    if (isOpen) load();
  }, [isOpen]);

  function openAddForm() {
    setEditing(null);
    setName('');
    setScope('both');
    setFormOpen(true);
  }

  function openEditForm(cat: Category) {
    setEditing(cat);
    setName(cat.name);
    setScope(cat.machineType);
    setFormOpen(true);
  }

  async function handleSave() {
    if (!name.trim()) {
      showToast('Category name is required', 'error');
      return;
    }
    try {
      if (editing?.id) {
        await updateCategory(editing.id, { name: name.trim(), machineType: scope });
        showToast('Category updated');
      } else {
        await addCategory({ name: name.trim(), machineType: scope, isBuiltIn: false });
        showToast('Category added');
      }
      setFormOpen(false);
      triggerRefresh();
      load();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to save', 'error');
    }
  }

  async function handleDeleteConfirm() {
    if (!deleteTarget?.id) return;
    const result = await deleteCategory(deleteTarget.id);
    if (result.blocked) {
      setBlockedMsg(`Cannot delete — ${result.count} item(s) still use "${deleteTarget.name}". Move or delete those items first.`);
      setDeleteTarget(null);
      return;
    }
    showToast('Category deleted');
    setDeleteTarget(null);
    triggerRefresh();
    load();
  }

  return (
    <>
      <BottomSheet isOpen={isOpen} onClose={onClose} title="Manage Categories">
        <div className="flex flex-col gap-2 pb-4">
          <button
            onClick={openAddForm}
            className="w-full flex items-center gap-3 bg-brand-50 rounded-2xl p-3.5 tap-scale mb-1"
          >
            <div className="w-8 h-8 rounded-xl bg-brand-500 flex items-center justify-center shrink-0">
              <Plus size={16} className="text-white" />
            </div>
            <span className="text-[13px] font-bold text-brand-700">Add New Category</span>
          </button>

          {categories.map((cat) => {
            const scopeInfo = scopeOptions.find((s) => s.value === cat.machineType) ?? scopeOptions[2];
            const ScopeIcon = scopeInfo.icon;
            return (
              <div key={cat.id} className="flex items-center gap-3 bg-white rounded-2xl border border-gray-100 p-3">
                <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
                  <ScopeIcon size={16} className="text-gray-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-bold text-gray-900 truncate">{cat.name}</p>
                  <p className="text-[10.5px] text-gray-400">{scopeInfo.label}</p>
                </div>
                <button onClick={() => openEditForm(cat)} className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center tap-scale">
                  <Pencil size={13} className="text-gray-500" />
                </button>
                <button onClick={() => setDeleteTarget(cat)} className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center tap-scale">
                  <Trash2 size={13} className="text-red-500" />
                </button>
              </div>
            );
          })}
        </div>
      </BottomSheet>

      {/* Add/Edit category inline sheet */}
      {formOpen && (
        <div className="fixed inset-0 z-[65] flex items-end justify-center">
          <div className="absolute inset-0 bg-black/40 animate-fade-in" onClick={() => setFormOpen(false)} />
          <div className="relative w-full max-w-lg bg-white rounded-t-3xl animate-slide-up p-5 safe-bottom">
            <div className="flex items-center justify-center pb-3">
              <div className="w-9 h-1 rounded-full bg-gray-300" />
            </div>
            <p className="text-[15px] font-bold text-gray-900 mb-4">{editing ? 'Edit Category' : 'New Category'}</p>

            <label className="text-[11.5px] font-semibold text-gray-500 mb-1.5 block">Category Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Wafer Cone, Straws"
              className="input-field mb-4"
              autoFocus
            />

            <label className="text-[11.5px] font-semibold text-gray-500 mb-1.5 block">Belongs To</label>
            <div className="flex gap-2 mb-5">
              {scopeOptions.map((opt) => {
                const Icon = opt.icon;
                const active = scope === opt.value;
                return (
                  <button
                    key={opt.value}
                    onClick={() => setScope(opt.value)}
                    className={`flex-1 py-2.5 rounded-xl flex flex-col items-center gap-1 tap-scale ${
                      active ? 'bg-brand-500 text-white' : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    <Icon size={16} />
                    <span className="text-[11px] font-semibold">{opt.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="flex gap-2">
              <button onClick={() => setFormOpen(false)} className="flex-1 py-3 rounded-2xl bg-gray-100 text-gray-700 font-semibold text-[13px] tap-scale">
                Cancel
              </button>
              <button onClick={handleSave} className="flex-1 py-3 rounded-2xl bg-brand-500 text-white font-bold text-[13px] tap-scale">
                {editing ? 'Update' : 'Add'}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={!!deleteTarget}
        title={`Delete "${deleteTarget?.name}"?`}
        message="This category will be permanently removed."
        confirmLabel="Delete"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />

      <ConfirmDialog
        isOpen={!!blockedMsg}
        title="Cannot Delete Category"
        message={blockedMsg}
        confirmLabel="Got it"
        danger={false}
        onConfirm={() => setBlockedMsg('')}
        onCancel={() => setBlockedMsg('')}
      />
    </>
  );
}
