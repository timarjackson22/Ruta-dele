  /* ===================== Profe hands-free: capability registry, commands, "Ok Profe" (tools/PROFE_HANDSFREE_BRIEF.md) ===================== */
  const PVR = (() => { try { return JSON.parse(document.getElementById("pv-registry").textContent); } catch (e) { return { actions: [], routes: {}, acts: {} }; } })();
  const PV_DIAG = [];
  window.__pvLog = (x) => pvLog(x);
  function pvLog(x) { PV_DIAG.push(new Date().toTimeString().slice(0, 8) + " " + x); if (PV_DIAG.length > 40) PV_DIAG.shift(); }
  // the phone's recogniser events, kept for "Mic diagnostics" (Profe › History & settings)
  (function () { const A = window.__astt; if (A && A.ev && !A.__pv) { const ev = A.ev; A.ev = function (t, a) { if (t !== "partial") pvLog("mic " + t + (a ? " " + String(a).slice(0, 40) : "")); return ev.apply(this, arguments); }; A.__pv = 1; } })();

  // ---------- understanding ----------
  const PV_NUM = { one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10, eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15, uno: 1, una: 1, dos: 2, tres: 3, cuatro: 4, cinco: 5, seis: 6, siete: 7, ocho: 8, nueve: 9, diez: 10, once: 11, doce: 12, trece: 13, catorce: 14, quince: 15 };
  // "Ok Profe" and the ways a recogniser writes it (accents and pacing vary; "o que profe", "okey profe", "ok prof", "oye profe")
  const PV_WAKE = /(?:^|\s)(?:o\s?k(?:a?y|e[iy]?)?|okey|okay|oye|hola|hey|ey|o\s?que|ok)\s*,?\s*(?:pr[oó]f(?:e|é|es|esor|esora|ey|i|y|a)?|pro\s?fe)(?=\s|$|[.,!?])/i;
  const pvStrip = (t) => String(t || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  function pvNorm(t) {
    let s = pvStrip(t).replace(/[¿¡?!.,;:"“”«»()]/g, " ").replace(/['’`]/g, "").replace(/-/g, " ").replace(/\s+/g, " ").trim();
    const w = s.match(PV_WAKE); if (w && w.index < 6) s = s.slice(w.index + w[0].length);
    for (let k = 0; k < 3; k++) s = s.replace(/^\s*(profe|hey|oye|ok|okay|okey|vale|bueno|so|um+|eh+|well|and|y)\s+/, "");
    s = s.replace(/\b(please|por favor|porfa|porfavor)\b/g, " ").replace(/^\s*(can|could|would|will) you (please )?/, "").replace(/^\s*(me )?(puedes|podrias)\s+/, "")
      .replace(/^\s*(i want to|i would like to|id like to|i wanna|quiero|me gustaria)\s+(?=(open|go|see|start|abrir|ir|ver|empezar|continuar|seguir)\b)/, "");
    s = s.replace(/^\s*(lets|let us|can we|could we|shall we|should we)\s+(?=(do|go|play|read|review|practi[cs]e|start|watch|open|try|hear|listen|quiz|drill|run)\b)/, ""); // "let's do my travel words" = "do my travel words"
    // what recognisers write for "level A1 flashcards" (S24 log, Nov 2026: «open the left with ayo one flashcards», «open deliver e one flashcards»)
    s = s.replace(/\bflash ?cards?\b/g, "flashcards").replace(/\b(wireless|wordless|word less|world list|worldless|wordlist|word lists)\b/g, "word list").replace(/^open up\b/, "open")
      .replace(/\b(levy|levi|leve|lebel)\b(?= (one|two|three|four|five|six|uno|dos|\d|a|b|c)\b)/g, "level").replace(/\b(birds|herbs|bursts)\b(?= (word list|list|vocabulary))/g, "verbs");
    s = s.replace(/\blevel (one|two|three|four|five|six|1|2|3|4|5|6)\b(?= (flashcards|cards|vocabulary|vocab|words|word list|units?|lessons?|exam)|$)/g, (m, n) => "level " + ["a1", "a2", "b1", "b2", "c1", "c2"][({ one: 1, two: 2, three: 3, four: 4, five: 5, six: 6 }[n] || +n) - 1]);
    if (/\b(flashcards|cards|vocab|vocabulary|words|level|nivel|unit|lesson|exam|tarjetas|vocabulario|left with|deliver)\b/.test(s)) {
      s = s.replace(/\b(left with|deliver|lever|label|lebel|leble)\b(?= (a|ay|ayo|eh|hey|e|be|bee|b|v|ve|ce|c|se|see|sea|si)\s*(uno|one|1|dos|two|2)\b)/g, "level");
      s = s.replace(/\b(ay|ayo|eh|hey|e)\s+(uno|one|1|dos|two|2)\b/g, (m, l, n) => "a" + (/uno|one|1/.test(n) ? "1" : "2"));
      s = s.replace(/\b(bee|v|ve)\s+(uno|one|1|dos|two|2)\b/g, (m, l, n) => "b" + (/uno|one|1/.test(n) ? "1" : "2"));
      s = s.replace(/\b(see|sea|si)\s+(uno|one|1|dos|two|2)\b/g, (m, l, n) => "c" + (/uno|one|1/.test(n) ? "1" : "2"));
    }
    // S24 log 02:35–02:37 (English recognition): «level A1 a flashcards», «level A1 of flashcards», «the verbs the verbs list», «verbose»
    s = s.replace(/\bverbose\b/g, "verbs").replace(/\b(\w+(?: \w+){0,2}) \1\b/g, "$1").replace(/\b(a1|a2|b1|b2|c1|c2) (a|of|the|de|del) (?=(flashcards|cards|vocabulary|vocab|words|word list|units?|lessons?)\b)/g, "$1 ");
    s = s.replace(/\b(a|be|b|ce|c|se)\s+(uno|one|1|dos|two|2)\b/g, (m, l, n) => ({ a: "a", be: "b", b: "b", ce: "c", c: "c", se: "c" }[l]) + (/uno|one|1/.test(n) ? "1" : "2"));
    s = s.replace(/\b(unit|lesson|exam|test|unidad|leccion|examen|tema)\s+(number|numero|no|nr)\s+/g, "$1 ");
    s = s.replace(/\b(unit|lesson|exam|test|unidad|leccion|examen|tema|number|numero|question|pregunta)\s+([a-z]+)\b/g, (m, x, n) => (PV_NUM[n] ? x + " " + PV_NUM[n] : m));
    return s.replace(/\s+/g, " ").trim();
  }
  const PV_TOPIC = [["past tenses?|the past|past tense|pasados?|el pasado|los pasados|tiempos pasados|tiempo pasado", "pasados"], ["preterite( (vs|versus|and|or) (the )?imperfect)?|imperfect|preterito( (vs|y|o) imperfecto)?|indefinido|imperfecto", "pret-imp"],
    ["por (and|y|vs|versus|or|o) para|por para|para (and|y|vs|versus|or|o) por", "por-para"], ["ser (and|y|vs|versus|or|o) estar|ser estar|estar (and|y|vs|versus) ser", "ser-estar"], ["(the )?subjunctive|(el )?subjuntivo", "subjuntivo"],
    ["(the )?imperative|commands|(el )?imperativo|mandatos", "imperativo"], ["pronunciation|accents|written accents|pronunciacion|acentos|tildes", "pronunciacion"], ["conjugation|verb conjugation|conjugacion|conjugar verbos", "conjugacion"],
    ["(the )?present( tense)?|(the )?future( tense)?|(the )?conditional|(el )?presente|(el )?futuro|(el )?condicional", "presente-futuro"], ["prepositions|preposiciones", "preposiciones"], ["connectors|linking words|conectores", "conectores"],
    ["idioms|expressions|modismos|expresiones", "modismos"], ["reflexive verbs|verbs like gustar|gustar|reflexivos|verbos reflexivos|verbos como gustar", "reflexivos-gustar"], ["personal pronouns|pronouns|pronombres( personales)?", "pronombres"],
    ["nouns and adjectives|gender|genero|sustantivos y adjetivos", "sustantivos"], ["articles|possessives|demonstratives|articulos|posesivos|demostrativos", "determinantes"], ["numbers|quantifiers|numeros|cuantificadores", "cuantificadores"],
    ["questions|comparisons|comparatives|preguntas|comparaciones|comparativos", "preguntas-comparar"], ["periphrasis|verb phrases|perifrasis", "perifrasis"], ["haber|gerund|participle|gerundio|participio", "haber-perifrasis"], ["tener hacer dar echar|tener|hacer|dar|echar", "tener-hacer-dar-echar"]];
  const PV_GCAT = [["nouns|sustantivos", "sustantivos"], ["pronouns|pronombres", "pronombres"], ["adjectives|adjetivos", "adjetivos"], ["adverbs|adverbios", "adverbios"], ["articles|articulos", "articulos"], ["prepositions|preposiciones", "preposiciones"],
    ["conjunctions|conjunciones", "conjunciones"], ["interjections|interjecciones", "interjecciones"], ["determiners|determinantes", "determinantes"], ["numbers|numerales", "numerales"], ["connectors|conectores", "conectores"], ["reflexive verbs|verbos reflexivos", "reflexivos"]];
  const PV_PAPER = [["reading|lectura|comprension de lectura", "lectura"], ["listening|auditiva|comprension auditiva", "auditiva"], ["writing|escritura|expresion escrita", "escritura"], ["speaking|oral|expresion oral|la oral", "oral"]];
  const PV_ORD = { first: 0, 1: 0, "1st": 0, a: 0, one: 0, primera: 0, primero: 0, uno: 0, second: 1, 2: 1, "2nd": 1, b: 1, be: 1, two: 1, segunda: 1, segundo: 1, dos: 1, third: 2, 3: 2, "3rd": 2, c: 2, ce: 2, three: 2, tercera: 2, tercero: 2, tres: 2, fourth: 3, 4: 3, "4th": 3, d: 3, de: 3, four: 3, cuarta: 3, cuarto: 3, cuatro: 3, last: -1, ultima: -1, ultimo: -1 };
  const PV_TPL = { OPEN: "(?:(?:(?:lets |let us |let me |can we |i want to |i wanna |quiero )?(?:go(?: back)? to|see|ir a|ver)|llevame al|ve al|vamos al|ir al|open|show(?: me)?|take me to|bring up|switch to|load|see|view|abre(?:me)?|abrir|muestra(?:me)?|ensena(?:me)?|ve a|ir a|vamos a|vete a|llevame a|quiero ver|pon)\\s+)?(?:(?:the|my|el|la|los|las|mi|mis)\\s+)?(?:(?:section of|page of|seccion de|pagina de|apartado de)\\s+(?:the |los |las |el |la )?)?",
    LV: "a1|a2|b1|b2|c1|c2", ORD: Object.keys(PV_ORD).join("|"), TOPIC: PV_TOPIC.map((x) => x[0]).join("|"), GCAT: PV_GCAT.map((x) => x[0]).join("|"), PAPER: PV_PAPER.map((x) => x[0]).join("|") };
  const PV_SUFFIX = "(?: (?:section|page|tab|screen|area|part|seccion|pagina|pestana|apartado))?";
  PVR.actions.forEach((a) => { a.re = a.match.map((p) => { if (/^\^\{OPEN\}/.test(p) && /\)\$$/.test(p)) p = p.slice(0, -1) + PV_SUFFIX + "$"; try { return new RegExp(p.replace(/\{(OPEN|LV|ORD|TOPIC|GCAT|PAPER)\}/g, (m, k) => PV_TPL[k])); } catch (e) { pvLog("bad pattern " + a.id); return /$^/; } }); });
  const pvFind = (s, table) => { for (const [re, id] of table) if (new RegExp("\\b(" + re + ")\\b").test(s)) return id; return null; };
  const pvLv = (s) => (s.match(/\b(a1|a2|b1|b2|c1|c2)\b/) || [])[1] || null;
  const pvN = (s) => { const m = s.match(/\b(\d{1,2})\b/); return m ? +m[1] : null; };
  const pvOrd = (s) => { const w = s.split(" ").reverse().find((x) => x in PV_ORD) || (s.match(/\b(first|second|third|fourth|last|primera|primero|segunda|segundo|tercera|tercero|cuarta|cuarto|ultima|ultimo)\b/) || [])[1]; return w == null ? null : PV_ORD[w]; };

  // ---------- context: what is on screen ----------
  const pvQ = (sel) => document.querySelector(sel);
  function pvCtx() {
    const run = !!pvQ("#runner"), q = !!pvQ("#runner .pxq");
    const mc = !!pvQ('#runner [data-act="px-pick"]:not([disabled])'), txt = !!pvQ("#px-in:not([readonly])"), fb = !!pvQ('#runner [data-act="px-next"]');
    let playing = false, paused = false;
    try { if (typeof PL !== "undefined" && pvQ("#pl-play")) { if (PL.playing) playing = true; else paused = true; } } catch (e) {}
    try { if (typeof RA !== "undefined" && RA.on) { if (RA.paused) paused = true; else playing = true; } } catch (e) {}
    try { if (typeof VP !== "undefined" && VP.p && VP.p.getPlayerState && pvQ("#vplayer, .vframe, #vp")) { const st = VP.p.getPlayerState(); if (st === 1) playing = true; else if (st === 2 || st === 5) paused = true; } } catch (e) {}
    return { unit: run, runner: q, "runner-mc": mc, "runner-text": txt, "runner-fb": fb, "runner-open": mc || txt, guide: !!pvQ('[data-act="ra-start"]'), playing, paused, player: !!pvQ("#pl-rate"),
      video: typeof VP !== "undefined" && !!VP.p && !!pvQ("#vplayer, .vframe, #vp"), vdrill: !!(typeof DR !== "undefined" && DR.on),
      exam: !!pvQ('main [data-act="ex-ans"]'), qdrill: location.hash === "#drill" && !!pvQ('main [data-act^="dr-"]'),
      tutor: document.body.classList.contains("tutor-open"), drill: !!(typeof PR !== "undefined" && PR && document.body.classList.contains("tutor-open") && typeof tView !== "undefined" && tView === "practice") };
  }
  const pvWhen = (w, c) => !w || w.split("|").some((k) => c[k]);
  // a learner answering a question (lesson, Profe drill): bare Spanish words are answers unless clearly framed as a command
  const pvAnswerCtx = (c) => c["runner-text"] || c.drill;
  function pvMatch(text, c) {
    const s = pvNorm(text); if (!s || s.length > 90) return null;
    const hit = (a) => a.re.some((re) => re.test(s));
    for (const pass of [1, 2]) for (const a of PVR.actions) {
      if (a.voice !== "complete") continue;
      if (pass === 1 ? !a.when : !!a.when) continue; // actions for what's on screen win over general ones ("continue" in a lesson = next question)
      if (a.when && !pvWhen(a.when, c)) continue;
      if (/^play\./.test(a.id) && c.tutor) continue; // with Profe open, "slower" means Profe's voice
      if (hit(a)) return { a, s };
    }
    // the first word lost after the wake beep (S24 log): «me to flash cards» = «take me to flashcards»
    if (/^(me )?to (the |my )?\S/.test(s) && !/^take /.test(s)) { const m2 = pvMatch("take me to " + s.replace(/^(me )?to /, ""), c); if (m2) { pvLog("start cut off; read as «take me to " + s.replace(/^(me )?to /, "") + "»"); return m2; } }
    // an instruction with small extra words ("of", "a", "the") said in passing: try once without them
    if (!pvMatch.loose && /^(open|take me to|go to|show( me)?|abre|llevame( al| a)?|ve a|ir a)\b/.test(s) && s.split(" ").length >= 3) { const s3 = s.replace(/\b(a|an|of|the|my|el|la|los|las|de|del|mi|mis)\b/g, " ").replace(/\s+/g, " ").trim();
      if (s3 !== s) { pvMatch.loose = 1; let m3 = null; try { m3 = pvMatch(s3, c); } finally { pvMatch.loose = 0; } if (m3) { pvLog("read without small words as «" + s3 + "»"); return m3; } } }
    return null;
  }

  // ---------- doing: the app's own routes and buttons, then a check of what happened ----------
  const PV = { pend: null, clar: null, last: null, skip: 0 };
  const pvWait = (ms) => new Promise((r) => setTimeout(r, ms));
  async function pvUntil(fn, ms) { const t0 = Date.now(); while (Date.now() - t0 < (ms || 1500)) { try { if (fn()) return true; } catch (e) {} await pvWait(40); } try { return !!fn(); } catch (e) { return false; } }
  function pvCloseProfe() { if (document.body.classList.contains("tutor-open")) { const c = pvQ('#tutor [data-act="t-close"]'); if (c) c.click(); } }
  function pvClick(act, data) { // the same handler a tap uses
    let b = pvQ('[data-act="' + act + '"]' + (data ? Object.keys(data).map((k) => '[data-' + k + '="' + data[k] + '"]').join("") : ""));
    if (b && !b.disabled) { b.click(); return true; }
    if (/^(ex-reset|px-restart)$/.test(act)) { b = document.createElement("button"); b.dataset.act = act; Object.assign(b.dataset, data || {}); b.hidden = true; document.body.appendChild(b); b.click(); b.remove(); return true; }
    return false;
  }
  const PV_RT = { n: 0 }; addEventListener("hashchange", () => setTimeout(() => { PV_RT.n++; }, 0)); // counts page renders (after the app's own hashchange handler)
  async function pvGo(h, label) {
    if (location.hash.slice(1) === h) return { ok: true, say: "You're already in " + label + "." };
    pvMark();
    pvCloseProfe(); const n0 = PV_RT.n; location.hash = h;
    // wait for the app to actually render the new page (the old page's content must not count as success)
    const ok = await pvUntil(() => location.hash.slice(1) === h && PV_RT.n > n0 && app.children.length && !/^\s*Loading/.test(app.textContent), 3000);
    return ok ? { ok: true, say: "Here's " + label + "." } : { ok: false, say: "I couldn't open " + label + "." };
  }
  const pvLvName = (lv) => lv.toUpperCase();
  const pvUnitLabel = (lv, i) => { const L = LV[lv], u = L && L.units[i]; return u ? pvLvName(lv) + ", unit " + (i + 1) + ": " + u.t : pvLvName(lv) + " unit " + (i + 1); };
  function pvNext() { const last = S.last && LV[S.last.l] ? S.last : null; if (!last) { const lv = curLevel(); return { lv, i: 0 }; }
    const L = LV[last.l]; if (last.i + 1 < L.units.length) return { lv: last.l, i: last.i + 1 };
    const ks = ["a1", "a2", "b1", "b2", "c1", "c2"], k = ks.indexOf(last.l); return k >= 0 && k < 5 && LV[ks[k + 1]] ? { lv: ks[k + 1], i: 0 } : { lv: last.l, i: last.i }; }
  const pvHere = () => { const m = location.hash.slice(1).match(/^(a1|a2|b1|b2|c1|c2)(-u(\d+))?/); return m ? m[1] : null; };
  const pvQText = () => { const q = pvQ("#runner .pxq"); return q ? q.textContent.replace(/_{2,}|…{1,}/g, " … ").replace(/\s+/g, " ").trim() : ""; };
  function pvOpts() { return [...document.querySelectorAll('#runner [data-act="px-pick"]')].map((b) => b.textContent.trim()); }
  function pvFeedback() { const k = PX.order[PX.i], r = PX.res[k], it = PX.items[k]; if (!r) return ""; const ans = it.t === "mc" ? it.opts[it.c] : it.a[0];
    return r.ok ? pvPick(["Correct!", "¡Muy bien!", "That's right.", "¡Perfecto!"]) : r.cls === "near" ? "Almost: «" + ans + "»." : "Not quite. The answer is «" + ans + "»."; }
  const pvPick = (a) => a[Math.floor(Math.random() * a.length)];
  async function pvAskProfe(prompt) { PV.skip = 1; tOpen(prompt); return { ok: await pvUntil(() => document.body.classList.contains("tutor-open"), 800), say: "", quiet: 1 }; }
  function pvRef() { // "that" / "this": Profe's last reply, else the question on screen, else the page
    const last = tCur && [...tCur.msgs].reverse().find((m) => m.r === "a" && m.c && !m.pending);
    if (document.body.classList.contains("tutor-open") && last) return { kind: "reply", text: taskStrip(last.c).slice(0, 600) };
    const q = pvQText(); if (q) return { kind: "question", text: q + (pvOpts().length ? " Options: " + pvOpts().join(" / ") : "") };
    if (last && Date.now() - (last.t || 0) < 5 * 60000) return { kind: "reply", text: taskStrip(last.c).slice(0, 600) };
    return { kind: "page", text: pageCtx().label };
  }
  const PVH = {
    "nav.home": () => pvGo("inicio", "the home screen"), "nav.course": () => pvGo("curso", "the course"),
    "nav.level": (s) => pvGo(pvLv(s), "level " + pvLvName(pvLv(s))),
    "nav.unit": (s) => { const lv = pvLv(s) || pvHere() || curLevel(), L = LV[lv], n = pvN(s); if (!L || !n) return { ok: false, say: "Which unit?" }; if (n > L.units.length) return { ok: false, say: pvLvName(lv) + " has " + L.units.length + " units." }; return pvGo(lv + "-u" + n, pvUnitLabel(lv, n - 1)); },
    "lesson.continue": () => { const last = S.last && LV[S.last.l] ? S.last : null; if (!last) return { ok: false, say: "You haven't started a lesson yet. Say “start my next lesson” to begin " + pvLvName(curLevel()) + "." }; return pvGo(last.l + "-u" + (last.i + 1), pvUnitLabel(last.l, last.i)); },
    "lesson.next": () => { const n = pvNext(); return pvGo(n.lv + "-u" + (n.i + 1), pvUnitLabel(n.lv, n.i)); },
    "lesson.quiz": async () => {
      if (!pvQ("#runner")) { const last = S.last && LV[S.last.l] ? S.last : pvNext(); const lv = last.l || last.lv; const r = await pvGo(lv + "-u" + (last.i + 1), pvUnitLabel(lv, last.i)); if (!r.ok) return r; await pvWait(150); }
      if (!pvQ("#runner .pxq")) { if (!pvClick("px-go") && !pvClick("px-restart")) return { ok: false, say: "There are no practice questions here." }; }
      const ok = await pvUntil(() => pvQ("#runner .pxq"), 1500); if (!ok) return { ok: false, say: "The questions didn't open." };
      pvQ("#runner").scrollIntoView({ block: "start" }); if (HF.on) HF.lesson = true;
      return { ok: true, say: HF.on ? "" : "Here are the questions.", lesson: HF.on };
    },
    "lesson.read": async () => { if (!pvClick("ra-start")) return { ok: false, say: "There's nothing to read aloud here." }; return { ok: await pvUntil(() => typeof RA !== "undefined" && RA.on, 1500), say: "", quiet: 1 }; },
    "nav.practice": () => pvGo("practicar", "Practice"), "nav.listen": () => pvGo("escuchar", "Listening"), "nav.read": () => pvGo("leer", "Reading"), "nav.write": () => pvGo("escritura", "Writing"),
    "nav.verbs": () => pvGo("verbos", "the verbs"), "nav.grammar": () => pvGo("gramatica", "Grammar"),
    "nav.gcat": (s) => { const c = pvFind(s, PV_GCAT); if (!c) return { ok: false, say: "Which part of speech?" }; return c === "reflexivos" ? pvGo("verbos-reflexivos", "reflexive verbs") : pvGo("g-" + c, (GCAT.find((x) => x.id === c) || { en: c }).en); },
    "nav.guides": () => pvGo("guias", "the guides"),
    "nav.guide": (s) => { const t = pvFind(s, PV_TOPIC); if (!t) return { ok: false, say: "Which topic?" }; return pvGo("guia-" + t, "the guide: " + (GUIDES.find((g) => g.id === t) || { en: t }).en); },
    "practise.topic": async (s) => { const t = pvFind(s, PV_TOPIC); if (!t) return { ok: false, say: "Which topic would you like to practise?" }; const g = GUIDES.find((x) => x.id === t), r = await pvGo("guia-" + t, "the guide: " + (g ? g.en : t)); if (!r.ok) return r;
      return pvAskProfe("Let's practise " + (g ? g.en : t) + ". Give me one short exercise at my level, then wait for my answer and correct it."); },
    "practise.convo": async () => { tOpen(); tView = "practice"; tRender(); return { ok: await pvUntil(() => document.body.classList.contains("tutor-open"), 800), say: "Pick a role-play, or just start talking in Spanish." }; },
    "nav.words": () => pvGo("palabras", "the word lists"),
    "nav.vocab": (s) => { const lv = pvLv(s) || pvHere() || curLevel(); return pvGo(lv + "-vocab", "the " + pvLvName(lv) + " vocabulary"); },
    "nav.cards": (s) => { const lv = pvLv(s) || pvHere() || curLevel(); return pvGo(lv + "-cards", "the " + pvLvName(lv) + " flashcards"); },
    "nav.review": () => pvGo("repaso", "Review"), "nav.mistakes": () => pvGo("errores", "your mistakes"), "nav.progress": () => pvGo("progreso", "your progress"), "nav.settings": () => pvGo("ajustes", "Settings"),
    "nav.exams": () => pvGo("examenes", "the full exams"),
    "nav.exam": (s) => { const here = /^#(a1|a2|b1|b2|c1|c2)-examen-(\d+)/.exec(location.hash) || [], lv = pvLv(s) || here[1] || "a1", n = pvN(s) || (here[2] ? +here[2] : 0), paper = pvFind(s, PV_PAPER); if (!n) return { ok: false, say: "Which exam number?" }; if ((typeof EXREADY !== "undefined" ? EXREADY[lv] || 0 : 0) < n) return { ok: false, say: "DELE " + pvLvName(lv) + " has " + ((typeof EXREADY !== "undefined" && EXREADY[lv]) || 0) + " exams ready." };
      return pvGo(lv + "-examen-" + n + (paper ? "-" + paper : ""), "DELE " + pvLvName(lv) + " exam " + n + (paper ? ", " + { lectura: "reading", auditiva: "listening", escritura: "writing", oral: "speaking" }[paper] : "")); },
    "exam.reset": async (s) => { const n = pvN(s), k = "a1-" + n; if (!n) return { ok: false, say: "Which exam?" }; if (!(S.ex && S.ex[k])) return { ok: false, say: "Exam " + n + " has no results to clear." };
      pvClick("ex-reset", { k }); return (await pvUntil(() => !(S.ex && S.ex[k]), 800)) ? { ok: true, say: "Cleared the results of exam " + n + "." } : { ok: false, say: "I couldn't clear them." }; },
    "nav.videos": () => pvGo("videos", "Videos"), "nav.placement": () => pvGo("nivel", "the placement test"), "nav.library": () => pvGo("biblioteca", "the library"), "nav.resources": () => pvGo("recursos", "Resources"),
    "nav.back": async () => { const h0 = location.hash; pvCloseProfe(); history.back(); const ok = await pvUntil(() => location.hash !== h0, 900); return ok ? { ok: true, say: "Back." } : { ok: false, say: "There's nowhere to go back to." }; },
    "q.pick": async (s) => { const n = pvOpts().length, o = pvOrd(s); if (o == null || !n) return { ok: false, say: "Which answer?" }; const i = o < 0 ? n - 1 : o; if (i >= n) return { ok: false, say: "There are only " + n + " options." };
      pvClick("px-pick", { o: i }); const ok = await pvUntil(() => pvQ('#runner [data-act="px-next"]'), 800); return ok ? { ok: true, say: pvFeedback(), fb: 1 } : { ok: false, say: "That answer didn't register." }; },
    "q.check": async () => { const i = pvQ("#px-in"); if (!i || !i.value.trim()) return { ok: false, say: "Say or type your answer first." }; pvClick("px-submit"); const ok = await pvUntil(() => pvQ('#runner [data-act="px-next"]'), 800); return ok ? { ok: true, say: pvFeedback(), fb: 1 } : { ok: false, say: "I couldn't check it." }; },
    "q.next": async () => { const i0 = PX.i; pvClick("px-next"); const ok = await pvUntil(() => PX.i !== i0 || PX.phase === "end", 800); return ok ? { ok: true, say: PX.phase === "end" ? pvScore() : "", next: 1 } : { ok: false, say: "There's no next question yet: answer this one first, or say skip." }; },
    "q.prev": async () => { const i0 = PX.i; if (!pvClick("px-prev")) return { ok: false, say: "This is the first question." }; const ok = await pvUntil(() => PX.i !== i0, 800); return { ok, say: ok ? "" : "I couldn't go back.", next: 1 }; },
    "q.skip": async () => { const i0 = PX.i; if (!pvClick("px-skip")) return { ok: false, say: "You can't skip this one." }; const ok = await pvUntil(() => PX.i !== i0 || PX.phase === "end", 800); return { ok, say: ok ? (PX.phase === "end" ? pvScore() : "Skipped.") : "I couldn't skip it.", next: 1 }; },
    "q.show": async () => { if (!pvClick("px-dunno")) return { ok: false, say: "There's no answer to show." }; const ok = await pvUntil(() => pvQ('#runner [data-act="px-next"]'), 800); return ok ? { ok: true, say: pvFeedback().replace(/^Not quite\. /, ""), fb: 1 } : { ok: false, say: "I couldn't show it." }; },
    "q.repeat": () => (HF.on ? (hfLessonStep(""), { ok: true, quiet: 1, say: "" }) : { ok: true, say: pvQuestionSpeech() }),
    "q.restart": async () => { if (!pvQ("#runner")) return { ok: false, say: "There's nothing to restart here." }; pvClick("px-restart"); const ok = await pvUntil(() => pvQ("#runner .pxq") && PX.i === 0, 1000); return { ok, say: ok ? "Starting again from question 1." : "I couldn't restart.", next: 1 }; },
    "play.pause": async () => { const c = pvCtx(); if (!c.playing) return { ok: false, say: "Nothing is playing." };
      try { if (typeof RA !== "undefined" && RA.on && !RA.paused) pvClick("ra-pp"); else if (typeof PL !== "undefined" && PL.playing) pvClick("l-play"); else if (typeof vpPause === "function") vpPause(); } catch (e) {}
      const ok = await pvUntil(() => !pvCtx().playing, 800); return { ok, say: ok ? "" : "I couldn't pause it.", quiet: ok }; },
    "play.resume": async () => { const c = pvCtx(); if (!c.paused) return { ok: false, say: c.playing ? "It's already playing." : "There's nothing to resume." };
      try { if (typeof RA !== "undefined" && RA.on && RA.paused) pvClick("ra-pp"); else if (pvQ("#pl-play") && !(typeof PL !== "undefined" && PL.playing)) pvClick("l-play"); else if (typeof vpPlay === "function") vpPlay(); } catch (e) {}
      const ok = await pvUntil(() => pvCtx().playing, 1000); return { ok, say: ok ? "" : "I couldn't resume it.", quiet: ok }; },
    "play.faster": () => pvRate(1), "play.slower": () => pvRate(-1),
    "play.english": async () => { const b = pvQ("#l-en"); if (!b) return { ok: false, say: "There are no English lines here." }; const v0 = b.getAttribute("aria-pressed"); b.click(); const ok = await pvUntil(() => pvQ("#l-en") && pvQ("#l-en").getAttribute("aria-pressed") !== v0, 600); return { ok, say: ok ? (pvQ("#l-en").getAttribute("aria-pressed") === "true" ? "English lines on." : "English lines off.") : "I couldn't change that." }; },
    "profe.explain": () => { const r = pvRef(); return pvAskProfe(r.kind === "reply" ? "Explain your last message in English, simply: \"" + r.text + "\"" : r.kind === "question" ? "Explain this question in English and how to work out the answer (don't just give it away): " + r.text : "Explain in English what I'm looking at and what to do here: " + r.text); },
    "profe.translate": () => { const r = pvRef(); return pvAskProfe("Translate into English: \"" + r.text + "\""); },
    "profe.example": () => { const r = pvRef(); return pvAskProfe("Give me another example, in Spanish with the English, of the point in: \"" + r.text + "\""); },
    "profe.repeat": (s) => { if (tCur && localTurn(s.match(/despacio|lento|slow/) ? "más despacio" : "repite")) return { ok: true, say: "", quiet: 1 }; return { ok: false, say: "There's nothing to repeat yet." }; },
    "profe.open": async () => { tOpen(); return { ok: await pvUntil(() => document.body.classList.contains("tutor-open"), 600), say: "", quiet: 1 }; },
    "profe.close": async () => { pvCloseProfe(); return { ok: await pvUntil(() => !document.body.classList.contains("tutor-open"), 600), say: "", quiet: 1 }; },
    "profe.new": async () => { tOpen(); await pvWait(50); if (!pvClick("t-new")) return { ok: false, say: "I couldn't start a new chat." }; return { ok: true, say: "New chat. ¿De qué quieres hablar?" }; },
    "meta.here": () => { let w = ""; try { w = pvPageIntro(null, 1); } catch (e) {} return { ok: true, say: (w ? w + " " : "") + pvHelpHere(), keep: 1 }; },
    "meta.can": () => ({ ok: true, say: pvHelpAll(), keep: 1 }),
    "hf.stop": () => { hfQuiet(); return { ok: true, say: "", quiet: 1, end: 1 }; },
    "hf.on": () => { hfEnable(true); return { ok: HF.on, say: HF.on ? hfOnText() : "Hands-free isn't available here." }; },
    "hf.off": () => { hfEnable(false); return { ok: !HF.on, say: "Hands-free is off." }; },
    "hf.pause": () => { hfPause(true); return { ok: HF.paused, say: "Paused. Tap the Profe pill to listen again." }; },
  };
  async function pvRate(d) { const sel = pvQ("#pl-rate"); if (!sel) return { ok: false, say: "There's no reading speed here." }; const i0 = sel.selectedIndex, i = Math.max(0, Math.min(sel.options.length - 1, i0 + d)); if (i === i0) return { ok: false, say: d > 0 ? "That's the fastest." : "That's the slowest." };
    sel.selectedIndex = i; sel.dispatchEvent(new Event("change", { bubbles: true })); return { ok: true, say: "Speed " + sel.options[i].textContent.trim() + "." }; }
  function pvScore() { const n = PX.items.length, ok = PX.order.filter((k) => PX.res[k] && PX.res[k].ok).length; return "That's the end: " + ok + " out of " + n + " correct. Say “show my progress”, “next lesson”, or “start the questions again”."; }
  const PV_EN = /\b(the|which|what|choose|write|asking|in|is|are|you|your|my|name|i|and|with|to|of|for|translate|correct|sentence|friends?)\b/i;
  function pvSegs(text) { // split on «…» (always Spanish); elsewhere decide by the words
    return String(text).split(/(«[^»]*»)/).map((x) => x.trim()).filter(Boolean).map((x) => /^«/.test(x) ? [x.slice(1, -1), true] : [x, isSpanish(x) || !PV_EN.test(x)]); }
  function pvQuestionSegs() { if (!pvQ("#runner .pxq")) return [["There's no question on screen.", false]];
    const k = PX.order[PX.i], it = PX.items[k], q = pvQText(), opts = pvOpts(), segs = [["Question " + (PX.i + 1) + ".", false]];
    if (it.t === "tr") segs.push([q, false], ["Say it in Spanish.", false]); else pvSegs(q).forEach((x) => segs.push(x));
    opts.forEach((o, i) => segs.push(["ABCD"[i] + ".", false], [o, !PV_EN.test(o) || isSpanish(o)]));
    if (!opts.length && it.t !== "tr") segs.push([it.t === "fix" ? "Say the correct sentence." : "Say your answer.", false]);
    return segs.map(([t, es]) => [t.replace(/_{2,}/g, "…"), es]); }
  function pvQuestionSpeech() { if (!pvQ("#runner .pxq")) return "There's no question on screen.";
    const opts = pvOpts(), head = "Question " + (PX.i + 1) + ". ";
    return head + "«" + pvQText().replace(/[«»]/g, "") + "»" + (opts.length ? " " + opts.map((o, i) => "ABCD"[i] + ": «" + o.replace(/[«»]/g, "") + "».").join(" ") : " Say your answer.") ; }
  function pvHelpHere() { const c = pvCtx(), here = PVR.actions.filter((a) => a.voice === "complete" && a.when && pvWhen(a.when, c)).map((a) => "“" + a.en[0] + "”");
    const gen = ["open my lessons", "continue where I left off", "practise the past tense", "show my progress", "what can you do"].map((x) => "“" + x + "”");
    return (here.length ? "Here you can say " + here.slice(0, 6).join(", ") + ". " : "") + "Anywhere: " + gen.join(", ") + "."; }
  function pvHelpAll() { const by = {}; PVR.actions.filter((a) => a.voice === "complete").forEach((a) => (by[a.feature] = by[a.feature] || []).push(a.en[0]));
    return "I can open any part of the app, run your lessons and questions, control reading and videos, and teach and practise with you. For example: " + ["open my lessons", "start my next lesson", "quiz me on this lesson", "select the second answer", "practise ser and estar", "explain that in English", "open exam 3 speaking", "pause", "show my progress"].map((x) => "“" + x + "”").join(", ") + ". Ask “what can I do here?” on any screen."; }

  // ---------- routing a sentence: confirmations, clarifications, duplicates ----------
  const PV_YES = /^(yes|yeah|yep|sure|ok|okay|do it|confirm|go ahead|si|vale|claro|hazlo|confirmo|adelante|de acuerdo|dale)$/, PV_NO = /^(no|nope|cancel|dont|no gracias|cancela|mejor no|olvidalo)$/;
  const pvSpanishish = (raw) => /[ñáéíóú¿¡]/i.test(raw) || /^(volver|vuelve|regresa|atras|siguiente|anterior|salta|pasa|para|nada|gracias|espera|pausa|repite|continua|sigue|listo|alto)$/i.test(pvNorm(raw));
  // returns true when the sentence was a command (handled here); false → it's for Profe as conversation or an answer
  function pvRoute(raw, origin) {
    const c = pvCtx(), s = pvNorm(raw), now = Date.now();
    if (PV.pend && now < PV.pend.until) { const p = PV.pend; if (PV_YES.test(s)) { PV.pend = null; pvExec(p.a, p.s, origin, true); return true; } if (PV_NO.test(s)) { PV.pend = null; pvReply("Okay, I won't.", origin); return true; } PV.pend = null; }
    if (PV.clar && now < PV.clar.until) { const q = PV.clar; PV.clar = null;
      if (/^(answer|my answer|its my answer|respuesta|es mi respuesta|mi respuesta|la respuesta)$/.test(s)) { pvAnswer(q.raw, origin); return true; }
      if (PV_YES.test(s) || q.a.re.some((re) => re.test(s)) || /^(command|go back|do it|comando)$/.test(s)) { pvExec(q.a, q.s, origin); return true; } }
    if (PV.choice && now < PV.choice.until) { const r = pvChoose(raw, s, c, origin); if (r) return true; }
    if (PV.need && now < PV.need.until && !pvMatch(raw, c)) { const n = PV.need; PV.need = null; pvExec(PVR.actions.find((a) => a.id === n.id), n.prefix + " " + s, origin); return true; }
    const m = pvMatch(raw, c);
    if (!m && (c.exam || c.qdrill) && pvAnswerX(raw, s, c, origin)) return true; // an answer said on an exam paper or in the quick drill
    if (!m && (s.length > 120 || /\n/.test(raw))) return false; /* a long message or a prepared prompt (Ask Profe about a video) is for Profe, not a command */
    if (!m) return pvSeqTry(raw, origin) || pvResolve(raw, s, c, origin);
    const engaged = origin === "hf" || (HF.on && HF.engaged);
    // a practice task is running in the chat: "let's stop here" goes to Profe, which closes the task with a short summary (sC C4)
    if (origin !== "hf" && /^(session\.end|hf\.stop)$/.test(m.a.id) && typeof tCur !== "undefined" && tCur && tCur.task && !tCur.task.done && !tCur.task.stop && document.body.classList.contains("tutor-open")) return false;
    if (origin !== "hf" && m.a.id === "hf.stop" && !engaged && !(typeof listening !== "undefined" && listening) && !hfSpeaking() && !DR.on) return false; // "gracias" in a chat is just thanks
    // command or answer? a bare Spanish word while a question waits for an answer is the answer, or we ask
    if (m.a.bare && pvAnswerCtx(c) && pvSpanishish(raw) && !/^q\.(check|show|skip)$/.test(m.a.id) && m.s.split(" ").length <= 2) {
      if (c.drill && !engaged) return false;
      PV.clar = { a: m.a, s: m.s, raw, until: now + 20000 };
      pvReply("Is «" + raw.trim() + "» your answer, or should I " + m.a.purpose.toLowerCase().replace(/ \(.*\)$/, "") + "? Say “answer” or “" + m.a.en[0] + "”.", origin, { listen: 1 }); return true;
    }
    // a chat in Spanish: one-word nav ("volver") in a conversation is conversation unless hands-free is engaged
    if (origin !== "hf" && !engaged && m.a.bare && !m.a.when && pvSpanishish(raw) && document.body.classList.contains("tutor-open") && tCur && tCur.msgs.length > 1) return false;
    const key = m.a.id + "|" + m.s; if (PV.last && PV.last.key === key && now - PV.last.t < 700) return true; // the same recognition event delivered twice
    PV.last = { key, t: now };
    if (m.a.confirm) { PV.pend = { a: m.a, s: m.s, until: now + 20000 }; pvReply(pvConfirmText(m.a, m.s) + " Say yes to confirm.", origin, { listen: 1 }); return true; }
    pvExec(m.a, m.s, origin); return true;
  }
  const pvConfirmText = (a, s) => a.id === "exam.reset" ? "Clear the results of exam " + pvN(s) + "?" : a.id === "q.restart" ? "Start these questions again from the beginning?" : a.purpose + "?";
  // ---------- arriving on a page in hands-free: say where you are and what you can say there ----------
  const PV_LVN = (l) => (l || "").toUpperCase();
  const PV_PAGES = [
    [/^(hoy|inicio)?$/, () => "the Home page", ["continue where I left off", "review my flashcards", "play a song"]],
    [/^curso$/, () => "the Course page", ["open A1", "open B1", "find my level"]],
    [/^(a1|a2|b1|b2|c1|c2)$/, (m) => "the " + PV_LVN(m[1]) + " level page", ["open unit 1", "open the flashcards", "open the exams"]],
    [/^(a1|a2|b1|b2|c1|c2|esc)-u(\d+)$/, (m) => "unit " + m[2] + (pvUnitT(m[1], +m[2]) ? ", " + pvUnitT(m[1], +m[2]) : ""), ["start the practice", "read the lesson to me", "next unit"]],
    [/^(a1|a2|b1|b2|c1|c2)-examenes$/, (m) => "the DELE " + PV_LVN(m[1]) + " exams list", ["open exam 1", "open exam 2", "go back"]],
    [/^(a1|a2|b1|b2|c1|c2)-examen-(\d+)(-([a-z]+))?$/, (m) => "DELE " + PV_LVN(m[1]) + " exam " + m[2] + (m[4] ? ", " + ({ lectura: "reading", auditiva: "listening", escritura: "writing", oral: "speaking" }[m[4]] || m[4]) + " paper" : ""), (m) => m[4] ? (pvCtx().exam ? ["question 1, b", "next question", "submit the paper"] : ["start", "practise without a timer", "go back"]) : ["start the reading paper", "start the listening paper", "go back"]],
    [/^examenes$/, () => "the Exams page", ["open A1 exam 1", "open B1 exam 1", "go home"]],
    [/^drill$/, () => "the quick drill", ["check", "skip", "go back"]],
    [/^practicar$/, () => "the Practice page", ["quiz me on the words I got wrong", "review my flashcards", "show my mistakes"]],
    [/^repaso$/, () => "your flashcards", ["show my mistakes", "flashcards for this level", "go home"]],
    [/^errores$/, () => "your mistakes", ["review my mistakes", "review my flashcards", "go home"]],
    [/^biblioteca$/, () => "the Library", ["play a song", "open videos", "open the stories"]],
    [/^escuchar$/, () => "the Listening page", ["play a song", "play a podcast", "open the stories"]],
    [/^leer$/, () => "the Reading page", ["open the stories", "open listening", "go back"]],
    [/^escritura$/, () => "the Writing tasks", ["open the exams", "go back"]],
    [/^escritura-.+$/, () => "a writing task", ["read the task", "check my writing", "go back"]],
    [/^videos$/, () => "the Videos page", ["play a video", "go back"]],
    [/^video-.+$/, () => "the video page", ["pause", "repeat that", "captions in English"]],
    [/^verbos$/, () => "the Verb dictionary", ["open the verb comer", "reflexive verbs", "go back"]],
    [/^verbo-\d+$/, () => "a verb page", ["conjugate it in the past", "open the verb tener", "go back"]],
    [/^palabras$/, () => "the word list", ["open the word casa", "flashcards for this level", "go back"]],
    [/^palabra-.+$/, () => "a dictionary word", ["say it", "open the word perro", "go back"]],
    [/^gramatica$/, () => "the Grammar map", ["open the verbs", "open the grammar guides", "go back"]],
    [/^guias$/, () => "the Grammar guides", ["open ser and estar", "open por and para", "go back"]],
    [/^guia-.+$/, () => "a grammar guide", ["start the practice", "explain this page", "go back"]],
    [/^nivel$/, () => "the placement test", ["start", "go back"]],
    [/^progreso$/, () => "your progress", ["continue my lesson", "go home"]],
    [/^recursos$/, () => "Resources", ["go home"]],
    [/^ajustes$/, () => "Settings", ["turn off hands-free", "go home"]],
    [/^costes$/, () => "the service costs dashboard", ["go back", "go home"]],
  ];
  function pvUnitT(lv, n) { try { const u = LV[lv].units[n - 1]; return u ? u.t : ""; } catch (e) { return ""; } }
  function pvPageIntro(h, nameOnly) {
    h = (h == null ? location.hash : h).replace(/^#/, "");
    let name = "", says = null;
    for (const [re, nm, sy] of PV_PAGES) { const m = re.exec(h); if (m) { name = nm(m); says = typeof sy === "function" ? sy(m) : sy; break; } }
    if (!name) { try { const L = typeof LI !== "undefined" && LI[h]; if (L) { name = "«" + L.t + "»"; says = ["read it to me", "play it", "go back"]; } } catch (e) {} }
    if (!name) { const c = typeof pageCtx === "function" ? pageCtx() : null; if (!c || !c.label) return ""; name = c.label; says = ["explain this page", "go back"]; }
    if (nameOnly) return "You're on " + name + ".";
    PV.seen = PV.seen || {}; const key = name.replace(/\d+/g, "#"), first = !PV.seen[key]; PV.seen[key] = 1;
    if (!first) return "You're on " + name + ". What would you like to do?";
    const q = says.slice(0, 3).map((x) => "“" + x + "”"), list = q.length > 1 ? q.slice(0, -1).join(", ") + " or " + q[q.length - 1] : q[0];
    return "You're now on " + name + ". You can say " + list + ". What would you like to do?";
  }
  const PV_GENERIC = /^(ok(ay)?[,.]? )?(opening|opened|going to|taking you|here'?s|here is|here are|done|sure)\b[^.]{0,70}\.?$/i;

  async function pvExec(a, s, origin, confirmed) {
    pvLog("cmd " + a.id + " «" + (typeof s === "string" ? s : (s && s.label) || "") + "»");
    const h0 = location.hash, ch0 = PV.choice;
    const gen = PV.execGen = (PV.execGen || 0) + 1; // each request gets an id: a slow one that finishes after a newer request mustn't speak over it
    PV.running = (PV.running || 0) + 1; PV.runAt = Date.now(); // while an action is still working (opening a page, waiting for a player) the exchange isn't over
    const t0 = performance.now(); let r; try { r = await PVH[a.id](s, pvCtx()); } catch (e) { r = { ok: false, say: "Something went wrong doing that." }; pvLog("cmd error " + a.id + " " + (e && e.message)); }
    PV.running = Math.max(0, (PV.running || 1) - 1);
    r = r || { ok: false, say: "" }; if (a.route) window.__pvLat = Math.round(performance.now() - t0); pvLog("cmd " + a.id + " → " + (r.ok ? "ok" : "failed"));
    if (gen !== PV.execGen) { pvLog("cmd " + a.id + " finished after a newer request: its reply is dropped"); return; }
    window.__pvLast = { id: a.id, ok: !!r.ok, say: r.say || "" };
    pvSess(a.id, r);
    // hands-free and the page changed: confirm where you are and what you can say here (not in a lesson loop, not over a playing video)
    if (origin === "hf" && r.ok && !r.own && !r.end && !r.lesson && !r.quiet && !(PV.choice && PV.choice !== ch0) && !HF.lesson && location.hash !== h0 && !document.body.classList.contains("tutor-open")) {
      const asks = !!(r.say && (/\?\s*$/.test(r.say.trim()) || (r.say.trim().length > 50 && !PV_GENERIC.test(r.say.trim())))); /* the reply already asks or explains something: just say where you are first */ let intro = ""; try { intro = pvPageIntro(null, asks ? 1 : 0); } catch (e) {}
      if (intro && !pvCtx().playing && !/^#(video|song)-/.test(location.hash)) { /* a video or song you asked for: its own reply already says what opened, and you want to watch, not talk */ r.say = asks ? intro + " " + r.say.trim() /* the action already asks something (which video?): just say where you are first */ : (r.say && !PV_GENERIC.test(r.say.trim()) ? r.say.trim().replace(/([^.!?])$/, "$1.") + " " : "") + intro; r.quiet = false; pvLog("page intro: " + intro); }
    }
    if (r.own) return; // the action runs its own spoken loop (word list, role-play)
    if (r.end) { hfEnd(); return; }
    if (r.lesson || (HF.lesson && (r.next || r.fb))) { hfLessonStep(r.say || ""); return; }
    if (r.quiet && r.ok) { if (origin === "hf" && !document.body.classList.contains("tutor-open")) hfFollow(); return; }
    pvReply(r.say || (r.ok ? "Done." : "I couldn't do that."), origin, { listen: 1, keep: r.keep });
  }
  // the answer to a lesson question, said instead of tapped (letters/positions handled by q.pick; this is wording)
  function pvAnswer(raw, origin) {
    const c = pvCtx();
    if (c["runner-mc"]) { const opts = pvOpts(), n = pvStrip(raw).replace(/[^\p{L}\d ]/gu, "").trim(); let best = -1, bs = 0;
      opts.forEach((o, i) => { const on = pvStrip(o).replace(/[^\p{L}\d ]/gu, "").trim(); const sc = on === n ? 1 : pvSim(on, n); if (sc > bs) { bs = sc; best = i; } });
      if (best >= 0 && bs >= 0.6) { pvExec(PVR.actions.find((a) => a.id === "q.pick"), "the " + ["first", "second", "third", "fourth"][best], origin); return true; }
      pvReply("I heard «" + raw + "», which isn't one of the options. Say the letter, or the option.", origin, { listen: 1, lesson: 1 }); return true; }
    if (c["runner-text"]) { const i = pvQ("#px-in"); i.value = raw.trim(); i.dispatchEvent(new Event("input", { bubbles: true })); pvExec(PVR.actions.find((a) => a.id === "q.check"), "check", origin); return true; }
    if (c.drill || document.body.classList.contains("tutor-open")) { PV.skip = 1; tSend(raw, true); return true; }
    return false;
  }
  function pvSim(a, b) { if (!a || !b) return 0; const A = new Set(a.split(" ")), B = new Set(b.split(" ")); let i = 0; A.forEach((w) => B.has(w) && i++); const j = i / Math.max(A.size, B.size);
    let d = 0; { const m = a.length, n = b.length, D = Array.from({ length: m + 1 }, (_, x) => [x]); for (let y = 1; y <= n; y++) D[0][y] = y; for (let x = 1; x <= m; x++) for (let y = 1; y <= n; y++) D[x][y] = Math.min(D[x - 1][y] + 1, D[x][y - 1] + 1, D[x - 1][y - 1] + (a[x - 1] === b[y - 1] ? 0 : 1)); d = 1 - D[m][n] / Math.max(m, n); }
    return Math.max(j, d); }
  // replies: in the chat when typed there, spoken (and shown) when by voice
  function pvReply(text, origin, o) {
    o = o || {}; if (!text) { if (origin === "hf") hfFollow(); return; }
    if (origin === "chat" || (origin === "voice" && document.body.classList.contains("tutor-open"))) {
      if (!tCur) ensureSession(pageCtx().label, "");
      tCur.msgs.push({ r: "a", c: text, t: Date.now(), local: 1 }); tCur.updated = Date.now(); try { tPush(tCur); } catch (e) {} tRender();
      if (origin === "voice") speakMixed(text, () => { try { autoAgain(); } catch (e) {} });
      return;
    }
    try { coachToast("🎙️ " + text.replace(/[“”«»]/g, "")); } catch (e) {}
    hfSay(text, () => { if (o.lesson && HF.lesson) hfLessonListen(); else hfFollow(); });
  }
  // from Profe's chat (typed or the mic in the panel): commands are carried out, the rest goes to Profe as before
  function pvTry(text, byVoice) {
    if (PV.skip) { PV.skip = 0; return false; }
    try { return pvRoute(text, byVoice ? "voice" : "chat"); } catch (e) { pvLog("route error " + (e && e.message)); return false; }
  }

  // ---------- hands-free ----------
  const HF = { on: false, paused: false, mode: null, eng: "off", engaged: false, rec: null, lastWake: 0, lesson: false, note: "", heard: "", wt: null, settle: 0 };
  // the Android app listens for "Ok Profe": on the phone when it can; with an online recogniser only if you allowed it (Settings)
  const hfStatus = () => { try { return String(window.AndroidWake.status()); } catch (e) { return ""; } };
  const hfMode = () => { if (!window.AndroidWake) return CAN_MIC ? "tap" : null; const st = hfStatus(); HF.online = st === "online" && !!TS.hfOnline; return st === "ok" || st === "no-mic" || HF.online ? "wake" : CAN_MIC ? "tap" : null; };
  function hfSpeaking() { try { return !!(window.speechSynthesis && speechSynthesis.speaking); } catch (e) { return false; } }
  function hfBusy() { return Date.now() < (HF.hold || 0) || ((PV.running || 0) > 0 && Date.now() - (PV.runAt || 0) < 20000) || (typeof listening !== "undefined" && listening) || !!HF.rec || (typeof tBusy !== "undefined" && tBusy) || hfSpeaking() || HF.saying || !!(typeof EX !== "undefined" && EX && EX.recT != null) || !!(typeof VA !== "undefined" && VA && VA.on); }
  function hfState() { if (!HF.on) return "off"; if (HF.paused) return "paused"; if ((typeof listening !== "undefined" && listening) || HF.rec) return "listening"; if (typeof tBusy !== "undefined" && tBusy) return "thinking"; if (hfSpeaking() || HF.saying) return "speaking"; return HF.mode === "wake" ? (HF.eng === "on" ? "wake" : "starting") : "tap"; }
  const HF_LABEL = { off: "", paused: "Paused", listening: "Listening…", thinking: "Thinking…", speaking: "Speaking", wake: "Say “Ok Profe”", starting: "Say “Ok Profe”", tap: "Tap to talk" };
  function hfPaint() {
    let p = document.getElementById("hfpill");
    if (!HF.on) { if (p) p.hidden = true; return; }
    if (!p) { p = document.createElement("div"); p.id = "hfpill"; p.setAttribute("role", "status"); p.innerHTML = '<button type="button" class="hfmain" data-act="hf-tap"><span class="hfdot" aria-hidden="true"></span><span class="hft"></span></button><button type="button" class="hfx" data-act="hf-pause" aria-label="Pause hands-free">❚❚</button>'; document.body.appendChild(p); }
    const st = hfState(); p.hidden = false; p.dataset.st = st; p.querySelector(".hft").textContent = HF_LABEL[st] + (HF.note && (st === "wake" || st === "tap") ? "" : "");
    const x = p.querySelector(".hfx"); x.dataset.act = HF.paused ? "hf-toggle" : "hf-pause"; x.textContent = HF.paused ? "✕" : "❚❚"; x.setAttribute("aria-label", HF.paused ? "Turn hands-free off" : "Pause hands-free");
    p.querySelector(".hfmain").setAttribute("aria-label", st === "tap" || st === "paused" ? "Talk to Profe" : st === "speaking" ? "Interrupt Profe and talk" : "Hands-free: " + HF_LABEL[st]);
  }
  // one place decides whether the wake listener should run: on, not paused, app visible, nothing else using the mic or speaking
  function hfReconcile() {
    if (!HF.on || HF.mode !== "wake") { if (HF.eng === "on") hfWakeStop(); hfPaint(); return; }
    if (HF.engaged && !hfBusy()) { HF.idle0 = HF.idle0 || Date.now(); if (Date.now() - HF.idle0 > 4000) { HF.engaged = false; HF.idle0 = 0; pvLog("wake: exchange over, listening for “Ok Profe” again"); } } else HF.idle0 = 0;
    const want = !HF.paused && !document.hidden && !hfBusy() && !HF.engaged && Date.now() > HF.settle;
    if (hfSpeaking() || HF.saying) HF.settle = Date.now() + 400; // Profe's voice has just ended: wait before listening, so the room's echo isn't heard
    if (want && HF.eng === "on" && Date.now() - (HF.wakeEvT || Date.now()) > 180000) { pvLog("wake: no sound from the listener for 3 min, restarting it"); hfWakeStop(); HF.settle = Date.now() + 600; }
    else if (want && HF.eng === "off") hfWakeStart(); else if (!want && HF.eng === "on") hfWakeStop();
    hfPaint();
  }
  function hfWakeStart() { HF.eng = "on"; HF.heard = ""; HF.wakeEvT = HF.wakeOnT = Date.now(); try { if (HF.online && window.AndroidWake.startOnline) window.AndroidWake.startOnline(sttLang()); else window.AndroidWake.start(sttLang()); } catch (e) { HF.eng = "off"; } }
  function hfWakeStop() { HF.eng = "off"; clearTimeout(HF.wt); try { window.AndroidWake.stop(); } catch (e) {} }
  window.__awake = { ev(type, v) {
    HF.wakeEvT = Date.now();
    if (type !== "partial") pvLog("wake " + type + (v ? " " + v : ""));
    if (type === "state" && /^engine:/.test(String(v))) { HF.engine = String(v).slice(7); return; }
    if (type === "vosk") { const x = String(v); if (/^(progress|ready|error|deleted)/.test(x) && !/^error:load/.test(x)) HF.vdl = x;
      if (x === "ready") { try { coachToast("“Ok Profe” now listens offline on this phone. Say “Ok Profe” and what you want."); } catch (e) {} if (HF.on) { hfWakeStop(); HF.mode = hfMode(); hfReconcile(); } }
      pvSetRefresh(); return; }
    if (type === "model") { try { const j = JSON.parse(v); HF.model = j.state; } catch (e) {} pvModelPaint(); return; }
    if (type === "model-dl") { const x = String(v); HF.dl = x; pvLog("spanish model " + x);
      if (x === "done") { HF.model = "installed"; try { coachToast("Spanish speech recognition is downloaded. “Ok Profe”, exam recording and video captions now work on the phone, offline."); } catch (e) {} }
      else if (x === "scheduled") try { coachToast("The Spanish download is scheduled: Android will finish it (often on Wi-Fi, while charging)."); } catch (e) {}
      else if (/^error/.test(x)) try { coachToast("Android couldn't download Spanish speech recognition (" + x + "). Try again on Wi-Fi."); } catch (e) {}
      pvModelPaint(); return; }
    if (type === "state") { if (v === "no-ondevice" || v === "no-lang") { HF.mode = "tap"; HF.eng = "off"; HF.note = v; hfNotice(v); } else if (v === "no-mic") { HF.eng = "off"; hfNotice("no-mic"); } else if (v === "error") { HF.eng = "off"; HF.settle = Date.now() + 5000; } else if (v === "stopped") { HF.eng = "off"; HF.wakeStopT = Date.now(); } hfPaint(); return; }
    if (HF.eng !== "on" || hfBusy()) return; // Profe is speaking or the mic is in use: never wake on that
    const t = String(v || ""), m = t.match(PV_WAKE); if (!m) return;
    HF.heard = t.slice(m.index + m[0].length).trim(); clearTimeout(HF.wt);
    if (type === "final") hfWoke(HF.heard); else HF.wt = setTimeout(() => hfWoke(HF.heard), 1500); // keep listening while the command follows in the same breath
  } };
  function hfWoke(cmd) {
    if (Date.now() - HF.lastWake < 2500 || HF.engaged) return; // one activation, one acknowledgement
    HF.lastWake = Date.now(); HF.wokeN = (HF.wokeN || 0) + 1; hfWakeStop(); HF.engaged = true; pvLog("woke «" + cmd + "»");
    PV.choice = null; // a new "Ok Profe" is a new request: an earlier "which one?" no longer waits for an answer
    hfStopOthers();
    if (cmd && cmd.split(" ").length >= 1 && pvNorm(cmd)) { hfHandle(cmd); return; }
    // a short beep FIRST, then the mic (S24, v164: starting the beep after the mic opened silenced the recogniser, so every capture came back empty).
    // The first word lost to the beep is covered by reading «me to …» as «take me to …».
    // 150 ms also lets the wake listener release the microphone before the recogniser takes it
    const wokeT = Date.now(); hfBeep(); pvUntil(() => (HF.wakeStopT || 0) >= wokeT, 800).then(() => pvWait(120)).then(() => { if (!HF.engaged || HF.rec) return; pvLog("wake released the mic after " + ((HF.wakeStopT || wokeT) - wokeT) + " ms"); hfCapture((t) => { if (t) hfHandle(t); else hfSay("What would you like to do?", () => hfCapture((t2) => (t2 ? hfHandle(t2) : hfEnd()), { startMs: 8000 })); }, { startMs: 6000 }); });
  }
  function hfHandle(text) {
    HF.engaged = true; pvLog("heard «" + text + "»");
    // which language to listen for next: an understood command sets it; English words in anything else switch back to English
    { let ok = false; try { ok = !!pvMatch(text, pvCtx()); } catch (e) {} const en = /\b(the|my|to|me|open|go|take|play|show|can|you|please|what|select|this|on|a)\b/i.test(text), es = !en && isSpanish(text + " ");
      if (ok) HF.cmdEs = es; else if (en) HF.cmdEs = false; }
    if (HF.lesson && pvCtx().runner) { if (pvRoute(text, "hf")) return; if (pvAnswer(text, "hf")) return; }
    if (pvRoute(text, "hf")) return;
    if (/^(open|take me to|go to|show me|abre|llevame|ve a|ir a)\b/.test(pvNorm(text))) { pvReply("I heard “" + text.replace(/^\s*(ok(ay)?|oye)\s+prof(e)?\s*/i, "") + "”, but I couldn't find that screen. Try “open flashcards”, “open the verbs”, or “what can I do here”.", "hf", { listen: 1 }); return; }
    // not a command: it's for Profe (a question, Spanish practice); the panel opens and the voice chat continues hands-free
    PV.skip = 1; tOpen(); tSend(text, true);
  }
  // follow-ups: no wake phrase needed for a few seconds after Profe finishes
  function hfFollow() { if (!HF.on || HF.paused) { hfEnd(); return; } pvLog("follow-up listen"); HF.engaged = true; hfCapture((t) => (t ? hfHandle(t) : hfEnd()), { startMs: 8000 }); }
  function hfEnd() { HF.engaged = false; HF.lesson = HF.lesson && pvCtx().runner ? HF.lesson : false; hfReconcile(); }
  function hfQuiet() { HF.cut = (HF.cut || 0) + 1; try { speechCut(); } catch (e) {} SPK_GEN++; try { speechSynthesis.cancel(); } catch (e) {} HF.saying = false; try { if (typeof listening !== "undefined" && listening) stopListening(); } catch (e) {} hfAbort(); HF.lesson = false; voiceMode = false; lastVoice = false; try { uiVoice(); } catch (e) {} }
  // stop every other user of the recogniser before listening (video captions from audio, the card pronunciation check, an exam recording)
  function hfStopOthers() {
    try { if (typeof VA !== "undefined" && VA && VA.on) vaStop(); } catch (e) {}
    try { if (typeof PC !== "undefined" && PC && PC.rec) { PC.rec.abort(); PC.rec = null; } } catch (e) {}
    try { if (typeof EX !== "undefined" && EX && EX.recT != null) exHalt(); } catch (e) {}
    if (HF.eng === "on") hfWakeStop();
  }
  // one listening turn for hands-free: waits for speech, allows thinking pauses (same end-of-turn rule as Profe's mic)
  function hfCapture(done, o) {
    o = o || {}; hfAbort(); if (!CAN_MIC || !HF.on || HF.paused) { done(null); return; }
    hfStopOthers(); try { speechCut(); } catch (e) {} try { speechSynthesis.cancel(); } catch (e) {}
    const r = new SR(); HF.rec = r; r.lang = o.lesson || HF.lesson || (typeof DR !== "undefined" && DR.on) ? sttLang() : hfCmdLang(); r.interimResults = true; r.continuous = !IS_IOS;
    try { if (window.AndroidSTT && window.AndroidSTT.setBias && !(o.lesson || HF.lesson)) window.AndroidSTT.setBias(JSON.stringify(PV_BIAS)); } catch (e) {}
    let live = "", fin = "", end = false, retried = !!o.retried; const t0 = Date.now();
    const finish = (t) => { if (end) return; end = true; clearTimeout(r._q); clearTimeout(r._s); if (HF.rec === r) HF.rec = null; try { r.abort(); } catch (e) {} hfPaint();  pvLog("capture [" + r.lang + "] → " + (t ? "«" + t + "»" : "nothing" + (r._err ? " (error " + r._err + ")" : r._got ? " (heard sound, no words)" : r._ready ? " (mic open, no speech)" : " (mic never opened)"))); done(t && t.trim() ? t.trim() : null); };
    r._fin = finish;
    r.onresult = (e) => { if (end) return; let f = "", im = ""; for (let i = 0; i < e.results.length; i++) { const x = e.results[i][0].transcript; if (e.results[i].isFinal) f += x + " "; else im += x + " "; } fin = f.trim(); live = (f + im).trim();
      clearTimeout(r._s); clearTimeout(r._q); r._q = setTimeout(() => finish(live), hfWaitFor(live, fin && !im.trim(), o)); const l = document.getElementById("t-live"); if (l) { l.hidden = false; l.textContent = live; } };
    r.onaudiostart = () => { r._ready = 1; r._readyT = Date.now(); if (!live) { clearTimeout(r._s); r._s = setTimeout(() => finish(null), o.startMs || 7000); } }; r.onspeechstart = () => { r._got = 1; };
    r.onerror = (e) => { r._err = e && e.error; pvLog("capture error " + r._err); if (/not-allowed|service-not-allowed/.test(r._err)) { hfNotice("no-mic"); hfEnable(false); } };
    r.onend = () => { if (end) return; if (!live && /aborted|busy/.test(r._err || "") && !retried && Date.now() - t0 < 1500) { end = true; HF.hold = Date.now() + 1500; if (HF.rec === r) HF.rec = null; setTimeout(() => hfCapture(done, Object.assign({}, o, { retried: true })), 400); return; } finish(live || fin); };
    r._s = setTimeout(() => finish(null), (o.startMs || 7000) + 5000); // until the mic reports it's open; then the full window starts (onaudiostart)
    try { r.start(); } catch (e) { finish(null); }
    hfPaint();
  }
  // how long a pause ends the turn: a confirmed short answer or a command doesn't need the long thinking pause
  function hfWaitFor(t, isFinal, o) {
    if (isFinal) { const c = pvCtx(); if (pvMatch(t, c) || (c["runner-mc"] && pvOpts().some((x) => pvSim(pvStrip(x), pvStrip(t)) >= 0.8))) return 500; if (o && o.lesson) return 1400; }
    return Math.min(endWait(t), o && o.lesson ? 4500 : 9000);
  }
  function hfAbort() { const r = HF.rec; if (r) { HF.rec = null; try { r._fin && r._fin(null); } catch (e) {} } }
  function hfSay(text, then) { if (!HF.on && then) { const t0 = then; then = () => {}; } HF.saying = true; hfPaint(); let called = false; const cut = HF.cut || 0; const go = () => { if (called) return; called = true; HF.saying = false; HF.settle = Date.now() + 400; hfPaint(); if ((HF.cut || 0) !== cut) return; /* "stop" was said meanwhile: no follow-up listening */ then && then(); };
    try { if (canSpeak && Array.isArray(text)) { hfSaySeq(text, go); const est = 1500 + text.reduce((n, x) => n + x[0].split(/\s+/).length, 0) * 450; setTimeout(() => { if (!hfSpeaking()) go(); }, est); }
      else if (canSpeak) { window.__pvSayOK = 1; speakMixed(text, go); window.__pvSayOK = 0; setTimeout(() => { if (!hfSpeaking() && !called) { /* speech never started */ } }, 4000); const est = 1500 + text.split(/\s+/).length * 450; setTimeout(() => { if (!hfSpeaking()) go(); }, est); } else go(); } catch (e) { go(); } }
  function hfSaySeq(segs, done) { const gen = ++SPK_GEN; try { speechSynthesis.cancel(); } catch (e) {} let k = 0;
    const next = () => { if (gen !== SPK_GEN) return; if (k >= segs.length) { done(); return; } const [t, es] = segs[k++]; let u; try { u = profeUtter(t, es); } catch (e) { next(); return; } let moved = false; const go = () => { if (moved) return; moved = true; next(); }; u.onend = u.onerror = go; try { speechSynthesis.speak(u); } catch (e) { go(); } };
    next(); }
  // short (80 ms), and the audio output is released straight after, so it can't hold the audio focus while the recogniser listens
  function hfBeep() { try { const C = window.AudioContext || window.webkitAudioContext; if (!C) return; const c = hfBeep.c || (hfBeep.c = new C()); if (c.state === "suspended" && c.resume) c.resume(); const o = c.createOscillator(), g = c.createGain(); o.frequency.value = 880; g.gain.value = 0.06; o.connect(g); g.connect(c.destination); o.start(); o.stop(c.currentTime + 0.08); o.onended = () => { try { c.suspend && c.suspend(); } catch (e) {} }; } catch (e) {} }
  const hfOnText = () => HF.mode === "wake" ? "Hands-free is on. Say “Ok Profe” whenever you need me." : "Hands-free is on. Tap the Profe pill and speak; I'll keep listening for follow-ups.";
  const PV_MODEL = { installed: "downloaded", downloading: "downloading…", available: "not downloaded yet", unsupported: "not available on this phone", unknown: "unknown" };
  function pvModelPaint() { const el = document.getElementById("pv-model"); if (!el) return; const st = HF.dl && /^progress:/.test(HF.dl) ? "downloading " + HF.dl.slice(9) + "%" : HF.dl === "scheduled" ? "download scheduled" : PV_MODEL[HF.model] || "checking…"; el.textContent = st; const row = el.closest(".pvrow"); if (row) { const ok = HF.model === "installed" ? true : HF.model && HF.model !== "unsupported" && !/^progress/.test(HF.dl || "") ? false : null; row.className = "pvrow " + (ok === true ? "ok" : ok === false ? "warn" : ""); row.querySelector(".pvi").textContent = ok === true ? "✓" : ok === false ? "!" : "•"; }
    document.querySelectorAll('[data-act="pv-model-dl"]').forEach((b) => (b.hidden = HF.model === "installed" || HF.model === "unsupported")); }
  function pvModelCheck() { try { if (window.AndroidWake && window.AndroidWake.modelInfo) window.AndroidWake.modelInfo(sttLang()); } catch (e) {} }
  window.__pvModelDl = () => { try { HF.dl = "progress:0"; pvModelPaint(); window.AndroidWake.modelDownload(sttLang()); } catch (e) {} };
  function hfNotice(k) { const m = { "no-ondevice": "“Ok Profe” needs on-device speech recognition, which this phone doesn't have. Tap the pill to talk instead.", "no-lang": "Spanish speech recognition isn't downloaded on this phone yet. Download it with one tap in Profe › History & settings › Hands-free (“Download Spanish”). Until then, tap the pill to talk.", "no-mic": "The microphone is blocked for Ruta DELE. Allow it in Android Settings › Apps › Ruta DELE › Permissions (or the browser's site settings), then turn hands-free on again." }[k]; if (m) try { coachToast(m); } catch (e) {} }
  function hfEnable(on) {
    if (on) { const m = hfMode(); if (!m) { hfNotice("no-mic"); return; } HF.mode = m;
      if (window.AndroidWake && hfStatus() === "online" && !TS.hfOnline) try { coachToast("This phone has no on-device speech recognition, so for now tap the Profe pill to talk. To use “Ok Profe”, allow online recognition in Profe › History & settings › Hands-free."); } catch (e) {} HF.on = true; HF.paused = false; TS.hf = true; tsave();
      if (vkState() === "missing" && window.__pvVoskDl) { window.__pvVoskDl(); try { coachToast("Downloading the offline “Ok Profe” listener (39 MB, once). Until it’s ready, Profe uses the phone’s recogniser."); } catch (e) {} } if (!HF.tm) HF.tm = setInterval(hfReconcile, 300); }
    else { HF.on = false; HF.engaged = false; HF.lesson = false; hfAbort(); hfWakeStop(); TS.hf = false; tsave(); clearInterval(HF.tm); HF.tm = null; }
    hfReconcile(); try { if (typeof tView !== "undefined" && tView === "hist") tRender(); } catch (e) {}
  }
  function hfPause(p) { HF.paused = p; if (p) { hfAbort(); hfWakeStop(); HF.engaged = false; } hfReconcile(); }
  // the lesson, hands-free: read the question, listen for the answer, give the feedback, move on
  function hfLessonStep(pre) {
    if (!HF.on) return; HF.lesson = true; HF.engaged = true;
    if (PX.phase === "end") { hfSay((pre && /end:/.test(pre) ? pre : pvScore()), () => { HF.lesson = false; hfFollow(); }); return; }
    if (pvQ('#runner [data-act="px-next"]')) { // feedback shown: say it, then the next question
      hfSay(pre || pvFeedback(), () => { const i0 = PX.i; pvClick("px-next"); pvUntil(() => PX.i !== i0 || PX.phase === "end", 800).then(() => hfLessonStep("")); }); return; }
    const segs = pvQuestionSegs(); hfSay(pre ? [[pre, false]].concat(pvSegs(pre).length > 1 ? [] : []).concat(segs) : segs, () => hfLessonListen());
  }
  function hfLessonListen() { hfCapture((t) => { if (!t) { hfSay("Take your time. Say the answer, “repeat the question”, “skip”, or “stop”.", () => hfCapture((t2) => (t2 ? hfHandle(t2) : (HF.lesson = false, hfEnd())), { startMs: 15000 })); return; } hfHandle(t); }, { startMs: 15000, lesson: 1 }); }
  // UI: the pill, settings, the Speak tile
  document.addEventListener("click", (e) => {
    const t = e.target.closest && e.target.closest("[data-act]"), a = t && t.dataset.act; if (!a) return;
    if (a === "hf-tap") { if (HF.paused) { hfPause(false); return; } if (hfSpeaking() || HF.saying) hfQuiet(); if (HF.rec) { hfAbort(); hfEnd(); return; } HF.engaged = true; hfStopOthers(); hfBeep(); hfCapture((x) => (x ? hfHandle(x) : hfEnd()), { startMs: 7000 }); }
    else if (a === "hf-toggle") { hfEnable(!HF.on); try { if (typeof tView !== "undefined") tRender(); } catch (x) {} }
    else if (a === "hf-pause") hfPause(true);
    else if (a === "t-speak") { tOpen(); tView = "chat"; tRender(); voiceMode = true; uiVoice(); setTimeout(() => listen((x) => tSend(x, true)), 60); }
    else if (a === "pv-model-dl") window.__pvModelDl();
    else if (a === "pv-vosk-dl") window.__pvVoskDl();
    else if (a === "pv-diag-copy") { const t2 = pvDiagText(); try { navigator.clipboard.writeText(t2).then(() => coachToast("Mic log copied. Paste it into the chat with Claude."), () => { const d = document.getElementById("pv-diag-out"); if (d) d.textContent = t2; }); } catch (x) {} }
    else if (a === "pv-diag") { const d = document.getElementById("pv-diag-out"); if (d) d.textContent = pvDiagText(); }
  });
  document.addEventListener("change", (e) => { if (e.target && e.target.dataset && e.target.dataset.act === "hf-online") { TS.hfOnline = e.target.checked; tsave(); if (HF.on) { hfWakeStop(); HF.mode = hfMode(); hfReconcile(); } try { tRender(); } catch (x) {} } });
  document.addEventListener("visibilitychange", () => { if (document.hidden) { hfAbort(); hfWakeStop(); HF.engaged = false; } hfReconcile(); });
  // Settings › Hands-free: one card, status rows with a single action each (tools/PROFE_WAKE_BRIEF.md)
  const vkState = () => { try { return window.AndroidWake && window.AndroidWake.voskState ? String(window.AndroidWake.voskState()) : ""; } catch (e) { return ""; } };
  function pvRow(ok, label, val, act, id) { return '<li class="pvrow ' + (ok === true ? "ok" : ok === false ? "warn" : "") + '"' + (id ? ' id="' + id + '"' : "") + '><span class="pvi" aria-hidden="true">' + (ok === true ? "✓" : ok === false ? "!" : "•") + '</span><span class="pvl"><b>' + label + '</b><span class="pvv">' + val + "</span></span>" + (act || "") + "</li>"; }
  function pvSettingsHTML() {
    const m = hfMode(), st = window.AndroidWake ? hfStatus() : "", vk = vkState(), and = !!window.AndroidWake;
    const stTxt = !HF.on ? "Off" : HF.paused ? "Paused" : HF.mode === "wake" ? "Listening for “Ok Profe”" : "Tap the pill to talk";
    const vdl = HF.vdl && /^progress:/.test(HF.vdl) ? +HF.vdl.slice(9) : null;
    let rows = "";
    if (vk) rows += pvRow(vk === "ready" ? true : vdl != null ? null : false, "“Ok Profe” listener", vk === "ready" ? "Ready · offline, on this phone" : vdl != null ? 'Downloading… <span class="pvbar"><i style="width:' + vdl + '%"></i></span> ' + vdl + "%" : /^error/.test(HF.vdl || "") ? "Download failed (" + esc(HF.vdl.slice(6, 60)) + "). Try again on Wi-Fi." : "Not downloaded · 39 MB, once",
      vk === "ready" || vdl != null ? "" : '<button class="btn small primary" data-act="pv-vosk-dl">Download</button>', "pv-vk");
    if (and && window.AndroidWake.modelInfo) rows += pvRow(HF.model === "installed" ? true : HF.model === "unsupported" ? null : HF.model ? false : null, "Spanish speech recognition", '<span id="pv-model">' + (PV_MODEL[HF.model] || "checking…") + "</span> · for commands, exam recording and video captions",
      '<button class="btn small" data-act="pv-model-dl"' + (HF.model === "installed" || HF.model === "unsupported" ? " hidden" : "") + ">Download</button>");
    if (and) rows += pvRow(st === "no-mic" ? false : true, "Microphone", st === "no-mic" ? "Not allowed yet: Android asks when hands-free starts" : "Allowed");
    const online = st === "online" && vk !== "ready" ? '<label class="pvchk"><input type="checkbox" data-act="hf-online"' + (TS.hfOnline ? " checked" : "") + "> Use online speech recognition for “Ok Profe” until the listener is downloaded <span class=\"muted\">(may send audio to Google while hands-free is on)</span></label>" : "";
    const intro = m === "wake" || vk ? "Say <b>“Ok Profe”</b> and then what you want: open a lesson, answer, read aloud, ask a question. Profe listens on the phone and hears nothing else until you say it; it stops when the app is in the background."
      : m === "tap" ? "“Ok Profe” needs the Android app. Here, turn hands-free on, tap the Profe pill once and keep talking: Profe listens for follow-ups and reads lesson questions aloud."
      : "Hands-free needs a microphone and speech recognition, which aren’t available here.";
    return '<section class="pvset" aria-labelledby="pvset-h"><div class="pvhead"><span class="pvico" aria-hidden="true">🎙️</span><div><h3 id="pvset-h">Hands-free <span class="pvbeta">beta</span></h3><span class="pvst" data-on="' + !!HF.on + '">' + stTxt + "</span></div>" +
      (m ? '<button class="pvsw" role="switch" data-act="hf-toggle" aria-checked="' + !!HF.on + '" aria-label="Hands-free"><i></i></button>' : "") + "</div>" +
      '<p class="small pvintro">' + intro + "</p>" + (rows ? '<ul class="pvrows">' + rows + "</ul>" : "") + online +
      '<p class="small pvtry"><span class="muted">Try:</span> <span class="pvq">Ok Profe, abre la lección</span> <span class="pvq">Ok Profe, siguiente</span> <span class="pvq">Ok Profe, ¿qué significa “madrugar”?</span> <span class="pvq">Ok Profe, para</span></p>' +
      '<details class="pvdiag"><summary>Mic diagnostics</summary><p class="small muted">The latest microphone and voice-command events, newest first.</p><div class="row"><button class="btn small" data-act="pv-diag">Show</button><button class="btn small" data-act="pv-diag-copy">Copy log</button></div><pre id="pv-diag-out" class="small"></pre></details></section>';
  }
  function pvDiagText() { let info = ""; try { if (window.AndroidWake && window.AndroidWake.info) info = "Phone: " + window.AndroidWake.info() + "\n"; } catch (x) {} return info + "Hands-free: " + (HF.on ? HF.mode + (HF.online ? " online" : "") + " · engine " + (HF.engine || "—") + " · listener " + HF.eng + " · wake model " + (vkState() || "—") : "off") + "\n" + (PV_DIAG.slice().reverse().join("\n") || "No microphone events yet."); }
  function pvSetRefresh() { const o = document.querySelector(".pvset"); if (!o) return; const open = o.querySelector(".pvdiag") && o.querySelector(".pvdiag").open, out = o.querySelector("#pv-diag-out") ? o.querySelector("#pv-diag-out").textContent : ""; o.outerHTML = pvSettingsHTML(); const n = document.querySelector(".pvset"); if (open) { n.querySelector(".pvdiag").open = true; n.querySelector("#pv-diag-out").textContent = out; } }
  window.__pvVoskDl = () => { try { HF.vdl = "progress:0"; window.AndroidWake.voskDownload(); } catch (e) {} pvSetRefresh(); };

  window.__pv = { px: () => PX, S: () => S, LI: () => Object.keys(LI), say: (t, cb) => { window.__pvSayOK = 1; speakMixed(t, cb || (() => {})); window.__pvSayOK = 0; }, view: () => tView, raStop: () => { try { raStop(true); } catch (e) {} }, match: (t, c) => { const m = pvMatch(t, Object.assign(pvCtx(), c || {})); return m ? m.a.id : null; }, norm: pvNorm, route: pvRoute, reg: PVR, hf: HF, diag: PV_DIAG, ctx: pvCtx, intro: pvPageIntro, wake: (t) => PV_WAKE.test(t), answer: pvAnswer };
  if (TS.hf) setTimeout(() => hfEnable(true), 1200);
  setTimeout(pvModelCheck, 1500); addEventListener("hashchange", () => setTimeout(() => { if (document.getElementById("pv-model")) pvModelCheck(); }, 100));
  document.addEventListener("click", (e) => { const t = e.target.closest && e.target.closest('[data-act="t-tab"][data-v="hist"]'); if (t) setTimeout(pvModelCheck, 100); });
  // ===================== Profe evaluation brief, stage 1: real actions for media, word lists, mistakes, sessions (tools/PROFE_EVAL_BRIEF.md) =====================
  // numbers said in words, English and Spanish
  const PV_NUMS = Object.assign({ "a few": 5, few: 5, fifteen: 15, twenty: 20, thirty: 30, un: 1, uno: 1, unos: 5, dos: 2, tres: 3, cuatro: 4, cinco: 5, seis: 6, siete: 7, ocho: 8, nueve: 9, diez: 10, quince: 15, veinte: 20, treinta: 30 }, PV_NUM);
  function pvSecs(s) { const m = s.match(/(\d+)\s*(seconds?|secs?|segundos?)/); if (m) return +m[1]; for (const k of Object.keys(PV_NUMS).sort((a, b) => b.length - a.length)) if (new RegExp("\\b" + k + "\\b(?= (seconds?|secs?|segundos?))").test(s)) return PV_NUMS[k]; return /rewind/.test(s) ? 10 : null; }
  const pvMmss = (t) => Math.floor(t / 60) + ":" + String(Math.floor(t % 60)).padStart(2, "0");
  // --- where we were: a small stack of places, saved before a voice action leaves them ---
  PV.marks = PV.marks || [];
  function pvMark() {
    const h = location.hash.slice(1); if (!h || /^(inicio|curso|practicar|ajustes|progreso)$/.test(h)) return;
    const m = { h, t: Date.now(), label: (document.querySelector("h1") || {}).textContent || h };
    try { if (typeof VP !== "undefined" && VP.p && VP.id) m.vt = vpT(); } catch (e) {}
    try { if (typeof PL !== "undefined" && PL.items && PL.items.length && pvQ("#pl-play")) m.pi = PL.i; } catch (e) {}
    const top = PV.marks[PV.marks.length - 1]; if (top && top.h === h) PV.marks.pop(); PV.marks.push(m); if (PV.marks.length > 8) PV.marks.shift();
  }
  // --- the session: what was done, for the summary at the end ---
  PV.sess = PV.sess || { t0: Date.now(), n: 0, words: 0, ids: {} };
  function pvSess(id, r) { if (!r || !r.ok) return; PV.sess.n++; PV.sess.ids[id] = (PV.sess.ids[id] || 0) + 1; }
  // --- multi-step requests: "open my next lesson and start it", "stop the lesson and practise ordering food with me" ---
  const PV_SPLIT = /\s*(?:,?\s*\b(?:and then|then|and after that|after that|and|y luego|luego|y despues|despues|y)\b)\s+/;
  function pvSeqParts(raw) { const s = pvNorm(raw); if (s.split(" ").length < 4) return null; const parts = s.split(PV_SPLIT).map((x) => x.trim()).filter(Boolean); return parts.length >= 2 && parts.length <= 4 ? parts : null; }
  function pvSeqTry(raw, origin) {
    const parts = pvSeqParts(raw); if (!parts) return false;
    if (!pvMatch(parts[0], pvCtx())) return false; // only when it clearly starts with a command; otherwise it's conversation for Profe
    const key = "seq|" + parts.join("|"), now = Date.now(); if (PV.last && PV.last.key === key && now - PV.last.t < 1500) return true; PV.last = { key, t: now };
    PV.seqGen = (PV.seqGen || 0) + 1; pvSeq(parts, origin, PV.seqGen); return true;
  }
  async function pvSeq(parts, origin, gen) {
    const said = [];
    for (let i = 0; i < parts.length; i++) {
      if (gen !== PV.seqGen) return; // a newer instruction replaced this one
      const m = pvMatch(parts[i], pvCtx());
      if (!m) {
        if (i === parts.length - 1 && i > 0) { pvLog("seq: last part to Profe «" + parts[i] + "»"); PV.skip = 1; tOpen(); tSend(parts[i], origin !== "chat"); return; }
        pvReply((said.length ? said.join(" ") + " But I" : "I") + " didn't understand “" + parts[i] + "”, so I stopped there.", origin, { listen: 1 }); return;
      }
      pvLog("seq " + (i + 1) + "/" + parts.length + " " + m.a.id + " «" + parts[i] + "»");
      let r; try { r = await PVH[m.a.id](m.s, pvCtx()); } catch (e) { r = { ok: false, say: "Something went wrong." }; }
      r = r || { ok: false }; pvSess(m.a.id, r);
      if (!r.ok) { pvReply((said.length ? said.join(" ") + " But: " : "") + (r.say || "I couldn't do “" + parts[i] + "”.") + (i < parts.length - 1 ? " I didn't do the rest." : ""), origin, { listen: 1 }); return; }
      if (i === parts.length - 1) { // the last step decides what happens next (its own loop, the lesson questions, or a reply)
        window.__pvLast = { id: m.a.id, ok: true, say: r.say || "", seq: parts.length };
        if (r.own) return;
        if (r.lesson) { hfLessonStep((said.join(" ") + " " + (r.say || "")).trim()); return; }
        const out = (said.concat(r.say ? [r.say] : [])).join(" ").replace(/Here's /g, "Opened ").trim();
        if (r.quiet && !out) { if (origin === "hf") hfFollow(); return; }
        pvReply(out || "Done.", origin, { listen: 1 }); return;
      }
      if (r.say && !r.quiet) said.push(r.say.replace(/^Here's /, "Opened "));
      await pvWait(250);
    }
  }
  // --- word lists read aloud: Spanish word, English meaning, time to repeat ---
  var DR = { on: false, words: [], i: 0, rate: 1, gap: 3, title: "", gen: 0, last: null };
  function drTopic(s) {
    const q = " " + s.replace(/\b(play|read|practi[cs]e|drill|go through|run through|do|start|say|me|my|the|our|this|vocabulary|vocab|words?|word list|list|with|and|english|meanings?|translations?|then|let|leave|time|for|to|ill|repeat|them|it|each|every|all|spanish|give|repasa|repasemos|practica|practiquemos|lee|leeme|pon|ponme|dime|el|mi|las|la|los|vocabulario|palabras|lista|de|del|sobre)\b/g, " ").replace(/\s+/g, " ").trim() + " ";
    const t = q.trim(); if (!t) return null;
    const EN = { food: "food|comida|cooking|restaurant", drink: "drink|bebida", family: "family|familia", travel: "travel|viaje|trip", work: "work|trabajo|job|office", house: "home|house|casa|vivienda|housing", body: "body|cuerpo|health|salud", clothes: "clothes|ropa|shopping|compras", weather: "weather|clima|tiempo", city: "city|ciudad|places", transport: "transport|transporte", school: "school|escuela|studies|estudios", sport: "sport|deporte|free time" };
    const words = t.split(" ").filter((w) => w.length > 2); const lvs = [curLevel()].concat(["a1", "a2", "b1", "b2", "c1", "c2"].filter((x) => x !== curLevel()));
    for (const lv of lvs) for (const [i, top] of (VOCAB[lv] || []).entries()) { const hay = pvStrip(top.t + " " + top.en).toLowerCase();
      if (words.some((w) => hay.includes(w) || Object.entries(EN).some(([k, re]) => (w === k || new RegExp("\\b(" + re + ")").test(w)) && new RegExp("\\b(" + re + ")").test(hay)))) return { lv, i, top }; }
    return { none: t };
  }
  function drSay(segs, done) { // like hfSaySeq, with the drill's speed; cancelled by any newer speech
    const gen = ++SPK_GEN; try { speechSynthesis.cancel(); } catch (e) {} let k = 0; HF.saying = true; hfPaint();
    const next = () => { if (gen !== SPK_GEN) return; if (k >= segs.length) { HF.saying = false; hfPaint(); done(); return; } const [t, es] = segs[k++]; let u; try { u = profeUtter(t, es); u.rate = Math.max(0.5, Math.min(1.6, (u.rate || 1) * DR.rate)); } catch (e) { next(); return; } let moved = false; const go = () => { if (moved) return; moved = true; clearTimeout(wd); setTimeout(next, 250); }; u.onend = u.onerror = go;
      const wd = setTimeout(go, 1500 + (90 * t.length) / Math.max(0.5, DR.rate)); // a voice that never reports the end (cancelled elsewhere, some Samsung engines) doesn't stall the list
      try { speechSynthesis.speak(u); } catch (e) { go(); } };
    next();
  }
  function drStep(pre) {
    if (!DR.on) return; const g = ++DR.gen;
    if (DR.i >= DR.words.length) { DR.on = false; hfPaint(); const n = DR.words.length; pvReply("That's the list: " + n + " words. Say “again” to hear it once more, “quiz me on this lesson” to test yourself, or “stop”.", HF.on ? "hf" : "voice", { listen: 1 }); return; }
    if (DR.i < 0) DR.i = 0;
    const [es, en] = DR.words[DR.i]; PV.sess.words++; DR.last = DR.i;
    const segs = (pre ? [[pre, false]] : []).concat([[es, true], [en.split(/[;(]/)[0].trim(), false]]);
    drSay(segs, () => {
      if (!DR.on || g !== DR.gen) return;
      if (HF.on && !HF.paused) { // listen for the repetition or a command ("next", "repeat more slowly", "stop")
        HF.engaged = true; hfCapture((t) => { if (!DR.on || g !== DR.gen) return; if (!t) { DR.i++; drStep(); return; }
          const c = pvCtx(), m = pvMatch(t, c); if (m) { pvExec(m.a, m.s, "hf"); return; }
          const ok = pvSim(pvStrip(t).toLowerCase().replace(/[^\p{L} ]/gu, "").trim(), pvStrip(es).toLowerCase().replace(/^(el|la|los|las|un|una) /, "").replace(/[^\p{L} ]/gu, "").trim()) >= 0.55 || pvSim(pvStrip(t).toLowerCase(), pvStrip(es).toLowerCase()) >= 0.6;
          DR.i++; drStep(ok ? pvPick(["¡Bien!", "¡Muy bien!", "¡Eso!", "Good."]) : ""); }, { startMs: DR.gap * 1000 + 1500 });
      } else setTimeout(() => { if (DR.on && g === DR.gen) { DR.i++; drStep(); } }, DR.gap * 1000);
    });
  }
  function drStop() { if (!DR.on) return false; DR.on = false; DR.gen++; SPK_GEN++; try { speechSynthesis.cancel(); } catch (e) {} HF.saying = false; hfPaint(); return true; }
  Object.assign(PVH, {
    "review.mistakes": async () => {
      if (!(S.mist && S.mist.length)) return { ok: false, say: "You have no saved mistakes yet. Questions you miss in lessons and guides are saved for review." };
      const r = await pvGo("errores", "your mistakes"); if (!r.ok) return r; await pvWait(150);
      const q = await PVH["lesson.quiz"](); if (!q.ok) return q;
      return { ok: true, say: HF.on ? "Let's go over your mistakes: " + Math.min(20, S.mist.length) + " questions." : "Here are your mistakes to review.", lesson: HF.on };
    },
    "vocab.drill": async (s) => {
      let t = drTopic(s), words = null, title = "";
      if ((!t || t.none) && DR.words.length && /\b(again|same|that|this|it|otra vez|misma|esa)\b/.test(s)) { words = DR.words; title = DR.title; t = { again: 1 }; }
      else if (!t || t.none) { PV.need = { id: "vocab.drill", prefix: "play vocabulary", until: Date.now() + 20000 }; return { ok: false, say: t && t.none ? "I couldn't find a word list for “" + t.none + "”. Which one? For example: food, family, travel or work." : "Which word list? For example: food, family, travel or work." }; }
      else if (!words) { words = t.top.w; title = t.top.en + " (" + t.lv.toUpperCase() + ")"; await pvGo(t.lv + "-vocab", "the " + t.lv.toUpperCase() + " vocabulary"); }
      drStop(); hfStopOthers(); hfQuiet();
      Object.assign(DR, { on: true, words: words.slice(), i: 0, title }); hfPaint();
      drStep(title + ": " + words.length + " words. Listen, then repeat each one."); return { ok: true, own: 1, say: "" };
    },
    "drill.next": () => { if (!DR.on) return { ok: false, say: "No word list is playing." }; DR.i = (DR.last == null ? DR.i : DR.last) + 1; drStep(); return { ok: true, own: 1 }; },
    "drill.prev": () => { if (!DR.on) return { ok: false, say: "No word list is playing." }; DR.i = Math.max(0, (DR.last == null ? DR.i : DR.last) - 1); drStep(); return { ok: true, own: 1 }; },
    "drill.repeat": (s) => { if (!DR.on) return { ok: false, say: "No word list is playing." }; if (/slow|despacio|lento/.test(s)) DR.rate = Math.max(0.55, DR.rate - 0.2); DR.i = DR.last == null ? DR.i : DR.last; drStep(); return { ok: true, own: 1 }; },
    "drill.slower": () => { if (!DR.on) return { ok: false, say: "No word list is playing." }; DR.rate = Math.max(0.55, DR.rate - 0.2); DR.gap = Math.min(6, DR.gap + 1); DR.i = DR.last == null ? DR.i : DR.last; drStep("Slower."); return { ok: true, own: 1 }; },
    "drill.faster": () => { if (!DR.on) return { ok: false, say: "No word list is playing." }; DR.rate = Math.min(1.4, DR.rate + 0.2); DR.gap = Math.max(2, DR.gap - 1); DR.i = (DR.last == null ? DR.i : DR.last) + 1; drStep("Faster."); return { ok: true, own: 1 }; },
    "video.play": async (s) => {
      if (!(typeof VP !== "undefined" && VP.p && pvQ("#vplayer, .vframe, #vp"))) return PVH["media.pick"]("play a video", Object.assign(pvCtx(), { video: false })); // none on screen: open the list and ask which one
      if (/(start|beginning|top|principio|inicio)$/.test(s || "")) vpSeek(vpLo()); vpPlay(); const ok = await pvUntil(() => VP.p.getPlayerState && VP.p.getPlayerState() === 1, 2500);
      return ok ? { ok: true, say: "", quiet: 1 } : { ok: false, say: "The video didn't start. Tap play on the video once; after that I can control it." };
    },
    "video.seek": async (s) => {
      const n = pvSecs(s) || 10, back = !/forward|ahead|adelanta|avanza|salta|adelante/.test(s), t0 = vpT(), to = Math.max(0, t0 + (back ? -n : n));
      vpSeek(to); const ok = await pvUntil(() => Math.abs(vpT() - to) < 2, 1500);
      return ok ? { ok: true, say: "", quiet: 1 } : { ok: false, say: "I couldn't move the video." };
    },
    "video.replay": async () => {
      const c = typeof VCAP !== "undefined" && VCAP.cur >= 0 ? VCAP.cues[VCAP.cur] : null, to = c ? c.s : Math.max(0, vpT() - 5);
      vpSeek(to); vpPlay(); const ok = await pvUntil(() => Math.abs(vpT() - to) < 2.5, 1500); return ok ? { ok: true, say: "", quiet: 1 } : { ok: false, say: "I couldn't replay it." };
    },
    "lesson.stop": async () => {
      const was = drStop(); let any = was;
      try { if (typeof RA !== "undefined" && RA.on) { pvClick("ra-stop") || (RA.on && !RA.paused && pvClick("ra-pp")); any = true; } } catch (e) {}
      try { if (typeof PL !== "undefined" && PL.playing) { pvClick("l-play"); any = true; } } catch (e) {}
      try { if (typeof VP !== "undefined" && VP.p && VP.p.getPlayerState && VP.p.getPlayerState() === 1) { vpPause(); any = true; } } catch (e) {}
      if (HF.lesson) { HF.lesson = false; any = true; } hfQuiet(); HF.lesson = false;
      const ok = await pvUntil(() => !pvCtx().playing && !DR.on, 1000);
      return { ok: ok, say: ok ? (any ? "Stopped." : "") : "I couldn't stop it.", quiet: 1 };
    },
    "ctx.return": async () => {
      const here = location.hash.slice(1); let m = null; while (PV.marks.length) { const x = PV.marks.pop(); if (x.h !== here) { m = x; break; } }
      if (!m) { if (document.body.classList.contains("tutor-open")) { pvCloseProfe(); return { ok: true, say: "Back to " + ((document.querySelector("h1") || {}).textContent || "the page") + "." }; } return { ok: false, say: "I don't have an earlier place to go back to." }; }
      pvCloseProfe(); location.hash = m.h; const ok = await pvUntil(() => location.hash.slice(1) === m.h && app.children.length, 3000); if (!ok) return { ok: false, say: "I couldn't go back there." };
      if (m.vt != null) { await pvUntil(() => typeof VP !== "undefined" && VP.ready, 4000); vpSeek(Math.max(0, m.vt - 2)); }
      return { ok: true, say: "Back to " + m.label.trim() + (m.vt != null ? " at " + pvMmss(Math.max(0, m.vt - 2)) : "") + "." };
    },
    "session.end": () => {
      drStop(); const ss = PV.sess, mins = Math.max(1, Math.round((Date.now() - ss.t0) / 60000)), bits = [];
      if (ss.words) bits.push(ss.words + " words practised"); const q = (ss.ids["q.pick"] || 0) + (ss.ids["q.check"] || 0); if (q) bits.push(q + " questions answered");
      const others = ss.n - q - (ss.ids["session.end"] || 0); if (others > 0) bits.push(others + " things done by voice");
      const say = "Good work today" + (bits.length ? ": " + bits.join(", ") : "") + ", in about " + mins + " minute" + (mins > 1 ? "s" : "") + ". ¡Hasta la próxima!" + (HF.on ? " Hands-free is now off." : "");
      PV.sess = { t0: Date.now(), n: 0, words: 0, ids: {} };
      if (HF.on) { hfSay(say, () => hfEnable(false)); return { ok: true, own: 1 }; }
      return { ok: true, say };
    },
  });
  // practise.convo with a situation: "practise ordering food with me" starts the closest role-play, or Profe improvises one
  { const base = PVH["practise.convo"];
    PVH["practise.convo"] = async (s) => {
      const m = s.match(/(?:practi[cs]e|role ?play|do a role ?play (?:about|for|of|at)|rehearse|practicar|ensayar) (?:como )?(.+?)(?: with me| together| in spanish| conmigo)*$/), topic = m && !/^(spanish |some )?(conversation|speaking|talking|role ?plays?)( in spanish)?$|^(la |una )?(conversacion|hablar)$/.test(m[1]) ? m[1] : "";
      if (!topic) return base(s);
      drStop(); const KEY = { "ordering food|order food|food|restaurant|eating out|comida|pedir comida|restaurante": "café|restaurant|fast-food|fonda|bill|pizza", "coffee|cafe": "café", "taxi|directions|getting around|transport": "taxi|directions|Metro|bus", "shopping|clothes|buying": "shop|clothes|supermarket|market", "doctor|pharmacy|health": "doctor|pharmacy|clinic|dentist", "hotel|travel|booking": "hotel|ticket|travel", "phone|call": "Phoning|phone|Calling" };
      const lvl = curLevel(); let rp = null;
      for (const [k, v] of Object.entries(KEY)) if (new RegExp("\\b(" + k + ")\\b").test(topic)) { const re = new RegExp(v, "i"); rp = VOICE.roleplays.filter((r) => re.test(r.en)).sort((a, b) => (a.lvl === lvl ? -1 : 0) - (b.lvl === lvl ? -1 : 0))[0]; if (rp) break; }
      tOpen(); await pvUntil(() => document.body.classList.contains("tutor-open"), 800);
      if (rp) { startRoleplay(rp.id); const ok = await pvUntil(() => typeof PR !== "undefined" && PR && PR.sc && PR.sc.id === rp.id, 1000); return ok ? { ok: true, own: 1, say: "" } : { ok: false, say: "The role-play didn't start." }; }
      PV.skip = 1; tSend("Let's role-play in Spanish: " + topic + ". You play the other person and start; keep each turn short, then wait for me.", true); return { ok: true, own: 1, say: "" };
    }; }
  // hands-free: answering a question pauses what was playing; when the exchange ends it carries on from there
  { const woke = hfWoke; hfWoke = function (cmd) { try { const c = pvCtx(); if (c.playing && !DR.on) { HF.wasPlaying = location.hash; PVH["play.pause"](); } } catch (e) {} return woke(cmd); };
    const end = hfEnd; hfEnd = function () { const w = HF.wasPlaying; HF.wasPlaying = null; end(); if (w && w === location.hash && HF.on && !HF.paused && !DR.on && !HF.lesson) { const c = pvCtx(); if (c.paused) { pvLog("resume after exchange"); PVH["play.resume"](); } } };
    const pause = PVH["play.pause"]; PVH["play.pause"] = async (s, c) => { const r = await pause(s, c); if (s && s !== "auto") HF.wasPlaying = null; return r; }; }
  { const st = PVH["hf.stop"]; PVH["hf.stop"] = (s2, c) => { drStop(); return st(s2, c); }; } // "stop" also stops a word list
  window.__pv.pr = () => (typeof PR !== "undefined" && PR && PR.sc ? PR.sc.id + " " + PR.sc.en : null); window.__pv.store = () => S; window.__pv.save = () => save();
  window.__pv.dr = () => DR; window.__pv.marks = () => PV.marks; window.__pv.sess = () => PV.sess; window.__pv.seq = pvSeqParts;
  // ---- word lists by topic, opened without reading (S24 log: «take me to my food word list») ----
  async function drShowTopic(t) { await pvUntil(() => document.querySelectorAll(".themes details.theme").length, 1500); const ds = [...document.querySelectorAll(".themes details.theme")]; const d = ds[t.i]; if (!d) return false; ds.forEach((x) => (x.open = x === d)); d.scrollIntoView({ block: "start", behavior: "smooth" }); return true; }
  Object.assign(PVH, {
    "vocab.open": async (s) => {
    const t = drTopic(s.replace(/\b(take me to|open|show me|show|go to|abre|llevame al|llevame a|ver)\b/g, " "));
    if (!t || t.none) { const r = await pvGo("palabras", "the word lists"); return r.ok ? { ok: true, say: "I couldn't find a list called “" + (t && t.none ? t.none : "that") + "”. Here are all the word lists." } : r; }
    const r = await pvGo(t.lv + "-vocab", "the " + t.lv.toUpperCase() + " vocabulary"); if (!r.ok && !/already/.test(r.say)) return r;
    const ok = await drShowTopic(t); return ok ? { ok: true, say: "Here's " + t.top.en + " (" + t.lv.toUpperCase() + "): " + t.top.w.length + " words. Say “play this list” to hear them." } : { ok: false, say: "I opened the vocabulary but couldn't find that list." };
    },
  });
  { const vd = PVH["vocab.drill"]; PVH["vocab.drill"] = async (s, c) => { const r = await vd(s, c); try { const t = drTopic(s); if (t && t.top) drShowTopic(t); } catch (e) {} return r; }; }
  // ---- which language the recogniser listens for after "Ok Profe" (S24 log: English commands heard by the Spanish recogniser became «Levy One», «Wireless») ----
  // Android 14+: both languages, switching automatically; elsewhere: the language of the learner's last command (English first)
  HF.cmdEs = false;
  function hfCmdLang() { const es = sttLang(), en = "en-US"; if (window.AndroidSTT && window.AndroidSTT.multiLang) return (HF.cmdEs ? es + "|" + en : en + "|" + es); /* an older app gets one language */ return HF.cmdEs ? es : en; }
  const PV_BIAS = ["Ok Profe", "flashcards", "word list", "vocabulary", "level A1", "level A2", "level B1", "level B2", "level C1", "level C2", "verbs", "grammar", "lesson", "next lesson", "unit", "video", "pause", "play", "go back", "go back ten seconds", "review", "my mistakes", "quiz me", "food", "travel", "family", "work", "stop", "next word", "repeat", "slower", "end the session", "abre", "siguiente", "repite", "más despacio"];
  // ---- "play a video / a song": the right list opens, then Profe asks which one (S24 log, 15 Nov 2026: «Select a video», «Play a song») ----
  // kinds: videos (the Videos page, with its Music filter) and the listening texts (songs, podcasts, stories, poems, news)
  const PV_MKIND = [[/\bmusic videos?\b|videos? musicales?/, "video", "music"], [/\b(songs?|music|canciones|cancion|musica)\b/, "song"], [/\b(podcasts?)\b/, "podcast"], [/\b(stories|story|historias?|cuentos?)\b/, "story"], [/\b(poems?|poemas?)\b/, "poem"], [/\b(news|noticias)\b/, "news"], [/\b(videos?|clips?)\b/, "video"]];
  const PV_MNAME = { video: ["video", "videos"], song: ["song", "songs"], podcast: ["podcast", "podcasts"], story: ["story", "stories"], poem: ["poem", "poems"], news: ["news story", "news stories"] };
  const PV_ANY = /\b(random|any|anything|any one|whatever|surprise|you choose|you pick|your choice|dont mind|doesnt matter|al azar|cualquier|cualquiera|sorprendeme|lo que sea|elige tu|escoge tu)\b/;
  const pvTitleOf = (a) => ((a.querySelector("b") || a).textContent || "").replace(/\s+/g, " ").trim();
  async function pvMediaList(kind, sub, lv) {
    if (kind === "video") {
      const r = await pvGo("videos", "Videos"); if (!r.ok && !/already/.test(r.say)) return null;
      await pvUntil(() => document.querySelector('main a.vcard[href^="#video-"]'), 2000);
      const chip = (k, re) => [...document.querySelectorAll('[data-act="v-f"]')].find((b) => (!k || b.dataset.k === k) && re.test(b.textContent.trim()));
      const c = chip("c", sub === "music" ? /^(music|música)$/i : /^all$/i); if (c && c.getAttribute("aria-pressed") !== "true") { c.click(); await pvWait(250); }
      const l = lv ? [...document.querySelectorAll('[data-act="v-f"]')].find((b) => b.textContent.trim().toUpperCase() === lv.toUpperCase()) : chip(null, /^all levels$/i); if (l && l.getAttribute("aria-pressed") !== "true") { l.click(); await pvWait(250); }
      return [...document.querySelectorAll('main a.vcard[href^="#video-"]')].filter((a) => a.offsetParent !== null).map((a) => ({ h: a.getAttribute("href").slice(1), t: pvTitleOf(a), kind }));
    }
    const r = await pvGo("escuchar", "Listening"); if (!r.ok && !/already/.test(r.say)) return null;
    await pvUntil(() => document.querySelector("main a.lcard2"), 2000);
    const cf = document.querySelector('[data-act="l-cf"][data-v="' + kind + '"]'); if (cf && cf.getAttribute("aria-pressed") !== "true") { cf.click(); await pvWait(250); }
    const lf = [...document.querySelectorAll('[data-act="l-lf"]')].find((b) => lv ? b.textContent.trim().toUpperCase() === lv.toUpperCase() : /^all levels$/i.test(b.textContent.trim())); if (lf && lf.getAttribute("aria-pressed") !== "true") { lf.click(); await pvWait(250); }
    const pre = { song: "#song-", poem: "#poem-", news: "#news-", podcast: "#podcast", story: "#" }[kind];
    return [...document.querySelectorAll("main a.lcard2")].filter((a) => a.offsetParent !== null && (a.getAttribute("href") || "").startsWith(pre) && (kind !== "story" || /^#(story|historia)-/.test(a.getAttribute("href")))).map((a) => ({ h: a.getAttribute("href").slice(1), t: pvTitleOf(a), kind }));
  }
  // open one item and start it; success is checked on the player itself
  async function pvMediaPlay(it) {
    const r = await pvGo(it.h, "«" + it.t + "»"); if (!r.ok && !/already/.test(r.say)) return { ok: false, say: "I couldn't open «" + it.t + "»." };
    try { coachToast("▶ " + it.t); } catch (e) {}
    if (it.kind === "video") {
      const ready = await pvUntil(() => typeof VP !== "undefined" && VP.p && VP.ready, 8000);
      if (ready) { try { vpPlay(); } catch (e) {} if (await pvUntil(() => VP.p.getPlayerState && VP.p.getPlayerState() === 1, 3000)) return { ok: true, say: "", end: 1 }; }
      return { ok: true, say: "Here's «" + it.t + "». Tap play on the video once; after that I can pause it, rewind it or play it again for you." };
    }
    const has = await pvUntil(() => document.getElementById("pl-play"), 3000);
    if (has && !(typeof PL !== "undefined" && PL.playing)) pvClick("l-play");
    if (has && await pvUntil(() => typeof PL !== "undefined" && PL.playing, 2500)) return { ok: true, say: "", end: 1 };
    return { ok: !!has, say: has ? "Here's «" + it.t + "». Tap play to start it." : "I opened «" + it.t + "» but couldn't find its player." };
  }
  const pvOptsSay = (items) => items.length === 1 ? "«" + items[0].t + "»" : items.slice(0, -1).map((x) => "«" + x.t + "»").join(", ") + " or «" + items[items.length - 1].t + "»";
  Object.assign(PVH, {
    "media.pick": async (s, c) => {
      let kind = null, sub = null; for (const [re, k, x] of PV_MKIND) if (re.test(s)) { kind = k; sub = x || null; break; }
      const lv = pvLv(s), any = PV_ANY.test(s), ord = /\b(first|second|third|last|primer|primera|primero|segunda|segundo|tercera|tercero|ultima|ultimo)\b/.test(s) ? pvOrd(s) : null;
      c = c || pvCtx();
      // something on screen already: "play a video" on a video page plays it; "play the song" on a paused song resumes it
      if ((!kind || kind === "video") && c.video && !lv && !any && ord == null && !sub) return PVH["video.play"](s, c);
      if (kind && kind !== "video" && (c.paused || c.playing) && pvQ("#pl-play") && !lv && !any && ord == null && new RegExp("^#" + ({ song: "song", poem: "poem", news: "news", podcast: "podcast", story: "(story|historia)" }[kind]) + "-").test(location.hash)) return PVH["play.resume"](s, c);
      if (!kind) { // "play something", "surprise me": which kind?
        if (any || /^surprise|^sorprendeme/.test(s)) { const pool = ["song", "video", "story", "podcast"]; kind = pvPick(pool); }
        else { PV.choice = { kinds: 1, until: Date.now() + 30000 }; return { ok: true, say: "Sure. A video, a song, a podcast or a story?" }; }
      }
      const items = await pvMediaList(kind, sub, lv); const nm = PV_MNAME[kind] || ["item", "items"], what = (sub === "music" ? "music " : "") + nm[1] + (lv ? " for " + lv.toUpperCase() : "");
      if (!items) return { ok: false, say: "I couldn't open the " + what + "." };
      if (!items.length) return { ok: false, say: "There are no " + what + " yet." + (lv ? " Try another level, or say “any " + nm[0] + "”." : "") };
      if (any) return pvMediaPlay(pvPick(items));
      if (ord != null) { const it = ord === 3 && /last|ultim/.test(s) ? items[items.length - 1] : items[Math.min(ord, items.length - 1)]; return pvMediaPlay(it); }
      if (items.length === 1) return pvMediaPlay(items[0]);
      const top = items.slice(0, 3); PV.choice = { items, top, kind, page: location.hash.slice(1), until: Date.now() + 30000 };
      return { ok: true, say: "Here are the " + what + ". Which one? " + pvOptsSay(top) + ". Say “the first”, “the second”, a title, or “any”.", keep: 1 };
    },
  });
  // the answer to a question Profe asked ("Which one?", "Did you mean…?"): a position, a title, "any", yes / no
  function pvChoose(raw, s, c, origin) {
    const q = PV.choice; if (!q) return false;
    if (q.page && location.hash.slice(1) !== q.page) { PV.choice = null; return false; } // the learner left the list
    const num = { one: 0, uno: 0, una: 0, "1": 0, two: 1, dos: 1, "2": 1, three: 2, tres: 2, "3": 2, four: 3, cuatro: 3, "4": 3 };
    let t = s; for (let k = 0; k < 3; k++) t = t.replace(/^(the|la|el|number|numero|option|opcion|play|pon|i want|quiero|lets do|do|go with|i choose|elijo|i think|creo que)\s+/, "");
    t = t.replace(/\s+(one|please|por favor)$/, "").trim(); const isN = (x) => Object.prototype.hasOwnProperty.call(num, x);
    if (PV_NO.test(s) || /^(none|neither|nothing|ninguno|ninguna|nada|forget it|never mind|olvidalo)$/.test(s)) { PV.choice = null; pvReply("Okay.", origin); return true; }
    if (q.kinds) { for (const [re, k] of PV_MKIND) if (re.test(s)) { PV.choice = null; pvExec(PVR.actions.find((a) => a.id === "media.pick"), "play a " + (k === "news" ? "news story" : k), origin); return true; } PV.choice = null; return false; }
    let pick = null;
    if (q.opts) {
      const i = isN(t) ? num[t] : /^(first|primera|primero)$/.test(t) ? 0 : /^(second|segunda|segundo)$/.test(t) ? 1 : /^(third|tercera|tercero)$/.test(t) ? 2 : (PV_YES.test(s) || /^(yes|si|that one|esa|ese)$/.test(t)) && q.opts.length === 1 ? 0 : -1;
      let j = i; if (j < 0) { let bs = 0; q.opts.forEach((o, k) => { const n = pvNorm(o.say.replace(/[«»“”]/g, "")), sc = Math.max(pvSim(n, s), pvSim(n, t), n.includes(t) && t.length >= 4 ? 0.85 : 0); if (sc > bs) { bs = sc; j = k; } }); if (bs < 0.6) j = -1; }
      if (j >= 0 && q.opts[j]) { const o = q.opts[j]; PV.choice = null; pvExec(o.run, o.arg, origin, false, o.arg); return true; }
      PV.choice = null; return false; // something else: handled as a new request
    }
    if (q.acts) { // "Did you mean…": 1, 2, 3, or the option's own words
      const i = isN(t) ? num[t] : /^(first|primera|primero)$/.test(t) ? 0 : /^(second|segunda|segundo)$/.test(t) ? 1 : /^(third|tercera|tercero)$/.test(t) ? 2 : (PV_YES.test(s) && q.acts.length === 1 ? 0 : -1);
      let j = i; if (j < 0) { let bs = 0; q.acts.forEach((o, k) => { const sc = pvSim(pvNorm(o.ex), s); if (sc > bs) { bs = sc; j = k; } }); if (bs < 0.7) j = -1; }
      if (j >= 0 && q.acts[j]) { PV.choice = null; pvExec(q.acts[j].a, pvNorm(q.acts[j].ex), origin); return true; }
      PV.choice = null; return false; // something else: handled as a new request
    }
    const L = q.top || q.items;
    if (PV_ANY.test(s)) pick = pvPick(q.items);
    else if (isN(t)) pick = L[num[t]];
    else if (/^(first|primera|primero|first one|that one|esa|ese|yes|si|ok|okay|sure|vale|dale)$/.test(t) || PV_YES.test(s)) pick = L[0];
    else if (/^(second|segunda|segundo)$/.test(t)) pick = L[1];
    else if (/^(third|tercera|tercero)$/.test(t)) pick = L[2];
    else if (/^(last|ultima|ultimo|the last one)$/.test(t)) pick = L[L.length - 1];
    else { let bs = 0; q.items.forEach((it) => { const n = pvNorm(it.t), sc = Math.max(pvSim(n, t), n.includes(t) && t.length >= 4 ? 0.9 : 0); if (sc > bs) { bs = sc; pick = it; } }); if (bs < 0.55) pick = null; }
    if (/^(more|other|others|other ones|something else|show me more|more options|otros|otras|mas|otra cosa)$/.test(t) && q.items.length > 3) { const off = (q.off || 0) + 3; const top = q.items.slice(off, off + 3); if (top.length) { PV.choice = Object.assign({}, q, { top, off, until: Date.now() + 30000 }); pvReply(pvOptsSay(top) + "? Say “the first”, “the second” or a title.", origin, { listen: 1 }); return true; } }
    if (!pick) { if (pvMatch(raw, c)) { PV.choice = null; return false; } // a different command: do that instead
      if (q.tries) { PV.choice = null; return false; } q.tries = 1; q.until = Date.now() + 30000; pvReply("Sorry, which one? " + pvOptsSay(L) + ". Or say “any”.", origin, { listen: 1 }); return true; }
    PV.choice = null; pvExec({ id: "media.play", purpose: "play" }, pick, origin, false, pick); return true;
  }
  PVH["media.play"] = (it) => pvMediaPlay(it);
  // not a known command but clearly meant for the app ("select a video", «of video» after the wake beep cut the first word):
  // ask with the closest things Profe can do, instead of guessing or handing an app instruction to the chat
  const PV_APPN = /\b(videos?|clips?|songs?|music|podcasts?|stor(y|ies)|poems?|news|lessons?|units?|levels?|flashcards|cards|words?|word list|vocabulary|vocab|verbs?|grammar|guides?|exams?|tests?|quiz|questions?|mistakes|progress|settings|reading|listening|writing|course|canciones|cancion|musica|leccion(es)?|unidad(es)?|nivel(es)?|palabras|vocabulario|verbos|gramatica|examen(es)?|preguntas|errores|lectura)\b/;
  const PV_ACTV = /^(play|open|show|select|choose|pick|find|start|go|take|put|watch|listen|read|review|quiz|test|practi[cs]e|load|bring|get|give|search|look for|i want|i need|pon|ponme|abre|muestrame|ensename|busca|elige|escoge|empieza|lee|reproduce|llevame|quiero|dame|ve)\b/;
  function pvClarify(raw, s, c, origin) {
    if (!s || s.length > 80) return false;
    const n = s.split(" ").length, noun = PV_APPN.test(s), verb = PV_ACTV.test(s);
    if (!noun || !(verb || (origin === "hf" && n <= 3))) return false;
    if (origin === "chat" && !verb) return false;
    if (c.drill || c["runner-text"]) return false; // an answer to a question on screen, not an instruction
    const sc = []; for (const a of PVR.actions) { if (a.voice !== "complete" || (a.when && !pvWhen(a.when, c)) || /^(hf\.|meta\.|q\.|session\.)/.test(a.id) || (a.id === "video.play" && !c.video)) continue;
      let best = 0, ex = a.en[0]; (a.en || []).concat(a.es || []).forEach((e) => { const v = pvSim(pvNorm(e), s); if (v > best) { best = v; ex = e; } });
      const nm = s.match(PV_APPN); if (nm && (a.en.concat(a.es).join(" ") + " " + a.purpose).toLowerCase().includes(nm[0].replace(/s$/, ""))) best += 0.15;
      sc.push({ a, ex, v: best }); }
    sc.sort((x, y) => y.v - x.v); const top = sc.filter((x) => x.v >= 0.35).slice(0, 3);
    if (!top.length) return false;
    PV.choice = { acts: top, until: Date.now() + 30000 }; pvLog("clarify «" + s + "» → " + top.map((x) => x.a.id).join(", "));
    const opts = top.map((x, i) => (top.length > 1 ? ["one", "two", "three"][i] + ", " : "") + "“" + x.ex + "”");
    pvReply("I want to get this right" + (origin === "hf" ? ": I heard “" + raw.replace(/^\s*(ok(ay)?|oye|hey)?\s*prof(e)?\s*,?\s*/i, "").trim() + "”" : "") + ". Did you mean " + (top.length === 1 ? opts[0] + "? Say yes, or say it another way." : opts.slice(0, -1).join("; ") + "; or " + opts[opts.length - 1] + "? Say the number, or say it another way."), origin, { listen: 1 });
    return true;
  }
  window.__pv.choice = () => PV.choice; window.__pv.clarify = (t) => { const c = pvCtx(); return pvClarify(t, pvNorm(t), c, "test") ? PV.choice : null; };
  // ---- everything in the app, by name: screens, levels, units, videos (and their singers), listening and reading texts, guides, grammar pages,
  //      writing tasks, exams, flashcards, and the buttons, filters and links on the current screen. Anything a learner names can be found here,
  //      opened or pressed; when it isn't certain, Profe offers the closest three (S24, 15 Nov 07:26: «Carol G», «me with a music video») ----
  const PV_SCREENS = [["hoy", "home|today|start page|inicio|hoy|main page"], ["curso", "course|the course|levels|curso"], ["practicar", "practice|practise|practicar"], ["biblioteca", "library|biblioteca"], ["escuchar", "listening|listen|escuchar|audios"],
    ["leer", "reading|read|texts|lectura|leer"], ["escritura", "writing|write|escritura|escribir"], ["verbos", "verbs|verb list|verb dictionary|verbos"], ["verbos-reflexivos", "reflexive verbs|verbos reflexivos"], ["gramatica", "grammar|grammar map|gramatica"],
    ["palabras", "words|dictionary|vocabulary|palabras|diccionario"], ["videos", "videos|video library|videos list"], ["repaso", "flashcards|review|cards|spaced repetition|repaso|tarjetas"], ["errores", "my mistakes|mistakes|errores|mis errores"],
    ["nivel", "placement test|level test|find my level|prueba de nivel"], ["guias", "grammar guides|guides|guias"], ["examenes", "exams|mock exams|dele exams|examenes"], ["recursos", "resources|recursos"], ["progreso", "progress|my progress|stats|progreso"],
    ["ajustes", "settings|options|preferences|ajustes|configuracion"], ["drill", "quick drill|drill|practice drill"], ["costes", "service gaps and costs|costs dashboard|costs|service costs|gaps dashboard|pricing dashboard"]];
  const PV_KIND_RE = { video: /\b(videos?|clips?|music videos?)\b/, song: /\b(songs?|cancion(es)?|music)\b/, podcast: /\bpodcasts?\b/, story: /\b(stor(y|ies)|historias?|cuentos?)\b/, poem: /\b(poems?|poemas?)\b/, news: /\b(news|noticias?)\b/,
    reading: /\b(readings?|texts?|lecturas?)\b/, history: /\bhistory\b/, culture: /\bculture\b/, unit: /\b(units?|lessons?|unidad(es)?|leccion(es)?)\b/, guide: /\bguides?\b/, grammar: /\bgrammar\b/, writing: /\b(writing|essay|letter|email|escritura)\b/, exam: /\b(exams?|examen(es)?|mock)\b/, cards: /\b(flashcards|cards|tarjetas)\b/, screen: /\b(screen|page|section|tab|pantalla|seccion)\b/ };
  const PV_LISTENK = { song: "song", podcast: "podcast", story: "story", poem: "poem", news: "news", reading: "reading", history: "history", culture: "culture" };
  const pvToks = (t) => pvStrip(t).replace(/[^a-z0-9ñ ]+/g, " ").split(/\s+/).filter((w) => w && !/^(the|a|an|of|to|my|el|la|los|las|un|una|de|del|y|and|in|en|on|for|por|con|with|by|al|que|is|this|that|me|please)$/.test(w));
  function pvIndex() {
    if (PV.idx && Date.now() - PV.idxAt < 30000) return PV.idx;
    const I = []; const add = (h, names, kind, lv, extra) => I.push(Object.assign({ h, names: names.filter(Boolean).map(String), kind, lv: lv || "", label: String(names[0] || h) }, extra || {}));
    PV_SCREENS.forEach(([h, n]) => add(h, n.split("|"), "screen", "", { label: n.split("|")[0] }));
    try { COURSE.forEach((L) => { const N = L.name, l = L.id; add(l, ["level " + N, N + " level", "nivel " + N, N + " course"], "level", l, { label: "level " + N });
      (L.units || []).forEach((u, i) => add(l + "-u" + (i + 1), [u.t, u.s, "unit " + (i + 1) + " " + N, N + " unit " + (i + 1)], "unit", l, { label: N + " unit " + (i + 1) + ": " + (u.s || u.t) }));
      add(l + "-cards", [N + " flashcards", "flashcards " + N], "cards", l); add(l + "-exam", [N + " exam", N + " test", "examen " + N], "exam", l); }); } catch (e) {}
    if (!PV.titleEn) { try { PV.titleEn = JSON.parse(document.getElementById("pv-titles").textContent.replace(/<\\\//g, "</")); } catch (e) { PV.titleEn = {}; } }
    try { LISTEN.forEach((x) => add(x.id, [x.t, PV.titleEn[x.id], x.en, (x.cat || "") + " " + x.t, /^[A-Za-z ,'’-]+$/.test(x.s || "") ? x.s : ""], PV_LISTENK[x.cat] || "reading", x.lvl, { label: x.t })); } catch (e) {}
    try { (typeof MY !== "undefined" ? MY : []).forEach((x) => add(x.id, [x.t], "reading", x.lvl, { label: x.t })); } catch (e) {}
    try { VID_START.concat(typeof vMine === "function" ? vMine() : []).forEach((v) => add("video-" + v.yt, [v.t, (v.ch || "") + " " + v.t, v.ch], "video", (v.lvl || "").toLowerCase(), { label: v.t + (v.ch ? " (" + v.ch.replace(/\s*,\s*/g, ", ").slice(0, 34) + ")" : ""), cat: v.cat, artist: v.ch || "" })); } catch (e) {}
    try { GUIDES.forEach((g) => add("guia-" + g.id, [g.en, g.t, g.en + " guide"], "guide", g.lvl, { label: "the guide " + g.en })); } catch (e) {}
    try { GCAT.forEach((c) => add("g-" + c.id, [c.en, c.es, c.en + " grammar"], "grammar", "", { label: "grammar: " + c.en })); } catch (e) {}
    try { WTASKS.forEach((w) => add("escritura-" + w.id, [w.en, w.type + " " + w.lvl, (w.type || "") + " writing " + w.lvl], "writing", w.lvl, { label: "writing: " + w.type + " (" + w.lvl.toUpperCase() + ")" })); } catch (e) {}
    // Spanish titles also answer to their English words, from the app's own dictionary: «En el mercado» ~ "the market", «En la consulta del médico» ~ "the doctor"
    const gl = (w) => { try { if (typeof TG === "undefined" || !w) return ""; // prefer a noun/adjective reading: «muertos» → muerto "dead", not morir "to die"
      const cands = [w, w.replace(/s$/, ""), w.replace(/as$/, "o"), w.replace(/a$/, "o"), w.replace(/es$/, "")].filter((x, i, A) => x && A.indexOf(x) === i);
      let g = null; for (const c of cands) { const e = TG[c] || TG[pvStrip(c)]; if (e && e[2]) { if (e[1] !== "verb") { g = e; break; } g = g || e; } }
      return g ? String(g[2]).split(/[;,]/)[0].replace(/^(to|a|an|the)\s+/, "").replace(/\([^)]*\)/g, "").trim() : ""; } catch (x) { return ""; } };
    I.forEach((e) => { e.toks = e.names.map(pvToks); if (/^(story|podcast|poem|news|reading|history|culture|song|video|unit|guide)$/.test(e.kind)) { const en = pvToks(e.names[0].toLowerCase().split(/\s+/).map((w) => gl(w.replace(/[^a-záéíóúüñ]/g, ""))).filter(Boolean).join(" ")); if (en.length) e.toks.push(en); } });
    PV.idx = I; PV.idxAt = Date.now(); return I;
  }
  // the controls on screen right now: buttons, filter chips, links, with what they say (or their label)
  function pvControls() {
    const out = []; const seen = new Set();
    document.querySelectorAll("main button, main a[href], main [role=button], main summary, main select").forEach((el) => {
      if (!el.offsetParent || el.disabled || el.closest("#tutor")) return;
      const t = (el.getAttribute("aria-label") || el.textContent || "").replace(/\s+/g, " ").trim().slice(0, 70); if (!t || t.length < 2) return;
      const k = t.toLowerCase() + "|" + (el.getAttribute("href") || el.dataset.act || ""); if (seen.has(k)) return; seen.add(k);
      out.push({ el, label: t, toks: [pvToks(t)], kind: "control", names: [t] });
    });
    return out;
  }
  const pvStem = (w) => w.replace(/ph/g, "f").replace(/th/g, "t").replace(/qu/g, "k").replace(/c(?=[aou])/g, "k").replace(/(ciones|cion|tions|tion)$/, "cion").replace(/(es|s)$/, "").replace(/[oae]$/, ""); // English/Spanish cognates: alphabet ~ alfabeto
  const pvTokSim = (a, b) => a === b ? 1 : (a.length >= 4 && b.length >= 4 && pvStem(a) === pvStem(b)) ? 0.9 : (a.length >= 4 && b.length >= 4 && pvSim(a, b) >= 0.75) ? 0.8 : (a.length >= 4 && b.length >= 4 && (b.startsWith(a) || a.startsWith(b))) ? 0.7 : 0;
  function pvNameScore(q, toks) { // how much of what was said is in this name, and how much of the name was said
    if (!q.length || !toks.length) return 0; let hit = 0; q.forEach((w) => { let b = 0; toks.forEach((x) => { b = Math.max(b, pvTokSim(w, x)); }); hit += b; });
    let cov = 0; toks.forEach((x) => { let b = 0; q.forEach((w) => { b = Math.max(b, pvTokSim(w, x)); }); cov += b; });
    return 0.65 * (hit / q.length) + 0.35 * (cov / toks.length); }
  const PV_FINDV = /^(please |can you |could you |i want to |i would like to |id like to |lets |let us |i wanna )?(open|play|put on|show( me)?|go to|take me to|find( me)?|search( for)?|look for|watch|listen to|hear|read( me)?|start|load|bring up|give me|get me|tap|press|click|hit|select|choose|pick|toca|pulsa|elige|escoge|abre|pon(me)?|reproduce|muestrame|ensename|busca(me)?|llevame a|ve a|ir a|quiero (ver|escuchar|leer|abrir)|lee(me)?)( on| up)? /;
  function pvLookup(raw, s, c) {
    let q0 = s.replace(PV_FINDV, "").replace(/^(the|a|an|el|la|los|las|un|una|some|algo de) /, "").trim();
    const tap = /^(tap|press|click|hit|toca|pulsa)\b/.test(s), byArtist = /\b(by|de|from) ([a-z ]+)$/.exec(q0);
    const wantK = Object.keys(PV_KIND_RE).filter((k) => PV_KIND_RE[k].test(q0)); const lv = pvLv(q0);
    let q = tap ? pvToks(q0) : pvToks(q0).filter((w) => !/^(video|videos|clip|song|songs|cancion|canciones|music|podcast|podcasts|story|stories|historia|poem|poema|news|noticias|reading|text|unit|lesson|guide|grammar|screen|page|section|tab|button|filter|chip|something|algo|one|play|open|a1|a2|b1|b2|c1|c2|level|nivel)$/.test(w));
    const all = []; if (!q.length) return []; // only a kind ("of video"): the registry's "play a video" / "open videos" answer that
    const ctl = pvControls(); ctl.forEach((e) => { const sc = q.length ? Math.max(...e.toks.map((t) => pvNameScore(q, t))) : 0; if (sc > 0) all.push({ e, sc: sc + (tap ? 0.15 : 0.05) }); });
    if (!tap) pvIndex().forEach((e) => { if (lv && e.lv && e.lv !== lv && e.kind !== "screen") return;
      let sc = q.length ? Math.max(...e.toks.map((t) => pvNameScore(q, t))) : (wantK.includes(e.kind) ? 0.3 : 0);
      if (e.artist && q.length) { // a singer's name alone ("Shakira", "Karol G") picks their video
        e.artist.split(/,|&| y | and | feat\.? | ft\.? /i).forEach((a) => { const at = pvToks(a); if (!at.length) return; const v = pvNameScore(byArtist ? pvToks(byArtist[2]) : q, at); if (v >= 0.8) sc = Math.max(sc, 0.9 + 0.05 * (v - 0.8)); }); }
      if (wantK.length) { if (wantK.includes(e.kind) || (wantK.includes("song") && e.kind === "video" && e.cat === "musica") || (wantK.includes("video") && e.kind === "video")) sc += 0.12; else if (e.kind !== "screen") sc -= 0.12; }
      if (lv && e.lv === lv) sc += 0.05; if (sc > 0) all.push({ e, sc }); });
    all.sort((a, b) => b.sc - a.sc);
    const out = []; const used = new Set(); for (const x of all) { const k = x.e.h || x.e.label; if (used.has(k)) continue; used.add(k); out.push(x); if (out.length >= 5) break; }
    return out;
  }
  const PV_KNAME = { video: "the video", song: "the song", podcast: "the podcast", story: "the story", poem: "the poem", news: "the news story", reading: "the text", history: "the history text", culture: "the culture text", unit: "", guide: "", grammar: "", writing: "", exam: "the exam", cards: "the flashcards", screen: "", level: "", control: "the button" };
  const pvFoundLabel = (e) => (e.kind === "control" ? "press «" + e.label + "»" : e.kind === "screen" ? "open " + e.label : e.kind === "level" || e.kind === "unit" || e.kind === "guide" || e.kind === "grammar" || e.kind === "writing" ? "open " + e.label : (PV_KNAME[e.kind] ? PV_KNAME[e.kind] + " " : "") + "«" + e.label + "»");
  async function pvOpenFound(e) {
    if (e.kind === "control") { // press it, then check that something actually changed (the page, its state, or the screen) before saying it worked
      const before = { h: location.hash, n: PV_RT.n, p: e.el.getAttribute("aria-pressed"), x: e.el.getAttribute("aria-expanded"), html: app.innerHTML.length, open: !!document.querySelector("dialog[open], .sheet:not([hidden]), #sheet:not([hidden])") };
      try { e.el.scrollIntoView({ block: "center" }); e.el.click(); } catch (x) { return { ok: false, say: "I couldn't press «" + e.label + "»." }; }
      const changed = await pvUntil(() => location.hash !== before.h || PV_RT.n !== before.n || (e.el.isConnected && (e.el.getAttribute("aria-pressed") !== before.p || e.el.getAttribute("aria-expanded") !== before.x)) || app.innerHTML.length !== before.html || !!document.querySelector("dialog[open], .sheet:not([hidden]), #sheet:not([hidden])") !== before.open || (typeof listening !== "undefined" && listening) || hfSpeaking(), 1500);
      return changed ? { ok: true, say: "", quiet: 1 } : { ok: false, say: "I pressed «" + e.label + "», but nothing seemed to change." }; }
    if (/^(video|song|podcast|story|poem|news)$/.test(e.kind)) return pvMediaPlay({ h: e.h, t: e.label.replace(/ \([^)]*\)$/, ""), kind: e.kind === "video" ? "video" : e.kind });
    return pvGo(e.h, e.label);
  }
  Object.assign(PVH, {
    "find.open": async (e, c) => { // an entry chosen from a list, or what was said ("find La camisa negra", "tap Music")
      if (e && typeof e === "object") return pvOpenFound(e);
      const s = String(e || ""), f = pvLookup(s, s, c || pvCtx());
      if (f[0] && f[0].sc >= 0.6 && (!f[1] || f[0].sc - f[1].sc >= 0.1)) return pvOpenFound(f[0].e);
      const shown = f.filter((x) => x.sc >= 0.45).slice(0, 3);
      if (!shown.length) return { ok: false, say: "I can't find “" + s.replace(PV_FINDV, "") + "” in the app. Try another name, or say “what can I do here”." };
      PV.choice = { opts: shown.map((x) => ({ sc: x.sc, say: pvFoundLabel(x.e), run: { id: "find.open", purpose: "open" }, arg: x.e })), until: Date.now() + 30000 };
      return { ok: true, say: shown.length === 1 ? "Did you mean " + pvFoundLabel(shown[0].e) + "? Say yes, or another name." : "Did you mean " + shown.map((x, i) => ["one", "two", "three"][i] + ", " + pvFoundLabel(x.e)).join("; ") + "? Say the number.", keep: 1 };
    },
  });
  // the fallback for anything that isn't a known command: do it when it's clear, otherwise offer the closest three; never silently into the chat
  function pvResolve(raw, s, c, origin) {
    if (!s) return false;
    const conv = /^(what|how|why|when|where|who|which|is|are|do|does|can you explain|explain|tell me about|que|como|por que|cuando|donde|quien|cual|significa|what does)\b|\?\s*$/.test(s) && !/^(what can i|what is on|whats on|what am i)/.test(s);
    const tutorOpen = document.body.classList.contains("tutor-open");
    if (origin !== "hf" && !PV_ACTV.test(s) && !PV_APPN.test(s)) return false; // typed or panel speech without any instruction words: it's for Profe
    if (origin === "hf" && (conv || tutorOpen) && !PV_ACTV.test(s)) return false; // a question, or a conversation already going on: Profe answers it
    if (c.drill || c["runner-text"] || c["runner-open"]) return false;
    const f = pvLookup(raw, s, c);
    // registry actions whose examples are close to what was said
    const reg = []; for (const a of PVR.actions) { if (a.voice !== "complete" || (a.when && !pvWhen(a.when, c)) || /^(hf\.|meta\.|q\.|session\.|find\.)/.test(a.id) || (a.id === "video.play" && !c.video)) continue;
      let best = 0, ex = a.en[0]; (a.en || []).concat(a.es || []).forEach((e) => { const v = pvSim(pvNorm(e), s); if (v > best) { best = v; ex = e; } }); if (best >= 0.45) reg.push({ a, ex, sc: best - 0.05 }); }
    reg.sort((x, y) => y.sc - x.sc);
    const opts = f.map((x) => ({ sc: x.sc, say: pvFoundLabel(x.e), run: { id: "find.open", purpose: "open" }, arg: x.e })).concat(reg.slice(0, 2).map((x) => ({ sc: x.sc, say: "“" + x.ex + "”", run: x.a, arg: pvNorm(x.ex) })));
    opts.sort((x, y) => y.sc - x.sc);
    const top = opts[0], second = opts[1];
    pvLog("find «" + s + "» → " + opts.slice(0, 3).map((o) => o.say + " " + o.sc.toFixed(2)).join(" · "));
    if (top && top.sc >= 0.82 && (!second || top.sc - second.sc >= 0.12)) { pvExec(top.run, top.arg, origin, false, top.arg); return true; } // clear: do it
    const shown = opts.filter((o) => o.sc >= 0.45).slice(0, 3);
    const heard = raw.replace(/^\s*(ok(ay|ey)?|oye|hey)?\s*prof(e)?\s*,?\s*/i, "").trim();
    if (!shown.length) {
      if (origin !== "hf") return false;
      pvReply("I heard “" + heard + "”, and I can't find that in the app. " + (/^[a-z]+( [a-z]+)?$/.test(s) && !PV_APPN.test(s) ? "If it's a singer or a video that isn't in the library, you can add it: open Videos and paste a YouTube link. " : "") + "Try saying it another way, or say “what can I do here”.", origin, { listen: 1 }); return true;
    }
    PV.choice = { opts: shown, until: Date.now() + 30000 };
    const nm = ["one", "two", "three"];
    const lead = origin === "hf" ? "I heard “" + heard + "”. " : "";
    pvReply(lead + (shown.length === 1 ? "Did you mean " + shown[0].say + "? Say yes, or say it another way." : "Did you mean " + shown.map((o, i) => nm[i] + ", " + o.say).join("; ") + "? Say the number, or say it another way."), origin, { listen: 1 });
    return true;
  }
  window.__pv.index = () => pvIndex(); window.__pv.find = (t) => pvLookup(t, pvNorm(t), pvCtx()).map((x) => [x.e.h || "control", x.e.label, +x.sc.toFixed(2)]);
  // ---- "redo this question": clear one answer (right or wrong) and answer again (tools/patch_redo.py) ----
  Object.assign(PVH, {
    "q.redo": async (s) => {
      if (pvQ('[data-act="px-redo"]')) { pvClick("px-redo"); const ok = await pvUntil(() => !pvQ('[data-act="px-redo"]') && !!(pvQ("#px-in") || pvQ('[data-act="px-pick"]:not([disabled])')), 1500); return ok ? { ok: true, say: "Cleared. Try it again." } : { ok: false, say: "I couldn't clear that answer." }; }
      const all = [...document.querySelectorAll("ol.mc > li, #exf .xmc")], done = all.filter((li) => li.querySelector(".q-redo") || li.querySelector(".opt[disabled]"));
      const nm = /question (\d+|one|two|three|four|five|six|seven|eight|nine|ten)$/.exec(s), w = { one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10 };
      if (!done.length && !(nm && all.length)) return { ok: false, say: pvQ("#runner") ? "Answer the question first; then say “redo this question” to clear it." : "There's no answered question here to redo." };
      let li = null; if (nm) { const k = +nm[1] || w[nm[1]]; li = all[k - 1]; if (!li) return { ok: false, say: "There's no question " + k + " here." }; if (!li.querySelector(".opt[disabled]")) return { ok: false, say: "Question " + k + " isn't answered yet." }; }
      li = li || done.find((x) => { const r = x.getBoundingClientRect(); return r.top >= 0 && r.bottom <= innerHeight; }) || done[done.length - 1];
      window.__qRedo(li); const ok = !li.querySelector(".opt[disabled]");
      return ok ? { ok: true, say: "Cleared question " + (all.indexOf(li) + 1) + ". Choose again." } : { ok: false, say: "I couldn't clear it." };
    },
  });
  // ---- one verb or one dictionary word by name (round 3): resolved through the app's own verb index and dictionary, never guessed ----
  const pvAfter = (s, re) => { const m = re.exec(s); return m ? m[m.length - 1].replace(/^(to|el|la|un|una)\s+/, "").replace(/\s+(please|por favor|in spanish|en espanol)$/, "").trim() : ""; };
  async function pvOptsFor(items, what) { // items: [{label, run, arg}] → "Did you mean one…, two…, three…?"
    const shown = items.slice(0, 3); if (!shown.length) return null;
    PV.choice = { opts: shown.map((x) => Object.assign({ sc: 0.5 }, x)), until: Date.now() + 30000 };
    return { ok: true, say: "I couldn't find " + what + ". Did you mean " + (shown.length === 1 ? shown[0].say + "? Say yes, or another name." : shown.map((x, i) => ["one", "two", "three"][i] + ", " + x.say).join("; ") + "? Say the number."), keep: 1 };
  }
  Object.assign(PVH, {
    "nav.verb": async (s) => {
      let w = pvAfter(s, /(?:verb|verbo|conjugations? (?:of|for)(?: the verb)?)\s+(.+)$/); if (!w) return { ok: false, say: "Which verb? Say for example “open the verb comer”." };
      try { await loadIndex(); } catch (e) { return { ok: false, say: "The verb list couldn't load. Check your connection; after the first time it works offline." }; }
      const k = pvStrip(w); let i = VI.findIndex((v) => pvStrip(v[0]) === k);
      if (i < 0) { try { const rd = verbReadings(w); if (rd.length) i = VI.findIndex((v) => v[0] === rd[0].v); } catch (e) {} } // a form: «tengo» → tener
      if (i < 0) i = VI.findIndex((v) => String(v[1]).toLowerCase().split(/[;,(]/).some((g) => g.trim() === "to " + k.replace(/^to /, ""))); // English: "to eat" → comer
      if (i >= 0) return pvGo("verbo-" + (i + 1), "the verb «" + VI[i][0] + "»");
      const near = VI.slice(0, 3000).map((v, j) => ({ j, sc: pvSim(pvStrip(v[0]), k) })).filter((x) => x.sc >= 0.6).sort((a, b) => b.sc - a.sc).slice(0, 3);
      return (await pvOptsFor(near.map((x) => ({ say: "the verb «" + VI[x.j][0] + "»", run: { id: "find.open", purpose: "open" }, arg: { kind: "screen", h: "verbo-" + (x.j + 1), label: "the verb «" + VI[x.j][0] + "»" } })), "the verb “" + w + "”")) || { ok: false, say: "I can't find a verb “" + w + "” in the verb list." };
    },
    "nav.word": async (s) => {
      let w = pvAfter(s, /(?:word|dictionary entry|palabra)\s+(?:for\s+)?(.+)$/) || pvAfter(s, /^(?:look up|find|search for|check|busca|buscame|mira)\s+(.+?)\s+(?:in the dictionary|en el diccionario)$/);
      if (!w) return { ok: false, say: "Which word? Say for example “open the word casa”." };
      const english = /\b(word|entry) for\b/.test(s), lw = w.toLowerCase();
      try { await loadLex(); } catch (e) {}
      const known = (x) => { try { return !!(TG[x] || (typeof lexIdx === "function" && LEX && lexIdx(x) >= 0) || W.some((e) => e[0].toLowerCase().split(/,\s*/).includes(x))); } catch (e) { return !!TG[x]; } };
      if (!english && known(lw)) return pvGo("palabra-" + encodeURIComponent(lw), "the word «" + lw + "»");
      // English meaning → the most common Spanish word for it (the app's word list is ordered by frequency)
      const key = lw.replace(/^(to|a|an|the)\s+/, ""), hits = W.filter((e) => String(e[2]).toLowerCase().replace(/\([^)]*\)/g, "").split(/[;,]/).map((x) => x.trim().replace(/^(to|a|an|the)\s+/, "")).includes(key));
      if (hits.length) { const es = hits[0][0].split(/,\s*/)[0].replace(/^(el|la|los|las)\s+/, ""); return pvGo("palabra-" + encodeURIComponent(es), "the word «" + es + "» (" + key + ")"); }
      if (known(lw)) return pvGo("palabra-" + encodeURIComponent(lw), "the word «" + lw + "»");
      const near = W.slice(0, 3000).map((e) => ({ es: e[0].split(/,\s*/)[0].replace(/^(el|la|los|las)\s+/, ""), sc: pvSim(pvStrip(e[0].split(/,\s*/)[0].replace(/^(el|la|los|las)\s+/, "")), pvStrip(lw)) })).filter((x) => x.sc >= 0.65).sort((a, b) => b.sc - a.sc).filter((x, i, A) => A.findIndex((y) => y.es === x.es) === i).slice(0, 3);
      return (await pvOptsFor(near.map((x) => ({ say: "the word «" + x.es + "»", run: { id: "find.open", purpose: "open" }, arg: { kind: "screen", h: "palabra-" + encodeURIComponent(x.es), label: "the word «" + x.es + "»" } })), "the word “" + w + "”")) || { ok: false, say: "I can't find “" + w + "” in the dictionary." };
    },
  });
  // ---- exam papers and the quick drill by voice (round 3, 15 Nov 2026) ----
  // exam: questions are numbered on screen (1, 2, 3… across the paper); the "current" question is the one Profe last read or the first unanswered one
  const PV_NUMW = { one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10, eleven: 11, twelve: 12, uno: 1, una: 1, dos: 2, tres: 3, cuatro: 4, cinco: 5, seis: 6, siete: 7, ocho: 8, nueve: 9, diez: 10, once: 11, doce: 12 };
  const PV_LET = { a: 0, ay: 0, ah: 0, b: 1, be: 1, bee: 1, c: 2, ce: 2, see: 2, sea: 2, se: 2, d: 3, de: 3, dee: 3, first: 0, primera: 0, second: 1, segunda: 1, third: 2, tercera: 2, fourth: 3, cuarta: 3 };
  const pvNum = (x) => (x == null ? null : /^\d+$/.test(x) ? +x : PV_NUMW[x] || null);
  const pvExQs = () => [...document.querySelectorAll("main .exq")].filter((q) => q.querySelector('[data-act="ex-ans"]'));
  const pvExDone = (q) => !!q.querySelector('[data-act="ex-ans"][aria-pressed="true"]');
  function pvExCur() { const Q = pvExQs(); if (PV.exI != null && Q[PV.exI]) return PV.exI; const i = Q.findIndex((q) => !pvExDone(q)); return i < 0 ? 0 : i; }
  const pvExStem = (q) => [...q.childNodes].filter((n) => !(n.nodeType === 1 && /\b(exn|exopts|q-redo)\b/.test(n.className || ""))).map((n) => n.textContent).join(" ").replace(/\s+/g, " ").trim().slice(0, 120);
  const pvExOpts = (q) => [...q.querySelectorAll('[data-act="ex-ans"]')].map((b) => b.textContent.replace(/^\s*[a-d]\)\s*/i, "").trim());
  const pvExRead = (i) => { const q = pvExQs()[i]; if (!q) return ""; const o = pvExOpts(q); return "Question " + (i + 1) + ": «" + pvExStem(q) + "» " + o.map((x, k) => "abcd"[k] + ") «" + x + "»").join(" "); };
  function pvExNumber() { pvExQs().forEach((q, i) => { let n = q.querySelector(":scope > .exn"); if (!n) { n = document.createElement("span"); n.className = "exn"; n.setAttribute("aria-hidden", "true"); q.insertBefore(n, q.firstChild); } if (n.textContent !== String(i + 1)) n.textContent = String(i + 1); q.classList.toggle("ex-cur", PV.exShow === i); }); }
  setInterval(() => { if (pvQ('main [data-act="ex-ans"]')) pvExNumber(); else PV.exI = PV.exShow = null; }, 700);
  async function pvExPick(i, k) {
    const q = pvExQs()[i]; if (!q) return { ok: false, say: "There's no question " + (i + 1) + " on this paper." };
    const b = q.querySelectorAll('[data-act="ex-ans"]')[k]; if (!b) return { ok: false, say: "Question " + (i + 1) + " has only " + q.querySelectorAll('[data-act="ex-ans"]').length + " options." };
    b.click(); const ok = await pvUntil(() => b.getAttribute("aria-pressed") === "true", 800);
    if (!ok) return { ok: false, say: "I couldn't mark that answer." };
    const Q = pvExQs(), nx = Q.findIndex((x, j) => j > i && !pvExDone(x)), left = Q.filter((x) => !pvExDone(x)).length;
    PV.exI = nx >= 0 ? nx : null; PV.exShow = PV.exI; if (nx >= 0) try { Q[nx].scrollIntoView({ block: "center", behavior: "smooth" }); } catch (e) {}
    return { ok: true, say: "Question " + (i + 1) + ": " + "abcd"[k] + "." + (nx >= 0 ? " Next, " + pvExRead(nx) : left ? " " + left + " still unanswered. Say “what's left”." : " That's every question. Say “submit the paper” when you're ready.") };
  }
  function pvAnswerX(raw, s, c, origin) {
    if (c.exam) { // an option's words for the current question ("en la playa")
      const i = pvExCur(), q = pvExQs()[i]; if (!q) return false; const o = pvExOpts(q).map((x) => pvStrip(x).replace(/[^a-z0-9ñ ]/g, "").trim()), n = pvStrip(raw).replace(/[^a-z0-9ñ ]/g, "").trim();
      let best = -1, bs = 0; o.forEach((x, k) => { const v = Math.max(pvSim(x, n), x && n.includes(x) ? 0.9 : 0); if (v > bs) { bs = v; best = k; } });
      if (best >= 0 && bs >= 0.6) { pvExec({ id: "exam.answer", purpose: "answer" }, { i, k: best }, origin, false); return true; }
      return false;
    }
    if (c.qdrill) { // the quick drill: say the words on the cards ("el agua, water"), or type-in answers
      const inp = pvQ("main input:not([readonly])"); const chk = pvQ('main [data-act="dr-check"]');
      if (inp && chk) { inp.value = raw.trim(); inp.dispatchEvent(new Event("input", { bubbles: true })); pvExec({ id: "drill.do", purpose: "check" }, "check", origin); return true; }
      const btns = [...document.querySelectorAll('main [data-act="dr-m"], main [data-act="dr-pick"], main [data-act="dr-b"]')].filter((b) => b.offsetParent && !b.disabled && !/\b(done|ok|matched|gone)\b/.test(b.className));
      const n = " " + pvStrip(raw).replace(/[^a-z0-9ñ ]/g, " ").replace(/\s+/g, " ").trim() + " ";
      const hits = btns.map((b) => ({ b, t: pvStrip(b.textContent).replace(/[^a-z0-9ñ ]/g, " ").replace(/\s+/g, " ").trim() })).filter((x) => x.t && n.includes(" " + x.t.replace(/^(el|la|los|las) /, "") + " ")).sort((a, b) => n.indexOf(a.t) - n.indexOf(b.t));
      if (!hits.length) return false;
      pvExec({ id: "drill.do", purpose: "tap" }, { tap: hits.slice(0, 2).map((x) => x.b) }, origin); return true;
    }
    return false;
  }
  Object.assign(PVH, {
    "exam.answer": async (s) => {
      if (s && typeof s === "object") return pvExPick(s.i, s.k);
      const m = /(?:(?:task|tarea) (\d+|\w+) )?(?:(?:question|number|pregunta|numero|change question|change) (\d+|\w+)[ ,]*(?:to |is |es )?)?(?:answer |respuesta |letter |letra |option |opcion )?(\w+)(?: one)?$/.exec(s.replace(/^change /, ""));
      if (!m || !(m[3] in PV_LET)) return { ok: false, say: "Say the letter, for example “question 3, b”, or the words of the answer." };
      let i = pvExCur(); const Q = pvExQs();
      if (m[1] && m[2]) { const t = pvNum(m[1]), qn = pvNum(m[2]); const heads = [...document.querySelectorAll("main h2, main h3")].filter((h) => /^tarea\s*\d/i.test(h.textContent.trim())); const h = heads[t - 1]; if (!h) return { ok: false, say: "There's no task " + t + "." };
        const inTask = Q.filter((q) => h.compareDocumentPosition(q) & 4 && (!heads[t] || q.compareDocumentPosition(heads[t]) & 4)); if (!inTask[qn - 1]) return { ok: false, say: "Task " + t + " has " + inTask.length + " questions." }; i = Q.indexOf(inTask[qn - 1]); }
      else if (m[2]) { const qn = pvNum(m[2]); if (!qn) return { ok: false, say: "Which question number?" }; i = qn - 1; }
      return pvExPick(i, PV_LET[m[3]]);
    },
    "exam.go": async (s) => {
      const Q = pvExQs(); if (!Q.length) return { ok: false, say: "There are no questions on this screen." };
      let i = pvExCur(); const n = /(?:question|pregunta|number|numero) (\d+|\w+)$/.exec(s), t = /(?:task|tarea) (\d+|\w+)$/.exec(s);
      if (/^(next|siguiente|la siguiente)/.test(s)) i = Math.min(Q.length - 1, i + 1); else if (/^(previous|back|go back|anterior|la anterior)/.test(s)) i = Math.max(0, i - 1);
      else if (n) { const k = pvNum(n[1]); if (!k || !Q[k - 1]) return { ok: false, say: "This paper has " + Q.length + " questions." }; i = k - 1; }
      else if (t) { const k = pvNum(t[1]); const heads = [...document.querySelectorAll("main h2, main h3")].filter((h) => /^tarea\s*\d/i.test(h.textContent.trim())); const h = heads[k - 1]; if (!h) return { ok: false, say: "This paper has " + heads.length + " tasks." }; const j = Q.findIndex((q) => h.compareDocumentPosition(q) & 4); if (j >= 0) i = j; try { h.scrollIntoView({ block: "start", behavior: "smooth" }); } catch (e) {} }
      PV.exI = PV.exShow = i; try { Q[i].scrollIntoView({ block: "center", behavior: "smooth" }); } catch (e) {}
      return { ok: true, say: pvExRead(i) };
    },
    "exam.status": async () => { const Q = pvExQs(), left = Q.map((q, i) => (pvExDone(q) ? 0 : i + 1)).filter(Boolean); return { ok: true, say: left.length ? left.length + " of " + Q.length + " unanswered: question" + (left.length > 1 ? "s " : " ") + left.slice(0, 12).join(", ") + (left.length > 12 ? "…" : "") + "." : "All " + Q.length + " questions are answered. Say “submit the paper” when you're ready." }; },
    "exam.play": async () => { const Q = pvExQs(), q = Q[pvExCur()]; const plays = [...document.querySelectorAll('main [data-act="ex-play"]')]; if (!plays.length) return { ok: false, say: "This paper has no recordings." };
      const b = (q && plays.filter((p) => p.compareDocumentPosition(q) & 4).pop()) || plays[0]; b.click(); const ok = await pvUntil(() => hfSpeaking() || /pause|stop|playing|⏸/i.test(b.textContent + (b.getAttribute("aria-pressed") || "")), 2500); return ok ? { ok: true, say: "", quiet: 1 } : { ok: false, say: "I pressed play, but I can't tell if the recording started." }; },
    "exam.submit": async () => { if (!pvClick("ex-submit")) return { ok: false, say: "There's nothing to submit here." }; const ok = await pvUntil(() => !pvQ('main [data-act="ex-ans"]') || pvQ(".exresult"), 3000); return ok ? { ok: true, say: "Submitted. " + ((pvQ(".exresult h2") || {}).textContent || "Your result is on the screen.") } : { ok: false, say: "I pressed submit, but the paper didn't close. Check the screen." }; },
    "drill.do": async (s) => {
      if (s && typeof s === "object" && s.tap) { const before = s.tap.map((b) => b.className + b.disabled + b.isConnected); s.tap.forEach((b, k) => setTimeout(() => b.click(), k * 250)); await pvWait(s.tap.length * 250 + 300);
        const changed = s.tap.some((b, k) => b.className + b.disabled + b.isConnected !== before[k]); return changed ? { ok: true, say: "", quiet: 1 } : { ok: false, say: "I tapped " + s.tap.map((b) => "«" + b.textContent.trim() + "»").join(" and ") + ", but nothing changed." }; }
      const map = [[/^(skip|salta|saltar|pasa)/, "dr-skip"], [/^(next|siguiente|continue|continua)/, "dr-next"], [/^(again|try again|otra vez|de nuevo|repeat)/, "dr-again"], [/^(check|comprueba|corregir|correct it)/, "dr-check"], [/^(play|listen|escuchar|escucha|pon el audio)/, "dr-play"], [/^(undo|deshacer)/, "dr-un"]];
      const hit = map.find(([re]) => re.test(s)); if (!hit) return { ok: false, say: "Say the words on the cards, or “skip”, “check”, “next”, “again”." };
      const html0 = app.innerHTML.length; if (!pvClick(hit[1])) return { ok: false, say: "There's no “" + s + "” button on this card." };
      const ok = await pvUntil(() => app.innerHTML.length !== html0 || hfSpeaking(), 1200); return ok ? { ok: true, say: "", quiet: 1 } : { ok: false, say: "I pressed it, but nothing changed." };
    },
  });
