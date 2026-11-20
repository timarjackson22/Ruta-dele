// v240 Spanish-first video calls: one Spanish voice for Profe's replies (no English/Spanish voice tag-teaming), the English
// voice only for real coaching (an explicit request or a mistake repeated N times), the call brief says so, and the thinking
// gesture follows the real state.
const { chromium, devices } = require("playwright"); const fs = require("fs");
const URL = process.env.URL || "http://localhost:8766/";
const src = fs.readFileSync(__dirname + "/sVC.js", "utf8"); const INIT = eval(src.match(/const INIT = (\(\) => \{[\s\S]*?\n\};)/)[1]);
(async () => {
  const b = await chromium.launch(); const R = []; const rec = (n, ok, i) => { R.push(!!ok); console.log((ok ? "PASS " : "FAIL ") + n + (ok ? "" : "  " + (i || ""))); };
  const c = await b.newContext({ ...devices["Pixel 7"], serviceWorkers: "block" }); await c.addInitScript(INIT); const p = await c.newPage(); const er = []; p.on("pageerror", (e) => er.push(e.message));
  await p.goto(URL + "#a1-u1"); await p.waitForTimeout(1500);
  await p.evaluate(() => window.__vc.open()); await p.waitForFunction(() => window.__vc.state() === "listening", null, { timeout: 15000 });
  const mixed = "¡Claro! You can say it like this when you are late for class. Puedes decir: perdí el autobús. Ahora inténtalo tú: ¿por qué llegaste tarde?";
  const voices = await p.evaluate(async (t) => { window.__spoken = []; await new Promise((r) => window.__speakMixed ? window.__speakMixed(t, r) : r()); return window.__spoken.map((x) => x.lang); }, mixed);
  rec("Default call: Profe's whole reply in the Spanish voice (no English/Spanish tag-team)", voices.length && voices.every((l) => /^es/.test(l)), JSON.stringify(voices));
  const note = await p.evaluate(() => window.__vc.note());
  rec("Call brief: Spanish first, don't translate, redirect English warmly (Perdí el autobús), one English word ≠ switch", /Spanish first|Speak Spanish the whole call/.test(note) && /don't translate/.test(note) && /Perdí el autobús/.test(note) && /not a request to switch/.test(note), note.slice(0, 160));
  // repeated mistake → coaching turn (English voice allowed for that reply only)
  const co = await p.evaluate(async () => { const sleep = (ms) => new Promise((r) => setTimeout(r, ms)); const out = [];
    for (let i = 0; i < 3; i++) { await new Promise((r) => { const w = () => (window.__vc.state() === "listening" && window.__micOpen() ? r() : setTimeout(w, 100)); w(); });
      window.__say("Yo soy cansado hoy."); await sleep(200); await new Promise((r) => { const w = () => (window.__vc.state() !== "listening" ? r() : setTimeout(w, 100)); w(); }); out.push(window.__vc.st.coached || 0); }
    return out; });
  rec("A mistake repeated 3 times («soy cansado») triggers one English coaching turn", co[2] >= 1 && co[0] === 0, JSON.stringify(co));
  const ask = await p.evaluate(async () => { await new Promise((r) => { const w = () => (window.__vc.state() === "listening" && window.__micOpen() ? r() : setTimeout(w, 100)); w(); }); window.__vcThinkDelay = 800; window.__say("Can you explain that in English please?"); let seen = false, enOK = false; const t0 = Date.now();
    while (Date.now() - t0 < 4000) { if (/explicitly asked for English/.test(window.__vc.note())) { seen = true; enOK = window.__vc.enOK(); } await new Promise((r) => setTimeout(r, 40)); }
    window.__vcThinkDelay = 0; return { seen, enOK, after: window.__vc.enOK() }; });
  rec("An explicit request for English: brief English that turn (English voice allowed), then back to Spanish", ask.seen && ask.enOK && !ask.after, JSON.stringify(ask));
  // thinking gesture: only while an answer is pending and not shown with reduced motion
  const th = await p.evaluate(async () => { const sleep = (ms) => new Promise((r) => setTimeout(r, ms)); window.__vc.pose("thinking"); await sleep(1200); const on = +document.querySelector("#vcall .vc-hand").getAttribute("opacity");
    window.__vc.pose(null); window.__vc.st.st = "listening"; await sleep(800); const off = +document.querySelector("#vcall .vc-hand").getAttribute("opacity"); return { on, off }; });
  rec("Thinking: the hand-to-chin gesture appears while preparing and goes away after", th.on > 0.6 && th.off < 0.1, JSON.stringify(th));
  await p.evaluate(() => window.__vc.end());
  rec("No page errors", !er.length, er.join(" | "));
  await b.close(); const bad = R.filter((x) => !x).length; console.log(bad ? bad + " FAILED of " + R.length : "ALL " + R.length + " PASS"); process.exit(bad ? 1 : 0);
})();
