import { useState, useEffect } from 'react';
import { Lock, Eye, EyeOff } from 'lucide-react';
import { getAdminConfig } from '../../db/queries';
import { hashPin } from '../common/PinLock';

interface Props {
  onUnlock: () => void;
  onCancel: () => void;
}

export default function AdminPasswordEntry({ onUnlock, onCancel }: Props) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const [show, setShow] = useState(false);

  async function handleSubmit() {
    if (!pin) return;
    const config = await getAdminConfig();
    if (!config.passwordHash) {
      onUnlock();
    } else if (hashPin(pin) === config.passwordHash) {
      onUnlock();
    } else {
      setError(true);
      setTimeout(() => { setError(false); setPin(''); }, 600);
    }
  }

  return (
    <div className="fixed inset-0 z-[80] bg-surface flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-xs flex flex-col items-center gap-6">
        <div className="w-14 h-14 rounded-2xl bg-gray-900 flex items-center justify-center">
          <Lock size={24} className="text-white" />
        </div>
        <div className="text-center">
          <p className="text-[16px] font-bold text-gray-900">Admin Panel</p>
          <p className="text-[11px] text-gray-400 mt-1">Enter admin password</p>
        </div>

        <div className={`relative w-full ${error ? 'animate-shake' : ''}`}>
          <input
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            type={show ? 'text' : 'password'}
            placeholder="Enter password"
            className="input-field text-center text-[18px] tracking-[6px] pr-10"
            autoFocus
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          />
          <button onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2">
            {show ? <Eye size={16} className="text-gray-400" /> : <EyeOff size={16} className="text-gray-400" />}
          </button>
        </div>

        <button onClick={handleSubmit}
          className="w-full py-3.5 rounded-2xl bg-gray-900 text-white font-bold text-[14px] tap-scale">
          Enter Admin
        </button>
        <button onClick={onCancel}
          className="w-full py-2 text-[12px] text-gray-400 font-semibold tap-scale">
          Cancel
        </button>
      </div>
    </div>
  );
}
