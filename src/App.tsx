import { useEffect, useState, useRef } from 'react';
import Header from './components/common/Header';
import BottomNav, { type TabKey } from './components/common/BottomNav';
import ToastContainer from './components/common/ToastContainer';
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
      </div>
    </div>
  );
}

export default function App() {
  const [activeTab, setActiveTab] = useState<TabKey>('dashboard');
  const [phase, setPhase] = useState<'splash' | 'init' | 'ready'>('splash');
  const [lowStockCount, setLowStockCount] = useState(0);
  const [lowStockOpen, setLowStockOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [unlocked, setUnlocked] = useState(() => sessionStorage.getItem('isp_unlocked') === '1');
  const [paid, setPaid] = useState(() => sessionStorage.getItem('isp_paid') === '1');
  const settings = useAppStore((s) => s.settings);
  const setSettings = useAppStore((s) => s.setSettings);
  const refreshKey = useAppStore((s) => s.refreshKey);
  const inited = useRef(false);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('init'), 2000);
    return () => clearTimeout(t1);
  }, []);

  useEffect(() => {
    if (phase !== 'init' || inited.current) return;
    inited.current = true;

    let forceReady: ReturnType<typeof setTimeout>;

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
        if (lastPayment) {
          sessionStorage.setItem('isp_paid', '1');
          setPaid(true);
        }
      } catch (_) {}
      clearTimeout(forceReady);
      setPhase('ready');
    }

    forceReady = setTimeout(() => {
      if (!useAppStore.getState().settings) {
        setSettings(DEFAULT_SETTINGS);
      }
      setPhase('ready');
    }, 5000);

    init();
  }, [phase, setSettings]);

  useEffect(() => {
    if (phase !== 'ready') return;
    getLowStockItems().then((items) => setLowStockCount(items.length));
  }, [phase, refreshKey, activeTab]);

  useEffect(() => {
    if (!settings) return;
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
  }, [settings?.theme]);

  if (phase === 'splash' || phase === 'init') {
    return <SplashScreen />;
  }

  const s = settings || DEFAULT_SETTINGS;

  if (s.pinHash && !unlocked) {
    return <PinLock pinHash={s.pinHash} onUnlock={() => { sessionStorage.setItem('isp_unlocked', '1'); setUnlocked(true); }} />;
  }

  if (!paid) {
    return <PaymentGate onUnlocked={() => { sessionStorage.setItem('isp_paid', '1'); setPaid(true); }} />;
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
        {activeTab === 'stock' && <StockPage settings={s} refreshKey={refreshKey} />}
        {activeTab === 'sales' && <SalesPage settings={s} refreshKey={refreshKey} />}
        {activeTab === 'purchase' && <PurchasePage settings={s} refreshKey={refreshKey} />}
        {activeTab === 'reports' && <ReportsPage settings={s} refreshKey={refreshKey} />}
      </main>

      <BottomNav active={activeTab} onChange={setActiveTab} />
      <ToastContainer />

      <LowStockSheet
        isOpen={lowStockOpen}
        onClose={() => setLowStockOpen(false)}
        settings={s}
        refreshKey={refreshKey}
      />
      <SettingsSheet isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} settings={s} />
    </div>
  );
}
