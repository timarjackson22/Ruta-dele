// v239: a still page does no work. A MutationObserver ↔ DOM-rewrite loop (the Listen button and «Listen to these words»
// labels rewritten every frame) kept every page busy at ~360 callbacks/s of whole-page processing since v219.
// Every main screen must be idle (0 animation frames, 0 DOM changes per second) once it has settled, and a video call
// may only run its own animation loop (~60/s) with no page-wide churn.
const { chromium, devices } = require("playwright"); const fs = require("fs");
const URL = process.env.URL || "http://localhost:8766/";
const src = fs.readFileSync(__dirname + "/sVC.js", "utf8"); const INIT = eval(src.match(/const INIT = (\(\) => \{[\s\S]*?\n\};)/)[1]);
(async () => {
  const b = await chromium.launch(); const R = []; const rec = (n, ok, i) => { R.push(!!ok); console.log((ok ? "PASS " : "FAIL ") + n + (ok ? "" : "  " + (i || ""))); };
  const c = await b.newContext({ ...devices["Pixel 7"], serviceWorkers: "block" }); await c.addInitScript(INIT);
  await c.addInitScript(() => { const o = window.requestAnimationFrame; window.__rafN = 0; window.requestAnimationFrame = (f) => { window.__rafN++; return o(f); }; });
  const p = await c.newPage();
  const measure = () => p.evaluate(() => new Promise((res) => { window.__rafN = 0; let m = 0; const o = new MutationObserver((rs) => { m += rs.length; }); o.observe(document.documentElement, { childList: true, subtree: true, characterData: true }); setTimeout(() => { o.disconnect(); res({ raf: window.__rafN, mut: m }); }, 1000); }));
  const routes = ["#inicio", "#curso", "#practicar", "#biblioteca", "#a1-u1", "#a1-vocab", "#a1-cards", "#historia-a1-1", "#leer", "#escuchar", "#videos", "#video-YrTVB8lKutI", "#drill", "#ajustes", "#frases", "#verbos", "#progreso", "#errores"];
  const busy = [];
  for (const r of routes) { await p.goto(URL + r); await p.waitForTimeout(2200); const m = await measure(); if (m.raf > 2 || m.mut > 2) busy.push(r + " " + JSON.stringify(m)); }
  rec("Every main screen is idle once settled (" + routes.length + " screens)", !busy.length, busy.join(" | "));
  await p.goto(URL + "#a1-u1"); await p.waitForTimeout(1500); await p.evaluate(() => window.__vc.open()); await p.waitForTimeout(2500);
  const v = await measure(); rec("A video call runs only its own animation (≤ 70 frames/s, little DOM churn)", v.raf <= 70 && v.mut < 120, JSON.stringify(v));
  await p.evaluate(() => window.__vc.end()); await p.waitForTimeout(600); const e = await measure();
  rec("After the call ends, nothing keeps running", e.raf <= 2 && e.mut <= 2, JSON.stringify(e));
  await b.close(); const bad = R.filter((x) => !x).length; console.log(bad ? bad + " FAILED of " + R.length : "ALL " + R.length + " PASS"); process.exit(bad ? 1 : 0);
})();
