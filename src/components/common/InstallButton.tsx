import { useState, useEffect } from 'react';
import { Download, Check, Loader, X, Smartphone } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

declare global {
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent;
  }
}

export default function InstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [installing, setInstalling] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }
    if (localStorage.getItem('isp_app_installed') === '1') {
      setIsInstalled(true);
      return;
    }

    const handler = (e: BeforeInstallPromptEvent) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Show banner after 3 seconds
      setTimeout(() => setShowBanner(true), 3000);
    };

    const installedHandler = () => {
      setIsInstalled(true);
      setShowBanner(false);
      localStorage.setItem('isp_app_installed', '1');
    };

    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', installedHandler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('appinstalled', installedHandler);
    };
  }, []);

  async function handleInstall() {
    if (!deferredPrompt) return;

    setInstalling(true);
    try {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setInstalled(true);
        localStorage.setItem('isp_app_installed', '1');
        setTimeout(() => {
          setInstalling(false);
          setShowBanner(false);
          setIsInstalled(true);
        }, 1500);
      } else {
        setInstalling(false);
      }
    } catch (e) {
      console.error('Install failed:', e);
      setInstalling(false);
    }
    setDeferredPrompt(null);
  }

  function handleDismiss() {
    setShowBanner(false);
    sessionStorage.setItem('isp_install_dismissed', '1');
  }

  function handleOpenApp() {
    // Try to focus or reopen
    if (window.navigator.standalone) {
      // Already in standalone mode
      return;
    }
    // Try launching via protocol or just close banner
    setShowBanner(false);
  }

  // Don't show if installed or no prompt available or dismissed
  if (isInstalled || (!deferredPrompt && !showBanner)) return null;
  if (sessionStorage.getItem('isp_install_dismissed') === '1') return null;

  // Installing state — loading animation
  if (installing) {
    return (
      <div className="fixed inset-0 z-[200] bg-black/60 flex items-center justify-center">
        <div className="bg-white rounded-3xl p-8 flex flex-col items-center gap-4 max-w-xs mx-4">
          <div className="relative w-20 h-20">
            <div className="absolute inset-0 rounded-full border-4 border-brand-100" />
            <div className="absolute inset-0 rounded-full border-4 border-brand-500 border-t-transparent animate-spin" />
            <div className="absolute inset-3 rounded-full bg-brand-50 flex items-center justify-center">
              <Smartphone size={28} className="text-brand-500" />
            </div>
          </div>
          <div className="text-center">
            <p className="text-[16px] font-bold text-gray-900">Installing IceStock Pro</p>
            <p className="text-[12px] text-gray-500 mt-1">Please wait while the app is being installed...</p>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
            <div className="h-full bg-brand-500 rounded-full animate-loading-bar" style={{ width: '60%' }} />
          </div>
        </div>
      </div>
    );
  }

  // Installed state — open button
  if (installed) {
    return (
      <div className="fixed inset-0 z-[200] bg-black/60 flex items-center justify-center">
        <div className="bg-white rounded-3xl p-8 flex flex-col items-center gap-4 max-w-xs mx-4">
          <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center">
            <Check size={40} className="text-emerald-500" />
          </div>
          <div className="text-center">
            <p className="text-[16px] font-bold text-gray-900">Installation Complete!</p>
            <p className="text-[12px] text-gray-500 mt-1">IceStock Pro has been installed on your device</p>
          </div>
          <button onClick={handleOpenApp}
            className="w-full py-3.5 rounded-2xl bg-brand-500 text-white font-bold text-[14px] tap-scale">
            Open IceStock Pro
          </button>
        </div>
      </div>
    );
  }

  // Install banner
  return (
    <div className="fixed bottom-0 left-0 right-0 z-[90] p-3">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-4 animate-slide-up">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shrink-0">
            <Smartphone size={22} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-bold text-gray-900">Install IceStock Pro</p>
            <p className="text-[11px] text-gray-500">Add to home screen for full experience</p>
          </div>
          <button onClick={handleDismiss} className="p-1 shrink-0">
            <X size={16} className="text-gray-400" />
          </button>
        </div>
        <div className="flex gap-2 mt-3">
          <button onClick={handleDismiss}
            className="flex-1 py-2.5 rounded-xl bg-gray-100 text-gray-600 text-[12px] font-semibold tap-scale">
            Later
          </button>
          <button onClick={handleInstall}
            className="flex-1 py-2.5 rounded-xl bg-brand-500 text-white text-[12px] font-bold flex items-center justify-center gap-1.5 tap-scale">
            <Download size={14} /> Install
          </button>
        </div>
      </div>
    </div>
  );
}
