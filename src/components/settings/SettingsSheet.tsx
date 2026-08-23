import { useState, useRef } from 'react';
import { Store, Download, Upload, Info, Trash2, AlertTriangle } from 'lucide-react';
import BottomSheet from '../common/BottomSheet';
import { updateSettings, exportAllData, importAllData, deleteAllData } from '../../db/queries';
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
  const [deleteStep, setDeleteStep] = useState<0 | 1 | 2>(0); // 0 = closed, 1 = confirm, 2 = type to confirm
  const [confirmText, setConfirmText] = useState('');
  const showToast = useAppStore((s) => s.showToast);
  const setSettings = useAppStore((s) => s.setSettings);
  const triggerRefresh = useAppStore((s) => s.triggerRefresh);
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

  async function handleDeleteAll() {
    await deleteAllData();
    showToast('All data deleted. Starting fresh...');
    setDeleteStep(0);
    setConfirmText('');
    triggerRefresh();
    setTimeout(() => window.location.reload(), 800);
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

        {/* Danger Zone */}
        <div className="border-t border-gray-100 pt-4">
          <p className="text-[12px] font-bold text-red-500 mb-2">Danger Zone</p>
          <p className="text-[11.5px] text-gray-400 mb-3">
            Permanently erase all items, sales, and purchase history. This cannot be undone — download a backup first if you might need this data later.
          </p>
          <button
            onClick={() => setDeleteStep(1)}
            className="w-full py-3 rounded-2xl bg-red-50 text-red-600 font-semibold text-[13px] flex items-center justify-center gap-2 tap-scale"
          >
            <Trash2 size={15} /> Delete All Data
          </button>
        </div>

        <div className="flex items-start gap-2 bg-gray-50 rounded-2xl p-3">
          <Info size={14} className="text-gray-400 mt-0.5 shrink-0" />
          <p className="text-[11px] text-gray-400 leading-relaxed">
            IceStock Pro works fully offline. Your data is stored locally on this device only — no cloud, no account needed.
          </p>
        </div>
      </div>

      {/* Step 1: initial warning */}
      {deleteStep === 1 && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center px-6">
          <div className="absolute inset-0 bg-black/40 animate-fade-in" onClick={() => setDeleteStep(0)} />
          <div className="relative bg-white rounded-3xl p-5 w-full max-w-xs animate-fade-in">
            <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center mb-3">
              <AlertTriangle size={22} className="text-red-500" />
            </div>
            <h3 className="text-[15px] font-bold text-gray-900 mb-1">Delete everything?</h3>
            <p className="text-[13px] text-gray-500 mb-4 leading-snug">
              This will erase ALL stock items, sales, and purchase history forever. Have you downloaded a backup?
            </p>
            <div className="flex gap-2">
              <button onClick={() => setDeleteStep(0)} className="flex-1 py-2.5 rounded-xl bg-gray-100 text-gray-700 text-[13px] font-semibold tap-scale">
                Cancel
              </button>
              <button onClick={() => setDeleteStep(2)} className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-[13px] font-semibold tap-scale">
                Continue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 2: type DELETE to confirm */}
      {deleteStep === 2 && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center px-6">
          <div className="absolute inset-0 bg-black/40 animate-fade-in" onClick={() => { setDeleteStep(0); setConfirmText(''); }} />
          <div className="relative bg-white rounded-3xl p-5 w-full max-w-xs animate-fade-in">
            <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center mb-3">
              <AlertTriangle size={22} className="text-red-500" />
            </div>
            <h3 className="text-[15px] font-bold text-gray-900 mb-1">Type DELETE to confirm</h3>
            <p className="text-[13px] text-gray-500 mb-3 leading-snug">
              This is your last chance to cancel. Type <span className="font-bold text-red-500">DELETE</span> below to permanently erase everything.
            </p>
            <input
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="Type DELETE"
              className="input-field mb-4"
              autoFocus
            />
            <div className="flex gap-2">
              <button
                onClick={() => { setDeleteStep(0); setConfirmText(''); }}
                className="flex-1 py-2.5 rounded-xl bg-gray-100 text-gray-700 text-[13px] font-semibold tap-scale"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAll}
                disabled={confirmText !== 'DELETE'}
                className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-[13px] font-semibold tap-scale disabled:opacity-40"
              >
                Delete Forever
              </button>
            </div>
          </div>
        </div>
      )}
    </BottomSheet>
  );
}
