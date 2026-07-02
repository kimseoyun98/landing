import { AnimatePresence, motion } from 'framer-motion';
import { CurtainText } from './CurtainText';
import { BodyPanel }   from './BodyPanel';

// ── Step 정의 ─────────────────────────────────────────────────────────────
// step 1: "Connect every transactions"  (curtain front) — 자동 전환
// step 2: "기술로 연결하는 세상 모든 거래" (curtain back)  — 자동 전환
// step 3: 바디 패널 (activeIdx 0~2)                       — 스크롤 제어

const SPRING_EXIT = { type: 'spring', bounce: 0, duration: 0.5 } as const;

interface Props {
  heroRef:   React.RefObject<HTMLDivElement | null>;
  step:      number;
  activeIdx: number;
  onDown?:   () => void;
}

/**
 * HeroPanel — Globe 완료 후 등장하는 전체 히어로 영역 컨테이너.
 * 헤더 + 타이틀 패널(step 1·2) + 바디 패널(step 3) 구성.
 * 스크롤·타이밍 로직은 App.tsx에서 관리, 이 컨테이너는 표시만 담당.
 */
export function HeroPanel({ heroRef, step, activeIdx, onDown }: Props) {
  return (
    <motion.div
      ref={heroRef}
      id="p1-hero-after"
      className="p1-hero-after"
      style={{
        position: 'fixed', inset: 0,
        zIndex: 50,
        background: '#ffffff',
        overflow: 'hidden',
        visibility: 'visible',
        pointerEvents: 'auto',
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.01 }}
    >
      {/* ── 타이틀 패널 (step 1 & 2) ── */}
      <AnimatePresence>
        {(step === 1 || step === 2) && (
          <motion.div
            key="panel-title"
            className="p1-panel"
            id="p1-panel-title"
            style={{ visibility: 'visible' }}
            initial={{ opacity: 1, y: 0 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30, transition: SPRING_EXIT }}
          >
            <CurtainText phase={step === 1 ? 'front' : 'back'} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── 바디 패널 (step 3) ── */}
      <AnimatePresence>
        {step === 3 && (
          <motion.div
            key="panel-body"
            style={{
              position: 'absolute', inset: 0,
              visibility: 'visible',
              pointerEvents: 'auto',
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.25 } }}
            transition={{ duration: 0.2 }}
          >
            <BodyPanel activeIdx={activeIdx} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Scroll Indicator / Arrow Down (step 2) ── */}
      <AnimatePresence>
        {step === 2 && (
          <motion.div
            key="scroll-indicator"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, delay: 0.8 }}
            onClick={onDown}
            style={{
              position: 'absolute',
              bottom: '48px',
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 100,
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <motion.div
              animate={{
                y: [0, 8, 0],
              }}
              transition={{
                duration: 1.6,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#1c1a17" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 9l6 6 6-6" />
              </svg>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
