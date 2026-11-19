// v237: in a video call, Profe's on-device answer is spoken while it is still being written (first words long before the end).
const { chromium, devices } = require("playwright"); const fs = require("fs");
const URL = process.env.URL || "http://localhost:8766/";
const src = fs.readFileSync(__dirname + "/sVC.js", "utf8"); const INIT = eval(src.match(/const INIT = (\(\) => \{[\s\S]*?\n\};)/)[1]);
(async () => {
  const b = await chromium.launch(); const R = []; const rec = (n, ok, i) => { R.push(!!ok); console.log((ok ? "PASS " : "FAIL ") + n + (ok ? "" : "  " + (i || ""))); };
  const c = await b.newContext({ ...devices["Pixel 7"], serviceWorkers: "block" }); await c.addInitScript(INIT);
  await c.addInitScript(() => {
    localStorage.setItem("ruta-dele-tutor-v1", JSON.stringify({ engine: "native", nModel: "best" }));
    window.__natLog = [];
    window.AndroidLLM = { status: () => JSON.stringify({ state: "loaded", model: "gemma" }), preload() { window.__natLog.push("preload"); }, cancel() {}, resetChat() {}, tokens: () => 10, hasChat: () => true, canLm: () => true,
      chat(id, key, sys, user, max, temp) { window.__natLog.push({ max, t: Date.now() });
        const parts = ["¡Qué bien! ", "El café de Panamá ", "es famoso en todo el mundo. ", "¿Lo tomas ", "con leche ", "o solo? ", "Yo lo prefiero ", "solo y sin azúcar, ", "bien caliente."];
        parts.forEach((p, i) => setTimeout(() => window.__allm.ev("part", id, p), 300 + i * 450)); setTimeout(() => window.__allm.ev("done", id, ""), 300 + parts.length * 450 + 50); },
      generate(id) { setTimeout(() => window.__allm.ev("done", id, ""), 50); } };
  });
  const p = await c.newPage(); const er = []; p.on("pageerror", (e) => er.push(e.message));
  await p.goto(URL + "#a1-u1"); await p.waitForTimeout(1500);
  await p.evaluate(() => window.__vc.open()); await p.waitForFunction(() => window.__vc.state() === "listening" && window.__micOpen(), null, { timeout: 15000 });
  rec("The on-device AI is warmed up when the call starts", await p.evaluate(() => window.__natLog.includes("preload")));
  await p.evaluate(() => { window.__spoken = []; window.__t0 = 0; window.__say("Me encanta el café de Panamá."); });
  await p.waitForFunction(() => window.__vc.state() === "thinking", null, { timeout: 6000 }); const t0 = await p.evaluate(() => Date.now());
  await p.waitForFunction(() => window.__vc.state() === "speaking", null, { timeout: 12000 }); const t1 = await p.evaluate(() => Date.now());
  const ask = await p.evaluate(() => window.__natLog.find((x) => x.max));
  const whole = 300 + 9 * 450; // when the model finishes writing
  rec("Profe starts speaking while the answer is still being written (" + (t1 - t0) + " ms; the whole answer takes " + whole + " ms)", t1 - t0 < whole - 1000, t1 - t0);
  rec("Call answers are short (token limit 160)", ask && ask.max === 160, JSON.stringify(ask));
  await p.waitForFunction(() => window.__vc.state() === "listening", null, { timeout: 20000 }).catch(() => {});
  const said = await p.evaluate(() => (window.__spoken || []).map((x) => (x && x.t) || x).join(" "));
  const shown = await p.evaluate(() => document.getElementById("vc-pro").textContent.replace(/\s+/g, " "));
  rec("Profe's reply is spoken once, in order, and matches the captions", /Qué bien/.test(said) && /café de Panamá/.test(said) && (said.match(/Qué bien/g) || []).length === 1 && /Qué bien/.test(shown), said.slice(0, 200) + " || " + shown.slice(0, 120));
  rec("No page errors", !er.length, er.join(" | "));
  await b.close(); const bad = R.filter((x) => !x).length; console.log(bad ? bad + " FAILED of " + R.length : "ALL " + R.length + " PASS"); process.exit(bad ? 1 : 0);
})();
