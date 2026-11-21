// v252 — the 5th S24 call log (2026-11-20 21:00–21:10): the on-phone model said «Se dice: …» on almost every turn (for right
// answers, and with wrong Spanish) and then «Es una frase correcta»; a drill question got «¿Seguimos con otra pregunta…?»
// added, «sí, sigue» ended the drill and the next «sí» restarted it (three times); «gustar» was drilled as «nosotros
// gustamos»; «quiero practicar los verbos» never started a drill; «me llamo» (name cut off) and then «me llamo timar» went
// to the AI instead of «¡Mucho gusto, Timar!».
const { open } = require("./h.js");
(async () => {
  const R = []; const rec = (n, ok, i) => { R.push(!!ok); console.log((ok ? "PASS " : "FAIL ") + n + (ok ? "" : "  " + (i || ""))); };
  const H = await open(); const p = H.p;
  await p.evaluate(() => window.__setName("", true));
  const said = async (fn, ms) => { const n = (await H.tts()).length; await fn(); await H.wait(ms || 7000); return (await H.tts()).slice(n).map((e) => e.text).join(" "); };
  const listening = () => p.waitForFunction(() => window.__vc.state() === "listening" && window.__R.on, null, { timeout: 20000 });
  await p.evaluate(() => document.querySelector('[data-act="vc-open"]').click()); await H.wait(7000); await listening();
  // names
  let s = await said(() => H.say("me llamo"), 6000);
  rec("«Me llamo» with the name cut off → asks for just the name", /Dime solo tu nombre/.test(s), s);
  await listening(); s = await said(() => H.say("me llamo timar"), 7000);
  rec("…then «me llamo timar» → «¡Mucho gusto, Timar!»", /Mucho gusto, Timar/.test(s), s);
  // the AI's own corrections are removed in calls on the on-device model
  await listening(); await H.replies([{ text: "Se dice: Por favor. Es una frase correcta. ¿Qué te gusta hacer los fines de semana? [[·]]", delay: 40 }]);
  s = await said(() => H.say("me gusta mucho la música de Panamá"), 9000);
  rec("No «Se dice» / «Es una frase correcta» from the on-device AI; the question stays", !/Se dice|frase correcta/.test(s) && /fines de semana/.test(s), s);
  rec("Filter unit: «Se dice: Yo me gusta. Es correcto. ¿Y tú?» → «¿Y tú?»", await p.evaluate(() => window.__dropFix("Se dice: Yo me gusta. Es correcto. ¿Y tú?") === "¿Y tú?"));
  rec("Checker: «un otro verbo» → «otro verbo»", await p.evaluate(() => /^otro verbo/.test(window.__qf("un otro verbo"))));
  // «quiero practicar los verbos» starts a drill at once
  await listening(); const k0 = (await H.reqs()).length;
  s = await said(() => H.say("quiero practicar los verbos regulares"), 9000);
  rec("«Quiero practicar los verbos regulares» starts a drill (no AI, no «¿Quieres practicar…?»)", /verbos regulares/.test(s) && /…/.test(s) && (await H.reqs()).length === k0 && await p.evaluate(() => window.__drillOn()), s);
  rec("No «¿Seguimos con otra pregunta…?» after a drill question", !/Seguimos con otra pregunta/.test(s), s);
  // «sí, sigue» during a question asks for the form; the drill goes on
  await listening(); s = await said(() => H.say("sí sigue"), 6000);
  rec("«Sí, sigue» during a question → «Dime la forma del verbo» + the question; drill still on", /Dime la forma/.test(s) && await p.evaluate(() => window.__drillOn()), s);
  // an answer inside a short sentence is graded
  await listening(); const a = await p.evaluate(() => window.__drill().q.ans);
  s = await said(() => H.say("creo que " + a), 7000);
  rec("A form inside a short answer («creo que …») is graded as right", /(Muy bien|Perfecto|Excelente|Eso es|Genial|Bien|Correcto|Exacto|Fantástico|Bravo)/i.test(s) && !/Casi/.test(s), s);
  await listening(); await H.say("stop"); await H.wait(4000);
  // gustar is practised as «a nosotros nos gusta»
  await listening(); s = await said(() => H.say("quiero practicar gustar"), 9000);
  rec("«Gustar» drill asks «A nosotros…»-style and explains «a mí me gusta»", /a mí me gusta/.test(s) && /(A mí|A ti|A él, a ella o a usted|A nosotros|A vosotros|A ellos o a ustedes)…/.test(s), s);
  const g = await p.evaluate(() => window.__drill().q.ans);
  rec("…the expected answer is clitic + 3rd person («nos gusta»)", /^(me|te|le|nos|os|les) gust/.test(g), g);
  await listening(); s = await said(() => H.say("nosotros gustamos"), 7000);
  rec("«Nosotros gustamos» → a hint about how gustar works", /^Casi\./.test(s.trim()) && /(decimos|va con la cosa)/.test(s), s);
  await listening(); s = await said(() => H.say(g), 7000);
  rec("The right answer («" + g + "») is accepted", !/Casi|La respuesta es/.test(s), s);
  await listening(); await H.say("stop"); await H.wait(3000);
  const ok = R.filter(Boolean).length; console.log(ok === R.length ? "ALL " + R.length + " PASS" : (R.length - ok) + " FAILED of " + R.length);
  await H.close(); process.exit(ok === R.length ? 0 : 1);
})().catch((e) => { console.log("CRASH", e.message); process.exit(1); });
