"""Exam speaking v2 (tools/EXAM_SPEAKING_V2_BRIEF.md): Android records and delivers the words when you stop (on-device), nothing in the
box changes while you speak; live mode elsewhere shows in-progress words outside the box; time bars per task and for the paper."""
import sys
p = sys.argv[1]; s = open(p, encoding="utf-8").read()
if "function exRecStart" in s: sys.exit("already patched")
def rep(a, b, n=1):
    global s
    assert s.count(a) == n, ("anchor", a[:90], s.count(a)); s = s.replace(a, b)
# the box holds confirmed words only; the recogniser's running guess is shown apart, faintly
rep('''function exBox(ti) { const b = document.querySelector('[data-ex-t="' + ti + '"]'), v = exAnsText(ti); if (b) b.value = v;''',
    '''function exBox(ti) { const b = document.querySelector('[data-ex-t="' + ti + '"]'), v = String(EX.txt[ti] || ""); if (b) b.value = v;''')
rep('''function exStat(ti, m, bad) { const l = document.getElementById("ex-live-" + ti); if (l) { l.textContent = m || ""; l.classList.toggle("bad", !!bad); } }''',
    '''function exStat(ti, m, bad, faint) { const l = document.getElementById("ex-live-" + ti); if (l) { l.textContent = m || ""; l.classList.toggle("bad", !!bad); l.classList.toggle("faint", !!faint); } }''')
rep('''heard = (f + im).trim(); exBox(ti); exStat(ti, "Listening… " + wWords(exAnsText(ti)) + " words"); exSave(); };''',
    '''heard = (f + im).trim(); exBox(ti); exStat(ti, im.trim() ? "Hearing: " + im.trim() : "Listening…", false, !!im.trim()); exSave(); };''')
# controls: level meter and time bar while recording
rep('''    const has = wWords(exAnsText(ti)) > 0;
    return '<div class="row"><button class="btn primary" data-act="ex-mic" data-t="' + ti + '">' + (on ? "■ Stop" :''',
    '''    const has = wWords(exAnsText(ti)) > 0;
    return (on ? exMeterHTML(ti) : "") + '<div class="row"><button class="btn primary" data-act="ex-mic" data-t="' + ti + '">' + (on ? "■ Stop" :''')
rep('''    if (cv) return '<p class="excvq">Question ' ''', '''    if (cv) return exMeterHTML(ti) + '<p class="excvq">Question ' ''')
# monologue: record (Android) or live
rep('''  function exMono(ti) {
    EX.keep = ti; EX.recT = ti; exPaintCtl(ti); exStat(ti, "Listening…");''', '''  function exMono(ti) {
    if (exRecMode()) { exRecStart(ti, null); return; }
    EX.keep = ti; EX.recT = ti; exPaintCtl(ti); exStat(ti, "Listening…");''')
rep('''  function exStopMic(ti) {
    EX.keep = null; if (EX.cv) { exHalt(); exDone(ti, ""); return; }''', '''  function exStopMic(ti) {
    EX.keep = null; if (EX.arec && !EX.cv) { exRecStop(); return; } if (EX.cv) { exHalt(); exDone(ti, ""); return; }''')
# conversations: the answer is recorded; quiet after speaking (or Next) ends it
rep('''    if (EX.rec) { const r = EX.rec; EX.rec = null; if (r._close) r._close(); try { r.abort(); } catch (e) {} } // keep the answer being heard''',
    '''    if (EX.arec) { exRecStop(); return; } // the recorded answer is written down first; its handler asks the next question
    if (EX.rec) { const r = EX.rec; EX.rec = null; if (r._close) r._close(); try { r.abort(); } catch (e) {} } // keep the answer being heard''')
rep('''    const listen = () => { if (!ok()) return; exStat(ti, "Your turn: answer now"); EX.txt[ti] = exQaText(ti);''',
    '''    const listen = () => { if (!ok()) return; exStat(ti, "Your turn: answer now"); EX.txt[ti] = exQaText(ti);
      if (exRecMode()) { exRecStart(ti, (txt) => { qa[qi].a = txt; EX.txt[ti] = exQaText(ti); exBox(ti); exSave(true); if (ok()) setTimeout(() => ok() && exNextQ(ti), 300); }, { auto: true, keepT: true }); return; }''')
# leaving / finishing: a recording is stopped and its words still land
rep('''  function exHalt() {
    if (!EX) return; const cv = EX.cv; EX.cv = null; EX.keep = null;''', '''  function exHalt() {
    if (!EX) return; if (EX.arec && EX.arec.st !== "transcribing") { try { window.AndroidRec.stop(); } catch (e) {} EX.arec.st = "transcribing"; }
    const cv = EX.cv; EX.cv = null; EX.keep = null;''')
rep('''  async function exSubmit(late) {
    exStop();''', '''  async function exSubmit(late) {
    if (EX.arec) { EX.phase = "grading"; EX.prog = "Writing down what you said…"; EX.pct = 3; exRender(); await exRecStop(); EX.phase = "run"; }
    exStop();''')
