"""Exams: speaking answers are never lost (pending words committed, iPhone phrases add up), drafts autosaved and restored,
conversation tasks take turns, warnings before marking empty tasks, results never drawn over another page
(tools/EXAM_SPEAKING_BRIEF.md)."""
import sys
p = sys.argv[1]; s = open(p, encoding="utf-8").read()
if "function exHalt" in s: sys.exit("already patched")
def rep(a, b, n=1):
    global s
    assert s.count(a) == n, ("anchor", a[:90], s.count(a)); s = s.replace(a, b)

# new paper: room for answers per question, restore a saved draft; a timed paper whose time ran out is marked straight away
rep('''if (!EX || EX.lv !== lv || EX.n !== n || EX.k !== k) { exStop(); EX = { lv, n, k, X, D, tasks: X[k], ans: {}, txt: {}, phase: "intro", plays: {}, mins: D.format.mins[k] }; }
    exRender();''',
'''if (!EX || EX.lv !== lv || EX.n !== n || EX.k !== k) { exStop(); EX = { lv, n, k, X, D, tasks: X[k], ans: {}, txt: {}, live: {}, qa: {}, secs: {}, phase: "intro", plays: {}, mins: D.format.mins[k] }; exRestore(); }
    if (EX.phase === "run" && EX.end && EX.end <= Date.now()) { exSubmit(true); return; }
    exRender();''')
# stopping commits what was heard
rep('''function exStop() { if (EX && EX.tm) clearInterval(EX.tm); if (EX) EX.tm = null; try { speechSynthesis.cancel(); } catch (e) {} if (EX && EX.rec) try { EX.rec.abort(); } catch (e) {} }''',
'''function exStop() { exHalt(); if (EX && EX.tm) clearInterval(EX.tm); if (EX) EX.tm = null; try { speechSynthesis.cancel(); } catch (e) {} }''')
# never draw the exam over another page (the clock can run out while you're elsewhere)
rep('''  function exRender() {
    const k = EX.k, T = EX.tasks;''', '''  function exRender() {
    if (!exHere()) return;
    const k = EX.k, T = EX.tasks;''')
rep('''app.innerHTML = '<div class="stack expage">' + exHead() + T.map((t, ti) => exTaskHTML(t, ti)).join("") +''',
'''const rest = EX.restored ? '<p class="callout exrest">✓ Your answers were restored' + (EX.restored > 1 ? " (saved " + new Date(EX.restored).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }) + ")" : "") + "." + (EX.end ? " The exam clock kept running." : "") + "</p>" : ""; EX.restored = 0;
    app.innerHTML = '<div class="stack expage">' + exHead() + rest + T.map((t, ti) => exTaskHTML(t, ti)).join("") +''')
rep('''"<p>Use the microphone to speak" + (CAN_MIC ? "" : " (not available here: type what you would say instead)") + ". Each task shows the preparation and speaking time. What you say is transcribed and marked with the DELE criteria.</p>"''',
'''"<p>Use the microphone to speak" + (CAN_MIC ? "" : " (not available here: type what you would say instead)") + ". Each task shows the preparation and speaking time. What you say is saved as you speak, then marked with the DELE criteria. In the conversations the examiner asks one question at a time and waits for your answer.</p>"''')
# speaking task: controls painted in place (no full re-render), status line, read-only box while recording
rep('''(done ? "" : '<div class="row">' + (CAN_MIC ? '<button class="btn primary" data-act="ex-mic" data-t="' + ti + '">' + (EX.recT === ti ? "■ Stop" : "🎙️ " + (t.ask ? "Start the conversation" : "Speak")) + "</button>" : "") + '<span class="muted small" id="ex-live-' + ti + '"></span></div>') +
        '<textarea class="extxt" data-ex-t="' + ti + '" rows="6" placeholder="' + (CAN_MIC ? "What you say appears here (you can also type)" : "Type what you would say") + '"' + (done ? " disabled" : "") + ">" + esc(v) + '</textarea><p class="small muted"><span data-ex-wc="' + ti + '">' + wWords(v) + "</span> words</p>";''',
'''(done ? "" : '<div class="exctl" id="ex-ctl-' + ti + '">' + exCtlHTML(ti) + '</div><p class="small muted exstat" id="ex-live-' + ti + '" aria-live="polite"></p>') +
        '<textarea class="extxt" data-ex-t="' + ti + '" rows="6" placeholder="' + (CAN_MIC ? "What you say is saved here as you speak (you can also type)" : "Type what you would say") + '"' + (done ? " disabled" : EX.recT === ti ? " readonly" : "") + ">" + esc(exAnsText(ti)) + '</textarea><p class="small muted"><span data-ex-wc="' + ti + '">' + wWords(exAnsText(ti)) + "</span> words</p>";''')
