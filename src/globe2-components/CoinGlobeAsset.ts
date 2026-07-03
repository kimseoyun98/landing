// Assembly 스타일 코인 지구본 (Wise assembly 레퍼런스)
// 평면 디스크 + 스태거드 그리드, 육지=코인(£), 바다=작은 링/점
// 지도가 수평 스크롤되며 셀이 코인↔링으로 토글, 팝 전환

const BG_COLOR    = '#FF7300';
const COIN_COLOR  = '#FFFFFF';
const GLYPH       = '£';
const SCROLL_SPEED = 1 / 20; // 한 바퀴 20초

interface Cell {
  x: number;       // 화면 좌표 (디스크 중심 기준 오프셋)
  y: number;
  isLand: boolean;
  anim: number;    // 상태 전환 후 경과 (0→1)
  seedA: number;   // 코인 크기 변형
  seedB: number;   // 스타일 분기
  seedC: number;   // 링 크기 변형
  timer: number;   // 바다 셀 뿅뿅 리롤 타이머
  interval: number;
}

function easeOutBack(t: number): number {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
}

export class CoinGlobeAsset {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private animId?: number;
  private lastTime = 0;
  private scrollU = 0;

  private earthData?: Uint8ClampedArray;
  private earthW = 0;
  private earthH = 0;

  private cx = 0;
  private cy = 0;
  private radius = 0;
  private cellSize = 0;
  private cells: Cell[] = [];

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('No 2D context');
    this.ctx = ctx;

