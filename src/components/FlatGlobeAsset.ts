const CHARS = ['$', '€', '£', '¥', '₩', '₹'];

// earth-mask.jpg 기준: u=0.5 → 0°(Prime Meridian), 중국 104°E → u≈0.789
const CHINA_EU     = 0.5 + 104 / 360; // ≈ 0.789
const SCROLL_SPEED = 1 / 25;           // 25초에 한 바퀴

interface Glyph {
  eu: number;        // [0, 1] 지구 U좌표 (경도 분율) — 고정
  ev: number;        // [0, 1] 지구 V좌표 (위도 분율) — 고정
  isLand: boolean;   // 고정 (buildGrid 시 결정)
  char: string;
  variation: number; // [0, 1] 개별 alpha 편차
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

  private scrollU = 0; // 자전 누적 (0~1, 매 프레임 증가)

  // 등장/퇴장 페이즈 알파
  private globeAlpha = 0;

  // earth-mask.jpg 픽셀 데이터
  private earthData?: Uint8ClampedArray;
  private earthW = 0;
  private earthH = 0;

  // 레이아웃 캐시
  private cx = 0;
  private cy = 0;
  private radius = 0;

  constructor(canvas: HTMLCanvasElement, onComplete?: () => void) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('No 2D context');
    this.ctx = ctx;

    // 0.3s 딜레이 → 0.5s fade-in → 1.5s 유지 → onComplete 호출
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
    this.animId = requestAnimationFrame(this.animate);
  }

  // ── globeAlpha tween ─────────────────────────────────────────────────────────────
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
  private buildGrid() {
    this.glyphs = [];
    const rows = 60;
    const cols = 120;
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

  // ── 리사이즈 ─────────────────────────────────────────────────────────────
  private resize = () => {
    const w   = window.innerWidth;
    const h   = window.innerHeight;
    const dpr = window.devicePixelRatio || 1;
    // canvas 픽셀 크기 = 논리 크기 × dpr
    this.canvas.width  = Math.round(w * dpr);
    this.canvas.height = Math.round(h * dpr);
    // CSS 표시 크기는 논리 단위 유지
    this.canvas.style.width  = `${w}px`;
    this.canvas.style.height = `${h}px`;
    // ctx 스케일 → 이후 좌표는 논리 픽셀 단위로 사용
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.cx     = w / 2;
    this.cy     = h / 2;
    this.radius = Math.min(w, h) * 0.42;
  };

  // ── 렌더 루프 ─────────────────────────────────────────────────────────────
  private animate = (now: number) => {
    const dt = Math.min((now - this.lastTime) / 1000, 0.05);
    this.lastTime = now;
    this.scrollU  = (this.scrollU + SCROLL_SPEED * dt) % 1;

    const { canvas, ctx } = this;
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    if (!this.earthData || this.glyphs.length === 0) {
      this.animId = requestAnimationFrame(this.animate);
      return;
    }

    const cx      = this.cx;
    const cy      = this.cy;
    const radius  = this.radius;
    const innerR  = radius * 0.98;
    const innerR2 = innerR * innerR;
    const scale   = (radius * 2) / this.earthH;          // px per image-pixel (Y)
    const earthPx = this.earthW * scale;                  // full earth width in px (2:1 비율 유지)

    const fontSize = Math.max(8, Math.round(radius * 0.025));
    ctx.font         = `bold ${fontSize}px monospace`;
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

      // ── 자전 적용: 중국이 처음에 중앙, 왼쪽으로 이동 ─────────────
      const rawU    = (g.eu - CHINA_EU + 0.5 - this.scrollU + 100) % 1;
      const screenY = cy + (g.ev - 0.5) * this.earthH * scale;

      // ── 타일링: rawU, rawU-1, rawU+1 (무한 이음매) ────────────────
      for (const uOff of [0, -1, 1]) {
        const screenX = cx + (rawU + uOff - 0.5) * earthPx;
        const dx = screenX - cx;
        const dy = screenY - cy;
        // 글자 중심이 innerR 안에 있을 때만 → 글자 온전히 표시
        if (dx * dx + dy * dy > innerR2) continue;

        // ── 알파: 육지 진하게 / 바다 연하게 ─────────────────────────
        const base       = g.isLand
          ? 0.58 + g.variation * 0.32   // 육지: 0.58 ~ 0.90
          : 0.06 + g.variation * 0.12;  // 바다: 0.06 ~ 0.18
        const finalAlpha = Math.min(1, base + g.flash * 0.35);

        ctx.globalAlpha = Math.max(0, finalAlpha * this.globeAlpha);
        ctx.fillStyle   = '#ffffff';
        ctx.fillText(g.char, screenX, screenY);
      }
    }

    ctx.globalAlpha = 1;
    this.animId = requestAnimationFrame(this.animate);
  };

  destroy() {
    window.removeEventListener('resize', this.resize);
    if (this.animId !== undefined) cancelAnimationFrame(this.animId);
  }
}
