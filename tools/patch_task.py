"""Profe as a focused, polite instructor: keeps to the task the learner set (or follows it when it changes),
evaluates each attempt before correcting, asks for a retry, gives a clue after two misses, congratulates at the end
and asks whether to continue or change (and what to)."""
import sys
p = sys.argv[1]; s = open(p, encoding="utf-8").read()
if "TASK_RE" in s: sys.exit("already patched")
def rep(a, b, n=1):
    global s
    assert s.count(a) == n, ("anchor", a[:90], s.count(a)); s = s.replace(a, b)
JS = r'''
  /* ---------- the task Profe keeps to ---------- */
  const TASK_RE = /\b(quiz me|test me|ask me|practi[cs]e|let'?s (do|practi[cs]e|talk|have|try|work|play|start)|role.?play|conversation|exercise|drill|help me (with|write|prepare|practi)|correct (my|this)|check my|i want to (learn|practi[cs]e|work on|improve|prepare)|teach me|give me (an? |some )?(exercise|question|sentence|task|quiz|practice)|go through|quiero (practicar|aprender|mejorar|repasar)|vamos a|hagamos|pregúntame|preguntame|enséñame|ensename|corrige|ay[uú]dame a)\b/i;
  const YES_RE = /^\s*(s[ií]|yes|yeah|yep|ok(ay)?|vale|claro|dale|continue|continuar|continuemos|seguir|sigamos|sigue|more|m[aá]s|otra|another|again|let'?s go)\b/i;
  const STOP_RE = /^\s*(stop|let'?s stop|that'?s (all|enough)|i'?m done|finish|end( the)? (session|lesson|task)|terminar|terminamos|termina|basta|ya est[aá]|eso es todo|fin|chao|adi[oó]s|bye)\b/i;
  function taskTrack(text) {
    if (!tCur) return; const T = tCur.task;
    if (T && STOP_RE.test(text)) { T.stop = 1; return; }
    const active = T && !T.done, esReq = /\b(vamos a|hagamos|quiero (practicar|aprender|mejorar|repasar)|pregúntame|preguntame|enséñame|ensename|corrige|ay[uú]dame a)\b/i.test(text) && !/\b(quiz|test|practi[cs]e|teach|let'?s|exercise|role.?play)\b/i.test(text);
    // mid-task, a Spanish answer that happens to contain «vamos a…» is an answer, not a new task
    if (TASK_RE.test(text) && text.length > 6 && (!active || !esReq || /\b(cambiar|otra cosa|en vez|en lugar)\b/i.test(text))) { tCur.task = { t: text.trim().slice(0, 220), tries: 0, done: false, at: Date.now(), n: 0, fixes: [] }; return; }
    if (T && T.done && YES_RE.test(text)) { T.done = false; T.tries = 0; T.more = 1; T.lastCheck = T.n; return; }
    if (T && !T.done && turnKind(text) === "answer") T.n = (T.n || 0) + 1; // a substantive response to the task
  }

  /* ---------- turn management: what kind of message, what is pending, what was actually heard ---------- */
  function turnKind(t) {
    const x = String(t || "").trim(), l = x.toLowerCase();
    if (!x) return "empty";
    if (/^(repeat|repite|rep[ií]telo|again please|otra vez,? por favor|say (that|it) again|what did you say|¿?c[oó]mo\??$|¿?qu[eé]\??$|pardon|sorry\?)/i.test(l)) return "repeat";
    if (/^(i said|no,? i said|dije|no,? dije|i meant|quise decir)\b/i.test(l)) return "fixheard";
    if (/^(help|hint|pista|ayuda|i don'?t know|no s[eé]|no entiendo|i don'?t understand|give me a (clue|hint))\b/i.test(l)) return "help";
    if (/\?\s*$/.test(x) || /^(what|how|why|when|where|which|who|can you|could you|is it|are|do|does|should|qu[eé] significa|c[oó]mo se dice|por qu[eé]|cu[aá]l)\b/i.test(l)) return "question";
    if (/(\.\.\.|…|\b(y|and|pero|but|porque|because|que|de|el|la|un|una|con|para|en))\s*$/i.test(x) && x.split(/\s+/).length < 12) return "incomplete";
    return "answer";
  }
  const KIND_NOTE = {
    repeat: "The learner asks you to repeat: repeat your last question or model briefly, nothing new.",
    fixheard: "The learner is correcting what the app heard: accept their version and respond to it; do not count the misheard words as mistakes.",
    help: "The learner asks for help: give a hint or a short model for the pending exercise, then ask them to try.",
    question: "The learner is asking a question, not answering: answer it briefly first, then return to your pending exercise. Do not treat it as a Spanish attempt.",
    incomplete: "The learner's sentence looks unfinished: gently ask them to complete it or offer a small hint; do not invent the rest.",
  };
  const SPOKEN = { key: -1, heard: [] };
  function speechCut() { // the learner took the turn while Profe was still talking: remember what they actually heard
    try { if (!tCur || !(CG.seg > 0)) return; const a = [...tCur.msgs].reverse().find((m) => m.r === "a" && m.c); if (a && !a.cut) a.cut = (SPOKEN.heard.join(" ") || "").slice(0, 400) || "(nothing yet)"; CG.seg = 0; } catch (e) {}
  }
  function pendingQ() { const a = tCur && [...tCur.msgs].reverse().find((m) => m.r === "a" && m.c && !m.pending); if (!a) return ""; const q = taskStrip(a.c).replace(/\*/g, "").split(/(?<=[.!?…])\s+|\n+/).filter((x) => /\?\s*$/.test(x)).pop(); return q ? q.trim().slice(0, 160) : ""; }
  function turnNote() {
    if (!tCur) return ""; const us = tCur.msgs.filter((m) => m.r === "u"), lu = us[us.length - 1], out = [];
    const k = lu ? turnKind(lu.c) : "answer"; if (KIND_NOTE[k]) out.push(KIND_NOTE[k]);
    const as = tCur.msgs.filter((m) => m.r === "a" && m.c && !m.pending), pa = as[as.length - 1];
    if (pa && pa.cut) out.push((pa.cut === "—" ? "Your previous reply was cut off before you finished it (the learner sent this new message)." : "Your previous reply was interrupted: the learner only heard «" + pa.cut + "».") + " Respond to their new message first; add only the useful missing part of the earlier reply, if any.");
    const q = pendingQ(); if (q && k !== "answer") out.push("Your pending question was: «" + q + "».");
    return out.length ? "\n(" + out.join(" ") + ")" : "";
  }
  let TASK_TAG = null;
  function taskTag(c) { const m = /\[\[\s*(✓|✗|★|·|ok|no|done|-)\s*\]\]/i.exec(c || ""); return m ? ({ ok: "✓", no: "✗", done: "★", "-": "·" }[m[1].toLowerCase()] || m[1]) : null; }
  const taskStrip = (c) => String(c || "").replace(/\s*\[\[\s*(✓|✗|★|·|ok|no|done|-)\s*\]\]\s*/gi, " ").replace(/\s*\[\[[^\]]{0,8}$/, "").trim();
  function taskAfter(live) {
    if (!tCur || !tCur.task || !live || !live.c) return;
    const T = tCur.task, raw = live.c; let tag = taskTag(raw) || taskTag(TASK_TAG); TASK_TAG = null;
    if (!tag) { const plain = raw.toLowerCase(); tag = /¡?(felicidades|enhorabuena|congratulations|well done[^.]*task|has terminado|you('ve| have) (finished|completed))/.test(plain) ? "★" : /(inténtalo|intentalo|try again|otra vez|casi|not quite|almost)/.test(plain) ? "✗" : /(¡?correcto|¡?exacto|¡?perfecto|¡?muy bien|that's right|correct!)/.test(plain) ? "✓" : "·"; }
    if (tag === "✗") T.tries = (T.tries || 0) + 1; else if (tag === "✓") T.tries = 0; else if (tag === "★") { T.done = true; T.tries = 0; try { celebrate(false); } catch (e) {} }
    if (tag === "✗") { const fx = [...raw.split("\n").filter((l) => !/💡|useful word/i.test(l)).join("\n").matchAll(/\*\*([^*]{2,60})\*\*/g)].map((m) => m[1]); if (fx.length) T.fixes = (T.fixes || []).concat(fx.slice(0, 2)).slice(-6); }
    if (T.checkNow) { T.lastCheck = T.n; T.checkNow = 0; }
    if (T.stop) tCur.task = null;
    live.c = taskStrip(raw);
  }
  const TASK_RULES_FULL = "\n\nHOW YOU TEACH (most important; these rules come first):\n" +
    "1. Goal. At the start, find out what the learner wants to practise, their level if unknown, and any context (travel, work, everyday talk, a grammar topic): one question at a time, only what you need. If the goal is already clear, start practising at once. Turn a broad goal into a manageable session objective (e.g. «Spanish for travel» → practise ordering a meal and asking for the bill).\n" +
    "2. Focus. The CURRENT TASK below is the anchor: choose questions, vocabulary, examples and exercises that serve it. Do not bring in unrelated topics or turn every mistake into a separate lesson; answer side questions briefly and return to the task. If the learner clearly asks for a different goal, acknowledge it and switch; never change it silently yourself.\n" +
    "3. Teach dynamically. Adapt each turn to the learner's last answer. If they struggle: simplify, offer a hint or a short model. If they succeed: reduce support and make it a little harder. Bring back recurring mistakes in fresh examples. Mix role-play, questions, sentence building and recall. One question or task at a time, then wait; never answer your own question unless they ask for help or need a model. Use Spanish for practice and examples, clear English for instructions, explanations and feedback (more Spanish as they grow more comfortable).\n" +
    "4. Listen accurately. The learner's words reach you as text, often from speech recognition: never claim to have heard pronunciation, accent, stress or intonation. If a word looks like a recognition slip (e.g. «tía» for «día»), do not treat it as a language mistake; if it is unclear, ask them to repeat that part.\n" +
    "5. Evaluate, then correct (in English). For every attempt: first say clearly whether it is right and acknowledge what they communicated or did well; then give the correct or more natural Spanish with the fix in **bold**, the reason in plain English, and ask them to retry or use it in a new sentence. Example — Learner: «Ayer voy al supermercado.» You: You're describing yesterday, so say «Ayer **fui** al supermercado.» «Fui» is the past form of «ir» for «I». Try the sentence again. Prioritise mistakes that change meaning, mistakes tied to the task and recurring ones: one or two corrections per turn, not every small slip. In accuracy exercises correct straight away; in a role-play keep the flow and group minor corrections after a short exchange. Tell apart a real error, a correct phrase that could sound more natural, and a valid regional variant (never mark those wrong).\n" +
    "6. Retries. If the attempt was not right, kindly ask them to try again. After two misses on the same item, give a clue or a model answer they can use, then ask them to try once more.\n" +
    "7. Voices. The app reads English and Spanish with different voices and splits your text by language itself. Inside an English sentence, put every Spanish word or phrase in «guillemets» so it goes to the Spanish voice, e.g. Use «fui» instead of «voy» because you're talking about yesterday. Prefer a complete Spanish model followed by a complete English explanation, to keep voice switches few. Never write language labels, JSON or routing notes.\n" +
    "Turns. Keep one clear thread: remember your last question, whether it was answered, and any correction waiting for a retry. Tell apart an answer, a request for help, a correction of what the app heard, a request to repeat, a change of topic, and an unfinished sentence (the app adds a note when it can tell). If the learner asks a question while an exercise is pending, answer it first, then return to the exercise; never treat a question as a Spanish attempt. If they corrected themselves within their message, judge only the final version. Assess what they meant before correcting the wording; never accept a wrong answer just to keep going, and never invent errors in a correct one. If you are unsure what was said, confirm that phrase first. If your last reply was interrupted (the app tells you what they actually heard), respond to the new message first and add only the useful missing part. Never answer an outdated turn.\n" +
    "8. Check in. After about five to eight substantive answers, or at a natural milestone (the app will tell you when), briefly sum up progress and ask whether they want to continue, try something harder, or review / finish; ask sooner if they seem frustrated or confused. Then wait for the answer. When the whole task is complete: congratulate them, ask whether to continue or change, and if they want a change ask one or two short questions (topic? skill? easier or harder?) before starting.\n" +
    "9. Measure through use. Repeating a model once is not mastery: check they can use it on their own in a fresh example, and bring back earlier corrections later to check recall. Give specific, proportionate praise (say what improved), not generic praise every time.\n" +
    "10. Continuity and closing. Keep track of the goal, their level, what was practised, recurring mistakes and the next step. Use saved notes only when the app gives them; never invent memories or say progress was saved. When the learner wants to stop, close without a new exercise: a short summary in English of what they practised, one or two useful corrections with Spanish examples, and what to practise next.\n" +
    "Be warm, patient and concise, so the learner spends more time practising than listening.\n" +
    "At the very end of every reply add ONE tag for the app (hidden from the learner): [[✓]] if their last attempt was right, [[✗]] if it was not, [[★]] if the task is now complete, [[·]] if there was nothing to judge.";
  const TASK_RULES_SHORT = "\n\nHow you teach (most important):\n" +
    "- Find out the learner's goal first (one question at a time); if it is clear, start at once. Keep every reply on the CURRENT TASK; answer side questions briefly and come back. Switch only if they clearly ask for something else.\n" +
    "- For each attempt: first say if it is right and what they did well; then one or two corrections: the right Spanish with the fix in **bold** and a short reason in English; then ask them to try again or use it in a new sentence. Don't correct small slips or speech-recognition slips; never comment on pronunciation (you only see text).\n" +
    "- Not right: kindly ask them to try again. Two misses on the same item: give a clue or a model answer.\n" +
    "- Right: specific praise, then a slightly harder item. One question at a time, then wait.\n" +
    "- Inside English, put Spanish words in «guillemets» (e.g. Use «fui» instead of «voy»). Prefer a full Spanish model, then the English explanation.\n" +
    "- Keep one thread: remember your last question. If the learner asks a question, answer it first, then return to the exercise. If they corrected themselves, judge the final version. Never accept a wrong answer to keep going; never invent errors.\n" +
    "- Task complete: congratulate, ask to continue or change; if change, ask what (topic, skill, easier or harder). Learner wants to stop: short summary in English (what they practised, one or two corrections, what next), no new exercise.\n" +
    "- End every reply with ONE hidden tag: [[✓]] right, [[✗]] not right, [[★]] task complete, [[·]] nothing to judge.";
  function taskNote(short) {
    const T = tCur && tCur.task; if (!T) return short ? "" : "\n\nCURRENT TASK: none yet. Find out what the learner wants to practise (one question at a time), or start at once if they have said it.";
    if (T.stop) return short ? "\n(The learner wants to stop: give the short closing summary in English: what they practised, one or two corrections with Spanish examples, what to practise next. No new exercise.)" : "\n\nCURRENT TASK: «" + T.t + "». The learner wants to STOP now: give the short closing summary in English (what they practised, one or two useful corrections with Spanish examples, what to practise next). No new exercise.";
    const st = T.done ? "COMPLETED. The learner is choosing whether to continue or change: follow their answer (if they want something else, ask what, briefly)." : T.more ? "continuing with more of the same." : "in progress.";
    const tr = T.done ? "" : " Misses on the current item so far: " + (T.tries || 0) + (T.tries >= 2 ? " (give a clue or a model answer now)." : ".");
    if (!T.done && (T.n || 0) - (T.lastCheck || 0) >= 6) T.checkNow = 1;
    const ck = T.checkNow ? " CHECK IN NOW: after responding to this answer, briefly sum up progress and ask whether to continue, try something harder, or finish." : "";
    const fx = (T.fixes || []).length && !T.done ? " Corrections made earlier (bring one back later to check recall): " + T.fixes.slice(-4).join("; ") + "." : "";
    return (short ? "\n(Task: «" + T.t + "» — " + st + tr + ck + fx + " Evaluate the attempt first, then correct politely. End with [[✓]], [[✗]], [[★]] or [[·]].)" : "\n\nCURRENT TASK (set by the learner): «" + T.t + "» — " + st + tr + ck + fx);
  }
  // Spanish in «guillemets» inside English goes to the Spanish voice
  { const _tp = tagParts; tagParts = function (x) { if (/«[^»]{1,140}»/.test(x) && !isSpanish(x.replace(/«[^»]*»/g, " ") + " ")) { const out = []; x.split(/(«[^»]{1,140}»)/).forEach((p) => { if (!p.trim()) return; if (/^«/.test(p)) { const inner = p.slice(1, -1); if (isSpanish(inner + " ") || /[áéíóúñ¿¡]/i.test(inner)) out.push([inner, true]); else _tp(inner).forEach((q) => out.push(q)); } else _tp(p).forEach((q) => out.push(q)); }); return out; } return _tp(x); }; }
'''
rep("  function rules(ctx, compact) {", JS + "  function rules(ctx, compact) { return rules0(ctx, compact) + (compact ? TASK_RULES_SHORT : TASK_RULES_FULL) + taskNote(false) + turnNote(); }\n  function rules0(ctx, compact) {")
rep("\\n- The app corrects grammar separately, so keep talking about the topic.\\n", "\\n- When the learner answers your question or exercise, first say if it is right, then politely correct each mistake (**bold** fix + short reason).\\n")
# the on-device chat keeps one session: the task goes with each message
rep('''"Learner: " + lastU + "\\n" + steerNote(lastU, prevA0 && cleanLocal(prevA0.content))''', '''"Learner: " + lastU + "\\n" + steerNote(lastU, prevA0 && cleanLocal(prevA0.content)) + taskNote(true)''')
# track the task from what the learner writes; read the tag from Profe's reply
rep('''    const um = { r: "u", c: text, t: Date.now() }; tCur.msgs.push(um); tCur.updated = Date.now(); tView = "chat";''', '''    const um = { r: "u", c: text, t: Date.now() }; tCur.msgs.push(um); tCur.updated = Date.now(); tView = "chat"; TASK_TAG = null; try { taskTrack(text); } catch (e) {}''')
rep('''live.c = out; delete live.pending; if (out && out === EXPERT_LAST) live.x = 1;''', '''live.c = out; delete live.pending; try { taskAfter(live); } catch (e) {} if (out && out === EXPERT_LAST) live.x = 1;''')
# while Profe is coaching a task, the separate grammar card would repeat the same corrections
rep('''    if (!(tCur && tCur.coached === um.c)) checkMsg(um);''', '''    if (!(tCur && tCur.coached === um.c) && !(tCur && tCur.task && !tCur.task.done)) checkMsg(um);''')
# never show or say the tag
rep('''  function forVoice(full) {
    let t = String(full || "");''', '''  function forVoice(full) {
    let t = taskStrip(full);''')
