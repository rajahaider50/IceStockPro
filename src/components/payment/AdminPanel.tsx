import { useState, useEffect } from 'react';
import {
  Settings, Plus, Trash2, Edit2, CheckCircle, XCircle, Clock, Eye,
  DollarSign, Lock, ChevronRight, Users, History, Key, Shield,
} from 'lucide-react';
import BottomSheet from '../common/BottomSheet';
import ConfirmDialog from '../common/ConfirmDialog';
import {
  getAdminConfig, updateAdminConfig,
  getAllPaymentAccounts, addPaymentAccount, updatePaymentAccount, deletePaymentAccount,
  getAllUserPayments, approvePayment, rejectPayment,
} from '../../db/queries';
import { useAppStore } from '../../store/useAppStore';
import { formatCurrency, formatDate } from '../../utils/calculations';
import { hashPin } from '../common/PinLock';
import type { AdminConfig, PaymentAccount, UserPayment, AccountType } from '../../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function AdminPanel({ isOpen, onClose }: Props) {
  const [tab, setTab] = useState<'dashboard' | 'accounts' | 'requests' | 'history' | 'settings'>('dashboard');
  const [config, setConfig] = useState<AdminConfig | null>(null);
  const [accounts, setAccounts] = useState<PaymentAccount[]>([]);
  const [payments, setPayments] = useState<UserPayment[]>([]);
  const [editingAccount, setEditingAccount] = useState<PaymentAccount | null>(null);
  const [accountFormOpen, setAccountFormOpen] = useState(false);
  const [accType, setAccType] = useState<AccountType>('easypaisa');
  const [accName, setAccName] = useState('');
  const [accPhone, setAccPhone] = useState('');
  const [viewingPayment, setViewingPayment] = useState<UserPayment | null>(null);
  const [rejectNote, setRejectNote] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [deletingAccount, setDeletingAccount] = useState<PaymentAccount | null>(null);
  const showToast = useAppStore((s) => s.showToast);

  useEffect(() => {
    if (isOpen) load();
  }, [isOpen]);

  async function load() {
    try {
      const [cfg, accs, pays] = await Promise.all([
        getAdminConfig().catch(() => null),
        getAllPaymentAccounts().catch(() => []),
        getAllUserPayments().catch(() => []),
      ]);
      setConfig(cfg);
      setAccounts(accs);
      setPayments(pays);
    } catch (e) {
      console.error('AdminPanel load error:', e);
    }
  }

  // --- Accounts ---
  function openAddAccount() {
    setEditingAccount(null);
    setAccType('easypaisa');
    setAccName('');
    setAccPhone('');
    setAccountFormOpen(true);
  }

  function openEditAccount(a: PaymentAccount) {
    setEditingAccount(a);
    setAccType(a.type);
    setAccName(a.holderName);
    setAccPhone(a.phone);
    setAccountFormOpen(true);
  }

  async function handleSaveAccount() {
    if (!accName.trim() || !accPhone.trim()) { showToast('Name and phone required', 'error'); return; }
    if (editingAccount?.id) {
      await updatePaymentAccount(editingAccount.id, { type: accType, holderName: accName.trim(), phone: accPhone.trim() });
      showToast('Account updated');
    } else {
      await addPaymentAccount({ type: accType, holderName: accName.trim(), phone: accPhone.trim(), isActive: true });
      showToast('Account added');
    }
    setAccountFormOpen(false);
    load();
  }

  async function handleDeleteAccount() {
    if (!deletingAccount?.id) return;
    await deletePaymentAccount(deletingAccount.id);
    showToast('Account deleted');
    setDeletingAccount(null);
    load();
  }

  // --- Requests ---
  async function handleApprove(id: number) {
    await approvePayment(id);
    showToast('Payment approved');
    load();
  }

  async function handleReject(id: number) {
    await rejectPayment(id, rejectNote || undefined);
    showToast('Payment rejected');
    setViewingPayment(null);
    setRejectNote('');
    load();
  }

  // --- Settings ---
  async function handleSaveConfig() {
    if (!config) return;
    await updateAdminConfig({
      appPrice: config.appPrice,
      installmentDaily: config.installmentDaily,
      installmentWeekly: config.installmentWeekly,
      installmentMonthly: config.installmentMonthly,
    });
    showToast('Config saved');
  }

  async function handleChangePassword() {
    if (newPassword.length !== 4 || !/^\d{4}$/.test(newPassword)) { showToast('PIN must be 4 digits', 'error'); return; }
    if (newPassword !== confirmPassword) { showToast('PINs do not match', 'error'); return; }
    await updateAdminConfig({ passwordHash: hashPin(newPassword) });
    setNewPassword('');
    setConfirmPassword('');
    showToast('Admin password changed');
  }

  const pendingCount = payments.filter((p) => p.status === 'pending').length;

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Admin Panel" maxHeight="90vh">
      {/* Tab bar */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-4 -mx-1">
        {([
          { key: 'dashboard' as const, icon: Shield, label: 'Home' },
          { key: 'accounts' as const, icon: DollarSign, label: 'Accounts' },
          { key: 'requests' as const, icon: Clock, label: `Requests${pendingCount > 0 ? ` (${pendingCount})` : ''}` },
          { key: 'history' as const, icon: History, label: 'History' },
          { key: 'settings' as const, icon: Settings, label: 'Config' },
        ]).map((t) => {
          const Icon = t.icon;
          return (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`flex-1 py-2 rounded-lg text-[10px] font-semibold flex flex-col items-center gap-0.5 tap-scale ${
                tab === t.key ? 'bg-white text-brand-600 shadow-sm' : 'text-gray-500'
              }`}>
              <Icon size={14} />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* DASHBOARD */}
      {tab === 'dashboard' && (
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-emerald-50 rounded-xl p-3 text-center">
              <p className="text-[18px] font-bold text-emerald-700">{payments.filter((p) => p.status === 'approved').length}</p>
              <p className="text-[10px] text-emerald-500">Approved</p>
            </div>
            <div className="bg-amber-50 rounded-xl p-3 text-center">
              <p className="text-[18px] font-bold text-amber-700">{pendingCount}</p>
              <p className="text-[10px] text-amber-500">Pending</p>
            </div>
            <div className="bg-red-50 rounded-xl p-3 text-center">
              <p className="text-[18px] font-bold text-red-700">{payments.filter((p) => p.status === 'rejected').length}</p>
              <p className="text-[10px] text-red-500">Rejected</p>
            </div>
            <div className="bg-brand-50 rounded-xl p-3 text-center">
              <p className="text-[18px] font-bold text-brand-700">{accounts.length}</p>
              <p className="text-[10px] text-brand-500">Accounts</p>
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-3">
            <p className="text-[11px] text-gray-500 mb-1">App Price</p>
            <p className="text-[16px] font-bold text-gray-900">{config ? formatCurrency(config.appPrice) : '...'}</p>
          </div>

          {pendingCount > 0 && (
            <button onClick={() => setTab('requests')}
              className="w-full py-3 rounded-xl bg-amber-500 text-white font-semibold text-[13px] flex items-center justify-center gap-2 tap-scale">
              <Clock size={15} /> {pendingCount} pending request{pendingCount > 1 ? 's' : ''}
            </button>
          )}
        </div>
      )}

      {/* ACCOUNTS */}
      {tab === 'accounts' && (
        <div className="flex flex-col gap-2">
          <button onClick={openAddAccount}
            className="w-full py-2.5 rounded-xl bg-brand-50 text-brand-600 font-semibold text-[12px] flex items-center justify-center gap-2 tap-scale border border-dashed border-brand-200">
            <Plus size={14} /> Add Account
          </button>
          {accounts.map((a) => (
            <div key={a.id} className="flex items-center gap-3 bg-white border border-gray-100 rounded-xl p-3">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-[9px] font-bold ${
                a.type === 'easypaisa' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
              }`}>
                {a.type === 'easypaisa' ? 'EP' : 'JC'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-bold text-gray-900">{a.holderName}</p>
                <p className="text-[10.5px] text-gray-400">{a.phone} · {a.type}</p>
              </div>
              <button onClick={() => openEditAccount(a)} className="tap-scale">
                <Edit2 size={13} className="text-gray-400" />
              </button>
              <button onClick={() => setDeletingAccount(a)} className="tap-scale">
                <Trash2 size={13} className="text-red-400" />
              </button>
            </div>
          ))}

          {accountFormOpen && (
            <div className="bg-gray-50 rounded-xl p-3 flex flex-col gap-2 mt-2">
              <div className="flex gap-2">
                {(['easypaisa', 'jazzcash'] as AccountType[]).map((t) => (
                  <button key={t} onClick={() => setAccType(t)}
                    className={`flex-1 py-2 rounded-lg text-[11px] font-semibold capitalize tap-scale ${
                      accType === t ? 'bg-brand-500 text-white' : 'bg-white border border-gray-200 text-gray-600'
                    }`}>{t}</button>
                ))}
              </div>
              <input value={accName} onChange={(e) => setAccName(e.target.value)}
                placeholder="Account holder name *" className="input-field text-[12px]" />
              <input value={accPhone} onChange={(e) => setAccPhone(e.target.value)}
                placeholder="Phone number *" type="tel" className="input-field text-[12px]" />
              <div className="flex gap-2">
                <button onClick={() => setAccountFormOpen(false)}
                  className="flex-1 py-2 rounded-lg bg-gray-100 text-gray-600 text-[11px] font-semibold tap-scale">Cancel</button>
                <button onClick={handleSaveAccount}
                  className="flex-1 py-2 rounded-lg bg-brand-500 text-white text-[11px] font-semibold tap-scale">
                  {editingAccount ? 'Update' : 'Save'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* REQUESTS */}
      {tab === 'requests' && (
        <div className="flex flex-col gap-2">
          {payments.filter((p) => p.status === 'pending').length === 0 ? (
            <p className="text-center text-gray-400 text-[12px] py-6">No pending requests</p>
          ) : (
            payments.filter((p) => p.status === 'pending').map((p) => (
              <div key={p.id} className="bg-white border border-gray-100 rounded-xl p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                    p.paymentType === 'full' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'
                  }`}>
                    {p.paymentType === 'full' ? 'FULL' : p.installmentPlan?.toUpperCase()}
                  </span>
                  <span className="text-[13px] font-bold text-gray-900">{formatCurrency(p.amount)}</span>
                </div>
                <div className="text-[11px] text-gray-500 flex flex-col gap-0.5 mb-2">
                  <p>Txn: <span className="font-semibold text-gray-700">{p.transactionId}</span></p>
                  <p>Phone: <span className="font-semibold text-gray-700">{p.phone}</span></p>
                  {p.username && <p>User: <span className="font-semibold text-gray-700">{p.username}</span></p>}
                  <p>Account: <span className="font-semibold text-gray-700 capitalize">{p.accountType}</span></p>
                  <p>{formatDate(p.createdAt)}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleApprove(p.id!)}
                    className="flex-1 py-2 rounded-lg bg-emerald-500 text-white text-[11px] font-semibold tap-scale flex items-center justify-center gap-1">
                    <CheckCircle size={12} /> Approve
                  </button>
                  <button onClick={() => { setViewingPayment(p); setRejectNote(''); }}
                    className="flex-1 py-2 rounded-lg bg-red-50 text-red-600 text-[11px] font-semibold tap-scale flex items-center justify-center gap-1">
                    <XCircle size={12} /> Reject
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* HISTORY */}
      {tab === 'history' && (
        <div className="flex flex-col gap-2">
          {payments.length === 0 ? (
            <p className="text-center text-gray-400 text-[12px] py-6">No payment history</p>
          ) : (
            payments.map((p) => (
              <div key={p.id} className="flex items-center gap-3 bg-white border border-gray-100 rounded-xl p-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  p.status === 'approved' ? 'bg-emerald-100' : p.status === 'rejected' ? 'bg-red-100' : 'bg-amber-100'
                }`}>
                  {p.status === 'approved' ? <CheckCircle size={14} className="text-emerald-500" />
                   : p.status === 'rejected' ? <XCircle size={14} className="text-red-500" />
                   : <Clock size={14} className="text-amber-500" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-semibold text-gray-800">{p.phone} · {p.paymentType}</p>
                  <p className="text-[10px] text-gray-400">{formatDate(p.createdAt)}</p>
                </div>
                <p className="text-[12px] font-bold text-gray-900">{formatCurrency(p.amount)}</p>
              </div>
            ))
          )}
        </div>
      )}

      {/* SETTINGS */}
      {tab === 'settings' && config && (
        <div className="flex flex-col gap-4">
          <div>
            <p className="text-[11px] font-semibold text-gray-500 mb-1">App Price (Full)</p>
            <input type="number" value={config.appPrice}
              onChange={(e) => setConfig({ ...config, appPrice: parseFloat(e.target.value) || 0 })}
              className="input-field text-[13px]" />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <p className="text-[10px] text-gray-400 mb-1">Daily</p>
              <input type="number" value={config.installmentDaily}
                onChange={(e) => setConfig({ ...config, installmentDaily: parseFloat(e.target.value) || 0 })}
                className="input-field text-[12px]" />
            </div>
            <div>
              <p className="text-[10px] text-gray-400 mb-1">Weekly</p>
              <input type="number" value={config.installmentWeekly}
                onChange={(e) => setConfig({ ...config, installmentWeekly: parseFloat(e.target.value) || 0 })}
                className="input-field text-[12px]" />
            </div>
            <div>
              <p className="text-[10px] text-gray-400 mb-1">Monthly</p>
              <input type="number" value={config.installmentMonthly}
                onChange={(e) => setConfig({ ...config, installmentMonthly: parseFloat(e.target.value) || 0 })}
                className="input-field text-[12px]" />
            </div>
          </div>
          <button onClick={handleSaveConfig}
            className="w-full py-2.5 rounded-xl bg-brand-500 text-white text-[12px] font-semibold tap-scale">
            Save Pricing
          </button>

          <div className="border-t border-gray-100 pt-3">
            <div className="flex items-center gap-2 mb-2">
              <Key size={14} className="text-gray-500" />
              <p className="text-[11px] font-semibold text-gray-600">Change Admin Password</p>
            </div>
            <div className="flex flex-col gap-2">
              <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                placeholder="New 4-digit PIN" maxLength={4} className="input-field text-[12px]" />
              <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm PIN" maxLength={4} className="input-field text-[12px]" />
              <button onClick={handleChangePassword}
                className="w-full py-2.5 rounded-xl bg-gray-900 text-white text-[12px] font-semibold tap-scale">
                Update Password
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject modal */}
      {viewingPayment && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center px-6">
          <div className="absolute inset-0 bg-black/40" onClick={() => setViewingPayment(null)} />
          <div className="relative bg-white rounded-3xl p-5 w-full max-w-xs">
            <h3 className="text-[14px] font-bold text-gray-900 mb-2">Reject Payment?</h3>
            <p className="text-[11px] text-gray-500 mb-3">Add a note for the user (optional)</p>
            <input value={rejectNote} onChange={(e) => setRejectNote(e.target.value)}
              placeholder="Rejection reason..." className="input-field text-[12px] mb-3" />
            <div className="flex gap-2">
              <button onClick={() => setViewingPayment(null)}
                className="flex-1 py-2.5 rounded-xl bg-gray-100 text-gray-600 text-[12px] font-semibold tap-scale">Cancel</button>
              <button onClick={() => handleReject(viewingPayment.id!)}
                className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-[12px] font-semibold tap-scale">Reject</button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog isOpen={!!deletingAccount} title="Delete account?"
        message="This payment account will be permanently removed."
        onConfirm={handleDeleteAccount} onCancel={() => setDeletingAccount(null)} />
    </BottomSheet>
  );
}
