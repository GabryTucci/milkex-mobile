// MILKeX Mobile: i PDF dei progetti LaTeX su telefono e tablet, anche con il computer spento.
// Tutto passa da GitHub: i progetti stanno nei repository (privati) e i PDF nel ramo "milkex-pdf".
"use strict";
const GH = "https://api.github.com";
const PDF_BRANCH = "milkex-pdf";
const WF = "milkex.yml";
const TEXT = /\.(tex|bib|sty|cls|txt|md|bst|def|cfg)$/i;
pdfjsLib.GlobalWorkerOptions.workerSrc = ROOT + "vendor/pdfjs/pdf.worker.min.js";

// ---------------------------------------------------------------- piccoli aiuti
const $ = (s, r = document) => r.querySelector(s);
function h(tag, attrs = {}, ...kids) {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v == null || v === false) continue;
    if (k.startsWith("on")) e[k] = v; else if (k === "html") e.innerHTML = v; else e.setAttribute(k, v === true ? "" : v);
  }
  for (const k of kids.flat()) if (k != null && k !== false) e.append(k.nodeType ? k : document.createTextNode(k));
  return e;
}
const icon = n => { const t = document.createElement("span"); t.innerHTML = ic(n); return t.firstChild; };
const backIcon = () => { const s = icon("right"); s.style.transform = "rotate(180deg)"; return s; };
const store = {
  get(k, d = null) { try { const v = localStorage.getItem("mx." + k); return v == null ? d : JSON.parse(v); } catch { return d; } },
  set(k, v) { try { v == null ? localStorage.removeItem("mx." + k) : localStorage.setItem("mx." + k, JSON.stringify(v)); } catch { } },
};
function toast(msg, ms = 2600) {
  document.querySelectorAll(".toast2").forEach(t => t.remove());
  const t = h("div", { class: "toast2" }, msg); document.body.append(t);
  setTimeout(() => { t.style.transition = "opacity .3s"; t.style.opacity = 0; setTimeout(() => t.remove(), 300); }, ms);
}
const ago = t => {
  if (!t) return "";
  const s = (Date.now() / 1000 - t) | 0;
  if (s < 60) return "adesso";
  if (s < 3600) return `${(s / 60) | 0} min fa`;
  if (s < 86400) return `${(s / 3600) | 0} h fa`;
  const d = new Date(t * 1000);
  return d.toLocaleDateString("it-IT", { day: "numeric", month: "short" }) + " " + d.toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" });
};
const b64utf8 = s => { const b = new TextEncoder().encode(s); let r = ""; for (let i = 0; i < b.length; i += 0x8000) r += String.fromCharCode(...b.subarray(i, i + 0x8000)); return btoa(r); };
const utf8b64 = s => new TextDecoder().decode(Uint8Array.from(atob(s.replace(/\n/g, "")), c => c.charCodeAt(0)));
const enc = p => p.split("/").map(encodeURIComponent).join("/");

// logo animato (lo stesso dell'avvio di MILKeX)
function logo(cls = "") {
  const src = $("#splash svg") || $("#logoTpl svg");
  const s = src.cloneNode(true); s.setAttribute("class", cls); s.removeAttribute("style");
  // id univoci, altrimenti più copie del logo si rubano sfumature e maschere
  const n = (logo.n = (logo.n || 0) + 1);
  s.innerHTML = s.innerHTML.replace(/\b(mx[gmr])\b/g, "$1" + n);
  return s;
}

// ---------------------------------------------------------------- GitHub
const token = () => store.get("token");
async function gh(path, opt = {}) {
  const r = await fetch(path.startsWith("http") ? path : GH + path, {
    method: opt.method || "GET", cache: "no-store",
    headers: { Authorization: "Bearer " + token(), Accept: opt.accept || "application/vnd.github+json", ...(opt.body ? { "Content-Type": "application/json" } : {}) },
    body: opt.body ? JSON.stringify(opt.body) : undefined,
  });
  if (r.status === 401) { store.set("token", null); throw Object.assign(new Error("L'accesso a GitHub è scaduto: ricollega il telefono dal computer."), { auth: true }); }
  if (opt.raw) return r;
  if (r.status === 204) return null;
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw Object.assign(new Error(j.message || "GitHub ha risposto " + r.status), { status: r.status });
  return j;
}
const isLatex = r => (r.language || "").toLowerCase() === "tex" || /progetto latex|milkex/i.test(r.description || "") && !/milkex-(mobile|simulazioni|biblioteca)|^milkex$/i.test(r.name);

