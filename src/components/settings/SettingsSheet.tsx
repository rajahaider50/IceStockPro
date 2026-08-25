import { useState, useRef } from 'react';
import {
  Store, Download, Upload, Info, Trash2, AlertTriangle, Sun, Moon, Smartphone,
  Tag, ChevronRight, BookOpen, Users, Truck, ReceiptText, AlertOctagon,
  Lock, Languages, Target, Eye, EyeOff, Code2, FileText, MessageCircle,
  Type, Palette, Circle, LayoutGrid, PenTool,
} from 'lucide-react';
import BottomSheet from '../common/BottomSheet';
import CategoryManagerSheet from '../common/CategoryManagerSheet';
import GuideSheet from './GuideSheet';
import AboutSheet from './AboutSheet';
import TermsSheet from './TermsSheet';
import ContactSheet from './ContactSheet';
import CustomersSheet from '../customers/CustomersSheet';
import CustomerLedgerSheet from '../customers/CustomerLedgerSheet';
import SuppliersSheet from '../suppliers/SuppliersSheet';
import ExpensesSheet from '../expenses/ExpensesSheet';
import WastageSheet from '../wastage/WastageSheet';
import AdminPasswordEntry from '../payment/AdminPasswordEntry';
import AdminPanel from '../payment/AdminPanel';
import { updateSettings, exportAllData, importAllData, deleteAllData } from '../../db/queries';
import { useAppStore } from '../../store/useAppStore';
import { hashPin } from '../common/PinLock';
import type { AppSettings, ThemeMode, FontFamily, BorderRadius, IconStyle } from '../../types';

const FONTS: { key: FontFamily; label: string; sample: string }[] = [
  { key: 'inter', label: 'Inter', sample: 'Aa Bb' },
  { key: 'roboto', label: 'Roboto', sample: 'Aa Bb' },
  { key: 'poppins', label: 'Poppins', sample: 'Aa Bb' },
  { key: 'montserrat', label: 'Montserrat', sample: 'Aa Bb' },
  { key: 'nunito', label: 'Nunito', sample: 'Aa Bb' },
];

const COLORS = [
  { name: 'Blue', value: '#059bf2' },
  { name: 'Indigo', value: '#6366f1' },
  { name: 'Purple', value: '#a855f7' },
  { name: 'Pink', value: '#ec4899' },
  { name: 'Red', value: '#ef4444' },
  { name: 'Orange', value: '#f97316' },
  { name: 'Amber', value: '#f59e0b' },
  { name: 'Green', value: '#22c55e' },
  { name: 'Teal', value: '#14b8a6' },
  { name: 'Cyan', value: '#06b6d4' },
];

const RADII: { key: BorderRadius; label: string; demo: string }[] = [
  { key: 'standard', label: 'Standard', demo: 'rounded-xl' },
  { key: 'rounded', label: 'More Rounded', demo: 'rounded-2xl' },
  { key: 'pill', label: 'Pill', demo: 'rounded-full' },
];

const ICON_STYLES: { key: IconStyle; label: string; desc: string }[] = [
  { key: 'outline', label: 'Outline', desc: 'Clean line icons' },
  { key: 'filled', label: 'Filled', desc: 'Solid filled icons' },
];

interface Props {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
}

