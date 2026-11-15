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
  // 15 Nov 2026: on the phone, caption lines use the online translator when there's a connection (more accurate), the offline one otherwise
  await p.route("https://api.mymemory.translated.net/**", (rt) => rt.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ responseData: { translatedText: "A little coffee, please (online)" } }) }));
  const o = await p.evaluate(async () => [await window.__trEn("Un cafecito", { online: true }), await window.__trEn("Un cafecito")]);
  rec("Captions online: the online translator answers first", o[0] === "A little coffee, please (online)", o[0]);
  rec("Other uses (and offline) keep the phone's translator", o[1] === "A little coffee", o[1]);
  await p.unroute("https://api.mymemory.translated.net/**"); await p.route("https://api.mymemory.translated.net/**", (rt) => rt.abort());
  const f = await p.evaluate(async () => window.__trEn("Un cafecito", { online: true }));
  rec("Online translator unreachable: falls back to the phone's translator", f === "A little coffee", f);
  rec("No script errors", !er.length, er.join(" | "));
  console.log(R.filter(Boolean).length + "/" + R.length + " passed"); await b.close(); })();
