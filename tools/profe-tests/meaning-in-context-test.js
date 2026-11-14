// Meaning in context (tools/CONTEXT_MEANING_BRIEF.md): Verbatim and word cards follow the sentence. Sample lines are invented.
const { chromium, devices } = require("playwright"); const fs = require("fs");
const R = []; const rec = (n, ok, info) => { R.push(ok); console.log((ok ? "PASS " : "FAIL ") + n + (info ? "  " + info : "")); };
const MOCK = fs.readFileSync(__dirname + "/vid.js", "utf8").match(/const MOCK = `([\s\S]*?)`;/)[1];
const L = [[0, "Ven, bailemos pegaditos toda la noche.", "Come on, let's dance close together all night."], [4, "Este café está muy rico.", "This coffee is very tasty."], [8, "Hoy el tiempo está loco.", "Today the weather is crazy."],
  [12, "La etiqueta está pegadita a la caja.", "The label is stuck to the box."], [16, "No me di cuenta de nada.", "I didn't realize anything."], [20, "Fuimos al parque y nos sentamos en un banco.", "We went to the park and sat on a bench."], [24, "Mi mami baila tan rico.", "My babe dances so hot."], [28, "Y ya está.", "And that's it."]];
const X = (k) => '<?xml version="1.0" encoding="utf-8" ?><transcript>' + L.map((l, i) => '<text start="' + l[0] + '" dur="4">' + l[k] + "</text>").join("") + "</transcript>";
const ASR = '<?xml version="1.0" encoding="utf-8" ?><transcript><text start="0" dur="3">hace mucho tiempo que no te veo</text><text start="4" dur="3">el partido terminó con un gol</text><text start="8" dur="3">vale vale</text></transcript>';
const TR = { "Hace mucho tiempo que no te veo.": "I haven't seen you in a long time.", "El partido terminó con un gol.": "The match ended with a goal." };
(async () => {
  const b = await chromium.launch(); const c = await b.newContext({ ...devices["Pixel 7"], serviceWorkers: "block" });
  await c.route("**/www.youtube.com/iframe_api", (r) => r.fulfill({ contentType: "text/javascript", body: MOCK }));
  await c.route("**/i.ytimg.com/**", (r) => r.fulfill({ status: 404, body: "" }));
  await c.addInitScript(([es, en, asr, TR]) => {
    const CAPS = { "WLXiu-qp8Lw": { lang: "es", kind: "manual", es, en, secs: "300" }, "LdRsZ1adZWw": { lang: "es", kind: "asr", es: asr, en: "", secs: "300" } };
    window.AndroidCap = { fetch(id, vid) { setTimeout(() => window.__acap.ev(id, JSON.stringify(CAPS[vid] || { none: true }), ""), 60); } };
    window.AndroidTR = { available: () => true, translate(id, t) { setTimeout(() => window.__atr && window.__atr.ev(id, TR[t] || "EN(" + t + ")", ""), 30); } };
  }, [X(1), X(2), ASR, TR]);
  const p = await c.newPage(); const er = []; p.on("pageerror", (x) => er.push(x.message));
  const tipAt = async (t, word) => { await p.evaluate((t) => { window.__yt.p.t = t; window.__yt.p.st = 2; }, t); await p.waitForTimeout(450);
    // the bubble of a given word: find it in the current line's glosses
    return p.evaluate((word) => { const x = document.getElementById("vtip"); if (!x || x.hidden) return null; const k = x.dataset.k.split(":"); return { tip: x.textContent, on: document.querySelectorAll("#vcap .vcue")[+k[0]].querySelectorAll(".ves .vword")[+k[1]].textContent }; }, word); };
  await p.goto("http://localhost:8766/#video-WLXiu-qp8Lw"); await p.waitForTimeout(2200); // captions in, full dictionary loaded by the word check
  const wordT = async (line, w) => p.evaluate(([line, w]) => { const r = document.querySelectorAll("#vcap .vcue")[line]; const sp = [...r.querySelectorAll(".ves .vword")]; return sp.findIndex((x) => x.textContent === w); }, [line, w]);
  // move the clock onto a word: spread like the app does (by characters)
  const timeOf = async (line, w) => p.evaluate(([line, w]) => { const r = document.querySelectorAll("#vcap .vcue")[line], sp = [...r.querySelectorAll(".ves .vword")], i = sp.findIndex((x) => x.textContent === w); return i; }, [line, w]);
  const check = async (line, t0, w, re, name) => { let got = null; for (let dt = 0; dt < 3.6; dt += 0.12) { const r = await tipAt(t0 + dt); if (r && r.on === w) { got = r; break; } } rec(name, got && re.test(got.tip), JSON.stringify(got)); };
  await check(0, 0, "pegaditos", /^close together$/, "Dance line: pegaditos → «close together» (not «little stuck»)");
  await check(3, 12, "pegadita", /stuck/i, "Same word, no dancing around it: pegadita a la caja → «stuck», from the sentence");
  await check(1, 4, "rico", /^tasty$/, "rico about coffee → tasty");
  await check(6, 24, "rico", /hot|sexy/, "rico about dancing → hot, sexy");
  await check(2, 8, "tiempo", /^weather$/i, "tiempo: the sentence's English says weather → «weather» (no rule needed)");
  await check(4, 16, "cuenta", /realis|realiz/, "darse cuenta → realise");
  await check(5, 20, "banco", /bench/, "banco in a park → bench (from the sentence)");
  rec("Verbatim never shows a label or 'little stuck'", !(await p.evaluate(() => document.getElementById("vtip").textContent)).match(/diminutive|little stuck/));
  // card
  await p.evaluate(() => { window.__yt.p.t = 1; }); await p.waitForTimeout(400);
  await p.click('#vcap .vcue[data-i="0"] .vword >> text=pegaditos'); await p.waitForTimeout(300); const card = (await p.textContent("#sheet")).replace(/\s+/g, " ");
  rec("Word card: «Here: close together» first, then the other meanings", /Here:\s*close together/.test(card) && /from the words around it/.test(card) && /Other meanings/.test(card), card.slice(0, 160));
  await p.click('[data-act="vc-catch"]'); await p.waitForTimeout(300);
  rec("Catch it saves the in-context meaning", /close together/.test(await p.textContent("#vcaught")));
  // automatic captions: no English track, the app translates the sentences in the background (English lines off)
  await p.goto("http://localhost:8766/#video-LdRsZ1adZWw"); await p.waitForTimeout(2200);
  rec("English lines are off here", !(await p.evaluate(() => document.getElementById("vcap").classList.contains("show-en"))));
  for (let dt = 0; dt < 2.6; dt += 0.12) { await tipAt(dt); } // let the translations arrive
  await check(0, 0, "tiempo", /time/i, "Automatic captions: «hace mucho tiempo» → time (from the background translation)");
  await check(1, 4, "partido", /^match$/i, "el partido … gol → match");
  rec("No script errors", !er.length, er.join(" | "));
  console.log(R.filter(Boolean).length + "/" + R.length + " passed"); await b.close();
})();
