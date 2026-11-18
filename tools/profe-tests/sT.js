// T. Adaptive translation and conjugation in Profe's Practice tab (round 5, 15 Nov 2026)
const { open } = require("./h.js");
const R = []; const rec = (n, ok, info) => { R.push(!!ok); console.log((ok ? "PASS " : "FAIL ") + n + (!ok && info != null ? "  " + String(info).slice(0, 400) : "")); };
(async () => {
  const H = await open({ hash: "#curso" }); const p = H.p;
  await p.evaluate(async () => { await loadIndexForTest(); }).catch(() => {});
  await p.evaluate(() => new Promise((r) => { const t = setInterval(() => { if (window.__ad) { clearInterval(t); r(); } }, 50); }));
  await p.click('[data-act="t-tab"][data-v="practice"]'); await H.wait(300);
  const opts = await p.evaluate(() => [...document.querySelectorAll("#tutor .papp span")].map((o) => o.textContent).join(" | ") + (document.getElementById("t-prsel") ? " | DROPDOWN" : ""));
  rec("Practice home: app icons for Translate and Verbs, no dropdown", /Translate/.test(opts) && /Verbs/.test(opts) && !/DROPDOWN/.test(opts), opts);
  // start (loads the verb index), then test the engine
  await p.evaluate(() => { const b = document.querySelector("#tutor .prback"); if (b) b.click(); }); await H.wait(200); await p.click('#tutor [data-act="pr-type"][data-v="trans"]'); await p.waitForFunction(() => window.__ad.pr() && window.__ad.pr().it, null, { timeout: 8000 }).catch(() => {});
  const banks = await p.evaluate(() => ["a1", "a2", "b1", "b2", "c1", "c2"].map((lv) => { const B = window.__ad.bank(lv); return [lv, B.length, B.filter((x) => x.dir === "en-es").length, B.filter((x) => x.tags.some((t) => /^v:/.test(t))).length]; }));
  rec("Every level has its own bank (lessons + texts), both directions, tense-tagged", banks.every((b) => b[1] > 150 && b[2] > 40 && b[3] > b[1] * 0.5), JSON.stringify(banks));
  // generator: level-appropriate tenses, and every generated answer passes its own checker
  const gen = await p.evaluate(() => { const out = {}; ["a1", "a2", "b1", "b2", "c1"].forEach((lv) => { const ts = new Set(), bad = []; for (let i = 0; i < 80; i++) { const g = window.__ad.gen(lv, null); g.tags.filter((t) => /^v:|^g:si/.test(t)).forEach((t) => ts.add(t));
      const c = g.dir === "en-es" ? window.__ad.checkEs(g.ans[0], g) : window.__ad.checkEn(g.ans[0], g); if (!c.ok) bad.push(g.src + " → " + g.ans[0] + " " + JSON.stringify(c.issues)); } out[lv] = { ts: [...ts].sort(), bad: bad.slice(0, 3) }; }); return out; });
  rec("Generator, A1: present only", gen.a1.ts.join() === "v:pres", JSON.stringify(gen.a1.ts));
  rec("Generator, A2: past tenses and future, no subjunctive", ["v:pret", "v:impf", "v:fut"].every((t) => gen.a2.ts.includes(t)) && !gen.a2.ts.some((t) => /subj/.test(t)), JSON.stringify(gen.a2.ts));
  rec("Generator, B1 adds conditional and subjunctive; B2 adds imperfect subjunctive and si-clauses", gen.b1.ts.includes("v:cond") && gen.b1.ts.includes("v:subj") && !gen.b1.ts.includes("v:subjRa") && gen.b2.ts.includes("v:subjRa") && gen.b2.ts.includes("g:si"), JSON.stringify([gen.b1.ts, gen.b2.ts]));
  rec("Every generated model answer passes the checker", Object.values(gen).every((g) => !g.bad.length), JSON.stringify(Object.fromEntries(Object.entries(gen).map(([k, v]) => [k, v.bad]))));
  // the Spanish checker names the mistake
  const es = await p.evaluate(() => { const it = (src, ans) => ({ dir: "en-es", src, ans: [ans], tags: [], len: 4 }), C = window.__ad.checkEs, W = window.__ad.why;
    const r = (said, ans) => { const c = C(said, it("", ans)); return { ok: c.ok, types: c.issues.map((x) => x.type), why1: c.issues[0] ? W(c.issues[0], 1) : "", why2: c.issues[0] ? W(c.issues[0], 2) : "", acc: c.accents.length }; };
    return { verb: r("Ayer como en casa", "Ayer comí en casa."), acc: r("Ayer comi en casa", "Ayer comí en casa."), pron: r("Ayer yo comí en casa", "Ayer comí en casa."), serestar: r("Mi hermana es muy cansada", "Mi hermana está muy cansada."), agree: r("La falda es barato", "La falda es barata."), porpara: r("Estudio por el examen", "Estudio para el examen."), miss: r("Voy mercado", "Voy al mercado."), order: r("Tengo un rojo coche", "Tengo un coche rojo.") }; });
  rec("Spanish: wrong tense is named (present for preterite), no answer given on try 1, clue on try 2", es.verb.types[0] === "verb" && /present/.test(es.verb.why1) && /preterite/.test(es.verb.why1) && !/comí/.test(es.verb.why1) && /💡/.test(es.verb.why2), JSON.stringify(es.verb));
  rec("Spanish: a missing accent is accepted and pointed out", es.acc.ok && es.acc.acc === 1, JSON.stringify(es.acc));
  rec("Spanish: an added subject pronoun is fine", es.pron.ok, JSON.stringify(es.pron));
  rec("Spanish: ser/estar, agreement, por/para, a missing word and word order are each identified", es.serestar.types[0] === "serestar" && es.agree.types[0] === "agree" && es.porpara.types[0] === "porpara" && es.miss.types[0] === "missing" && es.order.types[0] === "order", JSON.stringify([es.serestar.types, es.agree.types, es.porpara.types, es.miss.types, es.order.types]));
  const en = await p.evaluate(() => { const it = (src, ans) => ({ dir: "es-en", src, ans: [ans], tags: [], len: 4 }), C = window.__ad.checkEn;
    const r = (said, src, ans) => { const c = C(said, it(src, ans)); return { ok: c.ok, types: c.issues.map((x) => x.type), why: c.issues[0] ? window.__ad.whyEn(c.issues[0], it(src, ans), 1) : "" }; };
    return { tense: r("I eat at home yesterday", "Ayer comí en casa.", "I ate at home yesterday."), ok: r("Yesterday I ate at home", "Ayer comí en casa.", "I ate at home yesterday."), contr: r("She doesn't live near the sea", "Ella no vive cerca del mar.", "She does not live near the sea."), syn: r("We watched a movie", "Vimos una película.", "We watched a film."), miss: r("I bought bread", "Compré pan en la panadería.", "I bought bread at the bakery.") }; });
  rec("English: wrong tense is named and points at the Spanish verb", en.tense.types.includes("entense") && /comí/.test(en.tense.why), JSON.stringify(en.tense));
  rec("English: word order, contractions and synonyms (film/movie) are accepted", en.ok.ok && en.contr.ok && en.syn.ok, JSON.stringify([en.ok, en.contr, en.syn]));
  rec("English: missing meaning is spotted and pointed back to the Spanish word", en.miss.types.includes("enmiss") && /panader/.test(en.miss.why), JSON.stringify(en.miss));
  // the flow: three tries (feedback, clue, answer), then focus on that skill
  await p.evaluate(() => { const PR = window.__ad.pr(); PR.autoMic = false; PR.it = { id: "t1", dir: "en-es", src: "I ate at home yesterday.", ans: ["Ayer comí en casa."], tags: ["v:pret", "d:en-es"], len: 4, ui: 0, note: "Preterite: a finished action." }; PR.tries = 0; PR.fb = null; PR.over = false; window.__ad.st("tr", PR.lv).focus = null; window.__ad.render(); });
  const typeIt = async (t) => { await p.fill("#pr-input", t); await p.press("#pr-input", "Enter"); await H.wait(700); return p.evaluate(() => document.querySelector("#tutor .adwrap").innerText.replace(/\s+/g, " ")); };
  let v1 = await typeIt("Ayer como en casa"); rec("Try 1 wrong: says what's wrong, no clue yet, 2 tries left", /present/.test(v1) && /2 tries left/.test(v1) && !/Clue/.test(v1), v1.slice(0, 400));
  let v2 = await typeIt("Ayer comía en casa"); rec("Try 2 wrong: a clue, one try left", /(Clue|\b[a-záéíóúñ]+_{2,})/.test(v2) && /One more try/.test(v2), v2.slice(0, 400));
  let v3 = await typeIt("Ayer comemos en casa"); rec("Try 3 wrong: the answer is shown", /Ayer comí en casa/.test(v3) && /after three tries/.test(v3), v3.slice(0, 400));
  const f1 = await p.evaluate(() => { const PR = window.__ad.pr(); return window.__ad.st("tr", PR.lv).focus; });
  rec("A miss makes that skill the focus (the preterite)", f1 === "v:pret", f1);
  // the next items practise the same thing
  const nx = await p.evaluate(() => { const out = []; const PR = window.__ad.pr(); for (let i = 0; i < 10; i++) { const it = window.__ad.pickTr(PR.lv); out.push(it.tags.includes("v:pret")); } return out; });
  rec("While focused, the next items practise the same skill", nx.filter(Boolean).length >= 9, JSON.stringify(nx));
  // three right first time → mastered → asks about something new; "yes" moves on
  for (let k = 0; k < 3; k++) {
    await p.evaluate((k) => { const PR = window.__ad.pr(); PR.it = { id: "m" + k, dir: "en-es", src: "We went to the beach yesterday.", ans: ["Ayer fuimos a la playa."], tags: ["v:pret", "d:en-es"], len: 5, ui: 0 }; PR.tries = 0; PR.fb = null; PR.over = false; PR.ask = null; window.__ad.render(); }, k);
    await typeIt("Ayer fuimos a la playa");
  }
  const ask = await p.evaluate(() => ({ ask: window.__ad.pr().ask, txt: document.querySelector("#tutor .adwrap").innerText }));
  rec("Three right first time in a row: mastered, and Profe asks about something new", ask.ask === "v:pret" && /try something new/i.test(ask.txt), JSON.stringify(ask).slice(0, 300));
  await p.fill("#pr-input", "sí"); await p.press("#pr-input", "Enter"); await H.wait(300);
  const after = await p.evaluate(() => { const PR = window.__ad.pr(); return { focus: window.__ad.st("tr", PR.lv).focus, ask: PR.ask, it: !!PR.it }; });
  rec("Saying «sí» moves to a different kind of sentence", after.focus !== "v:pret" && !after.ask && after.it, JSON.stringify(after));
  // waits for Next; history; back/next; kept after a restart (1 hour); ending the session clears it
  await p.evaluate(() => { const PR = window.__ad.pr(); PR.ask = null; PR.it = { id: "h1", dir: "en-es", src: "I live near the sea.", ans: ["Vivo cerca del mar."], tags: ["v:pres", "d:en-es"], len: 4, ui: 0 }; PR.tries = 0; PR.fb = null; PR.over = false; PR.att = []; window.__ad.render(); });
  await typeIt("Vivo cerca del mar"); await H.wait(4000);
  const stay = await p.evaluate(() => ({ id: window.__ad.pr().it.id, over: window.__ad.pr().over, nav: document.querySelector("#tutor .adnav").innerText, next: (document.querySelector("#tutor .prnextbar .prnext") || {}).innerText || "", form: !!document.getElementById("pr-input") }));
  rec("After the answer the question stays until Next (no auto-advance)", stay.id === "h1" && stay.over && /Next/.test(stay.next) && !stay.form, JSON.stringify(stay));
  const nHist0 = await p.evaluate(() => window.__ad.pr().hist.length);
  await p.click('#tutor [data-act="ad-fwd"]'); await H.wait(500);
  const hs = await p.evaluate(() => { const PR = window.__ad.pr(); const cards = [...document.querySelectorAll("#tutor .adhist .adh")]; return { n: PR.hist.length, last: cards.length ? cards[cards.length - 1].innerText.replace(/\s+/g, " ") : "", newId: PR.it.id }; });
  rec("Next question: the answered one moves into the session history above (prompt, your answer, the answer)", hs.n === nHist0 + 1 && /I live near the sea/.test(hs.last) && /Vivo cerca del mar/.test(hs.last) && hs.newId !== "h1", JSON.stringify(hs));
  await p.click('#tutor [data-act="ad-back"]'); await H.wait(300);
  const bk = await p.evaluate(() => ({ view: window.__ad.pr().view, sel: !!document.querySelector("#tutor .adh.adsel"), nav: document.querySelector("#tutor .adnav").innerText.replace(/\s+/g, " ") }));
  rec("‹ Back selects the previous question (and the bar shows where you are)", bk.view === hs.n - 1 && bk.sel && /Next ›/.test(bk.nav), JSON.stringify(bk));
  await p.click('#tutor [data-act="ad-fwd"]'); await H.wait(300);
  rec("Next › from history returns to the current question", await p.evaluate(() => window.__ad.pr().view === null));
  const kept = await p.evaluate(() => JSON.parse(localStorage.getItem("ruta-adhist") || "null"));
  rec("Session history is saved (restored for up to an hour)", kept && kept.items && kept.items.length === hs.n, JSON.stringify(kept && kept.items && kept.items.length));
  const hdr = await p.evaluate(() => { const th = document.querySelector("#tutor .th"); return { brand: !!th.querySelector('.tbrand[data-act="t-close"]'), x: /✕/.test(th.innerText), gear: !!th.querySelector('[data-act="t-tab"][data-v="hist"]'), chat: !!th.querySelector('[data-act="t-tab"][data-v="chat"]'), pr: !!th.querySelector('[data-act="t-tab"][data-v="practice"]'), en: !!th.querySelector('[data-act="t-en"]'), end: !!document.querySelector('#tutor .adnav [data-act="ad-end"]') }; });
  rec("During a session the header shows only ‹ Profe (close), ⚙, Practice, 🇬🇧, hands-free; End is in the bottom bar", hdr.brand && !hdr.x && hdr.gear && !hdr.chat && hdr.pr && hdr.en && hdr.end, JSON.stringify(hdr));
  await p.click('#tutor [data-act="ad-end"]'); await H.wait(300);
  const ended = await p.evaluate(() => ({ hist: localStorage.getItem("ruta-adhist"), pr: !!window.__ad.pr(), menu: !!document.querySelector('#tutor .prapps') }));
  rec("End session: clears the history and goes back to the practice list", ended.hist === null && !ended.pr && ended.menu, JSON.stringify(ended));
  await p.evaluate(() => { const b = document.querySelector("#tutor .prback"); if (b) b.click(); }); await H.wait(200); await p.click('#tutor [data-act="pr-type"][data-v="trans"]'); await p.waitForFunction(() => window.__ad.pr() && window.__ad.pr().it, null, { timeout: 8000 }).catch(() => {});
  // conjugation: verbs grouped by behaviour; a miss brings verbs that behave the same way
  const grp = await p.evaluate(() => { const G = window.__ad.group; return { tener: G("tener", "pret"), poder: G("poder", "pret"), hacer: G("hacer", "pret"), decir: G("decir", "pret"), querer: G("querer", "pres"), dormir: G("dormir", "pres"), pedir: G("pedir", "pres"), salir: G("salir", "pres"), hablar: G("hablar", "pres"), tenerF: G("tener", "fut"), leer: G("leer", "pret") }; });
  rec("Verb groups: -uve, u-stem, i-stem, j-stem preterites; e→ie, o→ue, e→i, -go presents; irregular future stems", grp.tener === "uv" && grp.poder === "u" && grp.hacer === "i" && grp.decir === "j" && grp.querer === "e>ie" && grp.dormir === "o>ue" && grp.pedir === "e>i" && grp.salir === "go" && grp.hablar === "reg-ar" && grp.tenerF === "stem" && grp.leer === "y", JSON.stringify(grp));
  await p.click('#tutor [data-act="t-tab"][data-v="practice"]'); await H.wait(300); // Practice (tab) during a session: back to the list
  rec("Practice tab during a session returns to the list of practices", await p.evaluate(() => !window.__ad.pr() && !!document.querySelector("#tutor .prapps")));
  await p.evaluate(() => { const b = document.querySelector("#tutor .prback"); if (b) b.click(); }); await H.wait(200); await p.click('#tutor [data-act="pr-conj"]'); await p.waitForFunction(() => window.__ad.pr() && window.__ad.pr().kind === "cj" && window.__ad.pr().it, null, { timeout: 8000 }).catch(() => {});
  await p.evaluate(() => { const PR = window.__ad.pr(); PR.autoMic = false; PR.lv = "a2"; PR.it = { id: "c1", v: "tener", t: "pret", p: "yo", pi: 0, ans: "tuve", grp: "uv", tags: ["c:pret:uv", "v:pret", "c:pret"] }; PR.tries = 0; PR.fb = null; PR.over = false; window.__ad.st("cj", "a2").focus = null; window.__ad.render(); });
  const c1 = await typeIt("tenía"); rec("Conjugation try 1: names the wrong tense", /imperfect|imperfecto/i.test(c1) && /pretérito|preterite/i.test(c1), c1.slice(0, 300));
  const c2 = await typeIt("tuvo"); rec("Conjugation try 2: clue names the verb group", /Clue/.test(c2) && /-uve/.test(c2), c2.slice(0, 300));
  await typeIt("tengo");
  const cf = await p.evaluate(() => { const out = []; for (let i = 0; i < 6; i++) { const it = window.__ad.pickCj("a2"); out.push(it.t + ":" + it.grp + ":" + it.v); } return { focus: window.__ad.st("cj", "a2").focus, out }; });
  rec("After missing «tuve», more -uve preterites follow (estar, andar…)", cf.focus === "c:pret:uv" && cf.out.every((x) => /^pret:uv:/.test(x)), JSON.stringify(cf));
  // voice
  const vm = await p.evaluate(() => [window.__pv.match("practise translation"), window.__pv.match("vamos a practicar traducción"), window.__pv.match("practise conjugation")]);
  rec("Voice: “practise translation” / «vamos a practicar traducción» / “practise conjugation”", vm[0] === "practise.translate" && vm[1] === "practise.translate" && vm[2] === "practise.conj", JSON.stringify(vm));
  // answer policy (16 Nov 2026): a typed answer missing only accents gets a hint and a retry; the retry passes (not first-time); spoken answers aren't judged on accents
  const seed = (id) => p.evaluate((id) => { const PR = window.__ad.pr(); PR.kind = "tr"; PR.ask = null; PR.it = { id, dir: "en-es", src: "I ate at home yesterday.", ans: ["Ayer comí en casa."], tags: ["v:pret", "d:en-es"], len: 4, ui: 0 }; PR.tries = 0; PR.fb = null; PR.over = false; PR.accHint = 0; PR.att = []; window.__ad.render(); }, id);
  await seed("acc1"); const fBefore = await p.evaluate(() => window.__ad.pr().first);
  const a1 = await typeIt("Ayer comi en casa"); const s1 = await p.evaluate(() => ({ over: window.__ad.pr().over }));
  const a2 = await typeIt("Ayer comí en casa"); const s2 = await p.evaluate(() => ({ over: window.__ad.pr().over, first: window.__ad.pr().first }));
  await seed("acc2"); await p.evaluate(() => { window.__prTyped = 0; window.__ad.answer ? window.__ad.answer("Ayer comi en casa") : null; }); await H.wait(400); const s3 = await p.evaluate(() => ({ over: window.__ad.pr().over }));
  rec("Profe, typed: missing accents → '¡Casi! check the accents' and a retry; the corrected answer passes (not first-time). Spoken: accents not judged", /accents on «comi»|accents on/.test(a1) && !s1.over && s2.over && s2.first === fBefore && (s3.over || !(await p.evaluate(() => !!window.__ad.answer))), JSON.stringify({ a1: a1.slice(0, 160), s1, s2, fBefore, s3 }));
  rec("No page errors", !H.errs.length, H.errs.join(" | "));
  await H.close();
  console.log(R.every(Boolean) ? "ALL " + R.length + " PASS" : R.filter((x) => !x).length + " FAILED of " + R.length);
})();
