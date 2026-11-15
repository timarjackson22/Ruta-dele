// Caption translations: no translator markup on screen; a line that is one known expression gets its meaning
const { chromium, devices } = require("playwright");
const R = []; const rec = (n, ok, i) => { R.push(!!ok); console.log((ok ? "PASS " : "FAIL ") + n + (!ok && i ? "  " + i : "")); };
(async () => { const b = await chromium.launch(); const c = await b.newContext({ ...devices["Pixel 7"], serviceWorkers: "block" });
  await c.addInitScript(() => { const M = { "Yo digo una": '<g id="1">I say one</g>.', "A ver": "Really?", "Un cafecito": "A little coffee", "Xopá": "Hello" }; window.AndroidTR = { available: () => true, translate(id, t) { setTimeout(() => window.__atr && window.__atr.ev(id, M[t] || "EN(" + t + ")", ""), 20); } }; });
  const p = await c.newPage(); const er = []; p.on("pageerror", (x) => er.push(x.message));
  await p.goto("http://localhost:8766/#curso"); await p.waitForTimeout(1500);
  const r = await p.evaluate(async () => [await window.__trEn("Yo digo una"), await window.__trEn("A ver."), await window.__trEn("Un cafecito"), await window.__trEn("¡Qué xopá!")]);
  rec("Translator markup removed: «<g id=\"1\">I say one</g>.» → «I say one.»", r[0] === "I say one.", r[0]);
  rec("A line that is one expression gets its meaning: «A ver» → let's see (not «Really?»)", /let'?s see/i.test(r[1]), r[1]);
  rec("Other lines still use the translator", r[2] === "A little coffee", r[2]);
  rec("Panama expression as a whole line: «¡Qué xopá!» → what's up?", /what's up/i.test(r[3]), r[3]);
  rec("No script errors", !er.length, er.join(" | "));
  console.log(R.filter(Boolean).length + "/" + R.length + " passed"); await b.close(); })();
