import { useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';

const NEWS_ITEMS = [
  {
    tag: '파트너십',
    title: '페이버스×잘로페이 공식 파트너십 체결',
    date: '2025. 03. 15',
    color: '#230800',
  },
  {
    tag: '서비스 확장',
    title: '이롬넷, 동남아 결제 네트워크 7개국 추가 진출',
    date: '2025. 02. 28',
    color: '#1a0600',
  },
  {
    tag: '수상',
    title: '핀테크 혁신 어워드 2025 대상 수상',
    date: '2025. 01. 20',
    color: '#2d0a00',
  },
  {
    tag: '기술',
    title: '실시간 환율 API v3 출시 — 200개국 동시 지원',
    date: '2024. 12. 10',
    color: '#230800',
  },
];

export function NewsSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-10% 0px' });
  const [current, setCurrent] = useState(0);

  const CARD_WIDTH = 540 + 24; // width + gap
  const maxIndex = NEWS_ITEMS.length - 1;

  const prev = () => setCurrent(c => Math.max(0, c - 1));
  const next = () => setCurrent(c => Math.min(maxIndex, c + 1));

  return (
    <section className="p2-news" id="news" ref={ref}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7 }}
      >
        <span className="p2-news__badge">News</span>
        <h2 className="p2-news__title">이롬넷 뉴스룸</h2>
      </motion.div>

      <motion.div
        className="p2-news__carousel"
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ duration: 0.7, delay: 0.15 }}
      >
        <div
          className="p2-news__track"
          style={{ transform: `translateX(-${current * CARD_WIDTH}px)` }}
        >
          {NEWS_ITEMS.map((item, i) => (
            <div
              key={i}
              className="p2-news-card"
              style={{ background: item.color }}
            >
              <span className="p2-news-card__tag">{item.tag}</span>
              <h3 className="p2-news-card__title">{item.title}</h3>
              <span className="p2-news-card__date">{item.date}</span>
            </div>
          ))}
        </div>
      </motion.div>

      <div className="p2-news__controls">
        <button
          className="p2-news__arrow"
          onClick={prev}
          disabled={current === 0}
          aria-label="이전"
          style={{ opacity: current === 0 ? 0.4 : 1 }}
        >
          ←
        </button>
        <button
          className="p2-news__arrow"
          onClick={next}
          disabled={current === maxIndex}
          aria-label="다음"
          style={{ opacity: current === maxIndex ? 0.4 : 1 }}
        >
          →
        </button>
        <a href="#" className="p2-news__link">
          뉴스룸 바로가기 →
        </a>
      </div>
    </section>
  );
}
