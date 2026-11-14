// Profe command understanding corpus (tools/PROFE_HANDSFREE_BRIEF.md §8): English and Spanish, as people say them and as
// recognisers write them. Each line: [what was said, what's on screen, expected action id or null (= conversation/answer for Profe)].
// Target: ≥97% correct and no answer or conversation ever taken as navigation.
const { chromium, devices } = require("playwright");
const C = { home: {}, mc: { unit: true, runner: true, "runner-mc": true, "runner-open": true }, text: { unit: true, runner: true, "runner-text": true, "runner-open": true }, fb: { unit: true, runner: true, "runner-fb": true },
  play: { playing: true, player: true }, paused: { paused: true, player: true }, tutor: { tutor: true }, unit: { unit: true, guide: true }, guide: { guide: true } };
const CORPUS = [
  // navigation, English
  ["open my lessons", "home", "nav.course"], ["Open my lessons.", "home", "nav.course"], ["show me the course", "home", "nav.course"], ["go to lessons", "home", "nav.course"], ["take me to my lessons please", "home", "nav.course"],
  ["go home", "home", "nav.home"], ["open today", "home", "nav.home"], ["home screen", "home", "nav.home"],
  ["open A2", "home", "nav.level"], ["go to level B1", "home", "nav.level"], ["open a two", "home", "nav.level"], ["level c1", "home", "nav.level"],
  ["open unit 3", "home", "nav.unit"], ["go to lesson five of A1", "home", "nav.unit"], ["open unit three", "home", "nav.unit"],
  ["continue where I left off", "home", "lesson.continue"], ["resume my lesson", "home", "lesson.continue"], ["keep going", "home", "lesson.continue"], ["continue", "home", "lesson.continue"], ["pick up where I left off", "home", "lesson.continue"],
  ["start my next lesson", "home", "lesson.next"], ["next lesson", "home", "lesson.next"], ["open the next unit", "home", "lesson.next"],
  ["quiz me on this lesson", "unit", "lesson.quiz"], ["test me", "unit", "lesson.quiz"], ["quiz me", "home", "lesson.quiz"], ["start the questions", "unit", "lesson.quiz"],
  ["read the lesson to me", "unit", "lesson.read"], ["read this aloud", "guide", "lesson.read"],
  ["open practice", "home", "nav.practice"], ["open listening", "home", "nav.listen"], ["show the podcasts", "home", "nav.listen"], ["open reading", "home", "nav.read"], ["open writing", "home", "nav.write"],
  ["show the verbs", "home", "nav.verbs"], ["open grammar", "home", "nav.grammar"], ["show the prepositions", "home", "nav.gcat"], ["open adjectives", "home", "nav.gcat"], ["open reflexive verbs", "home", "nav.gcat"],
  ["open the guides", "home", "nav.guides"], ["open the past tense guide", "home", "nav.guide"], ["show me ser versus estar", "home", "nav.guide"], ["explain the subjunctive", "home", "nav.guide"], ["open the guide on por and para", "home", "nav.guide"],
  ["let's practise the past tense", "home", "practise.topic"], ["Let's practice the past tense.", "home", "practise.topic"], ["practise ser and estar", "home", "practise.topic"], ["I want to work on the subjunctive", "home", "practise.topic"], ["review the preterite", "home", "practise.topic"],
  ["practise Spanish conversation", "home", "practise.convo"], ["let's have a conversation", "home", "practise.convo"], ["talk with me in Spanish", "home", "practise.convo"], ["role play", "home", "practise.convo"],
  ["open vocabulary", "home", "nav.words"], ["show the vocabulary for this level", "unit", "nav.vocab"], ["flashcards for A2", "home", "nav.cards"], ["review my flashcards", "home", "nav.review"], ["open review", "home", "nav.review"],
  ["show my mistakes", "home", "nav.mistakes"], ["show my progress", "home", "nav.progress"], ["how am I doing", "home", "nav.progress"], ["open settings", "home", "nav.settings"],
  ["open the exams", "home", "nav.exams"], ["open exam 3", "home", "nav.exam"], ["start the speaking paper of exam 2", "home", "nav.exam"], ["open exam four listening", "home", "nav.exam"], ["clear the results of exam 3", "home", "exam.reset"],
  ["open videos", "home", "nav.videos"], ["start the placement test", "home", "nav.placement"], ["open the library", "home", "nav.library"], ["open resources", "home", "nav.resources"], ["go back", "home", "nav.back"],
  // navigation, Spanish (as recognisers write it, often without accents)
  ["abre mis lecciones", "home", "nav.course"], ["abre el curso", "home", "nav.course"], ["llévame a mis lecciones", "home", "nav.course"], ["ve a inicio", "home", "nav.home"], ["abre el nivel B1", "home", "nav.level"], ["abre a dos", "home", "nav.level"],
  ["abre la unidad 3", "home", "nav.unit"], ["ve a la lección dos de A2", "home", "nav.unit"], ["continúa donde lo dejé", "home", "lesson.continue"], ["sigue con mi lección", "home", "lesson.continue"], ["continuar", "home", "lesson.continue"],
  ["empieza la siguiente lección", "home", "lesson.next"], ["la próxima unidad", "home", "lesson.next"], ["hazme preguntas", "unit", "lesson.quiz"], ["ponme a prueba", "unit", "lesson.quiz"], ["léeme la lección", "unit", "lesson.read"],
  ["abre práctica", "home", "nav.practice"], ["abre escuchar", "home", "nav.listen"], ["abre las lecturas", "home", "nav.read"], ["abre escritura", "home", "nav.write"], ["abre los verbos", "home", "nav.verbs"], ["abre gramática", "home", "nav.grammar"],
  ["abre las preposiciones", "home", "nav.gcat"], ["abre las guías", "home", "nav.guides"], ["abre la guía del subjuntivo", "home", "nav.guide"], ["explícame ser y estar", "home", "nav.guide"],
  ["vamos a practicar el subjuntivo", "home", "practise.topic"], ["quiero practicar por y para", "home", "practise.topic"], ["quiero repasar el pretérito", "home", "practise.topic"],
  ["vamos a practicar conversación", "home", "practise.convo"], ["habla conmigo en español", "home", "practise.convo"], ["abre el vocabulario", "home", "nav.words"], ["abre el repaso", "home", "nav.review"], ["repasa mis tarjetas", "home", "nav.review"],
  ["abre mis errores", "home", "nav.mistakes"], ["muéstrame mi progreso", "home", "nav.progress"], ["cómo voy", "home", "nav.progress"], ["abre ajustes", "home", "nav.settings"], ["abre los exámenes", "home", "nav.exams"], ["abre el examen 4", "home", "nav.exam"],
  ["abre la prueba oral del examen 1", "home", "nav.exam"], ["borra los resultados del examen 3", "home", "exam.reset"], ["abre los vídeos", "home", "nav.videos"], ["abre la prueba de nivel", "home", "nav.placement"], ["abre la biblioteca", "home", "nav.library"],
  ["vuelve atrás", "home", "nav.back"], ["regresa", "home", "nav.back"],
  // the wake phrase in front, and politeness
  ["Ok Profe, open my next lesson", "home", "lesson.next"], ["okay profe open my lessons", "home", "nav.course"], ["oye profe abre el curso", "home", "nav.course"], ["ok profe, show my progress please", "home", "nav.progress"], ["could you open grammar", "home", "nav.grammar"], ["puedes abrir los verbos por favor", "home", "nav.verbs"],
  // lesson questions
  ["select the second answer", "mc", "q.pick"], ["it's B", "mc", "q.pick"], ["the first one", "mc", "q.pick"], ["la segunda", "mc", "q.pick"], ["elijo la b", "mc", "q.pick"], ["b", "mc", "q.pick"], ["c", "mc", "q.pick"], ["number 3", "mc", "q.pick"], ["the last one", "mc", "q.pick"], ["la respuesta es la a", "mc", "q.pick"],
  ["check my answer", "text", "q.check"], ["submit", "text", "q.check"], ["comprueba mi respuesta", "text", "q.check"], ["next question", "fb", "q.next"], ["next", "fb", "q.next"], ["siguiente", "fb", "q.next"], ["continue", "fb", "q.next"],
  ["previous question", "mc", "q.prev"], ["la pregunta anterior", "mc", "q.prev"], ["skip this one", "mc", "q.skip"], ["sáltala", "text", "q.skip"], ["show me the answer", "text", "q.show"], ["I don't know", "mc", "q.show"], ["no lo sé", "text", "q.show"],
  ["repeat the question", "mc", "q.repeat"], ["repite la pregunta", "text", "q.repeat"], ["start the questions again", "fb", "q.restart"],
  // playback
  ["pause", "play", "play.pause"], ["pausa", "play", "play.pause"], ["resume", "paused", "play.resume"], ["keep reading", "paused", "play.resume"], ["sigue leyendo", "paused", "play.resume"], ["read faster", "play", "play.faster"], ["slow down", "play", "play.slower"], ["más despacio", "play", "play.slower"], ["show the English", "play", "play.english"],
  // Profe
  ["explain that in English", "home", "profe.explain"], ["explain this", "mc", "profe.explain"], ["explícamelo en inglés", "home", "profe.explain"], ["translate that", "home", "profe.translate"], ["tradúcelo", "home", "profe.translate"], ["give me another example", "home", "profe.example"], ["dame otro ejemplo", "home", "profe.example"],
  ["repeat that", "tutor", "profe.repeat"], ["repeat that more slowly", "tutor", "profe.repeat"], ["repítelo más despacio", "tutor", "profe.repeat"], ["open Profe", "home", "profe.open"], ["close Profe", "tutor", "profe.close"], ["new chat", "tutor", "profe.new"],
  ["what can I do here", "mc", "meta.here"], ["qué puedo hacer aquí", "home", "meta.here"], ["help", "home", "meta.here"], ["what can you do", "home", "meta.can"], ["qué puedes hacer", "home", "meta.can"],
  ["stop", "home", "hf.stop"], ["that's all", "home", "hf.stop"], ["eso es todo", "home", "hf.stop"], ["turn on hands-free", "home", "hf.on"], ["pause hands-free", "home", "hf.pause"], ["desactiva manos libres", "home", "hf.off"],
  // NOT commands: conversation, questions for Profe, Spanish practice, answers
  ["how do you say dinner in Spanish", "home", null], ["what's the difference between ser and estar", "home", null], ["ayer fui al mercado con mi madre", "home", null], ["me llamo Timar y vivo en Panamá", "tutor", null],
  ["I want to go to the beach tomorrow", "home", null], ["quiero ir a la playa", "tutor", null], ["Mañana voy a volver a casa", "tutor", null], ["el profesor abre la puerta", "home", null], ["tengo que estudiar el pasado", "tutor", null],
  ["fui al cine", "text", null], ["comí", "text", null], ["the cat is black", "home", null], ["can you correct my sentence", "home", null], ["what does pegadita mean", "home", null], ["I'm tired today", "tutor", null],
  ["la película fue muy buena", "tutor", null], ["Hola Profe, ¿cómo estás?", "tutor", null], ["estoy aprendiendo español", "tutor", null], ["open the window", "home", null], ["mi casa es grande", "text", null],
  ["next week I travel to Madrid", "home", null], ["a mi madre le gusta cocinar", "home", null], ["siguiente", "home", null], ["b", "home", null], ["pause", "home", null],
];

