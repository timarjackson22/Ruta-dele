// Q. Active learning (15 Nov 2026, revised the same day): every part of a lesson or guide ends with a "Check yourself" card that opens
// interactive drills for that part (tools/skilldrills.js); the chapter challenge and the full review stay at the end.
const { open } = require("./h.js");
const R = []; const rec = (n, ok, info) => { R.push(!!ok); console.log((ok ? "PASS " : "FAIL ") + n + (!ok && info != null ? "  " + String(info).slice(0, 500) : "")); };
(async () => {
  const H = await open({ hash: "#guia-ser-estar", noOpen: true }); const p = H.p; await H.wait(1500);
  const g = await p.evaluate(() => { const c = [...document.querySelectorAll("#app .sk-card:not(.sk-rev)")]; return { n: c.length, after: c.filter((x) => (x.previousElementSibling || {}).classList && x.previousElementSibling.classList.contains("gblock")).length, rev: !!document.querySelector('#app .sk-chal a[href="#ejercicios/guia-ser-estar/review"]'), review: /Mastery exercises/.test(document.getElementById("app").innerText) }; });
  rec("Guide: a drill card after the explanation parts, then the Mastery exercises and the chapter challenge", g.n >= 5 && g.after >= 4 && g.rev && g.review, JSON.stringify(g));
  await p.evaluate(() => { document.querySelector("#app .sk-card a.btn").click(); }); await H.wait(600);
  const o = await p.evaluate(() => ({ h: location.hash, n: (window.__sk.state() || { list: [] }).list.length, ui: !!document.querySelector(".drill .drprog") }));
  rec("'Practise this' opens a drill session for that part", /^#ejercicios\/guia-ser-estar\/0$/.test(o.h) && o.n >= 5 && o.ui, JSON.stringify(o));
  await p.evaluate(() => { location.hash = "#a2-u2"; }); await H.wait(900);
  const u = await p.evaluate(() => [...document.querySelectorAll("#app .sk-card:not(.sk-rev)")].map((c) => c.querySelector("a.btn").getAttribute("href")));
  rec("Lesson: one card per part, each pointing at its own part", u.length >= 5 && new Set(u).size === u.length, JSON.stringify(u));
  rec("No page errors", !H.errs.length, H.errs.join(" | "));
  await H.close(); console.log(R.filter(Boolean).length + "/" + R.length + " passed"); process.exit(R.every(Boolean) ? 0 : 1);
})();
