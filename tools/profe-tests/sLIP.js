// v240 sustained lip-sync: the mouth must keep talking through the WHOLE utterance, not only its start, whatever the voice
// engine does with its word events: all words / only the first words (chunked engines) / positions that restart at each
// sentence / none at all — with a voice slower than expected. Measured in thirds of the audio (start, middle, end), and the
// mouth must close within 300 ms of the end.
const { chromium, devices } = require("playwright");
const URL = process.env.URL || "http://localhost:8766/";
const INIT = () => {
  const words = (t) => { const o = []; const re = /[\p{L}\d'’]+/gu; let m; while ((m = re.exec(t))) o.push(m.index); return o; };
  const ss = { speaking: false, pending: false, _t: [], getVoices: () => [{ name: "Google español de Estados Unidos", lang: "es-US", localService: false, voiceURI: "g", default: true }],
    cancel() { ss._t.forEach(clearTimeout); ss._t = []; const u = ss._u; ss._u = null; ss.speaking = false; if (u) { u.onerror && u.onerror({ error: "interrupted" }); } },
    pause() {}, resume() {}, addEventListener() {}, removeEventListener() {},
    speak(u) { ss.cancel(); ss._u = u; ss.speaking = true; const mpc = window.__mpc || 95, mode = window.__lipMode || "all", t = String(u.text || ""), ws = words(t), dur = t.length * mpc;
      window.__lipLog.push({ start: performance.now() + 120, end: performance.now() + 120 + dur });
      ss._t.push(setTimeout(() => { u.onstart && u.onstart({}); }, 120));
      ws.forEach((ci, n) => { let send = mode === "all" || (mode === "first" && n < 5); let idx = ci; if (mode === "reset") { const cut = t.lastIndexOf(".", ci - 1); idx = cut >= 0 ? ci - cut - 2 : ci; send = true; }
        if (send) ss._t.push(setTimeout(() => { u.onboundary && u.onboundary({ name: "word", charIndex: Math.max(0, idx) }); }, 120 + ci * mpc)); });
      ss._t.push(setTimeout(() => { ss.speaking = false; ss._u = null; u.onend && u.onend({}); }, 120 + dur)); } };
  Object.defineProperty(window, "speechSynthesis", { value: ss, configurable: true }); window.__lipLog = [];
  window.SpeechSynthesisUtterance = function (t) { this.text = t; this.lang = "es-US"; this.rate = 1; this.pitch = 1; this.volume = 1; };
  window.SpeechRecognition = window.webkitSpeechRecognition = function () { this.start = () => {}; this.stop = () => { this.onend && this.onend(); }; this.abort = this.stop; };
};
const TEXT = "Muy bien. Ayer fuiste al mercado con tu hermana y comprasteis fruta fresca, pan recién hecho y un poco de queso. " +
  "Después volvisteis a casa caminando por el parque, porque hacía muy buen tiempo y no teníais prisa. ¿Qué cocinasteis para la cena?";
(async () => {
  const b = await chromium.launch(); const R = []; const rec = (n, ok, i) => { R.push(!!ok); console.log((ok ? "PASS " : "FAIL ") + n + (ok ? "" : "  " + (i || ""))); };
  const c = await b.newContext({ ...devices["Pixel 7"], serviceWorkers: "block" }); await c.addInitScript(INIT); const p = await c.newPage();
  await p.goto(URL + "#a1-u1"); await p.waitForTimeout(1500);
  await p.evaluate(() => window.__vc.open()); await p.waitForTimeout(800);
  for (const mode of ["all", "first", "reset", "none"]) {
    const r = await p.evaluate(async ([mode, text]) => {
      const sleep = (ms) => new Promise((x) => setTimeout(x, ms)); speechSynthesis.cancel(); await sleep(400);
      window.__lipMode = mode; window.__lipLog = []; { const u0 = new SpeechSynthesisUtterance("Hola, ¿qué tal estás hoy? Vamos a practicar un poco de español juntos."); speechSynthesis.speak(u0); await sleep(75 * 95 + 600); }
      window.__lipLog = []; const u = new SpeechSynthesisUtterance(text); speechSynthesis.speak(u);
      const S = []; const t0 = performance.now(); while (performance.now() - t0 < text.length * 95 + 1200) { const cur = window.__vc.av.cur; S.push([performance.now(), window.__vcMouthH(), cur ? cur.wi : -1]); await sleep(40); }
      const L = window.__lipLog[0], d = L.end - L.start, third = (a, z) => { const xs = S.filter(([t]) => t >= L.start + d * a && t < L.start + d * z); return xs.filter(([, h]) => h > 1.2).length / Math.max(1, xs.length); };
      const after = S.filter(([t]) => t > L.end + 300).map(([, h]) => h);
      // timing error: where the mouth is in the text vs where the audio really is (word starts at 95 ms a character)
      const ws = []; { const re = /[\p{L}\d'’]+/gu; let m; while ((m = re.exec(text))) ws.push(m.index); }
      const err = S.filter(([t, , wi]) => wi >= 0 && t > L.start && t < L.end).map(([t, , wi]) => { const ci = (t - L.start) / 95; let k = 0; while (k < ws.length - 1 && ws[k + 1] <= ci) k++; return Math.abs(ws[wi] - ws[k]) * 95; }).sort((x, y) => x - y);
      const med = err.length ? Math.round(err[Math.floor(err.length / 2)]) : null, p90 = err.length ? Math.round(err[Math.floor(err.length * 0.9)]) : null;
      return { med, p90, start: +third(0, 1 / 3).toFixed(2), middle: +third(1 / 3, 2 / 3).toFixed(2), end: +third(2 / 3, 1).toFixed(2), closed: after.length ? Math.max(...after) < 0.6 : true, secs: +(d / 1000).toFixed(1) };
    }, [mode, TEXT]);
    rec("Word events «" + mode + "», " + r.secs + " s reply: the mouth talks at the start, middle AND end (open " + r.start + " / " + r.middle + " / " + r.end + "), closes after · position error median " + r.med + " ms, p90 " + r.p90 + " ms", r.start > 0.3 && r.middle > 0.3 && r.end > 0.3 && r.closed, JSON.stringify(r));
  }
  await p.evaluate(() => window.__vc.end()); await b.close(); const bad = R.filter((x) => !x).length; console.log(bad ? bad + " FAILED of " + R.length : "ALL " + R.length + " PASS"); process.exit(bad ? 1 : 0);
})();
