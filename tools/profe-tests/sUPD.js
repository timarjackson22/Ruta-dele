// v242 updates: a newer version.json makes the app reload itself onto the new build — at start, when it comes back to the
// front, and with Profe open — but never in the middle of something (a call, the mic, Profe speaking, typing). A failed try
// is retried after 5 minutes instead of never.
const { chromium, devices } = require("playwright");
const URL = process.env.URL || "http://localhost:8766/";
(async () => {
  const b = await chromium.launch(); const R = []; const rec = (n, ok, i) => { R.push(!!ok); console.log((ok ? "PASS " : "FAIL ") + n + (ok ? "" : "  " + (i || ""))); };
  const run = async (name, setup, expectReload, waitMs) => {
    const c = await b.newContext({ ...devices["Pixel 7"], serviceWorkers: "block" }); const p = await c.newPage(); let newer = false;
    await p.route("**/version.json*", (r) => r.fulfill({ contentType: "application/json", body: JSON.stringify({ v: newer ? "299901010000" : "000000000000" }) }));
    await p.goto(URL + "#inicio"); await p.waitForTimeout(2500); await setup(p);
    let navigated = false; p.on("framenavigated", (f) => { if (f === p.mainFrame() && /\?v=299901010000/.test(f.url())) navigated = true; });
    newer = true; await p.evaluate(() => { Object.defineProperty(document, "visibilityState", { value: "hidden", configurable: true }); document.dispatchEvent(new Event("visibilitychange")); Object.defineProperty(document, "visibilityState", { value: "visible", configurable: true }); document.dispatchEvent(new Event("visibilitychange")); });
    await p.waitForTimeout(waitMs || 2500); rec(name, navigated === expectReload, "reloaded=" + navigated); await c.close();
  };
  await run("Back to the front with a new version: updates by itself", async () => {}, true);
  await run("…also with Profe open", async (p) => { await p.evaluate(() => { document.body.classList.add("tabs-peek"); document.querySelector('[data-act="t-open"]').click(); }); await p.waitForTimeout(600); }, true);
  await run("…but not during a video call", async (p) => { await p.evaluate(() => (window.__vcOn = true)); }, false);
  await run("…and not while typing", async (p) => { await p.evaluate(() => { const i = document.createElement("input"); document.body.appendChild(i); i.focus(); }); }, false);
  await b.close(); const bad = R.filter((x) => !x).length; console.log(bad ? bad + " FAILED of " + R.length : "ALL " + R.length + " PASS"); process.exit(bad ? 1 : 0);
})();
