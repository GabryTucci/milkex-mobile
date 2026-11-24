/* MILKeX — schermata di avvio, nei due temi della home.
   Chiaro (mondo quantistico): carta millimetrata color latte; una nuvola di probabilità a due lobi
   (arancione dove ψ > 0, viola dove ψ < 0) "collassa" nella μ del logo, e poi un elettrone le gira attorno.
   Scuro (spazio): cielo stellato; le stelle convergono lasciando una scia e formano la μ, che si accende
   con un alone; passa una cometa. Il tema è quello dell'ultimo avvio (salvato nelle impostazioni).
   Va incluso subito dopo <div id="splash">: parte appena common.js aggiunge la classe "go". */
(() => {
  const sp = document.getElementById("splash");
  if (!sp) return;
  const root = document.documentElement;
  const dark = root.dataset.theme === "dark";
  const still = root.classList.contains("noanim") || matchMedia("(prefers-reduced-motion: reduce)").matches;
  const css = document.createElement("style");
  css.textContent = `
#splash{background:${dark ? "radial-gradient(ellipse 70% 50% at 70% 0%,rgba(122,79,208,.18),transparent 70%),#100c1b" : "#f6f1e8"}!important;color:${dark ? "#efeaf8" : "#1d1726"}!important}
#splash .sp-drop{width:240px!important;height:240px!important;margin-bottom:10px!important}
#splash .sp-drop::before,#splash .sp-ripple,#splash .sp-drip{display:none!important}
#splash .sp-drop>svg{position:absolute!important;width:0!important;height:0!important;visibility:hidden!important;animation:none!important}
#splash canvas.spc{position:fixed;inset:0;width:100vw;height:100vh;z-index:0;pointer-events:none}
#splash>*:not(canvas){position:relative;z-index:1}
#splash .sp-name{font-family:"Geist",system-ui,sans-serif;font-weight:600!important;font-size:36px!important;letter-spacing:-.01em!important;color:inherit!important;animation:spcUp .7s cubic-bezier(.2,.8,.2,1) 1.35s both!important}
#splash .sp-sub{font-family:"Geist Mono",ui-monospace,monospace!important;font-size:12px!important;letter-spacing:.04em!important;text-transform:none!important;color:${dark ? "#9a90b2" : "#7a7385"}!important;animation:spcUp .7s cubic-bezier(.2,.8,.2,1) 1.5s both!important}
#splash .sp-bar{width:160px!important;height:2px!important;background:${dark ? "rgba(239,234,248,.1)" : "rgba(29,23,38,.1)"}!important;margin-top:18px!important;animation:spcUp .5s ease 1.65s both!important}
#splash .sp-bar i{background:${dark ? "#f2914f" : "#db6a2c"}!important}
#splash .sp-msg{font-family:"Geist Mono",ui-monospace,monospace;font-size:11.5px!important;color:${dark ? "#9a90b2" : "#7a7385"}!important;animation:spcUp .5s ease 1.8s both!important}
@keyframes spcUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
${still ? "#splash *{animation:none!important}#splash .sp-name,#splash .sp-sub,#splash .sp-bar,#splash .sp-msg{opacity:1!important;transform:none!important}" : ""}`;
  document.head.append(css);
  const cv = document.createElement("canvas");
  cv.className = "spc";
  sp.prepend(cv);
  const ctx = cv.getContext("2d");
  let W = 0, H = 0, D = 1;
  function size() { D = Math.min(2, devicePixelRatio || 1); W = innerWidth; H = innerHeight; cv.width = W * D; cv.height = H * D; }
  size(); addEventListener("resize", size);

  // ---------- il logo, disegnato una volta su un canvas a parte ----------
  const MU = ["M98 74V204", "M98 116v26c0 22 14 34 33 34s33-12 33-34V74", "M164 140c0 22 7 34 24 34"].map(d => new Path2D(d));
  const SPOTS = [["#7a4fd0", 101, 81, .62, 92, "M84 80c6-10 18-12 26-8 8 4 14 2 16 10 2 9-6 14-12 18-6 4-4 12-14 12-10 0-14-8-18-14-4-6-4-12 2-18z"],
    ["#db6a2c", 150, 163, .62, 174, "M132 162c6-8 16-8 22-4 6 4 14 0 18 8 4 8-2 14-8 18-6 4-10 10-20 8-10-2-18-6-18-14 0-6 2-10 6-16z"],
    ["#db6a2c", 169, 81, .62, 92, "M158 82c4-6 12-6 16-2 4 4 10 4 10 10 0 6-6 8-10 10-4 2-10 4-14 0-4-4-6-12-2-18z"],
    ["#7a4fd0", 88, 168, .62, 179, "M80 170c4-6 12-6 16-2 4 4 8 8 6 14-2 6-8 8-14 8-6 0-10-6-10-10 0-4-2-6 2-10z"],
    ["#7a4fd0", 176, 126, 1.25, 137, "M172 132c3-4 9-4 11 0 2 4 0 9-5 10-5 1-9-5-6-10z"],
    ["#db6a2c", 105, 120, 1.25, 131, "M100 128c3-4 9-3 10 1 1 4-3 8-7 7-4-1-6-5-3-8z"]].map(([c, x, y, s, y2, d]) => ({ c, x, y, s, y2, p: new Path2D(d) }));
  const muT = g => { g.translate(0, -11); g.translate(128, 128); g.transform(1, 0, Math.tan(-14 * Math.PI / 180), 1, 0, 0); g.translate(-128, -128); };
  const L = document.createElement("canvas"); L.width = L.height = 512;
  (() => {
    const g = L.getContext("2d"); g.scale(2, 2);
    g.save(); muT(g); g.strokeStyle = "#fff"; g.lineWidth = 30; g.lineCap = g.lineJoin = "round"; MU.forEach(p => g.stroke(p)); g.restore();
    g.globalCompositeOperation = "source-atop";
    for (const s of SPOTS) { g.save(); g.translate(s.x, s.y); g.scale(s.s, s.s); g.translate(-s.x, -s.y2); g.fillStyle = s.c; g.fill(s.p); g.restore(); }
  })();
  // punti della μ, per le particelle
  const target = (() => {
    const c = document.createElement("canvas"); c.width = c.height = 256; const g = c.getContext("2d");
    muT(g); g.strokeStyle = "#000"; g.lineWidth = 26; g.lineCap = g.lineJoin = "round"; MU.forEach(p => g.stroke(p));
    const d = g.getImageData(0, 0, 256, 256).data, pts = [];
    for (let y = 0; y < 256; y += 3) for (let x = 0; x < 256; x += 3) if (d[(y * 256 + x) * 4 + 3] > 128) pts.push([x - 128, y - 128]);
    return pts;
  })();

  // ---------- particelle ----------
  const N = Math.min(target.length, 520);
  const R = () => Math.random();
  const gauss = () => (R() + R() + R() - 1.5) / 1.5;
  const parts = [];
  for (let k = 0; k < N; k++) {
    const [tx, ty] = target[Math.floor(R() * target.length)];
    let sx, sy, col;
    if (dark) {                       // stelle sparse in tutto il cielo
      const a = R() * 6.283, r = 260 + R() * Math.max(innerWidth, innerHeight) * .6;
      sx = Math.cos(a) * r; sy = Math.sin(a) * r;
      col = ["#ffffff", "#fff4e6", "#ffd9b8", "#d9ccff", "#c4a8ff"][Math.floor(R() * 5)];
    } else {                          // nuvola di probabilità a due lobi, orbitale p
      const lobe = R() < .5 ? -1 : 1;
      sx = gauss() * 70; sy = lobe * (70 + Math.abs(gauss()) * 70);
      col = lobe > 0 ? "#f0884a" : "#7b4fd6";
    }
    parts.push({ sx, sy, tx, ty, col, del: R() * .35, ph: R() * 6.28 });
  }
  const stars = Array.from({ length: 220 }, () => ({ x: R(), y: R(), r: R() < .08 ? 1.3 + R() : .3 + R() * .7, a: .2 + R() * .6, tw: R() * 6.28,
    c: ["#ffffff", "#fff4e6", "#ffd9b8", "#d9ccff", "#c4a8ff", "#bcd4ff"][Math.floor(R() * 6)] }));

  const ease = u => u <= 0 ? 0 : u >= 1 ? 1 : 1 - Math.pow(1 - u, 3);
  const sm = u => u <= 0 ? 0 : u >= 1 ? 1 : u * u * (3 - 2 * u);
  let t0 = 0;
  function frame(now) {
    if (!document.body.contains(sp)) return;
    requestAnimationFrame(frame);
    if (!sp.classList.contains("go")) return;
    if (!t0) t0 = now;
    const t = still ? 4000 : now - t0;
    const cx = W / 2, cy = sp.querySelector(".sp-drop").getBoundingClientRect().top + 120, S = 200 / 256;
    ctx.setTransform(D, 0, 0, D, 0, 0); ctx.clearRect(0, 0, W, H);
    // sfondo: carta millimetrata o cielo
    if (dark) {
      for (const s of stars) { ctx.globalAlpha = s.a * (.7 + .3 * Math.sin(t * .002 + s.tw)); ctx.fillStyle = s.c; ctx.beginPath(); ctx.arc(s.x * W, s.y * H, s.r, 0, 6.283); ctx.fill(); }
      ctx.globalAlpha = 1;
    } else {
      ctx.strokeStyle = "rgba(29,23,38,.05)"; ctx.lineWidth = 1; ctx.beginPath();
      for (let x = (W / 2) % 24; x < W; x += 24) { ctx.moveTo(x + .5, 0); ctx.lineTo(x + .5, H); }
      for (let y = (cy) % 24; y < H; y += 24) { ctx.moveTo(0, y + .5); ctx.lineTo(W, y + .5); }
      ctx.stroke();
    }
    // 1) le particelle convergono nella μ (il "collasso")
    const logoIn = sm((t - 1250) / 450);
    if (logoIn < 1) for (const p of parts) {
      const u = ease((t - 150 - p.del * 900) / 1100);
      const wob = (1 - u) * (dark ? 0 : 6);
      const x = cx + (p.sx + (p.tx * S - p.sx) * u) + Math.sin(t * .004 + p.ph) * wob;
      const y = cy + (p.sy + (p.ty * S - p.sy) * u) + Math.cos(t * .005 + p.ph) * wob;
      ctx.globalAlpha = (1 - logoIn) * (dark ? .9 : .7) * Math.min(1, t / 250);
      ctx.fillStyle = p.col;
      if (dark && u > 0 && u < 1) {     // scia delle stelle in arrivo
        const px = cx + (p.sx + (p.tx * S - p.sx) * Math.max(0, u - .06)), py = cy + (p.sy + (p.ty * S - p.sy) * Math.max(0, u - .06));
        ctx.strokeStyle = p.col; ctx.lineWidth = 1; ctx.globalAlpha *= .5; ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(x, y); ctx.stroke(); ctx.globalAlpha /= .5;
      }
      ctx.fillRect(x - 1.1, y - 1.1, 2.2, 2.2);
    }
    // 2) il logo vero si accende al posto delle particelle
    if (logoIn > 0) {
      ctx.save(); ctx.translate(cx, cy); ctx.scale(S, S); ctx.translate(-128, -128);
      const pop = 1 + (1 - logoIn) * .06; ctx.translate(128, 128); ctx.scale(pop, pop); ctx.translate(-128, -128);
      ctx.globalAlpha = logoIn;
      if (dark) { ctx.shadowColor = "rgba(196,168,255,.6)"; ctx.shadowBlur = 40 + 10 * Math.sin(t * .003); }
      ctx.fillStyle = "#1d1726"; ctx.beginPath(); ctx.arc(128, 128, 122, 0, 6.283); ctx.fill();
      ctx.shadowBlur = 0;
      ctx.drawImage(L, 0, 0, 256, 256);
      // anello del logo che si disegna
      const ring = sm((t - 1450) / 800);
      if (ring > 0) {
        const g = ctx.createLinearGradient(0, 0, 256, 256); g.addColorStop(0, "#7a4fd0"); g.addColorStop(1, "#db6a2c");
        ctx.strokeStyle = g; ctx.lineWidth = 10; ctx.lineCap = "round"; ctx.beginPath(); ctx.arc(128, 128, 115, -Math.PI / 2, -Math.PI / 2 + ring * 6.283); ctx.stroke();
      }
      ctx.restore();
    }
    // 3) dopo: un elettrone in orbita (chiaro) o una cometa che passa (scuro)
    const after = t - 2000;
    if (after > 0 && !still) {
      if (!dark) {
        const a = after * .0032, rx = 150, ry = 46, rot = -.45;
        ctx.save(); ctx.translate(cx, cy); ctx.rotate(rot);
        ctx.globalAlpha = Math.min(1, after / 600) * .5; ctx.strokeStyle = "#7b4fd6"; ctx.setLineDash([2, 6]); ctx.lineWidth = 1;
        ctx.beginPath(); ctx.ellipse(0, 0, rx, ry, 0, 0, 6.283); ctx.stroke(); ctx.setLineDash([]);
        const ex = Math.cos(a) * rx, ey = Math.sin(a) * ry, front = Math.sin(a) > 0;
        ctx.globalAlpha = Math.min(1, after / 600) * (front ? 1 : .45);
        for (let k = 6; k > 0; k--) { const b = a - k * .07; ctx.fillStyle = `rgba(240,136,74,${.12 * (6 - k) / 6})`; ctx.beginPath(); ctx.arc(Math.cos(b) * rx, Math.sin(b) * ry, 3, 0, 6.283); ctx.fill(); }
        ctx.fillStyle = "#f0884a"; ctx.beginPath(); ctx.arc(ex, ey, 4, 0, 6.283); ctx.fill();
        ctx.restore();
      } else {
        const u = after / 2600;
        if (u < 1) {
          const x = -100 + (W + 200) * u, y = H * .18 + u * H * .3, I = Math.sin(Math.PI * u);
          const g = ctx.createLinearGradient(x, y, x - 220, y - 72);
          g.addColorStop(0, `rgba(255,240,225,${.9 * I})`); g.addColorStop(.3, `rgba(255,184,137,${.4 * I})`); g.addColorStop(1, "rgba(196,168,255,0)");
          ctx.strokeStyle = g; ctx.lineCap = "round";
          for (const [w, a] of [[7, .2], [2.6, .6], [1.1, 1]]) { ctx.globalAlpha = a; ctx.lineWidth = w; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 220, y - 72); ctx.stroke(); }
          ctx.globalAlpha = I; ctx.shadowColor = "#ffd9b8"; ctx.shadowBlur = 20; ctx.fillStyle = "#fff8f0"; ctx.beginPath(); ctx.arc(x, y, 2.6, 0, 6.283); ctx.fill(); ctx.shadowBlur = 0;
        }
      }
      ctx.globalAlpha = 1;
    }
  }
  requestAnimationFrame(frame);
})();