rep('''EX.plays[ti] = (EX.plays[ti] || 0) + 1; exRender();''', '''EX.plays[ti] = (EX.plays[ti] || 0) + 1; exSave(true); exRender();''')
# results: explain a zero, show the conversation
rep('''crit(r.crit, EX.k === "oral") +
      (r.comment ?''', '''crit(r.crit, EX.k === "oral") +
      (r.empty ? '<p class="callout exnone">' + (EX.k === "oral" ? "No answer was recorded for this task, so it scored 0." : "Nothing was written for this task, so it scored 0.") + "</p>" : "") +
      (r.comment ?''')
rep('''(r.text ? '<details><summary>Your answer</summary>''', '''(r.qa && r.qa.length ? '<details class="excvd" open><summary>The conversation</summary><div class="excv">' + r.qa.map((x) => '<p class="ex-q"><b>Examiner:</b> ' + esc(x.q) + '</p><p class="ex-a"><b>You:</b> ' + (x.a ? esc(x.a) : '<i class="muted">no answer</i>') + "</p>").join("") + "</div></details>" : "") +
      (r.text && !(r.qa && r.qa.length) ? '<details><summary>Your answer</summary>''')
# marking: flag empty tasks, keep the conversation, then drop the draft
rep('''out.push({ sc: ((c.ade + c.coh + c.cor + c.alc) / 12) * 25, crit: c, comment: "", tips: frac < 1 ?''', '''out.push({ empty: !filled, sc: ((c.ade + c.coh + c.cor + c.alc) / 12) * 25, crit: c, comment: "", tips: frac < 1 ?''')
rep('''} else out.push(await exGradeText(t, String(EX.txt[ti] || "").trim(), k === "oral", (EX.secs || {})[ti]));''',
'''} else { const tx = String(EX.txt[ti] || "").trim(), g = await exGradeText(t, tx, k === "oral", (EX.secs || {})[ti]); g.empty = wWords(tx) < 3; if (EX.qa && EX.qa[ti] && EX.qa[ti].length) g.qa = EX.qa[ti]; out.push(g); }''')
rep('''    save(); try { actAdd(10); } catch (e) {}
    EX.phase = "result"; exRender();''', '''    EX.phase = "result"; exDropDraft(); save(); try { actAdd(10); } catch (e) {}
    exRender();''')
rep('''      save(); EX.phase = "result"; exRender(); return;''', '''      EX.phase = "result"; exDropDraft(); save(); exRender(); return;''')

# the speaking engine
a = s.index("  // speaking: transcribe while you speak")
b = s.index('''  document.addEventListener("click", (e) => {
    const t = e.target.closest && e.target.closest("[data-act]"), a = t && t.dataset.act; if (!a || !/^ex-/.test(a)) return;''')
