const { open } = require("./h.js");
(async () => { const H = await open({ hash: "#a2-u3" }); const p = H.p;
 await p.click('[data-act="t-tab"][data-v="practice"]'); await H.wait(300);
 for (const kind of ["trans", "conj", "vocab"]) {
  await p.evaluate(() => { const b = document.querySelector('#tutor [data-act="pr-exit"]'); b && b.click(); }); await H.wait(300);
  await p.selectOption("#t-prsel", kind); await H.wait(500);
  const on = await p.waitForFunction(() => window.__R.on, null, { timeout: 12000 }).then(() => true).catch(() => false);
  const it = await p.evaluate(() => { const PR = window.__ad.pr(); return PR ? (PR.it ? (PR.it.dir || "cj") + " " + (PR.it.src || PR.it.v) : PR.kind) : null; });
  await H.wait(400); await H.say("casa"); await H.wait(4500);
  const r = await p.evaluate(() => { const PR = window.__ad.pr(); return { kind: PR && PR.kind, tries: PR && PR.tries, fb: PR && PR.fb && (PR.fb.lines || PR.fb.said || PR.fb.hint), starts: window.__R.log.filter((x) => x[0] === "start").length, diag: (window.__pv.diag.log || []).slice(-6) }; });
  console.log(kind, "auto-mic on:", on, it, JSON.stringify(r).slice(0, 500));
  await p.evaluate(() => { const b = document.querySelector('#tutor [data-act="pr-mic"]'); b && b.click(); }); await H.wait(800);
  console.log("  after tapping mic, listening:", await p.evaluate(() => window.__R.on));
 }
 console.log("errors", H.errs.join(" | "));
 await H.close(); })();
