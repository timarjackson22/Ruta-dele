// E. The evaluation framework's standardized challenge bank (E1–E5, C1–C3, D1, V2), run through the real app in the harness.
// The AI model is replaced by a neutral mock reply, so this measures ONLY the app's own layer (rule-based corrections, routing,
// voice language routing). What the AI would say (Claude or the on-device model) is NOT measured here and is reported as untested.
const { open, wrongVoice } = require("./h.js");
const out = []; const log = (id, input, expected, verdict, observed, why) => { out.push({ id, input, expected, verdict, observed, why }); console.log(verdict.toUpperCase().padEnd(8) + id + "  «" + input + "»  → " + observed.slice(0, 220) + (why ? "  [" + why + "]" : "")); };
(async () => {
  const H = await open({ hash: "#curso" }); const p = H.p;
  await p.evaluate(() => { window.__L.def = { text: "Vale. ¿Y luego? [[·]]", delay: 60, wordMs: 5 }; });
  const turn = async (t) => { await p.click('[data-act="t-new"]').catch(() => {}); await H.wait(200); await H.type(t); await H.idle(6000); await H.wait(500);
    const m = await H.msgs(); return m.slice(1).filter((x) => /^P: /.test(x)).map((x) => x.slice(3)).join(" ⏐ ") || "(no reply)"; };
  const fixed = (o, want) => o.toLowerCase().includes(want.toLowerCase());
  const flagged = (o) => /\*\*|→|✏️|instead|should be|we say|use «|not quite|casi|correct(ed)? (form|version)/i.test(o);
  const BANK = [
    ["E1", "Yo tiene treinta años.", "Tengo treinta años + first-person explanation + retry invitation", (o) => fixed(o, "tengo") ? (/retry|try again|inténtalo|repite|say it again|otra vez/i.test(o) ? "pass" : "partial") : "fail", "correction present; retry invitation checked separately"],
    ["E2", "La problema es difícil.", "El problema + problema is masculine despite -a", (o) => fixed(o, "el problema") ? (/masculine|masculino/i.test(o) ? "pass" : "partial") : "fail", ""],
    ["E3", "Ayer voy al supermercado.", "Ayer fui al supermercado (completed past action)", (o) => fixed(o, "fui") ? "pass" : "fail", ""],
    ["E4", "Si tendría dinero, viajaría.", "Si tuviera/tuviese dinero, viajaría", (o) => /tuviera|tuviese/i.test(o) ? "pass" : "fail", ""],
    ["E5", "Estoy embarazado.", "flags the false friend (embarrassed ≠ pregnant): avergonzado / me da vergüenza", (o) => /avergonzad|vergüenza|pregnant|false friend/i.test(o) ? "pass" : "fail", "meaning-level; needs the stated intent ('I am embarrassed')"],
    ["C1", "Ayer estaba cansado.", "accepted (imperfect for a past state)", (o) => flagged(o) ? "fail" : "pass", ""],
    ["C2", "Vos tenés razón.", "accepted (valid voseo)", (o) => flagged(o) ? "fail" : "pass", ""],
    ["C3a", "Estoy aburrido.", "accepted (bored)", (o) => flagged(o) ? "fail" : "pass", ""],
    ["C3b", "Soy aburrido.", "accepted (boring); not 'corrected' to estoy", (o) => flagged(o) && /estoy aburrido/i.test(o) ? "fail" : flagged(o) ? "partial" : "pass", ""],
  ];
  const MOCK = /^P?\s*Vale\. ¿Y luego\?$/; // the mocked AI's neutral reply: nothing from the app's own layer
  for (const [id, input, exp, judge, note] of BANK) { const o = await turn(input); let v = judge(o); if (v === "fail" && MOCK.test(o.trim()) && /^E/.test(id)) v = "untested"; log(id, input, exp, v, o, v === "untested" ? "the app's own layer stayed silent; the AI's answer is not measured here" : note); }
  // held-out variants of E4/E5 and their controls (written with the rules, to check they generalise and don't over-correct)
  const EXTRA = [["E4-v1", "Si podría, iría contigo.", "pudiera", true], ["E4-v2", "Si sería rico, compraría una casa.", "fuera", true], ["E4-v3", "Si tendríamos tiempo, saldríamos.", "tuviéramos", true],
    ["C4-v1", "Me preguntó si podría venir mañana.", null, false], ["C4-v2", "No sé si podría hacerlo.", null, false], ["C4-v3", "Si tengo tiempo, voy al cine.", null, false], ["E5-v1", "Mi hermano está embarazado de la noticia.", "avergonzado", true], ["C5-v1", "Mi hermana está embarazada.", null, false]];
  for (const [id, input, want, bad] of EXTRA) { const o = await turn(input); const v = bad ? (fixed(o, want) ? "pass" : "fail") : (flagged(o) ? "fail" : "pass"); log(id, input, bad ? "corrected to «" + want + "»" : "accepted (no correction)", v, o, "held-out variant"); }
  // E5 again with the intent stated, as the framework specifies (translate "I am embarrassed")
  { const o = await turn("How do I say \"I am embarrassed\"? Estoy embarazado?"); const v5 = /avergonzad|vergüenza/i.test(o) ? "pass" : /pregnant/i.test(o) ? "partial" : MOCK.test(o.trim()) ? "untested" : "fail"; log("E5b", "How do I say \"I am embarrassed\"? Estoy embarazado?", "avergonzado / me da vergüenza; explains pregnant", v5, o, v5 === "untested" ? "an English question goes to the AI (not measured here)" : "with the intent stated"); }
  // D1 goal recovery: what the app does locally (an English explanation is requested inside a practice request)
  { await p.click('[data-act="t-new"]').catch(() => {}); await H.wait(200); await p.evaluate(() => { window.__L.reqs.length = 0; });
    await H.type("Quiero practicar pedir comida. No entiendo, explícamelo en inglés."); await H.idle(7000); await H.wait(500);
    const r = await p.evaluate(() => ({ pr: window.__pv.pr(), last: window.__pvLast, reqs: window.__L.reqs.map((x) => x.user).slice(-2) })); const m = (await H.msgs()).slice(-2).join(" ⏐ ");
    log("D1", "Quiero practicar pedir comida. No entiendo, explícamelo en inglés.", "brief English explanation, then resume the restaurant practice in Spanish", r.pr ? "partial" : r.reqs.length ? "untested" : "fail", "role-play: " + (r.pr || "none") + " · sent to AI: " + JSON.stringify(r.reqs) + " · shown: " + m, "the explanation itself comes from the AI (mocked here)"); }
  // V2 voice routing for a mixed English/Spanish explanation (a canned reply standing in for the AI's answer)
  { await p.evaluate(() => { window.__T.log = []; });
    const reply = "In «Le di el libro antes de que saliera», «saliera» is the imperfect subjunctive, because «antes de que» always takes the subjunctive. Who left isn't fixed by the sentence: it could be I, he, she or you (usted). «Le di el libro antes de que saliera.»";
    await p.evaluate((t) => window.__pv.say(t), reply); await H.wait(9000);
    const tts = await H.tts(); const wrong = wrongVoice(tts); const spans = tts.filter((e) => e.t0).length;
    log("V2", "Explain in English: 'Le di el libro antes de que saliera.' Then repeat the Spanish.", "English read by the English voice, Spanish by the Spanish voice, no overlap", wrong.length ? "fail" : spans >= 3 ? "pass" : "partial", spans + " spans: " + tts.filter((e) => e.t0).map((e) => "[" + e.vl + "] " + e.text).join(" | "), "routing only; the explanation's content is the AI's"); }
  require("fs").writeFileSync(process.env.OUT || "/tmp/sE.json", JSON.stringify(out, null, 1));
  const c = (v) => out.filter((x) => x.verdict === v).length; console.log("pass " + c("pass") + " · partial " + c("partial") + " · fail " + c("fail") + " · untested " + c("untested") + " of " + out.length);
  await H.close();
})();
