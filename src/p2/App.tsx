import { HeroSection }          from './components/HeroSection';
import { TextHighlightSection } from './components/TextHighlightSection';
import { PillHeader } from '../shared/headers/v1/HeaderP2_PillHeader';

// ── 사용 대기 중인 컨테이너 (추후 필요 시 import하여 조립) ──────────────
// import { StatsSection }    from './components/StatsSection';
// import { FeaturesSection } from './components/FeaturesSection';
// import { PartnersSection } from './components/PartnersSection';
// import { NewsSection }     from './components/NewsSection';

export default function App() {
  return (
    <>
      {/* 헤더: proposal=2, mode=dark (floating pill) */}
      <PillHeader />

      <main>
        {/* 2. 히어로 섹션 (영상 배경 + 타이틀) */}
        <HeroSection />

        {/* 3. 스크롤 하이라이팅 텍스트 (P1 body-pair is-active 방식) */}
        <TextHighlightSection />
      </main>
    </>
  );
}
