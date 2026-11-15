// Profe as a teacher (PROFE_EVAL_BRIEF §5–6): reliable checks reach the AI, 5-step correction, next step, repeated mistakes → My mistakes
const { open } = require("/home/claude/ruta-dele/tools/profe-tests/h.js");
const R = []; const rec = (n, ok, i) => { R.push(!!ok); console.log((ok ? "PASS " : "FAIL ") + n + (!ok && i ? "  " + i : "")); };
(async () => {
  const H = await open({ hash: "#curso" }); const p = H.p;
  const C = (t) => p.evaluate((t) => window.__teach.checks(t).map((x) => x.from + "→" + x.to), t);
  const cases = [["Ayer yo voy al supermercado.", "voy→fui"], ["El fin de semana pasado como pizza con mis amigos.", "como→comí"], ["Hoy soy muy cansado.", "soy→estoy"], ["Yo gusta el café.", "yo gusta→me gusta"], ["Yo soy 30 años.", "yo soy 30 años→tengo 30 años"], ["Me llamo es Timar.", "me llamo es→me llamo"]];
  for (const [s, want] of cases) { const got = await C(s); rec("Check «" + s + "» → " + want, got.some((x) => x.toLowerCase() === want.toLowerCase()), JSON.stringify(got)); }
  const ok = await Promise.all(["Ayer fui al supermercado.", "Mañana voy al cine.", "Soy de Panamá y estoy cansado.", "Me gusta el café.", "Tengo 30 años.", "Hace dos días que estoy enfermo."].map((s) => C(s)));
  rec("Correct sentences get no correction (no false alarms on 6 correct sentences)", ok.every((x) => !x.some((y) => /voy→fui|estoy|me gusta|tengo .* años|me llamo/.test(y) && !/estoy→/.test(y))) && ok.flat().filter((y) => /→fui|→estoy|→me gusta|→tengo/.test(y)).length === 0, JSON.stringify(ok));
  // a rule-found mistake: corrected straight away, in the brief's order
  await H.type("El sábado pasado yo voy a la playa con mi familia."); await H.idle(6000);
  let lastP = (await H.msgs()).filter((x) => /^P:/.test(x)).pop() || "";
  rec("Correction in the brief's order: You can say (full sentence) → why → contrast → try again", /You can say: El sábado pasado yo fui a la playa con mi familia\./.test(lastP) && /finished moment in the past/.test(lastP) && /voy = I go \/ I'm going · fui = I went/.test(lastP) && /say the whole sentence again/i.test(lastP), lastP);
  await H.type("El sábado pasado yo fui a la playa con mi familia."); await H.idle(6000);
  lastP = (await H.msgs()).filter((x) => /^P:/.test(x)).pop() || "";
  rec("The retry is checked: applied correctly → acknowledged", /✅/.test(lastP) || /lo lograste|You got it|There you go|Ahora sí|Eso es/i.test(lastP), lastP);
  await H.replies([{ text: "Vale.", delay: 50, wordMs: 10 }]);
  await H.type("Anoche voy al parque con mi perro."); await H.idle(6000);
  const mist = await p.evaluate(() => (window.__pv.store().mist || []).filter((m) => m.key === "profe").map((m) => m.it.q + " ⇒ " + m.it.a[0]));
  rec("The same kind of mistake twice → saved to My mistakes as a sentence to fix", mist.some((x) => /Anoche voy al parque.*⇒ Anoche fui al parque/.test(x)), JSON.stringify(mist));
  await H.type("Anoche fui al parque con mi perro."); await H.idle(6000);
  // no rule mistake: the AI answers, with the correction and next-step rules; a dead-end reply gets a next step
  await H.replies([{ text: "¡Qué bien! Colombia es muy bonita.", delay: 50, wordMs: 10 }]);
  await H.type("Me gustaría viajar a Colombia el próximo año."); await H.idle(6000);
  const sys = await p.evaluate(() => window.__L.sys || "");
  rec("The AI gets the correction rules: no correcting recognition slips, regional usage is fine, never a dead end", /speech-recognition slip/.test(sys) && /Regional usage/.test(sys) && /never end a practice turn with only praise/.test(sys), sys.slice(-500));
  lastP = (await H.msgs()).filter((x) => /^P:/.test(x)).pop() || "";
  rec("A practice reply that ended without a next step gets one", /\?$|Cuéntame|Your turn|What about you|Seguimos/.test(lastP.trim()) && /¿Y tú|Seguimos|Your turn|What about you/.test(lastP), lastP);
  // English questions are not "corrected"; app commands don't get a forced question
  await H.replies([{ text: "It means 'to get up early'.", delay: 50, wordMs: 10 }]);
  await H.type("what does madrugar mean in english"); await H.idle(6000);
  const sys4 = await p.evaluate(() => window.__L.sys || ""); const last4 = (await H.msgs()).filter((x) => /^P:/.test(x)).pop();
  rec("An English question: no correction checks, and no question forced onto the answer", !/Checks the app already made/.test(sys4) && !/Now try|Your turn|What about you/.test(last4), last4);
  rec("No script errors", !H.errs.length, H.errs.join(" | "));
  console.log(R.filter(Boolean).length + "/" + R.length + " passed"); await H.close(); process.exit(R.every(Boolean) ? 0 : 1);
})();
