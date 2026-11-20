// v250 — replays the 3rd S24 call log (2026-11-20 15:35): the FIRST sentence of a call (the greeting, nothing learned yet),
// 82 characters playing for 7.8 s, word events arriving at ~40 ms a letter (all within 3.3 s), «sound» signal on. The lips
// stayed still for the last 3.7 s. They must move to the end, whatever the events do.
const { chromium, devices } = require("playwright");
const URL = process.env.URL || "http://localhost:8766/";
const TEXT = "¡Hola! Soy Profe, tu profesor de español. ¡Qué alegría conocerte! ¿Cómo te llamas?";
const INIT = (ms) => {
  const words = (t) => { const o = []; const re = /[\p{L}\d'’]+/gu; let m; while ((m = re.exec(t))) o.push(m.index); return o; };
  let A = 0, Z = 0; window.__natSpeaking = () => { const n = performance.now(); return n >= A && n < Z; };
  const ss = { speaking: false, pending: false, _t: [], getVoices: () => [{ name: "es-us-x-sfb-network", lang: "es-US", localService: false, voiceURI: "g", default: true }],
    cancel() { ss._t.forEach(clearTimeout); ss._t = []; const u = ss._u; ss._u = null; ss.speaking = false; A = Z = 0; if (u) u.onerror && u.onerror({ error: "interrupted" }); },
    pause() {}, resume() {}, addEventListener() {}, removeEventListener() {},
    speak(u) { ss._u = u; ss.speaking = true; const t = String(u.text || ""), ws = words(t), dur = 7800 * t.length / 82, a0 = 600; A = performance.now() + a0; Z = A + dur; window.__lipLog.push({ start: A, end: Z, text: t });
      ss._t.push(setTimeout(() => { u.onstart && u.onstart({}); }, 1099));
      ws.forEach((ci) => ss._t.push(setTimeout(() => { u.onboundary && u.onboundary({ name: "word", charIndex: ci }); }, 1100 + 190 + ci * ms)));
      ss._t.push(setTimeout(() => { ss.speaking = false; ss._u = null; A = Z = 0; u.onend && u.onend({}); }, a0 + dur)); } };
  Object.defineProperty(window, "speechSynthesis", { value: ss, configurable: true }); window.__lipLog = [];
  window.SpeechSynthesisUtterance = function (t) { this.text = t; this.lang = "es-US"; this.rate = 1; this.pitch = 1; this.volume = 1; };
  window.SpeechRecognition = window.webkitSpeechRecognition = function () { this.start = () => {}; this.stop = () => { this.onend && this.onend(); }; this.abort = this.stop; };
};
(async () => {
  const b = await chromium.launch(); const R = []; const rec = (n, ok, i) => { R.push(!!ok); console.log((ok ? "PASS " : "FAIL ") + n + (ok ? "" : "  " + (i || ""))); };
  for (const ms of [40, 55, 95]) {
    const c = await b.newContext({ ...devices["Pixel 7"], serviceWorkers: "block" }); await c.addInitScript(INIT, ms); const p = await c.newPage();
    await p.goto(URL + "#a1-u1"); await p.waitForTimeout(1500); await p.evaluate(() => window.__vc.open()); await p.waitForTimeout(300);
    const r = await p.evaluate(async (TEXT) => { const sleep = (x) => new Promise((y) => setTimeout(y, x)); speechSynthesis.cancel(); await sleep(200); window.__lipLog = [];
      speechSynthesis.speak(new SpeechSynthesisUtterance(TEXT)); const S = []; const t0 = performance.now(); while (performance.now() - t0 < 9500) { S.push([performance.now(), window.__vcMouthH()]); await sleep(30); }
      const L = window.__lipLog[0], d = L.end - L.start, win = (a, z) => { let n = 0, mv = 0; for (let w = L.start + d * a; w < L.start + d * z - 200; w += 200) { const hs = S.filter(([t]) => t >= w && t < w + 200).map(([, h]) => h); if (hs.length < 2) continue; n++; if (Math.max(...hs) - Math.min(...hs) > 0.8) mv++; } return n ? +(mv / n).toFixed(2) : 1; };
      return { q1: win(0, 0.25), q2: win(0.25, 0.5), q3: win(0.5, 0.75), q4: win(0.75, 1), after: Math.max(0, ...S.filter(([t]) => t > L.end + 350).map(([, h]) => h)) }; }, TEXT);
    rec("Greeting with word events at " + ms + " ms a letter: lips move in every quarter (" + [r.q1, r.q2, r.q3, r.q4].join(" / ") + ") and close after", r.q1 >= 0.5 && r.q2 >= 0.5 && r.q3 >= 0.5 && r.q4 >= 0.5 && r.after < 1, JSON.stringify(r));
    await c.close();
  }
  await b.close(); const bad = R.filter((x) => !x).length; console.log(bad ? bad + " FAILED of " + R.length : "ALL " + R.length + " PASS"); process.exit(bad ? 1 : 0);
})();
