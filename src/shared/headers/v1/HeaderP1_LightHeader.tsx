import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ── 마운트 애니메이션 ────────────────────────────────────────────────────
const SPRING = { type: 'spring', bounce: 0, duration: 0.65 } as const;

const containerVariants = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.07, delayChildren: 0.04 } },
} as const;

const itemVariants = {
  hidden:  { y: 20, opacity: 0 },
  visible: { y: 0,  opacity: 1, transition: SPRING },
} as const;

// 메가메뉴 — Adyen 스타일: 위에서 슬라이드 다운
const menuVariants = {
  hidden:  { opacity: 0, y: -8 },
  visible: {
    opacity: 1, y: 0,
    transition: { type: 'spring', bounce: 0, duration: 0.32 },
  },
  exit: { opacity: 0, y: -6, transition: { duration: 0.16 } },
} as const;

// 메가메뉴 아이템 stagger
const menuItemVariants = {
  hidden:  { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', bounce: 0, duration: 0.4 } },
} as const;

const menuContainerVariants = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.04, delayChildren: 0.05 } },
} as const;

// ── 네비 데이터 — 실제 사이트 트리 기반 ────────────────────────────────
const NAV_ITEMS = [
  {
    label: '회사소개',
    groups: [
      {
        label: '',  // 단일 그룹이므로 라벨 없음
        items: [
          {
            label: '회사소개',
            desc: '비전/미션, 핵심 가치, 회사 개요, 아이덴티티',
          },
          {
            label: '연혁',
            desc: '회사의 주요 성장 과정과 이정표',
          },
        ],
      },
    ],
  },
  {
    label: '기술과 신뢰',
    groups: [], // 드롭다운 없는 단순 링크
  },
  {
    label: '서비스',
    groups: [], // 드롭다운 없는 단순 링크
  },
  {
    label: '소식',
    groups: [
      {
        label: '',  // 단일 그룹이므로 라벨 없음
        items: [
          {
            label: '보도자료',
            desc: '언론 보도 및 미디어 자료',
          },
          {
            label: '공지사항',
            desc: '서비스 업데이트 및 주요 공지',
          },
        ],
      },
    ],
  },
] as const;


export function LightHeader() {
  const [activeNav, setActiveNav] = useState<string | null>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // groups가 있는 항목만 드롭다운 열기
  const openNav = useCallback((label: string) => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    const item = NAV_ITEMS.find(n => n.label === label);
    if (item && item.groups.length > 0) setActiveNav(label);
    else setActiveNav(null);
  }, []);
  const scheduleClose = useCallback(() => {
    closeTimerRef.current = setTimeout(() => setActiveNav(null), 150);
  }, []);
  const cancelClose = useCallback(() => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
  }, []);

  const activeItem = NAV_ITEMS.find(item => item.label === activeNav) ?? null;
  const isGroupHovered = activeNav !== null;

  return (
    <motion.header
      className="p1-header p1-header--light p1-only-flex"
      id="p1-header-light"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      style={{ visibility: 'visible', opacity: 1, pointerEvents: 'auto' }}
      onMouseLeave={scheduleClose}
    >
      {/* ── 헤더 바 ─────────────────────────────────────────────────────── */}
      <div className="p1-header-inner">
        <div className="p1-header-left">
          <motion.a href="#" className="p1-logo" variants={itemVariants}>
            <img src="/logo-dark.svg" alt="이롬넷" className="p1-logo-img" />
          </motion.a>

          <div className="p1-nav-separator p1-nav-separator--dark" />

          <nav className="p1-nav" aria-label="주요 메뉴">
            {NAV_ITEMS.map((navItem) => {
              const isActive = activeNav === navItem.label;
              const isDimmed = isGroupHovered && !isActive;
              return (
                <motion.div key={navItem.label} className="p1-nav-item-wrap" variants={itemVariants}>
                  <button
                    className={[
                      'p1-nav-link',
                      'p1-nav-link--dark',
                      isActive ? 'p1-nav-link--active' : '',
                      isDimmed ? 'p1-nav-link--dim'    : '',
                    ].filter(Boolean).join(' ')}
                    onMouseEnter={() => openNav(navItem.label)}
                  >
                    {navItem.label}
                  </button>
                </motion.div>
              );
            })}
          </nav>
        </div>

        <div className="p1-header-right">
          <motion.button
            className="p1-btn-cta p1-btn-cta--roll"
            id="p1-btn-global-light"
            variants={itemVariants}
          >
            <span className="p1-btn-roll-inner">
              <span className="p1-btn-roll-front">Global (English) <GlobeIcon /></span>
              <span className="p1-btn-roll-back" aria-hidden="true">Global (English) <GlobeIcon /></span>
            </span>
          </motion.button>
        </div>
      </div>

      {/* ── 배경 Dim Overlay ──────────────────────────────────────────────
           드롭다운 열릴 때 뒤 배경을 어둡게. z-index 드롭다운보다 낮게.    */}
      <AnimatePresence>
        {activeItem && (
          <motion.div
            key="backdrop"
            style={{
              position: 'fixed',
              top: 72,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.35)',
              zIndex: 199,
              pointerEvents: 'none',
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
          />
        )}
      </AnimatePresence>

      {/* ── 메가 드롭다운 ─────────────────────────────────────────────────
           Adyen 구조: 좌(h2 타이틀) + 우(그룹 수직 스택 + 22px 대형 아이템)
           각 아이템: [대형 링크] [sep] [설명 — hover 시만 표시]             */}
      <AnimatePresence>
        {activeItem && (
          <motion.div
            className="p1-mega-menu"
            onMouseEnter={cancelClose}
            onMouseLeave={scheduleClose}
            variants={menuVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <div className="p1-mega-menu__inner">
              {/* 좌: 섹션 타이틀 (Adyen: h2, large) */}
              <motion.div
                className="p1-mega-menu__left"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: [0.19, 1, 0.22, 1] }}
              >
                <h2 className="p1-mega-menu__title">{activeItem.label}</h2>
              </motion.div>

              {/* 우: 그룹 수직 스택 */}
              <div className="p1-mega-menu__right">
                {activeItem.groups.map((group, gi) => (
                  <motion.div
                    key={group.label || gi}
                    className="p1-mega-group"
                    variants={menuContainerVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    {/* 카테고리 라벨 — 빈 문자열이면 숨김 */}
                    {group.label ? (
                      <span className="p1-mega-group__label">{group.label}</span>
                    ) : null}

                    {/* 아이템 리스트 — CSS :has() 로 dim 처리 */}
                    <ul className="p1-mega-items">
                      {group.items.map((item) => (
                        <motion.li
                          key={item.label}
                          className="p1-mega-item"
                          variants={menuItemVariants}
                        >
                          {/* 대형 링크 텍스트 */}
                          <a href="#" className="p1-mega-item__link">
                            {item.label}
                          </a>

                          {/* 세퍼레이터 + 설명 — hover 시만 표시 */}
                          <div className="p1-mega-item__info">
                            <div className="p1-mega-item__sep" />
                            <p className="p1-mega-item__desc">{item.desc}</p>
                          </div>
                        </motion.li>
                      ))}
                    </ul>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}

function GlobeIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.8"
      strokeLinecap="round" strokeLinejoin="round"
      style={{ flexShrink: 0 }}>
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}
