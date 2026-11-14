// Profe pipeline harness: the real web app + the real Android bridge.js, with the Android Java side simulated
// (TTS with QUEUE_FLUSH semantics and per-voice languages, the speech recogniser, the on-device LLM streaming tokens).
const { chromium, devices } = require("playwright");
const fs = require("fs");
const BRIDGE = fs.readFileSync("/home/claude/ruta-dele/android/app/src/main/assets/bridge.js", "utf8");
const PORT = process.env.PORT || 8766;

const MOCKS = () => {
  const now = () => performance.now();
  const VO = [{ name: "es-us-x-sfb-local", lang: "es-US", quality: 400 }, { name: "es-es-x-eea-local", lang: "es-ES", quality: 400 }, { name: "en-us-x-tpf-local", lang: "en-US", quality: 400 }];
  // ---- TTS (TtsBridge.java): speak = stop queue + set voice + QUEUE_FLUSH; onStop is not reported ----
  const T = (window.__T = { log: [], cur: null, lat: 120, wps: 5, missingEs: false, failEs: false });
  const vlangOf = (voice, lang) => { const v = VO.find((x) => x.name === voice); let l = v ? v.lang : lang || "es-US"; return l; };
  const halt = (e) => { if (!e) return; clearTimeout(e.tm); if (e.t0 && !e.t1) { e.t1 = now(); e.stopped = 1; } if (!e.t0) e.dropped = 1; };
  window.AndroidTTS = {
    voices: () => JSON.stringify(VO), refreshVoices() {}, keepScreenOn() {}, setBrightness() {}, openSettings() {},
    speak(id, text, lang, rate, pitch, voice) {
      setTimeout(() => {
        T.log.filter((e) => !e.t1 && !e.dropped).forEach(halt); T.cur = null;
        const vl = vlangOf(voice, lang);
        const e = { id, text, lang, voice, vl, tq: now() }; T.log.push(e);
        if ((T.failEs || T.missingEs) && /^es/.test(lang)) { e.failed = 1; e.dropped = 1; setTimeout(() => window.__atts && __atts.ev("error", id), 30); return; }
        e.tm = setTimeout(() => {
          e.t0 = now(); T.cur = e; window.__atts && __atts.ev("start", id);
          const words = String(text).split(/\s+/).filter(Boolean).length, dur = Math.max(250, (words / T.wps) * 1000 / (rate || 1));
          e.tm = setTimeout(() => { e.t1 = now(); T.cur = null; window.__atts && __atts.ev("end", id); }, dur);
        }, T.lat);
      }, 0);
    },
    stop() { setTimeout(() => { T.log.filter((e) => !e.t1 && !e.dropped).forEach(halt); T.cur = null; }, 0); },
  };
  // ---- speech recogniser (SttBridge.java) ----
  const R = (window.__R = { log: [], on: false, wins: [], sid: 0 });
  const ev = (t, a, sid) => window.__astt && __astt.ev(t, a == null ? null : a, sid == null ? R.sid : sid);
  const closeWin = () => { const w = R.wins[R.wins.length - 1]; if (w && !w[1]) w[1] = now(); };
  window.AndroidSTT = {
    setBias() {},
    start(lang, interim, cont) { setTimeout(() => { R.sid++; const my = R.sid; R.log.push(["start", now()]); closeWin(); R.on = true; R.wins.push([now(), null]); setTimeout(() => ev("start", null, my), 40); }, 0); },
    stop() { setTimeout(() => { R.log.push(["stop", now()]); const my = R.sid; setTimeout(() => { if (R.sid !== my) return; if (R.pend) { ev("final", R.pend, my); R.pend = null; } R.on = false; closeWin(); ev("end", null, my); }, 80); }, 0); },
    cancel() { setTimeout(() => { R.log.push(["cancel", now()]); const my = R.sid; R.on = false; closeWin(); setTimeout(() => ev("end", null, my), 30); }, 0); },
  };
  window.__say = async (text, o = {}) => { const ws = text.split(" "); for (let i = 1; i <= ws.length; i++) { ev("partial", ws.slice(0, i).join(" ")); await new Promise((r) => setTimeout(r, o.wordMs || 60)); } if (o.final !== false) ev("final", text); };
  window.__sttEnd = (err) => { if (err) ev("error", err); R.on = false; closeWin(); ev("end"); };
  // ---- on-device LLM (LlmBridge.java): streams parts; cancel → "done" ----
  const L = (window.__L = { reqs: [], replies: [], cur: null, def: { text: "Vale. ¿Y después? [[·]]", delay: 150, wordMs: 40 } });
  const run = (id, user) => {
    const r = L.replies.length ? L.replies.shift() : L.def; const job = { id, user, text: r.text, t: now(), cancelled: 0 }; L.reqs.push(job); L.cur = job;
    const ws = r.text.split(/(\s+)/); let i = 0;
    const step = () => { if (job.cancelled) return; if (i >= ws.length) { job.done = now(); L.cur = null; __allm.ev("done", id, ""); return; } __allm.ev("part", id, ws[i++]); job.tm = setTimeout(step, /\s/.test(ws[i - 1]) ? 0 : r.wordMs || 40); };
    job.tm = setTimeout(step, r.delay || 150);
  };
  window.AndroidLLM = {
    status: () => JSON.stringify({ state: "loaded" }), hasChat: () => true, canLm: () => true, preload() {}, resetChat() {}, tokens: (t) => Math.ceil(String(t).length / 4),
    chat(id, key, sys, user) { L.sys = sys; run(id, user); }, generate(id, prompt) { run(id, prompt); },
    cancel() { const j = L.cur; if (j) { j.cancelled = 1; clearTimeout(j.tm); L.cur = null; setTimeout(() => __allm.ev("done", j.id, ""), 30); } },
  };
};

