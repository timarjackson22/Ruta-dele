// Full DELE exams: robustness of all four papers, and speaking answers kept and graded (tools/EXAM_SPEAKING_BRIEF.md).
// Speech recognition and speech synthesis are mocked; the mock can end a session with or without a final result.
const { chromium, devices } = require("playwright"); const fs = require("fs");
const R = []; const rec = (n, ok, info) => { R.push(!!ok); console.log((ok ? "PASS " : "FAIL ") + n + (info != null && !ok ? "  " + String(info).slice(0, 300) : "")); };
const URL = "http://localhost:8766/";
const D = JSON.parse(fs.readFileSync("/home/claude/ruta-dele/examdata/a1.json", "utf8"));

// ---------- A. the exam data ----------
(() => {
  const bad = [];
  if (D.exams.length !== 15) bad.push("exams: " + D.exams.length);
  D.exams.forEach((X, i) => {
    const e = "Examen " + (i + 1);
    ["lectura", "auditiva", "escritura", "oral"].forEach((k) => { if (!Array.isArray(X[k]) || !X[k].length) bad.push(e + " no " + k); });
    ["lectura", "auditiva"].forEach((k) => {
      const nq = X[k].reduce((n, t) => n + t.q.length, 0); if (nq !== 25) bad.push(e + " " + k + " has " + nq + " questions");
      X[k].forEach((t, ti) => { if (k === "auditiva" && !(t.audio && t.audio.length)) bad.push(e + " listening task " + (ti + 1) + " no audio");
        if (k === "lectura" && !(t.texts && t.texts.length)) bad.push(e + " reading task " + (ti + 1) + " no text");
        t.q.forEach((q, qi) => { const n = t.opts ? t.opts.length : (q.o || []).length; if (!(Number.isInteger(q.a) && q.a >= 0 && q.a < n)) bad.push(e + " " + k + " T" + (ti + 1) + " q" + (qi + 1) + " key " + q.a + "/" + n);
          if (!t.opts && n !== 3) bad.push(e + " " + k + " T" + (ti + 1) + " q" + (qi + 1) + " has " + n + " options"); if (!t.opts && new Set(q.o).size !== n) bad.push(e + " duplicate options " + k + " q" + (qi + 1)); }); });
    });
    if (X.escritura.length !== 2) bad.push(e + " writing tasks " + X.escritura.length);
    X.escritura.forEach((t) => { if (!t.form && !(t.words && t.words.length === 2 && t.points && t.points.length)) bad.push(e + " writing " + t.t + " lacks words/points"); });
    if (X.oral.length !== 4) bad.push(e + " speaking tasks " + X.oral.length);
    X.oral.forEach((t) => { if (!(+t.speak > 0) || t.prep == null || !(t.words && t.words.length === 2)) bad.push(e + " speaking " + t.t + " lacks timing/words"); });
    if (!X.oral.some((t) => t.ask && t.ask.length)) bad.push(e + " no conversation task");
  });
  const m = D.format.mins; if (!(m.lectura === 45 && m.auditiva === 20 && m.escritura === 25 && m.oral === 15)) bad.push("format minutes " + JSON.stringify(m));
  rec("Data: 15 exams, 4 papers each, 25+25 questions, every answer key valid, audio, words and points, timing", !bad.length, bad.join(" | "));
})();