// HELD-OUT: written after the patterns, never used to tune them. Reported separately (an honest estimate of real-world understanding).
const HELD = [
  ["bring up my lessons", "home", "nav.course"], ["I'd like to see the course", "home", "nav.course"], ["take me home", "home", "nav.home"], ["let's go to level A1", "home", "nav.level"], ["muéstrame el nivel C1", "home", "nav.level"],
  ["open lesson number four", "home", "nav.unit"], ["abre la unidad cinco", "home", "nav.unit"], ["carry on with my lesson", "home", "lesson.continue"], ["seguimos donde lo dejé", "home", "lesson.continue"], ["what's next", "home", "lesson.next"],
  ["go to the next lesson", "home", "lesson.next"], ["vamos a la siguiente lección", "home", "lesson.next"], ["ask me some questions", "unit", "lesson.quiz"], ["pregúntame", "unit", "lesson.quiz"], ["show me the listening section", "home", "nav.listen"],
  ["I want to read something", "home", null], ["open the verb tables", "home", "nav.verbs"], ["show me grammar", "home", "nav.grammar"], ["teach me the subjunctive", "home", "nav.guide"], ["let's study ser and estar", "home", "practise.topic"],
  ["can we practise por and para", "home", "practise.topic"], ["necesito practicar el imperativo", "home", "practise.topic"], ["chat with me", "home", "practise.convo"], ["hablemos en español", "home", "practise.convo"], ["show my stats", "home", "nav.progress"],
  ["¿cómo va mi progreso?", "home", "nav.progress"], ["open exam number two", "home", "nav.exam"], ["abre el examen tres de lectura", "home", "nav.exam"], ["show me the videos", "home", "nav.videos"], ["take me back", "home", "nav.back"],
  ["I think it's C", "mc", "q.pick"], ["creo que es la primera", "mc", "q.pick"], ["option two", "mc", "q.pick"], ["move on", "fb", "q.next"], ["la siguiente", "fb", "q.next"],
  ["no idea", "mc", "q.show"], ["ni idea", "text", "q.show"], ["what was the question", "mc", "q.repeat"], ["hold on", "play", "play.pause"], ["dale", "paused", "play.resume"],
  ["speed up", "play", "play.faster"], ["what does that mean", "home", "profe.explain"], ["no entiendo", "home", "profe.explain"], ["one more example", "home", "profe.example"], ["say that again", "tutor", "profe.repeat"],
  ["never mind", "home", "hf.stop"], ["olvídalo", "home", "hf.stop"], ["what are my options", "home", "meta.here"], ["me gustaría ir al cine el sábado", "tutor", null], ["can you help me with my homework", "home", null],
];
// HELD-OUT 2: a second fresh set, written after the first held-out fixes (measures whether the fixes generalise).
const HELD2 = [
  ["let me see my progress", "home", "nav.progress"], ["can you open the reading section", "home", "nav.read"], ["I want to go to the guides", "home", "nav.guides"], ["llévame al curso", "home", "nav.course"], ["vamos a la sección de vídeos", "home", "nav.videos"],
  ["open unit number seven", "home", "nav.unit"], ["abre la lección número dos", "home", "nav.unit"], ["resume the course", "home", "lesson.continue"], ["continuemos con la lección", "home", "lesson.continue"], ["qué me toca", "home", "lesson.next"],
  ["give me a quiz", "unit", "lesson.quiz"], ["let's go to the writing tasks", "home", "nav.write"], ["open the grammar page", "home", "nav.grammar"], ["show me exam five speaking", "home", "nav.exam"], ["open the settings page", "home", "nav.settings"],
  ["it's the third one", "mc", "q.pick"], ["answer A", "mc", "q.pick"], ["next please", "fb", "q.next"], ["go to the next question", "fb", "q.next"], ["skip it", "text", "q.skip"],
  ["tell me the answer", "mc", "q.show"], ["read the question again", "mc", "q.repeat"], ["stop reading", "play", "play.pause"], ["keep going", "paused", "play.resume"], ["más rápido", "play", "play.faster"],
  ["can you explain that", "home", "profe.explain"], ["translate it into English", "home", "profe.translate"], ["dame más ejemplos", "home", "profe.example"], ["say it again", "tutor", "profe.repeat"], ["what can I say", "home", "meta.here"],
  ["I'm done, thanks", "home", "hf.stop"], ["ya está, gracias profe", "home", "hf.stop"], ["the weather is nice today", "home", null], ["quiero comer pizza esta noche", "tutor", null], ["how do I conjugate tener", "home", null],
  ["is it ser or estar here", "home", null], ["vivo en la ciudad de Panamá", "text", null], ["next to the bank", "home", null], ["back in 2010 I lived in Spain", "tutor", null], ["open your book on page ten", "tutor", null],
];
(async () => {
  const b = await chromium.launch(); const p = await (await b.newContext({ ...devices["Pixel 7"], serviceWorkers: "block" })).newPage();
  await p.goto("http://localhost:" + (process.env.PORT || 8766) + "/#curso"); await p.waitForTimeout(1500);
  const res = await p.evaluate(([corpus, C]) => corpus.map(([t, c, e]) => { const base = { unit: false, runner: false, "runner-mc": false, "runner-text": false, "runner-fb": false, "runner-open": false, guide: false, playing: false, paused: false, player: false, tutor: false, drill: false }; const got = window.__pv.match(t, Object.assign(base, C[c])); return [t, c, e, got]; }), [CORPUS, C]);
  let ok = 0; const wrong = [], navOnChat = [];
  res.forEach(([t, c, e, g]) => { if (g === e) ok++; else { wrong.push("[" + c + "] «" + t + "» expected " + e + " got " + g); if (e === null && g) navOnChat.push(t); } });
  const pct = (ok / res.length) * 100;
  wrong.forEach((w) => console.log("MISS " + w));
  console.log((pct >= 97 ? "PASS " : "FAIL ") + "Command understanding: " + ok + "/" + res.length + " (" + pct.toFixed(1) + "%, target ≥97%)");
  console.log((navOnChat.length ? "FAIL " : "PASS ") + "Conversation or answers taken as commands: " + navOnChat.length + " (target 0)");
  const ids = new Set(res.map((r) => r[2]).filter(Boolean)), all = await p.evaluate(() => window.__pv.reg.actions.filter((a) => a.voice === "complete").map((a) => a.id));
  const untested = all.filter((i) => !ids.has(i)); console.log((untested.length ? "FAIL " : "PASS ") + "Every voice action has corpus lines" + (untested.length ? ": missing " + untested.join(", ") : ""));
  const hres = await p.evaluate(([corpus, C]) => corpus.map(([t, c, e]) => { const base = { unit: false, runner: false, "runner-mc": false, "runner-text": false, "runner-fb": false, "runner-open": false, guide: false, playing: false, paused: false, player: false, tutor: false, drill: false }; return [t, c, e, window.__pv.match(t, Object.assign(base, C[c]))]; }), [HELD, C]);
  const hok = hres.filter((r) => r[2] === r[3]).length, hbad = hres.filter((r) => r[2] === null && r[3]);
  hres.filter((r) => r[2] !== r[3]).forEach(([t, c, e, g]) => console.log("HELD-OUT MISS [" + c + "] «" + t + "» expected " + e + " got " + g));
  console.log("INFO Held-out 1 (first measured 41/50 = 82% before its general fixes): " + hok + "/" + hres.length + " (" + ((hok / hres.length) * 100).toFixed(0) + "%) · conversation taken as a command: " + hbad.length);
  const h2 = await p.evaluate(([corpus, C]) => corpus.map(([t, c, e]) => { const base = { unit: false, runner: false, "runner-mc": false, "runner-text": false, "runner-fb": false, "runner-open": false, guide: false, playing: false, paused: false, player: false, tutor: false, drill: false }; return [t, c, e, window.__pv.match(t, Object.assign(base, C[c]))]; }), [HELD2, C]);
  const h2ok = h2.filter((r) => r[2] === r[3]).length, h2bad = h2.filter((r) => r[2] === null && r[3]), h2wrong = h2.filter((r) => r[2] && r[3] && r[2] !== r[3]);
  h2.filter((r) => r[2] !== r[3]).forEach(([t, c, e, g]) => console.log("HELD-OUT-2 MISS [" + c + "] «" + t + "» expected " + e + " got " + g));
  console.log("INFO Held-out 2 (first measured 33/40 = 83% before its general fixes): " + h2ok + "/" + h2.length + " (" + ((h2ok / h2.length) * 100).toFixed(0) + "%) · conversation taken as a command: " + h2bad.length + " · wrong action: " + h2wrong.length);
  await b.close();
})();
