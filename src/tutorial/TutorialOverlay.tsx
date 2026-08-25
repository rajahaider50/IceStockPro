import { useEffect, useState, useRef, useCallback } from 'react';
import { ChevronLeft, ChevronRight, X, Play } from 'lucide-react';
import { useTutorial } from './TutorialContext';

export default function TutorialOverlay() {
  const { state, nextStep, prevStep, skipTutorial } = useTutorial();
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  const findTarget = useCallback(() => {
    if (!state.active || !state.steps[state.currentStepIndex]) return;
    const step = state.steps[state.currentStepIndex];
    const el = document.getElementById(step.targetId);
    if (el) {
      const rect = el.getBoundingClientRect();
      setTargetRect(rect);
    } else {
      setTargetRect(null);
    }
  }, [state.active, state.currentStepIndex, state.steps]);

  useEffect(() => {
    if (!state.active) return;
    findTarget();
    const interval = setInterval(findTarget, 500);
    window.addEventListener('resize', findTarget);
    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', findTarget);
    };
  }, [state.active, findTarget]);

  if (!state.active) return null;

  const step = state.steps[state.currentStepIndex];
  if (!step) return null;

  const highlightColor = step.highlightColor || '#f59e0b';
  const total = state.steps.length;
  const current = state.currentStepIndex + 1;
  const isFirst = state.currentStepIndex === 0;
  const isLast = state.currentStepIndex === total - 1;

  const getHighlightStyle = (): React.CSSProperties => {
    if (!targetRect) {
      return {
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 200,
        height: 60,
        borderRadius: 16,
        boxShadow: `0 0 0 9999px rgba(0,0,0,0.7), 0 0 20px ${highlightColor}`,
      };
    }
    const padding = 12;
    return {
      position: 'fixed',
      top: targetRect.top - padding,
      left: targetRect.left - padding,
      width: targetRect.width + padding * 2,
      height: targetRect.height + padding * 2,
      borderRadius: 16,
      boxShadow: `0 0 0 9999px rgba(0,0,0,0.7), 0 0 20px ${highlightColor}`,
      transition: 'all 0.3s ease',
    };
  };

  const getArrowPosition = (): React.CSSProperties => {
    if (!targetRect) return {};
    const cx = targetRect.left + targetRect.width / 2;
    const cy = targetRect.top + targetRect.height / 2;
    const size = 20;
    const offset = 24;

    let top: number, left: number, rotation: number;

    switch (step.position) {
      case 'top':
        top = targetRect.top - size - offset;
        left = cx - size / 2;
        rotation = 0;
        break;
      case 'bottom':
        top = targetRect.bottom + offset;
        left = cx - size / 2;
        rotation = 180;
        break;
      case 'left':
        top = cy - size / 2;
        left = targetRect.left - size - offset;
        rotation = 90;
        break;
      case 'right':
        top = cy - size / 2;
        left = targetRect.right + offset;
        rotation = 270;
        break;
    }

    return {
      position: 'fixed' as const,
      top,
      left,
      width: size,
      height: size,
      transform: `rotate(${rotation}deg)`,
      zIndex: 10003,
    };
  };

  const getCardPosition = (): React.CSSProperties => {
    if (!targetRect) {
      return { position: 'fixed', top: '60%', left: '50%', transform: 'translateX(-50%)' };
    }

    const cardWidth = 300;
    const viewportW = window.innerWidth;
    let left = targetRect.left + targetRect.width / 2 - cardWidth / 2;
    left = Math.max(12, Math.min(left, viewportW - cardWidth - 12));

    let top: number;
    if (step.position === 'top') {
      top = targetRect.top - 20;
    } else if (step.position === 'bottom') {
      top = targetRect.bottom + 40;
    } else {
      top = targetRect.bottom + 30;
    }

    if (top + 250 > window.innerHeight) {
      top = targetRect.top - 260;
    }
    if (top < 10) top = 10;

    return {
      position: 'fixed',
      top,
      left,
      width: cardWidth,
      zIndex: 10004,
    };
  };

  return (
    <div ref={overlayRef} className="fixed inset-0 z-[10000]" onClick={(e) => e.stopPropagation()}>
      {/* Highlight circle */}
      <div style={getHighlightStyle()} className="pointer-events-none" />

      {/* Arrow */}
      {targetRect && (
        <div style={getArrowPosition()} className="pointer-events-none">
          <svg viewBox="0 0 24 24" fill={highlightColor}>
            <path d="M12 2L4 14h5v8h6v-8h5z" />
          </svg>
        </div>
      )}

      {/* Info Card */}
      <div style={getCardPosition()} className="animate-fade-in">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden" style={{ border: `2px solid ${highlightColor}` }}>
          {/* Progress */}
          <div className="h-1 bg-gray-100">
            <div className="h-full rounded-full transition-all duration-300" style={{ width: `${(current / total) * 100}%`, backgroundColor: highlightColor }} />
          </div>

          {/* Content */}
          <div className="p-4">
            {/* Step counter */}
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: `${highlightColor}20`, color: highlightColor }}>
                Step {current} / {total}
              </span>
              <button onClick={skipTutorial} className="p-1 rounded-lg hover:bg-gray-100 tap-scale">
                <X size={14} className="text-gray-400" />
              </button>
            </div>

            {/* Title — Urdu */}
            <p className="text-[14px] font-bold text-gray-900 mb-0.5">{step.titleUrdu}</p>
            <p className="text-[11px] text-gray-500 font-medium mb-2">{step.titleEnglish}</p>

            {/* Description — Urdu */}
            <p className="text-[12px] text-gray-700 leading-relaxed mb-1.5" dir="rtl">{step.descUrdu}</p>
            {/* Description — English */}
            <p className="text-[11px] text-gray-400 leading-relaxed">{step.descEnglish}</p>
          </div>

          {/* Navigation */}
          <div className="flex items-center gap-2 px-4 pb-4">
            {!isFirst && (
              <button onClick={prevStep}
                className="px-3 py-2 rounded-xl bg-gray-100 text-gray-600 text-[12px] font-semibold flex items-center gap-1 tap-scale">
                <ChevronLeft size={14} /> Back
              </button>
            )}
            <button onClick={isLast ? skipTutorial : nextStep}
              className="flex-1 py-2.5 rounded-xl text-white text-[13px] font-bold flex items-center justify-center gap-1.5 tap-scale"
              style={{ backgroundColor: highlightColor }}>
              {isLast ? (
                <>Done <span className="text-[10px] opacity-70">✓</span></>
              ) : (
                <>Next <ChevronRight size={14} /></>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
