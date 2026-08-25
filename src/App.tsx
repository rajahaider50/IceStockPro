import { useEffect, useState } from 'react';
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

export default function App() {
  const [activeTab, setActiveTab] = useState<TabKey>('dashboard');
  const [ready, setReady] = useState(false);
  const [lowStockCount, setLowStockCount] = useState(0);
  const [lowStockOpen, setLowStockOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [unlocked, setUnlocked] = useState(() => sessionStorage.getItem('isp_unlocked') === '1');
  const [paid, setPaid] = useState(() => sessionStorage.getItem('isp_paid') === '1');
  const settings = useAppStore((s) => s.settings);
  const setSettings = useAppStore((s) => s.setSettings);
  const refreshKey = useAppStore((s) => s.refreshKey);

  useEffect(() => {
    async function init() {
      await seedIfEmpty();
      await seedAdminDefaults();
      const s = await getSettings();
      setSettings(s);
      // Check if user has an approved payment
      const lastPayment = await getLatestApprovedPayment();
      if (lastPayment) {
        sessionStorage.setItem('isp_paid', '1');
        setPaid(true);
      }
      setReady(true);
    }
    init();
  }, [setSettings]);

  useEffect(() => {
    if (!ready) return;
    getLowStockItems().then((items) => setLowStockCount(items.length));
  }, [ready, refreshKey, activeTab]);

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

  if (!ready || !settings) {
    return (
      <div className="h-full flex items-center justify-center bg-surface">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-brand-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-[13px] text-gray-400 font-medium">Loading IceStock Pro...</p>
        </div>
      </div>
    );
  }

  if (settings.pinHash && !unlocked) {
    return <PinLock pinHash={settings.pinHash} onUnlock={() => { sessionStorage.setItem('isp_unlocked', '1'); setUnlocked(true); }} />;
  }

  if (!paid) {
    return <PaymentGate onUnlocked={() => { sessionStorage.setItem('isp_paid', '1'); setPaid(true); }} />;
  }

  return (
    <div className="min-h-full bg-surface flex flex-col">
      <Header
        shopName={settings.shopName}
        lowStockCount={lowStockCount}
        onBellClick={() => setLowStockOpen(true)}
        onSettingsClick={() => setSettingsOpen(true)}
      />

      <main className="flex-1 pb-20">
        {activeTab === 'dashboard' && (
          <Dashboard settings={settings} refreshKey={refreshKey} onViewLowStock={() => setLowStockOpen(true)} />
        )}
        {activeTab === 'stock' && <StockPage settings={settings} refreshKey={refreshKey} />}
        {activeTab === 'sales' && <SalesPage settings={settings} refreshKey={refreshKey} />}
        {activeTab === 'purchase' && <PurchasePage settings={settings} refreshKey={refreshKey} />}
        {activeTab === 'reports' && <ReportsPage settings={settings} refreshKey={refreshKey} />}
      </main>

      <BottomNav active={activeTab} onChange={setActiveTab} />
      <ToastContainer />

      <LowStockSheet
        isOpen={lowStockOpen}
        onClose={() => setLowStockOpen(false)}
        settings={settings}
        refreshKey={refreshKey}
      />
      <SettingsSheet isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} settings={settings} />
    </div>
  );
}