async function loadMe() {
  const me = await gh("/user");
  store.set("me", { login: me.login, name: me.name || me.login, avatar: me.avatar_url });
  return me;
}
async function listProjects() {
  let repos = [];
  for (let p = 1; p < 6; p++) {
    const page = await gh(`/user/repos?per_page=100&page=${p}&sort=pushed&affiliation=owner,collaborator,organization_member`);
    repos = repos.concat(page); if (page.length < 100) break;
  }
  repos = repos.filter(r => !/^milkex(-mobile|-simulazioni)?$/i.test(r.name));
  // un progetto ha il PDF se esiste il ramo milkex-pdf: lo leggiamo (piccolo milkex.json)
  const out = await Promise.all(repos.map(async r => {
    let info = null;
    try {
      const res = await gh(`/repos/${r.full_name}/contents/milkex.json?ref=${PDF_BRANCH}`, { accept: "application/vnd.github.raw", raw: true });
      if (res.ok) info = await res.json();
    } catch { }
    return { full: r.full_name, name: r.name, owner: r.owner.login, branch: r.default_branch, pushed: r.pushed_at, latex: isLatex(r) || !!info, info,
      perm: r.permissions || {} };
  }));
  const list = out.filter(p => p.latex);
  store.set("projects", list);
  return list;
}

// cache dei PDF per la consultazione senza rete
async function pdfCache() { try { return await caches.open("milkex-pdf"); } catch { return null; } }
async function getPdf(p, fresh) {
  const key = new Request(location.origin + "/__pdf/" + p.full + "/" + encodeURIComponent(p.info.pdf));
  const c = await pdfCache();
  const info = p.info;
  const saved = store.get("pdfAt:" + p.full + "/" + p.info.pdf);
  if (c && !fresh && saved && info && saved >= info.compiledAt) {
    const hit = await c.match(key); if (hit) return { data: await hit.arrayBuffer(), cached: true };
  }
  try {
    const r = await gh(`/repos/${p.full}/contents/${enc(info.pdf)}?ref=${PDF_BRANCH}`, { accept: "application/vnd.github.raw", raw: true });
    if (!r.ok) throw new Error("PDF non trovato (" + r.status + ")");
    const data = await r.arrayBuffer();
    if (c) { await c.put(key, new Response(data.slice(0), { headers: { "Content-Type": "application/pdf" } })); store.set("pdfAt:" + p.full + "/" + p.info.pdf, info.compiledAt); }
    return { data };
  } catch (e) {
    const hit = c && await c.match(key);
    if (hit) return { data: await hit.arrayBuffer(), cached: true, offline: true };
    throw e;
  }
}

// ---------------------------------------------------------------- schermate
let current = null;
const stack = [];
function show(screen, back = false) {
  const app = $("#app"), old = current;
  current = screen; app.append(screen);
  screen.classList.add(back ? "back-enter" : "enter");
  if (old) { old.classList.add(back ? "back-leave" : "leave"); setTimeout(() => old.remove(), 320); }
  setTimeout(() => screen.classList.remove("enter", "back-enter"), 420);
}
function go(make) { stack.push(make); show(make()); history.pushState({ d: stack.length }, ""); }
function goBack() { if (stack.length > 1) { stack.pop(); show(stack[stack.length - 1](), true); } }
addEventListener("popstate", () => goBack());

function sheet(title, text, buttons) {
  return new Promise(res => {
    const back = h("div", { class: "sheet-back" }), sh = h("div", { class: "sheet" });
    const close = v => { sh.classList.add("out"); back.classList.add("out"); setTimeout(() => { sh.remove(); back.remove(); }, 280); res(v); };
    back.onclick = () => close(null);
    sh.append(h("div", { class: "grab" }), h("h3", {}, title), typeof text === "string" ? h("p", {}, text) : text,
      h("div", { class: "row" }, buttons.map(b => h("button", { class: "cta" + (b.ghost ? " ghost" : ""), onclick: () => close(b.value) }, b.label))));
    document.body.append(back, sh);
  });
}

