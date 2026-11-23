import { hairlineMapRegions } from '../../data/hairlineMapRegions';

type Point = { x: number; y: number };

type LiveRegion = {
  id: string;
  cx: number;
  cy: number;
  phase: number;
  rgb: readonly [number, number, number];
  pts: readonly (readonly [number, number])[];
  currentLift: number;
  screenPoly: Point[];
  basePoly: Point[];
};

/** Same hover strength as the standalone figure. */
const INTENSITY = 0.55;
const SOURCE_HEIGHT = 537;

const tokens = {
  hi: '#2563eb',
  edge: '#1d4ed8',
  lo: '#cbd5e1',
  stroke: 1.5,
};

function pointInPolygon(px: number, py: number, poly: Point[]) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const current = poly[i];
    const previous = poly[j];
    if (!current || !previous) continue;
    const intersect =
      current.y > py !== previous.y > py &&
      px <
        ((previous.x - current.x) * (py - current.y)) /
          (previous.y - current.y || 1e-9) +
          current.x;
    if (intersect) inside = !inside;
  }
  return inside;
}

function regionFill(rgb: readonly [number, number, number], active: boolean) {
  let [r, g, b] = rgb;
  if (active) {
    r = Math.max(45, r - 22);
    g = Math.max(95, g - 14);
    b = Math.min(255, b + 8);
  }
  return `rgb(${r}, ${g}, ${b})`;
}

