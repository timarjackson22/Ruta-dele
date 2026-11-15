// M. "Play a video / a song", clarifying questions, and the mic handoff (S24 logs, 15 Nov 2026 03:00–03:05), in the harness:
// the real web app and bridge.js, with the phone's TTS, recogniser and wake listener simulated.
const { open } = require("./h.js");
const R = []; const rec = (n, ok, info) => { R.push(!!ok); console.log((ok ? "PASS " : "FAIL ") + n + (!ok && info != null ? "  " + String(info).slice(0, 400) : "")); };
(async () => {
  let H = await open({ hash: "#inicio", noOpen: true, wake: true }); let p = H.p;
  const st = () => p.evaluate(() => ({ h: location.hash, last: window.__pvLast, ch: window.__pv.choice() ? Object.keys(window.__pv.choice()) : null, pl: !!window.__pv.ctx().playing, toast: (document.querySelector(".coach-toast, #coach, .toast") || {}).textContent || "" }));
  const said = () => p.evaluate(() => window.__T.log.map((e) => e.text).join(" ⏐ ") + " ⏐ " + ((window.__pvLast || {}).say || ""));
  // back to waiting for "Ok Profe" (Profe closed, nothing playing), then say it
  const hear = async (t) => { await p.evaluate(() => { try { if (window.__pv.ctx().playing) document.querySelector('[data-act="l-play"]').click(); } catch (e) {} if (document.body.classList.contains("tutor-open")) document.querySelector('#tutor [data-act="t-close"]').click(); if (location.hash !== "#inicio") location.hash = "#inicio"; });
    await p.waitForFunction(() => window.__W.on, null, { timeout: 25000 }).catch(() => {}); const ok = await p.evaluate((t) => { window.__T.log = []; return window.__hear(t, true); }, t); if (!ok) console.log("  (the wake listener was not running for «" + t + "»)"); };
  await p.evaluate(() => window.__pv.route("turn on hands-free", "chat")); await H.wait(3500);
  // 1. a song: list opens, Profe asks which one, "the second" plays it
  await hear("ok profe play a song"); await H.wait(2500);
  let s = await st(), t = await said();
  rec("“Ok Profe, play a song” opens the songs and asks which one", s.h === "#escuchar" && /Which one\?/.test(t) && s.ch && s.ch.includes("items"), JSON.stringify(s) + " " + t);
  await p.waitForFunction(() => window.__R.on, null, { timeout: 8000 }).catch(() => {});
  await H.say("the second one"); await p.waitForFunction(() => /^#song-/.test(location.hash) && window.__pv.ctx().playing, null, { timeout: 9000 }).catch(() => {});
  s = await st(); rec("“the second one” opens that song and it plays", /^#song-/.test(s.h) && s.pl, JSON.stringify(s));
  const second = s.h;
  // 2. "any" picks one; a title picks that one
  await hear("ok profe play a random song"); await p.waitForFunction(() => /^#song-/.test(location.hash), null, { timeout: 9000 }).catch(() => {});
  rec("“play a random song” plays one without asking", /^#song-/.test((await st()).h), JSON.stringify(await st()));
  await hear("ok profe select a video"); await H.wait(2500);
  s = await st(); t = await said(); rec("“Select a video” opens Videos and offers three titles", s.h === "#videos" && /Which one\?/.test(t) && ((await p.evaluate(() => (window.__pvLast || {}).say || "")).match(/«/g) || []).length >= 3, JSON.stringify(s) + " " + t);
  const firstTitle = await p.evaluate(() => window.__pv.choice().top[0].t);
  await p.waitForFunction(() => window.__R.on, null, { timeout: 8000 }).catch(() => {});
  await H.say(firstTitle.split(" ").slice(0, 4).join(" ")); await p.waitForFunction(() => /^#video-/.test(location.hash), null, { timeout: 9000 }).catch(() => {});
  rec("Saying part of a title opens that video", /^#video-/.test((await st()).h), firstTitle + " " + JSON.stringify(await st()));
  // 3. "play something": asks which kind first
  await hear("ok profe play something"); await H.wait(1800);
  t = await said(); rec("“play something” asks: a video, a song, a podcast or a story?", /video, a song, a podcast or a story/.test(t), t);
  await p.waitForFunction(() => window.__R.on, null, { timeout: 8000 }).catch(() => {});
  await H.say("a podcast"); await p.waitForFunction(() => location.hash === "#escuchar" && window.__pv.choice() && window.__pv.choice().items, null, { timeout: 9000 }).catch(() => {});
  s = await st(); rec("…“a podcast” opens the podcasts and asks which one", s.h === "#escuchar" && s.ch && s.ch.includes("items"), JSON.stringify(s));
  // 4. not a known command but clearly for the app («of video»: the first word lost to the beep): Profe asks instead of guessing
  await hear("okay profe of video"); await H.wait(1800); if (process.env.DBG) console.log((await p.evaluate(() => [].concat(window.__pv.diag).slice(-14).join("\n"))));
  t = await said(); s = await st();
  rec("«of video» gets a question with numbered options (not silence, not the chat)", /Did you mean/.test(t) && s.ch && s.ch.includes("acts"), t);
  const opts = await p.evaluate(() => window.__pv.choice().acts.map((x) => x.a.id));
  await p.waitForFunction(() => window.__R.on, null, { timeout: 8000 }).catch(() => {});
  const want = opts.indexOf("media.pick") >= 0 ? opts.indexOf("media.pick") : opts.indexOf("nav.videos");
  await H.say(["one", "two", "three"][want]); await p.waitForFunction(() => /^#video/.test(location.hash), null, { timeout: 9000 }).catch(() => {});
  s = await st(); rec("…answering with the number does that option (" + opts.join(", ") + ")", want >= 0 && (s.h === "#videos" || /^#video-/.test(s.h)), JSON.stringify(s));
  // 5. "what is on this screen" (S24: «What is on this b****») explains the page
  await hear("ok profe what is on this screen"); await H.wait(1200);
  rec("“what is on this screen” asks Profe to explain the page", (await st()).last && (await st()).last.id === "profe.explain", JSON.stringify((await st()).last));
  rec("No page errors", !H.errs.length, H.errs.join(" | "));
  await H.close();
  // 6. mic handoff: while a capture is retried (code 11 before the mic opened), the wake listener must not grab the mic in the gap
  H = await open({ hash: "#inicio", noOpen: true, wake: true, init: () => { window.__fail11 = 0; } }); p = H.p;
  await p.evaluate(() => window.__pv.route("turn on hands-free", "chat")); await H.wait(3500);
  await p.evaluate(() => { window.__fail11 = 1; const o = window.AndroidSTT.start; window.AndroidSTT.start = function () { o.apply(this, arguments); if (window.__fail11-- > 0) setTimeout(() => window.__sttEnd("aborted"), 50); }; window.__W.log = []; window.__hear("okey profe", true); });
  await H.wait(2000);
  const wl = await p.evaluate(() => ({ wake: window.__W.log.map((x) => x[0]).join(","), mic: window.__R.on, starts: window.__R.log.filter((x) => x[0] === "start").length }));
  rec("Capture retried after “aborted”: the mic opens on the retry and the wake listener stays off in between", wl.mic && wl.starts === 2 && !/start/.test(wl.wake.replace(/^stop,?/, "")), JSON.stringify(wl));
  // 7. language: an English command that was understood keeps English; Spanish garble with English words switches back to English
  await p.waitForFunction(() => window.__W.on, null, { timeout: 15000 }).catch(() => {}); await p.evaluate(() => { window.__pv.hf.cmdEs = true; window.__hear("okey profe", true); });
  await p.waitForFunction(() => window.__R.on, null, { timeout: 5000 }).catch(() => {}); await H.say("can you please verano rosa on the speech"); await H.wait(4500);
  rec("Garbled English heard as Spanish switches the next capture back to English", (await p.evaluate(() => window.__pv.hf.cmdEs)) === false, JSON.stringify(await p.evaluate(() => window.__pv.hf.cmdEs)));
  await H.close();
  console.log(R.every(Boolean) ? "ALL " + R.length + " PASS" : R.filter((x) => !x).length + " FAILED of " + R.length);
})();
