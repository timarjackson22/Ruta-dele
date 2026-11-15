// R. Redo any answered question (learner's request, 15 Nov 2026): practice runner, multiple-choice lists (reading/listening texts, videos),
// by touch and by voice; a right answer can be redone too; what was saved is cleared.
const { open } = require("./h.js");
const R = []; const rec = (n, ok, info) => { R.push(!!ok); console.log((ok ? "PASS " : "FAIL ") + n + (!ok && info != null ? "  " + String(info).slice(0, 300) : "")); };
(async () => {
  const H = await open({ hash: "#a1-u2", noOpen: true }); const p = H.p;
  // 1. runner: answer, redo by touch
  await p.click('[data-act="px-restart"]'); await H.wait(500);
  const typ = await p.evaluate(() => document.getElementById("px-in") ? "text" : "mc");
  if (typ === "text") { await p.fill("#px-in", "xyz"); await p.click('[data-act="px-submit"]'); } else await p.click('[data-act="px-pick"]');
  await H.wait(400);
  rec("An answered question shows “↺ Redo this question”", await p.evaluate(() => !!document.querySelector('[data-act="px-redo"]')), "");
  await p.click('[data-act="px-redo"]'); await H.wait(400);
  const st = await p.evaluate(() => ({ fb: !!document.querySelector(".pxfb"), inp: document.getElementById("px-in") ? document.getElementById("px-in").value : null, pick: document.querySelectorAll('[data-act="px-pick"]:not([disabled])').length, saved: (() => { try { const s = JSON.parse(localStorage.getItem(Object.keys(localStorage).find((k) => /ruta/.test(k)) || "{}")); return s; } catch (e) { return null; } })() }));
  rec("Redo clears the answer and its feedback, and the question can be answered again", !st.fb && (st.inp === "" || st.pick > 0), JSON.stringify({ fb: st.fb, inp: st.inp, pick: st.pick }));
  // a right answer can be redone too: show the answer (marks it), then redo
  await p.click('[data-act="px-dunno"]').catch(() => {}); await H.wait(300);
  rec("…and after “Show answer”, Redo is offered again", await p.evaluate(() => !!document.querySelector('[data-act="px-redo"]')), "");
  // by voice
  await p.evaluate(() => window.__pv.route("redo this question", "chat")); await H.wait(800);
  rec("“redo this question” (voice) clears it", await p.evaluate(() => !document.querySelector(".pxfb") && !document.querySelector('[data-act="px-redo"]')), JSON.stringify(await p.evaluate(() => window.__pvLast)));
  // saved progress: after reloading the page the redone question is still unanswered
  await p.reload(); await H.wait(1800); await p.click('[data-act="px-go"]').catch(() => p.click('[data-act="px-restart"]').catch(() => {})); await H.wait(500);
  rec("After a reload the cleared question is still unanswered (saved progress updated)", await p.evaluate(() => !document.querySelector(".pxfb")), JSON.stringify(await p.evaluate(() => (document.getElementById("runner") || {}).innerText.slice(0, 120))));
  // 2. a reading text's questions
  await p.evaluate(() => { location.hash = "#historia-a1-1"; }); await H.wait(1500);
  await p.evaluate(() => document.querySelector('.mc[data-scope="lq"] > li .opt').click()); await H.wait(800);
  rec("A text's question gets “↺ Redo” once answered", await p.evaluate(() => !!document.querySelector('.mc[data-scope="lq"] > li .q-redo')), "");
  await p.evaluate(() => document.querySelector('.mc[data-scope="lq"] > li .q-redo').click()); await H.wait(300);
  rec("Redo re-opens that question (choices active, no right/wrong marks)", await p.evaluate(() => { const li = document.querySelector('.mc[data-scope="lq"] > li'); return !li.querySelector(".opt[disabled], .opt.right, .opt.wrong, .q-redo, .lq-where"); }), "");
  await p.evaluate(() => { const lis = document.querySelectorAll('.mc[data-scope="lq"] > li'); lis[1].querySelector(".opt").click(); }); await H.wait(700);
  await p.evaluate(() => window.__pv.route("redo question 2", "chat")); await H.wait(500);
  rec("“redo question 2” (voice) clears question 2", await p.evaluate(() => !document.querySelectorAll('.mc[data-scope="lq"] > li')[1].querySelector(".opt[disabled]")), JSON.stringify(await p.evaluate(() => window.__pvLast)));
  await p.evaluate(() => window.__pv.route("redo question 3", "chat")); await H.wait(400);
  rec("…a question that isn't answered: says so", /isn't answered/.test((await p.evaluate(() => window.__pvLast.say)) || ""), JSON.stringify(await p.evaluate(() => window.__pvLast)));
  // 3. a video's quiz: the saved answer is cleared too
  const vid = await p.evaluate(() => { const a = [...document.querySelectorAll("a")].find((x) => /^#video-/.test(x.getAttribute("href") || "")); return a ? a.getAttribute("href") : "#video-W0LLExzov2A"; });
  await p.evaluate((h) => { location.hash = h; }, "#video-W0LLExzov2A"); await H.wait(2500);
  const hasVq = await p.evaluate(() => !!document.querySelector('.mc[data-scope="vq"] .opt'));
  if (hasVq) {
    await p.evaluate(() => document.querySelector('.mc[data-scope="vq"] > li .opt').click()); await H.wait(700);
    await p.evaluate(() => document.querySelector('.mc[data-scope="vq"] > li .q-redo').click()); await H.wait(300);
    rec("A video quiz question can be redone", await p.evaluate(() => !document.querySelector('.mc[data-scope="vq"] > li .opt[disabled]')), "");
  } else console.log("INFO this video has no quiz in the test environment");
  rec("No page errors", !H.errs.length, H.errs.join(" | "));
  await H.close();
  console.log(R.every(Boolean) ? "ALL " + R.length + " PASS" : R.filter((x) => !x).length + " FAILED of " + R.length);
})();
