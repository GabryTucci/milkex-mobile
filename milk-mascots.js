/* MILKeX — mascotte delle sezioni vuote. Ogni volta che si apre una sezione senza niente dentro ne esce una a caso.
   Stile comune: contorno inchiostro, corpi color latte, accenti arancione e viola, formule nel serif di LaTeX. */
const MASCOTS = (() => {
  const INK = "var(--ink)", MILK = "#fffaf0", O = "#f0884a", V = "#7b4fd6", T = (x, y, s, txt, c = "var(--ink-3)", sz = 12, a = "start") =>
    `<text x="${x}" y="${y}" font-family="Latin Modern,serif" font-style="italic" font-size="${sz}" fill="${c}" text-anchor="${a}">${txt}</text>`;
  const ground = (y = 150, x1 = 20, x2 = 230) => `<path d="M${x1} ${y}H${x2}" stroke="var(--line-2)" stroke-width="1.5" stroke-dasharray="3 5"/>`;
  return [
    { // 0: la mucca sferica (presa dalla pagina)
      id: "cow", title: "Nessun progetto qui", quip: "Assumiamo una mucca sferica nel vuoto…", svg: "<svg class=\"cow\" viewBox=\"0 0 250 172\" aria-hidden=\"true\"><defs><radialGradient id=\"cowSh\" cx=\".36\" cy=\".32\" r=\".75\"><stop offset=\"0\" stop-color=\"#fffdf8\"/><stop offset=\".7\" stop-color=\"#efe7da\"/><stop offset=\"1\" stop-color=\"#d9cfbf\"/></radialGradient><clipPath id=\"cowC\"><circle cx=\"100\" cy=\"86\" r=\"54\"/></clipPath></defs>\n<ellipse cx=\"100\" cy=\"146\" rx=\"40\" ry=\"4\" fill=\"var(--ink)\" opacity=\".08\"/>\n<path d=\"M58 50c-14-4-24-12-22-20 10-1 20 5 26 13M142 50c14-4 24-12 22-20-10-1-20 5-26 13\" fill=\"#fffdf8\" stroke=\"var(--ink)\" stroke-width=\"2.2\" stroke-linejoin=\"round\"/>\n<path d=\"M78 38c-6-10-4-20 2-24M122 38c6-10 4-20-2-24\" fill=\"none\" stroke=\"#c9b79c\" stroke-width=\"5\" stroke-linecap=\"round\"/>\n<circle cx=\"100\" cy=\"86\" r=\"54\" fill=\"url(#cowSh)\"/>\n<g clip-path=\"url(#cowC)\" fill=\"#231c2e\"><path transform=\"translate(58 62) scale(.62) translate(-58 -62)\" d=\"M48 58c10-14 30-12 34-2 3 8-4 12-2 20s-10 14-20 10-22-14-12-28z\"/><path d=\"M128 40c12-4 26 4 24 16-1 8-10 8-14 14s-14 4-16-4 0-22 6-26z\"/><path d=\"M134 108c8-6 20-2 22 6 2 10-8 18-18 16s-12-14-4-22z\"/><path d=\"M70 118c4-4 12-2 12 4s-8 8-12 6-2-8 0-10z\"/><path d=\"M108 58c3-2 7 0 6 3s-5 4-7 2 0-4 1-5z\"/></g>\n<circle cx=\"100\" cy=\"86\" r=\"54\" fill=\"none\" stroke=\"var(--ink)\" stroke-width=\"2.2\"/>\n<ellipse cx=\"100\" cy=\"114\" rx=\"20\" ry=\"12\" fill=\"#f2c3cc\" stroke=\"var(--ink)\" stroke-width=\"2\"/><ellipse cx=\"93\" cy=\"114\" rx=\"2.2\" ry=\"3\" fill=\"var(--ink)\"/><ellipse cx=\"107\" cy=\"114\" rx=\"2.2\" ry=\"3\" fill=\"var(--ink)\"/>\n<g><ellipse cx=\"84\" cy=\"86\" rx=\"7\" ry=\"8\" fill=\"#fff\" stroke=\"#231c2e\" stroke-width=\"1.6\"/><ellipse cx=\"116\" cy=\"86\" rx=\"7\" ry=\"8\" fill=\"#fff\" stroke=\"#231c2e\" stroke-width=\"1.6\"/><circle cx=\"85.5\" cy=\"87.5\" r=\"3.6\" fill=\"#231c2e\"/><circle cx=\"117.5\" cy=\"87.5\" r=\"3.6\" fill=\"#231c2e\"/><circle cx=\"86.8\" cy=\"86\" r=\"1.2\" fill=\"#fff\"/><circle cx=\"118.8\" cy=\"86\" r=\"1.2\" fill=\"#fff\"/><path d=\"M76 74q8-5 15 0M109 74q7-5 15 0\" fill=\"none\" stroke=\"#231c2e\" stroke-width=\"1.8\" stroke-linecap=\"round\"/></g>\n<path d=\"M100 148H154M100 144v8M154 144v8\" stroke=\"var(--violet-500)\" stroke-width=\"1.2\" fill=\"none\"/>\n<text x=\"124\" y=\"163\" font-family=\"Latin Modern,serif\" font-style=\"italic\" font-size=\"14\" fill=\"var(--violet-500)\">r</text>\n<text x=\"160\" y=\"128\" font-family=\"Latin Modern,serif\" font-style=\"italic\" font-size=\"12\" fill=\"var(--ink-3)\">V = ⁴⁄₃πr³</text>\n<text x=\"160\" y=\"146\" font-family=\"Latin Modern,serif\" font-style=\"italic\" font-size=\"12\" fill=\"var(--ink-3)\">ρ ≈ 1,03 g/cm³</text></svg>" },
    { // 1: gatto rosso cubico
      id: "cat", title: "Qui non c'è niente", quip: "Un gatto sferico era troppo mainstream.",
      svg: `<svg viewBox="0 0 250 172" aria-hidden="true">
<ellipse cx="112" cy="150" rx="58" ry="5" fill="${INK}" opacity=".08"/>
<path d="M150 118c26 6 40-14 34-36-4-14 10-22 16-14" fill="none" stroke="${INK}" stroke-width="10" stroke-linecap="round"/>
<path d="M150 118c26 6 40-14 34-36-4-14 10-22 16-14" fill="none" stroke="#e8792f" stroke-width="7" stroke-linecap="round"/>
<path d="M70 70l44-22 44 22-44 22z" fill="#f6a465" stroke="${INK}" stroke-width="2.2" stroke-linejoin="round"/>
<path d="M70 70v52l44 22V92z" fill="#e8792f" stroke="${INK}" stroke-width="2.2" stroke-linejoin="round"/>
<path d="M158 70v52l-44 22V92z" fill="#c85f1d" stroke="${INK}" stroke-width="2.2" stroke-linejoin="round"/>
<path d="M78 98l28 14M80 112l26 13M140 104l10-5M136 120l14-7" stroke="#a84b17" stroke-width="2.4" stroke-linecap="round" opacity=".55"/>
<path d="M76 73l-2-22 16 13zM100 61l12-14 2 20z" fill="#e8792f" stroke="${INK}" stroke-width="2.2" stroke-linejoin="round"/>
<path d="M77 69l-1-12 8 7z" fill="#f2b3bd"/>
<ellipse cx="85" cy="100" rx="4" ry="5.2" fill="#fff3a8" stroke="${INK}" stroke-width="1.6" transform="skewY(26.5) translate(0 -42)"/>
<ellipse cx="102" cy="108" rx="4" ry="5.2" fill="#fff3a8" stroke="${INK}" stroke-width="1.6" transform="skewY(26.5) translate(0 -51)"/>
<g transform="skewY(26.5)">
<path d="M91 68h6l-3 3.4z" fill="#f2b3bd" stroke="${INK}" stroke-width="1.1" stroke-linejoin="round"/>
<path d="M94 71.4v1.6M94 73q-2.6 3-5.4.6M94 73q2.6 3 5.4.6" fill="none" stroke="${INK}" stroke-width="1.4" stroke-linecap="round"/>
<path d="M86 70l-16-3M86 72.5l-16 1.5M102 70l14-3M102 72.5l14 1.5" stroke="${INK}" stroke-width="1" stroke-linecap="round" opacity=".7"/></g>
${T(196, 128, 0, "V = ℓ³", V, 14)}${T(196, 146, 0, "ℓ ≈ 50 cm")}</svg>` },
    { // 2: pastore tedesco di Maxwell: è una calamita, con le linee del campo magnetico attorno
      id: "dog", title: "Sezione vuota", quip: "Il pastore di Maxwell sorveglia il flusso: ∮ B·dA = 0.",
      svg: `<svg viewBox="0 0 250 172" aria-hidden="true">
<g fill="none" stroke="${V}" stroke-width="1.3" opacity=".55">
<path d="M180 92C180 40 70 40 70 92"/><path d="M186 92C190 14 60 14 64 92"/><path d="M192 92C204 -8 46 -8 58 92"/>
<path d="M180 92C180 144 70 144 70 92"/><path d="M186 92C190 170 60 170 64 92"/><path d="M192 92C204 192 46 192 58 92"/></g>
<g fill="${V}" opacity=".7"><path d="M118 53l6-3v6zM118 34l6-3v6zM118 15l6-3v6zM118 131l6 3v-6zM118 150l6 3v-6zM118 169l6 3v-6z"/></g>
<ellipse cx="125" cy="92" rx="76" ry="52" fill="none" stroke="${O}" stroke-width="1.4" stroke-dasharray="2 5"/>
<ellipse cx="124" cy="140" rx="50" ry="4" fill="${INK}" opacity=".08"/>
<path d="M82 92c-12 0-20 10-24 22 8-4 14-8 20-14" fill="#8a5a2b" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/>
<g stroke-linecap="round" fill="none">
<path d="M92 108l-3 28M104 110l2 26M146 108l-2 28M156 106l4 30" stroke="${INK}" stroke-width="8.4"/>
<path d="M92 108l-3 28M104 110l2 26M146 108l-2 28M156 106l4 30" stroke="#a8743d" stroke-width="5"/></g>
<g fill="#5b3b1d" stroke="${INK}" stroke-width="1.6"><ellipse cx="88" cy="137" rx="5" ry="2.6"/><ellipse cx="107" cy="137" rx="5" ry="2.6"/><ellipse cx="145" cy="137" rx="5" ry="2.6"/><ellipse cx="161" cy="137" rx="5" ry="2.6"/></g>
<path d="M80 94c0-14 16-20 42-20 22 0 36 4 40 14 4 10 0 22-12 26-14 4-40 4-56 0-10-2-14-10-14-20z" fill="#b07a40" stroke="${INK}" stroke-width="2.2"/>
<path d="M84 90c4-10 24-14 44-12 14 2 24 6 28 12-14 8-58 10-72 0z" fill="#2c2230"/>
<path d="M156 92c2-10 6-20 14-26" stroke="${INK}" stroke-width="2.2" fill="none"/>
<path d="M150 80c2-16 12-26 26-26 12 0 20 8 22 16l12 4c4 2 4 8 0 10l-14 4c-6 2-14 2-20 0-12-2-24-2-26-8z" fill="#b07a40" stroke="${INK}" stroke-width="2.2" stroke-linejoin="round"/>
<path d="M196 80l12 4c3 1 3 6 0 7l-12 3" fill="#2c2230"/><circle cx="210" cy="86" r="2.6" fill="${INK}"/>
<path d="M160 64l-4-20 16 14zM174 58l6-20 8 20z" fill="#2c2230" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/>
<path d="M161 60l-2-9 7 6z" fill="#d68aa0" opacity=".6"/>
<circle cx="185" cy="72" r="3" fill="${INK}"/><circle cx="186" cy="71" r="1" fill="#fff"/>
<path d="M200 94q-6 4-12 1" fill="none" stroke="${INK}" stroke-width="1.6" stroke-linecap="round"/>
<g font-family="Latin Modern,serif" font-weight="700" font-size="13"><text x="214" y="112" fill="${O}">N</text><text x="34" y="112" fill="${V}">S</text></g>
${T(14, 28, 0, "∮ B · dA = 0", O, 14)}</svg>` },
    { // 3: piccione vitruviano
      id: "pigeon", title: "Niente da mostrare", quip: "Le proporzioni divine del piccione vitruviano.",
      svg: `<svg viewBox="0 0 250 172" aria-hidden="true">
<circle cx="125" cy="84" r="60" fill="none" stroke="${INK}" stroke-width="1.4" opacity=".55"/>
<rect x="76.5" y="47" width="97" height="97" fill="none" stroke="${INK}" stroke-width="1.4" opacity=".55"/>
<g fill="#cfd3e6" stroke="${INK}" stroke-width="1.8" stroke-linejoin="round" opacity=".45">
<path d="M118 82C104 76 90 64 77 48 94 54 110 64 122 76zM132 82C146 76 160 64 173 48 156 54 140 64 128 76z"/></g>
<g fill="#cfd3e6" stroke="${INK}" stroke-width="1.8" stroke-linejoin="round">
<path d="M118 88C104 88 89 86 76.5 78 92 74 106 76 118 80zM132 88C146 88 161 86 173.5 78 158 74 144 76 132 80z"/>
<path d="M82 79l-4-3M88 83l-6-1M168 79l4-3M162 83l6-1" fill="none"/></g>
<path d="M112 80c0-12 6-20 13-20s13 8 13 20c0 18-6 30-13 34-7-4-13-16-13-34z" fill="#a9afc9" stroke="${INK}" stroke-width="2"/>
<path d="M115 86c4 6 16 6 20 0-2 10-18 10-20 0z" fill="${V}" opacity=".55"/><path d="M116 92c4 4 14 4 18 0" stroke="#5fb39a" stroke-width="2.2" fill="none" opacity=".8"/>
<circle cx="125" cy="56" r="9" fill="#a9afc9" stroke="${INK}" stroke-width="2"/><path d="M125 60l3 6-6 0z" fill="${O}" stroke="${INK}" stroke-width="1.2"/>
<circle cx="121" cy="54" r="2.2" fill="#f0884a"/><circle cx="129" cy="54" r="2.2" fill="#f0884a"/><circle cx="121" cy="54" r=".9" fill="${INK}"/><circle cx="129" cy="54" r=".9" fill="${INK}"/>
<g stroke="${O}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" fill="none">
<path d="M121 112l-3 32M129 112l3 32"/><path d="M118 144h-6M118 144h3M132 144h6M132 144h-3"/>
<g opacity=".45"><path d="M121 112L99 138M129 112L151 138"/><path d="M99 138h-6M99 138l-2 4M99 138l3 3M151 138h6M151 138l2 4M151 138l-3 3"/></g></g>
${T(190, 162, 0, "φ = 1,618…", V, 13)}</svg>` },
    { // 4: paradosso di Zenone
      id: "zeno", title: "Ancora niente", quip: "Σ 1/2ⁿ = 1, ma la lepre non lo sa.",
      svg: `<svg viewBox="0 0 250 172" aria-hidden="true">
<path d="M14 136H236" stroke="${INK}" stroke-width="1.6"/>
<g stroke="${INK}" stroke-width="1.4"><path d="M20 130v12M120 132v8M170 132v8M195 133v6M207 134v4M213 134v4M216 135v2"/></g>
<g>${T(20, 156, 0, "0", "var(--ink-3)", 11, "middle")}${T(120, 156, 0, "½", "var(--ink-3)", 11, "middle")}${T(170, 156, 0, "¾", "var(--ink-3)", 11, "middle")}${T(198, 156, 0, "⅞", "var(--ink-3)", 11, "middle")}${T(224, 156, 0, "…1", "var(--ink-3)", 11, "middle")}</g>
<g fill="none" stroke="${V}" stroke-width="1.2" stroke-dasharray="3 3" opacity=".7"><path d="M20 122q50-26 100 0"/><path d="M120 122q25-16 50 0"/><path d="M170 124q12-9 25 0"/><path d="M195 126q6-5 12 0"/></g>
<g transform="translate(150 98)"><ellipse cx="0" cy="38" rx="26" ry="3" fill="${INK}" opacity=".08"/>
<path d="M-26 22c0-14 12-22 28-22 14 0 22 8 22 18 0 6-4 10-10 10h-34c-4 0-6-2-6-6z" fill="#efe3d0" stroke="${INK}" stroke-width="2"/>
<path d="M16 6c4-14 2-26-4-32 8 2 12 16 10 30M22 6c8-12 10-24 6-30 8 6 6 20 0 30" fill="#efe3d0" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/>
<circle cx="22" cy="12" r="10" fill="#efe3d0" stroke="${INK}" stroke-width="2"/><circle cx="25" cy="10" r="2" fill="${INK}"/><path d="M31 14l2 1" stroke="${INK}" stroke-width="1.6"/>
<path d="M-20 32l-8 6M-4 32l-6 6M10 30l8 8" stroke="${INK}" stroke-width="2.4" stroke-linecap="round"/><circle cx="-27" cy="16" r="5" fill="#fff" stroke="${INK}" stroke-width="1.6"/></g>
<g transform="translate(208 118)"><path d="M-16 14c0-12 6-18 16-18s16 6 16 18z" fill="#7d9a5c" stroke="${INK}" stroke-width="2"/>
<path d="M-8 2l8 6 8-6M-12 10h24M0 8v6" stroke="#4f6b37" stroke-width="1.4" fill="none"/>
<path d="M16 10c4-4 10-4 12 0 2 4-2 6-6 6h-6" fill="#a9b97f" stroke="${INK}" stroke-width="2"/><circle cx="24" cy="9" r="1.4" fill="${INK}"/>
<path d="M-12 14v4M10 14v4" stroke="${INK}" stroke-width="3" stroke-linecap="round"/></g>
</svg>` },
    { // 5: giraffa e momento d'inerzia del collo (asta sottile, asse per il centro)
      id: "giraffe", title: "Vuoto, per ora", quip: "Collo lungo, momento d'inerzia grande.",
      svg: `<svg viewBox="0 0 250 172" aria-hidden="true">
<ellipse cx="96" cy="152" rx="44" ry="4" fill="${INK}" opacity=".08"/>
<g stroke="${INK}" stroke-width="2.2" stroke-linejoin="round" fill="#f3c46a">
<path d="M64 112v38M78 114v36M112 112v38M124 108v42" fill="none" stroke-linecap="round" stroke-width="6"/>
<path d="M60 92c0-14 14-20 34-20 22 0 36 6 36 20v12c0 8-10 14-34 14s-36-6-36-14z"/>
<path d="M114 84C122 62 132 42 141 26c4-7 13-5 12 3-5 18-12 38-18 58-4 8-18 6-21-3z"/>
<path d="M140 22c0-10 8-16 18-14 12 2 22 8 22 14 0 4-6 6-14 6l-14 4c-8 2-12-2-12-10z"/></g>
<g stroke="#f3c46a" stroke-width="3.6" stroke-linecap="round"><path d="M64 112v36M78 114v34M112 112v36M124 108v40"/></g>
<g fill="#b56d2c"><path d="M74 82l10 2-2 10-10-2zM98 80l12 3-3 9-10-2zM70 100l9 1-1 8-9-1zM114 94l8 2-2 8-8-2zM90 98l10 1-1 9-10-1z"/>
<path d="M125 70l7 2-3 8-6-2zM133 52l6 2-3 7-6-2zM140 36l5 2-2 6-5-2z"/></g>
<path d="M150 10l-2-10M160 9l2-10" stroke="${INK}" stroke-width="2.2" stroke-linecap="round"/><circle cx="148" cy="0" r="2.4" fill="${INK}"/><circle cx="162" cy="-1" r="2.4" fill="${INK}"/>
<circle cx="160" cy="18" r="2.4" fill="${INK}"/><path d="M60 94c-8 4-12 14-10 22" stroke="${INK}" stroke-width="2" fill="none"/>
<path d="M98 39L172 70" stroke="${V}" stroke-width="1.3" stroke-dasharray="5 4"/><circle cx="134" cy="55" r="2.6" fill="${V}"/>
<g transform="translate(160 65) rotate(22.7)"><path d="M1 -11A6 11 0 1 1 -3 10.2" fill="none" stroke="${O}" stroke-width="1.6" stroke-linecap="round"/><path d="M-6.4 9.2L-1.6 7.6-2.8 12.6Z" fill="${O}"/></g>
${T(160, 100, 0, "I = <tspan font-size='11'>1/12</tspan> m ℓ²", V, 14)}${T(160, 116, 0, "asta sottile,", "var(--ink-3)", 11)}${T(160, 129, 0, "asse nel centro", "var(--ink-3)", 11)}${ground(150, 40, 150)}</svg>` },
  ];
})();
function nextMascot() {
  let st; try { st = JSON.parse(localStorage.getItem("milkex.mascots") || "{}"); } catch { st = {}; }
  let bag = Array.isArray(st.bag) ? st.bag.filter(i => i < MASCOTS.length) : [];
  if (!bag.length) {                                  // giro nuovo, mescolato; non riparte con l'ultima vista
    bag = MASCOTS.map((_, i) => i).sort(() => Math.random() - .5);
    if (bag[0] === st.last && bag.length > 1) bag.push(bag.shift());
  }
  const i = bag.shift();
  try { localStorage.setItem("milkex.mascots", JSON.stringify({ bag, last: i })); } catch { }
  return i;
}
function mascotPick() {
  if (MASCOTS[0].svg === null) {          // la mucca sferica sta nella home: la si ricorda per le altre pagine
    const c = document.querySelector("#empty svg.cow:not(.mascot)");
    if (c) { MASCOTS[0].svg = c.outerHTML; try { localStorage.setItem("milkex.cowsvg", c.outerHTML); } catch { } }
    else { try { MASCOTS[0].svg = localStorage.getItem("milkex.cowsvg"); } catch { } }
  }
  let i = nextMascot();
  if (!MASCOTS[i].svg) i = nextMascot();
  return MASCOTS[i];
}
function mascotEmpty(el, text) {
  const m = mascotPick();
  el.innerHTML = m.svg.replace("<svg ", '<svg class="cow mascot" ') + `<b>${m.title}</b><i>${m.quip}</i><p></p>`;
  el.querySelector("p").textContent = text;
  el.classList.remove("pop"); void el.offsetWidth; el.classList.add("pop");
}
