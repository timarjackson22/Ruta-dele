// v247 — reproduces the S24 call log of 2026-11-20: a fresh call, Profe's replies as separate short sentences, a Google
// online voice that reports every word about 2.2× faster than it plays, the «sound playing» signal on, and the «start»
// event arriving after the sound. The mouth must keep MOVING for the whole of every sentence (it used to rest from about
// halfway: «LIPS STILL» ≈ half of each sentence).
const { chromium, devices } = require("playwright");
const URL = process.env.URL || "http://localhost:8766/";
const SENTS = ["¡Qué bien que estés trabajando hoy!", "El trabajo es muy importante para aprender cosas nuevas cada día.", "¡Ah, el banco!", "Trabajar en un banco es un trabajo muy interesante y con mucha responsabilidad.", "¿Qué haces allí normalmente?", "La gente amable hace que el banco sea un buen lugar para trabajar todos los días."];
const INIT = () => {
  const words = (t) => { const o = []; const re = /[\p{L}\d'’]+/gu; let m; while ((m = re.exec(t))) o.push(m.index); return o; };
  let A = 0, Z = 0;
  window.__natSpeaking = () => { const n = performance.now(); return n >= A && n < Z; };
  const ss = { speaking: false, pending: false, _t: [], getVoices: () => [{ name: "es-us-x-sfb-network", lang: "es-US", localService: false, voiceURI: "g", default: true }],
    cancel() { ss._t.forEach(clearTimeout); ss._t = []; const u = ss._u; ss._u = null; ss.speaking = false; A = Z = 0; if (u) u.onerror && u.onerror({ error: "interrupted" }); },
    pause() {}, resume() {}, addEventListener() {}, removeEventListener() {},
    speak(u) { const go = () => { ss._u = u; ss.speaking = true; const mpc = 77, t = String(u.text || ""), ws = words(t), dur = t.length * mpc, a0 = 480; A = performance.now() + a0; Z = A + dur; window.__lipLog.push({ start: A, end: Z, text: t });
        ss._t.push(setTimeout(() => { u.onstart && u.onstart({}); }, a0 + 260)); // the start event arrives after the sound
        ws.forEach((ci) => ss._t.push(setTimeout(() => { u.onboundary && u.onboundary({ name: "word", charIndex: ci }); }, a0 + 30 + ci * 35)));
        ss._t.push(setTimeout(() => { ss.speaking = false; ss._u = null; A = Z = 0; u.onend && u.onend({}); ss._q.length ? ss._q.shift()() : 0; }, a0 + dur)); };
      ss._q = ss._q || []; if (ss.speaking) ss._q.push(go); else go(); } };
  Object.defineProperty(window, "speechSynthesis", { value: ss, configurable: true }); window.__lipLog = [];
  window.SpeechSynthesisUtterance = function (t) { this.text = t; this.lang = "es-US"; this.rate = 1; this.pitch = 1; this.volume = 1; };
  window.SpeechRecognition = window.webkitSpeechRecognition = function () { this.start = () => {}; this.stop = () => { this.onend && this.onend(); }; this.abort = this.stop; };
};
(async () => {
  const b = await chromium.launch(); const R = []; const rec = (n, ok, i) => { R.push(!!ok); console.log((ok ? "PASS " : "FAIL ") + n + (ok ? "" : "  " + (i || ""))); };
  const c = await b.newContext({ ...devices["Pixel 7"], serviceWorkers: "block" }); await c.addInitScript(INIT); const p = await c.newPage();
  await p.goto(URL + "#a1-u1"); await p.waitForTimeout(1500); await p.evaluate(() => window.__vc.open()); await p.waitForTimeout(3500); /* v258: calls open with a ~1.6 s «Calling…» ring before the greeting */
  const res = await p.evaluate(async (SENTS) => {
    const sleep = (ms) => new Promise((x) => setTimeout(x, ms)); speechSynthesis.cancel(); await sleep(300); window.__lipLog = [];
    SENTS.forEach((s) => speechSynthesis.speak(new SpeechSynthesisUtterance(s)));
    const S = []; const t0 = performance.now(), total = SENTS.reduce((n, s) => n + s.length * 77 + 480, 0) + 1500;
    while (performance.now() - t0 < total) { S.push([performance.now(), window.__vcMouthH()]); await sleep(30); }
    return window.__lipLog.map((L) => { const d = L.end - L.start, win = (a, z) => { let n = 0, mv = 0; for (let w = L.start + d * a; w < L.start + d * z - 200; w += 200) { const hs = S.filter(([t]) => t >= w && t < w + 200).map(([, h]) => h); if (hs.length < 2) continue; n++; if (Math.max(...hs) - Math.min(...hs) > 0.8) mv++; } return n ? +(mv / n).toFixed(2) : 1; };
      return { text: L.text.slice(0, 30), secs: +(d / 1000).toFixed(1), first: win(0, 0.5), second: win(0.5, 1) }; });
  }, SENTS);
  res.forEach((r, i) => rec("Sentence " + (i + 1) + " (" + r.secs + " s, «" + r.text + "…»): lips move in the first half (" + r.first + ") and the second half (" + r.second + ")", r.first >= 0.5 && r.second >= 0.5, JSON.stringify(r)));
  await b.close(); const bad = R.filter((x) => !x).length; console.log(bad ? bad + " FAILED of " + R.length : "ALL " + R.length + " PASS"); process.exit(bad ? 1 : 0);
})();