    this.loadEarthMask();
    window.addEventListener('resize', this.resize);
    this.resize();
    this.animId = requestAnimationFrame(this.animate);
  }

  private loadEarthMask() {
    const img = new Image();
    img.src = '/earth-mask.jpg';
    img.onload = () => {
      const off = document.createElement('canvas');
      off.width  = img.naturalWidth;
      off.height = img.naturalHeight;
      const octx = off.getContext('2d')!;
      octx.drawImage(img, 0, 0);
      const data = octx.getImageData(0, 0, off.width, off.height);
      this.earthData = data.data;
      this.earthW = off.width;
      this.earthH = off.height;
    };
  }

  private resize = () => {
    const w   = window.innerWidth;
    const h   = window.innerHeight;
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width  = Math.round(w * dpr);
    this.canvas.height = Math.round(h * dpr);
    this.canvas.style.width  = `${w}px`;
    this.canvas.style.height = `${h}px`;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.cx     = w / 2;
    this.cy     = h / 2;
    this.radius = Math.min(w, h) * 0.42;
    this.buildGrid();
  };

  // 스태거드(hex) 그리드: 디스크 내부에 촘촘하게
  private buildGrid() {
    const COLS = 42; // 지름 기준 코인 개수
    const s    = (this.radius * 2) / COLS;
    this.cellSize = s;
    const rowH = s * 0.885; // hex packing 세로 간격

    this.cells = [];
    const rows = Math.ceil((this.radius * 2) / rowH);
    for (let r = 0; r <= rows; r++) {
      const y      = -this.radius + r * rowH;
      const offset = r % 2 === 0 ? 0 : s / 2;
      for (let c = -1; c <= COLS; c++) {
        const x = -this.radius + c * s + offset + s / 2;
        // 코인이 디스크 원 안에 온전히 들어오는 셀만
        if (Math.hypot(x, y) > this.radius - s * 0.35) continue;
        this.cells.push({
          x, y,
          isLand: false,
          anim: 1,
          seedA: Math.random(),
          seedB: Math.random(),
          seedC: Math.random(),
          timer: Math.random() * 3,
          interval: 1.2 + Math.random() * 3.5,
        });
      }
    }
  }

  private sampleLand(u: number, v: number): boolean {
    if (!this.earthData) return false;
    const px  = Math.min(Math.floor(((u % 1 + 1) % 1) * this.earthW), this.earthW - 1);
    const py  = Math.min(Math.floor(Math.max(0, Math.min(0.999, v)) * this.earthH), this.earthH - 1);
    const idx = (py * this.earthW + px) * 4;
    return (this.earthData[idx] ?? 255) < 128;
  }

  private animate = (now: number) => {
    const dt = Math.min((now - this.lastTime) / 1000, 0.05);
    this.lastTime = now;
    this.scrollU = (this.scrollU + SCROLL_SPEED * dt) % 1;

    const { ctx } = this;
    const w = window.innerWidth;
    const h = window.innerHeight;

    // 배경
    ctx.globalAlpha = 1;
    ctx.fillStyle = BG_COLOR;
    ctx.fillRect(0, 0, w, h);

    const s     = this.cellSize;
    const coinFont = Math.round(s * 0.52);
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `700 ${coinFont}px 'Pretendard', sans-serif`;

    // 디스크: 지도 가로폭 = 디스크 지름의 2배 (equirect 2:1, 세로 = 지름)
    const mapW = this.radius * 4;
    const mapH = this.radius * 2;

    for (const cell of this.cells) {
      const u = (cell.x / mapW) + 0.5 + this.scrollU;
      const v = (cell.y / mapH) + 0.5;
      const land = this.sampleLand(u, v);

      if (land !== cell.isLand) {
        cell.isLand = land;
        cell.anim   = 0;
        // 상태가 바뀔 때 스타일 재추첨
        cell.seedA = Math.random();
        cell.seedB = Math.random();
        cell.seedC = Math.random();
      }

      // 바다 셀: 주기적으로 스타일 리롤 + 뿅 하고 다시 등장
      if (!cell.isLand) {
        cell.timer += dt;
        if (cell.timer >= cell.interval) {
          cell.timer    = 0;
          cell.interval = 1.2 + Math.random() * 3.5;
          cell.seedB    = Math.random();
          cell.seedC    = Math.random();
          cell.anim     = 0;
        }
      }

      cell.anim = Math.min(1, cell.anim + dt * 3.2);

      const px = this.cx + cell.x;
      const py = this.cy + cell.y;
      const pop = easeOutBack(cell.anim);

      if (cell.isLand) {
        // ── 코인 ──
        const coinR = s * 0.46 * (0.9 + cell.seedA * 0.18) * pop;
        ctx.fillStyle = COIN_COLOR;
        ctx.beginPath();
        ctx.arc(px, py, Math.max(0.5, coinR), 0, Math.PI * 2);
        ctx.fill();

        if (cell.seedB < 0.12) {
          // 일부는 가운데 점만 (블루)
          ctx.fillStyle = BG_COLOR;
          ctx.beginPath();
          ctx.arc(px, py, coinR * 0.18, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // £ 기호 (배경색으로 펀칭)
          ctx.fillStyle = BG_COLOR;
          ctx.save();
          ctx.translate(px, py);
          ctx.scale(pop, pop);
          ctx.fillText(GLYPH, 0, s * 0.02);
          ctx.restore();
        }
      } else {
        // ── 바다: 작은 링/점, 일부 셀은 빈칸 ──
        if (cell.seedB < 0.42) {
          const ringR = s * (0.16 + cell.seedC * 0.26) * pop;
          ctx.strokeStyle = COIN_COLOR;
          ctx.lineWidth   = Math.max(1.2, s * 0.075);
          ctx.beginPath();
          ctx.arc(px, py, Math.max(0.5, ringR), 0, Math.PI * 2);
          ctx.stroke();
          if (cell.seedC > 0.72) {
            // 링 안에 점
            ctx.fillStyle = COIN_COLOR;
            ctx.beginPath();
            ctx.arc(px, py, ringR * 0.34, 0, Math.PI * 2);
            ctx.fill();
          }
        } else if (cell.seedB < 0.58) {
          const dotR = s * 0.09 * pop;
          ctx.fillStyle = COIN_COLOR;
          ctx.beginPath();
          ctx.arc(px, py, Math.max(0.5, dotR), 0, Math.PI * 2);
          ctx.fill();
        }
        // 나머지는 빈칸
      }
    }

    this.animId = requestAnimationFrame(this.animate);
  };

  destroy() {
    window.removeEventListener('resize', this.resize);
    if (this.animId !== undefined) cancelAnimationFrame(this.animId);
  }
}
