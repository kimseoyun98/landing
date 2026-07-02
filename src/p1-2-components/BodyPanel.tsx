import { motion } from 'framer-motion';

// Apple 스타일 spring — bounce:0
const SPRING = { type: 'spring', bounce: 0, duration: 0.65 } as const;

const BODY_PAIRS = [
  ['우리는 모든 거래가 더 자유롭게', '연결되어야 한다고 믿습니다.'],
  ['국경과 환경에 상관없이 누구나 쉽고 빠르게', '거래를 할 수 있도록,'],
  ['이롬넷은 단절된 거래를 연결해', '더 편리한 일상을 만들어갑니다.'],
] as const;

interface Props {
  activeIdx: number;
}

export function BodyPanel({ activeIdx }: Props) {
  return (
    /* CSS .p1-panel--body { opacity:0 } → inline으로 강제 override */
    <div
      className="p1-panel p1-panel--body"
      id="p1-panel-body"
      style={{ opacity: 1 }}
    >
      <div className="p1-ha-body-inner" id="p1-ha-body-screen">
        {BODY_PAIRS.map((lines, i) => (
          <motion.div
            key={i}
            className="p1-body-pair"
            data-pair={i}
            // ── 초기 진입: 아래→위 stagger spring ────────────────────
            // ── 이후 activeIdx 변화: opacity만 부드럽게 전환 ──────────
            initial={{ y: 48, opacity: 0 }}
            animate={{
              y: 0,
              opacity: i === activeIdx ? 1 : 0.1,
            }}
            transition={{
              y:       { delay: i * 0.09, ...SPRING },
              opacity: {
                // 초기 등장 시에만 delay (y와 동기화), 이후 activeIdx 변화는 즉시
                delay: i * 0.09,
                duration: 0.4,
                ease: 'easeInOut',
              },
            }}
          >
            {lines.map((text, j) => (
              <span key={j} className="p1-body-line">{text}</span>
            ))}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
