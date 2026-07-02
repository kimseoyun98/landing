import { useEffect, useRef } from 'react';
import { FlatGlobeAsset } from './FlatGlobeAsset';

interface Props {
  onComplete: () => void;
  onGlobeReady?: (globe: FlatGlobeAsset) => void;
}

export function GlobePhase({ onComplete, onGlobeReady }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const globe = new FlatGlobeAsset(canvas, () => {
      globe.transitionToLight(() => {
        onComplete();
      });
    });

    onGlobeReady?.(globe);

    return () => globe.destroy();
  }, [onComplete, onGlobeReady]);

  return (
    <canvas
      ref={canvasRef}
      id="p1-flat-canvas"
      className="flat-canvas-container p1-only"
      style={{ position: 'fixed', inset: 0, zIndex: 1 }}
    />
  );
}