rep('''    const body = m.pending && !m.c ? '<p class="muted">Thinking…</p>' : md(m.c || "")''', '''    const body = m.pending && !m.c ? '<p class="muted">Thinking…</p>' : md(taskStrip(m.c || ""))''')
# during a task the model evaluates each attempt itself: the rule-based quick coach and praise would talk over it
rep("    const CO = turns.length > 0 && lastU.length < 300 ? convoCoach(lastU) : null;", "    const taskOn = !!(tCur && tCur.task && !tCur.task.done);\n    const CO = !taskOn && turns.length > 0 && lastU.length < 300 ? convoCoach(lastU) : null;")
rep("    if (!pre && !(tCur && tCur.role) && lastU.length < 300", "    if (!taskOn && !pre && !(tCur && tCur.role) && lastU.length < 300")
rep("        { const t0 = String(out).trim(); if (t0 && !/[.!?…»”\")*]\\s*$/.test(t0))", "        { { const tg = /\\[\\[\\s*(✓|✗|★|·|ok|no|done|-)\\s*\\]\\]/i.exec(String(out)); if (tg) { TASK_TAG = tg[0]; out = taskStrip(out); } } const t0 = String(out).trim(); if (t0 && !/[.!?…»”\")*]\\s*$/.test(t0))")
# the built-in verb drills are for drills; "practise talking about my weekend in the past" is a conversation task for Profe
rep("""    if (/\\b(practi[cs]e|practicar|practiquemos|practica|drill|quiz me|test me|ejercicios?)\\b/.test(q)) I = drVerbIn(text);""", """    const convo = /\\b(talk|talking|speak|speaking|conversation|conversa|conversar|hablar|write|writing|sentences?|frases?|about|sobre|story|historia|describ|role.?play)/.test(q);
    if (!convo && /\\b(practi[cs]e|practicar|practiquemos|practica|drill|quiz me|test me|ejercicios?)\\b/.test(q)) I = drVerbIn(text);""")
