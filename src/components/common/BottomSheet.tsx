import type { ReactNode } from 'react';
import { X } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  maxHeight?: string;
}

export default function BottomSheet({ isOpen, onClose, title, children, maxHeight = '85vh' }: Props) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div
        className="absolute inset-0 bg-black/40 animate-fade-in"
        onClick={onClose}
      />
      <div
        className="relative w-full max-w-lg bg-white rounded-t-3xl animate-slide-up flex flex-col safe-bottom"
        style={{ maxHeight }}
      >
        <div className="flex items-center justify-center pt-2.5 pb-1 shrink-0">
          <div className="w-9 h-1 rounded-full bg-gray-300" />
        </div>
        <div className="flex items-center justify-between px-5 pb-3 pt-1 shrink-0 border-b border-gray-100">
          <h2 className="text-[16px] font-bold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center tap-scale"
          >
            <X size={16} className="text-gray-500" />
          </button>
        </div>
        <div className="overflow-y-auto no-scrollbar px-5 py-4">{children}</div>
      </div>
    </div>
  );
}