ENGINE = r'''  // ---------- answers kept: drafts on the phone ----------
  const exHere = () => !!EX && location.hash.slice(1) === EX.lv + "-examen-" + EX.n + "-" + EX.k;
  const exDK = () => EX.lv + "-" + EX.n + "-" + EX.k;
  function exSave(now) {
    if (!EX || EX.phase !== "run") return;
    (S.exDraft = S.exDraft || {})[exDK()] = { ans: EX.ans, txt: EX.txt, live: EX.live || {}, qa: EX.qa || {}, secs: EX.secs || {}, plays: EX.plays, end: EX.end || 0, free: !!EX.free, d: Date.now() };
    clearTimeout(EX.svT); if (now) save(); else EX.svT = setTimeout(save, 400);
  }
  function exRestore() {
    const d = (S.exDraft || {})[exDK()]; if (!d) return;
    Object.assign(EX, { ans: d.ans || {}, txt: d.txt || {}, qa: d.qa || {}, secs: d.secs || {}, plays: d.plays || {}, end: d.end || 0, free: !!d.free, phase: "run", restored: d.d || 1 });
    Object.keys(d.live || {}).forEach((ti) => { if (d.live[ti]) EX.txt[ti] = ((EX.txt[ti] || "") + " " + d.live[ti]).trim(); }); EX.live = {};
  }
  function exDropDraft() { if (EX && S.exDraft && S.exDraft[exDK()]) delete S.exDraft[exDK()]; }
  // ---------- speaking: every recogniser session adds to the answer; words still in progress are committed, never dropped ----------
  const exAnsText = (ti) => ((EX.txt[ti] || "") + " " + ((EX.live || {})[ti] || "")).trim();
  const EX_FATAL = /not-allowed|service-not-allowed|audio-capture|network|language|start/;
  function exBox(ti) { const b = document.querySelector('[data-ex-t="' + ti + '"]'), v = exAnsText(ti); if (b) b.value = v; const w = document.querySelector('[data-ex-wc="' + ti + '"]'); if (w) w.textContent = wWords(v); }
  function exStat(ti, m, bad) { const l = document.getElementById("ex-live-" + ti); if (l) { l.textContent = m || ""; l.classList.toggle("bad", !!bad); } }
  function exCommit(ti) { const w = (EX.live || {})[ti]; if (w) { EX.txt[ti] = ((EX.txt[ti] || "") + " " + w).trim(); EX.live[ti] = ""; } }
  function exCtlHTML(ti) {
    if (!CAN_MIC || !EX) return "";
    const t = EX.tasks[ti], on = EX.recT === ti, cv = EX.cv && EX.cv.ti === ti && EX.cv.qi >= 0 ? EX.cv : null;
    if (cv) return '<p class="excvq">Question ' + (cv.qi + 1) + " of " + t.ask.length + ": <i>" + esc(t.ask[cv.qi]) + '</i></p><div class="row"><button class="btn primary" data-act="ex-next" data-t="' + ti + '">' + (cv.qi + 1 < t.ask.length ? "Next question ›" : "Finish the conversation") + '</button><button class="btn" data-act="ex-mic" data-t="' + ti + '">■ Stop</button></div>';
    const has = wWords(exAnsText(ti)) > 0;
    return '<div class="row"><button class="btn primary" data-act="ex-mic" data-t="' + ti + '">' + (on ? "■ Stop" : t.ask ? (has ? "🎙️ Start the conversation again" : "🎙️ Start the conversation") : has ? "🎙️ Speak more" : "🎙️ Speak") + "</button></div>";
  }
  function exPaintCtl(ti) { const c = document.getElementById("ex-ctl-" + ti); if (c) c.innerHTML = exCtlHTML(ti); const b = document.querySelector('[data-ex-t="' + ti + '"]'); if (b) b.readOnly = EX ? EX.recT === ti : false; }
  // one recogniser session for task ti
  function exListen(ti, o) {
    const r = new SR(); EX.rec = r; EX.recT = ti; EX.live = EX.live || {}; EX.secs = EX.secs || {};
    r.lang = sttLang(); r.interimResults = true; r.continuous = !!o.cont && !IS_IOS;
    const base = String(EX.txt[ti] || ""), t0 = Date.now(); let heard = "", closed = false, err = "";
    const close = () => { if (closed) return; closed = true; EX.secs[ti] = (EX.secs[ti] || 0) + (Date.now() - t0) / 1000; if (o.done) o.done(heard, err); };
    r._close = close;
    r.onresult = (e) => { if (!EX || EX.rec !== r) return; let f = "", im = "";
      for (let i = 0; i < e.results.length; i++) { const x = e.results[i][0].transcript; if (e.results[i].isFinal) f += x + " "; else im += x + " "; }
      EX.txt[ti] = (base + " " + f).trim(); EX.live[ti] = im.trim(); heard = (f + im).trim(); exBox(ti); exStat(ti, "Listening… " + wWords(exAnsText(ti)) + " words"); exSave(); };
    r.onerror = (e) => { if (!EX || EX.rec !== r) return; err = (e && e.error) || "error"; if (IS_IOS && /not-allowed/.test(err)) { MIC_OK = false; try { micHelp("denied"); } catch (x) {} } };
    r.onend = () => { if (!EX || EX.rec !== r) return; EX.rec = null; exCommit(ti); exBox(ti); close(); exSave(true); if (o.end) o.end(heard, err, Date.now() - t0); };
    try { r.start(); } catch (e) { EX.rec = null; err = "start"; close(); if (o.end) o.end("", err, 0); }
  }
  // end the session now (Finish, the clock, leaving the page): what was heard so far is kept
  function exHalt() {
    if (!EX) return; const cv = EX.cv; EX.cv = null; EX.keep = null;
    if (cv) { cv.gen = -1; try { speechSynthesis.cancel(); } catch (e) {} }
    const r = EX.rec, ti = EX.recT; if (r == null && ti == null) return;
    EX.rec = null; EX.recT = null;
    if (r && r._close) r._close();
    if (ti != null) { exCommit(ti); exBox(ti); exPaintCtl(ti); }
    try { r && r.abort(); } catch (e) {}
    exSave(true);
  }
  const exMicErr = (e) => (/not-allowed/.test(e) ? "The microphone is blocked. Allow it for Ruta DELE, or type your answer." : /network/.test(e) ? "Speech recognition can’t connect right now. Type your answer instead." : /language/.test(e) ? "Spanish speech recognition isn’t available on this phone. Type your answer instead." : "The microphone didn’t start (" + e + "). Type your answer instead.");
  function exDone(ti, err) {
    if (!EX) return; EX.recT = null; EX.keep = null; exPaintCtl(ti); const n = wWords(exAnsText(ti)), bad = !!err && EX_FATAL.test(err);
    exStat(ti, bad ? exMicErr(err) : n ? "✓ Saved · " + n + " word" + (n === 1 ? "" : "s") : err === "no-speech" ? "Didn’t hear anything. Try again, or type your answer." : "", bad); exSave(true);
  }
  // a monologue: keeps listening until Stop (iPhone hears one phrase at a time, so it starts again after each one)
  function exMono(ti) {
    EX.keep = ti; EX.recT = ti; exPaintCtl(ti); exStat(ti, "Listening…");
    const go = () => exListen(ti, { cont: true, end: (heard, err, ms) => {
      if (EX && EX.keep === ti && !EX_FATAL.test(err) && (heard || ms > 1500)) { go(); return; }
      exDone(ti, err); } });
    go();
  }
  function exStopMic(ti) {
    EX.keep = null; if (EX.cv) { exHalt(); exDone(ti, ""); return; }
    const r = EX.rec; if (!r) { exDone(ti, ""); return; }
    exStat(ti, "Saving…"); try { r.stop(); } catch (e) {}
    setTimeout(() => { if (EX && EX.rec === r) { exHalt(); exDone(ti, ""); } }, 3000); // the recogniser never reported back: keep what was heard
  }
  // a conversation: the examiner asks one question, you answer, then the next one
  const exQaText = (ti) => (EX.qa[ti] || []).map((x) => x.a).filter(Boolean).join("\n");
  function exConv(ti) {
    const t = EX.tasks[ti]; EX.qa = EX.qa || {}; EX.qa[ti] = t.ask.map((q) => ({ q, a: "" }));
    EX.txt[ti] = ""; EX.live[ti] = ""; exBox(ti);
    EX.cv = { ti, qi: -1, gen: 1 }; EX.recT = ti; EX.keep = ti; exNextQ(ti);
  }
  function exNextQ(ti) {
    const cv = EX && EX.cv; if (!cv || cv.ti !== ti) return;
    if (EX.rec) { const r = EX.rec; EX.rec = null; if (r._close) r._close(); try { r.abort(); } catch (e) {} } // keep the answer being heard
    const gen = ++cv.gen; try { speechSynthesis.cancel(); } catch (e) {}
    const qa = EX.qa[ti]; cv.qi++;
    if (cv.qi >= qa.length) { EX.cv = null; exDone(ti, ""); return; }
    exPaintCtl(ti); exStat(ti, "The examiner is asking…"); exSave();
    const qi = cv.qi, ok = () => EX && EX.cv === cv && cv.gen === gen;
    const listen = () => { if (!ok()) return; exStat(ti, "Your turn: answer now"); EX.txt[ti] = exQaText(ti);
      exListen(ti, { cont: false,
        done: (heard) => { qa[qi].a = heard; EX.txt[ti] = exQaText(ti); EX.live[ti] = ""; exBox(ti); exSave(); },
        end: (heard, err) => { if (!ok()) return; if (EX_FATAL.test(err)) { EX.cv = null; exDone(ti, err); return; } setTimeout(() => ok() && exNextQ(ti), heard ? 500 : 900); } }); };
    if (!canSpeak) { listen(); return; }
    const u = utter(qa[qi].q, "es", 0.9, V2[1] || V2[0]); u.onend = u.onerror = () => setTimeout(listen, 250); speechSynthesis.speak(u);
  }
  function exMic(ti) {
    if (EX.recT === ti) { exStopMic(ti); return; }
    if (EX.recT != null) { const o = EX.recT; exHalt(); exDone(o, ""); }
    const t = EX.tasks[ti], go = () => { if (EX && EX.phase === "run") (t.ask && t.ask.length ? exConv(ti) : exMono(ti)); };
    if (IS_IOS && !MIC_OK) micAsk().then((ok) => ok && go()); else go();
  }
  // leaving the paper stops the mic (what was heard is kept); the clock keeps running, as in the real exam
  addEventListener("hashchange", () => { if (!EX || exHere()) return; if (EX.recT != null || EX.cv) exHalt(); if (EX.k === "auditiva" && EX.pgen) { EX.pgen++; try { speechSynthesis.cancel(); } catch (e) {} } });
  const exFlush = () => { if (EX && EX.phase === "run") exSave(true); };
  addEventListener("pagehide", exFlush); document.addEventListener("visibilitychange", () => { if (document.hidden) exFlush(); });
  window.__ex = () => EX;
'''
s = s[:a] + ENGINE + s[b:]

