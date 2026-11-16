// A2–C2 sample exams (round 4, 15 Nov 2026): data shape, every paper opens, all-right answers score 25/25, all-wrong 0, no page errors
const { chromium, devices } = require("playwright"); const fs = require("fs");
const R = []; const rec = (n, ok, info) => { R.push(!!ok); console.log((ok ? "PASS " : "FAIL ") + n + (info != null && !ok ? "  " + String(info).slice(0, 300) : "")); };
const URL = "http://localhost:8766/";
const WANT = { a2: [25, 25, 2, 4], b1: [30, 30, 2, 4], b2: [36, 30, 2, 3], c1: [40, 30, 2, 3], c2: [26, 26, 3, 3] };
for (const lv of Object.keys(WANT)) {
  const D = JSON.parse(fs.readFileSync("/home/claude/ruta-dele/examdata/" + lv + ".json", "utf8")), bad = []; if (D.exams.length !== 4) bad.push("exams " + D.exams.length);
  D.exams.forEach((X, xi) => { const pre = "exam " + (xi + 1) + ": ";
  ["lectura", "auditiva"].forEach((k, i) => { const nq = X[k].reduce((n, t) => n + t.q.length, 0); if (nq !== WANT[lv][i]) bad.push(k + " " + nq);
    X[k].forEach((t, ti) => { if (k === "auditiva" && !(t.audio && t.audio.length)) bad.push("listening T" + (ti + 1) + " no audio"); if (k === "lectura" && !(t.texts && t.texts.length)) bad.push("reading T" + (ti + 1) + " no text");
      t.q.forEach((q, qi) => { const n = t.opts ? t.opts.length : q.o.length; if (!(q.a >= 0 && q.a < n)) bad.push(k + " T" + (ti + 1) + " q" + qi + " key"); if (!t.opts && new Set(q.o).size !== n) bad.push(k + " T" + (ti + 1) + " q" + qi + " duplicate options"); }); }); });
  if (X.escritura.length !== WANT[lv][2]) bad.push("writing tasks " + X.escritura.length); if (X.oral.length !== WANT[lv][3]) bad.push("speaking tasks " + X.oral.length);
  X.escritura.forEach((t) => { if (!(t.words && t.points && t.points.length && t.model)) bad.push("writing " + t.t + " incomplete"); });
  X.oral.forEach((t) => { if (!(+t.speak > 0 && t.words)) bad.push("speaking " + t.t + " incomplete"); });
  });
  rec(lv.toUpperCase() + " data (all " + D.exams.length + " exams): DELE question counts, keys valid, unique options, audio, texts, writing and speaking tasks complete", !bad.length, bad.join(" | "));
}
(async () => {
  const b = await chromium.launch(); const c = await b.newContext({ ...devices["Pixel 7"], serviceWorkers: "block" });
  await c.route("**/fonts.googleapis.com/**", (r) => r.fulfill({ contentType: "text/css", body: "" }));
  const p = await c.newPage(); const errs = []; p.on("pageerror", (e) => errs.push(e.message));
  await p.goto(URL + "#examenes"); await p.waitForTimeout(1500);
  const list = await p.textContent("main"); rec("Exams page: A2–C2 each show 4 complete exams", (list.match(/4 complete exams/g) || []).length === 5 && !/Being written/.test(list), list.slice(0, 300));
  for (const lv of Object.keys(WANT)) for (const xn of [1, 2, 3, 4]) {
    await p.goto(URL + "#" + lv + "-examen-" + xn); await p.waitForTimeout(900);
    const ov = await p.textContent("main"); rec(lv.toUpperCase() + " exam " + xn + " overview lists the four papers", /lectura/i.test(ov) && /auditiva/i.test(ov) && /escrit/i.test(ov) && /oral/i.test(ov), ov.slice(0, 200));
    for (const how of ["right", "wrong"]) {
      await p.goto(URL + "#" + lv + "-examen-" + xn + "-lectura"); await p.waitForTimeout(800);
      const again = await p.$('[data-act="ex-again"]'); if (again) { await again.click(); await p.waitForTimeout(400); } // a result from the run before: try again
      await p.click('[data-act="ex-start"][data-free="1"]'); await p.waitForTimeout(250);
      await p.evaluate((how) => { const E = window.__ex(); E.tasks.forEach((t, ti) => t.q.forEach((q, qi) => { const n = t.opts ? t.opts.length : q.o.length, v = how === "right" ? q.a : (q.a + 1) % n; const el = document.querySelector('[data-act="ex-ans"][data-k="' + ti + "-" + qi + '"][data-v="' + v + '"]'); el.click(); })); }, how);
      await p.click('[data-act="ex-submit"]'); await p.waitForTimeout(200);
      if (await p.evaluate(() => window.__ex().phase !== "result")) { await p.click('[data-act="ex-submit"]'); }
      await p.waitForFunction(() => window.__ex() && window.__ex().phase === "result", null, { timeout: 8000 }).catch(() => {});
      const sc = await p.evaluate(() => { const h = document.querySelector(".exresult h2"); return h ? h.textContent : ""; });
      rec(lv.toUpperCase() + " exam " + xn + " reading, all " + how + ": " + sc, how === "right" ? /25\/25/.test(sc) : /: 0\/25/.test(sc), sc);
    }
    for (const k of ["auditiva", "escritura", "oral"]) {
      await p.goto(URL + "#" + lv + "-examen-" + xn + "-" + k); await p.waitForTimeout(700);
      const st = await p.$('[data-act="ex-start"][data-free="1"]'); if (st) { await st.click(); await p.waitForTimeout(300); }
      const t = await p.textContent("main"); rec(lv.toUpperCase() + " exam " + xn + " " + k + " paper opens with its tasks", /Tarea \d/.test(t) && t.length > 300, t.slice(0, 200));
    }
  }
  rec("No page errors", !errs.length, errs.join(" | "));
  await b.close();
  console.log(R.every(Boolean) ? "ALL " + R.length + " PASS" : R.filter((x) => !x).length + " FAILED of " + R.length);
})();