export default function SettingsSheet({ isOpen, onClose, settings }: Props) {
  const [shopName, setShopName] = useState(settings.shopName);
  const [currency, setCurrency] = useState(settings.currency);
  const [theme, setTheme] = useState<ThemeMode>(settings.theme || 'light');
  const [deleteStep, setDeleteStep] = useState<0 | 1 | 2>(0);
  const [confirmText, setConfirmText] = useState('');
  const [categoryManagerOpen, setCategoryManagerOpen] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [termsOpen, setTermsOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [customersOpen, setCustomersOpen] = useState(false);
  const [ledgerCustomerId, setLedgerCustomerId] = useState<number | null>(null);
  const [suppliersOpen, setSuppliersOpen] = useState(false);
  const [expensesOpen, setExpensesOpen] = useState(false);
  const [wastageOpen, setWastageOpen] = useState(false);
  const [adminPassOpen, setAdminPassOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const [dailyTarget, setDailyTarget] = useState(String(settings.dailyTarget || ''));
  const [language, setLanguage] = useState<'en' | 'ur'>(settings.language || 'en');
  const [fontFamily, setFontFamily] = useState<FontFamily>(settings.fontFamily || 'inter');
  const [primaryColor, setPrimaryColor] = useState(settings.primaryColor || '#059bf2');
  const [borderRadius, setBorderRadius] = useState<BorderRadius>(settings.borderRadius || 'rounded');
  const [iconStyle, setIconStyle] = useState<IconStyle>(settings.iconStyle || 'outline');
  const [pinInput, setPinInput] = useState('');
  const [pinConfirm, setPinConfirm] = useState('');
  const [pinShow, setPinShow] = useState(false);
  const [pinRemoveMode, setPinRemoveMode] = useState(false);
  const showToast = useAppStore((s) => s.showToast);
  const setSettings = useAppStore((s) => s.setSettings);
  const triggerRefresh = useAppStore((s) => s.triggerRefresh);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleThemeChange(mode: ThemeMode) {
    setTheme(mode);
    await updateSettings({ theme: mode });
    setSettings({ ...settings, theme: mode });
  }

  async function handleSave() {
    const changes: Partial<AppSettings> = {
      shopName, currency, theme, language,
      fontFamily, primaryColor, borderRadius, iconStyle,
    };
    if (dailyTarget) changes.dailyTarget = parseFloat(dailyTarget) || undefined;
    else changes.dailyTarget = undefined;
    await updateSettings(changes);
    setSettings({ ...settings, ...changes });
    // Apply customizations
    applyFont(fontFamily);
    applyPrimaryColor(primaryColor);
    showToast('Settings saved');
    onClose();
  }

  function applyFont(font: FontFamily) {
    const families: Record<FontFamily, string> = {
      inter: "'Inter', system-ui, sans-serif",
      roboto: "'Roboto', system-ui, sans-serif",
      poppins: "'Poppins', system-ui, sans-serif",
      montserrat: "'Montserrat', system-ui, sans-serif",
      nunito: "'Nunito', system-ui, sans-serif",
    };
    document.documentElement.style.setProperty('--font-display', families[font]);
  }

  function applyPrimaryColor(color: string) {
    document.documentElement.style.setProperty('--color-brand-500', color);
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

  function handleSetPin() {
    if (pinInput.length !== 4 || !/^\d{4}$/.test(pinInput)) {
      showToast('PIN must be 4 digits', 'error');
      return;
    }
    if (pinInput !== pinConfirm) {
      showToast('PINs do not match', 'error');
      return;
    }
    const h = hashPin(pinInput);
    updateSettings({ pinHash: h });
    setSettings({ ...settings, pinHash: h });
    sessionStorage.setItem('isp_unlocked', '1');
    setPinInput('');
    setPinConfirm('');
    showToast('PIN set successfully');
  }

  function handleRemovePin() {
    updateSettings({ pinHash: undefined });
    setSettings({ ...settings, pinHash: undefined });
    sessionStorage.setItem('isp_unlocked', '1');
    setPinRemoveMode(false);
    showToast('PIN removed');
  }

  const hasPin = !!settings.pinHash;

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Settings">
      <div className="flex flex-col gap-5 pb-6">
        {/* App Icon */}
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-2xl bg-brand-50 flex items-center justify-center">
            <Store size={26} className="text-brand-500" />
          </div>
        </div>

        {/* Shop Info */}
        <div>
          <label className="text-[11.5px] font-semibold text-gray-500 mb-1.5 block">Shop Name</label>
          <input value={shopName} onChange={(e) => setShopName(e.target.value)} className="input-field" />
        </div>

        <div>
          <label className="text-[11.5px] font-semibold text-gray-500 mb-1.5 block">Currency Symbol</label>
          <input value={currency} onChange={(e) => setCurrency(e.target.value)} className="input-field" />
        </div>

        {/* Theme */}
        <div>
          <label className="text-[11.5px] font-semibold text-gray-500 mb-1.5 block">Appearance</label>
          <div className="flex gap-2">
            {([
              { value: 'light' as ThemeMode, label: 'Light', icon: Sun },
              { value: 'dark' as ThemeMode, label: 'Dark', icon: Moon },
              { value: 'system' as ThemeMode, label: 'Auto', icon: Smartphone },
            ]).map((opt) => {
              const Icon = opt.icon;
              const active = theme === opt.value;
              return (
                <button key={opt.value} onClick={() => handleThemeChange(opt.value)}
                  className={`flex-1 py-2.5 rounded-xl flex flex-col items-center gap-1 tap-scale ${
                    active ? 'bg-brand-500 text-white' : 'bg-gray-100 text-gray-500'
                  }`}>
                  <Icon size={16} />
                  <span className="text-[11px] font-semibold">{opt.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Daily Target */}
        <div>
          <label className="text-[11.5px] font-semibold text-gray-500 mb-1.5 block">Daily Sales Target (Rs)</label>
          <input value={dailyTarget} onChange={(e) => setDailyTarget(e.target.value)}
            placeholder="e.g. 5000" type="number" className="input-field" />
        </div>

        {/* Language */}
        <div>
          <label className="text-[11.5px] font-semibold text-gray-500 mb-1.5 block">Language / زبان</label>
          <div className="flex gap-2">
            {([
              { value: 'en' as const, label: 'English' },
              { value: 'ur' as const, label: 'اردو' },
            ]).map((opt) => (
              <button key={opt.value} onClick={() => setLanguage(opt.value)}
                className={`flex-1 py-2.5 rounded-xl text-[12px] font-semibold tap-scale ${
                  language === opt.value ? 'bg-brand-500 text-white' : 'bg-gray-100 text-gray-500'
                }`}>
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <button onClick={handleSave}
          className="w-full py-3.5 rounded-2xl bg-brand-500 text-white font-bold text-[14px] tap-scale">
          Save Settings
        </button>

        {/* ====== CUSTOMIZATION ====== */}
        <div className="border-t border-gray-100 pt-4">
          <p className="text-[12px] font-bold text-gray-500 mb-3">Customization / تخصیص</p>

          {/* Font Style */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Type size={14} className="text-gray-500" />
              <p className="text-[11.5px] font-semibold text-gray-600">Font Style</p>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {FONTS.map((f) => (
                <button key={f.key} onClick={() => setFontFamily(f.key)}
                  className={`py-2.5 rounded-xl text-center tap-scale ${
                    fontFamily === f.key ? 'bg-brand-500 text-white' : 'bg-gray-50 text-gray-600 border border-gray-100'
                  }`}>
                  <p className="text-[12px] font-bold" style={{ fontFamily: f.key }}>{f.label}</p>
                  <p className="text-[9px] opacity-60">{f.sample}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Primary Color */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Palette size={14} className="text-gray-500" />
              <p className="text-[11.5px] font-semibold text-gray-600">Primary Color</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {COLORS.map((c) => (
                <button key={c.value} onClick={() => setPrimaryColor(c.value)}
                  className={`w-9 h-9 rounded-full tap-scale border-2 ${
                    primaryColor === c.value ? 'border-gray-900 scale-110' : 'border-white'
                  }`}
                  style={{ backgroundColor: c.value }}
                  title={c.name}
                />
              ))}
            </div>
          </div>

          {/* Border Radius */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Circle size={14} className="text-gray-500" />
              <p className="text-[11.5px] font-semibold text-gray-600">Corner Style</p>
            </div>
            <div className="flex gap-2">
              {RADII.map((r) => (
                <button key={r.key} onClick={() => setBorderRadius(r.key)}
                  className={`flex-1 py-2.5 text-center tap-scale ${
                    borderRadius === r.key ? 'bg-brand-500 text-white' : 'bg-gray-50 text-gray-600 border border-gray-100'
                  }`}
                  style={{ borderRadius: r.key === 'standard' ? '12px' : r.key === 'rounded' ? '16px' : '9999px' }}>
                  <p className="text-[11px] font-semibold">{r.label}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Icon Style */}
          <div className="mb-2">
            <div className="flex items-center gap-2 mb-2">
              <LayoutGrid size={14} className="text-gray-500" />
              <p className="text-[11.5px] font-semibold text-gray-600">Icon Style</p>
            </div>
            <div className="flex gap-2">
              {ICON_STYLES.map((s) => (
                <button key={s.key} onClick={() => setIconStyle(s.key)}
                  className={`flex-1 py-2.5 rounded-xl text-center tap-scale ${
                    iconStyle === s.key ? 'bg-brand-500 text-white' : 'bg-gray-50 text-gray-600 border border-gray-100'
                  }`}>
                  <p className="text-[11px] font-semibold">{s.label}</p>
                  <p className="text-[9px] opacity-60">{s.desc}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ====== BUSINESS TOOLS ====== */}
        <div className="border-t border-gray-100 pt-4">
          <p className="text-[12px] font-bold text-gray-500 mb-2">Business Tools / کاروباری ٹولز</p>
          <div className="flex flex-col gap-2">
            {[
              { icon: Users, label: 'Customers / Udhaar', color: 'bg-red-50 text-red-500', onClick: () => setCustomersOpen(true) },
              { icon: Truck, label: 'Suppliers / سپلائرز', color: 'bg-blue-50 text-blue-500', onClick: () => setSuppliersOpen(true) },
              { icon: ReceiptText, label: 'Expenses / اخراجات', color: 'bg-amber-50 text-amber-500', onClick: () => setExpensesOpen(true) },
              { icon: AlertOctagon, label: 'Wastage / ضیاع', color: 'bg-orange-50 text-orange-500', onClick: () => setWastageOpen(true) },
            ].map((row) => {
              const Icon = row.icon;
              return (
                <button key={row.label} onClick={row.onClick}
                  className="w-full flex items-center gap-3 bg-white border border-gray-100 rounded-2xl p-3.5 tap-scale">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${row.color}`}>
                    <Icon size={16} />
                  </div>
                  <span className="text-[13px] font-semibold text-gray-800 flex-1 text-left">{row.label}</span>
                  <ChevronRight size={16} className="text-gray-300" />
                </button>
              );
            })}
          </div>
        </div>

        {/* ====== ITEM MANAGEMENT ====== */}
        <div className="border-t border-gray-100 pt-4">
          <p className="text-[12px] font-bold text-gray-500 mb-2">Item Management</p>
          <button onClick={() => setCategoryManagerOpen(true)}
            className="w-full flex items-center gap-3 bg-white border border-gray-100 rounded-2xl p-3.5 tap-scale">
            <div className="w-9 h-9 rounded-xl bg-brand-50 flex items-center justify-center shrink-0">
              <Tag size={16} className="text-brand-600" />
            </div>
            <span className="text-[13px] font-semibold text-gray-800 flex-1 text-left">Manage Categories</span>
            <ChevronRight size={16} className="text-gray-300" />
          </button>
        </div>

        {/* ====== SECURITY ====== */}
        <div className="border-t border-gray-100 pt-4">
          <p className="text-[12px] font-bold text-gray-500 mb-2">Security / سیکیورٹی</p>
          <div className="bg-gray-50 rounded-2xl p-3.5">
            <div className="flex items-center gap-3 mb-3">
              <Lock size={16} className="text-gray-500" />
              <span className="text-[13px] font-semibold text-gray-800">PIN Lock</span>
              {hasPin && <span className="text-[10px] bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded-full font-semibold">Active</span>}
            </div>

            {!hasPin && !pinRemoveMode && (
              <div className="flex flex-col gap-2">
                <div className="relative">
                  <input value={pinInput} onChange={(e) => setPinInput(e.target.value)}
                    placeholder="Enter 4-digit PIN" maxLength={4} type={pinShow ? 'text' : 'password'}
                    className="input-field pr-10" />
                  <button onClick={() => setPinShow(!pinShow)} className="absolute right-3 top-1/2 -translate-y-1/2">
                    {pinShow ? <Eye size={15} className="text-gray-400" /> : <EyeOff size={15} className="text-gray-400" />}
                  </button>
                </div>
                <input value={pinConfirm} onChange={(e) => setPinConfirm(e.target.value)}
                  placeholder="Confirm PIN" maxLength={4} type="password" className="input-field" />
                <button onClick={handleSetPin}
                  className="w-full py-2.5 rounded-xl bg-brand-500 text-white text-[12px] font-semibold tap-scale">
                  Set PIN
                </button>
              </div>
            )}

            {hasPin && (
              <div className="flex gap-2">
                {pinRemoveMode ? (
                  <div className="flex flex-col gap-2 w-full">
                    <input value={pinInput} onChange={(e) => setPinInput(e.target.value)}
                      placeholder="Enter current PIN" maxLength={4} type="password" className="input-field" />
                    <div className="flex gap-2">
                      <button onClick={() => { setPinRemoveMode(false); setPinInput(''); }}
                        className="flex-1 py-2.5 rounded-xl bg-gray-100 text-gray-600 text-[12px] font-semibold tap-scale">
                        Cancel
                      </button>
                      <button onClick={() => {
                        if (hashPin(pinInput) === settings.pinHash) handleRemovePin();
                        else showToast('Wrong PIN', 'error');
                      }} className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-[12px] font-semibold tap-scale">
                        Confirm Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <button onClick={() => { sessionStorage.setItem('isp_unlocked', '1'); showToast('PIN disabled this session'); }}
                      className="flex-1 py-2.5 rounded-xl bg-gray-100 text-gray-600 text-[12px] font-semibold tap-scale">
                      Disable (session)
                    </button>
                    <button onClick={() => { setPinRemoveMode(true); setPinInput(''); }}
                      className="flex-1 py-2.5 rounded-xl bg-red-50 text-red-600 text-[12px] font-semibold tap-scale">
                      Remove PIN
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ====== HELP ====== */}
        <div className="border-t border-gray-100 pt-4">
          <p className="text-[12px] font-bold text-gray-500 mb-2">Help</p>
          <button onClick={() => setGuideOpen(true)}
            className="w-full flex items-center gap-3 bg-gradient-to-r from-brand-600 to-brand-500 rounded-2xl p-3.5 tap-scale">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              <BookOpen size={16} className="text-white" />
            </div>
            <span className="text-[13px] font-bold text-white flex-1 text-left">Complete Guide / مکمل گائیڈ</span>
            <ChevronRight size={16} className="text-white/70" />
          </button>
        </div>

        {/* ====== ABOUT / LEGAL ====== */}
        <div className="border-t border-gray-100 pt-4">
          <p className="text-[12px] font-bold text-gray-500 mb-2">About & Legal</p>
          <div className="flex flex-col gap-2">
            {[
              { icon: Code2, label: 'About / Developer Info', color: 'bg-purple-50 text-purple-500', onClick: () => setAboutOpen(true) },
              { icon: MessageCircle, label: 'Contact Us / رابطہ', color: 'bg-green-50 text-green-600', onClick: () => setContactOpen(true) },
              { icon: FileText, label: 'Terms & Conditions', color: 'bg-blue-50 text-blue-500', onClick: () => setTermsOpen(true) },
            ].map((row) => {
              const Icon = row.icon;
              return (
                <button key={row.label} onClick={row.onClick}
                  className="w-full flex items-center gap-3 bg-white border border-gray-100 rounded-2xl p-3.5 tap-scale">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${row.color}`}>
                    <Icon size={16} />
                  </div>
                  <span className="text-[13px] font-semibold text-gray-800 flex-1 text-left">{row.label}</span>
                  <ChevronRight size={16} className="text-gray-300" />
                </button>
              );
            })}
          </div>
        </div>

        {/* ====== BACKUP & RESTORE ====== */}
        <div className="border-t border-gray-100 pt-4">
          <p className="text-[12px] font-bold text-gray-500 mb-2">Backup &amp; Restore</p>
          <p className="text-[11.5px] text-gray-400 mb-3">
            All your data stays on this device. Download a backup file regularly to keep it safe.
          </p>
          <div className="flex flex-col gap-2">
            <button onClick={handleBackup}
              className="w-full py-3 rounded-2xl bg-emerald-50 text-emerald-600 font-semibold text-[13px] flex items-center justify-center gap-2 tap-scale">
              <Download size={15} /> Download Backup
            </button>
            <button onClick={() => fileInputRef.current?.click()}
              className="w-full py-3 rounded-2xl bg-amber-50 text-amber-600 font-semibold text-[13px] flex items-center justify-center gap-2 tap-scale">
              <Upload size={15} /> Restore from Backup
            </button>
            <input ref={fileInputRef} type="file" accept=".json" className="hidden" onChange={handleRestoreFile} />
          </div>
        </div>

        {/* ====== DANGER ZONE ====== */}
        <div className="border-t border-gray-100 pt-4">
          <p className="text-[12px] font-bold text-red-500 mb-2">Danger Zone</p>
          <p className="text-[11.5px] text-gray-400 mb-3">
            Permanently erase all items, sales, and purchase history. This cannot be undone — download a backup first.
          </p>
          <button onClick={() => setDeleteStep(1)}
            className="w-full py-3 rounded-2xl bg-red-50 text-red-600 font-semibold text-[13px] flex items-center justify-center gap-2 tap-scale">
            <Trash2 size={15} /> Delete All Data
          </button>
        </div>

        <div className="flex items-start gap-2 bg-gray-50 rounded-2xl p-3">
          <Info size={14} className="text-gray-400 mt-0.5 shrink-0" />
          <p className="text-[11px] text-gray-400 leading-relaxed">
            IceStock Pro works fully offline. Your data is stored locally on this device only — no cloud, no account needed.
          </p>
        </div>

        {/* Hidden Admin Panel Entry */}
        <div className="border-t border-gray-100 pt-3">
          <button onClick={() => setAdminPassOpen(true)}
            className="w-full text-center py-2 tap-scale">
            <p className="text-[9px] text-gray-300 font-medium tracking-widest">ADMIN</p>
          </button>
        </div>
      </div>

      {/* ====== SHEETS ====== */}
      <CategoryManagerSheet isOpen={categoryManagerOpen} onClose={() => setCategoryManagerOpen(false)} />
      <GuideSheet isOpen={guideOpen} onClose={() => setGuideOpen(false)} />
      <AboutSheet isOpen={aboutOpen} onClose={() => setAboutOpen(false)} />
      <TermsSheet isOpen={termsOpen} onClose={() => setTermsOpen(false)} />
      <ContactSheet isOpen={contactOpen} onClose={() => setContactOpen(false)} />
      <CustomersSheet isOpen={customersOpen} onClose={() => setCustomersOpen(false)}
        onLedgerOpen={(id) => { setCustomersOpen(false); setLedgerCustomerId(id); }} />
      <CustomerLedgerSheet isOpen={ledgerCustomerId !== null} onClose={() => setLedgerCustomerId(null)}
        customerId={ledgerCustomerId} settings={settings} />
      <SuppliersSheet isOpen={suppliersOpen} onClose={() => setSuppliersOpen(false)} settings={settings} />
      <ExpensesSheet isOpen={expensesOpen} onClose={() => setExpensesOpen(false)} settings={settings} />
      <WastageSheet isOpen={wastageOpen} onClose={() => setWastageOpen(false)} settings={settings} />
      {adminPassOpen && <AdminPasswordEntry onUnlock={() => { setAdminPassOpen(false); setAdminOpen(true); }} onCancel={() => setAdminPassOpen(false)} />}
      <AdminPanel isOpen={adminOpen} onClose={() => setAdminOpen(false)} />

      {/* Delete Step 1 */}
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
              <button onClick={() => setDeleteStep(0)} className="flex-1 py-2.5 rounded-xl bg-gray-100 text-gray-700 text-[13px] font-semibold tap-scale">Cancel</button>
              <button onClick={() => setDeleteStep(2)} className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-[13px] font-semibold tap-scale">Continue</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Step 2 */}
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
            <input value={confirmText} onChange={(e) => setConfirmText(e.target.value)}
              placeholder="Type DELETE" className="input-field mb-4" autoFocus />
            <div className="flex gap-2">
              <button onClick={() => { setDeleteStep(0); setConfirmText(''); }}
                className="flex-1 py-2.5 rounded-xl bg-gray-100 text-gray-700 text-[13px] font-semibold tap-scale">
                Cancel
              </button>
              <button onClick={handleDeleteAll} disabled={confirmText !== 'DELETE'}
                className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-[13px] font-semibold tap-scale disabled:opacity-40">
                Delete Forever
              </button>
            </div>
          </div>
        </div>
      )}
    </BottomSheet>
  );
}
