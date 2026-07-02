import { useEffect } from 'react';
import { HeaderP3V1 } from './components/headers/v1/HeaderP3V1';
import { HeroSection } from './components/HeroSection';

export default function App() {
  useEffect(() => {
    document.body.classList.add('theme-p3');
    return () => { document.body.classList.remove('theme-p3'); };
  }, []);
  return (
    <>
      {/* 헤더: proposal=3, mode=dark */}
      <HeaderP3V1 />

      {/* 히어로 섹션 (200vh 주차장 포함) */}
      <HeroSection />

      {/* 임시 빈 섹션 — 스크롤 테스트용 */}
      <section
        style={{
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'rgba(0,0,0,0.2)',
          fontSize: '14px',
          fontFamily: 'Pretendard, sans-serif',
          letterSpacing: '0.08em',
        }}
      >
        다음 섹션
      </section>
    </>
  );
}
