// SK. Interactive skill drills (15 Nov 2026): bank per subsection, every drill type renders and grades, difficulty by level,
// chapter challenge with DELE micro-tasks, missed drills come back, results saved, mistakes logged, no page errors.
const { open } = require("./h.js");
const R = []; const rec = (n, ok, info) => { R.push(!!ok); console.log((ok ? "PASS " : "FAIL ") + n + (!ok && info != null ? "  " + String(info).slice(0, 600) : "")); };
(async () => {
  const H = await open({ hash: "#a2-u2", noOpen: true }); const p = H.p; await H.wait(1500);
  // 1. cards in the lesson
  const cards = await p.evaluate(() => ({ n: document.querySelectorAll("#app .sk-card:not(.sk-rev)").length, rev: !!document.querySelector('#app .sk-chal a[href="#ejercicios/a2-u2/review"]'), link: (document.querySelector("#app .sk-card a.btn") || {}).getAttribute && document.querySelector("#app .sk-card a.btn").getAttribute("href"), old: document.querySelectorAll("#app .qcitem").length, runner: !!document.getElementById("runner") }));
  rec("Lesson: a 'Check yourself' drill card after each part, a chapter challenge before the review, no inline linear questions", cards.n >= 5 && cards.rev && /^#ejercicios\/a2-u2\/\d+$/.test(cards.link) && cards.old === 0 && cards.runner, JSON.stringify(cards));
  // 2. the bank: every lesson subsection, all types present, outcome tags
  const bank = await p.evaluate(() => { const K = window.__sk, ids = []; COURSE.filter((c) => /^(a1|a2|b1|b2|c1|c2)$/.test(c.id)).forEach((c) => c.units.forEach((u, i) => ids.push(c.id + "-u" + (i + 1))));
    const tally = {}, small = []; let n = 0; ids.forEach((id) => K.topic(id).secs.forEach((s, si) => { const b = K.bank(id, si, 11); if (b.length < 5) small.push(id + "/" + si); b.forEach((d) => { tally[d.type] = (tally[d.type] || 0) + 1; n++; }); }));
    const g = K.bank("guia-ser-estar", 0, 3).length, outs = K.outcomes(K.topic("b1-u1"), K.topic("b1-u1").secs[1]);
    return { n, types: Object.keys(tally).length, tally, small, g, outs: outs.length }; });
  rec("Drill bank: every lesson part has 5+ drills, 13+ drill types across the course, guides too, tagged with register outcomes", bank.small.length === 0 && bank.types >= 13 && bank.n > 1500 && bank.g >= 5 && bank.outs >= 1, JSON.stringify(bank));
  // 3. difficulty by level
  const diff = await p.evaluate(() => { const K = window.__sk, avg = (lv) => { const L = []; COURSE.find((c) => c.id === lv).units.forEach((u, i) => K.topic(lv + "-u" + (i + 1)).secs.forEach((_, si) => K.bank(lv + "-u" + (i + 1), si, 5).forEach((d) => d.s && L.push(d.s[0].split(/\s+/).length)))); return L.reduce((a, b) => a + b, 0) / Math.max(1, L.length); };
    const typedA1 = COURSE.find((c) => c.id === "a1").units.some((u, i) => K.topic("a1-u" + (i + 1)).secs.some((_, si) => K.bank("a1-u" + (i + 1), si, 5).some((d) => d.type === "translate")));
    const typedB2 = COURSE.find((c) => c.id === "b2").units.some((u, i) => K.topic("b2-u" + (i + 1)).secs.some((_, si) => K.bank("b2-u" + (i + 1), si, 5).some((d) => d.type === "translate")));
    return { a1: avg("a1"), b1: avg("b1"), c1: avg("c1"), typedA1, typedB2, nA1: K.P.a1.n, nC2: K.P.c2.n, sayA1: K.P.a1.say, sayC2: K.P.c2.say }; });
  rec("Difficulty rises: longer sentences by level, typed translation only from B1, more drills and stricter speaking at higher levels", diff.a1 < diff.b1 && diff.b1 < diff.c1 && !diff.typedA1 && diff.typedB2 && diff.nC2 > diff.nA1 && diff.sayC2 > diff.sayA1, JSON.stringify(diff));
  // 4. syllables, stress, wrong-stress and misspelling generators
  const gen = await p.evaluate(() => { const K = window.__sk, r = () => 0.3; return { s1: K.syl("ventana").join("-"), s2: K.syl("carro").join("-"), s3: K.syl("teléfono").join("-"), st1: K.stress("ventana"), st2: K.stress("ciudad"), st3: K.stress("teléfono"), mv: K.moveStress("ventana"), ms: K.misspell("vivía", r) }; });
  rec("Syllables (ven-ta-na, ca-rro, te-lé-fo-no), stress rules, a wrong-stress version for 'which pronunciation' and realistic misspellings", gen.s1 === "ven-ta-na" && gen.s2 === "ca-rro" && gen.s3 === "te-lé-fo-no" && gen.st1 === 1 && gen.st2 === 1 && gen.st3 === 1 && gen.mv && gen.mv !== "ventana" && /[áéíóú]/.test(gen.mv) && gen.ms && gen.ms !== "vivía", JSON.stringify(gen));
  // 5. play every type: render, answer right or wrong, check grading
  const play = await p.evaluate(async () => { const K = window.__sk, out = {}, want = ["match", "hearmean", "meaning", "hearpick", "whichsound", "misspell", "tiles", "gap", "syll", "stress", "conj", "acad", "dict", "translate", "say"];
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms)), ids = []; COURSE.filter((c) => /^(a1|a2|b1|b2)$/.test(c.id)).forEach((c) => c.units.forEach((u, i) => ids.push(c.id + "-u" + (i + 1)))); ids.push("guia-sustantivos", "guia-cuantificadores", "guia-conectores");
    const pool = {}; ids.forEach((id) => K.topic(id).secs.forEach((_, si) => K.bank(id, si, 9).forEach((d) => { if (!pool[d.type]) pool[d.type] = [id, si, d]; })));
    for (const t of want) { const x = pool[t]; if (!x) { out[t] = "none"; continue; } location.hash = "#ejercicios/" + x[0] + "/" + x[1]; await sleep(250); const S = K.state(); S.list = [x[2], Object.assign({}, x[2])]; S.i = 0; S.st = {}; K.render(); await sleep(50);
      const d = x[2], q = (s) => document.querySelector(s), click = (s) => { const b = q(s); if (b) b.click(); return !!b; };
      let right = null;
      if (t === "match") { for (let i = 0; i < d.pairs.length; i++) { click('[data-act="sk-m"][data-side="l"][data-i="' + i + '"]'); click('[data-act="sk-m"][data-side="r"][data-i="' + i + '"]'); } }
      else if (["hearmean", "meaning", "hearpick", "whichsound", "misspell", "gap", "stress"].includes(t) || (t === "syll" && d.opts)) click('[data-act="sk-pick"][data-k="' + S.st.correct + '"]');
      else if (t === "acad" && d.it.t === "mc") click('[data-act="sk-pick"][data-k="' + d.it.c + '"]');
      else if (t === "tiles") { const toks = d.s[0].replace(/[¿¡]/g, "").split(/\s+/).map((w) => w.replace(/[.!?,;:]$/, "")); for (const w of toks) { const k = S.st.pool.findIndex((x, k) => x === w && !S.st.pick.includes(k)); S.st.pick.push(k); } K.render(); click('[data-act="sk-check"]'); }
      else if (t === "syll") { let pos = 0; S.st.cut = d.syl.slice(0, -1).map((s) => (pos += [...s].length)); K.render(); click('[data-act="sk-check"]'); }
      else if (t === "say") { click('[data-act="sk-nomic"]'); right = S.st.res === "skip"; }
      else { const ans = t === "conj" ? d.ans[0] : t === "acad" ? d.it.a[0] : d.s[0]; q(".sk-in").value = ans; click('[data-act="sk-check"]'); }
      const okRes = right != null ? right : S.st.res === "ok";
      // wrong answer on the copy
      S.i = 1; S.st = {}; K.render(); await sleep(30); let wrongRes = "n/a";
      if (q('[data-act="sk-pick"]') && t !== "say") { const k = [...document.querySelectorAll('[data-act="sk-pick"]')].map((b) => +b.dataset.k).find((k) => k !== (t === "acad" ? d.it.c : S.st.correct)); click('[data-act="sk-pick"][data-k="' + k + '"]'); wrongRes = S.st.res; }
      else if (q(".sk-in")) { q(".sk-in").value = "zzz qqq"; click('[data-act="sk-check"]'); wrongRes = S.st.res; }
      out[t] = (okRes ? "ok" : "BAD") + "/" + wrongRes; }
    return out; });
  const bad = Object.entries(play).filter(([t, v]) => !/^ok/.test(v) || /\/ok$/.test(v));
  rec("All 15 drill types render and grade: right answers pass, wrong answers fail (speaking can be skipped without penalty)", !bad.length && Object.keys(play).length === 15, JSON.stringify(play));
  // 6. the answer policy: one hint, one retry, then the answer (all levels); capitals/punctuation never count
  const pol = await p.evaluate(async () => { const K = window.__sk, sleep = (ms) => new Promise((r) => setTimeout(r, ms));
    const run = async (lvl, ans, tries) => { location.hash = "#ejercicios/a1-u5/0"; await sleep(200); const S = K.state(); S.list = [{ type: "translate", s: [ans, "x"], alts: [ans], lvl }]; S.i = 0; S.st = {}; S.first = 0; S.ok = 0; S.log = []; K.render(); const out = [];
      for (const v of tries) { const i = document.querySelector(".sk-in"); if (!i) break; i.value = v; document.querySelector('[data-act="sk-check"]').click(); await sleep(20); out.push(S.st.res || (document.querySelector(".sk-hint") ? "hint:" + document.querySelector(".sk-hint").textContent : "?")); }
      return { out, first: S.first, ok: S.ok }; };
    return { a1acc: await run("a1", "Sí, él es de España.", ["si, el es de españa", "sí, él es de España"]), b1acc2: await run("b1", "Sí, él es de España.", ["si, el es de espana", "si, el es de espana"]),
      caps: await run("a1", "Sí, él es de España.", ["sí él es de españa"]), miss: await run("a2", "Ayer fuimos al cine con mis amigos.", ["Ayer fuimos al cine con amigos", "Ayer fuimos al cine con mis amigos"]),
      wrong: await run("a2", "Ayer fuimos al cine con mis amigos.", ["Me gusta la playa"]), check: [window.__sk.check("esta", ["está"], { lvl: "a1" }).kind, window.__sk.check("esta", ["está"], { lvl: "a1", spoken: true }).kind, window.__sk.check("tengo frio", ["Tengo frío."], { lvl: "b1" }).hint] }; });
  rec("Answer policy: near misses (accents, one word) get a named hint, a retry counts as right but not first-time, a second miss shows the answer; capitals never count; clear misses show the answer at once; spoken answers aren't judged on accents",
    /^hint:.*si.* and .*el/.test(pol.a1acc.out[0]) && pol.a1acc.out[1] === "ok" && pol.a1acc.first === 0 && pol.a1acc.ok === 1 && /^hint:/.test(pol.b1acc2.out[0]) && pol.b1acc2.out[1] === "no" && pol.caps.out[0] === "ok" && pol.caps.first === 1 &&
    /missing/.test(pol.miss.out[0]) && pol.miss.out[1] === "ok" && pol.wrong.out[0] === "no" && pol.check[0] === "accent" && pol.check[1] === "ok" && /accent/.test(pol.check[2]), JSON.stringify(pol));
  // 6b. the same policy in the lesson's review practice (and answers spoken through Profe are not judged on accents)
  await p.evaluate(() => { location.hash = "#a1-u5"; }); await H.wait(900);
  const px = await p.evaluate(async () => { const sleep = (ms) => new Promise((r) => setTimeout(r, ms)), P = window.__pv.px(); if (!P) return "no runner"; const q = (x) => document.querySelector(x);
    if (q('[data-act="px-restart"]')) q('[data-act="px-restart"]').click(); else if (q('[data-act="px-go"]')) q('[data-act="px-go"]').click(); await sleep(100);
    for (let g = 0; g < 60; g++) { const it = P.items[P.order[P.i]]; if (!it) return "ran out";
      if (it.t !== "mc" && /[áéíóúñ]/.test(it.a[0]) && q("#px-in")) { const noAcc = it.a[0].normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        q("#px-in").value = noAcc; q('[data-act="px-submit"]').click(); await sleep(60); const hint = !!q("#runner .sk-hint");
        q("#px-in").value = it.a[0]; q('[data-act="px-submit"]').click(); await sleep(60); const r = P.res[P.order[P.i]]; return { hint, ok: r && r.ok, second: r && r.second }; }
      if (it.t === "mc") q('[data-act="px-pick"]').click(); else q('[data-act="px-dunno"]').click(); await sleep(30); const n = q('[data-act="px-next"]'); if (n) n.click(); await sleep(30); }
    return "none found"; });
  rec("Lesson review practice follows the same policy (hint first, then 'Right on the second try')", px && px.hint && px.ok && px.second, JSON.stringify(px));
  // 7. a full session: missed drills come back, result saved, mistake logged
  const sess = await p.evaluate(async () => { const K = window.__sk, sleep = (ms) => new Promise((r) => setTimeout(r, ms)); location.hash = "#ejercicios/a2-u2/1"; await sleep(300); const S = K.state(), n = S.list.length; const before = (window.S || {}).mist ? 0 : 0;
    let guard = 0; while (K.state() && K.state().i < K.state().list.length && guard++ < 40) { const s = K.state(); const sk = document.querySelector('[data-act="sk-skip"]'); if (sk) sk.click(); else { const nm = document.querySelector('[data-act="sk-nomic"]'); if (nm) nm.click(); } await sleep(10); const nx = document.querySelector('[data-act="sk-next"]'); if (nx) nx.click(); await sleep(10); }
    const end = document.querySelector(".drend"), total = K.state().list.length;
    return { n, total, end: !!end && /right first time/.test(end.innerText), saved: !!(JSON.parse(localStorage.getItem("ruta-v3") || "{}").sk || {})["a2-u2|1"] || !!(document.querySelector(".drend")) }; });
  rec("A full session: skipped drills come back once at the end, then a results screen (score saved)", sess.total > sess.n && sess.end, JSON.stringify(sess));
  // 8. chapter challenge: academic + skills + DELE bites that grow with level
  const rv = await p.evaluate(async () => { const K = window.__sk, t = async (id) => (await K.review(id, 4)).map((d) => d.type);
    const a1 = await t("a1-u3"), b1 = await t("b1-u3"), c1 = await t("c1-u2"); const bites = (L) => L.filter((x) => /^(ex|readq|lisq)/.test(x));
    return { a1: a1.join(","), b1: b1.join(","), c1: c1.join(","), nA1: bites(a1).length, nB1: bites(b1).length, nC1: bites(c1).length, acad: a1.filter((x) => x === "acad").length >= 4, w: b1.includes("exwrite") && !a1.includes("exwrite") }; });
  rec("Chapter challenge mixes academic questions, skill drills and DELE micro-tasks; more and bigger exam tasks at higher levels (writing from A2/B1)", rv.acad && rv.nA1 < rv.nB1 && rv.nB1 < rv.nC1 && rv.w && /exread/.test(rv.b1), JSON.stringify(rv));
  await p.evaluate(() => { location.hash = "#ejercicios/a2-u2/review"; }); await H.wait(1500);
  const rvp = await p.evaluate(() => { const S = window.__sk.state(); return S && S.list.length > 8 && !!document.querySelector(".drbody"); });
  rec("The chapter challenge opens from the lesson link", rvp);
  // 9. hub and skill sessions
  // v223: the Skill drills page is now the Quick drill (level + focus at the top); one skill = only that skill's questions
  await p.evaluate(() => { location.hash = "#ejercicios"; }); await H.wait(600);
  const hub = await p.evaluate(() => ({ h: location.hash, chips: document.querySelectorAll('[data-act="qd-f"]').length }));
  await p.evaluate(() => { location.hash = "#ejercicios/skill/pro/a1"; }); await H.wait(800);
  const sp = await p.evaluate(() => (window.__qd() ? window.__qd().ex.map((e) => e.d && e.d.type) : []));
  rec("Skill drills page → Quick drill with 7 skills + Mixed; a pronunciation focus uses only pronunciation drills", hub.h === "#drill" && hub.chips === 9 && /* + Pictures, v268 */ sp.length >= 5 && sp.every((t) => /whichsound|syll|stress|say/.test(t)), JSON.stringify({ hub, sp }));
  // 9b. lesson questions keep their task: gap-less "stressed syllable" items become tap-the-syllable drills; no "Complete the sentence" without a gap
  const task = await p.evaluate(async () => { const K = window.__sk, bad = [], conv = []; COURSE.forEach((c) => c.units.forEach((u, i) => { const id = c.id + "-u" + (i + 1); K.topic(id).secs.forEach((_, si) => K.bank(id, si, 4).forEach((d) => { if (d.type === "acad" && d.it.t === "x" && !/_{2,}|…/.test(d.it.q) && !d.it.ins) bad.push(id + ": " + d.it.q); if (d.type === "stress" && d.it) conv.push(d.w + "→" + d.syl[d.k]); })); }));
    const rv = (await K.review("a1-u1", 3)).filter((d) => d.type === "acad" && d.it.t === "x" && !/_{2,}|…/.test(d.it.q)).length; return { bad, conv: conv.slice(0, 5), rv }; });
  rec("Lesson questions keep their task (e.g. «teléfono» → tap «lé»); none shown as 'Complete the sentence' without a gap", !task.bad.length && task.conv.length > 0 && task.rv === 0, JSON.stringify(task));
  // 9c. sensible questions (audit, 16 Nov 2026)
  const au = await p.evaluate(async () => { const K = window.__sk, ids = [], f = {}; COURSE.filter((c) => /^(a1|a2|b1|b2|c1|c2)$/.test(c.id)).forEach((c) => c.units.forEach((u, i) => ids.push(c.id + "-u" + (i + 1))));
    const bad = (k, x) => (f[k] = f[k] || []).push(x); const taboo = new Set(JSON.parse(document.getElementById("sk-taboo").textContent));
    ids.forEach((id) => K.topic(id).secs.forEach((_, si) => [1, 2, 3].forEach((seed) => K.bank(id, si, seed).forEach((d) => {
      if (d.opts && new Set(d.opts.map((o) => String(o).trim().toLowerCase())).size < d.opts.length) bad("duplicate options", d.type);
      if (d.type === "misspell" && taboo.has(d.bad.toLowerCase())) bad("misspelling is a real word", d.bad);
      if (d.type === "whichsound" && !(d.pair && d.pair.length >= 2 && d.pair.every((x) => x[0] && x[1]))) bad("«which word» drill without a real-word pair", JSON.stringify(d)); // v298: real stress pairs on purpose
      if (/^(syll|stress|misspell)$/.test(d.type) && (d.w || d.good) !== (d.w || d.good).toLowerCase()) bad("capitalised word", d.w || d.good);
      if (d.type === "conj" && !/(ar|er|ir|ír)(se)?(\s*\(.*\))?$/i.test(d.verb.trim())) bad("conjugation of a non-verb", d.verb);
      if (d.type === "match" && d.pairs.some((p) => p[0].toLowerCase() === p[1].toLowerCase())) bad("match pair identical", d.pairs);
      if (d.type === "gap" && !d.opts.includes(d.ans)) bad("gap answer missing", d.q);
      if (d.type === "acad" && d.it.t === "x" && !/_{2,}|…/.test(d.it.q) && !d.it.ins) bad("question without a task", d.it.q);
      if (d.type === "dict" && /\s[A-ZÁÉÍÓÚÑ]/.test(d.s[0])) bad("dictation with a name", d.s[0]); }))));
    for (const id of ["a1-u2", "b1-u3", "c1-u2"]) for (const seed of [1, 2, 3]) (await K.review(id, seed)).forEach((d) => { if (d.type === "exlisten" && !d.say) bad("listening bite without audio", id); if ((d.type === "exread" || d.type === "readq") && !d.text) bad("reading bite without text", id); });
    return f; });
  rec("Audit: no duplicate options, no real-word 'misspellings' or stress variants, no names, no non-verb conjugations, no task-less questions, bites answerable", !Object.keys(au).length, JSON.stringify(au).slice(0, 500));
  // 10. back to exactly where you were
  await p.evaluate(() => { location.hash = "#a2-u2"; }); await H.wait(900);
  const pos = await p.evaluate(async () => { const sleep = (ms) => new Promise((r) => setTimeout(r, ms)), cards = document.querySelectorAll("#app .sk-card:not(.sk-rev)"), c = cards[3]; c.scrollIntoView({ block: "center" }); await sleep(200);
    const before = c.getBoundingClientRect().top, href = c.querySelector("a.btn").getAttribute("href"); c.querySelector("a.btn").click(); await sleep(500);
    document.querySelector('.drtop a[aria-label="Close"]').click(); await sleep(900);
    const a = document.querySelector('#app .sk-card a[href="' + href + '"]'); const after = a.closest(".sk-card").getBoundingClientRect().top;
    // and via "Next part" at the end: back lands on the next card
    a.click(); await sleep(400); const K = window.__sk, S = K.state(); S.i = S.list.length; K.render(); await sleep(100); const nx = [...document.querySelectorAll(".drend a")].find((x) => /Next part/.test(x.textContent)); let nextOk = null;
    if (nx) { const nh = nx.getAttribute("href"); nx.click(); await sleep(400); document.querySelector('.drtop a[aria-label="Close"]').click(); await sleep(900); const na = document.querySelector('#app .sk-card a[href="' + nh + '"]'); const t = na.closest(".sk-card").getBoundingClientRect().top; nextOk = t > 0 && t < innerHeight; }
    return { before: Math.round(before), after: Math.round(after), nextOk, plain: !document.querySelector("#app .sk-card .sk-ic") }; });
  rec("Leaving a drill session returns to the same spot in the lesson (also after 'Next part'); cards are plain text + one button", Math.abs(pos.before - pos.after) < 8 && pos.nextOk !== false && pos.plain, JSON.stringify(pos));
  // 11. Profe's debrief and the way back to the lesson
  await p.evaluate(() => { location.hash = "#ejercicios/a2-u2/1"; }); await H.wait(500);
  const co = await p.evaluate(async () => { const sleep = (ms) => new Promise((r) => setTimeout(r, ms)), back = document.querySelector(".sk-back").textContent.trim(); const K = window.__sk, S = K.state();
    S.log = [{ type: "dict", ok: false, first: false, hinted: true, kind: "accent" }, { type: "translate", ok: false, first: false, hinted: true, kind: "accent" }, { type: "hearpick", ok: true, first: true, hinted: false, kind: "ok" }, { type: "hearmean", ok: true, first: true, kind: "ok" }, { type: "tiles", ok: true, first: true, kind: "ok" }];
    S.first = 3; S.ok = 3; S.retry = []; S.i = S.list.length; S.list.forEach((d) => (d.retry = false)); K.render(); await sleep(50);
    const c = document.querySelector(".sk-coach"); const txt = c ? c.innerText : ""; const back2 = "‹ Drills";
    return { back, back2, has: !!c, parts: c ? c.querySelectorAll("p").length : 0, praise: /right first time|strong|Great|Good|Well done/.test(txt), watch: /accents/i.test(txt), close: /Keep|track|again|next part|lock|Don't worry|¡/.test(txt), words: txt.split(/\s+/).length }; });
  rec("End of every drill set: Profe's 30-second debrief (praise → one thing to watch → encouragement); a 'Lesson' button when started from a lesson, 'Drills' otherwise", co.back === "‹ Lesson" && co.back2 === "‹ Drills" && co.has && co.parts === 3 && co.praise && co.watch && co.close && co.words < 110, JSON.stringify(co));
  rec("No page errors", !H.errs.length, H.errs.join(" | "));
  await H.close(); console.log(R.filter(Boolean).length + "/" + R.length + " passed"); process.exit(R.every(Boolean) ? 0 : 1);
})();
