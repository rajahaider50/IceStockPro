import { useState, useEffect } from 'react';
import { Lock, CreditCard, Calendar, CheckCircle, Upload, Phone, User, Hash, ArrowRight, SkipForward, AlertCircle } from 'lucide-react';
import { getAdminConfig, getAllPaymentAccounts, addUserPayment } from '../../db/queries';
import { useAppStore } from '../../store/useAppStore';
import { formatCurrency } from '../../utils/calculations';
import type { AdminConfig, PaymentAccount, PaymentType, InstallmentPlan, AccountType } from '../../types';

interface Props {
  onUnlocked: () => void;
  onSkip: () => void;
}

export default function PaymentGate({ onUnlocked, onSkip }: Props) {
  const [step, setStep] = useState<'choice' | 'installment' | 'form' | 'submitted' | 'pending'>('choice');
  const [config, setConfig] = useState<AdminConfig | null>(null);
  const [accounts, setAccounts] = useState<PaymentAccount[]>([]);
  const [paymentType, setPaymentType] = useState<PaymentType>('full');
  const [installmentPlan, setInstallmentPlan] = useState<InstallmentPlan>('monthly');
  const [selectedAccount, setSelectedAccount] = useState<AccountType>('easypaisa');
  const [transactionId, setTransactionId] = useState('');
  const [phone, setPhone] = useState('');
  const [username, setUsername] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const showToast = useAppStore((s) => s.showToast);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const cfg = await getAdminConfig();
        if (cancelled) return;
        setConfig(cfg);
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
          setLoadError(true);
          setConfig({
            id: 1,
            passwordHash: '',
            appPrice: 500,
            installmentDaily: 50,
            installmentWeekly: 100,
            installmentMonthly: 200,
          });
        }
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  function handleFullPay() {
    setPaymentType('full');
    setStep('form');
  }

  function handleInstallment() {
    setPaymentType('installment');
    setStep('installment');
  }

  function handleSelectPlan(plan: InstallmentPlan) {
    setInstallmentPlan(plan);
    setStep('form');
  }

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

  if (loadError && !config) {
    return (
      <div className="fixed inset-0 z-[100] bg-surface flex flex-col items-center justify-center px-6">
        <div className="w-full max-w-sm flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-red-100 flex items-center justify-center">
            <AlertCircle size={32} className="text-red-500" />
          </div>
          <h2 className="text-[18px] font-bold text-gray-900">Connection Error</h2>
          <p className="text-[13px] text-gray-500 text-center">Could not load payment information. Check your connection.</p>
          <button onClick={() => window.location.reload()}
            className="w-full py-3 rounded-2xl bg-brand-500 text-white font-bold text-[14px] tap-scale">
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!config) {
    return (
      <div className="fixed inset-0 z-[100] bg-surface flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const activeAccount = accounts.find((a) => a.type === selectedAccount);

  return (
    <div className="fixed inset-0 z-[100] bg-surface flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center gap-3 mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-lg">
            <Lock size={28} className="text-white" />
          </div>
          <div className="text-center">
            <h2 className="text-[18px] font-bold text-gray-900">IceStock Pro</h2>
            <p className="text-[12px] text-gray-500 mt-1">Complete payment to use the app</p>
          </div>
        </div>

        {step === 'choice' && (
          <div className="flex flex-col gap-3">
            <button onClick={handleFullPay}
              className="w-full bg-white border border-gray-200 rounded-2xl p-5 flex items-center gap-4 tap-scale">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
                <CreditCard size={22} className="text-emerald-600" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-[14px] font-bold text-gray-900">Full Payment</p>
                <p className="text-[12px] text-gray-500">Pay once, use forever</p>
              </div>
              <p className="text-[16px] font-bold text-emerald-600">{formatCurrency(config.appPrice)}</p>
            </button>

            <button onClick={handleInstallment}
              className="w-full bg-white border border-gray-200 rounded-2xl p-5 flex items-center gap-4 tap-scale">
              <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
                <Calendar size={22} className="text-amber-600" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-[14px] font-bold text-gray-900">Installment Plan</p>
                <p className="text-[12px] text-gray-500">Pay in easy installments</p>
              </div>
              <ArrowRight size={18} className="text-gray-400" />
            </button>

            <button onClick={onSkip}
              className="w-full py-3 rounded-2xl bg-gray-100 text-gray-500 font-semibold text-[13px] flex items-center justify-center gap-2 tap-scale">
              <SkipForward size={15} /> Skip for now
            </button>
            <p className="text-[10px] text-gray-400 text-center -mt-1">
              Skipped users cannot access premium features
            </p>
          </div>
        )}

        {step === 'installment' && (
          <div className="flex flex-col gap-3">
            <p className="text-[13px] font-semibold text-gray-600 text-center mb-2">Select your plan</p>
            {([
              { plan: 'daily' as InstallmentPlan, label: 'Daily', amount: config.installmentDaily, desc: 'Pay daily' },
              { plan: 'weekly' as InstallmentPlan, label: 'Weekly', amount: config.installmentWeekly, desc: 'Pay weekly' },
              { plan: 'monthly' as InstallmentPlan, label: 'Monthly', amount: config.installmentMonthly, desc: 'Pay monthly' },
            ]).map((p) => (
              <button key={p.plan} onClick={() => handleSelectPlan(p.plan)}
                className="w-full bg-white border border-gray-200 rounded-2xl p-4 flex items-center gap-4 tap-scale">
                <div className="w-11 h-11 rounded-xl bg-brand-50 flex items-center justify-center shrink-0">
                  <Calendar size={20} className="text-brand-600" />
                </div>
                <div className="flex-1 text-left">
                  <p className="text-[13px] font-bold text-gray-900">{p.label}</p>
                  <p className="text-[11px] text-gray-400">{p.desc}</p>
                </div>
                <p className="text-[15px] font-bold text-brand-600">{formatCurrency(p.amount)}</p>
              </button>
            ))}
            <button onClick={() => setStep('choice')}
              className="w-full py-2.5 text-[12px] text-gray-400 font-semibold tap-scale">
              Back
            </button>
          </div>
        )}

        {step === 'form' && (
          <div className="flex flex-col gap-3">
            <div className="bg-brand-50 rounded-2xl p-4 text-center">
              <p className="text-[11px] text-brand-500 font-medium">Amount to Pay</p>
              <p className="text-[22px] font-bold text-brand-700">
                {formatCurrency(
                  paymentType === 'full' ? config.appPrice
                  : installmentPlan === 'daily' ? config.installmentDaily
                  : installmentPlan === 'weekly' ? config.installmentWeekly
                  : config.installmentMonthly
                )}
              </p>
              {paymentType === 'installment' && (
                <p className="text-[11px] text-brand-500 capitalize">{installmentPlan} installment</p>
              )}
            </div>

            {activeAccount && (
              <div className="bg-white border border-gray-200 rounded-2xl p-4">
                <p className="text-[11px] text-gray-400 font-medium mb-2">Send payment to</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center shrink-0">
                    <span className="text-[10px] font-bold text-green-700">
                      {activeAccount.type === 'easypaisa' ? 'EP' : 'JC'}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="text-[13px] font-bold text-gray-900">{activeAccount.holderName}</p>
                    <p className="text-[11px] text-gray-400">{activeAccount.phone} ({activeAccount.type})</p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex flex-col gap-2.5">
              <div className="relative">
                <Hash size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input value={transactionId} onChange={(e) => setTransactionId(e.target.value)}
                  placeholder="Transaction ID *" className="input-field pl-9" />
              </div>
              <div className="relative">
                <Phone size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input value={phone} onChange={(e) => setPhone(e.target.value)}
                  placeholder="Your phone number *" type="tel" className="input-field pl-9" />
              </div>
              <div className="relative">
                <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input value={username} onChange={(e) => setUsername(e.target.value)}
                  placeholder="Username (optional)" className="input-field pl-9" />
              </div>
            </div>

            <button onClick={handleSubmit} disabled={submitting}
              className="w-full py-3.5 rounded-2xl bg-brand-500 text-white font-bold text-[14px] flex items-center justify-center gap-2 tap-scale disabled:opacity-60">
              <Upload size={17} /> {submitting ? 'Submitting...' : 'Submit Payment'}
            </button>
            <button onClick={() => setStep('choice')}
              className="w-full py-2 text-[12px] text-gray-400 font-semibold tap-scale">
              Back
            </button>
          </div>
        )}

        {step === 'submitted' && (
          <div className="flex flex-col items-center gap-4 py-6">
            <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center">
              <CheckCircle size={32} className="text-amber-500" />
            </div>
            <div className="text-center">
              <h3 className="text-[16px] font-bold text-gray-900">Payment Submitted!</h3>
              <p className="text-[12px] text-gray-500 mt-2 leading-relaxed">
                Your payment is under review. You will be able to use the app once the admin approves your payment.
              </p>
            </div>
            <div className="bg-amber-50 rounded-2xl p-4 w-full">
              <p className="text-[11px] text-amber-600 font-medium text-center">
                Please wait for admin approval. This usually takes a few minutes.
              </p>
            </div>
            <button onClick={onSkip}
              className="w-full py-3 rounded-2xl bg-gray-100 text-gray-600 font-semibold text-[13px] tap-scale">
              Continue without paying
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