# the paper's clock as a bar
rep('''      (EX.phase === "run" ? '<span class="exclock" id="ex-clock">' + exClock(EX.end - Date.now()) + "</span>" : "") + "</div>";''',
    '''      (EX.phase === "run" ? '<span class="exclock" id="ex-clock">' + exClock(EX.end - Date.now()) + "</span>" : "") + (EX.phase === "run" && EX.end ? '<span class="expbar" aria-hidden="true"><i id="ex-pbar" style="width:' + exPaperPct() + '%"></i></span>' : "") + "</div>";''')
rep('''if (el) { el.textContent = exClock(left); el.classList.toggle("low", left < 5 * 60000); }''',
    '''if (el) { el.textContent = exClock(left); el.classList.toggle("low", left < 5 * 60000); } const pb = document.getElementById("ex-pbar"); if (pb) { pb.style.width = exPaperPct() + "%"; pb.classList.toggle("low", left < 5 * 60000); }''')
REC = r'''  // ---------- v2: record, then the words (Android, on-device); time bars ----------
  const exPaperPct = () => (EX && EX.end ? Math.max(0, Math.min(100, 100 - ((EX.end - Date.now()) / (EX.mins * 60000)) * 100)) : 0);
  const exRecMode = () => !!(window.AndroidRec && !EX.noRec && String(window.AndroidRec.status && window.AndroidRec.status()) === "ok");
  function exMeterHTML(ti) {
    const t = EX.tasks[ti], R = EX.arec && EX.arec.ti === ti ? EX.arec : null, el = (EX.secs[ti] || 0) + (R ? (Date.now() - R.t0) / 1000 : EX.recT === ti && EX.lt0 ? (Date.now() - EX.lt0) / 1000 : 0), goal = (+t.speak || 2) * 60, pct = Math.min(100, (el / goal) * 100);
    return '<div class="exrec" id="ex-rec-' + ti + '"><span class="exrdot" aria-hidden="true"></span><span class="exlvl" id="ex-lvl-' + ti + '" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></span>' +
      '<span class="extbar" role="progressbar" aria-label="Speaking time" aria-valuemin="0" aria-valuemax="' + Math.round(goal) + '" aria-valuenow="' + Math.round(el) + '"><i id="ex-tb-' + ti + '" class="' + (el >= goal ? "over" : "") + '" style="width:' + pct + '%"></i></span><span class="extime" id="ex-tt-' + ti + '">' + exClock(el * 1000) + " / " + exClock(goal * 1000) + "</span></div>";
  }
  function exTimeTick() {
    if (!EX || EX.recT == null) { clearInterval(EX && EX.ttm); if (EX) EX.ttm = null; return; }
    const ti = EX.recT, t = EX.tasks[ti], R = EX.arec, el = (EX.secs[ti] || 0) + (R && R.ti === ti ? (Date.now() - R.t0) / 1000 : EX.lt0 ? (Date.now() - EX.lt0) / 1000 : 0), goal = (+t.speak || 2) * 60;
    const b = document.getElementById("ex-tb-" + ti), tt = document.getElementById("ex-tt-" + ti); if (b) { b.style.width = Math.min(100, (el / goal) * 100) + "%"; b.classList.toggle("over", el >= goal); } if (tt) tt.textContent = exClock(el * 1000) + " / " + exClock(goal * 1000);
    if (el >= goal && !EX.overSaid) { EX.overSaid = ti; if (!R || R.st === "recording") exStat(ti, "Time for this task is up: finish your sentence.", false, false); }
  }
  function exMeter(ti, v) { const m = document.getElementById("ex-lvl-" + ti); if (!m) return; [...m.children].forEach((x, i) => { x.style.transform = "scaleY(" + Math.max(0.15, Math.min(1, v * (1.4 - Math.abs(i - 2) * 0.25) * 2)) + ")"; }); }
  window.__arec = { ev(type, v) {
    const R = EX && EX.arec; if (!R) return;
    if (type === "level") { const x = +v || 0; exMeter(R.ti, x); if (x > 0.08) { R.lastLoud = Date.now(); R.spoke = true; }
      if (R.auto && R.spoke && R.st === "recording" && Date.now() - R.lastLoud > 2500) exRecStop(); // a conversation answer: quiet after speaking ends it
      if (R.st === "recording" && Date.now() - R.t0 > 90000 && R.auto) exRecStop(); return; }
    if (type === "state") { if (/^error:/.test(v)) exRecFail(R, String(v).slice(6)); else { R.st = v; exStat(R.ti, v === "transcribing" ? "Writing down what you said…" : "Recording… your words appear when you stop."); } return; }
    if (type === "done") exRecDone(R, String(v || "").trim());
  } };
  function exRecStart(ti, onDone, o) {
    o = o || {}; const rt = EX.recT; EX.recT = null; try { hfStopOthers(); } catch (e) {} EX.recT = rt; // stop the wake listener etc., never this exam's own conversation
    EX.arec = { ti, t0: Date.now(), onDone, auto: !!o.auto, st: "starting", lastLoud: Date.now(), spoke: false }; EX.recT = ti; EX.keep = ti; EX.overSaid = null;
    exPaintCtl(ti); exStat(ti, "Recording… your words appear when you stop.");
    if (!EX.ttm) EX.ttm = setInterval(exTimeTick, 250);
    try { window.AndroidRec.start(sttLang()); } catch (e) { exRecFail(EX.arec, "start"); }
  }
  function exRecStop() {
    const R = EX && EX.arec; if (!R) return Promise.resolve("");
    if (!R.wait) R.wait = new Promise((res) => { R.res = res; setTimeout(() => { if (EX && EX.arec === R) exRecDone(R, ""); }, 15000); });
    if (R.st !== "transcribing") { R.st = "transcribing"; exStat(R.ti, "Writing down what you said…"); try { window.AndroidRec.stop(); } catch (e) {} }
    return R.wait;
  }
  function exRecDone(R, text) {
    if (!EX || EX.arec !== R) return; EX.arec = null; const ti = R.ti;
    EX.secs = EX.secs || {}; EX.secs[ti] = (EX.secs[ti] || 0) + (Date.now() - R.t0) / 1000;
    if (R.onDone) R.onDone(text); else { if (text) EX.txt[ti] = ((EX.txt[ti] || "") + " " + text).trim(); }
    if (!R.onDone || !EX.cv) { EX.recT = null; EX.keep = null; }
    exBox(ti); exPaintCtl(ti); const n = wWords(String(EX.txt[ti] || ""));
    if (!EX.cv) exStat(ti, text ? "✓ Saved · " + n + " word" + (n === 1 ? "" : "s") : "I couldn't make out any words. Try again closer to the phone, or type your answer.", !text);
    exSave(true); if (R.res) R.res(text);
  }
  function exRecFail(R, why) {
    if (!EX || EX.arec !== R) return; EX.arec = null; EX.recT = null; EX.noRec = true;
    const m = { "no-ondevice": "This phone can't write down a recording on the device, so your words will appear as you speak instead.", "no-lang": "The offline Spanish speech pack isn't installed (the Google app › your profile picture › Settings › Voice › Languages (add Spanish)), so your words will appear as you speak instead.", "no-mic": "The microphone is blocked for Ruta DELE: allow it in Android Settings › Apps › Ruta DELE › Permissions, or type your answer." }[why];
    exPaintCtl(R.ti); if (R.res) R.res("");
    if (why !== "no-mic") { if (R.onDone) { const cv = EX.cv; if (cv) { cv.qi--; exNextQ(R.ti); } } else exMono(R.ti); } // carry on in live mode
    exStat(R.ti, m || "Recording didn't start (" + why + "): your words will appear as you speak instead.", why === "no-mic");
  }
  // leaving the paper stops the mic (what was heard is kept); the clock keeps running, as in the real exam'''
