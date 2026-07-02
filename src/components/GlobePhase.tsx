import { useEffect, useRef } from 'react';
import { FlatGlobeAsset } from './FlatGlobeAsset';

interface Props {
  onComplete: () => void;
}

/** Canvas를 마운트하고 FlatGlobeAsset을 초기화하는 React 래퍼 */
export function GlobePhase({ onComplete }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const globe = new FlatGlobeAsset(canvas, () => {
      // 지구본 fade-out 완료 → overlay 제거 후 콜백
      const overlay = overlayRef.current;
      if (overlay) {
      overlay.style.transition = 'opacity 0.3s ease';
        overlay.style.opacity    = '0';
        setTimeout(() => {
          if (overlay.parentNode) overlay.style.display = 'none';
          onComplete();
        }, 300);
      } else {
        onComplete();
      }
    });

    return () => globe.destroy();
  }, [onComplete]);

  return (
    <>
      {/* 지구본 위의 어두운 배경 overlay */}
      <div
        ref={overlayRef}
        id="p1-dark-overlay"
        style={{ position: 'fixed', inset: 0, background: '#1c1a17', zIndex: 0, pointerEvents: 'none' }}
      />
      <canvas
        ref={canvasRef}
        id="p1-flat-canvas"
        className="flat-canvas-container p1-only"
        style={{ position: 'fixed', inset: 0, zIndex: 1 }}
      />
    </>
  );
}