const INIT = () => {
  // speech synthesis: records what the examiner says
  window.__said = [];
  const SS = { speaking: false, pending: false, paused: false, getVoices: () => [{ lang: "es-ES", name: "Lucía", localService: true }, { lang: "es-MX", name: "Jorge", localService: true }],
    speak(u) { window.__said.push(u.text); SS.speaking = true; const g = (SS.g = (SS.g || 0) + 1); setTimeout(() => { if (SS.g !== g) return; SS.speaking = false; u.onend && u.onend({}); }, 60); },
    cancel() { SS.g = (SS.g || 0) + 1; SS.speaking = false; }, pause() {}, resume() {}, addEventListener() {}, removeEventListener() {} };
  Object.defineProperty(window, "speechSynthesis", { value: SS, configurable: true });
  window.SpeechSynthesisUtterance = function (t) { this.text = t; this.lang = ""; this.rate = 1; this.pitch = 1; this.voice = null; this.addEventListener = (k, f) => (this["on" + k] = f); };
  // speech recognition: the test drives each session
  window.__srs = []; window.__srMode = { finalOnStop: true };
  class MSR {
    constructor() { this.lang = ""; this.interimResults = false; this.continuous = false; this.res = []; this.state = "new"; window.__srs.push(this); }
    start() { this.state = "on"; setTimeout(() => this.onstart && this.onstart({}), 5); }
    _fire() { const l = this.res.map((r) => { const a = [{ transcript: r.t, confidence: 0.9 }]; a.isFinal = r.f; return a; }); this.onresult && this.onresult({ results: l, resultIndex: 0 }); }
    say(t, f) { if (this.state !== "on" && this.state !== "stopping") return; const last = this.res[this.res.length - 1]; if (last && !last.f) this.res.pop(); this.res.push({ t, f: !!f }); this._fire(); }
    end(err) { if (this.state === "ended" || this.state === "aborted") return; if (err) this.onerror && this.onerror({ error: err }); this.state = "ended"; this.onend && this.onend({}); }
    stop() { this.state = "stopping"; setTimeout(() => { if (window.__srMode.finalOnStop) { const last = this.res[this.res.length - 1]; if (last && !last.f) { last.f = true; this._fire(); } } if (!window.__srMode.hang) this.end(); }, 40); }
    abort() { this.state = "aborted"; setTimeout(() => this.onend && this.onend({}), 5); }
  }
  window.SpeechRecognition = window.webkitSpeechRecognition = MSR;
  window.__sr = () => { const a = window.__srs.filter((r) => r.state === "on"); return a[a.length - 1] || null; };
  if (navigator.mediaDevices) navigator.mediaDevices.getUserMedia = () => Promise.resolve({ getTracks: () => [] });
};

