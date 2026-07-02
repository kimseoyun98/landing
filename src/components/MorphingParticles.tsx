import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export type ParticleShape = 'dna' | 'globe' | 'wave';

export interface MorphingParticlesProps {
  shape: ParticleShape;
  color?: string;
  size?: number;
  speed?: number;
  interactive?: boolean;
}

export default function MorphingParticles({
  shape = 'dna',
  color = '#4fa1ff', // Premium cyan/blue glowing particles
  size = 0.55,
  speed = 4.0, // Base morph speed
  interactive = true,
}: MorphingParticlesProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Refs to sync prop changes to the animation loop without re-running useEffect
  const currentShapeRef = useRef(shape);
  const colorRef = useRef(new THREE.Color(color));
  const sizeRef = useRef(size);
  const speedRef = useRef(speed);
  const mouseRef = useRef({ x: 0, y: 0, active: false, targetX: 0, targetY: 0, targetZ: 0 });

  currentShapeRef.current = shape;
  colorRef.current.set(color);
  sizeRef.current = size;
  speedRef.current = speed;

  useEffect(() => {
    let mounted = true;
    const container = containerRef.current;
    if (!container) return;

    // 1. Scene, Camera, Renderer Setup
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 110;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.domElement.style.pointerEvents = 'none'; // let clicks pass through
    container.appendChild(renderer.domElement);

    // 2. Pre-calculate Particle Positions for each shape
    const N = 8192; // High-density particle count

    // Buffer attributes for current, original (target) and particle speeds
    const currentPositions = new Float32Array(N * 3);
    const targetPositions = new Float32Array(N * 3);
    const speeds = new Float32Array(N);

    // Initialize randomized speeds for organic, offset movement
    for (let i = 0; i < N; i++) {
      speeds[i] = 1.0 + Math.random() * 2.0; // individual speed multipliers
    }

    // Helper formulas to compute positions for a given shape
    function getShapePosition(index: number, shapeType: ParticleShape, time: number = 0) {
      let x = 0, y = 0, z = 0;

      if (shapeType === 'dna') {
        // DNA Helix: Two strands winding with connecting rungs
        const t = index / N;
        const isRung = index % 8 === 0;

        if (isRung) {
          // Connector rung particle
          const rungProgress = Math.random(); // spread along rung
          const angle = t * Math.PI * 6; // 3 full turns
          
          const xA = 15 * Math.cos(angle);
          const zA = 15 * Math.sin(angle);
          const xB = 15 * Math.cos(angle + Math.PI);
          const zB = 15 * Math.sin(angle + Math.PI);

          x = xA + (xB - xA) * rungProgress;
          z = zA + (zB - zA) * rungProgress;
          y = t * 64 - 32;
        } else {
          // Strand A or B
          const strand = index % 2;
          const angle = t * Math.PI * 6 + (strand * Math.PI);
          
          x = 15 * Math.cos(angle) + (Math.random() - 0.5) * 1.5;
          z = 15 * Math.sin(angle) + (Math.random() - 0.5) * 1.5;
          y = t * 64 - 32 + (Math.random() - 0.5) * 1.0;
        }
      } else if (shapeType === 'globe') {
        // Sphere shape distributed uniformly using golden spiral
        const goldenRatio = (1 + Math.sqrt(5)) / 2;
        const t = index / N;
        const lat = Math.asin(2 * t - 1);
        const lon = index * goldenRatio * Math.PI * 2;
        const R = 23; // sphere radius

        x = R * Math.cos(lat) * Math.cos(lon);
        y = R * Math.sin(lat);
        z = R * Math.cos(lat) * Math.sin(lon);
      } else {
        // Wave Plane (Undulating 2D surface)
        const cols = 90;
        const rows = Math.ceil(N / cols);
        const c = index % cols;
        const r = Math.floor(index / cols);

        const u = (c / cols - 0.5) * 80;
        const v = (r / rows - 0.5) * 80;

        x = u;
        z = v;
        // Basic wavy height (dynamic undulations are added in the render loop)
        y = Math.sin(u * 0.15 + time) * Math.cos(v * 0.15 + time) * 4.5;
      }

      return { x, y, z };
    }

    // Initialize all current positions in a randomized cloud
    for (let i = 0; i < N; i++) {
      currentPositions[i * 3] = (Math.random() - 0.5) * 200;
      currentPositions[i * 3 + 1] = (Math.random() - 0.5) * 200;
      currentPositions[i * 3 + 2] = (Math.random() - 0.5) * 200;
    }

    // 3. Set up particle geometry and material
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(currentPositions, 3));

    // Generate circular glow texture procedurally
    function createCircleTexture() {
      const canvas = document.createElement('canvas');
      canvas.width = 32;
      canvas.height = 32;
      const ctx = canvas.getContext('2d')!;
      
      const grad = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
      grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
      grad.addColorStop(0.3, 'rgba(255, 255, 255, 0.7)');
      grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
      
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 32, 32);
      
      return new THREE.CanvasTexture(canvas);
    }

    const texture = createCircleTexture();
    const material = new THREE.PointsMaterial({
      color: colorRef.current.clone(),
      size: sizeRef.current * 2.8, // scale size up matching circle scale
      map: texture,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    // 4. Mouse Move Event Handler (project screen coordinates into 3D space)
    const handleMouseMove = (e: MouseEvent) => {
      if (!interactive) return;
      const rect = container.getBoundingClientRect();
      const mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const mouseY = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      // Project mouse into a plane at z=0 (near the particle center)
      const vector = new THREE.Vector3(mouseX, mouseY, 0.5);
      vector.unproject(camera);
      const dir = vector.sub(camera.position).normalize();
      const distance = -camera.position.z / dir.z;
      const pos = camera.position.clone().add(dir.multiplyScalar(distance));

      mouseRef.current.active = true;
      mouseRef.current.targetX = pos.x;
      mouseRef.current.targetY = pos.y;
      mouseRef.current.targetZ = pos.z;
    };

    const handleMouseLeave = () => {
      mouseRef.current.active = false;
    };

    window.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mouseleave', handleMouseLeave);

    // 5. Animation Loop
    let animId: number;
    let lastTime = performance.now();
    let clock = new THREE.Clock();

    const animate = () => {
      if (!mounted) return;
      animId = requestAnimationFrame(animate);

      const now = performance.now();
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;
      const time = clock.getElapsedTime();

      // Dynamic color interpolation
      material.color.lerp(colorRef.current, dt * 5);
      material.size = sizeRef.current * 2.8;

      const posAttr = geometry.getAttribute('position') as THREE.BufferAttribute;
      const posArray = posAttr.array as Float32Array;

      const activeShape = currentShapeRef.current;
      const baseMorphSpeed = speedRef.current;

      // Compute targets and update current positions
      for (let i = 0; i < N; i++) {
        // A. Calculate base target coordinates for this shape
        const baseTarget = getShapePosition(i, activeShape, time);

        // B. Add dynamic waving motions to wave plane
        if (activeShape === 'wave') {
          baseTarget.y = Math.sin(baseTarget.x * 0.15 + time * 1.8) * Math.cos(baseTarget.z * 0.15 + time * 1.3) * 5.0;
        }

        targetPositions[i * 3] = baseTarget.x;
        targetPositions[i * 3 + 1] = baseTarget.y;
        targetPositions[i * 3 + 2] = baseTarget.z;

        // C. Interpolate current coordinate towards target
        let cx = posArray[i * 3];
        let cy = posArray[i * 3 + 1];
        let cz = posArray[i * 3 + 2];

        const tx = targetPositions[i * 3];
        const ty = targetPositions[i * 3 + 1];
        const tz = targetPositions[i * 3 + 2];

        const dx = tx - cx;
        const dy = ty - cy;
        const dz = tz - cz;

        const distanceToTarget = Math.sqrt(dx*dx + dy*dy + dz*dz);
        const pSpeed = baseMorphSpeed * speeds[i];

        // Swirling vortex physics force: rotate particles around Y axis if they are far from target
        if (distanceToTarget > 3.0) {
          const swirlFactor = 0.08 * (1.0 / (distanceToTarget * 0.15 + 0.5));
          const rx = cx * Math.cos(swirlFactor) - cz * Math.sin(swirlFactor);
          const rz = cx * Math.sin(swirlFactor) + cz * Math.cos(swirlFactor);
          cx = rx;
          cz = rz;
        }

        // Apply linear lerp towards target
        cx += (tx - cx) * dt * pSpeed;
        cy += (ty - cy) * dt * pSpeed;
        cz += (tz - cz) * dt * pSpeed;

        // D. Interactive Mouse Repulsion Force
        if (mouseRef.current.active) {
          const mx = mouseRef.current.targetX;
          const my = mouseRef.current.targetY;
          const mz = mouseRef.current.targetZ;

          const pdx = cx - mx;
          const pdy = cy - my;
          const pdz = cz - mz;
          const distToMouse = Math.sqrt(pdx*pdx + pdy*pdy + pdz*pdz);

          const maxDist = 20.0;
          if (distToMouse < maxDist) {
            const force = (1.0 - distToMouse / maxDist) * 12.0; // strength of push
            // push particles outward
            cx += (pdx / (distToMouse + 0.1)) * force * dt * 8.0;
            cy += (pdy / (distToMouse + 0.1)) * force * dt * 8.0;
            cz += (pdz / (distToMouse + 0.1)) * force * dt * 8.0;
          }
        }

        posArray[i * 3] = cx;
        posArray[i * 3 + 1] = cy;
        posArray[i * 3 + 2] = cz;
      }

      posAttr.needsUpdate = true;

      // Slow rotating system rotation (especially for Helix and Globe)
      if (activeShape === 'dna') {
        particles.rotation.y = time * 0.25;
        particles.rotation.x = 0.15;
      } else if (activeShape === 'globe') {
        particles.rotation.y = time * 0.18;
        particles.rotation.x = 0.25;
      } else {
        // wave: slight dynamic tilt
        particles.rotation.y = Math.sin(time * 0.1) * 0.1;
        particles.rotation.x = -0.45; // pitch down to see wave depth
      }

      renderer.render(scene, camera);
    };

    animate();

    // 6. Handle Window Resizes
    const handleResize = () => {
      if (!mounted) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    // 7. Cleanup WebGL on Unmount
    return () => {
      mounted = false;
      cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('mouseleave', handleMouseLeave);

      geometry.dispose();
      material.dispose();
      texture.dispose();
      renderer.dispose();
      
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [interactive]);

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '100%',
        position: 'absolute',
        top: 0,
        left: 0,
        overflow: 'hidden',
        background: 'transparent',
      }}
    />
  );
}
