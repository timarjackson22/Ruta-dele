// v253 — the 6th S24 call log (2026-11-20 22:04–22:16): a call started while the AI model was still loading restarted the
// app (twice across two logs); «practicar traduciendo oraciones» got four minutes of chit-chat and one muddled item;
// «…puedes usar las lecciones de DELE para practicar» started a drill of «usar»; «me gusta pollo / frijoles» was never
// corrected; Profe talked about himself practising Spanish.
const { open } = require("./h.js");
(async () => {
  const R = []; const rec = (n, ok, i) => { R.push(!!ok); console.log((ok ? "PASS " : "FAIL ") + n + (ok ? "" : "  " + (i || ""))); };
  const H = await open(); const p = H.p; await p.evaluate(() => window.__setName("Timar", true));
  const said = async (fn, ms) => { const n = (await H.tts()).length; await fn(); await H.wait(ms || 7000); return (await H.tts()).slice(n).map((e) => e.text).join(" "); };
  const listening = () => p.waitForFunction(() => window.__vc.state() === "listening" && window.__R.on, null, { timeout: 20000 });
  // the greeting waits while the model is loading
  await p.evaluate(() => { window.__natState = "loading"; });
  const n0 = (await H.tts()).length;
  await p.evaluate(() => document.querySelector('[data-act="vc-open"]').click()); await H.wait(3000);
  const early = (await H.tts()).slice(n0).length;
  rec("No greeting while the AI model is loading", early === 0, early + " utterances");
  await p.evaluate(() => { window.__natState = "loaded"; }); await H.wait(5000);
  const g = (await H.tts()).slice(n0).map((e) => e.text).join(" ");
  rec("…the greeting comes once it has loaded", /Hola, Timar/.test(g), g);
  await listening();
  // translation practice is the app's
  const k0 = (await H.reqs()).length;
  let s = await said(() => H.say("yo quiero practicar traduciendo oraciones"), 9000);
  const it = await p.evaluate(() => { const D = window.__trd(); return D && D.it ? { src: D.it.src, ans: D.it.ans[0] } : null; });
  const nz = (x) => String(x || "").toLowerCase().replace(/[^a-z' ]+/g, " ").replace(/\s+/g, " ").trim();
  rec("«Practicar traduciendo oraciones» starts the app's translation drill (no AI)", it && /Vamos a traducir/.test(s) && nz(s).includes(nz(it.src)) && (await H.reqs()).length === k0, s);
  const tts = await H.tts(); const en = tts.find((e) => it && nz(e.text) === nz(it.src));
  rec("…the English sentence is read in the English voice", en && /^en/.test(en.lang || ""), JSON.stringify(en && { t: en.text, l: en.lang }));
  await listening(); s = await said(() => H.say("yo como manzanas rojas"), 7000);
  rec("A wrong try gets a clue (first words), not the answer", /Pista: empieza con/.test(s) && !s.includes(it.ans), s);
  await listening(); s = await said(() => H.say(it.ans), 8000);
  rec("The right Spanish is accepted and the next sentence follows", /(Muy bien|Perfecto|Excelente|Eso es)/.test(s) && /Ahora: Traduce al español/.test(s), s);
  await listening(); s = await said(() => H.say("terminamos"), 6000);
  rec("«Terminamos» ends it", /Paramos aquí/.test(s) && !(await p.evaluate(() => window.__drillOn())), s);
  // no verb drill from a verb in the middle of a long sentence
  await listening(); await H.replies([{ text: "¡Buena idea! Las lecciones te ayudan mucho. ¿Cuál te gusta más? [[·]]", delay: 40 }]);
  s = await said(() => H.say("de otra cosas puedes usar las lecciones de dele para practicar"), 9000);
  rec("«…puedes usar las lecciones… para practicar» does not start a drill of «usar»", !/practicar «?usar/.test(s) && !(await p.evaluate(() => window.__drillOn())), s);
  // «me gusta pollo» is corrected by the app
  await listening(); await H.replies([{ text: "¡Qué rico! ¿Con qué lo comes normalmente? [[·]]", delay: 40 }]);
  s = await said(() => H.say("me gusta pollo"), 9000);
  rec("«Me gusta pollo» → «Se dice: Me gusta el pollo»", /Se dice: «?Me gusta el pollo/.test(s), s);
  rec("Checker: «me gusta frijoles con arroz» → «me gustan los frijoles con arroz»", await p.evaluate(() => /^me gustan los frijoles con arroz/.test(window.__qf("me gusta frijoles con arroz"))));
  rec("Checker leaves «me gusta comer» and «me gusta mucho» alone", await p.evaluate(() => !window.__qf("me gusta comer") && !window.__qf("me gusta mucho")));
  rec("The call brief says Profe is the teacher (never «I practise Spanish»)", await p.evaluate(() => /You are the teacher: never talk about yourself/.test(window.__vcNote(true))));
  await H.say("adiós"); await H.wait(2000);
  const ok = R.filter(Boolean).length; console.log(ok === R.length ? "ALL " + R.length + " PASS" : (R.length - ok) + " FAILED of " + R.length);
  await H.close(); process.exit(ok === R.length ? 0 : 1);
})().catch((e) => { console.log("CRASH", e.message); process.exit(1); });
