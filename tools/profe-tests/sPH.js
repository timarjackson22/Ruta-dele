// v221 Profe home: app icons, chat bar at the bottom, no Chat/Practice switch or dropdown;
// after an answer the mic stays off and a big Next waits; clues show the answer's shape with gaps.
const { chromium, devices } = require("playwright");
const URL = process.env.URL || "http://localhost:8766/";
const INIT = () => {
  window.__recStarts = 0;
  class Rec { constructor() { this.lang = "es"; } start() { window.__recStarts++; setTimeout(() => { try { this.onstart && this.onstart({}); } catch (e) {} }, window.__recDelay || 5); } stop() { setTimeout(() => { try { this.onend && this.onend({}); } catch (e) {} }, 5); } abort() { this.stop(); } }
  window.SpeechRecognition = Rec; window.webkitSpeechRecognition = Rec;
  class U { constructor(t) { this.text = t; } } window.SpeechSynthesisUtterance = U;
  const ss = { speaking: false, pending: false, paused: false, getVoices: () => [{ name: "Google español", lang: "es-US", localService: false, voiceURI: "g" }, { name: "Google US English", lang: "en-US", localService: false, voiceURI: "e" }], speak(u) { setTimeout(() => { u.onend && u.onend({}); }, 30); }, cancel() {} };
  Object.defineProperty(window, "speechSynthesis", { value: ss });
};
(async () => {
  const b = await chromium.launch(); const c = await b.newContext({ ...devices["Pixel 7"], viewport: { width: 360, height: 740 }, serviceWorkers: "block", permissions: ["microphone"] }); await c.addInitScript(INIT);
  const p = await c.newPage(); const er = []; p.on("pageerror", (x) => er.push(x.message));
  const R = []; const rec = (n, ok, i) => { R.push(!!ok); console.log((ok ? "PASS " : "FAIL ") + n + (ok || !i ? "" : "  " + i)); };
  await p.goto(URL + "#a1-u1"); await p.waitForTimeout(1200);
  await p.evaluate(() => { document.body.classList.add("tabs-peek"); document.querySelector('[data-act="t-open"]').click(); }); await p.waitForTimeout(700);
  let st = await p.evaluate(() => { const T = document.getElementById("tutor"); return { apps: [...T.querySelectorAll(".papp span")].map((x) => x.textContent), chatTab: !!T.querySelector('.tseg [data-v="chat"]'), sel: !!T.querySelector("#t-prsel"), wordy: /words and verbs come from|Profe speaks, then listens|Up to three tries/.test(T.innerText), bar: !!T.querySelector(".pchat .pchat-in"), hint: (T.querySelector(".pchat-h") || {}).innerText || "", desc: [...T.querySelectorAll(".papp")].some((x) => x.children.length !== 2 || x.querySelector("span").innerText.length > 14) }; });
  rec("Opens on the practice home: six app icons", st.apps.join() === "Vocabulary,Translate,Survival Kit,Verbs,Role-play,DELE oral", st.apps.join());
  rec("Icons have a name only (no descriptions)", !st.desc);
  rec("No Chat/Practice switch and no practice dropdown", !st.chatTab && !st.sel, JSON.stringify(st));
  rec("No explanatory text (level note, tries note)", !st.wordy);
  rec("Chat bar at the bottom with 'Chat · have a conversation with Profe'", st.bar && /Chat · have a conversation with/.test(st.hint), st.hint);
  const geo = await p.evaluate(() => { const r = document.querySelector("#tutor .pchat").getBoundingClientRect(); const a = [...document.querySelectorAll("#tutor .pa-ic")].map((x) => x.getBoundingClientRect()); return { bottom: r.bottom, vh: innerHeight, icons: a.every((x) => x.width >= 56 && x.right <= 360) }; });
  rec("Chat bar sits at the bottom of the screen; icons fit a 360px phone", geo.bottom >= geo.vh - 2 && geo.icons, JSON.stringify(geo));
  await p.click("#tutor .pchat-in"); await p.waitForTimeout(400);
  st = await p.evaluate(() => ({ input: !!document.getElementById("t-input"), focus: document.activeElement && document.activeElement.id, back: !!document.querySelector('#tutor .tseg [data-act="t-tab"][data-v="practice"]') }));
  rec("Tapping the chat bar opens the chat, ready to type", st.input && st.focus === "t-input", JSON.stringify(st));
  rec("The chat has a way back to the practice icons", st.back);
  await p.click('#tutor .tseg [data-act="t-tab"][data-v="practice"]'); await p.waitForTimeout(300);
  rec("…and it returns to the icons", await p.evaluate(() => !!document.querySelector("#tutor .prapps")));
  // vocabulary: right answer → mic off, big Next, then the next word
  await p.click('#tutor .papp[data-act="pr-vocab"]'); await p.waitForTimeout(1500);
  const it = await p.evaluate(() => { const PR = window.__prState ? window.__prState() : null; return PR; });
  const tgt = await p.evaluate(() => { const box = document.querySelector("#tutor .prsay b"); return box && box.textContent; });
  await p.evaluate(() => { window.__ansVo && window.__ansVo(); });
  rec("Vocabulary starts", !!tgt, tgt);
  await p.waitForTimeout(400);
  const ok = await p.evaluate(() => { const PR = window.__prState(); const it = PR.items[PR.i]; const w = it[0].replace(/\(.*?\)/g, "").split(/[\/;,]/)[0].replace(/^(el|la|los|las)\s+/i, "").trim(); window.__recBefore = window.__recStarts; window.__prAnswer(w); return w; });
  await p.waitForTimeout(2500);
  st = await p.evaluate(() => ({ next: (document.querySelector("#tutor .prnextbar .prnext") || {}).innerText || "", form: !!document.getElementById("pr-input"), starts: window.__recStarts - window.__recBefore, i: window.__prState().i }));
  rec("Vocabulary: after the answer, a big Next and no answer box", /Next/.test(st.next) && !st.form, JSON.stringify(st));
  rec("Vocabulary: the mic does not open again while you review", st.starts === 0, JSON.stringify(st));
  await p.click("#tutor .prnext"); await p.waitForTimeout(800);
  st = await p.evaluate(() => ({ i: window.__prState().i, form: !!document.getElementById("pr-input") }));
  rec("Next moves to the next word", st.i === 1 && st.form, JSON.stringify(st));
  // translation: two misses → the shape of the sentence with gaps; after the answer, mic off + Next
  await p.click('#tutor .tseg [data-act="t-tab"][data-v="practice"]'); await p.waitForTimeout(300);
  await p.click('#tutor .papp[data-v="trans"]'); await p.waitForFunction(() => window.__ad.pr() && window.__ad.pr().it, null, { timeout: 8000 });
  await p.evaluate(() => { const PR = window.__ad.pr(); PR.autoMic = false; PR.it = { id: "z1", dir: "en-es", src: "We went to the beach yesterday.", ans: ["Ayer fuimos a la playa."], tags: ["v:pret", "d:en-es"], len: 5, ui: 0 }; PR.tries = 0; PR.fb = null; PR.over = false; PR.att = []; window.__ad.render(); });
  await p.evaluate(() => window.__ad.answer("Ayer vamos a la playa")); await p.waitForTimeout(300);
  const c1 = await p.evaluate(() => document.querySelector("#tutor .prbox.bad").innerText);
  rec("Clue 1: what's wrong plus the sentence with a gap (first letter)", /Ayer f_+ a la playa/.test(c1), c1);
  await p.evaluate(() => window.__ad.answer("Ayer fue a la playa")); await p.waitForTimeout(300);
  const c2 = await p.evaluate(() => document.querySelector("#tutor .prbox.bad").innerText);
  rec("Clue 2: more of the missing word shown", /Ayer fu[a-z]*_+ a la playa/.test(c2), c2);
  await p.evaluate(() => { window.__recBefore = window.__recStarts; const PR = window.__ad.pr(); PR.autoMic = true; window.__ad.answer("Ayer fuimos a la playa"); }); await p.waitForTimeout(2500);
  st = await p.evaluate(() => ({ next: (document.querySelector("#tutor .prnextbar .prnext") || {}).innerText || "", form: !!document.getElementById("pr-input"), starts: window.__recStarts - window.__recBefore, over: window.__ad.pr().over }));
  rec("Translation: after the answer, a big Next, no answer box, mic stays off", st.over && /Next/.test(st.next) && !st.form && st.starts === 0, JSON.stringify(st));
  await p.click("#tutor .prnext"); await p.waitForTimeout(500);
  rec("Next brings the next sentence", await p.evaluate(() => window.__ad.pr().it.id !== "z1" && !window.__ad.pr().over));
  // conjugation clue
  await p.evaluate(() => { const PR = window.__ad.pr(); window.__ad.end(); });
  await p.waitForTimeout(300); await p.click('#tutor .papp[data-act="pr-conj"]'); await p.waitForFunction(() => window.__ad.pr() && window.__ad.pr().kind === "cj" && window.__ad.pr().it, null, { timeout: 8000 });
  await p.evaluate(() => { const PR = window.__ad.pr(); PR.autoMic = false; PR.it = { id: "c9", v: "tener", t: "pret", p: "yo", pi: 0, ans: "tuve", grp: "uv", tags: ["c:pret:uv"] }; PR.tries = 0; PR.fb = null; PR.over = false; PR.att = []; window.__ad.render(); window.__ad.answer("tengo"); });
  await p.waitForTimeout(300);
  const cj = await p.evaluate(() => document.querySelector("#tutor .prbox.bad").innerText);
  rec("Verbs clue shows the form's shape and length", /t___ \(4 letters\)/.test(cj), cj);
  // the mic is "opening" until the phone confirms it is live; only then "Listening"
  await p.evaluate(() => { window.__ad.end(); }); await p.waitForTimeout(300); await p.click('#tutor .papp[data-v="trans"]'); await p.waitForFunction(() => window.__ad.pr() && window.__ad.pr().it, null, { timeout: 8000 });
  await p.evaluate(() => { window.__ad.pr().autoMic = false; }); await p.waitForTimeout(2500);
  await p.evaluate(() => { window.__recDelay = 1500; const m = document.querySelector('#tutor [data-act="pr-mic"]'); if (m.classList.contains("on")) m.click(); }); await p.waitForTimeout(600);
  await p.evaluate(() => document.querySelector('#tutor [data-act="pr-mic"]').click()); await p.waitForTimeout(250);
  const w1 = await p.evaluate(() => ({ cls: document.querySelector('#tutor [data-act="pr-mic"]').className, n: document.querySelectorAll('[data-act="pr-mic"]').length, live: (document.getElementById("t-live") || {}).textContent || "", wait: document.querySelector('#tutor [data-act="pr-mic"]').classList.contains("wait") }));
  await p.waitForTimeout(1600);
  const w2 = await p.evaluate(() => ({ live: (document.getElementById("t-live") || {}).textContent || "", wait: document.querySelector('#tutor [data-act="pr-mic"]').classList.contains("wait") }));
  rec("Mic tapped: 'opening the mic' until it is really open, then 'Listening'", /opening the mic/.test(w1.live) && w1.wait && /Listening/.test(w2.live) && !w2.wait, JSON.stringify([w1, w2]));
  // v276: a finished role-play shows a flashing «Next situation» bar that starts the next one
  const nid = await p.evaluate(() => window.__rpNext("rp-a1-01"));
  await p.evaluate(() => { const b = document.querySelector('#tutor [data-act="pr-exit"]'); if (b) b.click(); }); await p.waitForTimeout(300);
  const started = await p.evaluate(() => { const b = document.querySelector('#tutor [data-act="pr-rp"][data-id="rp-a1-01"]') || document.querySelector('#tutor [data-act="pa-rp"]'); if (b && b.dataset.id) { b.click(); return "list"; } return window.__startRp ? (window.__startRp("rp-a1-01"), "hook") : ""; }); await p.waitForTimeout(500);
  for (let k = 0; k < 12; k++) {
    const m = await p.evaluate(() => { if (document.querySelector('#tutor [data-act="pr-rpnext"]')) return null; const mod = window.__rpModel && window.__rpModel(); return mod; });
    if (!m) break; await p.fill("#pr-input", m); await p.evaluate(() => document.querySelector("#pr-form").requestSubmit()); await p.waitForTimeout(500);
  }
  const nb = await p.evaluate(() => { const b = document.querySelector('#tutor [data-act="pr-rpnext"]'); if (!b) return null; const r = b.getBoundingClientRect(), cs = getComputedStyle(b); return { id: b.dataset.id, txt: b.textContent, anim: cs.animationName, bottom: r.bottom, vh: innerHeight, w: r.width }; });
  rec("Finished role-play: a big flashing «Next situation» bar at the bottom", !!nb && nb.id === nid && /rpflash/.test(nb.anim) && nb.bottom >= nb.vh - 40 && nb.w > 250, JSON.stringify({ started, nid, nb }));
  if (nb) { await p.evaluate(() => document.querySelector('#tutor [data-act="pr-rpnext"]').click()); await p.waitForTimeout(500); }
  const now = await p.evaluate(() => window.__rpCur && window.__rpCur());
  rec("«Next situation» starts the next role-play straight away", now === nid, JSON.stringify({ now, nid }));
  rec("No page errors", !er.length, er.join(" | "));
  await b.close(); const f = R.filter((x) => !x).length; console.log(f ? f + " FAILED of " + R.length : "ALL " + R.length + " PASS"); process.exit(f ? 1 : 0);
})();
