// v226 mic guard: with the OLD phone bridge's behaviour (mic goes to the newest recogniser, the previous one is never told;
// anyone's stop/abort kills whoever is listening), no screen may hang on "Listening…".
const { chromium, devices } = require("playwright");
const URL = process.env.URL || "http://localhost:8766/";
const OLD_BRIDGE = () => { // a faithful copy of bridge.js before v226, with a fake native side
  let active = null, sid = 0; window.__native = { mute: false, said: "hoy abre una biblioteca nueva en cusco", starts: 0, cancels: 0 };
  function SR() { this.lang = "es-US"; this.interimResults = false; this.continuous = false; this.onresult = this.onerror = this.onend = this.onstart = null; }
  const ev = (my, f) => setTimeout(() => { if (my === sid && active) f(active); }, 0);
  SR.prototype.start = function () { if (active && active !== this) { sid++; window.__native.cancels++; } active = this; const my = ++sid; window.__native.starts++;
    if (window.__native.mute) return; // the phone never opens the mic
    setTimeout(() => ev(my, (r) => { r.onstart && r.onstart({}); }), 200);
    setTimeout(() => ev(my, (r) => { if (window.__native.said) { const a = [{ transcript: window.__native.said, confidence: 0.9 }]; a.isFinal = true; r.onresult && r.onresult({ results: [a], resultIndex: 0 }); } }), 700);
    setTimeout(() => ev(my, (r) => { active = null; r.onend && r.onend({}); }), 900); };
  SR.prototype.stop = function () { const my = sid; setTimeout(() => ev(my, (r) => { active = null; r.onend && r.onend({}); }), 100); };
  SR.prototype.abort = function () { sid++; window.__native.cancels++; const was = active; active = null; }; // old bridge: cancels the CURRENT session, whoever owns it
  window.SpeechRecognition = SR; window.webkitSpeechRecognition = SR;
};
(async () => {
  const b = await chromium.launch(); const c = await b.newContext({ ...devices["Pixel 7"], viewport: { width: 360, height: 740 }, serviceWorkers: "block" }); await c.addInitScript(OLD_BRIDGE);
  const p = await c.newPage(); const er = []; p.on("pageerror", (x) => er.push(x.message));
  const R = []; const rec = (n, ok, i) => { R.push(!!ok); console.log((ok ? "PASS " : "FAIL ") + n + (ok || !i ? "" : "  " + i)); };
  const toSay = async () => { await p.goto(URL + "#practicar"); await p.waitForTimeout(500); await p.goto(URL + "#drill"); await p.waitForTimeout(800);
    await p.evaluate(() => { const Q = window.__qd(); const k = Q.ex.findIndex((e) => e.t === "say"); Q.i = k; Q.state = {}; document.querySelector('[data-act="qd-f"][aria-pressed="true"]'); }); await p.evaluate(() => { const Q = window.__qd(); Q.ex[Q.i].s = ["Hoy abre una biblioteca nueva en Cusco.", "Today a new library opens in Cusco."]; }); await p.evaluate(() => document.querySelector('[data-act="dr-again"]') ); };
  const btn = () => p.evaluate(() => { const b = document.querySelector('[data-act="dr-mic"]'); return b ? b.textContent : "(none)"; });
  const render = () => p.evaluate(() => { const Q = window.__qd(); document.querySelector('[data-act="qd-f"]'); });
  // 1. normal: mic opens, hears the sentence, scores it
  await p.goto(URL + "#drill"); await p.waitForTimeout(800);
  const hasSay = await p.evaluate(() => { const Q = window.__qd(); const k = Q.ex.findIndex((e) => e.t === "say"); if (k < 0) return false; Q.i = k; Q.state = {}; Q.ex[k].s = ["Hoy abre una biblioteca nueva en Cusco.", "Today a new library opens in Cusco."]; document.querySelector('[data-act="qd-lv"][aria-pressed="true"]').click(); return true; });
  // clicking the level restarts; set the say exercise again directly
  await p.waitForTimeout(400);
  const setSay = () => p.evaluate(() => { const Q = window.__qd(); let k = Q.ex.findIndex((e) => e.t === "say"); if (k < 0) { Q.ex.push({ t: "say", s: ["x", "y"] }); k = Q.ex.length - 1; } Q.i = k; Q.state = {}; Q.ex[k].s = ["Hoy abre una biblioteca nueva en Cusco.", "Today a new library opens in Cusco."]; window.__qdRender(); });
  await setSay(); await p.click('[data-act="dr-mic"]'); await p.waitForTimeout(1500);
  let st = await p.evaluate(() => ({ res: window.__qd().state.res, heard: window.__qd().state.heard }));
  rec("Normal: the mic hears the sentence and the drill scores it", st.res === "ok", JSON.stringify(st));
  // 2. another feature grabs the mic while the drill is listening (the screenshot)
  await setSay(); await p.evaluate(() => { window.__native.said = ""; }); await p.click('[data-act="dr-mic"]'); await p.waitForTimeout(100);
  await p.evaluate(() => { const o = new window.__SRG(); o.lang = "en-US"; o.start(); window.__other = o; }); await p.waitForTimeout(300);
  rec("Another feature takes the mic: the drill stops 'Listening…' at once and says so", /Speak/.test(await btn()) && /try again|Didn/.test(await p.evaluate(() => document.getElementById("dr-heard").textContent)), await btn());
  await p.evaluate(() => window.__other.abort()); await p.waitForTimeout(1500);
  // 3. a stale recogniser's abort can't kill the drill's live session
  await setSay(); await p.evaluate(() => { window.__native.said = "hoy abre una biblioteca nueva en cusco"; const o = new window.__SRG(); o.start(); o.abort(); window.__stale = o; }); await p.waitForTimeout(1300);
  await p.click('[data-act="dr-mic"]'); await p.waitForTimeout(150); await p.evaluate(() => window.__stale.abort()); await p.waitForTimeout(1300);
  st = await p.evaluate(() => ({ res: window.__qd().state.res, btn: (document.querySelector('[data-act="dr-mic"]') || {}).textContent }));
  rec("An old recogniser's cancel doesn't cut off the drill", st.res === "ok", JSON.stringify(st));
  // 4. the phone never opens the mic: after 8 s the drill gives the button back with a hint
  await setSay(); await p.evaluate(() => { window.__native.mute = true; }); await p.click('[data-act="dr-mic"]'); await p.waitForTimeout(500);
  const b1 = await btn(); await p.waitForTimeout(8200); const b2 = await btn();
  rec("Mic never opens: 'Listening…' for at most 8 s, then the button comes back with a hint", /Listening/.test(b1) && /Speak/.test(b2) && /try again/.test(await p.evaluate(() => document.getElementById("dr-heard").textContent)), b1 + " → " + b2);
  await p.evaluate(() => { window.__native.mute = false; });
  // 5. Profe's chat mic and a drill take turns; each always gets its end exactly once
  const ends = await p.evaluate(async () => { const sleep = (ms) => new Promise((r) => setTimeout(r, ms)); const cnt = [0, 0, 0]; const mk = (k) => { const r = new window.__SRG(); r.onend = () => cnt[k]++; return r; };
    const a = mk(0), b = mk(1), c = mk(2); a.start(); await sleep(50); b.start(); await sleep(50); c.start(); await sleep(50); a.abort(); b.stop(); await sleep(1500); return cnt; });
  rec("Three features in a row: each gets exactly one end, none hangs", ends.join() === "1,1,1", ends.join());
  rec("No page errors", !er.length, er.join(" | "));
  await b.close(); const f = R.filter((x) => !x).length; console.log(f ? f + " FAILED of " + R.length : "ALL " + R.length + " PASS"); process.exit(f ? 1 : 0);
})();
