// The Android app says when a newer version of itself is published (GitHub release info, mocked here)
const { chromium, devices } = require("playwright");
const R = []; const rec = (n, ok, i) => { R.push(!!ok); console.log((ok ? "PASS " : "FAIL ") + n + (!ok && i ? "  " + i : "")); };
(async () => { const b = await chromium.launch();
  const run = async (installed, published) => { const c = await b.newContext({ ...devices["Pixel 7"], serviceWorkers: "block" });
    await c.addInitScript((u) => { window.AndroidApp = { version: () => JSON.stringify({ name: "1.0.300", code: 300, updated: u }) }; }, installed);
    await c.route("**/api.github.com/**", (r) => r.fulfill({ contentType: "application/json", body: JSON.stringify({ assets: [{ name: "ruta-dele.apk", updated_at: published }] }) }));
    const p = await c.newPage(); const er = []; p.on("pageerror", (x) => er.push(x.message)); await p.goto("http://localhost:8766/#inicio"); await p.waitForTimeout(3500); return { p, c, er }; };
  let { p, c, er } = await run(Date.UTC(2026, 10, 14, 20, 0), "2026-11-15T02:30:00Z");
  rec("A newer published app shows a banner with Download", (await p.isVisible("#apk-upd")) && /releases\/download\/apk\/ruta-dele\.apk/.test(await p.getAttribute("#apk-upd a", "href")));
  await p.click('[data-act="apk-later"]'); await p.waitForTimeout(200); rec("“Later” hides it for that version", !(await p.$("#apk-upd")));
  await p.evaluate(() => { location.hash = "ajustes"; }); await p.waitForTimeout(1200);
  rec("Settings › App still says a newer app is ready, with Download update", /newer Android app is ready/.test(await p.textContent("#app")));
  rec("No script errors", !er.length, er.join(" | ")); await c.close();
  ({ p, c, er } = await run(Date.UTC(2026, 10, 15, 3, 0), "2026-11-15T02:30:00Z"));
  rec("Already up to date: no banner", !(await p.$("#apk-upd"))); await c.close();
  const c2 = await b.newContext({ ...devices["Pixel 7"], serviceWorkers: "block" }); const q = await c2.newPage(); let calls = 0; await c2.route("**/api.github.com/**", (r) => { calls++; r.fulfill({ body: "{}" }); });
  await q.goto("http://localhost:8766/#inicio"); await q.waitForTimeout(3000); rec("In a browser (not the app) nothing is checked", calls === 0, calls);
  console.log(R.filter(Boolean).length + "/" + R.length + " passed"); await b.close(); })();
