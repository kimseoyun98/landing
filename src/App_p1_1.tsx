import { useState, useCallback, useRef, useEffect } from 'react';
import { AnimatePresence }  from 'framer-motion';
import { GlobePhase }  from './p1-1-components/GlobePhase';
import { HeroPanel }   from './p1-1-components/HeroPanel';
import { useScrollStep } from './hooks/useScrollStep';
import { LightHeader } from './shared/headers/v1/HeaderP1_LightHeader';
import type { FlatGlobeAsset } from './p1-1-components/FlatGlobeAsset';

export default function App() {
  const [globeDone, setGlobeDone] = useState(false);
  const [step,      setStep]      = useState(2);
  const [activeIdx, setActiveIdx] = useState(0);
  const heroRef  = useRef<HTMLDivElement>(null);
  const globeRef = useRef<FlatGlobeAsset | null>(null);

  const stepRef      = useRef(step);
  const activeIdxRef = useRef(activeIdx);
  stepRef.current      = step;
  activeIdxRef.current = activeIdx;

  const handleGlobeComplete = useCallback(() => {
    setGlobeDone(true);
    setStep(2);
  }, []);

  const handleGlobeReady = useCallback((globe: FlatGlobeAsset) => {
    globeRef.current = globe;
  }, []);

  // step 3 진입 시 globe focus 애니메이션 트리거
  useEffect(() => {
    if (step === 3) {
      globeRef.current?.transitionToFocus();
    }
  }, [step]);

  const onDown = useCallback(() => {
    const s = stepRef.current;
    if (s === 2) { setStep(3); setActiveIdx(0); return; }
    if (s === 3) {
      const i = activeIdxRef.current;
      if (i < 2) setActiveIdx(i + 1);
    }
  }, []);

  const onUp = useCallback(() => {
    const s = stepRef.current;
    if (s === 3) {
      const i = activeIdxRef.current;
      if (i > 0) { setActiveIdx(i - 1); return; }
      setActiveIdx(0);
      setStep(2);
    }
  }, []);

  useScrollStep(onDown, onUp, heroRef, globeDone);

  return (
    <>
      {globeDone && <LightHeader />}

      <GlobePhase
        onComplete={handleGlobeComplete}
        onGlobeReady={handleGlobeReady}
      />

      <AnimatePresence>
        {globeDone && (
          <HeroPanel
            key="hero-panel"
            heroRef={heroRef}
            step={step}
            activeIdx={activeIdx}
            onDown={onDown}
          />
        )}
      </AnimatePresence>
    </>
  );
}
