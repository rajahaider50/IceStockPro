import { useState } from 'react';
import { Lock } from 'lucide-react';

interface Props {
  pinHash: string;
  onUnlock: () => void;
}

function djb2(str: string): string {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash + str.charCodeAt(i)) >>> 0;
  }
  return hash.toString(16);
}

export function hashPin(pin: string): string {
  return djb2(pin);
}

export default function PinLock({ pinHash, onUnlock }: Props) {
  const [digits, setDigits] = useState<string>('');
  const [error, setError] = useState(false);

  function handlePress(d: string) {
    if (digits.length >= 4) return;
    const next = digits + d;
    setDigits(next);
    setError(false);
    if (next.length === 4) {
      setTimeout(() => {
        if (djb2(next) === pinHash) {
          onUnlock();
        } else {
          setError(true);
          setTimeout(() => { setDigits(''); setError(false); }, 400);
        }
      }, 100);
    }
  }

  function handleBackspace() {
    setDigits((d) => d.slice(0, -1));
    setError(false);
  }

  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫'];

  return (
    <div className="fixed inset-0 z-[100] bg-surface flex flex-col items-center justify-center">
      <div className="flex flex-col items-center gap-6 mb-10">
        <div className="w-16 h-16 rounded-2xl bg-brand-500 flex items-center justify-center">
          <Lock size={28} className="text-white" />
        </div>
        <div>
          <p className="text-[16px] font-bold text-gray-900 text-center">Enter PIN</p>
          <p className="text-[12px] text-gray-400 text-center mt-1">Enter 4-digit PIN to unlock</p>
        </div>
      </div>

      <div className={`flex gap-4 mb-10 ${error ? 'animate-shake' : ''}`}>
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all ${
              i < digits.length
                ? error ? 'border-red-500 bg-red-50' : 'border-brand-500 bg-brand-50'
                : 'border-gray-200 bg-white'
            }`}
          >
            {i < digits.length && (
              <div className={`w-3 h-3 rounded-full ${error ? 'bg-red-500' : 'bg-brand-500'}`} />
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-3 w-64">
        {keys.map((k, idx) => {
          if (k === '') return <div key={idx} />;
          if (k === '⌫') {
            return (
              <button
                key={idx}
                onClick={handleBackspace}
                className="w-18 h-14 rounded-2xl bg-gray-100 flex items-center justify-center text-[20px] font-semibold text-gray-600 tap-scale"
              >
                ⌫
              </button>
            );
          }
          return (
            <button
              key={idx}
              onClick={() => handlePress(k)}
              className="w-18 h-14 rounded-2xl bg-white border border-gray-200 flex items-center justify-center text-[22px] font-bold text-gray-900 tap-scale active:bg-brand-50"
            >
              {k}
            </button>
          );
        })}
      </div>
    </div>
  );
}