rep('''  // leaving the paper stops the mic (what was heard is kept); the clock keeps running, as in the real exam''', REC)
# live mode: the time bar too
rep('''  function exMono(ti) {
    if (exRecMode()) { exRecStart(ti, null); return; }
    EX.keep = ti; EX.recT = ti;''', '''  function exMono(ti) {
    if (exRecMode()) { exRecStart(ti, null); return; }
    EX.lt0 = Date.now(); EX.overSaid = null; if (!EX.ttm) EX.ttm = setInterval(exTimeTick, 250);
    EX.keep = ti; EX.recT = ti;''')
rep('''  function exDone(ti, err) {
    if (!EX) return; EX.recT = null;''', '''  function exDone(ti, err) {
    if (!EX) return; EX.lt0 = 0; EX.recT = null;''')
rep("</head>", '''<style>
.exstat.faint{opacity:.6;font-style:italic}
.exrec{display:flex;align-items:center;gap:8px;margin:2px 0 8px}
.exrdot{width:10px;height:10px;border-radius:50%;background:#e0452e;flex:none;animation:hfpulse 1s infinite}
.exlvl{display:inline-flex;align-items:center;gap:2px;height:18px;flex:none}.exlvl i{display:block;width:3px;height:18px;border-radius:2px;background:var(--accent,#1d6f5f);transform:scaleY(.15);transition:transform .12s}
.extbar{flex:1;height:8px;border-radius:99px;background:var(--line,#e3e3e3);overflow:hidden;min-width:60px}.extbar i{display:block;height:100%;background:var(--accent,#1d6f5f);border-radius:99px;transition:width .25s linear}.extbar i.over{background:#e0a72e}
.extime{font-variant-numeric:tabular-nums;font-size:.8rem;color:var(--muted,#666);flex:none}
.exbar{flex-wrap:wrap}.expbar{flex-basis:100%;height:4px;border-radius:99px;background:var(--line,#e3e3e3);overflow:hidden;margin-top:6px}.expbar i{display:block;height:100%;background:var(--accent,#1d6f5f);transition:width 1s linear}.expbar i.low{background:#e0a72e}
@media (prefers-reduced-motion:reduce){.exrdot{animation:none}}
</style></head>''')
open(p, "w", encoding="utf-8").write(s)
print("exam v2 ok")
