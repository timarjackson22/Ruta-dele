  /* ===================== Profe hands-free: capability registry, commands, "Ok Profe" (tools/PROFE_HANDSFREE_BRIEF.md) ===================== */
  const PVR = (() => { try { return JSON.parse(document.getElementById("pv-registry").textContent); } catch (e) { return { actions: [], routes: {}, acts: {} }; } })();
  const PV_DIAG = [];
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
  async function pvGo(h, label) {
    if (location.hash.slice(1) === h) return { ok: true, say: "You're already in " + label + "." };
    pvCloseProfe(); location.hash = h;
    const ok = await pvUntil(() => location.hash.slice(1) === h && app.children.length && !/^\s*Loading/.test(app.textContent), 3000);
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
    "nav.exam": (s) => { const lv = pvLv(s) || "a1", n = pvN(s), paper = pvFind(s, PV_PAPER); if (!n) return { ok: false, say: "Which exam number?" }; if ((typeof EXREADY !== "undefined" ? EXREADY[lv] || 0 : 0) < n) return { ok: false, say: "DELE " + pvLvName(lv) + " has " + ((typeof EXREADY !== "undefined" && EXREADY[lv]) || 0) + " exams ready." };
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
    "meta.here": () => ({ ok: true, say: pvHelpHere(), keep: 1 }),
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
    const m = pvMatch(raw, c); if (!m) return false;
    const engaged = origin === "hf" || (HF.on && HF.engaged);
    if (origin !== "hf" && m.a.id === "hf.stop" && !engaged && !(typeof listening !== "undefined" && listening) && !hfSpeaking()) return false; // "gracias" in a chat is just thanks
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
  async function pvExec(a, s, origin, confirmed) {
    pvLog("cmd " + a.id + " «" + s + "»");
    const t0 = performance.now(); let r; try { r = await PVH[a.id](s, pvCtx()); } catch (e) { r = { ok: false, say: "Something went wrong doing that." }; pvLog("cmd error " + a.id + " " + (e && e.message)); }
    r = r || { ok: false, say: "" }; if (a.route) window.__pvLat = Math.round(performance.now() - t0); pvLog("cmd " + a.id + " → " + (r.ok ? "ok" : "failed"));
    window.__pvLast = { id: a.id, ok: !!r.ok, say: r.say || "" };
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
  function hfBusy() { return (typeof listening !== "undefined" && listening) || !!HF.rec || (typeof tBusy !== "undefined" && tBusy) || hfSpeaking() || HF.saying || !!(typeof EX !== "undefined" && EX && EX.recT != null) || !!(typeof VA !== "undefined" && VA && VA.on); }
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
    const want = !HF.paused && !document.hidden && !hfBusy() && !HF.engaged && Date.now() > HF.settle;
    if (hfSpeaking() || HF.saying) HF.settle = Date.now() + 400; // Profe's voice has just ended: wait before listening, so the room's echo isn't heard
    if (want && HF.eng === "off") hfWakeStart(); else if (!want && HF.eng === "on") hfWakeStop();
    hfPaint();
  }
  function hfWakeStart() { HF.eng = "on"; HF.heard = ""; try { if (HF.online && window.AndroidWake.startOnline) window.AndroidWake.startOnline(sttLang()); else window.AndroidWake.start(sttLang()); } catch (e) { HF.eng = "off"; } }
  function hfWakeStop() { HF.eng = "off"; clearTimeout(HF.wt); try { window.AndroidWake.stop(); } catch (e) {} }
  window.__awake = { ev(type, v) {
    pvLog("wake " + type + (v && type !== "partial" ? " " + v : ""));
    if (type === "state" && /^engine:/.test(String(v))) { HF.engine = String(v).slice(7); return; }
    if (type === "state") { if (v === "no-ondevice" || v === "no-lang") { HF.mode = "tap"; HF.eng = "off"; HF.note = v; hfNotice(v); } else if (v === "no-mic") { HF.eng = "off"; hfNotice("no-mic"); } else if (v === "error") { HF.eng = "off"; HF.settle = Date.now() + 5000; } else if (v === "stopped") HF.eng = "off"; hfPaint(); return; }
    if (HF.eng !== "on" || hfBusy()) return; // Profe is speaking or the mic is in use: never wake on that
    const t = String(v || ""), m = t.match(PV_WAKE); if (!m) return;
    HF.heard = t.slice(m.index + m[0].length).trim(); clearTimeout(HF.wt);
    if (type === "final") hfWoke(HF.heard); else HF.wt = setTimeout(() => hfWoke(HF.heard), 1500); // keep listening while the command follows in the same breath
  } };
  function hfWoke(cmd) {
    if (Date.now() - HF.lastWake < 2500 || HF.engaged) return; // one activation, one acknowledgement
    HF.lastWake = Date.now(); HF.wokeN = (HF.wokeN || 0) + 1; hfWakeStop(); HF.engaged = true; pvLog("woke «" + cmd + "»");
    hfStopOthers();
    if (cmd && cmd.split(" ").length >= 1 && pvNorm(cmd)) { hfHandle(cmd); return; }
    hfBeep(); hfCapture((t) => { if (t) hfHandle(t); else hfSay("What would you like to do?", () => hfCapture((t2) => (t2 ? hfHandle(t2) : hfEnd()), { startMs: 7000 })); }, { startMs: 4000 });
  }
  function hfHandle(text) {
    HF.engaged = true; pvLog("heard «" + text + "»");
    if (HF.lesson && pvCtx().runner) { if (pvRoute(text, "hf")) return; if (pvAnswer(text, "hf")) return; }
    if (pvRoute(text, "hf")) return;
    // not a command: it's for Profe (a question, Spanish practice); the panel opens and the voice chat continues hands-free
    PV.skip = 1; tOpen(); tSend(text, true);
  }
  // follow-ups: no wake phrase needed for a few seconds after Profe finishes
  function hfFollow() { if (!HF.on || HF.paused) { hfEnd(); return; } HF.engaged = true; hfCapture((t) => (t ? hfHandle(t) : hfEnd()), { startMs: 8000 }); }
  function hfEnd() { HF.engaged = false; HF.lesson = HF.lesson && pvCtx().runner ? HF.lesson : false; hfReconcile(); }
  function hfQuiet() { try { speechCut(); } catch (e) {} SPK_GEN++; try { speechSynthesis.cancel(); } catch (e) {} HF.saying = false; try { if (typeof listening !== "undefined" && listening) stopListening(); } catch (e) {} hfAbort(); HF.lesson = false; voiceMode = false; lastVoice = false; try { uiVoice(); } catch (e) {} }
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
    const r = new SR(); HF.rec = r; r.lang = sttLang(); r.interimResults = true; r.continuous = !IS_IOS;
    let live = "", fin = "", end = false, retried = !!o.retried; const t0 = Date.now();
    const finish = (t) => { if (end) return; end = true; clearTimeout(r._q); clearTimeout(r._s); if (HF.rec === r) HF.rec = null; try { r.abort(); } catch (e) {} hfPaint(); pvLog("capture → " + (t ? "«" + t + "»" : "nothing")); done(t && t.trim() ? t.trim() : null); };
    r._fin = finish;
    r.onresult = (e) => { if (end) return; let f = "", im = ""; for (let i = 0; i < e.results.length; i++) { const x = e.results[i][0].transcript; if (e.results[i].isFinal) f += x + " "; else im += x + " "; } fin = f.trim(); live = (f + im).trim();
      clearTimeout(r._s); clearTimeout(r._q); r._q = setTimeout(() => finish(live), hfWaitFor(live, fin && !im.trim(), o)); const l = document.getElementById("t-live"); if (l) { l.hidden = false; l.textContent = live; } };
    r.onerror = (e) => { r._err = e && e.error; pvLog("capture error " + r._err); if (/not-allowed|service-not-allowed/.test(r._err)) { hfNotice("no-mic"); hfEnable(false); } };
    r.onend = () => { if (end) return; if (!live && /aborted|busy/.test(r._err || "") && !retried && Date.now() - t0 < 1500) { end = true; if (HF.rec === r) HF.rec = null; setTimeout(() => hfCapture(done, Object.assign({}, o, { retried: true })), 400); return; } finish(live || fin); };
    r._s = setTimeout(() => finish(null), o.startMs || 7000);
    try { r.start(); } catch (e) { finish(null); }
    hfPaint();
  }
  // how long a pause ends the turn: a confirmed short answer or a command doesn't need the long thinking pause
  function hfWaitFor(t, isFinal, o) {
    if (isFinal) { const c = pvCtx(); if (pvMatch(t, c) || (c["runner-mc"] && pvOpts().some((x) => pvSim(pvStrip(x), pvStrip(t)) >= 0.8))) return 500; if (o && o.lesson) return 1400; }
    return Math.min(endWait(t), o && o.lesson ? 4500 : 9000);
  }
  function hfAbort() { const r = HF.rec; if (r) { HF.rec = null; try { r._fin && r._fin(null); } catch (e) {} } }
  function hfSay(text, then) { if (!HF.on && then) { const t0 = then; then = () => {}; } HF.saying = true; hfPaint(); let called = false; const go = () => { if (called) return; called = true; HF.saying = false; HF.settle = Date.now() + 400; hfPaint(); then && then(); };
    try { if (canSpeak && Array.isArray(text)) { hfSaySeq(text, go); const est = 1500 + text.reduce((n, x) => n + x[0].split(/\s+/).length, 0) * 450; setTimeout(() => { if (!hfSpeaking()) go(); }, est); }
      else if (canSpeak) { window.__pvSayOK = 1; speakMixed(text, go); window.__pvSayOK = 0; setTimeout(() => { if (!hfSpeaking() && !called) { /* speech never started */ } }, 4000); const est = 1500 + text.split(/\s+/).length * 450; setTimeout(() => { if (!hfSpeaking()) go(); }, est); } else go(); } catch (e) { go(); } }
  function hfSaySeq(segs, done) { const gen = ++SPK_GEN; try { speechSynthesis.cancel(); } catch (e) {} let k = 0;
    const next = () => { if (gen !== SPK_GEN) return; if (k >= segs.length) { done(); return; } const [t, es] = segs[k++]; let u; try { u = profeUtter(t, es); } catch (e) { next(); return; } let moved = false; const go = () => { if (moved) return; moved = true; next(); }; u.onend = u.onerror = go; try { speechSynthesis.speak(u); } catch (e) { go(); } };
    next(); }
  function hfBeep() { try { const C = window.AudioContext || window.webkitAudioContext; if (!C) return; const c = hfBeep.c || (hfBeep.c = new C()), o = c.createOscillator(), g = c.createGain(); o.frequency.value = 880; g.gain.value = 0.06; o.connect(g); g.connect(c.destination); o.start(); o.stop(c.currentTime + 0.12); } catch (e) {} }
  const hfOnText = () => HF.mode === "wake" ? "Hands-free is on. Say “Ok Profe” whenever you need me." : "Hands-free is on. Tap the Profe pill and speak; I'll keep listening for follow-ups.";
  function hfNotice(k) { const m = { "no-ondevice": "“Ok Profe” needs on-device speech recognition, which this phone doesn't have. Tap the pill to talk instead.", "no-lang": "“Ok Profe” needs the offline Spanish speech pack: the Google app › your profile picture › Settings › Voice › Offline speech recognition › Spanish. Until then, tap the pill to talk.", "no-mic": "The microphone is blocked for Ruta DELE. Allow it in Android Settings › Apps › Ruta DELE › Permissions (or the browser's site settings), then turn hands-free on again." }[k]; if (m) try { coachToast(m); } catch (e) {} }
  function hfEnable(on) {
    if (on) { const m = hfMode(); if (!m) { hfNotice("no-mic"); return; } HF.mode = m;
      if (window.AndroidWake && hfStatus() === "online" && !TS.hfOnline) try { coachToast("This phone has no on-device speech recognition, so for now tap the Profe pill to talk. To use “Ok Profe”, allow online recognition in Profe › History & settings › Hands-free."); } catch (e) {} HF.on = true; HF.paused = false; TS.hf = true; tsave(); if (!HF.tm) HF.tm = setInterval(hfReconcile, 300); }
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
    else if (a === "pv-diag") { const d = document.getElementById("pv-diag-out"); let info = ""; try { if (window.AndroidWake && window.AndroidWake.info) info = "Phone: " + window.AndroidWake.info() + "\n"; } catch (x) {} if (d) d.textContent = info + "Hands-free: " + (HF.on ? HF.mode + (HF.online ? " online" : "") + " · engine " + (HF.engine || "—") + " · listener " + HF.eng : "off") + "\n" + (PV_DIAG.slice().reverse().join("\n") || "No microphone events yet."); }
  });
  document.addEventListener("change", (e) => { if (e.target && e.target.dataset && e.target.dataset.act === "hf-online") { TS.hfOnline = e.target.checked; tsave(); if (HF.on) { hfWakeStop(); HF.mode = hfMode(); hfReconcile(); } try { tRender(); } catch (x) {} } });
  document.addEventListener("visibilitychange", () => { if (document.hidden) { hfAbort(); hfWakeStop(); HF.engaged = false; } hfReconcile(); });
  function pvSettingsHTML() {
    const m = hfMode(), st = window.AndroidWake ? hfStatus() : "";
    return '<section class="block pvset"><h3>Hands-free <span class="vb newb">beta</span></h3><p class="small">' + (m === "wake" ? "Say <b>“Ok Profe”</b> to talk to Profe without touching the screen: open lessons, answer questions, control reading and practise. Listening for “Ok Profe” happens on your phone; no audio is sent anywhere until you’ve said it. It stops when the app is in the background." : m === "tap" ? "This " + (window.AndroidWake ? "phone has no on-device speech recognition, so" : "browser would send the room’s audio to its speech service to listen for a wake phrase, so") + " “Ok Profe” isn’t available here. With hands-free on, tap the Profe pill once and keep talking: Profe listens for follow-ups and reads lesson questions aloud." : "Hands-free needs a microphone and speech recognition, which aren’t available here.") + "</p>" +
      (st === "online" ? '<p class="small"><label><input type="checkbox" data-act="hf-online"' + (TS.hfOnline ? " checked" : "") + '> Use online speech recognition for “Ok Profe”</label><br><span class="muted">This phone has no on-device recognition, so without this you tap the Profe pill to talk. With it, Google’s (or your phone’s) speech service listens while hands-free is on, which may send audio to it. It stops in the background and while Profe speaks.</span></p>' : "") +
      (m ? '<button class="btn ' + (HF.on ? "" : "primary") + '" data-act="hf-toggle" aria-pressed="' + HF.on + '">' + (HF.on ? "Turn hands-free off" : "Turn hands-free on") + "</button>" + (HF.on ? ' <span class="small muted">Now: ' + (HF.mode === "wake" ? "listening for “Ok Profe”" + (HF.online ? " (online)" : " (on the phone)") : "tap the Profe pill to talk") + "</span>" : "") : "") +
      '<details class="pvdiag"><summary>Mic diagnostics</summary><p class="small muted">The last microphone and voice-command events, newest first. If the mic doesn’t work, this shows why.</p><button class="btn small" data-act="pv-diag">Show</button><pre id="pv-diag-out" class="small"></pre></details></section>';
  }
  window.__pv = { px: () => PX, S: () => S, LI: () => Object.keys(LI), say: (t, cb) => { window.__pvSayOK = 1; speakMixed(t, cb || (() => {})); window.__pvSayOK = 0; }, view: () => tView, raStop: () => { try { raStop(true); } catch (e) {} }, match: (t, c) => { const m = pvMatch(t, Object.assign(pvCtx(), c || {})); return m ? m.a.id : null; }, norm: pvNorm, route: pvRoute, reg: PVR, hf: HF, diag: PV_DIAG, ctx: pvCtx, wake: (t) => PV_WAKE.test(t), answer: pvAnswer };
  if (TS.hf) setTimeout(() => hfEnable(true), 1200);
