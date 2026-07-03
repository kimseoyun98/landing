import { useRef, useEffect } from 'react';

interface VideoBackgroundProps {
  /** /HeroVideo/your-video.mp4 형태의 경로 */
  src: string;
  /** 어두운 오버레이 강도 (0~1, 기본 0.45) */
  overlayOpacity?: number;
}

export function VideoBackground({ src, overlayOpacity = 0.45 }: VideoBackgroundProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    // autoplay 정책 준수: muted + play()
    video.muted = true;
    video.play().catch(() => {/* 무시 */});
  }, []);

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 0,
        overflow: 'hidden',
        background: '#01284b', // 비디오 로드 전 Figma 배경색
      }}
    >
      {/* 비디오 레이어 */}
      <video
        ref={videoRef}
        src={src}
        autoPlay
        muted
        loop
        playsInline
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: 'center',
        }}
      />

      {/* 어두운 오버레이 — 텍스트 가독성 확보 */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `rgba(0, 0, 0, ${overlayOpacity})`,
        }}
      />
    </div>
  );
}
