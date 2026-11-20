// v242: one owner of the microphone. «Ok Profe» (the wake listener) must never listen at the same time as the call, the
// chat mic or a practice answer — on a real phone two listeners can't share the mic (dropped words, «mic busy», cut turns).
const { open } = require("./h.js");
(async () => {
  const R = []; const rec = (n, ok, i) => { R.push(!!ok); console.log((ok ? "PASS " : "FAIL ") + n + (ok ? "" : "  " + (i || ""))); };
  const H = await open({ wake: true }); const p = H.p;
  await p.evaluate(() => { const b = document.querySelector('[data-act="hf-toggle"]'); if (b && /Off/.test(b.innerText)) b.click(); }); await H.wait(800);
  rec("«Ok Profe» is listening to start with", await p.evaluate(() => __W.on));
  await p.evaluate(() => { window.__both = 0; window.__n = 0; setInterval(() => { if (__R.on) { __n++; if (__W.on) __both++; } }, 100); });
  // call
  await p.evaluate(() => document.querySelector('[data-act="vc-open"]').click()); await H.wait(5500);
  for (let i = 0; i < 2; i++) { await H.say("ayer fui al mercado con mi hermana y compramos fruta"); await H.wait(7000); }
  const c = await p.evaluate(() => ({ both: __both, n: __n, reqs: __L.reqs.length }));
  rec("Call: never two listeners at once", c.n > 20 && c.both === 0, JSON.stringify(c));
  rec("Call: Profe heard and answered", c.reqs >= 2, c.reqs);
  await p.evaluate(() => document.querySelector('[data-act="vc-end"]').click()); await H.wait(2500);
  rec("After the call «Ok Profe» listens again", await p.evaluate(() => __W.on));
  // chat mic
  await p.evaluate(() => { __both = 0; __n = 0; }); await H.mic(); await H.wait(1500); await H.say("quiero practicar"); await H.sttEnd(); await H.idle(8000);
  const m = await p.evaluate(() => ({ both: __both, n: __n }));
  rec("Chat mic: never two listeners at once", m.n > 3 && m.both === 0, JSON.stringify(m));
  // practice answer
  await p.evaluate(() => { __both = 0; __n = 0; const t = document.querySelectorAll('[data-act="t-tab"]')[1]; t && t.click(); }); await H.wait(600);
  await p.evaluate(() => { const b = document.querySelector('#tutor .prapps [data-act="pr-vocab"]'); b && b.click(); }); await H.wait(3000);
  const q = await p.evaluate(() => ({ both: __both, n: __n }));
  rec("Practice: never two listeners at once", q.n > 3 && q.both === 0, JSON.stringify(q));
  rec("No page errors", !H.errs.length, H.errs.join(" | "));
  await H.close(); const bad = R.filter((x) => !x).length; console.log(bad ? bad + " FAILED of " + R.length : "ALL " + R.length + " PASS"); process.exit(bad ? 1 : 0);
})();
