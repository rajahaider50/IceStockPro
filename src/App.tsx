import { useEffect, useState, useRef } from 'react';
import Header from './components/common/Header';
import BottomNav, { type TabKey } from './components/common/BottomNav';
import ToastContainer from './components/common/ToastContainer';
import DebugConsole from './components/common/DebugConsole';
import TutorialOverlay from './tutorial/TutorialOverlay';
import TutorialPlayButton from './tutorial/TutorialPlayButton';
import PinLock from './components/common/PinLock';
import PaymentGate from './components/payment/PaymentGate';
import Dashboard from './components/dashboard/Dashboard';
import LowStockSheet from './components/dashboard/LowStockSheet';
import StockPage from './components/stock/StockPage';
import SalesPage from './components/sales/SalesPage';
import PurchasePage from './components/purchase/PurchasePage';
import ReportsPage from './components/reports/ReportsPage';
import SettingsSheet from './components/settings/SettingsSheet';
import { getSettings, getLowStockItems, seedAdminDefaults, getLatestApprovedPayment } from './db/queries';
import { seedIfEmpty } from './utils/seedData';
import { useAppStore } from './store/useAppStore';

const DEFAULT_SETTINGS = {
  id: 1,
  shopName: 'My Ice Cream & Juice Shop',
  currency: 'Rs',
  theme: 'light' as const,
};

function safeSessionGet(key: string): string | null {
  try { return sessionStorage.getItem(key); } catch { return null; }
}
function safeSessionSet(key: string, val: string) {
  try { sessionStorage.setItem(key, val); } catch {}
}

function SplashScreen() {
  return (
    <div className="h-full flex items-center justify-center bg-surface">
      <div className="flex flex-col items-center gap-4">
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-xl">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2a10 10 0 0 1 10 10c0 8-10 12-10 12S2 20 2 12A10 10 0 0 1 12 2z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
        </div>
        <div className="text-center">
          <h1 className="text-[20px] font-bold text-gray-900">IceStock Pro</h1>
          <p className="text-[12px] text-gray-400 mt-1">Ice Cream & Juice Shop Manager</p>
        </div>
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mt-2" />
      </div>
    </div>
  );
}

function LockedFeature({ onPay }: { onPay: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6">
      <div className="w-20 h-20 rounded-full bg-brand-50 flex items-center justify-center mb-4">
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-brand-500">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
        </svg>
      </div>
      <h3 className="text-[16px] font-bold text-gray-900 mb-1">Payment Required</h3>
      <p className="text-[13px] text-gray-500 text-center mb-5 leading-relaxed">
        Activate your plan to access all features including stock management, sales, purchases, and reports.
      </p>
      <button onClick={onPay}
        className="w-full max-w-[240px] py-3 rounded-2xl bg-brand-500 text-white font-bold text-[14px] tap-scale">
        Activate Now
      </button>
    </div>
  );
}

