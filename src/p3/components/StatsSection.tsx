import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';

function useCountUp(target: number, duration: number = 2.0, inView: boolean = false) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const startTime = performance.now();
    let frameId: number;

    const step = (now: number) => {
      const elapsed = (now - startTime) / 1000;
      const progress = Math.min(elapsed / duration, 1);
      // easeOutExpo
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setCount(Math.floor(eased * target));
      if (progress < 1) {
        frameId = requestAnimationFrame(step);
      }
    };
    frameId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frameId);
  }, [inView, target, duration]);

  return count;
}

function StatItem({
  label,
  target,
  suffix = '',
  sublabel = '',
  duration = 2.0,
}: {
  label: string;
  target: number;
  suffix?: string;
  sublabel?: string;
  duration?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-10% 0px' });
  const count = useCountUp(target, duration, inView);

  return (
    <motion.div
      ref={ref}
      className="p3-stats__item"
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <div className="p3-stats__number-wrapper">
        <span className="p3-stats__number">
          {count.toLocaleString('ko-KR')}
          {suffix}
        </span>
      </div>
      <div className="p3-stats__label-group">
        <span className="p3-stats__label">{label}</span>
        {sublabel && <span className="p3-stats__sublabel">{sublabel}</span>}
      </div>
    </motion.div>
  );
}

export function StatsSection() {
  const titleRef = useRef<HTMLDivElement>(null);
  const titleInView = useInView(titleRef, { once: true, margin: '-10% 0px' });

  return (
    <section className="p3-stats" id="p3-회사소개">
      <div className="p3-stats__container">
        <motion.div
          ref={titleRef}
          className="p3-stats__title-area"
          initial={{ opacity: 0, y: 30 }}
          animate={titleInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
        >
          <h2 className="p3-stats__main-title">
            이롬넷은 <br />
            지금 이 순간에도 <br />
            <span>고객과 함께 성장하고 있습니다.</span>
          </h2>
        </motion.div>

        <div className="p3-stats__grid">
          <StatItem
            label="누적 거래건"
            target={16981191}
            suffix=" 건"
            sublabel="26.04 기준"
            duration={2.5}
          />
          <StatItem
            label="연동 국가"
            target={200}
            suffix=" 개국+"
            duration={2.0}
          />
          <StatItem
            label="국내 최다 판매 통화 제공"
            target={58}
            suffix=" 개"
            duration={1.8}
          />
          <StatItem
            label="국내 최다 로컬페이 커버리지"
            target={140}
            suffix=" 개+"
            duration={2.0}
          />
        </div>
      </div>
    </section>
  );
}
