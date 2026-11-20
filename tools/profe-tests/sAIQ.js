// v247 — from the S24 call log: the phone's one on-device AI was shared by Profe's replies and background jobs (grammar
// check, learner notes) with no turn-taking, and the chat session overflowed the model's ~2,048 tokens (replies came back
// empty in 0.0 s). Checks: a reply stops a running background job; background jobs wait during a call; an instant empty
// reply opens a fresh session and retries; long conversations rotate the session with a recap; the call's on-device brief
// is compact.
const { open } = require("./h.js");
(async () => {
  const R = []; const rec = (n, ok, i) => { R.push(!!ok); console.log((ok ? "PASS " : "FAIL ") + n + (ok ? "" : "  " + (i || ""))); };
  const H = await open(); const p = H.p;
  // 1. a reply stops a long background job
  await p.evaluate(() => { window.__L.replies.push({ text: "nota ".repeat(400), delay: 100, wordMs: 60 }); window.__bgDone = "pending"; window.__natTest.bg("notes").then(() => (window.__bgDone = "done"), (e) => (window.__bgDone = "stopped:" + (e && e.code))); });
  await H.wait(800);
  await H.replies([{ text: "¡Hola! ¿Qué tal tu día? [[·]]", delay: 50 }]); const t0 = Date.now(); await H.type("hola profe"); await H.idle(8000);
  const m1 = (await H.msgs()).slice(-1)[0] || "";
  rec("A reply doesn't wait behind a background AI job (the job is stopped)", /Qué tal tu día/.test(m1) && /stopped/.test(await p.evaluate(() => window.__bgDone)), m1 + " · bg " + (await p.evaluate(() => window.__bgDone)));
  // 2. background jobs wait during a call
  await p.evaluate(() => { window.__vcOn = true; window.__bg2 = "pending"; window.__natTest.bg("check").then(() => (window.__bg2 = "done"), () => (window.__bg2 = "failed")); });
  await H.wait(1500); const during = await p.evaluate(() => window.__bg2);
  await p.evaluate(() => { window.__vcOn = false; }); await H.wait(5000); const after = await p.evaluate(() => window.__bg2);
  rec("Background AI jobs wait while a call is on, and run after it", during === "pending" && after === "done", during + " → " + after);
  // 3. an instant empty reply → fresh session + retry
  await p.evaluate(() => { const o = AndroidLLM.chat; window.__keys = []; AndroidLLM.chat = function (id, key, sys, user) { window.__keys.push(key); if (window.__keys.length === 1) { setTimeout(() => __allm.ev("done", id, ""), 20); return; } return o.apply(this, arguments); }; });
  await H.replies([{ text: "Claro, hablemos de eso. ¿Qué te gusta hacer? [[·]]", delay: 50 }]); await H.type("quiero hablar de música"); await H.idle(8000);
  const k = await p.evaluate(() => window.__keys), m3 = (await H.msgs()).slice(-1)[0] || "";
  rec("An instant empty reply opens a fresh session and retries once (no filler)", k.length === 2 && k[0] !== k[1] && /hablemos/.test(m3), JSON.stringify(k) + " · " + m3);
  // 4. a long conversation rotates the session, with a recap
  await p.evaluate(() => { window.__keys2 = []; window.__users = []; const o = AndroidLLM.chat; AndroidLLM.chat = function (id, key, sys, user) { window.__keys2.push(key); window.__users.push(user); return o.apply(this, arguments); }; });
  for (let i = 0; i < 9; i++) { await H.replies([{ text: "Muy bien, cuéntame un poco más sobre eso, por favor, con todos los detalles que quieras. ¿Y luego? [[·]]", delay: 20, wordMs: 5 }]); await H.type("Ayer fui al mercado con mi hermana y compramos muchas frutas y verduras para la semana " + i); await H.idle(6000); }
  const k2 = await p.evaluate(() => ({ keys: [...new Set(window.__keys2)].length, recap: window.__users.some((u) => /Our conversation so far/.test(u)) }));
  rec("A long conversation moves to a fresh session before it overflows, carrying a recap", k2.keys >= 2 && k2.recap, JSON.stringify(k2));
  // 5. compact on-device call brief
  await p.evaluate(() => document.querySelector('[data-act="vc-open"]').click()); await H.wait(6000);
  await H.say("me gusta mucho el café por la mañana"); await H.wait(8000);
  const sysLen = await p.evaluate(() => (window.__L.sys || "").length);
  rec("During a call the on-device instructions fit the model (≤ 5,600 characters)", sysLen > 1000 && sysLen <= 5600, sysLen);
  await p.evaluate(() => document.querySelector('[data-act="vc-end"]').click()); await H.wait(1500);
  rec("No page errors", !H.errs.length, H.errs.join(" | "));
  await H.close(); const bad = R.filter((x) => !x).length; console.log(bad ? bad + " FAILED of " + R.length : "ALL " + R.length + " PASS"); process.exit(bad ? 1 : 0);
})();
