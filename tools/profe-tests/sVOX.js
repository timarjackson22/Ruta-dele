// v275 voice stability: «el Profe» (no picture) speaks with a man's voice; the chosen voice is pinned (online/offline,
// a refreshed voice list, the word-event learning and a reload never swap it); a woman's look gets a woman's voice;
// reading stops when you leave its page (Read & Listen texts, guide read-aloud).
const { chromium, devices } = require("playwright");
const URL = process.env.URL || "http://localhost:8766/";
const INIT = () => {
  const V = (name, lang, net) => ({ name, lang, voiceURI: name, localService: !net, default: false });
  window.__voices = [V("es-us-x-sfb-network", "es-US", 1), V("es-us-x-esc-network", "es-US", 1), V("es-us-x-esd-local", "es-US", 0), V("es-us-x-esf-local", "es-US", 0), V("es-es-x-eea-network", "es-ES", 1), V("es-es-x-eed-local", "es-ES", 0), V("en-us-x-iob-network", "en-US", 1), V("en-us-x-iom-local", "en-US", 0)];
  window.__said = []; window.__cancels = 0;
  const ss = { speaking: false, pending: false, paused: false, onvoiceschanged: null, getVoices: () => window.__voices.slice(), cancel() { window.__cancels++; }, pause() {}, resume() {},
    speak(u) { window.__said.push({ t: u.text, v: u.voice && u.voice.name }); setTimeout(() => u.onstart && u.onstart({}), 5); setTimeout(() => u.onend && u.onend({}), 250); } };
  Object.defineProperty(window, "speechSynthesis", { value: ss }); window.SpeechSynthesisUtterance = class { constructor(t) { this.text = t; this.voice = null; } };
};
(async () => {
  const b = await chromium.launch(); const R = []; const rec = (n, ok, i) => { R.push(!!ok); console.log((ok ? "PASS " : "FAIL ") + n + (ok ? "" : "  " + (i || ""))); };
  const c = await b.newContext({ ...devices["Pixel 7"], serviceWorkers: "block" }); await c.addInitScript(INIT); const p = await c.newPage(); const er = []; p.on("pageerror", (e) => er.push(e.message));
  await p.goto(URL + "#inicio"); await p.waitForTimeout(1200);
  const g = (n) => window.__vGender({ name: n });
  const v0 = await p.evaluate(() => ({ ...window.__vx(), g: window.__vGender({ name: window.__vx().es }) }));
  rec("No picture chosen: Profe's Spanish voice is a man's (the women's network voices rank higher on quality)", v0.g === "m", JSON.stringify(v0));
  const v1 = await p.evaluate(async () => { const sl = (ms) => new Promise((r) => setTimeout(r, ms)); const a = window.__vx().es;
    dispatchEvent(new Event("offline")); await sl(50); dispatchEvent(new Event("online")); await sl(50);
    window.__voices = window.__voices.slice().reverse(); speechSynthesis.onvoiceschanged && speechSynthesis.onvoiceschanged(); await sl(50);
    return { a, b: window.__vx().es }; });
  rec("Going offline/online and a refreshed voice list keep the same voice (pinned)", v1.a === v1.b, JSON.stringify(v1));
  await p.reload(); await p.waitForTimeout(1200);
  const v2 = await p.evaluate(() => ({ es: window.__vx().es, pin: window.__vxPin().es }));
  rec("After a restart the same voice is used", v2.es === v1.a && v2.pin === v1.a, JSON.stringify(v2));
  const said = await p.evaluate(async () => { window.__said = []; const u = window.__utter ? window.__utter("Hola", "es") : null; if (u) speechSynthesis.speak(u); await new Promise((r) => setTimeout(r, 100)); return window.__said.map((x) => x.v); });
  rec("Every utterance names the pinned voice", said.length && said.every((n) => n === v1.a), JSON.stringify(said));
  const fv = await p.evaluate(() => { const ts = JSON.parse(localStorage.getItem("ruta-tutor") || "{}"); return !!ts; });
  // a woman's look → a woman's voice
  const vf = await p.evaluate(async () => { try { window.__setPav && window.__setPav("p:ana"); } catch (e) {} await new Promise((r) => setTimeout(r, 100)); return { es: window.__vx().es, g: window.__vGender({ name: window.__vx().es }) }; });
  if (vf.es) rec("Choosing Ana's picture gives a woman's voice", vf.g === "f" || vf.g === null && false, JSON.stringify(vf)); else rec("Choosing Ana's picture gives a woman's voice", false, "no hook");
  await p.evaluate(() => { window.__setPav && window.__setPav(""); });
  // Read & Listen: leaving the text stops the reading
  await p.goto(URL + "#historia-a1-1"); await p.waitForTimeout(1200);
  await p.evaluate(() => document.getElementById("pl-play").click()); await p.waitForTimeout(600);
  await p.evaluate(() => { location.hash = "#leer"; }); await p.waitForTimeout(400);
  const n0 = await p.evaluate(() => window.__said.length); await p.waitForTimeout(1500); const n1 = await p.evaluate(() => window.__said.length);
  rec("Leaving a Read & Listen text stops its reading (nothing more is said)", n1 === n0 && !(await p.evaluate(() => document.body.classList.contains("pl-playing"))), n0 + " → " + n1);
  // guide read-aloud stops when you leave the guide
  await p.goto(URL + "#gramatica"); await p.waitForTimeout(1500);
  const hasRa = await p.evaluate(() => { const b = document.getElementById("nb-ra"); if (b) b.click(); return !!b; }); await p.waitForTimeout(600);
  await p.evaluate(() => { location.hash = "#inicio"; }); await p.waitForTimeout(400);
  const m0 = await p.evaluate(() => window.__said.length); await p.waitForTimeout(1500); const m1 = await p.evaluate(() => window.__said.length);
  rec("Leaving a guide stops its read-aloud", hasRa && m1 === m0 && !(await p.evaluate(() => document.body.classList.contains("ra-on"))), JSON.stringify({ hasRa, m0, m1 }));
  rec("No page errors", !er.length, er.join(" | "));
  await b.close(); const bad = R.filter((x) => !x).length; console.log(bad ? bad + " FAILED of " + R.length : "ALL " + R.length + " PASS"); process.exit(bad ? 1 : 0);
})();
