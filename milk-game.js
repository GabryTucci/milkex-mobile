/* MILKeX — Nightmare before the exam (solo tema scuro, nella home).
   La mucca astronauta difende MILKeX dagli alieni dei concetti che fanno paura (Fourier, Jacobiano, tensori…).
   Clic sull'icona in basso a destra: si apre a tutto schermo; un nuovo clic torna alla home.
   Comandi: ← → o A D per muoversi, Spazio per sparare; con mouse o dito la mucca segue il puntatore e spara da sola.
   Record personale salvato sul computer; classifica di tutti gli utenti di MILKeX su GitHub. */
(() => {
  if (!document.querySelector("main")) return;
  const dark = () => document.documentElement.dataset.theme === "dark";
  const css = document.createElement("style");
  css.textContent = `
.gamebtn{position:fixed;right:22px;bottom:22px;z-index:8100;width:64px;height:58px;border-radius:18px;display:grid;place-items:center;cursor:pointer;
  background:#1a1529;border:1px solid rgba(239,234,248,.12);box-shadow:0 6px 18px rgba(0,0,0,.4);transition:transform .15s}
.gamebtn:hover{transform:translateY(-2px)}.gamebtn svg{width:42px;height:36px}
.gamebtn.on{background:#f2914f}
:root:not([data-theme="dark"]) .gamebtn,html.noanim .gamebtn{display:none}
@media (max-width:699px){.gamebtn{right:12px;bottom:calc(12px + env(safe-area-inset-bottom));width:48px;height:44px;border-radius:14px}.gamebtn svg{width:32px;height:28px}}
.mxgame{position:fixed;inset:0;z-index:8000;background:#0b0814;touch-action:none;cursor:crosshair}
.mxgame[hidden]{display:none}
.mxgame canvas{position:absolute;inset:0;width:100%;height:100%}
.mxhud{position:absolute;left:0;right:0;top:0;display:flex;justify-content:space-between;align-items:center;padding:14px 22px;color:#efeaf8;
  font-family:"Geist Mono",ui-monospace,monospace;font-size:14px;pointer-events:none}
.mxhud .lives{display:flex;gap:6px;padding:6px 12px;border-radius:999px;background:rgba(26,21,41,.85);border:1px solid rgba(239,234,248,.14)}
.mxhud .lives svg{width:30px;height:25px;transition:opacity .3s,filter .3s}
.mxhud .lives svg.off{opacity:.22;filter:grayscale(1)}
.mxhud{font-family:"UnifrakturMaguntia","Old English Text MT",serif!important;font-size:18px!important;color:#e9dcc0!important}
.mxover p,.mxover small,.mxover ol,.mxover button,.mxintro .legend{font-family:"Latin Modern","CMU Serif",Georgia,serif!important}
.mxover p{font-size:16px!important;font-style:italic;color:#d9cfe8!important}
.mxover button{font-size:18px!important;font-weight:400!important;letter-spacing:.02em}
.mxover ol{font-size:15px!important}
.mxintro .legend{display:grid;grid-template-columns:1fr 1fr;gap:6px 18px;text-align:left;margin:6px auto 14px;max-width:480px;font-size:14px}
.mxintro .legend .lt{grid-column:1/-1;font-family:"UnifrakturMaguntia","Old English Text MT",serif;color:#e9dcc0;font-size:17px;text-align:center;margin-bottom:2px}
.mxintro .legend .li{display:grid;grid-template-columns:24px auto;column-gap:8px;align-items:center}
.mxintro .legend .li b{font-weight:400}.mxintro .legend .li span{grid-column:2;color:#b5aacb;font-style:italic;font-size:13px;line-height:1.2}
.mxhud b{font-family:"Latin Modern",serif;font-weight:400;font-size:22px;color:#f2914f}
.mxover{position:absolute;inset:0;display:grid;place-items:center;pointer-events:none}
.mxover>div{pointer-events:auto;background:rgba(26,21,41,.92);border:1px solid rgba(239,234,248,.12);border-radius:24px;padding:26px 30px;color:#efeaf8;
  text-align:center;min-width:280px;max-width:92vw;font-family:"Geist",system-ui,sans-serif;box-shadow:0 20px 50px rgba(0,0,0,.5)}
.mxover h2{font-family:"Latin Modern",serif;font-weight:400;font-size:30px;margin:0 0 6px}
.mxover p{color:#b5aacb;margin:6px 0 14px;line-height:1.45}
.mxover button{background:#f2914f;color:#1d1222;border:0;border-radius:999px;padding:10px 22px;font:inherit;font-weight:600;cursor:pointer}
.mxover ol{text-align:left;margin:10px auto 16px;padding-left:22px;font-family:"Geist Mono",monospace;font-size:13px;color:#d9ccff;max-width:260px}
.mxover ol li.me{color:#f2914f}
.mxover small{display:block;color:#9a90b2;font-size:12px;margin-top:8px}
.mxintro{position:relative;overflow:hidden;padding:34px 40px 28px!important;min-width:min(560px,92vw)!important;
  background:radial-gradient(ellipse 80% 60% at 50% 0%,rgba(180,30,50,.28),transparent 70%),linear-gradient(180deg,#1a1022,#0d0814)!important;border-color:rgba(242,145,79,.25)!important}
.mxintro .clock{font-family:"Geist Mono",monospace;font-size:13px;color:#ff6f7a;letter-spacing:.1em;margin-bottom:6px;animation:mxBlink 1s steps(2) infinite}
.mxintro .clock span{color:#9a90b2}
@keyframes mxBlink{50%{opacity:.45}}
.mxintro h2.goth{font-family:"UnifrakturMaguntia","Old English Text MT","Blackletter","Fraktur",serif!important;font-size:64px!important;line-height:1;margin:2px 0 0!important;
  color:#f3e7d8;text-shadow:0 0 18px rgba(255,60,80,.55),0 0 2px #ff3c50,0 4px 0 #3a0a14;letter-spacing:.01em}
.mxintro .drip{display:block;height:22px;width:62%;margin:-2px auto 0;filter:drop-shadow(0 0 6px rgba(200,36,60,.5))}
.mxintro .clock b{font-weight:500;color:#ff6f7a}
.mxintro .sub{font-family:"Latin Modern",serif;font-style:italic;font-size:26px;color:#c4a8ff;margin:4px 0 2px}
.mxintro .eqs{font-family:"Latin Modern",serif;font-style:italic;color:rgba(196,168,255,.55);font-size:14px;margin:10px 0 4px;letter-spacing:.04em}
.mxintro .ghost{position:absolute;font-family:"Latin Modern",serif;font-style:italic;color:rgba(242,145,79,.16);pointer-events:none;animation:mxFloat 6s ease-in-out infinite}
@keyframes mxFloat{50%{transform:translateY(-10px) rotate(-4deg)}}
.mxintro button{margin-top:6px;font-size:16px;padding:12px 30px;box-shadow:0 0 22px rgba(242,145,79,.4)}`;
  document.head.append(css);
  const ICON = `<svg viewBox="0 0 48 40"><ellipse cx="24" cy="31" rx="18" ry="6" fill="#2a2140" stroke="#c4a8ff" stroke-width="1.4"/>
<circle cx="14" cy="32" r="1.6" fill="#f2914f"/><circle cx="24" cy="32.5" r="1.6" fill="#f2914f"/><circle cx="34" cy="32" r="1.6" fill="#f2914f"/>
<ellipse cx="24" cy="24" rx="10" ry="6" fill="#fbf7ef"/><ellipse cx="20.5" cy="22.5" rx="3.4" ry="2.4" fill="#7a4fd0"/><ellipse cx="28" cy="25" rx="2.6" ry="2" fill="#db6a2c"/>
<path d="M19 9l-2-4M29 9l2-4" stroke="#e9dcc0" stroke-width="1.6" stroke-linecap="round"/><circle cx="24" cy="13" r="5.6" fill="#fbf7ef"/>
<ellipse cx="24" cy="16" rx="3.2" ry="2" fill="#f0b3bd"/><circle cx="22" cy="11.6" r="1" fill="#1d1726"/><circle cx="26" cy="11.6" r="1" fill="#1d1726"/>
<circle cx="24" cy="13" r="9" fill="rgba(188,212,255,.18)" stroke="rgba(220,232,255,.9)" stroke-width="1.2"/></svg>`;
  const btn = document.createElement("div"); btn.className = "gamebtn"; btn.title = "Nightmare before the exam: clic per giocare, di nuovo clic per tornare"; btn.innerHTML = ICON;
  document.body.append(btn);
  const box = document.createElement("div"); box.className = "mxgame"; box.hidden = true;
  box.innerHTML = '<canvas></canvas><div class="mxhud"><span>Punti <b id="gS">0</b></span><span id="gL" class="lives"></span><span>Record <b id="gR">0</b></span></div><div class="mxover" id="gO"></div>';
  document.body.append(box);
  const cv = box.querySelector("canvas"), ctx = cv.getContext("2d"), over = box.querySelector("#gO");
  let W = 0, H = 0, D = 1;
  const size = () => { D = Math.min(2, devicePixelRatio || 1); W = innerWidth; H = innerHeight; cv.width = W * D; cv.height = H * D; };
  addEventListener("resize", () => { if (!box.hidden) size(); });

  // ---------- alieni: concetti di fisica e matematica che fanno paura ----------
  // ogni alieno è il disegno del concetto, con gli occhi: la paura prende forma
  const SCARY = [
    ["Fourier", "#c4a8ff", (c, k) => { c.beginPath(); for (let x = -18; x <= 18; x += 1.5) { const y = -6 * Math.sin(x * .35 + k) - 3 * Math.sin(x * 1.05 + 2 * k) - 2 * Math.sin(x * 1.75); x === -18 ? c.moveTo(x, y) : c.lineTo(x, y); } c.lineTo(18, 10); c.lineTo(-18, 10); c.closePath(); c.fill(); }],
    ["Dirac", "#f2914f", (c, k) => { c.beginPath(); c.moveTo(-18, 10); c.lineTo(-3, 9); c.lineTo(0, -20 - 3 * Math.sin(k * 2)); c.lineTo(3, 9); c.lineTo(18, 10); c.lineTo(18, 13); c.lineTo(-18, 13); c.closePath(); c.fill(); }],
    ["tensore", "#bcd4ff", (c, k) => { for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) c.fillRect(-12 + i * 9, -12 + j * 9 + (i === 1 ? Math.sin(k) * 1.5 : 0), 7, 7); c.fillRect(-17, -14, 2, 28); c.fillRect(15, -14, 2, 28); c.fillRect(-17, -14, 5, 2); c.fillRect(-17, 12, 5, 2); c.fillRect(12, -14, 5, 2); c.fillRect(12, 12, 5, 2); }],
    ["spinore", "#a184ec", (c, k) => { c.save(); c.rotate(k * 1.5); c.lineWidth = 5; c.beginPath(); c.arc(0, 0, 13, .3, 5.6); c.stroke(); c.beginPath(); c.moveTo(13 * Math.cos(5.6) + 6, 13 * Math.sin(5.6) - 2); c.lineTo(13 * Math.cos(5.6) - 3, 13 * Math.sin(5.6) - 7); c.lineTo(13 * Math.cos(5.6) - 2, 13 * Math.sin(5.6) + 5); c.fill(); c.restore(); }],
    ["Rotore", "#ffb889", (c, k) => { c.lineWidth = 4; c.beginPath(); for (let a = 0; a < 14; a += .2) { const r = 1 + a * 1.15; const x = r * Math.cos(a + k * 2), y = r * Math.sin(a + k * 2) * .8; a ? c.lineTo(x, y) : c.moveTo(x, y); } c.stroke(); }],
    ["Gaussiana", "#c4a8ff", (c, k) => { c.beginPath(); c.moveTo(-18, 12); for (let x = -18; x <= 18; x++) c.lineTo(x, 12 - 28 * Math.exp(-x * x / (40 + 8 * Math.sin(k)))); c.closePath(); c.fill(); }],
    ["Jacobiano", "#f2914f", (c, k) => { c.fillRect(-16, -14, 3, 28); c.fillRect(13, -14, 3, 28); c.font = "italic 13px 'Latin Modern',serif"; c.textAlign = "center"; c.fillText("∂x∂y", 0, -2); c.fillText("∂u∂v", 0, 11); }],
    ["Schrödinger", "#bcd4ff", (c, k) => { c.beginPath(); for (let x = -18; x <= 18; x++) { const y = -Math.exp(-x * x / 60) * 14 * Math.cos(x * .8 - k * 3); x === -18 ? c.moveTo(x, y) : c.lineTo(x, y); } c.lineWidth = 4; c.stroke(); }],
    ["Lorentz", "#a184ec", (c, k) => { c.beginPath(); c.moveTo(0, 0); c.lineTo(-15, -16); c.lineTo(15, -16); c.closePath(); c.moveTo(0, 0); c.lineTo(-15, 16); c.lineTo(15, 16); c.closePath(); c.fill(); c.fillRect(-1, -18, 2, 36); }],
    ["entropia", "#ffb889", (c, k) => { for (let i = 0; i < 16; i++) { const a = i * 2.39 + k * (i % 3 ? .6 : -.8), r = 4 + (i * 7) % 13; c.beginPath(); c.arc(Math.cos(a) * r, Math.sin(a) * r * .8, 2.6, 0, 6.283); c.fill(); } }],
    ["Riemann", "#c4a8ff", (c, k) => { c.lineWidth = 2.4; for (let i = -2; i <= 2; i++) { c.beginPath(); c.moveTo(-18, i * 6); c.quadraticCurveTo(0, i * 6 + 10 * Math.cos(k + i * .4) - 4, 18, i * 6); c.stroke(); c.beginPath(); c.moveTo(i * 8, -14); c.quadraticCurveTo(i * 8 + 5, 0, i * 8, 14); c.stroke(); } }],
    ["Oscillatore armonico", "#bcd4ff", (c, k) => { const y = 6 * Math.sin(k * 2.2); c.fillRect(-14, -18, 28, 3); c.lineWidth = 2; c.beginPath(); c.moveTo(0, -15);
      for (let i = 1; i <= 8; i++) c.lineTo(i % 2 ? -6 : 6, -15 + i * (17 + y) / 8); c.lineTo(0, 2 + y); c.stroke(); c.fillRect(-9, 2 + y, 18, 12); }],
    ["Taylor", "#ffb889", (c, k) => { c.lineWidth = 3.4; c.beginPath(); for (let x = -18; x <= 18; x++) { const y = -9 * Math.sin(x / 7); x === -18 ? c.moveTo(x, y) : c.lineTo(x, y); } c.stroke();
      c.globalAlpha = .55; c.lineWidth = 1.8; const n = 1 + Math.floor(k) % 3; c.beginPath(); for (let x = -18; x <= 18; x++) { const u = x / 7; let s = 0, f = 1; for (let j = 0; j < n; j++) { const e = 2 * j + 1; f = j ? f * (e - 1) * e : 1; s += (j % 2 ? -1 : 1) * u ** e / f; } const y = Math.max(-16, Math.min(16, -9 * s)); x === -18 ? c.moveTo(x, y) : c.lineTo(x, y); } c.stroke(); c.globalAlpha = 1; }],
    ["Doppia fenditura", "#a184ec", (c, k) => { c.fillRect(-16, -16, 4, 10); c.fillRect(-16, -2, 4, 4); c.fillRect(-16, 6, 4, 10);
      for (let y = -15; y <= 15; y += 2) { const I = Math.cos(y * .55 + Math.sin(k) * .3) ** 2 * Math.exp(-y * y / 260); c.globalAlpha = .25 + .75 * I; c.fillRect(2, y, 6 + 10 * I, 1.6); } c.globalAlpha = 1; }],
    ["Navier-Stokes", "#f2914f", (c, k) => { c.beginPath(); c.moveTo(0, -18); c.bezierCurveTo(10, -6, 16, 2, 14, 8); c.bezierCurveTo(12, 16, -12, 16, -14, 8); c.bezierCurveTo(-16, 2, -10, -6, 0, -18); c.fill(); c.globalAlpha = .5; c.fillStyle = "#fff"; c.beginPath(); c.ellipse(-5 + Math.sin(k) * 2, 2, 3, 5, .4, 0, 6.283); c.fill(); c.globalAlpha = 1; }]];
  // un cuore disegnato come una μ: la gamba sinistra scende a punta, l'arco destro chiude il cuore
  const MUHEART = `<svg viewBox="0 0 30 26"><path d="M15 24C10 20 3 15 3 9C3 5 6 2.5 9.5 2.5C12 2.5 14 4 15 6C16 4 18 2.5 20.5 2.5C24 2.5 27 5 27 9C27 15 20 20 15 24Z" fill="#c8243c" stroke="#ff6f7a" stroke-width="1.2"/>
<path d="M11.5 7V21M11.5 10V14C11.5 16.5 13 17.6 15 17.6C17 17.6 18.5 16.5 18.5 14V7M18.5 14C18.5 16.5 19.2 17.6 20.6 17.6" fill="none" stroke="#fff4e6" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" transform="skewX(-10) translate(2 0)"/></svg>`;
  // ---------- aiuti dell'esame: cadono ogni tanto dagli alieni colpiti, si prendono con la mucca
  const HELPS = [
    { id: "form", name: "Formulario", desc: "scudo: ferma i colpi per 8 s", col: "#bcd4ff", d: "M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3zM8 20a3 3 0 0 1 0-6h11M9 8h6M9 11h4" },
    { id: "calc", name: "Calcolatrice", desc: "tre colpi alla volta per 8 s", col: "#f2914f", d: "M6 2h12v20H6zM8.5 4.5h7v4h-7zM9 12h1M12 12h1M15 12h1M9 15h1M12 15h1M15 15h1M9 18h1M12 18h4" },
    { id: "rule", name: "Righello", desc: "spari molto più veloce per 8 s", col: "#c4a8ff", d: "M3 15L15 3l6 6L9 21zM7 13l2 2M10 10l2 2M13 7l2 2M16 4l1 1" },
    { id: "gomma", name: "Gomma", desc: "cancella tutti i colpi nemici", col: "#ff9fb0", d: "M4 16l8-8 7 7-5 5H8zM11 9l7 7M8 20h12" },
    { id: "caffe", name: "Caffè", desc: "una vita in più", col: "#e9c49a", d: "M5 9h11v5a5 5 0 0 1-5 5h-1a5 5 0 0 1-5-5zM16 10h2a2 2 0 0 1 0 4h-2M8 3c0 2 2 2 2 4M12 3c0 2 2 2 2 4" }];
  HELPS.forEach(h => { h.p = new Path2D(h.d); });
  const helpSvg = (h, s = 26) => `<svg viewBox="0 0 24 24" width="${s}" height="${s}"><path d="${h.d}" fill="none" stroke="${h.col}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  let G = null;
  const rec = () => { try { return +localStorage.getItem("milkex.invaders") || 0; } catch { return 0; } };
  function newGame() {
    G = { ship: { x: W / 2, w: 46 }, shots: [], bombs: [], aliens: [], score: 0, lives: 3, wave: 0, dir: 1, speed: .03, last: 0, cool: 0,
      keys: {}, ptr: null, over: false, boom: [], drops: [], fx: {}, stars: Array.from({ length: 160 }, () => [Math.random() * W, Math.random() * H, Math.random() * 1.3 + .2]) };
    nextWave();
    over.innerHTML = ""; hud();
  }
  function nextWave() {
    G.wave++;
    const cols = Math.max(4, Math.min(8, Math.floor((W - 80) / 120))), rows = Math.min(5, 2 + G.wave);
    const gx = Math.min(130, (W - 80) / cols);
    G.aliens = [];
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) G.aliens.push({
      x: 60 + c * gx + gx / 2, y: 90 + r * 74, k: SCARY[(r * cols + c + G.wave * 5) % SCARY.length], ph: Math.random() * 6,
      pts: (rows - r) * 10 });
    G.speed = .03 + G.wave * .016 + Math.max(0, G.wave - 4) * .01; G.dir = 1;
  }
  function hud() {
    box.querySelector("#gS").textContent = G.score; box.querySelector("#gR").textContent = Math.max(rec(), G.score);
    box.querySelector("#gL").innerHTML = [0, 1, 2].map(i => MUHEART.replace("<svg ", `<svg class="${i < G.lives ? "" : "off"}" `)).join("");
  }
  function shoot() {
    if (G.cool > 0 || G.over) return;
    const fx = G.fx || {};
    if (fx.calc) for (const dx of [-14, 0, 14]) G.shots.push({ x: G.ship.x + dx, y: H - 86, vx: dx * .006 });
    else G.shots.push({ x: G.ship.x, y: H - 86, vx: 0 });
    G.cool = fx.rule ? 110 : 260;
  }
  function drawAlien(a, t) {
    const [name, col, draw] = a.k, k = t * .003 + a.ph;
    a.col = col; a.name = name;
    ctx.save(); ctx.translate(a.x, a.y + Math.sin(k) * 1.5); ctx.scale(1.35, 1.35);
    ctx.shadowColor = col; ctx.shadowBlur = 8; ctx.fillStyle = col; ctx.strokeStyle = col; ctx.lineCap = "round"; ctx.lineJoin = "round";
    draw(ctx, k);
    ctx.shadowBlur = 0;
    // gli occhi cattivi, che seguono la mucca
    const look = Math.max(-1.4, Math.min(1.4, (G.ship.x - a.x) / 120));
    for (const ex of [-6, 6]) {
      ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(ex, -3, 3.6, 0, 6.283); ctx.fill();
      ctx.fillStyle = "#1d1726"; ctx.beginPath(); ctx.arc(ex + look, -2, 1.8, 0, 6.283); ctx.fill();
    }
    ctx.strokeStyle = "#1d1726"; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(-9, -8); ctx.lineTo(-3, -6); ctx.moveTo(9, -8); ctx.lineTo(3, -6); ctx.stroke();
    ctx.restore();
    ctx.fillStyle = "rgba(239,234,248,.75)"; ctx.font = "italic 12px 'Latin Modern',serif"; ctx.textAlign = "center";
    ctx.fillText(name, a.x, a.y + 36);
  }
  function drawShip(t) {   // la mucca astronauta dentro la sua navicella
    const x = G.ship.x, y = H - 60;
    ctx.save(); ctx.translate(x, y);
    const g = ctx.createRadialGradient(0, 0, 4, 0, 0, 34); g.addColorStop(0, "rgba(242,145,79,.25)"); g.addColorStop(1, "rgba(242,145,79,0)");
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, 34, 0, 6.283); ctx.fill();
    ctx.fillStyle = "#2a2140"; ctx.strokeStyle = "#c4a8ff"; ctx.lineWidth = 1.6;
    ctx.beginPath(); ctx.ellipse(0, 10, 28, 9, 0, 0, 6.283); ctx.fill(); ctx.stroke();
    ctx.fillStyle = "#f2914f"; for (const k of [-16, 0, 16]) { ctx.beginPath(); ctx.arc(k, 11, 2.4, 0, 6.283); ctx.fill(); }
    // la mucca: corpo latte a macchie, testa con il casco
    ctx.fillStyle = "#fbf7ef"; ctx.beginPath(); ctx.ellipse(0, -2, 15, 9, 0, 0, 6.283); ctx.fill();
    ctx.fillStyle = "#7a4fd0"; ctx.beginPath(); ctx.ellipse(-5, -4, 5, 3.5, .3, 0, 6.283); ctx.fill();
    ctx.fillStyle = "#db6a2c"; ctx.beginPath(); ctx.ellipse(6, 0, 4, 3, -.3, 0, 6.283); ctx.fill();
    ctx.fillStyle = "#fbf7ef"; ctx.beginPath(); ctx.arc(0, -15, 7, 0, 6.283); ctx.fill();
    ctx.fillStyle = "#f0b3bd"; ctx.beginPath(); ctx.ellipse(0, -11, 4, 2.6, 0, 0, 6.283); ctx.fill();
    ctx.fillStyle = "#1d1726"; ctx.beginPath(); ctx.arc(-2.6, -17, 1.2, 0, 6.283); ctx.arc(2.6, -17, 1.2, 0, 6.283); ctx.fill();
    ctx.strokeStyle = "#e9dcc0"; ctx.lineWidth = 1.8; ctx.beginPath(); ctx.moveTo(-5, -20); ctx.lineTo(-8, -25); ctx.moveTo(5, -20); ctx.lineTo(8, -25); ctx.stroke();
    ctx.strokeStyle = "rgba(220,232,255,.85)"; ctx.fillStyle = "rgba(188,212,255,.16)"; ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.arc(0, -15, 12, 0, 6.283); ctx.fill(); ctx.stroke();
    ctx.restore();
  }
  function frame(t) {
    if (box.hidden) return;
    requestAnimationFrame(frame);
    const dt = Math.min(40, t - (G.last || t)); G.last = t;
    ctx.setTransform(D, 0, 0, D, 0, 0); ctx.fillStyle = "#0b0814"; ctx.fillRect(0, 0, W, H);
    for (const s of G.stars) { s[1] += s[2] * dt * .02; if (s[1] > H) s[1] = 0; ctx.fillStyle = `rgba(255,255,255,${.25 + s[2] * .4})`; ctx.fillRect(s[0], s[1], s[2], s[2]); }
    if (!G.over) {
      // movimento della mucca: tastiera o puntatore
      const sp = .45 * dt;
      if (G.keys.ArrowLeft || G.keys.a) G.ship.x -= sp;
      if (G.keys.ArrowRight || G.keys.d) G.ship.x += sp;
      if (G.ptr != null) { G.ship.x += Math.max(-sp, Math.min(sp, G.ptr - G.ship.x)); if (G.cool <= 0) shoot(); }
      if (G.keys[" "]) shoot();
      G.ship.x = Math.max(30, Math.min(W - 30, G.ship.x)); G.cool -= dt;
      // alieni: avanti e indietro, e scendono quando toccano il bordo
      let edge = false;
      for (const a of G.aliens) { a.x += G.dir * G.speed * dt; if (a.x < 40 || a.x > W - 40) edge = true; }
      if (edge) { G.dir *= -1; for (const a of G.aliens) { a.y += 18; a.x += G.dir * 4; } }
      if (G.aliens.length && Math.random() < dt * (.0009 + G.wave * .00045)) {
        const a = G.aliens[Math.floor(Math.random() * G.aliens.length)];
        const big = G.wave >= 3 && Math.random() < Math.min(.45, .12 + G.wave * .05);
        G.bombs.push({ x: a.x, y: a.y + 14, big, v: (big ? .2 : .28) + G.wave * .02 });
      }
      // aiuti: durata, effetti
      for (const k in G.fx) if (G.fx[k] < t) delete G.fx[k];
      // colpi
      for (let i = G.shots.length - 1; i >= 0; i--) {
        const s = G.shots[i]; s.y -= .7 * dt; s.x += (s.vx || 0) * dt;
        const hit = G.aliens.findIndex(a => Math.abs(a.x - s.x) < 24 && Math.abs(a.y - s.y) < 22);
        if (hit >= 0) { const a = G.aliens[hit]; G.score += a.pts;
          if (Math.random() < .11) G.drops.push({ x: a.x, y: a.y, h: HELPS[Math.floor(Math.random() * HELPS.length)] }); G.boom.push({ x: a.x, y: a.y, t, c: a.col, n: a.name }); G.aliens.splice(hit, 1); G.shots.splice(i, 1); hud(); continue; }
        if (s.y < -10) G.shots.splice(i, 1);
      }
      for (let i = G.bombs.length - 1; i >= 0; i--) {
        const b = G.bombs[i]; b.y += (b.v || .28) * dt;
        if (Math.abs(b.x - G.ship.x) < (b.big ? 36 : 24) && b.y > H - 84 && b.y < H - 36) {
          G.bombs.splice(i, 1);
          if (G.fx.form) { G.boom.push({ x: b.x, y: b.y, t, c: "#bcd4ff" }); continue; }   // il formulario para il colpo
          G.lives--; G.boom.push({ x: G.ship.x, y: H - 60, t, c: "#f2914f" }); hud(); if (G.lives <= 0) gameOver(); continue; }
        if (b.y > H) G.bombs.splice(i, 1);
      }
      // aiuti che cadono
      for (let i = G.drops.length - 1; i >= 0; i--) {
        const d = G.drops[i]; d.y += .12 * dt;
        if (Math.abs(d.x - G.ship.x) < 30 && d.y > H - 90 && d.y < H - 30) {
          const id = d.h.id; G.drops.splice(i, 1);
          if (id === "gomma") { for (const b of G.bombs) G.boom.push({ x: b.x, y: b.y, t, c: "#ff9fb0" }); G.bombs = []; }
          else if (id === "caffe") G.lives = Math.min(3, G.lives + 1);
          else G.fx[id] = t + 8000;
          G.boom.push({ x: G.ship.x, y: H - 90, t, c: d.h.col, n: d.h.name });
          hud(); continue;
        }
        if (d.y > H) G.drops.splice(i, 1);
      }
      if (G.aliens.some(a => a.y > H - 110)) gameOver();
      if (!G.aliens.length) nextWave();
    }
    // disegno
    for (const a of G.aliens) drawAlien(a, t);
    ctx.fillStyle = "#fff4e6"; for (const s of G.shots) { ctx.fillRect(s.x - 1.5, s.y - 10, 3, 12); }
    ctx.strokeStyle = "#f2914f"; ctx.lineWidth = 2;
    for (const b of G.bombs) {
      if (b.big) {                                  // una gaussiana che cade
        ctx.save(); ctx.fillStyle = "rgba(200,36,60,.85)"; ctx.shadowColor = "#ff3c50"; ctx.shadowBlur = 10; ctx.beginPath(); ctx.moveTo(b.x - 26, b.y);
        for (let x = -26; x <= 26; x += 2) ctx.lineTo(b.x + x, b.y - 22 * Math.exp(-x * x / 90)); ctx.closePath(); ctx.fill(); ctx.restore();
      } else { ctx.beginPath(); for (let k = 0; k < 4; k++) ctx.lineTo(b.x + (k % 2 ? 3 : -3), b.y - 12 + k * 4); ctx.stroke(); }
    }
    for (const d of G.drops) {
      ctx.save(); ctx.translate(d.x, d.y); ctx.fillStyle = "rgba(26,21,41,.9)"; ctx.strokeStyle = d.h.col; ctx.lineWidth = 1.4;
      ctx.shadowColor = d.h.col; ctx.shadowBlur = 12; ctx.beginPath(); ctx.roundRect(-17, -17, 34, 34, 9); ctx.fill(); ctx.stroke(); ctx.shadowBlur = 0;
      ctx.translate(-12, -12); ctx.lineWidth = 1.8; ctx.lineCap = ctx.lineJoin = "round"; ctx.stroke(d.h.p); ctx.restore();
      ctx.fillStyle = d.h.col; ctx.font = "italic 12px 'Latin Modern',serif"; ctx.textAlign = "center"; ctx.fillText(d.h.name, d.x, d.y + 30);
    }
    if (!G.over || G.lives > 0) drawShip(t);
    if (G.fx.form) { ctx.save(); ctx.strokeStyle = "rgba(188,212,255,.8)"; ctx.lineWidth = 2; ctx.shadowColor = "#bcd4ff"; ctx.shadowBlur = 14;
      ctx.beginPath(); ctx.arc(G.ship.x, H - 66, 40 + Math.sin(t * .01) * 2, Math.PI * 1.05, Math.PI * 1.95); ctx.stroke(); ctx.restore(); }
    // aiuti attivi, con il tempo che resta
    let ax = 22;
    for (const k in G.fx) { const h = HELPS.find(x => x.id === k), left = Math.max(0, (G.fx[k] - t) / 8000);
      ctx.save(); ctx.translate(ax, H - 40); ctx.strokeStyle = h.col; ctx.lineWidth = 1.8; ctx.lineCap = ctx.lineJoin = "round"; ctx.stroke(h.p);
      ctx.fillStyle = h.col; ctx.fillRect(0, 28, 24 * left, 3); ctx.restore(); ax += 36; }
    G.boom = G.boom.filter(e => {
      const u = (t - e.t) / 600; if (u >= 1) return false;
      ctx.fillStyle = e.c; ctx.globalAlpha = 1 - u;
      for (let k = 0; k < 14; k++) { const a = k / 14 * 6.283, r = u * 34; ctx.fillRect(e.x + Math.cos(a) * r - 2, e.y + Math.sin(a) * r - 2, 4, 4); }
      if (e.n) { ctx.font = "italic 13px 'Latin Modern',serif"; ctx.textAlign = "center"; ctx.fillText(HELPS.some(h => h.name === e.n) ? e.n + "!" : "capito!", e.x, e.y - 18 - u * 20); }
      ctx.globalAlpha = 1; return true;
    });
  }
  // ---------- fine partita, record e classifica ----------
  // MILKeX Mobile: la stessa classifica, letta e scritta direttamente su GitHub (issue "classifica")
  const MX_REPO = "GabryTucci/Milkex";
  async function ghScore(score) {
    const tok = window.MX_GH_TOKEN(), H = { Authorization: "Bearer " + tok, Accept: "application/vnd.github+json" };
    const gh = (path, opt = {}) => fetch("https://api.github.com" + path, { ...opt, headers: { ...H, ...(opt.body ? { "Content-Type": "application/json" } : {}) } }).then(r => r.ok ? r.json() : Promise.reject(r.status));
    const me = (await gh("/user")).login;
    let iss = (await gh(`/repos/${MX_REPO}/issues?labels=classifica&state=all&per_page=5`))[0];
    if (!iss) iss = await gh(`/repos/${MX_REPO}/issues`, { method: "POST", body: JSON.stringify({ title: "Classifica di Mucca Invaders", body: "Record dei giocatori di MILKeX.", labels: ["classifica"] }) });
    const read = async () => (await gh(`/repos/${MX_REPO}/issues/${iss.number}/comments?per_page=100`)).map(c => { const m = /<!--\s*milkex-score:\s*([^,>]+),\s*(\d+)\s*-->/.exec(c.body || ""); return m && { login: m[1].trim(), score: +m[2], id: c.id }; }).filter(Boolean);
    let rows = await read();
    if (score) {
      const mine = rows.find(x => x.login.toLowerCase() === me.toLowerCase()), body = `**${me}**: ${score} punti\n\n<!-- milkex-score: ${me},${score} -->`;
      if (!mine) await gh(`/repos/${MX_REPO}/issues/${iss.number}/comments`, { method: "POST", body: JSON.stringify({ body }) });
      else if (score > mine.score) await gh(`/repos/${MX_REPO}/issues/comments/${mine.id}`, { method: "PATCH", body: JSON.stringify({ body }) });
      rows = await read();
    }
    rows.sort((a, b) => b.score - a.score);
    return { me, top: rows.slice(0, 10) };
  }
  function showTop(j) {
    const ol = over.querySelector("#gTop"); if (!ol) return;
    ol.innerHTML = j.top.length ? j.top.map(x => `<li class="${x.login.toLowerCase() === j.me.toLowerCase() ? "me" : ""}">${x.login} — ${x.score}</li>`).join("") : "<li>sei il primo!</li>";
  }
  async function gameOver() {
    G.over = true;
    const best = rec(), isRec = G.score > best;
    if (isRec) { try { localStorage.setItem("milkex.invaders", G.score); } catch { } }
    hud();
    const now = new Date(), hh = String(now.getHours()).padStart(2, "0") + ":" + String(now.getMinutes()).padStart(2, "0");
    over.innerHTML = `<div class="mxintro">
      <i class="ghost" style="left:6%;top:14%;font-size:30px">∮</i><i class="ghost" style="right:8%;top:10%;font-size:26px;animation-delay:-2s">∇×B</i>
      <i class="ghost" style="left:9%;bottom:16%;font-size:24px;animation-delay:-4s">∂ψ/∂t</i><i class="ghost" style="right:9%;bottom:20%;font-size:28px;animation-delay:-1s">det J</i>
      <div class="clock"><b>${hh}</b> <span>· esame alle 9:00</span></div>
      <h2 class="goth">${isRec ? "Nuovo record" : "Bocciato"}</h2>${DRIP}
      <div class="sub">${isRec ? "l'esame forse si passa" : "ci rivediamo al prossimo appello (con l'orale obbligatorio)"}</div>
      <p><b style="font-family:'Latin Modern',serif;font-size:30px;color:#f2914f;font-weight:400">${G.score}</b> punti · ondata ${G.wave}<br>record personale ${Math.max(best, G.score)}</p>
      <ol id="gTop"><li>classifica in arrivo…</li></ol><button id="gAgain">Gioca ancora</button><small>Clic sull'icona in basso a destra per tornare alla home</small></div>`;
    over.querySelector("#gAgain").onclick = () => newGame();
    try {
      if (window.MX_GH_TOKEN) { const j = await ghScore(isRec || !best ? Math.max(best, G.score) : 0); showTop(j); return; }
      const r = await fetch("/api/score", isRec || !best ? { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ score: Math.max(best, G.score) }) } : {});
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || "");
      const ol = over.querySelector("#gTop"); if (!ol) return;
      ol.innerHTML = j.top.length ? j.top.map(x => `<li class="${x.login.toLowerCase() === j.me.toLowerCase() ? "me" : ""}">${x.login} — ${x.score}</li>`).join("") : "<li>sei il primo!</li>";
    } catch (e) {
      const ol = over.querySelector("#gTop"); if (ol) ol.outerHTML = "<small>Classifica di tutti gli utenti non disponibile (serve GitHub collegato).</small>";
    }
  }
  const DRIP = `<svg class="drip" viewBox="0 0 300 26" preserveAspectRatio="none"><path d="M0 0H300V4C292 4 290 6 288 12C286 18 282 18 281 12C280 6 276 5 262 5C250 5 247 7 246 16C245 24 239 24 238 16C237 8 232 5 214 5C196 5 194 6 193 9C192 12 188 12 187 9C186 6 180 5 156 5C140 5 137 8 136 20C135 26 129 26 128 20C127 9 122 5 104 5C86 5 83 7 82 11C81 14 77 14 76 11C75 7 70 5 56 5C44 5 41 8 40 14C39 20 33 20 32 14C31 7 26 4 0 4Z" fill="#9e1328"/><path d="M0 0H300V2H0Z" fill="#c8243c"/></svg>`;
  let clockT = 0;
  function start() {
    over.innerHTML = `<div class="mxintro">
      <i class="ghost" style="left:6%;top:14%;font-size:30px">∮</i><i class="ghost" style="right:8%;top:10%;font-size:26px;animation-delay:-2s">∇×B</i>
      <i class="ghost" style="left:10%;bottom:18%;font-size:24px;animation-delay:-4s">∂ψ/∂t</i><i class="ghost" style="right:9%;bottom:22%;font-size:28px;animation-delay:-1s">det J</i>
      <div class="clock"><b id="gClock">--:--</b> <span>· esame alle 9:00</span></div>
      <h2 class="goth">Nightmare</h2>${DRIP}
      <div class="sub">before the exam</div>
      <p>La notte prima dell'esame i concetti che fanno paura prendono vita e attaccano.<br>Più vai avanti, più sono veloci, e dalla terza ondata lanciano gaussiane.<br>
      ← → per muoverti, Spazio per sparare.<br>Con mouse o dito la mucca ti segue e spara da sola.</p><button id="gGo">Inizia</button></div>`;
    over.querySelector(".mxintro p").insertAdjacentHTML("afterend", `<div class="legend"><div class="lt">Aiuti per l'esame (cadono dagli alieni colpiti)</div>${HELPS.map(h => `<div class="li">${helpSvg(h, 22)}<b style="color:${h.col}">${h.name}</b><span>${h.desc}</span></div>`).join("")}</div>`);
    over.querySelector("#gGo").onclick = () => { clearInterval(clockT); newGame(); };
    const tick = () => { const c = over.querySelector("#gClock"); if (!c) return clearInterval(clockT); const d = new Date(); c.textContent = String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0"); };
    clearInterval(clockT); clockT = setInterval(tick, 1000); tick();
  }
  setInterval(() => { btn.style.display = window.MX_PLAYGROUND && !window.MX_PLAYGROUND() && box.hidden ? "none" : ""; }, 500);
  btn.onclick = () => {
    const open = box.hidden;
    box.hidden = !open; btn.classList.toggle("on", open);
    document.documentElement.style.overflow = open ? "hidden" : "";
    if (open) { size(); newGame(); G.over = true; start(); requestAnimationFrame(frame); }
  };
  addEventListener("keydown", e => {
    if (box.hidden || !G) return;
    if (e.key === "Escape") { btn.click(); return; }
    G.keys[e.key.length === 1 ? e.key.toLowerCase() : e.key] = true;
    if ([" ", "ArrowLeft", "ArrowRight"].includes(e.key)) e.preventDefault();
  });
  addEventListener("keyup", e => { if (G) G.keys[e.key.length === 1 ? e.key.toLowerCase() : e.key] = false; });
  box.addEventListener("pointerdown", e => { if (e.target.closest(".mxover>div")) return; G.ptr = e.clientX; box.setPointerCapture(e.pointerId); });
  box.addEventListener("pointermove", e => { if (G && G.ptr != null) G.ptr = e.clientX; });
  box.addEventListener("pointerup", () => { if (G) G.ptr = null; });
})();
