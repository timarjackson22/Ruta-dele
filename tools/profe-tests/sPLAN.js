// v244: the study-plan conversation never takes over Profe. It answers plan questions while you're answering them; anything
// else pauses it (draft kept) and gets a normal reply; it is off in a video call and after 15 min; «continue my study plan»
// picks it up where it stopped.
const { open } = require("./h.js");
(async () => {
  const R = []; const rec = (n, ok, i) => { R.push(!!ok); console.log((ok ? "PASS " : "FAIL ") + n + (ok ? "" : "  " + (i || ""))); };
  const H = await open(); const p = H.p;
  await H.replies([{ text: "¡Claro! Apple se dice «manzana». [[·]]", delay: 30 }]);
  await p.evaluate(() => window.__plan.chatStart("chat")); await H.wait(600);
  rec("Plan setup starts on request", await p.evaluate(() => window.__plan.chatOn()));
  await H.type("I'm A2 and want to take B1"); await H.wait(600);
  const lv = await p.evaluate(() => { const D = window.__plan.S().plan.draft || {}; return [D.current, D.target]; });
  rec("A plan answer is taken as a plan answer", lv[0] === "a2" && lv[1] === "b1", JSON.stringify(lv));
  const n0 = (await H.reqs()).length; await H.type("¿Cómo se dice apple en español?"); await H.idle(8000);
  const m = await H.msgs();
  rec("Something else pauses the plan…", !(await p.evaluate(() => window.__plan.chatOn())));
  rec("…says so once, and Profe answers normally", m.some((x) => /study plan on hold/.test(x)) && (await H.reqs()).length > n0, m.slice(-3).join(" | "));
  const kept = await p.evaluate(() => (window.__plan.S().plan.draft || {}).target);
  rec("The plan draft is kept", kept === "b1", kept);
  await H.type("continue my study plan"); await H.wait(800);
  rec("«continue my study plan» picks it up", await p.evaluate(() => window.__plan.chatOn()) && /carry on with your study plan/i.test((await H.msgs()).slice(-1)[0] || ""), (await H.msgs()).slice(-1)[0]);
  await p.evaluate(() => (window.__vcOn = true)); rec("Never on during a video call", !(await p.evaluate(() => window.__plan.chatOn()))); await p.evaluate(() => (window.__vcOn = false));
  await p.evaluate(() => { window.__plan.S().plan.chat.last = Date.now() - 16 * 60000; }); rec("Off after 15 minutes without a plan answer", !(await p.evaluate(() => window.__plan.chatOn())));
  rec("No page errors", !H.errs.length, H.errs.join(" | "));
  await H.close(); const bad = R.filter((x) => !x).length; console.log(bad ? bad + " FAILED of " + R.length : "ALL " + R.length + " PASS"); process.exit(bad ? 1 : 0);
})();
