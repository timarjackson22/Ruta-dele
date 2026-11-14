// Videos › DELE exam guides: one per level A1–C2 (plus how it's marked), first in the library, not clipped to 4 minutes.
const { chromium, devices } = require("playwright"); const fs = require("fs");
const MOCK = fs.readFileSync(__dirname + "/vid.js", "utf8").match(/const MOCK = `([\s\S]*?)`;/)[1];
const R = []; const rec = (n, ok, i) => { R.push(!!ok); console.log((ok ? "PASS " : "FAIL ") + n + (!ok && i ? "  " + i : "")); };
(async () => { const b = await chromium.launch(); const c = await b.newContext({ ...devices["Pixel 7"], serviceWorkers: "block" });
  await c.route("**/www.youtube.com/iframe_api", (r) => r.fulfill({ contentType: "text/javascript", body: MOCK })); await c.route("**/i.ytimg.com/**", (r) => r.fulfill({ status: 404, body: "" }));
  const p = await c.newPage(); const er = []; p.on("pageerror", (x) => er.push(x.message));
  await p.goto("http://localhost:8766/#videos"); await p.waitForTimeout(1500);
  const t = await p.evaluate(() => document.getElementById("app").innerText);
  const i = t.indexOf("DELE exam guides"), j = t.indexOf("Everyday dialogues");
  rec("Videos: a “DELE exam guides” section, first in the library", i >= 0 && (j < 0 || i < j), i + " " + j);
  const lv = ["A1", "A2", "B1", "B2", "C1", "C2"].filter((l) => new RegExp("DELE " + l + "|" + l + "[^\\n]*DELE|DELE[^\\n]*" + l).test(t));
  rec("…covering every level A1–C2", lv.length === 6, lv.join(","));
  if (process.argv[2]) await p.screenshot({ path: process.argv[2] });
  await p.evaluate(() => { location.hash = "video-BaIJbViW3L4"; }); await p.waitForTimeout(2000);
  const pg = await p.evaluate(() => document.getElementById("app").innerText);
  rec("A guide opens and isn't cut to a 4-minute clip", /DELE C1/.test(pg) && !/first 4 min|4-minute|0:00 – 4:00/i.test(pg), pg.slice(0, 200));
  rec("No script errors", !er.length, er.join(" | "));
  console.log(R.filter(Boolean).length + "/" + R.length + " passed"); await b.close(); })();