// ---------- benvenuto: collega il telefono
function welcomeScreen(err) {
  const tok = h("input", { class: "field", type: "password", placeholder: "Collegamento copiato dal computer o token", autocomplete: "off" });
  const msg = h("div", { class: "err" }, err || "");
  const btn = h("button", { class: "cta", onclick: async () => {
    if (!tok.value.trim()) return;
    btn.disabled = true; const v = tok.value.trim(), mm = v.match(/[#&?]t=([^&\s]+)/); store.set("token", mm ? decodeURIComponent(mm[1]) : v);
    try { await loadMe(); start(); } catch (e) { store.set("token", null); msg.textContent = e.message; btn.disabled = false; }
  } }, "Collega");
  return h("div", { class: "screen" }, h("div", { class: "welcome" },
    logo("big"),
    h("h2", { html: 'MIL<span class="lxk">K</span><span class="lxe">e</span>X' }),
    h("div", { class: "sub" }, "Mobile"),
    h("div", { class: "steps" },
      h("div", { class: "step", style: "animation-delay:.25s" }, h("i", {}, "1"), h("div", {}, "Sul computer apri MILKeX e, nella barra a sinistra, scegli ", h("b", {}, "Telefono e tablet"), ".")),
      h("div", { class: "step", style: "animation-delay:.35s" }, h("i", {}, "2"), h("div", {}, "Inquadra il codice QR con la fotocamera di questo dispositivo.")),
      h("div", { class: "step", style: "animation-delay:.45s" }, h("i", {}, "3"), h("div", {}, "Fatto: i PDF dei tuoi progetti sono qui, anche a computer spento. Aggiungi l'app alla schermata Home per averla sempre a portata di mano."))),
    h("details", { class: "tokbox" }, h("summary", {}, "Oppure incolla il collegamento copiato dal computer"), tok, msg, btn)));
}

// ---------- elenco progetti
function homeScreen() {
  const me = store.get("me") || {};
  const list = h("div", {}), q = h("input", { type: "search", placeholder: "Cerca un progetto", oninput: () => draw() });
  const refreshBtn = h("button", { class: "round", "aria-label": "Aggiorna", onclick: () => load(true) }, icon("sync"));
  let projects = store.get("projects") || [], offline = false;
  const draw = () => {
    const f = q.value.trim().toLowerCase();
    const items = projects.filter(p => !f || p.name.toLowerCase().includes(f) || p.owner.toLowerCase().includes(f));
    list.replaceChildren();
    if (offline) list.append(h("div", { class: "offline" }, "Senza rete: si aprono i PDF già scaricati"));
    const mine = items.filter(p => p.owner === me.login), shared = items.filter(p => p.owner !== me.login);
    const sec = (title, arr) => { if (!arr.length) return; list.append(h("div", { class: "sect" }, title)); arr.forEach((p, i) => list.append(card(p, i))); };
    sec("I tuoi progetti", mine); sec("Condivisi con te", shared);
    if (!items.length) list.append(h("div", { class: "empty" }, icon("book"), h("div", {}, f ? "Nessun progetto con questo nome." : "Nessun progetto LaTeX su GitHub. Collega un progetto a GitHub da MILKeX sul computer.")));
  };
  const card = (p, i) => h("div", { class: "proj", style: `animation-delay:${Math.min(i, 10) * 45}ms`, onclick: () => go(() => viewerScreen(p)) },
    h("div", { class: "thumb" + (p.info ? "" : " off") }, (p.name[0] || "?").toUpperCase()),
    h("div", { class: "t" }, h("b", {}, p.info?.name || p.name),
      h("small", {}, p.info ? [`PDF ${ago(p.info.compiledAt)}`, p.info.by ? ` · ${p.info.by}` : "",
        h("span", { class: "pill" + (p.info.source === "github" ? " ok" : "") }, p.info.source === "github" ? "da GitHub" : "dal PC"), p.info.summaries ? h("span", { class: "pill" }, "riepiloghi") : ""]
        : [p.owner !== me.login ? "di " + p.owner + " · " : "", "nessun PDF: tocca per compilarlo"])),
    h("span", { class: "chev" }, icon("right")));
  const load = async force => {
    refreshBtn.disabled = true; refreshBtn.firstChild.style.animation = "ringSpin 1s linear infinite";
    if (!projects.length) list.replaceChildren(...Array.from({ length: 5 }, () => h("div", { class: "skel" })));
    try { projects = await listProjects(); offline = false; }
    catch (e) { if (e.auth) return start(); offline = true; if (force) toast(e.message); }
    refreshBtn.disabled = false; refreshBtn.firstChild.style.animation = "";
    draw();
  };
  const scr = h("div", { class: "screen" },
    h("div", { class: "bar" }, logo("mini"), h("h1", {}, "Progetti", h("small", {}, "MILKeX Mobile")), refreshBtn,
      me.avatar ? h("img", { class: "avatar", src: me.avatar, alt: "", onclick: () => accountSheet() }) : null),
    h("div", { class: "scroll" }, h("div", { class: "wrapc" }, h("div", { class: "search" }, icon("search"), q), list)));
  draw(); load();
  scr.refresh = () => load();
  return scr;
}
async function accountSheet() {
  const me = store.get("me") || {};
  const v = await sheet(me.name || "Account", `Collegato a GitHub come @${me.login}. Puoi scollegare questo dispositivo: i PDF salvati vengono cancellati.`,
    [{ label: "Scollega", value: "out" }, { label: "Chiudi", ghost: true }]);
  if (v === "out") { store.set("token", null); store.set("projects", null); try { await caches.delete("milkex-pdf"); } catch { } start(); }
}

// ---------- visualizzatore PDF
function viewerScreen(p) {
  const pages = h("div", { class: "pages" }), view = h("div", { class: "viewer" }, pages), num = h("div", { class: "pgnum" });
  let doc = null, zoom = 1, baseW = 0, timer = 0;
  const sum = !!p.isSum;
  const title = h("h1", {}, sum ? "Riepiloghi" : (p.info?.name || p.name), h("small", {}, p.info ? "PDF " + ago(p.info.compiledAt) : "nessun PDF"));
  const dl = h("button", { class: "round", "aria-label": "Scarica", onclick: () => download() }, icon("download"));
  // PDF dei riepiloghi (fatti con l'AI sul computer): un tocco e si ripassa
  const riep = !sum && p.info?.summaries ? h("button", { class: "round hot", "aria-label": "Riepiloghi", title: "Riepiloghi",
    onclick: () => go(() => viewerScreen({ ...p, isSum: true, full: p.full, info: { ...p.info, pdf: p.info.summaries } })) }, icon("book")) : null;
  const scr = h("div", { class: "screen" },
    h("div", { class: "bar" }, h("button", { class: "round", "aria-label": "Indietro", onclick: () => history.back() }, sum ? backIcon() : icon("home")), title, riep, dl),
    view, num,
    h("div", { class: "dock" },
      h("button", { class: sum ? "main" : "", onclick: () => scr.toc() }, icon("list"), "Indice"),
      sum ? null : h("button", { onclick: () => go(() => filesScreen(p)) }, icon("code"), "Modifica"),
      sum ? null : h("button", { class: "main", onclick: () => compile(p, scr) }, icon("recompile"), "Compila")));
  scr.reload = async (fresh = true) => {
    title.lastChild.textContent = p.info ? "PDF " + ago(p.info.compiledAt) + (p.info.by ? " · " + p.info.by : "") : "nessun PDF";
    if (!p.info) {
      pages.replaceChildren(h("div", { class: "empty", style: "padding-top:4rem;max-width:22rem" }, logo("big"), h("p", {},
        "Questo progetto non ha ancora un PDF su GitHub. Premi ", h("b", {}, "Compila"), ": GitHub lo crea in un paio di minuti, senza il computer.")));
      return;
    }
    if (!doc) pages.replaceChildren(h("div", { class: "empty", style: "padding-top:5rem" }, logo("spin"), h("div", {}, "Apro il PDF…")));
    try {
      const r = await getPdf(p, fresh);
      if (r.offline) toast("Senza rete: questo è il PDF salvato sul dispositivo");
      scr.data = r.data;
      doc = await pdfjsLib.getDocument({ data: new Uint8Array(r.data.slice(0)), isEvalSupported: false }).promise;
      layout();
    } catch (e) {
      pages.replaceChildren(h("div", { class: "empty" }, icon("close"), h("div", {}, "Non riesco ad aprire il PDF: " + e.message)));
    }
  };
  // pagine: segnaposto della giusta misura, disegnate solo quando entrano nello schermo
  let io = null;
  async function layout() {
    if (!doc) return;
    baseW = Math.min(view.clientWidth - 20, 1000);
    io?.disconnect();
    io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) draw(e.target); }), { root: view, rootMargin: "600px 0px" });
    const first = await doc.getPage(1), vp = first.getViewport({ scale: 1 }), ratio = vp.height / vp.width;
    const kids = [];
    for (let i = 1; i <= doc.numPages; i++) {
      const d = h("div", { class: "pg", style: `width:${baseW * zoom}px;height:${baseW * zoom * ratio}px;animation-delay:${Math.min(i - 1, 4) * 60}ms` });
      d.dataset.n = i; kids.push(d); io.observe(d);
    }
    pages.replaceChildren(...kids);
  }
  async function draw(d) {
    const w = baseW * zoom, dpr = Math.min(devicePixelRatio || 1, 3);
    if (+d.dataset.w === w) return; d.dataset.w = w;
    const page = await doc.getPage(+d.dataset.n), v1 = page.getViewport({ scale: 1 });
    const vp = page.getViewport({ scale: (w / v1.width) * dpr });
    d.style.height = (w * v1.height / v1.width) + "px";
    const c = h("canvas", { width: Math.floor(vp.width), height: Math.floor(vp.height) });
    await page.render({ canvasContext: c.getContext("2d"), viewport: vp }).promise;
    d.replaceChildren(c);
    try {
      const vl = page.getViewport({ scale: w / v1.width });
      for (const a of await page.getAnnotations({ intent: "display" })) {
        if (a.subtype !== "Link" || !(a.dest || a.url)) continue;
        const [x1, y1, x2, y2] = vl.convertToViewportRectangle(a.rect);
        const el = h("a", { class: "lnk", style: `left:${Math.min(x1, x2)}px;top:${Math.min(y1, y2)}px;width:${Math.abs(x2 - x1)}px;height:${Math.abs(y2 - y1)}px` });
        if (a.url) Object.assign(el, { href: a.url, target: "_blank", rel: "noopener" });
        else el.onclick = e => { e.preventDefault(); jump(a.dest); };
        d.append(el);
      }
    } catch { }
  }
  // salta a una destinazione del PDF (voce dell'indice, riferimento…)
  async function jump(dest) {
    try {
      if (typeof dest === "string") dest = await doc.getDestination(dest);
      if (!Array.isArray(dest)) return;
      const idx = typeof dest[0] === "object" ? await doc.getPageIndex(dest[0]) : dest[0];
      const pg = pages.querySelector(`.pg[data-n="${idx + 1}"]`); if (!pg) return;
      let off = 0;
      if (dest[1]?.name === "XYZ" && dest[3] != null) {
        const page = await doc.getPage(idx + 1), v1 = page.getViewport({ scale: 1 });
        off = Math.max(0, page.getViewport({ scale: parseFloat(pg.style.width) / v1.width }).convertToViewportPoint(0, dest[3])[1] - 16);
      }
      view.scrollTo({ top: pg.offsetTop + off - 8, behavior: "smooth" });
      pg.classList.remove("hit"); void pg.offsetWidth; pg.classList.add("hit");
    } catch { }
  }
  // pagina dell'indice: cerca il titolo "Indice" / "Contents" nelle prime pagine
  let tocPage = null;
  async function goToc() {
    if (!doc) return toast("Il PDF non è ancora aperto");
    if (tocPage == null) {
      tocPage = 0;
      const RX = /^(indice( generale)?|sommario|contents|table of contents|inhaltsverzeichnis|table des matières|índice)$/i;
      for (let i = 1; i <= Math.min(doc.numPages, 20) && !tocPage; i++) {
        const tc = await (await doc.getPage(i)).getTextContent();
        const lines = {};
        tc.items.forEach(it => { const y = Math.round(it.transform[5]); lines[y] = (lines[y] || "") + it.str; });
        if (Object.values(lines).some(l => RX.test(l.replace(/\s+/g, " ").trim()))) tocPage = i;
      }
    }
    if (tocPage) return jump([tocPage - 1, { name: "Fit" }]);
    // nessun indice stampato: segnalibri del PDF, se ci sono
    const out = await doc.getOutline();
    if (!out?.length) return toast("Questo PDF non ha un indice");
    outlineSheet(out);
  }
  function outlineSheet(out) {
    const box = h("div", { class: "outline" });
    const add = (items, lvl) => items.forEach(o => { box.append(h("button", { class: "oitem", style: `padding-left:${0.9 + lvl * 1.1}rem`, onclick: () => { close(); jump(o.dest); } }, o.title)); if (lvl < 1) add(o.items || [], lvl + 1); });
    add(out, 0);
    const back = h("div", { class: "sheet-back" }), sh = h("div", { class: "sheet" }, h("div", { class: "grab" }), h("h3", {}, "Indice"), box);
    const close = () => { sh.classList.add("out"); back.classList.add("out"); setTimeout(() => { sh.remove(); back.remove(); }, 280); };
    back.onclick = close;
    document.body.append(back, sh);
  }
  scr.toc = goToc;
  // numero di pagina mentre si scorre
  view.addEventListener("scroll", () => {
    if (!doc) return;
    const mid = view.scrollTop + view.clientHeight / 2;
    const pg = [...pages.children].find(c => c.offsetTop + c.offsetHeight > mid);
    if (pg?.dataset.n) { num.textContent = `${pg.dataset.n} / ${doc.numPages}`; num.classList.add("on"); clearTimeout(timer); timer = setTimeout(() => num.classList.remove("on"), 900); }
  }, { passive: true });
  // zoom con due dita: anteprima immediata (CSS), poi pagine ridisegnate nitide
  let pinch = null;
  view.addEventListener("touchstart", e => {
    if (e.touches.length !== 2 || !doc) return;
    const [a, b] = e.touches, r = view.getBoundingClientRect();
    pinch = { d: Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY), z: zoom, s: 1,
      cx: (a.clientX + b.clientX) / 2 - r.left, cy: (a.clientY + b.clientY) / 2 - r.top, sl: view.scrollLeft, st: view.scrollTop };
  }, { passive: true });
  view.addEventListener("touchmove", e => {
    if (!pinch || e.touches.length !== 2) return;
    e.preventDefault();
    const [a, b] = e.touches;
    pinch.s = Math.min(5 / pinch.z, Math.max(0.6 / pinch.z, Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY) / pinch.d));
    const ox = pinch.sl + pinch.cx, oy = pinch.st + pinch.cy;
    pages.style.transformOrigin = `${ox}px ${oy}px`; pages.style.transform = `scale(${pinch.s})`;
  }, { passive: false });
  view.addEventListener("touchend", () => {
    if (!pinch) return;
    const p0 = pinch; pinch = null;
    const nz = Math.min(5, Math.max(0.6, p0.z * p0.s)), k = nz / zoom;
    pages.style.transform = ""; zoom = nz;
    [...pages.children].forEach(d => { if (!d.dataset.n) return; const r = (parseFloat(d.style.height) / parseFloat(d.style.width)) || 1.414;
      d.style.width = baseW * zoom + "px"; d.style.height = baseW * zoom * r + "px"; d.dataset.w = ""; });
    view.scrollLeft = (p0.sl + p0.cx) * k - p0.cx; view.scrollTop = (p0.st + p0.cy) * k - p0.cy;
    [...pages.children].forEach(d => { const r = d.getBoundingClientRect(); if (r.bottom > -600 && r.top < innerHeight + 600) draw(d); });
  });
  addEventListener("resize", () => { if (scr.isConnected && doc) { zoom = 1; layout(); } });
  async function download() {
    if (!scr.data) return toast("Nessun PDF da scaricare");
    const file = new File([scr.data], p.info.pdf.endsWith(".pdf") ? p.info.pdf : p.info.pdf + ".pdf", { type: "application/pdf" });
    if (navigator.canShare?.({ files: [file] })) { try { await navigator.share({ files: [file], title: file.name }); return; } catch (e) { if (e.name === "AbortError") return; } }
    const a = h("a", { href: URL.createObjectURL(file), download: file.name }); document.body.append(a); a.click(); a.remove();
  }
  setTimeout(() => scr.reload(false), 60);
  return scr;
}

