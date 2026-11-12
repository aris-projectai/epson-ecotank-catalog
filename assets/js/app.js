/* Epson EcoTank Catalog — vanilla JS, no build step */
(() => {
  "use strict";
  const P = window.PRODUCTS || [];
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  const ICON = {
    all: '<path d="M4 4h7v7H4zm9 0h7v7h-7zM4 13h7v7H4zm9 0h7v7h-7z"/>',
    print: '<path d="M7 3h10v4H7zM5 8h14a2 2 0 0 1 2 2v6h-4v4H7v-4H3v-6a2 2 0 0 1 2-2zm4 8v2h6v-2z"/>',
    aio: '<path d="M4 4h16v5H4zm0 7h16v9H4zm3 3v3h10v-3z"/>',
    office: '<path d="M10 3h4a2 2 0 0 1 2 2v2h4a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1h4V5a2 2 0 0 1 2-2zm0 2v2h4V5z"/>',
    a3: '<path d="M5 2h10l5 5v15H5zm9 1.5V8h4.5zM8 12v2h8v-2zm0 4v2h8v-2z"/>',
    photo: '<path d="M9 4h6l1.5 2H20a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h3.5zm3 4a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm0 2a3 3 0 1 1 0 6 3 3 0 0 1 0-6z"/>',
    mono: '<path d="M12 2a10 10 0 1 1 0 20 10 10 0 0 1 0-20zm0 2v16a8 8 0 0 0 0-16z"/>',
    portable: '<path d="M7 2h10a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zm0 3v13h10V5z"/>',
    plus: '<path d="M11 5h2v6h6v2h-6v6h-2v-6H5v-2h6z"/>',
    check: '<path d="M9.5 16.2 5.3 12l-1.4 1.4 5.6 5.6L20.1 8.4 18.7 7z"/>',
    ext: '<path d="M14 3h7v7h-2V6.4l-9.3 9.3-1.4-1.4L17.6 5H14zM5 5h6v2H6v11h11v-5h2v6a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z"/>',
    share: '<path d="M12 2l4 4-1.4 1.4L13 5.8V15h-2V5.8L9.4 7.4 8 6zM5 10h3v2H6v8h12v-8h-2v-2h3a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V11a1 1 0 0 1 1-1z"/>',
  };
  const svg = (k) => `<svg viewBox="0 0 24 24" aria-hidden="true">${ICON[k]}</svg>`;

  const CATS = [
    { id: "all", label: "Semua Printer", desc: "Seluruh lini printer Ink Tank Epson Indonesia — hemat, bebas repot isi ulang, hasil tajam." },
    { id: "print", label: "Warna · Cetak Saja", desc: "Printer warna single-function untuk kebutuhan cetak harian di rumah." },
    { id: "aio", label: "All-in-One", desc: "Cetak, pindai dan salin dalam satu perangkat ringkas." },
    { id: "office", label: "Kantor Kecil", desc: "ADF, faks, duplex dan jaringan untuk UMKM dan home office." },
    { id: "a3", label: "Format A3 / A3+", desc: "Cetak dokumen, poster dan gambar teknik hingga A3+." },
    { id: "photo", label: "Foto", desc: "Printer foto 6 warna untuk kreator, fotografer dan studio." },
    { id: "mono", label: "Monokrom", desc: "Khusus hitam-putih: cepat, tajam dan biaya per halaman sangat rendah." },
    { id: "portable", label: "Portabel", desc: "Printer ringkas bertenaga baterai untuk mobilitas." },
  ];
  const FEATURES = [
    { id: "wifi", label: "Wi-Fi", test: (p) => p.wifi },
    { id: "ethernet", label: "Ethernet", test: (p) => p.ethernet },
    { id: "duplex", label: "Duplex otomatis", test: (p) => p.duplex },
    { id: "adf", label: "ADF", test: (p) => p.adf },
    { id: "scan", label: "Scan & Copy", test: (p) => p.functions.includes("Scan") },
    { id: "fax", label: "Faks", test: (p) => p.functions.includes("Fax") },
    { id: "a3fmt", label: "Cetak A3+", test: (p) => p.format === "A3+" },
    { id: "lcd", label: "Layar LCD", test: (p) => !!p.lcd },
    { id: "tkdn", label: "TKDN", test: (p) => p.tkdn },
    { id: "new", label: "Baru 2026", test: (p) => p.isNew },
  ];
  const INK_INFO = {
    "664": {
      type: "Dye 4 warna · TKDN Bk 25,23% (3999/..05/2026) · C 25,25% (4003) · M 25,27% (4001) · Y 25,20% (4002)",
      colors: ["#111", "#00a0e9", "#e4007f", "#ffe100"],
    },
    "003": {
      type: "Dye 4 warna anti tumpah · TKDN Bk 25,65% (4000/..05/2026) · C 25,25% (4004) · M 25,72% (4005) · Y 25,54% (4006)",
      colors: ["#111", "#00a0e9", "#e4007f", "#ffe100"],
    },
    "001": { type: "Hitam pigmen + warna dye", colors: ["#111", "#00a0e9", "#e4007f", "#ffe100"] },
    "008": { type: "Pigmen 4 warna (bisnis)", colors: ["#111", "#00a0e9", "#e4007f", "#ffe100"] },
    "057": { type: "Dye 6 warna (foto)", colors: ["#111", "#00a0e9", "#e4007f", "#ffe100", "#7fd3f7", "#f7a8d0"] },
    "005": { type: "Hitam pigmen (mono)", colors: ["#111"] },
    "T289/T290": { type: "Kartrid (WF-100)", colors: ["#111", "#00a0e9", "#e4007f", "#ffe100"] },
  };
  const catLabel = (id) => CATS.find((c) => c.id === id)?.label || id;

  const state = {
    cat: "all", features: new Set(), ink: null, q: "", sort: "default",
    view: localStorage.getItem("view") || "grid",
    compare: JSON.parse(localStorage.getItem("compare") || "[]").filter((m) => P.some((p) => p.model === m)),
  };

  /* ---------- Theme & clock (auto-follows device OS theme) ---------- */
  const root = document.documentElement;
  const params = new URLSearchParams(location.search);
  const mq = matchMedia("(prefers-color-scheme: dark)");
  let manualTheme = params.get("theme") || sessionStorage.getItem("theme_override");
  const applyTheme = (t) => { root.dataset.theme = t; };
  applyTheme(manualTheme || (mq.matches ? "dark" : "light"));
  mq.addEventListener("change", (e) => {
    sessionStorage.removeItem("theme_override");
    manualTheme = null;
    applyTheme(e.matches ? "dark" : "light");
  });
  $("#themeBtn").onclick = () => {
    const next = root.dataset.theme === "dark" ? "light" : "dark";
    sessionStorage.setItem("theme_override", next);
    applyTheme(next);
  };
  const tick = () => {
    const d = new Date();
    $("#clock").textContent = d.toLocaleDateString("id-ID", { weekday: "short", day: "numeric", month: "short" }) + "  " +
      d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
  };
  tick(); setInterval(tick, 15000);

  /* ---------- Sidebar ---------- */
  const CAT_SHORT = { all: "Semua", print: "Cetak Saja", aio: "All-in-One", office: "Kantor", a3: "A3 / A3+", photo: "Foto", mono: "Mono", portable: "Portabel" };
  function renderSidebar() {
    $("#categoryList").innerHTML = CATS.map((c) => {
      const n = c.id === "all" ? P.length : P.filter((p) => p.category === c.id).length;
      return `<li><button class="side-item ${state.cat === c.id ? "active" : ""}" data-cat="${c.id}">
        <span class="ico">${svg(c.id)}</span>${c.label}<span class="count">${n}</span></button></li>`;
    }).join("");
    $("#featureList").innerHTML = FEATURES.map((f) => `<li><button class="side-item ${state.features.has(f.id) ? "active" : ""}" data-feat="${f.id}">
        <span class="check"></span>${f.label}<span class="count">${P.filter(f.test).length}</span></button></li>`).join("");
    $("#inkList").innerHTML = Object.keys(INK_INFO).map((k) =>
      `<button class="ink-tag ${state.ink === k ? "active" : ""}" data-ink="${k}">${k}</button>`).join("");
    if ($("#chapterNav")) {
      $("#chapterNav").innerHTML = CATS.map((c) =>
        `<button class="chapter-item ${state.cat === c.id ? "active" : ""}" data-cat="${c.id}">
          <span class="chapter-ico">${svg(c.id)}</span>
          <span class="chapter-lbl">${CAT_SHORT[c.id] || c.label}</span>
        </button>`).join("");
    }
    if ($("#mobileFeatureBar")) {
      $("#mobileFeatureBar").innerHTML = `<span class="sf-label">Fitur</span>` +
        FEATURES.map((f) => `<button class="sf-pill ${state.features.has(f.id) ? "active" : ""}" data-feat="${f.id}">${f.label}</button>`).join("");
    }
    if ($("#mobileInkBar")) {
      $("#mobileInkBar").innerHTML = `<span class="sf-label">Tinta</span>` +
        Object.keys(INK_INFO).map((k) => {
          const dots = (INK_INFO[k].colors || []).slice(0, 4).map((c) => `<i style="background:${c}"></i>`).join("");
          return `<button class="sf-pill ink ${state.ink === k ? "active" : ""}" data-ink="${k}"><span class="sf-dots">${dots}</span>${k}</button>`;
        }).join("");
    }
    const tags = [
      ...[...state.features].map((id) => `<button class="af-chip" data-feat="${id}">${FEATURES.find((f) => f.id === id).label} ×</button>`),
      ...(state.ink ? [`<button class="af-chip" data-ink="${state.ink}">Tinta ${state.ink} ×</button>`] : []),
    ];
    const af = $("#activeFilters");
    if (af) { af.innerHTML = tags.join(""); af.hidden = !tags.length; }
    const activeCount = state.features.size + (state.ink ? 1 : 0);
    const fb = $("#filterBadge"), fp = $("#filterBtn");
    if (fb) { fb.textContent = activeCount; fb.hidden = activeCount === 0; }
    if (fp) fp.classList.toggle("active", activeCount > 0);
    if ($("#sheetApply")) $("#sheetApply").textContent = `Tampilkan ${filtered().length} printer`;
  }
  const toggleDrawer = (open) => {
    const sb = $("#sidebar"), bd = $("#drawerBackdrop");
    const show = open ?? !sb.classList.contains("open");
    sb.classList.toggle("open", show);
    if (bd) bd.hidden = !show;
  };
  if ($("#filterBtn")) $("#filterBtn").onclick = () => toggleDrawer();
  if ($("#drawerClose")) $("#drawerClose").onclick = () => toggleDrawer(false);
  if ($("#sheetApply")) $("#sheetApply").onclick = () => toggleDrawer(false);
  if ($("#sheetReset")) $("#sheetReset").onclick = () => { state.cat = "all"; state.ink = null; state.features.clear(); update(); };
  if ($("#drawerBackdrop")) $("#drawerBackdrop").onclick = () => toggleDrawer(false);
  document.addEventListener("click", (e) => {
    const c = e.target.closest("[data-cat]"); if (c) { state.cat = c.dataset.cat; update(); return; }
    const f = e.target.closest("[data-feat]");
    if (f) { state.features.has(f.dataset.feat) ? state.features.delete(f.dataset.feat) : state.features.add(f.dataset.feat); update(); return; }
    const i = e.target.closest("[data-ink]");
    if (i) { state.ink = state.ink === i.dataset.ink ? null : i.dataset.ink; closeModal(); update(); }
  });

  /* ---------- Filtering ---------- */
  const haystack = (p) => [p.model, p.name, p.tagline, p.sku, p.ink, catLabel(p.category), p.functions.join(" "),
    p.wifi && "wifi wi-fi wireless", p.duplex && "duplex 2 sisi", p.adf && "adf", p.format,
    p.tkdn && `tkdn ${p.tkdnScore} ${p.tkdnCert}`, p.isNew && "baru new 2026"].join(" ").toLowerCase();
  function filtered() {
    const q = state.q.trim().toLowerCase().split(/\s+/).filter(Boolean);
    let list = P.filter((p) =>
      (state.cat === "all" || p.category === state.cat) &&
      [...state.features].every((id) => FEATURES.find((f) => f.id === id).test(p)) &&
      (!state.ink || p.ink === state.ink) &&
      q.every((t) => haystack(p).includes(t)));
    const kg = (p) => parseFloat((p.weight || "").replace(",", ".")) || 999;
    if (state.sort === "name") list = [...list].sort((a, b) => a.model.localeCompare(b.model, "en", { numeric: true }));
    if (state.sort === "new") list = [...list].sort((a, b) => b.isNew - a.isNew);
    if (state.sort === "weight") list = [...list].sort((a, b) => kg(a) - kg(b));
    return list;
  }

  /* ---------- Cards ---------- */
  function pills(p) {
    const out = [];
    out.push(`<span class="pill ${p.color ? "blue" : ""}">${p.color ? "Warna" : "Mono"}</span>`);
    if (p.functions.length > 1) out.push(`<span class="pill">${p.functions.map((f) => ({ Print: "Cetak", Scan: "Pindai", Copy: "Salin", Fax: "Faks" }[f])).join(" · ")}</span>`);
    if (p.format === "A3+") out.push('<span class="pill purple">A3+</span>');
    if (p.wifi) out.push('<span class="pill green">Wi-Fi</span>');
    if (p.duplex) out.push('<span class="pill orange">Duplex</span>');
    if (p.adf) out.push('<span class="pill">ADF</span>');
    if (p.tkdn) out.push(`<span class="pill red">TKDN ${esc(p.tkdnScore || "")}</span>`);
    return out.join("");
  }
  const imgTag = (p, cls = "") => p.image
    ? `<img src="${p.image}" alt="${esc(p.name)}" loading="lazy" class="${cls}" />`
    : `<div class="${cls}" style="display:grid;place-items:center;color:#aaa">${svg("print")}</div>`;

  function renderGrid() {
    const list = filtered();
    const cat = CATS.find((c) => c.id === state.cat);
    $("#paneTitle").textContent = cat.label;
    $("#paneCount").textContent = `${list.length} printer`;
    const isHome = state.cat === "all" && !state.features.size && !state.ink && !state.q;
    $("#hero").innerHTML = `<h2>${isHome ? "Epson EcoTank" : esc(cat.label)}</h2><p>${esc(cat.desc)}</p>` + (isHome ? `
      <div class="stats">
        <div class="stat"><b>${P.length}</b><span>Model printer</span></div>
        <div class="stat"><b>${P.filter((p) => p.isNew).length}</b><span>Model baru 2026</span></div>
        <div class="stat"><b>${P.filter((p) => p.wifi).length}</b><span>Dengan Wi-Fi</span></div>
        <div class="stat"><b>${P.filter((p) => p.format === "A3+").length}</b><span>Format A3+</span></div>
        <div class="stat"><b>s.d. 8.500</b><span>Halaman / botol hitam</span></div>
      </div>` : "");
    const g = $("#grid");
    g.className = "grid" + (state.view === "list" ? " list" : "");
    g.innerHTML = list.map((p, i) => `
      <article class="card" style="animation-delay:${Math.min(i, 16) * 25}ms">
        ${p.isNew ? '<span class="badge-new">Baru</span>' : p.tkdn ? `<span class="badge-new tkdn">TKDN ${esc(p.tkdnScore || "")}</span>` : ""}
        <button class="cmp-toggle ${state.compare.includes(p.model) ? "on" : ""}" data-cmp="${p.model}" title="Tambah ke perbandingan" aria-label="Bandingkan ${p.model}">
          ${svg(state.compare.includes(p.model) ? "check" : "plus")}</button>
        <button class="card-img" data-open="${p.model}" aria-label="Detail ${esc(p.name)}">${imgTag(p)}</button>
        <div class="card-body">
          <div class="card-head"><div><div class="series">${esc(catLabel(p.category))}</div><h3>${esc(p.model)}</h3></div></div>
          <p>${esc(p.tagline)}</p>
          <div class="pills">${pills(p)}</div>
          <div class="card-actions"><button class="btn small" data-open="${p.model}">Lihat detail</button></div>
        </div>
      </article>`).join("");
    $("#empty").hidden = list.length > 0;
  }

  $$(".segmented button").forEach((b) => b.onclick = () => { state.view = b.dataset.view; localStorage.setItem("view", state.view); update(); });
  $("#sortSelect").onchange = (e) => { state.sort = e.target.value; update(); };
  $("#searchInput").oninput = (e) => { state.q = e.target.value; renderGrid(); };
  $("#resetBtn").onclick = () => { Object.assign(state, { cat: "all", ink: null, q: "" }); state.features.clear(); $("#searchInput").value = ""; update(); };

  function update() {
    renderSidebar(); renderGrid(); renderDock();
    $$(".segmented button").forEach((b) => b.classList.toggle("active", b.dataset.view === state.view));
  }

  /* ---------- Compare dock ---------- */
  function renderDock() {
    localStorage.setItem("compare", JSON.stringify(state.compare));
    $("#dock").hidden = !state.compare.length;
    $("#dockItems").innerHTML = state.compare.map((m) => {
      const p = P.find((x) => x.model === m);
      return `<button class="dock-item" data-cmp="${m}" title="Hapus ${m}">${imgTag(p)}<span>${m} · klik untuk hapus</span></button>`;
    }).join("");
    $("#compareBtn").textContent = `Bandingkan (${state.compare.length})`;
  }
  document.addEventListener("click", (e) => {
    const t = e.target.closest("[data-cmp]"); if (!t) return;
    e.stopPropagation();
    const m = t.dataset.cmp, i = state.compare.indexOf(m);
    if (i >= 0) state.compare.splice(i, 1);
    else if (state.compare.length >= 4) return toast("Maksimal 4 printer untuk dibandingkan");
    else { state.compare.push(m); toast(`${m} ditambahkan ke perbandingan`); }
    renderGrid(); renderDock();
    if (!$("#overlay").hidden) {
      const kind = $("#modal").dataset.kind;
      if (kind === "compare") state.compare.length ? openCompare() : closeModal();
      if (kind === "detail") { const st = $("#modalBody").scrollTop; openDetail($("#modal").dataset.model); $("#modalBody").scrollTop = st; }
    }
  }, true);
  $("#compareBtn").onclick = () => state.compare.length < 2 ? toast("Pilih minimal 2 printer") : (location.hash = "#/compare/" + state.compare.join(","));
  $("#clearCompare").onclick = () => { state.compare = []; renderGrid(); renderDock(); };

  /* ---------- Modal ---------- */
  function openModal(title, html, kind) {
    $("#modalTitle").textContent = title;
    $("#modalBody").innerHTML = html;
    $("#modalBody").scrollTop = 0;
    $("#modal").dataset.kind = kind;
    $("#overlay").hidden = false;
    document.body.style.overflow = "hidden";
  }
  function closeModal() {
    if ($("#overlay").hidden) return;
    $("#overlay").hidden = true; document.body.style.overflow = "";
    if (location.hash) history.replaceState(null, "", location.pathname + location.search);
  }
  $("#overlay").addEventListener("click", (e) => { if (e.target.id === "overlay" || e.target.closest("[data-close]")) closeModal(); });

  const CAT_ORDER_HIDE = new Set(["Consumables", "Consumables - Updated"]);
  const specLabel = (c) => ({
    "Printer Type": "Tipe Printer", "Print-1": "Teknologi Cetak", "Printing Technology": "Teknologi Cetak", "Print Speed": "Kecepatan Cetak",
    "Copying": "Salin", "Scan Function": "Pindai", "Fax Function": "Faks", "Paper Handling": "Penanganan Kertas", "Interface": "Konektivitas",
    "Mobile and Cloud Solutions": "Mobile & Cloud", "Control Panel": "Panel Kontrol", "Electrical Specifications": "Kelistrikan",
    "Dimensions and Weight": "Dimensi & Berat", "Noise Level": "Tingkat Kebisingan", "Printer Software": "Perangkat Lunak",
    "Consumables - Updated": "Tinta & Konsumabel", "Consumables": "Tinta & Konsumabel", "General": "Umum", "Warranty": "Garansi",
  }[c] || c);

  function openDetail(model) {
    const p = P.find((x) => x.model === model); if (!p) return;
    const ink = INK_INFO[p.ink] || {};
    const ks = [
      ["Fungsi", p.functions.map((f) => ({ Print: "Cetak", Scan: "Pindai", Copy: "Salin", Fax: "Faks" }[f])).join(", ")],
      ["Format maks.", p.format],
      ["Resolusi", p.resolution || "—"],
      ["Kecepatan ISO (H/W)", (p.speedIso || "—").replace(/^Hingga |^Up to /i, "")],
      ["Konektivitas", [p.wifi && "Wi-Fi", p.ethernet && "Ethernet", "USB"].filter(Boolean).join(" · ")],
      ["Duplex / ADF", `${p.duplex ? "Duplex" : "—"} / ${p.adf ? "ADF" : "—"}`],
      ["Layar", p.lcd || "—"],
      ["TKDN + BMP", p.tkdn ? p.tkdnScore : "—"],
      ...(p.tkdnCert ? [["No. Sertifikat TKDN", p.tkdnCert]] : []),
      ["Berat", p.weight || "—"],
    ];
    const groups = Object.entries(p.specs);
    const groupHtml = groups.map(([c, kv], i) => `<details class="spec-group" ${i < 2 ? "open" : ""}><summary>${esc(specLabel(c))}</summary>
      <table class="spec-table">${Object.entries(kv).map(([k, v]) => `<tr><td>${esc(k)}</td><td>${esc(v)}</td></tr>`).join("")}</table></details>`).join("");
    const html = `<div class="detail">
      <div class="detail-media">${imgTag(p)}</div>
      <div class="detail-info">
        <div class="series">${esc(catLabel(p.category))}${p.isNew ? " · Baru 2026" : ""}${p.tkdn ? ` · TKDN ${esc(p.tkdnScore)}` : ""}</div>
        <h2>${esc(p.name)}</h2>
        <p class="tagline">${esc(p.tagline)}</p>
        <div class="pills">${pills(p)}</div>
        <div class="keyspecs">${ks.map(([k, v]) => `<div class="keyspec"><small>${k}</small><b>${esc(v)}</b></div>`).join("")}</div>
        <div class="keyspec" style="display:flex;align-items:center;gap:12px">
          <div class="ink-dots">${(ink.colors || []).map((c) => `<i style="background:${c}"></i>`).join("")}</div>
          <div><small>Tinta</small><b>Kode ${esc(p.ink)} — ${esc(ink.type || "")}</b></div>
          <button class="btn small" style="flex:none;margin-left:auto" data-ink="${esc(p.ink)}">Model lain</button>
        </div>
        <div class="tabs"><button class="active">Spesifikasi lengkap</button></div>
        ${groupHtml || '<p class="muted">Spesifikasi tidak tersedia di situs resmi.</p>'}
        ${p.inherited ? '<div class="note">Spesifikasi diambil dari model dasar karena halaman resmi varian ini tidak memuat tabel spesifikasi.</div>' : ""}
        <div class="detail-actions">
          <a class="btn primary" href="${p.url}" target="_blank" rel="noopener">${svg("ext")} Lihat di epson.co.id</a>
          <button class="btn" data-cmp="${p.model}">${svg(state.compare.includes(p.model) ? "check" : "plus")} ${state.compare.includes(p.model) ? "Di perbandingan" : "Bandingkan"}</button>
          <button class="btn" id="shareBtn">${svg("share")} Bagikan</button>
        </div>
        <p class="muted" style="font-size:12px;margin-top:14px">SKU ${esc(p.sku)}</p>
      </div></div>`;
    openModal(p.name, html, "detail");
    $("#shareBtn").onclick = async () => {
      const url = location.href;
      try { if (navigator.share) await navigator.share({ title: p.name, url }); else { await navigator.clipboard.writeText(url); toast("Tautan disalin"); } } catch {}
    };
    $("#modal").dataset.model = model;
  }

  function openCompare(models = state.compare) {
    const list = models.map((m) => P.find((p) => p.model === m)).filter(Boolean);
    if (!list.length) return;
    const yn = (v) => v ? '<span class="yes">✓ Ya</span>' : '<span class="no">—</span>';
    const rows = [
      ["Kategori", (p) => catLabel(p.category)],
      ["Fungsi", (p) => p.functions.join(", ")],
      ["Warna", (p) => p.color ? "Warna" : "Mono"],
      ["Format maks.", (p) => p.format],
      ["Resolusi", (p) => p.resolution || "—"],
      ["ISO (H/W)", (p) => p.speedIso || "—"],
      ["Draft (H/W)", (p) => p.speedDraft || "—"],
      ["Wi-Fi", (p) => yn(p.wifi), true],
      ["Ethernet", (p) => yn(p.ethernet), true],
      ["Duplex otomatis", (p) => yn(p.duplex), true],
      ["ADF", (p) => yn(p.adf), true],
      ["TKDN + BMP", (p) => p.tkdn ? `<span class="yes">✓ ${esc(p.tkdnScore || "Ya")}</span>` : '<span class="no">—</span>', true],
      ["No. Sertifikat TKDN", (p) => p.tkdnCert || "—"],
      ["Layar", (p) => p.lcd || "—"],
      ["Kode tinta", (p) => p.ink],
      ["Dimensi", (p) => p.dimensions || "—"],
      ["Berat", (p) => p.weight || "—"],
    ];
    const html = `<div class="compare-wrap"><table class="compare">
      <thead><tr><th></th>${list.map((p) => `<th>${imgTag(p)}<h4>${esc(p.model)}</h4>
        <button class="btn ghost" style="font-size:12px;padding:2px 6px" data-cmp="${p.model}">Hapus</button></th>`).join("")}</tr></thead>
      <tbody>${rows.map(([label, fn, raw]) => {
        const vals = list.map(fn);
        const diff = new Set(vals).size > 1;
        return `<tr><th>${label}</th>${vals.map((v) => `<td class="${diff ? "diff" : ""}">${raw ? v : esc(v)}</td>`).join("")}</tr>`;
      }).join("")}
      <tr><th></th>${list.map((p) => `<td><button class="btn small" data-open="${p.model}">Detail</button></td>`).join("")}</tr>
      </tbody></table></div>
      <p class="muted" style="padding:0 16px 16px;font-size:12px">Sel berwarna menandakan perbedaan antar model.</p>`;
    openModal(`Perbandingan · ${list.map((p) => p.model).join(" vs ")}`, html, "compare");
  }

  function openInk() {
    const html = `<div class="ink-grid">${Object.entries(INK_INFO).map(([k, v]) => {
      const models = P.filter((p) => p.ink === k);
      return `<div class="ink-card"><h4>${esc(k)} <span class="ink-dots">${v.colors.map((c) => `<i style="background:${c}"></i>`).join("")}</span></h4>
        <p>${esc(v.type)} · ${models.length} model</p>
        <div class="pills">${models.map((p) => `<span class="pill" data-open="${p.model}">${p.model}</span>`).join("")}</div></div>`;
    }).join("")}</div>`;
    openModal("Panduan Kode Tinta", html, "ink");
  }

  function openAbout() {
    openModal("Tentang Katalog", `<div class="about">
      <h2>Katalog Digital Epson EcoTank</h2>
      <p>Katalog independen berisi ${P.length} printer Ink Tank yang tercantum di
      <a href="https://www.epson.co.id/Untuk-Rumah/Printer-untuk-Rumah/c/ink-tank" target="_blank" rel="noopener">epson.co.id</a>.</p>
      <h4>Panduan singkat</h4>
      <ul>
        <li><b>L</b> = EcoTank warna, <b>M</b> = EcoTank monokrom.</li>
        <li><b>L1xxx</b> cetak saja · <b>L3xxx</b> All-in-One · <b>L4xxx</b> AiO + duplex · <b>L5xxx</b> AiO + ADF + faks · <b>L6xxx</b> kelas bisnis · <b>L8xxx/L18xxx</b> foto · <b>L11xxx/L14xxx/L15xxx</b> A3.</li>
        <li>Digit kedua <b>1</b> = USB, <b>5</b> = Wi-Fi. Akhiran 1/6 (mis. L3211, L3216) adalah varian SKU dari model dasar.</li>
      </ul>
      <h4>Pintasan keyboard</h4>
      <ul><li><b>⌘K / Ctrl+K</b> atau <b>/</b> — Spotlight</li><li><b>Esc</b> — tutup jendela</li></ul>
      <p class="note">Harga tidak tersedia di situs resmi. Spesifikasi dapat berubah sewaktu-waktu; selalu verifikasi di situs resmi Epson.
      Epson, EcoTank dan gambar produk adalah merek/hak milik Seiko Epson Corporation. Situs ini tidak berafiliasi dengan Epson.</p>
    </div>`, "about");
  }

  document.addEventListener("click", (e) => {
    const o = e.target.closest("[data-open]"); if (o) location.hash = "#/p/" + o.dataset.open;
    const m = e.target.closest("[data-menu]"); if (!m) return;
    toggleDrawer(false);
    const k = m.dataset.menu;
    if (k === "all") { $("#resetBtn").click(); closeModal(); }
    if (k === "compare") state.compare.length >= 2 ? (location.hash = "#/compare/" + state.compare.join(",")) : toast("Tambahkan minimal 2 printer dengan tombol + pada kartu");
    if (k === "ink") openInk();
    if (k === "about") openAbout();
  });

  /* ---------- Router ---------- */
  function route() {
    const h = decodeURIComponent(location.hash);
    let m;
    if ((m = h.match(/^#\/p\/(.+)$/))) openDetail(m[1]);
    else if ((m = h.match(/^#\/compare\/(.+)$/))) {
      const models = m[1].split(",").filter((x) => P.some((p) => p.model === x));
      if (models.join() !== state.compare.join()) { state.compare = models; renderGrid(); renderDock(); }
      openCompare(models);
    } else if (!$("#overlay").hidden) { $("#overlay").hidden = true; document.body.style.overflow = ""; }
  }
  addEventListener("hashchange", route);

  /* ---------- Spotlight ---------- */
  let sel = 0, results = [];
  const spot = $("#spotlight"), spotIn = $("#spotInput");
  function openSpot() { spot.hidden = false; spotIn.value = ""; renderSpot(); setTimeout(() => spotIn.focus(), 10); }
  function closeSpot() { spot.hidden = true; }
  function renderSpot() {
    const q = spotIn.value.trim().toLowerCase().split(/\s+/).filter(Boolean);
    results = q.length ? P.filter((p) => q.every((t) => haystack(p).includes(t))).slice(0, 8) : [];
    sel = Math.min(sel, Math.max(0, results.length - 1));
    $("#spotResults").innerHTML = results.map((p, i) => `<li class="${i === sel ? "sel" : ""}" data-i="${i}">
      ${p.image ? `<img src="${p.image}" alt="" />` : ""}<div><b>${esc(p.name)}</b><small>${esc(catLabel(p.category))} · ${esc(p.tagline)}</small></div></li>`).join("");
  }
  spotIn.oninput = () => { sel = 0; renderSpot(); };
  spotIn.onkeydown = (e) => {
    if (e.key === "ArrowDown") { sel = Math.min(sel + 1, results.length - 1); renderSpot(); e.preventDefault(); }
    if (e.key === "ArrowUp") { sel = Math.max(sel - 1, 0); renderSpot(); e.preventDefault(); }
    if (e.key === "Enter" && results[sel]) { closeSpot(); location.hash = "#/p/" + results[sel].model; }
  };
  $("#spotResults").onclick = (e) => { const li = e.target.closest("li"); if (li) { closeSpot(); location.hash = "#/p/" + results[+li.dataset.i].model; } };
  spot.onclick = (e) => { if (e.target === spot) closeSpot(); };
  $("#spotlightBtn").onclick = openSpot;
  document.addEventListener("keydown", (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); spot.hidden ? openSpot() : closeSpot(); }
    else if (e.key === "/" && !/input|textarea|select/i.test(document.activeElement.tagName)) { e.preventDefault(); openSpot(); }
    else if (e.key === "Escape") { if (!spot.hidden) closeSpot(); else closeModal(); }
  });

  /* ---------- Toast ---------- */
  let tt;
  function toast(msg) { const t = $("#toast"); t.textContent = msg; t.classList.add("show"); clearTimeout(tt); tt = setTimeout(() => t.classList.remove("show"), 1800); }

  update();
  route();
})();
