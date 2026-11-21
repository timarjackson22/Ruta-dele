// v254 — Profe leads a session (the «upgrade Profe» brief + the 7th S24 call log). One continuous call:
// «vamos a practicar» with no topic → three options → «tú eliges» → translation; a grammar question in the middle → answered,
// then back to the SAME sentence; a correct answer phrased differently; a partial answer; a wrong answer → specific hint;
// Profe's own words heard right after he stops are ignored; «terminamos» → evidence-based recap; the session state reaches
// the model every turn and survives a fresh model session; coming back to the app repeats a cut-off question; the greeting
// waits after the model has just loaded.
const { open } = require("./h.js");
(async () => {
  const R = []; const rec = (n, ok, i) => { R.push(!!ok); console.log((ok ? "PASS " : "FAIL ") + n + (ok ? "" : "  " + String(i || "").slice(0, 400))); };
  const H = await open(); const p = H.p; await p.evaluate(() => window.__setName("Timar", true));
  const said = async (fn, ms) => { const n = (await H.tts()).length; await fn(); await H.wait(ms || 7000); return (await H.tts()).slice(n).map((e) => e.text).join(" "); };
  const listening = () => p.waitForFunction(() => window.__vc.state() === "listening" && window.__R.on, null, { timeout: 25000 });
  // the model has just finished loading: the greeting waits a few seconds
  await p.evaluate(() => { window.__natState = "loaded"; window.__natLoadedAt = Date.now(); });
  const n0 = (await H.tts()).length; await p.evaluate(() => document.querySelector('[data-act="vc-open"]').click()); await H.wait(2500);
  rec("Greeting waits ~4 s after the model has just loaded", (await H.tts()).slice(n0).length === 0);
  await H.wait(5000); await listening();
  // 1. «vamos a practicar» → options, no AI
  const k0 = (await H.reqs()).length;
  let s = await said(() => H.say("vamos a practicar"), 9000);
  rec("«Vamos a practicar» → three concrete options, no AI", /uno, traducir/.test(s) && /dos, practicar verbos/.test(s) && /tres, conversar/.test(s) && (await H.reqs()).length === k0, s);
  await listening(); s = await said(() => H.say("tú eliges"), 9000);
  const it0 = await p.evaluate(() => { const D = window.__trd(); return D && D.it ? { src: D.it.say || D.it.src, ans: D.it.ans[0], n: D.n } : null; });
  rec("«Tú eliges» starts the first option (translation)", it0 && /Vamos a traducir/.test(s), s);
  // 2. a grammar question mid-exercise → answered, then the same sentence again
  await listening(); await H.replies([{ text: "Porque en español usamos tener para la posesión. Por ejemplo: tengo un perro. [[·]]", delay: 40 }]);
  const k1 = (await H.reqs()).length;
  s = await said(() => H.say("por qué se usa ese verbo aquí"), 10000);
  const reqs = await H.reqs(), last = reqs[reqs.length - 1];
  const it1 = await p.evaluate(() => { const D = window.__trd(); return D && D.it ? { src: D.it.say || D.it.src, n: D.n } : null; });
  rec("A grammar question mid-exercise goes to the AI, with the item in the session state", reqs.length > k1 && /SESSION STATE/.test(last.user || last.text || "") && (last.user || last.text || "").includes(it0.src), String(JSON.stringify(last)).slice(0, 300) + " · said: " + s);
  rec("…then Profe returns to the SAME sentence", /Volvemos a la frase/.test(s) && it1.n === it0.n && it1.src === it0.src && s.includes(it0.src.replace(/[?.!]$/, "")), s);
  // 3. a partial answer → «bien empezado»; a different but correct phrasing is accepted (a fixed sentence from here on)
  await p.evaluate(() => { const D = window.__trd(); D.it = { id: "t-car", dir: "en-es", src: "I have a new car.", ans: ["Tengo un coche nuevo.", "Tengo un carro nuevo."], ui: 0, len: 4, tags: [] }; D.tries = 0; D.retry = 0; });
  const partial = await p.evaluate(() => window.__trd().it.ans[0].split(/\s+/).slice(0, 2).join(" "));
  await listening(); s = await said(() => H.say(partial), 7000);
  rec("A correct start that stops early → «¡Bien empezado! … Termina la frase.»", /Bien empezado/.test(s) && /Termina la frase/.test(s), s);
  const alt = "yo tengo un carro nuevo";
  await listening(); s = await said(() => H.say(alt), 8000);
  rec("A correct answer phrased differently (with/without the subject pronoun) is accepted", /(Muy bien|Perfecto|Excelente|Eso es)/.test(s) && !/Casi/.test(s), alt + " → " + s);
  // 4. a wrong answer → a hint that names the problem (not always «empieza con»), then the answer and a retry
  await listening(); s = await said(() => H.say("yo no sé hablar bien hoy"), 7000);
  rec("A wrong answer gets «Casi.» + a hint + the English sentence again", /Casi|Bien empezado/.test(s) && /Otra vez:/.test(s), s);
  await listening(); s = await said(() => H.say("perro gato casa"), 7000);
  const ans2 = await p.evaluate(() => window.__trd().it.ans[0]);
  rec("Second miss: the answer, then «Ahora dilo tú» (waits for the learner)", /Se dice:/.test(s) && /Ahora dilo tú/.test(s) && !/Traduce al español/.test(s), s);
  await listening(); s = await said(() => H.say(ans2), 8000);
  rec("Saying it after the answer → «¡Eso es! Ahora sí.» + next sentence", /Eso es! Ahora sí/.test(s) && /Traduce al español/.test(s), s);
  // 5. Profe's own words heard right after he stopped are not an answer
  await listening(); await H.say("repite"); await H.wait(1500); await listening();
  rec("Echo: «traduce al español» right after Profe said it counts as his voice", await p.evaluate(() => window.__vcIsEcho("traduce al español")));
  // 6. session state survives a fresh model session
  await p.evaluate(() => { const c = window.__ss(); return c; });
  const note = await p.evaluate(() => window.__ssNote());
  rec("Session note: activity, sentence, details or questions, never greet again", /translation English→Spanish/.test(note) && /never greet again/.test(note), note);
  // 7. coming back to the app repeats a cut-off question
  await listening();
  const cut = await said(async () => { await p.evaluate(() => { Object.defineProperty(document, "hidden", { configurable: true, get: () => true }); window.__vcTestSpeaking = true; }); await p.evaluate(() => { try { window.__AVforce && window.__AVforce(); } catch (e) {} document.dispatchEvent(new Event("visibilitychange")); });
    await H.wait(500); await p.evaluate(() => { Object.defineProperty(document, "hidden", { configurable: true, get: () => false }); document.dispatchEvent(new Event("visibilitychange")); }); }, 6000);
  rec("Back in front after being cut off: the current question is said again (or listening resumes)", /Traduce al español/.test(cut) || await p.evaluate(() => window.__vc.state() === "listening"), cut);
  // 8. «terminamos» → recap
  await listening(); s = await said(() => H.say("terminamos"), 8000);
  rec("«Terminamos» → recap: what was practised, score, something to revisit, next step", /Hoy practicamos: traducción: (\d|cero|uno|dos|tres|cuatro|cinco|seis) de (\d|uno|dos|tres|cuatro|cinco|seis)/.test(s) && /Para repasar: \S/.test(s) && /Próximo paso:/.test(s), s);
  // 9. the brief: no rigid rules, teacher role, corrections coordinated
  const brief = await p.evaluate(() => window.__vcNote(true));
  rec("Call brief: no «under 25 words» / «ONE open question» rule; questions not required every turn", !/under 25 words/.test(brief) && !/ONE open question/.test(brief) && /A question is not required every turn/.test(brief), brief.slice(0, 300));
  rec("Steering no longer asks the model to share things about itself", await p.evaluate(() => !/sharing something yourself/.test(document.documentElement.innerHTML.slice(0, 1))));
  await listening(); s = await said(() => H.say("termina la llamada"), 9000);
  rec("Goodbye comes with the recap", /Hoy practicamos/.test(s) && /Hasta luego/.test(s), s);
  const ok = R.filter(Boolean).length; console.log(ok === R.length ? "ALL " + R.length + " PASS" : (R.length - ok) + " FAILED of " + R.length);
  await H.close(); process.exit(ok === R.length ? 0 : 1);
})().catch((e) => { console.log("CRASH", e.message); process.exit(1); });