// ---------- compilazione su GitHub (GitHub Actions)
const WF_PATH = ".github/workflows/" + WF;
async function ensureWorkflow(p) {
  const want = await (await fetch("milkex.yml", { cache: "no-store" })).text();
  let cur = null;
  try { cur = await gh(`/repos/${p.full}/contents/${WF_PATH}?ref=${p.branch}`); } catch (e) { if (e.status !== 404) throw e; }
  if (cur && utf8b64(cur.content) === want) return false;
  if (!cur) {
    const ok = await sheet("Compilare su GitHub?", "La prima volta aggiungo al progetto un piccolo file (.github/workflows/milkex.yml) che dice a GitHub come compilarlo. Le compilazioni sono gratuite (fino a circa 2000 minuti al mese).",
      [{ label: "Aggiungi e compila", value: true }, { label: "Annulla", ghost: true }]);
    if (!ok) return null;
  }
  await gh(`/repos/${p.full}/contents/${WF_PATH}`, { method: "PUT", body: { message: "MILKeX Mobile: compilazione su GitHub", content: b64utf8(want), branch: p.branch, ...(cur ? { sha: cur.sha } : {}) } });
  return true;
}
async function findMain(p) {
  if (p.info?.main) return p.info.main;
  const t = await gh(`/repos/${p.full}/git/trees/${p.branch}?recursive=1`);
  const tex = t.tree.filter(x => x.type === "blob" && /\.tex$/i.test(x.path)).map(x => x.path).sort((a, b) => a.split("/").length - b.split("/").length);
  for (const f of [...tex.filter(f => /(^|\/)main\.tex$/i.test(f)), ...tex].slice(0, 8)) {
    const c = await gh(`/repos/${p.full}/contents/${enc(f)}?ref=${p.branch}`);
    if (/\\documentclass/.test(utf8b64(c.content))) return f;
  }
  throw new Error("non trovo il documento principale (\\documentclass)");
}
function statusBox(scr) {
  scr.querySelector(".status")?.remove();
  const t = h("div", { class: "t" }), box = h("div", { class: "status" }, logo("spin"), t);
  scr.append(box);
  return {
    set(main, sub, bar = true) { t.replaceChildren(h("b", {}, main), sub ? h("small", {}, sub) : "", bar ? h("div", { class: "bar2" }, h("i")) : ""); },
    end(kind, main, sub, extra) {
      box.classList.add(kind); box.firstChild.replaceWith(icon(kind === "ok" ? "check" : "close"));
      t.replaceChildren(h("b", {}, main), sub ? h("small", {}, sub) : "", extra || "");
      box.append(h("button", { class: "round x", onclick: () => close() }, icon("close")));
      const close = () => { box.classList.add("out"); setTimeout(() => box.remove(), 350); };
      if (kind === "ok") setTimeout(close, 3500);
    },
  };
}
let compiling = false;
async function compile(p, scr) {
  if (compiling) return toast("Compilazione già in corso…");
  compiling = true;
  const st = statusBox(scr);
  try {
    st.set("Preparo la compilazione…", p.full);
    const added = await ensureWorkflow(p);
    if (added === null) { scr.querySelector(".status")?.remove(); return; }
    const main = await findMain(p);
    const me = store.get("me") || {};
    const t0 = Date.now();
    for (let i = 0; ; i++) {   // un file appena aggiunto può impiegare qualche secondo a essere visto da GitHub
      try {
        await gh(`/repos/${p.full}/actions/workflows/${WF}/dispatches`, { method: "POST",
          body: { ref: p.branch, inputs: { main, engine: p.info?.compiler || "pdflatex", by: me.name || me.login || "" } } });
        break;
      } catch (e) { if (i >= 6 || e.status !== 404) throw e; await new Promise(r => setTimeout(r, 3000)); }
    }
    st.set("GitHub sta compilando…", "Di solito ci vogliono 1–2 minuti. Puoi intanto leggere il PDF.");
    let run = null;
    while (true) {
      await new Promise(r => setTimeout(r, 5000));
      const rs = await gh(`/repos/${p.full}/actions/workflows/${WF}/runs?event=workflow_dispatch&per_page=3`);
      run = rs.workflow_runs.find(r => new Date(r.created_at).getTime() > t0 - 60000) || run;
      if (!run) continue;
      const sec = ((Date.now() - t0) / 1000) | 0;
      st.set(run.status === "queued" ? "In coda su GitHub…" : "GitHub sta compilando…", `${(sec / 60) | 0}:${String(sec % 60).padStart(2, "0")} · di solito 1–2 minuti`);
      if (run.status === "completed") break;
      if (Date.now() - t0 > 20 * 60000) throw new Error("la compilazione sta impiegando troppo");
    }
    // nuovo PDF e informazioni
    const res = await gh(`/repos/${p.full}/contents/milkex.json?ref=${PDF_BRANCH}`, { accept: "application/vnd.github.raw", raw: true });
    const info = res.ok ? await res.json() : null;
    if (info && info.newPdf !== false) {
      p.info = info; await scr.reload(true);
      if (info.ok) st.end("ok", "PDF aggiornato", "Compilato su GitHub " + ago(info.compiledAt));
      else st.end("err", "PDF aggiornato, con errori", "LaTeX ha segnalato degli errori: il PDF potrebbe essere incompleto.", await errorsBox(p));
    } else st.end("err", "Compilazione non riuscita", "Non è stato prodotto un PDF nuovo.", await errorsBox(p));
  } catch (e) {
    if (e.auth) return start();
    st.end("err", "Compilazione non riuscita", e.message);
  } finally { compiling = false; }
}
async function errorsBox(p) {
  try {
    const r = await gh(`/repos/${p.full}/contents/compile.log?ref=${PDF_BRANCH}`, { accept: "application/vnd.github.raw", raw: true });
    if (!r.ok) return "";
    const log = await r.text();
    const errs = log.split("\n").filter(l => /^(!|.+:\d+: )/.test(l)).slice(0, 8).join("\n");
    return errs ? h("div", { class: "logs" }, errs) : "";
  } catch { return ""; }
}

