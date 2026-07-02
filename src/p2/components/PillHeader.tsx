import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const SPRING = { type: 'spring', bounce: 0, duration: 0.6 } as const;

const NAV = ['회사소개', '기술과 신뢰', '서비스', '소식'] as const;

/* 선명한 지구본 아이콘 — 위도/경도선 포함 */
const GlobeIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);

export function PillHeader() {
  const [isLight, setIsLight] = useState(false);

  useEffect(() => {
    const target = document.getElementById('p2-highlight-sticky');
    if (!target) return;

    const observer = new IntersectionObserver(
      ([entry]) => setIsLight(entry.isIntersecting),
      {
        threshold: 0,
        rootMargin: '-64px 0px -90% 0px',
      }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, []);

  return (
    <motion.header
      className={`p2-header${isLight ? ' p2-header--light' : ''}`}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...SPRING, delay: 0.3 }}
    >
      <div className="p2-header__inner">
        {/* 좌: 로고(187px 영역) + 네비 */}
        <div className="p2-header__left">
          <a href="#" className="p2-header__logo">
            <img
              src={isLight ? '/logo-dark.svg' : '/logo.svg'}
              alt="이롬넷"
            />
          </a>
          <nav className="p2-header__nav">
            {NAV.map((item, i) => (
              <div
                key={item}
                className={`p2-nav-item${i === 0 ? ' p2-nav-item--active' : ''}`}
              >
                <a href={`#p2-${item}`} className="p2-nav-link">{item}</a>
              </div>
            ))}
          </nav>
        </div>

        {/* 우: CTA — Roll-up 인터렉션 (제안1 동일) */}
        <div className="p2-header__right">
          <button className="p2-btn-cta p2-btn-cta--roll">
            <span className="p2-btn-roll-inner">
              <span className="p2-btn-roll-front">
                Global (English) <GlobeIcon />
              </span>
              <span className="p2-btn-roll-back" aria-hidden="true">
                Global (English) <GlobeIcon />
              </span>
            </span>
          </button>
        </div>
      </div>
    </motion.header>
  );
}
