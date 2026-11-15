  /* ==PLAN== Study Plan (feature brief §11–16, 15 Nov 2026). Source of truth: tools/plan.js, put into index.html by tools/patch_plan.py.
     One planning profile (draft + active), filled by the form or by Profe's guided conversation; one scheduling engine; a saved
     calendar of sessions with completion tracking; reminders through the Android app; status for Home and Progress.
     Rubric and its sources: tools/PLAN_RUBRIC.md. */
  const PL_LV = ["a1", "a2", "b1", "b2", "c1", "c2"];
  const PL_DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"], PL_D3 = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const PL_KIND = { learn: ["📘", "New material", "#1f7aec"], guided: ["🧭", "Guided practice", "#0e9f9a"], qbank: ["✅", "Question practice", "#5b5bd6"], revision: ["🗂️", "Spaced revision", "#e8960a"], mistakes: ["🩹", "Mistake correction", "#d93b4c"], timed: ["⏱️", "Timed section", "#8e4ec6"], mock: ["📝", "Full mock exam", "#b4235a"], review: ["🔎", "Feedback & review", "#6b7280"], buffer: ["🛟", "Catch-up / buffer", "#64748b"] };
  // ---- the rubric (configurable; sources and limits in tools/PLAN_RUBRIC.md) ----
  const PL_RUBRIC = {
    // Cambridge English guided learning hours, cumulative from beginner (midpoints of the published ranges)
    glh: { a0: 0, a1: 95, a2: 190, b1: 375, b2: 550, c1: 750, c2: 1100 },
    // exam-specific preparation on top of language development (initial assumption, refined by observed pace)
    examPrepH: { a1: 8, a2: 12, b1: 20, b2: 28, c1: 36, c2: 44 },
    // initial duration estimates in minutes (replaced by the learner's observed averages once there is data)
    dur: { unit: 30, guide: 25, qbank: 15, revision: 15, mistakes: 15, review: 20, buffer: 30 },
    // share of each week by stage: [early, late]; interpolated by how far through the plan the week is
    mix: { learn: [0.38, 0.08], guided: [0.22, 0.12], qbank: [0.15, 0.22], revision: [0.13, 0.18], mistakes: [0.07, 0.08], timedmock: [0.05, 0.32] },
    weakBoost: 1.35, bufferShare: 0.1, maxDailyFill: 1, // never fill more than the learner asked for
  };
  // minutes of each DELE paper by level (the app's exam data, tools/exgen/*_common.py)
  const PL_MINS = { a1: { lectura: 45, auditiva: 20, escritura: 25, oral: 15 }, a2: { lectura: 60, auditiva: 35, escritura: 45, oral: 12 }, b1: { lectura: 70, auditiva: 40, escritura: 60, oral: 15 }, b2: { lectura: 70, auditiva: 40, escritura: 80, oral: 20 }, c1: { lectura: 90, auditiva: 50, escritura: 80, oral: 20 }, c2: { lectura: 60, auditiva: 45, escritura: 150, oral: 20 } };
  const plMin = (hhmm) => { const m = /^(\d{1,2}):(\d{2})$/.exec(String(hhmm || "")); return m ? +m[1] * 60 + +m[2] : null; };
  const plHHMM = (m) => String(Math.floor(m / 60)).padStart(2, "0") + ":" + String(m % 60).padStart(2, "0");
  const plKey = (d) => d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  const plDate = (k) => { const [y, m, d] = String(k).split("-").map(Number); return new Date(y, m - 1, d); };
  const plAddDays = (k, n) => { const d = plDate(k); d.setDate(d.getDate() + n); return plKey(d); };
  const plToday = () => plKey(new Date());
  const plTZ = () => { try { return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC"; } catch (e) { return "UTC"; } };
  const plTZok = (tz) => { try { new Intl.DateTimeFormat("en", { timeZone: tz }).format(new Date()); return true; } catch (e) { return false; } };
  // epoch ms of a wall-clock time in a time zone (for reminders when the plan's zone differs from the phone's)
  function plEpoch(dayKey, hhmm, tz) {
    const [y, mo, d] = dayKey.split("-").map(Number), mins = plMin(hhmm) || 0, guess = Date.UTC(y, mo - 1, d, Math.floor(mins / 60), mins % 60);
    try { const f = new Intl.DateTimeFormat("en-US", { timeZone: tz, hourCycle: "h23", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" });
      const p = Object.fromEntries(f.formatToParts(new Date(guess)).map((x) => [x.type, x.value])); const asTz = Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour, +p.minute); return guess - (asTz - guess); } catch (e) { return new Date(y, mo - 1, d, Math.floor(mins / 60), mins % 60).getTime(); }
  }
  // ---- the planning profile ----
  function plBlank() {
    const cur = (S.place && S.place.lvl) || (S.last && S.last.l) || "";
    return { v: 1, target: "", current: cur, currentSrc: cur ? (S.place ? "placement test" : "your course") : "", skills: {}, exam: { date: "", provisional: true, booked: false, start: "", arrive: "", centre: "", location: "", sessions: "" },
      tz: plTZ(), avail: { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] }, want: { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 }, sessionLen: 30, breakLen: 5, off: [], priority: [], prior: "",
      remind: { on: true, before: 15, missed: true, revision: true, mock: true, booking: true, examDay: true, quietFrom: "21:30", quietTo: "07:30", maxPerDay: 3 } };
  }
  function plState() { S.plan = S.plan || {}; if (!S.plan.draft) S.plan.draft = S.plan.active ? JSON.parse(JSON.stringify(S.plan.active.profile)) : plBlank(); S.plan.done = S.plan.done || {}; return S.plan; }
  const plDraft = () => plState().draft;
  const plActive = () => plState().active || null;
  function plSaveDraft(d) { plState().draft = d; S.plan.draftAt = Date.now(); save(); }
  // ---- validation: required vs optional, overlaps, capacity ----
  function plValidate(p) {
    const err = [], warn = [], missing = [], optional = [];
    if (!PL_LV.includes(p.target)) missing.push("target"); if (!PL_LV.includes(p.current)) missing.push("current");
    if (p.target && p.current && PL_LV.indexOf(p.target) < PL_LV.indexOf(p.current)) warn.push("Your target level is below your current level.");
    if (p.exam.date) { const t = plDate(p.exam.date); if (isNaN(t)) err.push("The exam date isn't a valid date."); else if (p.exam.date <= plToday()) err.push("The exam date must be in the future."); }
    else optional.push("exam date (a 12-week plan is made until you add one)");
    if (!plTZok(p.tz)) err.push("Unknown time zone: " + p.tz);
    let anyDay = false;
    for (let d = 0; d < 7; d++) {
      const ws = (p.avail[d] || []).map((w) => [plMin(w.s), plMin(w.e)]);
      ws.forEach(([a, b], i) => { if (a == null || b == null) err.push(PL_DAYS[d] + ": a time window isn't valid (use HH:MM)."); else if (b <= a) err.push(PL_DAYS[d] + ": a window ends before it starts."); });
      const sorted = ws.filter(([a, b]) => a != null && b != null).sort((x, y) => x[0] - y[0]);
      for (let i = 1; i < sorted.length; i++) if (sorted[i][0] < sorted[i - 1][1]) err.push(PL_DAYS[d] + ": two time windows overlap.");
      const cap = sorted.reduce((n, [a, b]) => n + Math.max(0, b - a), 0), want = +p.want[d] || 0;
      if (want > cap) err.push(PL_DAYS[d] + ": you want " + want + " min but only " + cap + " min are available.");
      if (want > 0) anyDay = true;
    }
    if (!anyDay) missing.push("study time");
    if (!(p.sessionLen >= 10 && p.sessionLen <= 180)) err.push("Session length must be 10–180 minutes.");
    (p.off || []).forEach((o) => { if (!o.from || (o.to && o.to < o.from)) err.push("An unavailable period has an end before its start."); });
    if (!p.exam.booked) optional.push("booking details (you can add them when you book)");
    if (!(p.priority || []).length) optional.push("priority skills");
    return { ok: !err.length && !missing.length, err, warn, missing, optional };
  }
  const plWeekMin = (p) => [0, 1, 2, 3, 4, 5, 6].reduce((n, d) => n + (+p.want[d] || 0), 0);
  // ---- what is left to do in the app, from the learner's real progress ----
  function plObservedDur() { // the learner's own average minutes per activity type, when there is data
    const T = (S.plan && S.plan.obs) || {}, out = {};
    Object.keys(T).forEach((k) => { const v = T[k]; if (v.n >= 3) out[k] = Math.round(v.min / v.n); }); return out;
  }
  function plInventory(p) {
    const tIdx = PL_LV.indexOf(p.target), cIdx = Math.max(0, PL_LV.indexOf(p.current)), units = [], guides = [];
    for (let li = cIdx; li <= tIdx; li++) { const L = LV[PL_LV[li]]; if (!L) continue; L.units.forEach((u, i) => { if (!unitState(L.id, i).done) units.push({ lv: L.id, i, t: u.t }); }); }
    GUIDES.forEach((g) => { if (PL_LV.indexOf(g.lvl) <= tIdx && !((S.gd || {})[g.id] && (S.gd[g.id].best || 0) > 0)) guides.push(g); });
    const papers = []; for (let n = 1; n <= ((typeof EXREADY !== "undefined" && EXREADY[p.target]) || 0); n++) { const R = (S.ex || {})[p.target + "-" + n] || {}; papers.push({ n, done: ["lectura", "auditiva", "escritura", "oral"].filter((k) => R[k]).length }); }
    const unseen = papers.filter((x) => x.done === 0);
    return { units, guides, papers, unseen, mist: (S.mist || []).length, due: dueCount() };
  }
  function plGLH(p) { // the language-development estimate from the Cambridge guideline, for honesty about what the app schedules
    const a = PL_RUBRIC.glh[p.current || "a0"] || 0, b = PL_RUBRIC.glh[p.target] || 0; return { gap: Math.max(0, b - a), prep: PL_RUBRIC.examPrepH[p.target] || 20 };
  }
  // ---- the scheduling engine ----
  function plCapacityDays(p, from, to) { // each day: windows (minus unavailable dates) and the minutes the learner wants used
    const out = [], off = (p.off || []);
    for (let k = from; k <= to; k = plAddDays(k, 1)) {
      const d = plDate(k).getDay(), blocked = off.some((o) => k >= o.from && k <= (o.to || o.from)) || (p.exam.date && k >= p.exam.date);
      const ws = blocked ? [] : (p.avail[d] || []).map((w) => [plMin(w.s), plMin(w.e)]).filter(([a, b]) => a != null && b > a).sort((x, y) => x[0] - y[0]);
      const cap = ws.reduce((n, [a, b]) => n + (b - a), 0), want = blocked ? 0 : Math.min(cap, +p.want[d] || 0);
      out.push({ k, d, ws, cap, want });
    }
    return out;
  }
  function plGenerate(p, keepDone) {
    const v = plValidate(p); if (!v.ok) return { ok: false, v };
    const from = plToday(), end = p.exam.date ? plAddDays(p.exam.date, -1) : plAddDays(from, 83), days = plCapacityDays(p, from, end);
    const capTotal = days.reduce((n, x) => n + x.want, 0), inv = plInventory(p), obs = plObservedDur(), D = Object.assign({}, PL_RUBRIC.dur, obs);
    const mins = PL_MINS[p.target] || PL_MINS.b1;
    const mockMin = Object.values(mins).reduce((a, b) => a + b, 0) + 30;
    // required work in minutes (language content + exam-specific work)
    const need = { learn: inv.units.length * D.unit + inv.guides.length * D.guide, guided: inv.units.length * 10 + inv.guides.length * 10, qbank: Math.max(150, inv.units.length * 8), revision: 0, mistakes: Math.max(30, inv.mist * 3), timedmock: (PL_RUBRIC.examPrepH[p.target] || 20) * 60 };
    const needCore = need.learn + need.guided + need.qbank + need.mistakes + need.timedmock;
    // feasibility: never overload, show the shortfall and alternatives
    const weeks = Math.max(1, Math.ceil(days.length / 7)), usable = capTotal * (1 - PL_RUBRIC.bufferShare), short = Math.max(0, needCore - usable);
    const feas = { capTotal, needCore, short, weeks, perWeekNeeded: Math.ceil((needCore / (1 - PL_RUBRIC.bufferShare)) / weeks), glh: plGLH(p) };
    if (short > 0) { feas.alt = { moreMinPerWeek: Math.ceil(short / weeks), laterWeeks: Math.ceil(short / Math.max(1, plWeekMin(p) * (1 - PL_RUBRIC.bufferShare))), prioritise: true, lowerTarget: PL_LV[Math.max(0, PL_LV.indexOf(p.target) - 1)] }; }
    // queues of concrete activities (linked to real content)
    const Q = { learn: [], guided: [], qbank: [], revision: [], mistakes: [], timed: [], mock: [], review: [] };
    inv.units.forEach((u) => { Q.learn.push({ kind: "learn", t: LV[u.lv].name + " · " + u.t, obj: "Learn and practise: " + u.t, link: "#" + u.lv + "-u" + (u.i + 1), min: D.unit, ref: "u:" + u.lv + ":" + u.i }); Q.guided.push({ kind: "guided", t: "Practise " + u.t, obj: "Apply " + u.t + " in the unit's exercises", link: "#" + u.lv + "-u" + (u.i + 1), min: Math.min(p.sessionLen, 20), ref: "g:" + u.lv + ":" + u.i }); });
    inv.guides.forEach((g) => { Q.learn.push({ kind: "learn", t: "Guide · " + g.en, obj: "Understand " + g.en + " (rules, decisions, pitfalls)", link: "#guia-" + g.id, min: D.guide, ref: "gd:" + g.id }); });
    const skillsOrder = ["lectura", "auditiva", "escritura", "oral"], SKN = { lectura: "Reading", auditiva: "Listening", escritura: "Writing", oral: "Speaking" };
    const weak = (p.priority || []).filter((x) => skillsOrder.includes(x));
    // mock protection: the last unseen papers are kept for full mocks near the exam; timed sections use the others
    const unseen = inv.unseen.map((x) => x.n), reserve = unseen.slice(-Math.min(2, unseen.length)), practicePapers = inv.papers.map((x) => x.n).filter((n) => !reserve.includes(n));
    let si = 0; const sectionPool = []; practicePapers.forEach((n) => skillsOrder.forEach((k) => { const R = (S.ex || {})[p.target + "-" + n] || {}; if (!R[k]) sectionPool.push({ n, k }); }));
    // weaker skills come up more often
    sectionPool.sort((a, b) => (weak.includes(b.k) ? 1 : 0) - (weak.includes(a.k) ? 1 : 0));
    sectionPool.forEach((x) => Q.timed.push({ kind: "timed", t: "Timed " + SKN[x.k] + " · DELE " + p.target.toUpperCase() + " exam " + x.n, obj: "Do the " + SKN[x.k].toLowerCase() + " paper under exam timing", link: "#" + p.target + "-examen-" + x.n + "-" + x.k, min: (mins[x.k] || 40) + 10, ref: "x:" + p.target + ":" + x.n + ":" + x.k, skill: x.k }));
    // a full mock in one sitting when a study day is long enough; otherwise the same unseen paper in parts on consecutive study days (the real exam can also split speaking onto another day)
    const maxDay = Math.max(0, ...days.map((x) => Math.min(x.want, Math.max(0, ...x.ws.map(([a, b]) => b - a)))));
    reserve.forEach((n) => {
      if (mockMin <= maxDay) { Q.mock.push({ kind: "mock", t: "Full mock · DELE " + p.target.toUpperCase() + " exam " + n, obj: "All four papers, real timing; then review", link: "#" + p.target + "-examen-" + n, min: mockMin, ref: "m:" + p.target + ":" + n, mockN: n, last: 1 }); return; }
      const parts = []; let cur = [];
      skillsOrder.forEach((k) => { const m = (mins[k] || 40) + 10, sum = cur.reduce((t, x) => t + (mins[x] || 40) + 10, 0); if (cur.length && sum + m > maxDay) { parts.push(cur); cur = []; } cur.push(k); });
      if (cur.length) parts.push(cur);
      parts.forEach((g, i) => Q.mock.push({ kind: "mock", t: "Mock exam " + n + " · part " + (i + 1) + "/" + parts.length + ": " + g.map((k) => SKN[k]).join(" + "), obj: "Unseen paper under real timing" + (i + 1 < parts.length ? "; part " + (i + 2) + " on your next study day" : "; then review the whole mock"), link: "#" + p.target + "-examen-" + n + (g.length === 1 ? "-" + g[0] : ""), min: g.reduce((t, k) => t + (mins[k] || 40) + 10, 0), ref: "m:" + p.target + ":" + n + ":" + i, mockN: n, last: i + 1 === parts.length ? 1 : 0 }));
    });
    // build the calendar day by day
    const sessions = [], late = (k) => days.length > 1 ? days.findIndex((x) => x.k === k) / (days.length - 1) : 1;
    const take = (q) => (Q[q] && Q[q].length ? Q[q].shift() : null);
    const filler = (kind, k) => kind === "revision" ? { kind, t: "Flashcards and review", obj: "Review the cards due (spaced repetition)", link: "#repaso", min: D.revision, ref: "r:" + k } : kind === "mistakes" ? { kind, t: "Fix my mistakes", obj: "Redo the questions you got wrong", link: "#errores", min: D.mistakes, ref: "e:" + k } : kind === "qbank" ? { kind, t: "Quick drill · mixed questions", obj: "Mixed questions from your level", link: "#drill", min: D.qbank, ref: "q:" + k } : kind === "review" ? { kind, t: "Feedback & review", obj: "Go back over feedback from writing, speaking and timed work", link: "#errores", min: D.review, ref: "v:" + k } : { kind: "buffer", t: "Catch-up / buffer", obj: "Time to catch up on anything missed — or rest", link: "#plan", min: D.buffer, ref: "b:" + k };
    let weekUsed = 0, weekCap = 0, weekStart = null, lastMockDay = null, lastMockN = null, guidedOwed = [];
    days.forEach((day, di) => {
      if (day.d === 1 || weekStart === null) { weekStart = day.k; weekUsed = 0; weekCap = days.slice(di, di + 7).reduce((n, x) => n + x.want, 0); }
      if (!day.want) return;
      const f = late(day.k), mix = {}; Object.keys(PL_RUBRIC.mix).forEach((k) => { const [a, b] = PL_RUBRIC.mix[k]; mix[k] = a + (b - a) * f; });
      let left = day.want; const slots = []; day.ws.forEach(([a, b]) => slots.push([a, b]));
      const place = (it) => { // into the first window with room (session + break)
        for (const s of slots) { const room = s[1] - s[0]; if (room >= it.min) { const st = s[0]; s[0] += it.min + (p.breakLen || 0); left -= it.min; weekUsed += it.min; sessions.push(Object.assign({ id: "s" + day.k.replace(/-/g, "") + "-" + plHHMM(st).replace(":", "") , date: day.k, start: plHHMM(st), status: "planned" }, it)); return true; } }
        return false; };
      // a full mock needs a long window: only on days with one, near the end, not two in a row
      const midMock = Q.mock.length && lastMockN === Q.mock[0].mockN; // the next part of a mock already started goes on the next study day
      if (Q.mock.length && (f > 0.6 || midMock) && day.ws.some(([a, b]) => b - a >= Q.mock[0].min) && left >= Q.mock[0].min && (midMock || lastMockDay !== plAddDays(day.k, -1))) { const m = take("mock"); if (place(m)) { lastMockDay = day.k; lastMockN = m.mockN; if (!m.last) return; Q.review.push({ kind: "review", t: "Review your mock", obj: "Go through the marked mock and save mistakes", link: m.link, min: D.review, ref: "rv:" + m.ref }); return; } else Q.mock.unshift(m); }
      // a pending review of yesterday's mock first
      if (Q.review.length && left >= Q.review[0].min) place(take("review"));
      // the buffer: about one session a week
      const wantBuffer = weekCap > 0 && weekUsed + left >= weekCap * (1 - PL_RUBRIC.bufferShare) && !sessions.some((s) => s.kind === "buffer" && s.date >= weekStart);
      let guard = 0;
      while (left >= 10 && guard++ < 20) {
        if (wantBuffer && !sessions.some((s) => s.kind === "buffer" && s.date >= weekStart) && left >= D.buffer) { if (!place(filler("buffer", day.k))) break; continue; }
        // pick the category furthest below its share today
        const used = { learn: 0, guided: 0, qbank: 0, revision: 0, mistakes: 0, timedmock: 0 };
        sessions.filter((s) => s.date === day.k).forEach((s) => { const c = s.kind === "timed" || s.kind === "mock" ? "timedmock" : s.kind === "review" || s.kind === "buffer" ? null : s.kind; if (c) used[c] += s.min; });
        const order = Object.keys(mix).filter((c) => c !== "timedmock" || Q.timed.length).sort((a, b) => used[a] / (mix[a] * day.want + 1) - used[b] / (mix[b] * day.want + 1));
        let it = null;
        for (const c of order) {
          if (c === "learn") it = take("learn") || null;
          else if (c === "guided") it = guidedOwed.shift() || null;
          else if (c === "timedmock") { const nx = Q.timed[0]; if (nx && nx.min <= left) it = take("timed"); }
          else it = filler(c, day.k + ":" + guard);
          if (it && it.min > left) { if (c === "learn") Q.learn.unshift(it); else if (c === "guided") guidedOwed.unshift(it); else if (c === "timedmock") Q.timed.unshift(it); it = Object.assign({}, it, { min: left }); if (c !== "revision" && c !== "mistakes" && c !== "qbank") it = null; }
          if (it) break;
        }
        if (!it) it = filler(left >= D.qbank ? "qbank" : "revision", day.k + ":" + guard);
        if (it.min > (p.sessionLen || 30) && it.kind !== "timed" && it.kind !== "mock") it.min = p.sessionLen || 30;
        if (!place(it)) { if (it.kind === "learn") Q.learn.unshift(it); break; }
        if (it.kind === "learn" && /^u:/.test(it.ref)) { const g = Q.guided.find((x) => x.ref === it.ref.replace(/^u:/, "g:")); if (g) guidedOwed.push(g); }
      }
    });
    // keep work already done (replanning never loses it)
    const kept = keepDone ? (plActive() ? plActive().sessions.filter((s) => s.date < from || s.status === "done" || s.status === "partial") : []) : [];
    const all = kept.concat(sessions.filter((s) => !kept.some((k) => k.id === s.id)));
    const leftUnits = Q.learn.filter((x) => /^u:/.test(x.ref)).length, leftGuides = Q.learn.filter((x) => /^gd:/.test(x.ref)).length;
    feas.unscheduled = { units: leftUnits, guides: leftGuides, timed: Q.timed.length, mocks: Q.mock.length };
    return { ok: true, v, sessions: all, feas, inv };
  }
  // saving through the app's own action (both the form and Profe use this): reports success only after it is stored
  function plCommit(gen) {
    const st = plState(), prev = st.active;
    if (prev) { st.history = (st.history || []).concat([{ at: Date.now(), profile: prev.profile, n: prev.sessions.length }]).slice(-10); }
    st.active = { profile: JSON.parse(JSON.stringify(st.draft)), sessions: gen.sessions, feas: gen.feas, created: Date.now(), rev: ((prev && prev.rev) || 0) + 1 };
    save();
    let stored = false; try { const j = JSON.parse(localStorage.getItem(KEY) || "{}"); stored = !!(j.plan && j.plan.active && j.plan.active.created === st.active.created); } catch (e) {}
    try { plRemindersApply(); } catch (e) {}
    return stored;
  }
  function plDiff(a, b) { // what a revised plan changes (future sessions only)
    const t = plToday(), fa = (a || []).filter((s) => s.date >= t && s.status === "planned"), fb = (b || []).filter((s) => s.date >= t && s.status === "planned");
    const sum = (L) => { const o = {}; L.forEach((s) => (o[s.kind] = (o[s.kind] || 0) + s.min)); return o; };
    return { before: { n: fa.length, min: fa.reduce((n, s) => n + s.min, 0), by: sum(fa) }, after: { n: fb.length, min: fb.reduce((n, s) => n + s.min, 0), by: sum(fb) } };
  }
  // ---- completion: time actually spent from a plan session, plus manual done / partly done ----
  const PLIVE = { id: null, t0: 0, prefix: "" };
  function plStart(id) {
    const A = plActive(); if (!A) return; const s = A.sessions.find((x) => x.id === id); if (!s) return;
    PLIVE.id = id; PLIVE.t0 = Date.now(); PLIVE.acc = 0; PLIVE.prefix = s.link.replace(/-(lectura|auditiva|escritura|oral)$/, "");
    S.plan.live = { id, at: Date.now() }; save(); location.hash = s.link;
  }
  setInterval(() => { // counts minutes while the session's page is open and visible
    if (!PLIVE.id || document.hidden) return; const A = plActive(); if (!A) return; const s = A.sessions.find((x) => x.id === PLIVE.id); if (!s) { PLIVE.id = null; return; }
    if (!location.hash.startsWith(PLIVE.prefix) && !(s.link === "#repaso" && /^#repaso/.test(location.hash))) return;
    s.doneMin = Math.min(s.min, (s.doneMin || 0) + 0.5); if (s.doneMin >= s.min * 0.9) { s.status = "done"; s.doneAt = Date.now(); plObserve(s); PLIVE.id = null; try { coachToast("✓ Plan session done: " + s.t); } catch (e) {} }
    else if (s.doneMin >= 5 && s.status === "planned") s.status = "partial";
    save();
  }, 30000);
  function plObserve(s) { const T = (S.plan.obs = S.plan.obs || {}), k = s.kind === "learn" ? (/^gd:/.test(s.ref) ? "guide" : "unit") : s.kind; T[k] = T[k] || { n: 0, min: 0 }; T[k].n++; T[k].min += Math.round(s.doneMin || s.min); }
  function plMark(id, how, minutes) {
    const A = plActive(); if (!A) return; const s = A.sessions.find((x) => x.id === id); if (!s) return;
    if (how === "done") { s.status = "done"; s.doneMin = s.min; s.doneAt = Date.now(); plObserve(s); }
    else if (how === "partial") { s.status = "partial"; s.doneMin = Math.max(1, Math.min(s.min - 1, +minutes || Math.round(s.min / 2))); }
    else if (how === "undo") { s.status = "planned"; s.doneMin = 0; }
    save(); try { plRemindersApply(); } catch (e) {}
  }
  function plMove(id, day, hhmm) { // move a session to another day/time inside the learner's windows
    const A = plActive(); if (!A) return "No plan."; const s = A.sessions.find((x) => x.id === id); if (!s) return "Not found.";
    const p = A.profile, d = plDate(day).getDay(), m = plMin(hhmm), ws = (p.avail[d] || []).map((w) => [plMin(w.s), plMin(w.e)]);
    if (m == null || !ws.some(([a, b]) => m >= a && m + s.min <= b)) return "That time isn't inside your available windows for " + PL_DAYS[d] + ".";
    const clash = A.sessions.some((o) => o !== s && o.date === day && plMin(o.start) < m + s.min && m < plMin(o.start) + o.min); if (clash) return "Another session is already at that time.";
    s.date = day; s.start = plHHMM(m); s.status = s.status === "done" ? "done" : "planned"; s.moved = (s.moved || 0) + 1; save(); try { plRemindersApply(); } catch (e) {} return "";
  }
  // ---- status for Home, the banner and Progress (minutes, not lesson counts) ----
  function plStatus() {
    const A = plActive(); if (!A) return { exists: false };
    const t = plToday(), now = new Date(), nowMin = now.getHours() * 60 + now.getMinutes();
    const today = A.sessions.filter((s) => s.date === t && s.kind !== "buffer"), planned = today.reduce((n, s) => n + s.min, 0), done = today.reduce((n, s) => n + (s.status === "done" ? s.min : s.doneMin || 0), 0);
    const dueByNow = today.filter((s) => plMin(s.start) + s.min <= nowMin).reduce((n, s) => n + s.min, 0);
    const past = A.sessions.filter((s) => s.date < t && s.kind !== "buffer"), pPlan = past.reduce((n, s) => n + s.min, 0), pDone = past.reduce((n, s) => n + (s.status === "done" ? s.min : s.doneMin || 0), 0);
    const extra = A.sessions.filter((s) => s.date > t && (s.status === "done" || s.doneMin)).reduce((n, s) => n + (s.status === "done" ? s.min : s.doneMin || 0), 0);
    const todayState = !planned ? (extra > 0 ? "ahead" : "free") : done >= planned ? (extra > 0 ? "ahead" : "completed") : done >= dueByNow ? "on track" : "behind";
    const overallGap = pDone + done + extra - (pPlan + dueByNow);
    const overall = pPlan + dueByNow === 0 ? "on track" : overallGap >= 30 ? "ahead" : overallGap > -Math.max(30, (pPlan + dueByNow) * 0.1) ? "on track" : "behind";
    const next = A.sessions.filter((s) => (s.date > t || (s.date === t && plMin(s.start) + s.min > nowMin)) && s.status !== "done" && s.kind !== "buffer").sort((a, b) => (a.date + a.start).localeCompare(b.date + b.start))[0] || null;
    const overdue = A.sessions.filter((s) => (s.date < t || (s.date === t && plMin(s.start) + s.min <= nowMin)) && s.status !== "done" && s.kind !== "buffer");
    return { exists: true, today: { planned, done, dueByNow, state: todayState, sessions: today }, overall: { state: overall, plan: pPlan + dueByNow, done: pDone + done + extra, gap: overallGap }, next, overdue, profile: A.profile, feas: A.feas };
  }
  // ---- reminders through the Android app (other channels are reported as unsupported) ----
  function plReminderList() {
    const A = plActive(); if (!A) return []; const p = A.profile, r = p.remind || {}; if (!r.on) return [];
    const out = [], now = Date.now(), tz = p.tz || plTZ(), qf = plMin(r.quietFrom), qt = plMin(r.quietTo);
    const quiet = (hhmm) => { const m = plMin(hhmm); if (qf == null || qt == null) return false; return qf > qt ? m >= qf || m < qt : m >= qf && m < qt; };
    const perDay = {};
    const add = (day, hhmm, title, text, hash, kind) => { if (quiet(hhmm)) return; const at = plEpoch(day, hhmm, tz); if (at < now + 60000 || at > now + 21 * 864e5) return; perDay[day] = (perDay[day] || 0) + 1; if (perDay[day] > (r.maxPerDay || 3)) return; out.push({ id: kind + ":" + day + ":" + hhmm, at, title, text, hash }); };
    const S2 = A.sessions.filter((s) => s.status !== "done" && s.kind !== "buffer").sort((a, b) => (a.date + a.start).localeCompare(b.date + b.start));
    const firstOfDay = {}; S2.forEach((s) => { if (!firstOfDay[s.date]) firstOfDay[s.date] = s; });
    Object.values(firstOfDay).forEach((s) => { const m = Math.max(0, plMin(s.start) - (r.before || 15)); const mins = S2.filter((x) => x.date === s.date).reduce((n, x) => n + x.min, 0);
      add(s.date, plHHMM(m), "Study plan · " + PL_KIND[s.kind][1], "At " + s.start + ": " + s.t + (mins > s.min ? " (" + mins + " min planned today)" : ""), "plan", "s");
      if (s.kind === "mock" && r.mock) add(plAddDays(s.date, -1), "18:00", "Mock exam tomorrow", s.t + " at " + s.start + ". About " + Math.round(s.min / 60 * 10) / 10 + " h: plan a quiet space.", "plan", "m"); });
    if (r.missed) Object.values(firstOfDay).forEach((s) => { const last = S2.filter((x) => x.date === s.date).pop(); const m = Math.min(22 * 60, plMin(last.start) + last.min + 60);
      add(s.date, plHHMM(m), "Still time today?", "If you have 15 minutes, a short review keeps this week's plan on track.", "plan", "x"); });
    if (r.revision && dueCount() > 0) { const d = plToday(); add(d, "12:30", "Flashcards ready", dueCount() + " cards are due: about " + Math.max(5, Math.round(dueCount() / 3)) + " minutes.", "repaso", "r"); }
    if (r.booking && !p.exam.booked && p.exam.date) { const d = plAddDays(plToday(), 7); add(d, "11:00", "Booked your DELE yet?", "When you book " + p.target.toUpperCase() + ", add the date, time and centre in your study plan.", "plan", "b"); }
    if (r.examDay && p.exam.booked && p.exam.date) { const dd = plAddDays(p.exam.date, -1); add(dd, "19:00", "DELE tomorrow", "Arrive by " + (p.exam.arrive || p.exam.start || "the time on your confirmation") + (p.exam.centre ? " at " + p.exam.centre : "") + ". Bring your ID. ¡Suerte!", "plan", "d"); }
    return out.sort((a, b) => a.at - b.at);
  }
  function plRemindersApply() {
    const L = plReminderList(); S.plan.rem = { at: Date.now(), n: L.length, ok: false, channel: "" };
    if (window.AndroidApp && typeof AndroidApp.setPlanReminders === "function") {
      let r = ""; try { r = String(AndroidApp.setPlanReminders(JSON.stringify(L))); } catch (e) { r = "ERR " + e.message; }
      S.plan.rem.ok = /^OK/.test(r); S.plan.rem.channel = "Android notifications"; S.plan.rem.msg = r;
    } else S.plan.rem.channel = window.AndroidApp ? "update the Android app (this version can't schedule plan reminders)" : "not available in the browser (install the Android app for reminders)";
    save(); return S.plan.rem;
  }
  // ---- the Study Plan page (#plan) ----
  const PLUI = { view: "agenda", wk: null, mo: null, day: null };
  const plFmtDay = (k, o) => plDate(k).toLocaleDateString(undefined, o || { weekday: "short", day: "numeric", month: "short" });
  const plStateChip = (st) => ({ completed: ["✓ Completed", "ok"], "on track": ["● On track", "ok"], ahead: ["▲ Ahead", "ok"], behind: ["▼ Behind", "warn"], free: ["No sessions today", "muted"] }[st] || [st, "muted"]);
  function plSessStatus(s) { const t = plToday(), now = new Date(), nm = now.getHours() * 60 + now.getMinutes();
    if (s.status === "done") return ["Completed", "done"]; if (s.status === "partial") return ["Partly done · " + Math.round(s.doneMin || 0) + " min", "part"];
    if (s.date < t || (s.date === t && plMin(s.start) + s.min <= nm)) return ["Overdue", "over"]; return [s.moved ? "Rescheduled" : "Upcoming", "up"]; }
  function plRow(s) {
    const K = PL_KIND[s.kind] || PL_KIND.buffer, st = plSessStatus(s);
    return '<li class="plrow ' + st[1] + '" style="--k:' + K[2] + '"><span class="plt"><b>' + s.start + '</b><small>' + s.min + ' min</small></span><span class="plb"><span class="plk"><span aria-hidden="true">' + K[0] + "</span> " + K[1] + '</span><b class="plti">' + esc(s.t) + '</b><small>' + esc(s.obj || "") + '</small><span class="plst">' + st[0] + "</span></span>" +
      '<span class="pla">' + (s.status !== "done" && s.kind !== "buffer" ? '<button class="btn small primary" data-act="pl-start" data-id="' + s.id + '">Start</button>' : "") +
      (s.status !== "done" ? '<button class="btn small" data-act="pl-done" data-id="' + s.id + '" aria-label="Mark done">✓</button><button class="btn small" data-act="pl-part" data-id="' + s.id + '">Partly</button><button class="btn small" data-act="pl-move" data-id="' + s.id + '">Move</button>' : '<button class="btn small" data-act="pl-undo" data-id="' + s.id + '">Undo</button>') + "</span></li>";
  }
  function plExamBox(p) {
    if (!p.exam.date) return '<div class="plexam prov"><b>No exam date yet</b><span class="small">Your plan runs 12 weeks for now. Add a target date when you have one (provisional is fine).</span><button class="btn small" data-act="pl-view" data-v="setup">Add a date</button></div>';
    const d = Math.ceil((plDate(p.exam.date) - plDate(plToday())) / 864e5);
    return '<div class="plexam ' + (p.exam.booked ? "conf" : "prov") + '"><span class="plbadge">' + (p.exam.booked ? "✓ Booked" : "Provisional target") + '</span><b>DELE ' + p.target.toUpperCase() + " · " + plFmtDay(p.exam.date, { weekday: "long", day: "numeric", month: "long", year: "numeric" }) + '</b><span class="small">' + d + " days to go" + (p.exam.booked ? (p.exam.start ? " · starts " + esc(p.exam.start) : "") + (p.exam.arrive ? " · arrive by " + esc(p.exam.arrive) : "") + (p.exam.centre ? " · " + esc(p.exam.centre) : "") : " · not booked yet — entering a date here doesn't book the exam") + "</span>" +
      (!p.exam.booked && d <= 70 ? '<button class="btn small" data-act="pl-view" data-v="setup">I\'ve booked it: add details</button>' : "") + "</div>";
  }
  function planPage() {
    plState(); const A = plActive(), st = plStatus(), D = plDraft();
    let h = '<div class="ui-page plan">' + uiTitle("Study plan", A ? "Your saved plan. Sessions link straight to the lesson, questions or exam." : "A calendar built from your goal, your free time and what's left to learn.", "", "Tu plan");
    if (!A && PLUI.view !== "setup" && PLUI.view !== "review") {
      const v = plValidate(D), started = !!(D.target || plWeekMin(D));
      h += '<section class="block plintro"><h2>Create your study plan</h2><p>Tell me your target level, when you\'d like to take the exam (provisional is fine) and when you can study. I\'ll schedule only the time you want to use — not every free hour.</p>' +
        '<div class="row"><button class="btn primary" data-act="pl-profe">🗣️ Set up with Profe</button><button class="btn" data-act="pl-view" data-v="setup">✍️ Set up myself</button></div>' +
        (started ? '<p class="small muted">A draft is saved' + (v.missing.length ? " · still needed: " + v.missing.join(", ") : " · ready to review") + ". Either way continues it.</p>" : "") + "</section>";
      return (app.innerHTML = h + plRubricNote() + "</div>");
    }
    if (A) {
      const p = A.profile, c1 = plStateChip(st.today.state), c2 = plStateChip(st.overall.state);
      h += '<div class="plstatus"><div><span class="small muted">Today</span><b>' + Math.round(st.today.done) + " / " + st.today.planned + ' min</b><span class="plchip ' + c1[1] + '">' + c1[0] + '</span></div><div><span class="small muted">Whole plan</span><b>' + Math.round(st.overall.done / 60 * 10) / 10 + " / " + Math.round(st.overall.plan / 60 * 10) / 10 + ' h so far</b><span class="plchip ' + c2[1] + '">' + c2[0] + "</span></div>" +
        (st.today.state === "behind" || st.overall.state === "behind" ? '<div class="placts"><button class="btn small primary" data-act="pl-catchup">Catch up</button><button class="btn small" data-act="pl-replan">Adjust plan</button></div>' : "") + "</div>";
      h += plExamBox(p);
      if (A.feas && A.feas.short > 0) h += '<p class="plwarn">⚠️ The plan has about ' + Math.round(A.feas.short / 60) + " h less than the remaining material needs. It is prioritised; to cover everything: about " + A.feas.alt.moreMinPerWeek + " more minutes a week, or a date about " + A.feas.alt.laterWeeks + " weeks later" + (A.feas.alt.lowerTarget && A.feas.alt.lowerTarget !== p.target ? ", or " + A.feas.alt.lowerTarget.toUpperCase() + " first" : "") + '. <button class="lnk" data-act="pl-view" data-v="setup">Change the plan</button></p>';
    }
    const tabs = [["agenda", "Agenda"], ["week", "Week"], ["month", "Month"], ["setup", A ? "Edit plan" : "Set up"]];
    h += '<div class="vchips pltabs" role="tablist">' + tabs.map(([k, n]) => '<button class="vchip" role="tab" data-act="pl-view" data-v="' + k + '" aria-selected="' + (PLUI.view === k) + '" aria-pressed="' + (PLUI.view === k) + '">' + n + "</button>").join("") + (A ? '<button class="vchip" data-act="pl-replan">↻ Replan</button>' : "") + "</div>";
    if (PLUI.view === "setup") h += plFormHTML();
    else if (PLUI.view === "review") h += plReviewHTML();
    else if (PLUI.view === "week") h += plWeekHTML(A);
    else if (PLUI.view === "month") h += plMonthHTML(A);
    else h += plAgendaHTML(A);
    app.innerHTML = h + "</div>";
  }
  function plAgendaHTML(A) {
    const t = plToday(), from = PLUI.day || t, to = PLUI.day || plAddDays(t, 13), S2 = A.sessions.filter((s) => s.date >= from && s.date <= to).sort((a, b) => (a.date + a.start).localeCompare(b.date + b.start));
    const over = PLUI.day ? [] : A.sessions.filter((s) => s.date < t && s.status !== "done" && s.kind !== "buffer");
    let h = (PLUI.day ? '<p><button class="btn small" data-act="pl-day" data-v="">‹ All upcoming</button></p>' : "") + (over.length ? '<section class="block"><h2>Overdue · ' + over.length + '</h2><ul class="pllist">' + over.slice(-6).map(plRow).join("") + '</ul><button class="btn small" data-act="pl-replan">Fit these into the coming days</button></section>' : "");
    const byDay = {}; S2.forEach((s) => (byDay[s.date] = byDay[s.date] || []).push(s));
    h += Object.keys(byDay).map((k) => { const L = byDay[k], m = L.reduce((n, s) => n + s.min, 0), dn = L.reduce((n, s) => n + (s.status === "done" ? s.min : s.doneMin || 0), 0);
      return '<section class="block plday"><div class="shead"><h2>' + (k === t ? "Today" : plFmtDay(k, { weekday: "long", day: "numeric", month: "short" })) + '</h2><span class="small muted">' + Math.round(dn) + " / " + m + ' min</span></div><span class="qbar"><i style="width:' + Math.min(100, Math.round(100 * dn / Math.max(1, m))) + '%"></i></span><ul class="pllist">' + L.map(plRow).join("") + "</ul></section>"; }).join("");
    return h || '<p class="muted">No sessions in the next two weeks. Check your availability in Edit plan.</p>';
  }
  function plWeekHTML(A) {
    const t = plToday(), base = PLUI.wk || (() => { const d = plDate(t); d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); return plKey(d); })(); PLUI.wk = base;
    const days = [0, 1, 2, 3, 4, 5, 6].map((i) => plAddDays(base, i));
    return '<div class="row plnav"><button class="btn small" data-act="pl-wk" data-d="-7" aria-label="Previous week">‹</button><b>' + plFmtDay(days[0], { day: "numeric", month: "short" }) + " – " + plFmtDay(days[6], { day: "numeric", month: "short" }) + '</b><button class="btn small" data-act="pl-wk" data-d="7" aria-label="Next week">›</button></div><div class="plweek">' +
      days.map((k) => { const L = A.sessions.filter((s) => s.date === k).sort((a, b) => a.start.localeCompare(b.start)); return '<div class="plwd' + (k === t ? " today" : "") + '"><button class="plwh" data-act="pl-day" data-v="' + k + '">' + plFmtDay(k, { weekday: "short", day: "numeric" }) + "</button>" + L.map((s) => { const K = PL_KIND[s.kind], st = plSessStatus(s); return '<div class="plchipk ' + st[1] + '" style="--k:' + K[2] + '" title="' + esc(s.t) + '"><span aria-hidden="true">' + K[0] + "</span> " + s.start + " · " + s.min + "′<small>" + esc(s.t) + "</small></div>"; }).join("") + (L.length ? "" : '<small class="muted">—</small>') + "</div>"; }).join("") + "</div>";
  }
  function plMonthHTML(A) {
    const t = plToday(), mo = PLUI.mo || t.slice(0, 7); PLUI.mo = mo; const [y, m] = mo.split("-").map(Number), first = new Date(y, m - 1, 1), start = new Date(first); start.setDate(1 - ((first.getDay() + 6) % 7));
    let cells = ""; for (let i = 0; i < 42; i++) { const d = new Date(start); d.setDate(start.getDate() + i); const k = plKey(d), L = A.sessions.filter((s) => s.date === k), min = L.reduce((n, s) => n + s.min, 0), dn = L.reduce((n, s) => n + (s.status === "done" ? s.min : s.doneMin || 0), 0), exam = A.profile.exam.date === k;
      cells += '<button class="plmd' + (d.getMonth() !== m - 1 ? " out" : "") + (k === t ? " today" : "") + (exam ? " exam" : "") + '" data-act="pl-day" data-v="' + k + '" aria-label="' + plFmtDay(k, { weekday: "long", day: "numeric", month: "long" }) + ": " + (exam ? "exam day" : min ? min + " minutes planned, " + Math.round(dn) + " done" : "nothing planned") + '"><span>' + d.getDate() + "</span>" + (exam ? "<small>🎓</small>" : min ? '<i style="--p:' + Math.min(100, Math.round(100 * dn / min)) + '%"></i><small>' + min + "′</small>" : "") + "</button>"; }
    return '<div class="row plnav"><button class="btn small" data-act="pl-mo" data-d="-1" aria-label="Previous month">‹</button><b>' + first.toLocaleDateString(undefined, { month: "long", year: "numeric" }) + '</b><button class="btn small" data-act="pl-mo" data-d="1" aria-label="Next month">›</button></div><div class="plmonth">' + ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((x) => "<b>" + x + "</b>").join("") + cells + "</div>";
  }
  // ---- the form (same profile as Profe's conversation) ----
  function plFormHTML() {
    const D = plDraft(), v = plValidate(D), A = plActive(), sel = (path, val, opts) => '<select data-pf="' + path + '">' + opts.map(([k, n]) => '<option value="' + k + '"' + (String(val) === String(k) ? " selected" : "") + ">" + n + "</option>").join("") + "</select>";
    const lvOpts = [["", "Choose…"]].concat(PL_LV.map((l) => [l, l.toUpperCase()])), inp = (path, val, type, ph, extra) => '<input data-pf="' + path + '" type="' + (type || "text") + '" value="' + esc(val == null ? "" : val) + '"' + (ph ? ' placeholder="' + esc(ph) + '"' : "") + (extra || "") + ">";
    const chk = (path, val, lab) => '<label class="plck"><input type="checkbox" data-pf="' + path + '"' + (val ? " checked" : "") + "> " + lab + "</label>";
    let h = '<div class="plform">' + (A ? '<p class="small muted">You are editing a draft. Your active plan stays as it is until you review and save.</p>' : "") +
      '<section class="block"><h2>1 · Goal</h2><div class="plgrid"><label>Target DELE level' + sel("target", D.target, lvOpts) + '</label><label>Current level' + sel("current", D.current, lvOpts) + '<small class="muted">' + (D.currentSrc ? "From " + esc(D.currentSrc) + " — check it" : "Not sure? Take the placement test") + "</small></label></div>" +
      '<fieldset class="plskills"><legend>Skills to give extra attention</legend>' + [["lectura", "Reading"], ["auditiva", "Listening"], ["escritura", "Writing"], ["oral", "Speaking"]].map(([k, n]) => chk("priority." + k, (D.priority || []).includes(k), n)).join("") + "</fieldset>" +
      '<label>Earlier learning or results (optional)<textarea data-pf="prior" rows="2" placeholder="e.g. passed DELE A2 in 2025; reading 70% in the last mock">' + esc(D.prior || "") + "</textarea></label></section>" +
      '<section class="block"><h2>2 · Exam</h2><div class="plgrid"><label>Target exam date' + inp("exam.date", D.exam.date, "date", "", ' min="' + plAddDays(plToday(), 1) + '"') + '<small class="muted">Provisional is fine. Leave empty for a 12-week plan.</small></label><label>Booking' + sel("exam.booked", D.exam.booked ? "1" : "", [["", "Not booked yet (provisional)"], ["1", "Booked (confirmed)"]]) + "</label></div>" +
      (D.exam.booked ? '<div class="plgrid"><label>Start time' + inp("exam.start", D.exam.start, "time") + '</label><label>Arrive by' + inp("exam.arrive", D.exam.arrive, "time") + '</label><label>Exam centre' + inp("exam.centre", D.exam.centre, "text", "e.g. Instituto Cervantes") + '</label><label>Address / city' + inp("exam.location", D.exam.location, "text") + '</label></div><label>Other sessions (e.g. speaking on another day)' + inp("exam.sessions", D.exam.sessions, "text", "e.g. Speaking: Friday 14:30") + '</label><p class="small muted">This records your booking; it doesn\'t book the exam.</p>' : "") + "</section>" +
      '<section class="block"><h2>3 · When you can study</h2><p class="small muted">Add your free time windows, then how many minutes of that time you want scheduled. Free time and study time are separate: I won\'t fill every free hour.</p><div class="plavail">' +
      [1, 2, 3, 4, 5, 6, 0].map((d) => { const ws = D.avail[d] || [], cap = ws.reduce((n, w) => n + Math.max(0, (plMin(w.e) || 0) - (plMin(w.s) || 0)), 0);
        return '<div class="plad"><b>' + PL_DAYS[d] + '</b><div class="plws">' + ws.map((w, i) => '<span class="plw">' + inp("avail." + d + "." + i + ".s", w.s, "time", "", ' aria-label="' + PL_DAYS[d] + ' window ' + (i + 1) + ' from"') + "–" + inp("avail." + d + "." + i + ".e", w.e, "time", "", ' aria-label="' + PL_DAYS[d] + ' window ' + (i + 1) + ' to"') + '<button class="btn small" data-act="pl-wdel" data-d="' + d + '" data-i="' + i + '" aria-label="Remove window">✕</button></span>').join("") + '<button class="btn small" data-act="pl-wadd" data-d="' + d + '">+ window</button></div>' +
          '<label class="plwant">Schedule ' + inp("want." + d, D.want[d] || 0, "number", "", ' min="0" max="' + cap + '" step="5" inputmode="numeric"') + " of " + cap + " min</label></div>"; }).join("") + "</div>" +
      '<div class="row"><button class="btn small" data-act="pl-copy" data-v="weekdays">Copy Monday to all weekdays</button><button class="btn small" data-act="pl-copy" data-v="weekend">Copy Saturday to Sunday</button></div><p class="small"><b>' + plWeekMin(D) + " min a week</b> (" + Math.round(plWeekMin(D) / 6) / 10 + " h)</p>" +
      '<div class="plgrid"><label>Session length (min)' + inp("sessionLen", D.sessionLen, "number", "", ' min="10" max="180" step="5"') + '</label><label>Break between sessions (min)' + inp("breakLen", D.breakLen, "number", "", ' min="0" max="60" step="5"') + '</label><label>Time zone' + inp("tz", D.tz, "text", plTZ(), ' list="pl-tzs" autocomplete="off"') + '<datalist id="pl-tzs">' + (Intl.supportedValuesOf ? Intl.supportedValuesOf("timeZone").map((z) => '<option value="' + z + '">').join("") : "") + "</datalist></label></div></section>" +
      '<section class="block"><h2>4 · Days you can\'t study</h2>' + (D.off || []).map((o, i) => '<div class="row plo">' + inp("off." + i + ".from", o.from, "date", "", ' aria-label="From"') + "–" + inp("off." + i + ".to", o.to, "date", "", ' aria-label="To"') + inp("off." + i + ".label", o.label, "text", "Holiday, trip…") + '<button class="btn small" data-act="pl-odel" data-i="' + i + '" aria-label="Remove">✕</button></div>').join("") + '<button class="btn small" data-act="pl-oadd">+ Add dates</button></section>' +
      '<section class="block"><h2>5 · Reminders</h2>' + chk("remind.on", D.remind.on, "Remind me before study sessions") + '<div class="plgrid"><label>Minutes before' + inp("remind.before", D.remind.before, "number", "", ' min="0" max="120" step="5"') + '</label><label>Quiet from' + inp("remind.quietFrom", D.remind.quietFrom, "time") + '</label><label>Quiet until' + inp("remind.quietTo", D.remind.quietTo, "time") + '</label><label>At most per day' + inp("remind.maxPerDay", D.remind.maxPerDay, "number", "", ' min="1" max="6"') + "</label></div>" +
      chk("remind.missed", D.remind.missed, "A gentle nudge if a session is missed") + chk("remind.revision", D.remind.revision, "Flashcards due") + chk("remind.mock", D.remind.mock, "The day before a mock exam") + chk("remind.booking", D.remind.booking, "Remind me to confirm my booking") + chk("remind.examDay", D.remind.examDay, "Exam date and arrival time") +
      '<p class="small muted">Reminders: ' + (window.AndroidApp && AndroidApp.setPlanReminders ? "Android notifications (respecting your phone's permission)." : window.AndroidApp ? "update the Android app to get plan reminders." : "only in the Android app; this browser can't schedule them.") + "</p></section>" +
      (v.err.length ? '<p class="plwarn">' + v.err.map(esc).join("<br>") + "</p>" : "") +
      '<div class="row plformbtns"><button class="btn primary" data-act="pl-review"' + (v.missing.length || v.err.length ? " disabled" : "") + '>Review the plan ›</button><button class="btn" data-act="pl-profe">🗣️ Ask Profe to finish</button>' + (v.missing.length ? '<span class="small muted">Still needed: ' + v.missing.join(", ") + "</span>" : "") + "</div><p class=\"small muted\">Your draft saves as you type.</p></div>";
    return h;
  }
  function plSummaryLines(D) {
    const days = [1, 2, 3, 4, 5, 6, 0].filter((d) => +D.want[d] > 0).map((d) => PL_D3[d] + " " + (D.avail[d] || []).map((w) => w.s + "–" + w.e).join(", ") + " (" + D.want[d] + " min)");
    const v = plValidate(D);
    return [["Level", (D.current ? D.current.toUpperCase() : "?") + " → DELE " + (D.target ? D.target.toUpperCase() : "?")], ["Exam", D.exam.date ? plFmtDay(D.exam.date, { day: "numeric", month: "long", year: "numeric" }) + (D.exam.booked ? " · booked" + (D.exam.start ? ", starts " + D.exam.start : "") + (D.exam.arrive ? ", arrive " + D.exam.arrive : "") + (D.exam.centre ? ", " + D.exam.centre : "") : " · provisional (not booked)") : "no date yet (12-week plan)"],
      ["Study days", days.length ? days.join("; ") : "—"], ["Weekly commitment", plWeekMin(D) + " min (" + Math.round(plWeekMin(D) / 6) / 10 + " h)"], ["Sessions", D.sessionLen + " min with " + D.breakLen + " min breaks"], ["Unavailable", (D.off || []).length ? D.off.map((o) => o.from + (o.to && o.to !== o.from ? "→" + o.to : "") + (o.label ? " " + o.label : "")).join("; ") : "none"],
      ["Priority skills", (D.priority || []).length ? D.priority.map((k) => ({ lectura: "reading", auditiva: "listening", escritura: "writing", oral: "speaking" }[k])).join(", ") : "balanced"], ["Reminders", D.remind.on ? D.remind.before + " min before; quiet " + D.remind.quietFrom + "–" + D.remind.quietTo : "off"], ["Time zone", D.tz], ["Still optional", v.optional.join("; ") || "—"]];
  }
  function plReviewHTML() {
    const D = plDraft(), v = plValidate(D), g = v.ok ? plGenerate(D, true) : null, A = plActive();
    let h = '<section class="block"><h2>Review</h2><dl class="plsum">' + plSummaryLines(D).map(([k, x]) => "<dt>" + k + "</dt><dd>" + esc(x) + "</dd>").join("") + "</dl>";
    if (!v.ok) return h + '<p class="plwarn">' + v.err.concat(v.missing.map((m) => "Missing: " + m)).map(esc).join("<br>") + '</p><button class="btn" data-act="pl-view" data-v="setup">‹ Edit</button></section>';
    const f = g.feas, wk = Math.round(f.capTotal / f.weeks);
    h += '<h3>What the plan will do</h3><p>' + g.sessions.filter((s) => s.date >= plToday()).length + " sessions over " + f.weeks + " weeks (" + Math.round(f.capTotal / 60) + " h scheduled, about " + Math.round(wk / 6) / 10 + ' h a week, ~10% kept as catch-up time).</p>' +
      '<p class="small muted">Language-development guideline: about ' + f.glh.gap + " guided hours from " + (D.current || "beginner").toUpperCase() + " to " + D.target.toUpperCase() + " (Cambridge guided-learning-hours table) plus ~" + f.glh.prep + " h of exam preparation. The app schedules its own lessons, practice and mocks; real progress also depends on practice outside the app. This is not a pass guarantee.</p>";
    if (f.short > 0) h += '<p class="plwarn">⚠️ About ' + Math.round(f.short / 60) + " h short of what the remaining material needs (" + (f.unscheduled.units ? f.unscheduled.units + " units, " : "") + (f.unscheduled.guides ? f.unscheduled.guides + " guides, " : "") + (f.unscheduled.timed ? f.unscheduled.timed + " timed sections" : "") + " won't fit). Options: add about " + f.alt.moreMinPerWeek + " min a week; move the date about " + f.alt.laterWeeks + " weeks later; or keep this prioritised plan.</p>";
    if (A) { const d = plDiff(A.sessions, g.sessions); h += '<p class="small"><b>Changes to your current plan:</b> upcoming sessions ' + d.before.n + " → " + d.after.n + " (" + Math.round(d.before.min / 60) + " h → " + Math.round(d.after.min / 60) + " h). Completed work is kept.</p>"; }
    return h + '<div class="row"><button class="btn primary" data-act="pl-gen">' + (A ? "Save the revised plan" : "Create my plan") + '</button><button class="btn" data-act="pl-view" data-v="setup">‹ Edit</button></div></section>';
  }
  function plRubricNote() { return '<p class="small muted plnote">How time is estimated: the Cambridge English guided-learning-hours guideline (about 200 hours per level step, cumulative from beginner) sets expectations; the plan itself is built from what is actually left in the app (units, guides, questions, exam papers) and your own pace once there is data. <button class="lnk" data-act="pl-about">How the estimates work</button></p>'; }
  function plAbout() { openSheet('<h2>How the study plan estimates time</h2><p>The plan is built from what is actually left for you in this app (lessons up to your target, grammar guides you haven\'t practised, exam papers) and the minutes you chose to study. Once you have done some sessions, your own pace replaces the default durations.</p><h3>The guideline it starts from</h3><ul><li><b>Cumulative guided learning hours</b> (Cambridge English): about A1 90–100, A2 180–200, B1 350–400, B2 500–600, C1 700–800, C2 1,000–1,200 hours from beginner — roughly 200 hours per level step.</li><li><b>Per-level (additional) hours</b> (LanguageCert): A1 95, A2 95, B1 180, B2 180, C1 200, C2 250.</li><li><b>Spanish specifically</b>: the US Foreign Service Institute puts Spanish in its easiest group for English speakers, about 600–750 class hours (24–30 weeks) to professional working proficiency.</li></ul><h3>What these numbers are not</h3><p>They count <i>guided</i> hours with a teacher, were written for English or general CEFR learning, and are guidelines, not promises. Independent practice, prior knowledge and exposure all change the real figure. The plan separates <b>language development</b> (lessons and guides) from <b>exam preparation</b> (timed sections and full mocks, about ' + PL_RUBRIC.examPrepH.b1 + ' h at B1, more at higher levels), and keeps about 10% of the time free for catching up.</p><h3>How a week is mixed</h3><p>Early on most time goes to new material and guided practice; as the exam gets closer the mix moves toward question practice, timed sections and full mock exams. Skills you mark as weak get extra time. Unseen mock papers are kept back for full timed mocks near the exam.</p><p class="small muted">Sources (checked 15 November 2026): <a href="https://support.cambridgeenglish.org/hc/en-gb/articles/202838506" target="_blank" rel="noopener">Cambridge English: guided learning hours</a> · <a href="https://www.languagecert.org/en/Guided-Learning-Hours" target="_blank" rel="noopener">LanguageCert: guided learning hours</a> · <a href="https://www.state.gov/foreign-language-training/" target="_blank" rel="noopener">US FSI language difficulty</a></p><button class="btn" data-act="l-close">Close</button>'); }
  // form editing
  function plSetPath(D, path, val) {
    const ks = path.split("."); let o = D;
    if (ks[0] === "priority") { D.priority = D.priority || []; const i = D.priority.indexOf(ks[1]); if (val && i < 0) D.priority.push(ks[1]); if (!val && i >= 0) D.priority.splice(i, 1); return; }
    for (let i = 0; i < ks.length - 1; i++) { o = o[ks[i]]; if (o == null) return; }
    const last = ks[ks.length - 1];
    if (/^(want|sessionLen|breakLen)$/.test(ks[0]) || /^(before|maxPerDay)$/.test(last)) val = Math.max(0, Math.round(+val || 0));
    if (path === "exam.booked") { val = !!val; D.exam.provisional = !val; }
    o[last] = val;
    if (path === "current") D.currentSrc = "you";
  }
  document.addEventListener("change", (e) => { const t = e.target; if (!t.dataset || !t.dataset.pf || location.hash !== "#plan") return; const D = plDraft(); plSetPath(D, t.dataset.pf, t.type === "checkbox" ? t.checked : t.value); plSaveDraft(D); if (/^(exam\.booked|target|current)$/.test(t.dataset.pf) || /^avail\./.test(t.dataset.pf)) planPage(); else { const b = document.querySelector('[data-act="pl-review"]'), v = plValidate(D); if (b) b.disabled = !!(v.missing.length || v.err.length); } });
  document.addEventListener("click", (e) => {
    const t = e.target.closest && e.target.closest("[data-act]"); if (!t) return; const a = t.dataset.act; if (!/^pl-/.test(a)) return;
    const D = plDraft(), A = plActive();
    if (a === "pl-view") { PLUI.view = t.dataset.v; PLUI.day = null; if (location.hash !== "#plan") location.hash = "#plan"; else planPage(); }
    else if (a === "pl-day") { PLUI.day = t.dataset.v || null; PLUI.view = "agenda"; planPage(); }
    else if (a === "pl-wk") { PLUI.wk = plAddDays(PLUI.wk || plToday(), +t.dataset.d); planPage(); }
    else if (a === "pl-mo") { const [y, m] = (PLUI.mo || plToday().slice(0, 7)).split("-").map(Number), d = new Date(y, m - 1 + +t.dataset.d, 1); PLUI.mo = d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0"); planPage(); }
    else if (a === "pl-wadd") { const d = +t.dataset.d; D.avail[d] = D.avail[d] || []; const last = D.avail[d][D.avail[d].length - 1]; D.avail[d].push(last ? { s: plHHMM(Math.min(1380, plMin(last.e) + 60)), e: plHHMM(Math.min(1439, plMin(last.e) + 120)) } : { s: "18:00", e: "20:00" }); plSaveDraft(D); planPage(); }
    else if (a === "pl-wdel") { D.avail[+t.dataset.d].splice(+t.dataset.i, 1); const d = +t.dataset.d, cap = D.avail[d].reduce((n, w) => n + Math.max(0, plMin(w.e) - plMin(w.s)), 0); D.want[d] = Math.min(+D.want[d] || 0, cap); plSaveDraft(D); planPage(); }
    else if (a === "pl-copy") { const src = t.dataset.v === "weekdays" ? 1 : 6, to = t.dataset.v === "weekdays" ? [2, 3, 4, 5] : [0]; to.forEach((d) => { D.avail[d] = JSON.parse(JSON.stringify(D.avail[src] || [])); D.want[d] = D.want[src] || 0; }); plSaveDraft(D); planPage(); }
    else if (a === "pl-oadd") { D.off = D.off || []; D.off.push({ from: plAddDays(plToday(), 7), to: plAddDays(plToday(), 7), label: "" }); plSaveDraft(D); planPage(); }
    else if (a === "pl-odel") { D.off.splice(+t.dataset.i, 1); plSaveDraft(D); planPage(); }
    else if (a === "pl-review") { PLUI.view = "review"; planPage(); }
    else if (a === "pl-gen") { const g = plGenerate(D, true); if (!g.ok) { PLUI.view = "setup"; planPage(); return; } const ok = plCommit(g); PLUI.view = "agenda"; planPage(); try { coachToast(ok ? "✓ Study plan saved · " + g.sessions.filter((s) => s.date >= plToday()).length + " sessions" : "✗ The plan couldn't be saved (storage full?). Your answers are kept as a draft."); } catch (x) {} }
    else if (a === "pl-replan" || a === "pl-catchup") { PLUI.view = "review"; if (A) { S.plan.draft = JSON.parse(JSON.stringify(Object.assign({}, A.profile, plState().draft && S.plan.draftAt > A.created ? plState().draft : {}))); save(); } planPage(); }
    else if (a === "pl-start") plStart(t.dataset.id);
    else if (a === "pl-done") { plMark(t.dataset.id, "done"); planPage(); }
    else if (a === "pl-undo") { plMark(t.dataset.id, "undo"); planPage(); }
    else if (a === "pl-part") { const s = A && A.sessions.find((x) => x.id === t.dataset.id); const m = prompt("How many minutes did you do? (of " + (s ? s.min : "?") + ")", s ? Math.round(s.min / 2) : 15); if (m != null) { plMark(t.dataset.id, "partial", m); planPage(); } }
    else if (a === "pl-move") { const s = A && A.sessions.find((x) => x.id === t.dataset.id); if (!s) return; const day = prompt("Move to which day? (YYYY-MM-DD)", s.date); if (!day) return; const tm = prompt("At what time? (HH:MM, inside your free time)", s.start); if (!tm) return; const err = plMove(s.id, day, tm); if (err) alert(err); planPage(); }
    else if (a === "pl-about") plAbout();
    else if (a === "pl-profe") { try { tOpen(); } catch (x) {} setTimeout(() => planChatStart(), 150); }
  });
  // ---- Profe's guided setup: one question at a time, answers with several details, corrections, pause/resume ----
  const PCQ = { // the questions (required first; optional ones can be skipped)
    target: "Which DELE level are you preparing for (A1, A2, B1, B2, C1 or C2)?",
    current: "What's your current level? Say a level, or “not sure” (I can suggest the placement test).",
    date: "When would you like to take the exam? A date like “23 May 2027”, a month, or “not sure yet” — a provisional date is fine.",
    booked: "Have you booked it yet?",
    days: "Which days can you study? For example “weekdays and Saturday”.",
    times: "What times are you free on those days? For example “weekdays 7 to 9 pm, Saturday 9 to 12”.",
    want: "How much of that time would you like me to schedule? For example “45 minutes on weekdays and two hours on Saturday”.",
    skills: "Which skills do you find hardest — reading, listening, writing or speaking? (Say “none” for a balanced plan.)",
    remind: "Would you like reminders? For example “15 minutes before”, or “no reminders”.",
  };
  const PCOPT = { session: "How long should one session be? I'll use 30 minutes with 5-minute breaks unless you'd like something else.", off: "Any dates you can't study, like holidays or trips? Say “none” to skip.", examDetails: "Do you know the start time and the exam centre? You can skip this and add it later." };
  const PC_NUM = { one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10, eleven: 11, twelve: 12, fifteen: 15, twenty: 20, thirty: 30, forty: 40, "forty-five": 45, fortyfive: 45, ninety: 90, half: 0.5, an: 1, a: 1, un: 1, una: 1, dos: 2, tres: 3 };
  const PC_DAY = { sun: 0, sunday: 0, sundays: 0, domingo: 0, domingos: 0, mon: 1, monday: 1, mondays: 1, lunes: 1, tue: 2, tues: 2, tuesday: 2, tuesdays: 2, martes: 2, wed: 3, wednesday: 3, wednesdays: 3, miercoles: 3, thu: 4, thur: 4, thurs: 4, thursday: 4, thursdays: 4, jueves: 4, fri: 5, friday: 5, fridays: 5, viernes: 5, sat: 6, saturday: 6, saturdays: 6, sabado: 6, sabados: 6 };
  const PC_MON = { jan: 0, january: 0, enero: 0, feb: 1, february: 1, febrero: 1, mar: 2, march: 2, marzo: 2, apr: 3, april: 3, abril: 3, may: 4, mayo: 4, jun: 5, june: 5, junio: 5, jul: 6, july: 6, julio: 6, aug: 7, august: 7, agosto: 7, sep: 8, sept: 8, september: 8, septiembre: 8, oct: 9, october: 9, octubre: 9, nov: 10, november: 10, noviembre: 10, dec: 11, december: 11, diciembre: 11 };
  const pcNorm = (s) => String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[’']/g, "").replace(/\s+/g, " ").trim();
  const pcNum = (w) => (w == null ? null : /^\d+(\.\d+)?$/.test(w) ? +w : PC_NUM[w] != null ? PC_NUM[w] : null);
  function pcDays(t) { // "weekdays", "monday to friday", "mon, wed and fri", "weekends", "every day"
    const s = pcNorm(t), out = new Set();
    if (/\b(every ?day|all days|daily|todos los dias|cada dia|7 days)\b/.test(s)) [0, 1, 2, 3, 4, 5, 6].forEach((d) => out.add(d));
    if (/\b(weekdays?|week days|work ?days|entre semana|monday to friday|mon(day)?\s*(-|to|through|–)\s*fri(day)?|lunes a viernes)\b/.test(s)) [1, 2, 3, 4, 5].forEach((d) => out.add(d));
    if (/\b(weekends?|fines? de semana)\b/.test(s)) [0, 6].forEach((d) => out.add(d));
    const rng = /\b(sun|mon|tue|tues|wed|thu|thur|thurs|fri|sat)[a-z]*\s*(?:-|to|through|until|–|a)\s*(sun|mon|tue|tues|wed|thu|thur|thurs|fri|sat)[a-z]*\b/.exec(s);
    if (rng) { let a = PC_DAY[rng[1]], b = PC_DAY[rng[2]]; for (let i = 0; i < 7; i++) { out.add(a); if (a === b) break; a = (a + 1) % 7; } }
    s.split(/[^a-z]+/).forEach((w) => { if (PC_DAY[w] != null) out.add(PC_DAY[w]); });
    if (/\bexcept\b|\bbut not\b|\bmenos\b/.test(s)) { const tail = s.split(/\bexcept\b|\bbut not\b|\bmenos\b/)[1] || ""; tail.split(/[^a-z]+/).forEach((w) => { if (PC_DAY[w] != null) out.delete(PC_DAY[w]); }); }
    return [...out];
  }
  function pcTimeTok(n, ap, ctxPM) { let h = +n.split(":")[0], m = +(n.split(":")[1] || 0); if (ap === "pm" && h < 12) h += 12; if (ap === "am" && h === 12) h = 0; if (!ap && ctxPM && h < 12) h += 12; return h * 60 + m; }
  function pcWindows(t) { // "7 to 9 pm", "19:00-21:00", "from 6 to 8", "9am-12"; vague words come back as a question
    const s = pcNorm(t).replace(/\bnoon\b|\bmidday\b|\bmediodia\b/g, "12pm").replace(/\bmidnight\b/g, "11:59pm").replace(/(\d)\s*(a\.?m\.?|p\.?m\.?)/g, (x, d, ap) => d + (ap[0] === "a" ? "am" : "pm")), out = [], vague = [];
    const re = /(?:from\s+|de\s+)?(\d{1,2}(?::\d{2})?)\s*(am|pm)?\s*(?:-|–|to|until|till|a|hasta)\s*(\d{1,2}(?::\d{2})?)\s*(am|pm)?/g; let m;
    while ((m = re.exec(s))) { const pm = m[4] === "pm" || (/evening|night|tarde|noche/.test(s) && !m[2] && !m[4]); let a = pcTimeTok(m[1], m[2] || (m[4] === "pm" && +m[1].split(":")[0] < +m[3].split(":")[0] ? "pm" : m[2]), pm && !m[2]), b = pcTimeTok(m[3], m[4], pm);
      if (b <= a && b + 720 > a && !m[4]) b += 720; if (b > a && a >= 0 && b <= 1440) out.push({ s: plHHMM(a), e: plHHMM(Math.min(1439, b)) }); }
    const V = [["early mornings?", "06:00", "08:00"], ["mornings?|por la manana", "08:00", "11:00"], ["lunch ?times?|lunch|a la hora de comer", "12:30", "13:30"], ["afternoons?|por la tarde", "15:00", "18:00"], ["evenings?|nights?|por la noche", "18:30", "21:00"]];
    if (!out.length) V.forEach(([w, a, b]) => { if (new RegExp("\\b(" + w + ")\\b").test(s)) vague.push({ word: (new RegExp("\\b(" + w + ")\\b").exec(s) || [])[1], s: a, e: b }); });
    return { out, vague };
  }
  function pcMinutes(t) { // "45 minutes", "an hour", "1.5 hours", "two hours", "half an hour", "an hour and a half"
    const s = pcNorm(t).replace(/an hour and a half|one and a half hours?|1 and a half hours?/g, "90 minutes").replace(/half an hour|media hora/g, "30 minutes").replace(/hora y media/g, "90 minutos");
    const m = /(\d+(?:\.\d+)?|one|two|three|four|five|six|an|a|un|una|dos|tres|ten|fifteen|twenty|thirty|forty|forty-five|ninety)\s*(hours?|hrs?|h\b|horas?|minutes?|mins?|minutos?|m\b)/.exec(s);
    if (!m) return null; const n = pcNum(m[1]); if (n == null) return null; return Math.round(/^h/.test(m[2]) ? n * 60 : n);
  }
  function pcWantClauses(t, days) { // "45 minutes on weekdays and two hours on Saturday" / "an hour a day" / "5 hours a week"
    const s = pcNorm(t), res = {}, parts = s.split(/,|;|\band\b|\by\b|\bplus\b/);
    let any = false;
    const perWeek = /(a|per|each|every|por|a la)\s*(week|semana)/.test(s);
    parts.forEach((p) => { const m = pcMinutes(p); if (m == null) return; const ds = pcDays(p); any = true; (ds.length ? ds : days).forEach((d) => (res[d] = m)); });
    if (!any) { if (/\b(all|everything|all of it|todo)\b/.test(s)) return { all: true }; const half = /\bhalf\b|\bla mitad\b/.test(s); if (half) return { half: true }; return null; }
    if (perWeek && Object.keys(res).length) { const tot = Object.values(res)[0], dd = days.length ? days : Object.keys(res).map(Number); const each = Math.round(tot / dd.length / 5) * 5; const o = {}; dd.forEach((d) => (o[d] = each)); return { per: o }; }
    return { per: res };
  }
  function pcDate(t) { // returns { date } or { month } (needs a day) or { none } or null
    const s = pcNorm(t), now = new Date();
    if (/\b(not sure|no idea|dont know|don't know|no se|sin fecha|no date|undecided|later|todavia no)\b/.test(s)) return { none: true };
    let m = /(\d{4})-(\d{1,2})-(\d{1,2})/.exec(s); if (m) return { date: plKey(new Date(+m[1], +m[2] - 1, +m[3])) };
    m = /\b(\d{1,2})[\/.](\d{1,2})[\/.](\d{2,4})\b/.exec(s); if (m) { const y = +m[3] < 100 ? 2000 + +m[3] : +m[3]; return { date: plKey(new Date(y, +m[2] - 1, +m[1])) }; }
    const mon = Object.keys(PC_MON).sort((a, b) => b.length - a.length).find((k) => new RegExp("\\b" + k + "\\b").test(s));
    if (mon) { const mi = PC_MON[mon], d = (new RegExp("\\b(\\d{1,2})(?:st|nd|rd|th)?\\s*(?:of\\s+|de\\s+)?" + mon + "\\b").exec(s) || new RegExp("\\b" + mon + "\\s*(\\d{1,2})(?:st|nd|rd|th)?\\b").exec(s) || [])[1], y = (/\b(20\d\d)\b/.exec(s) || [])[1];
      let yr = y ? +y : now.getFullYear(); if (!y && (mi < now.getMonth() || (mi === now.getMonth() && d && +d <= now.getDate()))) yr++;
      if (d) return { date: plKey(new Date(yr, mi, +d)) }; return { month: { y: yr, m: mi } }; }
    m = /\bin\s+(\d+|one|two|three|four|five|six|eight|ten|twelve)\s*(weeks?|months?|semanas?|meses?)\b/.exec(s); if (m) { const n = pcNum(m[1]), d = new Date(); if (/^(week|seman)/.test(m[2])) d.setDate(d.getDate() + n * 7); else d.setMonth(d.getMonth() + n); return { date: plKey(d), approx: true }; }
    m = /\bnext\s+(sun|mon|tue|tues|wed|thu|thur|thurs|fri|sat)[a-z]*\b/.exec(s); if (m) { const want = PC_DAY[m[1]], d = new Date(); let add = (want - d.getDay() + 7) % 7; if (add === 0) add = 7; d.setDate(d.getDate() + add); return { date: plKey(d), nextDay: true }; }
    return null;
  }
  function pcSkills(t) { const s = pcNorm(t), o = []; if (/\b(reading|read|lectura|leer)\b/.test(s)) o.push("lectura"); if (/\b(listening|listen|auditiva|escuchar|comprension auditiva)\b/.test(s)) o.push("auditiva"); if (/\b(writing|write|escritura|escribir)\b/.test(s)) o.push("escritura"); if (/\b(speaking|speak|talking|oral|hablar|conversation)\b/.test(s)) o.push("oral"); return o; }
  function pcLevels(t) { return (pcNorm(t).match(/\b(a1|a2|b1|b2|c1|c2)\b/g) || []); }
  const pcYes = (t) => /^(yes|yeah|yep|yup|sure|ok|okay|correct|right|thats right|that's right|si|sí|vale|claro|exacto|confirm|confirmed|go ahead|do it|create it|perfect|perfecto|sounds good|looks good)\b/.test(pcNorm(t));
  const pcNo = (t) => /^(no|nope|not yet|todavia no|not really|nah|wrong|incorrect)\b/.test(pcNorm(t));
  function planChatOn() { const c = S.plan && S.plan.chat; return !!(c && c.on && !c.paused); }
  function pcSay(text, origin) { try { pvReply(text, origin || "chat", { listen: 1 }); } catch (e) { try { logMsg("a", text); tRender(); } catch (x) {} } }
  function planChatStart(origin) {
    plState(); const D = plDraft(), c = (S.plan.chat = S.plan.chat || {}), resumed = c.started && !c.done;
    c.on = true; c.paused = false; c.started = c.started || Date.now(); c.done = false; c.confirm = false; c.clar = null; c.asked = c.asked || {}; c.origin = origin || "chat"; save();
    const known = []; if (D.target) known.push("target DELE " + D.target.toUpperCase()); if (D.current) known.push("current level " + D.current.toUpperCase() + (D.currentSrc ? " (from " + D.currentSrc + ")" : "")); if (plWeekMin(D)) known.push(plWeekMin(D) + " minutes a week");
    const intro = resumed ? "Let's carry on with your study plan." : "Let's make your study plan. I'll ask a few short questions — you can answer several things at once, correct anything, or say “pause” and come back later. Then I'll show a summary for you to confirm before I create the calendar.";
    pcSay(intro + (known.length ? " I already have: " + known.join(", ") + ". Tell me if any of that is wrong. " : " ") + pcNext(), origin);
  }
  function pcNext() { // the next missing or unclear detail
    const D = plDraft(), c = S.plan.chat;
    if (c.clar) return c.clar.q;
    if (!D.target) return PCQ.target;
    if (!D.current) return PCQ.current;
    if (!c.asked.date && !D.exam.date) return PCQ.date;
    if (D.exam.date && c.asked.booked == null && !D.exam.booked) return PCQ.booked;
    if (D.exam.booked && !c.asked.examDetails && !D.exam.centre && !D.exam.start) { c.asked.examDetails = 1; return PCOPT.examDetails; }
    if (!(c.days || []).length && !Object.values(D.avail).some((w) => w.length)) return PCQ.days;
    if ((c.days || []).length && !(c.days || []).every((d) => (D.avail[d] || []).length)) return PCQ.times.replace("on those days", "on " + c.days.filter((d) => !(D.avail[d] || []).length).map((d) => PL_DAYS[d]).join(", "));
    if (!plWeekMin(D)) return PCQ.want;
    if (!c.asked.session) { c.asked.session = 1; return PCOPT.session; }
    if (!c.asked.off) { c.asked.off = 1; return PCOPT.off; }
    if (!c.asked.skills) return PCQ.skills;
    if (!c.asked.remind) return PCQ.remind;
    c.confirm = true; return pcSummary();
  }
  function pcSummary() {
    const D = plDraft(), v = plValidate(D);
    const L = plSummaryLines(D).filter(([k]) => k !== "Still optional").map(([k, x]) => "• " + k + ": " + x).join("\n");
    return "Here's what I have:\n" + L + (v.optional.length ? "\n(Optional, can add later: " + v.optional.join("; ") + ".)" : "") + (v.err.length ? "\n⚠️ " + v.err.join(" ") : "") + "\nShall I create the plan? Say “yes”, or tell me what to change (for example “make Saturdays one hour instead”).";
  }
  function planChatTurn(raw, origin) {
    const c = S.plan.chat, D = plDraft(), s = pcNorm(raw); let notes = [];
    try { if (origin === "chat" || (origin === "voice" && document.body.classList.contains("tutor-open"))) { if (!tCur) ensureSession(pageCtx().label, raw); tCur.msgs.push({ r: "u", c: raw, t: Date.now() }); } } catch (e) {}
    if (/^(pause|stop|later|cancel|exit|quit|para|basta|luego|despues)\b/.test(s)) { c.paused = true; save(); return pcSay("Paused. Your answers are saved as a draft — say “set up my study plan” to continue, or edit it in Study plan › Set up.", origin); }
    if (/\b(open the form|edit (it )?(in the form|myself)|let me (fill|edit))\b/.test(s)) { c.paused = true; save(); PLUI.view = "setup"; location.hash = "#plan"; return pcSay("Opening the form with everything filled in so far.", origin); }
    // answering a clarification ("by evenings, 6:30–9 pm?")
    if (c.clar) { const k = c.clar; if (pcYes(raw)) { k.apply(); c.clar = null; } else if (pcNo(raw) && !pcWindows(raw).out.length) { c.clar = null; notes.push("OK — tell me the exact times then."); } else c.clar = null; }
    if (c.confirm && pcYes(raw) && !/\b(make|change|instead|but)\b/.test(s)) return pcGenerate(origin);
    const before = JSON.stringify(D);
    // levels: "from A2 to B1", "I'm A2", "preparing for B1"
    const lv = pcLevels(raw);
    if (lv.length >= 2) { D.current = lv[0]; D.target = lv[1]; D.currentSrc = "you"; }
    else if (lv.length === 1) { const L = lv[0]; if (/\b(current|now|i am|im|i'm|my level|at the moment|ahora|actualmente|estoy en|tengo)\b/.test(s) && !/\b(prepar|target|take|aim|sit|exam|examen|presentar)\b/.test(s)) { D.current = L; D.currentSrc = "you"; } else if (!D.target || /\b(prepar|target|take|aim|sit|exam|examen|instead|actually|change)\b/.test(s)) D.target = L; else if (!D.current) { D.current = L; D.currentSrc = "you"; } }
    if (!D.current && /\b(not sure|no idea|dont know|no se)\b/.test(s) && D.target && !c.asked.date) { D.current = "a1"; D.currentSrc = "a guess (take the placement test to check)"; notes.push("I'll start from A1 for now — the placement test (Course › Find your level) can update it."); }
    if (D.current && D.target && c.asked.current == null && pcYes(raw) && !lv.length) c.asked.current = 1;
    // exam date and booking
    const askedDate = !c.asked.date && D.target && D.current;
    const dt = pcDate(raw);
    if (dt) { c.asked.date = 1;
      if (dt.date) { if (dt.date <= plToday()) notes.push("That date has passed — which future date?"); else { D.exam.date = dt.date; if (dt.nextDay) notes.push("Next " + PL_DAYS[plDate(dt.date).getDay()] + " is " + plFmtDay(dt.date, { day: "numeric", month: "long" }) + "."); if (dt.approx) notes.push("I'll use " + plFmtDay(dt.date, { day: "numeric", month: "long", year: "numeric" }) + " as a provisional date."); } }
      else if (dt.month) { const d = new Date(dt.month.y, dt.month.m + 1, 0); while (d.getDay() !== 6) d.setDate(d.getDate() - 1); const k = plKey(d); c.clar = { q: "Which day in " + d.toLocaleDateString(undefined, { month: "long" }) + "? DELE dates are set by the Instituto Cervantes. Shall I use Saturday " + plFmtDay(k, { day: "numeric", month: "long" }) + " as a provisional date?", apply: () => { D.exam.date = k; } }; }
      else if (dt.none) { D.exam.date = ""; notes.push("No problem: I'll plan 12 weeks and you can add a date later."); } }
    else if (askedDate && !lv.length && !pcDays(raw).length && pcNo(raw)) { c.asked.date = 1; }
    if (/\b(booked|registered|inscrit|reserv)/.test(s)) { if (/\b(not|haven'?t|havent|no|todavia no|aun no)\b/.test(s)) { D.exam.booked = false; D.exam.provisional = true; } else { D.exam.booked = true; D.exam.provisional = false; } c.asked.booked = 1; }
    else if (D.exam.date && c.asked.booked == null && !lv.length && !dt) { if (pcYes(raw)) { D.exam.booked = true; D.exam.provisional = false; c.asked.booked = 1; } else if (pcNo(raw)) { D.exam.booked = false; c.asked.booked = 1; } }
    if (D.exam.booked) { const tm = /\b(?:starts?|start time|begins?|empieza)\s*(?:at)?\s*(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)/.exec(s), ar = /\b(?:arrive|arrival|be there|llegar)\s*(?:by|at)?\s*(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)/.exec(s);
      const tt = (x) => { const m = /(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/.exec(x); return plHHMM(pcTimeTok(m[1] + (m[2] ? ":" + m[2] : ""), m[3])); };
      if (tm) D.exam.start = tt(tm[1]); if (ar) D.exam.arrive = tt(ar[1]);
      const ce = /\b(?:at|in|en)\s+(?:the\s+)?((?:instituto cervantes|cervantes|university|universidad|centro|centre|center|academy|academia)[^,.;]*)/i.exec(raw); if (ce) D.exam.centre = ce[1].trim();
      if (c.asked.examDetails && /\b(skip|no|later|dont know|not sure)\b/.test(s)) c.asked.examDetails = 2; }
    // days, windows, amounts (several details at once; a day mentioned with a time or an amount counts)
    const days = pcDays(raw); if (days.length && !/\bcan'?t|cannot|not available|no puedo|except\b/.test(s)) c.days = [...new Set((c.days || []).concat(days))].sort();
    const W = pcWindows(raw);
    if (W.out.length) {
      const clauses = pcNorm(raw).split(/;|,|\band\b(?=\s*(?:on\s+)?(?:sun|mon|tue|wed|thu|fri|sat|week|weekend|every))/);
      let placed = false;
      clauses.forEach((cl) => { const w = pcWindows(cl).out, ds = pcDays(cl); if (!w.length) return; const target = ds.length ? ds : (c.days && c.days.length ? c.days : []); target.forEach((d) => { D.avail[d] = w.map((x) => ({ s: x.s, e: x.e })); }); if (target.length) placed = true; });
      if (!placed) notes.push("Which days do those times apply to?");
    } else if (W.vague.length && (c.days || []).length) { const v = W.vague[0], ds = c.days.filter((d) => !(D.avail[d] || []).length); const dd = ds.length ? ds : c.days; c.clar = { q: "By “" + v.word + "” do you mean about " + v.s + "–" + v.e + "? Say yes, or give the exact times.", apply: () => { dd.forEach((d) => (D.avail[d] = [{ s: v.s, e: v.e }])); } }; }
    // amounts: "make Saturdays one hour instead" also lands here
    const studyDays = [0, 1, 2, 3, 4, 5, 6].filter((d) => (D.avail[d] || []).length);
    const wc = pcWantClauses(raw, (days.length && pcMinutes(raw) != null) ? days : studyDays);
    if (wc && studyDays.length) {
      const cap = (d) => (D.avail[d] || []).reduce((n, w) => n + Math.max(0, plMin(w.e) - plMin(w.s)), 0);
      if (wc.all) studyDays.forEach((d) => (D.want[d] = cap(d))); else if (wc.half) studyDays.forEach((d) => (D.want[d] = Math.round(cap(d) / 2 / 5) * 5));
      else if (wc.per && (!/\b(session|sessions|break|breaks|pausa|before|antes)\b/.test(s) || /\b(on|a day|per day|al dia|a week)\b/.test(s))) Object.keys(wc.per).forEach((d) => { const m = wc.per[d], cp = cap(+d); if (!cp) { notes.push(PL_DAYS[d] + " has no free time yet — what times are you free that day?"); c.days = [...new Set((c.days || []).concat([+d]))]; return; } if (m > cp) { notes.push(PL_DAYS[d] + ": you have " + cp + " min free, so I'll schedule " + cp + " (you asked for " + m + ")."); D.want[d] = cp; } else D.want[d] = m; });
    }
    // session length and breaks
    const sl = /(\d+)\s*(?:-|\s)?\s*(?:min(?:ute)?s?)?\s*(?:sessions?|sesiones?)|sessions? of\s*(\d+)/.exec(s); if (sl) { D.sessionLen = Math.max(10, Math.min(180, +(sl[1] || sl[2]))); c.asked.session = 1; }
    const bl = /(\d+)\s*(?:-|\s)?\s*(?:min(?:ute)?s?)?\s*(?:breaks?|pausas?)|breaks? of\s*(\d+)/.exec(s); if (bl) { D.breakLen = Math.max(0, Math.min(60, +(bl[1] || bl[2]))); c.asked.session = 1; }
    if (c.asked.session === 1 && /^(fine|ok|okay|that'?s fine|good|default|keep|vale|bien)\b/.test(s)) c.asked.session = 2;
    // unavailable dates: "15 to 22 December", "from 20 Dec to 3 Jan", "none"
    const offm = /(\d{1,2})(?:st|nd|rd|th)?\s*(?:-|to|until|–|al?)\s*(\d{1,2})(?:st|nd|rd|th)?\s*(?:of\s+|de\s+)?([a-z]+)/.exec(s) || null, offm2 = /from\s+(.+?)\s+(?:to|until)\s+(.+)$/.exec(s);
    if (c.asked.off === 1 && /^(none|no|nothing|nope|ninguna|ninguno|nada)\b/.test(s)) c.asked.off = 2;
    else if (/\b(holiday|vacation|trip|away|travel|can'?t study|cannot study|unavailable|off|vacaciones|viaje)\b/.test(s) || c.asked.off === 1) {
      if (offm && PC_MON[offm[3]] != null) { const y = new Date().getFullYear(), mi = PC_MON[offm[3]]; let a = new Date(y, mi, +offm[1]), b = new Date(y, mi, +offm[2]); if (b < new Date()) { a.setFullYear(y + 1); b.setFullYear(y + 1); } D.off = (D.off || []).concat([{ from: plKey(a), to: plKey(b), label: /holiday|vacation|vacaciones/.test(s) ? "Holiday" : /trip|travel|viaje/.test(s) ? "Trip" : "Unavailable" }]); c.asked.off = 2; }
      else if (offm2) { const a = pcDate(offm2[1]), b = pcDate(offm2[2]); if (a && a.date && b && b.date) { D.off = (D.off || []).concat([{ from: a.date, to: b.date, label: "Unavailable" }]); c.asked.off = 2; } }
      else if (dt && dt.date && c.asked.off === 1 && c.asked.date) { D.off = (D.off || []).concat([{ from: dt.date, to: dt.date, label: "Unavailable" }]); c.asked.off = 2; }
    }
    // skills
    const sk = pcSkills(raw); if (sk.length && !/\b(not|easy|fine with|good at)\b/.test(s)) { D.priority = sk; c.asked.skills = 1; } else if (!c.asked.skills && c.asked.off && /^(none|no|balanced|all|nothing|todas)\b/.test(s) && plWeekMin(D)) { D.priority = []; c.asked.skills = 1; }
    // reminders
    if (/\b(no reminders?|without reminders?|dont remind|don't remind|sin recordatorios?)\b/.test(s) || (c.asked.skills && !c.asked.remind && pcNo(raw))) { D.remind.on = false; c.asked.remind = 1; }
    else { const rb = /(\d+|fifteen|ten|five|thirty|twenty)\s*(?:min(?:ute)?s?)\s*(?:before|antes)/.exec(s); if (rb) { D.remind.on = true; D.remind.before = pcNum(rb[1]); c.asked.remind = 1; } else if (c.asked.skills && !c.asked.remind && (pcYes(raw) || /\bremind/.test(s))) { D.remind.on = true; c.asked.remind = 1; }
      const qa = /(?:not|no)\s+(?:after|past)\s+(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)/.exec(s); if (qa) { const m = /(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/.exec(qa[1]); D.remind.quietFrom = plHHMM(pcTimeTok(m[1] + (m[2] ? ":" + m[2] : ""), m[3] || "pm")); c.asked.remind = 1; } }
    // time zone: "I'm in Madrid time" / a zone name
    const tz = /\b([A-Z][a-z]+\/[A-Z][A-Za-z_]+)\b/.exec(raw); if (tz && plTZok(tz[1])) D.tz = tz[1];
    const changed = JSON.stringify(D) !== before;
    plSaveDraft(D);
    if (c.confirm && changed) { c.confirm = false; notes.push("Updated."); }
    const v = plValidate(D); if (v.err.length && plWeekMin(D)) notes.push("⚠️ " + v.err[0]);
    if (!changed && !c.clar && !notes.length && !pcYes(raw) && !c.confirm) notes.push("Sorry, I didn't catch that.");
    pcSay((notes.length ? notes.join(" ") + " " : "") + pcNext(), origin);
  }
  function pcGenerate(origin) {
    const D = plDraft(), v = plValidate(D), c = S.plan.chat;
    if (!v.ok) { c.confirm = false; save(); return pcSay("Before I can create it I still need: " + v.missing.concat(v.err).join("; ") + ". " + pcNext(), origin); }
    const g = plGenerate(D, true); if (!g.ok) return pcSay("I couldn't build the plan from those details: " + (g.v.err[0] || "check your availability") + ". Your answers are saved as a draft.", origin);
    const ok = plCommit(g); // the app's own save action; success only if it is really stored
    if (!ok) return pcSay("I couldn't save the plan (the phone's storage may be full). Your answers are kept as a draft — try again in a moment.", origin);
    c.on = false; c.done = true; c.confirm = false; save();
    const up = g.sessions.filter((s) => s.date >= plToday()).sort((a, b) => (a.date + a.start).localeCompare(b.date + b.start)), first = up.slice(0, 3).map((s) => plFmtDay(s.date) + " " + s.start + ": " + s.t + " (" + s.min + " min)").join("; ");
    let msg = "✓ Your study plan is saved: " + up.length + " sessions over " + g.feas.weeks + " weeks. First up: " + first + ".";
    if (g.feas.short > 0) msg += " ⚠️ The time you chose is about " + Math.round(g.feas.short / 60) + " hours short of everything left, so the plan is prioritised. To cover it all: about " + g.feas.alt.moreMinPerWeek + " more minutes a week, or a date about " + g.feas.alt.laterWeeks + " weeks later — tell me if you'd like either.";
    const R = S.plan.rem || {}; msg += R.ok ? " Reminders are set on this phone." : D.remind.on ? " Reminders: " + (R.channel || "not set") + "." : "";
    pcSay(msg, origin);
    PLUI.view = "agenda"; setTimeout(() => { try { if (origin !== "hf") { const tc = document.querySelector('#tutor [data-act="t-close"]'); if (tc && window.innerWidth < 820) tc.click(); } location.hash = "#plan"; if (location.hash === "#plan") planPage(); } catch (e) {} }, 1200);
  }
  window.__plan = { chatOn: planChatOn, chatStart: planChatStart, chatTurn: planChatTurn, page: planPage, ui: PLUI, blank: plBlank, state: plState, validate: plValidate, generate: plGenerate, commit: plCommit, status: plStatus, mark: plMark, move: plMove, start: plStart, reminders: plReminderList, diff: plDiff, epoch: plEpoch, inventory: plInventory };
  /* ==/PLAN== */
