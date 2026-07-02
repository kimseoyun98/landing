const CHARS = ['$', '€', '£', '¥', '₩', '₹'];

// earth-mask.jpg 기준: u=0.5 → 0°(Prime Meridian), 중국 104°E → u≈0.789
const CHINA_EU     = 0.5 + 104 / 360; // ≈ 0.789
const SCROLL_SPEED = 1 / 25;           // 25초에 한 바퀴

interface Glyph {
  eu: number;
  ev: number;
  isLand: boolean;
  char: string;
  variation: number;
  timer: number;
  interval: number;
  flash: number;
}

export class FlatGlobeAsset {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private glyphs: Glyph[] = [];
  private animId?: number;
  private lastTime = 0;

  private scrollU = 0;
  private globeAlpha = 0;

  // P1-1 전용: 라이트 모드 전환용
  private lightMode = false;
  private lightAlpha = 0;
  private stopRotation = false;

  private earthData?: Uint8ClampedArray;
  private earthW = 0;
  private earthH = 0;

  private cx = 0;
  private cy = 0;
  private drawCy = 0;       // 렌더 중심 Y (애니메이션)
  private baseRadius = 0;   // 목표 반지름
  private drawRadius = 0;   // 렌더 반지름 (글리프 배치용)
  private clipRadius = 0;   // 클리핑 반지름 (원형 → 해제 애니메이션)

  constructor(canvas: HTMLCanvasElement, onComplete?: () => void) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('No 2D context');
    this.ctx = ctx;

    // P1-1: fade-in 후 유지 → onComplete 호출 (fade-out 없음)
    this.globeAlpha = 0;
    setTimeout(() => {
      this.tweenAlpha(0, 1, 500, () => {
        setTimeout(() => {
          onComplete?.();
        }, 1500);
      });
    }, 300);

    this.loadEarthMask();
    window.addEventListener('resize', this.resize);
    this.resize();

    // 화면 꽉 채운 크기로 시작 → 목표 사이즈로 즉시 축소 (딜레이 없음)
    this.tweenRadius(this.drawRadius, this.baseRadius, 1200);
    this.tweenClip(this.clipRadius, this.baseRadius, 1200);

