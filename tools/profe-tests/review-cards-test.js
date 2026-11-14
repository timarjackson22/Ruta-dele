const { chromium, devices } = require("playwright");
(async () => { const b = await chromium.launch(); const out = [];
  for (const [nm, scheme, seed] of [["light", "light", 1], ["dark", "dark", 0]]) {
    const c = await b.newContext({ ...devices["Pixel 7"], deviceScaleFactor: 1, colorScheme: scheme, serviceWorkers: "block" });
    await c.route("**/i.ytimg.com/**", (r) => r.fulfill({ path: process.argv[2] }));
    const p = await c.newPage(); const er = []; p.on("pageerror", (x) => er.push(x.message));
    if (seed) await p.addInitScript(() => { try { const S = JSON.parse(localStorage.getItem("ruta-dele-v1") || "{}");  S.mist = Array.from({ length: 17 }, (_, i) => ({ id: "x" + i, key: "k" + i, it: { t: "mc", k: "q", q: "Pregunta " + i, a: "a", opts: ["a", "b"], c: 0, why: "" }, n: 1 })); S.vid = { "kRt2sRyup6A": { w: 1, c: [] } }; localStorage.setItem("ruta-dele-v1", JSON.stringify(S)); } catch (e) {} });
    await p.goto("http://localhost:8766/#practicar"); await p.waitForTimeout(1200);
    await p.evaluate(() => document.querySelector(".rvgrid").scrollIntoView({ block: "center" })); await p.waitForTimeout(700);
    await p.screenshot({ path: process.argv[3] + nm + ".png" });
    const info = await p.evaluate(() => ({ cards: [...document.querySelectorAll(".rvc")].map((a) => [a.getAttribute("href"), a.querySelector(".rvt").textContent, (a.querySelector(".rvn") || {}).textContent || "", Math.round(a.getBoundingClientRect().height)]), wide: document.documentElement.scrollWidth > innerWidth + 1 }));
    out.push([nm, info, er]);
    for (const [h] of info.cards) { await p.goto("http://localhost:8766/#practicar"); await p.waitForTimeout(500); await p.click('.rvc[href="' + h + '"]'); await p.waitForTimeout(500); out.push(["tap " + h, p.url().endsWith(h)]); }
    await c.close(); }
  console.log(JSON.stringify(out, null, 1)); await b.close(); })();
