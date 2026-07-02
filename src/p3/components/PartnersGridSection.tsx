import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

const PARTNERS = [
  { name: 'NICE', icon: '🛡️' },
  { name: '키움증권', icon: '📈' },
  { name: 'Google Pay', icon: '🟢' },
  { name: 'Alipay+', icon: '🔵' },
  { name: 'Hecto Financial', icon: '💳' },
  { name: 'Kakao Pay', icon: '🟡' },
  { name: 'Visa', icon: '💳' },
  { name: 'Mastercard', icon: '💳' },
  { name: 'Toss', icon: '🔵' },
  { name: 'WeChat Pay', icon: '💬' },
];

export function PartnersGridSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-10% 0px' });

  return (
    <section className="p3-partners-grid" id="p3-기술과 신뢰" ref={ref}>
      <div className="p3-partners-grid__container">
        {/* Info Area */}
        <motion.div
          className="p3-partners-grid__info"
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
        >
          <div className="p3-partners-grid__badge">
            <span>Partners</span>
          </div>
          <h2 className="p3-partners-grid__title">
            이롬넷은 전 세계 다양한 파트너와 함께 <br />
            글로벌 결제 네트워크를 확장해 나가고 있습니다.
          </h2>
          <p className="p3-partners-grid__desc">
            신뢰할 수 있는 연결을 기반으로 더 많은 비즈니스 기회를 만듭니다.
          </p>
        </motion.div>

        {/* Grid Area */}
        <motion.div
          className="p3-partners-grid__layout"
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          variants={{
            visible: { transition: { staggerChildren: 0.05 } },
          }}
        >
          {PARTNERS.map((partner, idx) => (
            <motion.div
              key={idx}
              className="p3-partners-grid__card"
              variants={{
                hidden: { opacity: 0, scale: 0.85, y: 15 },
                visible: {
                  opacity: 1,
                  scale: 1,
                  y: 0,
                  transition: { type: 'spring', stiffness: 100, damping: 15 },
                },
              }}
              whileHover={{
                scale: 1.05,
                boxShadow: '0 12px 30px rgba(35, 8, 0, 0.08)',
                transition: { duration: 0.2 },
              }}
            >
              <div className="p3-partners-grid__card-icon">{partner.icon}</div>
              <span className="p3-partners-grid__card-name">{partner.name}</span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
