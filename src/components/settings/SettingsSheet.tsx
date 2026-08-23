import { useState, useRef } from 'react';
import { Store, Download, Upload, Info } from 'lucide-react';
import BottomSheet from '../common/BottomSheet';
import { updateSettings, exportAllData, importAllData } from '../../db/queries';
import { useAppStore } from '../../store/useAppStore';
import type { AppSettings } from '../../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
}

export default function SettingsSheet({ isOpen, onClose, settings }: Props) {
  const [shopName, setShopName] = useState(settings.shopName);
  const [currency, setCurrency] = useState(settings.currency);
  const showToast = useAppStore((s) => s.showToast);
  const setSettings = useAppStore((s) => s.setSettings);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleSave() {
    await updateSettings({ shopName, currency });
    setSettings({ ...settings, shopName, currency });
    showToast('Settings saved');
    onClose();
  }

  async function handleBackup() {
    const data = await exportAllData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `icestock-backup-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    await updateSettings({ lastBackupDate: Date.now() });
    showToast('Backup downloaded');
  }

  async function handleRestoreFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      await importAllData(data);
      showToast('Data restored! Reloading...');
      setTimeout(() => window.location.reload(), 1000);
    } catch {
      showToast('Invalid backup file', 'error');
    }
  }

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Settings">
      <div className="flex flex-col gap-5 pb-6">
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-2xl bg-brand-50 flex items-center justify-center">
            <Store size={26} className="text-brand-500" />
          </div>
        </div>

        <div>
          <label className="text-[11.5px] font-semibold text-gray-500 mb-1.5 block">Shop Name</label>
          <input value={shopName} onChange={(e) => setShopName(e.target.value)} className="input-field" />
        </div>

        <div>
          <label className="text-[11.5px] font-semibold text-gray-500 mb-1.5 block">Currency Symbol</label>
          <input value={currency} onChange={(e) => setCurrency(e.target.value)} className="input-field" />
        </div>

        <button onClick={handleSave} className="w-full py-3.5 rounded-2xl bg-brand-500 text-white font-bold text-[14px] tap-scale">
          Save Settings
        </button>

        <div className="border-t border-gray-100 pt-4">
          <p className="text-[12px] font-bold text-gray-500 mb-2">Backup &amp; Restore</p>
          <p className="text-[11.5px] text-gray-400 mb-3">
            All your data stays on this device. Download a backup file regularly to keep it safe.
          </p>
          <div className="flex flex-col gap-2">
            <button
              onClick={handleBackup}
              className="w-full py-3 rounded-2xl bg-emerald-50 text-emerald-600 font-semibold text-[13px] flex items-center justify-center gap-2 tap-scale"
            >
              <Download size={15} /> Download Backup
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-3 rounded-2xl bg-amber-50 text-amber-600 font-semibold text-[13px] flex items-center justify-center gap-2 tap-scale"
            >
              <Upload size={15} /> Restore from Backup
            </button>
            <input ref={fileInputRef} type="file" accept=".json" className="hidden" onChange={handleRestoreFile} />
          </div>
        </div>

        <div className="flex items-start gap-2 bg-gray-50 rounded-2xl p-3">
          <Info size={14} className="text-gray-400 mt-0.5 shrink-0" />
          <p className="text-[11px] text-gray-400 leading-relaxed">
            IceStock Pro works fully offline. Your data is stored locally on this device only — no cloud, no account needed.
          </p>
        </div>
      </div>
    </BottomSheet>
  );
}
