// Profe evaluation brief, stage 1: the brief's own instructions, checked against the app's real state (tools/PROFE_EVAL_BRIEF.md)
const { chromium, devices } = require("playwright"); const fs = require("fs");
const R = []; const rec = (n, ok, i) => { R.push(!!ok); console.log((ok ? "PASS " : "FAIL ") + n + (!ok && i ? "  " + i : "")); };
const MOCK = fs.readFileSync(__dirname + "/videos-test.js", "utf8").match(/const MOCK = `([\s\S]*?)`;/)[1];
const CAPS = '<transcript>' + Array.from({ length: 30 }, (_, i) => '<text start="' + i * 4 + '" dur="4">Esta es la frase número ' + (i + 1) + ' del vídeo.</text>').join("") + "</transcript>";
(async () => { const b = await chromium.launch(); const c = await b.newContext({ ...devices["Pixel 7"], serviceWorkers: "block" });
  await c.route("**/www.youtube.com/iframe_api", (r) => r.fulfill({ contentType: "text/javascript", body: MOCK })); await c.route("**/i.ytimg.com/**", (r) => r.fulfill({ status: 404, body: "" })); await c.route("**/lrclib.net/**", (r) => r.fulfill({ contentType: "application/json", headers: { "access-control-allow-origin": "*" }, body: "[]" }));
  await c.addInitScript((CAPS) => {
    window.__said = []; // speech: each utterance "ends" after a short time, its text logged with its language
    const fake = { speaking: false, pending: false, paused: false, q: [], speak(u) { window.__said.push((/^es/.test(u.lang || "") ? "ES:" : "EN:") + u.text + (u.rate && u.rate < 0.95 ? " @" + u.rate.toFixed(2) : "")); this.speaking = true; const t = setTimeout(() => { this.speaking = false; u.onend && u.onend(); }, 60); this.q.push(t); }, cancel() { this.q.forEach(clearTimeout); this.q = []; this.speaking = false; }, getVoices() { return []; }, addEventListener() {}, removeEventListener() {}, pause() {}, resume() {} };
    Object.defineProperty(window, "speechSynthesis", { get: () => fake });
    window.AndroidCap = { available: () => true, fetch(id) { setTimeout(() => window.__acap.ev(id, JSON.stringify({ lang: "es", kind: "manual", es: CAPS, en: "", secs: "300" }), ""), 40); } };
  }, CAPS);
  const p = await c.newPage(); const er = []; p.on("pageerror", (x) => er.push(x.message));
  const say = async (t, ms) => { await p.evaluate((t) => window.__pv.route(t, "chat"), t); await p.waitForTimeout(ms || 900); };
  const last = () => p.evaluate(() => { const m = [...document.querySelectorAll("#t-msgs .msg, #t-msgs [class*=msg]")].pop(); return (window.__pvLast ? JSON.stringify(window.__pvLast) : "") + " | " + (m ? m.innerText.slice(0, 200) : ""); });
  const st = () => p.evaluate(() => window.__yt.p.st), vt = () => p.evaluate(() => window.__yt.p.t);
  // --- video control ---
  await p.goto("http://localhost:8766/#video-WLXiu-qp8Lw"); await p.waitForTimeout(1500);
  await say("Play the video."); rec("“Play the video” → the player is playing", (await st()) === 1, String(await st()) + " " + await last());
  await p.evaluate(() => { window.__yt.p.t = 42; }); await say("Pause that."); rec("“Pause that” → paused", (await st()) === 2, String(await st()));
  await say("Go back ten seconds."); rec("“Go back ten seconds” → 0:42 → 0:32", Math.abs((await vt()) - 32) < 1.5, String(await vt()));
  await say("retrocede cinco segundos"); rec("“retrocede cinco segundos” → 0:27", Math.abs((await vt()) - 27) < 1.5, String(await vt()));
  await say("skip forward 30 seconds"); rec("“skip forward 30 seconds” → 0:57", Math.abs((await vt()) - 57) < 1.5, String(await vt()));
  await p.evaluate(() => { window.__yt.p.t = 61; window.__yt.p.st = 2; }); await p.waitForTimeout(300); await say("replay that sentence"); rec("“Replay that sentence” → back to the start of the line (0:60) and playing", Math.abs((await vt()) - 60) < 1.5 && (await st()) === 1, (await vt()) + " " + (await st()));
  // --- where we were ---
  await p.evaluate(() => { window.__yt.p.t = 80; window.__yt.p.st = 2; }); await say("open grammar", 1200);
  rec("Opening grammar by voice leaves the video", /gramatica/.test(await p.evaluate(() => location.hash)));
  await say("Go back to where we were.", 2500); const vt2 = await vt();
  rec("“Go back to where we were” → the same video, near 0:80 (a 2 s run-up)", /video-WLXiu/.test(await p.evaluate(() => location.hash)) && Math.abs(vt2 - 78) < 2, (await p.evaluate(() => location.hash)) + " " + vt2 + " " + (await last()));
  // --- multi-step ---
  await say("Open my next lesson and start it.", 2500);
  const ms = await p.evaluate(() => ({ h: location.hash, q: !!document.querySelector("#runner .pxq"), last: window.__pvLast }));
  rec("“Open my next lesson and start it” → the next unit is open AND its questions are running", /^#a1-u\d/.test(ms.h) && ms.q && ms.last && ms.last.seq === 2, JSON.stringify(ms));
  await say("Stop the lesson and practise ordering food with me.", 2500);
  const rp = await p.evaluate(() => ({ open: document.body.classList.contains("tutor-open"), rp: window.__pv.pr() }));
  rec("“Stop the lesson and practise ordering food with me” → a food role-play starts in Profe", rp.open && /café|restaurant|fast-food|fonda|bill/i.test(rp.rp || ""), JSON.stringify(rp));
  await p.evaluate(() => { try { document.querySelector('#tutor [data-act="t-close"]').click(); } catch (e) {} }); await p.waitForTimeout(400);
  // --- mistakes ---
  await p.goto("http://localhost:8766/#curso"); await p.waitForTimeout(800);
  await say("Quiz me on the words I got wrong.", 1500); const m0 = await p.evaluate(() => window.__pvLast);
  rec("“Quiz me on the words I got wrong” with no saved mistakes → says so honestly (not “done”)", m0 && !m0.ok && /no saved mistakes/.test(m0.say), JSON.stringify(m0));
  await p.evaluate(() => { const S = window.__pv.store(); S.mist = [{ id: "t1", key: "a1-u1", n: 2, ts: Date.now(), it: { t: "mc", q: "¿Cómo ___ llamas?", opts: ["te", "me", "se"], c: 0, why: "tú → te" } }, { id: "t2", key: "a1-u1", n: 1, ts: Date.now(), it: { t: "x", q: "Yo ___ (ser) de Panamá.", a: ["soy"], why: "ser, yo → soy" } }]; window.__pv.save(); });
  await say("Quiz me on the words I got wrong.", 2000); const m1 = await p.evaluate(() => ({ h: location.hash, q: !!document.querySelector("#runner .pxq"), last: window.__pvLast }));
  rec("…with mistakes saved → My mistakes opens and the review questions start", m1.h === "#errores" && m1.q && m1.last.ok, JSON.stringify(m1));
  // --- word list ---
  await p.evaluate(() => (window.__said = [])); await say("Play my food vocabulary list.", 1800);
  const d1 = await p.evaluate(() => ({ dr: window.__pv.dr(), said: window.__said.slice(0, 6), h: location.hash }));
  rec("“Play my food vocabulary list” → reads the Food list: the Spanish word in the Spanish voice, then the English", d1.dr.on && /Food/.test(d1.dr.title) && d1.said.some((x) => /^ES:/.test(x)) && d1.said.some((x) => /^EN:/.test(x) && !/Food/.test(x)), JSON.stringify({ t: d1.dr.title, i: d1.dr.i, said: d1.said, h: d1.h }));
  const i0 = await p.evaluate(() => window.__pv.dr().last); await say("next word", 700); const i1 = await p.evaluate(() => window.__pv.dr().last);
  rec("“Next word” moves on", i1 === i0 + 1 || i1 > i0, i0 + "→" + i1);
  await p.evaluate(() => (window.__said = [])); await say("Repeat the last word more slowly.", 900); const d2 = await p.evaluate(() => ({ said: window.__said.slice(0, 3), dr: window.__pv.dr() }));
  rec("“Repeat the last word more slowly” → the same word again, slower", d2.dr.rate < 1 && d2.said.some((x) => /^ES:.*@0\./.test(x)), JSON.stringify(d2.said) + " rate " + d2.dr.rate);
  await say("stop", 500); rec("“Stop” ends the word list and its speech", !(await p.evaluate(() => window.__pv.dr().on)));
  // --- clarification ---
  await say("play my vocabulary", 600); const cl = await p.evaluate(() => window.__pvLast);
  await say("travel", 1500); const d3 = await p.evaluate(() => window.__pv.dr());
  rec("No list named → asks which one; answering “travel” starts the travel list", (cl && /Which word list/.test(cl.say)) && d3.on && /Travel/i.test(d3.title), JSON.stringify(cl) + " " + d3.title); await say("stop", 400);
  // --- end ---
  await say("end the session", 600); const se = await p.evaluate(() => window.__pvLast);
  rec("“End the session” → a short summary of what was done", se && se.ok && /Good work today/.test(se.say) && /words practised/.test(se.say), JSON.stringify(se));
  rec("No script errors", !er.length, er.join(" | "));
  console.log(R.filter(Boolean).length + "/" + R.length + " passed"); await b.close(); process.exit(R.every(Boolean) ? 0 : 1); })();