// ---------- file del progetto e modifica
function filesScreen(p) {
  const list = h("div", {}, ...Array.from({ length: 6 }, () => h("div", { class: "skel", style: "height:3.2rem" })));
  const scr = h("div", { class: "screen" },
    h("div", { class: "bar" }, h("button", { class: "round", "aria-label": "Indietro", onclick: () => history.back() }, backIcon()),
      h("h1", {}, "File", h("small", {}, p.info?.name || p.name))),
    h("div", { class: "scroll" }, h("div", { class: "wrapc" }, list)));
  (async () => {
    try {
      const t = await gh(`/repos/${p.full}/git/trees/${p.branch}?recursive=1`);
      const files = t.tree.filter(x => x.type === "blob" && TEXT.test(x.path) && !x.path.startsWith(".github/"))
        .sort((a, b) => (a.path.split("/").length - b.path.split("/").length) || a.path.localeCompare(b.path));
      const main = p.info?.main;
      list.replaceChildren(...files.map((f, i) => h("div", { class: "file" + (f.path === main ? " mainf" : ""), style: `animation-delay:${Math.min(i, 12) * 30}ms`,
        onclick: () => go(() => editScreen(p, f.path)) }, icon(/\.tex$/i.test(f.path) ? "page" : "code"), h("span", {}, f.path),
        f.path === main ? h("small", {}, "principale") : h("small", {}, ((f.size || 0) / 1024).toFixed(1) + " KB"))));
      if (!files.length) list.replaceChildren(h("div", { class: "empty" }, "Nessun file di testo nel progetto."));
    } catch (e) { list.replaceChildren(h("div", { class: "empty" }, e.message)); }
  })();
  return scr;
}
function editScreen(p, path) {
  const ta = h("textarea", { class: "editor", spellcheck: "false", autocapitalize: "off", autocomplete: "off", autocorrect: "off", disabled: true });
  let sha = null, orig = "";
  const save = h("button", { class: "round hot", "aria-label": "Salva", disabled: true, onclick: () => doSave() }, icon("check"));
  const ins = s => { const a = ta.selectionStart, b = ta.selectionEnd; ta.setRangeText(s, a, b, "end"); if (s.endsWith("}") && s.includes("{}")) { ta.selectionStart = ta.selectionEnd = a + s.indexOf("{}") + 1; } ta.focus(); ta.dispatchEvent(new Event("input")); };
  const keys = h("div", { class: "keys" }, ["\\", "{}", "$$", "[]", "^", "_", "&", "%", "\\frac{}", "\\begin{}", "\\item "].map(k =>
    h("button", { onpointerdown: e => { e.preventDefault(); ins(k); } }, k.trim())));
  ta.oninput = () => { save.disabled = ta.value === orig; };
  const scr = h("div", { class: "screen" },
    h("div", { class: "bar" }, h("button", { class: "round", "aria-label": "Indietro", onclick: () => leave() }, backIcon()),
      h("h1", {}, path.split("/").pop(), h("small", {}, p.info?.name || p.name)), save),
    ta, keys);
  const leave = async () => {
    if (ta.value !== orig) {
      const v = await sheet("Modifiche non salvate", "Vuoi salvarle su GitHub prima di uscire?", [{ label: "Salva", value: "s" }, { label: "Esci senza salvare", value: "x", ghost: true }]);
      if (v === "s") { if (!(await doSave())) return; } else if (v !== "x") return;
    }
    history.back();
  };
  async function doSave() {
    save.disabled = true;
    try {
      const me = store.get("me") || {};
      const r = await gh(`/repos/${p.full}/contents/${enc(path)}`, { method: "PUT",
        body: { message: `MILKeX Mobile: modifiche di ${me.name || me.login}`, content: b64utf8(ta.value), sha, branch: p.branch } });
      sha = r.content.sha; orig = ta.value;
      const v = await sheet("Salvato su GitHub", "MILKeX sul computer riceverà la modifica alla prossima sincronizzazione. Vuoi aggiornare il PDF adesso?",
        [{ label: "Compila", value: true }, { label: "Più tardi", ghost: true }]);
      if (v) { history.back(); setTimeout(() => history.back(), 50); setTimeout(() => { if (current?.reload) compile(p, current); }, 500); }
      return true;
    } catch (e) {
      save.disabled = false;
      await sheet("Non salvato", e.status === 409 ? "Il file è stato modificato da qualcun altro nel frattempo: riaprilo per vedere la versione aggiornata." : e.message, [{ label: "OK" }]);
      return false;
    }
  }
  (async () => {
    try {
      const c = await gh(`/repos/${p.full}/contents/${enc(path)}?ref=${p.branch}`);
      sha = c.sha; orig = ta.value = utf8b64(c.content); ta.disabled = false;
    } catch (e) { ta.value = "Non riesco ad aprire il file: " + e.message; }
  })();
  return scr;
}

