// N. Study plan (M4, 15 Nov 2026): engine, form, Profe's guided setup, calendar views, moving/marking, reminders honesty.
const { open } = require("./h.js");
const R = []; const rec = (n, ok, info) => { R.push(!!ok); console.log((ok ? "PASS " : "FAIL ") + n + (!ok && info != null ? "  " + String(info).slice(0, 500) : "")); };
(async () => {
  const H = await open({ hash: "#plan", noOpen: true }); const p = H.p;
  await p.waitForFunction(() => !!window.__plan, null, { timeout: 8000 });
  // the page with no plan: two set-up methods
  let txt = await p.evaluate(() => document.getElementById("app").innerText);
  rec("Plan tab exists and the empty page offers 'Set up with Profe' and 'Set up myself'", /Set up with Profe/.test(txt) && /Set up myself/.test(txt) && (await p.$('.tabbar [data-s="plan"]')) !== null, txt.slice(0, 300));
  // engine: a valid profile generates linked, non-overlapping sessions inside the windows, never more than wanted per day
  const eng = await p.evaluate(() => {
    const P = window.__plan, d = P.blank(), add = (k, n) => { const x = new Date(); x.setDate(x.getDate() + n); return x.getFullYear() + "-" + String(x.getMonth() + 1).padStart(2, "0") + "-" + String(x.getDate()).padStart(2, "0"); };
    d.target = "b1"; d.current = "a2"; d.exam.date = add(0, 70); [1, 2, 3, 4, 5].forEach((i) => { d.avail[i] = [{ s: "19:00", e: "21:00" }]; d.want[i] = 45; }); d.avail[6] = [{ s: "09:00", e: "12:00" }]; d.want[6] = 120; d.priority = ["auditiva"];
    const v = P.validate(d), g = P.generate(d, true), byDay = {}; let bad = [];
    g.sessions.forEach((s) => { (byDay[s.date] = byDay[s.date] || []).push(s); const dow = new Date(s.date + "T12:00").getDay(), w = d.avail[dow] || [], st = +s.start.slice(0, 2) * 60 + +s.start.slice(3); if (!w.some((x) => { const a = +x.s.slice(0, 2) * 60 + +x.s.slice(3), b = +x.e.slice(0, 2) * 60 + +x.e.slice(3); return st >= a && st + s.min <= b; })) bad.push("outside " + s.date + " " + s.start); });
    Object.entries(byDay).forEach(([k, L]) => { const dow = new Date(k + "T12:00").getDay(), tot = L.reduce((n, s) => n + s.min, 0); if (tot > (d.want[dow] || 0) + 1) bad.push("over " + k + " " + tot); L.sort((a, b) => a.start.localeCompare(b.start)).forEach((s, i) => { if (i) { const pr = L[i - 1], e = +pr.start.slice(0, 2) * 60 + +pr.start.slice(3) + pr.min, st = +s.start.slice(0, 2) * 60 + +s.start.slice(3); if (st < e) bad.push("overlap " + k); } }); });
    const kinds = [...new Set(g.sessions.map((s) => s.kind))], linked = g.sessions.filter((s) => s.kind !== "buffer").every((s) => s.link), afterExam = g.sessions.some((s) => s.date >= d.exam.date), mocks = g.sessions.filter((s) => s.kind === "mock");
    return { ok: v.ok && g.ok, n: g.sessions.length, bad, kinds, linked, afterExam, mockLast: mocks.length ? mocks[mocks.length - 1].date : null, firstMock: mocks.length ? mocks[0].date : null, exam: d.exam.date, feas: g.feas && { short: g.feas.short, weeks: g.feas.weeks } };
  });
  rec("Engine: valid profile → sessions, all inside free windows, no overlaps, never more than the chosen minutes a day", eng.ok && eng.n > 20 && !eng.bad.length, JSON.stringify(eng).slice(0, 500));
  rec("Engine: every session links to real content; mixes several kinds incl. buffer; nothing on/after the exam day", eng.linked && eng.kinds.length >= 4 && eng.kinds.includes("buffer") && !eng.afterExam, JSON.stringify(eng.kinds));
  rec("Engine: full mocks are placed in the later part of the plan", !eng.firstMock || eng.firstMock > new Date(Date.now() + 20 * 864e5).toISOString().slice(0, 10), eng.firstMock);
  // validation: commitment above free time and missing pieces are caught
  const val = await p.evaluate(() => { const P = window.__plan, d = P.blank(); const a = P.validate(d); d.target = "b1"; d.current = "b2"; d.avail[1] = [{ s: "19:00", e: "19:30" }]; d.want[1] = 90; const b = P.validate(d); return { miss: a.missing, err: b.err }; });
  rec("Validation: missing target/availability reported; current above target and wanting more than free time are errors", val.miss.length >= 2 && val.err.length >= 1, JSON.stringify(val));
  // Profe's guided setup (typed in the chat): several details at once, a vague word clarified, a correction, summary, confirm → saved, calendar opens
  await p.click('[data-act="pl-profe"]'); await p.waitForFunction(() => window.__plan.chatOn(), null, { timeout: 4000 });
  let ms = await H.msgs(); rec("Set up with Profe opens the chat and asks the first question", /DELE level/.test(ms.join(" ")), ms.slice(-2).join(" | "));
  await H.type("I'm A2 and want to take B1"); await H.wait(500);
  let d = await p.evaluate(() => window.__plan.state().draft); rec("Two details in one answer: current A2 and target B1", d.current === "a2" && d.target === "b1", JSON.stringify([d.current, d.target]));
  await H.type("in May next year, not booked yet"); await H.wait(500);
  ms = await H.msgs(); rec("A month only → Profe proposes a provisional Saturday and asks to confirm", /provisional/.test(ms[ms.length - 1]) && /Saturday/.test(ms[ms.length - 1]), ms[ms.length - 1]);
  await H.type("yes"); await H.wait(400);
  d = await p.evaluate(() => window.__plan.state().draft); rec("Confirmed date stored as provisional (not booked)", /^\d{4}-05-\d\d$/.test(d.exam.date) && !d.exam.booked, JSON.stringify(d.exam));
  await H.type("weekdays and Saturday"); await H.wait(400);
  await H.type("evenings"); await H.wait(400);
  ms = await H.msgs(); rec("A vague time ('evenings') is turned into a question with a concrete window", /18:30/.test(ms[ms.length - 1]), ms[ms.length - 1]);
  await H.type("no, weekdays 7 to 9 pm and Saturday 9 to 12"); await H.wait(500);
  d = await p.evaluate(() => window.__plan.state().draft);
  rec("Exact windows per day group parsed (weekdays 19:00–21:00, Saturday 09:00–12:00)", d.avail[1] && d.avail[1][0] && d.avail[1][0].s === "19:00" && d.avail[1][0].e === "21:00" && d.avail[6] && d.avail[6][0].s === "09:00" && d.avail[6][0].e === "12:00", JSON.stringify(d.avail));
  await H.type("45 minutes on weekdays and two hours on Saturday"); await H.wait(500);
  d = await p.evaluate(() => window.__plan.state().draft); rec("Commitment separate from free time: 45 min weekdays, 120 Saturday", d.want[2] === 45 && d.want[6] === 120, JSON.stringify(d.want));
  await H.type("that's fine"); await H.wait(300); await H.type("none"); await H.wait(300); await H.type("listening"); await H.wait(300); await H.type("15 minutes before"); await H.wait(500);
  ms = await H.msgs(); const sum = ms[ms.length - 1];
  rec("Review summary is shown before anything is created", /Here's what I have/.test(sum) && /Shall I create/.test(sum) && !(await p.evaluate(() => !!window.__plan.state().active)), sum.slice(0, 400));
  await H.type("make Saturdays one hour instead"); await H.wait(500);
  d = await p.evaluate(() => window.__plan.state().draft); ms = await H.msgs();
  rec("A correction at the summary updates the draft and shows the summary again", d.want[6] === 60 && /Updated/.test(ms[ms.length - 1]) && /Shall I create/.test(ms[ms.length - 1]), JSON.stringify(d.want) + " " + ms[ms.length - 1].slice(0, 200));
  await H.type("yes"); await H.wait(1800);
  const saved = await p.evaluate(() => { const st = window.__plan.state(), raw = JSON.parse(localStorage.getItem(Object.keys(localStorage).find((k) => { try { return JSON.parse(localStorage.getItem(k)).plan; } catch (e) { return false; } })) || "{}"); return { active: !!st.active, inStore: !!(raw.plan && raw.plan.active), n: st.active && st.active.sessions.length, hash: location.hash, rem: st.rem }; });
  ms = await H.msgs();
  rec("'yes' → plan saved to storage, success reported only after saving, calendar opens", saved.active && saved.inStore && /saved/.test(ms.join(" ")) && saved.hash === "#plan", JSON.stringify(saved));
  rec("Reminders not claimed in a browser (no native scheduler)", !/Reminders are set/.test(ms.join(" ")) && saved.rem && !saved.rem.ok, JSON.stringify(saved.rem));
  // calendar views
  await p.evaluate(() => { const t = document.querySelector('[data-act="t-close"]'); if (t && document.body.classList.contains("tutor-open")) t.click(); });
  await p.evaluate(() => { location.hash = "#plan"; window.__plan.ui.view = "agenda"; window.__plan.page(); }); await H.wait(300);
  txt = await p.evaluate(() => document.getElementById("app").innerText);
  rec("Agenda shows today's/plan status, the exam box (provisional) and sessions with time, duration and Start", /Whole plan/.test(txt) && /provisional target/i.test(txt) && (await p.$$(".plrow")).length > 2 && /min/.test(txt), (await p.$$(".plrow")).length + " " + txt.slice(300, 900));
  for (const v of ["week", "month"]) { await p.click('[data-act="pl-view"][data-v="' + v + '"]'); await H.wait(250); }
  rec("Week and month views render", (await p.$$(".plmd")).length === 42, await p.evaluate(() => document.querySelectorAll(".plmd").length));
  // mark partial, done, move (with validation)
  const mm = await p.evaluate(() => { const P = window.__plan, A = P.state().active, s = A.sessions.find((x) => x.kind !== "buffer" && x.status !== "done"), s2 = A.sessions.filter((x) => x.kind !== "buffer" && x.status !== "done")[1];
    P.mark(s.id, "partial", 10); const a = P.state().active.sessions.find((x) => x.id === s.id); const part = [a.status, a.doneMin];
    P.mark(s.id, "done"); const done = P.state().active.sessions.find((x) => x.id === s.id).status;
    const bad = P.move(s2.id, s2.date, "03:00"); const st = P.status(); return { part, done, bad, st: st.exists && st.overall && typeof st.overall.done === "number" }; });
  rec("Partial minutes recorded, then done; moving outside free time is refused with a reason", mm.part[0] === "partial" && mm.part[1] === 10 && mm.done === "done" && typeof mm.bad === "string" && mm.bad.length > 5 && mm.st, JSON.stringify(mm));
  // replan keeps completed work
  const rp = await p.evaluate(() => { const P = window.__plan, A = P.state().active, doneIds = A.sessions.filter((s) => s.status === "done").map((s) => s.id), g = P.generate(A.profile, true); return { kept: doneIds.every((id) => g.sessions.some((s) => s.id === id && s.status === "done")), n: doneIds.length }; });
  rec("Replanning keeps completed sessions", rp.kept && rp.n >= 1, JSON.stringify(rp));
  // voice: open the plan; plan.setup by voice
  await p.evaluate(() => { location.hash = "#inicio"; }); await H.wait(400);
  await p.evaluate(() => window.__pv && window.__pv.route ? window.__pv.route("open my study plan", "chat") : null); await H.wait(800);
  rec("Voice/typed command 'open my study plan' opens #plan", await p.evaluate(() => location.hash === "#plan"));
  // reminders list respects quiet hours and per-day cap
  const rl = await p.evaluate(() => { const P = window.__plan, A = P.state().active; A.profile.remind.on = true; A.profile.remind.quietFrom = "21:30"; A.profile.remind.quietTo = "07:30"; A.profile.remind.maxPerDay = 2; const L = P.reminders(A); const perDay = {}; L.forEach((r) => { const k = new Date(r.at).toDateString(); perDay[k] = (perDay[k] || 0) + 1; }); return { n: L.length, max: Math.max(0, ...Object.values(perDay)), quiet: L.filter((r) => { const h = new Date(r.at).getHours() * 60 + new Date(r.at).getMinutes(); return h >= 1290 || h < 450; }).length }; });
  rec("Reminder list: some reminders, at most 2 a day, none in quiet hours", rl.n > 0 && rl.max <= 2 && rl.quiet === 0, JSON.stringify(rl));
  // Progress › Exam preparation: completion, adherence and readiness shown separately; no readiness claim without evidence
  await p.evaluate(() => { location.hash = "#progreso"; }); await H.wait(400); await p.click('[data-act="pg-tab"][data-v="exam"]'); await H.wait(300);
  const xp = await p.evaluate(() => document.getElementById("app").innerText);
  rec("Exam preparation tab: target/date/booking, time & adherence, coverage, skills, readiness (not enough evidence), mocks, mistakes, revision", /DELE B1/.test(xp) && /Provisional/.test(xp) && /Adherence/.test(xp) && /Remaining workload/.test(xp) && /Content coverage/.test(xp) && /Not enough evidence/.test(xp) && /Mock exams/.test(xp) && /Recurring mistakes/.test(xp) && /Revision due/.test(xp) && /not a measure of how ready/.test(xp), xp.slice(0, 600));
  const xp2 = await p.evaluate(() => { const S = window.__plan.S(), k = "b1-1"; S.ex = S.ex || {}; S.ex[k] = { lectura: { sc: 18, d: 1 }, auditiva: { sc: 17, d: 1 }, escritura: { sc: 16, d: 1 }, oral: { sc: 19, d: 1 } }; window.__plan.pg.tab = "exam"; window.__plan.progress(); return document.getElementById("app").innerText; }).catch((e) => "ERR " + e.message);
  rec("With one paper per skill: a readiness range with uncertainty and no guarantee", /Readiness estimate/.test(xp2) && /–/.test(xp2) && /not a prediction/.test(xp2) && /estimate/.test(xp2), xp2.slice(0, 900));
  rec("No page errors", !H.errs.length, H.errs.join(" | "));
  await H.close();
  console.log(R.filter(Boolean).length + "/" + R.length + " passed"); process.exit(R.every(Boolean) ? 0 : 1);
})();
