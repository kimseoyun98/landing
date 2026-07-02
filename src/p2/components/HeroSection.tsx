import { useRef, useMemo } from 'react';
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  type MotionValue,
} from 'framer-motion';

// ─────────────────────────────────────────────────────────────────
// Section 1: RandomRevealText — 글자 무작위 순서 페이드인
// ─────────────────────────────────────────────────────────────────
function RandomRevealText({
  text,
  totalDuration = 0.4,
  charDuration  = 0.08,
  startDelay    = 0.3,
}: {
  text:           string;
  totalDuration?: number;
  charDuration?:  number;
  startDelay?:    number;
}) {
  const chars = text.split('');
  const n     = chars.length;

  const delays = useMemo(() => {
    const order = Array.from({ length: n }, (_, i) => i);
    for (let i = order.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [order[i], order[j]] = [order[j], order[i]];
    }
    return order.map(pos =>
      startDelay + (pos / Math.max(n - 1, 1)) * totalDuration
    );
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <span aria-label={text} style={{ display: 'inline' }}>
      {chars.map((char, i) =>
        char === ' ' ? (
          <span key={i}>&nbsp;</span>
        ) : (
          <motion.span
            key={i}
            style={{ display: 'inline-block' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: charDuration, delay: delays[i], ease: 'easeOut' }}
          >
            {char}
          </motion.span>
        )
      )}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────
// Section 2: ScatterChar — 개별 글자 컴포넌트
//
//  Primer data-effect5 마이크로인터랙션 재현:
//  ├─ position: power1.inOut → 출발·착지 감속, 중간 가속 (부드러운 안착)
//  └─ opacity:  t<0.3 → 0,  t≥0.3 → ((t-0.3)/0.7)²
//     → 멀리 있을 때 완전투명, 착지 직전 "팍" 나타남
//
//  ※ hooks 규칙: useTransform은 모두 조건 분기 전에 호출
// ─────────────────────────────────────────────────────────────────
function ScatterChar({
  char,
  scrollProgress,
  startX,
  startY,
  scrollStart,
  scrollEnd,
}: {
  char:           string;
  scrollProgress: MotionValue<number>;
  startX:         number;
  startY:         number;
  scrollStart:    number;
  scrollEnd:      number;
}) {
  // ── 0→1 raw progress (clamp: 범위 바깥 값 고정)
  const raw = useTransform(
    scrollProgress,
    [scrollStart, scrollEnd],
    [0, 1],
    { clamp: true }
  );

  // ── Position easing: power1.inOut (quadratic ease-in-out)
  //    출발·착지 감속, 중간 가속 → 부드러운 안착감
  const easedPos = useTransform(raw, (t: number) =>
    t < 0.5
      ? 2 * t * t                        // ease-in
      : 1 - Math.pow(-2 * t + 2, 2) / 2  // ease-out
  );
  const x = useTransform(easedPos, [0, 1], [startX, 0]);
  const y = useTransform(easedPos, [0, 1], [startY, 0]);

  // ── Opacity: 멀리 있을 때 더 투명하게
  //    t < 0.5  → 완전 투명 (흩어진 상태 + s1 표시 중 안 보임)
  //    t ≥ 0.5  → ((t-0.5)/0.5)³  — s1 사라질 때 딱 등장 시작
  //
  //  t=0.5  → 0%   (s1 visibility:hidden 시점에 딱 맞춤)
  //  t=0.6  → 0.8% (거의 안 보임)
  //  t=0.7  → 6%   (이제 살짝)
  //  t=0.8  → 22%  (보이기 시작)
  //  t=0.9  → 49%  (착지 직전)
  //  t=1.0  → 100% (착지 완료)
  const opacity = useTransform(raw, (t: number) => {
    if (t < 0.3) return 0;
    const s = (t - 0.3) / 0.7;
    return s * s * s; // power3
  });

  // ※ 모든 hooks 호출 완료 후 조건 분기
  if (char === ' ') return <span style={{ display: 'inline' }}>&nbsp;</span>;

  return (
    <motion.span style={{ display: 'inline-block', x, y, opacity }}>
      {char}
    </motion.span>
  );
}

// ─────────────────────────────────────────────────────────────────
// ScatterRevealText — 텍스트를 흩어진 위치에서 수렴 (scroll-driven)
// ─────────────────────────────────────────────────────────────────
function ScatterRevealText({
  text,
  scrollProgress,
  scrollRange,
}: {
  text:           string;
  scrollProgress: MotionValue<number>;
  scrollRange:    [number, number];
}) {
  const chars = text.split('');
  const [rangeStart, rangeEnd] = scrollRange;

  const charData = useMemo(() => {
    let wordIdx = 0;
    return chars.map(char => {
      if (char === ' ') {
        wordIdx++;
        return { startX: 0, startY: 0, scrollStart: rangeStart, scrollEnd: rangeEnd };
      }

      // X: 좌우 랜덤 ±300px
      const startX = (Math.random() - 0.5) * 600;
      // Y: 위아래 랜덤 — 음수(위)·양수(아래) 모두 가능, 80~400px 거리
      const sign   = Math.random() < 0.5 ? -1 : 1;
      const startY = sign * (80 + Math.random() * 320);

      // 글자마다 조금씩 다른 타이밍으로 수렴 (stagger)
      const staggerOff = Math.random() * 0.07;

      return {
        startX,
        startY,
        scrollStart: rangeStart + staggerOff,
        scrollEnd:   rangeEnd,
      };
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <span aria-label={text} style={{ display: 'inline' }}>
      {chars.map((char, i) => {
        const d = charData[i];
        if (char === ' ') {
          return <span key={i} style={{ display: 'inline' }}>&nbsp;</span>;
        }
        return (
          <ScatterChar
            key={i}
            char={char}
            scrollProgress={scrollProgress}
            startX={d.startX}
            startY={d.startY}
            scrollStart={d.scrollStart}
            scrollEnd={d.scrollEnd}
          />
        );
      })}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────
// HeroSection — 380vh 스크롤 컨테이너 (sticky 100vh 패널)
//
// 스크롤 타임라인 (380vh 기준):
//   0.00  — Section 1 등장 (RandomReveal)
//   0.05  — blur 시작
//   0.35  — blur 최대 (24px)
//   0.43  — Section 1 완전 투명
//   0.48  — visibility:hidden + scatter 즉시 시작
//   0.88  — Section 2 수렴 완성 (느린 속도)
// ─────────────────────────────────────────────────────────────────
export function HeroSection() {
  const outerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: outerRef,
    offset: ['start start', 'end end'],
  });

  // ── Section 1 퇴장 (더 빨리 사라지도록 범위 단축)
  const s1BlurPx  = useTransform(scrollYProgress, [0.03, 0.18], [0, 20]);
  const s1Filter  = useTransform(s1BlurPx, v => `blur(${v}px)`);
  const s1Opacity = useTransform(scrollYProgress, [0.18, 0.25], [1, 0]);
  const s1Visible = useTransform(scrollYProgress, v => v > 0.26 ? 'hidden' : 'visible');

  // ── Scatter 스무딩: spring lag으로 스크롤 잠시 지연 → 부드럽게 수렴
  //    stiffness 올려서 lag 줄임 (60 → 80)
  const smoothScroll = useSpring(scrollYProgress, {
    stiffness: 80,
    damping:   22,
    restDelta: 0.0005,
  });

  return (
    <div ref={outerRef} className="p2-hero-outer">
      <div className="p2-hero-sticky">

        {/* Section 1 */}
        <div className="p2-hero__content">
          <motion.div className="p2-hero__s1-wrap" style={{ visibility: s1Visible }}>
            <motion.h1
              className="p2-hero__swap-text p2-hero__swap-text--one"
              style={{ filter: s1Filter, opacity: s1Opacity }}
            >
              <RandomRevealText
                text="기술로 연결하는 세상 모든 거래"
                totalDuration={0.4}
                charDuration={0.08}
                startDelay={0.3}
              />
            </motion.h1>
          </motion.div>
        </div>

        {/* Section 2 — sticky 직계 자식, 헤더 64px 보정으로 시각적 중앙 */}
        <div className="p2-hero__s2-wrap">
          <h1 className="p2-hero__swap-text p2-hero__swap-text--two">
            <ScatterRevealText
              text="Connect every transactions"
              scrollProgress={smoothScroll}
              scrollRange={[0.05, 0.78]}
            />
          </h1>
        </div>

      </div>
    </div>
  );
}
