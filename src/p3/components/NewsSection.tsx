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

  const CARD_WIDTH = 400 + 20; // width + gap for responsiveness (adjusted for standard layout)
  const maxIndex = NEWS_ITEMS.length - 1;

  const prev = () => setCurrent((c) => Math.max(0, c - 1));
  const next = () => setCurrent((c) => Math.min(maxIndex, c + 1));

  return (
    <section className="p3-news" id="p3-소식" ref={ref}>
      <div className="p3-news__container">
        {/* Title & Controls Area */}
        <motion.div
          className="p3-news__header"
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
        >
          <div className="p3-news__title-group">
            <span className="p3-news__badge">News</span>
            <h2 className="p3-news__title">
              이롬넷 뉴스룸에서 <br />
              <span>최신 소식을 가장 먼저 접해보세요.</span>
            </h2>
          </div>

          <div className="p3-news__controls">
            <button
              className="p3-news__arrow"
              onClick={prev}
              disabled={current === 0}
              aria-label="이전"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <button
              className="p3-news__arrow"
              onClick={next}
              disabled={current === maxIndex}
              aria-label="다음"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <button className="p3-btn-newsroom">
              <span>뉴스룸 바로가기</span>
            </button>
          </div>
        </motion.div>

        {/* Carousel Area */}
        <motion.div
          className="p3-news__carousel"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.7, delay: 0.15 }}
        >
          <div
            className="p3-news__track"
            style={{ transform: `translateX(-${current * CARD_WIDTH}px)` }}
          >
            {NEWS_ITEMS.map((item, idx) => (
              <div
                key={idx}
                className="p3-news-card"
                style={{ backgroundColor: item.color }}
              >
                <div className="p3-news-card__top">
                  <span className="p3-news-card__tag">{item.tag}</span>
                </div>
                <h3 className="p3-news-card__title">{item.title}</h3>
                <span className="p3-news-card__date">{item.date}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
