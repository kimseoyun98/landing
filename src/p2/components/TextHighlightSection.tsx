import { useRef, useState, useEffect } from 'react';

// ─────────────────────────────────────────────────────────────────
// 2줄 그룹 (Figma 276:46613 줄 단위)
// ─────────────────────────────────────────────────────────────────
const PHRASE_GROUPS: [string, string][] = [
  [
    '우리는 모든 거래가 더 자유롭게',
    '연결되어야 한다고 믿습니다.',
  ],
  [
    '국경과 환경에 상관없이 누구나 쉽고 빠르게',
    '거래를 할 수 있도록,',
  ],
  [
    '이롬넷은 단절된 거래를 연결해',
    '더 편리한 일상을 만들어갑니다.',
  ],
];

const N = PHRASE_GROUPS.length;

// ─────────────────────────────────────────────────────────────────
// TextHighlightSection
// 한 번 스크롤 = 한 그룹 전환 (풀페이지 방식)
// ─────────────────────────────────────────────────────────────────
export function TextHighlightSection() {
  const outerRef = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState(0);

  useEffect(() => {
    const outer = outerRef.current;
    if (!outer) return;

    let currentStep = 0;
    let pinY: number | null = null;
    let locked = false;

    // 스크롤 위치를 pinY에 고정
    const holdPin = () => {
      if (pinY !== null) {
        window.scrollTo({ top: pinY, behavior: 'instant' });
      }
    };

    const advance = (dir: 1 | -1): boolean => {
      const next = currentStep + dir;

      // 범위 초과 — 섹션 통과, 핀 해제
      if (next < 0 || next >= N) {
        if (next >= N && pinY !== null) {
          // 마지막 그룹 이후 — 자연스럽게 아래로 스크롤
          pinY = null;
        } else if (next < 0 && pinY !== null) {
          // 첫 그룹 이전 — 자연스럽게 위로 스크롤
          pinY = null;
        }
        return false;
      }

      if (locked) return true; // 이벤트 흡수하되 전환 방지

      if (pinY === null) pinY = window.scrollY;
      holdPin();

      currentStep = next;
      setStep(next);

      locked = true;
      setTimeout(() => { locked = false; }, 550);
      return true; // 이벤트 흡수
    };

    const handleWheel = (e: WheelEvent) => {
      const rect = outer.getBoundingClientRect();
      // 섹션이 sticky 상태(뷰포트에 고정)인지 판단
      const isParked = rect.top <= 1 && rect.bottom >= window.innerHeight - 1;

      if (!isParked && pinY === null) return; // 섹션 밖 — 무시

      const intercepted = advance(e.deltaY > 0 ? 1 : -1);
      if (intercepted) e.preventDefault();
    };

    // 스크롤 핀 유지 (다른 스크롤 소스 방어)
    const handleScroll = () => { holdPin(); };

    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    /* 스크롤 여유 공간 — sticky 유지에 필요 */
    <div ref={outerRef} id="p2-highlight-section" className="p2-highlight-outer">
      <div id="p2-highlight-sticky" className="p2-highlight-sticky">
        <div className="p2-highlight__content">
          {PHRASE_GROUPS.map((group, i) => (
            <div
              key={i}
              className="p2-highlight__group"
              style={{ opacity: i === step ? 1 : 0.25 }}
            >
              {group.map((line, j) => (
                <p key={j} className="p2-highlight__phrase">{line}</p>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}