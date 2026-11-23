// v293 — Topic mastery (#dominio): every graded answer reports its topic (lessons, Check yourself, quick drill, practice, exams,
// flashcards, Profe's practice, conversation corrections); mastery per topic, «Work on these next», Home / Progress entries.
const { open } = require("./h.js");
(async () => {
  const R = []; const rec = (n, ok, i) => { R.push(!!ok); console.log((ok ? "PASS " : "FAIL ") + n + (ok ? "" : "  " + String(i || "").slice(0, 300))); };
  const H = await open({ hash: "#inicio", noOpen: true }); const p = H.p;
  const list = () => p.evaluate(() => window.__tmList().map((t) => ({ k: t.k, n: t.t.n, ok: t.t.ok, m: t.m, st: t.status, name: t.name, href: t.href, s: Object.keys(t.t.s) })));
  rec("The tracker is loaded and starts empty", await p.evaluate(() => typeof window.__tm === "function" && window.__tmList().length === 0));
  // topic keys from the activities
  const keys = await p.evaluate(() => ({ pret: __tmTense("pret"), subj: __tmTense("subj"), se: __tmRule("ser-estar"), g: __tmRule("gustar"), x: __tmRule("zzz"),
    c1: __tmCard("a1", "Unidad 3"), c2: __tmCard("w2500", "#5 most used"), c3: __tmCard("u-123", "x"), c4: __tmCard("visual", "La cara") }));
  rec("Activities map to topics (tenses → guides, corrections → guides, level-deck cards → their lesson)", keys.pret === "guia-pasados" && keys.subj === "guia-subjuntivo" && keys.se === "guia-ser-estar" && keys.g === "guia-reflexivos-gustar" && keys.x === "talk" && keys.c1 === "a1-u3" && keys.c2 === "dk:w2500" && keys.c3 === "dk:mine" && keys.c4 === "dk:visual:La cara", JSON.stringify(keys));
  // quick drill: a match exercise + one embedded skill question
  await p.evaluate(() => { location.hash = "#drill"; }); await H.wait(1500);
  for (let i = 0; i < 5; i++) { await p.click(`#app [data-act=dr-m][data-side=l][data-i="${i}"]`); await H.wait(60); await p.click(`#app [data-act=dr-m][data-side=r][data-i="${i}"]`); await H.wait(60); }
  await H.wait(300); let L = await list();
  rec("Quick drill: a matched set counts for that level's vocabulary", L.some((t) => t.k === "sk-a1-words" && t.n === 1 && t.ok === 1 && t.s.includes("drill")), JSON.stringify(L));
  // lesson Check yourself (skill drills)
  await p.evaluate(() => { location.hash = "#ejercicios/a1-u2/1"; }); await H.wait(1500);
  for (let i = 0; i < 8; i++) { await p.evaluate(() => { const A = [...document.querySelectorAll("#app [data-act]")]; const o = A.find((x) => /^sk-(pick|o)/.test(x.dataset.act) && !x.disabled) || A.find((x) => /^sk-(skip|reveal|show)/.test(x.dataset.act)); if (o) o.click(); }); await H.wait(250); await p.evaluate(() => { const s = [...document.querySelectorAll("#app [data-act]")].find((x) => /^sk-next/.test(x.dataset.act)); s && s.click(); }); await H.wait(250); if (await p.evaluate(() => window.__tmList().some((t) => t.k === "a1-u2"))) break; }
  L = await list(); rec("Check yourself answers count for the lesson (a1-u2)", L.some((t) => t.k === "a1-u2" && t.n >= 1 && /Saludos/.test(t.name)), JSON.stringify(L));
  // flashcards
  await p.evaluate(() => { location.hash = "#repaso-a1"; }); await H.wait(1200); await p.click("[data-act='sr-flip']"); await H.wait(300);
  await p.evaluate(() => { const r = document.querySelector("[data-act='sr-rate'][data-e='1']"); r.dataset.pc = "1"; r.click(); }); await H.wait(300);
  L = await list(); rec("Flashcards: «Again» counts as a miss for the card's lesson", L.some((t) => /^a1-u\d+$/.test(t.k) && t.s.includes("cards") && t.ok < t.n), JSON.stringify(L));
  // synthetic history → mastery and recommendations
  await p.evaluate(() => { const r = (k, n, ok, src) => { for (let i = 0; i < n; i++) window.__tm(k, i < ok, src, "ejemplo " + i); };
    r("guia-ser-estar", 9, 3, "talk"); r("exam-b1-lectura", 12, 5, "exam"); r("a1-u1", 10, 10, "lesson"); r("syn", 2, 0, "profe"); r("guia-subjuntivo", 6, 2, "profe"); });
  const recs = await p.evaluate(() => window.__tmRecs(9).map((x) => x.k));
  rec("Recommendations: weak topics with enough answers, weakest first; strong and too-new topics left out", recs.includes("guia-ser-estar") && recs.includes("exam-b1-lectura") && recs.includes("guia-subjuntivo") && !recs.includes("a1-u1") && !recs.includes("syn"), recs.join(","));
  L = await list(); const st = Object.fromEntries(L.map((t) => [t.k, t.st]));
  rec("Status per topic (strong / weak / new)", st["a1-u1"] === "strong" && st["guia-ser-estar"] === "weak" && st["syn"] === "new", JSON.stringify(st));
  rec("Every tracked topic has a readable name and a link", L.every((t) => t.name && !/^[a-z0-9-]+$/.test(t.name) && /^#/.test(t.href)), JSON.stringify(L.map((t) => [t.k, t.name, t.href])));
  // the page
  await p.evaluate(() => { location.hash = "#dominio"; }); await H.wait(900);
  const pg = await p.evaluate(() => ({ h: (document.querySelector("#app h1") || {}).textContent, recs: [...document.querySelectorAll(".tmrec")].map((x) => x.getAttribute("href")), rows: document.querySelectorAll(".tmrow").length, wide: document.documentElement.scrollWidth > innerWidth + 1 }));
  rec("#dominio: «Work on these next» cards link to the lesson/guide/exam, then every topic", pg.recs.length >= 3 && pg.recs.includes("#guia-ser-estar") && pg.recs.includes("#examenes") && pg.rows >= 6 && !pg.wide, JSON.stringify(pg));
  await p.click("[data-act=tm-lv][data-v=a1]"); await H.wait(300);
  rec("Level chips filter the topic list", await p.evaluate(() => { const r = [...document.querySelectorAll(".tmrow")].map((x) => x.getAttribute("href")); const h = [...document.querySelectorAll(".tmlvs ~ .tmh, .tmlvs ~ * .tmh")].map((x) => x.textContent); return r.length >= 1 && r.every((x) => /^#a1-|^#guia-|^#drill$|^#repaso/.test(x)) && h.every((x) => x === "A1") && !r.includes("#examenes"); }));
  await p.evaluate(() => { location.hash = "#inicio"; }); await H.wait(900);
  rec("Home «Today» shows Topics to work on", await p.evaluate(() => [...document.querySelectorAll('a[href="#dominio"]')].some((a) => /Topics to work on/.test(a.textContent))));
  rec("Home «Today» always has a Progress row", await p.evaluate(() => [...document.querySelectorAll('a[href="#progreso"]:not(.hm-chip)')].some((a) => /Progress/.test(a.textContent))));
  await p.evaluate(() => { location.hash = "#progreso"; }); await H.wait(900);
  rec("Progress links to Topic mastery", await p.evaluate(() => !!document.querySelector('.tm-link[href="#dominio"]')));
  rec("No page errors", !H.errs.length, H.errs.join(" | "));
  await H.close();
  const ok = R.filter(Boolean).length; console.log(ok === R.length ? "ALL " + R.length + " PASS" : (R.length - ok) + " FAILED of " + R.length);
  process.exit(ok === R.length ? 0 : 1);
})().catch((e) => { console.log("CRASH", e.message); process.exit(1); });
