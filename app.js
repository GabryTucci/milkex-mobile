// MILKeX Mobile: i PDF dei progetti LaTeX su telefono e tablet, anche con il computer spento.
// Tutto passa da GitHub: i progetti stanno nei repository (privati) e i PDF nel ramo "milkex-pdf".
"use strict";
const GH = "https://api.github.com";
const PDF_BRANCH = "milkex-pdf";
// progetti personali: tutti nel repository unico milkex-progetti, un ramo per progetto (p/<nome>, PDF in pdf/<nome>)
const HUB_NAME = "milkex-progetti";
const pdfRef = p => p.pdfRef || PDF_BRANCH;
// ramo con la barra (p/<nome>): per l'albero dei file serve il commit
const treeRef = async p => p.hub ? (await gh(`/repos/${p.full}/branches/${p.branch}`)).commit.sha : p.branch;
const pk = p => p.hub ? p.full + "@" + p.branch : p.full;   // chiave del progetto (nel repository unico non basta il nome)
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
// PDF appena compilati da qui: GitHub può restituire per un po' le informazioni vecchie, quindi si ricordano
function rememberPdf(full, info) { const f = store.get("fresh") || {}; f[full] = info; store.set("fresh", f); }
function withFresh(p) {
  const f = (store.get("fresh") || {})[pk(p)];
  return f && (!p.info || (f.compiledAt || 0) > (p.info.compiledAt || 0)) ? { ...p, info: f } : p;
}
const when = t => {
  if (!t) return "";
  const d = new Date(t * 1000);
  return d.toLocaleDateString("it-IT", { weekday: "short", day: "numeric", month: "short" }) + " alle " + d.toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" });
};
async function listProjects() {
  let repos = [];
  for (let p = 1; p < 6; p++) {
    const page = await gh(`/user/repos?per_page=100&page=${p}&sort=pushed&affiliation=owner,collaborator,organization_member`);
    repos = repos.concat(page); if (page.length < 100) break;
  }
  repos = repos.filter(r => !/^milkex(-mobile|-simulazioni)?$/i.test(r.name));
  const me = store.get("me") || {};
  const hubs = repos.filter(r => r.name.toLowerCase() === HUB_NAME && r.owner.login === me.login);
  repos = repos.filter(r => !hubs.includes(r));
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
  // repository unico: ogni ramo p/<nome> è un progetto
  for (const r of hubs) {
    let brs = [];
    for (let pg = 1; pg < 6; pg++) {
      const page = await gh(`/repos/${r.full_name}/branches?per_page=100&page=${pg}`);
      brs = brs.concat(page); if (page.length < 100) break;
    }
    const names = new Set(brs.map(b => b.name));
    out.push(...await Promise.all(brs.filter(b => b.name.startsWith("p/")).map(async b => {
      const slug = b.name.slice(2), ref = "pdf/" + slug;
      let info = null;
      if (names.has(ref)) try {
        const res = await gh(`/repos/${r.full_name}/contents/milkex.json?ref=${encodeURIComponent(ref)}`, { accept: "application/vnd.github.raw", raw: true });
        if (res.ok) info = await res.json();
      } catch { }
      return { full: r.full_name, name: info?.name || slug.replace(/-[0-9a-f]{6}$/, ""), owner: r.owner.login, branch: b.name, defBranch: r.default_branch,
        pdfRef: ref, hub: true, pushed: r.pushed_at, latex: true, info, perm: r.permissions || {} };
    })));
  }
  const list = out.filter(p => p.latex).map(withFresh);
  store.set("projects", list);
  return list;
}

