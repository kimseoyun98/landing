const CHARS = ['$', '€', '£', '¥', '₩', '₹'];

const CHINA_EU     = 0.5 + 104 / 360;
const SCROLL_SPEED = 1 / 25;

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

  // 처음부터 라이트모드 (gray 글리프)
  private lightAlpha = 1;
  private stopRotation = false;

  private earthData?: Uint8ClampedArray;
  private earthW = 0;
  private earthH = 0;

  private cx = 0;
  private cy = 0;
  private drawCy = 0;
  private baseRadius = 0;
  private drawRadius = 0;
  private clipRadius = 0;
  private spacingScale = 1.0; // 원 크기 배율
  private posScale     = 1.0; // 글리프 위치 간격 배율 (별도 제어)

  // Focus mode (step 3): 중앙 원 → 오른쪽 이동
  private focusMode      = false;
  private focusGlyphIdx  = -1;
  private focusX         = 0;
  private focusY         = 0;
  private focusR         = 0;
  private othersAlpha    = 1.0;
  private focusVideo?: HTMLVideoElement; // 원 안에 재생할 영상

  constructor(canvas: HTMLCanvasElement, onComplete?: () => void) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('No 2D context');
    this.ctx = ctx;

    this.loadEarthMask();
    window.addEventListener('resize', this.resize);
    this.resize();

    // 다크모드 지구본과 동일: 화면 꽉 채운 크기 → baseRadius 축소
    this.tweenRadius(this.drawRadius, this.baseRadius, 1200);
    this.tweenClip(this.clipRadius, this.baseRadius, 1200);

    // 동일한 fade-in: 0.3s 딜레이 → 0.5s fade-in → 1.5s 유지 → onComplete
    setTimeout(() => {
      this.tweenAlpha(0, 1.0, 500, () => {
        setTimeout(() => {
          onComplete?.();
        }, 1500);
      });
    }, 300);

    // Pretendard Thin 로드 후 렌더 시작
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
        this.animId = requestAnimationFrame(this.animate);
      });
  }

  // ── globeAlpha tween ──────────────────────────────────────────────────────
  private tweenAlpha(from: number, to: number, ms: number, cb?: () => void) {
    const start = performance.now();
    const tick = (now: number) => {
      const raw = Math.min((now - start) / ms, 1);
      const t   = raw === 1 ? 1 : 1 - Math.pow(2, -10 * raw);
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

  // ── spacingScale tween ───────────────────────────────────────────────────
  private tweenSpacing(from: number, to: number, ms: number) {
    const start = performance.now();
    const tick = (now: number) => {
      const raw = Math.min((now - start) / ms, 1);
      const t   = raw === 1 ? 1 : 1 - Math.pow(2, -10 * raw);
      this.spacingScale = from + (to - from) * t;
      if (raw < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  private tweenPosScale(from: number, to: number, ms: number) {
    const start = performance.now();
    const tick = (now: number) => {
      const raw = Math.min((now - start) / ms, 1);
      const t   = raw === 1 ? 1 : 1 - Math.pow(2, -10 * raw);
      this.posScale = from + (to - from) * t;
      if (raw < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  /** GlobePhase에서 오버레이 페이드 후 호출 — 확장 애니메이션만 담당 */
  transitionToLight(onDone?: () => void) {
    this.stopRotation = true;
    onDone?.();

    const w = window.innerWidth;
    const h = window.innerHeight;
    const finalR    = Math.max(w, h) * 2.2;
    const finalClip = Math.hypot(w, h) * 3;
    this.tweenRadius(this.drawRadius, finalR,    2000);
    this.tweenClip(this.clipRadius,   finalClip, 2000);
    this.tweenSpacing(1.0,            2.5,       2000); // 원 크기: 크게
    this.tweenPosScale(1.0,           1.3,       2000); // 위치 간격: 살짝만
  }

  /** step 3 진입: 중앙 원 → 오른쪽으로 커지며 이동, 나머지 페이드 아웃 */
  transitionToFocus() {
    if (this.focusMode) return;
    this.focusMode = true;

    const cx     = this.cx;
    const cy     = this.drawCy;
    const radius = this.drawRadius;
    const scale  = (radius * 2) / this.earthH * this.spacingScale;
    const earthPx = this.earthW * scale;
    const ROWS    = 120;
    const circleR = Math.max(4, (this.earthH * scale / ROWS) * 0.44);

    // 화면 중앙에 가장 가까운 글리프 탐색
    let minDist = Infinity;
    let heroIdx = 0;
    let heroSX  = cx;
    let heroSY  = cy;

    this.glyphs.forEach((g, i) => {
      const rawU   = (g.eu - CHINA_EU + 0.5 - this.scrollU + 100) % 1;
      const sY     = cy + (g.ev - 0.5) * this.earthH * scale;
      const sX     = cx + (rawU - 0.5) * earthPx;
      const dist   = Math.hypot(sX - cx, sY - cy);
      if (dist < minDist) { minDist = dist; heroIdx = i; heroSX = sX; heroSY = sY; }
    });

    this.focusGlyphIdx = heroIdx;
    this.focusX = heroSX;
    this.focusY = heroSY;
    this.focusR = circleR;

    // 비디오 준비
    const vid = document.createElement('video');
    vid.src      = '/final_videomp_.mp4';
    vid.loop     = true;
    vid.muted    = true;
    vid.playsInline = true;
    vid.play().catch(() => {});
    this.focusVideo = vid;

    const w = window.innerWidth;
    const h = window.innerHeight;
    // 1440 - 24(좌) - 24(우) = 1392px 제한 기준으로 원 위치 계산
    const contentW  = Math.min(w - 48, 1392);
    const contentL  = (w - contentW) / 2 + 24; // 콘텐츠 영역 좌측 시작점
    const tX = contentL + contentW * 0.78;
    const tY = h * 0.5;
    const tR = h * 0.26;

    this.tweenFocusXYR(heroSX, heroSY, circleR, tX, tY, tR, 700);
    this.tweenOthersAlpha(1.0, 0.0, 400);
  }

  private tweenFocusXYR(
    fx: number, fy: number, fr: number,
    tx: number, ty: number, tr: number,
    ms: number
  ) {
    const start = performance.now();
    const tick = (now: number) => {
      const raw = Math.min((now - start) / ms, 1);
      const t   = raw === 1 ? 1 : 1 - Math.pow(2, -10 * raw);
      this.focusX = fx + (tx - fx) * t;
      this.focusY = fy + (ty - fy) * t;
      this.focusR = fr + (tr - fr) * t;
      if (raw < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  private tweenOthersAlpha(from: number, to: number, ms: number) {
    const start = performance.now();
    const tick = (now: number) => {
      const raw = Math.min((now - start) / ms, 1);
      const t   = raw === 1 ? 1 : 1 - Math.pow(2, -10 * raw);
      this.othersAlpha = from + (to - from) * t;
      if (raw < 1) requestAnimationFrame(tick);
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
      this.buildGrid(65, 130); // 인트로: 살짝 여유있는 배치
    };
  }

  // ── Glyph 그리드 생성 ─────────────────────────────────────────────────────
  private buildGrid(rows = 120, cols = 240) {
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
    const clipR2  = this.clipRadius * this.clipRadius;
    const scale   = (radius * 2) / this.earthH;
    const earthPx = this.earthW * scale * this.posScale;

    // 원 크기: spacingScale 기반 (위치와 독립)
    const ROWS    = 120;
    const circleR = Math.max(4, (this.earthH * scale * this.spacingScale / ROWS) * 0.44);

    const fontSize = Math.max(8, Math.round(circleR * 0.7));
    ctx.font         = `100 ${fontSize}px 'PretendardThin', 'Pretendard', sans-serif`;
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';
    ctx.lineWidth    = 0.6;

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
      const screenY = cy + (g.ev - 0.5) * this.earthH * scale * this.posScale;
      const isHero  = this.focusMode && this.glyphs.indexOf(g) === this.focusGlyphIdx;

      for (const uOff of [0, -1, 1]) {
        const screenX = cx + (rawU + uOff - 0.5) * earthPx;
        const dx = screenX - cx;
        const dy = screenY - cy;
        if (dx * dx + dy * dy > clipR2) continue;

        const base = g.isLand
          ? 0.58 + g.variation * 0.32
          : 0.06 + g.variation * 0.12;
        const finalAlpha = Math.min(1, base + g.flash * 0.35);
        const alphaBase  = Math.max(0, finalAlpha * this.globeAlpha);
        const alpha      = isHero ? alphaBase : alphaBase * this.othersAlpha;

        const v = Math.round(255 - this.lightAlpha * (255 - 60));
        const color = `rgb(${v},${v},${v})`;

        if (isHero && this.focusMode) {
          const fX = this.focusX;
          const fY = this.focusY;
          const fR = this.focusR;

          ctx.save();
          ctx.beginPath();
          ctx.arc(fX, fY, fR, 0, Math.PI * 2);
          ctx.clip();

          const vid = this.focusVideo;
          if (vid && vid.readyState >= 2) {
            const vw = vid.videoWidth  || fR * 2;
            const vh = vid.videoHeight || fR * 2;
            const s  = Math.max(fR * 2 / vw, fR * 2 / vh);
            ctx.globalAlpha = 1;
            ctx.drawImage(vid, fX - vw * s / 2, fY - vh * s / 2, vw * s, vh * s);
          } else {
            ctx.fillStyle = '#111';
            ctx.globalAlpha = 1;
            ctx.fill();
          }

          ctx.restore();
          ctx.font      = `100 ${fontSize}px 'PretendardThin', 'Pretendard', sans-serif`;
          ctx.lineWidth = 0.6;
          break;
        }

        if (alpha <= 0.001) continue;
        // 원 (stroke)
        ctx.beginPath();
        ctx.arc(screenX, screenY, circleR, 0, Math.PI * 2);
        ctx.strokeStyle = color;
        ctx.globalAlpha = alpha;
        ctx.stroke();

        // 글자
        ctx.fillStyle   = color;
        ctx.globalAlpha = alpha;
        ctx.fillText(g.char, screenX, screenY);
      }
    }

    // 그라데이션 마스크: 원 꼭대기 → 투명
    if (this.stopRotation) {
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
    if (this.focusVideo) { this.focusVideo.pause(); this.focusVideo.src = ''; }
  }
}
