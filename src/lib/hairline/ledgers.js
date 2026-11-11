/**
 * Ledgers: three municipal books on a public counter. The middle one sits
 * ajar at rest. The book under the pointer opens and its pages fan; its
 * neighbours part, staggered outwards. The slider is how far the book opens.
 */
import HL from './kernel.js';

const {
  Cam,
  facing,
  fit,
  hull,
  open,
  poly,
  proj,
  rad,
  ringAt,
  run,
  seg,
  tdone,
  tset,
  tval,
  tween,
  disposer,
  mk,
  place,
  pointer,
  put,
  register,
  rings,
  solid,
} = HL;

const N = 3,
  W = 46,
  D = 58,
  T = 9,
  CX = [-60, -2, 56];
const REST = [6, 18, 6],
  PART = 12;
const X0 = -90,
  X1 = 90,
  Y0 = -18,
  Y1 = 72,
  WH = 7,
  YS = Y0 + 10;

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  let openDeg = value;
  const C = Cam(45, 0.5, 1.78);
  fit(
    C,
    [
      [X0, Y0, 0],
      [X1, Y1, 0],
      [X1, Y0, 0],
      [X0, Y1, 0],
      [X0, Y0, WH],
      [CX[0] - PART, YS, D + 8],
      [CX[2] + PART, YS, D + 8],
      [0, YS + D, WH + T],
    ],
    200,
    166
  );
  const P = proj(C),
    front = facing(C);
  const g = mk('g', {}, svg);

  const [pr, pi] = rings(X0, Y0, X1, Y1, 5, 1.6);
  put(solid(g), {
    sil: poly(hull(ringAt(P, pr, 0).concat(ringAt(P, pr, WH)))),
    crease: open(ringAt(P, run(pi, front), WH)),
  });

  const books = [];
  for (let i = 0; i < N; i++) {
    const grp = mk('g', {}, g);
    const punch = [];
    for (let k = 0; k < 3; k++)
      punch.push(
        mk('circle', { r: 1.2, class: 'dot ' + (k === i ? 'm' : 'off') }, grp)
      );
    books.push({
      i,
      bot: mk('path', { class: 'sil' }, grp),
      pages: mk('path', { class: 'sil' }, grp),
      top: mk('path', { class: 'sil' }, grp),
      spine: mk('path', { class: 'nf' }, grp),
      rules: mk('path', { class: 'nf lo' }, grp),
      punch,
      o: tween(REST[i]),
      s: tween(0),
      drawn: NaN,
    });
  }

  /** Flat cover on the counter, and a leaf hinged at the far spine, raised th degrees. */
  function pose(i, th, sx) {
    const x0 = CX[i] + sx - W / 2,
      x1 = CX[i] + sx + W / 2;
    const s = Math.sin(rad(th)),
      c = Math.cos(rad(th));
    const flat = (u, v, z) => P(u, YS + v, WH + z);
    const leaf = (u, v, z) => P(u, YS + v * c, WH + z + v * s);
    const plate = (q, z0, z1, u0, u1, v0, v1) =>
      poly(
        hull([
          q(u0, v0, z0),
          q(u1, v0, z0),
          q(u1, v0, z1),
          q(u0, v0, z1),
          q(u0, v1, z0),
          q(u1, v1, z0),
          q(u1, v1, z1),
          q(u0, v1, z1),
        ])
      );
    const rules = [0.3, 0.44, 0.58, 0.72]
      .map(f => {
        const v = 3 + (D - 6) * f;
        return seg(leaf(x0 + 6, v, T - 2.2), leaf(x1 - 6, v, T - 2.2));
      })
      .join('');
    const punch = [0, 1, 2].map(k => flat(x0 + 10 + k * 8, D - 7, 1.1));
    return {
      bot: plate(flat, 0, 1.3, x0, x1, 0, D),
      pages: plate(leaf, 1.5, T - 2.4, x0 + 2.2, x1 - 2.2, 2, D - 2),
      top: plate(leaf, T - 1.4, T, x0, x1, 0, D),
      spine: poly([
        flat(x0, 0, 0),
        flat(x1, 0, 0),
        flat(x1, 0, T),
        flat(x0, 0, T),
      ]),
      rules,
      punch,
    };
  }

  function draw(bk, now) {
    const th = tval(bk.o, now),
      sx = tval(bk.s, now),
      key = th * 1000 + sx * 10;
    if (key === bk.drawn) return;
    bk.drawn = key;
    const q = pose(bk.i, th, sx);
    bk.bot.setAttribute('d', q.bot);
    bk.pages.setAttribute('d', q.pages);
    bk.top.setAttribute('d', q.top);
    bk.spine.setAttribute('d', q.spine);
    bk.rules.setAttribute('d', q.rules);
    bk.punch.forEach((el, k) => place(el, q.punch[k]));
  }

  const B = register(stage, (_dt, now) => {
    let moving = false;
    for (const bk of books) {
      draw(bk, now);
      if (!tdone(bk.o, now) || !tdone(bk.s, now)) moving = true;
    }
    return moving;
  });
  bag.add(B.unregister);

  const tops = CX.map((x, i) => {
    const th = REST[i],
      s = Math.sin(rad(th)),
      c = Math.cos(rad(th));
    return P(x, YS + D * 0.45 * c, WH + T / 2 + D * 0.45 * s);
  });
  const yMin = Math.min(...tops.map(p => p[1])) - 22;
  const yMax = Math.max(...CX.map(x => P(x, YS + D, WH)[1])) + 16;
  function hit([x, y]) {
    if (y < yMin || y > yMax) return -1;
    let best = 0,
      bd = 1e9;
    tops.forEach((p, i) => {
      const d = Math.abs(p[0] - x) + Math.abs(p[1] - y) * 0.3;
      if (d < bd) {
        bd = d;
        best = i;
      }
    });
    return best;
  }

  let act = -1;
  read.textContent = 'rest';
  function setActive(a) {
    if (a === act) return;
    const now = performance.now(),
      from = a < 0 ? act : a;
    act = a;
    books.forEach((bk, i) => {
      const dist = Math.abs(i - from);
      const th =
        a < 0 ? REST[i] : i === a ? openDeg : Math.max(4, REST[i] * 0.35);
      const sx =
        a < 0 || i === a ? 0 : (i < a ? -1 : 1) * PART * (1.2 - dist * 0.35);
      tset(bk.o, th, now, dist * 48);
      tset(bk.s, sx, now, dist * 48);
      const on = i === a,
        restMark = a < 0 && i === 1;
      bk.top.classList.toggle('hi', on || restMark);
      bk.pages.classList.toggle('hi', on);
      bk.spine.classList.toggle('hi', on || restMark);
      bk.punch[i].setAttribute('class', on || restMark ? 'dot' : 'dot m');
    });
    read.textContent = a < 0 ? 'rest' : 'book ' + (a + 1);
    B.wake();
  }

  books[1].top.classList.add('hi');
  books[1].spine.classList.add('hi');
  books[1].punch[1].setAttribute('class', 'dot');

  bag.add(
    pointer(stage, { move: p => setActive(hit(p)), leave: () => setActive(-1) })
  );
  bag.add(() => svg.replaceChildren());
  return {
    set: v => {
      openDeg = v;
    },
    destroy: bag.dispose,
  };
}

const figure = {
  name: 'ledgers',
  means:
    'Three ledgers on a public counter: the one under the pointer opens, and its neighbours part in turn.',
  rules: [1, 2, 5, 8],
  range: [42, 62, 82],
  tour: [[136, 143], [210, 170], [282, 216], null],
  mount,
};

export default figure;
export { HL };