rep("""    if (!I && /\\b(practi[cs]e|practicar|practica|drill|quiz|test|ejercicio)/.test(q) && TENSES.some""", """    if (!I && !convo && /\\b(practi[cs]e|practicar|practica|drill|quiz|test|ejercicio)/.test(q) && TENSES.some""")
# during a task the general "chat about it" steer would pull Profe off the task
rep("""steerNote(lastU, prevA0 && cleanLocal(prevA0.content)) + taskNote(true)""", """((st) => (tCur && tCur.task && /^\\(Reply as Profe: respond to what the learner said by sharing/.test(st) ? "" : st))(steerNote(lastU, prevA0 && cleanLocal(prevA0.content))) + taskNote(true) + turnNote()""")
# a repeated correction is normal in a task (the learner repeats the mistake): don't treat it as the model looping
rep("        const weak = (o) => !tidyReply(cleanLocal(o), nth) || (prevA && sameReply(cleanLocal(o), cleanLocal(prevA.content)));", "        const weak = (o) => !tidyReply(cleanLocal(o), nth) || (!(tCur && tCur.task) && prevA && sameReply(cleanLocal(o), cleanLocal(prevA.content)));")
rep("No greeting, no «¿en qué puedo ayudarte?».)\", 220, 0.6,", "No greeting, no «¿en qué puedo ayudarte?».)\" + taskNote(true), 220, 0.6,")
rep("""    if (!CAN_MIC) return;
    SPK_GEN++;""", """    if (!CAN_MIC) return;
    try { speechCut(); } catch (e) {}
    SPK_GEN++;""")
