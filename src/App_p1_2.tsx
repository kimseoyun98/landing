import { useState, useCallback, useRef, useEffect } from 'react';
import { AnimatePresence }  from 'framer-motion';
import { GlobePhase }  from './p1-2-components/GlobePhase';
import { HeroPanel }   from './p1-2-components/HeroPanel';
import { useScrollStep } from './hooks/useScrollStep';
import { LightHeader } from './shared/headers/v1/HeaderP1_LightHeader';

// ── Step 정의 ─────────────────────────────────────────────────────────────
// 1: "Connect every transactions"  (curtain front) ← 자동 전환 (0.8s)
// 2: "기술로 연결하는 세상 모든 거래" (curtain back)  ← 자동 전환 (0.9s)
// 3: 바디 패널 (activeIdx 0~2)                       ← 스크롤 제어

export default function App() {
  const [globeDone, setGlobeDone] = useState(false);
  const [step,      setStep]      = useState(1);
  const [activeIdx, setActiveIdx] = useState(0);
  const heroRef = useRef<HTMLDivElement>(null);

  // 최신값을 핸들러에서 동기적으로 읽기 위한 refs
  const stepRef      = useRef(step);
  const activeIdxRef = useRef(activeIdx);
  stepRef.current      = step;
  activeIdxRef.current = activeIdx;

  // ── Globe 완료 ──────────────────────────────────────────────────────────
  const handleGlobeComplete = useCallback(() => {
    setGlobeDone(true);
    setStep(1);
  }, []);

  // ── step 1 → 2 자동 전환 (첫 타이틀 모션 대기를 위해 2.2초로 조정) ────────────────────────────────────────
  useEffect(() => {
    if (!globeDone || step !== 1) return;
    const t = setTimeout(() => setStep(2), 2200);
    return () => clearTimeout(t);
  }, [globeDone, step]);

  // ── 스크롤 핸들러 ────────────────────────────────────────────────────────
  const onDown = useCallback(() => {
    const s = stepRef.current;
    if (s === 1) { setStep(2); return; }
    if (s === 2) { setStep(3); setActiveIdx(0); return; }
    if (s === 3) {
      const i = activeIdxRef.current;
      if (i < 2) setActiveIdx(i + 1);
    }
  }, []);

  const onUp = useCallback(() => {
    const s = stepRef.current;
    if (s === 2) { setStep(1); return; }
    if (s === 3) {
      const i = activeIdxRef.current;
      if (i > 0) { setActiveIdx(i - 1); return; }
      setActiveIdx(0);
      setStep(2);
    }
  }, []);

  useScrollStep(onDown, onUp, heroRef, globeDone);

  // ── 렌더: 조립만 담당 ───────────────────────────────────────────────────
  return (
    <>
      {/* 헤더: proposal=1, mode=light (흰 배경) */}
      {globeDone && <LightHeader />}

      {/* Globe 인트로 */}
      <GlobePhase onComplete={handleGlobeComplete} />

      {/* 2. 히어로 패널 (Globe 완료 후 등장) */}
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
