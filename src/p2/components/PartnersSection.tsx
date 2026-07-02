import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

const PARTNERS = [
  { name: '키움증권', icon: '🏦' },
  { name: 'Google Pay', icon: '💳' },
  { name: 'Visa', icon: '💳' },
  { name: 'Mastercard', icon: '💳' },
  { name: 'Stripe', icon: '💰' },
  { name: '신한은행', icon: '🏛️' },
  { name: 'PayPal', icon: '🔵' },
  { name: 'Alipay', icon: '📱' },
  { name: 'WeChat Pay', icon: '💬' },
  { name: 'GrabPay', icon: '🚗' },
  { name: 'Kakao Pay', icon: '💛' },
  { name: 'Naver Pay', icon: '🟢' },
];

// 무한 스크롤을 위해 2배 복제
const TRACK = [...PARTNERS, ...PARTNERS];

export function PartnersSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-10% 0px' });

  return (
    <section className="p2-partners" id="about" ref={ref}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7 }}
      >
        <span className="p2-partners__badge">Partners</span>
        <p className="p2-partners__title">
          이롬넷은 전 세계 다양한 파트너와 함께<br />
          글로벌 결제 네트워크를 확장해 나가고 있습니다.
        </p>
      </motion.div>

      <motion.div
        className="p2-partners__track-wrap"
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ duration: 0.7, delay: 0.2 }}
      >
        <div className="p2-partners__track">
          {TRACK.map((partner, i) => (
            <div key={i} className="p2-partner-btn">
              <span>{partner.icon}</span>
              {partner.name}
            </div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
