// A. interruptions and timing — each scenario runs with several delays
const { open, overlapMic } = require("./h.js");
const norm = (s) => String(s).toLowerCase().replace(/[^a-záéíóúüñ ]/g, " ").replace(/\s+/g, " ").trim();
const LONG = "Muy bien, vamos a practicar el pasado. Primero te explico una cosa importante sobre el pretérito. Cuando hablamos de ayer usamos fui, comí y hablé. ¿Qué hiciste ayer por la tarde? [[·]]";
const MIX = "Say «Tengo hambre», which means I'm hungry, and «Tengo sed», which means I'm thirsty. Now try it. [[·]]";
async function stale(H, tMic) { // speech that started after the learner took the mic, from a reply asked for before it
  const tts = await H.tts(), reqs = await H.reqs();
  const old = reqs.filter((r) => r.t < tMic).map((r) => norm(r.text));
  return tts.filter((e) => e.t0 && e.t0 > tMic + 5 && old.some((o) => o.includes(norm(e.text))) && !reqs.filter((r) => r.t >= tMic).some((r) => norm(r.text).includes(norm(e.text)))).map((e) => e.text.slice(0, 50));
}
const R = [];
function rec(name, ok, info) { R.push([name, ok]); console.log((ok ? "PASS " : "FAIL ") + name + (info ? "  " + info : "")); }
async function micLatency(H, tMic) { const tts = await H.tts(); const cut = tts.filter((e) => e.t0 && e.t0 < tMic && (!e.t1 || e.t1 >= tMic)); return cut.length ? Math.round(Math.max(...cut.map((e) => (e.t1 || 1e9) - tMic))) : null; }

