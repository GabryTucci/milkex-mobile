// Icone SVG di MILKeX (tratto 2px, 24x24)
const ICON_PATHS = {
  f_bold: "M7 4h6.6a4.2 4.2 0 0 1 2.9 7.2A4.4 4.4 0 0 1 14.4 20H7zm3.2 3v3.6h3.3a1.8 1.8 0 0 0 0-3.6zm0 6.4V17h4a1.8 1.8 0 0 0 0-3.6z",
  f_italic: "M10 4h8.5v3h-3l-3.3 10h3v3H6.7v-3h3l3.3-10h-3z",
  f_underline: "M7 3h3v8a2 2 0 0 0 4 0V3h3v8a5 5 0 0 1-10 0zM5 19h14v2.4H5z",
  f_textsize: "M2 5h12v3H9.6v12H6.4V8H2zm11 5h9v2.6h-3V20h-3v-7.4h-3z",
  f_math: "M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zm2.7 3v1.8H6v1.5h1.7V11h1.5V9.3H11V7.8H9.2V6zM13 7.8v1.5h5V7.8zm-6.6 6.7-1 1 1.6 1.6-1.6 1.6 1 1L8 18.1l1.6 1.6 1-1L9 17.1l1.6-1.6-1-1L8 16.1zM13 14.2v1.5h5v-1.5zm0 2.8v1.5h5V17z",
  f_omega: "M12 3.5a7.5 7.5 0 0 0-4.6 13.4V18H4v2.5h6.2v-4.9a4.7 4.7 0 1 1 3.6 0v4.9H20V18h-3.4v-1.1A7.5 7.5 0 0 0 12 3.5z",
  f_addcomment: "M4 3h16a1.5 1.5 0 0 1 1.5 1.5v11A1.5 1.5 0 0 1 20 17H8.5L3 21.5V4.5A1.5 1.5 0 0 1 4 3zm7 3v3H8v2h3v3h2v-3h3V9h-3V6z",
  f_label: "M3 4.2v7.3L12.5 21 21 12.5 11.5 3H4.2A1.2 1.2 0 0 0 3 4.2zM7.5 6a1.6 1.6 0 1 1 0 3.2 1.6 1.6 0 0 1 0-3.2z",
  f_cite: "M6.5 2.5H18a1 1 0 0 1 1 1v14.5H7a1.2 1.2 0 0 0 0 2.4h12v2.1H7a3.4 3.4 0 0 1-3.4-3.4V5.4A2.9 2.9 0 0 1 6.5 2.5zM9 6v2h7V6z",
  f_image: "M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zm1 14h12l-3.8-5-3 3.8-2.1-2.6zM8.5 6.5a2 2 0 1 0 0 4 2 2 0 0 0 0-4z",
  f_table: "M3 4h18v16H3zm2 6v3.5h4V10zm6 0v3.5h8V10zm-6 5.5V18h4v-2.5zm6 0V18h8v-2.5z",
  f_list: "M3.5 5h2.5v2.5H3.5zM9 5h11.5v2.5H9zm-5.5 5.75h2.5v2.5H3.5zM9 10.75h11.5v2.5H9zM3.5 16.5h2.5V19H3.5zM9 16.5h11.5V19H9z",
  f_olist: "M3 3.5h2.4v5H4V5H3zM9 5h11.5v2.5H9zm0 5.75h11.5v2.5H9zM9 16.5h11.5V19H9zM3 10.5h3.4v1.2l-1.6 1.6h1.6v1.2H3v-1.2l1.6-1.6H3zm0 6h3.4v4.5H3v-1.1h2.2v-.6H4v-1h1.2v-.7H3z",
  f_undo: "M12.5 8c-2.6 0-5 1-6.9 2.6L2 7v9h9l-3.6-3.6A7.9 7.9 0 0 1 20.2 16l2.3-.8A10.5 10.5 0 0 0 12.5 8z",
  f_redo: "M11.5 8c2.6 0 5 1 6.9 2.6L22 7v9h-9l3.6-3.6A7.9 7.9 0 0 0 3.8 16l-2.3-.8A10.5 10.5 0 0 1 11.5 8z",
  f_search: "M10 3a7 7 0 0 1 5.6 11.2l5.4 5.4-1.6 1.6-5.4-5.4A7 7 0 1 1 10 3zm0 2.4a4.6 4.6 0 1 0 0 9.2 4.6 4.6 0 0 0 0-9.2z",
  f_sigma: "M5 3h14v4h-2.4V5.4H9.2l4.8 6.6-4.8 6.6h7.4V17H19v4H5v-2l5.4-7L5 5z",
  menu: "M4 6h16M4 12h16M4 18h16",
  bookmark: "M6 3h12v18l-6-4.5L6 21z",
  // Stampa CHEAP: mano aperta che regge una moneta con un germoglio (risparmio)
  hands: "M2 14h3v7.5H2zM5 15h3.2c.8 0 1.6.2 2.3.6l1.2.7H15a1.5 1.5 0 0 1 0 3h-4.5M5 20.5h8.5c.9 0 1.7-.3 2.4-.8l5-3.8a1.4 1.4 0 0 0-1.8-2.1l-4 2.6M17.5 8a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0zM14 6.6v2.8M14 4.5V3M14 3c-.4-1.2-1.4-1.6-2.4-1.5.1 1 .9 1.7 2.4 1.5zM14 3c.4-1.2 1.4-1.6 2.4-1.5-.1 1-.9 1.7-2.4 1.5z",
  chat: "M4 5h16v11H9l-5 4zM8 9.5h8M8 12.5h5",
  feedback: "M12 3l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.4 6.8 19.1l1-5.8-4.3-4.1 5.9-.9z",
  code: "M8 6 2 12l6 6M16 6l6 6-6 6",
  split: "M3 4h18v16H3zM12 4v16",
  page: "M6 3h9l5 5v13H6zM15 3v5h5",
  share: "M9 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM2 21c0-4 3-7 7-7s7 3 7 7M19 8v6M16 11h6",
  sync: "M20 12a8 8 0 0 1-14.3 4.9M4 12a8 8 0 0 1 14.3-4.9M18 3v4.5h-4.5M6 21v-4.5h4.5",
  comment: "M4 5h16v11H9l-5 4z",
  history: "M3 12a9 9 0 1 0 2.6-6.4L3 8M3 3v5h5M12 7v5l3 2",
  count: "M5 9h15M4 15h15M10 3 8 21M16 3l-2 18",
  settings: "M19.42 10.34 L21.90 10.60 L21.90 13.40 L19.42 13.66 L18.42 16.07 L19.99 18.02 L18.02 19.99 L16.07 18.42 L13.66 19.42 L13.40 21.90 L10.60 21.90 L10.34 19.42 L7.93 18.42 L5.98 19.99 L4.01 18.02 L5.58 16.07 L4.58 13.66 L2.10 13.40 L2.10 10.60 L4.58 10.34 L5.58 7.93 L4.01 5.98 L5.98 4.01 L7.93 5.58 L10.34 4.58 L10.60 2.10 L13.40 2.10 L13.66 4.58 L16.07 5.58 L18.02 4.01 L19.99 5.98 L18.42 7.93ZM12 15.2a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4z",
  newfile: "M6 3h9l5 5v13H6zM15 3v5h5M12 11v6M9 14h6",
  newfolder: "M3 6h6l2 2h10v11H3zM12 11v5M9.5 13.5h5",
  upload: "M12 16V4M7 9l5-5 5 5M4 20h16",
  download: "M12 4v12M7 11l5 5 5-5M4 20h16",
  undo: "M9 14 4 9l5-5M4 9h11a5 5 0 0 1 0 10h-3",
  redo: "M15 14l5-5-5-5M20 9H9a5 5 0 0 0 0 10h3",
  search: "M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14zM20 20l-4-4",
  log: "M6 3h9l5 5v13H6zM15 3v5h5M9 13h6M9 17h6",
  recompile: "M20 12a8 8 0 1 1-2.3-5.7M20 4v5h-5",
  plus: "M12 5v14M5 12h14",
  minus: "M5 12h14",
  external: "M14 4h6v6M20 4l-9 9M18 14v6H4V6h6",
  close: "M6 6l12 12M18 6 6 18",
  up: "M6 15l6-6 6 6",
  right: "M9 6l6 6-6 6",
  down: "M6 9l6 6 6-6",
  selection: "M4 6h16M4 10h10M4 14h16M4 18h10",
  replace: "M4 8h11l-3-3M20 16H9l3 3",
  image: "M3 5h18v14H3zM3 16l5-5 4 4 3-3 6 6M15 9.5a1.5 1.5 0 1 0 0-.1",
  table: "M3 5h18v14H3zM3 10h18M3 15h18M9 5v14M15 5v14",
  list: "M9 6h11M9 12h11M9 18h11M4.5 6h.01M4.5 12h.01M4.5 18h.01",
  check: "M4 12.5l5 5L20 6.5",
  // Gatto di Schrödinger: il gatto nella scatola, con il segno di "vivo" (corretto)
  cat: "M3 13h18v8H3zM6.5 13V3.5L10 6.5h4l3.5-3V13M9.8 9.6h.01M14.2 9.6h.01M11.2 11.3h1.6M8.5 17l2 2 4.5-4.5",
  // Apprendista Scienziato: beuta con una scintilla di idea
  wave: "M3 5h18v14H3zM5 12c1.5-5 3.5-5 5 0s3.5 5 5 0 3-5 4-2",
  flask: "M9 3h5M10 3v5.5L4.6 18.4A1.8 1.8 0 0 0 6.2 21h11.1a1.8 1.8 0 0 0 1.6-2.6L13.5 8.5V3M7.2 15h9.1M19 3.5l.6 1.4 1.4.6-1.4.6-.6 1.4-.6-1.4-1.4-.6 1.4-.6z",
  book: "M4 5a2 2 0 0 1 2-2h13v15H6a2 2 0 0 0-2 2zM4 20a2 2 0 0 0 2 2h13v-4M8 7h7M8 11h5",
  olist: "M10 6h10M10 12h10M10 18h10M4 5l1.5-1v5M3.5 14.5a1.5 1.5 0 0 1 3 .5L3.5 19h3",
  home: "M3 11 12 3l9 8M5 9.5V21h5v-6h4v6h5V9.5",
  link: "M10 13.5a4.2 4.2 0 0 0 6 0l3.2-3.2a4.2 4.2 0 0 0-6-6l-1.4 1.4M14 10.5a4.2 4.2 0 0 0-6 0l-3.2 3.2a4.2 4.2 0 0 0 6 6l1.4-1.4",
  topdf: "M5 12h14M13 6l6 6-6 6",
};
function ic(name, cls = "") {
  if (name.startsWith("f_")) return `<svg class="ic ${cls}" viewBox="0 0 24 24" fill="currentColor" fill-rule="evenodd" aria-hidden="true"><path d="${ICON_PATHS[name] || ""}"/></svg>`;
  const p = ICON_PATHS[name] || "";
  const body = p.startsWith("<") ? p.replaceAll("MID", "icm" + (ic.n = (ic.n || 0) + 1)) : `<path d="${p}"/>`;
  return `<svg class="ic ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;
}
// sostituisce <i data-ic="nome"></i> con l'icona
function applyIcons(root = document) {
  root.querySelectorAll("[data-ic]").forEach(el => { el.outerHTML = ic(el.dataset.ic); });
}
