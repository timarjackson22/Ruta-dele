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
  rec("Level chips filter the list (C1)", await p.evaluate(() => { const L = [...document.querySelectorAll(".syrow .sylv")].map((x) => x.textContent); return L.length > 5 && L.every((x) => x === "C1"); }));
  await p.click('[data-act="syn-lv"][data-v="all"]'); await p.click('[data-act="syn-pos"][data-v="verb"]'); await H.wait(300);
  const nav = await p.evaluate(() => ({ verbs: [...document.querySelectorAll(".syrow")].every((r) => r.classList.contains("p-verb")), n: document.querySelectorAll(".syrow").length, az: document.querySelectorAll("#syn-az button").length, heads: document.querySelectorAll(".syn-h").length, sticky: getComputedStyle(document.getElementById("syn-az")).position }));
  rec("Kind chips filter (verbs only) and the A–Z bar jumps to each letter group (sticky)", nav.verbs && nav.n > 50 && nav.az === nav.heads && nav.az > 10 && nav.sticky === "sticky", JSON.stringify(nav));
  await p.click('[data-act="syn-pos"][data-v="all"]'); await H.wait(200);
  const row = await p.evaluate(() => { const r = document.querySelector(".syrow"), b = r.querySelector(".sybody"), hid = getComputedStyle(b).display === "none"; r.querySelector(".sy-en").click(); return { hid, shown: getComputedStyle(b).display !== "none" }; });
  const ra0 = await p.evaluate(() => ({ spot: !!document.getElementById("syn-spot"), ring: !!document.querySelector(".syn-ring") }));
  rec("Rows open on tap; no word spotlight; progress ring shown", row.hid && row.shown && !ra0.spot && ra0.ring, JSON.stringify([row, ra0]));
  await p.evaluate(() => scrollTo(0, 0)); await p.click('[data-act="syn-ra"]'); await H.wait(2500);
  const ra = await p.evaluate(() => { const st = window.__synRa(), r = document.querySelector(".syrow.on"); return { st, lit: r && r.dataset.w, open: r && r.classList.contains("open"), bar: !!document.getElementById("syn-player"), tab: getComputedStyle(document.querySelector(".tabbar") || document.body).display }; });
  const sq = ra.st.seq.join(" | ");
  rec("Read the list aloud: word in Spanish, meaning in English, then its synonyms and antonyms; the row is lit and opened; player at the bottom, no tab bar", ra.st.on && ra.lit === ra.st.w && ra.open && ra.bar && /^es:[^|]+ \| en:/.test(sq) && /Sinónimos:|Antónimos:/.test(sq) && ra.tab === "none", JSON.stringify(ra).slice(0, 400));
  const i0 = ra.st.i; await p.click('[data-act="syn-ra-next"]'); await H.wait(300); const i1 = await p.evaluate(() => window.__synRa().i);
  const tgt = await p.evaluate(() => document.querySelectorAll(".syrow")[8].dataset.w); await p.click('.syrow[data-w="' + tgt + '"] .sy-en'); await H.wait(300);
  const jump = await p.evaluate(() => ({ w: window.__synRa().w, lit: (document.querySelector(".syrow.on") || {}).dataset }));
  await p.click('[data-act="syn-ra-play"]'); await H.wait(200); const paused = await p.evaluate(() => window.__synRa().paused);
  await p.click('[data-act="syn-ra-x"]'); await H.wait(200); const off = await p.evaluate(() => ({ on: window.__synRa().on, bar: !!document.getElementById("syn-player"), lit: !!document.querySelector(".syrow.on") }));
  rec("Reader: Next moves on, tapping a row jumps there, Pause pauses, ✕ stops and removes the player", i1 === i0 + 1 && jump.w === tgt && jump.lit && jump.lit.w === tgt && paused === 1 && !off.on && !off.bar && !off.lit, JSON.stringify([i0, i1, tgt, jump.w, paused, off]));
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
  const res = await p.evaluate(() => ({ over: window.__sy.pr().over, g: window.__sy.pr().fb.g, back: (document.querySelector("#tutor .syback") || {}).innerText, next: !!document.querySelector('#tutor .prnextbar [data-act="pr-next"]'), grades: document.querySelectorAll('#tutor [data-act="sy-grade"], #tutor .syg').length, form: !!document.querySelector("#pr-form") }));
  rec("Right on the second try → Hard; the card turns over with the answer and the other words", res.over && res.g === 2 && res.back && (want.length < 2 || res.back.includes(want[0])), JSON.stringify(res));
  rec("Then one big Next, no grade buttons (Profe decides in the background), no answer box (mic off)", res.next && res.grades === 0 && !res.form, JSON.stringify(res));
  const rg = await p.evaluate((k) => { const c = window.__sy.st().c[k]; return Math.round((c.d - Date.now()) / 60e3); }, it.k);
  rec("Two tries on a new card → back in 10 minutes", rg === 10, rg);
  // right on the third try = Again (back in the same session); first try = Good (tomorrow)
  const t3 = await p.evaluate(() => { const P = window.__sy.pr(); P.relearn = []; window.__sy.next(); const c = P.it, w = (c.t === "s" ? c.e.syn : c.e.ant); window.__sy.answer("qqq"); window.__sy.answer("zzz"); window.__sy.answer(w[0]); return { g: P.fb.g, ok: P.fb.ok, back: P.relearn.some((x) => x.k === c.k) }; });
  rec("Right only on the third try → Again: it comes back this session", t3.ok && t3.g === 1 && t3.back, JSON.stringify(t3));
  const t1 = await p.evaluate(() => { const P = window.__sy.pr(); P.relearn = []; window.__sy.next(); const c = P.it, w = (c.t === "s" ? c.e.syn : c.e.ant); window.__sy.answer(w[0]); const st = window.__sy.st().c[c.k]; return { g: P.fb.g, h: Math.round((st.d - Date.now()) / 3600e3) }; });
  rec("Right first time → Good: back tomorrow", t1.g === 3 && t1.h === 24, JSON.stringify(t1));
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