# click handlers
rep('''if (a === "ex-reset") { delete (S.ex || {})[t.dataset.k]; save(); route(); return; }''',
'''if (a === "ex-reset") { const kk = t.dataset.k; delete (S.ex || {})[kk]; Object.keys(S.exDraft || {}).forEach((d) => { if (d.indexOf(kk + "-") === 0) delete S.exDraft[d]; }); if (EX && exKey(EX.lv, EX.n) === kk) { exStop(); EX = null; } save(); route(); return; }''')
rep('''if (a === "ex-start") { EX.phase = "run"; EX.free = !!t.dataset.free; EX.end = EX.free ? 0 : Date.now() + EX.mins * 60000; exRender(); scrollTo(0, 0); }
    else if (a === "ex-ans") { EX.ans[t.dataset.k] = +t.dataset.v; t.parentElement.querySelectorAll("[data-act=ex-ans]").forEach((b) => b.setAttribute("aria-pressed", b === t)); }''',
'''if (a === "ex-start") { EX.phase = "run"; EX.free = !!t.dataset.free; EX.end = EX.free ? 0 : Date.now() + EX.mins * 60000; exSave(true); exRender(); scrollTo(0, 0); }
    else if (a === "ex-ans") { EX.ans[t.dataset.k] = +t.dataset.v; t.parentElement.querySelectorAll("[data-act=ex-ans]").forEach((b) => b.setAttribute("aria-pressed", b === t)); exSave(); }''')
