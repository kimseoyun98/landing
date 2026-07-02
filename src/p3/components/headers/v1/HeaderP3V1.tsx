/**
 * HeaderP3V1 — proposal=3 헤더 (dark/light 자동 전환)
 *
 * Figma: Header COMPONENT_SET → proposal=3
 *   dark  (445:12334): 1920×80px, transparent bg
 *   light (445:12357): 1920×80px, #ffffff bg
 *
 * ── 피그마 정밀 수치 ──────────────────────────────────────────
 *   전체:         1920 × 80px
 *   좌우 padding: 240px
 *
 *   Container:css-transform  y=8,  h=72  → padding-top 8px
 *   Container (content)      y=20, h=48  → centered in 72px (12px top/bottom)
 *   Container (nav-row)      y=26, h=36  → centered in 48px
 *
 *   로고:        x=240, y=29, 127×30px
 *   Separator:   x=391, y=36, 1×16px   (로고right=367, gap=24px)
 *   Nav:         x=416, y=26, 505×36px (sep right=392, gap=24px)
 *     Menubar:   x=416, y=26, 420×36px  ← 4개 아이템 총 너비
 *     회사소개(100) 기술과신뢰(120) 서비스(100) 소식(100) = 420px
 *
 *   Button-XL:   x=1498, y=20, 182×48px, radius=6
 *     right margin = 1920 - (1498+182) = 240px (좌우 동일)
 *     text "Global (English)" fw=400 16px
 *     text left = 1522, btn left = 1498 → pad-left = 24px
 *
 * ── dark/light 차이 ──────────────────────────────────────────
 *   dark:  bg=transparent, logo=white,    sep=rgba(#fff,10%),    nav=#ffffff, btn=#ff6114+#ffffff
 *   light: bg=#ffffff,     logo=dark,     sep=rgba(#1c1a17,10%), nav=#1c1a17, btn=#ff6114+#ffffff
 */

import { useEffect, useRef, useState } from 'react';
import './header-p3v1.css';

const NAV_ITEMS = [
  { label: '회사소개',    width: 100 },
  { label: '기술과 신뢰', width: 120 },
  { label: '서비스',      width: 100 },
  { label: '소식',        width: 100 },
] as const;

interface Props {
  /** 강제 mode 지정. 없으면 lightSections 기반 자동 전환 */
  mode?: 'dark' | 'light';
  /** light 전환할 섹션 id 목록 (자동 전환 시 사용) */
  lightSections?: string[];
}

export function HeaderP3V1({ mode, lightSections = [] }: Props) {
  const [isLight, setIsLight] = useState(mode === 'light');
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    if (mode !== undefined) { setIsLight(mode === 'light'); return; }
    if (lightSections.length === 0) return;

    observerRef.current = new IntersectionObserver(
      (entries) => setIsLight(entries.some((e) => e.isIntersecting)),
      { threshold: 0, rootMargin: '-80px 0px -85% 0px' }
    );
    lightSections.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observerRef.current?.observe(el);
    });
    return () => observerRef.current?.disconnect();
  }, [mode, lightSections]);

  return (
    <header className={`p3v1-header${isLight ? ' p3v1-header--light' : ''}`}>
      <div className="p3v1-inner">

        {/* LEFT: 로고 + separator + nav */}
        <div className="p3v1-left">
          <a href="/" className="p3v1-logo" aria-label="이롬넷 홈">
            <img
              src={isLight ? '/logo-dark.svg' : '/logo.svg'}
              alt="이롬넷"
              width={127}
              height={30}
            />
          </a>

          <div className="p3v1-sep" aria-hidden="true" />

          <nav aria-label="주요 메뉴">
            <ul className="p3v1-nav">
              {NAV_ITEMS.map(({ label }) => (
                <li key={label}>
                  <a href={`#${label}`} className="p3v1-nav-item">
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* RIGHT: Button-XL */}
        <button className="p3v1-btn p3v1-btn--roll" type="button">
          <span className="p3v1-btn-inner">
            <span className="p3v1-btn-front">Global (English) <GlobeIcon /></span>
            <span className="p3v1-btn-back" aria-hidden="true">Global (English) <GlobeIcon /></span>
          </span>
        </button>

      </div>
    </header>
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
