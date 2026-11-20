  /* ===== Profe as a teacher (tools/PROFE_EVAL_BRIEF.md §5–6): reliable checks before the AI answers, the 5-step correction, always a next step,
     repeated mistakes tracked and sent to My mistakes ===== */
  const TCH = { note: "", last: null, errs: {} };
  try { TCH.errs = JSON.parse(localStorage.getItem("ruta-teach-errs") || "{}"); } catch (e) {}
  const TC_PAST = /\b(ayer|anoche|anteayer|antier|la semana pasada|el mes pasado|el ano pasado|el año pasado|el (lunes|martes|miercoles|miércoles|jueves|viernes|sabado|sábado|domingo|fin de semana|verano|invierno) pasado|hace (dos|tres|cuatro|cinco|unos|unas|muchos|varios|\d+) (dias|días|semanas|meses|anos|años))\b/i;
  // present → preterite for the verbs beginners use most (only these: no guessing)
  const TC_PRET = { voy: ["fui", "ir", "I go / I'm going", "I went"], vas: ["fuiste", "ir", "you go", "you went"], va: ["fue", "ir", "he/she goes", "he/she went"], vamos: ["fuimos", "ir", "we go", "we went"], van: ["fueron", "ir", "they go", "they went"],
    como: ["comí", "comer", "I eat", "I ate"], comemos: ["comimos", "comer", "we eat", "we ate"], tengo: ["tuve", "tener", "I have", "I had"], hago: ["hice", "hacer", "I do / make", "I did / made"], estoy: ["estuve", "estar", "I am", "I was"],
    veo: ["vi", "ver", "I see", "I saw"], compro: ["compré", "comprar", "I buy", "I bought"], trabajo: ["trabajé", "trabajar", "I work", "I worked"], juego: ["jugué", "jugar", "I play", "I played"], hablo: ["hablé", "hablar", "I speak", "I spoke"],
    visito: ["visité", "visitar", "I visit", "I visited"], salgo: ["salí", "salir", "I go out", "I went out"], llego: ["llegué", "llegar", "I arrive", "I arrived"], bebo: ["bebí", "beber", "I drink", "I drank"], escribo: ["escribí", "escribir", "I write", "I wrote"],
    leo: ["leí", "leer", "I read", "I read (past)"], duermo: ["dormí", "dormir", "I sleep", "I slept"], estudio: ["estudié", "estudiar", "I study", "I studied"], ceno: ["cené", "cenar", "I have dinner", "I had dinner"], desayuno: ["desayuné", "desayunar", "I have breakfast", "I had breakfast"],
    almuerzo: ["almorcé", "almorzar", "I have lunch", "I had lunch"], camino: ["caminé", "caminar", "I walk", "I walked"], viajo: ["viajé", "viajar", "I travel", "I travelled"], miro: ["miré", "mirar", "I watch", "I watched"], escucho: ["escuché", "escuchar", "I listen", "I listened"],
    llamo: ["llamé", "llamar", "I call", "I called"], cocino: ["cociné", "cocinar", "I cook", "I cooked"], nado: ["nadé", "nadar", "I swim", "I swam"], bailo: ["bailé", "bailar", "I dance", "I danced"], vuelvo: ["volví", "volver", "I come back", "I came back"] };
  const TC_ESTAR = /\b(soy|eres|es|somos|son)\s+(muy\s+|un poco\s+|bastante\s+)?(cansad[oa]s?|enferm[oa]s?|ocupad[oa]s?|content[oa]s?|enojad[oa]s?|preocupad[oa]s?|aqu[ií]|all[ií]|en casa|en la oficina|en el trabajo)\b/i;
  const TC_ESTAR_MAP = { soy: "estoy", eres: "estás", es: "está", somos: "estamos", son: "están" };
  // the learner's last message: what the app is sure about (the AI is asked to use these, never to invent others)
  function teachChecks(text) {
    const t = String(text || ""), low = t.toLowerCase(), out = [];
    const pm = low.match(TC_PAST);
    if (pm) { const after = low.slice(low.indexOf(pm[0]) + pm[0].length), before = low.slice(0, low.indexOf(pm[0]));
      const scan = (after.match(/[a-záéíóúñ]+/g) || []).slice(0, 4).concat((before.match(/[a-záéíóúñ]+/g) || []).slice(-3));
      const v = scan.find((w) => TC_PRET[w]); if (v) { const [p, inf, en, enp] = TC_PRET[v]; out.push({ rule: "pret-" + inf, from: v, to: p, cmp: v + " = " + en + " · " + p + " = " + enp, why: "«" + pm[0] + "» is a finished moment in the past, so use the past form «" + p + "» (from " + inf + "), not «" + v + "», which means " + en + " now." }); } }
    const em = t.match(TC_ESTAR); if (em) { const f = em[1].toLowerCase(); out.push({ rule: "ser-estar", from: em[1], to: TC_ESTAR_MAP[f] || "estar", why: "How you feel right now or where you are uses estar, not ser: «" + (TC_ESTAR_MAP[f] || "estar") + " " + em[3] + "»." }); }
    if (/\byo\s+(gusta|gustan)\b/i.test(t)) out.push({ rule: "gustar", from: (t.match(/\byo\s+gustan?\b/i) || [""])[0], to: "me gusta" + (/gustan/i.test(t) ? "n" : ""), why: "Gustar works backwards: the thing pleases you, so say «me gusta» (literally 'it pleases me'), not «yo gusta»." });
    { const m = t.match(/\b(yo\s+)?soy\s+(\d+|veinte|treinta|cuarenta|cincuenta|sesenta|diez|quince|dieciocho|diecinueve)(\s+años)?\b/i); if (m && (m[3] || /\d/.test(m[2]))) out.push({ rule: "tener-edad", from: m[0].trim(), to: "tengo " + m[2] + " años", why: "Age uses tener in Spanish: «tengo " + m[2] + " años» (literally 'I have … years')." }); }
    if (/\bme llamo es\b/i.test(t)) out.push({ rule: "me-llamo", from: "me llamo es", to: "me llamo", why: "«Me llamo» already means 'my name is'; drop «es»." });
    try { if (typeof quickFixes === "function") quickFixes(t).forEach((f) => { if (!out.some((o) => o.from.toLowerCase().includes(f.from.toLowerCase()))) out.push({ rule: "fx-" + f.to.toLowerCase(), from: f.from, to: f.to, why: f.why || "" }); }); } catch (e) {}
    return out.slice(0, 3);
  }
  function teachApply(text, items) { let s = String(text); items.forEach((f) => { s = s.replace(new RegExp("\\b" + f.from.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\b", "i"), (w) => (/^[A-ZÁÉÍÓÚÑ]/.test(w) ? f.to[0].toUpperCase() + f.to.slice(1) : f.to)); }); return s; }
  const teachIsPractice = (text) => { try { return isSpanish(String(text) + " ") && !/\b(the|what|how|why|is|are|you|explain|mean|means)\b/i.test(text); } catch (e) { return false; } };
  // before the AI answers: the reliable checks, whether the last correction was applied, how to correct
  function teachPrep(text) {
    TCH.note = ""; TCH.cur = null; if (TS.noFix) return;
    const items = teachIsPractice(text) ? teachChecks(text) : [], bits = [];
    if (TCH.last && Date.now() - TCH.last.t < 15 * 60000 && teachIsPractice(text)) {
      if (items.some((x) => x.rule === TCH.last.rule)) bits.push("The learner made the SAME mistake you corrected a moment ago (" + TCH.last.from + " → " + TCH.last.to + "): point it out gently, model it once more, and ask for one more try.");
      else if (new RegExp("\\b" + TCH.last.to.split(" ")[0] + "\\b", "i").test(text)) bits.push("The learner used the correction you gave («" + TCH.last.to + "») correctly: say so in three or four words, then continue.");
    }
    if (items.length) {
      const better = teachApply(text, items); TCH.cur = { items, better, text };
      bits.push("Checks the app already made on the learner's last message (reliable; use them, do not invent other corrections): " + items.map((x, i) => (i + 1) + ") «" + x.from + "» → «" + x.to + "»: " + x.why).join(" ") + " Corrected sentence: «" + better + "».");
      bits.push("Answer in this order: 1. «You can say: " + better + "» 2. the reason in one plain-English sentence 3. if useful, a tiny contrast 4. invite them to try again or ask one short related question (for example about their own life).");
    }
    TCH.note = bits.length ? "\n\n" + bits.join("\n") : "";
  }
  // after the AI answers: the correction is remembered (applied next time? repeated?), and a practice turn never dead-ends
  function teachTrack(cur) {
    if (!cur || !cur.items || !cur.items.length) return;
    {
      const f = cur.items[0]; TCH.last = { rule: f.rule, from: f.from, to: f.to, t: Date.now() };
      cur.items.forEach((x) => { TCH.errs[x.rule] = (TCH.errs[x.rule] || 0) + 1; }); try { window.lsSet("ruta-teach-errs", JSON.stringify(TCH.errs)); } catch (e) {}
      // a mistake made twice goes to My mistakes, as a sentence to fix
      try { const id = "profe-" + f.rule + "-" + cur.text.toLowerCase().replace(/[^a-záéíóúñ]+/g, "-").slice(0, 40);
        if (TCH.errs[f.rule] >= 2 && !(S.mist || []).some((m) => m.id === id)) { S.mist = S.mist || []; S.mist.push({ id, key: "profe", n: TCH.errs[f.rule], ts: Date.now(), it: { t: "fix", q: cur.text, a: [cur.better], why: f.why } }); save(); } } catch (e) {}
    }
  }
  function teachAfter(live, um) {
    if (!live || !live.c || live.err || live.superseded) return;
    const cur = TCH.cur; teachTrack(cur);
    if (!um || !teachIsPractice(um.c)) return;
    if (typeof PR !== "undefined" && PR) return; // role-plays have their own next step
    const txt = String(live.c);
    if (/[?¿]/.test(txt) || /\b(try|say|tell me|now you|your turn|repeat|intenta|prueba|dime|cuéntame|cuentame|ahora tú|ahora tu|repite|te toca)\b/i.test(txt)) return;
    const lvl = (typeof learnerLevel === "function" ? learnerLevel(pageCtx()) : "a2").toUpperCase(), en = /A1|A2/.test(lvl) && !window.__vcOn; // v251: a call is Spanish first
    live.c = txt.replace(/\s+$/, "") + "\n\n" + (cur ? (en ? "Now try saying it again." : "Ahora dilo tú otra vez.") : pvPick(en ? ["What about you? Tell me one more thing in Spanish.", "Your turn: can you answer in a full sentence?"] : ["¿Y tú? Cuéntame un poco más.", "¿Seguimos con otra pregunta o prefieres cambiar de tema?"]));
  }
  const TEACH_RULES = "\n\nHow to correct (always): only real mistakes, at most the one or two that matter most. 1) «You can say: …» with the corrected Spanish. 2) Why, in one plain-English sentence (no jargon; if you must name a tense, say what it means). 3) When useful, a tiny contrast (voy = I go; fui = I went). 4) Invite a retry or ask one short related question. Never correct a likely speech-recognition slip, accents or capital letters; if you are not sure what the learner said, ask instead of correcting. Regional usage (vos, ustedes, carro/coche, Panama words) is not a mistake.\n" +
    "Keep the practice moving: never end a practice turn with only praise or a comment. Finish with one question, a short task, or a choice (keep going, review, change activity, finish). If the learner hesitates or says they don't know, give a hint: the first words of an answer, or two options to choose from. In voice conversations, keep each turn to two or three short sentences.";
  const teachNote = () => TEACH_RULES + TCH.note;
  // the rule-based coach's correction, in the brief's order: You can say → why → contrast → try again
  function teachCoachText(text, fx, better) {
    const cmp = fx.map((f) => f.cmp).filter(Boolean)[0];
    return tline("retry") + "\nYou can say: **" + better + "**\n" + fx.map((f) => f.why).filter(Boolean).join(" ") + (cmp ? "\n*" + cmp + "*" : "") + "\n\n👉 **¡Inténtalo otra vez!** Di la frase completa.\n*Now say the whole sentence again.*";
  }
  window.__teach = { checks: teachChecks, prep: teachPrep, after: teachAfter, state: () => TCH };