async function open(o = {}) {
  const b = await chromium.launch(); const c = await b.newContext({ ...devices["Pixel 7"], serviceWorkers: "block" });
  await c.addInitScript(MOCKS); await c.addInitScript(BRIDGE);
  if (o.init) await c.addInitScript(o.init);
  const p = await c.newPage(); const errs = []; p.on("pageerror", (x) => errs.push(x.message));
  await p.goto("http://localhost:" + PORT + "/" + (o.hash || "#curso")); await p.waitForTimeout(1400);
  await p.evaluate(([l, w]) => { window.__T.lat = l; window.__T.wps = w; }, [+(process.env.LAT || 120), +(process.env.WPS || 5)]);
  await p.click('[data-act="t-open"]'); await p.waitForTimeout(400);
  const H = {
    b, p, errs,
    wait: (ms) => p.waitForTimeout(ms),
    replies: (arr) => p.evaluate((a) => { window.__L.replies.push(...a); }, arr),
    type: async (t) => { await p.fill("#t-input", t); await p.press("#t-input", "Enter"); },
    mic: () => p.evaluate(() => { const b = document.querySelector('[data-act="t-mic"]'); window.__micT = performance.now(); b.click(); }),
    say: (t, o) => p.evaluate(([t, o]) => window.__say(t, o), [t, o || {}]),
    sttEnd: (err) => p.evaluate((e) => window.__sttEnd(e), err || null),
    tts: () => p.evaluate(() => window.__T.log.map((e) => ({ text: e.text, lang: e.lang, vl: e.vl, voice: e.voice, tq: Math.round(e.tq), t0: e.t0 && Math.round(e.t0), t1: e.t1 && Math.round(e.t1), stopped: e.stopped, dropped: e.dropped, failed: e.failed }))),
    stt: () => p.evaluate(() => window.__R.wins.map((w) => [Math.round(w[0]), w[1] && Math.round(w[1])])),
    reqs: () => p.evaluate(() => window.__L.reqs.map((r) => ({ user: r.user, text: r.text, cancelled: r.cancelled, t: Math.round(r.t) }))),
    msgs: () => p.evaluate(() => [...document.querySelectorAll("#t-msgs .tm")].map((x) => (x.classList.contains("u") ? "U: " : "P: ") + x.innerText.replace(/\s+/g, " ").trim())),
    now: () => p.evaluate(() => performance.now()),
    idle: async (ms = 8000) => { const t0 = Date.now(); while (Date.now() - t0 < ms) { const busy = await p.evaluate(() => !!(window.__T.cur || window.__T.log.some((e) => !e.t1 && !e.dropped) || window.__L.cur)); if (!busy) { await p.waitForTimeout(400); const b2 = await p.evaluate(() => !!(window.__T.cur || window.__T.log.some((e) => !e.t1 && !e.dropped) || window.__L.cur)); if (!b2) return; } await p.waitForTimeout(100); } },
    close: () => b.close(),
  };
  return H;
}
// checks
function overlapMic(tts, wins, grace = 60) { // speech playing while the mic is open (after a short stop latency)
  const bad = []; tts.forEach((e) => { if (!e.t0) return; wins.forEach(([a, z]) => { const end = e.t1 || 1e12, zz = z || 1e12; if (e.t0 < zz && end > a + grace) bad.push(e.text.slice(0, 40) + " @" + e.t0 + "-" + (e.t1 || "…") + " mic " + a + "-" + (z || "…")); }); }); return bad;
}
const labels = (tts) => tts.filter((e) => /\[\[|\*\*|^\s*(es|en)\s*[:=]|"language"|EN\b/.test(e.text)).map((e) => e.text);
const ES_HINT = /[¿¡ñáéíóú]|\b(el|la|los|las|que|de|es|y|en|un|una|por|para|con|muy|yo|tú|fui|voy|ayer|tengo|hambre|ser|estar|vale|después|supermercado|mercado|hola|bien|gracias|años|treinta|comí|casa|quiero|reservar|habitación)\b/i;
const EN_HINT = /\b(the|and|is|you|to|of|because|instead|means|say|try|again|that|past|yesterday|hungry|correct|phrase|which|for|in|it|use|age|with)\b/i;
function wrongVoice(tts) { return tts.filter((e) => e.t0 || e.failed).filter((e) => { const es = ES_HINT.test(e.text) && !EN_HINT.test(e.text), en = EN_HINT.test(e.text) && !ES_HINT.test(e.text); return (es && !/^es/.test(e.vl)) || (en && !/^en/.test(e.vl)); }).map((e) => "[" + e.vl + "] " + e.text); }
module.exports = { open, overlapMic, labels, wrongVoice };
