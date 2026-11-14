// Word forms (tools/WORD_FORMS_BRIEF.md): coined small/big forms recognised, translation only in Verbatim, breakdown on the card
const { chromium, devices } = require("playwright"); const fs = require("fs");
const R = []; const rec = (n, ok, info) => { R.push(ok); console.log((ok ? "PASS " : "FAIL ") + n + (info ? "  " + info : "")); };
const MOCK = fs.readFileSync(__dirname + "/vid.js", "utf8").match(/const MOCK = `([\s\S]*?)`;/)[1];
const EXP = { abracito: "little hug", abracitos: "little hugs", besito: "little kiss", cafecito: "little coffee", poquito: "a little bit", cerquita: "really close", lucecita: "little light", solecito: "little sun", amorcito: "sweetheart", chiquitito: "teeny-tiny",
  bonitísimo: "very pretty", riquísimo: "delicious", casita: "little house", panecito: "little bread", juguito: "little juice", calentito: "nice and hot", despacito: "nice and slow", ahorita: "right now", amiguito: "little friend", mesita: "little table" };
const FULL = { florecita: "little flower", cervecita: "little beer", tacita: "little cup", cucharón: "ladle" };
const WHOLE = { tortilla: /omelette|tortilla/i, cuchillo: /knife/i, bolsillo: /pocket/i, ratón: /mouse/i };
(async () => {
  const b = await chromium.launch(); const c = await b.newContext({ ...devices["Pixel 7"], serviceWorkers: "block" });
  await c.route("**/www.youtube.com/iframe_api", (r) => r.fulfill({ contentType: "text/javascript", body: MOCK }));
  await c.route("**/i.ytimg.com/**", (r) => r.fulfill({ status: 404, body: "" }));
  const xml = '<?xml version="1.0" encoding="utf-8" ?><transcript><text start="0" dur="4">Dame un abracito y un cafecito bien calentito.</text><text start="4" dur="4">Bonito, bonito, con un poquito de amor.</text></transcript>';
  await c.addInitScript((xml) => {
    window.AndroidCap = { fetch(id) { setTimeout(() => window.__acap.ev(id, JSON.stringify({ lang: "es", kind: "manual", es: xml, en: "", secs: "300" }), ""), 60); } };
    window.__trCalls = []; window.AndroidTR = { available: () => true, translate(id, t) { window.__trCalls.push(t); setTimeout(() => window.__atr && window.__atr.ev(id, "EN(" + t + ")", ""), 20); } };
  }, xml);
  const p = await c.newPage(); const er = []; p.on("pageerror", (x) => er.push(x.message));
  await p.goto("http://localhost:8766/#historia-a1-1"); await p.waitForTimeout(1800);
  const run = (ws) => p.evaluate((ws) => ws.map((w) => [w, window.__cueGloss(w)]), ws);
  const core = await run(Object.keys(EXP).concat(Object.keys(WHOLE)));
  const bad1 = core.filter(([w, g]) => EXP[w] && g !== EXP[w]);
  rec("Coined small/big forms translated (core dictionary): " + Object.keys(EXP).length + " words", !bad1.length, JSON.stringify(bad1));
  rec("Look-alike words are never broken down (tortilla, cuchillo, bolsillo, ratón)", core.filter(([w, g]) => WHOLE[w] && /little|big/.test(g)).length === 0, JSON.stringify(core.filter(([w]) => WHOLE[w])));
  await p.evaluate(() => window.__loadLex());
  const full = await run(Object.keys(EXP).concat(Object.keys(FULL), Object.keys(WHOLE)));
  const bad2 = full.filter(([w, g]) => (EXP[w] && w !== "corazoncito" && g !== EXP[w]) || (FULL[w] && g !== FULL[w]) || (WHOLE[w] && !WHOLE[w].test(g)));
  rec("…and with the full dictionary loaded, incl. florecita, cervecita, tacita, cucharón (ladle)", !bad2.length, JSON.stringify(bad2));
  rec("Never a label (diminutive, augmentative…) or a breakdown in what Verbatim reads", !full.concat(core).some(([w, g]) => /diminutive|augmentative|superlative|«|\+|small or/i.test(g)), JSON.stringify(full.filter(([w, g]) => /diminutive|«|\+/i.test(g))));
  // videos
  await p.goto("http://localhost:8766/#video-WLXiu-qp8Lw"); await p.waitForTimeout(1500);
  const tip = async (t) => { await p.evaluate((t) => { window.__yt.p.t = t; window.__yt.p.st = 2; }, t); await p.waitForTimeout(450); return p.evaluate(() => { const x = document.getElementById("vtip"); if (!x || x.hidden) return null; const k = x.dataset.k.split(":"); return [x.textContent, document.querySelectorAll("#vcap .vcue")[+k[0]].querySelectorAll(".ves .vword")[+k[1]].textContent]; }); };
  const t1 = await tip(0.75), t2 = await tip(1.85), t3 = await tip(3.0), t4 = await tip(6.6);
  rec("Verbatim on 'un abracito': «little hug» (just the translation)", t1 && t1[1] === "abracito" && t1[0] === "little hug", JSON.stringify(t1));
  rec("…cafecito → little coffee, calentito → nice and hot, poquito → a little bit", t2 && t2[0] === "little coffee" && t3 && t3[0] === "nice and hot" && t4 && t4[0] === "a little bit", JSON.stringify([t2, t3, t4]));
  await p.click('#vcap .vword >> text=abracito'); await p.waitForTimeout(300); const card = (await p.textContent("#sheet")).replace(/\s+/g, " ");
  rec("Word card: the translation plus the breakdown, so the pattern is learned", /little hug/.test(card) && /abrazo/.test(card) && /-ito/.test(card) && /small or affectionate/.test(card), card.slice(0, 140)); await p.click('[data-act="vc-close"]');
  await p.waitForTimeout(800); const sv = await p.evaluate(() => JSON.parse(localStorage.getItem("ruta-dele-v1")).vlex || {}); const calls = await p.evaluate(() => window.__trCalls);
  rec("Word check: coined words are solved by breakdown, not sent to the translator", !calls.includes("abracito") && !calls.includes("cafecito") && !calls.includes("calentito"), JSON.stringify(calls));
  rec("No script errors", !er.length, er.join(" | "));
  console.log(R.filter(Boolean).length + "/" + R.length + " passed"); await b.close();
})();
