import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

const FADE_UP = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring' as const, bounce: 0, duration: 0.8 },
  },
};

export function ServiceSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-10% 0px' });

  return (
    <section className="p3-service" id="p3-서비스" ref={ref}>
      {/* Background Image Layer */}
      <div className="p3-service__bg">
        <img src="/service-bg.png" alt="이롬넷 비즈니스 확장" />
      </div>

      {/* Dark Overlay & Radial Gradient */}
      <div className="p3-service__overlay" />
      <div className="p3-service__gradient" />

      {/* Content Container */}
      <div className="p3-service__content">
        <motion.div
          className="p3-service__inner"
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          variants={{
            visible: { transition: { staggerChildren: 0.12 } },
          }}
        >
          {/* Badge */}
          <motion.div variants={FADE_UP} className="p3-service__badge">
            <span>Connect, Cross-Border, For Everyone</span>
          </motion.div>

          {/* Heading Group */}
          <div className="p3-service__text-container">
            <motion.h2 variants={FADE_UP} className="p3-service__title">
              우리는 멈추지 않는 거래의 흐름으로
              <br />
              비즈니스의 가능성을 전 세계로 넓혀갑니다.
            </motion.h2>
            <motion.p variants={FADE_UP} className="p3-service__desc">
              우리는 모든 비즈니스가 더 넓은 세상과 자유롭게 마주할 수 있도록 도우며,
              <br />
              이롬넷의 기술을 통해 전 세계 누구나 신뢰할 수 있는 글로벌 네트워크를 완성해 갑니다.
            </motion.p>
          </div>

          {/* Button */}
          <motion.div variants={FADE_UP} className="p3-service__cta-wrapper">
            <button className="p3-btn-xl">
              <span>내 비즈니스, 세계로 확장하기</span>
              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M1 7H13M13 7L7 1M13 7L7 13"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
