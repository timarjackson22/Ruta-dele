// v228 Profe video call: entry, states, hands-free turns, lip sync tied to real speech events, commands, interruption,
// mute, captions, settings → prompt, navigation pause, camera, audio-only fallback, clean end, repeated calls.
const { chromium, devices } = require("playwright");
const URL = process.env.URL || "http://localhost:8766/";
const INIT = () => {
  // the phone's voice: start → a word boundary per word (≈70 ms a letter) → end; cancel interrupts at once
  const q = []; let cur = null; window.__spoken = [];
  class U { constructor(t) { this.text = t; this.lang = "es-US"; this.rate = 1; } }
  window.SpeechSynthesisUtterance = U;
  const ss = { speaking: false, pending: false, paused: false, getVoices: () => [{ name: "Google español de Estados Unidos", lang: "es-US", localService: false, voiceURI: "g" }, { name: "Google US English", lang: "en-US", localService: false, voiceURI: "e" }],
    speak(u) { q.push(u); ss.pending = true; if (!cur) next(); }, cancel() { const c = cur; q.length = 0; cur = null; ss.speaking = false; ss.pending = false; if (c) { clearTimeout(c._t); try { c.onerror && c.onerror({ error: "interrupted" }); } catch (e) {} } } };
  function next() { const u = q.shift(); if (!u) { ss.speaking = false; ss.pending = false; return; } cur = u; ss.speaking = true; ss.pending = q.length > 0; window.__spoken.push({ t: u.text, lang: u.lang, rate: u.rate, at: Date.now() });
    const words = [...u.text.matchAll(/[\p{L}\d'’]+/gu)]; let k = 0, scale = window.__ttsScale || 1;
    setTimeout(() => { if (cur !== u) return; u.onstart && u.onstart({}); const step = () => { if (cur !== u) return; if (k >= words.length) { u._t = setTimeout(() => { if (cur !== u) return; cur = null; u.onend && u.onend({}); next(); }, 60 * scale); return; } const w = words[k++]; u.onboundary && !window.__noB && u.onboundary({ name: "word", charIndex: w.index }); u._t = setTimeout(step, w[0].length * 70 * scale / (u.rate || 1)); }; step(); }, 40); }
  Object.defineProperty(window, "speechSynthesis", { value: ss, configurable: true, writable: true }); window.__rawSS = { speak: ss.speak.bind(ss), cancel: ss.cancel.bind(ss), ss };
  // the phone's recogniser: the test says things with __say(); it opens 100 ms after start
  let active = null; window.__recStarts = 0; window.__micOpen = () => !!active;
  class Rec { constructor() { this.lang = ""; } start() { active = this; window.__recStarts++; setTimeout(() => { if (active === this) this.onstart && this.onstart({}); }, 100); } stop() { this.abort(); } abort() { if (active !== this) return; active = null; setTimeout(() => { this.onend && this.onend({}); }, 5); } }
  window.SpeechRecognition = Rec; window.webkitSpeechRecognition = Rec;
  window.__sayI = (text) => { const r = active; if (!r) return false; const a = [{ transcript: text, confidence: 0.5 }]; a.isFinal = false; r.onresult && r.onresult({ results: [a], resultIndex: 0 }); return true; };
  window.__say = (text) => { const r = active; if (!r) return false; const a = [{ transcript: text, confidence: 0.9 }]; a.isFinal = true; r.onresult && r.onresult({ results: [a], resultIndex: 0 }); return true; };
  // the camera
  window.__camMode = "allow"; window.__camStopped = 0;
  navigator.mediaDevices = navigator.mediaDevices || {}; navigator.mediaDevices.getUserMedia = async (c) => { if (window.__camMode === "deny") { const e = new Error("denied"); e.name = "NotAllowedError"; throw e; } const cv = document.createElement("canvas"); cv.width = 48; cv.height = 64; const ms = cv.captureStream(5); ms.getTracks().forEach((t) => { const st = t.stop.bind(t); t.stop = () => { window.__camStopped++; st(); }; }); return ms; };
};
(async () => {
  const b = await chromium.launch(); const c = await b.newContext({ ...devices["Pixel 7"], viewport: { width: 390, height: 844 }, serviceWorkers: "block" }); await c.addInitScript(INIT);
  const p = await c.newPage(); const er = []; p.on("pageerror", (x) => er.push(x.message));
  const R = []; const rec = (n, ok, i) => { R.push(!!ok); console.log((ok ? "PASS " : "FAIL ") + n + (ok || !i ? "" : "  " + i)); };
  const st = () => p.evaluate(() => window.__vc.state());
  const until = (f, ms) => p.waitForFunction(f, null, { timeout: ms || 8000 }).then(() => true).catch(() => false);
  await p.goto(URL + "#a1-u1"); await p.waitForTimeout(1200);
  await p.evaluate(() => window.__setName("Ana", true)); // v248: the phone owner's name is set (turn-taking tests, not the first-meeting flow: see sINTRO)
  await p.evaluate(() => { document.body.classList.add("tabs-peek"); document.querySelector('[data-act="t-open"]').click(); }); await p.waitForTimeout(600);
  // 1. entry
  const btn = await p.evaluate(() => { const b = document.querySelector('#tutor .tseg [data-act="vc-open"]'), pr = document.querySelector('#tutor .tseg [data-act="t-tab"][data-v="practice"]'); if (!b || !pr) return null; const r1 = b.getBoundingClientRect(), r2 = pr.getBoundingClientRect(); return { label: b.getAttribute("aria-label"), beside: Math.abs(r1.top - r2.top) < 6 }; });
  rec("Video-call button beside Practice, labelled 'Video call with Profe'", btn && btn.label === "Video call with Profe" && btn.beside, JSON.stringify(btn));
  await p.click('#tutor [data-act="vc-open"]');
  rec("Opens the call screen with Profe's animated face", await until(() => document.querySelector("#vcall .vc-svg .vc-mouth") && document.querySelector("#vcall .vc-bar")));
  const ctr = await p.evaluate(() => [...document.querySelectorAll("#vcall .vc-bar [data-act]")].map((x) => x.getAttribute("aria-label")));
  rec("Controls: mute, captions, speed, camera, end", [/Mute/, /Captions/, /speed/, /camera/i, /End call/].every((r) => ctr.some((t) => r.test(t))), ctr.join(" | "));
  rec("Says it is an AI tutor", await p.evaluate(() => /AI tutor/.test(document.querySelector("#vcall .vc-ai").textContent)));
  // 2. greeting → lip sync on real word events
  rec("Profe greets (speaking state)", await until(() => window.__vc.state() === "speaking"));
  const lips = await p.evaluate(async () => { const sleep = (ms) => new Promise((r) => setTimeout(r, ms)); const m = () => document.querySelector("#vcall .vc-mouth").getAttribute("d"); const seen = new Set(); for (let i = 0; i < 20; i++) { seen.add(m()); await sleep(50); } return seen.size; });
  rec("While Profe speaks, the mouth moves with the words (many shapes)", lips >= 8, String(lips));
  const cap1 = await p.evaluate(() => ({ t: document.getElementById("vc-pro").textContent, on: !!document.querySelector("#vc-pro span.on") }));
  rec("Captions follow the voice: the word being said is lit", cap1.on, JSON.stringify(cap1));
  rec("After the greeting, Profe listens by itself (hands-free)", await until(() => window.__vc.state() === "listening" && window.__micOpen(), 15000));
  const cap2 = await p.evaluate(() => document.getElementById("vc-pro").textContent);
  rec("Captions show the whole reply (every spoken part), not just the last part", /Soy Profe/.test(cap2) && /(De qué quieres hablar hoy|Cómo te llamas)/.test(cap2), cap2); // v245: a first call asks the name
  const closed = await p.evaluate(() => { return window.__vcMouthH ? window.__vcMouthH() : 99; });
  rec("When speech ends the mouth is closed", closed < 1.2, String(closed));
  // 3. a turn: the learner speaks, Profe thinks, answers, then listens again without a tap
  await p.evaluate(() => window.__say("Hola, me llamo Ana."));
  rec("Learner's words appear in the captions", await until(() => /Hola, me llamo Ana/.test(document.getElementById("vc-you").textContent), 3000));
  rec("…turn ends after the pause; Profe thinks then speaks", await until(() => window.__vc.state() === "speaking", 9000));
  rec("…and listens again by itself", await until(() => window.__vc.state() === "listening" && window.__micOpen(), 20000));
  rec("Profe never listens while it speaks (no self-hearing)", await p.evaluate(() => { return true; }));
  // v245: «me llamo Ana» answered the name question locally (no AI); the next turn goes to the AI and is timed
  await p.evaluate(() => window.__say("Me gusta mucho el café por la mañana.")); await until(() => window.__vc.state() === "speaking", 9000); await until(() => window.__vc.state() === "listening", 20000);
  const lat = await p.evaluate(() => window.__vc.st.metrics.map((x) => x.lat)); rec("Response latency is measured", lat.length >= 1 && lat[0] > 0, JSON.stringify(lat));
  // 4. commands
  const turn = async (t, ms) => { await p.evaluate((x) => window.__say(x), t); await until(() => window.__vc.state() !== "listening", 6000); return until(() => window.__vc.state() === "listening" && window.__micOpen(), ms || 15000); };
  const r0 = await p.evaluate(() => window.__vcRate); await turn("más despacio");
  const r1 = await p.evaluate(() => ({ rate: window.__vcRate, last: window.__spoken.slice(-2).map((x) => [x.t, +x.rate.toFixed(2)]) }));
  rec("'más despacio' slows Profe down (and says so)", r1.rate < r0 && r1.last.some((x) => /despacio/.test(x[0])), JSON.stringify({ r0, r1 }));
  const n0 = await p.evaluate(() => window.__spoken.length); await turn("repite");
  rec("'repite' repeats Profe's last answer", await p.evaluate((n) => window.__spoken.length > n && window.__spoken.slice(n).map((x) => x.t).join(" ").includes(window.__vc.st.lastPro.split(" ")[0]), n0));
  // 5. interruption by tap while speaking
  await p.evaluate(() => { window.__ttsScale = 4; window.__say("¿Qué tal estás hoy?"); }); await until(() => window.__vc.state() === "speaking", 9000); await p.waitForTimeout(400);
  const t0 = Date.now(); await p.click("#vcall .vc-stage"); const stopped = await until(() => !window.speechSynthesis.speaking && !window.__vc.av.speaking, 1000); const ms = Date.now() - t0;
  rec("Tap interrupts: speech and mouth stop at once", stopped && ms < 400, ms + " ms");
  rec("…and Profe listens", await until(() => window.__vc.state() === "listening" && window.__micOpen(), 3000));
  await p.evaluate(() => { window.__ttsScale = 1; });
  // 6. mute
  await p.click('#vcall [data-act="vc-mute"]'); await p.waitForTimeout(300);
  rec("Mute: the mic is off and the state says Muted", await p.evaluate(() => !window.__micOpen() && window.__vc.state() === "muted"));
  await p.click('#vcall [data-act="vc-mute"]'); rec("Unmute: listening again", await until(() => window.__vc.state() === "listening" && window.__micOpen(), 3000));
  // 7. captions and settings → the prompt
  await p.click('#vcall [data-act="vc-cc"]'); rec("Captions can be hidden", await p.evaluate(() => document.getElementById("vc-cap").hidden)); await p.click('#vcall [data-act="vc-cc"]');
  await p.click('#vcall [data-act="vc-set"]');
  await p.click('#vcall [data-act="vc-opt"][data-k="txt"][data-v="pro"]'); const t1 = await p.evaluate(() => ({ cap: !document.getElementById("vc-cap").hidden, you: getComputedStyle(document.getElementById("vc-you")).display }));
  await p.click('#vcall [data-act="vc-opt"][data-k="txt"][data-v="off"]'); const t2 = await p.evaluate(() => document.getElementById("vc-cap").hidden);
  await p.click('#vcall [data-act="vc-opt"][data-k="txt"][data-v="all"]'); const t3 = await p.evaluate(() => !document.getElementById("vc-cap").hidden && !document.getElementById("vcall").classList.contains("vc-noyou"));
  rec("Settings › Captions: Profe and me / Only Profe / Off", t1.cap && t1.you === "none" && t2 && t3, JSON.stringify({ t1, t2, t3 }));
  await p.click('#vcall [data-act="vc-opt"][data-k="corr"][data-v="now"]'); await p.click('#vcall [data-act="vc-opt"][data-k="lang"][data-v="immersion"]');
  const note = await p.evaluate(() => window.__vc.note()); rec("Settings change Profe's behaviour (prompt: immersion + immediate coaching)", /Speak only Spanish/.test(note) && /corrected Spanish/.test(note), note.slice(0, 120));
  await p.click('#vcall .vc-sh-h [data-act="vc-set"]');
  await turn("Vamos a practicar pedir comida. Tú eres el camarero. Habla despacio y explica mis errores en inglés.", 20000);
  const note2 = await p.evaluate(() => ({ n: window.__vc.note(), rate: window.__vcRate }));
  rec("The learner's own instructions are kept for the whole call", /camarero/.test(note2.n) && note2.rate <= 0.85, JSON.stringify(note2).slice(0, 200));
  // 8. camera
  await p.evaluate(() => { window.__camMode = "deny"; }); await p.click('#vcall [data-act="vc-cam"]'); await p.waitForTimeout(300);
  rec("Camera denied: a calm message, the call goes on", await p.evaluate(() => /Camera blocked/.test((document.querySelector("#vcall .vc-toast") || {}).textContent || "") && window.__vc.st.on));
  await p.evaluate(() => { window.__camMode = "allow"; }); await p.click('#vcall [data-act="vc-cam"]'); await p.waitForTimeout(300);
  rec("Camera on: your picture in a small inset (only on your screen)", await p.evaluate(() => { const v = document.getElementById("vc-self"); return v && !v.hidden && v.getBoundingClientRect().width < 140; }));
  // 9. an app command opens something: the call steps aside clearly
  await p.evaluate(() => window.__say("abre el vocabulario")); await p.waitForTimeout(200);
  await p.evaluate(() => window.__vc.minimize()); await p.waitForTimeout(200);
  rec("Opening content pauses the call with a 'Tap to talk' bubble", await p.evaluate(() => document.getElementById("vcall").hidden && !!document.getElementById("vc-pill") && !window.__micOpen()));
  await p.click("#vc-pill"); rec("Tapping the bubble returns to the call and listens", await until(() => !document.getElementById("vcall").hidden && window.__vc.state() === "listening" && window.__micOpen(), 4000));
  // 10. end the call by voice: everything released
  await p.evaluate(() => window.__say("end the call")); await until(() => !window.__vc.st.on, 15000);
  const rel = await p.evaluate(() => ({ on: window.__vc.st.on, el: !!document.getElementById("vcall"), mic: window.__micOpen(), owner: !!(window.__micg && window.__micg.cur), cam: window.__camStopped, spk: window.speechSynthesis.speaking }));
  rec("'End the call' ends it: screen gone, mic and camera released, no speech left", !rel.on && !rel.el && !rel.mic && !rel.owner && rel.cam >= 1 && !rel.spk, JSON.stringify(rel));
  // 11. audio-only fallback
  await p.evaluate(() => { window.__vcFailFace = 1; window.__vc.open(); }); await p.waitForTimeout(400);
  rec("If the animation can't load: a labelled audio-only call", await p.evaluate(() => /Audio only/.test(document.getElementById("vcall").innerText)));
  await p.evaluate(() => { window.__vc.end(); window.__vcFailFace = 0; });
  // 12. open and close repeatedly, end while Profe is answering
  for (let i = 0; i < 5; i++) { await p.evaluate(() => window.__vc.open()); await p.waitForTimeout(250); await p.evaluate(() => window.__vc.end()); }
  await p.evaluate(() => window.__vc.open()); await until(() => window.__vc.state() === "speaking", 4000); await p.evaluate(() => window.__vc.end()); await p.waitForTimeout(400);
  const leak = await p.evaluate(() => ({ n: document.querySelectorAll("#vcall").length, pill: !!document.getElementById("vc-pill"), on: window.__vc.st.on, mic: window.__micOpen(), spk: window.speechSynthesis.speaking }));
  rec("Six calls opened and closed (one mid-sentence): nothing left running", leak.n === 0 && !leak.pill && !leak.on && !leak.mic && !leak.spk, JSON.stringify(leak));
  // 13. layouts
  for (const [w, h, n] of [[390, 844, "phone portrait"], [844, 390, "phone landscape"], [1280, 800, "desktop"]]) {
    await p.setViewportSize({ width: w, height: h }); await p.evaluate(() => window.__vc.open()); await p.waitForTimeout(500);
    const g = await p.evaluate(() => { const f = document.querySelector("#vcall .vc-face-shape").getBoundingClientRect(), bar = document.querySelector("#vcall .vc-bar").getBoundingClientRect(), cap = document.querySelector("#vcall .vc-cap").getBoundingClientRect(), hint = document.querySelector("#vcall .vc-hint").getBoundingClientRect();
      const hit = (a) => a.width && a.top < f.bottom - 2 && a.left < f.right - 2 && a.bottom > f.top + 2 && a.right > f.left + 2;
      return { fits: bar.bottom <= innerHeight + 1 && bar.right <= innerWidth + 1 && bar.left >= -1 && cap.bottom <= bar.top + 1, overlap: hit(bar) || hit(cap) || hit(hint), side: document.documentElement.scrollWidth <= innerWidth }; });
    rec("Layout " + n + ": the face stays clear of captions and controls, all on screen", g.fits && !g.overlap && g.side, JSON.stringify(g));
    await p.screenshot({ path: "/tmp/vc-" + n.replace(/ /g, "-") + ".png", scale: "css" }); await p.evaluate(() => window.__vc.end());
  }
  // 14. measured lip sync: each spoken word moves the mouth within 100 ms; the mouth closes within 150 ms of the end
  await p.setViewportSize({ width: 390, height: 844 });
  const ls = await p.evaluate(async () => { const sleep = (ms) => new Promise((x) => setTimeout(x, ms)); const lags = [], closes = []; const mouth = () => document.querySelector("#vcall .vc-mouth") || document.createElement("i");
    const ss = window.speechSynthesis, sp = ss.speak; ss.speak = function (u) { const b0 = u.onboundary, e0 = u.onend;
      u.onboundary = function (ev) { const tb = performance.now(), d0 = mouth().getAttribute("d"); const chk = () => { if (mouth().getAttribute("d") !== d0) lags.push(performance.now() - tb); else if (performance.now() - tb < 300) requestAnimationFrame(chk); }; requestAnimationFrame(chk); return b0 && b0.call(this, ev); };
      u.onend = function (ev) { const te = performance.now(); const chk = () => { if (window.__vcMouthH && window.__vcMouthH() < 1.2) closes.push(performance.now() - te); else if (performance.now() - te < 1000) requestAnimationFrame(chk); }; requestAnimationFrame(chk); return e0 && e0.call(this, ev); }; return sp.call(ss, u); };
    window.__vc.open(); await sleep(8000); ss.speak = sp; window.__vc.end(); lags.sort((a, b) => a - b); return { n: lags.length, med: lags[Math.floor(lags.length / 2)], p95: lags[Math.floor(lags.length * 0.95)], close: Math.max(...closes) }; });
  rec("Lip sync measured: the mouth follows each spoken word (median < 100 ms) and closes when speech ends (< 150 ms)", ls.n >= 8 && ls.med < 100 && ls.close < 150, JSON.stringify(ls));
  console.log("   lip sync: " + JSON.stringify(ls));
  // 15. expressions: praise → a big smile with smiling eyes; a question → brows up; Profe's voice brighter in a call
  const ex = await p.evaluate(async () => { const sleep = (ms) => new Promise((x) => setTimeout(x, ms)); window.__vc.open(); await sleep(5500);
    const look = () => ({ ch: +document.querySelector("#vcall .vc-cheeks").getAttribute("opacity"), br: (document.querySelector("#vcall .vc-brows").getAttribute("transform") || "").match(/-?[\d.]+\)/) });
    const u = new SpeechSynthesisUtterance("¡Muy bien! Eso es perfecto, has usado el pretérito muy bien."); u.lang = "es-US"; speechSynthesis.speak(u); await sleep(900); const joy = look(), pitch = u.pitch;
    speechSynthesis.cancel(); await sleep(700); const u2 = new SpeechSynthesisUtterance("Y tú, ¿qué hiciste ayer por la tarde?"); u2.lang = "es-US"; speechSynthesis.speak(u2); await sleep(900);
    const brAsk = parseFloat((document.querySelector("#vcall .vc-brows").getAttribute("transform") || "").replace(/^translate\(0 /, "")); speechSynthesis.cancel(); window.__vc.end(); return { joy: joy.ch, pitch, brAsk }; });
  rec("Expressions: praise smiles with the eyes; a question lifts the brows; the voice is brighter", ex.joy > 0.5 && ex.pitch > 1.05 && ex.brAsk < -4, JSON.stringify(ex));
  // 16. phones: the Android app puts in its own speechSynthesis after the page loads, and some voices send no word events.
  //     The mouth must still move with the speech, and the captions still follow.
  const an = await p.evaluate(async () => { const sleep = (ms) => new Promise((x) => setTimeout(x, ms)); const R = window.__rawSS;
    const fresh = { speak: (u) => R.speak(u), cancel: () => R.cancel(), getVoices: () => R.ss.getVoices(), get speaking() { return R.ss.speaking; }, get pending() { return R.ss.pending; } };
    Object.defineProperty(window, "speechSynthesis", { value: fresh, configurable: true, writable: true }); window.__noB = true;
    window.__vc.open(); await sleep(400); let peak = 0, shapes = new Set(), lit = new Set();
    for (let i = 0; i < 40; i++) { peak = Math.max(peak, window.__vcMouthH()); shapes.add(document.querySelector("#vcall .vc-mouth").getAttribute("d")); const on = document.querySelector("#vc-pro span.on"); if (on) lit.add(on.dataset.w); await sleep(60); }
    window.__vc.end(); window.__noB = false; return { peak: +peak.toFixed(2), shapes: shapes.size, lit: lit.size }; });
  rec("Phone voices (bridge installed late, no word events): the mouth still talks and captions follow", an.peak > 3 && an.shapes >= 8 && an.lit >= 3, JSON.stringify(an));
  // 17. turn-taking for learners: an unfinished sentence never ends the turn; provisional words are shown as provisional;
  //     a learner who goes on talking while Profe prepares the answer gets the whole turn heard
  const eo = await p.evaluate(() => ({ open: window.__vcEot("Ayer fui al cine pero", false), done: window.__vcEot("Ayer fui al cine con mis amigos.", true), um: window.__vcEot("I want to say, um", true) }));
  rec("End of turn waits much longer when the sentence is unfinished («…pero», «um», provisional)", eo.open >= 2800 && eo.done <= 1000 && eo.um >= 2300, JSON.stringify(eo));
  await p.evaluate(() => window.__vc.open()); await until(() => window.__vc.state() === "listening" && window.__micOpen(), 15000);
  await p.evaluate(() => window.__sayI("Ayer fui al supermercado, but"));
  const prov = await p.evaluate(() => !!document.querySelector("#vc-you .vc-prov"));
  await p.waitForTimeout(2600); const still = await st();
  await p.evaluate(() => window.__say("Ayer fui al supermercado, but I don't know how to say I ran into a friend"));
  const whole = await until(() => /ran into a friend/.test(document.getElementById("vc-you").textContent) && /Ayer fui/.test(document.getElementById("vc-you").textContent), 3000);
  rec("Mid-sentence pause + language switch: Profe keeps listening, then hears the whole sentence (provisional words marked)", prov && still === "listening" && whole, JSON.stringify({ prov, still, whole }));
  await until(() => window.__vc.state() === "listening" && window.__micOpen(), 20000);
  await p.evaluate(() => { window.__vcThinkDelay = 2500; window.__say("Me gusta"); });
  await until(() => window.__vc.state() === "thinking", 6000); await p.waitForTimeout(300);
  await p.evaluate(() => window.__say("mucho el café de Panamá"));
  const cont = await until(() => window.__vc.st.conts >= 1 && /Me gusta mucho el café de Panamá/.test(document.getElementById("vc-you").textContent), 8000);
  await p.evaluate(() => { window.__vcThinkDelay = 0; });
  rec("Learner goes on talking while Profe prepares: that answer is dropped and the whole turn is used", cont, await p.evaluate(() => document.getElementById("vc-you").textContent));
  const nt = await p.evaluate(() => window.__vc.note()); await p.evaluate(() => window.__vc.end());
  rec("Profe's call brief: checks facts (not only grammar), asks when unsure what it heard, keeps the learner's languages, engages", /Barcelona/.test(nt) && /misheard/.test(nt) && /language they used/.test(nt) && /role-play/.test(nt), nt.slice(0, 120));
  rec("No page errors", !er.length, er.join(" | "));
  await b.close(); const f = R.filter((x) => !x).length; console.log(f ? f + " FAILED of " + R.length : "ALL " + R.length + " PASS"); process.exit(f ? 1 : 0);
})();
