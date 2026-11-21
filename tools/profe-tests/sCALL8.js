// v260 — the S24 call log of 2026-11-21 11:17–11:21 (Gemma after Claude refused the key): Profe's sentences were cut off
// («…stopped: interrupted») when the AI finished writing, because the call opened the mic in the gap between two streamed
// sentences; the listen-while-thinking mic restarted while Profe spoke and fed his own words back («Claro que Claro que sí»,
// «muy bien muy bien») as the learner's turn; doubled results («quiero practicar quiero practicar»).
const { open, overlapMic } = require("./h.js");
(async () => {
  const R = []; const rec = (n, ok, i) => { R.push(!!ok); console.log((ok ? "PASS " : "FAIL ") + n + (ok ? "" : "  " + String(i || "").slice(0, 300))); };
  const H = await open(); const p = H.p; await p.evaluate(() => window.__setName("Timar", true));
  const listening = () => p.waitForFunction(() => window.__vc.state() === "listening" && window.__R.on, null, { timeout: 30000 });
  await p.evaluate(() => document.querySelector('[data-act="vc-open"]').click()); await H.wait(7000); await listening();
  // a three-sentence reply streamed slowly (the AI finishes while the first sentence is still playing)
  await H.replies([{ text: "¡Qué bien! El mercado es un lugar muy divertido para practicar. ¿Qué compraron tú y tu hermana? [[·]]", delay: 300, wordMs: 120 }]);
  const n0 = (await H.tts()).length, s0 = (await H.stt()).length;
  const startsBefore = await p.evaluate(() => window.__R.log.filter((x) => x[0] === "start").length);
  await H.say("ayer fui al mercado con mi hermana"); await H.wait(1200);
  const thinkingStarts = await p.evaluate((b) => window.__R.log.filter((x) => x[0] === "start").length - b, startsBefore);
  await H.wait(14000); await listening();
  const tts = (await H.tts()).slice(n0), said = tts.map((e) => e.text).join(" ");
  rec("All three sentences of the reply are spoken (none cut when the AI finishes)", /Qué bien/.test(said) && /muy divertido/.test(said) && /Qué compraron/.test(said) && !tts.some((e) => e.stopped), JSON.stringify(tts.map((e) => [e.text.slice(0, 30), !!e.stopped])));
  const ov = overlapMic(await H.tts(), await H.stt());
  rec("The mic is never open while Profe speaks", !ov.length, ov.slice(0, 3).join(" | "));
  rec("On the phone, nothing listens while Profe is thinking (no listen-while-thinking session)", thinkingStarts === 0, thinkingStarts + " mic starts during thinking");
  // doubled results from the phone's recogniser are merged
  await H.replies([{ text: "¡Muy bien! ¿Qué tipo de oraciones? [[·]]", delay: 40 }]);
  const k0 = (await H.reqs()).length;
  await p.evaluate(async () => { await window.__say("compramos fruta fresca", { wordMs: 20 }); await window.__say("compramos fruta fresca", { wordMs: 20 }); });
  await H.wait(6000);
  const rq = (await H.reqs()).slice(k0), u = rq.length ? String(rq[0].user || rq[0].text || "") : "";
  const m = u.match(/Learner: ([^\n]*)/); const learner = m ? m[1] : u.slice(-80);
  rec("«compramos fruta fresca» sent twice by the phone reaches Profe once", /compramos fruta fresca/.test(learner) && !/compramos fruta fresca compramos/.test(learner), learner);
  await H.say("termina la llamada"); await H.wait(3000);
  const ok = R.filter(Boolean).length; console.log(ok === R.length ? "ALL " + R.length + " PASS" : (R.length - ok) + " FAILED of " + R.length);
  await H.close(); process.exit(ok === R.length ? 0 : 1);
})().catch((e) => { console.log("CRASH", e.message); process.exit(1); });
