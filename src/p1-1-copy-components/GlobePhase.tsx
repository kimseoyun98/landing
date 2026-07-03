import { useEffect, useRef } from 'react';
import { FlatGlobeAsset } from './FlatGlobeAsset';

interface Props {
  onGlobeReady?: (globe: FlatGlobeAsset) => void;
}

export function GlobePhase({ onGlobeReady }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const globe = new FlatGlobeAsset(canvas);

    onGlobeReady?.(globe);

    return () => globe.destroy();
  }, [onGlobeReady]);

  return (
    <canvas
      ref={canvasRef}
      id="p1-flat-canvas"
      className="flat-canvas-container p1-only"
      style={{ position: 'fixed', inset: 0, zIndex: 1 }}
    />
  );
}
