import { useState, useEffect } from 'react';
import { Play, HelpCircle, X } from 'lucide-react';
import { useTutorial } from './TutorialContext';

interface Props {
  screen: string;
}

export default function TutorialPlayButton({ screen }: Props) {
  const { state, startTutorial } = useTutorial();
  const [expanded, setExpanded] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    const seen = sessionStorage.getItem('isp_tutorial_tooltip');
    if (!seen) {
      const t = setTimeout(() => {
        setShowTooltip(true);
        sessionStorage.setItem('isp_tutorial_tooltip', '1');
      }, 2000);
      return () => clearTimeout(t);
    }
  }, []);

  useEffect(() => {
    if (state.active) setExpanded(false);
  }, [state.active]);

  if (state.active) return null;

  return (
    <div className="fixed bottom-24 left-3 z-[90] flex flex-col items-start gap-2">
      {expanded && (
        <div className="bg-gray-900 text-white rounded-2xl p-3 w-52 shadow-xl animate-fade-in">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[11px] font-bold">Tutorial Options</p>
            <button onClick={() => setExpanded(false)} className="p-0.5">
              <X size={12} className="text-gray-400" />
            </button>
          </div>
          <button onClick={() => { startTutorial(screen); setExpanded(false); }}
            className="w-full py-2 rounded-xl bg-brand-500 text-white text-[11px] font-bold flex items-center gap-2 tap-scale mb-1.5">
            <Play size={12} /> This Page Only
          </button>
          <button onClick={() => { startTutorial(); setExpanded(false); }}
            className="w-full py-2 rounded-xl bg-gray-700 text-white text-[11px] font-bold flex items-center gap-2 tap-scale">
            <Play size={12} /> Full App Tour
          </button>
        </div>
      )}

      {showTooltip && !expanded && (
        <div className="bg-gray-900 text-white rounded-xl px-3 py-2 text-[10px] font-medium shadow-lg animate-fade-in max-w-[180px]">
          Tap here for guided tutorial — learn how to use every feature
        </div>
      )}

      <button onClick={() => { setExpanded(!expanded); setShowTooltip(false); }}
        className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 text-white flex items-center justify-center shadow-lg tap-scale"
        style={{ boxShadow: '0 4px 20px rgba(245,158,11,0.4)' }}>
        <Play size={20} fill="white" />
      </button>
    </div>
  );
}
