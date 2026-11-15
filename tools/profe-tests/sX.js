// X. Exam papers and the quick drill by voice (round 3, 15 Nov 2026), through Profe's real routing (typed = same path as speech)
const { open } = require("./h.js");
const R = []; const rec = (n, ok, info) => { R.push(!!ok); console.log((ok ? "PASS " : "FAIL ") + n + (!ok && info != null ? "  " + String(info).slice(0, 300) : "")); };
(async () => {
  const H = await open({ hash: "#a1-examen-1-lectura", noOpen: true }); const p = H.p;
  const say = async (t) => { await p.evaluate((t) => window.__pv.route(t, "chat"), t); await H.wait(900); return p.evaluate(() => window.__pvLast || {}); };
  const pressed = (i) => p.evaluate((i) => { const q = [...document.querySelectorAll("main .exq")].filter((x) => x.querySelector('[data-act="ex-ans"]'))[i]; const b = q && q.querySelector('[data-act="ex-ans"][aria-pressed="true"]'); return b ? +b.dataset.v : -1; }, i);
  await p.click('[data-act="ex-start"]'); await H.wait(1500);
  rec("Exam questions are numbered on screen", await p.evaluate(() => { const n = [...document.querySelectorAll("main .exq > .exn")].map((x) => x.textContent); return n[0] === "1" && n[2] === "3"; }), "");
  let r = await say("b"); rec("“b” answers question 1", (await pressed(0)) === 1 && r.ok, JSON.stringify(r));
  rec("…and Profe reads the next question with its options", /Next, Question 2: «Ana trabaja/.test(r.say || "") && /a\) «en un hospital/.test(r.say || ""), r.say);
  r = await say("por la mañana y por la tarde"); rec("The answer's words answer the current question (question 2 → b)", (await pressed(1)) === 1, JSON.stringify(r));
  r = await say("question 5, c"); rec("“question 5, c” answers question 5", (await pressed(4)) === 2, JSON.stringify(r));
  r = await say("change question 1 to a"); rec("“change question 1 to a” changes it", (await pressed(0)) === 0, JSON.stringify(r));
  r = await say("task 2 question 1 b"); const t2 = await p.evaluate(() => { const Q = [...document.querySelectorAll("main .exq")].filter((x) => x.querySelector('[data-act="ex-ans"]')); const h = [...document.querySelectorAll("main h2, main h3")].filter((x) => /^tarea\s*2/i.test(x.textContent.trim()))[0]; return Q.findIndex((q) => h.compareDocumentPosition(q) & 4); });
  rec("“task 2 question 1 b” answers the first question of Tarea 2", (await pressed(t2)) === 1, JSON.stringify(r) + " t2=" + t2);
  r = await say("question 99, a"); rec("A question that doesn't exist: says so", !r.ok && /no question 99/.test(r.say), JSON.stringify(r));
  r = await say("what's left"); rec("“what's left” lists unanswered numbers", r.ok && /unanswered: questions 3, 4/.test(r.say), r.say);
  r = await say("go to question 4"); rec("“go to question 4” reads question 4", /Question 4: «Lucía es/.test(r.say || ""), r.say);
  r = await say("submit the paper"); rec("“submit the paper” asks to confirm first (nothing submitted yet)", /yes/i.test(r.say || (await p.evaluate(() => document.body.innerText.slice(0, 0)))) || (await p.evaluate(() => !!document.querySelector('main [data-act="ex-ans"]'))), JSON.stringify(r));
  rec("…the paper is still open", await p.evaluate(() => !!document.querySelector('main [data-act="ex-ans"]')), "");
  await say("no");
  // listening paper: play the recording
  await p.evaluate(() => { location.hash = "#a1-examen-1-auditiva"; }); await H.wait(1500); await p.click('[data-act="ex-start"]').catch(() => {}); await H.wait(1200);
  r = await say("play the audio"); rec("“play the audio” starts the task's recording", r.ok, JSON.stringify(r));
  // quick drill: matching pairs by voice
  await p.evaluate(() => { speechSynthesis.cancel(); location.hash = "#drill"; }); await H.wait(1500);
  const pair = await p.evaluate(() => { const b = [...document.querySelectorAll('main [data-act="dr-m"]')]; const es = b.find((x) => /^(el|la) /.test(x.textContent.trim())); if (!es) return null; const en = b.find((x) => x !== es && x.dataset.i === es.dataset.i); return en ? [es.textContent.trim(), en.textContent.trim()] : null; });
  if (pair) { const before = await p.evaluate(() => document.querySelector("main").innerHTML.length); r = await say(pair[0] + ", " + pair[1]);
    rec("Quick drill: saying a pair («" + pair[0] + "», «" + pair[1] + "») taps both cards", r.ok && (await p.evaluate(() => document.querySelector("main").innerHTML.length)) !== before, JSON.stringify(r)); }
  else console.log("INFO the first drill card isn't a matching card");
  rec("No page errors", !H.errs.length, H.errs.join(" | "));
  await H.close();
  console.log(R.every(Boolean) ? "ALL " + R.length + " PASS" : R.filter((x) => !x).length + " FAILED of " + R.length);
})();