(async () => {
  const b = await chromium.launch();
  const mk = async (dev) => { const c = await b.newContext({ ...devices[dev], serviceWorkers: "block" }); await c.addInitScript(INIT); await c.route("**/fonts.googleapis.com/**", (r) => r.fulfill({ contentType: "text/css", body: "" })); const p = await c.newPage(); const er = []; p.on("pageerror", (x) => er.push(x.message)); p.er = er; return p; };
  const p = await mk("Pixel 7");
  const W = (ms) => p.waitForTimeout(ms);
  const go = async (h) => { await p.evaluate((h) => { location.hash = h; }, h); await W(400); };
  const start = async (free) => { await p.click('[data-act="ex-start"]' + (free ? '[data-free="1"]' : ":not([data-free])")); await W(200); };
  const answerAll = (how) => p.evaluate((how) => { const E = window.__ex(); E.tasks.forEach((t, ti) => t.q.forEach((q, qi) => { const n = t.opts ? t.opts.length : q.o.length, v = how === "right" ? q.a : (q.a + 1) % n; const el = document.querySelector('[data-act="ex-ans"][data-k="' + ti + "-" + qi + '"][data-v="' + v + '"]'); el.click(); })); }, how);
  const submit = async (twice) => { await p.click('[data-act="ex-submit"]'); await W(150); if (twice) { await p.click('[data-act="ex-submit"]'); } await p.waitForFunction(() => window.__ex() && window.__ex().phase === "result", null, { timeout: 15000 }); await W(150); };
  const head = () => p.evaluate(() => (document.querySelector(".exresult h2") || {}).textContent || "");
  const again = async () => { if (await p.$('[data-act="ex-again"]')) { await p.click('[data-act="ex-again"]'); await W(300); } };
  await p.goto(URL + "#a1-examenes"); await W(1500);
  rec("Exam hub lists 15 exams", (await p.$$eval(".exlist li", (x) => x.length)) === 15);

  // ---------- B. Reading, every exam ----------
  const readBad = [];
  for (let n = 1; n <= 15; n++) {
    await go("a1-examen-" + n + "-lectura"); await start(n > 2);
    if (n === 1) { await p.click('[data-act="ex-submit"]'); await W(100); rec("Reading: finishing with blanks warns first", /25 unanswered/.test(await p.textContent('[data-act="ex-submit"]'))); }
    await answerAll(n === 2 ? "wrong" : "right"); await submit();
    const h = await head(); if (!(n === 2 ? /: 0\/25/.test(h) : /25\/25/.test(h))) readBad.push(n + ": " + h);
    if (n === 2) rec("Reading: all wrong scores 0 and the mistakes go to My mistakes", /: 0\/25/.test(h) && (await p.evaluate(() => JSON.stringify(localStorage).includes("exam-a1"))));
  }
  rec("Reading: all 15 exams mark correctly (25/25 when right)", !readBad.length, readBad.join(" | "));

  // ---------- C. Listening ----------
  await go("a1-examen-1-auditiva"); await start(false);
  await p.click('[data-act="ex-play"][data-t="0"]'); await W(300);
  rec("Listening: the examiner reads the recording (speaker voices)", (await p.evaluate(() => __said.length)) > 0);
  await p.click('[data-act="ex-play"][data-t="0"]'); await W(200);
  rec("Listening: plays twice, then the play button is disabled", await p.$eval('[data-act="ex-play"][data-t="0"]', (x) => x.disabled));
  await answerAll("right"); await submit(); rec("Listening: marks 25/25", /25\/25/.test(await head()));
  await p.evaluate(() => { window.__saveDraftCheck = JSON.parse(localStorage.getItem(Object.keys(localStorage).find((k) => /ruta|dele/i.test(k)) || "{}")); });
  rec("A marked paper leaves no draft behind", !(await p.evaluate(() => JSON.stringify(localStorage).includes('"a1-1-auditiva":{'))));
  const lisBad = [];
  for (let n = 2; n <= 15; n++) { await go("a1-examen-" + n + "-auditiva"); await start(true); if (n === 2) { for (let i = 0; i < 3; i++) { await p.click('[data-act="ex-play"][data-t="1"]'); await W(120); } rec("Listening, practice mode: no play limit", !(await p.$eval('[data-act="ex-play"][data-t="1"]', (x) => x.disabled))); }
    await answerAll("right"); await submit(); const h = await head(); if (!/25\/25/.test(h)) lisBad.push(n + ": " + h); }
  rec("Listening: all 15 exams mark correctly", !lisBad.length, lisBad.join(" | "));

  // ---------- D. Writing ----------
  const fillWriting = () => p.evaluate(() => { const E = window.__ex(); E.tasks.forEach((t, ti) => {
    if (t.form) t.form.forEach((f, fi) => { const el = document.querySelector('[data-ex-f="' + ti + "-" + fi + '"]'); el.value = ["Timar", "Jackson Pérez", "panameña", "treinta años", "Calle 50, Ciudad de Panamá", "timar@correo.com", "6655-4433", "nadar y correr"][fi % 8]; el.dispatchEvent(new Event("input", { bubbles: true })); });
    else { const el = document.querySelector('[data-ex-t="' + ti + '"]'); el.value = (t.model || "Hola, me llamo Timar. Vivo en Panamá con mi familia. Me gusta mucho leer y nadar en la playa los fines de semana. Un abrazo."); el.dispatchEvent(new Event("input", { bubbles: true })); } }); });
  const wrBad = [];
  for (let n = 1; n <= 15; n++) { await go("a1-examen-" + n + "-escritura"); await start(true); await fillWriting(); if (n === 1) rec("Writing: the word count updates as you type", +(await p.textContent('[data-ex-wc="1"]')) > 10); await submit(); const h = await head(); const sc = +(h.match(/([\d.]+)\/25/) || [0, 0])[1]; if (!(sc >= 12)) wrBad.push(n + ": " + h); }
  rec("Writing: all 15 exams mark a complete answer (model text) at a good level", !wrBad.length, wrBad.join(" | "));
  await go("a1-examen-2-escritura"); await again(); await go("a1-examen-2-escritura"); await start(true);
  await p.evaluate(() => { document.querySelectorAll("[data-ex-f]").forEach((el) => { el.value = "Ana"; el.dispatchEvent(new Event("input", { bubbles: true })); }); });
  await p.click('[data-act="ex-submit"]'); await W(100);
  rec("Writing: an empty task warns before marking", /Tarea 2 has no answer yet/.test(await p.textContent('[data-act="ex-submit"]')), await p.textContent('[data-act="ex-submit"]'));
  await p.click('[data-act="ex-submit"]'); await p.waitForFunction(() => window.__ex().phase === "result"); await W(100);
  rec("Writing: the result explains the zero", /Nothing was written for this task/.test(await p.textContent("#app")));

  // ---------- E. Speaking (Android) ----------
  const sr = (fn, ...a) => p.evaluate(([fn, a]) => { const r = window.__sr(); if (!r) return "no session"; r[fn](...a); return "ok"; }, [fn, a]);
  const box = (ti) => p.$eval('[data-ex-t="' + ti + '"]', (x) => x.value);
  const draft = (k) => p.evaluate((k) => { for (const key of Object.keys(localStorage)) { try { const j = JSON.parse(localStorage.getItem(key)); if (j && j.exDraft && j.exDraft[k]) return j.exDraft[k]; } catch (e) {} } return null; }, k);
  await go("a1-examen-1-oral"); await start(true);
  await p.click('[data-act="ex-mic"][data-t="0"]'); await W(100);
  rec("Speaking: the box is read-only while recording", await p.$eval('[data-ex-t="0"]', (x) => x.readOnly));
  await sr("say", "hola me llamo Timar y vivo en la ciudad de Panamá con mi familia", false); await W(100);
  rec("Speaking: words appear in the box while you speak", /me llamo Timar/.test(await box(0)));
  // Finish while still recording, with the phrase never marked final (the Android case)
  await p.click('[data-act="ex-submit"]'); await W(100);
  rec("Speaking: finishing with empty tasks warns (names them)", /Tarea 2, Tarea 3, Tarea 4 have no answer yet/.test(await p.textContent('[data-act="ex-submit"]')), await p.textContent('[data-act="ex-submit"]'));
  await p.click('[data-act="ex-submit"]'); await p.waitForFunction(() => window.__ex().phase === "result"); await W(200);
  let res = await p.evaluate(() => { const R = JSON.parse(JSON.stringify(window.__ex())); return null; });
  const t0 = await p.evaluate(() => { for (const key of Object.keys(localStorage)) { try { const j = JSON.parse(localStorage.getItem(key)); if (j && j.ex && j.ex["a1-1"] && j.ex["a1-1"].oral) return j.ex["a1-1"].oral.tasks[0]; } catch (e) {} } return null; });
  rec("Speaking: words still in progress when you tap Finish are saved and graded (not lost)", t0 && /me llamo Timar/.test(t0.text) && t0.sc > 0 && !t0.empty, JSON.stringify(t0 && { text: t0.text, sc: t0.sc }));
  rec("Speaking: the tasks with nothing said say so on the result page", (await p.$$eval(".exnone", (x) => x.length)) === 3);
  rec("Speaking: no microphone left running after marking", await p.evaluate(() => !window.__sr()));
  await again(); await go("a1-examen-1-oral"); await start(true);
  // Stop, and the recogniser ends without a final result
  await p.evaluate(() => (window.__srMode.finalOnStop = false));
  await p.click('[data-act="ex-mic"][data-t="1"]'); await W(100); await sr("say", "vivo en el barrio de El Cangrejo cerca del parque", false); await W(80);
  await p.click('[data-act="ex-mic"][data-t="1"]'); await W(300);
  rec("Speaking: Stop with no final result keeps the words", /El Cangrejo/.test(await box(1)) && /Saved · 10 words/.test(await p.textContent("#ex-live-1")), (await box(1)) + " | " + (await p.textContent("#ex-live-1")));
  rec("Speaking: the answer is saved to the phone straight away", /El Cangrejo/.test(((await draft("a1-1-oral")) || { txt: {} }).txt[1] || ""));
  rec("Speaking: the box is editable again after Stop", !(await p.$eval('[data-ex-t="1"]', (x) => x.readOnly)));
  // segments: a final phrase, then words in progress, then Stop (final sent): no duplicates
  await p.evaluate(() => (window.__srMode.finalOnStop = true));
  await p.click('[data-act="ex-mic"][data-t="1"]'); await W(100); await sr("say", "hay muchos restaurantes", true); await sr("say", "y me gusta mucho", false); await W(50);
  await p.click('[data-act="ex-mic"][data-t="1"]'); await W(300);
  rec("Speaking: speaking again adds to the answer, no repeats", (await box(1)) === "vivo en el barrio de El Cangrejo cerca del parque hay muchos restaurantes y me gusta mucho", await box(1));
  // a recogniser that never reports back after Stop
  await p.evaluate(() => (window.__srMode.hang = true));
  await p.click('[data-act="ex-mic"][data-t="0"]'); await W(100); await sr("say", "me llamo Timar", false); await W(50);
  await p.click('[data-act="ex-mic"][data-t="0"]'); await W(3300);
  rec("Speaking: if the recogniser hangs after Stop, the words are kept after 3 s", /me llamo Timar/.test(await box(0)) && !(await p.evaluate(() => window.__ex().recT != null)), await p.textContent("#ex-live-0"));
  await p.evaluate(() => (window.__srMode.hang = false));
  // reload with words in progress
  await p.click('[data-act="ex-mic"][data-t="0"]'); await W(100); await sr("say", "y soy profesor", false); await W(500);
  await p.reload(); await W(1500);
  rec("Speaking: after a reload the paper reopens with your answers restored", /restored/.test(await p.textContent("#app")) && /El Cangrejo/.test(await box(1)) && /me llamo Timar y soy profesor/.test(await box(0)), (await box(0)) + " | " + (await box(1)));
  // conversation: one question at a time
  await p.evaluate(() => (window.__said = []));
  const ask = await p.evaluate(() => window.__ex().tasks[2].ask);
  await p.click('[data-act="ex-mic"][data-t="2"]'); await p.waitForFunction(() => !!window.__sr(), null, { timeout: 3000 });
  rec("Conversation: the examiner asks one question, then waits for your answer", JSON.stringify(await p.evaluate(() => __said)) === JSON.stringify([ask[0]]) && /Question 1 of/.test(await p.textContent("#ex-ctl-2")), JSON.stringify(await p.evaluate(() => __said)));
  await sr("say", "tengo treinta años", true); await sr("end");
  await p.waitForFunction((q) => __said.includes(q) && !!window.__sr(), ask[1], { timeout: 4000 });
  rec("Conversation: after your answer the next question comes", /Question 2 of/.test(await p.textContent("#ex-ctl-2")));
  await sr("say", "vivo con mi madre y mi hermano", false); await W(50);
  await p.click('[data-act="ex-next"][data-t="2"]'); await p.waitForFunction((q) => __said.includes(q) && !!window.__sr(), ask[2], { timeout: 4000 });
  await sr("end", "no-speech"); // nothing said for question 3
  await p.waitForFunction((q) => __said.includes(q) && !!window.__sr(), ask[3], { timeout: 4000 });
  await sr("say", "los sábados voy a la playa", false); await W(50);
  await p.click('[data-act="ex-mic"][data-t="2"]'); await W(200);
  const qa = await p.evaluate(() => window.__ex().qa[2]);
  rec("Conversation: each answer is saved against its question (Next and Stop keep words in progress)", qa[0].a === "tengo treinta años" && qa[1].a === "vivo con mi madre y mi hermano" && qa[2].a === "" && qa[3].a === "los sábados voy a la playa", JSON.stringify(qa));
  rec("Conversation: the box holds only your words", (await box(2)) === "tengo treinta años\nvivo con mi madre y mi hermano\nlos sábados voy a la playa", JSON.stringify(await box(2)));
  // task 4 typed (no microphone needed), then mark
  await p.fill('[data-ex-t="3"]', "Buenos días. Quiero una camiseta azul, por favor. Uso la talla M. ¿Cuánto cuesta? Muy bien, me la llevo. Gracias.");
  await submit();
  const txt = await p.textContent("#app");
  rec("Conversation: the result shows the exchange, with unanswered questions marked", /The conversation/.test(txt) && txt.includes(ask[1]) && /You: vivo con mi madre/.test(txt) && /no answer/.test(txt));
  rec("Speaking: all four tasks graded above 0", (await p.evaluate(() => { for (const key of Object.keys(localStorage)) { try { const j = JSON.parse(localStorage.getItem(key)); if (j && j.ex && j.ex["a1-1"] && j.ex["a1-1"].oral) return j.ex["a1-1"].oral.tasks.every((t) => t.sc > 0 && !t.empty); } catch (e) {} } return false; })));
  // the clock runs out while recording
  await go("a1-examen-3-oral"); await start(false);
  await p.click('[data-act="ex-mic"][data-t="0"]'); await W(100); await sr("say", "me llamo Timar y tengo treinta años y soy de Panamá", false); await W(50);
  await p.evaluate(() => (window.__ex().end = Date.now() - 1)); await p.waitForFunction(() => window.__ex().phase === "result", null, { timeout: 8000 }); await W(200);
  rec("Speaking: when time runs out mid-sentence, the words are kept and the paper is marked as late", /Time ran out/.test(await p.textContent("#app")) && /me llamo Timar/.test(await p.textContent("#app")));
  // leaving the page while recording
  await go("a1-examen-4-oral"); await start(true);
  await p.click('[data-act="ex-mic"][data-t="1"]'); await W(100); await sr("say", "mi barrio es tranquilo y bonito", false); await W(50);
  await go("a1");
  rec("Leaving the page while recording stops the mic and keeps the words", (await p.evaluate(() => !window.__sr() && window.__ex().recT == null)) && /tranquilo y bonito/.test(((await draft("a1-4-oral")) || { txt: {} }).txt[1] || ""));
  await go("a1-examen-4-oral");
  rec("…and coming back shows them", /tranquilo y bonito/.test(await box(1)));
  // the clock runs out while you're on another page: marked quietly, never drawn over it
  await go("a1-examen-5-lectura"); await start(false); await answerAll("right"); await go("a1");
  await p.evaluate(() => (window.__ex().end = Date.now() - 1)); await W(1600);
  rec("A paper that times out while you're elsewhere is marked, but not drawn over the page you're on", (await p.evaluate(() => location.hash)) === "#a1" && !(await p.$(".expage")) && (await p.evaluate(() => window.__ex().phase)) === "result");
  await go("a1-examen-5-lectura"); rec("…and its result is waiting when you go back", /25\/25/.test(await head()));
  // a timed draft whose time ran out while the app was closed
  await go("a1-examen-6-lectura"); await start(false); await answerAll("right"); await W(500);
  await p.evaluate(() => { const E = window.__ex(); clearInterval(E.tm); E.tm = null; E.end = Date.now() - 1000; }); // the app is closed after time is up: leaving saves the draft
  await p.goto(URL + "#a1"); await W(1200); await go("a1-examen-6-lectura"); await W(500);
  rec("A timed paper reopened after its time ran out is marked straight away (late), with the saved answers", /25\/25/.test(await head()) && /Time ran out/.test(await p.textContent("#app")), await head());

  // ---------- screenshot issues: formatting, the speaking clock, the header ----------
  await go("a1-examen-1-oral"); await again().catch(() => {}); await go("a1-examen-1-oral");
  rec("Speaking clock includes the 15 min preparation (Start · 30 min)", /Start · 30 min/.test(await p.textContent('[data-act="ex-start"]:not([data-free])')), await p.textContent('[data-act="ex-start"]:not([data-free])'));
  await start(false);
  const card = await p.$eval(".excard", (x) => x.innerHTML);
  rec("Task cards show bold titles and line breaks, not ** or <br>", /<b>Mi barrio<\/b><br>/.test(card) && !/\*\*|&lt;br/.test(card), card.slice(0, 120));
  const raw = await p.evaluate(() => { const a = []; ["lectura", "escritura"].forEach(() => {}); return document.body.innerText.match(/<br>|\*\*/g); });
  rec("No raw <br> or ** anywhere on the speaking paper", !raw, JSON.stringify(raw));
  const hb = await p.$eval(".exbar", (x) => x.getBoundingClientRect().height);
  rec("Exam header stays one line (compact)", hb < 70, hb);
  await p.evaluate(() => (window.__ex().end = Date.now() - 1)); await p.waitForFunction(() => window.__ex().phase === "result", null, { timeout: 8000 }); await W(200);
  rec("Time running out on an empty speaking paper marks it (0, explained), not stuck at 0:00", /Time ran out/.test(await p.textContent("#app")) && (await p.$$eval(".exnone", (x) => x.length)) === 4);
  for (const k of ["lectura", "escritura"]) { await go("a1-examen-9-" + k); await start(true); const r = await p.evaluate(() => document.body.innerText.match(/<br>|\*\*/g)); rec("No raw <br> or ** on the " + k + " paper", !r, JSON.stringify(r)); await go("a1"); }
  // ---------- F. whole exam ----------
  await go("a1-examen-7-lectura"); await start(true); await answerAll("right"); await submit();
  await go("a1-examen-7-auditiva"); await start(true); await answerAll("right"); await submit();
  await go("a1-examen-7-escritura"); await start(true); await fillWriting(); await submit();
  await go("a1-examen-7-oral"); await start(true);
  await p.evaluate(() => { const E = window.__ex(); E.tasks.forEach((t, ti) => { const el = document.querySelector('[data-ex-t="' + ti + '"]'); el.value = t.model || "Me llamo Timar. Tengo treinta años. Vivo con mi familia en Panamá. Los fines de semana voy a la playa y leo libros. Me gusta mucho cocinar."; el.dispatchEvent(new Event("input", { bubbles: true })); }); });
  await submit(); await go("a1-examen-7");
  const tot = await p.textContent(".exresult");
  const calc = await p.evaluate(() => { for (const key of Object.keys(localStorage)) { try { const j = JSON.parse(localStorage.getItem(key)); if (j && j.ex && j.ex["a1-7"]) { const r = j.ex["a1-7"], g1 = r.lectura.sc + r.escritura.sc, g2 = r.auditiva.sc + r.oral.sc; return { g1, g2, tot: g1 + g2, pass: g1 + g2 >= 60 && g1 >= 30 && g2 >= 30 }; } } catch (e) {} } return null; });
  rec("Whole exam: four papers add up to Apto / No apto with the group rule", calc && tot.includes(Math.round(calc.tot) + "/100") && (calc.pass ? /Apto/.test(tot) && !/No apto/.test(tot) : /No apto/.test(tot)), tot + JSON.stringify(calc));
  await go("a1-examenes"); rec("The exam list shows the score", /\d+\/100 · (Apto|No apto)/.test(await p.textContent(".exlist")));
  await go("a1-examen-7"); await p.click('[data-act="ex-reset"]'); await W(300);
  rec("Clear results resets the exam", !(await p.$(".exresult")) && /Start ›/.test(await p.textContent(".expapers")));
  rec("No script errors (Android)", !p.er.length, p.er.join(" | "));

  // ---------- G. iPhone: one phrase per session ----------
  const q = await mk("iPhone 13"); const Wq = (ms) => q.waitForTimeout(ms);
  await q.goto(URL + "#a1-examen-8-oral"); await Wq(1500); await q.click('[data-act="ex-start"][data-free="1"]'); await Wq(200);
  await q.click('[data-act="ex-mic"][data-t="0"]'); await Wq(500);
  const phr = ["Hola, me llamo Ana.", "Soy de Colón.", "Trabajo en un banco."];
  for (const ph of phr) { await q.waitForFunction(() => !!window.__sr(), null, { timeout: 3000 }); await q.evaluate((ph) => { const r = window.__sr(); r.say(ph, true); setTimeout(() => r.end(), 30); }, ph); await Wq(200); }
  await q.waitForFunction(() => !!window.__sr(), null, { timeout: 3000 });
  rec("iPhone: listens one phrase at a time (not continuous) and starts again by itself", await q.evaluate(() => window.__sr().continuous === false && window.__srs.length >= 4));
  await q.click('[data-act="ex-mic"][data-t="0"]'); await Wq(300);
  const iv = await q.$eval('[data-ex-t="0"]', (x) => x.value);
  rec("iPhone: every phrase is kept (they used to replace each other)", iv === phr.join(" "), iv);
  // small phone layout
  await q.setViewportSize({ width: 320, height: 640 }); await Wq(300);
  const ov = await q.evaluate(() => [...document.querySelectorAll(".expage *")].filter((e) => { const r = e.getBoundingClientRect(); return r.width && r.right > innerWidth + 1; }).map((e) => e.className || e.tagName).slice(0, 5));
  rec("Speaking page: nothing overflows on a 320px phone", !ov.length, JSON.stringify(ov));
  rec("No script errors (iPhone)", !q.er.length, q.er.join(" | "));

  console.log(R.filter(Boolean).length + "/" + R.length + " passed"); await b.close();
})().catch((e) => { console.log("CRASH", e.message); process.exit(1); });
