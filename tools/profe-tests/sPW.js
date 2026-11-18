// v224: every Profe screen reads cleanly: no internal codes (t:fr, lesson:, undefined…), no stray labels, answer box says speak or type.
const { chromium, devices } = require("playwright");
const H = require("./h.js");
const URL = process.env.URL || "http://localhost:8766/";
const LEAK = /\bundefined\b|\bnull\b|\bNaN\b|\[object|\b[a-z]{1,3}:[a-z0-9]{1,}\b(?!\/)|\blesson: |\bPractising\b|^Now$|: fr\b| fr\.|\{\{|\}\}|\bad-[a-z]+\b|\bpr-[a-z]+\b/m;
(async () => {
  const b = await chromium.launch(); const c = await b.newContext({ ...devices["Pixel 7"], viewport: { width: 360, height: 740 }, serviceWorkers: "block" });
  const p = await c.newPage(); const er = []; p.on("pageerror", (x) => er.push(x.message));
  const R = []; const rec = (n, ok, i) => { R.push(!!ok); console.log((ok ? "PASS " : "FAIL ") + n + (ok || !i ? "" : "  " + i)); };
  await p.goto(URL + "#a1-u1"); await p.waitForTimeout(1200);
  await p.evaluate(() => { document.body.classList.add("tabs-peek"); document.querySelector('[data-act="t-open"]').click(); }); await p.waitForTimeout(700);
  const scan = async (name) => { const t = await p.evaluate(() => { const T = document.getElementById("tutor"); return [T.innerText, [...T.querySelectorAll("input,textarea")].map((x) => x.placeholder).join(" | ")]; }); const m = t[0].match(LEAK); rec(name + ": no codes or stray labels", !m, m && JSON.stringify(m[0]) + " in …" + t[0].slice(Math.max(0, m.index - 60), m.index + 40).replace(/\n/g, " ⏎ ")); return t; };
  await scan("Practice home");
  for (const [sel, name, wrong] of [['.papp[data-act="pr-vocab"]', "Vocabulary", "xyz"], ['.papp[data-v="trans"]', "Translate", "xx yy"], ['.papp[data-act="pr-pat"]', "Survival Kit", "xx yy"], ['.papp[data-act="pr-conj"]', "Verbs", "xyz"]]) {
    await p.evaluate(() => { const b = document.querySelector('#tutor .tseg [data-act="t-tab"][data-v="practice"]'); if (b) b.click(); }); await p.waitForTimeout(400);
    await p.evaluate(() => { const b = document.querySelector("#tutor .prback"); if (b) b.click(); }); await p.waitForTimeout(200);
    await p.click("#tutor " + sel); await p.waitForTimeout(1500);
    let t = await scan(name + " · question");
    const ph = t[1]; rec(name + ": the answer box says speak or type", /Say or type|Type/.test(ph) && !/^…/.test(ph), ph);
    for (let k = 0; k < 3; k++) { await p.evaluate((w) => { const i = document.getElementById("pr-input"); if (!i) return; i.value = w; i.form.requestSubmit(); }, wrong); await p.waitForTimeout(500); }
    await scan(name + " · after three misses");
    await p.evaluate(() => { const n = document.querySelector("#tutor .prnext"); if (n) n.click(); }); await p.waitForTimeout(700);
    await scan(name + " · next question (focus on what was missed)");
  }
  for (const [v, name] of [["rp", "Role-play"], ["sp", "DELE oral"]]) {
    await p.evaluate(() => { const b = document.querySelector('#tutor .tseg [data-act="t-tab"][data-v="practice"]'); if (b) b.click(); }); await p.waitForTimeout(300);
    await p.evaluate(() => { const b = document.querySelector("#tutor .prback"); if (b) b.click(); }); await p.waitForTimeout(200);
    await p.click('#tutor .papp[data-v="' + v + '"]'); await p.waitForTimeout(500); await scan(name + " · list");
    await p.evaluate(() => { const x = document.querySelector("#tutor .prlist .prc"); if (x) x.click(); }); await p.waitForTimeout(1200); await scan(name + " · started");
  }
  await p.evaluate(() => { const b = document.querySelector('#tutor .tseg [data-act="t-tab"][data-v="practice"]'); if (b) b.click(); }); await p.waitForTimeout(300);
  await p.click("#tutor .pchat-in"); await p.waitForTimeout(400); await scan("Chat");
  rec("No page errors", !er.length, er.join(" | "));
  await b.close(); const f = R.filter((x) => !x).length; console.log(f ? f + " FAILED of " + R.length : "ALL " + R.length + " PASS"); process.exit(f ? 1 : 0);
})();
