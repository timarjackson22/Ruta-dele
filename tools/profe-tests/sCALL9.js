// v300 — the S24 call log of 2026-11-27 12:11–12:17 («interrupt by voice» on, phone speaker, Gemma):
// 1. the recogniser handed over Profe's FIRST sentence («¡Muy bien!») while he was saying the next one; judged against the
//    current sentence only, it looked like the learner: Profe's question was cancelled, then the turn was dropped as an echo;
// 2. «Jamaica es un país muy Sí pero de dónde eres» (his words, then the learner's) was dropped whole;
// 3. «¿De dónde eres?» got «Yo soy tu profesor», later «Soy de México», then forgotten: Profe now has a fixed persona;
// 4. the per-turn steering note was resent every turn and the model session rotated every 3 turns.
const { open } = require("./h.js");
(async () => {
  const R = []; const rec = (n, ok, i) => { R.push(!!ok); console.log((ok ? "PASS " : "FAIL ") + n + (ok ? "" : "  " + String(i || "").slice(0, 400))); };
  const H = await open(); const p = H.p; await p.evaluate(() => { window.__setName("Timar", true); window.__tsSet("vc_barge", "on"); });
  const listening = () => p.waitForFunction(() => window.__vc.state() === "listening" && window.__R.on, null, { timeout: 30000 });
  const speakingNow = (re) => p.waitForFunction((s) => window.__T.cur && new RegExp(s).test(window.__T.cur.text), re, { timeout: 20000 });
  await p.evaluate(() => document.querySelector('[data-act="vc-open"]').click()); await H.wait(7000); await listening();
  // 1. his first sentence comes back from the mic while he says the second: no interruption
  await H.replies([{ text: "¡Muy bien! Usas el español con tus compañeros y clientes. ¿Qué tipo de trabajo haces? [[·]]", delay: 60, wordMs: 20 }]);
  const n0 = (await H.tts()).length; await H.say("con mis compañeros y mis clientes");
  await speakingNow("Usas el español"); await p.evaluate(() => window.__say("muy bien", { wordMs: 20 }));
  await H.wait(9000); await listening();
  const t1 = (await H.tts()).slice(n0);
  rec("Profe's own first sentence heard during the next one doesn't cut him off: his question is said", t1.some((e) => /Qué tipo de trabajo/.test(e.text) && e.t1 && !e.stopped) && !t1.some((e) => e.stopped), JSON.stringify(t1.map((e) => [e.text.slice(0, 30), !!e.stopped])));
  // 2. his words, then the learner's: the learner takes the turn with only their own words
  await H.replies([{ text: "Jamaica es un país muy bonito. ¿Qué haces en Jamaica? [[·]]", delay: 60, wordMs: 20 }]);
  await H.say("soy de Jamaica"); await speakingNow("Qué haces en Jamaica");
  const k0 = (await H.reqs()).length;
  await H.replies([{ text: "Soy de la Ciudad de Panamá. ¿Y tú de qué parte de Jamaica eres? [[·]]", delay: 60, wordMs: 20 }]);
  await p.evaluate(() => window.__say("Jamaica es un país muy sí pero de dónde eres", { wordMs: 30 }));
  await H.wait(8000);
  const rq = (await H.reqs()).slice(k0), u = rq.length ? String(rq[0].user || "") : "", lm = (u.match(/Learner: ([^\n]*)/) || [])[1] || "";
  rec("«Jamaica es un país muy sí pero de dónde eres»: his words are cut off, the learner's question reaches Profe", /^s[ií] pero de d[oó]nde eres/i.test(lm), (lm || u.slice(-120)) + " · " + (await p.evaluate(() => window.__vitals().filter((x) => /\[call\]|\[you\]/.test(x)).slice(-6).join(" / "))));
  rec("A question about Profe gets his persona (one sentence, from the chosen variety)", /asked about you/.test(u) && /Soy de la Ciudad de Panamá, en Panamá/.test(u), u.slice(-260));
  const sys = await p.evaluate(() => window.__L.sys || "");
  rec("The call brief carries «About you» and the steering rule (not resent every turn)", /About you: from la Ciudad de Panamá, Panamá/.test(sys) && /Each turn: respond to what the learner actually said/.test(sys), sys.slice(-400));
  // 3. persona follows the accent
  const per = await p.evaluate(() => ["es-MX", "es-CO", "es-PA"].map((a) => window.__pvPersona(a).city));
  rec("Profe's home follows the chosen accent (Mexico → Guadalajara, Colombia → Medellín, Panama → Panamá)", per[0] === "Guadalajara" && per[1] === "Medellín" && /Panamá/.test(per[2]), JSON.stringify(per));
  // 4. an ordinary turn: no default steering note in the message; questions are not «things they told you»
  await listening(); const k1 = (await H.reqs()).length;
  await H.replies([{ text: "¡Qué bien! ¿Qué te gusta de tu trabajo? [[·]]", delay: 60, wordMs: 20 }]);
  await H.say("trabajo en una oficina con muchos clientes"); await H.wait(7000);
  const u2 = String(((await H.reqs()).slice(k1)[0] || {}).user || "");
  rec("In a call an ordinary turn sends no repeated steering note (the model's session lasts longer)", u2 && !/Reply as Profe the teacher/.test(u2) && u2.length < 600, u2.length + " " + u2.slice(-200));
  rec("«de dónde eres» is not stored as something the learner told Profe", !/They told you:[^)]*de d[oó]nde eres/.test(u2), u2.slice(0, 300));
  // 5. unit: the echo cutter
  const st = await p.evaluate(() => [window.__vcStripEcho("trabajo en una oficina"), window.__vcStripEcho("qué te gusta de tu trabajo me gusta ayudar")]);
  rec("The echo cutter keeps sentences that aren't Profe's and strips his words at the start", st[0] === "trabajo en una oficina" && st[1] === "me gusta ayudar", JSON.stringify(st));
  await p.evaluate(() => document.querySelector('[data-act="vc-end"]').click()); await H.wait(1500);
  rec("No page errors", !H.errs.length, H.errs.join(" | "));
  await H.close(); const bad = R.filter((x) => !x).length; console.log(bad ? bad + " FAILED of " + R.length : "ALL " + R.length + " PASS"); process.exit(bad ? 1 : 0);
})();
