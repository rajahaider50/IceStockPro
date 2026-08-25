import { useEffect, useState } from 'react';
import { ArrowDownCircle, ArrowUpCircle, DollarSign } from 'lucide-react';
import BottomSheet from '../common/BottomSheet';
import { getAllCustomers, getCustomerLedger, getCustomerBalance, addCreditEntry } from '../../db/queries';
import { useAppStore } from '../../store/useAppStore';
import { formatCurrency, formatDate } from '../../utils/calculations';
import type { Customer, CreditEntry } from '../../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  customerId: number | null;
  settings: { currency: string };
}

export default function CustomerLedgerSheet({ isOpen, onClose, customerId, settings }: Props) {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [balance, setBalance] = useState(0);
  const [ledger, setLedger] = useState<CreditEntry[]>([]);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [udhaarOpen, setUdhaarOpen] = useState(false);
  const [udhaarAmount, setUdhaarAmount] = useState('');
  const [udhaarNote, setUdhaarNote] = useState('');
  const showToast = useAppStore((s) => s.showToast);

  useEffect(() => {
    if (isOpen && customerId) load();
  }, [isOpen, customerId]);

  async function load() {
    if (!customerId) return;
    const [cust, bal, entries] = await Promise.all([
      getAllCustomers().then((list) => list.find((c) => c.id === customerId) || null),
      getCustomerBalance(customerId),
      getCustomerLedger(customerId),
    ]);
    setCustomer(cust);
    setBalance(bal);
    setLedger(entries);
  }

  async function handlePayment() {
    const amt = parseFloat(paymentAmount);
    if (!amt || amt <= 0 || !customerId) return;
    await addCreditEntry({ customerId, type: 'payment', amount: amt });
    showToast('Payment recorded');
    setPaymentOpen(false);
    setPaymentAmount('');
    load();
  }

  async function handleManualUdhaar() {
    const amt = parseFloat(udhaarAmount);
    if (!amt || amt <= 0 || !customerId) return;
    await addCreditEntry({ customerId, type: 'credit', amount: amt, note: udhaarNote || undefined });
    showToast('Udhaar added');
    setUdhaarOpen(false);
    setUdhaarAmount('');
    setUdhaarNote('');
    load();
  }

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title={customer?.name || 'Ledger'}>
      {customer && (
        <div className="flex flex-col gap-4 pb-4">
          {/* Balance header */}
          <div className="flex items-center gap-3 bg-gray-50 rounded-2xl p-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${balance > 0 ? 'bg-red-100' : 'bg-emerald-100'}`}>
              <DollarSign size={22} className={balance > 0 ? 'text-red-500' : 'text-emerald-500'} />
            </div>
            <div>
              <p className="text-[11px] text-gray-400 font-medium">Balance</p>
              <p className={`text-[20px] font-bold ${balance > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                {balance > 0 ? `${formatCurrency(balance, settings.currency)} owed` : 'Clear'}
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => setPaymentOpen(true)}
              className="flex-1 py-3 rounded-2xl bg-emerald-500 text-white font-semibold text-[13px] flex items-center justify-center gap-2 tap-scale"
            >
              <ArrowUpCircle size={16} /> Receive Payment
            </button>
            <button
              onClick={() => setUdhaarOpen(true)}
              className="flex-1 py-3 rounded-2xl bg-amber-500 text-white font-semibold text-[13px] flex items-center justify-center gap-2 tap-scale"
            >
              <ArrowDownCircle size={16} /> Add Udhaar
            </button>
          </div>

          {/* Payment input */}
          {paymentOpen && (
            <div className="bg-emerald-50 rounded-2xl p-3 flex flex-col gap-2">
              <p className="text-[12px] font-semibold text-emerald-700">Enter amount to record</p>
              <input
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                placeholder="Amount"
                type="number"
                className="input-field"
                autoFocus
              />
              <div className="flex gap-2">
                <button onClick={() => { setPaymentOpen(false); setPaymentAmount(''); }}
                  className="flex-1 py-2.5 rounded-xl bg-white text-gray-600 text-[12px] font-semibold tap-scale">
                  Cancel
                </button>
                <button onClick={handlePayment}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-500 text-white text-[12px] font-semibold tap-scale">
                  Record
                </button>
              </div>
            </div>
          )}

          {/* Manual Udhaar input */}
          {udhaarOpen && (
            <div className="bg-amber-50 rounded-2xl p-3 flex flex-col gap-2">
              <p className="text-[12px] font-semibold text-amber-700">Add manual udhaar</p>
              <input
                value={udhaarAmount}
                onChange={(e) => setUdhaarAmount(e.target.value)}
                placeholder="Amount"
                type="number"
                className="input-field"
                autoFocus
              />
              <input
                value={udhaarNote}
                onChange={(e) => setUdhaarNote(e.target.value)}
                placeholder="Note (optional)"
                className="input-field"
              />
              <div className="flex gap-2">
                <button onClick={() => { setUdhaarOpen(false); setUdhaarAmount(''); setUdhaarNote(''); }}
                  className="flex-1 py-2.5 rounded-xl bg-white text-gray-600 text-[12px] font-semibold tap-scale">
                  Cancel
                </button>
                <button onClick={handleManualUdhaar}
                  className="flex-1 py-2.5 rounded-xl bg-amber-500 text-white text-[12px] font-semibold tap-scale">
                  Add
                </button>
              </div>
            </div>
          )}

          {/* Ledger entries */}
          <div>
            <p className="text-[12px] font-bold text-gray-500 mb-2">History</p>
            {ledger.length === 0 ? (
              <p className="text-center text-gray-400 text-[12px] py-4">No transactions yet</p>
            ) : (
              <div className="flex flex-col gap-2">
                {ledger.map((entry) => (
                  <div key={entry.id} className="flex items-center gap-3 bg-white border border-gray-100 rounded-xl p-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${entry.type === 'credit' ? 'bg-red-100' : 'bg-emerald-100'}`}>
                      {entry.type === 'credit'
                        ? <ArrowDownCircle size={15} className="text-red-500" />
                        : <ArrowUpCircle size={15} className="text-emerald-500" />
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-semibold text-gray-800">
                        {entry.type === 'credit' ? 'Udhaar' : 'Payment'}
                        {entry.saleId ? ' (sale)' : ''}
                      </p>
                      {entry.note && <p className="text-[10.5px] text-gray-400 truncate">{entry.note}</p>}
                    </div>
                    <div className="text-right shrink-0">
                      <p className={`text-[13px] font-bold ${entry.type === 'credit' ? 'text-red-600' : 'text-emerald-600'}`}>
                        {entry.type === 'credit' ? '+' : '-'}{formatCurrency(entry.amount, settings.currency)}
                      </p>
                      <p className="text-[10px] text-gray-400">{formatDate(entry.date)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </BottomSheet>
  );
}
