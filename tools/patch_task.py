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
  function taskTrack(text) {
    if (!tCur) return; const T = tCur.task;
    if (TASK_RE.test(text) && text.length > 6) { tCur.task = { t: text.trim().slice(0, 220), tries: 0, done: false, at: Date.now() }; return; }
    if (T && T.done && YES_RE.test(text)) { T.done = false; T.tries = 0; T.more = 1; }
  }
  let TASK_TAG = null;
  function taskTag(c) { const m = /\[\[\s*(✓|✗|★|·|ok|no|done|-)\s*\]\]/i.exec(c || ""); return m ? ({ ok: "✓", no: "✗", done: "★", "-": "·" }[m[1].toLowerCase()] || m[1]) : null; }
  const taskStrip = (c) => String(c || "").replace(/\s*\[\[\s*(✓|✗|★|·|ok|no|done|-)\s*\]\]\s*/gi, " ").replace(/\s*\[\[[^\]]{0,8}$/, "").trim();
  function taskAfter(live) {
    if (!tCur || !tCur.task || !live || !live.c) return;
    const T = tCur.task, raw = live.c; let tag = taskTag(raw) || taskTag(TASK_TAG); TASK_TAG = null;
    if (!tag) { const plain = raw.toLowerCase(); tag = /¡?(felicidades|enhorabuena|congratulations|well done[^.]*task|has terminado|you('ve| have) (finished|completed))/.test(plain) ? "★" : /(inténtalo|intentalo|try again|otra vez|casi|not quite|almost)/.test(plain) ? "✗" : /(¡?correcto|¡?exacto|¡?perfecto|¡?muy bien|that's right|correct!)/.test(plain) ? "✓" : "·"; }
    if (tag === "✗") T.tries = (T.tries || 0) + 1; else if (tag === "✓") T.tries = 0; else if (tag === "★") { T.done = true; T.tries = 0; try { celebrate(false); } catch (e) {} }
    live.c = taskStrip(raw);
  }
  const TASK_RULES = "\n\nLesson discipline (most important):\n" +
    "- Keep to the CURRENT TASK given below. Every reply must serve it. If the learner drifts off topic, answer in one short sentence and bring them back to the task. If the learner clearly asks for a different task, switch to it at once and say so in a few words.\n" +
    "- When the learner makes an attempt (an answer, a sentence, a turn in the conversation): 1) FIRST evaluate the whole attempt: say clearly whether it is right and name something specific they did well; 2) THEN walk through each mistake politely: the corrected version with the fix in **bold** and a one-line reason; 3) then the next step.\n" +
    "- If the attempt was not right: kindly ask them to try again. If they have already missed this same item twice, give a clue or a model answer they can use, then ask them to try once more.\n" +
    "- If it was right: brief, specific praise, then the next item, a little harder.\n" +
    "- When the whole task is complete: congratulate them, then ask whether they want to continue with more of the same or change to something else. If they want to change, ask one or two short questions (which topic? which skill: speaking, writing, grammar or vocabulary? easier or harder?) to find out what, then start it.\n" +
    "- Be a polite, patient instructor: warm, encouraging and clear, never vague or sarcastic.\n" +
    "- At the very end of every reply add ONE tag for the app (it is hidden from the learner): [[✓]] if their last attempt was right, [[✗]] if it was not, [[★]] if the task is now complete, [[·]] if there was nothing to judge.";
  function taskNote(short) {
    const T = tCur && tCur.task; if (!T) return short ? "" : "\n\nCURRENT TASK: none yet. Follow what the learner asks; once they ask for an activity, that becomes the task.";
    const st = T.done ? "COMPLETED. The learner is choosing whether to continue or change: follow their answer (if they want something else, ask what, briefly)." : T.more ? "continuing with more of the same." : "in progress.";
    const tr = T.done ? "" : " Misses on the current item so far: " + (T.tries || 0) + (T.tries >= 2 ? " (give a clue or a model answer now)." : ".");
    return (short ? "\n(Task: «" + T.t + "» — " + st + tr + " Evaluate any attempt first, then correct politely. End with [[✓]], [[✗]], [[★]] or [[·]].)" : "\n\nCURRENT TASK (set by the learner): «" + T.t + "» — " + st + tr);
  }
'''
rep("  function rules(ctx, compact) {", JS + "  function rules(ctx, compact) { return rules0(ctx, compact) + TASK_RULES + taskNote(false); }\n  function rules0(ctx, compact) {")
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
