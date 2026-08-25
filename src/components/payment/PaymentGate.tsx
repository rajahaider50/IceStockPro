import { useState, useEffect } from 'react';
import { Lock, CreditCard, Calendar, CheckCircle, Upload, Phone, User, Hash, ArrowRight, X, Clock, XCircle, Tag, ChevronRight } from 'lucide-react';
import { getCustomPackages, getAllPaymentAccounts, addUserPayment } from '../../db/queries';
import { useAppStore } from '../../store/useAppStore';
import { PACKAGES, getPackageById, formatPackagePrice, type Package } from '../../utils/packages';
import type { PaymentAccount, PaymentType, InstallmentPlan, AccountType } from '../../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onPaid: () => void;
  status: 'checking' | 'paid' | 'pending' | 'rejected' | 'unpaid';
}

export default function PaymentGate({ isOpen, onClose, onPaid, status }: Props) {
  const [step, setStep] = useState<'packages' | 'plan' | 'plansel' | 'form' | 'submitted'>('packages');
  const [selectedPkg, setSelectedPkg] = useState<Package>(PACKAGES[0]);
  const [packages, setPackages] = useState<Package[]>(PACKAGES);
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
    setStep('packages');
    setTransactionId('');
    setPhone('');
    setUsername('');
    setSelectedPkg(packages[0]);
    setPaymentType('full');

    let cancelled = false;
    async function load() {
      try {
        const customJson = await getCustomPackages();
        if (!cancelled && customJson) {
          try {
            const custom = JSON.parse(customJson) as Package[];
            if (custom.length > 0) {
              setPackages(custom);
              setSelectedPkg(custom[0]);
            }
          } catch {}
        }
        const accs = await getAllPaymentAccounts();
        if (!cancelled) {
          setAccounts(accs.filter((a) => a.isActive));
          if (accs.length > 0) setSelectedAccount(accs[0].type);
        }
      } catch {}
    }
    load();
    return () => { cancelled = true; };
  }, [isOpen]);

  if (!isOpen) return null;

  function handleSelectPackage(pkg: Package) {
    setSelectedPkg(pkg);
    setStep('plan');
  }

  function handleFullPay() { setPaymentType('full'); setStep('form'); }
  function handleInstallment() { setPaymentType('installment'); setInstallmentPlan('monthly'); setStep('plansel'); }
  function handleSelectPlan(plan: InstallmentPlan) { setInstallmentPlan(plan); setStep('form'); }

  async function handleSubmit() {
    if (!transactionId.trim()) { showToast('Transaction ID required', 'error'); return; }
    if (!phone.trim()) { showToast('Phone number required', 'error'); return; }

    setSubmitting(true);
    const amount = paymentType === 'full'
      ? selectedPkg.fullPrice
      : installmentPlan === 'daily' ? selectedPkg.daily
      : installmentPlan === 'weekly' ? selectedPkg.weekly
      : selectedPkg.monthly;

    try {
      await addUserPayment({
        packageId: selectedPkg.id,
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
            Your previous payment was rejected. Please select a new package and submit.
          </p>
        </div>
        <button onClick={() => setStep('packages')}
          className="w-full py-3 rounded-2xl bg-brand-500 text-white font-bold text-[14px] tap-scale">
          Choose New Package
        </button>
        <button onClick={onClose}
          className="w-full py-2 text-[12px] text-gray-400 font-semibold tap-scale">
          Close
        </button>
      </div>
    );
  }

  function getBgColor(color: string): string {
    const map: Record<string, string> = {
      gray: 'bg-gray-50', blue: 'bg-blue-50', indigo: 'bg-indigo-50',
      violet: 'bg-violet-50', emerald: 'bg-emerald-50', teal: 'bg-teal-50',
      amber: 'bg-amber-50', orange: 'bg-orange-50', red: 'bg-red-50', rose: 'bg-rose-50',
    };
    return map[color] || 'bg-gray-50';
  }
  function getTextColor(color: string): string {
    const map: Record<string, string> = {
      gray: 'text-gray-700', blue: 'text-blue-700', indigo: 'text-indigo-700',
      violet: 'text-violet-700', emerald: 'text-emerald-700', teal: 'text-teal-700',
      amber: 'text-amber-700', orange: 'text-orange-700', red: 'text-red-700', rose: 'text-rose-700',
    };
    return map[color] || 'text-gray-700';
  }
  function getBadgeBg(color: string): string {
    const map: Record<string, string> = {
      gray: 'bg-gray-200 text-gray-600', blue: 'bg-blue-200 text-blue-700',
      indigo: 'bg-indigo-200 text-indigo-700', violet: 'bg-violet-200 text-violet-700',
      emerald: 'bg-emerald-200 text-emerald-700', teal: 'bg-teal-200 text-teal-700',
      amber: 'bg-amber-200 text-amber-700', orange: 'bg-orange-200 text-orange-700',
      red: 'bg-red-200 text-red-700', rose: 'bg-rose-200 text-rose-700',
    };
    return map[color] || 'bg-gray-200 text-gray-600';
  }

  return (
    <div className="fixed inset-0 z-[100] bg-black/40 flex items-end sm:items-center justify-center">
      <div className="bg-surface w-full max-w-sm sm:rounded-3xl rounded-t-3xl max-h-[90vh] overflow-y-auto animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-gray-100 sticky top-0 bg-surface z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center">
              <Lock size={18} className="text-white" />
            </div>
            <div>
              <h2 className="text-[15px] font-bold text-gray-900">
                {step === 'packages' ? 'Choose a Package' :
                 step === 'plan' ? 'Select Payment Plan' :
                 step === 'form' ? 'Payment Details' : 'Submitted'}
              </h2>
              <p className="text-[11px] text-gray-400">
                {step === 'packages' ? '10 packages available' :
                 step === 'plan' ? selectedPkg.fullName :
                 step === 'form' ? `Pay ${formatPackagePrice(paymentType === 'full' ? selectedPkg.fullPrice : installmentPlan === 'daily' ? selectedPkg.daily : installmentPlan === 'weekly' ? selectedPkg.weekly : selectedPkg.monthly)}` :
                 'Payment submitted'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 tap-scale">
            <X size={18} className="text-gray-400" />
          </button>
        </div>

        <div className="px-5 pb-5">
          {/* Pending / Rejected */}
          {status === 'pending' && step === 'packages' && renderPendingState()}
          {status === 'rejected' && step === 'packages' && renderRejectedState()}

          {/* STEP: Choose Package */}
          {step === 'packages' && status !== 'pending' && !(status === 'rejected') && (
            <div className="flex flex-col gap-2 pt-3">
              {packages.map((pkg) => (
                <button key={pkg.id} onClick={() => handleSelectPackage(pkg)}
                  className="w-full bg-white border border-gray-200 rounded-2xl p-3.5 flex items-center gap-3 tap-scale active:bg-gray-50">
                  <div className={`w-11 h-11 rounded-xl ${getBgColor(pkg.color)} flex items-center justify-center shrink-0`}>
                    <Tag size={18} className={getTextColor(pkg.color)} />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="flex items-center gap-2">
                      <p className="text-[13px] font-bold text-gray-900">{pkg.name}</p>
                      {pkg.badge && (
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${getBadgeBg(pkg.color)}`}>
                          {pkg.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-gray-400 mt-0.5">
                      From {formatPackagePrice(pkg.daily)}/day
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[15px] font-bold text-gray-900">{formatPackagePrice(pkg.fullPrice)}</p>
                    {pkg.discount > 0 && (
                      <p className="text-[10px] font-bold text-emerald-600">{pkg.discount}% off</p>
                    )}
                  </div>
                  <ChevronRight size={16} className="text-gray-300 shrink-0" />
                </button>
              ))}
            </div>
          )}

          {/* STEP: Plan Selection */}
          {step === 'plan' && (
            <div className="flex flex-col gap-3 pt-3">
              <div className={`rounded-2xl p-4 ${getBgColor(selectedPkg.color)} text-center`}>
                <p className="text-[11px] font-medium text-gray-500">{selectedPkg.fullName}</p>
                <p className="text-[24px] font-bold text-gray-900">{formatPackagePrice(selectedPkg.fullPrice)}</p>
                {selectedPkg.discount > 0 && (
                  <p className="text-[11px] font-bold text-emerald-600">
                    You save {formatPackagePrice(selectedPkg.saveAmount)} ({selectedPkg.discount}% off)
                  </p>
                )}
              </div>

              <p className="text-[12px] font-semibold text-gray-600 text-center">How do you want to pay?</p>

              <button onClick={handleFullPay}
                className="w-full bg-white border border-gray-200 rounded-2xl p-4 flex items-center gap-3 tap-scale">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
                  <CreditCard size={18} className="text-emerald-600" />
                </div>
                <div className="flex-1 text-left">
                  <p className="text-[13px] font-bold text-gray-900">Full Payment</p>
                  <p className="text-[10px] text-gray-500">Pay once, use forever</p>
                </div>
                <p className="text-[14px] font-bold text-emerald-600">{formatPackagePrice(selectedPkg.fullPrice)}</p>
              </button>

              <button onClick={handleInstallment}
                className="w-full bg-white border border-gray-200 rounded-2xl p-4 flex items-center gap-3 tap-scale">
                <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
                  <Calendar size={18} className="text-amber-600" />
                </div>
                <div className="flex-1 text-left">
                  <p className="text-[13px] font-bold text-gray-900">Installment Plan</p>
                  <p className="text-[10px] text-gray-500">Pay in easy installments</p>
                </div>
                <ArrowRight size={16} className="text-gray-400" />
              </button>

              <button onClick={() => setStep('packages')}
                className="w-full py-2 text-[12px] text-gray-400 font-semibold tap-scale">
                Back to Packages
              </button>
            </div>
          )}

          {/* STEP: Installment Plan Selection */}
          {step === 'plansel' && (
            <div className="flex flex-col gap-2.5 pt-3">
              <p className="text-[12px] font-semibold text-gray-600 text-center mb-1">Select installment frequency</p>
              {([
                { plan: 'daily' as InstallmentPlan, label: 'Daily', amount: selectedPkg.daily, desc: 'Pay daily' },
                { plan: 'weekly' as InstallmentPlan, label: 'Weekly', amount: selectedPkg.weekly, desc: 'Pay weekly' },
                { plan: 'monthly' as InstallmentPlan, label: 'Monthly', amount: selectedPkg.monthly, desc: 'Pay monthly' },
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
                  <p className="text-[14px] font-bold text-brand-600">{formatPackagePrice(p.amount)}</p>
                </button>
              ))}
              <button onClick={() => setStep('plan')}
                className="w-full py-2 text-[12px] text-gray-400 font-semibold tap-scale">
                Back
              </button>
            </div>
          )}

          {/* STEP: Payment Form */}
          {step === 'form' && (
            <div className="flex flex-col gap-2.5 pt-3">
              <div className="bg-brand-50 rounded-2xl p-3 text-center">
                <p className="text-[10px] text-brand-500 font-medium">
                  {selectedPkg.name} — {paymentType === 'full' ? 'Full Payment' : `${installmentPlan} installment`}
                </p>
                <p className="text-[20px] font-bold text-brand-700">
                  {formatPackagePrice(
                    paymentType === 'full' ? selectedPkg.fullPrice
                    : installmentPlan === 'daily' ? selectedPkg.daily
                    : installmentPlan === 'weekly' ? selectedPkg.weekly
                    : selectedPkg.monthly
                  )}
                </p>
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
              <button onClick={() => paymentType === 'installment' ? setStep('plansel') : setStep('plan')}
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
                  Your payment proof for <span className="font-bold">{selectedPkg.name}</span> package has been submitted.
                  All features will unlock once the admin approves.
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
        </div>
      </div>
    </div>
  );
}
