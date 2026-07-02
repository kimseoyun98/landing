import { useState, useEffect } from 'react';
import MorphingParticles from './components/MorphingParticles';
import type { ParticleShape } from './components/MorphingParticles';

const PRESET_COLORS = [
  { name: 'Cyber Cyan', value: '#4fa1ff' },
  { name: 'Neon Green', value: '#FFE500' }, // Match our yellow neon globe theme
  { name: 'Golden Glow', value: '#ff8c00' },
  { name: 'Hot Violet', value: '#a020f0' },
  { name: 'Crimson Red', value: '#ff3b30' },
  { name: 'DNA Teal', value: '#00f2fe' },
];

export default function AppParticle() {
  const [shape, setShape] = useState<ParticleShape>('dna');
  const [color, setColor] = useState('#00f2fe');
  const [size, setSize] = useState(0.52);
  const [speed, setSpeed] = useState(3.8);
  const [autoLoop, setAutoLoop] = useState(true);

  // Auto-looping timer to morph shapes automatically every 6.5 seconds
  useEffect(() => {
    if (!autoLoop) return;

    const shapes: ParticleShape[] = ['dna', 'globe', 'wave'];
    const interval = setInterval(() => {
      setShape(prev => {
        const nextIdx = (shapes.indexOf(prev) + 1) % shapes.length;
        return shapes[nextIdx];
      });
    }, 6500);

    return () => clearInterval(interval);
  }, [autoLoop]);

  return (
    <div
      style={{
        position: 'relative',
        width: '100vw',
        height: '100vh',
        background: 'radial-gradient(circle at center, #13141f 0%, #08090f 100%)',
        color: '#f3f4f6',
        fontFamily: "'Pretendard', 'Inter', sans-serif",
        overflow: 'hidden',
      }}
    >
      {/* 3D WebGL Morphing Particles Layer */}
      <MorphingParticles
        shape={shape}
        color={color}
        size={size}
        speed={speed}
        interactive={true}
      />

      {/* Background grid texture overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'linear-gradient(rgba(18, 16, 32, 0.25) 1px, transparent 1px), linear-gradient(90deg, rgba(18, 16, 32, 0.25) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
          zIndex: 0,
          pointerEvents: 'none',
        }}
      />

      {/* Floating Header */}
      <div
        style={{
          position: 'absolute',
          top: '40px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 10,
          textAlign: 'center',
          pointerEvents: 'none',
        }}
      >
        <h1
          style={{
            fontSize: 'clamp(20px, 2.5vw, 36px)',
            fontWeight: 800,
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            margin: '0 0 8px 0',
            background: 'linear-gradient(135deg, #ffffff 0%, #a5b4fc 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textShadow: '0 0 30px rgba(165, 180, 252, 0.1)',
          }}
        >
          Particle Morphing Engine
        </h1>
        <p
          style={{
            fontSize: '13px',
            color: '#818cf8',
            letterSpacing: '0.4em',
            textTransform: 'uppercase',
            margin: 0,
            opacity: 0.8,
          }}
        >
          Fluid WebGL 3D Generative System
        </p>
      </div>

      {/* Premium Glassmorphic Control Panel Card */}
      <div
        style={{
          position: 'absolute',
          bottom: '40px',
          left: '40px',
          zIndex: 10,
          width: '380px',
          padding: '30px',
          borderRadius: '24px',
          background: 'rgba(15, 17, 28, 0.65)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.4)',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
        }}
      >
        {/* Shape Selectors */}
        <div>
          <label style={{ fontSize: '11px', color: '#818cf8', textTransform: 'uppercase', letterSpacing: '0.15em', display: 'block', marginBottom: '12px', fontWeight: 600 }}>
            Morph Target
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
            {(['dna', 'globe', 'wave'] as const).map(s => {
              const isActive = shape === s;
              return (
                <button
                  key={s}
                  onClick={() => {
                    setShape(s);
                    setAutoLoop(false); // pause auto looping on manual click
                  }}
                  style={{
                    padding: '12px 0',
                    borderRadius: '12px',
                    border: isActive ? '1px solid #6366f1' : '1px solid rgba(255, 255, 255, 0.06)',
                    background: isActive ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255, 255, 255, 0.02)',
                    color: isActive ? '#ffffff' : '#9ca3af',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    fontSize: '11px',
                    letterSpacing: '0.08em',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: isActive ? '0 0 15px rgba(99, 102, 241, 0.25)' : 'none',
                  }}
                >
                  {s}
                </button>
              );
            })}
          </div>
        </div>

        {/* Color Presets */}
        <div>
          <label style={{ fontSize: '11px', color: '#818cf8', textTransform: 'uppercase', letterSpacing: '0.15em', display: 'block', marginBottom: '12px', fontWeight: 600 }}>
            Particle Hue
          </label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {PRESET_COLORS.map(c => {
              const isActive = color === c.value;
              return (
                <button
                  key={c.name}
                  onClick={() => setColor(c.value)}
                  title={c.name}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: c.value,
                    border: isActive ? '3px solid #ffffff' : 'none',
                    cursor: 'pointer',
                    transform: isActive ? 'scale(1.15)' : 'scale(1)',
                    transition: 'all 0.2s ease',
                    boxShadow: `0 0 10px ${c.value}40`,
                  }}
                />
              );
            })}
          </div>
        </div>

        {/* Size Slider */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <label style={{ fontSize: '11px', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Particle Size
            </label>
            <span style={{ fontSize: '11px', color: '#818cf8', fontWeight: 600 }}>{(size * 10).toFixed(1)}x</span>
          </div>
          <input
            type="range"
            min="0.15"
            max="1.5"
            step="0.05"
            value={size}
            onChange={(e) => setSize(parseFloat(e.target.value))}
            style={{
              width: '100%',
              accentColor: '#6366f1',
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '4px',
              height: '4px',
              cursor: 'pointer',
            }}
          />
        </div>

        {/* Speed Slider */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <label style={{ fontSize: '11px', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Transition Power
            </label>
            <span style={{ fontSize: '11px', color: '#818cf8', fontWeight: 600 }}>{speed.toFixed(1)}</span>
          </div>
          <input
            type="range"
            min="1.0"
            max="8.0"
            step="0.2"
            value={speed}
            onChange={(e) => setSpeed(parseFloat(e.target.value))}
            style={{
              width: '100%',
              accentColor: '#6366f1',
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '4px',
              height: '4px',
              cursor: 'pointer',
            }}
          />
        </div>

        {/* Auto Loop Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid rgba(255, 255, 255, 0.06)', paddingTop: '20px' }}>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 600, color: '#ffffff' }}>Automatic Sequencing</div>
            <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '2px' }}>Rotate shapes every 6.5s</div>
          </div>
          <button
            onClick={() => setAutoLoop(!autoLoop)}
            style={{
              width: '50px',
              height: '26px',
              borderRadius: '13px',
              background: autoLoop ? '#6366f1' : 'rgba(255, 255, 255, 0.1)',
              border: 'none',
              position: 'relative',
              cursor: 'pointer',
              transition: 'background-color 0.3s ease',
            }}
          >
            <div
              style={{
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                background: '#ffffff',
                position: 'absolute',
                top: '4px',
                left: autoLoop ? '28px' : '4px',
                transition: 'left 0.3s cubic-bezier(0.25, 1, 0.5, 1)',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
              }}
            />
          </button>
        </div>
      </div>

      {/* Info Stats Badge (Right Top) */}
      <div
        style={{
          position: 'absolute',
          top: '40px',
          right: '40px',
          zIndex: 10,
          background: 'rgba(15, 17, 28, 0.45)',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          borderRadius: '12px',
          padding: '12px 18px',
          fontSize: '11px',
          color: '#9ca3af',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
          pointerEvents: 'none',
          backdropFilter: 'blur(10px)',
        }}
      >
        <div><strong style={{ color: '#fff' }}>Particles:</strong> 8,192 dense nodes</div>
        <div><strong style={{ color: '#fff' }}>Renderer:</strong> WebGL (Three.js)</div>
        <div><strong style={{ color: '#fff' }}>Physics:</strong> Interactive Repulsion</div>
        <div><strong style={{ color: '#fff' }}>Performance:</strong> GPU Accelerated</div>
      </div>

      {/* Hover Instruction Overlay */}
      <div
        style={{
          position: 'absolute',
          bottom: '40px',
          right: '40px',
          zIndex: 10,
          color: '#6b7280',
          fontSize: '11px',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          pointerEvents: 'none',
        }}
      >
        [ Move cursor over particles to warp field ]
      </div>
    </div>
  );
}