rep('''else if (a === "ex-submit") { const miss = (EX.k === "lectura" || EX.k === "auditiva") ? EX.tasks.reduce((n, tt, ti) => n + tt.q.filter((_, qi) => EX.ans[ti + "-" + qi] == null).length, 0) : 0;
      if (miss && t.dataset.sure !== "1") { t.dataset.sure = "1"; t.textContent = miss + " unanswered. Tap again to finish"; return; } exSubmit(false); }''',
'''else if (a === "ex-submit") { const miss = (EX.k === "lectura" || EX.k === "auditiva") ? EX.tasks.reduce((n, tt, ti) => n + tt.q.filter((_, qi) => EX.ans[ti + "-" + qi] == null).length, 0) : 0;
      const emp = (EX.k === "escritura" || EX.k === "oral") ? EX.tasks.map((tt, ti) => ((tt.form ? tt.form.every((_, fi) => !String(EX.txt[ti + "-" + fi] || "").trim()) : wWords(exAnsText(ti)) < 3) ? tt.t : null)).filter(Boolean) : [];
      if ((miss || emp.length) && t.dataset.sure !== "1") { t.dataset.sure = "1"; t.textContent = miss ? miss + " unanswered. Tap again to finish" : emp.join(", ") + (emp.length > 1 ? " have" : " has") + " no answer yet. Tap again to finish"; return; } exSubmit(false); }''')
