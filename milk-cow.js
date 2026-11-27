/* MILKeX — la mucca di Schrödinger (solo tema chiaro).
   Una mucca color latte con le macchie arancioni e viola dell'app. Cammina sui "tetti" della città
   (il bordo alto delle schede dei progetti); sugli orbitali si ferma: bruca, si sdraia a ruminare, dorme,
   ogni tanto muggisce una μ. Quando decide di saltare si alza con calma, si carica e salta: in volo si
   sgretola in una nuvola quantistica e atterra nello stato opposto, viva ⇄ scheletro.
   Sta sopra a tutto, ma non intercetta i clic. Ogni posa è fatta di parametri che si interpolano piano,
   così i passaggi (sdraiata → in piedi → salto) sono continui. */
(() => {
  const cv = document.createElement("canvas");
  cv.className = "milkcat";
  cv.setAttribute("aria-hidden", "true");
  document.body.append(cv);
  let ctx = cv.getContext("2d");
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let still = reduced;
  const off = () => document.documentElement.classList.contains("noanim");   // animazioni spente: niente mucca
  const light = () => document.documentElement.dataset.theme !== "dark";
  let W = 0, H = 0, D = 1;
  function size() { D = Math.min(2, devicePixelRatio || 1); W = innerWidth; H = innerHeight; cv.width = W * D; cv.height = H * D; }
  size(); addEventListener("resize", size);

  // ---------- i tetti ----------
  function roofs() {
    const out = [];
    const main = document.querySelector("main"), L = main ? main.getBoundingClientRect().left : 0;
    for (const tr of document.querySelectorAll("#list tr, .screen:not(.leave) .proj")) {
      const r = tr.getBoundingClientRect();
      if (r.bottom < 60 || r.top > H - 10 || r.width < 120) continue;
      out.push({ a: r.left + 40, b: r.right - 40, y: () => tr.getBoundingClientRect().top + 1, kind: "row" });
    }
    (window.MILK_SPOTS || []).forEach((s, i) => {
      if (s.off) return;
      const y = s.y - s.r * .55;
      if (s.x - s.r * .5 < L + 20 || s.x + s.r * .5 > W - 20 || y < 80 || y > H - 20) return;
      for (const dy of [12, 40]) {                       // la mucca deve vedersi tutta
        const el = document.elementFromPoint(s.x, y - dy);
        if (el && el.closest("table,aside,.search,.top,.bar,.modal,.menu,.proj,.welcome,.sheet")) return;
      }
      out.push({ a: s.x - s.r * .45, b: s.x + s.r * .45, y: () => (window.MILK_SPOTS[i] || s).y - s.r * .55, kind: "spot", i });
    });
    return out;
  }

  // ================== disegno ==================
  // Guarda a destra, zoccoli a y = 0. Parametri della posa (tutti continui):
  // p passo · crouch carica del salto · air -1 slancio / +1 atterraggio · tilt · lie 0 in piedi → 1 sdraiata
  // graze 0 testa alta → 1 bruca · chew masticare · closed occhi chiusi · moo 0..1 muggito
  const MILK = "#fbf7ef", MILK_S = "#e7dccb", INK = "#2a2236", ORA = "#f0884a", VIO = "#7b4fd6", PINK = "#f0b3bd";
  const lerp = (a, b, k) => a + (b - a) * k;
  function legAng(p, o, s, front) {
    if (s.air) { const a = s.air; return front ? [.2 + .9 * Math.max(0, a) - .3 * Math.max(0, -a), .4 * Math.max(0, a)] : [-.5 - .6 * Math.max(0, -a), .3 * Math.max(0, -a)]; }
    const walk = s.walk || 0, sw = Math.sin(p + o) * .42 * walk, lift = Math.max(0, Math.cos(p + o)) * .45 * walk;
    let a1 = sw - (front ? s.crouch * .35 : -s.crouch * .6), a2 = (front ? -lift : lift * .7) - s.crouch * (front ? .6 : -1);
    // sdraiata: le zampe si piegano sotto il corpo
    a1 = lerp(a1, front ? -1.45 : 1.35, s.lie); a2 = lerp(a2, front ? 1.55 : -1.65, s.lie);
    return [a1, a2];
  }
  function leg(x, y, a1, a2, l, w, col, hoof, bones) {
    const kx = x + Math.sin(a1) * l, ky = y + Math.cos(a1) * l, fx = kx + Math.sin(a2) * l, fy = ky + Math.cos(a2) * l;
    if (bones) { boneLine(x, y, kx, ky, w * .45); boneLine(kx, ky, fx, fy, w * .4); ctx.fillStyle = OUT; ctx.beginPath(); ctx.ellipse(fx + .6, fy, 2.4, 1.6, 0, 0, 6.283); ctx.fill(); ctx.fillStyle = BONE_D; ctx.beginPath(); ctx.ellipse(fx + .6, fy, 1.6, 1, 0, 0, 6.283); ctx.fill(); return; }
    ctx.lineCap = "round"; ctx.strokeStyle = col;
    ctx.lineWidth = w; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(kx, ky); ctx.stroke();
    ctx.lineWidth = w * .8; ctx.beginPath(); ctx.moveTo(kx, ky); ctx.lineTo(fx, fy); ctx.stroke();
    ctx.fillStyle = hoof; ctx.beginPath(); ctx.roundRect(fx - 2.6, fy - 2.2, 5.2, 3.2, 1); ctx.fill();
  }
  // ossa (per la mucca scheletro)
  const BONE = "#f1eadb", BONE_D = "#cfc5b2", OUT = "#3a3346";
  function boneLine(x0, y0, x1, y1, w) {
    ctx.lineCap = "round";
    ctx.strokeStyle = OUT; ctx.lineWidth = w + 1.6; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
    ctx.strokeStyle = BONE; ctx.lineWidth = w; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
    for (const [x, y] of [[x0, y0], [x1, y1]]) { ctx.fillStyle = OUT; ctx.beginPath(); ctx.arc(x, y, w * .75 + .8, 0, 6.283); ctx.fill(); ctx.fillStyle = BONE; ctx.beginPath(); ctx.arc(x, y, w * .75, 0, 6.283); ctx.fill(); }
  }
  function vert(x, y, r, k) { ctx.fillStyle = OUT; ctx.beginPath(); ctx.ellipse(x, y, r + .7, r * .9 + .7, 0, 0, 6.283); ctx.fill(); ctx.fillStyle = k % 2 ? BONE_D : BONE; ctx.beginPath(); ctx.ellipse(x, y, r, r * .9, 0, 0, 6.283); ctx.fill(); }

  // macchie del manto (coordinate del corpo), arancioni e viola come l'app
  const SPOTS_BODY = [[-9, -4, 6.5, 4.5, .3, ORA], [5, -6, 5, 3.6, -.4, VIO], [-1, 4, 4, 3, .1, VIO], [11, 3, 3, 2.4, .5, ORA], [-15, 3, 3.2, 2.6, -.2, ORA]];
  function tailPts(t, x0, y0, s) {
    const pts = [], sw = Math.sin(t * .0021) * .35 + Math.sin(t * .0057) * .12;
    for (let k = 0; k <= 10; k++) { const u = k / 10; pts.push([x0 - 2 - u * 3 + Math.sin(u * 2.4) * sw * 9 * (1 - s.lie * .6) - s.lie * u * 6, y0 + u * (14 - s.lie * 8)]); }
    return pts;
  }

  function drawCow(t, s, dead) {
    const bob = s.air ? 0 : Math.abs(Math.sin(s.p)) * .9 * (s.walk || 0);
    const by = -24 + s.lie * 11 + s.crouch * 3 - bob;            // centro del corpo
    ctx.save(); ctx.rotate(s.tilt || 0);
    const legTop = by + 7;
    // zampe lontane
    let [a1, a2] = legAng(s.p, Math.PI, s, false); ctx.globalAlpha *= .85;
    leg(-12, legTop, a1, a2, 7.5, 4.2, MILK_S, "#5b4d47", dead);
    [a1, a2] = legAng(s.p, 0, s, true); leg(12, legTop, a1, a2, 7.5, 4, MILK_S, "#5b4d47", dead); ctx.globalAlpha /= .85;
    // coda con il ciuffo
    const tp = tailPts(t, -19, by - 5, s);
    if (dead) tp.forEach(([x, y], k) => vert(x, y, 1.5 - k * .08, k));
    else {
      ctx.strokeStyle = MILK_S; ctx.lineCap = "round"; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(...tp[0]); tp.forEach(q => ctx.lineTo(...q)); ctx.stroke();
      const [ex, ey] = tp[tp.length - 1]; ctx.fillStyle = INK; ctx.beginPath(); ctx.ellipse(ex, ey + 1.5, 1.8, 3, .2, 0, 6.283); ctx.fill();
    }
    // corpo
    ctx.save(); ctx.translate(0, by);
    const breathe = 1 + Math.sin(t * (s.closed ? .0016 : .0024)) * (s.closed ? .035 : .018);
    ctx.scale(1, breathe);
    if (dead) {
      for (let k = 0; k < 7; k++) {                               // costole
        const x = -11 + k * 3.6, len = 13 - Math.abs(k - 3) * 1.6;
        for (const [col, w] of [[OUT, 2.6], [k % 2 ? BONE_D : BONE, 1.3]]) { ctx.strokeStyle = col; ctx.lineWidth = w; ctx.beginPath(); ctx.moveTo(x, -8); ctx.quadraticCurveTo(x + 4, -8 + len * .55, x + .5, -8 + len); ctx.stroke(); }
      }
      ctx.fillStyle = OUT; ctx.beginPath(); ctx.ellipse(-15, -5, 5.2, 4, .3, 0, 6.283); ctx.fill();   // bacino
      ctx.fillStyle = BONE; ctx.beginPath(); ctx.ellipse(-15, -5, 4.1, 2.9, .3, 0, 6.283); ctx.fill();
      ctx.fillStyle = OUT; ctx.beginPath(); ctx.arc(-15, -5, 1.1, 0, 6.283); ctx.fill();
      for (let k = 0; k <= 12; k++) { const u = k / 12; vert(-19 + u * 34, -9 - Math.sin(u * Math.PI) * 2.5, 1.8, k); }   // colonna
    } else {
      const body = new Path2D(); body.ellipse(0, 0, 19, 10.5, 0, 0, 6.283);
      const g = ctx.createLinearGradient(0, -11, 0, 11); g.addColorStop(0, "#fffdf8"); g.addColorStop(.55, MILK); g.addColorStop(1, MILK_S);
      ctx.fillStyle = g; ctx.fill(body);
      ctx.save(); ctx.clip(body);
      for (const [x, y, rx, ry, r, c] of SPOTS_BODY) { ctx.fillStyle = c; ctx.globalAlpha *= .92; ctx.beginPath(); ctx.ellipse(x, y, rx, ry, r, 0, 6.283); ctx.fill(); ctx.globalAlpha /= .92; }
      const sh = ctx.createLinearGradient(0, -11, 0, 11); sh.addColorStop(0, "rgba(255,255,255,.35)"); sh.addColorStop(.5, "rgba(255,255,255,0)"); sh.addColorStop(1, "rgba(60,40,70,.18)");
      ctx.fillStyle = sh; ctx.fill(body);
      ctx.restore();
      ctx.strokeStyle = "rgba(42,34,54,.35)"; ctx.lineWidth = .9; ctx.stroke(body);
      if (s.lie < .5) { ctx.fillStyle = PINK; ctx.beginPath(); ctx.ellipse(-5, 9.5, 3.4, 2 * (1 - s.lie * 2), 0, 0, Math.PI); ctx.fill(); }   // mammella
    }
    ctx.restore();
    // zampe vicine
    [a1, a2] = legAng(s.p, 0, s, false); leg(-14, legTop, a1, a2, 7.5, 4.6, MILK, "#4a3d38", dead);
    [a1, a2] = legAng(s.p, Math.PI, s, true); leg(10, legTop, a1, a2, 7.5, 4.4, MILK, "#4a3d38", dead);
    // collo e testa: si abbassa per brucare, si alza per muggire
    const hx = 22 - s.graze * 1.5, hy = by - 6 + s.graze * 10 - s.moo * 3, hr = -.15 + s.graze * 1.05 - s.moo * .45;
    if (dead) { for (let k = 0; k <= 4; k++) { const u = k / 4; vert(lerp(14, hx - 4, u), lerp(by - 6, hy, u), 1.7, k); } }
    else {
      ctx.strokeStyle = MILK; ctx.lineWidth = 9; ctx.lineCap = "round"; ctx.beginPath(); ctx.moveTo(12, by - 3); ctx.lineTo(hx - 4, hy); ctx.stroke();
      ctx.strokeStyle = "rgba(42,34,54,.25)"; ctx.lineWidth = .8; ctx.beginPath(); ctx.moveTo(13, by - 8); ctx.lineTo(hx - 5, hy - 4.5); ctx.stroke();
    }
    ctx.save(); ctx.translate(hx, hy); ctx.rotate(hr);
    (dead ? skull : head)(t, s);
    ctx.restore();
    ctx.restore();
  }
  function head(t, s) {
    // orecchie, corna, testa, muso rosa
    ctx.fillStyle = MILK_S; ctx.beginPath(); ctx.ellipse(-4, -5, 4.2, 1.8, -.5, 0, 6.283); ctx.fill();
    ctx.fillStyle = PINK; ctx.beginPath(); ctx.ellipse(-4, -5, 2.6, .9, -.5, 0, 6.283); ctx.fill();
    ctx.strokeStyle = "#e9dcc0"; ctx.lineWidth = 2.2; ctx.lineCap = "round";
    ctx.beginPath(); ctx.moveTo(-.5, -6.5); ctx.quadraticCurveTo(-1, -11, 1.5, -12.5); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(2.5, -6.5); ctx.quadraticCurveTo(3, -10.5, 5.5, -11.5); ctx.stroke();
    const hp = new Path2D("M-3 -3 C-3 -7 1 -8.5 4.5 -7.5 C8 -6.5 9.5 -3 9.5 0 L9.5 3 C9.5 6 7 7.5 4 7.5 C0 7.5 -3 5 -3 1 Z");
    const g = ctx.createRadialGradient(2, -4, 1, 3, 0, 10); g.addColorStop(0, "#fffdf8"); g.addColorStop(1, MILK_S);
    ctx.fillStyle = g; ctx.fill(hp); ctx.strokeStyle = "rgba(42,34,54,.35)"; ctx.lineWidth = .8; ctx.stroke(hp);
    ctx.fillStyle = VIO; ctx.globalAlpha *= .9; ctx.beginPath(); ctx.ellipse(1, -4.5, 2.6, 2, .4, 0, 6.283); ctx.fill(); ctx.globalAlpha /= .9;   // macchia sulla fronte
    // muso: mastica (chew) o si apre per muggire
    const jaw = s.moo * 2.2 + (s.chew ? Math.max(0, Math.sin(t * .012)) * .9 : 0);
    ctx.fillStyle = PINK; ctx.beginPath(); ctx.ellipse(7.5, 3.4 + jaw * .3, 4.4, 3.4 + jaw * .25, 0, 0, 6.283); ctx.fill();
    ctx.strokeStyle = "rgba(160,90,100,.5)"; ctx.lineWidth = .6; ctx.stroke();
    ctx.fillStyle = "#b86b7a"; for (const nx of [6.3, 9]) { ctx.beginPath(); ctx.ellipse(nx, 2.6, .7, .9, 0, 0, 6.283); ctx.fill(); }
    if (jaw > .3) { ctx.fillStyle = "#7a3b48"; ctx.beginPath(); ctx.ellipse(7.8, 5.6 + jaw * .4, 2 , jaw * .55, 0, 0, 6.283); ctx.fill(); }
    // occhio con ciglia
    if (s.closed > .5) { ctx.strokeStyle = INK; ctx.lineWidth = .8; ctx.beginPath(); ctx.arc(4.2, -2.6, 1.6, .2, Math.PI - .2); ctx.stroke(); }
    else {
      const blink = (t % 4700) < 140;
      ctx.save(); ctx.translate(4.2, -2.6); ctx.scale(1, blink ? .12 : 1);
      ctx.fillStyle = INK; ctx.beginPath(); ctx.ellipse(0, 0, 1.5, 1.8, 0, 0, 6.283); ctx.fill();
      ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(-.5, -.6, .5, 0, 6.283); ctx.fill();
      ctx.restore();
      ctx.strokeStyle = INK; ctx.lineWidth = .5; ctx.beginPath(); ctx.moveTo(3.2, -4.3); ctx.lineTo(2.6, -5.2); ctx.moveTo(4.2, -4.5); ctx.lineTo(4.2, -5.5); ctx.stroke();
    }
  }
  function skull(t, s) {
    // corna (osso vero), curve in avanti e in su; niente orecchie: sono cartilagine
    for (const [d, col] of [["M-2.6 -7C-4.6-10.6-2.6-13.8 3.2-13.6C-.6-12.4-1.2-10.2-.2-7Z", BONE_D], ["M.4 -7.2C-1.4-11.8 3.2-15.2 11.4-13.2C5.4-12.6 2.6-11 3.6-7.4Z", BONE]]) {
      const hp = new Path2D(d); ctx.lineWidth = 1.3; ctx.lineJoin = "round"; ctx.strokeStyle = OUT; ctx.stroke(hp); ctx.fillStyle = col; ctx.fill(hp);
    }
    const sk = new Path2D("M-3 -3 C-3 -7 1 -8.5 4.5 -7.5 C8 -6.5 10 -3 10 0 L10 2.5 C10 4.5 8.5 5.5 6.5 5.5 L1 5.5 C-1.5 5.5 -3 4 -3 1 Z");
    ctx.lineWidth = 1.5; ctx.strokeStyle = OUT; ctx.stroke(sk);
    const g = ctx.createRadialGradient(2, -4, 1, 3, 0, 11); g.addColorStop(0, "#fffaf0"); g.addColorStop(1, "#d8cdb8"); ctx.fillStyle = g; ctx.fill(sk);
    const jaw = s.moo * 2.2 + (s.chew ? Math.max(0, Math.sin(t * .012)) * .9 : 0);
    ctx.save(); ctx.translate(1, 5.5); ctx.rotate(.05 + jaw * .12);
    ctx.fillStyle = OUT; ctx.beginPath(); ctx.roundRect(-1, -.6, 10, 3, 1.2); ctx.fill(); ctx.fillStyle = BONE; ctx.beginPath(); ctx.roundRect(0, 0, 8.4, 1.8, .8); ctx.fill();
    ctx.restore();
    ctx.fillStyle = BONE; for (let k = 0; k < 4; k++) ctx.fillRect(3 + k * 1.6, 5, 1, 1.4);
    ctx.fillStyle = "#1d1726"; ctx.beginPath(); ctx.ellipse(3.8, -2.6, 2, s.closed > .5 ? 1.1 : 2.3, 0, 0, 6.283); ctx.fill();
    if (s.closed <= .5) { ctx.fillStyle = `rgba(240,136,74,${.6 + .3 * Math.sin(t * .004)})`; ctx.beginPath(); ctx.arc(4.1, -2.4, .8, 0, 6.283); ctx.fill(); }
    ctx.fillStyle = "#1d1726"; for (const nx of [7.2, 9.2]) { ctx.beginPath(); ctx.ellipse(nx, 2, .6, 1, 0, 0, 6.283); ctx.fill(); }
  }
  function zzz(t, x, y) {
    ctx.save(); ctx.fillStyle = "#7b4fd6";
    for (let k = 0; k < 3; k++) {
      const u = ((t / 2800) + k / 3) % 1, a0 = ctx.globalAlpha;
      ctx.globalAlpha = a0 * Math.sin(u * Math.PI) * .7; ctx.font = `italic ${5 + u * 5}px 'Latin Modern',serif`;
      ctx.fillText("z", x + u * 8 + Math.sin(u * 6) * 1.5, y - u * 16); ctx.globalAlpha = a0;
    }
    ctx.restore();
  }
  function drawAt(x, y, dead, t, s, dir, alpha) {
    const ex = EXC.t0 && t - EXC.t0 < EXC.dur ? Math.sin(Math.PI * Math.min(1, (t - EXC.t0) / EXC.dur)) : 0;
    if (ex > 0) {
      const R = 44 + 6 * Math.sin(t * .02);
      const g = ctx.createRadialGradient(x, y - 22, 4, x, y - 22, R);
      g.addColorStop(0, `rgba(255,244,190,${.55 * ex})`); g.addColorStop(.5, `rgba(122,79,208,${.22 * ex})`); g.addColorStop(1, "rgba(122,79,208,0)");
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y - 22, R, 0, 6.283); ctx.fill();
      x += Math.sin(t * .09) * 1.6 * ex; y -= 7 * ex;
    }
    ctx.save(); ctx.translate(x, y); ctx.globalAlpha = alpha;
    if (!s.air) {
      const sh = ctx.createRadialGradient(0, 0, 0, 0, 0, 26); sh.addColorStop(0, "rgba(29,23,38,.25)"); sh.addColorStop(1, "rgba(29,23,38,0)");
      ctx.save(); ctx.scale(1, .2); ctx.fillStyle = sh; ctx.beginPath(); ctx.arc(0, 0, 26, 0, 6.283); ctx.fill(); ctx.restore();
    }
    const CS = innerWidth < 700 ? .9 : 1.2; ctx.scale(dir * CS, CS);
    drawCow(t, s, dead);
    ctx.restore();
    if (s.closed > .5 && !s.air) { ctx.save(); ctx.globalAlpha = alpha * Math.min(1, (s.closed - .5) * 2); zzz(t, x + dir * 30, y - 30); ctx.restore(); }
  }

  // ---------- nuvola quantistica del salto ----------
  const N = 320, FOG = Array.from({ length: N }, () => [(Math.random() + Math.random() - 1) * 36, -22 + (Math.random() + Math.random() - 1) * 18, Math.random() * 6.28]);
  function drawFog(t, x, y, k, dir, hot) {
    for (const [fx, fy, ph] of FOG) {
      const s = .5 + k * (hot ? 1.3 : .9), j = hot ? 3 : 1;
      const px = x + fx * s * dir + Math.sin(t * .004 * j + ph) * 5 * k * j, py = y + fy * s + Math.cos(t * .005 * j + ph) * 5 * k * j;
      ctx.fillStyle = hot ? `rgba(${ph < 2 ? "63,209,138" : ph < 4 ? "255,236,160" : "240,136,74"},${.75 * Math.min(1, k * 1.6)})`
                          : `rgba(${ph < 3 ? "123,79,214" : "240,136,74"},${.6 * Math.min(1, k * 1.6)})`;
      ctx.fillRect(px - 1, py - 1, 2, 2);
    }
  }
  // i muggiti sono μ che salgono
  const moos = [];
  function drawMoos(t) {
    for (let k = moos.length - 1; k >= 0; k--) {
      const m = moos[k], u = (t - m.t0) / 2200;
      if (u >= 1) { moos.splice(k, 1); continue; }
      ctx.save(); ctx.globalAlpha = Math.sin(u * Math.PI) * .8; ctx.fillStyle = "#7b4fd6";
      ctx.font = `italic ${11 + u * 9}px 'Latin Modern',serif`; ctx.textAlign = "center";
      ctx.fillText("μ", m.x + m.dir * (6 + u * 14), m.y - u * 26); ctx.restore();
    }
  }

  // ---------- comportamento ----------
  const rand = (a, b) => a + Math.random() * (b - a);
  // la posa attuale si avvicina piano alla posa voluta: niente scatti
  const pose = { p: 0, walk: 0, crouch: 0, lie: 0, graze: 0, chew: 0, closed: 0, moo: 0 };
  const want = { walk: 0, lie: 0, graze: 0, chew: 0, closed: 0, moo: 0 };
  const RATE = { walk: 500, lie: 1400, graze: 700, chew: 300, closed: 900, moo: 350 };   // ms per arrivare quasi a destinazione
  const cow = { roof: null, x: 0, dir: 1, dead: false, act: null, actUntil: 0, until: 0, jump: null, leaving: 0, nextMoo: 0 };
  const ACTS = {                                   // cosa fa sugli orbitali
    graze: { lie: 0, graze: 1, chew: 1, closed: 0 },
    rest: { lie: 1, graze: 0, chew: 1, closed: 0 },
    sleep: { lie: 1, graze: 0, chew: 0, closed: 1 },
    stand: { lie: 0, graze: 0, chew: 0, closed: 0 },
  };
  function setAct(a, t) { cow.act = a; Object.assign(want, ACTS[a], { walk: 0 }); cow.actUntil = t + rand(4000, 9000); }
  function nextAct(t) {
    const from = cow.act, opts = from === "sleep" ? ["rest", "rest", "stand"] : from === "rest" ? ["sleep", "graze", "stand"] : ["graze", "rest", "stand", "sleep"];
    setAct(opts[Math.floor(Math.random() * opts.length)], t);
  }
  function startStay(t) {
    cow.leaving = 0;
    if (cow.roof.kind === "spot") { setAct(Math.random() < .5 ? "graze" : "stand", t); cow.until = t + rand(9000, 22000); }
    else { cow.act = null; Object.assign(want, ACTS.stand, { walk: 1 }); cow.until = t + rand(5000, 11000); }
  }
  const same = (a, b) => a.kind === b.kind && (a.kind === "row" ? Math.abs(a.y() - b.y()) < 2 : a.i === b.i);
  function pickRoof(rs, from) {
    const cands = rs.filter(r => !same(r, from) && Math.abs((r.a + r.b) / 2 - cow.x) < 700);
    const pref = cands.filter(r => r.kind === "spot" && window.MILK_SPOTS?.[r.i]?.orb);
    const pool = pref.length && Math.random() < .6 ? pref : cands.length ? cands : rs.filter(r => !same(r, from));
    return pool[Math.floor(Math.random() * pool.length)];
  }
  const sm = u => u <= 0 ? 0 : u >= 1 ? 1 : u * u * (3 - 2 * u);
  let last = 0, roofCache = null, roofAt = 0;
  function frame(t) {
    requestAnimationFrame(frame);
    if (window.MX_PLAYGROUND) { const on = MX_PLAYGROUND(); dock.style.display = on ? "" : "none"; if (!on) { big.hidden = true; tSling.classList.remove("on"); } }
    const ok = cowFrame(t);
    if (ok !== false && !off()) { if (light()) drawGadgets(t); else spaceCow(t); }
  }
  function cowFrame(t) {
    if (t - last < (document.hasFocus() ? 41 : 100)) return false;
    const dt = Math.min(80, t - last); last = t;
    ctx.setTransform(D, 0, 0, D, 0, 0); ctx.clearRect(0, 0, W, H);
    if (innerWidth !== W || innerHeight !== H) size();
    if (off() || !document.querySelector("main") || (window.MX_PLAYGROUND && !window.MX_PLAYGROUND())) return;
    if (!light()) return true;
    if (!roofCache || t - roofAt > 400) { roofCache = roofs(); roofAt = t; }   // misurare la pagina costa: ogni 0,4 s basta
    const rs = roofCache;
    if (!rs.length) return;
    if (!cow.jump) {
      const cur = cow.roof && rs.find(r => same(r, cow.roof));
      if (!cur) { cow.roof = rs.find(r => r.kind === "row") || rs[0]; cow.x = cow.roof.a + 40; startStay(t); }
      else cow.roof = cow.roof.kind === cur.kind && cow.roof.i === cur.i && cow.roof.kind === "spot" ? cow.roof : cur;
    }
    for (const k in want) pose[k] += (want[k] - pose[k]) * Math.min(1, dt / RATE[k] * 2.2);
    drawMoos(t);
    // scatola di Schrödinger: mucca che entra, chiusa dentro, o che esce
    if (BOX.anim) {
      const a = BOX.anim, u = Math.min(1, (t - a.t0) / 900);
      const [x0, y0, x1, y1] = a.in ? [cow.x, cow.roof.y(), a.x, a.y] : [a.x, a.y, cow.x, cow.roof.y()];
      const e = sm(u), x = x0 + (x1 - x0) * e, y = y0 + (y1 - y0) * e - Math.sin(Math.PI * e) * 40;
      if (a.in && u < .25) drawAt(x0, y0, cow.dead, t, { ...pose, crouch: 0 }, cow.dir, 1 - u * 4);
      drawFog(t, x, y, Math.max(.001, sm(u / .3) * (1 - sm((u - .7) / .3))), cow.dir);
      if (!a.in && u > .75) drawAt(x1, y1, cow.dead, t, { ...pose, crouch: 0 }, cow.dir, (u - .75) * 4);
      if (u >= 1) { BOX.anim = null; if (a.in) boxClose(); else cow.until = t + 6000; }
      return;
    }
    if (BOX.state === "boxed") return;
    window.MILK_COW = { x: cow.x, y: cow.roof.y() };

    if (DRAG) {
      const fog = .35 + .25 * Math.sin(t * .02);
      EXC.t0 = EXC.t0 || t; EXC.dur = 1e9;
      drawAt(DRAG.x, DRAG.y + 22, cow.dead, t, { ...pose, crouch: 0, air: -1, tilt: Math.sin(t * .01) * .15 }, cow.dir, 1);
      drawFog(t, DRAG.x, DRAG.y + 22, fog, cow.dir, true);
      return;
    }
    window.MILK_JUMP = cow.jump ? (cow.jump.home ? "andata" : cow.jump.hot ? "ritorno" : "salto") : "";
    if (cow.kick && !cow.jump) {                      // colpita: salto immediato, senza prepararsi
      cow.kick = false;
      const to = pickRoof(rs, cow.roof);
      if (to) {
        const x1 = to.kind === "spot" ? (to.a + to.b) / 2 : Math.max(to.a, Math.min(to.b, cow.x + (Math.random() - .5) * 260));
        cow.dir = x1 >= cow.x ? 1 : -1;
        cow.jump = { t0: t - 250, dur: 1500, x0: cow.x, y0: cow.roof.y(), x1, to, h: 130 + Math.abs(x1 - cow.x) * .3, hot: true, home: { roof: cow.roof, x: cow.x } };
      } else { EXC.t0 = t; EXC.dur = 700; }
      Object.assign(pose, { lie: 0, graze: 0, closed: 0, walk: 0 }); Object.assign(want, ACTS.stand, { walk: 0 }); cow.act = null;
    }
    if (cow.jump) {
      // carica → stacco e subito nuvola → si ricompone prima di toccare → ammortizza
      const j = cow.jump, u = Math.min(1, (t - j.t0) / j.dur);
      const ty = j.to.y(), fl = sm((u - .14) / .72);
      const x = j.x0 + (j.x1 - j.x0) * fl, y = j.y0 + (ty - j.y0) * fl - Math.sin(Math.PI * fl) * j.h;
      const before = cow.dead, after = !cow.dead, base = { ...pose, walk: 0, lie: 0, graze: 0, closed: 0, chew: 0, moo: 0 };
      if (u < .14) drawAt(x, y, before, t, { ...base, crouch: Math.sin(u / .14 * Math.PI * .5) }, cow.dir, 1);
      else if (u < .74) {
        const fade = sm((u - .14) / .08);
        if (fade < 1) drawAt(x, y, before, t, { ...base, crouch: 0, air: -1, tilt: -.25 }, cow.dir, 1 - fade);
        drawFog(t, x, y, Math.max(fade, .001), cow.dir, j.hot);
      } else if (u < .88) {
        const app = sm((u - .74) / .14);
        drawFog(t, x, y, 1 - app, cow.dir, j.hot);
        drawAt(x, y, after, t, { ...base, crouch: 0, air: 1, tilt: .2 }, cow.dir, app);
      } else drawAt(x, ty, after, t, { ...base, crouch: Math.sin((u - .88) / .12 * Math.PI) * .8 }, cow.dir, 1);
      if (u >= 1 && j.hot && j.home) {                    // tocca l'altro orbitale e rimbalza subito indietro
        cow.roof = j.to; cow.x = j.x1; cow.dead = after;
        const h = j.home, x1 = Math.max(h.roof.a, Math.min(h.roof.b, h.x));
        cow.dir = x1 >= cow.x ? 1 : -1;
        cow.jump = { t0: t - 180, dur: 1250, x0: cow.x, y0: ty, x1, to: h.roof, h: 110 + Math.abs(x1 - cow.x) * .25, hot: true };
        return;
      }
      if (u >= 1 && j.hot) { EXC.t0 = t; EXC.dur = 500; }   // di nuovo a casa, ancora eccitata: un attimo e poi il fotone
      if (u >= 1) { cow.roof = j.to; cow.x = j.x1; cow.dead = after; cow.jump = null; Object.assign(pose, { crouch: 0, lie: 0, graze: 0, closed: 0 }); startStay(t); }
      return;
    }
    const r = cow.roof, y = r.y();
    if (r.kind === "spot") {
      if (!cow.leaving && !still && t > cow.actUntil) nextAct(t);
      // ogni tanto muggisce (sveglia e con la testa alzata)
      if (!still && pose.closed < .2 && pose.graze < .3 && t > cow.nextMoo && Math.random() < dt / 9000) {
        cow.nextMoo = t + 6000; want.moo = 1; setTimeout(() => { want.moo = 0; }, 900);
        moos.push({ t0: t + 250, x: cow.x + cow.dir * 30, y: y - 30, dir: cow.dir });
      }
    } else if (!still && !EXC.t0) {
      pose.p += dt * (cow.dead ? .007 : .009) * pose.walk;
      cow.x += cow.dir * .036 * dt * pose.walk * (cow.dead ? .8 : 1);
      if (cow.x > r.b) { cow.x = r.b; cow.dir = -1; }
      if (cow.x < r.a) { cow.x = r.a; cow.dir = 1; }
    }
    drawAt(cow.x, y, cow.dead, t, { ...pose, crouch: 0 }, cow.dir, 1);
    // salto: prima si sveglia, si alza e alza la testa con calma; poi, quando è in piedi, carica il salto
    if (!still && t > cow.until) {
      if (!cow.leaving) { cow.leaving = t; Object.assign(want, ACTS.stand, { walk: 0 }); }
      const ready = pose.lie < .04 && pose.graze < .05 && pose.closed < .1 && pose.walk < .1;
      if (ready && t - cow.leaving > 900) {
        const to = pickRoof(rs, r);
        if (to) {
          const x1 = to.kind === "spot" ? (to.a + to.b) / 2 : Math.max(to.a, Math.min(to.b, cow.x + (Math.random() - .5) * 200));
          cow.dir = x1 >= cow.x ? 1 : -1;
          cow.jump = { t0: t, dur: 2300 + Math.min(1400, Math.abs(x1 - cow.x) * 2), x0: cow.x, y0: y, x1, to, h: 85 + Math.abs(x1 - cow.x) * .25 };
        } else { cow.until = t + 3000; cow.leaving = 0; }
      }
    }
  }

  // ================== scatola di Schrödinger e scanner a raggi X ==================
  const BOX = { state: "out", anim: null, x: 0, y: 0, measured: null };
  try { Object.assign(BOX, JSON.parse(localStorage.getItem("milkex.cowbox") || "{}"), { anim: null }); } catch { }
  const saveBox = () => { try { localStorage.setItem("milkex.cowbox", JSON.stringify({ state: BOX.state, x: BOX.x, y: BOX.y, measured: BOX.measured })); } catch { } };
  const boxSvg = open => `<svg viewBox="0 0 80 72"><defs><linearGradient id="bxf${open ? 1 : 0}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#dcaa70"/><stop offset="1" stop-color="#b98048"/></linearGradient>
<linearGradient id="bxs${open ? 1 : 0}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c48c52"/><stop offset="1" stop-color="#9c6634"/></linearGradient></defs>
<ellipse cx="40" cy="68" rx="32" ry="3.5" fill="#1d1726" opacity=".12"/>
<path d="M8 30h46v36H8z" fill="url(#bxf${open ? 1 : 0})" stroke="#2a2236" stroke-width="1.6" stroke-linejoin="round"/>
<path d="M54 30l18-10v36l-18 10z" fill="url(#bxs${open ? 1 : 0})" stroke="#2a2236" stroke-width="1.6" stroke-linejoin="round"/>
${open ? '<path d="M8 30l18-10h46l-18 10z" fill="#3a2c22"/><path d="M8 30L1 15h44l9 15z" fill="#e2b47c" stroke="#2a2236" stroke-width="1.6" stroke-linejoin="round"/><path d="M54 30l18-10-3-15-19 11z" fill="#d29d62" stroke="#2a2236" stroke-width="1.6" stroke-linejoin="round"/>'
       : '<path d="M8 30l18-10h46l-18 10z" fill="#e2b47c" stroke="#2a2236" stroke-width="1.6" stroke-linejoin="round"/><path d="M31 30l18-10" stroke="#c9a46e" stroke-width="5"/>'}
<text x="31" y="54" text-anchor="middle" font-family="Latin Modern,serif" font-style="italic" font-size="17" fill="#2a2236" opacity=".75">|ψ⟩</text>
<path d="M14 36h8M14 40h5" stroke="#2a2236" stroke-width="1.2" opacity=".35"/></svg>`;
  const scanSvg = `<svg viewBox="0 0 80 64"><rect x="4" y="4" width="62" height="46" rx="9" fill="#1d1726"/>
<rect x="10" y="10" width="50" height="34" rx="5" fill="#0d2a33" stroke="#47c6d6" stroke-width="1.2"/>
<path d="M14 27h42" stroke="#47c6d6" stroke-width="1" opacity=".6"/><circle cx="35" cy="27" r="7" fill="none" stroke="#47c6d6" stroke-width="1.2" opacity=".8"/>
<rect x="28" y="50" width="14" height="12" rx="3" fill="#2a2236"/><circle cx="62" cy="8" r="2.4" fill="#f0884a"/></svg>`;
  const css = document.createElement("style");
  css.textContent = `
.cowdock{position:fixed;right:22px;bottom:22px;z-index:70;display:flex;gap:10px;align-items:flex-end}
.cowtool{width:64px;height:58px;border-radius:18px;background:var(--milk);border:1px solid var(--line);box-shadow:var(--sh-1);display:grid;place-items:center;cursor:grab;touch-action:none;user-select:none;transition:transform .15s,opacity .2s}
.cowtool:hover{transform:translateY(-2px)}
.cowtool svg{width:46px;height:42px;pointer-events:none}
.cowtool[hidden],.cowbox[hidden]{display:none}
.cowfloat{position:fixed;z-index:80;width:88px;height:80px;pointer-events:none;transform:translate(-50%,-70%);filter:drop-shadow(0 10px 16px rgba(29,23,38,.25))}
.cowfloat svg{width:100%;height:100%}
.cowbox{position:fixed;z-index:65;width:84px;height:76px;transform:translate(-50%,-92%);cursor:pointer;filter:drop-shadow(0 6px 10px rgba(29,23,38,.18))}
.cowbox svg{width:100%;height:100%}
.cowbox.shut{animation:boxShut .35s cubic-bezier(.3,1.6,.5,1)}
@keyframes boxShut{0%{transform:translate(-50%,-92%) scale(1.08,.9)}100%{transform:translate(-50%,-92%)}}
.cowbox .xr{position:absolute;inset:0;overflow:hidden;opacity:0;background:#0d2a33;clip-path:inset(50%)}
.cowbox.scan .xr{opacity:1}
.cowbox .xr canvas{width:100%;height:100%;display:block}
.cowtip{position:fixed;z-index:81;padding:.35rem .7rem;border-radius:999px;background:var(--ink);color:var(--milk);font-size:.8rem;pointer-events:none;transform:translate(-50%,-100%);white-space:nowrap}
@media (max-width:699px){.cowdock{right:12px;bottom:calc(12px + env(safe-area-inset-bottom));gap:6px}.cowtool{width:48px;height:44px;border-radius:14px}.cowtool svg{width:34px;height:30px}.cowbox{width:64px;height:58px}}
:root[data-theme="dark"] .cowdock,:root[data-theme="dark"] .cowbox,html.noanim .cowdock,html.noanim .cowbox{display:none!important}`;
  document.head.append(css);
  const dock = document.createElement("div"); dock.className = "cowdock";
  const tBox = document.createElement("div"); tBox.className = "cowtool"; tBox.title = "Scatola di Schrödinger: trascinala sulla mucca per chiuderla dentro"; tBox.innerHTML = boxSvg(true);
  const tScan = document.createElement("div"); tScan.className = "cowtool"; tScan.title = "Scanner a raggi X: trascinalo sulla scatola per vedere se la mucca è viva o morta"; tScan.innerHTML = scanSvg;
  dock.append(tScan, tBox); document.body.append(dock);
  const XR = '<div class="xr"><canvas width="168" height="152"></canvas></div>';
  const boxEl = document.createElement("div"); boxEl.className = "cowbox"; boxEl.title = "Clic per aprire la scatola";
  boxEl.innerHTML = boxSvg(false) + XR;
  document.body.append(boxEl);
  const tip = (x, y, text) => { const e = document.createElement("div"); e.className = "cowtip"; e.textContent = text; e.style.left = x + "px"; e.style.top = y + "px"; document.body.append(e); setTimeout(() => e.remove(), 1800); };
  function paintTools() {
    const inside = BOX.state === "boxed" || BOX.state === "closing";
    tBox.hidden = inside; tScan.hidden = BOX.state !== "boxed"; boxEl.hidden = !inside;
    boxEl.style.left = BOX.x + "px"; boxEl.style.top = BOX.y + "px";
  }
  function boxClose() {
    BOX.state = "boxed"; BOX.measured = null; saveBox();
    boxEl.innerHTML = boxSvg(false) + XR; paintTools();
    boxEl.classList.remove("shut"); void boxEl.offsetWidth; boxEl.classList.add("shut");
  }
  function drag(tool, kind) {
    tool.addEventListener("pointerdown", e => {
      e.preventDefault();
      const f = document.createElement("div"); f.className = "cowfloat"; f.innerHTML = kind === "box" ? boxSvg(true) : scanSvg; document.body.append(f);
      tool.style.opacity = ".35";
      const move = ev => {
        f.style.left = ev.clientX + "px"; f.style.top = ev.clientY + "px";
        if (kind === "scan") {
          // lo scanner fa vedere dentro solo la parte di scatola che copre davvero
          const b = boxEl.getBoundingClientRect(), s = f.getBoundingClientRect();
          const L = Math.max(b.left, s.left), T = Math.max(b.top, s.top), R = Math.min(b.right, s.right), Bt = Math.min(b.bottom, s.bottom);
          const over = R > L && Bt > T;
          if (over && !boxEl.classList.contains("scan")) { BOX.measured = Math.random() < .5 ? "alive" : "dead"; saveBox(); xray(); }   // ogni passaggio: 50% e 50%
          boxEl.classList.toggle("scan", over);
          if (over) boxEl.querySelector(".xr").style.clipPath = `inset(${T - b.top}px ${b.right - R}px ${b.bottom - Bt}px ${L - b.left}px round 6px)`;
          f.style.opacity = over ? ".45" : "";
        }
      };
      move(e);
      const up = ev => {
        removeEventListener("pointermove", move); removeEventListener("pointerup", up);
        f.remove(); tool.style.opacity = ""; boxEl.classList.remove("scan");
        if (kind !== "box") return;
        const c = window.MILK_COW;
        if (c && Math.hypot(ev.clientX - c.x, ev.clientY - (c.y - 20)) < 110 && !cow.jump) {
          BOX.x = c.x; BOX.y = c.y; BOX.state = "closing";
          BOX.anim = { in: true, t0: performance.now(), x: c.x, y: c.y - 24 };
          boxEl.innerHTML = boxSvg(true) + XR; paintTools();
        } else tip(ev.clientX, ev.clientY - 40, "Avvicina la scatola alla mucca");
      };
      addEventListener("pointermove", move); addEventListener("pointerup", up);
    });
  }
  drag(tBox, "box"); drag(tScan, "scan");
  // lo scanner misura lo stato (una volta sola finché la scatola resta chiusa) e lo mostra in radiografia
  function xray() {
    const c = boxEl.querySelector("canvas"), x = c.getContext("2d"), keep = ctx, dead = BOX.measured === "dead";
    x.setTransform(1, 0, 0, 1, 0, 0); x.filter = "none"; x.fillStyle = "#0d2a33"; x.fillRect(0, 0, c.width, c.height);
    ctx = x; ctx.save(); ctx.translate(76, 122); ctx.scale(2.1, 2.1);
    const XF = "grayscale(1) brightness(1.3) sepia(1) hue-rotate(140deg) saturate(2.5)";
    if (!dead) {   // viva: in piedi, il corpo che brilla, le ossa appena visibili e il cuore che batte
      const P = { p: 0, walk: 0, crouch: 0, lie: 0, graze: 0, chew: 0, closed: 0, moo: 0 };
      ctx.filter = "grayscale(1) brightness(1.6) sepia(1) hue-rotate(140deg) saturate(2.2) opacity(.75)"; drawCow(0, P, false);
      ctx.filter = XF; ctx.globalAlpha = .35; drawCow(0, P, true); ctx.globalAlpha = 1;
      ctx.filter = "none"; ctx.fillStyle = "#ff6f8a"; ctx.shadowColor = "#ff6f8a"; ctx.shadowBlur = 8;
      ctx.beginPath(); ctx.arc(8, -20, 2.8, 0, 6.283); ctx.fill(); ctx.shadowBlur = 0;
    } else {       // morta: sdraiata, solo ossa
      ctx.filter = XF; drawCow(0, { p: 0, walk: 0, crouch: 0, lie: .9, graze: 0, chew: 0, closed: 0, moo: 0 }, true);
    }
    ctx.restore(); ctx = keep;
    x.filter = "none"; x.strokeStyle = "rgba(71,198,214,.22)"; x.lineWidth = 1;
    for (let y = 0; y < c.height; y += 4) { x.beginPath(); x.moveTo(0, y + .5); x.lineTo(c.width, y + .5); x.stroke(); }
  }
  // clic sulla scatola: si apre e la mucca esce, nello stato misurato (o a caso, se nessuno ha guardato)
  boxEl.addEventListener("click", () => {
    if (BOX.state !== "boxed") return;
    cow.dead = BOX.measured ? BOX.measured === "dead" : Math.random() < .5;
    BOX.state = "out"; BOX.measured = null; saveBox();
    const rs = roofCache || roofs();
    const near = rs.reduce((best, r) => { const d = Math.abs((r.a + r.b) / 2 - BOX.x) + Math.abs(r.y() - BOX.y); return !best || d < best.d ? { r, d } : best; }, null);
    if (near) { cow.roof = near.r; cow.x = Math.max(near.r.a, Math.min(near.r.b, BOX.x)); }
    cow.jump = null; cow.until = performance.now() + 8000;
    BOX.anim = { in: false, t0: performance.now(), x: BOX.x, y: BOX.y - 24 };
    paintTools();
  });
  addEventListener("resize", () => { if (BOX.state === "boxed") { BOX.x = Math.min(BOX.x, innerWidth - 50); BOX.y = Math.min(BOX.y, innerHeight - 10); saveBox(); paintTools(); } });

  // ================== fionda a raggi gamma ==================
  // tiri l'elastico (trascini dall'icona) e lasci: parte un raggio gamma nella direzione opposta.
  // Se colpisce la mucca, la mucca si eccita (E₁ → E₂) e poco dopo torna allo stato fondamentale emettendo un fotone.
  const EXC = { t0: 0, dur: 2400 };
  let SLING = null; const RAYS = [];
  const slingSvg = `<svg viewBox="0 0 64 64"><path d="M22 58V36L10 14M42 58V36l12-22M22 36h20" fill="none" stroke="#6b4a2c" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M10 14q22 22 44 0" fill="none" stroke="#7a4fd0" stroke-width="2"/><circle cx="32" cy="24" r="5" fill="#3fd18a" stroke="#1d1726" stroke-width="1.6"/>
<text x="32" y="27" text-anchor="middle" font-family="Latin Modern,serif" font-style="italic" font-size="8" fill="#1d1726">γ</text></svg>`;
  const BIG_SLING_SVG = `<svg viewBox="0 0 120 120" class="sbk"><defs>
<linearGradient id="slw" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#8a5a32"/><stop offset=".5" stop-color="#b98048"/><stop offset="1" stop-color="#7a4c28"/></linearGradient>
<radialGradient id="slg" cx=".4" cy=".35" r=".7"><stop offset="0" stop-color="#eafff4"/><stop offset=".45" stop-color="#3fd18a"/><stop offset="1" stop-color="#16804d"/></radialGradient></defs>
<ellipse cx="60" cy="114" rx="22" ry="4" fill="#1d1726" opacity=".14"/>
<path d="M54 112V74C54 66 50 58 42 50L22 26M66 112V74C66 66 70 58 78 50L98 26" fill="none" stroke="#2a2236" stroke-width="13" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M54 112V74C54 66 50 58 42 50L22 26M66 112V74C66 66 70 58 78 50L98 26" fill="none" stroke="url(#slw)" stroke-width="9.5" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M54 64C56 70 64 70 66 64" fill="url(#slw)"/><rect x="50" y="62" width="20" height="16" fill="url(#slw)"/>
<path d="M45 52l-9-11M75 52l9-11" stroke="#e2b47c" stroke-width="1.4" stroke-linecap="round" opacity=".6"/>
<g stroke="#2a2236" stroke-width="1.2"><rect x="49" y="82" width="22" height="26" rx="4" fill="#7a4fd0"/></g>
<path d="M49 87h22M49 92h22M49 97h22M49 102h22" stroke="#5534a0" stroke-width="2"/>
<circle cx="22" cy="26" r="4.5" fill="#2a2236"/><circle cx="98" cy="26" r="4.5" fill="#2a2236"/>
<g class="rest"><path d="M22 26Q40 40 52 44M98 26Q80 40 68 44" fill="none" stroke="#db6a2c" stroke-width="2.6" stroke-linecap="round"/>
<path d="M50 40Q60 50 70 40L70 48Q60 56 50 48Z" fill="#6b4a2c" stroke="#2a2236" stroke-width="1.4" stroke-linejoin="round"/>
<circle cx="60" cy="42" r="7" fill="url(#slg)" stroke="#1d1726" stroke-width="1.2"/>
<text x="60" y="45.6" text-anchor="middle" font-family="Latin Modern,serif" font-style="italic" font-size="10" fill="#0d3b26">γ</text></g></svg>`;
  const tSling = document.createElement("div"); tSling.className = "cowtool"; tSling.innerHTML = slingSvg;
  tSling.title = "Fionda a raggi gamma: clic per prenderla, poi tendi l'elastico e lascia mirando alla mucca";
  dock.prepend(tSling);
  // la fionda grande, in basso al centro: si tende trascinando dal suo elastico
  const big = document.createElement("div"); big.className = "slingbig"; big.hidden = true;
  big.innerHTML = BIG_SLING_SVG;
  document.body.append(big);
  const css2 = document.createElement("style");
  css2.textContent = `.slingbig{position:fixed;left:50%;bottom:18px;width:120px;height:120px;margin-left:-60px;z-index:72;touch-action:none;cursor:grab}
.slingbig[hidden]{display:none}.slingbig svg{width:100%;height:100%;filter:drop-shadow(0 8px 14px rgba(29,23,38,.25))}.slingbig.pull .rest{display:none}
.cowtool.on{background:var(--ink)!important}.cowtool.on svg path{stroke:#f6f1e8}
:root[data-theme="dark"] .slingbig,html.noanim .slingbig{display:none!important}`;
  document.head.append(css2);
  tSling.addEventListener("click", () => { big.hidden = !big.hidden; tSling.classList.toggle("on", !big.hidden); });
  big.addEventListener("pointerdown", e => {
    e.preventDefault();
    const b = big.getBoundingClientRect();
    const k = b.width / 120;
    SLING = { ax: b.left + 60 * k, ay: b.top + 44 * k, lx: b.left + 22 * k, rx: b.left + 98 * k, ty: b.top + 26 * k, px: e.clientX, py: e.clientY };
    big.classList.add("pull");
    const move = ev => { SLING.px = ev.clientX; SLING.py = ev.clientY; };
    const up = () => {
      removeEventListener("pointermove", move); removeEventListener("pointerup", up);
      const dx = SLING.ax - SLING.px, dy = SLING.ay - SLING.py, d = Math.hypot(dx, dy);
      if (d > 12) RAYS.push({ x: SLING.ax, y: SLING.ay, vx: dx / d, vy: dy / d, sp: .35 + Math.min(1, d / 160) * .9, t0: performance.now(), kind: "gamma" });
      SLING = null; big.classList.remove("pull");
    };
    addEventListener("pointermove", move); addEventListener("pointerup", up);
  });
  function wave(x, y, vx, vy, len, amp, k, ph, col, w, a) {
    ctx.save(); ctx.globalAlpha = a; ctx.strokeStyle = col; ctx.lineWidth = w; ctx.lineCap = "round"; ctx.beginPath();
    for (let s = 0; s <= len; s += 2) {
      const o = Math.sin(s * k + ph) * amp * Math.min(1, s / 12, (len - s) / 12 + .2);
      const px = x - vx * s - vy * o, py = y - vy * s + vx * o;
      s ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
    }
    ctx.stroke(); ctx.restore();
  }
  let lastG = 0;
  function drawGadgets(t) {
    const dt = Math.min(80, t - (lastG || t)); lastG = t;
    if (SLING) {                                            // elastico tirato e la mira
      const { ax, ay, px, py } = SLING, lx = SLING.lx ?? ax - 14, rx = SLING.rx ?? ax + 14, ty = SLING.ty ?? ay + 4;
      ctx.save(); ctx.strokeStyle = "#db6a2c"; ctx.lineWidth = 2.6; ctx.lineCap = "round";
      ctx.beginPath(); ctx.moveTo(lx, ty); ctx.lineTo(px - 6, py); ctx.moveTo(rx, ty); ctx.lineTo(px + 6, py); ctx.stroke();
      ctx.fillStyle = "#6b4a2c"; ctx.beginPath(); ctx.ellipse(px, py + 2, 10, 6, 0, 0, 6.283); ctx.fill();
      const og = ctx.createRadialGradient(px - 2, py - 3, 1, px, py, 8); og.addColorStop(0, "#eafff4"); og.addColorStop(.45, "#3fd18a"); og.addColorStop(1, "#16804d");
      ctx.shadowColor = "#3fd18a"; ctx.shadowBlur = 12; ctx.fillStyle = og; ctx.beginPath(); ctx.arc(px, py - 1, 7, 0, 6.283); ctx.fill(); ctx.shadowBlur = 0;
      const dx = ax - px, dy = ay - py, d = Math.hypot(dx, dy) || 1;
      ctx.setLineDash([3, 7]); ctx.strokeStyle = "rgba(63,209,138,.7)"; ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(ax + dx / d * 260, ay + dy / d * 260); ctx.stroke();
      ctx.setLineDash([]); ctx.restore();
    }
    const c = window.MILK_COW;
    for (let i = RAYS.length - 1; i >= 0; i--) {
      const r = RAYS[i];
      r.x += r.vx * r.sp * dt; r.y += r.vy * r.sp * dt;
      const age = t - r.t0;
      const gamma = r.kind === "gamma";
      // raggio gamma: onda fitta verde-viola; fotone emesso: onda più larga, arancione, con ħω
      wave(r.x, r.y, r.vx, r.vy, gamma ? 64 : 48, gamma ? 4 : 6, gamma ? .9 : .45, -age * .05, gamma ? "rgba(63,209,138,.35)" : "rgba(240,136,74,.3)", 7, 1);
      wave(r.x, r.y, r.vx, r.vy, gamma ? 64 : 48, gamma ? 4 : 6, gamma ? .9 : .45, -age * .05, gamma ? "#3fd18a" : "#f0884a", 2, 1);
      if (!gamma) { ctx.save(); ctx.globalAlpha = Math.max(0, 1 - age / 1800); ctx.fillStyle = "#c75a1e"; ctx.font = "italic 13px 'Latin Modern',serif"; ctx.fillText("ħω", r.x + 8, r.y - 8); ctx.restore(); }
      if (gamma && c && BOX.state !== "boxed" && !EXC.t0 && !cow.jump && Math.hypot(r.x - c.x, r.y - (c.y - 22)) < 36) {
        cow.kick = true; RAYS.splice(i, 1); continue;          // colpita: salto eccitato
      }
      if (r.x < -80 || r.y < -80 || r.x > W + 80 || r.y > H + 80 || age > 6000) RAYS.splice(i, 1);
    }
    // fine dell'eccitazione: ritorno allo stato fondamentale con l'emissione di un fotone
    if (EXC.t0 && t - EXC.t0 >= EXC.dur) {
      EXC.t0 = 0;
      if (c) { const a = -Math.PI / 2 + (Math.random() - .5) * 2.2; RAYS.push({ x: c.x, y: c.y - 26, vx: Math.cos(a), vy: Math.sin(a), sp: .4, t0: t, kind: "photon" }); }
    }
  }

  // ================== tema scuro: mucca astronauta senza gravità ==================
  const AST = { x: 0, y: 0, vx: .03, vy: -.02, a: 0, va: .0004, drag: null, init: false, trail: [] };
  function drawAstro(t, x, y, ang) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(ang); ctx.scale(1.05, 1.05); ctx.translate(0, 22);
    drawCow(t, { p: t * .004, walk: .25, crouch: 0, lie: 0, graze: 0, chew: 0, closed: 0, moo: 0 }, false);   // nello spazio è sempre viva
    // casco: bolla di vetro attorno alla testa, con il riflesso
    const hx = 22, hy = -32;
    const g = ctx.createRadialGradient(hx - 5, hy - 6, 2, hx, hy, 17);
    g.addColorStop(0, "rgba(255,255,255,.35)"); g.addColorStop(.6, "rgba(188,212,255,.12)"); g.addColorStop(1, "rgba(188,212,255,.28)");
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(hx, hy, 16.5, 0, 6.283); ctx.fill();
    ctx.strokeStyle = "rgba(220,232,255,.8)"; ctx.lineWidth = 1.4; ctx.stroke();
    ctx.strokeStyle = "rgba(255,255,255,.75)"; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.arc(hx, hy, 12.5, 3.6, 4.4); ctx.stroke();
    ctx.fillStyle = "#cfd3e6"; ctx.strokeStyle = "#3a3346"; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.ellipse(hx - 9, hy + 13, 9, 3.4, -.35, 0, 6.283); ctx.fill(); ctx.stroke();   // collare
    ctx.restore();
  }
  let lastS = 0;
  function spaceCow(t) {
    const dt = Math.min(50, t - (lastS || t)); lastS = t;
    if (!AST.init) { AST.x = W * .62; AST.y = H * .42; AST.init = true; }
    if (!AST.drag) {
      // gravità di galassia e nebulose (solo se ci si avvicina: oltre un certo raggio la mucca va dritta)
      for (const m of (window.MILK_MASSES || [])) {
        const dx = m.x - AST.x, dy = m.y - AST.y, d2 = dx * dx + dy * dy, d = Math.sqrt(d2);
        const reach = m.r * 4.5 + 90;
        if (d > reach) continue;
        const f = m.m * 2.2e-6 / (d2 + 900) * Math.min(1, (reach - d) / 60);
        AST.vx += dx / d * f * dt; AST.vy += dy / d * f * dt;
        if (d < m.r) { AST.vx *= .985; AST.vy *= .985; }        // dentro la nube: un po' di attrito, finisce in orbita
      }
      const sp = Math.hypot(AST.vx, AST.vy), MAX = .55;
      if (sp > MAX) { AST.vx *= MAX / sp; AST.vy *= MAX / sp; }
      AST.x += AST.vx * dt; AST.y += AST.vy * dt; AST.a += AST.va * dt;
      // rimbalzo morbido sui bordi
      if (AST.x < 40 && AST.vx < 0 || AST.x > W - 40 && AST.vx > 0) AST.vx *= -.8;
      if (AST.y < 50 && AST.vy < 0 || AST.y > H - 20 && AST.vy > 0) AST.vy *= -.8;
    }
    AST.trail.push(AST.x, AST.y); if (AST.trail.length > 40) AST.trail.splice(0, 2);
    ctx.save(); ctx.fillStyle = "rgba(196,168,255,.35)";
    for (let i = 0; i < AST.trail.length; i += 2) { const k = i / AST.trail.length; ctx.globalAlpha = k * .5; ctx.fillRect(AST.trail[i] - 1, AST.trail[i + 1] - 1, 2, 2); }
    ctx.restore();
    drawAstro(t, AST.x, AST.y, AST.a);
    window.MILK_ASTRO = AST;
  }
  // presa e lancio: si trascina la mucca e la si lascia con una velocità
  addEventListener("pointerdown", e => {
    if (light() || off() || !AST.init || document.querySelector(".mxgame:not([hidden])")) return;
    if (Math.hypot(e.clientX - AST.x, e.clientY - AST.y) > 46) return;
    e.preventDefault(); e.stopPropagation();
    AST.drag = { hist: [[e.clientX, e.clientY, performance.now()]] };
    const move = ev => { AST.x = ev.clientX; AST.y = ev.clientY; AST.drag.hist.push([ev.clientX, ev.clientY, performance.now()]); if (AST.drag.hist.length > 6) AST.drag.hist.shift(); };
    const up = () => {
      removeEventListener("pointermove", move, true); removeEventListener("pointerup", up, true);
      const h = AST.drag.hist, a = h[0], b = h[h.length - 1], dtm = Math.max(16, b[2] - a[2]);
      AST.vx = (b[0] - a[0]) / dtm * .8; AST.vy = (b[1] - a[1]) / dtm * .8; AST.va = (Math.random() - .5) * .002;
      AST.drag = null;
    };
    addEventListener("pointermove", move, true); addEventListener("pointerup", up, true);
  }, true);
  // il cursore diventa una mano sopra la mucca astronauta
  addEventListener("pointermove", e => {
    if (light() || !AST.init || AST.drag) return;
    document.documentElement.style.cursor = Math.hypot(e.clientX - AST.x, e.clientY - AST.y) < 46 ? "grab" : "";
  }, { passive: true });

  // ================== trascinare la mucca (tema chiaro) ==================
  let DRAG = null;
  addEventListener("pointerdown", e => {
    const c = window.MILK_COW;
    if (!light() || off() || !c || cow.jump || BOX.state !== "out" || BOX.anim || SLING) return;
    if (e.target.closest && e.target.closest(".cowdock,.slingbig,.cowhelp,button,a,input")) return;
    if (Math.hypot(e.clientX - c.x, e.clientY - (c.y - 22)) > 34) return;
    e.preventDefault(); e.stopPropagation();
    DRAG = { x: e.clientX, y: e.clientY, home: { roof: cow.roof, x: cow.x } };
    const move = ev => { DRAG.x = ev.clientX; DRAG.y = ev.clientY; };
    const up = ev => {
      removeEventListener("pointermove", move, true); removeEventListener("pointerup", up, true);
      const d = DRAG; DRAG = null; EXC.t0 = 0; EXC.dur = 2400;
      const rs = roofCache || roofs(), t = performance.now();
      // il tetto più vicino sotto il punto in cui la si lascia
      const tgt = rs.filter(r => ev.clientX > r.a - 30 && ev.clientX < r.b + 30)
                    .map(r => ({ r, dy: Math.abs(r.y() - ev.clientY - 20) })).sort((a, b) => a.dy - b.dy)[0];
      const home = d.home;
      if (!tgt || tgt.dy > 90 || same(tgt.r, home.roof)) {          // lasciata sul suo tetto: non succede niente
        cow.roof = home.roof; cow.x = Math.max(home.roof.a, Math.min(home.roof.b, ev.clientX)); return;
      }
      if (tgt.r.kind !== "spot") {                                    // su un progetto: ci resta, senza eccitarsi
        cow.roof = tgt.r; cow.x = Math.max(tgt.r.a, Math.min(tgt.r.b, ev.clientX)); startStay(t); return;
      }
      // portata in uno stato eccitato: torna subito a quello di partenza ed emette il fotone
      const x0 = Math.max(tgt.r.a, Math.min(tgt.r.b, ev.clientX));
      cow.roof = tgt.r; cow.x = x0;
      const x1 = Math.max(home.roof.a, Math.min(home.roof.b, home.x));
      cow.dir = x1 >= x0 ? 1 : -1;
      cow.jump = { t0: t - 180, dur: 1300, x0, y0: tgt.r.y(), x1, to: home.roof, h: 110 + Math.abs(x1 - x0) * .25, hot: true };
    };
    addEventListener("pointermove", move, true); addEventListener("pointerup", up, true);
  }, true);
  addEventListener("pointermove", e => {
    const c = window.MILK_COW;
    if (!light() || !c || DRAG) return;
    const near = Math.hypot(e.clientX - c.x, e.clientY - (c.y - 22)) < 34;
    if (near !== !!document.documentElement.dataset.cowgrab) { if (near) document.documentElement.dataset.cowgrab = 1; else delete document.documentElement.dataset.cowgrab; }
  }, { passive: true });

  // ================== guida degli strumenti (tema chiaro) ==================
  const tHelp = document.createElement("div"); tHelp.className = "cowtool cowq"; tHelp.title = "Cosa fanno questi strumenti";
  tHelp.innerHTML = '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" fill="none" stroke="#7a4fd0" stroke-width="1.8"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.6 2.2c-.7.4-1.1.9-1.1 1.8M12 16.6v.2" fill="none" stroke="#7a4fd0" stroke-width="1.8" stroke-linecap="round"/></svg>';
  dock.prepend(tHelp);
  const helpBox = document.createElement("div"); helpBox.className = "cowhelp"; helpBox.hidden = true;
  const row = (svg, title, text, eq, col) => `<div class="hr" style="--hc:${col}"><div class="hi">${svg}</div><div><div class="ht"><b>${title}</b><span class="heq">${eq}</span></div><p>${text}</p></div></div>`;
  const COWPIC = '<svg viewBox="0 0 160 120"><g transform="translate(66 104) scale(1.45)"><ellipse cx="0" cy="-26" rx="26" ry="14" fill="#fbf7ef" stroke="#2a2236" stroke-width="2"/><ellipse cx="-8" cy="-30" rx="8" ry="5" fill="#7a4fd0"/><ellipse cx="9" cy="-22" rx="6" ry="4" fill="#db6a2c"/><circle cx="28" cy="-36" r="10" fill="#fbf7ef" stroke="#2a2236" stroke-width="2"/><ellipse cx="33" cy="-31" rx="6" ry="4" fill="#f0b3bd"/><circle cx="26" cy="-39" r="1.6" fill="#2a2236"/><path d="M-16 -14v14M-6 -14v14M8 -14v14M18 -14v14" stroke="#e7dccb" stroke-width="5" stroke-linecap="round"/></g></svg>';
  helpBox.innerHTML = `<div class="hc">
    <div class="hhead"><svg class="hatom" viewBox="0 0 120 120" aria-hidden="true">
      <g fill="none" stroke-width="1.4"><ellipse cx="60" cy="60" rx="54" ry="18" stroke="#7a4fd0" opacity=".55"/><ellipse cx="60" cy="60" rx="54" ry="18" stroke="#db6a2c" opacity=".55" transform="rotate(60 60 60)"/><ellipse cx="60" cy="60" rx="54" ry="18" stroke="#7a4fd0" opacity=".55" transform="rotate(-60 60 60)"/></g>
      <circle cx="60" cy="60" r="9" fill="#db6a2c"/><circle cx="56" cy="57" r="4" fill="#7a4fd0"/><circle cx="114" cy="60" r="4" fill="#7a4fd0"/><circle cx="33" cy="13" r="4" fill="#db6a2c"/></svg>
      <div><div class="hkick">MILKeX · laboratorio</div><h3>La mucca di Schrödinger</h3><p class="hs">Quattro esperimenti di meccanica quantistica da fare tra un capitolo e l'altro.</p></div>
      <button class="hx" aria-label="Chiudi">×</button></div>
    <div class="hgrid">
    ${row(COWPIC, "La mucca", "Cammina sui progetti e si riposa sugli orbitali. <b>Prendila e trascinala</b> su un altro orbitale: la porti in uno stato eccitato, lei torna da sola allo stato di partenza ed <b>emette un fotone</b>.", "E₂ → E₁ + ħω", "#7a4fd0")}
    ${row(BIG_SLING_SVG, "Fionda a raggi gamma", "Clic sull'icona: compare la fionda in basso al centro. <b>Tendi l'elastico</b>, mira alla mucca e lascia. Colpita, salta eccitata su un altro orbitale, torna indietro ed emette un fotone.", "E = hν", "#3fb87a")}
    ${row(boxSvg(true), "Scatola di Schrödinger", "<b>Trascinala sulla mucca</b> per chiuderla dentro: così non disturba mentre studi. Un clic sulla scatola la apre e la mucca esce.", "|ψ⟩ = α|viva⟩ + β|morta⟩", "#b98048")}
    ${row(scanSvg, "Scanner a raggi X", "Compare quando la mucca è nella scatola. <b>Passalo sopra</b>: vedi dentro solo la parte che copri. Ogni passaggio è una nuova misura: viva o morta, 50% e 50%.", "|α|² = |β|² = ½", "#47c6d6")}
    </div>
    <div class="hfoot">Le animazioni si regolano con il cursore <b>Prestazioni ↔ Qualità</b> nella barra laterale.</div>
  </div>`;
  document.body.append(helpBox);
  const css3 = document.createElement("style");
  css3.textContent = `.cowq svg{width:30px!important;height:30px!important}
html[data-cowgrab]{cursor:grab}
.cowhelp{position:fixed;inset:0;z-index:90;display:grid;place-items:center;background:rgba(29,23,38,.28);backdrop-filter:blur(6px);padding:16px;animation:hIn .25s ease}
@keyframes hIn{from{opacity:0}}
.cowhelp[hidden]{display:none}
.cowhelp .hc{position:relative;width:min(760px,100%);max-height:calc(100vh - 32px);overflow:auto;border-radius:30px;padding:0 0 18px;
  background:var(--milk);border:1px solid var(--line);box-shadow:0 30px 80px -20px rgba(29,23,38,.45);animation:hUp .35s cubic-bezier(.2,.9,.3,1.1)}
@keyframes hUp{from{transform:translateY(14px) scale(.98)}}
.cowhelp .hhead{position:relative;display:flex;gap:18px;align-items:center;padding:26px 28px 22px;border-bottom:1px dashed var(--line-2);
  background:linear-gradient(var(--line) 1px,transparent 1px) 0 0/22px 22px,linear-gradient(90deg,var(--line) 1px,transparent 1px) 0 0/22px 22px,
  radial-gradient(ellipse 70% 120% at 0% 0%,rgba(122,79,208,.1),transparent 70%),radial-gradient(ellipse 60% 120% at 100% 100%,rgba(219,106,44,.1),transparent 70%)}
.cowhelp .hatom{width:88px;height:88px;flex:none;animation:hSpin 24s linear infinite}
@keyframes hSpin{to{transform:rotate(360deg)}}
.cowhelp .hkick{font-family:var(--font-mono);font-size:11px;letter-spacing:.08em;color:var(--orange-500);text-transform:uppercase}
.cowhelp h3{font-family:var(--font-tex);font-weight:400;font-size:32px;margin:2px 0;color:var(--ink);line-height:1.1}
.cowhelp .hs{font-family:var(--font-tex);font-style:italic;color:var(--ink-3);margin:0;font-size:15px}
.cowhelp .hgrid{display:grid;grid-template-columns:1fr 1fr;gap:12px;padding:18px 22px 6px}
.cowhelp .hr{position:relative;display:flex;flex-direction:column;gap:10px;padding:14px;border-radius:20px;background:var(--panel2);border:1px solid var(--line);overflow:hidden}
.cowhelp .hr::before{content:"";position:absolute;left:0;top:0;right:0;height:3px;background:var(--hc)}
.cowhelp .hi{height:92px;display:grid;place-items:center;border-radius:14px;background:var(--milk);
  background-image:linear-gradient(var(--line) 1px,transparent 1px),linear-gradient(90deg,var(--line) 1px,transparent 1px);background-size:14px 14px}
.cowhelp .hi svg{width:86px;height:78px}
.cowhelp .ht{display:flex;justify-content:space-between;align-items:baseline;gap:8px;flex-wrap:wrap}
.cowhelp .ht b{font-family:var(--font-tex);font-weight:400;font-size:19px;color:var(--ink)}
.cowhelp .heq{font-family:var(--font-tex);font-style:italic;font-size:13px;color:var(--hc);background:var(--milk);border:1px solid var(--line);padding:1px 8px;border-radius:999px}
.cowhelp .hr p{margin:4px 0 0;color:var(--ink-2);font-size:.88rem;line-height:1.45}.cowhelp .hr p b{font-weight:500;color:var(--ink)}
.cowhelp .hfoot{margin:10px 24px 0;font-size:12.5px;color:var(--ink-3);text-align:center;font-family:var(--font-mono)}
.cowhelp .hx{position:absolute;right:16px;top:16px;width:36px;height:36px;border-radius:50%;border:1px solid var(--line-2);background:var(--milk);font-size:20px;cursor:pointer;color:var(--ink-2)}
@media (max-width:640px){.cowhelp .hgrid{grid-template-columns:1fr}.cowhelp .hhead{padding:20px 18px 16px;gap:12px}.cowhelp .hatom{width:58px;height:58px}.cowhelp h3{font-size:25px}.cowhelp .hi{height:76px}}`;
  document.head.append(css3);
  tHelp.addEventListener("click", () => { helpBox.hidden = false; });
  helpBox.addEventListener("click", e => { if (e.target === helpBox || e.target.closest(".hx")) helpBox.hidden = true; });
  if (BOX.state === "closing") BOX.state = "boxed";
  paintTools();
  requestAnimationFrame(frame);
})();
