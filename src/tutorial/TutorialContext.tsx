import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

export interface TutorialStep {
  id: string;
  screen: string;
  targetId: string;
  titleUrdu: string;
  titleEnglish: string;
  descUrdu: string;
  descEnglish: string;
  position: 'top' | 'bottom' | 'left' | 'right';
  highlightColor?: string;
}

interface TutorialState {
  active: boolean;
  currentStepIndex: number;
  steps: TutorialStep[];
  startedFrom: string;
}

interface TutorialContextType {
  state: TutorialState;
  startTutorial: (screen?: string) => void;
  nextStep: () => void;
  prevStep: () => void;
  skipTutorial: () => void;
  isStepTarget: (id: string) => boolean;
  getStepForScreen: (screen: string) => TutorialStep | undefined;
}

const TutorialContext = createContext<TutorialContextType | null>(null);

export function useTutorial() {
  const ctx = useContext(TutorialContext);
  if (!ctx) throw new Error('useTutorial must be used within TutorialProvider');
  return ctx;
}

export function TutorialProvider({ children, allSteps }: { children: ReactNode; allSteps: TutorialStep[] }) {
  const [state, setState] = useState<TutorialState>({
    active: false,
    currentStepIndex: 0,
    steps: [],
    startedFrom: '',
  });

  const startTutorial = useCallback((screen?: string) => {
    const filtered = screen
      ? allSteps.filter((s) => s.screen === screen)
      : allSteps;
    setState({
      active: true,
      currentStepIndex: 0,
      steps: filtered,
      startedFrom: screen || 'all',
    });
    try { sessionStorage.setItem('isp_tutorial_seen', '1'); } catch {}
  }, [allSteps]);

  const nextStep = useCallback(() => {
    setState((prev) => {
      if (prev.currentStepIndex >= prev.steps.length - 1) {
        return { ...prev, active: false };
      }
      return { ...prev, currentStepIndex: prev.currentStepIndex + 1 };
    });
  }, []);

  const prevStep = useCallback(() => {
    setState((prev) => {
      if (prev.currentStepIndex <= 0) return prev;
      return { ...prev, currentStepIndex: prev.currentStepIndex - 1 };
    });
  }, []);

  const skipTutorial = useCallback(() => {
    setState((prev) => ({ ...prev, active: false }));
  }, []);

  const isStepTarget = useCallback((id: string) => {
    if (!state.active) return false;
    const current = state.steps[state.currentStepIndex];
    return current?.targetId === id;
  }, [state]);

  const getStepForScreen = useCallback((screen: string) => {
    if (!state.active) return undefined;
    const current = state.steps[state.currentStepIndex];
    return current?.screen === screen ? current : undefined;
  }, [state]);

  return (
    <TutorialContext.Provider value={{ state, startTutorial, nextStep, prevStep, skipTutorial, isStepTarget, getStepForScreen }}>
      {children}
    </TutorialContext.Provider>
  );
}
