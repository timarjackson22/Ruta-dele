// v246 session vitals: a 30-minute rolling log in Profe › Settings (mic, what was heard, AI timing, each sentence spoken with
// its lip-sync result, call states, errors), kept across reloads, older lines dropped, copied with the version on top.
const { open } = require("./h.js");
(async () => {
  const R = []; const rec = (n, ok, i) => { R.push(!!ok); console.log((ok ? "PASS " : "FAIL ") + n + (ok ? "" : "  " + (i || ""))); };
  const H = await open(); const p = H.p;
  await H.type("hola, ¿qué tal?"); await H.idle(8000);
  await p.evaluate(() => document.querySelector('[data-act="vc-open"]').click()); await H.wait(6000);
  await H.say("me gusta mucho el café por la mañana"); await H.wait(9000);
  await p.evaluate(() => document.querySelector('[data-act="vc-end"]').click()); await H.wait(2500);
  const v = await p.evaluate(() => window.__vitals());
  const has = (re) => v.some((l) => re.test(l));
  rec("Records app start with the build", has(/\[app\] start · build \d+/), v.slice(0, 3).join(" | "));
  rec("Records what the learner said", has(/\[you\] hola/) && has(/\[you\] \(call\) me gusta/));
  rec("Records call start, states and end", has(/\[call\] call started/) && has(/state → listening/) && has(/state → speaking/) && has(/call ended/));
  rec("Records each sentence Profe spoke with start, length, voice and lip result", has(/\[speak\] #\d+ .*start \+\d+ ms.*lips (ok|STILL)/) && has(/\[speak\].* voice \S+/), v.filter((l) => /\[speak\]/.test(l)).slice(0, 2).join(" | "));
  rec("Records the mic", has(/\[mic\]/));
  await H.wait(2000);
  const kept = await p.evaluate(() => (JSON.parse(localStorage.getItem("ruta-vitals") || "[]")).length);
  rec("Saved, so it survives a reload or update", kept >= v.length - 2, kept + " of " + v.length);
  const pr = await p.evaluate(() => { const L = JSON.parse(localStorage.getItem("ruta-vitals") || "[]"); L.unshift([Date.now() - 31 * 60000, "old", "too old"]); localStorage.setItem("ruta-vitals", JSON.stringify(L)); return true; });
  await p.reload(); await H.wait(2500);
  const v2 = await p.evaluate(() => window.__vitals());
  rec("After a reload: still there, and anything older than 30 minutes is dropped", v2.some((l) => /\[you\] hola/.test(l)) && !v2.some((l) => /too old/.test(l)), v2.length);
  const txt = await p.evaluate(() => window.__pvDiagText());
  rec("Copied report starts with the version, then the session vitals", /^Version: build \d+/.test(txt) && /Session vitals, last 30 min/.test(txt), txt.slice(0, 120));
  await p.evaluate(() => window.__vitalsClear()); rec("Clear empties it", (await p.evaluate(() => window.__vitals().length)) === 0);
  rec("No page errors", !H.errs.length, H.errs.join(" | "));
  await H.close(); const bad = R.filter((x) => !x).length; console.log(bad ? bad + " FAILED of " + R.length : "ALL " + R.length + " PASS"); process.exit(bad ? 1 : 0);
})();
