import { useState, useEffect, useCallback } from 'react';
import { AlertTriangle, Copy, X, ChevronUp, ChevronDown } from 'lucide-react';

interface LogEntry {
  id: number;
  time: string;
  type: 'error' | 'warn' | 'info';
  message: string;
  source?: string;
}

let nextId = 1;

type Listener = (entry: LogEntry) => void;
const listeners: Set<Listener> = new Set();

function pushEntry(entry: Omit<LogEntry, 'id' | 'time'>) {
  const e: LogEntry = {
    ...entry,
    id: nextId++,
    time: new Date().toLocaleTimeString('en-US', { hour12: false }),
  };
  listeners.forEach((l) => l(e));
}

if (typeof window !== 'undefined') {
  window.addEventListener('error', (e) => {
    pushEntry({
      type: 'error',
      message: e.message,
      source: `${e.filename || 'window'}:${e.lineno}:${e.colno}`,
    });
  });

  window.addEventListener('unhandledrejection', (e: PromiseRejectionEvent) => {
    const reason = e.reason;
    pushEntry({
      type: 'error',
      message: reason?.message || String(reason) || 'Unhandled rejection',
      source: 'promise',
    });
  });

  const origError = console.error.bind(console);
  const origWarn = console.warn.bind(console);
  const origInfo = console.info.bind(console);

  console.error = (...args: unknown[]) => {
    origError(...args);
    pushEntry({ type: 'error', message: args.map(String).join(' ') });
  };
  console.warn = (...args: unknown[]) => {
    origWarn(...args);
    pushEntry({ type: 'warn', message: args.map(String).join(' ') });
  };
  console.info = (...args: unknown[]) => {
    origInfo(...args);
    pushEntry({ type: 'info', message: args.map(String).join(' ') });
  };
}

export function debugLog(message: string, type: LogEntry['type'] = 'info') {
  pushEntry({ type, message });
}

export default function DebugConsole() {
  const [open, setOpen] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [minimized, setMinimized] = useState(false);

  useEffect(() => {
    const handler = (entry: LogEntry) => {
      setLogs((prev) => [...prev.slice(-100), entry]);
    };
    listeners.add(handler);
    return () => { listeners.delete(handler); };
  }, []);

  const errorCount = logs.filter((l) => l.type === 'error').length;

  const handleCopy = useCallback(() => {
    const text = logs.map((l) => `[${l.time}] [${l.type.toUpperCase()}] ${l.message}${l.source ? ' @ ' + l.source : ''}`).join('\n');
    navigator.clipboard.writeText(text).catch(() => {});
  }, [logs]);

  if (!open) {
    if (errorCount === 0) return null;
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-24 right-3 z-[200] w-10 h-10 rounded-full bg-red-500 text-white flex items-center justify-center shadow-lg tap-scale animate-bounce"
      >
        <AlertTriangle size={18} />
        <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-white text-red-500 text-[9px] font-bold flex items-center justify-center">
          {errorCount}
        </span>
      </button>
    );
  }

  return (
    <div className={`fixed z-[200] bg-gray-900 text-white font-mono transition-all ${
      minimized ? 'bottom-24 right-3 w-48 rounded-xl' : 'inset-x-0 bottom-0 max-h-[45vh] rounded-t-2xl'
    }`}>
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span className="text-[11px] font-bold text-gray-300">
            Debug Console ({logs.length})
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={handleCopy} className="p-1.5 rounded-lg hover:bg-gray-700 tap-scale" title="Copy logs">
            <Copy size={13} />
          </button>
          <button onClick={() => setLogs([])} className="p-1.5 rounded-lg hover:bg-gray-700 tap-scale text-[10px]">
            Clear
          </button>
          <button onClick={() => setMinimized(!minimized)} className="p-1.5 rounded-lg hover:bg-gray-700 tap-scale">
            {minimized ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </button>
          <button onClick={() => setOpen(false)} className="p-1.5 rounded-lg hover:bg-gray-700 tap-scale">
            <X size={13} />
          </button>
        </div>
      </div>

      {!minimized && (
        <div className="overflow-y-auto max-h-[38vh] px-3 py-2 space-y-1">
          {logs.length === 0 && (
            <p className="text-[11px] text-gray-500 text-center py-4">No errors yet</p>
          )}
          {logs.map((l) => (
            <div key={l.id} className={`text-[10px] leading-relaxed px-2 py-1 rounded-lg ${
              l.type === 'error' ? 'bg-red-900/40 text-red-300' :
              l.type === 'warn' ? 'bg-amber-900/30 text-amber-300' :
              'bg-gray-800 text-gray-400'
            }`}>
              <span className="text-gray-500">{l.time}</span>{' '}
              <span className="font-bold">{l.message}</span>
              {l.source && <span className="text-gray-600 ml-1">@ {l.source}</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
