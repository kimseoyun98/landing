import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Apple 스타일 — 빠르게 올라오고 쫀득하게 안착, bounce: 0
const SPRING_SETTLE = { type: 'spring', bounce: 0, duration: 0.7 } as const;
const SPRING_FAST   = { type: 'spring', bounce: 0, duration: 0.5 } as const;

interface Props {
  phase: 'front' | 'back'; // 어느 텍스트를 보여줄지
}

/**
 * curtain-wrapper overflow:hidden 내에서
 * 텍스트가 아래→위 spring으로 교체되는 컴포넌트.
 */
export function CurtainText({ phase }: Props) {
  const [isFirstRender, setIsFirstRender] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => {
      setIsFirstRender(false);
    }, 1800);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="p1-curtain-wrapper" id="p1-curtain-wrapper">
      <AnimatePresence mode="wait">
        {phase === 'front' ? (
          <motion.div
            key="front"
            className="p1-curtain-front"
            style={{ position: 'absolute', width: '100%' }}
            initial={{ y: '110%' }}
            animate={{ y: 0 }}
            exit={{ y: '-110%', transition: SPRING_FAST }}
            transition={
              isFirstRender
                ? { type: 'spring', bounce: 0, duration: 0.7, delay: 0.9 }
                : SPRING_SETTLE
            }
          >
            Connect every transactions
          </motion.div>
        ) : (
          <motion.div
            key="back"
            className="p1-curtain-back"
            style={{ position: 'absolute', width: '100%' }}
            initial={{ y: '110%' }}
            animate={{ y: 0, transition: SPRING_SETTLE }}
            exit={{ y: '-110%', transition: SPRING_FAST }}
          >
            기술로 연결하는 세상 모든 거래
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
