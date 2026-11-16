  /* ---------- lesson flow (tools/lessonflow.js, 16 Nov 2026) ----------
     1. Tap any Spanish word, anywhere, to see what it means (not while it would give away an answer, and not in exam mode).
     2. Page mode for lessons and guides: one screen = one page; swipe or tap the arrows; a page-turn sound; read-aloud turns the page.
     3. Profe's button stays out of the way while a lesson or a drill is in progress (Profe is one tap away in the top bar). */
  const LFS = { on: false, i: 0, n: 1, busy: false, pages: null, tag: new Map(), leaves: [], label: [], anchor: null };
  const lfRead = () => /^#((a1|a2|b1|b2|c1|c2|esc)-u\d+|guia-.+)$/.test(location.hash);
  /* ---- 1. word meanings ---- */
  const LF_INTER = "a, button, input, textarea, select, label, summary, [data-act], .drtile, .exopt, .sk-cut, #tutor, .tutor, .sheet, .lf-pop, .lf-nav, .w, #ltext, .crumbs, nav, header";
  function lfExamLocked() { const h = location.hash;
    if (/-examen-\d+/.test(h)) return true; // mock exams are always under exam conditions
    try { if (/^#escritura-/.test(h) && typeof WR !== "undefined" && WR && WR.mode === "exam") return true; } catch (e) {}
    return false; }
  function lfWordAt(x, y) { let node, off;
    if (document.caretPositionFromPoint) { const p = document.caretPositionFromPoint(x, y); if (!p) return null; node = p.offsetNode; off = p.offset; }
    else if (document.caretRangeFromPoint) { const r = document.caretRangeFromPoint(x, y); if (!r) return null; node = r.startContainer; off = r.startOffset; }
    if (!node || node.nodeType !== 3) return null; const t = node.nodeValue, L = /[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]/;
    let a = off, b = off; while (a > 0 && L.test(t[a - 1])) a--; while (b < t.length && L.test(t[b])) b++;
    if (b - a < 1) return null; const w = t.slice(a, b);
    const rg = document.createRange(); rg.setStart(node, a); rg.setEnd(node, b); const rc = rg.getBoundingClientRect();
    if (x < rc.left - 4 || x > rc.right + 4 || y < rc.top - 4 || y > rc.bottom + 4) return null; // tapped beside the text, not on a word
    return { w, rc, el: node.parentElement, rg }; }
  function lfSpanishCtx(el) { if (!el) return false; if (el.closest('[lang="en"], .en, .dren, .sent-en, .muted.small')) return false;
    return !!el.closest('[lang="es"], .es, .es-w, td.es, .drsay, .sk-card2, .sk-text, .exr, .gw, .sw, .fx-ex, .ex-es, .say'); }
  function lfIsSpanish(w, el) { const lw = w.toLowerCase();
    if (lfSpanishCtx(el)) return true;
    if (/[áéíóúüñ]/i.test(w)) return true;
    try { esSets(); } catch (e) {}
    const esw = typeof ESW !== "undefined" && ESW && ESW.has(lw), enw = typeof ENW !== "undefined" && ENW.has(lw);
    const en = typeof EN_W !== "undefined" && EN_W.test(" " + lw + " ");
    return esw && !enw && !en; }
  function lfPopClose() { const p = document.getElementById("lf-pop"); if (p) p.remove(); }
  function lfShow(hit) { const lines = (() => { try { return window.__wordLines(hit.w); } catch (e) { return []; } })(); if (!lines.length) return false;
    lfPopClose(); const first = lines[0].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim(), mean = first.split("·").slice(1).join("·").trim() || first;
    const p = document.createElement("div"); p.id = "lf-pop"; p.className = "lf-pop"; p.setAttribute("role", "dialog"); p.setAttribute("aria-label", "Meaning of " + hit.w);
    p.innerHTML = '<div class="lf-pw"><b lang="es">' + esc(hit.w) + '</b><button class="lf-x" data-act="lf-close" aria-label="Close">✕</button></div><p class="lf-pm">' + esc(mean.slice(0, 160)) + "</p>" +
      '<div class="lf-pr"><button class="btn small" data-act="lf-say" data-w="' + esc(hit.w) + '">🔊</button>' + (lines.length > 1 || first.length > 160 ? '<button class="btn small" data-act="lf-more" data-w="' + esc(hit.w) + '">More</button>' : "") +
      '<button class="btn small" data-act="sr-add" data-es="' + esc(hit.w.toLowerCase()) + '" data-en="' + esc(mean.split(/[;,]/)[0].slice(0, 60)) + '">+ Save</button></div>';
    document.body.appendChild(p); const r = hit.rc, pw = Math.min(300, innerWidth - 16), top = r.bottom + 8 + p.offsetHeight > innerHeight ? r.top - p.offsetHeight - 8 : r.bottom + 8;
    p.style.width = pw + "px"; p.style.left = Math.max(8, Math.min(innerWidth - pw - 8, r.left + r.width / 2 - pw / 2)) + "px"; p.style.top = Math.max(8, top) + "px";
    try { if (window.CSS && CSS.highlights && window.Highlight) { CSS.highlights.set("lf-word", new Highlight(hit.rg)); setTimeout(() => { try { CSS.highlights.delete("lf-word"); } catch (e) {} }, 2500); } } catch (e) {}
    return true; }
  document.addEventListener("click", (e) => {
    const t = e.target; if (!t.closest) return;
    const a = t.closest("[data-act^='lf-']");
    if (a) { const act = a.dataset.act; if (act === "lf-close") lfPopClose(); else if (act === "lf-say") { try { sayText(a.dataset.w); } catch (x) {} } else if (act === "lf-more") { const w = a.dataset.w; lfPopClose(); try { const lines = window.__wordLines(w); window.__openSheet('<div class="row" style="justify-content:space-between"><span class="sw">' + esc(w) + '</span><button class="btn small" data-act="l-close">Close</button></div>' + lines.join("") + '<div class="row">' + window.__sayBtn(w) + "</div>"); } catch (x) {} } return; }
    if (t.closest(".lf-pop")) return;
    const had = !!document.getElementById("lf-pop"); lfPopClose();
    if (had && !t.closest("#app")) return;
    if (!t.closest("#app") || t.closest(LF_INTER) || t.closest('[data-gloss="off"]') || lfExamLocked()) return;
    const sel = window.getSelection && window.getSelection(); if (sel && !sel.isCollapsed) return;
    const hit = lfWordAt(e.clientX, e.clientY); if (!hit || !lfIsSpanish(hit.w, hit.el)) return;
    lfShow(hit);
  });
  addEventListener("scroll", () => lfPopClose(), { passive: true }); addEventListener("hashchange", lfPopClose);
  /* ---- 2. page mode: pages follow the lesson's own structure ----
     A page is a run of whole blocks that fits one screen. Nothing is ever cut: a block is only opened up when it is taller than
     a screen, and then only at its own seams (a rule and its examples, a table between rows with the header kept, a list between items).
     A heading, a rule or a "listen" button always stays with what follows it; every section of the lesson starts on a new page. */
  function lfFlipSound() { try { if (typeof UI !== "undefined" && UI.sfx === false) return; const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return; SFXC = SFXC || new AC(); const c = SFXC, t = c.currentTime, len = 0.22;
    const buf = c.createBuffer(1, Math.floor(c.sampleRate * len), c.sampleRate), d = buf.getChannelData(0); for (let i = 0; i < d.length; i++) { const k = i / d.length; d[i] = (Math.random() * 2 - 1) * Math.pow(1 - k, 2) * (0.6 + 0.4 * Math.sin(k * 40)); }
    const src = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain(); src.buffer = buf; f.type = "bandpass"; f.frequency.setValueAtTime(2400, t); f.frequency.exponentialRampToValueAtTime(700, t + len); f.Q.value = 0.8;
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.16, t + 0.03); g.gain.exponentialRampToValueAtTime(0.0001, t + len); src.connect(f); f.connect(g); g.connect(c.destination); src.start(t); src.stop(t + len); } catch (e) {} }
  const lfPaged = () => !!(S.paged) && lfRead();
  const PG_KEEP = "h1, h2, h3, h4, .shead, .eyebrow, p.rule, .vtplay, .gnum, .exh"; // stays with what follows
  const PG_TAIL = ".sk-card, .qchk, p.small, .pgr-more"; // small follow-ups may run a little over rather than sit alone
  const PG_OPEN = ".stack, .callout > .lx, .lx-intro, .exlist, section.block, .gblock, .callout, .lx, .notes2, .tbl, table, tbody, ul, ol, .fx-pts, .grules, .gsec, .extbl, .dlg, .lxsec";
  const lfRoot = () => { const A = document.getElementById("app"); if (!A) return null; const s = A.querySelector(":scope > .stack"); return s || A; };
  // the room a page has: from where the lesson's content starts to just above the page bar, less the padding of the boxes a block sits in
  const lfBudget = () => { const R = lfRoot(); let top = 0; try { top = R.getBoundingClientRect().top + scrollY; } catch (e) {} const N = document.getElementById("lf-nav"), nh = N ? N.offsetHeight : 74;
    return Math.max(240, innerHeight - (nh + 14) - 12 - Math.max(0, top) - 34); };
  function lfLeaves(root, B) { const out = [];
    const walk = (el, depth) => { [...el.children].forEach((c) => {
      if (c.matches("script, style, template, .lf-nav, #s-pra-ph")) return;
      if (c.tagName === "THEAD" || c.tagName === "CAPTION" || c.tagName === "COLGROUP") return; // a table's header stays with every part of the table
      const h = c.offsetHeight; const open = (h > B || (h > B * 0.5 && c.matches(".tbl, table, tbody, .notes2, ul, ol, .exlist"))) && c.matches(PG_OPEN) && c.children.length > 0 && !(c.children.length === 1 && c.children[0].matches("tr"));
      if (open) walk(c, depth + 1); else out.push(c); }); };
    walk(root, 0); return out; }
  const lfTop = (el) => { let t = 0; try { const r = el.getBoundingClientRect(); t = r.top + scrollY; } catch (e) {} return t; };
  const lfSec = (el, root) => { let e = el; while (e && e.parentElement && e.parentElement !== root) e = e.parentElement; return e; };
  function lfBuild(keepAnchor) { const root = lfRoot(); if (!root) return;
    const anchor = keepAnchor != null ? keepAnchor : LFS.anchor;
    document.body.classList.add("paged", "pg-measure"); root.querySelectorAll(".pg-off").forEach((e) => e.classList.remove("pg-off"));
    const B = lfBudget(), L = lfLeaves(root, B).filter((el) => el.isConnected);
    const geo = L.map((el) => { const t = lfTop(el); return { el, t, b: t + el.offsetHeight, h: el.offsetHeight, sec: lfSec(el, root) }; });
    const pages = []; let cur = null;
    const held = [], G = (el) => { const t = lfTop(el); return { el, t, b: t + el.offsetHeight, h: el.offsetHeight, sec: lfSec(el, root) }; };
    for (let j = 0; j < geo.length; j++) { const g = geo[j];
      if (!g.h) { if (cur) cur.leaves.push(g.el); else held.push(g.el); continue; } // nothing to show (hidden or empty): rides along, never starts or sizes a page
      const newSec = cur && g.sec !== cur.sec && g.sec.matches("section.block");
      let fits = cur && g.b - cur.y0 <= B;
      if (cur && !fits && g.el.matches(PG_TAIL) && g.h < 160) { const n = geo[j + 1]; if (g.b - cur.y0 <= B * 1.14 || !n || (n.sec !== g.sec && n.sec.matches("section.block"))) fits = true; } // a small follow-up never sits alone
      if (cur && !fits && g.el.tagName === "TR" && cur.leaves.length && !geo[j + 1]) fits = g.b - cur.y0 <= B * 1.12; // the last row of a table stays with the rest
      // a page so far holding only headings: open the block that won't fit at its own seams, so the heading leads straight into it
      if (cur && !fits && !newSec && cur.leaves.filter((e) => e.offsetHeight).every((e) => e.matches(PG_KEEP)) && g.el.matches(PG_OPEN) && g.el.children.length) {
        const parts = lfLeaves(g.el, 0); if (parts.length > 1) { geo.splice(j, 1, ...parts.map(G)); j--; continue; } }
      if (cur && fits && g.el.matches(PG_KEEP)) { // never leave a heading or a rule at the foot of a page
        let k = j + 1; while (geo[k] && (!geo[k].h || geo[k].el.matches(PG_KEEP)) && geo[k].sec === g.sec) k++;
        const n = geo[k]; if (n && n.sec === g.sec && n.b - g.t <= B && n.b - cur.y0 > B) fits = false; }
      if (!cur || newSec || !fits) { cur = { y0: g.t, sec: g.sec, leaves: pages.length ? [] : held.splice(0) }; pages.push(cur); }
      cur.leaves.push(g.el); }
    LFS.root = root; LFS.leaves = geo.map((g) => g.el); LFS.pages = pages.map((pg) => pg.leaves);
    document.body.classList.remove("pg-measure");
    lfFit(root);
    LFS.n = Math.max(1, LFS.pages.length); LFS.label = LFS.pages.map((pg) => lfLabel(pg[0], root));
    let i = 0; if (anchor && anchor.isConnected) { const k = lfPageOf(anchor); if (k >= 0) i = k; }
    else { const saved = (S.pgAt || {})[location.hash]; if (typeof saved === "number" && LFS.leaves[saved]) { const k = lfPageOf(LFS.leaves[saved]); if (k >= 0) i = k; } }
    LFS.i = -1; lfGo(i, true); lfNav(); }
  // tag every leaf and every container on its path with the pages it spans
  function lfTag(root) { LFS.tag = new Map(); LFS.pages.forEach((pg, k) => pg.forEach((el) => { let e = el; while (e && e !== root) { const r = LFS.tag.get(e); if (r) { r[0] = Math.min(r[0], k); r[1] = Math.max(r[1], k); } else LFS.tag.set(e, [k, k]); e = e.parentElement; } })); }
  // check each page as it really draws (a table's header, the padding of the boxes) and move blocks on until it fits above the page bar
  function lfFit(root) { LFS.fitting = true; try { lfFit0(root); } finally { LFS.fitting = false; } }
  function lfFit0(root) { lfTag(root); const N = document.getElementById("lf-nav"), limit = innerHeight - (N ? N.offsetHeight : 74) - 14 - 8;
    for (let k = 0; k < LFS.pages.length && k < 400; k++) { LFS.i = k; lfApply(); scrollTo(0, 0);
      const pg = LFS.pages[k]; let guard = 0;
      while (pg.length > 1 && guard++ < 60) { const last = pg[pg.length - 1], bot = Math.max(0, ...pg.filter((e) => e.offsetHeight).map((e) => e.getBoundingClientRect().bottom)); if (window.__lfDbg) console.log('fit', k, pg.length, Math.round(bot), Math.round(limit), last.className || last.tagName);
        if (bot <= limit) break;
        const lead = pg[0], newSec = (e) => lfSec(e, root) !== lfSec(lead, root) && lfSec(e, root).matches("section.block");
        const open = (el) => { if (!el.matches(PG_OPEN) || !el.children.length) return false; const parts = lfLeaves(el, 0); if (parts.length < 2) return false;
          pg.splice(pg.indexOf(el), 1, ...parts); const li = LFS.leaves.indexOf(el); if (li >= 0) LFS.leaves.splice(li, 1, ...parts); lfTag(root); lfApply(); return true; };
        const room = limit - 90; let moved;
        if (last.matches(PG_TAIL) && pg.length >= 2) { // a check card goes with the end of the block it checks
          const prev = pg[pg.length - 2];
          if (prev.offsetHeight > room * 0.4 && open(prev)) continue;
          moved = prev.offsetHeight <= room * 0.4 && !prev.matches(PG_KEEP) && pg.length > 2 && !pg.slice(0, -2).every((e) => e.matches(PG_KEEP) || !e.offsetHeight) ? pg.splice(-2) : [pg.pop()];
        } else {
          // moving the last block on would leave only headings behind: open it up at its own seams instead
          if (pg.slice(0, -1).every((e) => e.matches(PG_KEEP) || !e.offsetHeight) && open(last)) continue;
          moved = [pg.pop()]; }
        while (pg.length > 1 && pg[pg.length - 1].matches(PG_KEEP)) moved.unshift(pg.pop());
        if (!pg.some((e) => e.offsetHeight)) { pg.push(...moved); break; }
        const nx = LFS.pages[k + 1]; if (nx && lfSec(nx[0], root) === lfSec(moved[0], root) && !newSec(moved[0])) nx.unshift(...moved); else LFS.pages.splice(k + 1, 0, moved);
        lfTag(root); lfApply(); } }
    // a page holding only a "Check yourself" card or a small link takes the last rows of the table before it, so it isn't left on its own
    for (let k = 1; k < LFS.pages.length; k++) { const pg = LFS.pages[k], pv = LFS.pages[k - 1];
      if (!pg.every((e) => e.matches(PG_TAIL)) || lfSec(pg[0], root) !== lfSec(pv[pv.length - 1], root)) continue;
      const take = []; while (take.length < 2 && pv.length > 3 && /^(TR|LI)$/.test(pv[pv.length - 1].tagName) && pv[pv.length - 1].parentElement === pv[pv.length - 2].parentElement) take.unshift(pv.pop());
      if (take.length) { pg.unshift(...take); lfTag(root); LFS.i = k; lfApply(); scrollTo(0, 0); const N = document.getElementById("lf-nav"), limit = innerHeight - (N ? N.offsetHeight : 74) - 22;
        if (Math.max(...pg.map((e) => e.getBoundingClientRect().bottom)) > limit) { pv.push(...pg.splice(0, take.length)); lfTag(root); } } }
    LFS.i = -1; }
  function lfLabel(el, root) { const sec = lfSec(el, root); let s = ""; try { const h = sec && sec.querySelector(".shead h2, h2"); s = h ? h.childNodes[0].textContent.trim() : ""; } catch (e) {}
    let sub = ""; const gb = el.closest && el.closest(".gblock"); if (gb) { const h3 = gb.querySelector("h3"); if (h3 && !(el === h3 || el.contains(h3))) sub = h3.textContent.trim(); }
    if (!s) { const h1 = root.querySelector("h1"); s = h1 ? h1.textContent.trim() : ""; } return sub ? s + " · " + sub : s; }
  function lfApply() { const k = LFS.i; if (!LFS.tag) return; LFS.tag.forEach((r, e) => e.classList.toggle("pg-off", k < r[0] || k > r[1]));
    // the screen never slides in page view: a single block taller than the page scrolls inside its own box
    document.querySelectorAll(".pg-tall").forEach((e) => { e.classList.remove("pg-tall"); e.style.maxHeight = ""; });
    if (!LFS.fitting && !document.body.classList.contains("pg-measure") && LFS.pages && LFS.pages[k]) { const N = document.getElementById("lf-nav"), lim = innerHeight - (N ? N.offsetHeight : 74) - 22;
      LFS.pages[k].forEach((e) => { if (!e.offsetHeight) return; const r = e.getBoundingClientRect(); if (r.bottom > lim + 1 && r.top < lim) { e.classList.add("pg-tall"); e.style.maxHeight = Math.max(160, lim - r.top) + "px"; } }); }
    // the first thing on a page sits at the top of the page, without the gap it had below the block before it
    const R = LFS.root; if (!R) return; R.querySelectorAll(".pg-first").forEach((e) => e.classList.remove("pg-first")); let e = R;
    for (let d = 0; d < 6 && e; d++) { const c = [...e.children].find((x) => !x.classList.contains("pg-off") && !x.matches("script, style, .crumbs") && getComputedStyle(x).display !== "none"); if (!c) break; c.classList.add("pg-first"); e = c; } }
  function lfGo(i, silent) { if (!LFS.pages) return; i = Math.max(0, Math.min(LFS.n - 1, i)); const moved = i !== LFS.i, dir = i > LFS.i ? 1 : -1; LFS.i = i;
    lfApply(); if (moved) { scrollTo(0, 0); if (!silent) { lfFlipSound(); const R = LFS.root; if (R && !matchMedia("(prefers-reduced-motion: reduce)").matches) { R.classList.remove("pg-in-l", "pg-in-r"); void R.offsetWidth; R.classList.add(dir > 0 ? "pg-in-r" : "pg-in-l"); } } }
    LFS.anchor = (LFS.pages[i] || [])[0]; lfNav(); try { S.pgAt = S.pgAt || {}; S.pgAt[location.hash] = LFS.leaves.indexOf(LFS.anchor); save(); } catch (e) {} }
  // you turned the page yourself: if the lesson is being read aloud, the voice jumps to the top of the page you are now on
  function lfUserGo(i) { const was = LFS.i; lfGo(i); if (LFS.i === was) return;
    try { if (typeof RA === "undefined" || !RA.on || !RA.q || !RA.q.length) return; const k = LFS.i;
      let j = RA.q.findIndex((it) => lfPageOf(it.el) === k); if (j < 0) j = RA.q.findIndex((it) => lfPageOf(it.el) > k); if (j < 0) return;
      RA.i = j; if (RA.paused) { if (RA.el) RA.el.classList.remove("ra-now"); RA.el = RA.q[j].el; try { raPlayerUI(); } catch (e) {} return; }
      try { speechSynthesis.cancel(); } catch (e) {} raPlay(); } catch (e) {} }
  function lfWrap() { if (LFS.busy) return; LFS.busy = true; try { if (!lfPaged()) { lfUnwrap(); return; } lfBuild(); } finally { setTimeout(() => { LFS.busy = false; }, 0); } }
  function lfUnwrap() { document.body.classList.remove("paged", "pg-measure"); const N = document.getElementById("lf-nav"); if (N) N.remove(); const C = document.getElementById("lf-cont"); if (C) C.remove(); const root = lfRoot(); if (root) root.querySelectorAll(".pg-off").forEach((e) => e.classList.remove("pg-off")); LFS.pages = null; LFS.tag = new Map(); }
  // a page that ends part-way through a topic says so: "Los números continues on the next page"
  function lfCont(i) { const a = (LFS.pages || [])[i], b = (LFS.pages || [])[i + 1]; if (!a || !b) return "";
    const F = b.find((e) => e.tagName === "TR" || (e.textContent.trim() && !e.matches(".crumbs, .jump"))); if (!F || F.matches(PG_KEEP + ", .lend") || F.closest(".lend, #s-pra, #s-chal")) return "";
    const own = (e) => { const g = e.closest && e.closest(".gblock"); if (g && g.querySelector("h3")) return g; return lfSec(e, LFS.root); };
    const L = a[a.length - 1], o = own(F); if (!o || own(L) !== o || o === F || !o.matches(".gblock, section.block")) return "";
    const h = o.matches(".gblock") ? o.querySelector("h3") : o.querySelector(".shead h2, h2"); if (!h) return ""; const t = (h.childNodes[0] || h).textContent.trim(); return t; }
  function lfNav() { let N = document.getElementById("lf-nav"); if (!lfPaged() || !LFS.pages) { if (N) N.remove(); return; }
    if (!N) { N = document.createElement("nav"); N.id = "lf-nav"; N.className = "lf-nav"; N.setAttribute("aria-label", "Pages"); document.body.appendChild(N); }
    const pc = LFS.n > 1 ? Math.round((LFS.i / (LFS.n - 1)) * 100) : 100, hint = !S.pgSwiped ? '<span class="lf-hint">Swipe or use the arrows</span>' : "";
    N.innerHTML = '<button type="button" data-act="pg-prev" aria-label="Previous page"' + (LFS.i ? "" : " disabled") + '><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg></button>' +
      '<div class="lf-mid"><span class="lf-lab">' + esc(LFS.label[LFS.i] || "") + '</span><span class="lf-bar" aria-hidden="true"><i style="width:' + pc + '%"></i></span><span class="lf-num" aria-live="polite">Page ' + (LFS.i + 1) + " of " + LFS.n + "</span>" + hint + "</div>" +
      '<button type="button" data-act="pg-read" aria-label="Read this page aloud" title="Read aloud from here"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 10v4h4l5 4V6L8 10zM16 9a4 4 0 0 1 0 6M18.5 6.5a7.5 7.5 0 0 1 0 11" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/></svg></button>' +
      '<button type="button" data-act="pg-next" aria-label="Next page"' + (LFS.i < LFS.n - 1 ? "" : " disabled") + '><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg></button>'; }
  function lfContLine() { let C = document.getElementById("lf-cont"); const t = lfPaged() && LFS.pages ? lfCont(LFS.i) : "";
    if (!t) { if (C) C.remove(); return; } if (!C) { C = document.createElement("p"); C.id = "lf-cont"; C.className = "lf-cont"; document.body.appendChild(C); }
    C.innerHTML = '<b>' + esc(t) + "</b> continues on the next page ›"; }
  function lfPageOf(el) { if (!LFS.pages || !el) return -1; for (let k = 0; k < LFS.pages.length; k++) if (LFS.pages[k].some((l) => l === el || l.contains(el) || el.contains(l))) return k; return -1; }
  function lfShowEl(el) { const k = lfPageOf(el); if (k >= 0 && k !== LFS.i) lfGo(k); return k >= 0; }
  // switching between scroll and page view keeps your place: the block at the top of the screen is the one you see next
  function lfTopLeaf() { const root = lfRoot(); if (!root) return null; const hdr = document.querySelector("header.top"), y = (hdr ? hdr.getBoundingClientRect().bottom : 0) + 8;
    const L = lfLeaves(root, lfBudget()); return L.find((el) => el.getBoundingClientRect().bottom > y + 24) || null; }
  function lfToggle() { if (S.paged) { const a = ((LFS.pages || [])[LFS.i] || []).find((e) => e.offsetHeight > 0) || LFS.anchor; S.paged = false; try { save(); } catch (x) {} lfUnwrap(); lfTools(); lfFab();
      if (a && a.isConnected) { const hdr = document.querySelector("header.top"), off = (hdr ? hdr.getBoundingClientRect().bottom : 0) + 12; scrollTo(0, Math.max(0, a.getBoundingClientRect().top + scrollY - off)); } }
    else { const a = lfTopLeaf(); S.paged = true; try { save(); } catch (x) {} LFS.busy = true; try { lfBuild(a); } finally { setTimeout(() => { LFS.busy = false; }, 0); } lfTools(); lfFab(); }
    try { if (typeof RA !== "undefined" && RA.on) { raPlayer(); raPlayerUI(); } } catch (e) {} // the player's buttons turn pages in page view, skip parts in scroll view
    try { coachToast(S.paged ? "Page view: one idea at a time" : "Scroll view"); } catch (e) {} }
  let lfT = null; const lfSoon = () => { clearTimeout(lfT); lfT = setTimeout(() => { if (document.body.classList.contains("mastery-on")) return; if (lfPaged()) { lfWrap(); } else if (document.body.classList.contains("paged")) lfUnwrap(); lfTools(); lfFab(); try { lfA11y(); } catch (e) {} }, 60); };
  const LF_FOLLOW = /(^|\s)(ra-now|playing|gp-now)(\s|$)/;
  const lfObs = new MutationObserver((ms) => { if (LFS.busy) return;
    if (ms.some((m) => m.type === "childList" && m.target.id === "app")) { LFS.anchor = null; lfSoon(); return; }
    if (!document.body.classList.contains("paged") || !LFS.pages) return;
    const now = ms.find((m) => m.type === "attributes" && m.target.classList && LF_FOLLOW.test(m.target.className) && !LF_FOLLOW.test(m.oldValue || "")); if (now) { lfShowEl(now.target); return; }
    // something new appeared between blocks (not inside one): lay the pages out again around the page you are on
    if (ms.some((m) => m.type === "childList" && [...m.addedNodes].some((n) => n.nodeType === 1 && LFS.tag && (m.target === LFS.root || (LFS.tag.has(m.target) && !LFS.leaves.includes(m.target))) && !LFS.leaves.includes(n)))) { clearTimeout(LFS.mt); LFS.mt = setTimeout(() => { if (lfPaged() && !document.body.classList.contains("mastery-on")) { LFS.busy = true; try { lfBuild(LFS.anchor); } finally { setTimeout(() => { LFS.busy = false; }, 0); } } }, 120); } });
  addEventListener("load", () => { const A = document.getElementById("app"); if (A) lfObs.observe(A, { childList: true, subtree: true, attributes: true, attributeOldValue: true, attributeFilter: ["class"] }); lfSoon(); });
  addEventListener("hashchange", lfSoon);
  addEventListener("scroll", () => { if (document.body.classList.contains("paged") && !document.body.classList.contains("pg-measure") && scrollY !== 0) scrollTo(0, 0); }, { passive: true });
  let lfRz = null; addEventListener("resize", () => { if (!document.body.classList.contains("paged") || document.body.classList.contains("kb-open")) return; clearTimeout(lfRz); lfRz = setTimeout(() => { LFS.busy = true; try { lfBuild(LFS.anchor); } finally { setTimeout(() => { LFS.busy = false; }, 0); } }, 200); });
  // swipe
  let lfX = null, lfY = null; document.addEventListener("touchstart", (e) => { if (!document.body.classList.contains("paged") || !e.target.closest("#app") || e.target.closest(".tbl, .cr-scroll, input, textarea")) return; lfX = e.touches[0].clientX; lfY = e.touches[0].clientY; }, { passive: true });
  document.addEventListener("touchend", (e) => { if (lfX == null) return; const dx = e.changedTouches[0].clientX - lfX, dy = e.changedTouches[0].clientY - lfY; lfX = null;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.4) { if (!S.pgSwiped) { S.pgSwiped = 1; try { save(); } catch (x) {} } lfUserGo(LFS.i + (dx < 0 ? 1 : -1)); } }, { passive: true });
  document.addEventListener("keydown", (e) => { if (!document.body.classList.contains("paged") || e.altKey || e.ctrlKey || e.metaKey || /INPUT|TEXTAREA|SELECT/.test((document.activeElement || {}).tagName || "")) return;
    if (e.key === "ArrowRight" || e.key === "PageDown") { e.preventDefault(); lfUserGo(LFS.i + 1); } else if (e.key === "ArrowLeft" || e.key === "PageUp") { e.preventDefault(); lfUserGo(LFS.i - 1); } });
  document.addEventListener("focusin", (e) => { if (document.body.classList.contains("paged") && !e.target.closest(".lf-nav")) lfShowEl(e.target); });
  // section buttons and in-page links go to the page that holds the target
  document.addEventListener("click", (e) => { const b = e.target.closest && e.target.closest("[data-act='pg-prev'], [data-act='pg-next'], [data-act='pg-mode'], [data-act='pg-read'], [data-act='lf-top'], [data-act='lf-end'], [data-act='jump'], .lesson-jump a, a[href^='#s-']"); if (!b) return;
    const act = b.dataset && b.dataset.act;
    if (act === "pg-prev") { if (!S.pgSwiped) { S.pgSwiped = 1; try { save(); } catch (x) {} } lfUserGo(LFS.i - 1); } else if (act === "pg-next") { if (!S.pgSwiped) { S.pgSwiped = 1; try { save(); } catch (x) {} } lfUserGo(LFS.i + 1); }
    else if (act === "pg-mode") lfToggle();
    else if (act === "lf-top" || act === "lf-end") { const end = act === "lf-end", tgt = end ? document.getElementById("s-end") : null;
      if (document.body.classList.contains("paged") && LFS.pages) lfUserGo(end ? (tgt ? lfPageOf(tgt) : LFS.n - 1) : 0);
      else { const hdr = document.querySelector("header.top"), y = !end ? 0 : tgt ? tgt.getBoundingClientRect().top + scrollY - (hdr ? hdr.getBoundingClientRect().bottom : 0) - 12 : document.documentElement.scrollHeight;
        const far = Math.abs(y - scrollY) > innerHeight * 2; scrollTo({ top: y, behavior: far || matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" }); } }
    else if (act === "pg-read") { try { raStop(true); raStart(0); } catch (x) {} }
    else if (document.body.classList.contains("paged")) { const id = act === "jump" ? "s-" + b.dataset.to : (b.getAttribute("href") || "").slice(1), el = id && document.getElementById(id);
      if (el) { e.preventDefault(); e.stopPropagation(); lfShowEl(el.querySelector(".shead") || el); } } }, true);
  // accessibility: a table that scrolls sideways can be reached and scrolled with the keyboard
  function lfA11y() { const A = document.getElementById("app"); if (!A) return; A.querySelectorAll(".tbl").forEach((t) => { if (t.scrollWidth > t.clientWidth + 1) { if (!t.hasAttribute("tabindex")) { t.tabIndex = 0; t.setAttribute("role", "region"); t.setAttribute("aria-label", "Table (scrolls sideways)"); } } }); }
  /* ---- 3. top-bar tools on lessons: page mode and Profe; Profe's floating button tucked away during lessons and drills ---- */
  function lfTools() { const nb = document.querySelector("header.top .nb"); if (!nb) return; let T = document.getElementById("nb-tools");
    if (!lfRead()) { if (T) T.remove(); return; }
    if (!T) { T = document.createElement("span"); T.id = "nb-tools"; T.className = "nb-tools"; nb.insertBefore(T, document.getElementById("regbtn")); }
    T.innerHTML = '<button type="button" data-act="lf-top" aria-label="Go to the start of the lesson" title="Start"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 5h12M7 13l5-5 5 5M7 19l5-5 5 5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></button>' +
      '<button type="button" data-act="lf-end" aria-label="Go to the end of the lesson" title="End"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 19h12M7 11l5 5 5-5M7 5l5 5 5-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></button>' +
      '<button type="button" data-act="pg-mode" aria-pressed="' + !!S.paged + '" aria-label="' + (S.paged ? "Scroll the lesson" : "Read the lesson page by page") + '" title="' + (S.paged ? "Scroll view" : "Page view") + '">' +
      (S.paged ? '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 6h14M5 12h14M5 18h14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>' : '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 5.5c3-1 6-1 9 1 3-2 6-2 9-1v13c-3-1-6-1-9 1-3-2-6-2-9-1zM12 6.5v13" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>') +
      '</button>'; }
  function lfFab() { document.body.classList.toggle("lf-quiet", lfRead() || /^#ejercicios\//.test(location.hash) || /^#drill$/.test(location.hash)); }
  /* ---- 4. Mastery exercises take the whole screen, like the drills; ‹ Lesson brings you back to the same place ---- */
  function lfMOpen() { const sec = document.getElementById("s-pra"); if (!sec || sec.classList.contains("m-full")) return; LFS.mY = scrollY; LFS.mPaged = document.body.classList.contains("paged");
    LFS.mAnchor = LFS.anchor;
    if (!sec.querySelector(".m-bar")) { const b = document.createElement("div"); b.className = "m-bar"; b.innerHTML = '<button class="btn small sk-back" data-act="m-close">‹ Lesson</button><b>🎯 Mastery exercises</b>'; sec.prepend(b); }
    // lift the section out of the page while it is open, so nothing of the lesson shows behind it
    sec.querySelectorAll(".pg-off").forEach((e) => e.classList.remove("pg-off"));
    const ph = document.createElement("div"); ph.id = "s-pra-ph"; sec.parentNode.insertBefore(ph, sec); document.body.appendChild(sec);
    sec.classList.add("m-full"); document.body.classList.add("mastery-on", "no-tabs"); sec.scrollTop = 0; }
  function lfMClose() { const sec = document.getElementById("s-pra"); if (!sec) return; sec.classList.remove("m-full"); const ph = document.getElementById("s-pra-ph"); if (ph) { ph.replaceWith(sec); } const b = sec.querySelector(".m-bar"); if (b) b.remove(); document.body.classList.remove("mastery-on");
    try { document.querySelectorAll("[data-skrev]").forEach((c) => { const h = skReviewCard(c.dataset.skrev); if (h) c.outerHTML = h; }); } catch (e) {}
    if (LFS.mPaged && lfPaged()) { LFS.busy = true; try { lfBuild(sec.querySelector(".shead") || sec); } finally { setTimeout(() => { LFS.busy = false; }, 0); } } else scrollTo(0, LFS.mY != null ? LFS.mY : sec.getBoundingClientRect().top + scrollY - 80);
  }
  document.addEventListener("click", (e) => { const t = e.target.closest && e.target.closest('[data-act="px-go"], [data-act="px-restart"], [data-act="px-retry"], [data-act="px-redo"], [data-act="m-close"]'); if (!t) return;
    if (t.dataset.act === "m-close") { lfMClose(); return; } if (t.closest("#s-pra")) setTimeout(lfMOpen, 0); }, true);
  // answering in the lesson (even when the exercises are already under way) opens the full-screen view too
  document.addEventListener("click", (e) => { const r = e.target.closest && e.target.closest("#s-pra #runner"); if (r && !document.getElementById("s-pra").classList.contains("m-full") && e.target.closest("[data-act^='px-']")) setTimeout(lfMOpen, 0); }, true);
  document.addEventListener("focusin", (e) => { if (e.target.id === "px-in" && !document.getElementById("s-pra").classList.contains("m-full") && !document.body.classList.contains("paged")) setTimeout(lfMOpen, 0); });
  addEventListener("hashchange", () => { document.body.classList.remove("mastery-on"); const sec = document.querySelector("body > #s-pra"); if (sec) sec.remove(); });
  window.__lf = { mOpen: lfMOpen, mClose: lfMClose, go: (i) => lfGo(i), state: () => ({ on: document.body.classList.contains("paged"), i: LFS.i, n: LFS.n, label: (LFS.label || [])[LFS.i] || "", pages: (LFS.pages || []).map((p) => p.length) }), pageOf: lfPageOf, topLeaf: lfTopLeaf, cont: lfCont, build: () => lfBuild(LFS.anchor), toggle: lfToggle, showEl: lfShowEl, wordAt: lfWordAt, isEs: lfIsSpanish, show: lfShow, refresh: lfSoon, locked: lfExamLocked };
