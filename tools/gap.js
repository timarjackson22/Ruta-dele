  /* ===================== closing the gap with Duolingo ===================== */
  const qDay = () => { S.qd = S.qd || {}; const k = dayKey(); if (!S.qd[k]) { S.qd[k] = {}; const ks = Object.keys(S.qd).sort(); while (ks.length > 40) delete S.qd[ks.shift()]; } return S.qd[k]; };
  function qBump(k, n) { const d = qDay(); d[k] = (d[k] || 0) + (n || 1); S.tot = S.tot || {}; S.tot[k] = (S.tot[k] || 0) + (n || 1); save(); try { qCheck(); } catch (e) {} }
  const localDate = (d) => dayKey(d);

  /* ---------- streak freezes ---------- */
  const frzSet = () => new Set(S.frzDays || []);
  function frzCheck() { // a missed day (or two) is covered by a freeze, automatically
    const A = S.act || {}, F = frzSet(), d = new Date(); d.setDate(d.getDate() - 1);
    const ok = (x) => (A[dayKey(x)] || 0) >= 5 || F.has(dayKey(x));
    const miss = []; while (!ok(d) && miss.length <= (S.frz || 0) && miss.length < 3) { miss.push(dayKey(d)); d.setDate(d.getDate() - 1); }
    if (miss.length && miss.length <= (S.frz || 0) && ok(d)) {
      S.frzDays = (S.frzDays || []).concat(miss).slice(-60); S.frz -= miss.length; save(); if (!location.hash || location.hash === "#" || location.hash === "#progreso") try { route(); } catch (e) {}
      setTimeout(() => { try { coachToast("🧊 " + (miss.length === 1 ? "A streak freeze" : miss.length + " streak freezes") + " kept your streak alive. " + (S.frz ? S.frz + " left." : "Earn more by finishing your daily quests.")); } catch (e) {} }, 1500);
    }
  }
  /* ---------- daily quests and badges ---------- */
  function quests() {
    const d = qDay(), g = S.goal || 20, v = (S.act || {})[dayKey()] || 0, wd = new Date().getDay();
    const third = [["drills", 1, "🧩", "Finish a quick drill"], ["listen", 1, "🎧", "Listen to a text to the end"], ["px", 1, "✅", "Finish a practice set"]][wd % 3];
    return [{ id: "goal", ic: "🎯", t: "Reach your daily goal", n: v, of: g }, { id: "cards", ic: "🗂️", t: "Review 15 flashcards", n: d.cards || 0, of: 15 }, { id: third[0], ic: third[2], t: third[3], n: d[third[0]] || 0, of: third[1] }];
  }
  function qCheck() {
    const Q = quests(), d = qDay();
    if (!d.qdone && Q.every((q) => q.n >= q.of)) { d.qdone = 1; S.tot = S.tot || {}; S.tot.qall = (S.tot.qall || 0) + 1; const had = S.frz || 0; S.frz = Math.min(2, had + 1); save(); try { coachToast("🏆 All daily quests done!" + (S.frz > had ? " You earned a streak freeze 🧊" : "")); } catch (e) {} }
    const st = streak(); if (st > (S.bestSt || 0)) { S.bestSt = st; save(); } if (st && st % 7 === 0 && S.frzM !== st && (S.act || {})[dayKey()] >= 5) { S.frzM = st; if ((S.frz || 0) < 2) { S.frz = (S.frz || 0) + 1; setTimeout(() => { try { coachToast("🧊 " + st + "-day streak! You earned a streak freeze."); } catch (e) {} }, 2200); } save(); }
    const got = new Set(S.badges || []), now = BADGES.filter((b) => b.ok());
    now.forEach((b) => { if (!got.has(b.id)) { got.add(b.id); setTimeout(() => { try { coachToast(b.ic + " Badge: " + b.t); } catch (e) {} }, 900); } });
    if (got.size !== (S.badges || []).length) { S.badges = [...got]; save(); }
  }
  const learned = () => { try { return Object.values(SRD.c).filter((k) => k.s === 2).length; } catch (e) { return 0; } };
  const examsDone = () => Object.values(S.ex || {}).reduce((n, r) => n + Object.keys(r).length, 0);
  const examPass = () => Object.keys(S.ex || {}).some((k) => { const [lv, n] = k.split("-"); try { return exTotals(lv, +n).pass; } catch (e) { return false; } });
  const qTot = (k) => (S.tot || {})[k] || 0;
  const BADGES = [
    { id: "st3", ic: "🔥", t: "3-day streak", s: "Practise 3 days in a row", ok: () => (S.bestSt || 0) >= 3 }, { id: "st7", ic: "🔥", t: "Week streak", s: "7 days in a row", ok: () => (S.bestSt || 0) >= 7 },
    { id: "st30", ic: "🌋", t: "Month streak", s: "30 days in a row", ok: () => (S.bestSt || 0) >= 30 }, { id: "st100", ic: "💯", t: "100-day streak", s: "100 days in a row", ok: () => (S.bestSt || 0) >= 100 },
    { id: "w50", ic: "🌱", t: "50 words", s: "50 flashcards learned", ok: () => learned() >= 50 }, { id: "w250", ic: "🌿", t: "250 words", s: "250 flashcards learned", ok: () => learned() >= 250 },
    { id: "w1000", ic: "🌳", t: "1,000 words", s: "1,000 flashcards learned", ok: () => learned() >= 1000 }, { id: "w2500", ic: "🏔️", t: "2,500 words", s: "2,500 flashcards learned", ok: () => learned() >= 2500 },
    { id: "dr1", ic: "🧩", t: "First drill", s: "Finish a quick drill", ok: () => qTot("drills") >= 1 }, { id: "dr25", ic: "🧠", t: "Drill master", s: "25 drills", ok: () => qTot("drills") >= 25 },
    { id: "perf", ic: "⭐", t: "Perfect drill", s: "A drill with no mistakes", ok: () => qTot("perfect") >= 1 }, { id: "ls10", ic: "🎧", t: "Good listener", s: "10 texts listened to the end", ok: () => qTot("listen") >= 10 },
    { id: "q7", ic: "🏆", t: "Quest week", s: "All daily quests on 7 days", ok: () => qTot("qall") >= 7 }, { id: "hoy5", ic: "☀️", t: "Daily habit", s: "5 complete daily sessions", ok: () => qTot("hoy") >= 5 },
    { id: "ex1", ic: "📝", t: "Exam started", s: "Finish any DELE exam paper", ok: () => examsDone() >= 1 }, { id: "apto", ic: "🎓", t: "¡Apto!", s: "Pass a full DELE practice exam", ok: () => examPass() },
    { id: "deck", ic: "📚", t: "Deck builder", s: "Make your own deck", ok: () => ((SRD && SRD.decks) || []).length >= 1 }, { id: "bk", ic: "💾", t: "Safe and sound", s: "Back up your progress", ok: () => !!(UI && UI.lastBackup) },
  ];
  // count what happens
  document.addEventListener("click", (e) => { const t = e.target.closest && e.target.closest('[data-act="sr-rate"]'); if (t) setTimeout(() => qBump("cards"), 0); }, true);

  /* ---------- backup and restore ---------- */
  async function bkCollect() {
    const ls = {}; for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (/^(ruta|ra-|rd-)/.test(k)) ls[k] = localStorage.getItem(k); }
    let docs = []; try { docs = (await myAll()).map(plainDoc); } catch (e) {}
    return { app: "ruta-dele", v: 1, date: new Date().toISOString(), build: window.__BUILD || "", ls, docs };
  }
  async function bkSave() {
    const out = document.getElementById("bk-res"); if (out) out.textContent = "Preparing…";
    const B = await bkCollect(), txt = JSON.stringify(B), name = "ruta-dele-backup-" + dayKey() + ".json";
    UI.lastBackup = Date.now(); uiSave(); try { localStorage.setItem("ruta-ui", JSON.stringify(UI)); } catch (e) {}
    const kb = Math.round(txt.length / 1024);
    if (window.AndroidApp && AndroidApp.saveText) { const r = AndroidApp.saveText(name, txt); if (out) out.innerHTML = /^ERR/.test(r) ? "✗ Couldn’t save: " + esc(r.slice(4)) : "✓ Saved to <b>" + esc(r) + "</b> (" + kb + " KB). Keep a copy somewhere safe, like Google Drive or email."; qCheck(); return; }
    const file = new File([txt], name, { type: "application/json" });
    if (navigator.canShare && navigator.canShare({ files: [file] }) && /iPhone|iPad|Android/.test(navigator.userAgent)) {
      try { await navigator.share({ files: [file], title: name }); if (out) out.textContent = "✓ Backup ready (" + kb + " KB). Choose “Save to Files”, Drive or email."; qCheck(); return; } catch (e) { if (e && e.name === "AbortError") { if (out) out.textContent = "Cancelled."; return; } }
    }
    const a = document.createElement("a"); a.href = URL.createObjectURL(file); a.download = name; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 2000);
    if (out) out.textContent = "✓ Downloaded " + name + " (" + kb + " KB)."; qCheck();
  }
  async function bkRestore(file) {
    const out = document.getElementById("bk-res");
    try {
      const B = JSON.parse(await file.text());
      if (!B || B.app !== "ruta-dele" || !B.ls) throw new Error("This isn’t a Ruta DELE backup file.");
      Object.keys(B.ls).forEach((k) => { if (/^(ruta|ra-|rd-)/.test(k)) localStorage.setItem(k, B.ls[k]); });
      for (const d of B.docs || []) { try { await myPut(d); } catch (e) {} }
      if (out) out.textContent = "✓ Restored from " + new Date(B.date).toLocaleString() + ". Reloading…";
      setTimeout(() => location.reload(), 900);
    } catch (e) { if (out) out.textContent = "✗ " + (e.message || "Couldn’t read that file."); }
  }
  const bkAgo = () => { const t = UI.lastBackup; if (!t) return "Never backed up"; const d = Math.floor((Date.now() - t) / 864e5); return "Last backup: " + (d === 0 ? "today" : d === 1 ? "yesterday" : d + " days ago"); };

  /* ---------- daily reminder ---------- */
  const IS_APP = () => !!(window.AndroidApp && AndroidApp.setReminder);
  const remText = () => { const st = streak(); return st ? "🔥 Keep your " + st + "-day streak going: 10 minutes of Spanish today." : "10 minutos de español hoy. Your plan for today is ready."; };
  function remApply() {
    const R = UI.rem || {}; if (!IS_APP()) return;
    try { if (R.on) AndroidApp.setReminder(R.h != null ? R.h : 19, R.m || 0, "Ruta DELE", remText()); else AndroidApp.cancelReminder(); } catch (e) {}
  }
  function remICS() { // the web version can't wake itself up: a daily event in the phone's own calendar can
    const R = UI.rem || { h: 19, m: 0 }, d = new Date(), p = (n) => String(n).padStart(2, "0");
    const st = d.getFullYear() + p(d.getMonth() + 1) + p(d.getDate()) + "T" + p(R.h) + p(R.m) + "00";
    const url = location.origin + location.pathname + "#hoy";
    const ics = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Ruta DELE//ES", "BEGIN:VEVENT", "UID:ruta-dele-daily@" + location.host, "DTSTAMP:" + new Date().toISOString().replace(/[-:]/g, "").slice(0, 15) + "Z", "DTSTART:" + st, "DURATION:PT15M", "RRULE:FREQ=DAILY",
      "SUMMARY:🇪🇸 Spanish practice · Ruta DELE", "DESCRIPTION:Your daily session: " + url, "URL:" + url, "BEGIN:VALARM", "ACTION:DISPLAY", "DESCRIPTION:10 minutos de español", "TRIGGER:PT0M", "END:VALARM", "END:VEVENT", "END:VCALENDAR"].join("\r\n");
    const f = new File([ics], "ruta-dele-daily.ics", { type: "text/calendar" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(f); a.download = f.name; document.body.appendChild(a); a.click(); setTimeout(() => a.remove(), 2000);
  }
  // tell the Android reminder you've practised today, so it stays quiet
  { const _a = actAdd; actAdd = function (n) { _a(n); try { if (IS_APP() && ((S.act || {})[dayKey()] || 0) >= 5) AndroidApp.practised(localDate(), "🔥 Keep your " + streak() + "-day streak going tomorrow: 10 minutes of Spanish."); } catch (e) {} try { qCheck(); } catch (e) {} }; }

  function settingsExtra() {
    const R = UI.rem || {}, tm = String(R.h != null ? R.h : 19).padStart(2, "0") + ":" + String(R.m || 0).padStart(2, "0");
    return '<h2 class="ghead">Daily reminder</h2><div class="ilist pad">' +
      (IS_APP() ? '<label class="row small" style="margin:0"><input type="checkbox" id="rem-on"' + (R.on ? " checked" : "") + '> Remind me every day at <input type="time" id="rem-t" value="' + tm + '" class="remt"></label><p class="small muted" style="margin:6px 0 0">Only if you haven’t practised yet that day. Tapping it opens today’s session.</p>' +
        (window.AndroidApp.notificationsAllowed && !AndroidApp.notificationsAllowed() ? '<p class="small" style="color:#b23b30">Notifications are off for Ruta DELE: turn them on in Android Settings › Apps › Ruta DELE › Notifications.</p>' : "")
      : '<p class="small" style="margin:0">Add a daily reminder to your phone’s calendar at <input type="time" id="rem-t" value="' + tm + '" class="remt"></p><div class="row" style="margin-top:8px"><button class="btn small" data-act="rem-ics">📅 Add to my calendar</button></div><p class="small muted" style="margin:6px 0 0">The Android app can send real reminders; in the browser a calendar event is the reliable way.</p>') + "</div>" +
      '<h2 class="ghead">Backup</h2><div class="ilist pad"><p class="small" style="margin:0">Your progress is saved only on this device. Back it up to move to another phone or to be safe.</p><p class="small muted" style="margin:4px 0 0">' + bkAgo() + '</p><div class="row" style="margin-top:8px"><button class="btn small primary" data-act="bk-save">💾 Back up now</button><label class="btn small">📂 Restore from a file<input type="file" id="bk-file" accept=".json,application/json" hidden></label></div><p id="bk-res" class="small" style="margin:6px 0 0"></p></div>';
  }
  document.addEventListener("click", (e) => {
    const t = e.target.closest && e.target.closest("[data-act]"), a = t && t.dataset.act; if (!a) return;
    if (a === "bk-save") bkSave(); else if (a === "rem-ics") remICS();
  });
  document.addEventListener("change", (e) => {
    const el = e.target;
    if (el.id === "bk-file" && el.files && el.files[0]) bkRestore(el.files[0]);
    if (el.id === "rem-on" || el.id === "rem-t") { const tv = (document.getElementById("rem-t") || {}).value || "19:00", on = document.getElementById("rem-on"); UI.rem = { on: on ? on.checked : (UI.rem || {}).on, h: +tv.split(":")[0], m: +tv.split(":")[1] }; uiSave(); remApply(); try { coachToast(UI.rem.on || !IS_APP() ? "⏰ Reminder set for " + tv : "Reminder off"); } catch (x) {} }
  });

  /* ---------- Hoy: one session that builds itself ---------- */
  function hoyPlan() {
    const cl = curLevel(), d = qDay(), steps = [];
    let best = null; try { allDeckIds().forEach((id) => { const c = counts(id); const n = c.due + c.lrn; if (n && (!best || n > best[1])) best = [id, n]; }); } catch (e) {}
    steps.push({ id: "cards", ic: "🗂️", t: best ? "Review " + Math.min(10, best[1]) + " flashcards" : "Learn 10 new words", s: best ? deckName(best[0]) : "Your level’s deck", href: "#repaso-" + (best ? best[0] : cl), done: (d.cards || 0) - ((S.hoy || {}).b || {}).cards >= Math.min(10, best ? best[1] : 10) });
    steps.push({ id: "drill", ic: "🧩", t: "Quick drill", s: "Match, listen, build and say · 8 exercises", href: "#drill", done: (d.drills || 0) > (((S.hoy || {}).b || {}).drills || 0) });
    if ((S.mist || []).length) steps.push({ id: "mist", ic: "🩹", t: "Fix your mistakes", s: (S.mist || []).length + " saved", href: "#errores", done: (d.px || 0) > (((S.hoy || {}).b || {}).px || 0) && (S.hoy || {}).visit === "mist" });
    const last = S.last && LV[S.last.l] ? S.last : null;
    steps.push({ id: "unit", ic: "📘", t: last ? "Continue your course" : "Start your level", s: last ? LV[last.l].name + " · " + LV[last.l].units[last.i].t : LV[cl].name, href: last ? "#" + last.l + "-u" + (last.i + 1) : "#" + cl, done: (d.px || 0) > (((S.hoy || {}).b || {}).px || 0) && (S.hoy || {}).visit === "unit" });
    let tx = null; try { const heard = new Set(Object.keys(S.l || {}).filter((k) => S.l[k].heard)); tx = LISTEN.find((x) => x.lvl === cl && !heard.has(x.id) && x.cat !== "mine") || LISTEN.find((x) => x.lvl === cl); } catch (e) {}
    if (tx) steps.push({ id: "listen", ic: "🎧", t: "Listen", s: tx.t, href: "#" + tx.id, done: (d.listen || 0) > (((S.hoy || {}).b || {}).listen || 0) });
    return steps;
  }
  function hoyView() {
    document.body.classList.remove("no-tabs");
    const k = dayKey(); if (!S.hoy || S.hoy.d !== k) { const d = qDay(); S.hoy = { d: k, b: { cards: d.cards || 0, drills: d.drills || 0, px: d.px || 0, listen: d.listen || 0 } }; save(); }
    const P = hoyPlan(), n = P.filter((x) => x.done).length, all = n === P.length;
    if (all && !S.hoy.fin) { S.hoy.fin = 1; qBump("hoy"); }
    const Q = quests();
    app.innerHTML = '<div class="stack hoy"><div><p class="eyebrow">' + new Date().toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long" }) + '</p><h1>Hoy · Today’s session</h1><p class="lead2">' + (all ? "🎉 ¡Hecho! Everything done for today." : "About 15 minutes. Do the steps in order; each one comes back here.") + "</p></div>" +
      '<div class="hoybar"><i style="width:' + Math.round((100 * n) / P.length) + '%"></i></div>' +
      '<ol class="hoysteps">' + P.map((x, i) => '<li class="' + (x.done ? "done" : "") + '"><a href="' + x.href + '" data-hoy="' + x.id + '"><span class="hs-ic" aria-hidden="true">' + (x.done ? "✓" : x.ic) + '</span><span class="ext"><b>' + esc(x.t) + "</b><small>" + esc(x.s) + "</small></span>" + (x.done ? "" : '<span class="exgo">' + (P.findIndex((y) => !y.done) === i ? "Start ›" : "›") + "</span>") + "</a></li>").join("") + "</ol>" +
      '<section class="block"><div class="shead"><h2>Daily quests</h2><a class="small" href="#progreso">Progress ›</a></div>' + questsHTML(Q) + "</section></div>";
  }
  function questsHTML(Q) { return '<ul class="quests">' + Q.map((q) => '<li class="' + (q.n >= q.of ? "ok" : "") + '"><span aria-hidden="true">' + q.ic + '</span><span class="ext"><b>' + q.t + '</b><span class="qbar"><i style="width:' + Math.min(100, Math.round((100 * q.n) / q.of)) + '%"></i></span></span><small>' + Math.min(q.n, q.of) + "/" + q.of + "</small></li>").join("") + '</ul><p class="small muted" style="margin:6px 0 0">Finish all three to earn a streak freeze 🧊 (you have ' + (S.frz || 0) + "/2).</p>"; }
  // remember which step you went to; a pill brings you back
  document.addEventListener("click", (e) => { const a = e.target.closest && e.target.closest("[data-hoy]"); if (a && S.hoy) { S.hoy.visit = a.dataset.hoy; save(); try { sessionStorage.setItem("rd-hoy", "1"); } catch (x) {} } });
  function hoyPill() {
    let on = false; try { on = sessionStorage.getItem("rd-hoy") === "1"; } catch (e) {}
    const h = location.hash.slice(1); let p = document.getElementById("hoypill");
    if (!on || h === "hoy" || h === "") { if (p) p.remove(); return; }
    if (!p) { p = document.createElement("a"); p.id = "hoypill"; p.href = "#hoy"; document.body.appendChild(p); }
    const P = hoyPlan(); p.innerHTML = "‹ Today’s session · " + P.filter((x) => x.done).length + "/" + P.length;
  }
  addEventListener("hashchange", () => setTimeout(hoyPill, 50));

  /* ---------- quick drill: new exercise types ---------- */
  let QDR = null;
  const dNorm = (s) => String(s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[¿?¡!.,;:«»"“”()…\-–—]/g, " ").replace(/\s+/g, " ").trim();
  const dNormA = (s) => String(s).toLowerCase().replace(/[¿?¡!.,;:«»"“”()…\-–—]/g, " ").replace(/\s+/g, " ").trim();
  const shuf = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  function qdPools() {
    const cl = curLevel(), L = LV[cl], words = [], sents = [];
    try { L.units.forEach((u) => (u.v || []).forEach((g) => (g.w || []).forEach((w) => { if (w[0] && w[1] && w[0].length < 26 && !/[\/…\d(]|___/.test(w[0]) && w[1].length < 34) words.push([w[0], String(w[1]).split(/[;,]/)[0].trim()]); }))); } catch (e) {}
    try { (SRD && SRD.decks || []).forEach((D) => D.w.forEach((m) => m.en && words.push([m.es, m.en]))); } catch (e) {}
    const lv = { a1: ["a1"], a2: ["a1", "a2"], b1: ["a2", "b1"], b2: ["b1", "b2"], c1: ["b2", "c1"], c2: ["c1", "c2"] }[cl] || ["a1"];
    try { LISTEN.forEach((x) => { if (!lv.includes(x.lvl) || x.cat === "mine") return; x.paras.forEach((p) => p.s.forEach((s) => { const n = s[0].split(/\s+/).length; if (s[1] && n >= 3 && n <= (cl === "a1" ? 7 : 10) && !/[«»"“”:;()\d—–]/.test(s[0]) && /[.!?]$/.test(s[0])) sents.push([s[0], s[1]]); })); }); } catch (e) {}
    return { words: shuf(words), sents: shuf(sents) };
  }
  function qdStart() {
    const P = qdPools(); if (P.words.length < 8 || P.sents.length < 4) { app.innerHTML = '<div class="stack"><h1>Quick drill</h1><p>Not enough material at your level yet.</p></div>'; return; }
    const w = P.words, s = P.sents, ex = [];
    ex.push({ t: "match", pairs: w.slice(0, 5) });
    ex.push({ t: "hear", w: w[5], opts: shuf([w[5][1], w[6][1], w[7][1], (w[8] || w[0])[1]]) });
    ex.push({ t: "build", s: s[0], extra: shuf(s[3][0].replace(/[.!?¿¡,]/g, "").toLowerCase().split(/\s+/)).slice(0, 2) });
    ex.push({ t: "dict", s: s[1] });
    ex.push(CAN_MIC ? { t: "say", s: s[2] } : { t: "build", s: s[2], extra: shuf(s[0][0].replace(/[.!?¿¡,]/g, "").toLowerCase().split(/\s+/)).slice(0, 2) });
    ex.push({ t: "build", s: s[3], extra: shuf(s[1][0].replace(/[.!?¿¡,]/g, "").toLowerCase().split(/\s+/)).slice(0, 2) });
    ex.push({ t: "dict", s: s[4] || s[0] });
    ex.push({ t: "match", pairs: w.slice(9, 14).length === 5 ? w.slice(9, 14) : w.slice(0, 5) });
    QDR = { ex, i: 0, ok: 0, miss: 0, state: {} }; qdRender();
  }
  function qdRender() {
    document.body.classList.add("no-tabs");
    if (!QDR) { qdStart(); return; }
    if (QDR.i >= QDR.ex.length) { // the end
      const perfect = QDR.miss === 0; if (!QDR.fin) { QDR.fin = 1; qBump("drills"); if (perfect) qBump("perfect"); actAdd(QDR.ok); }
      app.innerHTML = '<div class="stack drill"><div class="drend"><p class="dr-big">' + (perfect ? "⭐" : "🎉") + '</p><h1>' + (perfect ? "¡Perfecto!" : "¡Bien hecho!") + "</h1><p class=\"lead2\">" + QDR.ok + " of " + QDR.ex.length + " right first time · +" + QDR.ok + ' points</p><div class="row" style="justify-content:center"><a class="btn primary" href="#hoy">Today’s session</a><button class="btn" data-act="dr-again">Another drill</button></div></div></div>';
      return;
    }
    const e = QDR.ex[QDR.i], st = QDR.state, top = '<div class="drtop"><a class="btn small" href="#hoy" aria-label="Close">✕</a><span class="drprog"><i style="width:' + Math.round((100 * QDR.i) / QDR.ex.length) + '%"></i></span></div>';
    let body = "";
    if (e.t === "match") {
      st.left = st.left || shuf(e.pairs.map((p, i) => i)); st.right = st.right || shuf(e.pairs.map((p, i) => i)); st.done = st.done || [];
      body = '<h2 class="drq">Tap the matching pairs</h2><div class="drmatch"><div>' + st.left.map((i) => '<button class="drtile" data-act="dr-m" data-side="l" data-i="' + i + '"' + (st.done.includes(i) ? " disabled" : "") + (st.sel === "l" + i ? ' aria-pressed="true"' : "") + ">" + esc(e.pairs[i][0]) + "</button>").join("") + "</div><div>" +
        st.right.map((i) => '<button class="drtile" data-act="dr-m" data-side="r" data-i="' + i + '"' + (st.done.includes(i) ? " disabled" : "") + (st.sel === "r" + i ? ' aria-pressed="true"' : "") + ">" + esc(e.pairs[i][1]) + "</button>").join("") + "</div></div>";
    } else if (e.t === "hear") {
      body = '<h2 class="drq">What does this word mean?</h2><button class="drplay" data-act="dr-play" data-t="' + esc(e.w[0]) + '" aria-label="Play">🔊</button><div class="exopts">' + e.opts.map((o) => '<button class="exopt" data-act="dr-pick" data-v="' + esc(o) + '"' + (st.res ? " disabled" : "") + (st.res && o === e.w[1] ? ' style="border-color:var(--good,#2a9d6b)"' : "") + ">" + esc(o) + "</button>").join("") + "</div>";
    } else if (e.t === "build") {
      const toks = e.s[0].replace(/[¿¡]/g, "").split(/\s+/); st.pool = st.pool || shuf(toks.concat(e.extra || []).map((x, i) => ({ x: x.replace(/[.!?,]$/, ""), i }))); st.pick = st.pick || [];
      body = '<h2 class="drq">Write this in Spanish</h2><p class="dren">“' + esc(e.s[1]) + '”</p><div class="drline">' + st.pick.map((k) => '<button class="drtile on" data-act="dr-un" data-k="' + k + '">' + esc(st.pool[k].x) + "</button>").join("") + '</div><div class="drbank">' + st.pool.map((p, k) => '<button class="drtile" data-act="dr-b" data-k="' + k + '"' + (st.pick.includes(k) ? " disabled" : "") + ">" + esc(p.x) + "</button>").join("") + "</div>";
    } else if (e.t === "dict") {
      body = '<h2 class="drq">Type what you hear</h2><button class="drplay" data-act="dr-play" data-t="' + esc(e.s[0]) + '" aria-label="Play">🔊</button><button class="btn small" data-act="dr-play" data-t="' + esc(e.s[0]) + '" data-slow="1">🐢 Slower</button><textarea id="dr-in" class="extxt" rows="2" placeholder="Escribe en español…" autocapitalize="sentences"' + (st.res ? " disabled" : "") + ">" + esc(st.val || "") + "</textarea>";
    } else if (e.t === "say") {
      body = '<h2 class="drq">Say this sentence</h2><p class="drsay" lang="es">' + esc(e.s[0]) + '</p><p class="dren">“' + esc(e.s[1]) + '”</p><div class="row" style="justify-content:center"><button class="drplay sm" data-act="dr-play" data-t="' + esc(e.s[0]) + '" aria-label="Listen first">🔊</button><button class="btn primary" data-act="dr-mic"' + (st.res ? " disabled" : "") + ">" + (st.rec ? "Listening…" : "🎙️ Speak") + '</button></div><p class="small muted" id="dr-heard" style="text-align:center">' + (st.heard ? "I heard: «" + esc(st.heard) + "»" : "") + "</p>";
    }
    const fb = st.res ? '<div class="drfb ' + (st.res === "ok" ? "ok" : "no") + '"><b>' + (st.res === "ok" ? ["¡Muy bien!", "¡Correcto!", "¡Perfecto!", "¡Eso es!"][QDR.i % 4] : "Casi…") + "</b>" + (st.note ? "<p>" + st.note + "</p>" : "") + '<button class="btn primary" data-act="dr-next">Continue</button></div>' : (e.t === "match" ? "" : '<div class="drfoot"><button class="btn" data-act="dr-skip">Skip</button><button class="btn primary" data-act="dr-check"' + (e.t === "say" ? " hidden" : "") + ">Check</button></div>");
    app.innerHTML = '<div class="stack drill">' + top + '<div class="drbody">' + body + "</div>" + fb + "</div>";
    if ((e.t === "hear" || e.t === "dict") && !st.played) { st.played = 1; setTimeout(() => sayText(e.t === "hear" ? e.w[0] : e.s[0]), 300); }
  }
  function qdResult(ok, note) { const st = QDR.state; if (st.res) return; st.res = ok ? "ok" : "no"; st.note = note || ""; if (ok && !st.missed) QDR.ok++; else QDR.miss++; if (ok) try { sayText(QDR.ex[QDR.i].t === "hear" ? "" : ""); } catch (e) {} qdRender(); }
  function qdCheck() {
    const e = QDR.ex[QDR.i], st = QDR.state;
    if (e.t === "build") { const got = st.pick.map((k) => st.pool[k].x).join(" "), want = e.s[0]; qdResult(dNorm(got) === dNorm(want), dNorm(got) === dNorm(want) ? "" : "Correct: <b>" + esc(want) + "</b>"); }
    else if (e.t === "dict") { const v = (document.getElementById("dr-in") || {}).value || ""; st.val = v; const a = dNormA(v), b = dNormA(e.s[0]); const ok = a === b || dNorm(v) === dNorm(e.s[0]);
      qdResult(ok, a === b ? "" : ok ? "Watch the accents: <b>" + esc(e.s[0]) + "</b>" : "It was: <b>" + esc(e.s[0]) + "</b> · " + esc(e.s[1])); }
  }
  function qdMic() {
    const e = QDR.ex[QDR.i], st = QDR.state; if (st.rec) return;
    const go = () => { const r = new SR(); r.lang = sttLang(); r.continuous = false; r.interimResults = false; st.rec = 1; qdRender();
      r.onresult = (ev) => { st.heard = ev.results[0][0].transcript; };
      r.onerror = () => {}; r.onend = () => { st.rec = 0; if (!st.heard) { qdRender(); return; } const sc = pcScore(st.heard, e.s[0]); qdResult(sc >= 0.72, sc >= 0.72 ? "" : "Try to say every word clearly. Tap 🔊 to hear it again."); };
      try { r.start(); } catch (x) { st.rec = 0; } };
    if (IS_IOS && !MIC_OK) micAsk().then((ok) => ok && go()); else go();
  }
  document.addEventListener("click", (ev) => {
    const t = ev.target.closest && ev.target.closest("[data-act]"), a = t && t.dataset.act; if (!a || !/^dr-/.test(a)) return;
    if (a === "dr-again") { QDR = null; qdStart(); return; }
    if (!QDR) return; const e = QDR.ex[QDR.i], st = QDR.state;
    if (a === "dr-play") { try { speechSynthesis.cancel(); speechSynthesis.speak(utter(t.dataset.t, "es", t.dataset.slow ? 0.6 : Math.min(PL.rate, 0.85))); } catch (x) {} return; }
    if (a === "dr-next") { QDR.i++; QDR.state = {}; qdRender(); scrollTo(0, 0); return; }
    if (a === "dr-skip") { st.missed = 1; qdResult(false, e.t === "build" || e.t === "dict" ? "It was: <b>" + esc(e.s[0]) + "</b>" : ""); return; }
    if (a === "dr-check") { qdCheck(); return; }
    if (a === "dr-mic") { qdMic(); return; }
    if (a === "dr-pick") { const ok = t.dataset.v === e.w[1]; qdResult(ok, ok ? "<b>" + esc(e.w[0]) + "</b> · " + esc(e.w[1]) : "<b>" + esc(e.w[0]) + "</b> means <b>" + esc(e.w[1]) + "</b>"); return; }
    if (a === "dr-b") { st.pick.push(+t.dataset.k); qdRender(); return; }
    if (a === "dr-un") { st.pick = st.pick.filter((k) => k !== +t.dataset.k); qdRender(); return; }
    if (a === "dr-m") { const id = t.dataset.side + t.dataset.i;
      if (!st.sel || st.sel[0] === t.dataset.side) { st.sel = id; if (t.dataset.side === "l") try { sayText(e.pairs[+t.dataset.i][0]); } catch (x) {} qdRender(); return; }
      const li = +(st.sel[0] === "l" ? st.sel.slice(1) : t.dataset.i), ri = +(st.sel[0] === "r" ? st.sel.slice(1) : t.dataset.i);
      if (li === ri) { st.done.push(li); st.sel = null; if (st.done.length === e.pairs.length) { qdResult(!st.missed, ""); return; } }
      else { st.missed = 1; st.sel = null; const b = document.querySelectorAll(".drtile"); b.forEach((x) => x.classList.add("shake")); setTimeout(() => qdRender(), 350); return; }
      qdRender(); }
  });

  /* ---------- progress page ---------- */
  function progView() {
    qCheck();
    const A = S.act || {}, F = frzSet(), st = streak(), days = [];
    const d = new Date(); d.setDate(d.getDate() - 34); for (let i = 0; i < 35; i++) { const k = dayKey(d); days.push([k, A[k] || 0, F.has(k), d.getDate()]); d.setDate(d.getDate() + 1); }
    const g = S.goal || 20, cal = '<div class="pcal">' + days.map(([k, v, f, n]) => '<span title="' + k + ": " + v + ' points" class="' + (f ? "frz" : v >= g ? "l3" : v >= 5 ? "l2" : v ? "l1" : "") + '">' + n + "</span>").join("") + "</div>";
    const wk = []; for (let w = 7; w >= 0; w--) { let s = 0; const e = new Date(); e.setDate(e.getDate() - w * 7); for (let i = 0; i < 7; i++) { s += A[dayKey(e)] || 0; e.setDate(e.getDate() - 1); } wk.push(s); }
    const mx = Math.max(10, ...wk), bars = '<div class="pbars">' + wk.map((v, i) => '<div><i style="height:' + Math.round((100 * v) / mx) + '%"></i><small>' + (i === 7 ? "now" : "−" + (7 - i) + "w") + "</small></div>").join("") + "</div>";
    let lrn = 0, rev = 0, nw = 0; try { Object.values(SRD.c).forEach((k) => { if (k.s === 2) rev++; else lrn++; }); } catch (e) {}
    const skills = ["lectura", "auditiva", "escritura", "oral"].map((k) => { const v = []; Object.entries(S.ex || {}).forEach(([key, R]) => { if (R[k]) v.push([R[k].d || 0, R[k].sc]); }); v.sort((a, b) => a[0] - b[0]); const last = v.slice(-3).map((x) => x[1]);
      return [k, last.length ? last.reduce((a, b) => a + b, 0) / last.length : null, v.length]; });
    const SKN = { lectura: "📖 Reading", auditiva: "🎧 Listening", escritura: "✍️ Writing", oral: "🗣️ Speaking" };
    const got = new Set(S.badges || []);
    app.innerHTML = '<div class="stack prog"><div><p class="eyebrow">Your progress</p><h1>Progreso</h1></div>' +
      '<div class="pstats"><div><b>🔥 ' + st + "</b><small>day streak</small></div><div><b>🏅 " + (S.bestSt || st) + "</b><small>best streak</small></div><div><b>🧊 " + (S.frz || 0) + "/2</b><small>freezes</small></div><div><b>🌳 " + rev + "</b><small>words learned</small></div></div>" +
      '<section class="block"><div class="shead"><h2>Last 5 weeks</h2></div>' + cal + '<p class="small muted" style="margin:6px 0 0">Darker = more practice · 🧊 blue = a day saved by a freeze</p></section>' +
      '<section class="block"><div class="shead"><h2>Points per week</h2></div>' + bars + "</section>" +
      '<section class="block"><div class="shead"><h2>Daily quests</h2></div>' + questsHTML(quests()) + "</section>" +
      '<section class="block"><div class="shead"><h2>Skills · DELE exam papers</h2><a class="small" href="#examenes">Exams ›</a></div>' + (skills.some((x) => x[1] != null) ? '<div class="pskills">' + skills.map(([k, v, n]) => '<div><span>' + SKN[k] + "</span><span class=\"qbar\"><i style=\"width:" + (v == null ? 0 : Math.round(v * 4)) + '%" class="' + (v >= 15 ? "ok" : "") + '"></i></span><b>' + (v == null ? "—" : v.toFixed(1) + "/25") + "</b></div>").join("") + '</div><p class="small muted" style="margin:6px 0 0">Average of your last three papers in each skill. 15/25 is a pass.</p>' : '<p class="small muted">Take a DELE practice paper to see your four skills here.</p>') + "</section>" +
      '<section class="block"><div class="shead"><h2>Flashcards</h2></div><p style="margin:0">🌳 <b>' + rev + "</b> learned · 🌱 <b>" + lrn + "</b> still learning</p></section>" +
      '<section class="block"><div class="shead"><h2>Badges · ' + got.size + "/" + BADGES.length + '</h2></div><div class="pbadges">' + BADGES.map((b) => '<div class="' + (got.has(b.id) ? "on" : "") + '" title="' + esc(b.s) + '"><span>' + b.ic + "</span><b>" + esc(b.t) + "</b><small>" + esc(b.s) + "</small></div>").join("") + "</div></section></div>";
  }
  function hoyHero() {
    let P = []; try { if (S.hoy && S.hoy.d === dayKey()) P = hoyPlan(); } catch (e) {}
    const n = P.filter((x) => x.done).length, all = P.length && n === P.length;
    return '<a class="hoyhero' + (all ? " done" : "") + '" href="#hoy"><span class="hh-ic" aria-hidden="true">' + (all ? "🎉" : "☀️") + '</span><span class="ext"><b>' + (all ? "Today’s session done" : P.length && n ? "Continue today’s session" : "Start today’s session") + "</b><small>" + (P.length ? n + " of " + P.length + " steps" : "Cards, a drill, your course and a listening · ~15 min") + '</small></span><span class="exgo">' + (all ? "✓" : "›") + "</span></a>" +
      '<div class="hhchips"><a href="#drill">🧩 Quick drill</a><a href="#progreso">📊 Progress' + ((S.frz || 0) ? " · 🧊" + S.frz : "") + "</a></div>";
  }
  setTimeout(() => { try { frzCheck(); } catch (e) {} try { remApply(); } catch (e) {} try { hoyPill(); } catch (e) {} }, 400);
  try { Object.defineProperty(window, "__qdr", { get: () => QDR }); } catch (e) {}
