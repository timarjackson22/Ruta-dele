// Q. Active learning (15 Nov 2026): "Check yourself" questions right after the part of a lesson or guide that teaches them.
const { open } = require("./h.js");
const R = []; const rec = (n, ok, info) => { R.push(!!ok); console.log((ok ? "PASS " : "FAIL ") + n + (!ok && info != null ? "  " + String(info).slice(0, 500) : "")); };
(async () => {
  const H = await open({ hash: "#a2-u2", noOpen: true }); const p = H.p; await H.wait(1200);
  const u = await p.evaluate(() => { const Q = window.__qc.store["a2-u2"], boxes = [...document.querySelectorAll("#app .qchk")], ks = [], rev = [];
    boxes.forEach((b) => b.querySelectorAll(".qcitem").forEach((it) => (/From earlier/.test(it.textContent) ? rev : ks).push(+it.dataset.k)));
    const afterGrammar = boxes.filter((b) => (b.previousElementSibling || {}).classList && b.previousElementSibling.classList.contains("gblock")).length;
    return { n: Q.items.length, boxes: boxes.length, once: ks.length === Q.items.length && new Set(ks).size === ks.length, rev: rev.length, afterGrammar, review: /Review practice/.test(document.getElementById("app").innerText), runner: !!document.getElementById("runner") }; });
  rec("Lesson: every practice question appears once in a Check yourself box, placed after the part it tests", u.once && u.boxes >= 4 && u.afterGrammar >= 3, JSON.stringify(u));
  rec("Later checks bring back earlier questions (↺ From earlier)", u.rev >= 2, JSON.stringify(u));
  rec("The full practice stays at the end as a mixed review", u.review && u.runner, JSON.stringify(u));
  // answering: typed right → ✓; typed wrong → ✗ and saved to My mistakes; multiple choice
  const typed = await p.evaluate(() => { const Q = window.__qc.store["a2-u2"], forms = [...document.querySelectorAll("#app .qcform")]; const f1 = forms[0], f2 = forms[1], i1 = Q.items[+f1.dataset.k];
    f1.querySelector(".qcin").value = i1.a[0]; f1.requestSubmit(); f2.querySelector(".qcin").value = "zzzz"; f2.requestSubmit();
    return { ok: f1.closest(".qcitem").classList.contains("ok"), no: f2.closest(".qcitem").classList.contains("no"), dis: f1.querySelector(".qcin").disabled }; });
  await H.wait(200);
  const mist = await p.evaluate(() => { location.hash = "#errores"; return 1; }); await H.wait(600);
  const mtxt = await p.evaluate(() => document.getElementById("app").innerText);
  rec("Typed answers: right → ✓ (locked), wrong → ✗ and added to My mistakes", typed.ok && typed.no && typed.dis && /to fix|imperfecto|Unidad 2/i.test(mtxt), JSON.stringify(typed) + " " + mtxt.slice(0, 200));
  await p.evaluate(() => { location.hash = "#guia-ser-estar"; }); await H.wait(900);
  const g = await p.evaluate(() => { const Q = window.__qc.store["guia-ser-estar"], boxes = [...document.querySelectorAll("#app .qchk")]; const b = document.querySelector('#app [data-act="qc-pick"]'); let pick = null;
    if (b) { const it = Q.items[+b.dataset.k]; document.querySelector('#app [data-act="qc-pick"][data-k="' + b.dataset.k + '"][data-v="' + it.c + '"]').click(); pick = b.closest(".qcitem").classList.contains("ok"); }
    return { n: Q && Q.items.length, boxes: boxes.length, pick }; });
  rec("Guide: checks after the explanation parts; multiple choice answers with feedback", g.n > 10 && g.boxes >= 5 && g.pick === true, JSON.stringify(g));
  rec("No page errors", !H.errs.length, H.errs.join(" | "));
  await H.close(); console.log(R.filter(Boolean).length + "/" + R.length + " passed"); process.exit(R.every(Boolean) ? 0 : 1);
})();
