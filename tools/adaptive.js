  /* ==ADAPTIVE== Adaptive practice in Profe's Practice tab (round 5): sentence translation (English ⇄ Spanish) and conjugation.
     Level content: each level's lessons (LXS: translation exercises with accepted answers and a rule note, examples with English)
     and its reading/listening texts; a generator writes more sentences for any tense, mood or register taught at that level.
     Adaptive: every item is tagged with skills (tense, mood, register, lesson topic, ser/estar…); a mistake makes that skill the
     focus and similar items follow until it is answered right first time three times in a row; then Profe asks whether to try
     something new. Every answer gets feedback: what is wrong and where, a clue after the second try, the answer after the third.
     Source of truth: tools/adaptive.js (put into index.html by tools/patch_adaptive.py). */
  const AD_LVS = ["a1", "a2", "b1", "b2", "c1", "c2"];
  const AD_TRIES = 3; // first answer + two more tries, then the answer is shown
  const AD_MASTER = 3; // right first time, this many in a row, = mastered
  function adSt(kind, lv) { S.adapt = S.adapt || {}; const k = kind + "-" + lv; const st = (S.adapt[k] = S.adapt[k] || { sk: {}, focus: null, mastered: {}, diff: 0.3, n: 0, first: 0 }); st.sk = st.sk || {}; st.mastered = st.mastered || {}; return st; }
  const adSave = () => { try { save(); } catch (e) {} };
  const adAcc = (s) => String(s).normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const adToks = (s) => String(s || "").toLowerCase().replace(/[¿?¡!.,;:«»"“”()…—–]/g, " ").replace(/\s-\s|^-|-$/g, " ").replace(/\s+/g, " ").trim().split(" ").filter(Boolean);
  const AD_TN = { pres: "present", pret: "preterite (pretérito indefinido)", impf: "imperfect", fut: "future", cond: "conditional", perf: "present perfect (he hablado)", plusc: "pluperfect (había hablado)", subj: "present subjunctive", subjRa: "imperfect subjunctive", subjFut: "future subjunctive", imp: "imperative" };
  const AD_TN_ES = { pres: "presente", pret: "pretérito indefinido", impf: "pretérito imperfecto", fut: "futuro", cond: "condicional", perf: "pretérito perfecto", plusc: "pluscuamperfecto", subj: "presente de subjuntivo", subjRa: "imperfecto de subjuntivo", subjFut: "futuro de subjuntivo", imp: "imperativo" };
  const AD_G = { serestar: "ser or estar", porpara: "por or para", pron: "object pronouns (lo, la, le, se…)", si: "«si» clauses (si tuviera…, …-ría)", formal: "formal register (usted)", agree: "agreement (gender and number)", article: "articles", prep: "prepositions" };
  function adLabel(k) {
    if (!k) return ""; const [a, b, c] = k.split(":");
    if (a === "v") return AD_TN[b] || b; if (a === "g" || a === "r") return AD_G[b] || b; if (a === "d") return b === "en-es" ? "English → Spanish" : "Spanish → English";
    if (a === "t") { const m = /^(a1|a2|b1|b2|c1|c2)-(\d+)$/.exec(b); const u = m && LXS[m[1]] && LXS[m[1]][+m[2]]; return u ? "lesson: " + u.t : b; }
    if (a === "c") return (AD_TN[b] || b) + (c ? " · " + (AD_GRP[c] || c) : "");
    return k;
  }
  // every reading of a word as a verb form, from the dictionary's lemma and the conjugator (all tenses, the participle, the imperative)
  const adRdCache = {};
  function adReadings(w) {
    w = String(w || "").toLowerCase(); if (adRdCache[w]) return adRdCache[w];
    const lem = new Set(); try { const tg = TG[w]; if (tg && tg[1] === "verb") String(tg[0] || "").split(/\s*[\/,]\s*/).forEach((l) => l && lem.add(l)); } catch (e) {}
    try { verbReadings(w).forEach((r) => lem.add(r.v)); } catch (e) {}
    if (/(ar|er|ir|ír)$/.test(w)) lem.add(w);
    const out = [];
    lem.forEach((v) => { if (!/(ar|er|ir|ír)$/.test(v)) return; let R; try { R = adConj(v); } catch (e) { return; }
      ["pres", "pret", "impf", "fut", "cond", "subj", "subjRa", "subjSe", "subjFut"].forEach((t) => (R[t] || []).forEach((f, pi) => { if (f && f.toLowerCase() === w) out.push({ v, t: t === "subjSe" ? "subjRa" : t, pi }); }));
      if (R.part && R.part.toLowerCase() === w) out.push({ v, t: "part", pi: -1 });
      if (R.ger && R.ger.toLowerCase() === w) out.push({ v, t: "ger", pi: -1 });
      if (R.inf === w) out.push({ v, t: "inf", pi: -1 });
      if (R.imp) Object.keys(R.imp).forEach((p) => { if (String(R.imp[p]).toLowerCase() === w) out.push({ v, t: "imp", pi: p }); });
    });
    return (adRdCache[w] = out);
  }
  function adFormOf(v, w) { let R; try { R = adConj(v); } catch (e) { return null; } w = String(w).toLowerCase();
    for (const t of ["pres", "pret", "impf", "fut", "cond", "subj", "subjRa", "subjFut"]) { const k = (R[t] || []).findIndex((f) => f && f.toLowerCase() === w); if (k >= 0) return { v, t, pi: k }; }
    if (R.part === w) return { v, t: "part", pi: -1 }; if (R.ger === w) return { v, t: "ger", pi: -1 }; if (R.inf === w) return { v, t: "inf", pi: -1 }; return null; }
  const adConjCache = {};
  function adConj(v) { if (adConjCache[v]) return adConjCache[v]; const r = VI ? VI.find((x) => x[0] === v) : null; return (adConjCache[v] = CONJ.conjugate(v, r ? r[2] : "")); }
  // skills a Spanish sentence practises
  const AD_PERF = /\b(he|has|ha|hemos|habéis|han)\s+(no\s+)?\S+(ado|ido|to|cho|so)\b/i, AD_PLUS = /\b(había|habías|habíamos|habíais|habían)\s+\S+(ado|ido|to|cho|so)\b/i;
  function adTags(es) {
    const tags = new Set(), toks = adToks(es);
    if (AD_PLUS.test(es)) tags.add("v:plusc"); else if (AD_PERF.test(es)) tags.add("v:perf");
    toks.forEach((w, i) => {
      if (/^(el|la|los|las|un|una|de|que|a|en|y|o|se|me|te|lo|le|no|si|ya|muy|más|mi|tu|su)$/.test(adAcc(w))) return;
      const rd = adReadings(w); if (!rd.length) return;
      const ts = new Set(rd.map((r) => r.t).filter((t) => !/^(part|ger|inf)$/.test(t)));
      if (ts.size === 1 || !ts.has("pres")) ts.forEach((t) => tags.add("v:" + t)); else if (ts.size) tags.add("v:pres");
      if (rd.some((r) => r.v === "ser" || r.v === "estar")) tags.add("g:serestar");
    });
    if (tags.has("v:perf") || tags.has("v:plusc")) { tags.delete("v:part"); }
    if (toks.some((w) => w === "por" || w === "para")) tags.add("g:porpara");
    if (toks.some((w) => /^(usted|ustedes)$/.test(w))) tags.add("r:formal");
    if (/(^|[,;]\s*|\s)si\s/i.test(" " + es) && (tags.has("v:subjRa") || tags.has("v:cond"))) tags.add("g:si");
    if (toks.some((w, i) => /^(me|te|le|les|nos|os|lo)$/.test(w) && toks[i + 1] && adReadings(toks[i + 1]).length) || /\w(ndo|r)(lo|la|le|los|las|les|me|te|se|nos)\b/.test(es)) tags.add("g:pron");
    return [...tags];
  }

  /* ---------- the bank: what each level teaches ---------- */
  const AD_BANK = {};
  function adBank(lv) {
    if (AD_BANK[lv]) return AD_BANK[lv];
    const out = [], L = (typeof LXS !== "undefined" && LXS[lv]) || [];
    L.forEach((u, ui) => {
      const topic = "t:" + lv + "-" + ui;
      (u.tr || []).forEach((x, k) => { if (!x || !x[0] || !x[1]) return; out.push({ id: lv + "-tr-" + ui + "-" + k, dir: "en-es", src: x[0], ans: String(x[1]).split("|"), note: x[2] || "", topic, ui }); });
      (u.e || []).forEach((x, k) => { if (!x || !x[0] || !x[1]) return; out.push({ id: lv + "-e-" + ui + "-" + k, dir: "es-en", src: x[0], ans: [x[1]], topic, ui });
        if (k % 2 === 0) out.push({ id: lv + "-er-" + ui + "-" + k, dir: "en-es", src: x[1], ans: [x[0]], topic, ui, single: 1 }); });
    });
    const n = L.length || 1;
    try { LISTEN.filter((x) => x.lvl === lv).forEach((x) => x.paras.forEach((p, pi) => (p.s || []).forEach((s2, si) => {
      const es = s2[0], en = s2[1], w = String(es || "").split(/\s+/).length; if (!es || !en || w < 4 || w > 16 || /[«»"“]/.test(es) || (pi + si) % 3) return;
      out.push({ id: lv + "-x-" + x.id + "-" + pi + "-" + si, dir: "es-en", src: es, ans: [en], topic: null, ui: Math.floor(n / 2), from: x.t }); }))); } catch (e) {}
    out.forEach((it) => { const es = it.dir === "en-es" ? it.ans[0] : it.src; it.tags = adTags(es); if (it.topic) it.tags.push(it.topic); it.tags.push("d:" + it.dir); it.len = adToks(es).length; });
    return (AD_BANK[lv] = out);
  }

  /* ---------- the generator: new sentences for a tense, mood or register ---------- */
  const AD_BE = ["be", "is", "was", "been"];
  const AD_VERBS = [ // infinitive, English [base, 3rd person, past, participle], complements [Spanish, English], first level (0 = A1)
    ["hablar", ["speak", "speaks", "spoke", "spoken"], [["español con mis vecinos", "Spanish with my neighbours"], ["por teléfono con mi madre", "on the phone with my mother"]], 0],
    ["comer", ["eat", "eats", "ate", "eaten"], [["en casa", "at home"], ["mucha fruta", "a lot of fruit"]], 0],
    ["vivir", ["live", "lives", "lived", "lived"], [["en el centro", "in the centre"], ["cerca del mar", "near the sea"]], 0],
    ["trabajar", ["work", "works", "worked", "worked"], [["en una oficina", "in an office"], ["desde casa", "from home"]], 0],
    ["estudiar", ["study", "studies", "studied", "studied"], [["para el examen", "for the exam"], ["en la biblioteca", "in the library"]], 0],
    ["beber", ["drink", "drinks", "drank", "drunk"], [["agua", "water"], ["café con leche", "coffee with milk"]], 0],
    ["escribir", ["write", "writes", "wrote", "written"], [["un correo a mi jefe", "an email to my boss"], ["una carta", "a letter"]], 0],
    ["leer", ["read", "reads", "read", "read"], [["el periódico", "the newspaper"], ["una novela", "a novel"]], 0],
    ["comprar", ["buy", "buys", "bought", "bought"], [["pan en la panadería", "bread at the bakery"], ["un regalo", "a present"]], 0],
    ["tener", ["have", "has", "had", "had"], [["mucho trabajo", "a lot of work"], ["un perro", "a dog"]], 0],
    ["ir", ["go", "goes", "went", "gone"], [["al mercado", "to the market"], ["a la playa", "to the beach"]], 0],
    ["hacer", ["do", "does", "did", "done"], [["los deberes", "the homework"], ["ejercicio", "exercise"]], 0],
    ["ver", ["watch", "watches", "watched", "watched"], [["una película", "a film"], ["las noticias", "the news"]], 0],
    ["jugar", ["play", "plays", "played", "played"], [["al fútbol", "football"], ["al ajedrez", "chess"]], 0],
    ["cocinar", ["cook", "cooks", "cooked", "cooked"], [["la cena", "dinner"], ["arroz con pollo", "chicken and rice"]], 0],
    ["viajar", ["travel", "travels", "travelled", "travelled"], [["a México", "to Mexico"], ["en tren", "by train"]], 0],
    ["estar", AD_BE, [["en casa", "at home"], ["muy cansad{o}", "very tired"]], 0],
    ["salir", ["go out", "goes out", "went out", "gone out"], [["con mis amigos", "with my friends"]], 1],
    ["volver", ["come back", "comes back", "came back", "come back"], [["a casa tarde", "home late"]], 1],
    ["dormir", ["sleep", "sleeps", "slept", "slept"], [["ocho horas", "eight hours"], ["muy bien", "very well"]], 1],
    ["pedir", ["order", "orders", "ordered", "ordered"], [["un café", "a coffee"], ["la cuenta", "the bill"]], 1],
    ["decir", ["tell", "tells", "told", "told"], [["la verdad", "the truth"]], 1],
    ["traer", ["bring", "brings", "brought", "brought"], [["el postre", "dessert"], ["vino", "wine"]], 1],
    ["poner", ["set", "sets", "set", "set"], [["la mesa", "the table"]], 1],
    ["conocer", ["meet", "meets", "met", "met"], [["a gente nueva", "new people"]], 2],
    ["empezar", ["start", "starts", "started", "started"], [["un curso de cocina", "a cooking course"]], 2],
    ["elegir", ["choose", "chooses", "chose", "chosen"], [["el restaurante", "the restaurant"]], 3],
  ];
  // es, person index, English subject, English object, gender/number for agreement, label shown in English prompts
  function adPersons() { const P = [["yo", 0, "I", "me", "?"], ["tú", 1, "you", "you", "?", "tú"], ["él", 2, "he", "him", "o"], ["ella", 2, "she", "her", "a"], ["nosotros", 3, "we", "us", "os"], ["ellos", 5, "they", "them", "os"], ["usted", 2, "you", "you", "?", "usted, formal"], ["ustedes", 5, "you", "you", "os", "ustedes, plural"]];
    if (S.region === "es") P.push(["vosotros", 4, "you", "you", "os", "vosotros, plural"]); return P; }
  const AD_GT = { a1: ["pres"], a2: ["pres", "pret", "impf", "fut", "perf", "imp"], b1: ["pres", "pret", "impf", "fut", "perf", "cond", "subj", "imp"], b2: ["pret", "impf", "fut", "perf", "cond", "subj", "subjRa", "si", "imp"], c1: ["pret", "impf", "perf", "cond", "subj", "subjRa", "si", "plusc", "imp"], c2: ["pret", "impf", "perf", "cond", "subj", "subjRa", "si", "plusc", "imp"] };
  const AD_CUE = { pres: [["Todos los días", "every day"], ["Los fines de semana", "at weekends"]], pret: [["Ayer", "yesterday"], ["El sábado pasado", "last Saturday"]], impf: [["Todos los veranos", "every summer"], ["Antes", "before"]], fut: [["Mañana", "tomorrow"], ["El año que viene", "next year"]], cond: [["Con más tiempo", "With more time,", "start"]], perf: [["Hoy", "today"], ["Esta semana", "this week"]], plusc: [["Cuando llegué", "when I arrived"]] };
  const adCap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
  const adPick1 = (a) => a[Math.floor(Math.random() * a.length)];
  function adEnVP(V, t, P, neg) { // English verb phrase
    const [b, s3, past, pp] = V[1], be = V[1] === AD_BE, he = /^(he|she)$/.test(P[2]), I = P[2] === "I", base = b;
    const bePres = I ? "am" : he ? "is" : "are", bePast = I || he ? "was" : "were";
    if (t === "pres") return be ? bePres + (neg ? " not" : "") : neg ? (he ? "does not " : "do not ") + base : he ? s3 : base;
    if (t === "pret") return be ? bePast + (neg ? " not" : "") : neg ? "did not " + base : past;
    if (t === "impf") return neg ? "did not use to " + base : "used to " + base;
    if (t === "fut") return (neg ? "will not " : "will ") + base;
    if (t === "cond") return (neg ? "would not " : "would ") + base;
    if (t === "perf") return (he ? "has " : "have ") + (neg ? "not " : "") + (be ? "been" : pp);
    if (t === "plusc") return "had " + (neg ? "not " : "") + (be ? "been" : pp);
    return base;
  }
  function adEsVP(V, t, P, neg) { const R = adConj(V[0]), pi = P[1]; let f;
    if (t === "perf") f = adConj("haber").pres[pi] + " " + R.part; else if (t === "plusc") f = adConj("haber").impf[pi] + " " + R.part; else f = R[t][pi];
    return (neg ? "no " : "") + f; }
  const adAgree = (s, P) => s.replace(/\{o\}/g, P[4] === "a" ? "a" : P[4] === "os" ? "os" : "o");
  const adAgreeAlt = (s, P) => P[4] === "?" && /\{o\}/.test(s) ? [s.replace(/\{o\}/g, "o"), s.replace(/\{o\}/g, "a")] : [adAgree(s, P)];
  function adGen(lv, want) {
    // want: a tense/frame key (pres, pret, …, si, imp) or null = any for the level
    const li = AD_LVS.indexOf(lv), st = adSt("tr", lv), ts = AD_GT[lv] || AD_GT.a2, t = want && ts.concat(["pres"]).includes(want) ? want : adPick1(ts);
    const verbs = AD_VERBS.filter((v) => v[3] <= Math.max(0, li) && !(t === "imp" && /^(tener|estar|conocer)$/.test(v[0]))), V = adPick1(verbs), C = adPick1(V[2]);
    let P = adPick1(adPersons()); const neg = li >= 1 && Math.random() < 0.15 + st.diff * 0.25;
    const dir = Math.random() < 0.5 ? "en-es" : "es-en", tags = ["gen", "d:" + dir];
    const subjEs = (P2, force) => (force || /^(él|ella|usted|ustedes)$/.test(P2[0]) || Math.random() < 0.35 ? P2[0] + " " : "");
    let es = [], en = [], label = P[5] ? " (" + P[5] + ")" : "";
    if (t === "imp") {
      if (!/^(tú|usted|ustedes)$/.test(P[0])) { const nm = Math.random() < 0.5 ? "usted" : "tú"; P = adPersons().find((x) => x[0] === nm); }
      const R = adConj(V[0]), key = P[0] === "tú" ? "tu" : P[0] === "usted" ? "ud" : "uds";
      const f = neg ? R.impNeg[key] : R.imp[key], c = adAgreeAlt(C[0], P);
      es = c.map((cc) => adCap((neg ? "" : "Por favor, ") + f + " " + cc + (neg ? ", por favor" : "")) + ".");
      en = [(neg ? "Please do not " : "Please ") + V[1][0] + " " + C[1] + "."]; label = " (" + P[5] + ")"; tags.push("v:imp"); if (P[0] !== "tú") tags.push("r:formal");
    } else if (t === "subj") {
      const me = P[0] === "yo", R = adConj(V[0]), f = (neg ? "no " : "") + R.subj[P[1]], c = adAgreeAlt(C[0], P), frame = Math.random() < 0.5 && !me;
      es = c.map((cc) => frame ? "Quiero que " + subjEs(P) + f + " " + cc + "." : "Es importante que " + subjEs(P) + f + " " + cc + ".");
      en = [frame ? "I want " + P[3] + (neg ? " not" : "") + " to " + V[1][0] + " " + C[1] + "." : "It is important for " + P[3] + (neg ? " not" : "") + " to " + V[1][0] + " " + C[1] + "."]; tags.push("v:subj");
    } else if (t === "subjRa") {
      const R = adConj(V[0]), f = (neg ? "no " : "") + R.subjRa[P[1]], c = adAgreeAlt(C[0], P), be = V[1] === AD_BE;
      es = c.map((cc) => "Ojalá " + subjEs(P) + f + " " + cc + ".");
      const pastEn = be ? "were" : V[1][2]; en = ["I wish " + P[2] + " " + (neg ? (be ? "were not" : "did not " + V[1][0]) : pastEn) + " " + C[1] + "."]; tags.push("v:subjRa");
    } else if (t === "si") {
      const T = adConj("tener"), R = adConj(V[0]), c = adAgreeAlt(C[0], P);
      es = c.map((cc) => "Si " + subjEs(P) + T.subjRa[P[1]] + " más tiempo, " + (neg ? "no " : "") + R.cond[P[1]] + " " + cc + ".");
      en = ["If " + P[2] + " had more time, " + P[2] + " would " + (neg ? "not " : "") + V[1][0] + " " + C[1] + "."]; tags.push("g:si", "v:subjRa", "v:cond");
    } else {
      const cue = AD_CUE[t] ? adPick1(AD_CUE[t]) : null, vp = adEsVP(V, t, P, neg), c = adAgreeAlt(C[0], P);
      es = c.map((cc) => adCap((cue ? cue[0] + " " + (subjEs(P) ? subjEs(P) : "") : subjEs(P)) + vp + " " + cc).replace(/\s+/g, " ").trim() + ".");
      const subjEn = cue && cue[2] === "start" ? (P[2] === "I" ? "I" : P[2]) : P[2];
      const e1 = cue && cue[2] === "start" ? cue[1] + " " + subjEn + " " + adEnVP(V, t, P, neg) + " " + C[1] + "." : adCap(P[2] + " " + adEnVP(V, t, P, neg) + " " + C[1] + (cue ? " " + cue[1] : "")) + ".";
      en = [e1]; if (t === "impf") en.push(adCap(P[2] + " " + (neg ? "did not " + V[1][0] : (V[1] === AD_BE ? (/^(I|he|she)$/.test(P[2]) ? "was" : "were") : V[1][2])) + " " + C[1] + (cue ? " " + cue[1] : "")) + ".");
      if (t === "fut") en.push(adCap(P[2] + " " + (P[2] === "I" ? "am" : /^(he|she)$/.test(P[2]) ? "is" : "are") + (neg ? " not" : "") + " going to " + V[1][0] + " " + C[1] + (cue ? " " + cue[1] : "")) + ".");
      tags.push("v:" + t);
    }
    if (/^(usted|ustedes)$/.test(P[0]) && !tags.includes("r:formal")) tags.push("r:formal");
    if (V[0] === "estar") tags.push("g:serestar");
    const it = { id: "g-" + Date.now() + "-" + Math.random().toString(36).slice(2, 6), dir, gen: 1, tags, len: adToks(es[0]).length, ui: 0 };
    if (dir === "en-es") { it.src = en[0].replace(/\.$/, "") + label + "."; it.ans = es; it.note = adGenNote(t, V, P); }
    else { it.src = es[0]; it.ans = en; it.note = adGenNote(t, V, P); }
    return it;
  }
  function adGenNote(t, V, P) {
    const tip = { pres: "Present: what happens regularly.", pret: "Preterite: a finished action at a point in the past (ayer, el sábado pasado).", impf: "Imperfect: what used to happen, habits in the past (todos los veranos, antes).", fut: "Future: infinitive + é, ás, á, emos, éis, án (irregular stems: tendr-, har-, saldr-…).", cond: "Conditional: infinitive + ía, ías, ía, íamos, íais, ían (same irregular stems as the future).", perf: "Present perfect: haber (he, has, ha, hemos, han) + participle (-ado, -ido).", plusc: "Pluperfect: había + participle: what had happened before another past event.", subj: "Present subjunctive after «quiero que…» / «es importante que…» (a different subject, a wish or a value judgement).", subjRa: "Imperfect subjunctive after «ojalá» for wishes that aren't real (from the ellos preterite: tuvieron → tuviera).", si: "«Si» + imperfect subjunctive (tuviera), then the conditional (viajaría).", imp: "Imperative: tú = él form of the present (habla, come) with irregulars (ten, ven, haz, pon, sal, di, ve); usted/ustedes = subjunctive (hable, coman); «no» + subjunctive." }[t] || "";
    return tip + (P[0] === "usted" || P[0] === "ustedes" ? " Usted/ustedes take the él/ellos form." : "");
  }

  /* ---------- checking a Spanish answer: what is wrong and where ---------- */
  const AD_ART = new Set(["el", "la", "los", "las", "un", "una", "unos", "unas", "lo", "al", "del"]), AD_PREP = new Set(["a", "en", "de", "con", "por", "para", "desde", "hasta", "sobre", "entre", "sin", "hacia", "al", "del"]), AD_PRON = new Set(["me", "te", "se", "lo", "la", "le", "nos", "os", "los", "las", "les"]);
  const AD_SUBJ = new Set(["yo", "tú", "él", "ella", "nosotros", "nosotras", "vosotros", "vosotras", "ellos", "ellas", "usted", "ustedes"]);
  function adAlign(a, b) { // token edit script: a = learner, b = model (accent-free compare)
    const A = a.map(adAcc), B = b.map(adAcc), n = A.length, m = B.length, D = Array.from({ length: n + 1 }, (_, i) => Array(m + 1).fill(0));
    for (let i = 0; i <= n; i++) D[i][0] = i; for (let j = 0; j <= m; j++) D[0][j] = j;
    for (let i = 1; i <= n; i++) for (let j = 1; j <= m; j++) D[i][j] = Math.min(D[i - 1][j] + 1, D[i][j - 1] + 1, D[i - 1][j - 1] + (A[i - 1] === B[j - 1] ? 0 : 1));
    const ops = []; let i = n, j = m;
    while (i > 0 || j > 0) {
      if (i > 0 && j > 0 && A[i - 1] === B[j - 1] && D[i][j] === D[i - 1][j - 1]) { ops.unshift({ op: "eq", l: a[i - 1], a: b[j - 1], li: i - 1, aj: j - 1 }); i--; j--; }
      else if (i > 0 && j > 0 && D[i][j] === D[i - 1][j - 1] + 1) { ops.unshift({ op: "sub", l: a[i - 1], a: b[j - 1], li: i - 1, aj: j - 1 }); i--; j--; }
      else if (j > 0 && D[i][j] === D[i][j - 1] + 1) { ops.unshift({ op: "ins", a: b[j - 1], li: i, aj: j - 1 }); j--; }
      else { ops.unshift({ op: "del", l: a[i - 1], li: i - 1 }); i--; }
    }
    return { d: D[n][m], ops };
  }
  const adGloss = (w) => { try { const g = TG[adAcc(w).toLowerCase()] || TG[String(w).toLowerCase()]; return g ? new Set(String(g[2] || "").toLowerCase().replace(/\([^)]*\)/g, "").split(/[;,\/]\s*|\s+/).filter((x) => x.length > 2 && !/^(the|to|and|for|with)$/.test(x))) : null; } catch (e) { return null; } };
  function adSyn(a, b) { const A = adGloss(a), B = adGloss(b); if (!A || !B) return false; for (const x of A) if (B.has(x)) return true; return false; }
  function adClassify(o) { // one substituted word: why it's wrong
    const l = o.l, a = o.a, la = adAcc(l), aa = adAcc(a);
    const rl = adReadings(l), ra = adReadings(a); let lem = ra.find((r) => rl.some((x) => x.v === r.v)), got = lem ? rl.find((x) => x.v === lem.v) : null;
    if (!lem) for (const r of ra) { const g = adFormOf(r.v, l); if (g) { lem = r; got = g; break; } } // «como» is also a conjunction: try the model verb's own forms
    if (lem) return { type: "verb", l, a, v: lem.v, got, want: lem };
    if (ra.some((r) => r.v === "ser") && rl.some((r) => r.v === "estar") || ra.some((r) => r.v === "estar") && rl.some((r) => r.v === "ser")) return { type: "serestar", l, a, want: ra[0].v };
    if (ra.length && !rl.length && la.slice(0, 3) === aa.slice(0, 3)) return { type: "verb", l, a, v: ra[0].v, got: null, want: ra[0] };
    if (la.replace(/(os|as|es|o|a|e|s)$/, "") === aa.replace(/(os|as|es|o|a|e|s)$/, "") && la.length > 2) return { type: "agree", l, a };
    if (AD_ART.has(la) && AD_ART.has(aa)) return { type: "article", l, a };
    if ((la === "por" && aa === "para") || (la === "para" && aa === "por")) return { type: "porpara", l, a };
    if (AD_PREP.has(la) && AD_PREP.has(aa)) return { type: "prep", l, a };
    if (AD_PRON.has(la) && AD_PRON.has(aa)) return { type: "pron", l, a };
    if (adSyn(l, a)) return { type: "syn", l, a };
    return { type: "word", l, a };
  }
  function adCheckEs(said, it) {
    const L0 = adToks(said); let best = null;
    const dropSubj = (t) => (t.length > 1 && AD_SUBJ.has(t[0]) ? t.slice(1) : t);
    it.ans.forEach((ans) => { const M0 = adToks(ans);
      [[L0, M0], [dropSubj(L0), dropSubj(M0)], [L0, dropSubj(M0)], [dropSubj(L0), M0]].forEach(([L, M]) => { const r = adAlign(L, M); if (!best || r.d < best.d) best = Object.assign(r, { L, M, ans }); }); });
    const issues = [], accents = [];
    best.ops.forEach((o) => { if (o.op === "eq" && o.l !== o.a) accents.push(o); });
    // the same words in another order
    const same = best.d > 0 && best.L.map(adAcc).sort().join(" ") === best.M.map(adAcc).sort().join(" ");
    if (same) issues.push({ type: "order" });
    else best.ops.forEach((o, k) => {
      if (o.op === "sub") issues.push(adClassify(o));
      else if (o.op === "ins") { if (!AD_SUBJ.has(o.a.toLowerCase())) issues.push({ type: "missing", a: o.a, after: best.L[o.li - 1] || null, before: best.L[o.li] || null }); } // subject pronouns are optional either way
      else if (o.op === "del") { if (!AD_SUBJ.has(o.l.toLowerCase())) issues.push({ type: "extra", l: o.l }); }
    });
    // synonyms the dictionary agrees on are accepted; one other word in a sentence with a single model answer is accepted if nothing else is wrong
    const real = issues.filter((x) => x.type !== "syn");
    let fx = []; try { fx = quickFixes(said) || []; } catch (e) {}
    let ok = real.length === 0, alt = issues.length > 0 && ok;
    if (!ok && it.single && real.length === 1 && /^(word|missing|extra)$/.test(real[0].type) && !fx.length && best.M.length >= 5) { ok = true; alt = true; }
    return { ok, alt, issues: real, accents, best, fx };
  }
  const adPers = (pi) => (typeof pi === "number" ? ["yo", "tú", "él/ella/usted", "nosotros", "vosotros", "ellos/ustedes"][pi] : { tu: "tú", ud: "usted", uds: "ustedes", vosotros: "vosotros", nos: "nosotros", vos: "vos" }[pi] || pi);
  function adWhy(x, level) { // level 1: what and where; 2: + a clue
    const q = (w) => "«" + w + "»";
    if (x.type === "verb") {
      const want = AD_TN[x.want.t] || x.want.t, wp = x.want.pi != null && x.want.pi !== -1 ? " (" + adPers(x.want.pi) + ")" : "";
      const s1 = x.got ? q(x.l) + " is the " + (AD_TN[x.got.t] || x.got.t) + (x.got.pi !== -1 ? " (" + adPers(x.got.pi) + ")" : "") + " of " + q(x.v) + ". Here the sentence needs the " + want + wp + "." : q(x.l) + " isn't the right form of " + q(x.v) + ": the sentence needs the " + want + wp + ".";
      return s1 + (level >= 2 ? " 💡 Clue: it starts with " + q(x.a.slice(0, Math.min(x.a.length - 1, Math.max(3, Math.ceil(x.a.length / 2))))) + "…" : "");
    }
    if (x.type === "serestar") return "Check " + q(x.l) + ": ser or estar? " + (level >= 2 ? "💡 Clue: this one needs " + q(x.want) + (x.want === "estar" ? " (states, location, results)." : " (identity, origin, time, characteristics).") : "");
    if (x.type === "agree") return "Check the ending of " + q(x.l) + ": it must agree in gender and number with the word it goes with." + (level >= 2 ? " 💡 Clue: " + q(x.a.slice(0, -1) + "_") + "." : "");
    if (x.type === "article") return "Check the article " + q(x.l) + "." + (level >= 2 ? " 💡 Clue: look at the gender and number of the noun after it (or whether it needs one at all)." : "");
    if (x.type === "porpara") return "Por or para? Check " + q(x.l) + "." + (level >= 2 ? " 💡 Clue: para = purpose, destination, deadline; por = cause, through, exchange, duration." : "");
    if (x.type === "prep") return "Check the preposition " + q(x.l) + "." + (level >= 2 ? " 💡 Clue: the right one starts with " + q(x.a.charAt(0)) + "." : "");
    if (x.type === "pron") return "Check the pronoun " + q(x.l) + "." + (level >= 2 ? " 💡 Clue: direct object lo/la/los/las, indirect le/les; se when le meets lo." : "");
    if (x.type === "missing") return "A word is missing " + (x.after ? "after " + q(x.after) : x.before ? "before " + q(x.before) : "at the start") + "." + (level >= 2 ? " 💡 Clue: it starts with " + q(x.a.charAt(0)) + " (" + x.a.length + " letters)." : "");
    if (x.type === "extra") return q(x.l) + " shouldn't be there." + (level >= 2 && AD_SUBJ.has(adAcc(x.l)) ? " (Spanish usually leaves out the subject pronoun.)" : "");
    if (x.type === "order") return "All the right words, but the order needs changing." + (level >= 2 ? " 💡 Clue: in Spanish, adjectives usually follow the noun and object pronouns go before the conjugated verb." : "");
    return q(x.l) + " doesn't fit here." + (level >= 2 ? " 💡 Clue: the word we need starts with " + q(x.a.charAt(0)) + "." : "");
  }
  function adMainKey(it, chk) {
    const x = (chk && chk.issues || [])[0];
    if (x && x.type === "verb" && x.want && x.want.t && !/^(part|ger|inf)$/.test(x.want.t)) return "v:" + (it.tags.includes("v:perf") && x.want.t === "pres" ? "perf" : x.want.t);
    if (x && x.type === "serestar") return "g:serestar"; if (x && x.type === "porpara") return "g:porpara"; if (x && x.type === "pron" && it.tags.includes("g:pron")) return "g:pron";
    const pref = ["g:si", "v:subjRa", "v:plusc", "v:subj", "v:cond", "v:perf", "v:imp", "v:impf", "v:pret", "v:fut", "r:formal"];
    for (const p of pref) if (it.tags.includes(p)) return p;
    return it.topic || it.tags.find((t) => /^v:/.test(t)) || "d:" + it.dir;
  }

  /* ---------- checking an English answer ---------- */
  const AD_ENSYN = [["film", "movie"], ["shop", "store"], ["holiday", "holidays", "vacation"], ["flat", "apartment"], ["mum", "mom", "mother"], ["dad", "father"], ["big", "large"], ["small", "little"], ["begin", "start"], ["finish", "end"], ["trousers", "pants"], ["autumn", "fall"], ["rubbish", "garbage", "trash"], ["biscuit", "cookie"], ["phone", "telephone"], ["kid", "child"], ["kids", "children"], ["fast", "quick"], ["glad", "happy"], ["centre", "center"], ["neighbour", "neighbor"], ["neighbours", "neighbors"], ["colour", "color"], ["favourite", "favorite"], ["travelled", "traveled"], ["theatre", "theater"], ["present", "gift"], ["town", "city"], ["job", "work"], ["near", "close"], ["pretty", "beautiful", "lovely", "nice"], ["buy", "purchase"], ["boss", "manager"], ["bill", "check"], ["dinner", "supper"], ["tired", "exhausted"], ["very", "really"], ["lots", "lot", "much", "many"], ["like", "enjoy"], ["go", "head"], ["want", "would like"]];
  const AD_SYNMAP = {}; AD_ENSYN.forEach((g) => g.forEach((w) => (AD_SYNMAP[w] = g[0])));
  const AD_IRR = { went: "go", gone: "go", ate: "eat", eaten: "eat", drank: "drink", drunk: "drink", wrote: "write", written: "write", bought: "buy", had: "have", has: "have", did: "do", done: "do", does: "do", saw: "see", seen: "see", slept: "sleep", told: "tell", brought: "bring", spoke: "speak", spoken: "speak", came: "come", met: "meet", chose: "choose", chosen: "choose", was: "be", were: "be", been: "be", is: "be", are: "be", am: "be", got: "get", gotten: "get", made: "make", took: "take", taken: "take", gave: "give", given: "give", left: "leave", felt: "feel", thought: "think", knew: "know", known: "know", found: "find", said: "say", put: "put", ran: "run", sat: "sit", stood: "stand", lost: "lose", paid: "pay", sent: "send", spent: "spend", began: "begin", begun: "begin", children: "child", men: "man", women: "woman", people: "person" };
  const AD_ENSTOP = new Set("a an the to of in on at for with and or but my your his her our their its this that these those it there be do will would have shall should can could may might must i you he she we they me him us them very so just also not no really".split(" "));
  function adEnNorm(s) {
    let t = " " + String(s || "").toLowerCase().replace(/[’‘`]/g, "'") + " ";
    t = t.replace(/\bwon't\b/g, "will not").replace(/\bcan't\b/g, "can not").replace(/\bcannot\b/g, "can not").replace(/\bshan't\b/g, "shall not").replace(/n't\b/g, " not").replace(/'m\b/g, " am").replace(/'re\b/g, " are").replace(/'ve\b/g, " have").replace(/'ll\b/g, " will").replace(/'d\b/g, " would").replace(/\b(it|he|she|that|what|there|who|where|here)'s\b/g, "$1 is").replace(/'s\b/g, "");
    return t.replace(/[^a-z0-9 ]+/g, " ").replace(/\s+/g, " ").trim().split(" ").filter(Boolean);
  }
  function adEnStem(w) { if (AD_IRR[w]) return AD_IRR[w]; if (AD_SYNMAP[w]) return AD_SYNMAP[w]; let s = w.replace(/(ies)$/, "y").replace(/(ied)$/, "y").replace(/([^aeiou])\1(ed|ing)$/, "$1").replace(/(ing|ed|es|s)$/, ""); if (s.length < 3) s = w; return AD_SYNMAP[s] || s; }
  function adEnTense(tk) { const t = " " + tk.join(" ") + " ";
    if (/ (will|shall) | going to /.test(t)) return "future"; if (/ would /.test(t)) return "conditional"; if (/ (have|has) (not )?(\w+ed|been|\w+en|done|gone|had|made|bought|brought|told|met|read|put|set|slept|come|left|found|said|sent|spent|lost|paid|sat|stood|thought|felt|known|taken|given|chosen|written|eaten|drunk|seen) /.test(t)) return "present perfect";
    if (/ had /.test(t) && / had (not )?(\w+ed|been|\w+en|done|gone|had|made|bought|told|met|read|put|set|slept|come|left|found|said) /.test(t)) return "past perfect";
    if (/ used to | (was|were|did) /.test(t) || tk.some((w) => (AD_IRR[w] && !/^(is|are|am|has|does|have|do|children|men|women|people|put|read|set)$/.test(w)) || (/ed$/.test(w) && w.length > 4 && !/^(need|feed|seed|speed|bleed|breed|bed|red|shed|wed|weed|indeed)$/.test(w)))) return "past";
    return "present"; }
  function adCheckEn(said, it) {
    const L = adEnNorm(said); let best = null;
    it.ans.forEach((ans) => { const M = adEnNorm(ans), mc = M.filter((w) => !AD_ENSTOP.has(w)).map(adEnStem), lc = new Set(L.filter((w) => !AD_ENSTOP.has(w)).map(adEnStem));
      const hit = mc.filter((w) => lc.has(w)), rec = mc.length ? hit.length / mc.length : 1, prec = lc.size ? hit.length / lc.size : 0;
      const isNeg = (x) => x.some((w) => /^(not|never|no|nothing|nobody|none|nowhere|neither|nor)$/.test(w)), tM = adEnTense(M), tL = adEnTense(L), neg = isNeg(M), negL = isNeg(L);
      const r = { ans, M, mc, miss: [...new Set(mc.filter((w) => !lc.has(w)))], rec, prec, tM, tL, negBad: neg !== negL, score: rec + prec * 0.3 - (tM !== tL ? 0.3 : 0) - (neg !== negL ? 0.3 : 0) };
      if (!best || r.score > best.score) best = r; });
    const issues = [];
    const tenseOk = best.tM === best.tL || (best.tM === "past" && best.tL === "past perfect") || (/present/.test(best.tM) && /present/.test(best.tL) && it.dir === "es-en" && !it.tags.includes("v:perf"));
    if (!tenseOk) issues.push({ type: "entense", got: best.tL, want: best.tM });
    if (best.negBad) issues.push({ type: "enneg", want: best.M.some((w) => /^(not|never|no|nothing|nobody|none|nowhere|neither|nor)$/.test(w)) });
    if (best.rec < 0.75) issues.push({ type: "enmiss", miss: best.miss });
    if (best.prec < 0.45 && L.length > 2) issues.push({ type: "enextra" });
    return { ok: !issues.length, alt: false, issues, best, accents: [], fx: [] };
  }
  function adWhyEn(x, it, level) {
    if (x.type === "entense") { const v = adSpanishVerb(it.src, x.want); return "Check the tense: " + (v ? "«" + v + "» is " + (x.want === "past" ? "in the past" : "the " + x.want) : "the Spanish is " + (x.want === "past" ? "in the past" : "in the " + x.want)) + ", but your English is " + (x.got === "past" ? "in the past" : "in the " + x.got) + "." + (level >= 2 ? " 💡 Clue: " + ({ past: "past simple (-ed / went) or «used to» for habits", future: "will + verb (or going to)", conditional: "would + verb", "present perfect": "have/has + participle", "past perfect": "had + participle", present: "present simple" }[x.want] || x.want) + "." : ""); }
    if (x.type === "enneg") return x.want ? "The Spanish sentence is negative (no…)." : "The Spanish sentence isn't negative.";
    if (x.type === "enmiss") { const pts = adSpanishFor(it.src, x.miss); return "Part of the meaning is missing" + (pts.length ? ": think about " + pts.map((w) => "«" + w + "»").join(", ") : "") + "." + (level >= 2 && x.miss.length ? " 💡 Clue: " + x.miss.slice(0, 3).map((w) => w.charAt(0) + "…").join(", ") + "." : ""); }
    if (x.type === "enextra") return "Your sentence says more than the Spanish does: keep only what's there.";
    return "";
  }
  function adSpanishVerb(es, tense) { const want = { past: ["pret", "impf"], future: ["fut"], conditional: ["cond"], "present perfect": ["part"], "past perfect": ["part"], present: ["pres"] }[tense] || [];
    for (const w of adToks(es)) { const rd = adReadings(w); if (rd.some((r) => want.includes(r.t))) return w; } return ""; }
  function adSpanishFor(es, missEn) { const out = []; adToks(es).forEach((w) => { const g = adGloss(w); if (g && missEn.some((m) => [...g].some((x) => adEnStem(x) === m))) out.push(w); }); return out.slice(0, 3); }

  /* ---------- choosing the next item ---------- */
  function adWeak(st, k) { const s = st.sk[k]; if (!s) return 0.5; return (s.miss + 0.5) / (s.n + 1); }
  function adPickTr(lv) {
    const st = adSt("tr", lv), B = adBank(lv), recent = new Set((PR && PR.recent) || []);
    const maxLen = Math.round(7 + st.diff * 13), nL = (LXS[lv] || []).length || 1, maxUi = Math.max(1, Math.ceil((0.4 + st.diff * 0.6) * nL));
    const fits = (it) => !recent.has(it.id) && (it.len <= maxLen || st.diff > 0.85) && it.ui < maxUi + 1;
    if (st.focus) {
      const f = st.focus, cand = B.filter((it) => it.tags.includes(f) && !recent.has(it.id));
      const genOK = /^v:|^g:si$|^r:formal$/.test(f) && (AD_GT[lv] || []).concat(["pres"]).includes(f.split(":")[1] === "formal" ? "imp" : f.split(":")[1]);
      if (genOK && (!cand.length || Math.random() < 0.5)) { const g = adGen(lv, f === "r:formal" ? (Math.random() < 0.5 ? "imp" : "pres") : f.split(":")[1]); if (f === "r:formal" && !g.tags.includes("r:formal")) return adGenFormal(lv); return g; }
      if (cand.length) return adNear(cand, maxLen);
      if (genOK) return adGen(lv, f.split(":")[1]);
    }
    // no focus: weak skills weigh more, unseen items a little more, generated sentences now and then; directions stay balanced
    if (Math.random() < 0.25) return adGen(lv, null);
    const dirW = { "en-es": 1 + adWeak(st, "d:en-es"), "es-en": 1 + adWeak(st, "d:es-en") };
    const pool = B.filter(fits); if (!pool.length) return adGen(lv, null);
    const seen = (S.adSeen = S.adSeen || {});
    const w = pool.map((it) => dirW[it.dir] * (1 + it.tags.reduce((m, k) => Math.max(m, st.mastered[k] ? 0 : adWeak(st, k)), 0) * 2) * (seen[it.id] ? 0.6 : 1.2));
    let r = Math.random() * w.reduce((a, b) => a + b, 0); for (let i = 0; i < pool.length; i++) { r -= w[i]; if (r <= 0) return pool[i]; } return pool[0];
  }
  function adGenFormal(lv) { for (let i = 0; i < 8; i++) { const g = adGen(lv, Math.random() < 0.5 ? "imp" : null); if (g.tags.includes("r:formal")) return g; } return adGen(lv, "imp"); }
  function adNear(cand, maxLen) { const ok = cand.filter((c) => c.len <= maxLen + 3); const p = ok.length ? ok : cand; return p[Math.floor(Math.random() * p.length)]; }

  /* ---------- conjugation: verbs grouped by how they behave, so similar ones follow a mistake ---------- */
  const AD_GRP = { "reg-ar": "regular -ar", "reg-er": "regular -er", "reg-ir": "regular -ir", go: "yo form in -go (tengo, salgo, hago)", "e>ie": "stem change e → ie (quiero, empiezo)", "o>ue": "stem change o → ue (puedo, duermo)", "e>i": "stem change e → i (pido, sigo)", uv: "-uve preterites (tuve, estuve, anduve)", u: "u-stem preterites (pude, puse, supe)", i: "i-stem preterites (hice, quise, vine)", j: "j-stem preterites (dije, traje, conduje)", y: "y in the 3rd person (leyó, cayó)", "3p": "stem change in the 3rd person (pidió, durmió)", stem: "irregular future/conditional stem (tendr-, har-, saldr-)", irr: "irregular" };
  const AD_REGEND = { ar: { pres: ["o", "as", "a", "amos", "áis", "an"], pret: ["é", "aste", "ó", "amos", "asteis", "aron"], impf: ["aba", "abas", "aba", "ábamos", "abais", "aban"], subj: ["e", "es", "e", "emos", "éis", "en"], subjRa: ["ara", "aras", "ara", "áramos", "arais", "aran"] },
    er: { pres: ["o", "es", "e", "emos", "éis", "en"], pret: ["í", "iste", "ió", "imos", "isteis", "ieron"], impf: ["ía", "ías", "ía", "íamos", "íais", "ían"], subj: ["a", "as", "a", "amos", "áis", "an"], subjRa: ["iera", "ieras", "iera", "iéramos", "ierais", "ieran"] },
    ir: { pres: ["o", "es", "e", "imos", "ís", "en"], pret: ["í", "iste", "ió", "imos", "isteis", "ieron"], impf: ["ía", "ías", "ía", "íamos", "íais", "ían"], subj: ["a", "as", "a", "amos", "áis", "an"], subjRa: ["iera", "ieras", "iera", "iéramos", "ierais", "ieran"] } };
  const adGrpCache = {};
  function adGroup(v, t) {
    const k = v + "|" + t; if (adGrpCache[k]) return adGrpCache[k];
    const R = adConj(v), end = v.slice(-2).replace("í", "i"), st = v.slice(0, -2); let g = "reg-" + end;
    const reg = (tt, pi) => (tt === "fut" ? v + ["é", "ás", "á", "emos", "éis", "án"][pi] : tt === "cond" ? v + ["ía", "ías", "ía", "íamos", "íais", "ían"][pi] : AD_REGEND[end] && AD_REGEND[end][tt] ? st + AD_REGEND[end][tt][pi] : null);
    const differs = (tt) => (R[tt] || []).some((f, pi) => reg(tt, pi) && adAcc(f) !== adAcc(reg(tt, pi)));
    const subjLike = t === "subj" || t === "subjRa";
    const tt = t === "subjRa" ? "pret" : t === "subj" ? "pres" : t;
    if (t === "fut" || t === "cond") g = differs(t) ? "stem" : g;
    else if (t === "impf") g = differs("impf") ? "irr" : g;
    else if (differs(t) || (subjLike && differs(tt))) {
      if (tt === "pres") { const y = R.pres[0], t3 = R.pres[2]; g = /go$/.test(y) && !/go$/.test(reg("pres", 0)) ? "go" : /ie/.test(adAcc(t3)) && !/ie/.test(adAcc(reg("pres", 2))) ? "e>ie" : /ue/.test(adAcc(t3)) && !/ue/.test(adAcc(reg("pres", 2))) ? "o>ue" : adAcc(t3).replace(/i/g, "e") === adAcc(reg("pres", 2)) ? "e>i" : "irr"; }
      else if (tt === "pret") { const y = adAcc(R.pret[0]), t3 = adAcc(R.pret[2]); g = /uve$/.test(y) ? "uv" : /je$/.test(y) ? "j" : /u[^aeiou]e$/.test(y) ? "u" : /i[^aeiou]e$/.test(y) ? "i" : /yo$/.test(t3) ? "y" : adAcc(reg("pret", 2)) !== t3 ? "3p" : "irr"; }
      else g = "irr";
    }
    return (adGrpCache[k] = g);
  }
  function adCjPool(lv) { const n = { a1: 40, a2: 120, b1: 300, b2: 600, c1: 1000, c2: 1500 }[lv] || 300; return VI ? VI.slice(0, n).filter((r) => r[2] !== "X" && !/se$/.test(r[0])).map((r) => r[0]) : ["ser", "tener", "hablar", "comer", "vivir", "ir", "hacer"]; }
  function adCjPersons() { return S.region === "es" ? [["yo", 0], ["tú", 1], ["él", 2], ["ella", 2], ["usted", 2], ["nosotros", 3], ["vosotros", 4], ["ellos", 5], ["ustedes", 5]] : [["yo", 0], ["tú", 1], ["él", 2], ["ella", 2], ["usted", 2], ["nosotros", 3], ["ellos", 5], ["ustedes", 5]]; }
  function adPickCj(lv) {
    const st = adSt("cj", lv), ts = TENSES_BY[lv] || TENSES_BY.a2, pool = adCjPool(lv), P = adCjPersons(), recent = new Set((PR && PR.recent) || []);
    const mk = (v, t) => { const p = adPick1(P), R = adConj(v), g = adGroup(v, t); return { v, t, p: p[0], pi: p[1], ans: R[t][p[1]], grp: g, tags: ["c:" + t + ":" + g, "v:" + t, "c:" + t], id: "cj-" + v + "-" + t + "-" + p[0] }; };
    if (st.focus && /^c:/.test(st.focus)) {
      const [, t, g] = st.focus.split(":");
      const same = pool.filter((v) => !recent.has("v-" + v) && (!g || adGroup(v, t) === g)).slice(0, 400);
      if (same.length) return mk(adPick1(same.slice(0, 60)), t);
    }
    // weakest tense and group of the level, mostly common verbs, harder groups as accuracy grows
    const cand = []; for (let i = 0; i < 24; i++) { const v = pool[Math.floor(Math.pow(Math.random(), 1.4 - st.diff * 0.6) * pool.length)], t = adPick1(ts); if (!recent.has("v-" + v)) cand.push(mk(v, t)); }
    if (!cand.length) return mk(adPick1(pool), adPick1(ts));
    cand.forEach((c) => (c.w = (1 + adWeak(st, "c:" + c.t + ":" + c.grp) * 2 + adWeak(st, "c:" + c.t)) * (st.mastered["c:" + c.t + ":" + c.grp] ? 0.4 : 1)));
    let r = Math.random() * cand.reduce((a, c) => a + c.w, 0); for (const c of cand) { r -= c.w; if (r <= 0) return c; } return cand[0];
  }

  /* ---------- the drill ---------- */
  async function adStart(kind) {
    try { await loadIndex(); } catch (e) {}
    const lv = PRL || curLvl(), st = adSt(kind, lv);
    tCur = null; PR = { kind, lv, recent: [], done: 0, first: 0, fb: null, autoMic: true };
    ensureSession(kind === "tr" ? "Sentence translation" : "Conjugation drill", (kind === "tr" ? "Sentence translation · " : "Conjugation · ") + lv.toUpperCase()); tView = "practice";
    if (st.focus) PR.note = "Picking up where you left off: " + adLabel(st.focus) + ".";
    adNext(true);
  }
  function adNext(first) {
    if (!PR) return; const lv = PR.lv;
    PR.it = PR.kind === "tr" ? adPickTr(lv) : adPickCj(lv); PR.tries = 0; PR.fb = null; PR.over = false; PR.ask = null; if (!first) PR.note = PR.note2 || ""; PR.note2 = "";
    PR.recent.push(PR.it.id); if (PR.kind === "cj") PR.recent.push("v-" + PR.it.v); if (PR.recent.length > 40) PR.recent.splice(0, PR.recent.length - 40);
    tRender(); adAsk();
  }
  function adPrompt(it) { return PR.kind === "cj" ? it.v + " · " + it.p + " · " + AD_TN_ES[it.t] : it.src; }
  function adAsk() {
    if (!PR || !PR.it) return; const it = PR.it; window.__sttOver = PR.kind === "tr" && it.dir === "es-en" ? "en-US" : null;
    const go = () => { if (PR && PR.autoMic && CAN_MIC && !PR.over && !PR.ask) listen(prAnswer); };
    let u;
    if (PR.kind === "cj") u = utter(it.v + ". " + it.p + ". " + AD_TN_ES[it.t] + ".", "es", 0.9);
    else if (it.dir === "en-es") u = utter("In Spanish: " + it.src, "en", 1);
    else u = utter(it.src, "es", 0.9);
    u.onend = go; try { speechSynthesis.cancel(); speechSynthesis.speak(u); } catch (e) { go(); }
  }
  const AD_YES = /^(s[ií]|yes|yeah|yep|sure|ok(ay)?|vale|claro|venga|dale|of course|por supuesto|let'?s go|why not)(?![\p{L}])/iu, AD_NO = /^(no|nope|not yet|todav[ií]a no|mejor no|keep going|sigamos|same|more)(?![\p{L}])/iu;
  const AD_NEW = /^(something new|try something new|algo nuevo|otra cosa|change|cambia|switch|new topic)(?![\p{L}])/iu, AD_SHOW = /^(show( me)?( the)? answer|i don'?t know|no s[eé]|dime( la respuesta)?|reveal|give up|me rindo)(?![\p{L}])/iu, AD_SKIP = /^(skip|next|siguiente|pasa|salta|otra)(?![\p{L}])/iu;
  function adAnswer(said) {
    window.__sttOver = null; if (!PR || !PR.it) return; const s = String(said || "").trim(); if (!s) return;
    if (PR.ask) { if (AD_YES.test(s) || AD_NEW.test(s)) return adNew(true); if (AD_NO.test(s)) return adNew(false); }
    if (AD_NEW.test(s)) return adNew(true);
    if (PR.over) { if (AD_SKIP.test(s) || AD_YES.test(s)) return adNext(); }
    else if (AD_SHOW.test(s)) return adFinish(false, null, true);
    else if (AD_SKIP.test(s) && s.split(" ").length <= 2) return adSkip();
    if (PR.over) return;
    logMsg("u", s);
    try { const um = tCur.msgs[tCur.msgs.length - 1]; PR.um = um; if (PR.kind === "cj" || PR.it.dir === "en-es") checkMsg(um); } catch (e) {}
    const it = PR.it; let chk;
    if (PR.kind === "cj") { const ok = (" " + nrm(s) + " ").includes(" " + nrm(it.ans) + " ") || nrm(s) === nrm(it.ans) || (" " + sounds(s) + " ").includes(" " + sounds(it.ans) + " ");
      const accent = ok && !(" " + s.toLowerCase() + " ").includes(" " + it.ans.toLowerCase() + " ") && adAcc(s.toLowerCase()).includes(adAcc(it.ans.toLowerCase()));
      chk = { ok, issues: ok ? [] : [{ type: "cj", said: s.split(/\s+/).pop() }], accents: accent ? [{ l: s.split(/\s+/).pop(), a: it.ans }] : [] }; }
    else chk = it.dir === "en-es" ? adCheckEs(s, it) : adCheckEn(s, it);
    PR.tries++;
    if (chk.ok) return adFinish(true, chk);
    if (PR.tries >= AD_TRIES) return adFinish(false, chk);
    // feedback: what is wrong and where; a clue from the second try on
    const lvl = PR.tries >= 2 ? 2 : 1;
    let lines = PR.kind === "cj" ? [adCjWhy(it, chk.issues[0].said, lvl)] : chk.issues.slice(0, 3).map((x) => (it.dir === "en-es" ? adWhy(x, lvl) : adWhyEn(x, it, lvl)));
    if (lvl >= 2 && it.note && PR.kind === "tr" && !lines.some((l) => /💡/.test(l))) lines.push("💡 Clue: " + it.note);
    PR.fb = { ok: false, said: s, lines, left: AD_TRIES - PR.tries, chk };
    const [pes, pen] = tpick(TEACH.retry); logMsg("a", pes + " " + lines.join(" "));
    tRender(); speakMixed(pes.replace(/[^\p{L}\p{P}\s]/gu, "").trim() + " " + (lvl >= 2 ? "Te doy una pista." : "Inténtalo otra vez."), () => { if (PR && PR.autoMic && CAN_MIC && !PR.over) { window.__sttOver = PR.kind === "tr" && it.dir === "es-en" ? "en-US" : null; listen(prAnswer); } });
  }
  function adCjWhy(it, said, lvl) {
    let why; try { why = formWhy(it.v, said, it.t, it.pi, null).replace(/\n.*$/, ""); } catch (e) { why = "We need **" + it.p + "** · **" + AD_TN_ES[it.t] + "**."; }
    if (lvl >= 2) why += " 💡 Clue: " + (AD_GRP[it.grp] && !/^reg/.test(it.grp) ? "this verb is one of the " + AD_GRP[it.grp] + "; " : "") + "it starts with «" + it.ans.slice(0, Math.max(2, Math.ceil(it.ans.length / 2))) + "…».";
    return why;
  }
  function adRecord(it, pass, key) {
    const st = adSt(PR.kind, PR.lv); const keys = new Set((it.tags || []).concat(key ? [key] : []));
    keys.forEach((k) => { const s = (st.sk[k] = st.sk[k] || { n: 0, miss: 0, streak: 0 }); s.n++; if (pass) s.streak++; else { s.miss++; s.streak = 0; } });
    st.n++; if (pass && PR.tries <= 1) st.first++;
    st.diff = Math.max(0, Math.min(1, st.diff + (pass ? (PR.tries <= 1 ? 0.05 : 0.01) : -0.07)));
    S.adSeen = S.adSeen || {}; S.adSeen[it.id] = 1; const ks = Object.keys(S.adSeen); if (ks.length > 3000) ks.slice(0, 1000).forEach((k) => delete S.adSeen[k]);
    adSave();
  }
  function adFinish(pass, chk, gaveUp) {
    const it = PR.it, st = adSt(PR.kind, PR.lv), firstTry = pass && PR.tries <= 1;
    const key = PR.kind === "cj" ? "c:" + it.t + ":" + it.grp : adMainKey(it, chk);
    adRecord(it, pass && PR.tries <= 2, key);
    PR.over = true; PR.done++; if (firstTry) PR.first++;
    const model = PR.kind === "cj" ? it.ans : it.ans[0];
    const [pes, pen] = tpick(pass ? (PR.tries > 1 ? TEACH.again : TEACH.first) : TEACH.reveal);
    const notes = []; if (chk && chk.accents && chk.accents.length) notes.push("Accent: " + chk.accents.map((x) => "«" + x.l + "» → «" + x.a + "»").join(", ") + " (the DELE marks accents as spelling).");
    if (chk && chk.alt) notes.push("Also correct. The lesson's version: «" + model + "».");
    if (!pass && chk && chk.issues && PR.kind === "tr") notes.push(...chk.issues.slice(0, 3).map((x) => (it.dir === "en-es" ? adWhy(x, 1) : adWhyEn(x, it, 1))));
    if (it.note && PR.kind === "tr") notes.push("Rule: " + it.note);
    PR.fb = { ok: pass, said: chk ? (PR.um && PR.um.c) || "" : "", model, praise: pes + " " + pen, notes, gaveUp, diff: !pass && chk && chk.best && chk.best.ops ? adDiffHtml(chk.best) : "" };
    // adaptive: a struggle makes that skill the focus; three right first time in a row masters it, then Profe offers something new
    let ask = null;
    if (!pass || PR.tries >= 2) { if (st.focus !== key) { st.focus = key; st.fstreak = 0; PR.note2 = "Let's practise this a bit more: " + adLabel(key) + "."; } else st.fstreak = 0; }
    else if (st.focus && (it.tags || []).includes(st.focus) || st.focus === key) { st.fstreak = (st.fstreak || 0) + (firstTry ? 1 : 0); if (st.fstreak >= AD_MASTER) { st.mastered[st.focus] = Date.now(); ask = st.focus; } }
    else if (!st.focus && PR.done % 8 === 0) ask = "_";
    adSave();
    logMsg("a", pes + " " + (pass ? "✓ " : "") + "**" + model + "**" + (notes.length ? " — " + notes.join(" ") : ""));
    if (ask) { PR.ask = ask; tRender(); const q = ask === "_" ? "¿Probamos algo nuevo? Would you like to try something new?" : "¡Dominado! You've mastered " + adLabel(ask) + ". ¿Probamos algo nuevo? Would you like to try something new?";
      speakMixed(pes.replace(/[^\p{L}\p{P}\s]/gu, "").trim() + " " + (PR.kind === "tr" && it.dir === "es-en" ? "" : model + ". ") + q, () => { if (PR && PR.ask && CAN_MIC && PR.autoMic) listen(prAnswer); }); return; }
    tRender(); const at = it.id;
    speakMixed(pes.replace(/[^\p{L}\p{P}\s]/gu, "").trim() + " " + model, () => { setTimeout(() => { if (PR && PR.it && PR.it.id === at && PR.over && !PR.ask && PR.autoMic) adNext(); }, pass ? 900 : 2600); });
  }
  function adNew(yes) {
    const st = adSt(PR.kind, PR.lv), was = st.focus; PR.ask = null;
    if (yes) { st.focus = null; st.fstreak = 0; const next = adFreshSkill(st, was); if (next) { st.focus = next; st.fstreak = 0; } PR.note2 = next ? "Something new: " + adLabel(next) + "." : "Something new: a mix of everything at this level."; }
    else { st.fstreak = 0; PR.note2 = was ? "OK, more " + adLabel(was) + "." : "OK, let's keep going."; }
    adSave(); adNext();
  }
  function adFreshSkill(st, avoid) { // a skill of this level not mastered yet and not the one just practised; the least practised first
    let keys;
    if (PR.kind === "cj") { const ts = TENSES_BY[PR.lv] || TENSES_BY.a2; keys = []; ts.forEach((t) => ["go", "e>ie", "o>ue", "e>i", "uv", "u", "i", "j", "stem", "reg-ar", "reg-er", "reg-ir"].forEach((g) => keys.push("c:" + t + ":" + g)));
      keys = keys.filter((k) => { const [, t, g] = k.split(":"); return adCjPool(PR.lv).slice(0, 300).some((v) => adGroup(v, t) === g); }); }
    else { const B = adBank(PR.lv), set = new Set(); B.forEach((it) => it.tags.forEach((k) => /^(v|g|r|t):/.test(k) && set.add(k))); (AD_GT[PR.lv] || []).forEach((t) => set.add(t === "si" ? "g:si" : t === "imp" ? "v:imp" : "v:" + t)); keys = [...set]; }
    keys = keys.filter((k) => k !== avoid && !st.mastered[k] && !(avoid && avoid.split(":")[1] === k.split(":")[1] && PR.kind === "cj" && Math.random() < 0.7));
    if (!keys.length) return null;
    keys.sort((a, b) => ((st.sk[a] || { n: 0 }).n - (st.sk[b] || { n: 0 }).n) || (Math.random() - 0.5));
    return keys[Math.floor(Math.random() * Math.min(3, keys.length))];
  }
  function adSkip() { if (!PR || !PR.it || PR.over) return; adRecord(PR.it, false, PR.kind === "cj" ? "c:" + PR.it.t + ":" + PR.it.grp : adMainKey(PR.it, null)); adNext(); }
  function adDiffHtml(best) { // the model answer as written, with the words the learner got wrong or left out in bold
    const W = String(best.ans || "").split(/\s+/).filter(Boolean), full = adToks(best.ans);
    if (W.length !== full.length || full.join(" ") !== best.M.join(" ")) return esc(best.ans || "");
    const bad = new Set(); best.ops.forEach((o) => { if ((o.op === "sub" || o.op === "ins") && !AD_SUBJ.has(String(o.a).toLowerCase())) bad.add(o.aj); });
    return W.map((w, k) => (bad.has(k) ? '<b class="addiff">' + esc(w) + "</b>" : esc(w))).join(" ");
  }
  function adHTML() {
    const it = PR.it, st = adSt(PR.kind, PR.lv); if (!it) return '<div class="tscroll"><p class="muted">Loading…</p></div>';
    const title = PR.kind === "tr" ? "Sentence translation" : "Conjugation";
    let h = '<div class="tscroll adwrap"><div class="row" style="justify-content:space-between"><button class="btn small" data-act="pr-exit">‹ All practice</button><span class="small muted">' + PR.lv.toUpperCase() + " · " + PR.done + " done · " + PR.first + " first try</span></div>";
    h += "<h3>" + title + "</h3>";
    if (st.focus) { const f = st.fstreak || 0; h += '<p class="adfocus small"><b>Practising:</b> ' + esc(adLabel(st.focus)) + ' <span class="addots" aria-label="' + f + " of " + AD_MASTER + ' right first time in a row">' + Array.from({ length: AD_MASTER }, (_, i) => (i < f ? "●" : "○")).join("") + "</span></p>"; }
    if (PR.note) h += '<p class="small muted">' + esc(PR.note) + "</p>";
    const dirL = PR.kind === "cj" ? "Say or type the form" : it.dir === "en-es" ? "English → Spanish" : "Spanish → English";
    h += '<div class="prbox adq"><p class="small muted">' + dirL + '</p><p class="prsay">' + (PR.kind === "cj" ? "" : it.dir === "es-en" ? sayBtn(it.src) + " " : "") + "<b>" + esc(adPrompt(it)) + "</b></p>" + (it.from ? '<p class="small muted">From «' + esc(it.from) + "»</p>" : "") + "</div>";
    const fb = PR.fb;
    if (fb && !fb.ok && !PR.over) h += '<div class="prbox bad"><p><b>¡Casi!</b> <span class="muted">' + (fb.left === 1 ? "One more try, then I'll show you." : "Try again: " + fb.left + " tries left.") + '</span></p><p class="small">You said: «' + esc(fb.said) + "»</p>" + fb.lines.map((l) => "<p>" + esc(l).replace(/\*\*(.+?)\*\*/g, "<b>$1</b>") + "</p>").join("") + "</div>";
    if (PR.over && fb) h += '<div class="prbox ' + (fb.ok ? "ok" : "bad") + '"><p><b>' + esc(fb.praise) + "</b></p>" + (fb.ok ? "" : '<p class="small muted">' + (fb.gaveUp ? "Here's the answer." : "Here's the answer, after three tries.") + "</p>") + '<p class="adans">✓ ' + (fb.diff || esc(fb.model)) + (PR.kind === "cj" || it.dir === "en-es" ? " " + sayBtn(fb.model) : "") + "</p>" + (fb.notes || []).map((n) => '<p class="small">' + esc(n) + "</p>").join("") + (!fb.ok && PR.kind === "tr" && it.ans.length > 1 ? '<p class="small muted">Also right: ' + it.ans.slice(1, 3).map((a) => "«" + esc(a) + "»").join(" · ") + "</p>" : "") + "</div>";
    if (PR.um && PR.um.fx && PR.um.fx.items && PR.um.fx.items.length) h += '<div class="prfx">' + fixCard(PR.um) + "</div>";
    if (PR.ask) h += '<div class="prbox adask"><p><b>' + (PR.ask === "_" ? "¿Probamos algo nuevo?" : "¡Dominado! You've mastered " + esc(adLabel(PR.ask)) + ".") + '</b></p><p class="small">Would you like to try something new?</p><div class="row"><button class="btn primary small" data-act="ad-new" data-v="1">Yes, something new</button><button class="btn small" data-act="ad-new" data-v="0">No, more of this</button></div></div>';
    h += '<div class="row adbtns">' + (PR.over ? (PR.ask ? "" : '<button class="btn primary small" data-act="ad-next">Next ›</button>') : '<button class="btn small" data-act="ad-show">Show the answer</button><button class="btn small" data-act="ad-skip">Skip</button>') + (PR.ask ? "" : '<button class="btn small" data-act="ad-new" data-v="1">Something new</button>') + "</div>";
    h += '<p class="small muted">' + (PR.kind === "tr" ? "Up to three tries; a clue after the second. Mistakes bring more of the same kind until you've got it." : "Up to three tries; a clue after the second. Verbs that behave like the one you missed come next.") + "</p>";
    h += "</div>";
    const ph = PR.ask ? "…or type yes / no" : PR.over ? "…or type next" : PR.kind === "tr" && it.dir === "es-en" ? "Type your English answer" : "Type your Spanish answer";
    return h + '<div class="t-live" id="t-live" hidden></div><form class="tform" id="pr-form">' + (CAN_MIC ? '<button class="micbtn" type="button" data-act="pr-mic" aria-label="Speak">' + MIC + "</button>" : "") + '<label class="sr" for="pr-input">Type your answer</label><input id="pr-input" autocomplete="off" autocapitalize="off" placeholder="' + ph + '"><button class="btn primary" type="submit">OK</button></form>';
  }
  window.__ad = { bank: adBank, gen: adGen, checkEs: adCheckEs, checkEn: adCheckEn, why: adWhy, whyEn: adWhyEn, st: adSt, group: adGroup, pickTr: adPickTr, pickCj: adPickCj, pool: adCjPool, tags: adTags, pr: () => PR, render: () => tRender(), label: adLabel, key: adMainKey };
  /* ==/ADAPTIVE== */
