import { useEffect, useRef } from 'react';
import { CoinGlobeAsset } from './CoinGlobeAsset';

export function CoinGlobePhase() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const globe = new CoinGlobeAsset(canvas);
    return () => globe.destroy();
  }, []);

  return (
    <canvas
      ref={canvasRef}
      id="coin-globe-canvas"
      style={{ position: 'fixed', inset: 0, zIndex: 1 }}
    />
  );
}
