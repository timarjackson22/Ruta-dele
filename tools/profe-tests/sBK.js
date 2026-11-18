// v236 automatic backup and restore after a fresh install (Android app bridge mocked: AndroidApp.saveAuto / saveText).
const { chromium, devices } = require("playwright"); const fs = require("fs");
const URL = process.env.URL || "http://localhost:8766/";
(async () => {
  const b = await chromium.launch(); const R = []; const rec = (n, ok, i) => { R.push(!!ok); console.log((ok ? "PASS " : "FAIL ") + n + (ok ? "" : "  " + (i || ""))); };
  const mk = async (old) => { const c = await b.newContext({ ...devices["Pixel 7"], serviceWorkers: "block" });
    await c.addInitScript((old) => { window.__files = JSON.parse(sessionStorage.getItem("files") || "[]"); const keep = () => sessionStorage.setItem("files", JSON.stringify(window.__files));
      window.AndroidApp = { setReminder() {}, cancelReminder() {}, practised() {}, notificationsAllowed: () => true, saveText(n, t) { window.__files.push({ n, t, how: "new" }); keep(); return "Downloads/" + n; } };
      if (!old) window.AndroidApp.saveAuto = (n, t) => { const f = window.__files.find((x) => x.n === n); if (f) { f.t = t; f.how = "overwrite"; } else window.__files.push({ n, t, how: "new" }); keep(); return "Downloads/" + n; }; }, old);
    return c; };
  // 1. a brand-new install: Home offers to restore, once
  let c = await mk(false); let p = await c.newPage(); await p.goto(URL + "#inicio"); await p.waitForTimeout(1500);
  rec("Fresh install: Home offers «Restore my progress» from the backup file", await p.evaluate(() => !!document.querySelector(".bk-welcome #bk-file")));
  rec("…and the automatic backup does nothing while there's no progress (never overwrites a good backup with an empty one)", (await p.evaluate(() => window.__bkAuto(true))) === null);
  // 2. progress → one backup file, overwritten in place; unchanged progress → no write
  await p.evaluate(() => { const s = JSON.parse(localStorage.getItem("ruta-dele-v1") || "{}"); s.u = { "a1-u1": { done: 1 } }; s.last = "#a1-u1"; localStorage.setItem("ruta-dele-v1", JSON.stringify(s)); });
  await p.reload(); await p.waitForTimeout(1200);
  const w1 = await p.evaluate(() => window.__bkAuto(true)); const w2 = await p.evaluate(() => window.__bkAuto(false));
  await p.evaluate(() => { const s = JSON.parse(localStorage.getItem("ruta-dele-v1")); s.u["a1-u2"] = { done: 1 }; localStorage.setItem("ruta-dele-v1", JSON.stringify(s)); });
  await p.reload(); await p.waitForTimeout(1200); const w3 = await p.evaluate(() => window.__bkAuto(true));
  const files = await p.evaluate(() => window.__files.map((f) => ({ n: f.n, how: f.how, has2: /a1-u2/.test(f.t) })));
  rec("With progress: one file in Downloads (ruta-dele-autobackup.json), updated in place; no write when nothing changed", w1 === "Downloads/ruta-dele-autobackup.json" && w2 === null && files.length === 1 && files[0].how === "overwrite" && files[0].has2, JSON.stringify({ w1, w2, w3, files }));
  rec("Home no longer shows the restore offer once there's progress", await p.evaluate(() => !document.querySelector(".bk-welcome")));
  await p.goto(URL + "#ajustes"); await p.waitForTimeout(800);
  rec("Settings › Backup says the automatic backup is on and where the file is", await p.evaluate(() => /Automatic backup/.test(document.body.innerText) && /ruta-dele-autobackup\.json/.test(document.body.innerText) && /Last backup: today/.test(document.body.innerText)));
  const backup = await p.evaluate(() => window.__files[0].t); await c.close();
  // 3. delete the app (new context, empty storage) → restore from the file → everything back
  fs.writeFileSync("/tmp/ruta-dele-autobackup.json", backup);
  c = await mk(false); p = await c.newPage(); await p.goto(URL + "#inicio"); await p.waitForTimeout(1500);
  await p.setInputFiles(".bk-welcome #bk-file", "/tmp/ruta-dele-autobackup.json"); await p.waitForTimeout(2500);
  const back = await p.evaluate(() => { const s = JSON.parse(localStorage.getItem("ruta-dele-v1") || "{}"); return { u: Object.keys(s.u || {}), card: !!document.querySelector(".bk-welcome") }; });
  rec("After deleting the app: restoring the file brings the progress back (and the offer goes away)", back.u.includes("a1-u1") && back.u.includes("a1-u2") && !back.card, JSON.stringify(back));
  // 4. «I'm new» dismisses it for good
  const c2 = await mk(false); const p2 = await c2.newPage(); await p2.goto(URL + "#inicio"); await p2.waitForTimeout(1200); await p2.click('[data-act="bk-nothanks"]'); await p2.reload(); await p2.waitForTimeout(1000);
  rec("«I’m new» hides the restore offer for good", await p2.evaluate(() => !document.querySelector(".bk-welcome"))); await c2.close(); await c.close();
  // 5. an older app (no saveAuto): a dated file at most once a week
  c = await mk(true); p = await c.newPage(); await p.goto(URL + "#inicio"); await p.waitForTimeout(800);
  await p.evaluate(() => { localStorage.setItem("ruta-dele-v1", JSON.stringify({ u: { "a1-u1": { done: 1 } }, k: {}, m: {}, last: "#a1-u1" })); }); await p.reload(); await p.waitForTimeout(1000);
  const o1 = await p.evaluate(() => window.__bkAuto(true)); await p.evaluate(() => { const s = JSON.parse(localStorage.getItem("ruta-dele-v1")); s.u.x = 1; localStorage.setItem("ruta-dele-v1", JSON.stringify(s)); }); await p.reload(); await p.waitForTimeout(1000);
  const o2 = await p.evaluate(() => window.__bkAuto(false));
  rec("Older app: a dated backup file, at most once a week", /ruta-dele-backup-\d/.test(o1 || "") && o2 === null, JSON.stringify({ o1, o2 }));
  await c.close(); await b.close(); const bad = R.filter((x) => !x).length; console.log(bad ? bad + " FAILED of " + R.length : "ALL " + R.length + " PASS"); process.exit(bad ? 1 : 0);
})();
