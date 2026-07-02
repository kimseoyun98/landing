import { useEffect, useState } from 'react';
import Globe from '../components/Globe';

interface Props {
  onComplete: () => void;
}

export function GlobePhase({ onComplete }: Props) {
  const [isLight, setIsLight] = useState(false);
  const [overlayOpacity, setOverlayOpacity] = useState(1);

  useEffect(() => {
    // 1.8초 동안 어두운 테마 유지 후 전환 시작
    const introTimeout = setTimeout(() => {
      setIsLight(true);
      setOverlayOpacity(0);

      // 0.9초간의 오버레이 페이드가 완료된 후 콘텐츠 표시
      const completeTimeout = setTimeout(() => {
        onComplete();
      }, 900);

      return () => clearTimeout(completeTimeout);
    }, 1800);

    return () => clearTimeout(introTimeout);
  }, [onComplete]);

  return (
    <>
      {/* 어두운 배경 overlay — 전환 시 fade-out */}
      <div
        id="p1-dark-overlay"
        style={{
          position:      'fixed',
          inset:         0,
          background:    '#1c1a17',
          zIndex:        0,
          pointerEvents: 'none',
          opacity:       overlayOpacity,
          transition:    'opacity 0.9s ease',
        }}
      />
      {/* 3D 지구본 컴포넌트 — 전환 후에도 배경에 남아있음 */}
      <div
        className="p1-only-flex"
        style={{
          position:      'fixed',
          inset:         0,
          alignItems:    'center',
          justifyContent: 'center',
          zIndex:        1, // overlay(0) 보다는 위, 콘텐츠(50) 보다는 아래
          pointerEvents: 'none',
        }}
      >
        <Globe
          size={580}
          mode={isLight ? 'light' : 'dark'}
        />
      </div>
    </>
  );
}