// ---------------------------------------------------------------- avvio
async function start() {
  stack.length = 0; $("#app").replaceChildren(); current = null;
  // collegamento dal codice QR del computer: il token arriva nel frammento (#t=…), che non lascia il dispositivo
  const m = location.hash.match(/[#&]t=([^&]+)/);
  const standalone = matchMedia("(display-mode: standalone)").matches || navigator.standalone === true;
  if (m) store.set("token", decodeURIComponent(m[1]));
  // nell'app installata l'indirizzo si pulisce; nel browser resta, per installarla già collegata
  if (standalone) { if (m) history.replaceState(null, "", location.pathname); }
  else if (token() && !m) history.replaceState(null, "", location.pathname + "#t=" + encodeURIComponent(token()));
  if (!token()) { stack.push(() => welcomeScreen()); return show(welcomeScreen()); }
  if (!store.get("me") || m) { try { await loadMe(); } catch (e) { if (e.auth || !store.get("me")) { store.set("token", null); return show(welcomeScreen(e.message)); } } }
  stack.push(homeScreen); show(homeScreen()); history.replaceState({ d: 1 }, "");
}
(function boot() {
  const s = $("#splash");
  if (s) {
    let first = true; try { first = !sessionStorage.getItem("mx.splash"); sessionStorage.setItem("mx.splash", "1"); } catch { }
    $("#logoTpl").append(s.querySelector("svg").cloneNode(true));
    if (first) { s.classList.add("go"); setTimeout(() => { s.classList.add("out"); setTimeout(() => s.remove(), 500); }, 3000); }
    else s.remove();
  }
  start();
  if ("serviceWorker" in navigator && location.protocol === "https:") navigator.serviceWorker.register("sw.js").catch(() => { });
  // tornando sull'app aggiorna l'elenco
  document.addEventListener("visibilitychange", () => { if (!document.hidden && current?.refresh) current.refresh(); });
})();