rep("""    if (tBusy) { const el = document.getElementById("t-live"); if (el) { el.hidden = false; el.textContent = "Profe is still answering your last message. Wait for it, or tap Stop and send again."; } return; }""",
    """    try { speechCut(); } catch (e) {}
    if (tBusy && tCtl) { try { tCtl.abort(); } catch (e) {} for (let w = 0; w < 120 && tBusy; w++) await new Promise((r) => setTimeout(r, 50)); { const a = tCur && [...tCur.msgs].reverse().find((m) => m.r === "a"); if (a && !a.cut) a.cut = "—"; } }
    if (tBusy) { const el = document.getElementById("t-live"); if (el) { el.hidden = false; el.textContent = "Profe is still answering your last message. Wait for it, or tap Stop and send again."; } return; }""")
rep("if (CG.seg) { CG.done += CG.seg; CG.seg = 0; CG.last = performance.now(); }", "if (CG.seg) { CG.done += CG.seg; CG.seg = 0; CG.last = performance.now(); try { SPOKEN.heard.push(t); } catch (x) {} }")
rep("if (n !== CG.key) { CG.key = n; CG.done = 0; CG.free = false; }", "if (n !== CG.key) { CG.key = n; CG.done = 0; CG.free = false; SPOKEN.heard = []; }")
# the small models' clean-up must not drop the tag
rep("  function cleanLocal(t) {\n", "  function cleanLocal(t) { const m = /\\[\\[\\s*(✓|✗|★|·|ok|no|done|-)\\s*\\]\\]/i.exec(t || \"\"); const r = cleanLocal0(taskStrip(t)); if (m) TASK_TAG = m[0]; return r; }\n  function cleanLocal0(t) {\n")
# the task, shown above the chat
rep('''      body = '<div class="tscroll" id="t-msgs">' +''', '''      body = (tCur && tCur.task ? '<div class="t-task"><span aria-hidden="true">' + (tCur.task.done ? "🏁" : "🎯") + '</span><span class="ext"><small>' + (tCur.task.done ? "Task done" : "Current task") + "</small><b>" + esc(tCur.task.t.length > 70 ? tCur.task.t.slice(0, 68) + "…" : tCur.task.t) + '</b></span><button class="btn small" data-act="t-task-end">End</button></div>' : "") + '<div class="tscroll" id="t-msgs">' +''')
rep('''    else if (act === "t-en") {''', '''    else if (act === "t-task-end") { if (tCur) { tCur.task = null; tPush(tCur); } tRender(); }
    else if (act === "t-en") {''')
CSS = r'''
.t-task { display: flex; align-items: center; gap: 10px; margin: 0 0 6px; padding: 8px 12px; border-radius: 12px; background: color-mix(in srgb, var(--cobalt) 9%, var(--surface)); border: 1px solid color-mix(in srgb, var(--cobalt) 25%, var(--line)) }
.t-task .ext { flex: 1; min-width: 0; display: flex; flex-direction: column } .t-task small { color: var(--muted); font-size: .75rem; text-transform: uppercase; letter-spacing: .05em } .t-task b { font-size: .92rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis }
'''
k = s.rindex("</style>", 0, s.index("</head>")); s = s[:k] + CSS + s[k:]
open(p, "w", encoding="utf-8").write(s)
print("task ok")
