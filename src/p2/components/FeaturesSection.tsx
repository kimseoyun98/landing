import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

const COUNTRIES = [
  { flag: '🇸🇬', name: 'SG', style: '--orbit-start: 0deg' },
  { flag: '🇺🇸', name: 'US', style: '--orbit-start: 60deg' },
  { flag: '🇰🇷', name: 'KR', style: '--orbit-start: 120deg' },
  { flag: '🇨🇳', name: 'CN', style: '--orbit-start: 180deg' },
  { flag: '🇯🇵', name: 'JP', style: '--orbit-start: 240deg' },
  { flag: '🇮🇩', name: 'ID', style: '--orbit-start: 300deg' },
];

export function FeaturesSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-10% 0px' });

  return (
    <section className="p2-features" id="trust" ref={ref}>
      <motion.h2
        className="p2-features__title"
        initial={{ opacity: 0, y: 30 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7 }}
      >
        기술로 연결하는 세상 모든 거래
      </motion.h2>
      <motion.p
        className="p2-features__sub"
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7, delay: 0.1 }}
      >
        우리는 멈추지 않는 거래의 흐름으로<br />
        전 세계 어디서나 연결됩니다
      </motion.p>

      {/* 글로브 orbit */}
      <motion.div
        className="p2-globe-wrap"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={inView ? { opacity: 1, scale: 1 } : {}}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        {/* 중앙 오렌지 원 */}
        <div className="p2-globe-core">
          <div style={{
            fontFamily: 'Pretendard, sans-serif',
            fontSize: 18,
            fontWeight: 700,
            color: 'rgba(35,8,0,0.9)',
            letterSpacing: '-0.02em',
          }}>
            이롬넷
          </div>
        </div>

        {/* 국가 카드 orbit */}
        {COUNTRIES.map(({ flag, name, style }) => (
          <div
            key={name}
            className="p2-flag-card"
            style={{ ['--orbit-start' as string]: style.split(': ')[1] }}
            title={name}
          >
            <span style={{ fontSize: 32 }}>{flag}</span>
            <span style={{ fontSize: 11, color: '#666', marginTop: 2 }}>{name}</span>
          </div>
        ))}

        {/* fade-out 마스크 */}
        <div className="p2-globe-mask-lr" />
        <div className="p2-globe-mask-tb" />
      </motion.div>

      <motion.a
        href="#contact"
        className="p2-features__cta"
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7, delay: 0.4 }}
      >
        내 비즈니스, 세계로 확장하기 →
      </motion.a>
    </section>
  );
}