/** Plays the territory-map figure. Returns a cleanup. */
export function mountTerritoryMap(
  stage: HTMLElement,
  canvas: HTMLCanvasElement
) {
  const context = canvas.getContext('2d');
  if (!context) return () => {};
  const ctx = context;

  const regions: LiveRegion[] = hairlineMapRegions.map(region => ({
    id: region.id,
    cx: region.cx,
    cy: region.cy,
    phase: region.phase,
    rgb: [region.rgb[0], region.rgb[1], region.rgb[2]],
    pts: region.pts,
    currentLift: 0,
    screenPoly: [],
    basePoly: [],
  }));

  const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  let reduced = motionQuery.matches;
  let playing = !reduced;
  let pointerActive = false;
  const pointer = { x: -9999, y: -9999 };
  let focusedIndex = -1;
  let time = 0;
  let lastTimestamp = 0;
  let frame = 0;
  let visible = false;

  const resize = () => {
    const rect = stage.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.max(1, Math.floor(rect.width * dpr));
    canvas.height = Math.max(1, Math.floor(rect.height * dpr));
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  const drawGrid = (width: number, height: number) => {
    ctx.save();
    ctx.strokeStyle = tokens.lo;
    ctx.globalAlpha = 0.4;
    ctx.lineWidth = 0.75;
    ctx.setLineDash([2, 4]);
    const step = Math.max(28, Math.round(width / 24));
    for (let x = step; x < width; x += step) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = step; y < height; y += step) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
    ctx.restore();
  };

  const trace = (poly: Point[]) => {
    ctx.beginPath();
    poly.forEach((point, index) => {
      if (index === 0) ctx.moveTo(point.x, point.y);
      else ctx.lineTo(point.x, point.y);
    });
    ctx.closePath();
  };

  const render = (timestamp: number) => {
    if (!lastTimestamp) lastTimestamp = timestamp;
    const dt = Math.min(0.05, (timestamp - lastTimestamp) / 1000);
    lastTimestamp = timestamp;

    const rect = stage.getBoundingClientRect();
    const { width, height } = rect;
    if (width < 1 || height < 1) return;

    const focused = focusedIndex >= 0 ? regions[focusedIndex] : null;
    const userInteracting = pointerActive || focused != null;
    if (playing && !reduced && !userInteracting) time += dt * 1.75;

    let hovered: LiveRegion | null = null;
    if (pointerActive) {
      const hitOrder = [...regions].sort(
        (a, b) => b.cy + b.currentLift * 0.01 - (a.cy + a.currentLift * 0.01)
      );
      for (const region of hitOrder) {
        if (
          region.screenPoly.length > 0 &&
          pointInPolygon(pointer.x, pointer.y, region.screenPoly)
        ) {
          hovered = region;
          break;
        }
      }
    }

    const active = hovered ?? focused ?? null;
    const scale = height / SOURCE_HEIGHT;
    const maxWavePx = (4 + INTENSITY * 18) * scale;
    const activeBoostPx = (10 + INTENSITY * 24) * scale;

    for (const region of regions) {
      const rawWave = (Math.sin(time - region.phase * 1.1) + 1) * 0.5;
      const smoothWave = rawWave * rawWave * (3 - 2 * rawWave);

      let target = reduced ? 0 : smoothWave * maxWavePx;
      if (active && active.id === region.id) {
        target = Math.max(target, activeBoostPx);
      }
      const stiffness = 1 - Math.exp(-11 * dt);
      region.currentLift += (target - region.currentLift) * stiffness;
      region.basePoly = region.pts.map(([nx, ny]) => ({
        x: nx * width,
        y: ny * height,
      }));
      region.screenPoly = region.pts.map(([nx, ny]) => ({
        x: nx * width,
        y: ny * height - region.currentLift,
      }));
    }

    const highlighted = active;

    ctx.clearRect(0, 0, width, height);
    drawGrid(width, height);

    const order = [...regions].sort((a, b) => {
      const aActive = highlighted?.id === a.id ? 1 : 0;
      const bActive = highlighted?.id === b.id ? 1 : 0;
      if (aActive !== bActive) return aActive - bActive;
      return a.cy - a.currentLift * 0.002 - (b.cy - b.currentLift * 0.002);
    });

    for (const region of order) {
      if (region.currentLift <= 0.8) continue;
      ctx.save();
      trace(region.basePoly);
      ctx.fillStyle = 'rgba(29, 78, 216, 0.08)';
      ctx.fill();
      ctx.strokeStyle = tokens.lo;
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 2]);
      ctx.stroke();
      ctx.restore();
    }

    for (const region of order) {
      const isActive = highlighted?.id === region.id;
      ctx.save();
      if (region.currentLift > 0.8) {
        ctx.shadowColor = 'rgba(15, 23, 42, 0.18)';
        ctx.shadowBlur = 4 + region.currentLift * 0.7;
        ctx.shadowOffsetY = Math.max(2, region.currentLift * 0.45);
      }
      trace(region.screenPoly);
      ctx.fillStyle = regionFill(region.rgb, isActive);
      ctx.fill();
      ctx.shadowColor = 'transparent';
      ctx.strokeStyle = isActive ? tokens.hi : tokens.edge;
      ctx.lineWidth = isActive ? tokens.stroke * 1.55 : tokens.stroke * 1.15;
      ctx.lineJoin = 'round';
      ctx.stroke();
      ctx.restore();
    }
  };

  const loop = (timestamp: number) => {
    frame = requestAnimationFrame(loop);
    if (visible) render(timestamp);
  };

  const onPointerMove = (event: PointerEvent) => {
    const rect = stage.getBoundingClientRect();
    pointer.x = event.clientX - rect.left;
    pointer.y = event.clientY - rect.top;
    pointerActive = true;
  };

  const onPointerLeave = () => {
    pointerActive = false;
    pointer.x = -9999;
    pointer.y = -9999;
  };

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      event.preventDefault();
      focusedIndex = (focusedIndex + 1) % regions.length;
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      event.preventDefault();
      focusedIndex = (focusedIndex - 1 + regions.length) % regions.length;
    } else if (event.key === 'Escape') {
      focusedIndex = -1;
    }
  };

  const onBlur = () => {
    focusedIndex = -1;
  };

  const onMotionChange = () => {
    reduced = motionQuery.matches;
    if (reduced) playing = false;
  };

  const resizeObserver = new ResizeObserver(() => {
    resize();
    if (visible) render(performance.now());
  });
  resizeObserver.observe(stage);
  resize();

  const intersection = new IntersectionObserver(([entry]) => {
    visible = Boolean(entry?.isIntersecting);
    if (!visible) return;
    lastTimestamp = 0;
    render(performance.now());
  });
  intersection.observe(stage);

  stage.addEventListener('pointermove', onPointerMove);
  stage.addEventListener('pointerleave', onPointerLeave);
  stage.addEventListener('keydown', onKeyDown);
  stage.addEventListener('blur', onBlur);
  motionQuery.addEventListener('change', onMotionChange);
  frame = requestAnimationFrame(loop);

  return () => {
    cancelAnimationFrame(frame);
    resizeObserver.disconnect();
    intersection.disconnect();
    stage.removeEventListener('pointermove', onPointerMove);
    stage.removeEventListener('pointerleave', onPointerLeave);
    stage.removeEventListener('keydown', onKeyDown);
    stage.removeEventListener('blur', onBlur);
    motionQuery.removeEventListener('change', onMotionChange);
  };
}
