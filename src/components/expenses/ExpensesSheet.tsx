import { useEffect, useState } from 'react';
import { Plus, Trash2, Zap, Home, Users, Truck, HelpCircle } from 'lucide-react';
import BottomSheet from '../common/BottomSheet';
import ConfirmDialog from '../common/ConfirmDialog';
import { addExpense, getAllExpenses, deleteExpense } from '../../db/queries';
import { useAppStore } from '../../store/useAppStore';
import { formatCurrency, formatDate } from '../../utils/calculations';
import type { Expense, ExpenseCategory } from '../../types';

const CATEGORIES: { key: ExpenseCategory; label: string; icon: typeof Zap; color: string }[] = [
  { key: 'electricity', label: 'Bijli', icon: Zap, color: 'bg-yellow-100 text-yellow-600' },
  { key: 'rent', label: 'Rent', icon: Home, color: 'bg-blue-100 text-blue-600' },
  { key: 'salary', label: 'Salary', icon: Users, color: 'bg-purple-100 text-purple-600' },
  { key: 'transport', label: 'Transport', icon: Truck, color: 'bg-orange-100 text-orange-600' },
  { key: 'other', label: 'Other', icon: HelpCircle, color: 'bg-gray-100 text-gray-600' },
];

interface Props {
  isOpen: boolean;
  onClose: () => void;
  settings: { currency: string };
}

export default function ExpensesSheet({ isOpen, onClose, settings }: Props) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [formOpen, setFormOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('other');
  const [amount, setAmount] = useState('');
  const [deleting, setDeleting] = useState<Expense | null>(null);
  const showToast = useAppStore((s) => s.showToast);

  useEffect(() => {
    if (isOpen) load();
  }, [isOpen]);

  async function load() {
    const all = await getAllExpenses();
    setExpenses(all);
  }

  async function handleAdd() {
    const amt = parseFloat(amount);
    if (!title.trim() || !amt || amt <= 0) return;
    await addExpense({ title: title.trim(), category, amount: amt });
    showToast('Expense added');
    setTitle('');
    setAmount('');
    setCategory('other');
    setFormOpen(false);
    load();
  }

  async function handleDelete() {
    if (!deleting?.id) return;
    await deleteExpense(deleting.id);
    showToast('Expense deleted');
    setDeleting(null);
    load();
  }

  const total = expenses.reduce((s, e) => s + e.amount, 0);

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Expenses / اخراجات">
      <div className="flex flex-col gap-3 pb-2">
        {/* Total card */}
        <div className="bg-red-50 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <p className="text-[11px] text-red-400 font-medium">Total Expenses</p>
            <p className="text-[20px] font-bold text-red-600">{formatCurrency(total, settings.currency)}</p>
          </div>
          <p className="text-[11px] text-red-400">{expenses.length} entries</p>
        </div>

        {/* Add button / form */}
        {!formOpen ? (
          <button
            onClick={() => setFormOpen(true)}
            className="w-full py-3 rounded-2xl bg-red-50 text-red-600 font-semibold text-[13px] flex items-center justify-center gap-2 tap-scale border border-dashed border-red-200"
          >
            <Plus size={15} /> Add Expense
          </button>
        ) : (
          <div className="bg-gray-50 rounded-2xl p-3 flex flex-col gap-2">
            <input value={title} onChange={(e) => setTitle(e.target.value)}
              placeholder="Expense title *" className="input-field" autoFocus />
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((c) => {
                const Icon = c.icon;
                return (
                  <button key={c.key} onClick={() => setCategory(c.key)}
                    className={`px-3 py-1.5 rounded-full text-[11px] font-semibold tap-scale flex items-center gap-1 ${
                      category === c.key ? 'bg-brand-500 text-white' : `bg-white border border-gray-200 text-gray-600`
                    }`}>
                    <Icon size={12} /> {c.label}
                  </button>
                );
              })}
            </div>
            <input value={amount} onChange={(e) => setAmount(e.target.value)}
              placeholder="Amount *" type="number" className="input-field" />
            <div className="flex gap-2">
              <button onClick={() => { setFormOpen(false); setTitle(''); setAmount(''); setCategory('other'); }}
                className="flex-1 py-2.5 rounded-xl bg-gray-100 text-gray-600 text-[12px] font-semibold tap-scale">
                Cancel
              </button>
              <button onClick={handleAdd}
                className="flex-1 py-2.5 rounded-xl bg-brand-500 text-white text-[12px] font-semibold tap-scale">
                Save
              </button>
            </div>
          </div>
        )}

        {/* Expense list */}
        {expenses.length === 0 ? (
          <p className="text-center text-gray-400 text-[13px] py-6">No expenses recorded</p>
        ) : (
          <div className="flex flex-col gap-2">
            {expenses.map((e) => {
              const cat = CATEGORIES.find((c) => c.key === e.category);
              const Icon = cat?.icon || HelpCircle;
              return (
                <div key={e.id} className="flex items-center gap-3 bg-white border border-gray-100 rounded-xl p-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${cat?.color || 'bg-gray-100 text-gray-600'}`}>
                    <Icon size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12.5px] font-semibold text-gray-800 truncate">{e.title}</p>
                    <p className="text-[10.5px] text-gray-400">{cat?.label} · {formatDate(e.date)}</p>
                  </div>
                  <p className="text-[13px] font-bold text-red-600 shrink-0">
                    {formatCurrency(e.amount, settings.currency)}
                  </p>
                  <button onClick={() => setDeleting(e)} className="tap-scale">
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
        title="Delete this expense?"
        message="This expense will be permanently removed from your records."
        onConfirm={handleDelete}
        onCancel={() => setDeleting(null)}
      />
    </BottomSheet>
  );
}
