import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';

function useCountUp(target: number, duration: number = 2.5, inView: boolean = false) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const startTime = performance.now();
    const step = (now: number) => {
      const elapsed = (now - startTime) / 1000;
      const progress = Math.min(elapsed / duration, 1);
      // easeOutExpo
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [inView, target, duration]);

  return count;
}

function StatItem({
  label,
  target,
  suffix = '',
  prefix = '',
  duration = 2.5,
}: {
  label: string;
  target: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-10% 0px' });
  const count = useCountUp(target, duration, inView);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
      style={{ textAlign: 'center' }}
    >
      <p className="p2-stats__label">{label}</p>
      <p className="p2-stats__number">
        {prefix}
        {count.toLocaleString('ko-KR')}
        {suffix}
      </p>
    </motion.div>
  );
}

export function StatsSection() {
  const titleRef = useRef<HTMLDivElement>(null);
  const titleInView = useInView(titleRef, { once: true, margin: '-10% 0px' });

  return (
    <section className="p2-stats" id="stats">
      <motion.div
        ref={titleRef}
        initial={{ opacity: 0, y: 30 }}
        animate={titleInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        <p className="p2-stats__subtitle">
          이롬넷은 지금 이 순간에도<br />
          고객과 함께 성장하고 있습니다
        </p>
      </motion.div>

      <div className="p2-stats__grid">
        <StatItem
          label="누적 거래건"
          target={16981191}
          suffix="건"
          duration={2.2}
        />
        <StatItem
          label="진출 국가"
          target={200}
          suffix="개국+"
          duration={1.8}
        />
      </div>
    </section>
  );
}
