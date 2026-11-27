/* MILKeX — sfondo vivo, disegnato in tempo reale.
   Tema chiaro (mondo quantistico): ogni macchia di mucca è una nuvola di particelle. Ogni tanto la nuvola
   "collassa" su un orbitale dell'idrogeno: le particelle si dispongono secondo |ψ_nlm|², calcolato qui,
   colorate per segno di ψ (arancione +, viola −), e poi tornano macchia. Due macchie sono in entanglement:
   i loro segni sono sempre opposti.
   Tema scuro (spazio): stelle che scintillano e, davanti, le macchie come oggetti stellari con un alone. */
(() => {
  const host = document.querySelector("main") || (document.querySelector(".wrap") ? document.body : null);
  // (MILKeX Mobile: il <main id="mxhost"> fisso dietro all'app)
  if (!host) return;
  const cv = document.createElement("canvas");
  cv.className = "milkbg";
  cv.setAttribute("aria-hidden", "true");
  host.prepend(cv);
  const ctx = cv.getContext("2d");
  // animazioni spente (impostazioni) o movimento ridotto (sistema): sfondo fermo, disegnato una volta sola
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let still = reduced || document.documentElement.classList.contains("noanim");
  const dark = () => document.documentElement.dataset.theme === "dark";

  // ---------- fisica: ψ_nlm nel piano xz ----------
  function laguerre(k, a, x) {
    let L0 = 1, L1 = 1 + a - x;
    if (k === 0) return L0;
    for (let i = 1; i < k; i++) { const L2 = ((2 * i + 1 + a - x) * L1 - (i + a) * L0) / (i + 1); L0 = L1; L1 = L2; }
    return L1;
  }
  function legendre(l, m, x) {
    let pmm = 1; const s = Math.sqrt(Math.max(0, 1 - x * x));
    for (let i = 1; i <= m; i++) pmm *= -(2 * i - 1) * s;
    if (l === m) return pmm;
    let pm1 = x * (2 * m + 1) * pmm;
    if (l === m + 1) return pm1;
    for (let ll = m + 2; ll <= l; ll++) { const p = ((2 * ll - 1) * x * pm1 - (ll + m - 1) * pmm) / (ll - m); pmm = pm1; pm1 = p; }
    return pm1;
  }
  const psi = (n, l, m, x, z) => {           // ψ reale nel piano xz (φ = 0 o π)
    const r = Math.hypot(x, z) + 1e-9, rho = 2 * r / n;
    const v = Math.exp(-rho / 2) * rho ** l * laguerre(n - l - 1, 2 * l + 1, rho) * legendre(l, m, z / r);
    return x < 0 && m % 2 ? -v : v;
  };
  let seed = 11;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  // campiona N punti dalla densità |ψ|² (metodo del rigetto), in coordinate [-1, 1]
  function sampleOrbital([n, l, m], N) {
    const R = n * n * 2.2 + 3;
    let mx = 0;
    for (let i = 0; i < 4000; i++) { const x = (rnd() * 2 - 1) * R, z = (rnd() * 2 - 1) * R; mx = Math.max(mx, psi(n, l, m, x, z) ** 2); }
    const pts = [];
    while (pts.length < N) {
      const x = (rnd() * 2 - 1) * R, z = (rnd() * 2 - 1) * R, v = psi(n, l, m, x, z);
      if (rnd() * mx < v * v) pts.push([x / R, z / R, v >= 0 ? 1 : -1]);
    }
    return pts;
  }

  // ---------- macchie (stesse forme del logo e della mucca) ----------
  const SHAPES = ["M70 60c30-24 82-14 96 14s-6 62-40 70-70 4-80-24 0-42 24-60z", "M360 120c20-18 60-14 72 6s0 48-26 54-50-2-56-20 0-26 10-40z",
    "M210 330c36-20 94-8 104 26s-26 66-66 66-66-20-66-48 6-30 28-44z", "M430 400c14-10 38-6 42 8s-6 26-22 26-26-12-24-20 0-8 4-14z"];
  const BOX = [[46, 46, 120, 84], [354, 114, 82, 66], [182, 316, 132, 106], [426, 396, 48, 38]];
  const P2D = SHAPES.map(d => new Path2D(d));
  const probe = document.createElement("canvas").getContext("2d");
  function sampleSpot(shape, N) {           // punti uniformi dentro la macchia, in [-1, 1]
    const [bx, by, bw, bh] = BOX[shape], s = Math.max(bw, bh) / 2, pts = [];
    while (pts.length < N) {
      const x = bx + rnd() * bw, y = by + rnd() * bh;
      if (probe.isPointInPath(P2D[shape], x, y)) pts.push([(x - bx - bw / 2) / s, (y - by - bh / 2) / s]);
    }
    return pts;
  }
  const VIO = [123, 79, 214], ORA = [240, 136, 74];
  const STATES = [[2, 1, 0], [3, 2, 0], [3, 2, 1], [4, 1, 0], [3, 1, 0], [4, 2, 1], [4, 3, 0]];
  // x, y (frazioni), dimensione, forma, colore della macchia, stato, fase
  const SPOTS = [
    [.16, .2, 170, 0, VIO, 0, 0], [.5, .12, 130, 1, ORA, 1, .35], [.85, .22, 190, 2, VIO, 2, .7], [.4, .5, 200, 2, ORA, 3, .15],
    [.7, .55, 150, 0, VIO, 4, .55], [.04, .5, 130, 3, VIO, 5, .85], [.58, .9, 180, 1, ORA, 6, .45], [.95, .7, 150, 0, ORA, 4, .9]];
  const PAIR = [1, 6];
  const N = 620;
  // ogni particella: posizione nella macchia, posizione nell'orbitale, segno di ψ, ritardo, rumore
  const CLOUDS = SPOTS.map(([, , , shape, , st], i) => {
    const a = sampleSpot(shape, N), b = sampleOrbital(STATES[st], N);
    // abbina per angolo, così le particelle scorrono senza incrociarsi
    const ang = p => Math.atan2(p[1], p[0]);
    a.sort((p, q) => ang(p) - ang(q)); b.sort((p, q) => ang(p) - ang(q));
    return a.map((p, k) => ({ sx: p[0], sy: p[1], ox: b[k][0], oy: b[k][1], sg: b[k][2] * (i === PAIR[1] ? -1 : 1),
      d: Math.hypot(p[0], p[1]) * .35 + rnd() * .15, ph: rnd() * 6.28, f: .6 + rnd() * .9 }));
  });

  // ---------- stelle ----------
  let stars = [];
  function makeStars(w, h) {
    seed = 7;
    const cols = ["#ffffff", "#fff4e6", "#ffd9b8", "#d9ccff", "#c4a8ff", "#bcd4ff", "#ffb889"];
    stars = [];
    for (let i = 0, n = Math.round(w * h / 2400); i < n; i++) {
      const big = rnd() < .05, mid = !big && rnd() < .22;
      stars.push({ x: rnd() * w, y: rnd() * h, r: big ? 1.3 + rnd() : mid ? .8 + rnd() * .6 : .3 + rnd() * .45,
        c: cols[Math.floor(rnd() * cols.length)], a: big ? .95 : mid ? .55 + rnd() * .4 : .2 + rnd() * .4,
        big, cross: big && rnd() < .5, tw: rnd() * 6.28, sp: .4 + rnd() * 1.2 });
    }
  }

  let W = 0, H = 0, DPR = 1;
  let SPRITES = {};
  const SMALL = () => W < 700;                    // telefono: home più sgombra
  const VIS = () => SMALL() ? SPOTS.filter((_, i) => i % 2 === 0) : SPOTS;
  function size() {
    DPR = Math.min(2, devicePixelRatio || 1);
    const L = host.getBoundingClientRect().left; cv.style.left = L + "px"; cv.style.width = (innerWidth - L) + "px";
    W = cv.clientWidth; H = cv.clientHeight;
    cv.width = W * DPR; cv.height = H * DPR;
    makeStars(W, H); SPRITES = {};
    starLayer = document.createElement("canvas"); starLayer.width = W * DPR; starLayer.height = H * DPR;
    const g = starLayer.getContext("2d"); g.scale(DPR, DPR);
    for (const s of stars) if (!s.big) { g.globalAlpha = s.a * .85; g.fillStyle = s.c; g.beginPath(); g.arc(s.x, s.y, s.r, 0, 6.283); g.fill(); }
    bigStars = stars.filter(s => s.big);
  }
  let starLayer = null, bigStars = [];
  const ease = u => u <= 0 ? 0 : u >= 1 ? 1 : u * u * u * (u * (u * 6 - 15) + 10);   // smootherstep
  const CYCLE = 26000;          // macchia 9 s → collasso 4 s → orbitale 9 s → ritorno 4 s
  function morph(t, ph) {       // 0 = macchia, 1 = orbitale (prima dei ritardi per particella)
    const u = (((t / CYCLE + ph) % 1) + 1) % 1;
    if (u < .35) return 0; if (u < .5) return (u - .35) / .15; if (u < .85) return 1; return 1 - (u - .85) / .15;
  }

  // ---------- atomo in basso a sinistra (tema chiaro), fatto di particelle come gli orbitali ----------
  // nucleo: nuvola di punti arancioni e viola; orbite: anelli di puntini che tremolano; elettroni: piccole
  // nuvole di probabilità che girano, con una scia che si sgretola
  const ATOM = (() => {
    const g = () => (rnd() + rnd() + rnd() - 1.5) / 1.5;
    const nuc = Array.from({ length: 260 }, () => ({ x: g() * .2, y: g() * .2, c: rnd() < .55 ? 0 : 1, ph: rnd() * 6.28 }));
    const rings = [0, 1, 2].map(() => Array.from({ length: 240 }, () => ({ a: rnd() * 6.283, d: g() * .035, ph: rnd() * 6.28 })));
    const cloud = Array.from({ length: 34 }, () => ({ x: g() * .05, y: g() * .05, ph: rnd() * 6.28 }));
    return { nuc, rings, cloud };
  })();
  function drawAtom(t, fx = .17, fy = .8, size = 1, t0 = 0) {
    const cx = W * fx, cy = H * fy, R = Math.min(W, H) * .13 * size, k = still ? 0 : t + t0;
    const orbits = [0, Math.PI / 3, -Math.PI / 3].map((rot, i) => ({ rot: rot + k * .00006, sp: [.0016, .0012, .0019][i], ph: i * 2.1 }));
    const P = (o, a, d = 0) => {
      const x = Math.cos(a) * R * (1 + d), y = Math.sin(a) * R * .32 * (1 + d), c = Math.cos(o.rot), s = Math.sin(o.rot);
      return [cx + x * c - y * s, cy + x * s + y * c, Math.sin(a)];
    };
    const B = {};                                       // particelle raggruppate per colore e opacità
    const put = (key, x, y, s) => (B[key] || (B[key] = [])).push(x, y, s);
    orbits.forEach((o, i) => {
      for (const p of ATOM.rings[i]) {                  // anello di puntini
        const [x, y] = P(o, p.a + Math.sin(k * .0007 + p.ph) * .02, p.d);
        put((i ? "v" : "o") + "4", x + Math.sin(k * .002 + p.ph) * .7, y + Math.cos(k * .0023 + p.ph) * .7, 1.7);
      }
      const a = k * o.sp + o.ph, [ex, ey, z] = P(o, a);
      for (let j = 1; j <= 14; j++) {                   // scia che si sgretola
        const [tx, ty] = P(o, a - j * .045);
        for (let q = 0; q < 3; q++) put((i ? "v" : "o") + (j < 5 ? 6 : j < 10 ? 4 : 2), tx + (rnd() - .5) * j * .9, ty + (rnd() - .5) * j * .9, 1.6);
      }
      for (const c of ATOM.cloud) put((i ? "v" : "o") + (z > 0 ? 9 : 6), ex + c.x * R + Math.sin(k * .006 + c.ph) * 1.2, ey + c.y * R + Math.cos(k * .007 + c.ph) * 1.2, 1.9);
    });
    for (const n of ATOM.nuc) {                         // nucleo che vibra
      const j = 1 + .08 * Math.sin(k * .003 + n.ph);
      put((n.c ? "v" : "o") + 8, cx + n.x * R * j + Math.sin(k * .005 + n.ph) * .5, cy + n.y * R * j + Math.cos(k * .006 + n.ph) * .5, 2);
    }
    for (const key in B) {
      const a = B[key], col = key[0] === "o" ? "240,136,74" : "123,79,214";
      ctx.fillStyle = `rgba(${col},${+key.slice(1) / 10})`;
      ctx.beginPath();
      for (let i = 0; i < a.length; i += 3) ctx.rect(a[i] - a[i + 2] / 2, a[i + 1] - a[i + 2] / 2, a[i + 2], a[i + 2]);
      ctx.fill();
    }
  }
  const BUCKET = {};
  function drawQuantum(t) {
    // filo tratteggiato dell'entanglement
    const [a, b] = PAIR.map(i => [SPOTS[i][0] * W, SPOTS[i][1] * H]);
    ctx.save(); ctx.globalAlpha = .12; ctx.strokeStyle = "#7b4fd6"; ctx.setLineDash([2, 8]); ctx.lineWidth = 1.2;
    ctx.lineDashOffset = -t * .01;
    ctx.beginPath(); ctx.moveTo(...a); ctx.bezierCurveTo(a[0] + 180, a[1] + 140, b[0] - 180, b[1] - 140, ...b); ctx.stroke(); ctx.restore();
    for (const k in BUCKET) BUCKET[k].length = 0;
    SPOTS.forEach(([fx, fy, sz, , col, , ph], i) => {
      if (SMALL() && i % 2) return;
      sz *= SMALL() ? .62 : 1;
      const cx = fx * W, cy = fy * H, R = sz / 2, m0 = still ? 0 : morph(t, ph);
      const rot = t * .00004 * (i % 2 ? 1 : -1) + ph * 6;
      const cs = Math.cos(rot), sn = Math.sin(rot);
      for (const p of CLOUDS[i]) {
        // ogni particella parte con un piccolo ritardo: il collasso scorre come un'onda dal centro
        const k = ease(m0 * 1.5 - p.d);
        const ox = p.ox * cs - p.oy * sn, oy = p.ox * sn + p.oy * cs;
        const x = cx + (p.sx + (ox * 1.25 - p.sx) * k) * R + (1 + 2.2 * k) * Math.sin(t * .0011 * p.f + p.ph);
        const y = cy + (p.sy + (oy * 1.25 - p.sy) * k) * R + (1 + 2 * k) * Math.cos(t * .0013 * p.f + p.ph);
        const q = Math.round(k * 7), key = (col === ORA ? 0 : 16) + (p.sg > 0 ? 0 : 8) + q;
        (BUCKET[key] || (BUCKET[key] = [])).push(x - 1, y - 1);
      }
    });
    // un solo colore per gruppo di particelle: molto più leggero
    for (const key in BUCKET) {
      const arr = BUCKET[key]; if (!arr.length) continue;
      const kk = +key, q = (kk & 7) / 7, c0 = kk & 16 ? VIO : ORA, tg = kk & 8 ? VIO : ORA;
      ctx.fillStyle = `rgba(${c0.map((v, j) => (v + (tg[j] - v) * q) | 0).join(",")},${.34 + .12 * q})`;
      ctx.beginPath(); for (let j = 0; j < arr.length; j += 2) ctx.rect(arr[j], arr[j + 1], 2.1, 2.1); ctx.fill();
    }
    drawAtom(t, SMALL() ? .2 : .17, SMALL() ? .9 : .8, SMALL() ? .8 : 1);
    if (!SMALL()) {
    // qualche atomo piccolo qua e là, negli spazi vuoti
    drawAtom(t, .96, .1, .36, 4000); drawAtom(t, .9, .45, .34, 9000); drawAtom(t, .54, .72, .4, 15000); drawAtom(t, .27, .6, .3, 21000);
    }
    // per il gatto (milk-cat.js): dove sono le macchie sullo schermo e se sono orbitali
    const L = cv.getBoundingClientRect().left;
    window.MILK_SPOTS = SPOTS.map(([fx, fy, sz, , , , ph], i) => ({ x: L + fx * W, y: fy * H, r: sz / 2 * (SMALL() ? .62 : 1), off: SMALL() && i % 2, orb: !still && morph(t, ph) > .5 }));
  }

  function drawSpace(t) {
    const MASS = []; window.MILK_MASSES = MASS; const LL = cv.getBoundingClientRect().left;   // corpi massicci per la mucca astronauta
    if (still) { comets = []; shoots = []; flares = []; }   // fermo: niente comete né stelle cadenti
    if (starLayer) { ctx.drawImage(starLayer, 0, 0, W, H); }
    for (const s of bigStars) {
      const a = s.a * (still ? 1 : .7 + .3 * Math.sin(t * .001 * s.sp + s.tw));
      ctx.globalAlpha = a; ctx.fillStyle = s.c;
      if (s.big) { ctx.shadowColor = s.c; ctx.shadowBlur = 8; }
      ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, 6.283); ctx.fill(); ctx.shadowBlur = 0;
      if (s.cross) { ctx.globalAlpha = a * .5; ctx.strokeStyle = s.c; ctx.lineWidth = .6; ctx.beginPath();
        ctx.moveTo(s.x - 7, s.y); ctx.lineTo(s.x + 7, s.y); ctx.moveTo(s.x, s.y - 7); ctx.lineTo(s.x, s.y + 7); ctx.stroke(); }
    }
    ctx.globalAlpha = 1;
    // ogni tanto una stella si accende: alone che cresce e raggi a croce, poi si spegne
    if (!still && t > nextFlare && stars.length) {
      const s = stars[Math.floor(rnd() * stars.length)];
      flares.push({ s, t0: t, dur: 1800 + rnd() * 2200, size: 10 + rnd() * 16, rot: rnd() * .8 });
      nextFlare = t + 500 + rnd() * 1300;
    }
    flares = flares.filter(f => {
      const u = (t - f.t0) / f.dur;
      if (u >= 1) return false;
      const a = Math.sin(Math.PI * u) ** 2, L = f.size * (.4 + .6 * a), { x, y, c } = f.s;
      const g = ctx.createRadialGradient(x, y, 0, x, y, L);
      g.addColorStop(0, c); g.addColorStop(.15, c); g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.save(); ctx.globalAlpha = .55 * a; ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, L, 0, 6.283); ctx.fill();
      ctx.translate(x, y); ctx.rotate(f.rot); ctx.globalAlpha = .8 * a; ctx.strokeStyle = c; ctx.lineWidth = .7;
      ctx.beginPath(); ctx.moveTo(-L * 1.4, 0); ctx.lineTo(L * 1.4, 0); ctx.moveTo(0, -L * 1.4); ctx.lineTo(0, L * 1.4); ctx.stroke();
      ctx.globalAlpha = .35 * a; ctx.rotate(.785); ctx.beginPath(); ctx.moveTo(-L * .6, 0); ctx.lineTo(L * .6, 0); ctx.moveTo(0, -L * .6); ctx.lineTo(0, L * .6); ctx.stroke();
      ctx.restore();
      return true;
    });
    // galassia a spirale lontana, che ruota piano
    drawGalaxy(t);
    // comete: fino a tre insieme, ognuna con la sua luce
    if (!still && t > nextComet && comets.length < (SMALL() ? 1 : 2)) {
      const fromLeft = rnd() < .5, y0 = (-.05 + rnd() * .6) * H;
      comets.push({ t0: t, dur: 5000 + rnd() * 3500, x0: fromLeft ? -140 : W + 140, y0, x1: fromLeft ? W + 140 : -140, y1: y0 + (.15 + rnd() * .5) * H,
        tail: 180 + rnd() * 160, hue: rnd() < .5 ? [255, 184, 137] : [196, 168, 255] });
      nextComet = t + 9000 + rnd() * 11000;
    }
    const lights = [];
    comets = comets.filter(c => {
      const u = (t - c.t0) / c.dur;
      if (u >= 1) return false;
      const L = Math.hypot(c.x1 - c.x0, c.y1 - c.y0);
      c.x = c.x0 + (c.x1 - c.x0) * u; c.y = c.y0 + (c.y1 - c.y0) * u; c.dx = (c.x1 - c.x0) / L; c.dy = (c.y1 - c.y0) / L;
      c.I = Math.sin(Math.PI * Math.min(1, u * 1.1));
      lights.push(c);
      return true;
    });
    // stelle cadenti: brevi e veloci
    if (!still && t > nextShoot) {
      const a = .35 + rnd() * .5;
      shoots.push({ t0: t, dur: 650 + rnd() * 400, x: rnd() * W, y: rnd() * H * .6, dx: Math.cos(a) * (rnd() < .5 ? 1 : -1), dy: Math.sin(a), len: 90 + rnd() * 90 });
      nextShoot = t + 1800 + rnd() * 4200;
    }
    shoots = shoots.filter(s => {
      const u = (t - s.t0) / s.dur;
      if (u >= 1) return false;
      const hx = s.x + s.dx * u * 420, hy = s.y + s.dy * u * 420, a = Math.sin(Math.PI * u);
      const g = ctx.createLinearGradient(hx, hy, hx - s.dx * s.len, hy - s.dy * s.len);
      g.addColorStop(0, `rgba(255,250,240,${.9 * a})`); g.addColorStop(1, "rgba(255,250,240,0)");
      ctx.strokeStyle = g; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(hx, hy); ctx.lineTo(hx - s.dx * s.len, hy - s.dy * s.len); ctx.stroke();
      return true;
    });

    // le macchie: oggetti stellari scuri con un alone colorato, davanti alle stelle
    SPOTS.forEach(([fx, fy, sz, shape, col, , ph], i) => {
      if (SMALL() && i % 2) return;
      sz *= SMALL() ? .55 : 1;
      const [bx, by, bw, bh] = BOX[shape], sc = sz / Math.max(bw, bh);
      const px = fx * W, py = fy * H;
      MASS.push({ x: LL + px, y: py, r: sz * .45, m: sz * sz * .9 });
      // somma delle luci delle comete: direzione e intensità
      let lx = 0, ly = 0, lit = 0, warm = [255, 214, 180];
      for (const c of lights) {
        const dx = c.x - px, dy = c.y - py, d = Math.hypot(dx, dy) || 1;
        const k = c.I * Math.max(0, 1 - d / (Math.max(W, H) * .55)) ** 1.6;
        lx += dx / d * k; ly += dy / d * k; lit += k;
        if (k > .05) warm = c.hue;
      }
      const ll = Math.hypot(lx, ly) || 1; lx /= ll; ly /= ll; lit = Math.min(1, lit);
      const glow = .75 + .25 * Math.sin(t * .0005 + ph * 6);
      const rot = Math.sin(t * .00006 + ph * 6) * .12;
      const place = c => { c.translate(px, py); c.rotate(rot); c.scale(sc, sc); c.translate(-bx - bw / 2, -by - bh / 2); };
      // senza comete vicine (quasi sempre): la macchia con il suo alone è disegnata una volta sola e poi solo copiata
      if (lit <= .01 || SMALL()) {
        const key = i + "|" + Math.round(sz) + "|" + DPR;
        let sp = SPRITES[key];
        if (!sp) {
          const M = Math.ceil(sz * .5 + 70 * sc), side = Math.ceil(sz + 2 * M);
          sp = SPRITES[key] = document.createElement("canvas"); sp.width = sp.height = Math.ceil(side * DPR); sp.side = side;
          const o = sp.getContext("2d"); o.scale(DPR, DPR); o.translate(side / 2, side / 2); o.scale(sc, sc); o.translate(-bx - bw / 2, -by - bh / 2);
          o.shadowColor = `rgba(${col},.85)`; o.shadowBlur = 46 * sc * DPR;
          const g = o.createRadialGradient(bx + bw * .54, by + bh * .54, 2, bx + bw * .52, by + bh * .52, Math.max(bw, bh) * .64);
          g.addColorStop(0, "#110c1d"); g.addColorStop(1, "#130e21");
          o.fillStyle = g; o.fill(P2D[shape]);
          o.shadowColor = "rgba(17,12,29,.95)"; o.shadowBlur = 9 * sc * DPR; o.fill(P2D[shape]); o.shadowBlur = 5 * sc * DPR; o.fill(P2D[shape]);
        }
        ctx.save(); ctx.translate(px, py); ctx.rotate(rot); ctx.globalAlpha = .82 + .18 * glow;
        ctx.drawImage(sp, -sp.side / 2, -sp.side / 2, sp.side, sp.side); ctx.restore();
        return;
      }
      ctx.save();
      place(ctx);
      // l'alone si sposta e si allunga verso la luce
      ctx.shadowColor = `rgba(${col},${Math.min(1, .85 * glow * (1 - .45 * lit) + lit * .35)})`; ctx.shadowBlur = (46 * glow + 20 * lit) * sc;
      ctx.shadowOffsetX = lx * lit * 30 * sc; ctx.shadowOffsetY = ly * lit * 30 * sc;
      // interno scuro quasi fino al bordo: resta solo un filo di luce in alto a sinistra
      const g = ctx.createRadialGradient(bx + bw * .54, by + bh * .54, 2, bx + bw * .52, by + bh * .52, Math.max(bw, bh) * .64);
      g.addColorStop(0, "#110c1d"); g.addColorStop(1, "#130e21");
      // tutta in ombra, con il bordo sfumato: il corpo scuro si fonde con il suo alone
      ctx.fillStyle = g; ctx.fill(P2D[shape]);
      // seconda passata: un'ombra scura e morbida sopra il bordo, così il passaggio verso l'alone è graduale
      ctx.shadowOffsetX = ctx.shadowOffsetY = 0; ctx.shadowColor = "rgba(17,12,29,.95)"; ctx.shadowBlur = 9 * sc;
      ctx.fill(P2D[shape]); ctx.shadowBlur = 5 * sc; ctx.fill(P2D[shape]);
      ctx.shadowBlur = 0; ctx.shadowOffsetX = ctx.shadowOffsetY = 0;
            ctx.restore();
      if (lit > .01) {
        // falce di luce che segue il contorno vero della macchia: la macchia meno sé stessa spostata
        // lontano dalla luce (terminatore), sfumata; dall'altro lato la stessa cosa in ombra
        const S = Math.ceil(sz * 1.5), D = DPR;
        if (oc.width < S * D || oc.height < S * D) { oc.width = oc.height = Math.max(oc.width, S * D); }
        const o = oc.getContext("2d");
        const crescent = (dir, depth, color, blur) => {
          o.setTransform(1, 0, 0, 1, 0, 0); o.clearRect(0, 0, oc.width, oc.height);
          o.setTransform(D, 0, 0, D, 0, 0); o.translate(S / 2 - px, S / 2 - py); place(o);
          o.filter = `blur(${blur}px)`;
          o.globalCompositeOperation = "source-over"; o.fillStyle = color; o.fill(P2D[shape]);
          o.globalCompositeOperation = "destination-out";
          // lo spostamento va dato nelle coordinate della macchia (ruotate e scalate)
          const c = Math.cos(-rot), s = Math.sin(-rot), ux = (dir[0] * c - dir[1] * s) / sc, uy = (dir[0] * s + dir[1] * c) / sc;
          o.translate(ux * depth, uy * depth); o.fillStyle = "#000"; o.fill(P2D[shape]);
          o.filter = "none"; o.globalCompositeOperation = "source-over";
          // ritaglia sulla macchia vera, così la luce non esce dal bordo
          ctx.save(); place(ctx); ctx.clip(P2D[shape]);
          ctx.setTransform(1, 0, 0, 1, 0, 0);
          ctx.drawImage(oc, 0, 0, S * D, S * D, (px - S / 2) * D, (py - S / 2) * D, S * D, S * D);
          ctx.restore();
        };
        // luce e ombra morbide, come prima, ma deformate sulle proporzioni e sulla rotazione della macchia
        ctx.save(); place(ctx); ctx.clip(P2D[shape]);
        ctx.translate(bx + bw / 2, by + bh / 2); ctx.scale(bw / 2, bh / 2);
        const cr = Math.cos(-rot), sr = Math.sin(-rot), ux = lx * cr - ly * sr, uy = lx * sr + ly * cr;
        const blob = (x, y, r, stops) => {
          const g = ctx.createRadialGradient(x, y, 0, x, y, r);
          stops.forEach(([o, c]) => g.addColorStop(o, c));
          ctx.fillStyle = g; ctx.fillRect(-2, -2, 4, 4);
        };
        // due chiazze di luce leggermente sfalsate: il bordo non è mai un cerchio
        blob(ux * .45, uy * .45, .95, [[0, `rgba(255,236,214,${.55 * lit})`], [.4, `rgba(${warm},${.26 * lit})`], [1, `rgba(${warm},0)`]]);
        blob(ux * .4 - uy * .2, uy * .4 + ux * .2, .6, [[0, `rgba(${warm},${.25 * lit})`], [1, `rgba(${warm},0)`]]);
        blob(-ux * .75, -uy * .75, 1.9, [[0, `rgba(6,3,12,${.85 * lit})`], [.55, `rgba(6,3,12,${.6 * lit})`], [1, "rgba(6,3,12,0)"]]);
        ctx.restore();
      }
    });
    // le comete, davanti a tutto
    for (const c of lights) {
      const tg = ctx.createLinearGradient(c.x, c.y, c.x - c.dx * c.tail, c.y - c.dy * c.tail);
      tg.addColorStop(0, `rgba(255,240,225,${.9 * c.I})`); tg.addColorStop(.25, `rgba(${c.hue},${.45 * c.I})`); tg.addColorStop(1, `rgba(${c.hue},0)`);
      ctx.save();
      ctx.strokeStyle = tg; ctx.lineCap = "round";
      for (const [w, a] of [[8, .2], [3, .55], [1.2, 1]]) {
        ctx.globalAlpha = a; ctx.lineWidth = w; ctx.beginPath(); ctx.moveTo(c.x, c.y); ctx.lineTo(c.x - c.dx * c.tail, c.y - c.dy * c.tail); ctx.stroke();
      }
      ctx.globalAlpha = c.I; ctx.shadowColor = `rgb(${c.hue})`; ctx.shadowBlur = 24; ctx.fillStyle = "#fff8f0";
      ctx.beginPath(); ctx.arc(c.x, c.y, 2.6, 0, 6.283); ctx.fill();
      ctx.restore();
    }
  }
  let flares = [], nextFlare = 800;
  let comets = [], nextComet = 1500, shoots = [], nextShoot = 3000;
  const oc = document.createElement("canvas");
  // galassia: punti su due bracci a spirale logaritmica
  const GAL = Array.from({ length: 420 }, (_, i) => {
    const arm = i % 2, r = Math.pow(Math.random(), .7);
    return { r, a: arm * Math.PI + r * 4.2 + (Math.random() - .5) * .5, s: .4 + Math.random() * .9, c: r < .25 ? "255,236,214" : Math.random() < .5 ? "196,168,255" : "255,184,137" };
  });
  function drawGalaxy(t) {
    const gx = W * (SMALL() ? .22 : .17), gy = H * (SMALL() ? .88 : .79), R = Math.min(W, H) * (SMALL() ? .12 : .17), sp = t * .00006;
    (window.MILK_MASSES || []).push({ x: cv.getBoundingClientRect().left + gx, y: gy, r: R * .35, m: R * R * 4 });
    // si inclina piano (precessione) e il nucleo respira
    const tilt = .42 + .08 * Math.sin(t * .00009), pulse = .85 + .15 * Math.sin(t * .0012);
    ctx.save(); ctx.translate(gx, gy); ctx.rotate(-.45 + .06 * Math.sin(t * .00007)); ctx.scale(1, tilt);
    const halo = ctx.createRadialGradient(0, 0, 0, 0, 0, R * 1.1);
    halo.addColorStop(0, `rgba(196,168,255,${.1 * pulse})`); halo.addColorStop(1, "rgba(196,168,255,0)");
    ctx.fillStyle = halo; ctx.beginPath(); ctx.arc(0, 0, R * 1.1, 0, 6.283); ctx.fill();
    const core = ctx.createRadialGradient(0, 0, 0, 0, 0, R * .45);
    core.addColorStop(0, `rgba(255,244,230,${.75 * pulse})`); core.addColorStop(.4, `rgba(255,214,180,${.3 * pulse})`); core.addColorStop(1, "rgba(255,214,180,0)");
    ctx.fillStyle = core; ctx.beginPath(); ctx.arc(0, 0, R * .45, 0, 6.283); ctx.fill();
    for (const p of GAL) {
      const a = p.a + sp / (p.r + .15);                      // rotazione differenziale: dentro più veloce
      const tw = .6 + .4 * Math.sin(t * .003 * p.s + p.a * 7);  // le stelle dei bracci scintillano
      if (!p.cs) p.cs = [0, 1, 2, 3, 4, 5].map(q => `rgba(${p.c},${((.2 + .16 * q) * (1 - p.r * .5)).toFixed(3)})`);   // colori pronti, niente stringhe nuove a ogni fotogramma
      ctx.fillStyle = p.cs[Math.round((tw - .2) / .16)] || p.cs[5];
      ctx.fillRect(Math.cos(a) * p.r * R, Math.sin(a) * p.r * R, p.s * 1.2, p.s * 1.8);
    }
    ctx.restore();
  }

  function frame(t) {
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    ctx.clearRect(0, 0, W, H);
    dark() ? drawSpace(t) : drawQuantum(t);
  }
  let last = 0;
  let drawnStill = "", cleared = false;
  function loop(t) {
    requestAnimationFrame(loop);
    const RC = document.documentElement.classList;
    if (window.MX_PLAYGROUND && !window.MX_PLAYGROUND()) {        // MILKeX Mobile fuori dai giochi: tela vuota, nessun calcolo
      if (!cleared) { ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, cv.width, cv.height); cleared = true; }
      return;
    }
    cleared = false;
    still = reduced || RC.contains("noanim") || RC.contains("bgstill") || (window.MX_PLAYGROUND && !window.MX_PLAYGROUND());
    if (still) { const k = document.documentElement.dataset.theme + W + "x" + H; if (k === drawnStill) return; drawnStill = k; frame(0); return; }
    drawnStill = "";
    if (t - last < (!document.hasFocus() ? 100 : RC.contains("bglite") ? 70 : SMALL() ? 50 : 41)) return; last = t;
    const L = host.getBoundingClientRect().left;
    if (Math.abs(cv.clientWidth - W) > 1 || Math.abs(cv.clientHeight - H) > 1 || Math.abs((innerWidth - L) - W) > 1) size();
    frame(t);
  }
  size();
  addEventListener("resize", size);
  new MutationObserver(() => requestAnimationFrame(frame)).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  requestAnimationFrame(loop);
})();
