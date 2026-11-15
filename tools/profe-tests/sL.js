// latency: what the app itself adds (the phone's TTS/recogniser/AI times are simulated and subtracted)
const { open } = require("./h.js");
const med = (a) => { const b = a.slice().sort((x, y) => x - y); return b[Math.floor(b.length / 2)]; };
(async () => {
  const intr = [], over = [], eot = [];
  for (let i = 0; i < 6; i++) {
    const H = await open();
    await H.replies([{ text: "Muy bien, entiendo perfectamente lo que dices sobre tu fin de semana en la playa. ¿Qué comiste allí? [[·]]", delay: 200, wordMs: 30 }]);
    await H.type("Ayer fui al mercado con mi madre");
    await H.p.waitForFunction(() => !!window.__T.cur, null, { timeout: 8000 });
    await H.p.waitForFunction(() => window.__L.reqs.length && window.__L.reqs.every((j) => j.done), null, { timeout: 8000 }).catch(() => {}); await H.wait(300); const r = await H.p.evaluate(() => { const done = Math.max(...window.__L.reqs.map((j) => j.done || 0)); const first = window.__T.log.find((e) => e.tq >= done - 1); return { done, t0: first ? first.tq : 0, lat: window.__T.lat }; });
    const done = await H.p.evaluate(() => { const j = window.__L.reqs[0]; return j.done; });
    // the app's own time from "AI finished" to "speech requested" (TTS start latency subtracted)
    if (r.t0 && r.done) over.push(Math.round(r.t0 - r.done));
    await H.wait(300 + i * 150);
    const tMic = await H.p.evaluate(() => { document.querySelector('[data-act="t-mic"]').click(); return performance.now(); });
    await H.wait(400);
    const stop = await H.p.evaluate((tm) => { const c = window.__T.log.find((e) => e.t0 && e.t0 < tm && e.t1 && e.t1 >= tm); return c ? c.t1 - tm : null; }, tMic);
    if (stop != null) intr.push(Math.round(stop));
    // end of turn: last word heard → message sent to Profe
    await H.say("Comí pescado con arroz y una ensalada"); const tLast = await H.now();
    await H.p.waitForFunction(() => window.__L.reqs.some((j) => /Comí pescado/.test(j.user)), null, { timeout: 12000 }).catch(() => {});
    const tReq = await H.p.evaluate(() => (window.__L.reqs.find((j) => /Comí pescado/.test(j.user)) || {}).t || 0); if (tReq) eot.push(Math.round(tReq - tLast));
    await H.close();
  }
  console.log("mic → playback stopped (JS + bridge path), ms:", intr.join(", "), "| median", med(intr));
  console.log("AI finished → first speech request (app processing incl. weak-reply check), ms:", over.join(", "), "| median", med(over));
  console.log("learner's last word → message sent (end-of-turn wait), ms:", eot.join(", "), "| median", med(eot));
})();
