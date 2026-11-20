// v249 — Profe as a master teacher in calls (from the 2026-11-20 call log): Spanish drill prompts with the pronoun before the
// form («Pretérito. Yo…» → «yo cambié»), a hint that names the wrong form, «¿Está claro?» after a revealed answer and the
// whole tense if not, «repite» repeats only the question, «otro verbo» switches; mistakes in conversation are corrected at
// once («Se dice: …»), the learner's sentence is never echoed back, and no sentence is cut mid-word.
const { open } = require("./h.js");
(async () => {
  const R = []; const rec = (n, ok, i) => { R.push(!!ok); console.log((ok ? "PASS " : "FAIL ") + n + (ok ? "" : "  " + (i || ""))); };
  const H = await open(); const p = H.p;
  await p.evaluate(() => window.__setName("Ana", true));
  await p.evaluate(() => document.querySelector('[data-act="vc-open"]').click()); await H.wait(6000);
  const said = async (fn, ms) => { const n = (await H.tts()).length; await fn(); await H.wait(ms || 7000); return (await H.tts()).slice(n).map((e) => e.text).join(" "); };
  // 1. the drill starts in Spanish, pronoun last («Presente de «cambiar». Yo…»)
  const s1 = await said(() => H.say("quiero practicar cambiar"), 9000);
  rec("Drill starts in Spanish: tense + «cambiar» + the pronoun (no English labels read aloud)", /practicar «?cambiar»?/.test(s1) && /(Presente|Pretérito|Futuro|Imperfecto|Condicional)/.test(s1) && /(Yo|Tú|Él, ella o usted|Nosotros|Ellos o ustedes|Vosotros)…/.test(s1) && !/he\/she|formal|simple past/i.test(s1), s1);
  // 2. a wrong form gets a hint naming what it is, then the answer and «¿Está claro?»
  const wrong = await p.evaluate(() => { const D = window.__drill(); const all = ["cambio", "cambiaba", "cambiaron", "cambiaremos", "cambiaría", "cambiamos"]; return all.find((x) => x !== D.q.ans.toLowerCase()); });
  const s2 = await said(() => H.say(wrong), 7000);
  rec("A wrong form: «Casi.» + what that form is + the question again", /^Casi\./.test(s2.trim()) && /Otra vez:/.test(s2), s2);
  const wrong2 = await p.evaluate((w) => { const D = window.__drill(); return ["cambiaste", "cambiasteis", "cambiaban", "cambiarán"].find((x) => x !== D.q.ans.toLowerCase() && x !== w); }, wrong);
  const s3 = await said(() => H.say(wrong2), 7000);
  const ans = await p.evaluate(() => window.__drill().q.ans);
  rec("Second miss: the answer as pronoun + form, then «¿Está claro?» (no new question yet)", new RegExp("La respuesta es: .*" + ans).test(s3) && /¿Está claro\?/.test(s3) && !/Ahora:/.test(s3), s3);
  // 3. «no» → the whole tense as pronoun + form, then the same question again
  const s4 = await said(() => H.say("no"), 9000);
  rec("«No» → the whole tense listed pronoun + form, then «Ahora tú»", /paso a paso/.test(s4) && /yo \S+; tú \S+/.test(s4) && /Ahora tú/.test(s4), s4);
  // 4. «puedes repetir» → only the question
  const s5 = await said(() => H.say("puedes repetir"), 5000);
  rec("«Puedes repetir» repeats only the question (short)", /…/.test(s5) && s5.length < 60, s5);
  // 5. «otro verbo» → a different verb
  const v0 = await p.evaluate(() => window.__drill().v);
  const s6 = await said(() => H.say("quiero otro verbo"), 8000);
  const v1 = await p.evaluate(() => window.__drill().v);
  rec("«Otro verbo» switches to another verb", v1 !== v0 && /Cambiamos de verbo/.test(s6), v0 + " → " + v1 + " · " + s6);
  await p.waitForFunction(() => window.__vc.state() === "listening" && window.__R.on, null, { timeout: 20000 }); await H.say("stop"); await H.wait(5000);
  rec("«Stop» in a call ends the drill", !(await p.evaluate(() => window.__drillOn())));
  // 6. conversation: a real mistake is corrected at once, before the AI's reply
  await H.replies([{ text: "¿Y por qué estás cansado? ¿Trabajaste mucho? [[·]]", delay: 60 }]);
  await p.waitForFunction(() => window.__vc.state() === "listening" && window.__R.on, null, { timeout: 20000 });
  const s7 = await said(() => H.say("yo soy cansado hoy"), 10000);
  rec("A mistake in conversation: «Se dice: …» first, then Profe carries on", /^Se dice: «?Yo estoy cansado hoy/.test(s7.trim()) && /por qué/.test(s7), s7);
  // 7. the learner's words are not echoed back
  const e = await p.evaluate(() => window.__dropEcho("¡Te quiero pan con queso! Es una forma de comer. ¿Te gusta?", "te quiero pan con queso"));
  rec("An echo of the learner's sentence is dropped", e === "Es una forma de comer. ¿Te gusta?", e);
  await H.replies([{ text: "¡Me encanta el pan con queso! Es muy rico. ¿Quieres practicar más ahora? [[·]]", delay: 40, wordMs: 15 }]);
  await p.waitForFunction(() => window.__vc.state() === "listening" && window.__R.on, null, { timeout: 20000 });
  const n8 = (await H.tts()).length; await H.say("me encanta el pan con queso"); await H.wait(9000);
  const t8 = (await H.tts()).slice(n8).map((x) => x.text);
  rec("…in a live call too, and no sentence is cut mid-word", !t8.some((x) => /^me encanta el pan con queso/i.test(x.replace(/^¡/, ""))) && !t8.some((x) => /^[a-záéíóúñ]{1,4}\?$/.test(x.trim())) && t8.join(" ").includes("¿Quieres practicar más ahora?"), JSON.stringify(t8));
  rec("No page errors", !H.errs.length, H.errs.join(" | "));
  await H.close(); const bad = R.filter((x) => !x).length; console.log(bad ? bad + " FAILED of " + R.length : "ALL " + R.length + " PASS"); process.exit(bad ? 1 : 0);
})();
