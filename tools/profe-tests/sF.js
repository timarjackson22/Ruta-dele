// F. Profe knows everything in the app by name (S24 log 15 Nov 07:26): singers and titles, buttons on screen, closest-match questions
// instead of the chat, the wake word after a conversation, and the screen kept awake while hands-free is on.
const { open } = require("./h.js");
const R = []; const rec = (n, ok, info) => { R.push(!!ok); console.log((ok ? "PASS " : "FAIL ") + n + (!ok && info != null ? "  " + String(info).slice(0, 400) : "")); };
(async () => {
  const H = await open({ hash: "#inicio", noOpen: true, wake: true, init: () => { window.__ks = []; } }); const p = H.p;
  await p.evaluate(() => { const o = window.AndroidTTS.keepScreenOn; window.AndroidTTS.keepScreenOn = (v) => { window.__ks.push(!!v); }; });
  const st = () => p.evaluate(() => ({ h: location.hash, last: window.__pvLast && { id: window.__pvLast.id, say: window.__pvLast.say }, ch: window.__pv.choice() ? Object.keys(window.__pv.choice()) : null, tutor: document.body.classList.contains("tutor-open") }));
  const hear = async (t) => { await p.evaluate(() => { if (document.body.classList.contains("tutor-open")) document.querySelector('#tutor [data-act="t-close"]').click(); try { if (window.__pv.ctx().playing) document.querySelector('[data-act="l-play"]').click(); } catch (e) {} if (location.hash !== "#inicio") location.hash = "#inicio"; });
    await p.waitForFunction(() => window.__W.on, null, { timeout: 25000 }).catch(() => {}); const ok = await p.evaluate((t) => { window.__T.log = []; return window.__hear(t, true); }, t); if (!ok) console.log("  (the wake listener was not running for «" + t + "»)"); return ok; };
  await p.evaluate(() => window.__pv.route("turn on hands-free", "chat")); await H.wait(3500);
  rec("Hands-free on keeps the screen awake", await p.evaluate(() => window.__ks.includes(true)), JSON.stringify(await p.evaluate(() => window.__ks)));
  // 1. a singer's name opens their video
  await hear("ok profe Shakira"); await p.waitForFunction(() => /^#video-/.test(location.hash), null, { timeout: 9000 }).catch(() => {});
  rec("“Ok Profe, Shakira” opens La bicicleta (Carlos Vives, Shakira)", (await st()).h === "#video--UV0QGLmYys", JSON.stringify(await st()));
  await H.wait(1000);
  // 2. a title anywhere in the app
  await hear("ok profe open the Panama Canal"); await p.waitForFunction(() => location.hash === "#history-a1-01", null, { timeout: 9000 }).catch(() => {});
  if (process.env.DBG) console.log(await p.evaluate(() => [].concat(window.__pv.diag).slice(-22).join("\n")));
  rec("“open the Panama Canal” opens El Canal de Panamá", (await st()).h === "#history-a1-01", JSON.stringify(await st()));
  rec("The slower video request (still waiting for the player) didn't speak over the newer one", !/La bicicleta/.test(((await st()).last || {}).say || ""), JSON.stringify(await st()));
  await H.wait(5000);
  // 3. «Carol G» is Karol G: her video in the library is Verano Rosa (and the 03:05 log «…verano Rosa on the speech» was asking for it)
  await hear("ok profe Carol G"); await p.waitForFunction(() => location.hash === "#video-FUHaycnjzKg", null, { timeout: 9000 }).catch(() => {});
  rec("«Carol G» opens Verano Rosa (KAROL G)", (await st()).h === "#video-FUHaycnjzKg", JSON.stringify(await st()));
  await H.wait(6000);
  await hear("ok profe can you please verano rosa on the speech"); await H.wait(2500); let s = await st();
  const o3 = await p.evaluate(() => window.__pv.choice() && window.__pv.choice().opts ? window.__pv.choice().opts.map((o) => o.say).join(" | ") : "");
  rec("The garbled 03:05 request offers Verano Rosa first (or plays it)", s.h === "#video-FUHaycnjzKg" || /^the video «Verano Rosa/.test(o3), o3 + " " + JSON.stringify(s));
  await H.wait(9000);
  // 3b. something that really isn't in the app: an honest answer, hands-free stays on, no chat
  await hear("ok profe Bad Bunny"); await H.wait(2500); s = await st(); const t3 = await p.evaluate(() => window.__T.log.map((e) => e.text).join(" "));
  rec("«Bad Bunny» (not in the library): says so or asks, and doesn't open the chat", !s.tutor && /can't find|Did you mean/.test(t3 + " " + (s.last && s.last.say || "")), t3 + " | " + JSON.stringify(s));
  await H.wait(9000);
  // 4. half-heard request: options with the closest match, answered by number
  await hear("ok profe me with a music video"); await H.wait(2500); s = await st();
  const opts = await p.evaluate(() => window.__pv.choice() && window.__pv.choice().opts ? window.__pv.choice().opts.map((o) => o.say) : null);
  rec("«me with a music video» → options (not the chat)", !s.tutor && opts && opts.length >= 1, JSON.stringify(s) + " " + JSON.stringify(opts));
  if (opts) { await p.waitForFunction(() => window.__R.on, null, { timeout: 8000 }).catch(() => {}); await H.say("one"); await p.waitForFunction(() => location.hash !== "#inicio", null, { timeout: 9000 }).catch(() => {});
    rec("…“one” does the first option (" + opts[0] + ")", (await st()).h !== "#inicio", JSON.stringify(await st())); }
  await H.wait(9000);
  // 5. a button on the current screen
  await p.evaluate(() => { location.hash = "#videos"; }); await H.wait(1500);
  await p.waitForFunction(() => window.__W.on, null, { timeout: 25000 }).catch(() => {});
  await p.evaluate(() => window.__hear("ok profe tap music", true)); await H.wait(1500);
  rec("“tap Music” on Videos presses the Music filter", await p.evaluate(() => { const b = [...document.querySelectorAll('[data-act="v-f"]')].find((x) => /^music$/i.test(x.textContent.trim())); return !!b && b.getAttribute("aria-pressed") === "true"; }), "");
  await H.wait(6000);
  // 6. after a conversation with Profe, "Ok Profe" works again
  await hear("ok profe how do you say hello in Spanish"); await H.wait(3000);
  const conv = await st(); await p.evaluate(() => { if (document.body.classList.contains("tutor-open")) document.querySelector('#tutor [data-act="t-close"]').click(); });
  const back = await p.waitForFunction(() => window.__W.on, null, { timeout: 25000 }).then(() => true).catch(() => false);
  rec("A question goes to Profe, and afterwards the wake listener is back", conv.tutor && back, JSON.stringify(conv) + " back=" + back);
  // 7. the same, but nobody closes Profe: the panel's voice chat ends by itself and "Ok Profe" comes back (S24 07:34 report)
  await p.waitForFunction(() => window.__W.on, null, { timeout: 25000 }).catch(() => {});
  await p.evaluate(() => window.__hear("ok profe what does hola mean", true));
  await p.waitForFunction(() => document.body.classList.contains("tutor-open"), null, { timeout: 6000 }).catch(() => {});
  const back2 = await p.waitForFunction(() => window.__W.on, null, { timeout: 40000 }).then(() => true).catch(() => false);
  const ok7 = back2 ? await p.evaluate(() => window.__hear("ok profe open the verbs", true)) : false; await H.wait(2500);
  rec("Profe left open after a voice chat: “Ok Profe” works again by itself", back2 && ok7 && (await st()).h === "#verbos", "back=" + back2 + " " + JSON.stringify(await st()));
  // 8. S24 09:32: the recogniser was slow to open (error 11 + retry): the time to speak starts when the mic is really open
  await p.evaluate(() => { if (document.body.classList.contains("tutor-open")) document.querySelector('#tutor [data-act="t-close"]').click(); location.hash = "#inicio"; });
  await p.waitForFunction(() => window.__W.on, null, { timeout: 25000 }).catch(() => {});
  await p.evaluate(() => { window.__R.readyDelay = 3500; window.__hear("okey profe", true); });
  await p.waitForFunction(() => window.__R.on, null, { timeout: 5000 }).catch(() => {}); await H.wait(3500 + 4500); // old rule: the window had already closed 4 s after start
  await H.say("open the verbs"); await p.waitForFunction(() => location.hash === "#verbos", null, { timeout: 9000 }).catch(() => {});
  await p.evaluate(() => { window.__R.readyDelay = 0; });
  rec("Slow-starting mic: speaking 8 s after “Ok Profe” (4.5 s after the mic opened) still works", (await st()).h === "#verbos", JSON.stringify(await st()));
  // 9. a wake listener that has been silent for 3 minutes is restarted (S24 09:33: "it stopped waking after a while")
  await H.wait(3000); await p.waitForFunction(() => window.__W.on, null, { timeout: 25000 }).catch(() => {});
  await p.evaluate(() => { window.__W.log = []; window.__pv.hf.wakeEvT = Date.now() - 181000; }); await H.wait(2500);
  const wl = await p.evaluate(() => ({ log: window.__W.log.map((x) => x[0]).join(","), on: window.__W.on }));
  rec("A silent wake listener is restarted and listening again", /stop/.test(wl.log) && /start/.test(wl.log) && wl.on, JSON.stringify(wl));
  rec("No page errors", !H.errs.length, H.errs.join(" | "));
  await H.close();
  console.log(R.every(Boolean) ? "ALL " + R.length + " PASS" : R.filter((x) => !x).length + " FAILED of " + R.length);
})();
