import { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform, useMotionTemplate } from 'framer-motion';

const FADE_UP = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring' as const, bounce: 0, duration: 0.8 },
  },
};

const PARTNER_LOGOS = [
  { name: 'Hecto Financial', file: 'logo-hecto.png'  },
  { name: 'Apple Pay',       file: 'logo-apple.png'  },
  { name: '키움증권',         file: 'logo-kiwoom.png' },
  { name: 'Google Pay',      file: 'logo-google.png' },
  { name: '하나은행',         file: 'logo-hana.png'   },
  { name: '기업은행',         file: 'logo-ibk.png'    },
  { name: 'PayPal',          file: 'logo-paypal.png' },
  { name: 'Alipay+',         file: 'logo-alipay.png' },
  { name: 'Toss',            file: 'logo-toss.png'   },
];

/**
 * 로고가 하단에 고정 유지되는 스크롤 거리 (px)
 * 이 값만큼 스크롤 후 로고가 자연스럽게 위로 올라가며 사라짐
 */
const STICKY_EXTRA = 200;

export function HeroSection() {
  const sceneRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();

  const vh = typeof window !== 'undefined' ? window.innerHeight : 800;

  /* ── 헤더 좌우 패딩과 동일한 clip 값 (반응형) ───────────────────
     헤더 inner: max-width=1440px, padding=24px
     뷰포트 너비에 따라 콘텐츠와 viewport edge 사이 거리:
       vw ≤ 1440px → 24px
       vw > 1440px → (vw - 1440) / 2 + 24px              */
  const calcSidePad = () => {
    if (typeof window === 'undefined') return 24;
    const vw = window.innerWidth;
    const headerMaxW = 1440;
    const headerPad  = 24;
    return Math.round((vw - Math.min(vw, headerMaxW)) / 2 + headerPad);
  };

  const [sidePad, setSidePad] = useState(calcSidePad);

  useEffect(() => {
    const onResize = () => setSidePad(calcSidePad());
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  /* ── 히어로 카드 양옆 마스킹 (scroll 기반) ──────────────────── */
  const clipSide = useTransform(scrollY, [0, vh * 0.85], [0, sidePad]);
  const clipPath = useMotionTemplate`inset(0 ${clipSide}px 0 ${clipSide}px)`;

  return (
    /**
     * [Negative Margin Sticky — 올바른 구현]
     *
     * Scene 컨테이너: height = 100vh + STICKY_EXTRA px
     *   → sticky 유지 구간을 결정
     *
     * 히어로 카드: 일반 100vh 섹션 (첫 번째 자식)
     *
     * 로고 sticky bar (두 번째 자식):
     *   position: sticky; top: 0; height: 100vh
     *   margin-top: -(100vh + STICKY_EXTRA)  ← scene 맨 위로 당김
     *   align-items: flex-end               ← 로고를 화면 하단에
     *
     * 동작:
     *   scroll 0        → 로고 화면 하단 고정 ✓
     *   scroll STICKY_EXTRA → sticky 해제, 로고 자연스럽게 위로 사라짐 ✓
     *   히어로 섹션과 독립적으로 동작 ✓
     */
    <div
      ref={sceneRef}
      className="p3-hero-scene"
      style={{ height: `calc(100vh + ${STICKY_EXTRA}px)` }}
    >
      {/* ── 히어로 카드 ──────────────────────────────────────────── */}
      <motion.section className="p3-hero" style={{ clipPath }}>
        {/* ── 배경 영상 ─────────────────────────────────────────────
            object-fit:cover → 비율 유지하며 영역 꽉 채움 (잘림 허용)
            autoPlay muted loop playsInline → 논스탑 자동재생
        ──────────────────────────────────────────────────────────── */}
        <video
          className="p3-hero__video"
          src="/final_videomp_.mp4"
          autoPlay
          muted
          loop
          playsInline
        />
        <div className="p3-hero__overlay" />
        <div className="p3-hero__tint" />  {/* FF6114 컬러 틴트 */}
        <div className="p3-hero__gradient" />

        <div className="p3-hero__content">
          <motion.div
            className="p3-hero__inner"
            initial="hidden"
            animate="visible"
            variants={{
              visible: { transition: { staggerChildren: 0.12, delayChildren: 0.2 } },
            }}
          >
            <motion.div variants={FADE_UP} className="p3-hero__badge">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: 8, flexShrink: 0 }}>
                <path d="M16.2023 9.87256L13.5555 9.27931C13.2 9.16156 12.8872 8.94106 12.657 8.64556C12.4267 8.35006 12.2895 7.99306 12.2625 7.61956L11.7863 4.32331C11.7727 4.23256 11.7277 4.15006 11.658 4.09006C11.589 4.03006 11.5005 3.99706 11.409 3.99706C11.3175 3.99706 11.229 4.03006 11.16 4.09006C11.091 4.15006 11.0452 4.23256 11.0317 4.32331L10.5555 7.61956C10.5285 7.99306 10.3913 8.35081 10.161 8.64631C9.93075 8.94181 9.618 9.16231 9.26175 9.28006L6.6165 9.87331C6.53175 9.89206 6.456 9.93931 6.402 10.0068C6.348 10.0743 6.318 10.1583 6.318 10.2453C6.318 10.3323 6.34725 10.4163 6.402 10.4838C6.456 10.5513 6.53175 10.5986 6.6165 10.6173L9.26175 11.2106C9.618 11.3276 9.93075 11.5481 10.161 11.8443C10.3913 12.1398 10.5285 12.4976 10.5555 12.8711L11.0317 16.1673C11.0452 16.2581 11.0903 16.3406 11.16 16.4006C11.229 16.4606 11.3175 16.4928 11.409 16.4928C11.5005 16.4928 11.589 16.4598 11.658 16.4006C11.727 16.3406 11.7727 16.2581 11.7863 16.1673L12.2625 12.8711C12.2895 12.4976 12.4267 12.1398 12.657 11.8443C12.8872 11.5488 13.2 11.3283 13.5563 11.2106L16.203 10.6173C16.2878 10.5986 16.3635 10.5513 16.4175 10.4838C16.4707 10.4163 16.5 10.3323 16.5 10.2453C16.5 10.1583 16.4708 10.0743 16.416 10.0068C16.362 9.93931 16.2862 9.89206 16.2015 9.87331L16.2023 9.87256ZM7.97925 5.28706L6.27975 4.90531C6.072 4.83406 5.88975 4.70356 5.75625 4.52881C5.622 4.35406 5.54325 4.14406 5.529 3.92506L5.223 1.80631C5.211 1.72381 5.169 1.64731 5.10525 1.59256C5.0415 1.53781 4.9605 1.50781 4.8765 1.50781C4.7925 1.50781 4.7115 1.53781 4.64775 1.59256C4.584 1.64731 4.542 1.72381 4.53 1.80631L4.224 3.92506C4.20975 4.14406 4.131 4.35406 3.9975 4.52881C3.864 4.70356 3.68175 4.83406 3.474 4.90531L1.77375 5.28706C1.69575 5.30431 1.62675 5.34706 1.5765 5.40931C1.527 5.47156 1.5 5.54881 1.5 5.62831C1.5 5.70781 1.527 5.78506 1.57725 5.84731C1.62675 5.90956 1.69575 5.95306 1.77375 5.97031L3.474 6.35131C3.68175 6.42256 3.864 6.55306 3.9975 6.72781C4.131 6.90256 4.20975 7.11256 4.224 7.33156L4.53 9.44956C4.542 9.53281 4.584 9.60856 4.64775 9.66331C4.7115 9.71806 4.7925 9.74881 4.8765 9.74881C4.9605 9.74881 5.0415 9.71881 5.10525 9.66331C5.169 9.60856 5.21025 9.53281 5.223 9.44956L5.529 7.33156C5.54325 7.11256 5.622 6.90256 5.7555 6.72781C5.889 6.55306 6.07125 6.42256 6.279 6.35131L7.97925 5.97031C8.05725 5.95306 8.12625 5.90956 8.1765 5.84731C8.226 5.78506 8.25375 5.70781 8.25375 5.62831C8.25375 5.54881 8.22675 5.47156 8.1765 5.40931C8.12625 5.34706 8.05725 5.30431 7.97925 5.28706Z" fill="#FF6114"/>
              </svg>
              <span>Connect, Cross-Border, For Everyone</span>
            </motion.div>
            <div className="p3-hero__text-container">
              <motion.h1 variants={FADE_UP} className="p3-hero__title">
                기술로 연결하는 세상의 모든 거래
              </motion.h1>
              <motion.p variants={FADE_UP} className="p3-hero__desc">
                우리는 모든 거래가 더 자유롭게 연결되어야 한다고 믿습니다.
                <br />
                국경과 환경에 상관없이 누구나 쉽고 빠르게 거래를 할 수 있도록
                <br />
                이롬넷은 단절된 거래를 연결해 더 편리한 일상을 만들어갑니다.
              </motion.p>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* ── 파트너 로고바 (Negative Margin Sticky) ───────────────────
          margin-top으로 scene 맨 위에 위치
          position:sticky top:0 → 화면 상단 고정
          align-items:flex-end  → 로고를 화면 하단에 배치
          STICKY_EXTRA px 후 sticky 해제 → 자연스럽게 위로 올라가며 사라짐
      ──────────────────────────────────────────────────────────────── */}
      {/* ── 파트너 로고바 — 무한 가로 슬라이드 ─────────────────────
          로고 9개 × 2세트를 이어붙여 끊김없이 좌→우 무한 루프
          CSS @keyframes marquee로 부드럽게 구동
      ──────────────────────────────────────────────────────────── */}
      <div
        className="p3-logo-sticky"
        style={{ marginTop: `calc(-100vh - ${STICKY_EXTRA}px)` }}
      >
        <div className="p3-marquee">
          <div className="p3-marquee__track">
            {/* 세트 1 */}
            {PARTNER_LOGOS.map((logo) => (
              <div key={`a-${logo.name}`} className="p3-marquee__slot">
                <img
                  src={`/logos/${logo.file}`}
                  alt={logo.name}
                  className="p3-hero__partner-logo"
                />
              </div>
            ))}
            {/* 세트 2 — 이음새 없는 루프를 위한 복제 */}
            {PARTNER_LOGOS.map((logo) => (
              <div key={`b-${logo.name}`} className="p3-marquee__slot" aria-hidden="true">
                <img
                  src={`/logos/${logo.file}`}
                  alt=""
                  className="p3-hero__partner-logo"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
