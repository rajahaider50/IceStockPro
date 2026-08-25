import { useState, useEffect } from 'react';
import { Plus, Minus, Trash2, Check } from 'lucide-react';
import BottomSheet from '../common/BottomSheet';
import { useCartStore } from '../../store/useCartStore';
import { useAppStore } from '../../store/useAppStore';
import { createSale, getAllCustomers, addCustomer, addCreditEntry } from '../../db/queries';
import { formatCurrency } from '../../utils/calculations';
import type { AppSettings, PaymentMode, Customer } from '../../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
}

export default function CartSheet({ isOpen, onClose, settings }: Props) {
  const cart = useCartStore((s) => s.cart);
  const machineType = useCartStore((s) => s.machineType);
  const incrementQty = useCartStore((s) => s.incrementQty);
  const decrementQty = useCartStore((s) => s.decrementQty);
  const removeFromCart = useCartStore((s) => s.removeFromCart);
  const clearCart = useCartStore((s) => s.clearCart);
  const getTotal = useCartStore((s) => s.getTotal);
  const showToast = useAppStore((s) => s.showToast);
  const triggerRefresh = useAppStore((s) => s.triggerRefresh);
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('cash');
  const [completing, setCompleting] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);
  const [newCustomerName, setNewCustomerName] = useState('');

  const total = getTotal();

  useEffect(() => {
    if (isOpen && paymentMode === 'credit') {
      getAllCustomers().then(setCustomers);
    }
  }, [isOpen, paymentMode]);

  async function handleComplete() {
    if (cart.length === 0) return;
    if (paymentMode === 'credit' && !selectedCustomerId && !newCustomerName.trim()) {
      showToast('Select or create a customer first', 'error');
      return;
    }
    setCompleting(true);
    try {
      let customerId = selectedCustomerId;
      if (paymentMode === 'credit' && !customerId && newCustomerName.trim()) {
        try {
          customerId = await addCustomer({ name: newCustomerName.trim() });
        } catch {
          const existing = await getAllCustomers();
          const match = existing.find((c) => c.name.toLowerCase() === newCustomerName.trim().toLowerCase());
          if (match?.id) customerId = match.id;
          else {
            showToast('Failed to create customer', 'error');
            setCompleting(false);
            return;
          }
        }
      }
      const saleId = await createSale(machineType, cart, paymentMode);
      if (paymentMode === 'credit' && customerId) {
        await addCreditEntry({ customerId, type: 'credit', amount: total, saleId });
      }
      showToast('Sale completed!');
      clearCart();
      triggerRefresh();
      onClose();
    } catch {
      showToast('Failed to complete sale', 'error');
    } finally {
      setCompleting(false);
    }
  }

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Your Cart">
      {cart.length === 0 ? (
        <p className="text-center text-gray-400 text-[13px] py-10">Cart is empty</p>
      ) : (
        <div className="flex flex-col gap-3 pb-4">
          {cart.map((c) => (
            <div key={c.item.id} className="flex items-center gap-3 bg-gray-50 rounded-2xl p-3">
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-bold text-gray-900 truncate">
                  {c.item.name}{c.item.variant ? ` · ${c.item.variant}` : ''}
                </p>
                <p className="text-[11.5px] text-gray-400">
                  {formatCurrency(c.item.sellPrice, settings.currency)} each
                </p>
              </div>
              <div className="flex items-center gap-2 bg-white rounded-full px-1 py-1 border border-gray-200">
                <button onClick={() => decrementQty(c.item.id!)} className="w-6 h-6 rounded-full flex items-center justify-center tap-scale">
                  <Minus size={13} className="text-gray-500" />
                </button>
                <span className="text-[13px] font-bold w-5 text-center">{c.qty}</span>
                <button
                  onClick={() => {
                    if (c.qty >= c.item.currentStock) {
                      showToast(`Only ${c.item.currentStock} ${c.item.unit} in stock!`, 'error');
                      return;
                    }
                    incrementQty(c.item.id!);
                  }}
                  className="w-6 h-6 rounded-full flex items-center justify-center tap-scale"
                >
                  <Plus size={13} className="text-gray-500" />
                </button>
              </div>
              <p className="text-[13px] font-bold text-gray-900 w-14 text-right shrink-0">
                {formatCurrency(c.qty * c.item.sellPrice, settings.currency)}
              </p>
              <button onClick={() => removeFromCart(c.item.id!)} className="tap-scale">
                <Trash2 size={14} className="text-red-400" />
              </button>
            </div>
          ))}

          {/* Payment mode */}
          <div>
            <p className="text-[11.5px] font-semibold text-gray-500 mb-1.5">Payment Mode</p>
            <div className="flex gap-2">
              {(['cash', 'online', 'credit'] as PaymentMode[]).map((m) => (
                <button
                  key={m}
                  onClick={() => { setPaymentMode(m); setSelectedCustomerId(null); setNewCustomerName(''); }}
                  className={`flex-1 py-2 rounded-xl text-[12px] font-semibold capitalize tap-scale ${
                    paymentMode === m ? 'bg-brand-500 text-white' : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* Credit: customer picker */}
          {paymentMode === 'credit' && (
            <div>
              <p className="text-[11.5px] font-semibold text-gray-500 mb-1.5">Select Customer</p>
              <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 -mx-1 px-1">
                {customers.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => { setSelectedCustomerId(c.id!); setNewCustomerName(''); }}
                    className={`shrink-0 px-3 py-1.5 rounded-full text-[12px] font-semibold tap-scale ${
                      selectedCustomerId === c.id ? 'bg-brand-500 text-white' : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
              {!selectedCustomerId && (
                <div className="mt-2">
                  <input
                    value={newCustomerName}
                    onChange={(e) => setNewCustomerName(e.target.value)}
                    placeholder="Type new customer name..."
                    className="input-field text-[12px]"
                  />
                </div>
              )}
            </div>
          )}

          {/* Total + confirm */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <span className="text-[13px] font-semibold text-gray-500">Total</span>
            <span className="text-[20px] font-bold text-gray-900">{formatCurrency(total, settings.currency)}</span>
          </div>
          <button
            onClick={handleComplete}
            disabled={completing}
            className="w-full py-3.5 rounded-2xl bg-emerald-500 text-white font-bold text-[14px] flex items-center justify-center gap-2 tap-scale disabled:opacity-60"
          >
            <Check size={17} /> {completing ? 'Processing...' : 'Complete Sale'}
          </button>
        </div>
      )}
    </BottomSheet>
  );
}