(async () => {
  for (const d of [0, 60, 140]) { // A1: mic just before Profe begins speaking (reply arrives ~d ms later)
    const H = await open(); await H.replies([{ text: LONG, delay: 250, wordMs: 15 }]);
    await H.type("Ayer fui al mercado con mi madre"); await H.wait(250 + 40 - d + 60);
    const tMic = await H.p.evaluate(() => { document.querySelector('[data-act="t-mic"]').click(); return performance.now(); });
    await H.wait(2500); const st = await stale(H, tMic), ov = overlapMic(await H.tts(), await H.stt());
    rec("A1 mic just before speech (offset " + d + ")", !st.length && !ov.length, st.concat(ov).join(" | ")); await H.close();
  }
  for (const d of [300, 900, 1600]) { // A2: interrupt during speech
    const H = await open(); await H.replies([{ text: LONG, delay: 100, wordMs: 10 }]);
    await H.type("Ayer fui al mercado con mi madre"); await H.p.waitForFunction(() => !!window.__T.cur, null, { timeout: 8000 }); await H.wait(d);
    const tMic = await H.p.evaluate(() => { document.querySelector('[data-act="t-mic"]').click(); return performance.now(); });
    await H.wait(2500); const st = await stale(H, tMic), ov = overlapMic(await H.tts(), await H.stt()), lat = await micLatency(H, tMic);
    rec("A2 interrupt during speech (+" + d + "ms)", !st.length && !ov.length, "stop latency " + lat + " ms " + st.concat(ov).join(" | ")); await H.close();
  }
  for (const d of [0, 20, 90]) { // A3: between language segments
    const H = await open(); await H.replies([{ text: MIX, delay: 100, wordMs: 10 }]);
    await H.type("Ayer fui al mercado con mi madre"); await H.p.waitForFunction(() => window.__T.log.some((e) => e.t1 && !e.stopped), null, { timeout: 8000 }); await H.wait(d);
    const tMic = await H.p.evaluate(() => { document.querySelector('[data-act="t-mic"]').click(); return performance.now(); });
    await H.wait(2500); const st = await stale(H, tMic), ov = overlapMic(await H.tts(), await H.stt());
    rec("A3 between segments (+" + d + "ms)", !st.length && !ov.length, st.concat(ov).join(" | ")); await H.close();
  }
  for (const d of [200, 700]) { // A4: while the reply is still being generated (streamed speech already started)
    const H = await open(); await H.replies([{ text: LONG, delay: 100, wordMs: 120 }]);
    await H.type("Ayer fui al mercado con mi madre"); await H.p.waitForFunction(() => !!window.__T.cur, null, { timeout: 10000 }); await H.wait(d);
    const gen = await H.p.evaluate(() => !!window.__L.cur);
    const tMic = await H.p.evaluate(() => { document.querySelector('[data-act="t-mic"]').click(); return performance.now(); });
    await H.wait(5000); const st = await stale(H, tMic), ov = overlapMic(await H.tts(), await H.stt());
    rec("A4 interrupt while generating (still generating: " + gen + ")", !st.length && !ov.length, st.concat(ov).join(" | ")); await H.close();
  }
  { // A5: rapid press / release / press
    const H = await open(); await H.replies([{ text: LONG, delay: 100, wordMs: 10 }]);
    await H.type("Ayer fui al mercado con mi madre"); await H.p.waitForFunction(() => !!window.__T.cur, null, { timeout: 8000 });
    const tMic = await H.p.evaluate(async () => { const b = () => document.querySelector('[data-act="t-mic"]'); const t = performance.now(); b().click(); await new Promise((r) => setTimeout(r, 40)); b().click(); await new Promise((r) => setTimeout(r, 40)); b().click(); return t; });
    await H.wait(1500); const listening = await H.p.evaluate(() => window.__R.on);
    await H.say("Ayer fui al mercado"); await H.wait(4500);
    const st = await stale(H, tMic), ov = overlapMic(await H.tts(), await H.stt()), msgs = await H.msgs();
    rec("A5 rapid press/release/press", !st.length && !ov.length && !H.errs.length && listening && /U: Ayer fui al mercado/.test(msgs.join("|")), "mic open at end: " + listening + " | last msgs: " + msgs.slice(-2).join(" ‖ ") + " " + st.concat(ov, H.errs).join(" | ")); await H.close();
  }
  for (const d of [100, 600]) { // A6: new utterance while the old request is pending
    const H = await open(); await H.replies([{ text: "OLDREPLY: el mercado es muy bonito por la mañana. ¿Qué compraste? [[·]]", delay: 6500, wordMs: 20 }]); await H.p.evaluate(() => { window.__L.def = { text: "NUEVA: muy bien, fui al mercado también. ¿Y después? [[✓]]", delay: 150, wordMs: 20 }; });
    await H.type("Ayer fui al mercado con mi madre"); await H.wait(d);
    const tMic = await H.p.evaluate(() => { document.querySelector('[data-act="t-mic"]').click(); return performance.now(); });
    await H.wait(150); await H.say("Ayer fui al mercado"); await H.wait(6000);
    const tts = await H.tts(), heardOld = tts.filter((e) => e.t0 && /OLDREPLY|bonito|compraste/i.test(e.text)).length, heardNew = tts.filter((e) => e.t0 && /NUEVA|también|después/i.test(e.text)).length, reqs = await H.reqs();
    rec("A6 new utterance while old pending (+" + d + "ms)", !heardOld && heardNew > 0, "old heard " + heardOld + ", new heard " + heardNew + ", requests " + reqs.length + " (1st cancelled: " + !!reqs[0].cancelled + ") | " + (await H.msgs()).slice(-3).join(" ‖ ")); await H.close();
  }
  { // A6c the old reply had already started writing words when the learner spoke: it must never be spoken
    const H = await open(); await H.replies([{ text: "OLDREPLY muy bien dicho, el mercado es bonito y grande por la mañana cuando hay mucha fruta fresca y barata. ¿Qué compraste? [[·]]", delay: 200, wordMs: 400 }]); await H.p.evaluate(() => { window.__L.def = { text: "NUEVA: muy bien, fui al mercado también. ¿Y después? [[✓]]", delay: 150, wordMs: 20 }; });
    await H.type("Ayer fui al mercado con mi madre"); await H.wait(1500);
    await H.mic(); await H.wait(150); await H.say("Compré fruta y pan"); await H.wait(7000);
    const tts = await H.tts(), heardOld = tts.filter((e) => e.t0 && /OLDREPLY|bonito|compraste|fruta fresca/i.test(e.text)).length, heardNew = tts.filter((e) => e.t0 && /NUEVA|también|después/i.test(e.text)).length, msgs = await H.msgs();
    rec("A6c partly written old reply superseded", !heardOld && heardNew > 0, "old heard " + heardOld + ", new heard " + heardNew + " | " + msgs.slice(-3).join(" ‖ ").slice(0, 300)); await H.close();
  }
  for (const [kind, act] of [["silence", (H) => H.sttEnd(null)], ["noise (no-match)", (H) => H.sttEnd("no-match")], ["no-speech error", (H) => H.sttEnd("no-speech")]]) { // A7
    const H = await open(); const n0 = (await H.msgs()).length;
    await H.mic(); await H.wait(400); await act(H); await H.wait(1500);
    const reqs = await H.reqs(), n1 = (await H.msgs()).length;
    rec("A7 " + kind + " does not advance", reqs.length === 0 && n1 === n0, "requests " + reqs.length + ", messages " + n0 + "→" + n1); await H.close();
  }
  { // A7b incomplete speech
    const H = await open(); await H.mic(); await H.wait(300); await H.say("Ayer fui a"); await H.wait(7500);
    const reqs = await H.reqs(); rec("A7b incomplete speech is flagged to Profe", reqs.length >= 1 && /unfinished/.test(reqs[0].user), JSON.stringify((reqs[0] || {}).user || "").slice(-300) + " n=" + reqs.length); await H.close();
  }
  for (const gap of [800, 1800]) { // A8 natural pause, then continue
    const H = await open(); await H.mic(); await H.wait(300); await H.say("Ayer fui"); await H.wait(gap); await H.say("al mercado con mi madre"); await H.wait(5000);
    const us = (await H.msgs()).filter((m) => m.startsWith("U:"));
    rec("A8 pause " + gap + "ms then continue → one turn", us.length === 1 && /ayer fui al mercado con mi madre/i.test(us[0]), us.join(" ‖ ")); await H.close();
  }
  const f = R.filter((x) => !x[1]).length; console.log(f ? f + " FAILED of " + R.length : "ALL " + R.length + " PASS");
})();
