  /* ===================== Profe hands-free: capability registry, commands, "Ok Profe" (tools/PROFE_HANDSFREE_BRIEF.md) ===================== */
  const PVR = (() => { try { return JSON.parse(document.getElementById("pv-registry").textContent); } catch (e) { return { actions: [], routes: {}, acts: {} }; } })();
  const PV_DIAG = [];
  window.__pvLog = (x) => pvLog(x);
  function pvLog(x) { PV_DIAG.push(new Date().toTimeString().slice(0, 8) + " " + x); if (PV_DIAG.length > 200) PV_DIAG.shift(); try { window.__vlog("mic", x); } catch (e) {} }
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
  const PV_TOPIC = [["superlatives?( and diminutives?)?|superlativos?( y diminutivos?)?|diminutives?|diminutivos?|augmentatives?|aumentativos?", "superlativos-diminutivos"], ["past tenses?|the past|past tense|pasados?|el pasado|los pasados|tiempos pasados|tiempo pasado", "pasados"], ["preterite( (vs|versus|and|or) (the )?imperfect)?|imperfect|preterito( (vs|y|o) imperfecto)?|indefinido|imperfecto", "pret-imp"],
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
    if (paused && HF.wasPlaying && HF.wasPlaying === location.hash) playing = true; // held by "Ok Profe": "pausa" still means pause it
    const paged = document.body.classList.contains("paged") && !!window.__lf;
    return { paged, unit: run, runner: q, "runner-mc": mc, "runner-text": txt, "runner-fb": fb, "runner-open": mc || txt, guide: !!pvQ('[data-act="ra-start"]'), playing, paused, player: !!pvQ("#pl-rate"),
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
  async function pvGo(h, label, labelEs) {
    // v256 (live Claude test): in a Spanish call the confirmation was English («Here's the guide: Ser vs. estar.»)
    const es = !!window.__vcOn, le = labelEs || "la página";
    if (location.hash.slice(1) === h) return { ok: true, say: es ? "Ya estás en " + le + "." : "You're already in " + label + "." };
    pvMark();
    pvCloseProfe(); const n0 = PV_RT.n; location.hash = h;
    // wait for the app to actually render the new page (the old page's content must not count as success)
    const ok = await pvUntil(() => location.hash.slice(1) === h && PV_RT.n > n0 && app.children.length && !/^\s*Loading/.test(app.textContent), 3000);
    return ok ? { ok: true, say: es ? "¡Listo! Aquí tienes " + le + "." : "Here's " + label + "." } : { ok: false, say: es ? "No he podido abrir " + le + ". ¿Seguimos hablando mientras tanto?" : "I couldn't open " + label + "." };
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
    "nav.practice": () => pvGo("practicar", "Practice"), "nav.listen": () => pvGo("leer", "Read & Listen"), "nav.read": () => pvGo("leer", "Read & Listen"), "nav.write": () => pvGo("escritura", "Writing"),
    "nav.verbs": () => pvGo("verbos", "the verbs"), "nav.grammar": () => pvGo("gramatica", "Grammar"),
    "nav.gcat": (s) => { const c = pvFind(s, PV_GCAT); if (!c) return { ok: false, say: "Which part of speech?" }; return c === "reflexivos" ? pvGo("verbos-reflexivos", "reflexive verbs") : pvGo("g-" + c, (GCAT.find((x) => x.id === c) || { en: c }).en); },
    "nav.guides": () => pvGo("guias", "the guides"),
    "nav.guide": (s) => { const t = pvFind(s, PV_TOPIC); if (!t) return { ok: false, say: "Which topic?" }; return pvGo("guia-" + t, "the guide: " + (GUIDES.find((g) => g.id === t) || { en: t }).en, "la guía «" + (GUIDES.find((g) => g.id === t) || { t: t }).t + "»"); },
    "practise.topic": async (s) => { const t = pvFind(s, PV_TOPIC); if (!t) return { ok: false, say: "Which topic would you like to practise?" }; const g = GUIDES.find((x) => x.id === t), r = await pvGo("guia-" + t, "the guide: " + (g ? g.en : t)); if (!r.ok) return r;
      return pvAskProfe("Let's practise " + (g ? g.en : t) + ". Give me one short exercise at my level, then wait for my answer and correct it."); },
    "practise.translate": async () => { tOpen(); await pvUntil(() => document.body.classList.contains("tutor-open"), 800); prGo("trans"); const ok = await pvUntil(() => typeof PR !== "undefined" && PR && PR.kind === "tr" && !!PR.it, 4000); return { ok, say: ok ? "" : "I couldn't start the translation practice.", own: ok ? 1 : 0 }; },
    "practise.conj": async () => { tOpen(); await pvUntil(() => document.body.classList.contains("tutor-open"), 800); prGo("conj"); const ok = await pvUntil(() => typeof PR !== "undefined" && PR && PR.kind === "cj" && !!PR.it, 4000); return { ok, say: ok ? "" : "I couldn't start the conjugation drill.", own: ok ? 1 : 0 }; },
    "practise.convo": async () => { tOpen(); tView = "practice"; tRender(); return { ok: await pvUntil(() => document.body.classList.contains("tutor-open"), 800), say: "Pick a role-play, or just start talking in Spanish." }; },
    "nav.frases": () => pvGo("frases", "the Survival Kit"), "nav.visual": () => pvGo("visual", "the Picture dictionary"),
    "nav.words": () => pvGo("palabras", "the word lists"),
    "nav.vocab": (s) => { const lv = pvLv(s) || pvHere() || curLevel(); return pvGo(lv + "-vocab", "the " + pvLvName(lv) + " vocabulary"); },
    "nav.cards": (s) => { const lv = pvLv(s) || pvHere() || curLevel(); return pvGo(lv + "-cards", "the " + pvLvName(lv) + " flashcards"); },
    "nav.review": () => pvGo("repaso", "Review"), "nav.mistakes": () => pvGo("errores", "your mistakes"), "nav.progress": () => pvGo("progreso", "your progress"), "nav.plan": () => pvGo("plan", "your study plan"),
    "video.next": async () => { const b = document.querySelector('[data-act="v-next"]'); if (!b) return { ok: false, say: "Open a video first." }; if (b.disabled) return { ok: false, say: "This is the last video in the list." }; const h0 = location.hash; b.click(); return { ok: await pvUntil(() => location.hash !== h0, 1500), say: "", quiet: 1 }; }, "nav.cheats": () => pvGo("chuletas", "the Revision Cheat Sheets"),
    "nav.cheat": (s) => { const t = pvFind(s, PV_TOPIC); if (!t) return pvGo("chuletas", "the Revision Cheat Sheets"); return pvGo("chuleta-" + t, "the cheat sheet: " + (GUIDES.find((g) => g.id === t) || { en: t }).en); },
    "plan.setup": async () => { const o = PV.org || "chat"; if (o !== "hf") { tOpen(); await pvUntil(() => document.body.classList.contains("tutor-open"), 800); } planChatStart(o === "voice" && !document.body.classList.contains("tutor-open") ? "hf" : o); return { ok: planChatOn(), own: 1, say: "" }; }, "nav.settings": () => pvGo("ajustes", "Settings"),
    "nav.exams": () => pvGo("examenes", "the full exams"),
    "nav.exam": (s) => { const here = /^#(a1|a2|b1|b2|c1|c2)-examen-(\d+)/.exec(location.hash) || [], lv = pvLv(s) || here[1] || "a1", n = pvN(s) || (here[2] ? +here[2] : 0), paper = pvFind(s, PV_PAPER); if (!n) return { ok: false, say: "Which exam number?" }; if ((typeof EXREADY !== "undefined" ? EXREADY[lv] || 0 : 0) < n) return { ok: false, say: "DELE " + pvLvName(lv) + " has " + ((typeof EXREADY !== "undefined" && EXREADY[lv]) || 0) + " exams ready." };
      return pvGo(lv + "-examen-" + n + (paper ? "-" + paper : ""), "DELE " + pvLvName(lv) + " exam " + n + (paper ? ", " + { lectura: "reading", auditiva: "listening", escritura: "writing", oral: "speaking" }[paper] : "")); },
    "exam.reset": async (s) => { const n = pvN(s), k = "a1-" + n; if (!n) return { ok: false, say: "Which exam?" }; if (!(S.ex && S.ex[k])) return { ok: false, say: "Exam " + n + " has no results to clear." };
      pvClick("ex-reset", { k }); return (await pvUntil(() => !(S.ex && S.ex[k]), 800)) ? { ok: true, say: "Cleared the results of exam " + n + "." } : { ok: false, say: "I couldn't clear them." }; },
    "nav.videos": () => pvGo("videos", "Videos"), "nav.placement": () => pvGo("nivel", "the placement test"), "nav.library": () => pvGo("biblioteca", "the library"), "nav.resources": () => pvGo("recursos", "Resources"),
    "nav.back": async () => { const h0 = location.hash; pvCloseProfe(); history.back(); const ok = await pvUntil(() => location.hash !== h0, 900); return ok ? { ok: true, say: "Back." } : { ok: false, say: "There's nowhere to go back to." }; },
    "q.pick": async (s) => { const n = pvOpts().length, o = pvOrd(s); if (o == null || !n) return { ok: false, say: "Which answer?" }; const i = o < 0 ? n - 1 : o; if (i >= n) return { ok: false, say: "There are only " + n + " options." };
      pvClick("px-pick", { o: i }); const ok = await pvUntil(() => pvQ('#runner [data-act="px-next"]'), 800); return ok ? { ok: true, say: pvFeedback(), fb: 1 } : { ok: false, say: "That answer didn't register." }; },
    "q.check": async () => { const i = pvQ("#px-in"); if (!i || !i.value.trim()) return { ok: false, say: "Say or type your answer first." }; pvClick("px-submit"); const ok = await pvUntil(() => pvQ('#runner [data-act="px-next"]') || pvQ("#runner .sk-hint"), 800); const hint = !pvQ('#runner [data-act="px-next"]') && pvQ("#runner .sk-hint"); /* the answer policy: a near miss gets a hint and one more try */ return hint ? { ok: true, say: "Casi. " + hint.textContent.replace(/^💡\s*/, "") } : ok ? { ok: true, say: pvFeedback(), fb: 1 } : { ok: false, say: "I couldn't check it." }; },
    "q.next": async () => { const i0 = PX.i; pvClick("px-next"); const ok = await pvUntil(() => PX.i !== i0 || PX.phase === "end", 800); return ok ? { ok: true, say: PX.phase === "end" ? pvScore() : "", next: 1 } : { ok: false, say: "There's no next question yet: answer this one first, or say skip." }; },
    "q.prev": async () => { const i0 = PX.i; if (!pvClick("px-prev")) return { ok: false, say: "This is the first question." }; const ok = await pvUntil(() => PX.i !== i0, 800); return { ok, say: ok ? "" : "I couldn't go back.", next: 1 }; },
    "q.skip": async () => { const i0 = PX.i; if (!pvClick("px-skip")) return { ok: false, say: "You can't skip this one." }; const ok = await pvUntil(() => PX.i !== i0 || PX.phase === "end", 800); return { ok, say: ok ? (PX.phase === "end" ? pvScore() : "Skipped.") : "I couldn't skip it.", next: 1 }; },
    "q.show": async () => { if (!pvClick("px-dunno")) return { ok: false, say: "There's no answer to show." }; const ok = await pvUntil(() => pvQ('#runner [data-act="px-next"]'), 800); return ok ? { ok: true, say: pvFeedback().replace(/^Not quite\. /, ""), fb: 1 } : { ok: false, say: "I couldn't show it." }; },
    "q.repeat": () => (HF.on ? (hfLessonStep(""), { ok: true, quiet: 1, say: "" }) : { ok: true, say: pvQuestionSpeech() }),
    "q.restart": async () => { if (!pvQ("#runner")) return { ok: false, say: "There's nothing to restart here." }; pvClick("px-restart"); const ok = await pvUntil(() => pvQ("#runner .pxq") && PX.i === 0, 1000); return { ok, say: ok ? "Starting again from question 1." : "I couldn't restart.", next: 1 }; },
    "play.pause": async () => { const c = pvCtx(); if (c.paused && HF.wasPlaying) return { ok: true, quiet: 1, say: "" }; // held by "Ok Profe": now it stays paused
      if (!c.playing) return c.paused ? { ok: true, quiet: 1, say: "" } : { ok: false, say: "Nothing is playing." }; // already paused (e.g. by "Ok Profe"): stays paused
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
    "profe.new": async () => { tOpen(); await pvWait(50); tView = "hist"; tRender(); if (!pvClick("t-new")) return { ok: false, say: "I couldn't start a new chat." }; return { ok: true, say: "New chat. ¿De qué quieres hablar?" }; },
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
    // v249: during a verb drill, short answers belong to the drill («otro verbo», «repite», «no», «cambié»), not to app commands
    // v251 (S24 log: «hoy» in a call opened Home): in a call, app commands need a command word up front
    if (window.__vcOn && !/^(profe |hey profe |ok profe )?(open|abre|abrir|ve a|vete a|vamos a la|vamos al|go to|take me|ll[eé]vame|muestra|ens[eé][nñ]ame|show|pon|play|reproduce|busca|search|cierra|close|start|empieza|comienza)\b/.test(s)) return false;
    // v251: outside a call only answer-shaped text goes to the drill («yo cambié», «otro verbo», «repite», «sí»); app commands
    // («close Profe», «new chat», «quiz me on this lesson») still work while a chat drill is open
    if (window.__drillOn && window.__drillOn() && s.split(" ").length <= 7 && !/^(open|abre|go to|ve a|ir a|show|muestra|take me|ll[eé]vame)\b/.test(s) &&
      (window.__vcOn || /^(yo|tu|t[uú]|el|[eé]l|ella|usted|nosotr[oa]s|vosotr[oa]s|ell[oa]s|ustedes)\b|\b(otro verbo|otra vez|repite|repitelo|rep[ií]telo|puedes repetir|cambiar de verbo|another verb|no entiendo|no lo entiendo)\b|^(s[ií]|no|vale|claro|ok)$/.test(s) ||
       (s.split(" ").length === 1 && !/^(next|skip|stop|close|help|back|again|check|siguiente|salta|para|atras|ayuda)$/.test(s)))) return false;
    if (planChatOn()) { if (window.__planAbout(raw)) { planChatTurn(raw, origin); return true; } window.__planPause(true); } // not about the plan: pause it and carry on normally
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
    [/^(leer|escuchar)$/, () => "Read & Listen", ["play a song", "play a podcast", "open the stories"]],
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
    PV.org = origin;
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
    if (c["runner-text"]) { const i = pvQ("#px-in"); i.value = raw.trim(); i.dispatchEvent(new Event("input", { bubbles: true })); i.dataset.voice = "1"; /* spoken: accents are not judged */ pvExec(PVR.actions.find((a) => a.id === "q.check"), "check", origin); return true; }
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
  // the lesson being read aloud (not Profe talking): the offline "Ok Profe" listener records the mic directly, takes no audio focus and only knows the
  // wake phrase, so it keeps listening while a lesson is read; the phone's own recogniser may take audio focus, so with it read-aloud still counts as busy
  function hfReadingOnly() { try { return typeof RA !== "undefined" && RA.on && !RA.paused && !HF.saying && !(typeof tBusy !== "undefined" && tBusy) && !(typeof listening !== "undefined" && listening) && !HF.rec && !document.body.classList.contains("tutor-open"); } catch (e) { return false; } }
  const hfWakeOverRA = () => HF.engine === "vosk" && hfReadingOnly();
  function hfSpeaking() { try { return !!(window.speechSynthesis && speechSynthesis.speaking) && !hfWakeOverRA(); } catch (e) { return false; } }
  function hfBusy() { return Date.now() < (HF.hold || 0) || !!window.__vcOn || (window.__micOwned && window.__micOwned()) || ((PV.running || 0) > 0 && Date.now() - (PV.runAt || 0) < 20000) || (typeof listening !== "undefined" && listening) || !!HF.rec || (typeof tBusy !== "undefined" && tBusy) || hfSpeaking() || HF.saying || !!(typeof EX !== "undefined" && EX && EX.recT != null) || !!(typeof VA !== "undefined" && VA && VA.on); }
  function hfState() { if (!HF.on) return "off"; if (HF.paused) return "paused"; if (hfReadingOnly() && !HF.rec) return hfWakeOverRA() && HF.eng === "on" ? "reading-wake" : "reading"; if ((typeof listening !== "undefined" && listening) || HF.rec) return "listening"; if (typeof tBusy !== "undefined" && tBusy) return "thinking"; if (hfSpeaking() || HF.saying) return "speaking"; return HF.mode === "wake" ? (HF.eng === "on" ? "wake" : "starting") : "tap"; }
  const HF_LABEL = { "reading-wake": "Reading · say “Ok Profe”", reading: "Reading · tap to talk", off: "", paused: "Paused", listening: "Listening…", thinking: "Thinking…", speaking: "Speaking", wake: "Say “Ok Profe”", starting: "Say “Ok Profe”", tap: "Tap to talk" };
  function hfPaint() {
    let p = document.getElementById("hfpill");
    if (!HF.on) { if (p) p.hidden = true; return; }
    if (!p) { p = document.createElement("div"); p.id = "hfpill"; p.setAttribute("role", "status"); p.innerHTML = '<button type="button" class="hfmain" data-act="hf-tap"><span class="hfdot" aria-hidden="true"></span><span class="hft"></span></button><button type="button" class="hfx" data-act="hf-pause" aria-label="Pause hands-free">❚❚</button>'; document.body.appendChild(p); }
    const st = hfState(); p.hidden = false; p.dataset.st = st; p.querySelector(".hft").textContent = HF_LABEL[st] + (HF.note && (st === "wake" || st === "tap") ? "" : "");
    const x = p.querySelector(".hfx"); x.dataset.act = HF.paused ? "hf-toggle" : "hf-pause"; x.textContent = HF.paused ? "✕" : "❚❚"; x.setAttribute("aria-label", HF.paused ? "Turn hands-free off" : "Pause hands-free");
    p.querySelector(".hfmain").setAttribute("aria-label", st === "tap" || st === "paused" || st === "reading" ? "Talk to Profe" : st === "speaking" ? "Interrupt Profe and talk" : "Hands-free: " + HF_LABEL[st]);
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
    try { if (hfWakeOverRA() && RA.el && /prof/i.test(RA.el.textContent || "")) { pvLog("wake ignored: the line being read mentions Profe"); return; } } catch (e) {}
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
  function hfFollow() { if (!HF.on || HF.paused) { hfEnd(); return; } try { if (typeof RA !== "undefined" && RA.on && !RA.paused) { pvLog("reading carried on: no follow-up listen"); hfEnd(); return; } } catch (e) {} pvLog("follow-up listen"); HF.engaged = true; hfCapture((t) => (t ? hfHandle(t) : hfEnd()), { startMs: 8000 }); }
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
    if (window.__vcOn) { done(null); return; } // the call owns the mic
    o = o || {}; hfAbort(); if (!CAN_MIC || !HF.on || HF.paused) { done(null); return; }
    hfStopOthers(); try { speechCut(); } catch (e) {} try { speechSynthesis.cancel(); } catch (e) {}
    const r = new SR(); HF.rec = r; r.lang = o.lesson || HF.lesson || (typeof DR !== "undefined" && DR.on) ? sttLang() : hfCmdLang(); r.interimResults = true; r.continuous = !IS_IOS;
    try { if (window.AndroidSTT && window.AndroidSTT.setBias && !(o.lesson || HF.lesson)) window.AndroidSTT.setBias(JSON.stringify(PV_BIAS)); } catch (e) {}
    let live = "", fin = "", end = false, retried = !!o.retried; const t0 = Date.now();
    const finish = (t) => { if (end) return; end = true; clearTimeout(r._q); clearTimeout(r._s); if (HF.rec === r) HF.rec = null; try { r.abort(); } catch (e) {} hfPaint();  pvLog("capture [" + r.lang + "] " + (r._readyT ? "mic open " + (r._readyT - t0) + " ms, " : "") + "turn " + (Date.now() - t0) + " ms → " + (t ? "«" + t + "»" : "nothing" + (r._err ? " (error " + r._err + ")" : r._got ? " (heard sound, no words)" : r._ready ? " (mic open, no speech)" : " (mic never opened)"))); done(t && t.trim() ? t.trim() : null); };
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
    if (a === "hf-tap") { if (HF.paused) { hfPause(false); return; } try { const c = pvCtx(); if (c.playing && !(typeof DR !== "undefined" && DR.on) && !HF.rec) { HF.wasPlaying = location.hash; PVH["play.pause"]("auto"); } } catch (e) {} if (hfSpeaking() || HF.saying) hfQuiet(); if (HF.rec) { hfAbort(); hfEnd(); return; } HF.engaged = true; hfStopOthers(); hfBeep(); hfCapture((x) => (x ? hfHandle(x) : hfEnd()), { startMs: 7000 }); }
    else if (a === "hf-toggle") { hfEnable(!HF.on); try { if (typeof tView !== "undefined") tRender(); } catch (x) {} }
    else if (a === "hf-pause") hfPause(true);
    else if (a === "t-speak") { tOpen(); tView = "chat"; tRender(); voiceMode = true; uiVoice(); setTimeout(() => listen((x) => tSend(x, true)), 60); }
    else if (a === "pv-model-dl") window.__pvModelDl();
    else if (a === "pv-vosk-dl") window.__pvVoskDl();
    else if (a === "pv-diag-copy") { const t2 = pvDiagText(); try { navigator.clipboard.writeText(t2).then(() => coachToast("Mic log copied. Paste it into the chat with Claude."), () => { const d = document.getElementById("pv-diag-out"); if (d) d.textContent = t2; }); } catch (x) {} }
    else if (a === "pv-vit-show") { const d = document.getElementById("pv-vit-out"); if (d) d.textContent = (window.__vitals ? window.__vitals().slice().reverse().join("\n") : "") || "Nothing recorded yet."; }
    else if (a === "pv-vit-clear") { if (window.__vitalsClear) window.__vitalsClear(); const d = document.getElementById("pv-vit-out"); if (d) d.textContent = "Cleared."; }
    else if (a === "pv-vit-copy") { const t2 = pvDiagText(); try { navigator.clipboard.writeText(t2).then(() => coachToast("Vitals copied. Paste them into the chat with Claude."), () => { prompt("Copy this:", t2); }); } catch (x) { try { prompt("Copy this:", t2); } catch (y) {} } }
    else if (a === "pv-diag") { const d = document.getElementById("pv-diag-out"); if (d) d.textContent = pvDiagText(); }
  });