    // Pretendard Thin(100) 명시 로드 후 렌더 시작
    const pretendardThin = new FontFace(
      'PretendardThin',
      "url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard/packages/pretendard/dist/web/static/woff2/Pretendard-Thin.woff2') format('woff2')",
      { weight: '100', style: 'normal' }
    );
    pretendardThin.load()
      .then(face => {
        document.fonts.add(face);
        this.animId = requestAnimationFrame(this.animate);
      })
      .catch(() => {
        // 로드 실패 시 fallback
        this.animId = requestAnimationFrame(this.animate);
      });
  }

  // ── globeAlpha tween ──────────────────────────────────────────────────────
  private tweenAlpha(from: number, to: number, ms: number, cb?: () => void) {
    const start = performance.now();
    const tick = (now: number) => {
      const raw = Math.min((now - start) / ms, 1);
      const t = raw === 1 ? 1 : 1 - Math.pow(2, -10 * raw);
      this.globeAlpha = from + (to - from) * t;
      if (raw < 1) requestAnimationFrame(tick);
      else cb?.();
    };
    requestAnimationFrame(tick);
  }

  // ── drawRadius tween ──────────────────────────────────────────────────────
  private tweenRadius(from: number, to: number, ms: number) {
    const start = performance.now();
    const tick = (now: number) => {
      const raw = Math.min((now - start) / ms, 1);
      const t   = raw === 1 ? 1 : 1 - Math.pow(2, -10 * raw);
      this.drawRadius = from + (to - from) * t;
      if (raw < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  // ── clipRadius tween ──────────────────────────────────────────────────────
  private tweenClip(from: number, to: number, ms: number) {
    const start = performance.now();
    const tick = (now: number) => {
      const raw = Math.min((now - start) / ms, 1);
      const t   = raw === 1 ? 1 : 1 - Math.pow(2, -10 * raw);
      this.clipRadius = from + (to - from) * t;
      if (raw < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  // ── drawCy tween ──────────────────────────────────────────────────────────
  private tweenCy(from: number, to: number, ms: number) {
    const start = performance.now();
    const tick = (now: number) => {
      const raw = Math.min((now - start) / ms, 1);
      const t   = raw === 1 ? 1 : 1 - Math.pow(2, -10 * raw);
      this.drawCy = from + (to - from) * t;
      if (raw < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  /** 어두운 흰색 글리프 → 연한 회색 + opacity 낮춤 (배경 ambient 상태) */
  transitionToLight(onDone?: () => void) {
    this.lightMode = true;
    // 오버레이 페이드 완료 타이밍(0.9s)에 맞춰 그리드 교체
    setTimeout(() => { this.buildGrid(120, 240); }, 900);
    const start      = performance.now();
    const duration   = 1000;
    const startAlpha = this.globeAlpha;
    const endAlpha   = 0.8;
    const tick = (now: number) => {
      const t    = Math.min((now - start) / duration, 1);
      const ease = t < 1 ? 1 - Math.pow(2, -10 * t) : 1;
      this.lightAlpha = ease;
      this.globeAlpha = startAlpha + (endAlpha - startAlpha) * ease;
      if (t < 1) {
        requestAnimationFrame(tick);
      } else {
        this.globeAlpha   = endAlpha;
        this.stopRotation = true;
        onDone?.();
        // 동산 효과: 글리프 배치 반지름 확대 + 중심 아래로
        // 클리핑 반지름은 화면 대각선 크기까지 → 원형 해제
        const w = window.innerWidth;
        const h = window.innerHeight;
        const finalR    = Math.max(w, h) * 2.2;
        const finalCy   = finalR + h * 0.15 - 40;
        const finalClip = Math.hypot(w, h) * 3;
        this.tweenRadius(this.drawRadius, finalR,    2000);
        this.tweenCy(this.drawCy,         finalCy,   2000);
        this.tweenClip(this.clipRadius,   finalClip, 2000);
      }
    };
    requestAnimationFrame(tick);
  }

  // ── earth-mask 로드 ───────────────────────────────────────────────────────
  private loadEarthMask() {
    const img = new Image();
    img.src = '/earth-mask.jpg';
    img.onload = () => {
      const offCanvas = document.createElement('canvas');
      offCanvas.width  = img.naturalWidth;
      offCanvas.height = img.naturalHeight;
      const offCtx = offCanvas.getContext('2d')!;
      offCtx.drawImage(img, 0, 0);
      const imageData = offCtx.getImageData(0, 0, img.naturalWidth, img.naturalHeight);
      this.earthData = imageData.data;
      this.earthW    = img.naturalWidth;
      this.earthH    = img.naturalHeight;
      this.buildGrid();
    };
  }

  // ── Glyph 그리드 생성 ─────────────────────────────────────────────────────
  private buildGrid(rows = 60, cols = 120) {
    this.glyphs = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const eu = c / cols;
        const ev = r / rows;
        const px = Math.min(Math.floor(eu * this.earthW), this.earthW - 1);
        const py = Math.min(Math.floor(ev * this.earthH), this.earthH - 1);
        const idx = (py * this.earthW + px) * 4;
        const isLand = (this.earthData![idx] ?? 0) < 128;
        this.glyphs.push({
          eu, ev, isLand,
          char:      CHARS[Math.floor(Math.random() * CHARS.length)],
          variation: Math.random(),
          timer:     Math.random() * 3,
          interval:  0.7 + Math.random() * 2.8,
          flash:     0,
        });
      }
    }
  }

  // ── 리사이즈 ──────────────────────────────────────────────────────────────
  private resize = () => {
    const w   = window.innerWidth;
    const h   = window.innerHeight;
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width  = Math.round(w * dpr);
    this.canvas.height = Math.round(h * dpr);
    this.canvas.style.width  = `${w}px`;
    this.canvas.style.height = `${h}px`;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.cx         = w / 2;
    this.cy         = h / 2;
    this.baseRadius = Math.min(w, h) * 0.42;
    if (this.drawRadius === 0) {
      this.drawRadius = Math.hypot(w / 2, h / 2);
      this.clipRadius = this.drawRadius;
      this.drawCy     = h / 2;
    }
  };

  // ── 렌더 루프 ─────────────────────────────────────────────────────────────
  private animate = (now: number) => {
    const dt = Math.min((now - this.lastTime) / 1000, 0.05);
    this.lastTime = now;
    if (!this.stopRotation) {
      this.scrollU = (this.scrollU + SCROLL_SPEED * dt) % 1;
    }

    const { canvas, ctx } = this;
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    if (!this.earthData || this.glyphs.length === 0) {
      this.animId = requestAnimationFrame(this.animate);
      return;
    }

    const cx      = this.cx;
    const cy      = this.drawCy;
    const radius  = this.drawRadius;
    const clipR2  = this.clipRadius * this.clipRadius; // 클리핑용 반지름²
    const scale   = (radius * 2) / this.earthH;
    const earthPx = this.earthW * scale;

    const fontSize = Math.max(8, Math.round(radius * 0.025));
    ctx.font         = `100 ${fontSize}px 'PretendardThin', 'Pretendard', sans-serif`;
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';

    for (const g of this.glyphs) {
      g.timer += dt;
      if (g.timer >= g.interval) {
        g.timer    = 0;
        g.interval = 0.7 + Math.random() * 2.8;
        g.char     = CHARS[Math.floor(Math.random() * CHARS.length)];
        g.flash    = 1.0;
      }
      if (g.flash > 0) g.flash = Math.max(0, g.flash - dt * 5);

      const rawU    = (g.eu - CHINA_EU + 0.5 - this.scrollU + 100) % 1;
      const screenY = cy + (g.ev - 0.5) * this.earthH * scale;

      for (const uOff of [0, -1, 1]) {
        const screenX = cx + (rawU + uOff - 0.5) * earthPx;
        const dx = screenX - cx;
        const dy = screenY - cy;

        // clipRadius로 원형 클리핑 (확장 중 clipRadius가 커지면서 자연 해제)
        if (dx * dx + dy * dy > clipR2) continue;

        const base = g.isLand
          ? 0.58 + g.variation * 0.32
          : 0.06 + g.variation * 0.12;
        const finalAlpha = Math.min(1, base + g.flash * 0.35);

        // lightMode: 흰색 → 연한 회색 보간
        if (this.lightMode && this.lightAlpha > 0) {
          const v = Math.round(255 - this.lightAlpha * (255 - 140));
          ctx.fillStyle = `rgb(${v},${v},${v})`;
        } else {
          ctx.fillStyle = '#ffffff';
        }

        ctx.globalAlpha = Math.max(0, finalAlpha * this.globeAlpha);
        ctx.fillText(g.char, screenX, screenY);
      }
    }

    // ── 그라데이션 마스크: 원 꼭대기 → 투명, 아래로 갈수록 → 불투명 ──────────
    if (this.lightMode) {
      const circleTop = cy - radius;
      const fadeEnd   = circleTop + radius * 0.75;

      const grad = ctx.createLinearGradient(0, circleTop, 0, fadeEnd);
      grad.addColorStop(0, 'rgba(0,0,0,0)');
      grad.addColorStop(1, 'rgba(0,0,0,1)');

      ctx.save();
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'destination-in';
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
      ctx.restore();
    }

    ctx.globalAlpha = 1;
    this.animId = requestAnimationFrame(this.animate);
  };

  destroy() {
    window.removeEventListener('resize', this.resize);
    if (this.animId !== undefined) cancelAnimationFrame(this.animId);
  }
}