// cache dei PDF per la consultazione senza rete
async function pdfCache() { try { return await caches.open("milkex-pdf"); } catch { return null; } }
async function getPdf(p, fresh) {
  const key = new Request(location.origin + "/__pdf/" + pk(p) + "/" + encodeURIComponent(p.info.pdf));
  const c = await pdfCache();
  const info = p.info;
  const saved = store.get("pdfAt:" + pk(p) + "/" + p.info.pdf);
  if (c && !fresh && saved && info && saved >= info.compiledAt) {
    const hit = await c.match(key); if (hit) return { data: await hit.arrayBuffer(), cached: true };
  }
  try {
    const r = await gh(`/repos/${p.full}/contents/${enc(info.pdf)}?ref=${encodeURIComponent(pdfRef(p))}`, { accept: "application/vnd.github.raw", raw: true });
    if (!r.ok) throw new Error("PDF non trovato (" + r.status + ")");
    const data = await r.arrayBuffer();
    if (c) { await c.put(key, new Response(data.slice(0), { headers: { "Content-Type": "application/pdf" } })); store.set("pdfAt:" + pk(p) + "/" + p.info.pdf, info.compiledAt); }
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
    sh.append(h("div", { class: "grab" }), h("h3", {}, title), typeof text === "string" ? h("p", {}, typeof text === "function" ? text() : text) : text,
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
  return h("div", { class: "screen" }, h("div", { class: "wtheme" }, themeButton()), h("div", { class: "welcome" },
    logo("big"),
    h("h2", { html: 'MIL<span class="lxk">K</span><span class="lxe">e</span>X' }),
    h("div", { class: "sub" }, "Mobile"),
    h("div", { class: "steps" },
      h("div", { class: "step", style: "animation-delay:.25s" }, h("i", {}, "1"), h("div", {}, "Sul computer apri MILKeX e, nella barra a sinistra, scegli ", h("b", {}, "Telefono e tablet"), ".")),
      h("div", { class: "step", style: "animation-delay:.35s" }, h("i", {}, "2"), h("div", {}, "Inquadra il codice QR con la fotocamera di questo dispositivo.")),
      h("div", { class: "step", style: "animation-delay:.45s" }, h("i", {}, "3"), h("div", {}, "Fatto: i PDF dei tuoi progetti sono qui, anche a computer spento. Aggiungi l'app alla schermata Home per averla sempre a portata di mano."))),
    h("details", { class: "tokbox" }, h("summary", {}, "Oppure incolla il collegamento copiato dal computer"), tok, msg, btn)));
}

// ---------- tema chiaro (mondo quantistico) / scuro (spazio): ricordato, vale anche per l'avvio
const SUN = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="4.2"/><path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M5.3 18.7l1.6-1.6M17.1 6.9l1.6-1.6"/></svg>';
const MOON = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5z"/></svg>';
function themeButton() {
  const b = h("button", { class: "round", "aria-label": "Tema chiaro o scuro" });
  const paint = () => { b.innerHTML = document.documentElement.dataset.theme === "light" ? MOON : SUN; };
  b.onclick = () => {
    const t = document.documentElement.dataset.theme === "light" ? "dark" : "light";
    document.documentElement.dataset.theme = t;
    try { localStorage.setItem("mx.theme", t); } catch { }
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", t === "light" ? "#f6f1e8" : "#100c1b");
    paint();
  };
  paint(); return b;
}
// ---------- mascotte delle schermate vuote (le stesse del computer, a turno)
function mascot() {
  const w = h("div", { class: "msc" });
  if (typeof mascotPick !== "function") return w;
  let m = mascotPick(), n = 0;
  while (!m.svg && n++ < 8) m = mascotPick();
  if (m.svg) w.innerHTML = m.svg.replace("<svg ", '<svg class="mascot" ') + "<i>" + m.quip + "</i>";
  return w;
}
// ---------- elenco progetti
function homeScreen() {
  const me = store.get("me") || {};
  const list = h("div", {}), q = h("input", { type: "search", placeholder: "Cerca un progetto", oninput: () => draw() });
  const refreshBtn = h("button", { class: "round", "aria-label": "Aggiorna", onclick: () => load(true) }, icon("sync"));
  let projects = (store.get("projects") || []).map(withFresh), offline = false;
  const draw = () => {
    const f = q.value.trim().toLowerCase();
    const items = projects.filter(p => !f || p.name.toLowerCase().includes(f) || p.owner.toLowerCase().includes(f));
    list.replaceChildren();
    if (offline) list.append(h("div", { class: "offline" }, "Senza rete: si aprono i PDF già scaricati"));
    const mine = items.filter(p => p.owner === me.login), shared = items.filter(p => p.owner !== me.login);
    const sec = (title, arr) => { if (!arr.length) return; list.append(h("div", { class: "sect" }, title)); arr.forEach((p, i) => list.append(card(p, i))); };
    sec("I tuoi progetti", mine); sec("Condivisi con te", shared);
    if (!items.length) list.append(h("div", { class: "empty" }, mascot(), h("div", {}, f ? "Nessun progetto con questo nome." : "Nessun progetto LaTeX su GitHub. Collega un progetto a GitHub da MILKeX sul computer.")));
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
    h("div", { class: "bar" }, logo("mini"), h("h1", {}, "Progetti", h("small", {}, "MILKeX Mobile")), h("button", { class: "round", "aria-label": "Giochi", title: "Giochi", onclick: () => go(gamesScreen) }, gameIcon()), themeButton(), refreshBtn,
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
    title.lastChild.textContent = p.info ? "Compilato " + when(p.info.compiledAt) + " · " + (p.info.source === "github" ? "su GitHub" : "dal PC") : "nessun PDF";
    if (!p.info) {
      pages.replaceChildren(h("div", { class: "empty", style: "padding-top:3rem;max-width:22rem" }, mascot(), h("p", {},
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
  if (cur && utf8b64(cur.content) === want && !p.hub) return false;
  if (cur && utf8b64(cur.content) === want) {   // repository unico: controlla anche il ramo principale
    let d = null;
    try { d = await gh(`/repos/${p.full}/contents/${WF_PATH}?ref=${encodeURIComponent(p.defBranch)}`); } catch (e) { if (e.status !== 404) throw e; }
    if (d && utf8b64(d.content) === want) return false;
  }
  if (!cur) {
    const ok = await sheet("Compilare su GitHub?", "La prima volta aggiungo al progetto un piccolo file (.github/workflows/milkex.yml) che dice a GitHub come compilarlo. Le compilazioni sono gratuite (fino a circa 2000 minuti al mese).",
      [{ label: "Aggiungi e compila", value: true }, { label: "Annulla", ghost: true }]);
    if (!ok) return null;
  }
  await gh(`/repos/${p.full}/contents/${WF_PATH}`, { method: "PUT", body: { message: "MILKeX Mobile: compilazione su GitHub", content: b64utf8(want), branch: p.branch, ...(cur ? { sha: cur.sha } : {}) } });
  if (p.hub && p.defBranch && p.defBranch !== p.branch) {
    let d = null;
    try { d = await gh(`/repos/${p.full}/contents/${WF_PATH}?ref=${encodeURIComponent(p.defBranch)}`); } catch (e) { if (e.status !== 404) throw e; }
    if (!d || utf8b64(d.content) !== want)
      await gh(`/repos/${p.full}/contents/${WF_PATH}`, { method: "PUT", body: { message: "MILKeX Mobile: compilazione su GitHub", content: b64utf8(want), branch: p.defBranch, ...(d ? { sha: d.sha } : {}) } });
  }
  return true;
}
async function findMain(p) {
  if (p.info?.main) return p.info.main;
  const t = await gh(`/repos/${p.full}/git/trees/${await treeRef(p)}?recursive=1`);
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
      const rs = await gh(`/repos/${p.full}/actions/workflows/${WF}/runs?event=workflow_dispatch&per_page=5${p.hub ? "&branch=" + encodeURIComponent(p.branch) : ""}`);
      run = rs.workflow_runs.find(r => new Date(r.created_at).getTime() > t0 - 60000) || run;
      if (!run) continue;
      const sec = ((Date.now() - t0) / 1000) | 0;
      st.set(run.status === "queued" ? "In coda su GitHub…" : "GitHub sta compilando…", `${(sec / 60) | 0}:${String(sec % 60).padStart(2, "0")} · di solito 1–2 minuti`);
      if (run.status === "completed") break;
      if (Date.now() - t0 > 20 * 60000) throw new Error("la compilazione sta impiegando troppo");
    }
    // nuovo PDF e informazioni
    const res = await gh(`/repos/${p.full}/contents/milkex.json?ref=${encodeURIComponent(pdfRef(p))}`, { accept: "application/vnd.github.raw", raw: true });
    const info = res.ok ? await res.json() : null;
    if (info && info.newPdf !== false) {
      p.info = info; rememberPdf(pk(p), info);
      store.set("projects", (store.get("projects") || []).map(x => pk(x) === pk(p) ? { ...x, info } : x));
      await scr.reload(true);
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
    const r = await gh(`/repos/${p.full}/contents/compile.log?ref=${encodeURIComponent(pdfRef(p))}`, { accept: "application/vnd.github.raw", raw: true });
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
      const t = await gh(`/repos/${p.full}/git/trees/${await treeRef(p)}?recursive=1`);
      const files = t.tree.filter(x => x.type === "blob" && TEXT.test(x.path) && !x.path.startsWith(".github/"))
        .sort((a, b) => (a.path.split("/").length - b.path.split("/").length) || a.path.localeCompare(b.path));
      const main = p.info?.main;
      list.replaceChildren(...files.map((f, i) => h("div", { class: "file" + (f.path === main ? " mainf" : ""), style: `animation-delay:${Math.min(i, 12) * 30}ms`,
        onclick: () => go(() => editScreen(p, f.path)) }, icon(/\.tex$/i.test(f.path) ? "page" : "code"), h("span", {}, f.path),
        f.path === main ? h("small", {}, "principale") : h("small", {}, ((f.size || 0) / 1024).toFixed(1) + " KB"))));
      if (!files.length) list.replaceChildren(h("div", { class: "empty" }, mascot(), "Nessun file di testo nel progetto."));
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

// giochi della mucca: solo nell'elenco dei progetti (non mentre si legge un PDF)
window.MX_PLAYGROUND = () => !!(current && current.classList.contains("lab"));
window.MX_GH_TOKEN = () => token();

// ---------- nuova versione dell'app: si aggiorna con un tocco, il collegamento resta salvato
async function checkAppUpdate() {
  try {
    const cur = ((document.querySelector('script[src*="app.js"]') || {}).src || "").match(/[?&]v=([\w.]+)/)?.[1];
    if (!cur) return;
    const v = (await (await fetch("version.txt?t=" + Date.now(), { cache: "no-store" })).text()).trim();
    if (!v || v === cur || document.getElementById("appupd")) return;
    const bar = document.createElement("div"); bar.id = "appupd";
    bar.innerHTML = `<span>È pronta MILKeX Mobile <b>${v}</b></span><button>Aggiorna ora</button>`;
    bar.querySelector("button").onclick = async () => {
      bar.querySelector("button").textContent = "Aggiorno…";
      try { for (const k of await caches.keys()) await caches.delete(k); } catch { }
      try { const r = await navigator.serviceWorker?.getRegistration(); await r?.update(); } catch { }
      location.replace(location.pathname + "?v=" + v + location.hash);
    };
    document.body.append(bar);
  } catch { }
}
setTimeout(checkAppUpdate, 2500);
document.addEventListener("visibilitychange", () => { if (!document.hidden) checkAppUpdate(); });

// ---------- sezione Giochi: il laboratorio della mucca e Nightmare before the exam
function gameIcon() {
  const s = document.createElement("span");
  s.innerHTML = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8h12a4 4 0 0 1 4 4v1a4 4 0 0 1-7 2.6L14 15h-4l-1 .6A4 4 0 0 1 2 13v-1a4 4 0 0 1 4-4z"/><path d="M7 11v3M5.5 12.5h3M16 12h.01M18 13.5h.01"/></svg>';
  return s.firstChild;
}
function gamesScreen() {
  const card = (cls, title, sub, text, onclick, art, cows) => h("button", { class: "gcard " + cls, onclick }, svgEl(art, cows), h("div", { class: "gtx" }, h("small", {}, sub), h("b", {}, title), h("p", {}, typeof text === "function" ? text() : text)));
  const dark = () => document.documentElement.dataset.theme === "dark";
  return h("div", { class: "screen" },
    h("div", { class: "bar" }, h("button", { class: "round", "aria-label": "Indietro", onclick: () => history.back() }, backIcon()), h("h1", {}, "Giochi", h("small", {}, "per le pause dallo studio"))),
    h("div", { class: "scroll" }, h("div", { class: "wrapc gwrap" },
      card("glab", "Mimì e Mumù nel mondo della fisica", "laboratorio",
        () => dark() ? "Nel mondo astronomico c'è Mumù: fluttua nello spazio, lanciala e la gravità delle galassie la attira. Col tema chiaro trovi Mimì." : "Nel mondo quantistico c'è Mimì: pietra di uranio che emette raggi gamma, scatola e scanner a raggi X. Col tema scuro trovi Mumù nello spazio.",
        () => go(labScreen), labArt(), true),
      card("gnight", "Nightmare before the exam", "minigioco", "La notte prima dell'esame i concetti che fanno paura attaccano. Difendi la mucca, raccogli gli aiuti, entra in classifica.",
        () => window.MX_GAME_OPEN && window.MX_GAME_OPEN(), nightArt()))));
}

function cowArt(x, y, s, spots, flip, rot = 0, helmet = false) {
  // mucca di profilo che guarda a destra (flip: a sinistra); spots = [macchia grande, macchia piccola]
  const ink = "#2a2236", milk = "#fbf7ef";
  const leg = (lx, a) => `<g transform="rotate(${a} ${lx} 8)"><path d="M${lx} 8v13" stroke="${ink}" stroke-width="6.5" stroke-linecap="round"/><path d="M${lx} 8v12" stroke="${milk}" stroke-width="4" stroke-linecap="round"/><rect x="${lx - 3.2}" y="19" width="6.4" height="4" rx="1.5" fill="${ink}"/></g>`;
  const k = helmet ? 14 : 0;
  return `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${flip ? -s : s} ${s})">
    <path d="M-25 -4q-9 4-8 16" stroke="${ink}" stroke-width="2" fill="none" stroke-linecap="round"/><path d="M-33 12q-3 3 0 6q3-2 0-6z" fill="${ink}"/>
    ${leg(-16, helmet ? 18 : 0)}${leg(-8, helmet ? -10 : 0)}${leg(8, helmet ? 14 : 0)}${leg(16, helmet ? -16 : 0)}
    <ellipse cx="0" cy="0" rx="26" ry="14" fill="${milk}" stroke="${ink}" stroke-width="2"/>
    <path d="M-12 -8q6-8 14-3q4 6-3 10q-9 4-12-2q-2-3 1-5z" fill="${spots[0]}"/>
    <path d="M9 2q5-4 10 0q2 5-4 6q-6 0-6-6z" fill="${spots[1]}"/>
    <path d="M-4 12q3 5 6 0" fill="#f0b3bd" stroke="${ink}" stroke-width="1.4"/>
    <g transform="translate(26 -12)">
      <path d="M-5 -9q-4-6 0-8M6 -9q4-6 0-8" stroke="#d8c9a8" stroke-width="2.6" fill="none" stroke-linecap="round"/>
      <ellipse cx="-9" cy="-6" rx="5" ry="2.6" transform="rotate(-25 -9 -6)" fill="${milk}" stroke="${ink}" stroke-width="1.6"/>
      <ellipse cx="0" cy="0" rx="10" ry="11" fill="${milk}" stroke="${ink}" stroke-width="2"/>
      <path d="M-3 -10q4 3 8-1" fill="${spots[1]}"/>
      <circle cx="3" cy="-3" r="2" fill="${ink}"/><circle cx="3.7" cy="-3.6" r=".7" fill="#fff"/>
      <ellipse cx="4" cy="6.5" rx="7.5" ry="5.5" fill="#f0b3bd" stroke="${ink}" stroke-width="1.6"/>
      <circle cx="2" cy="6" r="1.1" fill="${ink}"/><circle cx="7" cy="6" r="1.1" fill="${ink}"/>
      ${helmet ? `<circle cx="1" cy="0" r="${k + 3}" fill="rgba(196,168,255,.16)" stroke="#c4a8ff" stroke-width="1.8"/><path d="M-8 -10q4-5 10-5" stroke="#fff" stroke-width="2" fill="none" stroke-linecap="round" opacity=".7"/>` : ""}
    </g></g>`;
}
function atomDots(cx, cy, R) {
  let s = "";
  [0, 60, -60].forEach((rot, i) => {
    const col = i ? "#7a4fd0" : "#db6a2c", c = Math.cos(rot * Math.PI / 180), sn = Math.sin(rot * Math.PI / 180);
    const P = a => { const x = Math.cos(a) * R, y = Math.sin(a) * R * .32; return [cx + x * c - y * sn, cy + x * sn + y * c]; };
    for (let k = 0; k < 34; k++) { const [x, y] = P(k / 34 * 2 * Math.PI); s += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r=".75" fill="${col}" opacity=".45"/>`; }
    const a0 = 1.2 + i * 2.1;
    for (let j = 0; j < 9; j++) { const [x, y] = P(a0 - j * .09); s += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(1.9 - j * .17).toFixed(2)}" fill="${col}" opacity="${(1 - j * .1).toFixed(2)}"/>`; }
  });
  return s;
}
function labArt() {
  return `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
    <defs><pattern id="gq" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M10 0H0V10" fill="none" stroke="rgba(29,23,38,.09)"/></pattern>
      <clipPath id="gcl"><path d="M0 0H120L0 120Z"/></clipPath></defs>
    <rect width="120" height="120" fill="#120d20"/>
    <circle cx="51.5" cy="96.6" r="0.6" fill="#fff" opacity="0.85"/><circle cx="56.1" cy="107.4" r="1" fill="#ffe6c4" opacity="0.70"/><circle cx="103.3" cy="42.9" r="1.2" fill="#ffe6c4" opacity="0.67"/><circle cx="110.7" cy="81.3" r="1.6" fill="#fff" opacity="0.78"/><circle cx="64.1" cy="110.3" r="1.6" fill="#fff" opacity="0.63"/><circle cx="88.0" cy="86.9" r="1.2" fill="#fff" opacity="0.81"/><circle cx="63.7" cy="91.3" r="1" fill="#fff" opacity="0.85"/><circle cx="104.8" cy="98.1" r="1.2" fill="#ffe6c4" opacity="0.92"/><circle cx="105.3" cy="94.3" r="0.8" fill="#d9ccff" opacity="0.86"/><circle cx="105.9" cy="43.6" r="1.2" fill="#d9ccff" opacity="0.93"/><circle cx="40.5" cy="113.0" r="1.6" fill="#fff" opacity="0.88"/><circle cx="79.2" cy="52.0" r="0.8" fill="#ffe6c4" opacity="0.91"/>
    <g clip-path="url(#gcl)"><rect width="120" height="120" fill="#f6f1e8"/><rect width="120" height="120" fill="url(#gq)"/>${atomDots(37, 40, 30)}</g>
    <path d="M0 120L120 0" stroke="#db6a2c" stroke-width="1.5" stroke-dasharray="3 4"/>
  </svg>`;
}
function nightArt() {
  const alien = (x, y, s, c) => `<g transform="translate(${x} ${y}) scale(${s})">
    <path d="M-12 4q0-18 12-18t12 18l-3 6-3-5-3 6-3-6-3 6-3-6-3 5z" fill="${c}"/>
    <circle cx="0" cy="-4" r="5.5" fill="#fff"/><circle cx="1" cy="-3.5" r="2.6" fill="#140c1c"/>
    <path d="M-7-12l-4-6M7-12l4-6" stroke="${c}" stroke-width="2" stroke-linecap="round"/><circle cx="-11" cy="-18" r="2" fill="${c}"/><circle cx="11" cy="-18" r="2" fill="${c}"/></g>`;
  return `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
    <defs><radialGradient id="gnr" cx="50%" cy="0%" r="80%"><stop offset="0" stop-color="#7a1424"/><stop offset="1" stop-color="#140c1c"/></radialGradient>
      <linearGradient id="gbeam" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f2914f" stop-opacity=".5"/><stop offset="1" stop-color="#f2914f" stop-opacity="0"/></linearGradient></defs>
    <rect width="120" height="120" fill="url(#gnr)"/>
    <circle cx="14" cy="60" r="1" fill="#fff" opacity=".6"/><circle cx="104" cy="56" r="1.2" fill="#fff" opacity=".7"/><circle cx="60" cy="10" r="1" fill="#fff" opacity=".5"/>
    <path d="M6 44C14 44 16 12 23 12S32 44 40 44Z" fill="#a98bf0"/><circle cx="19" cy="30" r="3.4" fill="#fff"/><circle cx="27" cy="30" r="3.4" fill="#fff"/><circle cx="19.6" cy="30.6" r="1.6" fill="#140c1c"/><circle cx="27.6" cy="30.6" r="1.6" fill="#140c1c"/><path d="M44 22q4-10 8 0t8 0 8 0 8 0" fill="none" stroke="#9fd0ff" stroke-width="5" stroke-linecap="round"/><circle cx="56" cy="20" r="3.4" fill="#fff"/><circle cx="64" cy="20" r="3.4" fill="#fff"/><circle cx="56.6" cy="20.6" r="1.6" fill="#140c1c"/><circle cx="64.6" cy="20.6" r="1.6" fill="#140c1c"/><path d="M86 8h28l-11 16 11 16H86l11-16Z" fill="#8a6ae0"/><circle cx="96" cy="24" r="3.4" fill="#fff"/><circle cx="104" cy="24" r="3.4" fill="#fff"/><circle cx="96.6" cy="24.6" r="1.6" fill="#140c1c"/><circle cx="104.6" cy="24.6" r="1.6" fill="#140c1c"/>
    <path d="M60 68l-6 14M60 68l6 14" stroke="#ff5a6e" stroke-width="2.5" stroke-linecap="round" opacity=".0"/>
    <circle cx="44" cy="58" r="2.5" fill="#ff5a6e"/><circle cx="80" cy="54" r="2.5" fill="#c46bff"/>
    <path d="M36 120l14-28h20l14 28z" fill="url(#gbeam)"/>
    <g transform="translate(60 84) scale(1.45)">
      <path d="M-11-10a11 12 0 0 1 22 0" fill="rgba(196,168,255,.25)" stroke="#c4a8ff" stroke-width="1.4"/>
      <circle cx="0" cy="-10" r="7.5" fill="#fbf7ef" stroke="#2a2236" stroke-width="1.6"/>
      <path d="M-5-17l-3-4M5-17l3-4" stroke="#2a2236" stroke-width="1.6" stroke-linecap="round"/>
      <circle cx="-3" cy="-12" r="2.6" fill="#fff" stroke="#2a2236" stroke-width="1"/><circle cx="3" cy="-12" r="2.6" fill="#fff" stroke="#2a2236" stroke-width="1"/>
      <circle cx="-3" cy="-12" r=".9" fill="#2a2236"/><circle cx="3" cy="-12" r=".9" fill="#2a2236"/>
      <ellipse cx="0" cy="-5.5" rx="2.2" ry="2.6" fill="#2a2236"/>
      <path d="M9-16q2 3 0 4.5q-2-1.5 0-4.5z" fill="#8fd3ff"/>
      <ellipse cx="0" cy="0" rx="26" ry="7" fill="#2a2140" stroke="#c4a8ff" stroke-width="1.6"/>
      <circle cx="-14" cy="0" r="1.6" fill="#f2914f"/><circle cx="0" cy="2" r="1.6" fill="#f2914f"/><circle cx="14" cy="0" r="1.6" fill="#f2914f"/>
    </g>
  </svg>`;
}
function svgEl(markup, cows) {
  const d = document.createElement("div"); d.className = "gpic"; d.innerHTML = markup;
  if (cows && window.MILK_COW_PIC) {
    // le stesse mucche dell'app: Mimì in alto a sinistra, Mumù in basso a destra
    const pic = (astro, css) => { const c = document.createElement("canvas"); c.width = c.height = astro ? 260 : 200; c.className = "gcow" + (astro ? " big" : ""); c.style.cssText = css; window.MILK_COW_PIC(c, astro, astro ? 2.1 : 2.3); d.append(c); };
    pic(false, "left:0;top:-4%"); pic(true, "right:-6%;bottom:-8%");
  }
  return d;
}
function labScreen() {
  return h("div", { class: "screen lab" },
    h("div", { class: "bar" }, h("button", { class: "round", "aria-label": "Indietro", onclick: () => history.back() }, backIcon()),
      h("h1", {}, document.documentElement.dataset.theme === "dark" ? "Mumù" : "Mimì", h("small", {}, document.documentElement.dataset.theme === "dark" ? "nel mondo astronomico" : "nel mondo quantistico")), themeButton()),
    h("div", { class: "labhint" }, document.documentElement.dataset.theme === "dark" ? "Prendi la mucca e lanciala" : "Strumenti in basso a destra · ? per la guida"));
}
