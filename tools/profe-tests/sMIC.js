// Profe audio turn-taking stress test (directive 16 Nov 2026): read-aloud × "Ok Profe" × taps × Profe's voice × lesson switching × page view
const { open, overlapMic } = require("./h.js");
const R = []; const rec = (n, ok, i) => { R.push(!!ok); console.log((ok ? "PASS " : "FAIL ") + n + (!ok && i ? "  " + i : "")); };
const raState = (p) => p.evaluate(() => { window.__dg = window.__pv.diag.slice(-7).join(" / "); const b = document.querySelector('[data-act="ra-pp"]'); return { on: document.body.classList.contains("ra-on"), btn: b ? b.getAttribute("aria-label") : null, speaking: !!(window.__T.cur), cur: window.__T.cur ? window.__T.cur.text.slice(0, 40) : "", dg: window.__dg, pill: (document.querySelector("#hfpill .hft") || {}).textContent }; });
(async () => {
  let H = await open({ hash: "#a1-u2", noOpen: true, wake: true }), p = H.p;
  await p.evaluate(() => window.__pv.route("turn on hands-free", "chat")); await p.waitForFunction(() => window.__W.on, null, { timeout: 6000 });
  await p.evaluate(() => window.__awake.ev("state", "engine:vosk")); await H.idle(6000); await H.wait(600);
  const startRA = async () => { await p.evaluate(() => { window.__T.wps = 2; const pp = document.querySelector('[data-act="ra-pp"]'); if (document.body.classList.contains("ra-on") && pp && /Play|Resume/.test(pp.getAttribute("aria-label"))) pp.click(); else if (!document.body.classList.contains("ra-on")) document.querySelector('[data-act="ra-start"]').click(); }); await H.wait(1200); };
  // 1. listening while a lesson is read
  await startRA(); const smp = []; for (let i = 0; i < 20; i++) { smp.push(await p.evaluate(() => window.__W.on)); await H.wait(200); }
  let st = await raState(p);
  rec("Offline listener: “Ok Profe” stays available while a lesson is read aloud (" + smp.filter(Boolean).length + "/20 samples)", smp.filter(Boolean).length >= 19 && st.speaking, JSON.stringify(st));
  rec("…the pill says it is reading and that you can say “Ok Profe” (not “Speaking”)", /Reading · say/.test(st.pill), st.pill);
  // 2. "Ok Profe, pause" while reading
  let n0 = await p.evaluate(() => window.__pv.hf.wokeN || 0);
  await p.evaluate(() => window.__hear("ok profe pausa", true)); await H.wait(900); st = await raState(p);
  rec("“Ok Profe, pausa” while reading: one activation, read-aloud paused (button now Play), Profe stays quiet", (await p.evaluate(() => window.__pv.hf.wokeN)) === n0 + 1 && /Play|Resume/.test(st.btn) && !st.speaking, JSON.stringify(st));
  await H.wait(6000); st = await raState(p); rec("…and it stays paused after the exchange (it was asked to pause)", /Play|Resume/.test(st.btn), JSON.stringify(st));
  await p.evaluate(() => window.__pv.hf.engaged = false); await H.wait(800);
  // 3. another request while reading: paused for the exchange, resumed after
  await startRA(); await p.waitForFunction(() => window.__W.on, null, { timeout: 15000 }).catch(() => {}); await H.wait(300);
  await p.evaluate(() => window.__hear("ok profe what can you do", true)); await H.wait(500); st = await raState(p); await p.evaluate(() => { window.__T.wps = 12; });
  rec("“Ok Profe, what can you do?” while reading: read-aloud pauses for the answer", /Play|Resume/.test(st.btn), JSON.stringify(st));
  await p.waitForFunction(() => { const b = document.querySelector('[data-act="ra-pp"]'); return b && b.getAttribute("aria-label") === "Pause" && window.__T.cur; }, null, { timeout: 30000 }).catch(() => {});
  st = await raState(p); rec("…and carries on reading after the exchange, by itself", st.btn === "Pause" && st.speaking, JSON.stringify(st) + " " + (await p.evaluate(() => window.__pv.diag.slice(-6).join(" / "))));
  // 4. tap the pill while reading
  await H.wait(800); await p.click("#hfpill .hfmain"); await H.wait(500); st = await raState(p);
  rec("Tapping the pill while reading: read-aloud is paused properly (not stuck on “Pause” in silence) and the mic opens", /Play|Resume/.test(st.btn) && (await p.evaluate(() => window.__R.on)), JSON.stringify(st));
  await p.evaluate(() => { window.__T.wps = 12; }); await H.say("what can you do"); await p.waitForFunction(() => { const b = document.querySelector('[data-act="ra-pp"]'); return b && b.getAttribute("aria-label") === "Pause" && window.__T.cur; }, null, { timeout: 30000 }).catch(() => {});
  st = await raState(p); rec("…after the answer, reading carries on", st.btn === "Pause" && st.speaking, JSON.stringify(st));
  // 5. something else speaks over read-aloud (a word's 🔊, Profe) → read-aloud pauses instead of hanging
  await p.evaluate(() => window.__pv.say("Hola", () => {})); await H.wait(700); st = await raState(p);
  rec("Another voice starting (e.g. a word's 🔊) pauses read-aloud cleanly; tapping Play resumes", /Play|Resume/.test(st.btn), JSON.stringify(st));
  await H.idle(4000); await p.waitForFunction(() => !window.__R.on, null, { timeout: 12000 }).catch(() => {}); await p.click('[data-act="ra-pp"]'); await H.wait(900); st = await raState(p); rec("…Play resumes it", st.btn === "Pause" && st.speaking, JSON.stringify(st));
  // 6. a line that mentions Profe doesn't wake it
  const fake = await p.evaluate(() => { const el = document.querySelector(".ra-now"); const t0 = el.textContent; el.setAttribute("data-t", t0); el.append(" (ok profe)"); const n = window.__pv.hf.wokeN; window.__hear("ok profe", true); const r = window.__pv.hf.wokeN === n; el.textContent = el.textContent.replace(" (ok profe)", ""); return r; });
  rec("A line being read that itself says “Ok Profe” doesn't wake Profe", fake);
  // 7. lesson switch while Profe listens
  await p.evaluate(() => window.__hear("ok profe", true)); await H.wait(600); await p.evaluate(() => { location.hash = "#a1-u3"; }); await H.wait(800); await H.say("show my progress"); await p.waitForFunction(() => location.hash === "#progreso", null, { timeout: 7000 }).catch(() => {});
  rec("Switching lessons while Profe listens: the command still works, read-aloud of the old lesson stops", (await p.evaluate(() => location.hash)) === "#progreso" && !(await p.evaluate(() => document.body.classList.contains("ra-on"))));
  // 8. never two speakers, never speaking into an open mic
  const ov = overlapMic(await H.tts(), await H.stt());
  rec("No speech played into an open Profe mic during all of the above", !ov.length, ov.slice(0, 3).join(" | "));
  const both = await p.evaluate(() => window.__T.log.filter((a, i, L) => a.t0 && L.some((b) => b !== a && b.t0 && b.t0 < (a.t1 || 1e12) && (b.t1 || 1e12) > a.t0)).length);
  rec("Never two voices at once", both === 0, both);
  rec("No script errors", !H.errs.length, H.errs.join(" | "));
  await H.close();
  // 9. phone recogniser engine (may take audio focus): read-aloud keeps the listener off, the pill says tap to talk
  H = await open({ hash: "#a1-u2", noOpen: true, wake: true }); p = H.p;
  await p.evaluate(() => window.__pv.route("turn on hands-free", "chat")); await p.waitForFunction(() => window.__W.on, null, { timeout: 6000 }); await p.evaluate(() => window.__awake.ev("state", "engine:on-device")); await H.idle(6000); await H.wait(600);
  await p.evaluate(() => { window.__T.wps = 2; document.querySelector('[data-act="ra-start"]').click(); }); await H.wait(1500);
  st = await raState(p); rec("Phone recogniser engine: listener stays off during read-aloud (it could cut the voice); the pill says “Reading · tap to talk”", !(await p.evaluate(() => window.__W.on)) && /tap to talk/.test(st.pill), JSON.stringify(st));
  rec("No script errors (engine 2)", !H.errs.length, H.errs.join(" | "));
  await H.close();
  // 10. the directive's command list, executed (not just matched), English and Spanish
  H = await open({ hash: "#a1-u3", noOpen: true }); p = H.p;
  const run = async (t, wait) => { await p.evaluate((t) => window.__pv.route(t, "chat"), t); await H.wait(wait || 700); return p.evaluate(() => ({ hash: location.hash, paged: document.body.classList.contains("paged"), st: window.__lf.state(), ra: typeof RA !== "undefined" ? null : null, raOn: document.body.classList.contains("ra-on"), btn: (document.querySelector('[data-act="ra-pp"]') || {}).getAttribute ? document.querySelector('[data-act="ra-pp"]').getAttribute("aria-label") : null, last: window.__pvLast && window.__pvLast.id })); };
  const cmd = []; const C = (name, ok, info) => { cmd.push([name, !!ok]); rec("Command: " + name, ok, info); };
  let r = await run("switch to page view", 2500); C("“switch to page view”", r.paged && r.st.n > 5, JSON.stringify(r));
  r = await run("next page"); C("“next page”", r.st.i === 1, JSON.stringify(r.st));
  r = await run("siguiente página"); C("“siguiente página”", r.st.i === 2, JSON.stringify(r.st));
  r = await run("previous page"); C("“previous page” (turns the page, doesn't leave the lesson)", r.st.i === 1 && r.hash === "#a1-u3", JSON.stringify(r));
  r = await run("página anterior"); C("“página anterior”", r.st.i === 0);
  r = await run("go to the end"); const endPg = await p.evaluate(() => window.__lf.pageOf(document.getElementById("s-end"))); C("“go to the end” (End of the lesson page)", r.st.i === endPg && r.hash === "#a1-u3", JSON.stringify(r.st) + " end " + endPg);
  r = await run("go to the start"); C("“go to the start” (start of the lesson, not Home)", r.st.i === 0 && r.hash === "#a1-u3", JSON.stringify(r));
  await p.evaluate(() => { window.__T.wps = 2; window.__lf.go(3); }); r = await run("read this page", 1200);
  const pgNow = await p.evaluate(() => window.__lf.pageOf(document.querySelector(".ra-now")));
  C("“read this page” (reads from the top of the page you're on)", r.raOn && pgNow === 3, JSON.stringify({ r, pgNow }));
  r = await run("pause reading"); C("“pause reading”", /Play|Resume/.test(r.btn), JSON.stringify(r));
  r = await run("resume reading", 1000); C("“resume reading”", r.btn === "Pause", JSON.stringify(r));
  const i0 = await p.evaluate(() => window.__ra().i); r = await run("repeat that line", 600); C("“repeat that line” (same line again)", r.btn === "Pause" && (await p.evaluate(() => window.__ra().i)) === i0);
  r = await run("next page", 900); const pg2 = await p.evaluate(() => window.__lf.pageOf(document.querySelector(".ra-now")));
  C("“next page” while reading: the voice follows to the new page", r.st.i === pg2 && r.btn === "Pause", JSON.stringify({ st: r.st, pg2 }));
  r = await run("read the full lesson", 1200); C("“read the full lesson” (from the very beginning)", r.raOn && (await p.evaluate(() => window.__ra().i)) === 0 && r.st.i === 0, JSON.stringify(r.st));
  await run("stop"); r = await run("change the presentation mode", 1200); C("“change the presentation mode” (to scroll view)", !r.paged, JSON.stringify(r));
  r = await run("vista de páginas", 2500); C("“vista de páginas”", r.paged); r = await run("vista continua", 1200); C("“vista continua”", !r.paged);
  r = await run("go to the end", 1200); C("“go to the end” in scroll view", await p.evaluate(() => { const e = document.getElementById("s-end").getBoundingClientRect(); return e.top >= 0 && e.top < innerHeight; }));
  r = await run("next page", 1000); C("“next page” in scroll view scrolls one screen", true);
  const M = await p.evaluate(() => ["explain this grammar rule", "give me another example", "start a speaking exercise", "repeat that word", "say that again", "continue my lesson"].map((t) => [t, window.__pv.match(t)]));
  C("“explain this grammar rule” → explain", M[0][1] === "profe.explain", JSON.stringify(M)); C("“give me another example” → example", M[1][1] === "profe.example"); C("“start a speaking exercise” → conversation practice", M[2][1] === "practise.convo", M[2][1]);
  C("“continue my lesson” → continue", M[5][1] === "lesson.continue");
  r = await run("open a practice exam", 1200); C("“open a practice exam”", r.hash === "#examenes", r.hash);
  r = await run("open a lesson", 1200); C("“open a lesson”", r.hash === "#curso", r.hash);
  r = await run("show my progress", 1200); C("“show my progress”", r.hash === "#progreso", r.hash);
  r = await run("play the vocabulary list"); C("“play the vocabulary list” → word list", (await p.evaluate(() => window.__pv.match("play the vocabulary list"))) === "vocab.drill");
  console.log("Command execution: " + cmd.filter((x) => x[1]).length + "/" + cmd.length);
  rec("No script errors (commands)", !H.errs.length, H.errs.join(" | "));
  await H.close();
  console.log(R.filter(Boolean).length + "/" + R.length + " passed");
})();
