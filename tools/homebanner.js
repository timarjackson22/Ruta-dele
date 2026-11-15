  /* ==HOMEBANNER== Home: rotating Continue banner + schedule summary (M2) and the video page's Next video button (M3), 15 Nov 2026.
     Re-run tools/patch_m2m3.py to update. */
  const CB = { i: 0, t: null, paused: false, hold: 0, user: false, n: 0 };
  const cbMMSS = (s) => Math.floor(s / 60) + ":" + String(Math.floor(s % 60)).padStart(2, "0");
  function cbSlides() { // only real items: nothing invented
    const out = [], cl = curLevel();
    // 1. the study plan: the session due now or next today
    try { const st = plStatus(); if (st.exists && st.next) { const s = st.next, K = PL_KIND[s.kind] || PL_KIND.learn, now = s.date === plToday() && plMin(s.start) <= new Date().getHours() * 60 + new Date().getMinutes();
      out.push({ k: "plan", eye: (now ? "Scheduled now" : s.date === plToday() ? "Scheduled today " + s.start : "Next scheduled · " + plDate(s.date).toLocaleDateString(undefined, { weekday: "short" }) + " " + s.start) + " · " + K[1], t: s.t, where: s.obj || "", pct: st.today.planned ? Math.round(100 * st.today.done / st.today.planned) : 0, pctL: Math.round(st.today.done) + " / " + st.today.planned + " min today", min: s.min, go: "Start", act: "pl-start", id: s.id, c: K[2] }); } } catch (e) {}
    // 2. the unfinished lesson
    if (S.last && LV[S.last.l]) { const L = LV[S.last.l], u = L.units[S.last.i], done = unitState(L.id, S.last.i).done;
      if (u) out.push({ k: "lesson", eye: (done ? "Next up" : "Continue your lesson") + " · " + L.name, t: done && L.units[S.last.i + 1] ? L.units[S.last.i + 1].t : u.t, where: "Unit " + (done && L.units[S.last.i + 1] ? S.last.i + 2 : S.last.i + 1) + " of " + L.units.length, pct: levelPct(L.id), pctL: levelPct(L.id) + "% of " + L.name, min: 30, go: done ? "Start" : "Resume", href: "#" + L.id + "-u" + ((done && L.units[S.last.i + 1] ? S.last.i + 1 : S.last.i) + 1), c: "#2f7cf0" }); }
    // 3. flashcards due
    const due = dueCount(); if (due) out.push({ k: "cards", eye: "Flashcards due", t: due + " card" + (due === 1 ? "" : "s") + " ready to review", where: "Spaced repetition: review before you forget", pct: null, min: Math.max(2, Math.ceil(due * 0.2)), go: "Review", href: "#repaso", c: "#f07b16" });
    // 4. media in progress
    if (S.lastLi && LI[S.lastLi.id]) out.push({ k: "listen", eye: "Stories & Podcasts", t: S.lastLi.t, where: (S.lastLi.lvl ? String(S.lastLi.lvl).toUpperCase() + " · " : "") + "pick up where you stopped", pct: null, min: 10, go: "Resume", href: "#" + S.lastLi.id, c: "#1f63e0" });
    if (S.lastVid && vFind(S.lastVid.id)) { const d = (S.vid || {})[S.lastVid.id] || {}; if (!d.w) out.push({ k: "video", eye: "Video", t: S.lastVid.t, where: d.at ? "Stopped at " + cbMMSS(d.at) : "Not finished yet", pct: null, min: 5, go: "Resume", href: "#video-" + S.lastVid.id, c: "#d6336c" }); }
    if (S.lastRead && LI[S.lastRead.id]) out.push({ k: "read", eye: "Reading", t: S.lastRead.t, where: (S.lastRead.lvl ? String(S.lastRead.lvl).toUpperCase() + " · " : "") + "continue the text", pct: null, min: 10, go: "Resume", href: "#" + S.lastRead.id, c: "#e0592e" });
    // 5. a cheat sheet: a saved one, else the guide behind your latest mistakes, else today's topic at your level
    try { const bm = (S.chBm || []), lvOk = GUIDES.filter((g) => PL_LV.indexOf(g.lvl) <= Math.max(1, PL_LV.indexOf(cl))), g = GUIDES.find((x) => x.id === bm[bm.length - 1]) || lvOk[Math.floor(Date.now() / 864e5) % Math.max(1, lvOk.length)];
      if (g) out.push({ k: "sheet", eye: "Revision Cheat Sheet" + (bm.includes(g.id) ? " · saved" : ""), t: g.en, where: g.sec.length + " rules on one or two pages", pct: null, min: 5, go: "Revise", href: "#chuleta-" + g.id, c: "#0f7f86" }); } catch (e) {}
    // 6. my mistakes
    const nm = (S.mist || []).length; if (nm) out.push({ k: "mist", eye: "My mistakes", t: nm + " question" + (nm === 1 ? "" : "s") + " to fix", where: "Redo what you got wrong", pct: null, min: Math.max(3, Math.ceil(nm * 0.5)), go: "Fix them", href: "#errores", c: "#d93b4c" });
    // 7. exam practice: a paper started but not finished, else the next unseen one at your level
    try { const lv = /^(a1|a2|b1|b2|c1|c2)$/.test(cl) ? cl : "a1", N = EXREADY[lv] || 0; let pick = null;
      for (let n = 1; n <= N; n++) { const T = exTotals(lv, n); if (T.done > 0 && !T.all) { pick = [n, T]; break; } }
      if (!pick) for (let n = 1; n <= N; n++) { const T = exTotals(lv, n); if (!T.done) { pick = [n, T]; break; } }
      if (pick) { const [n, T] = pick, M = PL_MINS[lv] || PL_MINS.b1, left = EXORDER.filter((k) => !(exRes(lv, n)[k])), mins = left.reduce((t, k) => t + (M[k] || 40), 0);
        out.push({ k: "exam", eye: "Exam practice · DELE " + lv.toUpperCase(), t: "Exam " + n + (T.done ? " · continue" : ""), where: T.done + " of 4 papers done", pct: Math.round(100 * T.done / 4), pctL: T.done + "/4 papers", min: mins, go: T.done ? "Continue" : "Start", href: "#" + lv + "-examen-" + n, c: "#6d4be0" }); } } catch (e) {}
    return out;
  }
  function cbSched() { // the persistent schedule summary (never rotates)
    let st = null; try { st = plStatus(); } catch (e) {}
    if (!st || !st.exists) return '<div class="cbsched none"><span><b>No study plan yet</b><small>Turn your goal and free time into a calendar.</small></span><a class="btn small" href="#plan">Create study plan</a></div>';
    const lab = { completed: "✓ Today done", "on track": "On track", ahead: "Ahead", behind: "Behind", free: "No sessions today" }, cls = (x) => (x === "behind" ? "warn" : x === "free" ? "muted" : "ok");
    const today = lab[st.today.state] || st.today.state, all = lab[st.overall.state] || st.overall.state;
    return '<div class="cbsched"><span><b>Today: <i class="plchip ' + cls(st.today.state) + '">' + today + "</i></b><small>" + Math.round(st.today.done) + " / " + st.today.planned + " min · plan overall: " + all.toLowerCase() + (st.profile && st.profile.exam && st.profile.exam.date ? " · exam " + plDate(st.profile.exam.date).toLocaleDateString(undefined, { day: "numeric", month: "short" }) + (st.profile.exam.booked ? "" : " (provisional)") : "") + "</small></span>" +
      (st.today.state === "behind" || st.overall.state === "behind" ? '<button class="btn small primary" data-act="pl-catchup">Catch up</button>' : "") + '<button class="btn small" data-act="pl-view" data-v="agenda">' + (st.today.state === "behind" || st.overall.state === "behind" ? "Adjust plan" : "Open plan") + "</button></div>";
  }
  function cbHTML(fallback) {
    const L = cbSlides(); CB.n = L.length; if (CB.i >= L.length) CB.i = 0;
    if (!L.length) return '<div class="cbwrap">' + fallback + cbSched() + "</div>";
    const slide = (s, i) => { const tag = s.href ? 'a href="' + s.href + '"' : 'button type="button" data-act="' + s.act + '" data-id="' + esc(s.id || "") + '"';
      return '<div class="cbslide" role="group" aria-roledescription="slide" aria-label="' + (i + 1) + " of " + L.length + ": " + esc(s.eye) + '" data-k="' + s.k + '" style="--cb:' + s.c + '"' + (i === CB.i ? "" : " hidden inert") + '><' + tag + ' class="cbcard"><span class="cbeye">' + esc(s.eye) + '</span><span class="cbt">' + esc(s.t) + '</span><span class="cbwhere">' + esc(s.where) + "</span>" +
        (s.pct != null ? '<span class="cbbar" role="img" aria-label="Progress ' + s.pct + '%"><i style="width:' + s.pct + '%"></i></span>' : "") + '<span class="cbfoot"><span>' + (s.pctL ? esc(s.pctL) + " · " : "") + "≈ " + s.min + ' min</span><span class="cbgo">' + s.go + " ›</span></span></" + (s.href ? "a" : "button") + "></div>"; };
    return '<div class="cbwrap"><section class="cbanner" id="cbanner" aria-roledescription="carousel" aria-label="Continue where you left off"><div class="cbslides" id="cbslides" aria-live="off">' + L.map(slide).join("") + "</div>" +
      (L.length > 1 ? '<div class="cbctl"><button type="button" class="cbbtn" data-cb="prev" aria-label="Previous">‹</button><div class="cbdots" role="group" aria-label="Choose a slide">' + L.map((s, i) => '<button type="button" class="cbdot" data-cb="go" data-i="' + i + '" aria-label="Slide ' + (i + 1) + ": " + esc(s.eye) + '" aria-current="' + (i === CB.i) + '"></button>').join("") + '</div><button type="button" class="cbbtn" data-cb="pause" aria-label="Pause the slides" aria-pressed="false">❚❚</button><button type="button" class="cbbtn" data-cb="next" aria-label="Next">›</button></div>' : "") +
      "</section>" + cbSched() + "</div>";
  }
  const cbReduced = () => { try { return matchMedia("(prefers-reduced-motion: reduce)").matches; } catch (e) { return false; } };
  function cbShow(i, byUser) {
    const box = document.getElementById("cbslides"); if (!box) return; const sl = [...box.children]; if (!sl.length) return;
    CB.i = (i + sl.length) % sl.length;
    sl.forEach((el, k) => { const on = k === CB.i; if (on) { el.hidden = false; el.removeAttribute("inert"); if (!cbReduced()) { el.classList.remove("cbin"); void el.offsetWidth; el.classList.add("cbin"); } } else { el.hidden = true; el.setAttribute("inert", ""); } });
    document.querySelectorAll("#cbanner .cbdot").forEach((d, k) => d.setAttribute("aria-current", k === CB.i));
    box.setAttribute("aria-live", byUser ? "polite" : "off"); // announce only what the learner asked for
  }
  function cbStop() { clearInterval(CB.t); CB.t = null; }
  function cbMount() {
    cbStop(); const ban = document.getElementById("cbanner"); if (!ban || CB.n < 2) return;
    if (!cbReduced()) CB.t = setInterval(() => { if (!document.getElementById("cbanner")) return cbStop(); if (CB.paused || CB.user || Date.now() < CB.hold || document.hidden) return; cbShow(CB.i + 1, false); }, 7000);
    else { const pb = ban.querySelector('[data-cb="pause"]'); if (pb) pb.hidden = true; } // reduced motion: no automatic rotation
    // pause while the learner is reading, pointing, touching or has focus inside; never move focus
    const hold = (ms) => () => { CB.hold = Date.now() + ms; };
    ban.addEventListener("pointerenter", () => (CB.paused = true)); ban.addEventListener("pointerleave", () => { CB.paused = false; CB.hold = Date.now() + 2500; });
    ban.addEventListener("pointerdown", hold(8000)); // a tap in progress keeps its slide: the destination can't change under the finger
    ban.addEventListener("focusin", () => (CB.paused = true)); ban.addEventListener("focusout", () => { CB.paused = false; CB.hold = Date.now() + 2500; });
    let x0 = null, y0 = null;
    ban.addEventListener("touchstart", (e) => { x0 = e.touches[0].clientX; y0 = e.touches[0].clientY; CB.hold = Date.now() + 8000; }, { passive: true });
    ban.addEventListener("touchend", (e) => { if (x0 == null) return; const dx = e.changedTouches[0].clientX - x0, dy = e.changedTouches[0].clientY - y0; x0 = null; if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.5) { CB.swiped = Date.now(); cbShow(CB.i + (dx < 0 ? 1 : -1), true); CB.hold = Date.now() + 15000; } });
    ban.addEventListener("click", (e) => { if (CB.swiped && Date.now() - CB.swiped < 400 && e.target.closest(".cbcard")) { e.preventDefault(); e.stopPropagation(); } }, true); // a swipe is not a tap
  }
  document.addEventListener("click", (e) => {
    const b = e.target.closest && e.target.closest("[data-cb]"); if (!b) return; const a = b.dataset.cb;
    if (a === "next") cbShow(CB.i + 1, true); else if (a === "prev") cbShow(CB.i - 1, true); else if (a === "go") cbShow(+b.dataset.i, true);
    else if (a === "pause") { CB.user = !CB.user; b.setAttribute("aria-pressed", CB.user); b.setAttribute("aria-label", CB.user ? "Play the slides" : "Pause the slides"); b.textContent = CB.user ? "▶" : "❚❚"; }
    CB.hold = Date.now() + 15000;
  });
  window.addEventListener("hashchange", () => { if (!/^#(inicio)?$/.test(location.hash)) cbStop(); });

  // ---- M3: Next video ----
  function vOrder() { // the same order as the Videos list: my videos, then music, then the other sections
    const hid = vHid(), bad = vBad(), F = (S.vf = S.vf || { c: "", l: "" }), lvOk = (v) => !F.l || (v.lvl || "").toUpperCase().startsWith(F.l);
    const lib = VID_START.filter((v) => !hid[v.yt] && !bad[v.yt] && lvOk(v)), mine = vMine().filter((v) => !bad[v.yt]);
    const order = VCATS.filter((x) => x[0] === "musica").concat(VCATS.filter((x) => x[0] !== "musica"));
    if (F.c === "mine") return mine; if (F.c) return lib.filter((v) => v.cat === F.c);
    return mine.concat(...order.map(([c]) => lib.filter((v) => v.cat === c)));
  }
  function vNextOf(id) { const L = vOrder(), i = L.findIndex((v) => v.yt === id); return i >= 0 && i + 1 < L.length ? L[i + 1] : null; }
  function vNextHTML(id) { const nx = vNextOf(id); return '<div class="vnextbar"><button class="btn small vnext" data-act="v-next" data-id="' + (nx ? nx.yt : "") + '"' + (nx ? ' aria-label="Next video: ' + esc(nx.t) + '"' : ' disabled aria-label="This is the last video in the list"') + ">" + (nx ? "Next video ›" : "Last video in the list") + "</button>" + (nx ? '<span class="small muted vnextt">' + esc(nx.t) + "</span>" : "") + "</div>"; }
  const VNX = { busy: 0 };
  function vNextGo(btn) {
    if (VNX.busy && Date.now() - VNX.busy < 2500) return; const to = btn.dataset.id; if (!to) return;
    VNX.busy = Date.now(); btn.disabled = true; btn.setAttribute("aria-busy", "true");
    try { const d = vData(VP.id); const t = Math.floor(vpT() || 0); if (t > 0) d.at = t; save(); } catch (e) {} // keep the place; a skipped video is not marked watched
    S.vAuto = { id: to, t: Date.now() }; save();
    location.hash = "#video-" + to;
  }
  function vAutoStart(id) { // called when the new player is ready: start about 0.5 s later and check it really plays
    const A = S.vAuto; if (!A || A.id !== id || Date.now() - A.t > 15000) return; delete S.vAuto; save();
    setTimeout(() => { if (VP.id !== id || !VP.p) return; try { VP.p.playVideo(); } catch (e) {}
      setTimeout(() => { if (VP.id !== id) return; let st = -1; try { st = VP.p.getPlayerState(); } catch (e) {}
        VP.autoOk = st === 1 || st === 3; try { pvLog("next-video autoplay " + (VP.autoOk ? "started" : "blocked (state " + st + ")")); } catch (e) {}
        if (!VP.autoOk) { const f = document.querySelector(".vframe"); if (f && !document.getElementById("vtapplay")) f.insertAdjacentHTML("beforeend", '<button class="vtapplay" id="vtapplay" data-act="v-tapplay"><span aria-hidden="true">▶</span> Tap to play<small>Your browser didn\'t let the video start by itself.</small></button>'); } }, 1600); }, 500);
  }
  document.addEventListener("click", (e) => {
    const t = e.target.closest && e.target.closest('[data-act="v-next"],[data-act="v-tapplay"]'); if (!t) return;
    if (t.dataset.act === "v-next") vNextGo(t); else { try { VP.p.playVideo(); } catch (x) {} t.remove(); }
  });
  window.__cb = { slides: cbSlides, show: cbShow, state: CB, nextOf: vNextOf, order: vOrder };
  /* ==/HOMEBANNER== */
