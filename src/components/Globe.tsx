import { useEffect, useRef } from 'react';
import * as THREE from 'three';

const MARKERS_DATA = [
  { name: 'Seoul', lat: 37.5665, lon: 126.9780 },
  { name: 'New York', lat: 40.7128, lon: -74.0060 },
  { name: 'London', lat: 51.5074, lon: -0.1278 },
  { name: 'Tokyo', lat: 35.6762, lon: 139.6503 },
  { name: 'Hong Kong', lat: 22.3193, lon: 114.1694 },
  { name: 'Singapore', lat: 1.3521, lon: 103.8198 },
  { name: 'Sao Paulo', lat: -23.5505, lon: -46.6333 },
];

export interface GlobeProps {
  size?: number;
  mode?: 'dark' | 'light'; // Controls dynamic style morphing
  bgColor?: string;
  dotColor?: string;
  innerSphereColor?: string;
  innerSphereOpacity?: number;
  glowColor?: [number, number, number]; // RGB values in range [0, 1] for the rim glow
  markerColor?: string;
  arcColor?: string;
  autoRotateSpeed?: number;
}

export default function Globe({
  size = 600,
  mode = 'dark',
  dotColor = '#ffffff',
  innerSphereColor = '#1c1a17',
  innerSphereOpacity = 0.8,
  glowColor = [0.65, 0.8, 1.0], // Default white/blue tight rim glow
  markerColor = '#FFE500', // Default bright yellow markers
  arcColor = '#FFE500', // Default bright yellow flowing neon curves
  autoRotateSpeed = 0.003,
}: GlobeProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Refs to hold interpolation targets to prevent re-running the main Three.js useEffect on prop changes
  const targetDotColorRef = useRef(new THREE.Color('#ffffff'));
  const targetInnerColorRef = useRef(new THREE.Color('#1c1a17'));
  const targetInnerOpacityRef = useRef(0.8);
  const targetGlowColorRef = useRef(new THREE.Color(0.65, 0.8, 1.0));

  // Sync props to refs whenever they change
  useEffect(() => {
    targetDotColorRef.current.set(mode === 'light' ? '#cccccc' : dotColor);
    targetInnerColorRef.current.set(mode === 'light' ? '#ffffff' : innerSphereColor);
    targetInnerOpacityRef.current = mode === 'light' ? 0.9 : innerSphereOpacity;
    
    const currentGlow = mode === 'light' ? [0.78, 0.82, 0.86] : glowColor;
    targetGlowColorRef.current.setRGB(currentGlow[0], currentGlow[1], currentGlow[2]);
  }, [mode, dotColor, innerSphereColor, innerSphereOpacity, glowColor]);

  useEffect(() => {
    let mounted = true;
    const container = containerRef.current;
    if (!container) return;

    // 1. Scene, Camera, Renderer Setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
    camera.position.z = 240;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(size, size);
    
    // Style the canvas to float absolutely on top of the shadow element
    renderer.domElement.style.position = 'absolute';
    renderer.domElement.style.top = '0';
    renderer.domElement.style.left = '0';
    renderer.domElement.style.zIndex = '1';
    renderer.domElement.style.pointerEvents = 'auto';
    container.appendChild(renderer.domElement);

    // Group to rotate everything together (globe, land, markers, curves)
    const globeGroup = new THREE.Group();
    globeGroup.rotation.x = 0.25; // Tilt the Earth
    scene.add(globeGroup);

    // 2. Inner Solid Base Sphere (blocks dots on the far side, provides depth)
    const radius = 80;
    const innerGeo = new THREE.SphereGeometry(radius * 0.985, 64, 64);
    const innerMat = new THREE.MeshBasicMaterial({
      color: targetInnerColorRef.current.clone(),
      transparent: true,
      opacity: targetInnerOpacityRef.current,
      depthWrite: false,
    });
    const innerSphere = new THREE.Mesh(innerGeo, innerMat);
    globeGroup.add(innerSphere);

    // 3. Tight Rim Light Glow (Custom Fresnel Shader with high power exponent)
    const glowGeo = new THREE.SphereGeometry(radius * 1.025, 64, 64);
    const glowMat = new THREE.ShaderMaterial({
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vViewPosition;
        void main() {
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          vNormal = normalize(normalMatrix * normal);
          vViewPosition = -mvPosition.xyz;
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        varying vec3 vViewPosition;
        uniform vec3 uColor;
        void main() {
          vec3 normal = normalize(vNormal);
          vec3 viewDir = normalize(vViewPosition);
          float intensity = pow(1.0 - abs(dot(normal, viewDir)), 5.5);
          gl_FragColor = vec4(uColor, intensity * 0.95);
        }
      `,
      uniforms: {
        uColor: { value: targetGlowColorRef.current.clone() },
      },
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      transparent: true,
      depthWrite: false,
    });
    const glowSphere = new THREE.Mesh(glowGeo, glowMat);
    scene.add(glowSphere);

    // Helper: Map Lat/Lon degrees to 3D Cartesian space matching Three.js standard
    function latLonToVector3(lat: number, lon: number, r: number) {
      const latRad = lat * (Math.PI / 180);
      const lonRad = lon * (Math.PI / 180);
      
      const phi = Math.PI / 2 - latRad;
      const theta = lonRad + Math.PI;

      const x = -r * Math.cos(theta) * Math.sin(phi);
      const y = r * Math.cos(phi);
      const z = r * Math.sin(theta) * Math.sin(phi);

      return new THREE.Vector3(x, y, z);
    }

    // Procedural Glowing Hexagon (Honeycomb) Texture
    function createHexagonTexture() {
      const canvas = document.createElement('canvas');
      canvas.width = 16;
      canvas.height = 16;
      const ctx = canvas.getContext('2d')!;
      
      // Draw hexagon shape
      const r = 5.5; // Radius
      const cx = 8;
      const cy = 8;
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = (i * Math.PI) / 3;
        const x = cx + r * Math.cos(angle);
        const y = cy + r * Math.sin(angle);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();

      // Soft glow fill
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
      grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
      grad.addColorStop(0.5, 'rgba(255, 255, 255, 0.8)');
      grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = grad;
      ctx.fill();

      // Sharp hexagon geometric border outline
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.lineWidth = 0.8;
      ctx.stroke();

      return new THREE.CanvasTexture(canvas);
    }

    let pointsObject: THREE.Points | null = null;
    const markersGroup = new THREE.Group();
    globeGroup.add(markersGroup);

    interface AnimatedLine {
      material: THREE.ShaderMaterial;
      progress: number;
      speed: number;
    }
    const animatedLines: AnimatedLine[] = [];

    // Load local Earth mask
    const img = new Image();
    img.src = '/earth-mask.jpg';
    img.onload = () => {
      if (!mounted) return;

      const offCanvas = document.createElement('canvas');
      offCanvas.width = img.width;
      offCanvas.height = img.height;
      const offCtx = offCanvas.getContext('2d')!;
      offCtx.drawImage(img, 0, 0);
      const imgData = offCtx.getImageData(0, 0, img.width, img.height).data;

      // Sample land dots using hexagonal honeycomb lattice (with offset rows)
      const points: THREE.Vector3[] = [];
      const latSegments = 150;
      const lonSegmentsMax = 300;

      for (let latIdx = 0; latIdx <= latSegments; latIdx++) {
        const v = latIdx / latSegments;
        const lat = v * 180 - 90;
        const latRad = lat * (Math.PI / 180);

        const cosLat = Math.cos(latRad);
        const lonSegments = Math.max(4, Math.round(lonSegmentsMax * cosLat));

        // Hexagonal offset: shift odd rows by 0.5 index units
        const isOddRow = latIdx % 2 === 1;
        const rowOffset = isOddRow ? 0.5 : 0.0;

        for (let lonIdx = 0; lonIdx < lonSegments; lonIdx++) {
          const u = (lonIdx + rowOffset) / lonSegments;
          const lon = u * 360 - 180;

          const uWrapped = (u + 1) % 1;
          const px = Math.min(img.width - 1, Math.floor(uWrapped * img.width));
          const py = Math.min(img.height - 1, Math.floor((1 - v) * img.height));
          const idx = (py * img.width + px) * 4;

          if (imgData[idx] < 128) {
            const pos = latLonToVector3(lat, lon, radius);
            points.push(pos);
          }
        }
      }

      // Create particle points (sized slightly smaller since density is much higher)
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const texture = createHexagonTexture();
      const material = new THREE.PointsMaterial({
        color: targetDotColorRef.current.clone(),
        size: size > 500 ? 1.55 : 1.25,
        map: texture,
        transparent: true,
        opacity: 0.85,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });

      pointsObject = new THREE.Points(geometry, material);
      globeGroup.add(pointsObject);

      // Add Cities & Transaction Lines
      const seoulPos = latLonToVector3(37.5665, 126.9780, radius);

      MARKERS_DATA.forEach(city => {
        const pos = latLonToVector3(city.lat, city.lon, radius);

        // Core marker point (Clean static circle point)
        const coreGeo = new THREE.SphereGeometry(1.3, 16, 16);
        const coreMat = new THREE.MeshBasicMaterial({ color: markerColor });
        const coreMesh = new THREE.Mesh(coreGeo, coreMat);
        coreMesh.position.copy(pos);
        markersGroup.add(coreMesh);

        // Path curves from Seoul to elsewhere (Animated with moving gradient shader)
        if (city.name !== 'Seoul') {
          const pMid = new THREE.Vector3().addVectors(seoulPos, pos).multiplyScalar(0.5);
          const dist = seoulPos.distanceTo(pos);
          const arcHeight = radius * 0.15 + dist * 0.18;
          pMid.normalize().multiplyScalar(radius + arcHeight);

          const curve = new THREE.QuadraticBezierCurve3(seoulPos, pMid, pos);

          // Render curve path as 3D Tube to support thickness
          const tubeGeo = new THREE.TubeGeometry(curve, 44, 0.38, 6, false);

          // Custom Shader Material using the tube's built-in UV.x for path progress mapping
          const lineMat = new THREE.ShaderMaterial({
            vertexShader: `
              varying vec2 vUv;
              void main() {
                vUv = uv;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
              }
            `,
            fragmentShader: `
              varying vec2 vUv;
              uniform vec3 uColor;
              uniform float uProgress;
              void main() {
                float distanceAlongLine = vUv.x;
                
                float tailLength = 0.38;
                float d = uProgress - distanceAlongLine;
                if (d < 0.0) {
                  d += 1.0; // Wrap around for continuous loop
                }

                float alpha = 0.0;
                if (d <= tailLength) {
                  alpha = 1.0 - (d / tailLength);
                  alpha = pow(alpha, 1.5); // Soft exponential fadeout
                }

                // Base ambient path opacity = 0.28, pulse intensity = alpha * 0.72
                float finalAlpha = 0.28 + alpha * 0.72;
                gl_FragColor = vec4(uColor, finalAlpha * 0.95);
              }
            `,
            uniforms: {
              uColor: { value: new THREE.Color(arcColor) },
              uProgress: { value: 0.0 },
            },
            transparent: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
          });

          const tubeMesh = new THREE.Mesh(tubeGeo, lineMat);
          markersGroup.add(tubeMesh);

          animatedLines.push({
            material: lineMat,
            progress: Math.random(), // Randomize starting progress
            speed: 0.16 + Math.random() * 0.18,
          });
        }
      });
    };

    // 4. Render loop
    let animId: number;
    let lastTime = performance.now();

    const animate = () => {
      if (!mounted) return;
      animId = requestAnimationFrame(animate);

      const now = performance.now();
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      globeGroup.rotation.y += autoRotateSpeed;

      // Smooth color morphing of materials (lerping over time)
      const lerpSpeed = 3.5;

      if (pointsObject && pointsObject.material) {
        (pointsObject.material as THREE.PointsMaterial).color.lerp(targetDotColorRef.current, dt * lerpSpeed);
      }

      if (innerSphere && innerSphere.material) {
        const mat = innerSphere.material as THREE.MeshBasicMaterial;
        mat.color.lerp(targetInnerColorRef.current, dt * lerpSpeed);
        mat.opacity += (targetInnerOpacityRef.current - mat.opacity) * dt * lerpSpeed;
      }

      if (glowSphere && glowSphere.material) {
        const mat = glowSphere.material as THREE.ShaderMaterial;
        mat.uniforms.uColor.value.lerp(targetGlowColorRef.current, dt * lerpSpeed);
      }

      // Animate flowing line gradients
      animatedLines.forEach(line => {
        line.progress += dt * line.speed;
        if (line.progress > 1.0) line.progress = 0;
        line.material.uniforms.uProgress.value = line.progress;
      });

      renderer.render(scene, camera);
    };

    animate();

    // 5. Unmount disposal
    return () => {
      mounted = false;
      cancelAnimationFrame(animId);

      scene.traverse(obj => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry?.dispose();
          if (Array.isArray(obj.material)) {
            obj.material.forEach(m => m.dispose());
          } else {
            obj.material?.dispose();
          }
        } else if (obj instanceof THREE.Points) {
          obj.geometry?.dispose();
          if (Array.isArray(obj.material)) {
            obj.material.forEach(m => m.dispose());
          } else {
            obj.material?.dispose();
          }
        } else if (obj instanceof THREE.Line) {
          obj.geometry?.dispose();
          if (Array.isArray(obj.material)) {
            obj.material.forEach(m => m.dispose());
          } else {
            obj.material?.dispose();
          }
        }
      });

      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [size, dotColor, innerSphereColor, innerSphereOpacity, glowColor, markerColor, arcColor, autoRotateSpeed]);

  const shadowSize = size * 0.805;

  return (
    <div
      ref={containerRef}
      style={{
        width: size,
        height: size,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'transparent',
        position: 'relative',
      }}
    >
      {/* Exact-match Shadow/Backing Element (with CSS transitions matching mode) */}
      <div
        style={{
          position: 'absolute',
          width: `${shadowSize}px`,
          height: `${shadowSize}px`,
          borderRadius: '50%',
          background: mode === 'light' ? '#ffffff' : innerSphereColor,
          opacity: mode === 'light' ? 0.9 : innerSphereOpacity,
          boxShadow: mode === 'light'
            ? '0 10px 40px rgba(0, 0, 0, 0.08)'
            : '0 20px 60px rgba(0, 0, 0, 0.8)',
          zIndex: 0,
          pointerEvents: 'none',
          transition: 'background-color 0.9s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.9s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.9s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      />
    </div>
  );
}