rep('''else if (a === "ex-again") { exStop(); EX = null; route(); }
    else if (a === "ex-mic") { EX.keep = EX.recT !== +t.dataset.t; exMic(+t.dataset.t); }''',
'''else if (a === "ex-again") { exStop(); exDropDraft(); save(); EX = null; route(); }
    else if (a === "ex-mic") exMic(+t.dataset.t);
    else if (a === "ex-next") exNextQ(+t.dataset.t);''')
rep('''if (el.dataset && el.dataset.exT != null) { EX.txt[el.dataset.exT] = el.value; const w = document.querySelector('[data-ex-wc="' + el.dataset.exT + '"]'); if (w) w.textContent = wWords(el.value); }
    if (el.dataset && el.dataset.exF != null) EX.txt[el.dataset.exF] = el.value;''',
'''if (el.dataset && el.dataset.exT != null) { if (EX.recT === +el.dataset.exT) return; EX.txt[el.dataset.exT] = el.value; if (EX.live) EX.live[el.dataset.exT] = ""; const w = document.querySelector('[data-ex-wc="' + el.dataset.exT + '"]'); if (w) w.textContent = wWords(el.value); exSave(); }
    if (el.dataset && el.dataset.exF != null) { EX.txt[el.dataset.exF] = el.value; exSave(); }''')
rep("</head>", '''<style>
.exstat{min-height:1.2em;margin:4px 0 6px}.exstat.bad{color:var(--bad,#b3261e)}
.excvq{margin:0 0 8px;font-size:.95rem}.extxt[readonly]{opacity:.85}
.excv p{margin:4px 0}.excv .ex-a{padding-left:12px;border-left:3px solid var(--accent,#1d6f5f)}
.exnone{border-left-color:var(--bad,#b3261e)}
</style></head>''')

# exam texts: line breaks and **bold** (rich() escaped them, so cards and texts showed "<br>" and "**")
rep("  const exOptL = (i) => String.fromCharCode(65 + i);", """  const exRich = (x) => esc(String(x || "")).replace(/\\*\\*([^*]+)\\*\\*/g, "<b>$1</b>").replace(/\\n/g, "<br>");
  const exOptL = (i) => String.fromCharCode(65 + i);""")
rep("rich(q.q)", "exRich(q.q)", 2)
rep('rich(String(x.b || x).replace(/\\n/g, "<br>"))', "exRich(x.b || x)")
rep('rich(t.source.replace(/\\n/g, "<br>"))', "exRich(t.source)")
rep('rich(t.card.replace(/\\n/g, "<br>"))', "exRich(t.card)")
rep("rich(t.ins)", "exRich(t.ins)")
# speaking: the clock includes the preparation time (DELE A1: 15 min to prepare tasks 1-2, then 15 min speaking)
rep("phase: \"intro\", plays: {}, mins: D.format.mins[k] }; exRestore(); }", "phase: \"intro\", plays: {}, mins: D.format.mins[k] + (k === \"oral\" ? Math.max(0, ...X[k].map((t) => +t.prep || 0)) : 0) }; exRestore(); }")
rep('" minutes" + (k === "oral" ? " (plus preparation time)" : "")', '" minutes" + (k === "oral" && EX.mins > EX.D.format.mins.oral ? " (" + (EX.mins - EX.D.format.mins.oral) + " to prepare + " + EX.D.format.mins.oral + " speaking)" : "")')
# compact exam header: one line, never taller than the app bar
rep(".exnone{", ".exbar .ext{min-width:0;flex:1}.exbar .ext b{display:block;font-size:1rem;line-height:1.25;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.exbar .ext small{display:block;font-size:.78rem}.exbar .exclock{flex:none}.exbar{background:var(--surface)!important}\n.exnone{")
open(p, "w", encoding="utf-8").write(s)
print("exam patch ok")
