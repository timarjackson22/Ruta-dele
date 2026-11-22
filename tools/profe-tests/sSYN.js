// v281 — Library › Synonyms & antonyms and Profe › Practice › Synonyms (flashcard look, any one right word, clues, every synonym /
// antonym shown after, Anki-style spaced repetition from how hard it was, learner can change the grade, 20 new cards a day).
const { open } = require("./h.js");
(async () => {
  const R = []; const rec = (n, ok, i) => { R.push(!!ok); console.log((ok ? "PASS " : "FAIL ") + n + (ok ? "" : "  " + String(i || "").slice(0, 300))); };
  const H = await open({ hash: "#biblioteca", noOpen: true }); const p = H.p;
  // Library
  rec("Library has a Synonyms & antonyms tile", await p.evaluate(() => !!document.querySelector('a[href="#sinonimos"]')));
  await p.evaluate(() => { document.body.classList.remove("tutor-open"); location.hash = "#sinonimos"; }); await H.wait(700);
  const lib = await p.evaluate(() => ({ rows: document.querySelectorAll(".syrow").length, words: window.__sy.words(), chips: document.querySelectorAll(".syrow .sychip").length }));
  rec("The page lists every word with its synonyms and antonyms (" + lib.words + " words)", lib.rows === lib.words && lib.words >= 280 && lib.chips > lib.words * 4, JSON.stringify(lib));
  await p.fill("#syn-q", "enorme"); await H.wait(300);
  const found = await p.evaluate(() => [...document.querySelectorAll(".syrow .syh .head")].map((x) => x.textContent));
  rec("Search finds words through their synonyms («enorme» → grande, pequeño…)", found.includes("grande") && found.includes("pequeño"), found.join(","));
  await p.fill("#syn-q", ""); await p.click('[data-act="syn-lv"][data-v="c1"]'); await H.wait(300);
  rec("Level chips filter the list (C1)", await p.evaluate(() => [...document.querySelectorAll(".syn-h")].map((x) => x.textContent.slice(0, 2)).join() === "C1"));
  // answer checking
  const F = await p.evaluate(() => { const f = window.__sy.find; return {
    plain: f("enorme", ["enorme", "amplio"], "adj"), gender: f("contenta", ["contento", "alegre"], "adj"), plural: f("son alegres", ["contento", "alegre"], "adj"), accentless: f("rapido", ["rápido", "veloz"], "adj"),
    refl: f("aproximar", ["aproximarse", "arrimarse"], "verb"), phrase: f("más tarde", ["luego", "más tarde"], "adv"), wrong: f("triste", ["contento", "alegre"], "adj") }; });
  rec("Any one right word counts: plain, other gender, plural in a sentence, no accents, reflexive without «se», a phrase", F.plain === "enorme" && F.gender === "contento" && F.plural === "alegre" && F.accentless === "rápido" && F.refl === "aproximarse" && F.phrase === "más tarde" && F.wrong === null, JSON.stringify(F));
  // spaced repetition maths (SM-2)
  const M = await p.evaluate(() => { const P = window.__sy.plan, W = window.__sy.when; const rv = { e: 2.5, i: 4, r: 3, l: 0 };
    return { n1: W(P(null, 1).ms), n2: W(P(null, 2).ms), n3: W(P(null, 3).ms), n4: W(P(null, 4).ms), r2: P(rv, 2).c.i, r3: P(rv, 3).c.i, r4: P(rv, 4).c.i, r1: P(rv, 1).c, e1: P(rv, 1).c.e }; });
  rec("New card: Again 1 min · Hard 10 min · Good 1 day · Easy 4 days", M.n1 === "1 min" && M.n2 === "10 min" && M.n3 === "1 day" && M.n4 === "4 days", JSON.stringify(M));
  rec("Review card (4 days): Hard ×1.2, Good ×ease (10 d), Easy longer; Again = lapse, ease −0.2, back in 10 min", M.r2 === 4.8 && M.r3 === 10 && M.r4 > 10 && M.r1.i === 0 && M.r1.l === 1 && Math.abs(M.e1 - 2.3) < 1e-9, JSON.stringify(M));
  // Profe practice
  await p.evaluate(() => { location.hash = "#inicio"; }); await H.wait(400);
  await p.evaluate(() => { document.body.classList.add("tabs-peek"); document.querySelector('[data-act="t-open"]').click(); }); await H.wait(600);
  rec("Profe's practice icons include Synonyms", await p.evaluate(() => !!document.querySelector('#tutor [data-act="pr-syn"] .pa-sy')));
  await p.evaluate(() => document.querySelector('#tutor [data-act="pr-lvl"][data-v="a1"]').click()); await H.wait(200);
  await p.evaluate(() => document.querySelector('#tutor [data-act="pr-syn"]').click()); await H.wait(900);
  const card = await p.evaluate(() => ({ tag: (document.querySelector("#tutor .sytag") || {}).textContent, word: (document.querySelector("#tutor .syword") || {}).textContent, it: window.__sy.pr().it && window.__sy.pr().it.k }));
  rec("A word appears like a flashcard with SINÓNIMO / ANTÓNIMO", /Sinónimo|Antónimo/.test(card.tag || "") && card.word && card.it, JSON.stringify(card));
  const said = (await H.tts()).map((e) => e.text).join(" | ");
  rec("Profe asks it aloud («Dime un sinónimo/antónimo de «…»»)", /Dime un (sinónimo|antónimo) de /.test(said), said.slice(-200));
  // a wrong answer, then a clue, then the right one
  const it = await p.evaluate(() => { const c = window.__sy.pr().it; return { k: c.k, t: c.t, w: c.e.w, syn: c.e.syn, ant: c.e.ant }; });
  const want = it.t === "s" ? it.syn : it.ant, other = it.t === "s" ? it.ant : it.syn;
  await p.evaluate((s) => window.__sy.answer(s), other[0] || "zzzz"); await H.wait(300);
  const fb1 = await p.evaluate(() => document.querySelector("#tutor .prbox.bad") && document.querySelector("#tutor .prbox.bad").innerText);
  rec("A word of the other kind is named as such, with a first-letter clue", fb1 && (other.length ? /is an antonym|is a synonym/.test(fb1) : true) && /_{2,}/.test(fb1), fb1);
  await p.evaluate((s) => window.__sy.answer(s), want[want.length - 1]); await H.wait(400);
  const res = await p.evaluate(() => ({ over: window.__sy.pr().over, g: window.__sy.pr().fb.g, back: (document.querySelector("#tutor .syback") || {}).innerText, next: !!document.querySelector('#tutor .prnextbar [data-act="pr-next"]'), grades: document.querySelectorAll("#tutor .syg").length, form: !!document.querySelector("#pr-form") }));
  rec("Right on the second try → Hard; the card turns over with the answer and the other words", res.over && res.g === 2 && res.back && (want.length < 2 || res.back.includes(want[0])), JSON.stringify(res));
  rec("Then one big Next, the four grade buttons, no answer box (mic off)", res.next && res.grades === 4 && !res.form, JSON.stringify(res));
  await p.click('#tutor [data-act="sy-grade"][data-g="4"]'); await H.wait(200);
  const rg = await p.evaluate((k) => { const c = window.__sy.st().c[k]; return { g: window.__sy.pr().fb.g, days: Math.round((c.d - Date.now()) / 864e5) }; }, it.k);
  rec("The learner can change the grade (Easy → back in 4 days)", rg.g === 4 && rg.days === 4, JSON.stringify(rg));
  // Again comes back in the same session after three other cards
  await p.click('#tutor [data-act="pr-next"]'); await H.wait(500);
  const k1 = await p.evaluate(() => window.__sy.pr().it.k);
  await p.evaluate(() => document.querySelector('#tutor [data-act="sy-show"]').click()); await H.wait(300);
  const g1 = await p.evaluate(() => window.__sy.pr().fb.g);
  const order = []; for (let i = 0; i < 5; i++) { await p.evaluate(() => window.__sy.next()); await H.wait(150); const c = await p.evaluate(() => window.__sy.pr().it); order.push(c.k); await p.evaluate((w) => window.__sy.answer(w), (await p.evaluate(() => { const c = window.__sy.pr().it; return (c.t === "s" ? c.e.syn : c.e.ant)[0]; }))); await H.wait(150); }
  rec("«Show the answer» = Again, and the card comes back after three other cards", g1 === 1 && order.indexOf(k1) === 3, k1 + " → " + order.join(", "));
  // daily cap of new cards
  const cap = await p.evaluate(() => { const s = window.__sy.st(); s.nn = 20; s.cap = 0; const P = window.__sy.pr(); P.relearn = []; window.__sy.next(); return { it: !!window.__sy.pr().it, more: !!document.querySelector('#tutor [data-act="sy-more"]') }; });
  rec("After 20 new cards a day (and nothing due) Profe stops with «Learn 10 more new words»", !cap.it && cap.more, JSON.stringify(cap));
  await p.click('#tutor [data-act="sy-more"]'); await H.wait(300);
  rec("…which brings new cards again", await p.evaluate(() => !!window.__sy.pr().it));
  // due cards come first
  const due = await p.evaluate(() => { const s = window.__sy.st(); const k = "feliz|a"; s.c[k] = { e: 2.5, i: 3, r: 2, l: 0, d: Date.now() - 1000 }; const P = window.__sy.pr(); P.relearn = []; P.it = null; window.__sy.next(); return window.__sy.pr().it.k; });
  rec("A card that is due comes before new cards", due === "feliz|a", due);
  rec("No page errors", !H.errs.length, H.errs.join(" | "));
  await H.close();
  const ok = R.filter(Boolean).length; console.log(ok === R.length ? "ALL " + R.length + " PASS" : (R.length - ok) + " FAILED of " + R.length);
  process.exit(ok === R.length ? 0 : 1);
})().catch((e) => { console.log("CRASH", e.message); process.exit(1); });