type PaymentStatus = 'checking' | 'paid' | 'pending' | 'rejected' | 'unpaid';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabKey>('dashboard');
  const [phase, setPhase] = useState<'splash' | 'ready'>('splash');
  const [lowStockCount, setLowStockCount] = useState(0);
  const [lowStockOpen, setLowStockOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [unlocked, setUnlocked] = useState(() => safeSessionGet('isp_unlocked') === '1');
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('checking');
  const settings = useAppStore((s) => s.settings);
  const setSettings = useAppStore((s) => s.setSettings);
  const refreshKey = useAppStore((s) => s.refreshKey);
  const inited = useRef(false);

  useEffect(() => {
    const t = setTimeout(() => setPhase('ready'), 2200);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (phase !== 'ready' || inited.current) return;
    inited.current = true;

    async function init() {
      try {
        await seedIfEmpty();
        await seedAdminDefaults();
        const s = await getSettings();
        setSettings(s);
      } catch (e) {
        console.error('Init error:', e);
        if (!useAppStore.getState().settings) {
          setSettings(DEFAULT_SETTINGS);
        }
      }
      try {
        const lastPayment = await getLatestApprovedPayment();
        if (lastPayment && lastPayment.status === 'approved') {
          setPaymentStatus('paid');
        } else if (lastPayment && lastPayment.status === 'pending') {
          setPaymentStatus('pending');
        } else if (lastPayment && lastPayment.status === 'rejected') {
          setPaymentStatus('rejected');
          setPaymentOpen(true);
        } else {
          setPaymentStatus('unpaid');
          setPaymentOpen(true);
        }
      } catch (e) {
        console.error('Payment check error:', e);
        setPaymentStatus('unpaid');
        setPaymentOpen(true);
      }
    }
    init();
  }, [phase, setSettings]);

  useEffect(() => {
    if (phase !== 'ready') return;
    getLowStockItems().then((items) => setLowStockCount(items.length)).catch(() => {});
  }, [phase, refreshKey, activeTab]);

  useEffect(() => {
    if (!settings) return;
    try {
      const root = document.documentElement;
      function applyDark(isDark: boolean) {
        root.classList.toggle('dark', isDark);
      }
      if (settings.theme === 'dark') applyDark(true);
      else if (settings.theme === 'light') applyDark(false);
      else {
        const mq = window.matchMedia('(prefers-color-scheme: dark)');
        applyDark(mq.matches);
        const listener = (e: MediaQueryListEvent) => applyDark(e.matches);
        mq.addEventListener('change', listener);
        return () => mq.removeEventListener('change', listener);
      }
    } catch {}
  }, [settings?.theme]);

  if (phase === 'splash') {
    return <SplashScreen />;
  }

  const s = settings || DEFAULT_SETTINGS;
  const isPaid = paymentStatus === 'paid';

  if (s.pinHash && !unlocked) {
    return <PinLock pinHash={s.pinHash} onUnlock={() => { safeSessionSet('isp_unlocked', '1'); setUnlocked(true); }} />;
  }

  function handleTabChange(tab: TabKey) {
    setActiveTab(tab);
    if (!isPaid && tab !== 'dashboard') {
      setPaymentOpen(true);
    }
  }

  return (
    <div className="min-h-full bg-surface flex flex-col">
      <Header
        shopName={s.shopName}
        lowStockCount={lowStockCount}
        onBellClick={() => setLowStockOpen(true)}
        onSettingsClick={() => setSettingsOpen(true)}
      />

      <main className="flex-1 pb-20">
        {activeTab === 'dashboard' && (
          <Dashboard settings={s} refreshKey={refreshKey} onViewLowStock={() => setLowStockOpen(true)} />
        )}
        {activeTab === 'stock' && (
          isPaid ? <StockPage settings={s} refreshKey={refreshKey} /> : <LockedFeature onPay={() => setPaymentOpen(true)} />
        )}
        {activeTab === 'sales' && (
          isPaid ? <SalesPage settings={s} refreshKey={refreshKey} /> : <LockedFeature onPay={() => setPaymentOpen(true)} />
        )}
        {activeTab === 'purchase' && (
          isPaid ? <PurchasePage settings={s} refreshKey={refreshKey} /> : <LockedFeature onPay={() => setPaymentOpen(true)} />
        )}
        {activeTab === 'reports' && (
          isPaid ? <ReportsPage settings={s} refreshKey={refreshKey} /> : <LockedFeature onPay={() => setPaymentOpen(true)} />
        )}
      </main>

      {!isPaid && (
        <div className="bg-amber-50 border-t border-amber-200 px-4 py-2.5">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse shrink-0" />
            <p className="text-[11px] text-amber-700 font-medium">
              {paymentStatus === 'pending' ? 'Payment under review. Activate all features after admin approval.' :
               paymentStatus === 'rejected' ? 'Payment rejected. Please submit again.' :
               'Activate your plan to access all features.'}
            </p>
            {paymentStatus !== 'pending' && (
              <button onClick={() => setPaymentOpen(true)}
                className="ml-auto text-[11px] font-bold text-amber-700 underline shrink-0">
                {paymentStatus === 'rejected' ? 'Retry' : 'Activate'}
              </button>
            )}
          </div>
        </div>
      )}

      <BottomNav active={activeTab} onChange={handleTabChange} />
      <ToastContainer />
      <DebugConsole />
      <TutorialOverlay />
      <TutorialPlayButton screen={activeTab} />

      <LowStockSheet
        isOpen={lowStockOpen}
        onClose={() => setLowStockOpen(false)}
        settings={s}
        refreshKey={refreshKey}
      />
      <SettingsSheet isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} settings={s} />

      <PaymentGate
        isOpen={paymentOpen}
        onClose={() => setPaymentOpen(false)}
        onPaid={() => { setPaymentStatus('paid'); setPaymentOpen(false); }}
        status={paymentStatus}
      />
    </div>
  );
}
