import { useState, useEffect } from 'react';
import { Lock, CreditCard, Calendar, CheckCircle, Upload, Phone, User, Hash, ArrowRight, X, AlertCircle, Clock, XCircle } from 'lucide-react';
import { getAdminConfig, getAllPaymentAccounts, addUserPayment } from '../../db/queries';
import { useAppStore } from '../../store/useAppStore';
import { formatCurrency } from '../../utils/calculations';
import type { AdminConfig, PaymentAccount, PaymentType, InstallmentPlan, AccountType } from '../../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onPaid: () => void;
  status: 'checking' | 'paid' | 'pending' | 'rejected' | 'unpaid';
}

export default function PaymentGate({ isOpen, onClose, onPaid, status }: Props) {
  const [step, setStep] = useState<'choice' | 'installment' | 'form' | 'submitted'>('choice');
  const [config, setConfig] = useState<AdminConfig | null>(null);
  const [accounts, setAccounts] = useState<PaymentAccount[]>([]);
  const [paymentType, setPaymentType] = useState<PaymentType>('full');
  const [installmentPlan, setInstallmentPlan] = useState<InstallmentPlan>('monthly');
  const [selectedAccount, setSelectedAccount] = useState<AccountType>('easypaisa');
  const [transactionId, setTransactionId] = useState('');
  const [phone, setPhone] = useState('');
  const [username, setUsername] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const showToast = useAppStore((s) => s.showToast);

  useEffect(() => {
    if (!isOpen) return;
    setStep('choice');
    setTransactionId('');
    setPhone('');
    setUsername('');
    let cancelled = false;

    async function load() {
      try {
        const cfg = await getAdminConfig();
        if (!cancelled) setConfig(cfg);
        try {
          const accs = await getAllPaymentAccounts();
          if (!cancelled) {
            setAccounts(accs.filter((a) => a.isActive));
            if (accs.length > 0) setSelectedAccount(accs[0].type);
          }
        } catch {}
      } catch (e) {
        console.error('PaymentGate load error:', e);
        if (!cancelled) {
          setConfig({
            id: 1, passwordHash: '', appPrice: 500,
            installmentDaily: 50, installmentWeekly: 100, installmentMonthly: 200,
          });
        }
      }
    }
    load();
    return () => { cancelled = true; };
  }, [isOpen]);

  if (!isOpen) return null;

  function handleFullPay() { setPaymentType('full'); setStep('form'); }
  function handleInstallment() { setPaymentType('installment'); setStep('installment'); }
  function handleSelectPlan(plan: InstallmentPlan) { setInstallmentPlan(plan); setStep('form'); }

  async function handleSubmit() {
    if (!transactionId.trim()) { showToast('Transaction ID required', 'error'); return; }
    if (!phone.trim()) { showToast('Phone number required', 'error'); return; }
    if (!config) return;

    setSubmitting(true);
    const amount = paymentType === 'full'
      ? config.appPrice
      : installmentPlan === 'daily' ? config.installmentDaily
      : installmentPlan === 'weekly' ? config.installmentWeekly
      : config.installmentMonthly;

    try {
      await addUserPayment({
        paymentType,
        installmentPlan: paymentType === 'installment' ? installmentPlan : undefined,
        amount,
        transactionId: transactionId.trim(),
        phone: phone.trim(),
        username: username.trim() || undefined,
        accountType: selectedAccount,
      });
      setStep('submitted');
    } catch (e) {
      console.error('Payment submit error:', e);
      showToast('Failed to submit', 'error');
    } finally {
      setSubmitting(false);
    }
  }

  const activeAccount = accounts.find((a) => a.type === selectedAccount);

  function renderPendingState() {
    return (
      <div className="flex flex-col items-center gap-4 py-6">
        <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center">
          <Clock size={32} className="text-amber-500" />
        </div>
        <div className="text-center">
          <h3 className="text-[16px] font-bold text-gray-900">Payment Under Review</h3>
          <p className="text-[12px] text-gray-500 mt-2 leading-relaxed">
            Your payment proof has been submitted. Please wait for admin approval.
          </p>
        </div>
        <div className="bg-amber-50 rounded-2xl p-4 w-full">
          <p className="text-[11px] text-amber-600 font-medium text-center">
            This usually takes a few minutes. You will be notified once approved.
          </p>
        </div>
        <button onClick={onClose}
          className="w-full py-3 rounded-2xl bg-gray-100 text-gray-600 font-semibold text-[13px] tap-scale">
          Close
        </button>
      </div>
    );
  }

  function renderRejectedState() {
    return (
      <div className="flex flex-col items-center gap-4 py-6">
        <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
          <XCircle size={32} className="text-red-500" />
        </div>
        <div className="text-center">
          <h3 className="text-[16px] font-bold text-gray-900">Payment Rejected</h3>
          <p className="text-[12px] text-gray-500 mt-2 leading-relaxed">
            Your previous payment was rejected. Please submit a new payment proof.
          </p>
        </div>
        <button onClick={() => setStep('choice')}
          className="w-full py-3 rounded-2xl bg-brand-500 text-white font-bold text-[14px] tap-scale">
          Submit New Payment
        </button>
        <button onClick={onClose}
          className="w-full py-2 text-[12px] text-gray-400 font-semibold tap-scale">
          Close
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] bg-black/40 flex items-end sm:items-center justify-center">
      <div className="bg-surface w-full max-w-sm sm:rounded-3xl rounded-t-3xl max-h-[90vh] overflow-y-auto animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center">
              <Lock size={18} className="text-white" />
            </div>
            <div>
              <h2 className="text-[15px] font-bold text-gray-900">Activate IceStock Pro</h2>
              <p className="text-[11px] text-gray-400">Complete payment to unlock all features</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 tap-scale">
            <X size={18} className="text-gray-400" />
          </button>
        </div>

        <div className="px-5 pb-5">
          {/* Pending / Rejected states */}
          {status === 'pending' && renderPendingState()}
          {status === 'rejected' && step === 'choice' && renderRejectedState()}

          {/* Normal flow */}
          {status !== 'pending' && !(status === 'rejected' && step === 'choice') && !config && (
            <div className="py-10 flex justify-center">
              <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {status !== 'pending' && !(status === 'rejected' && step === 'choice') && config && (
            <>
              {/* STEP: Choice */}
              {step === 'choice' && (
                <div className="flex flex-col gap-3 pt-3">
                  <button onClick={handleFullPay}
                    className="w-full bg-white border border-gray-200 rounded-2xl p-4 flex items-center gap-4 tap-scale">
                    <div className="w-11 h-11 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
                      <CreditCard size={20} className="text-emerald-600" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-[14px] font-bold text-gray-900">Full Payment</p>
                      <p className="text-[11px] text-gray-500">Pay once, use forever</p>
                    </div>
                    <p className="text-[15px] font-bold text-emerald-600">{formatCurrency(config.appPrice)}</p>
                  </button>

                  <button onClick={handleInstallment}
                    className="w-full bg-white border border-gray-200 rounded-2xl p-4 flex items-center gap-4 tap-scale">
                    <div className="w-11 h-11 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
                      <Calendar size={20} className="text-amber-600" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-[14px] font-bold text-gray-900">Installment Plan</p>
                      <p className="text-[11px] text-gray-500">Pay in easy installments</p>
                    </div>
                    <ArrowRight size={16} className="text-gray-400" />
                  </button>
                </div>
              )}

              {/* STEP: Installment Plan */}
              {step === 'installment' && (
                <div className="flex flex-col gap-2.5 pt-3">
                  <p className="text-[12px] font-semibold text-gray-600 text-center mb-1">Select your plan</p>
                  {([
                    { plan: 'daily' as InstallmentPlan, label: 'Daily', amount: config.installmentDaily, desc: 'Pay daily' },
                    { plan: 'weekly' as InstallmentPlan, label: 'Weekly', amount: config.installmentWeekly, desc: 'Pay weekly' },
                    { plan: 'monthly' as InstallmentPlan, label: 'Monthly', amount: config.installmentMonthly, desc: 'Pay monthly' },
                  ]).map((p) => (
                    <button key={p.plan} onClick={() => handleSelectPlan(p.plan)}
                      className="w-full bg-white border border-gray-200 rounded-2xl p-3.5 flex items-center gap-3 tap-scale">
                      <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center shrink-0">
                        <Calendar size={18} className="text-brand-600" />
                      </div>
                      <div className="flex-1 text-left">
                        <p className="text-[13px] font-bold text-gray-900">{p.label}</p>
                        <p className="text-[10px] text-gray-400">{p.desc}</p>
                      </div>
                      <p className="text-[14px] font-bold text-brand-600">{formatCurrency(p.amount)}</p>
                    </button>
                  ))}
                  <button onClick={() => setStep('choice')}
                    className="w-full py-2 text-[12px] text-gray-400 font-semibold tap-scale">
                    Back
                  </button>
                </div>
              )}

              {/* STEP: Payment Form */}
              {step === 'form' && (
                <div className="flex flex-col gap-2.5 pt-3">
                  <div className="bg-brand-50 rounded-2xl p-3 text-center">
                    <p className="text-[10px] text-brand-500 font-medium">Amount to Pay</p>
                    <p className="text-[20px] font-bold text-brand-700">
                      {formatCurrency(
                        paymentType === 'full' ? config.appPrice
                        : installmentPlan === 'daily' ? config.installmentDaily
                        : installmentPlan === 'weekly' ? config.installmentWeekly
                        : config.installmentMonthly
                      )}
                    </p>
                    {paymentType === 'installment' && (
                      <p className="text-[10px] text-brand-500 capitalize">{installmentPlan} installment</p>
                    )}
                  </div>

                  {activeAccount && (
                    <div className="bg-white border border-gray-200 rounded-2xl p-3">
                      <p className="text-[10px] text-gray-400 font-medium mb-1.5">Send payment to</p>
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-green-100 flex items-center justify-center shrink-0">
                          <span className="text-[9px] font-bold text-green-700">
                            {activeAccount.type === 'easypaisa' ? 'EP' : 'JC'}
                          </span>
                        </div>
                        <div className="flex-1">
                          <p className="text-[12px] font-bold text-gray-900">{activeAccount.holderName}</p>
                          <p className="text-[10px] text-gray-400">{activeAccount.phone} ({activeAccount.type})</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col gap-2">
                    <div className="relative">
                      <Hash size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input value={transactionId} onChange={(e) => setTransactionId(e.target.value)}
                        placeholder="Transaction ID *" className="input-field pl-8 text-[13px]" />
                    </div>
                    <div className="relative">
                      <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input value={phone} onChange={(e) => setPhone(e.target.value)}
                        placeholder="Your phone number *" type="tel" className="input-field pl-8 text-[13px]" />
                    </div>
                    <div className="relative">
                      <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input value={username} onChange={(e) => setUsername(e.target.value)}
                        placeholder="Username (optional)" className="input-field pl-8 text-[13px]" />
                    </div>
                  </div>

                  <button onClick={handleSubmit} disabled={submitting}
                    className="w-full py-3 rounded-2xl bg-brand-500 text-white font-bold text-[13px] flex items-center justify-center gap-2 tap-scale disabled:opacity-60 mt-1">
                    <Upload size={15} /> {submitting ? 'Submitting...' : 'Submit Payment Proof'}
                  </button>
                  <button onClick={() => setStep('choice')}
                    className="w-full py-2 text-[11px] text-gray-400 font-semibold tap-scale">
                    Back
                  </button>
                </div>
              )}

              {/* STEP: Submitted */}
              {step === 'submitted' && (
                <div className="flex flex-col items-center gap-3 py-4">
                  <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center">
                    <CheckCircle size={28} className="text-emerald-500" />
                  </div>
                  <div className="text-center">
                    <h3 className="text-[15px] font-bold text-gray-900">Payment Submitted!</h3>
                    <p className="text-[11px] text-gray-500 mt-1.5 leading-relaxed">
                      Your payment is under review. All features will unlock once the admin approves.
                    </p>
                  </div>
                  <div className="bg-emerald-50 rounded-2xl p-3 w-full">
                    <p className="text-[10px] text-emerald-600 font-medium text-center">
                      Please wait for admin approval.
                    </p>
                  </div>
                  <button onClick={onClose}
                    className="w-full py-3 rounded-2xl bg-gray-100 text-gray-600 font-semibold text-[13px] tap-scale">
                    Close
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
