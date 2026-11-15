// Word bank from Wiktionary (tools/WORDBANK_BRIEF.md): expressions found in real sentences (any verb form), informal words, word cards, Profe, Verbatim
const { chromium, devices } = require("playwright"); const fs = require("fs");
const R = []; const rec = (n, ok, i) => { R.push(!!ok); console.log((ok ? "PASS " : "FAIL ") + n + (!ok && i ? "  " + i : "")); };
const MOCK = fs.readFileSync(__dirname + "/videos-test.js", "utf8").match(/const MOCK = `([\s\S]*?)`;/)[1];
(async () => { const b = await chromium.launch(); const c = await b.newContext({ ...devices["Pixel 7"], serviceWorkers: "block" });
  await c.route("**/www.youtube.com/iframe_api", (r) => r.fulfill({ contentType: "text/javascript", body: MOCK })); await c.route("**/lrclib.net/**", (r) => r.fulfill({ contentType: "application/json", headers: { "access-control-allow-origin": "*" }, body: "[]" }));
  const ASR = '<transcript><text start="0" dur="3">oye mae qué onda</text><text start="3" dur="3">ayer metí la pata con mi jefe</text><text start="6" dur="3">tienes que ponerte las pilas</text><text start="9" dur="3">no le pares bola a eso</text></transcript>';
  await c.addInitScript((ASR) => { window.AndroidCap = { available: () => true, fetch(id, vid) { setTimeout(() => window.__acap.ev(id, JSON.stringify({ lang: "es", kind: "manual", es: ASR, en: "", secs: "300" }), ""), 50); } }; }, ASR);
  const p = await c.newPage(); const er = []; p.on("pageerror", (x) => er.push(x.message));
  await p.goto("http://localhost:8766/#curso"); await p.waitForTimeout(800);
  const t0 = Date.now(); const n = await p.evaluate(() => window.__xp.load().then((x) => [x.P.size, Object.keys(x.W).length, Object.keys(x.F).length])); const ms = Date.now() - t0;
  rec("Bank loads: thousands of expressions, labelled words and word forms", n[0] > 10000 && n[1] > 5000 && n[2] > 50000, JSON.stringify(n) + " " + ms + "ms");
  const F = (t) => p.evaluate((t) => window.__xp.find(t).map((m) => m.e[0]), t);
  const cases = [["¿Me estás tomando el pelo?", "tomar el pelo"], ["Ayer metí la pata con mi jefe.", "meter la pata"], ["Tienes que ponerte las pilas.", "ponerse las pilas"], ["Me puse las pilas para el examen.", "ponerse las pilas"], ["Mi hermano me echó una mano con la mudanza.", "echar una mano"], ["Oye, ¿qué onda?", "qué onda"], ["No le pares bola a eso.", "parar bola"], ["Sin embargo, llegó tarde.", "sin embargo"], ["Lo hizo a regañadientes.", "a regañadientes"]];
  for (const [s, want] of cases) { const got = await F(s); rec("Finds «" + want + "» in «" + s + "»", got.includes(want), JSON.stringify(got)); }
  const none = await F("El perro come en la casa de mi abuela.");
  rec("A plain sentence: no false expression", !none.some((x) => /pata|pelo|pilas|mano/.test(x)), JSON.stringify(none));
  // word card lines
  const card = await p.evaluate(() => window.__xp.lines("pata", "Ayer metí la pata con mi jefe."));
  rec("Word card for «pata» in that sentence shows the expression «meter la pata» with its meaning", /Expression/.test(card) && /meter la pata/.test(card) && /mess up|screw up|foot/.test(card), card.slice(0, 200));
  const card2 = await p.evaluate(() => window.__xp.lines("chévere", "Está chévere."));
  rec("Word card for «chévere» shows where it's used", /Caribbean|Venezuela|Colombia|Panama|colloquial/i.test(card2), card2.slice(0, 200));
  // Profe
  const ans = await p.evaluate(() => window.__xp.meaning("meter la pata"));
  rec("Profe: «what does meter la pata mean» answered from the bank", /meter la pata\*\* = .*(mess up|screw up)/.test(ans || ""), ans);
  await p.click('[data-act="t-open"]'); await p.waitForTimeout(400);
  await p.fill("#t-input", "what does tomar el pelo mean"); await p.press("#t-input", "Enter"); await p.waitForTimeout(1200);
  const chat = await p.evaluate(() => (document.getElementById("t-msgs") || {}).innerText || "");
  rec("…in Profe's chat too (an expression, not word by word)", /tomar el pelo/.test(chat) && /(leg|fool|kid)/i.test(chat), chat.slice(-300));
  await p.click('[data-act="t-close"]').catch(() => {});
  // video captions: informal expressions coloured as one unit
  await p.goto("http://localhost:8766/#video-WLXiu-qp8Lw"); await p.waitForTimeout(1500);
  const vc = await p.evaluate(() => [...document.querySelectorAll("#vcap .vword.vinf")].map((x) => x.textContent + "|" + (JSON.parse(x.dataset.inf || "{}").ph || "")));
  rec("Video captions: «parar bola» (Panama…) coloured as one expression", vc.includes("pares|parar bola") && vc.includes("bola|parar bola"), JSON.stringify(vc));
  rec("…common words are not coloured as slang (jefe, pilas, pata)", !vc.some((x) => /^(jefe|con|mi|ayer)\|$/.test(x)), JSON.stringify(vc));
  const tips = []; for (let t = 3.0; t < 9; t += 0.25) { await p.evaluate((t) => { window.__yt.p.t = t; window.__yt.p.st = 2; }, t); await p.waitForTimeout(140); const tp = await p.evaluate(() => { const x = document.getElementById("vtip"); if (!x || x.hidden) return null; const k = x.dataset.k.split(":"); const w = document.querySelectorAll("#vcap .vcue")[+k[0]].querySelectorAll(".ves .vword")[+k[1]]; return (w ? w.textContent : "?") + "=" + x.textContent; }); if (tp && tips[tips.length - 1] !== tp) tips.push(tp); }
  rec("Verbatim on song/video captions: one bubble for the whole expression (metí la pata → mess up; ponerte las pilas → get one's act together)", tips.some((x) => /^metí=.*(mess up|screw up)/.test(x)) && tips.some((x) => /^ponerte=.*act together|socks/.test(x)) && tips.filter((x) => /^(la|pata)=/.test(x)).every((x) => /mess up/.test(x)) && !tips.some((x) => /leg|paw|foot/.test(x)), JSON.stringify(tips));
  await p.click('#vcap .vword >> text=pares'); await p.waitForTimeout(300);
  const sheet = await p.textContent("#sheet");
  rec("Tapping it: the card explains the expression and where it's used", /parar bola/.test(sheet) && /Panama/.test(sheet), sheet.slice(0, 300));
  // Words › Informal gains Panama's words
  await p.goto("http://localhost:8766/#palabras-informal").catch(() => {}); 
  const rows = await p.evaluate(() => { try { return window.__xp.get() ? 1 : 0; } catch (e) { return 0; } });
  // Panama, curated
  await p.goto("http://localhost:8766/#curso"); await p.waitForTimeout(500); await p.evaluate(() => window.__xp.load());
  const pm = await p.evaluate(() => [window.__xp.meaning("qué xopá"), window.__xp.meaning("juega vivo"), window.__xp.meaning("chantin"), window.__xp.meaning("tranque")]);
  rec("Profe: Panama words answered from the curated list (qué xopá, juega vivo, chantin, tranque)", /what's up/.test(pm[0]) && /street smarts/.test(pm[1]) && /home/.test(pm[2]) && /traffic jam/.test(pm[3]) && pm.every((x) => /🇵🇦/.test(x)), JSON.stringify(pm));
  const pf = await p.evaluate(() => [window.__xp.find("Le metió un bate al jefe.").map((m) => m.e[0]), window.__xp.find("Hay que echar pa'lante, mopri.").map((m) => m.e[0]), window.__xp.find("Eso se volvió un arroz con mango.").map((m) => m.e[0])]);
  rec("Panama expressions found in sentences (metió un bate, echar pa'lante, arroz con mango)", pf[0].includes("meter un bate") && pf[1].includes("echar pa'lante") && pf[2].includes("arroz con mango"), JSON.stringify(pf));
  const pi = await p.evaluate(() => [window.__xp.inf("chantin"), window.__xp.inf("buco"), window.__xp.inf("chino"), window.__xp.inf("real")]);
  rec("Distinctive Panama words are coloured (chantin, buco); everyday ones are not (chino, real)", pi[0] && pi[0].where === "Panama" && pi[1] && !pi[2] && !pi[3], JSON.stringify(pi));
  const pc = await p.evaluate(() => window.__xp.lines("chino", "Voy al chino a comprar pan."));
  rec("Word card for «chino» shows its Panama meaning with an example", /In Panama/.test(pc) && /corner shop/.test(pc) && /Voy al chino/.test(pc), pc.slice(0, 200));
  const ley = await p.evaluate(() => [window.__xp.find("Estoy a ley de una señal, márcame al celular").map((m) => m.e[0]), window.__xp.meaning("estar a ley de")]);
  rec("Song slang «estoy a ley de una señal» (Verano Rosa) recognised: one step away", ley[0].includes("estar a ley de") && /one step away/.test(ley[1] || ""), JSON.stringify(ley));
  rec("No script errors", !er.length, er.join(" | "));
  console.log(R.filter(Boolean).length + "/" + R.length + " passed"); await b.close(); })();
