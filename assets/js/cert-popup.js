/* Popup "Keterangan Sertifikat TKDN" — self-contained, works on static sites.
   Needs only window.TKDN_CERTS (assets/data/certs.js).
   Wire any certificate number with: <button class="cert-link" data-cert="...">…</button>
   Deep link: #/cert/<encoded certNo>                                             */
(() => {
  "use strict";
  const C = window.TKDN_CERTS || [];
  const BY = new Map(C.map((c) => [c.certNo, c]));
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const OFFICIAL = "https://tkdn.kemenperin.go.id/sertifikat";

  const CSS = `
.tc-overlay{position:fixed;inset:0;z-index:99999;display:flex;align-items:center;justify-content:center;
  padding:18px;background:rgba(0,0,0,.55);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px)}
.tc-overlay[hidden]{display:none}
.tc-dialog{width:min(760px,100%);max-height:88vh;overflow:auto;border-radius:16px;
  background:var(--tc-bg,#fff);color:var(--tc-ink,#161a22);
  border:1px solid var(--tc-line,#e3e7ed);box-shadow:0 24px 70px rgba(0,0,0,.35);
  font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Inter,Roboto,system-ui,sans-serif}
.tc-bar{position:sticky;top:0;z-index:2;display:flex;align-items:center;justify-content:space-between;gap:12px;
  padding:13px 20px;background:var(--tc-bg,#fff);border-bottom:1px solid var(--tc-line,#e3e7ed)}
.tc-kicker{font:700 10px/1 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;
  letter-spacing:.16em;text-transform:uppercase;color:var(--tc-mute,#8a93a2)}
.tc-close{width:30px;height:30px;border:1px solid var(--tc-line,#e3e7ed);border-radius:8px;
  background:var(--tc-sub,#fafbfc);color:var(--tc-ink2,#4b5563);font-size:15px;cursor:pointer;line-height:1}
.tc-close:hover{border-color:var(--tc-accent,#1d4ed8);color:var(--tc-accent,#1d4ed8)}
.tc-body{padding:22px 24px 24px}
.tc-eyebrow{font:700 10px/1 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;
  letter-spacing:.14em;text-transform:uppercase;color:var(--tc-accent,#1d4ed8);margin:0 0 10px}
.tc-certno{display:flex;flex-wrap:wrap;align-items:center;gap:10px;margin:0 0 6px}
.tc-certno code{font:700 clamp(15px,2.6vw,22px)/1.3 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;
  letter-spacing:-.02em;word-break:break-all;color:var(--tc-ink,#161a22)}
.tc-copy{border:1px solid var(--tc-line,#e3e7ed);background:var(--tc-sub,#fafbfc);color:var(--tc-ink2,#4b5563);
  border-radius:7px;padding:6px 10px;font-size:11px;font-weight:600;cursor:pointer;white-space:nowrap}
.tc-copy:hover{border-color:var(--tc-accent,#1d4ed8);color:var(--tc-accent,#1d4ed8)}
.tc-subtitle{margin:0 0 16px;font-size:13px;color:var(--tc-ink2,#4b5563)}
.tc-verdict{padding:11px 14px;border-radius:9px;font-size:12.5px;font-weight:600;margin:0 0 18px}
.tc-verdict.ok{background:var(--tc-ok-bg,#e8f7ef);color:var(--tc-ok,#0f8a55)}
.tc-verdict.no{background:var(--tc-warn-bg,#fff5e6);color:var(--tc-warn,#b45309)}
.tc-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(155px,1fr));gap:1px;
  background:var(--tc-line,#e3e7ed);border:1px solid var(--tc-line,#e3e7ed);border-radius:10px;overflow:hidden;margin-bottom:20px}
.tc-cell{background:var(--tc-sub,#fafbfc);padding:12px 14px}
.tc-cell dt{font:700 9.5px/1 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;
  letter-spacing:.1em;text-transform:uppercase;color:var(--tc-mute,#8a93a2);margin:0 0 6px}
.tc-cell dd{margin:0;font-size:13.5px;font-weight:600;overflow-wrap:anywhere}
.tc-h{margin:20px 0 10px;font:700 10px/1 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;
  letter-spacing:.14em;text-transform:uppercase;color:var(--tc-mute,#8a93a2)}
.tc-products{width:100%;border-collapse:collapse;font-size:12.5px}
.tc-products th{text-align:left;font:700 9.5px/1 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;
  letter-spacing:.09em;text-transform:uppercase;color:var(--tc-mute,#8a93a2);
  padding:8px 10px;border-bottom:1px solid var(--tc-line,#e3e7ed)}
.tc-products td{padding:9px 10px;border-bottom:1px solid var(--tc-line,#e3e7ed);vertical-align:top}
.tc-products td.num{text-align:right;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-variant-numeric:tabular-nums}
.tc-products a{color:var(--tc-accent,#1d4ed8);text-decoration:none;font-weight:650}
.tc-products a:hover{text-decoration:underline}
.tc-products .tc-total{font-weight:750;color:var(--tc-accent,#1d4ed8)}
.tc-actions{display:flex;flex-wrap:wrap;gap:8px;margin-top:20px}
.tc-btn{display:inline-flex;align-items:center;gap:7px;padding:9px 13px;border-radius:8px;
  border:1px solid var(--tc-line,#e3e7ed);background:var(--tc-sub,#fafbfc);color:var(--tc-ink2,#4b5563);
  font-size:12.5px;font-weight:600;text-decoration:none;cursor:pointer}
.tc-btn:hover{border-color:var(--tc-accent,#1d4ed8);color:var(--tc-accent,#1d4ed8)}
.tc-btn.primary{background:var(--tc-accent,#1d4ed8);border-color:var(--tc-accent,#1d4ed8);color:#fff}
.tc-btn.primary:hover{filter:brightness(1.08);color:#fff}
.tc-note{margin:18px 0 0;font-size:11.5px;line-height:1.65;color:var(--tc-mute,#8a93a2);
  border-top:1px dashed var(--tc-line,#e3e7ed);padding-top:14px}
.tc-toast{position:fixed;bottom:26px;left:50%;transform:translateX(-50%);z-index:100000;
  background:#161a22;color:#fff;padding:9px 16px;border-radius:8px;font-size:12.5px;opacity:0;
  transition:opacity .2s;pointer-events:none}
.tc-toast.show{opacity:1}
.cert-link{border:0;background:none;padding:0;color:var(--accent,#1d4ed8);font:inherit;
  cursor:pointer;text-decoration:underline;text-decoration-style:dotted;text-underline-offset:3px}
.cert-link:hover{text-decoration-style:solid}
code.cert-link{font:inherit;padding:0}
.card-cert{display:block;margin:10px 0 0;font:600 11px/1.5 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;
  word-break:break-all;text-align:left}
@media (max-width:560px){.tc-body{padding:18px 16px 20px}.tc-grid{grid-template-columns:1fr 1fr}}
@media (prefers-color-scheme:dark){
  .tc-dialog,.tc-bar{--tc-bg:#1a1f28;--tc-ink:#eef1f6;--tc-ink2:#a9b3c2;--tc-mute:#77818f;
    --tc-line:#2c3441;--tc-sub:#212732;--tc-accent:#7ea6ff;--tc-ok:#5bd6a0;--tc-ok-bg:#16332a;
    --tc-warn:#f0b45e;--tc-warn-bg:#3a2c17}
}
html[data-theme="dark"] .tc-dialog,html[data-theme="dark"] .tc-bar{
  --tc-bg:#1a1f28;--tc-ink:#eef1f6;--tc-ink2:#a9b3c2;--tc-mute:#77818f;
  --tc-line:#2c3441;--tc-sub:#212732;--tc-accent:#7ea6ff;--tc-ok:#5bd6a0;--tc-ok-bg:#16332a;
  --tc-warn:#f0b45e;--tc-warn-bg:#3a2c17}
`;

  const style = document.createElement("style");
  style.id = "tkdnCertStyle";
  style.textContent = CSS;
  document.head.appendChild(style);

  const overlay = document.createElement("div");
  overlay.className = "tc-overlay";
  overlay.id = "tcOverlay";
  overlay.hidden = true;
  overlay.innerHTML = `<div class="tc-dialog" role="dialog" aria-modal="true" aria-label="Keterangan Sertifikat TKDN">
    <div class="tc-bar"><span class="tc-kicker">Keterangan Sertifikat · Kemenperin RI</span>
      <button class="tc-close" type="button" aria-label="Tutup">✕</button></div>
    <div class="tc-body" id="tcBody"></div></div>`;
  document.body.appendChild(overlay);
  const toastEl = document.createElement("div");
  toastEl.className = "tc-toast";
  document.body.appendChild(toastEl);
  let toastTimer;
  const toast = (m) => {
    toastEl.textContent = m; toastEl.classList.add("show");
    clearTimeout(toastTimer); toastTimer = setTimeout(() => toastEl.classList.remove("show"), 1800);
  };

  const searchUrl = (certNo) => OFFICIAL + "?q=" + encodeURIComponent(certNo) + "&by=cert";

  function html(c) {
    const cell = (k, v) => `<div class="tc-cell"><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`;
    const rows = c.products.map((p) => `<tr>
      <td><a href="#/p/${encodeURIComponent(p.model)}">${esc(p.model)}</a><br>
        <span style="font-size:11px;color:var(--tc-mute)">${esc(p.sku)}</span></td>
      <td class="num">${esc(p.tkdnVal)}</td>
      <td class="num">${esc(p.bmpVal)}</td>
      <td class="num tc-total">${esc(p.totalVal)}</td></tr>`).join("");
    const verdict = c.isReal
      ? (c.meetsPdn
        ? `<p class="tc-verdict ok">Memenuhi wajib belanja pengadaan — PDN ber-TKDN ≥ 25% (total TKDN+BMP ${esc(c.totalMin)}${c.totalMin !== c.totalMax ? " – " + esc(c.totalMax) : ""})</p>`
        : `<p class="tc-verdict no">Total TKDN+BMP ${esc(c.totalMin)}${c.totalMin !== c.totalMax ? " – " + esc(c.totalMax) : ""} — cek ketentuan ambang 25% sebelum pengadaan</p>`)
      : `<p class="tc-verdict no">Bukan nomor sertifikat TKDN — ${esc(c.certNo)}</p>`;

    return `<p class="tc-eyebrow">${c.isReal ? "Detail Sertifikat Tanda Sah TKDN" : "Status Produk"}</p>
      <div class="tc-certno"><code>${esc(c.certNo)}</code>
        <button class="tc-copy" type="button" data-tc-copy="${esc(c.certNo)}">Salin nomor</button></div>
      <p class="tc-subtitle">${c.isReal
        ? `Diterbitkan ${esc(c.period)} · ${esc(c.kind)} · atas nama ${esc(c.holder)}`
        : `Referensi katalog, bukan nomor sertifikat Kemenperin RI`}</p>
      ${verdict}
      <dl class="tc-grid">
        ${cell("Jenis sertifikat", c.isReal ? c.kind : "—")}
        ${cell("Periode penerbitan", c.period)}
        ${cell("Nomor surat", c.letterNo || "—")}
        ${cell("Pemegang", c.holder)}
        ${cell("Nilai BMP", c.bmp)}
        ${cell("Jumlah produk", `${c.productCount} model`)}
        ${cell("Rentang TKDN", c.tkdnMin === c.tkdnMax ? c.tkdnMin : c.tkdnMin + " – " + c.tkdnMax)}
        ${cell("Rentang TKDN + BMP", c.totalMin === c.totalMax ? c.totalMin : c.totalMin + " – " + c.totalMax)}
      </dl>
      <p class="tc-h">Produk yang tercakup (${c.productCount})</p>
      <table class="tc-products"><thead><tr><th>Model / SKU</th><th style="text-align:right">TKDN</th>
        <th style="text-align:right">BMP</th><th style="text-align:right">Total</th></tr></thead>
        <tbody>${rows}</tbody></table>
      <div class="tc-actions">
        ${c.isReal ? `<a class="tc-btn primary" href="${esc(searchUrl(c.certNo))}" target="_blank" rel="noopener noreferrer">Cek di situs resmi Kemenperin ↗</a>` : ""}
        <button class="tc-btn" type="button" data-tc-copy="${esc(c.certNo)}">Salin No. Sertifikat</button>
        <button class="tc-btn" type="button" data-tc-share="${esc(c.certNo)}">Salin tautan popup</button>
      </div>
      <p class="tc-note">Situs resmi Kemenperin tidak mencantumkan <em>nomor tanda sah</em> pada basis data
        publiknya, sehingga pencarian nomor utuh di sana dapat menampilkan banyak baris. Keterangan di
        atas dirangkum dari katalog TKDN Epson (efektif 28 Agustus 2026). Untuk verifikasi final, gunakan
        lembar <em>Tanda Sah</em> asli dan klik tombol <b>Detail</b> pada hasil pencarian di situs resmi.</p>`;
  }

  // Some catalogs abbreviate a certificate to its letter number (e.g. "6579").
  function resolve(no) {
    const key = String(no).trim();
    if (BY.has(key)) return BY.get(key);
    const m = key.match(/^(\d+)/);
    if (m) {
      const hits = C.filter((c) => c.certNo.startsWith(m[1] + "/"));
      if (hits.length === 1) return hits[0];
    }
    return null;
  }

  function show(certNo) {
    const c = resolve(certNo) || {
      certNo: String(certNo), isReal: false, kind: "—", period: "—", letterNo: "",
      holder: "—", bmp: "—", productCount: 0, tkdnMin: "—", tkdnMax: "—",
      totalMin: "—", totalMax: "—", meetsPdn: false, products: [],
    };
    $("#tcBody").innerHTML = html(c);
    overlay.hidden = false;
    document.body.style.overflow = "hidden";
    overlay.querySelector(".tc-close").focus();
  }
  function hide() {
    if (overlay.hidden) return;
    overlay.hidden = true;
    document.body.style.overflow = "";
  }
  const $ = (s) => overlay.querySelector(s);

  overlay.addEventListener("click", (e) => {
    if (e.target === overlay || e.target.closest(".tc-close")) { hide(); return; }
    const cp = e.target.closest("[data-tc-copy]");
    if (cp) { copy(cp.dataset.tcCopy); toast("Nomor sertifikat disalin"); return; }
    const sh = e.target.closest("[data-tc-share]");
    if (sh) {
      copy(location.origin + location.pathname + "#/cert/" + encodeURIComponent(sh.dataset.tcShare));
      toast("Tautan popup disalin");
    }
  });

  function copy(text) {
    if (navigator.clipboard?.writeText) { navigator.clipboard.writeText(text).catch(() => fallback(text)); }
    else fallback(text);
  }
  function fallback(text) {
    const ta = document.createElement("textarea");
    ta.value = text; ta.style.position = "fixed"; ta.style.opacity = "0";
    document.body.appendChild(ta); ta.select();
    try { document.execCommand("copy"); } catch (_) {}
    ta.remove();
  }

  // Capture phase so a click on a certificate number never triggers the host
  // site's card/detail handlers.
  document.addEventListener("click", (e) => {
    const t = e.target.closest("[data-cert]");
    if (!t) return;
    e.preventDefault(); e.stopImmediatePropagation();
    show(t.dataset.cert);
  }, true);

  document.addEventListener("keydown", (e) => { if (e.key === "Escape") hide(); }, true);

  // Tables in the playbook write certificate numbers as bare <code>, sometimes
  // abbreviated ("6579", "6580/.../06/2026"). Sections are lazy-rendered, so
  // wire both the initial DOM and anything added later.
  function wireCode(el) {
    if (el.hasAttribute("data-cert") || el.closest("[data-cert], #tcOverlay")) return;
    const t = el.textContent.trim();
    if (!/SJ-IND|^\d{2,6}(\/|\u2013|$)/.test(t)) return;
    el.setAttribute("data-cert", t);
    el.classList.add("cert-link");
  }
  function wireCodes(root) {
    if (!root.querySelectorAll) return;
    root.querySelectorAll("code").forEach(wireCode);
  }
  wireCodes(document);
  if (window.MutationObserver) {
    new MutationObserver((muts) => {
      for (const m of muts) for (const n of m.addedNodes) {
        if (n.nodeType !== 1) continue;
        if (n.tagName === "CODE") wireCode(n);
        else wireCodes(n);
      }
    }).observe(document.body, { childList: true, subtree: true });
  }

  // Optional shareable deep link, e.g. #/cert/6109%2FSJ-IND.8%2FE-TKDN%2F5%2F2025
  const fromHash = () => {
    const m = decodeURIComponent(location.hash).match(/^#\/cert\/(.+)$/);
    if (m) show(m[1]); else hide();
  };
  addEventListener("hashchange", fromHash);
  fromHash();

  window.TKDN_CERT_POPUP = { show, hide, list: C };
})();
