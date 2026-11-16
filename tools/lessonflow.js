  /* ---------- lesson flow (tools/lessonflow.js, 16 Nov 2026) ----------
     1. Tap any Spanish word, anywhere, to see what it means (not while it would give away an answer, and not in exam mode).
     2. Page mode for lessons and guides: one screen = one page; swipe or tap the arrows; a page-turn sound; read-aloud turns the page.
     3. Profe's button stays out of the way while a lesson or a drill is in progress (Profe is one tap away in the top bar). */
  const LFS = { on: false, i: 0, n: 1, step: 0, busy: false };
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
  /* ---- 2. page mode ---- */
  function lfFlipSound() { try { if (typeof UI !== "undefined" && UI.sfx === false) return; const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return; SFXC = SFXC || new AC(); const c = SFXC, t = c.currentTime, len = 0.22;
    const buf = c.createBuffer(1, Math.floor(c.sampleRate * len), c.sampleRate), d = buf.getChannelData(0); for (let i = 0; i < d.length; i++) { const k = i / d.length; d[i] = (Math.random() * 2 - 1) * Math.pow(1 - k, 2) * (0.6 + 0.4 * Math.sin(k * 40)); }
    const src = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain(); src.buffer = buf; f.type = "bandpass"; f.frequency.setValueAtTime(2400, t); f.frequency.exponentialRampToValueAtTime(700, t + len); f.Q.value = 0.8;
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.16, t + 0.03); g.gain.exponentialRampToValueAtTime(0.0001, t + len); src.connect(f); f.connect(g); g.connect(c.destination); src.start(t); src.stop(t + len); } catch (e) {} }
  const lfPaged = () => !!(S.paged) && lfRead();
  function lfWrap() { const A = document.getElementById("app"); if (!A || LFS.busy) return; LFS.busy = true;
    try { if (!lfPaged()) { lfUnwrap(); return; }
      let W = A.querySelector(":scope > .pg-wrap"); const loose = [...A.children].filter((c) => !c.classList.contains("pg-wrap") && !c.classList.contains("lf-nav"));
      if (!W) { W = document.createElement("div"); W.className = "pg-wrap"; W.innerHTML = '<div class="pg-cols"></div>'; A.appendChild(W); }
      const C = W.firstChild; loose.forEach((el) => C.appendChild(el));
      document.body.classList.add("paged"); lfMeasure(); lfNav(); } finally { LFS.busy = false; } }
  function lfUnwrap() { const A = document.getElementById("app"), W = A && A.querySelector(":scope > .pg-wrap"); document.body.classList.remove("paged"); const N = document.getElementById("lf-nav"); if (N) N.remove();
    if (W) { const C = W.firstChild; [...C.children].forEach((el) => A.insertBefore(el, W)); W.remove(); } }
  function lfMeasure() { const A = document.getElementById("app"), W = A && A.querySelector(".pg-wrap"); if (!W) return; const C = W.firstChild;
    const hdr = document.querySelector("header.top"), top = hdr ? hdr.getBoundingClientRect().bottom : 0, h = Math.max(320, innerHeight - top - 92);
    W.style.height = h + "px"; const w = W.clientWidth, gap = 40; C.style.columnWidth = w + "px"; C.style.columnGap = gap + "px"; C.style.height = h + "px";
    LFS.step = w + gap; LFS.n = Math.max(1, Math.round((C.scrollWidth + gap) / LFS.step)); LFS.i = Math.min(LFS.i, LFS.n - 1); lfGo(LFS.i, true); }
  function lfGo(i, silent) { const C = document.querySelector(".pg-wrap > .pg-cols"); if (!C) return; i = Math.max(0, Math.min(LFS.n - 1, i)); const moved = i !== LFS.i; LFS.i = i;
    C.style.transform = "translateX(" + -i * LFS.step + "px)"; if (moved && !silent) lfFlipSound(); lfNav(); try { S.pgAt = S.pgAt || {}; S.pgAt[location.hash] = i; } catch (e) {} }
  function lfNav() { let N = document.getElementById("lf-nav"); if (!lfPaged()) { if (N) N.remove(); return; }
    if (!N) { N = document.createElement("div"); N.id = "lf-nav"; N.className = "lf-nav"; document.body.appendChild(N); }
    const hint = !S.pgSwiped ? '<span class="lf-hint">Swipe to turn the page</span>' : "";
    N.innerHTML = '<button data-act="pg-prev" aria-label="Previous page"' + (LFS.i ? "" : " disabled") + '>‹</button><span class="lf-num">' + (LFS.i + 1) + " / " + LFS.n + "</span>" + hint + '<button data-act="pg-next" aria-label="Next page"' + (LFS.i < LFS.n - 1 ? "" : " disabled") + ">›</button>"; }
  function lfPageOf(el) { const C = document.querySelector(".pg-wrap > .pg-cols"); if (!C || !el || !C.contains(el)) return -1; const x = el.getBoundingClientRect().left - C.getBoundingClientRect().left; return Math.max(0, Math.floor((x + 2) / LFS.step)); }
  function lfShowEl(el) { const k = lfPageOf(el); if (k >= 0 && k !== LFS.i) lfGo(k); return k >= 0; }
  let lfT = null; const lfSoon = () => { clearTimeout(lfT); lfT = setTimeout(() => { if (lfPaged()) { lfWrap(); } else if (document.body.classList.contains("paged")) lfUnwrap(); lfTools(); lfFab(); }, 60); };
  const lfObs = new MutationObserver((ms) => { if (LFS.busy) return;
    if (ms.some((m) => m.type === "childList" && m.target.id === "app")) { LFS.i = ((S.pgAt || {})[location.hash]) || 0; lfSoon(); return; }
    if (document.body.classList.contains("paged")) { const now = ms.find((m) => m.type === "attributes" && m.target.classList && m.target.classList.contains("ra-now")); if (now) { lfShowEl(now.target); return; } clearTimeout(LFS.mt); LFS.mt = setTimeout(lfMeasure, 250); } });
  addEventListener("load", () => { const A = document.getElementById("app"); if (A) lfObs.observe(A, { childList: true, subtree: true, attributes: true, attributeFilter: ["class"] }); lfSoon(); });
  addEventListener("hashchange", lfSoon); addEventListener("resize", () => { if (document.body.classList.contains("paged")) lfMeasure(); });
  // swipe
  let lfX = null, lfY = null; document.addEventListener("touchstart", (e) => { if (!document.body.classList.contains("paged") || !e.target.closest(".pg-wrap")) return; lfX = e.touches[0].clientX; lfY = e.touches[0].clientY; }, { passive: true });
  document.addEventListener("touchend", (e) => { if (lfX == null) return; const dx = e.changedTouches[0].clientX - lfX, dy = e.changedTouches[0].clientY - lfY; lfX = null;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.4) { if (!S.pgSwiped) { S.pgSwiped = 1; try { save(); } catch (x) {} } lfGo(LFS.i + (dx < 0 ? 1 : -1)); } }, { passive: true });
  document.addEventListener("keydown", (e) => { if (!document.body.classList.contains("paged") || /INPUT|TEXTAREA|SELECT/.test((document.activeElement || {}).tagName || "")) return; if (e.key === "ArrowRight") lfGo(LFS.i + 1); else if (e.key === "ArrowLeft") lfGo(LFS.i - 1); });
  document.addEventListener("focusin", (e) => { if (document.body.classList.contains("paged")) lfShowEl(e.target); });
  document.addEventListener("click", (e) => { const b = e.target.closest && e.target.closest("[data-act^='pg-'], .lesson-jump a, a[href^='#s-']"); if (!b) return;
    const act = b.dataset && b.dataset.act;
    if (act === "pg-prev") lfGo(LFS.i - 1); else if (act === "pg-next") lfGo(LFS.i + 1);
    else if (act === "pg-mode") { S.paged = !S.paged; try { save(); } catch (x) {} lfSoon(); }
    else if (document.body.classList.contains("paged")) { const id = (b.getAttribute("href") || "").slice(1), el = id && document.getElementById(id); if (el) { e.preventDefault(); lfShowEl(el); } } });
  /* ---- 3. top-bar tools on lessons: page mode and Profe; Profe's floating button tucked away during lessons and drills ---- */
  function lfTools() { const nb = document.querySelector("header.top .nb"); if (!nb) return; let T = document.getElementById("nb-tools");
    if (!lfRead()) { if (T) T.remove(); return; }
    if (!T) { T = document.createElement("span"); T.id = "nb-tools"; T.className = "nb-tools"; nb.insertBefore(T, document.getElementById("regbtn")); }
    T.innerHTML = '<button type="button" data-act="pg-mode" aria-pressed="' + !!S.paged + '" aria-label="' + (S.paged ? "Scroll the lesson" : "Read the lesson page by page") + '" title="' + (S.paged ? "Scroll view" : "Page view") + '">' +
      (S.paged ? '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 6h14M5 12h14M5 18h14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>' : '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 5.5c3-1 6-1 9 1 3-2 6-2 9-1v13c-3-1-6-1-9 1-3-2-6-2-9-1zM12 6.5v13" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>') +
      '</button><button type="button" class="nb-profe" data-act="t-open" aria-label="Open Profe">P</button>'; }
  function lfFab() { document.body.classList.toggle("lf-quiet", lfRead() || /^#ejercicios\//.test(location.hash) || /^#drill$/.test(location.hash)); }
  /* ---- 4. Mastery exercises take the whole screen, like the drills; ‹ Lesson brings you back to the same place ---- */
  function lfMOpen() { const sec = document.getElementById("s-pra"); if (!sec || sec.classList.contains("m-full")) return; LFS.mY = scrollY; LFS.mPaged = document.body.classList.contains("paged");
    if (LFS.mPaged) { LFS.busy = true; lfUnwrap(); LFS.busy = false; }
    if (!sec.querySelector(".m-bar")) { const b = document.createElement("div"); b.className = "m-bar"; b.innerHTML = '<button class="btn small sk-back" data-act="m-close">‹ Lesson</button><b>🎯 Mastery exercises</b>'; sec.prepend(b); }
    sec.classList.add("m-full"); document.body.classList.add("mastery-on", "no-tabs"); scrollTo(0, 0); sec.scrollTop = 0; }
  function lfMClose() { const sec = document.getElementById("s-pra"); if (!sec) return; sec.classList.remove("m-full"); const b = sec.querySelector(".m-bar"); if (b) b.remove(); document.body.classList.remove("mastery-on");
    if (LFS.mPaged) { lfWrap(); lfShowEl(sec); } else scrollTo(0, LFS.mY != null ? LFS.mY : sec.getBoundingClientRect().top + scrollY - 80);
    try { document.querySelectorAll("[data-skrev]").forEach((c) => { const h = skReviewCard(c.dataset.skrev); if (h) c.outerHTML = h; }); } catch (e) {} }
  document.addEventListener("click", (e) => { const t = e.target.closest && e.target.closest('[data-act="px-go"], [data-act="px-restart"], [data-act="px-retry"], [data-act="px-redo"], [data-act="m-close"]'); if (!t) return;
    if (t.dataset.act === "m-close") { lfMClose(); return; } if (t.closest("#s-pra")) setTimeout(lfMOpen, 0); }, true);
  // answering in the lesson (even when the exercises are already under way) opens the full-screen view too
  document.addEventListener("click", (e) => { const r = e.target.closest && e.target.closest("#s-pra #runner"); if (r && !document.getElementById("s-pra").classList.contains("m-full") && e.target.closest("[data-act^='px-']")) setTimeout(lfMOpen, 0); }, true);
  document.addEventListener("focusin", (e) => { if (e.target.id === "px-in" && !document.getElementById("s-pra").classList.contains("m-full") && !document.body.classList.contains("paged")) setTimeout(lfMOpen, 0); });
  addEventListener("hashchange", () => document.body.classList.remove("mastery-on"));
  window.__lf = { mOpen: lfMOpen, mClose: lfMClose, go: (i) => lfGo(i), state: () => ({ on: document.body.classList.contains("paged"), i: LFS.i, n: LFS.n }), showEl: lfShowEl, wordAt: lfWordAt, isEs: lfIsSpanish, show: lfShow, refresh: lfSoon, locked: lfExamLocked };
