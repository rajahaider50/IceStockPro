import { useEffect, useState } from 'react';
import { Search, Plus, Phone, Trash2 } from 'lucide-react';
import BottomSheet from '../common/BottomSheet';
import ConfirmDialog from '../common/ConfirmDialog';
import { getAllCustomersWithBalances, addCustomer, deleteCustomer } from '../../db/queries';
import { useAppStore } from '../../store/useAppStore';
import { formatCurrency } from '../../utils/calculations';

type CustomerWithBalance = {
  id?: number;
  name: string;
  phone?: string;
  note?: string;
  createdAt: number;
  balance: number;
};

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onLedgerOpen: (customerId: number) => void;
}

export default function CustomersSheet({ isOpen, onClose, onLedgerOpen }: Props) {
  const [customers, setCustomers] = useState<CustomerWithBalance[]>([]);
  const [search, setSearch] = useState('');
  const [addOpen, setAddOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [deleting, setDeleting] = useState<CustomerWithBalance | null>(null);
  const showToast = useAppStore((s) => s.showToast);
  const currency = useAppStore((s) => s.settings?.currency || 'Rs');

  useEffect(() => {
    if (isOpen) loadCustomers();
  }, [isOpen]);

  async function loadCustomers() {
    const list = await getAllCustomersWithBalances();
    setCustomers(list);
  }

  async function handleAdd() {
    if (!newName.trim()) return;
    try {
      await addCustomer({ name: newName.trim(), phone: newPhone.trim() || undefined });
      setNewName('');
      setNewPhone('');
      setAddOpen(false);
      showToast('Customer added');
      loadCustomers();
    } catch (err: any) {
      showToast(err.message || 'Failed to add', 'error');
    }
  }

  async function handleDelete() {
    if (!deleting?.id) return;
    try {
      await deleteCustomer(deleting.id);
      showToast('Customer deleted');
      setDeleting(null);
      loadCustomers();
    } catch (err: any) {
      showToast(err.message || 'Cannot delete', 'error');
      setDeleting(null);
    }
  }

  const filtered = customers.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.phone?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Customers / گاہک">
      <div className="flex flex-col gap-3 pb-2">
        {/* Search */}
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search customers..."
            className="input-field pl-9"
          />
        </div>

        {/* Add button */}
        {!addOpen ? (
          <button
            onClick={() => setAddOpen(true)}
            className="w-full py-3 rounded-2xl bg-brand-50 text-brand-600 font-semibold text-[13px] flex items-center justify-center gap-2 tap-scale border border-dashed border-brand-200"
          >
            <Plus size={15} /> Add Customer
          </button>
        ) : (
          <div className="bg-gray-50 rounded-2xl p-3 flex flex-col gap-2">
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Customer name *"
              className="input-field"
              autoFocus
            />
            <input
              value={newPhone}
              onChange={(e) => setNewPhone(e.target.value)}
              placeholder="Phone (optional)"
              className="input-field"
              type="tel"
            />
            <div className="flex gap-2">
              <button onClick={() => { setAddOpen(false); setNewName(''); setNewPhone(''); }}
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

        {/* Customer list */}
        {filtered.length === 0 ? (
          <p className="text-center text-gray-400 text-[13px] py-6">
            {customers.length === 0 ? 'No customers yet' : 'No matches'}
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {filtered.map((c) => (
              <div key={c.id} className="flex items-center gap-3 bg-white border border-gray-100 rounded-2xl p-3">
                <button
                  onClick={() => c.id && onLedgerOpen(c.id)}
                  className="flex-1 min-w-0 text-left tap-scale"
                >
                  <p className="text-[13px] font-bold text-gray-900 truncate">{c.name}</p>
                  {c.phone && <p className="text-[11px] text-gray-400">{c.phone}</p>}
                </button>
                <span className={`text-[13px] font-bold shrink-0 ${c.balance > 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                  {c.balance > 0 ? formatCurrency(c.balance, currency) : 'Clear'}
                </span>
                {c.phone && (
                  <a href={`tel:${c.phone}`} className="tap-scale">
                    <Phone size={14} className="text-brand-500" />
                  </a>
                )}
                <button onClick={() => setDeleting(c)} className="tap-scale">
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
        message={deleting && deleting.balance > 0
          ? 'Cannot delete customer with outstanding balance. Collect payment first.'
          : 'This will permanently remove this customer.'}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleting(null)}
      />
    </BottomSheet>
  );
}
