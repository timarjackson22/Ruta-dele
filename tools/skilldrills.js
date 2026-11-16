  /* ---------- interactive skill drills (tools/skilldrills.js, 15 Nov 2026) ----------
     A drill bank generated from each lesson/guide subsection (its words, example sentences, tables and practice items),
     tagged with the curriculum outcomes and skills it trains. Played one drill per screen, Duolingo-style.
     Routes: #ejercicios (hub) · #ejercicios/<topic>/<section n | review> · #ejercicios/skill/<comp>/<level>. Free: browser voice + speech recognition only. */
  const SK_LV = ["a1", "a2", "b1", "b2", "c1", "c2"];
  const SK_P = { // per-level difficulty
    a1: { n: 8, maxW: 8, extra: 1, say: 0.6, typed: false, strictAcc: false, bites: 2 }, a2: { n: 8, maxW: 10, extra: 2, say: 0.65, typed: false, strictAcc: false, bites: 3 },
    b1: { n: 9, maxW: 13, extra: 3, say: 0.7, typed: true, strictAcc: true, bites: 3 }, b2: { n: 10, maxW: 16, extra: 3, say: 0.72, typed: true, strictAcc: true, bites: 4 },
    c1: { n: 10, maxW: 20, extra: 4, say: 0.75, typed: true, strictAcc: true, bites: 5 }, c2: { n: 10, maxW: 24, extra: 4, say: 0.78, typed: true, strictAcc: true, bites: 5 } };
  // what each drill type trains (share of its time) and how long it takes (minutes); the coverage dashboard counts these
  const SK_T = {
    match: ["Match pairs", "🧩", { voc: 1 }, 0.6, "R"], hearmean: ["Listen: what does it mean?", "🎧", { lis: .6, voc: .4 }, 0.4, "R"], meaning: ["Read: what does it mean?", "📖", { rea: .7, voc: .3 }, 0.4, "R"],
    hearpick: ["Listen: which sentence?", "🎧", { lis: .8, rea: .2 }, 0.5, "R"], whichsound: ["Which pronunciation is right?", "👂", { pro: .7, lis: .3 }, 0.4, "R"], misspell: ["Spot the misspelling", "🔎", { wex: .5, voc: .5 }, 0.4, "R"],
    tiles: ["Build the sentence", "🧱", { gra: .5, wex: .3, voc: .2 }, 0.8, "S"], gap: ["Fill the gap", "🧩", { gra: .7, voc: .3 }, 0.5, "S"], syll: ["Split into syllables", "✂️", { pro: .6, wex: .4 }, 0.5, "S"],
    stress: ["Find the stressed syllable", "🎯", { pro: .7, wex: .3 }, 0.4, "S"], conj: ["Conjugate", "🔤", { gra: .8, wex: .2 }, 0.5, "S"], acad: ["Grammar check", "✏️", { gra: .7, rea: .3 }, 0.5, "S"],
    dict: ["Listen and type", "⌨️", { lis: .5, wex: .5 }, 1, "P"], translate: ["Translate", "🌍", { wex: .5, gra: .3, voc: .2 }, 1.2, "P"], say: ["Say it", "🗣", { oex: .5, pro: .5 }, 0.6, "P"],
    readq: ["Read and answer", "📖", { rea: .9, voc: .1 }, 3, "X"], lisq: ["Listen and answer", "🎧", { lis: .9, voc: .1 }, 3, "X"], exread: ["DELE reading bite", "📝", { rea: 1 }, 2, "X"],
    exlisten: ["DELE listening bite", "📻", { lis: 1 }, 2, "X"], exwrite: ["DELE writing bite", "✍️", { wex: .5, wint: .4, dis: .1 }, 6, "X"], exspeak: ["DELE speaking bite", "🎙", { oex: .7, dis: .2, pro: .1 }, 3, "X"] };
  const SK_SKILL = { lis: ["Listening", "🎧"], oex: ["Speaking", "🗣"], pro: ["Pronunciation", "👂"], wex: ["Writing & spelling", "✍️"], gra: ["Grammar", "✏️"], voc: ["Vocabulary", "🧩"], rea: ["Reading", "📖"] };
  let SK = null; const SKX = {}; // session · exam data cache
  const skHash = (s) => { let h = 2166136261; for (const c of String(s)) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; };
  const skRng = (seed) => { let a = seed >>> 0; return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; };
  const skShuf = (a, r) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const skN = (s) => String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[¿?¡!.,;:«»"“”()…\-–—]/g, " ").replace(/\s+/g, " ").trim();
  const skNA = (s) => String(s || "").toLowerCase().replace(/[¿?¡!.,;:«»"“”()…\-–—]/g, " ").replace(/\s+/g, " ").trim();
  const skWords = (s) => String(s).split(/\s+/).filter(Boolean);
  const skClean = (s) => String(s || "").replace(/\s*\([^)]*\)/g, "").replace(/\s+/g, " ").trim();
  const skOkSent = (s, lv) => { const n = skWords(s).length; return n >= 3 && n <= SK_P[lv].maxW && !/___|[\/\d=+→|…\[\]]/.test(s) && /[a-záéíóúñ]/i.test(s); };
  const skOkWord = (w) => /^[a-záéíóúüñ]{3,14}$/i.test(w);
  /* ---- the app-wide answer policy (16 Nov 2026): one hint, one retry, then the answer ----
     ansCheck → { kind: "ok" | "accent" | "near" | "wrong", hint, best }. Capitals and punctuation never count; accents always do
     (after a hint), except in spoken answers, where speech recognition cannot hear them (opts.spoken). */
  function skLev(a, b) { a = String(a); b = String(b); const m = a.length, n = b.length; let prev = Array.from({ length: n + 1 }, (_, j) => j);
    for (let i = 1; i <= m; i++) { const cur = [i]; for (let j = 1; j <= n; j++) cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)); prev = cur; } return prev[n]; }
  function ansCheck(val, alts, o) { o = o || {}; const lv = o.lvl || "a1", low = /^a/.test(lv);
    const v = norm(val || ""); alts = (alts || []).map(String).filter((a) => a.trim()); if (!v || !alts.length) return { kind: "wrong", best: alts[0] || "" };
    if (alts.some((a) => norm(a) === v)) return { kind: "ok", best: alts.find((a) => norm(a) === v) };
    const acc = alts.find((a) => strip(norm(a)) === strip(v));
    if (acc) { if (o.spoken) return { kind: "ok", best: acc, spokenAccent: true };
      const A = String(val).match(/\S+/g) || [], B = acc.match(/\S+/g) || [], cl = (w) => String(w || "").replace(/[¿?¡!.,;:«»"“”()]/g, "");
      const bad = B.map((w, k) => (cl(w).toLowerCase() !== cl(A[k]).toLowerCase() ? cl(A[k]) : null)).filter(Boolean), nN = bad.length, enye = B.some((w, k) => /ñ/i.test(w) && !/ñ/i.test(A[k] || ""));
      return { kind: "accent", best: acc, words: bad, hint: low && nN <= 3 ? "Check the " + (enye && nN === 1 ? "spelling" : "accents") + " on " + bad.map((w) => "«" + w + "»").join(" and ") + "." : nN + (nN === 1 ? " word needs" : " words need") + " an accent or ñ." }; }
    const best = alts.map((a) => ({ a, d: skLev(strip(norm(a)), strip(v)) })).sort((x, y) => x.d - y.d)[0].a;
    let d; try { d = wordDiff(String(val), best); } catch (e) { d = { pairs: [] }; }
    const P = (d.pairs || []).map((pr) => ({ a: String(pr.from || "").replace(/[¿?¡!.,;:«»"“”()]/g, ""), b: String(pr.to || "").replace(/[¿?¡!.,;:«»"“”()]/g, "") }));
    const nB = (best.match(/\S+/g) || []).length, ch = skLev(strip(norm(best)), strip(v)), small = ch <= Math.max(1, Math.round(strip(norm(best)).length * 0.12));
    if (P.length === 1) { const x = P[0];
      if (!x.a && !/\s/.test(x.b)) return { kind: "near", best, hint: "Almost: one word is missing." };
      if (!x.b && !/\s/.test(x.a)) return { kind: "near", best, hint: "Almost: one word is not needed: «" + x.a + "»." };
      if (x.a && x.b && !/\s/.test(x.a) && !/\s/.test(x.b)) return { kind: "near", best, hint: skLev(strip(x.a.toLowerCase()), strip(x.b.toLowerCase())) <= 2 ? "Check the spelling of «" + x.a + "»." : "Almost: one word isn't right: «" + x.a + "»." }; }
    if (small && nB > 1) return { kind: "near", best, hint: "Very close: check the spelling, letter by letter." };
    if (P.length === 0 && (String(val).match(/\S+/g) || []).length === nB && nB > 1) return { kind: "near", best, hint: "The words are right but the order isn't." };
    return { kind: "wrong", best }; }
  /* ---- syllables and stress (Spanish rules) ---- */
  function skSyl(w) { try { return syllables(w.toLowerCase()); } catch (e) { return [w]; } }
  function skStress(w) { const s = skSyl(w), t = s.findIndex((x) => /[áéíóú]/.test(x)); if (t >= 0) return t; if (s.length < 2) return 0; return /[aeiouns]$/.test(w.toLowerCase()) ? s.length - 2 : s.length - 1; }
  function skMoveStress(w) { // the same word with the stress written on another syllable (a wrong pronunciation for TTS to say)
    const s = skSyl(w.toLowerCase().normalize("NFD").replace(/[́]/g, "").normalize("NFC")), k = skStress(w); if (s.length < 2) return null;
    const j = k === s.length - 1 ? k - 1 : k + 1, AC = { a: "á", e: "é", i: "í", o: "ó", u: "ú" };
    const sj = s[j], m = sj.match(/[aeo]/) || sj.match(/[iu]/); if (!m) return null; s[j] = sj.slice(0, m.index) + AC[m[0]] + sj.slice(m.index + 1); const out = s.join(""); return skTaboo().has(out) ? null : out; }
  let SK_TABOO = null; const skTaboo = () => { if (SK_TABOO) return SK_TABOO; try { SK_TABOO = new Set(JSON.parse(document.getElementById("sk-taboo").textContent)); } catch (e) { SK_TABOO = new Set(); } return SK_TABOO; };
  function skMisspell(w, r) { // a realistic misspelling that is not itself a real word
    const R = [[/á/, "a"], [/é/, "e"], [/í/, "i"], [/ó/, "o"], [/ú/, "u"], [/v/, "b"], [/b/, "v"], [/ll/, "y"], [/^h/, ""], [/ñ/, "n"], [/z/, "s"], [/ce/, "se"], [/ci/, "si"], [/qu/, "k"], [/rr/, "r"], [/gu([ei])/, "g$1"], [/j/, "g"], [/g([ei])/, "j$1"]];
    for (const [a, b] of skShuf(R, r)) { if (a.test(w)) { const x = w.replace(a, b); if (x !== w && !skTaboo().has(x.toLowerCase())) return x; } } return null; }
  /* ---- the material of a topic, split by subsection ---- */
  function skTopic(id) {
    let m = /^(a1|a2|b1|b2|c1|c2)-u(\d+)$/.exec(id);
    if (m) { const L = LV[m[1]], u = L && L.units[+m[2] - 1]; if (!u) return null;
      const secs = [{ name: "Vocabulary", words: [].concat(...(u.v || []).map((g) => g.w || [])), sents: [], tables: [], text: JSON.stringify(u.v) }]
        .concat(u.g.map((b) => ({ name: b.t, words: [], sents: [], tables: [b], text: JSON.stringify(b) })))
        .concat(u.e && u.e.length ? [{ name: "Examples", words: [], sents: [], tables: [], text: JSON.stringify(u.e) }] : [])
        .concat(u.pit && u.pit.length ? [{ name: "Common mistakes", words: [], sents: [], tables: [], text: JSON.stringify(u.pit) }] : []);
      return skFill({ id, kind: "unit", lvl: m[1], title: u.t, link: "#" + id, o: u, ex: u.e || [], secs }); }
    m = /^guia-(.+)$/.exec(id);
    if (m) { const g = (typeof GUIDES !== "undefined" ? GUIDES : []).find((x) => x.id === m[1]); if (!g) return null;
      const secs = g.sec.map((s) => ({ name: s.t, words: [], sents: (s.e || []).map((e) => [e[0], e[1]]), tables: [], text: JSON.stringify(s) })).concat(g.pit && g.pit.length ? [{ name: "Common mistakes", words: [], sents: [], tables: [], text: JSON.stringify(g.pit) }] : []);
      return skFill({ id, kind: "guide", lvl: g.lvl, title: g.t, link: "#" + id, o: g, ex: [], secs }); }
    return null;
  }
  function skFill(T) { // practice items and example sentences go to the subsection they fit best (the same matcher as the inline checks)
    const items = pxItems(T.o).map((it) => Object.assign(it, { ins: it.t === "x" ? (T.o.xi || "") : "" })), as = (list) => { try { return window.__qc ? window.__qc.assign(list, T.secs) : T.secs.map(() => []); } catch (e) { return T.secs.map(() => []); } };
    as(items).forEach((ks, si) => (T.secs[si].items = ks.map((k) => items[k])));
    if (T.ex.length) as(T.ex.map((e) => ({ q: e[0], a: [e[1]], why: "" }))).forEach((ks, si) => ks.forEach((k) => T.secs[si].sents.push(T.ex[k])));
    T.secs.forEach((s) => { s.items = s.items || [];
      s.sents = s.sents.map((e) => [skClean(e[0]), skClean(e[1])]).filter((e) => e[0] && e[1]);
      items.forEach(() => {}); s.items.filter((it) => it.t === "tr").forEach((it) => { const e = [it.a[0], it.q].map(skClean); e.alts = it.a.map(skClean); s.sents.push(e); }); // translations are sentence pairs too
      const toks = new Set(); s.words.forEach((w) => { const x = skClean(w[0]); if (!/\s/.test(x)) toks.add(x.replace(/^(el|la|los|las)\s+/, "")); });
      s.sents.forEach((e) => skWords(e[0]).forEach((x) => toks.add(x.replace(/[.,;:!?¿¡()«»"]/g, ""))));
      s.vocab = [...toks].filter((x) => skOkWord(x) && x === x.toLowerCase() && x.length >= 4); });
    T.allWords = [].concat(...T.secs.map((s) => s.words)).map((w) => [skClean(w[0]), skClean(w[1])]).filter((w) => w[0] && w[1] && w[0].length >= 2 && skN(w[0]) !== skN(w[1]) && w[0].length < 24 && w[1].length < 32 && !/[\/…]/.test(w[0]));
    if (T.allWords.length < 6) { const V = (typeof VOCAB !== "undefined" && VOCAB[T.lvl]) || []; V.forEach((th) => th.w.forEach((w) => T.allWords.length < 60 && !/[\/(…]/.test(w[0]) && T.allWords.push([skClean(w[0]), skClean(w[1])]))); }
    T.allSents = [].concat(...T.secs.map((s) => s.sents)).filter((e) => skOkSent(e[0], T.lvl));
    return T;
  }
  function skOutcomes(T, sec) { // register outcomes this subsection trains (grammar/function/theme by keyword on its heading + the level's skill outcomes)
    let R = null; try { R = crReg(); } catch (e) {} if (!R) return [];
    const head = crFold ? crFold(T.title + " " + (sec ? sec.name + " " + sec.text.slice(0, 400) : "")) : ""; const li = (l) => SK_LV.indexOf(l);
    return R.outcomes.filter((o) => o.kw && li(o.lvl) <= li(T.lvl) + 1 && (() => { try { return new RegExp(o.kw, "i").test(head); } catch (e) { return false; } })()).slice(0, 6).map((o) => ({ id: o.id, text: o.text, lvl: o.lvl }));
  }
  /* ---- drill generators ---- */
  function skAcad(it) { // a lesson question as a drill: never without its own task
    const sm = /stressed syllable of\s+«?([a-záéíóúüñ]+)»?/i.exec(it.q) || (/stressed syllable/i.test(it.ins || "") && /^\s*«?([a-záéíóúüñ]+)»?\s*(:?\s*_{2,})?\s*$/i.exec(it.q));
    if (it.t === "x" && sm) { const w = sm[1].toLowerCase(), syl = skSyl(w), k = syl.indexOf(String(it.a[0]).trim().toLowerCase()); if (syl.length > 1 && k >= 0) return { type: "stress", w, syl, k, why: it.why, it }; }
    if (it.t === "x" && !/_{2,}|…/.test(it.q)) { const w = String(it.q).trim().toLowerCase(), syl = skSyl(w), k = syl.indexOf(String(it.a[0]).trim().toLowerCase());
      if (/^[a-záéíóúüñ]+$/.test(w) && syl.length > 1 && k >= 0) return { type: "stress", w, syl, k, why: it.why, it };
      if (!it.ins) return null; }
    return { type: "acad", it };
  }
  function skGen(T, si, r) { // candidates for one subsection, by stage
    const P = SK_P[T.lvl], s = T.secs[si], C = { R: [], S: [], P: [] };
    const sents = s.sents.filter((e) => skOkSent(e[0], T.lvl)), others = T.allSents.filter((e) => !sents.includes(e)), pool = sents.length >= 2 ? sents : sents.concat(skShuf(others, r).slice(0, 3 - sents.length));
    const words = (s.words.length >= 4 ? s.words.map((w) => [skClean(w[0]), skClean(w[1])]) : T.allWords).filter((w) => w[0].length >= 2 && skN(w[0]) !== skN(w[1])), vocab = s.vocab.length >= 3 ? s.vocab : [].concat(...T.secs.map((x) => x.vocab));
    const add = (st, d) => d && C[st].push(d);
    if (words.length >= 5) add("R", { type: "match", pairs: skShuf(words, r).slice(0, 5) });
    if (words.length >= 4) { const w = skShuf(words, r); add("R", { type: "hearmean", say: w[0][0], ans: w[0][1], opts: skShuf([w[0][1], w[1][1], w[2][1], w[3][1]], r) }); }
    pool.slice(0, 3).forEach((e, k) => { const seenO = new Set([skN(e[0]), skN(e[1])]), o = skShuf(T.allSents.filter((x) => x !== e), r).filter((x) => { const a = skN(x[0]), b = skN(x[1]); if (seenO.has(a) || seenO.has(b)) return false; seenO.add(a); seenO.add(b); return true; });
      if (o.length >= 2) add("R", { type: k % 2 ? "meaning" : "hearpick", say: e[0], show: e[0], ans: k % 2 ? e[1] : e[0], opts: skShuf(k % 2 ? [e[1], o[0][1], o[1][1]] : [e[0], o[0][0], o[1][0]], r), en: e[1] });
      add("S", P.typed && T.lvl >= "b2" && k ? null : { type: "tiles", s: e, extra: skShuf(skWords((o[0] || e)[0].replace(/[.!?¿¡,]/g, "").toLowerCase()), r).filter((x) => !skWords(e[0].toLowerCase()).includes(x)).slice(0, P.extra) });
      if (!/\s[A-ZÁÉÍÓÚÑ]/.test(e[0])) add("P", { type: "dict", s: e }); if (P.typed) add("P", { type: "translate", s: e, alts: e.alts || [e[0]] }); add("P", { type: "say", s: e }); });
    const vw = skShuf(vocab.filter((w) => skSyl(w).length >= 2), r);
    if (vw[0]) { const v = skMoveStress(vw[0]); if (v && v !== vw[0]) add("R", { type: "whichsound", w: vw[0], wrong: v, order: r() < .5 ? [0, 1] : [1, 0] }); }
    if (vw.length >= 4) { const bad = skMisspell(vw[1], r); if (bad) add("R", { type: "misspell", words: skShuf([bad].concat(vw.slice(2, 5)), r), bad, good: vw[1] }); }
    if (vw[2]) add("S", { type: "syll", w: vw[2].toLowerCase(), syl: skSyl(vw[2].toLowerCase()) });
    if (vw[3]) add("S", { type: "stress", w: vw[3].toLowerCase(), syl: skSyl(vw[3].toLowerCase()), k: skStress(vw[3].toLowerCase()) });
    s.tables.forEach((b) => { const PR = /^(yo|tú|él|nosotros|vosotros|ellos)(\/as|\/a| \/|$|,| )/i, INF = /^[a-záéíóúñ]+(ar|er|ir|ír)(se)?(\s*\(.*\))?$/i; const rows = (b.rows || []).filter((row) => PR.test(row[0] || "")), h = b.h || [];
      skShuf(rows, r).slice(0, 2).forEach((row) => { const ci = 1 + Math.floor(r() * (row.length - 1)), form = String(row[ci] || "").split(/[\/·,(]/)[0].trim();
        if (form && skWords(form).length <= 3 && h[ci] && INF.test(String(h[ci]).trim()) && /^[a-záéíóúñ ]+$/i.test(form) && !/^(he|has|ha|hemos|habéis|han)$/i.test(form)) add("S", { type: "conj", verb: h[ci], person: row[0], tense: T.title + " · " + b.t, ans: [form], why: b.r || "" }); }); });
    const xs = s.items.filter((it) => it.t === "x"); xs.slice(0, 3).forEach((it) => { if (!/_{2,}|…/.test(it.q)) { const d = skAcad(it); if (d) add(d.type === "stress" ? "S" : "P", d); return; }
      const hint = /\(([^()]*\/[^()]*)\)\s*\.?$/.exec(it.q), ch = hint ? hint[1].split("/").map((x) => x.trim()).filter(Boolean) : [];
      if (ch.length >= 2 && ch.length <= 4 && ch.some((x) => skNA(x) === skNA(it.a[0]))) add("S", { type: "gap", q: it.q.replace(hint[0], "").trim(), ans: ch.find((x) => skNA(x) === skNA(it.a[0])), alts: it.a, opts: skShuf(ch, r), why: it.why, it });
      else { const d = skAcad(it); if (d) add(d.type === "stress" ? "S" : "P", d); } });
    s.items.filter((it) => it.t !== "x").slice(0, 4).forEach((it) => add(it.t === "mc" ? "S" : "P", { type: "acad", it }));
    return C;
  }
  function skPick(C, n, r, canMic) { // recognise → structure → produce, varied, at most 2 of a type
    const out = [], cnt = {}, take = (st, k) => { const L = skShuf(C[st].filter((d) => (canMic || d.type !== "say") && !out.includes(d)), r); for (const d of L) { if (out.length >= n || k <= 0) break; if ((cnt[d.type] || 0) >= 2) continue; if (out.length && out[out.length - 1].type === d.type) continue; out.push(d); cnt[d.type] = (cnt[d.type] || 0) + 1; k--; } };
    const q = Math.max(2, Math.round(n / 3)); take("R", q); take("S", q); take("P", n - out.length); take("S", n - out.length); take("R", n - out.length);
    return out;
  }
  function skBank(id, si, seed) { // the drills for one subsection (deterministic for a seed)
    const T = skTopic(id); if (!T || !T.secs[si]) return [];
    const r = skRng(skHash(id + "|" + si + "|" + (seed || 0))), C = skGen(T, si, r), n = SK_P[T.lvl].n;
    return skPick(C, n, r, seed === "bank" ? true : skCanMic()).map((d) => Object.assign(d, { src: id, si, lvl: T.lvl }));
  }
  function skCanMic() { return !!(typeof SR !== "undefined" && SR) || !!window.AndroidRec; }
  async function skExam(lv) { if (SKX[lv] !== undefined) return SKX[lv]; try { const r = await fetch("examdata/" + lv + ".json"); SKX[lv] = r.ok ? await r.json() : null; } catch (e) { SKX[lv] = null; } return SKX[lv]; }
  async function skReview(id, seed) { // end of chapter: academic questions + skill drills from every subsection + DELE micro-tasks that grow with the level
    const T = skTopic(id); if (!T) return []; const r = skRng(skHash(id + "|review|" + (seed || 0))), P = SK_P[T.lvl], li = SK_LV.indexOf(T.lvl), out = [];
    const acad = skShuf(T.secs.flatMap((s) => s.items), r).map(skAcad).filter(Boolean).slice(0, 5 + Math.min(li, 3));
    const skills = skShuf(T.secs.map((_, si) => skGen(T, si, r)).flatMap((C) => C.R.concat(C.S, C.P)).filter((d) => d.type !== "acad" && (skCanMic() || d.type !== "say")), r);
    const used = {}; const sk = skills.filter((d) => { used[d.type] = (used[d.type] || 0) + 1; return used[d.type] <= 1; }).slice(0, 5);
    const bites = [], L = (typeof LISTEN !== "undefined" ? LISTEN : []).filter((x) => x.lvl === T.lvl && x.q && x.q.length);
    const rd = skShuf(L.filter((x) => x.cat === "reading"), r)[0], ls = skShuf(L.filter((x) => x.cat !== "reading"), r)[0];
    const para = (x) => (x.paras || []).map((p) => (p.s || []).map((s) => s[0]).join(" ")).join("\n\n");
    if (rd) bites.push({ type: "readq", title: rd.t, text: para(rd), q: rd.q[0][0], opts: rd.q[0][1], c: rd.q[0][2] });
    if (ls) bites.push({ type: "lisq", title: ls.t, say: para(ls), q: ls.q[0][0], opts: ls.q[0][1], c: ls.q[0][2] });
    const D = await skExam(T.lvl); if (D && D.exams && D.exams.length) { const e = D.exams[Math.floor(r() * D.exams.length)];
      // reading: a multiple-choice question with its own options, shown with the whole text(s) of the task
      const lt = skShuf((e.lectura || []).filter((t) => t.texts && (t.q || []).some((q) => Array.isArray(q.o) && Number.isInteger(q.a))), r)[0];
      if (lt) { const qs = lt.q.filter((q) => Array.isArray(q.o) && Number.isInteger(q.a)), q = qs[Math.floor(r() * qs.length)];
        const txt = (lt.texts || []).map((x) => (x.h ? x.h + "\n" : "") + (x.b || "")).join("\n\n");
        if (txt.length < (li < 2 ? 1400 : 3200)) bites.push({ type: "exread", task: lt.t, ins: lt.en || lt.ins, text: txt, q: /^\(?\d+\)?\.?$/.test(String(q.q).trim()) ? "Which option fits gap " + String(q.q).trim() + "?" : q.q, opts: q.o, c: q.a }); }
      // listening: one message and its own question (tasks made of short separate messages), never a question about audio that isn't played
      const at = skShuf((e.auditiva || []).filter((t) => t.audio && t.q && t.q.length && t.q.every((q) => Array.isArray(q.o)) && t.audio.length === t.q.length * 2), r)[0];
      if (at) { const k = Math.floor(r() * at.q.length); bites.push({ type: "exlisten", task: at.t, ins: at.en || at.ins, say: at.audio.slice(2 * k, 2 * k + 2).join(" "), q: at.q[k].q, opts: at.q[k].o, c: at.q[k].a }); } }
    const W = (typeof WTASKS !== "undefined" ? WTASKS : []).filter((w) => w.lvl === T.lvl), w = skShuf(W, r)[0];
    if (w && li >= 1) { const pts = (w.points || []).slice(0, Math.min(w.points.length, 1 + li)); bites.push({ type: "exwrite", task: w.es, en: w.en, pts, min: [0, 15, 30, 45, 60, 80][li], phrases: (w.phrases || []).slice(0, 4) }); }
    const SPK = (typeof VOICE !== "undefined" ? VOICE.speaking || [] : []).filter((x) => x.lvl === T.lvl), sp = skShuf(SPK, r)[0];
    if (sp && li >= 2 && skCanMic()) bites.push({ type: "exspeak", task: sp.task, prompt: sp.prompt, points: sp.points || [], min: Math.max(15, Math.round((sp.minWords || 40) * 0.5)) });
    const pri = ["exread", "exlisten", "exwrite", "exspeak", "lisq", "readq"], B = pri.map((t) => bites.find((x) => x.type === t)).filter(Boolean); if (!B.some((x) => x.type === "exlisten")) { const i = B.findIndex((x) => x.type === "lisq"); if (i > 1) B.splice(1, 0, B.splice(i, 1)[0]); }
    out.push(...acad.slice(0, 3), ...sk.slice(0, 2), ...acad.slice(3), ...sk.slice(2), ...B.slice(0, P.bites));
    return out.map((d) => Object.assign(d, { src: id, si: "review", lvl: T.lvl }));
  }
  /* ---- cards shown in the lesson ---- */
  const SK_SKW = { lis: "listening", oex: "speaking", pro: "pronunciation", wex: "spelling", gra: "grammar", voc: "vocabulary", rea: "reading" };
  function skCard(id, si) { const b = skBank(id, si, 1); if (!b.length) return "";
    const mins = Math.max(1, Math.round(b.reduce((n, d) => n + SK_T[d.type][3], 0))), st = ((S.sk || {})[id + "|" + si]) || null, w = {};
    b.forEach((d) => Object.entries(SK_T[d.type][2]).forEach(([c, v]) => SK_SKW[c] && (w[c] = (w[c] || 0) + v)));
    const skills = Object.entries(w).sort((x, y) => y[1] - x[1]).slice(0, 3).map(([c]) => SK_SKW[c]).join(", ");
    return '<aside class="qchk sk-card" aria-label="Check yourself"><div class="sk-txt"><b>Check yourself</b><small>' + b.length + " drills · ~" + mins + " min · " + skills + (st ? " · last " + st.last + "/" + st.n : "") + '</small></div><a class="btn primary small" data-act="sk-go" href="#ejercicios/' + esc(id) + "/" + si + '">' + (st ? "Again" : "Practise") + "</a></aside>"; }
  function skReviewCard(id) { const T = skTopic(id); if (!T) return ""; const st = ((S.sk || {})[id + "|review"]) || null;
    return '<aside class="qchk sk-card sk-rev"><div class="sk-txt"><b>Chapter challenge</b><small>Everything in this chapter, plus DELE-style tasks' + (st ? " · last " + st.last + "/" + st.n : "") + '</small></div><a class="btn primary small" data-act="sk-go" href="#ejercicios/' + esc(id) + '/review">' + (st ? "Again" : "Start") + "</a></aside>"; }
  /* ---- come back to exactly where you were in the lesson ---- */
  function skMark(a) { try { const card = a.closest(".sk-card"), m = /^#ejercicios\/([a-z0-9-]+)\/(\d+|review)$/.exec(a.getAttribute("href") || ""); if (!m) return;
    sessionStorage.setItem("sk-ret", JSON.stringify({ h: "#" + m[1], si: m[2], off: card ? card.getBoundingClientRect().top : 120, y: scrollY })); } catch (e) {} }
  function skRestore() { let R = null; try { R = JSON.parse(sessionStorage.getItem("sk-ret") || "null"); } catch (e) {} if (!R || location.hash !== R.h) return;
    const go = () => { const a = document.querySelector('#app .sk-card a[href="#ejercicios/' + R.h.slice(1) + "/" + R.si + '"]'); if (a) { const c = a.closest(".sk-card"); scrollTo(0, Math.max(0, c.getBoundingClientRect().top + scrollY - R.off)); } else scrollTo(0, R.y || 0); };
    [60, 250, 600].forEach((t) => setTimeout(go, t)); setTimeout(() => { try { sessionStorage.removeItem("sk-ret"); } catch (e) {} }, 700); }
  addEventListener("hashchange", () => { if (!/^#ejercicios/.test(location.hash)) skRestore(); });
  /* ---- the player ---- */
  async function skStart(id, si) {
    const seed = Date.now() % 100000; let list = si === "review" ? await skReview(id, seed) : skBank(id, +si, seed);
    if (!list.length) { app.innerHTML = '<div class="stack"><h1>No drills here yet</h1><p><a href="#ejercicios">All drills</a></p></div>'; return; }
    const T = skTopic(id);
    try { const R = JSON.parse(sessionStorage.getItem("sk-ret") || "null"); if (R && R.h === "#" + id) { R.si = String(si); sessionStorage.setItem("sk-ret", JSON.stringify(R)); } else sessionStorage.setItem("sk-ret", JSON.stringify({ h: "#" + id, si: String(si), off: 140 })); } catch (e) {}
    SK = { id, si, list, i: 0, ok: 0, first: 0, st: {}, retry: [], done: {}, T, outs: skOutcomes(T, si === "review" ? null : T.secs[+si]), t0: Date.now() };
    skRender();
  }
  async function skSkillStart(comp, lv) { // a mixed session for one skill at a level, from every lesson of the level
    const L = LV[lv]; if (!L) return; const r = skRng(Date.now() % 100000), all = [];
    L.units.forEach((u, i) => { const id = lv + "-u" + (i + 1), T = skTopic(id); if (!T) return; T.secs.forEach((_, si) => { const C = skGen(T, si, r); C.R.concat(C.S, C.P).forEach((d) => all.push(Object.assign(d, { src: id, si, lvl: lv }))); }); });
    let list = skShuf(all.filter((d) => (SK_T[d.type][2][comp] || 0) >= 0.5 && (skCanMic() || d.type !== "say")), r);
    const seen = {}; list = list.filter((d) => { const k = d.type + JSON.stringify(d.s || d.w || d.say || d.q || ""); if (seen[k]) return false; seen[k] = 1; return true; }).slice(0, 10);
    SK = { id: "skill-" + comp, si: lv, list, i: 0, ok: 0, first: 0, st: {}, retry: [], done: {}, T: { title: SK_SKILL[comp][0] + " · " + lv.toUpperCase(), link: "#ejercicios", lvl: lv }, outs: [], t0: Date.now() };
    if (!list.length) { app.innerHTML = '<div class="stack"><h1>No drills for this skill yet</h1><p><a href="#ejercicios">All drills</a></p></div>'; return; }
    skRender();
  }
  const skBtn = (act, label, extra) => '<button class="btn' + (extra || "") + '" data-act="' + act + '">' + label + "</button>";
  const skPlay = (t, slow) => '<button class="drplay' + (slow ? " sm" : "") + '" data-act="sk-play" data-t="' + esc(t) + '"' + (slow ? ' data-slow="1"' : "") + ' aria-label="' + (slow ? "Play slowly" : "Play") + '">' + (slow ? "🐢" : "🔊") + "</button>";
  function skRender() {
    document.body.classList.add("no-tabs");
    if (!SK) return; const total = SK.list.length;
    if (SK.i >= total) return skEnd();
    const d = SK.list[SK.i], st = SK.st, P = SK_P[d.lvl] || SK_P.a1, info = SK_T[d.type];
    const fromLesson = /^#(a1|a2|b1|b2|c1|c2)-u\d+$|^#guia-/.test(SK.T.link || "");
    const top = '<div class="drtop"><a class="btn small sk-back" href="' + esc(SK.T.link || "#ejercicios") + '" aria-label="Close">' + (fromLesson ? "‹ Lesson" : "‹ Drills") + '</a><span class="drprog"><i style="width:' + Math.round((100 * SK.i) / total) + '%"></i></span><span class="sk-n small">' + (SK.i + 1) + "/" + total + "</span></div>";
    const tag = '<p class="sk-tag">' + info[1] + " " + esc(info[0]) + (d.retry ? " · <b>again</b>" : "") + "</p>";
    const opts = (list, picked) => '<div class="exopts">' + list.map((o, k) => '<button class="exopt' + (st.res ? (k === st.correct ? " ok" : k === picked ? " no" : "") : "") + '" data-act="sk-pick" data-k="' + k + '"' + (st.res ? " disabled" : "") + ">" + esc(o) + "</button>").join("") + "</div>";
    let body = "", needCheck = true;
    if (d.type === "match") { needCheck = false; st.L = st.L || skShuf(d.pairs.map((_, i) => i), Math.random); st.Rr = st.Rr || skShuf(d.pairs.map((_, i) => i), Math.random); st.done = st.done || [];
      body = '<h2 class="drq">Tap the matching pairs</h2><div class="drmatch"><div>' + st.L.map((i) => '<button class="drtile" data-act="sk-m" data-side="l" data-i="' + i + '"' + (st.done.includes(i) ? " disabled" : "") + (st.sel === "l" + i ? ' aria-pressed="true"' : "") + ">" + esc(d.pairs[i][0]) + "</button>").join("") + "</div><div>" +
        st.Rr.map((i) => '<button class="drtile" data-act="sk-m" data-side="r" data-i="' + i + '"' + (st.done.includes(i) ? " disabled" : "") + (st.sel === "r" + i ? ' aria-pressed="true"' : "") + ">" + esc(d.pairs[i][1]) + "</button>").join("") + "</div></div>"; }
    else if (d.type === "hearmean") { needCheck = false; st.correct = d.opts.indexOf(d.ans); body = '<h2 class="drq">What does it mean?</h2>' + skPlay(d.say) + opts(d.opts, st.picked); }
    else if (d.type === "hearpick") { needCheck = false; st.correct = d.opts.indexOf(d.ans); body = '<h2 class="drq">Which sentence do you hear?</h2><div class="row sk-c">' + skPlay(d.say) + skPlay(d.say, 1) + "</div>" + opts(d.opts, st.picked); }
    else if (d.type === "meaning") { needCheck = false; st.correct = d.opts.indexOf(d.ans); body = '<h2 class="drq">What does this mean?</h2><p class="drsay" lang="es">' + esc(d.show) + "</p>" + opts(d.opts, st.picked); }
    else if (d.type === "whichsound") { needCheck = false; st.correct = d.order.indexOf(0); const lab = ["A", "B"];
      body = '<h2 class="drq">Which pronunciation of <span lang="es">«' + esc(d.w) + '»</span> is right?</h2><p class="muted small">Listen to both. Only one puts the stress in the right place.</p><div class="row sk-c">' + d.order.map((v, k) => '<button class="btn sk-ver" data-act="sk-play" data-t="' + esc(v === 0 ? d.w : d.wrong) + '">🔊 Version ' + lab[k] + "</button>").join("") + "</div>" + opts(["Version A is right", "Version B is right"], st.picked); }
    else if (d.type === "misspell") { needCheck = false; st.correct = d.words.indexOf(d.bad); body = '<h2 class="drq">Which word is misspelled?</h2>' + opts(d.words, st.picked); }
    else if (d.type === "tiles") { const toks = d.s[0].replace(/[¿¡]/g, "").split(/\s+/); st.pool = st.pool || skShuf(toks.concat(d.extra || []).map((x) => x.replace(/[.!?,;:]$/, "")), Math.random); st.pick = st.pick || [];
      body = '<h2 class="drq">Write this in Spanish</h2><p class="dren">“' + esc(d.s[1]) + '”</p><div class="drline">' + st.pick.map((k, j) => '<button class="drtile on" data-act="sk-un" data-j="' + j + '"' + (st.res ? " disabled" : "") + ">" + esc(st.pool[k]) + "</button>").join("") + '</div><div class="drbank">' + st.pool.map((x, k) => '<button class="drtile" data-act="sk-tile" data-k="' + k + '"' + (st.pick.includes(k) || st.res ? " disabled" : "") + ">" + esc(x) + "</button>").join("") + "</div>"; }
    else if (d.type === "gap") { needCheck = false; st.correct = d.opts.indexOf(d.ans); body = '<h2 class="drq">Fill the gap</h2><p class="drsay" lang="es">' + blanks(d.q) + "</p>" + opts(d.opts, st.picked); }
    else if (d.type === "syll") { st.cut = st.cut || []; const L = [...d.w];
      body = '<h2 class="drq">Split into syllables</h2><p class="muted small">Tap between the letters to cut the word.</p><p class="sk-syl" lang="es">' + L.map((c, k) => esc(c) + (k < L.length - 1 ? '<button class="sk-cut' + (st.cut.includes(k + 1) ? " on" : "") + '" data-act="sk-cut" data-k="' + (k + 1) + '"' + (st.res ? " disabled" : "") + ' aria-label="cut after ' + esc(c) + '"></button>' : "")).join("") + "</p>" + skPlay(d.w); }
    else if (d.type === "stress") { needCheck = false; st.correct = d.k; body = '<h2 class="drq">Which syllable is stressed?</h2>' + skPlay(d.w) + '<div class="exopts sk-sylopts">' + d.syl.map((x, k) => '<button class="exopt' + (st.res ? (k === d.k ? " ok" : k === st.picked ? " no" : "") : "") + '" data-act="sk-pick" data-k="' + k + '"' + (st.res ? " disabled" : "") + ">" + esc(x) + "</button>").join("") + "</div>"; }
    else if (d.type === "conj") body = '<h2 class="drq">Conjugate</h2><p class="drsay"><b lang="es">' + esc(d.verb) + "</b> · " + esc(d.person) + '</p><p class="muted small">' + esc(d.tense) + "</p>" + skInput(st);
    else if (d.type === "dict") body = '<h2 class="drq">Type what you hear</h2><div class="row sk-c">' + skPlay(d.s[0]) + skPlay(d.s[0], 1) + "</div>" + skInput(st);
    else if (d.type === "translate") body = '<h2 class="drq">Translate into Spanish</h2><p class="dren">“' + esc(d.s[1]) + '”</p>' + skInput(st, true);
    else if (d.type === "say") { needCheck = false; body = '<h2 class="drq">Say it</h2><p class="drsay" lang="es">' + esc(d.s[0]) + '</p><p class="dren">“' + esc(d.s[1]) + '”</p><div class="row sk-c">' + skPlay(d.s[0]) + '<button class="drplay sk-mic' + (st.rec ? " rec" : "") + '" data-act="sk-mic" aria-label="Speak"' + (st.res ? " disabled" : "") + ">🎤</button></div>" + (st.heard ? '<p class="small">You said: «' + esc(st.heard) + "»</p>" : "") + (st.res ? "" : '<p class="sk-c">' + skBtn("sk-nomic", "Can't speak now", " small") + "</p>"); }
    else if (d.type === "acad") { const it = d.it; if (it.t === "mc") { needCheck = false; st.correct = it.c; body = '<h2 class="drq">' + esc(PXT[it.t] ? PXT[it.t][0] : "Choose") + '</h2><p class="drsay" lang="es">' + blanks(it.q) + "</p>" + opts(it.opts, st.picked); }
      else { const gap = /_{2,}|…/.test(it.q), head = it.t === "x" ? (it.ins || (gap ? "Complete the sentence" : "Answer")) : PXT[it.t] ? PXT[it.t][0] : "Answer";
        body = '<h2 class="drq">' + esc(head) + '</h2><p class="drsay" lang="es">' + blanks(it.q) + "</p>" + skInput(st, it.t === "tr"); } }
    else if (d.type === "readq" || d.type === "exread") { needCheck = false; st.correct = d.c; body = (d.type === "exread" ? '<p class="sk-exam">DELE ' + d.lvl.toUpperCase() + " · Comprensión de lectura · " + esc(d.task) + "</p>" : "") + '<h2 class="drq">' + esc(d.type === "exread" ? d.ins : "Read and answer") + '</h2><div class="sk-text" lang="es">' + esc(d.text || "").replace(/\n/g, "<br>") + '</div><p class="drsay" lang="es"><b>' + esc(d.q) + "</b></p>" + opts(d.opts, st.picked); }
    else if (d.type === "lisq" || d.type === "exlisten") { needCheck = false; st.correct = d.c; body = (d.type === "exlisten" ? '<p class="sk-exam">DELE ' + d.lvl.toUpperCase() + " · Comprensión auditiva · " + esc(d.task) + "</p>" : "") + '<h2 class="drq">' + esc(d.type === "exlisten" ? d.ins : "Listen and answer") + '</h2><div class="row sk-c">' + skPlay(d.say) + skPlay(d.say, 1) + '</div><p class="drsay" lang="es"><b>' + esc(d.q) + "</b></p>" + opts(d.opts, st.picked) + (st.res ? '<details class="small"><summary>Transcript</summary><p lang="es">' + esc(d.say) + "</p></details>" : ""); }
    else if (d.type === "exwrite") body = '<p class="sk-exam">DELE ' + d.lvl.toUpperCase() + ' · Expresión escrita · micro task</p><h2 class="drq" lang="es">' + esc(d.task) + '</h2><p class="dren">' + esc(d.en) + '</p><ul class="small">' + d.pts.map((p) => "<li>" + esc(p.es) + ' <span class="muted">(' + esc(p.en) + ")</span></li>").join("") + '</ul><p class="muted small">At least ' + d.min + " words.</p>" + '<textarea class="sk-in sk-ta" rows="5" lang="es" spellcheck="false"' + (st.res ? " disabled" : "") + ">" + esc(st.val || "") + "</textarea>";
    else if (d.type === "exspeak") { needCheck = false; body = '<p class="sk-exam">DELE ' + d.lvl.toUpperCase() + ' · Expresión oral · micro task</p><h2 class="drq" lang="es">' + esc(d.task) + '</h2><ul class="small">' + (d.points || []).slice(0, 4).map((p) => "<li>" + esc(Array.isArray(p) ? p[0] : p.es || p) + "</li>").join("") + '</ul><p class="muted small">Speak for about ' + Math.round(d.min / 2) + "+ seconds (" + d.min + '+ words).</p><div class="row sk-c"><button class="drplay sk-mic' + (st.rec ? " rec" : "") + '" data-act="sk-mic" aria-label="Speak"' + (st.res ? " disabled" : "") + ">🎤</button></div>" + (st.heard ? '<p class="small">You said: «' + esc(st.heard) + "»</p>" : "") + (st.res ? "" : '<p class="sk-c">' + skBtn("sk-nomic", "Can't speak now", " small") + "</p>"); }
    const fb = st.res ? '<div class="drfb ' + (st.res === "ok" ? "ok" : "no") + '" role="status"><b>' + (st.res === "ok" ? ["¡Muy bien!", "¡Correcto!", "¡Perfecto!", "¡Eso es!"][SK.i % 4] : st.res === "skip" ? "Skipped" : "Casi…") + "</b>" + (st.note ? "<p>" + st.note + "</p>" : "") + (st.claim && st.res === "no" ? skBtn("sk-claim", "My answer is also right", " small") : "") + skBtn("sk-next", "Continue", " primary") + "</div>"
      : '<div class="drfoot">' + skBtn("sk-skip", "Skip") + (needCheck ? skBtn("sk-check", "Check", " primary") : "") + "</div>";
    app.innerHTML = '<div class="stack drill sk">' + top + '<div class="drbody">' + tag + body + "</div>" + fb + "</div>";
    if (!st.played && /^(hearmean|hearpick|dict|lisq|exlisten)$/.test(d.type)) { st.played = 1; setTimeout(() => skSay(d.say || d.s[0]), 300); }
    const inp = document.querySelector(".sk-in"); if (inp && !st.res && (st.hinted || !matchMedia("(pointer: coarse)").matches)) { inp.focus({ preventScroll: true }); if (st.hinted) inp.select(); }
  }
  const skInput = (st, long) => (st.hinted && !st.res ? '<p class="sk-hint" role="status">💡 ' + esc(st.hint || "Almost.") + " Try again.</p>" : "") + '<input class="sk-in" lang="es" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="Type in Spanish…" value="' + esc(st.val || "") + '"' + (st.res ? " disabled" : "") + ">" + skAccBar(st);
  const skAccBar = (st) => st.res ? "" : '<div class="sk-acc">' + ["á", "é", "í", "ó", "ú", "ñ", "ü", "¿", "¡"].map((c) => '<button class="drtile" data-act="sk-acc" data-c="' + c + '">' + c + "</button>").join("") + "</div>";
  function skSay(t, slow) { try { speechSynthesis.cancel(); speechSynthesis.speak(utter(t, "es", slow ? 0.6 : 0.85)); } catch (e) { try { sayText(t); } catch (x) {} } }
  function skResult(ok, note, missedItem, why2) { const d = SK.list[SK.i], st = SK.st; if (st.res) return;
    (SK.log = SK.log || []).push({ type: d.type, ok: ok === true, first: ok === true && !d.retry && !st.hinted, hinted: !!st.hinted, kind: why2 || (ok === true ? "ok" : ok === false ? "wrong" : "skip"), retry: !!d.retry }); st.res = ok === "skip" || ok === "skip-free" ? "skip" : ok ? "ok" : "no"; st.note = note || "";
    try { if (typeof ok === "boolean") sfx(ok); } catch (e) {}
    if (ok === true) { SK.ok++; if (!d.retry && !st.hinted) SK.first++; }
    else if (ok !== "skip-free") { if (!d.retry && SK.retry.length < 4 && !/^(ex|readq|lisq)/.test(d.type)) SK.retry.push(Object.assign({}, d, { retry: true }));
      try { if (missedItem) mistakeAdd(missedItem, SK.id); } catch (e) {} }
    skRender(); }
  function skTyped(d) { const st = SK.st, inp = document.querySelector(".sk-in"); const v = (inp ? inp.value : "").trim(); st.val = v; const P = SK_P[d.lvl] || SK_P.a1;
    let alts, why = "", q = "", t = "x";
    if (d.type === "conj") { alts = d.ans; why = d.why; q = d.verb + " · " + d.person + " (" + d.tense + ")"; }
    else if (d.type === "dict") { alts = [d.s[0]]; q = "Dictation: " + d.s[1]; }
    else if (d.type === "translate") { alts = d.alts && d.alts.length ? d.alts : [d.s[0]]; q = d.s[1]; t = "tr"; }
    else if (d.type === "acad") { alts = d.it.a; why = d.it.why; q = d.it.q; t = d.it.t; }
    else if (d.type === "exwrite") return skWrite(d, v);
    if (!v) return;
    const c = ansCheck(v, alts, { lvl: d.lvl }), show = "<b>" + esc(c.best || alts[0]) + "</b>" + (why ? '<br><span class="why">' + esc(why) + "</span>" : "");
    const mi = d.type === "acad" ? d.it : { t, k: skHash(q) % 100000, q, a: alts, why };
    let close = false; if (c.kind === "wrong" && (d.type === "translate" || (d.type === "acad" && d.it.t === "tr"))) { try { close = alts.some((a) => pcScore(v, a) >= 0.9 && strip(norm(a)) !== strip(norm(v))); } catch (e) {} }
    if (c.kind === "ok") skResult(true, st.hinted ? "Right on the second try: <b>" + esc(c.best || v) + "</b>" + (/[.!?…]$/.test(c.best || v) ? "" : ".") + (st.firstVal ? '<div class="sk-diff">' + (() => { try { return explainAns(st.firstVal, [c.best || v], why).html.replace(/^Almost: only the accents\. /, "You fixed: "); } catch (e) { return ""; } })() + "</div>" : why ? '<br><span class="why">' + esc(why) + "</span>" : "") : why ? esc(why) : "");
    else if ((c.kind === "accent" || c.kind === "near") && !st.hinted) { st.hinted = 1; st.firstVal = v; st.hint = c.hint; st.hintKind = c.kind; try { sfx(false); } catch (e) {} skRender(); }
    else if (close && !st.hinted) skResult(true, "Good. A model answer: " + show);
    else { // word by word: what you wrote, what changes, and why (accent rules, verb forms, agreement…)
      let detail = ""; try { const ex = explainAns(v, [c.best || alts[0]], why); detail = '<div class="sk-diff">' + ex.html.replace(/^Almost: only the accents\. /, "") + "</div>"; } catch (e) {}
      const head = (st.hintKind || c.kind) === "accent" ? "Only the accents are missing now." : st.hinted ? "Not yet." : "";
      skResult(false, (head ? "<b>" + head + "</b>" : "") + (detail ? detail.replace('<div class="sk-diff">', '<div class="sk-diff"><p class="sk-lab">Correct version, with what changes</p>') : "The answer is <b>" + esc(c.best || alts[0]) + "</b>" + (why ? '<br><span class="why">' + esc(why) + "</span>" : "")), mi, st.hintKind || c.kind); if (d.type === "translate") { SK.st.claim = 1; skRender(); } } }
  function skWrite(d, v) { const n = skWords(v).length; if (!n) return;
    const hit = d.pts.filter((p) => (p.kw || []).some((k) => skN(v).includes(skN(k)))).length, need = Math.max(1, Math.ceil(d.pts.length * 0.6));
    const ok = n >= d.min && hit >= need;
    skResult(ok, n + " words · " + hit + " of " + d.pts.length + " points covered" + (n < d.min ? " · write at least " + d.min + " words" : "") + (d.phrases.length ? '<br><span class="small">Useful: ' + d.phrases.map((p) => "<i lang=\"es\">" + esc(p[0]) + "</i>").join(" · ") + "</span>" : "")); }
  function skMic() { const d = SK.list[SK.i], st = SK.st; if (st.rec || st.res) return;
    try { hfStopOthers(); } catch (e) {} try { speechSynthesis.cancel(); } catch (e) {}
    const target = d.type === "say" ? d.s[0] : null;
    const done = (heard) => { st.rec = 0; st.heard = heard || ""; if (!heard) { skRender(); return; }
      if (target) { let sc = 0; try { sc = pcScore(heard, target); } catch (e) {} const P = SK_P[d.lvl] || SK_P.a1; skResult(sc >= P.say, sc >= P.say ? "" : "Try to say every word clearly. Tap 🔊 to hear it again.", sc >= P.say ? null : { t: "x", k: skHash(target) % 100000, q: "Say: " + target, a: [target], why: "" }); }
      else { const n = skWords(heard).length; skResult(n >= d.min, n + " words" + (n >= d.min ? ". Well sustained." : ": try to say more, using the points above.")); } };
    if (typeof SR === "undefined" || !SR) { skResult("skip-free", "Speech recognition isn't available here."); return; }
    const go = () => { const r = new SR(); r.lang = sttLang(); r.continuous = d.type === "exspeak" && !IS_IOS; r.interimResults = false; let heard = ""; st.rec = 1; skRender();
      r.onresult = (ev) => { heard = [...ev.results].map((x) => x[0].transcript).join(" "); }; r.onerror = () => {}; r.onend = () => done(heard);
      SK.rec = r; try { r.start(); } catch (x) { st.rec = 0; skRender(); } if (d.type === "exspeak") setTimeout(() => { try { r.stop(); } catch (x) {} }, 60000); };
    if (typeof IS_IOS !== "undefined" && IS_IOS && typeof MIC_OK !== "undefined" && !MIC_OK) micAsk().then((ok) => ok && go()); else go(); }
  /* ---- Profe's 30-second debrief at the end of every drill set: praise, one thing to watch, encouragement (sandwich) ---- */
  const SK_GRP = { listening: ["hearmean", "hearpick", "dict", "lisq", "exlisten"], speaking: ["say", "exspeak"], pronunciation: ["whichsound", "stress", "syll"], spelling: ["misspell"],
    "sentence building": ["tiles", "gap"], grammar: ["acad", "conj"], vocabulary: ["match", "meaning"], translation: ["translate"], reading: ["readq", "exread"], writing: ["exwrite"] };
  const SK_TIP = { listening: "replay the audio once more before you answer, and listen for the small words", speaking: "say the sentence aloud even when you're not sure: speaking is what makes it stick",
    pronunciation: "say the word slowly and clap each syllable; the stress usually falls on the second-to-last one", spelling: "picture the word before you choose; b and v, ll and y, and missing accents are the usual traps",
    "sentence building": "find the verb first, then build around it", grammar: "check who is doing the action and when, then choose the form", vocabulary: "say each new word aloud with its article",
    translation: "translate the idea, not word by word", reading: "read the question first, then look for the answer in the text", writing: "cover every point of the task before you write more" };
  function skCoach() { const L = (SK.log || []).filter((x) => !x.retry && x.kind !== "skip"), lv = SK.T.lvl || "a1", es = !/^a/.test(lv), name = (typeof TS !== "undefined" && TS.lname) ? ", " + TS.lname : "";
    const g = Object.entries(SK_GRP).map(([k, ts]) => { const xs = L.filter((x) => ts.includes(x.type)); return { k, n: xs.length, ok: xs.filter((x) => x.first).length, hint: xs.filter((x) => x.hinted).length }; }).filter((x) => x.n);
    const n = L.length, first = L.filter((x) => x.first).length, rate = n ? first / n : 0, acc = (SK.log || []).filter((x) => x.kind === "accent").length, near = (SK.log || []).filter((x) => x.kind === "near").length;
    const fixed = (SK.log || []).filter((x) => x.ok && (x.hinted || x.retry)).length, skippedSpeak = (SK.log || []).filter((x) => x.type === "say" && x.kind === "skip").length;
    const best = g.filter((x) => x.n >= 1).sort((a, b) => b.ok / b.n - a.ok / a.n || b.n - a.n)[0], worst = g.filter((x) => x.ok < x.n).sort((a, b) => a.ok / a.n - b.ok / b.n || b.n - a.n)[0];
    const open = rate >= 0.85 ? (es ? "¡Qué bien" + name + "! " : "Great work" + name + "! ") + first + " of " + n + " right first time." : rate >= 0.6 ? (es ? "¡Buen trabajo" + name + "! " : "Good work" + name + "! ") + first + " of " + n + " right first time." : (es ? "¡Bien hecho por terminar" + name + "! " : "Well done for finishing" + name + "! ") + "That set was a stretch, and you saw it through.";
    const strength = best && best.ok ? " Your " + best.k + " was strong" + (best.ok === best.n && best.n > 1 ? ": every one right." : ".") : fixed ? " You fixed " + fixed + " answer" + (fixed > 1 ? "s" : "") + " on the second try, which is exactly how learning works." : "";
    let watch;
    if (acc >= 2 || (acc && acc >= near)) watch = "One thing to watch: accents. " + acc + " answer" + (acc > 1 ? "s were" : " was") + " right except for a tilde or ñ, and the DELE counts those as spelling. Before you press Check, look at each word once more.";
    else if (near >= 2) watch = "One thing to watch: small slips. " + near + " answers were one word or a letter away. Read your answer back once before you check it.";
    else if (worst) watch = "One thing to watch: " + worst.k + " (" + worst.ok + " of " + worst.n + "). Tip: " + SK_TIP[worst.k] + ".";
    else if (skippedSpeak) watch = "One thing to try next time: the speaking drills. Even a quiet try out loud helps a lot.";
    else watch = "To push yourself, try the next part or the chapter challenge, where the exam-style tasks are.";
    const close = rate >= 0.85 ? (es ? "¡Sigue así! " : "Keep it up! ") + "You're ready for the next part." : rate >= 0.6 ? (es ? "¡Vas muy bien! " : "You're on the right track. ") + "One more run of this set tomorrow will lock it in." : (es ? "¡Ánimo! " : "Don't worry: ") + "run this set again later today; the second round is always easier.";
    return { open: open + strength, watch, close, say: open + strength + " " + watch + " " + close }; }
  function skCoachSay(text) { try { window.__pvSayOK = 1; speakMixed(text, () => {}); window.__pvSayOK = 0; } catch (e) { try { speak(text); } catch (x) {} } }
  function skEnd() {
    if (SK.retry.length) { SK.list.push(...SK.retry); SK.retry = []; skRender(); return; }
    const n = SK.list.filter((d) => !d.retry).length, key = SK.id + "|" + SK.si;
    if (!SK.fin) { SK.fin = 1; S.sk = S.sk || {}; const old = S.sk[key]; S.sk[key] = { last: SK.first, n, best: Math.max(SK.first, old ? old.best || 0 : 0), t: Date.now() }; try { actAdd(SK.ok); qBump("drills"); if (SK.first === n) qBump("perfect"); save(); } catch (e) {}
      setTimeout(() => { try { celebrate(SK.first === n); } catch (e) {} }, 250); }
    const skills = {}; SK.list.forEach((d) => Object.entries(SK_T[d.type][2]).forEach(([c, w]) => (skills[c] = (skills[c] || 0) + w)));
    const T = SK.T, nextSi = typeof SK.si === "number" || /^\d+$/.test(SK.si) ? +SK.si + 1 : null, hasNext = nextSi != null && T.secs && T.secs[nextSi] && skBank(SK.id, nextSi, 1).length;
    const C = SK.coach || (SK.coach = skCoach()), pav = (() => { try { return pAvatar(); } catch (e) { return "P"; } })();
    const coach = '<section class="sk-coach" aria-label="Profe\'s feedback"><div class="sk-coach-h"><span class="sk-pav">' + pav + '</span><b>Profe</b><span class="row" style="margin-left:auto;gap:6px"><button class="btn small" data-act="sk-coach-play" aria-label="Play Profe\'s feedback">🔊</button><button class="btn small" data-act="sk-coach-stop" aria-label="Stop">■</button></span></div>' +
      '<p class="sk-c1">' + esc(C.open) + '</p><p class="sk-c2">' + esc(C.watch) + '</p><p class="sk-c3">' + esc(C.close) + "</p></section>";
    if (!SK.coachSaid) { SK.coachSaid = 1; if (!(S.skCoachMute)) setTimeout(() => skCoachSay(C.say), 700); }
    app.innerHTML = '<div class="stack drill sk"><div class="drend"><p class="dr-big">' + (SK.first === n ? "⭐" : "🎉") + "</p><h1>" + (SK.first === n ? "¡Perfecto!" : "¡Bien hecho!") + '</h1><p class="lead2">' + SK.first + " of " + n + " right first time" + (SK.ok > SK.first ? " · " + (SK.ok - SK.first) + " fixed on the second try" : "") + "</p>" +
      '<p class="sk-ic">' + Object.entries(skills).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([c]) => '<span>' + ((SK_SKILL[c] || [c, "•"])[1]) + " " + esc((SK_SKILL[c] || [{ wint: "Written interaction", oint: "Spoken interaction", dis: "Discourse", pra: "Pragmatics", med: "Mediation" }[c] || c])[0]) + "</span>").join("") + "</p>" +
      (SK.outs.length ? '<p class="muted small">Trains: ' + SK.outs.slice(0, 3).map((o) => esc(o.text)).join(" · ") + "</p>" : "") +
      '<div class="row" style="justify-content:center;flex-wrap:wrap"><a class="btn primary" href="' + esc(T.link || "#ejercicios") + '">Back to the lesson</a>' + (hasNext ? '<a class="btn" href="#ejercicios/' + esc(SK.id) + "/" + nextSi + '">Next part</a>' : "") + skBtn("sk-again", "Practise again") + "</div>" + coach + "</div></div>";
  }
  /* ---- hub: #ejercicios ---- */
  function skHub() { const lv = (typeof curLevel === "function" ? curLevel() : "a1") || "a1", L = LV[lv];
    const skills = Object.entries(SK_SKILL).map(([c, [n, ic]]) => '<a class="sk-skill" href="#ejercicios/skill/' + c + "/" + lv + '"><span>' + ic + "</span>" + esc(n) + "</a>").join("");
    const units = (L ? L.units : []).map((u, i) => { const id = lv + "-u" + (i + 1), T = skTopic(id); if (!T) return "";
      return '<details class="sk-unit"><summary><b>' + esc(u.t) + '</b> <span class="muted small">' + T.secs.length + " parts</span></summary><ul>" + T.secs.map((s, si) => { const st = (S.sk || {})[id + "|" + si]; return '<li><a href="#ejercicios/' + id + "/" + si + '">' + esc(s.name) + "</a>" + (st ? ' <span class="muted small">' + st.last + "/" + st.n + "</span>" : "") + "</li>"; }).join("") + '<li><a href="#ejercicios/' + id + '/review"><b>🏁 Chapter challenge</b></a></li></ul></details>'; }).join("");
    app.innerHTML = '<div class="ui-page sk-hub">' + uiTitle("Skill drills", "Short interactive drills for every part of every lesson: listen, speak, spell, build, conjugate, read and write.", "", lv.toUpperCase()) +
      '<p class="small">Level: ' + SK_LV.map((l) => '<a href="#ejercicios" data-act="sk-lv" data-lv="' + l + '"' + (l === lv ? ' aria-current="true"' : "") + ">" + l.toUpperCase() + "</a>").join(" · ") + "</p>" +
      "<h2>Practise one skill</h2><div class=\"sk-skills\">" + skills + "</div><h2>By lesson</h2>" + units + "</div>"; }
  function skRoute(h) { const m = /^ejercicios(?:\/(skill)\/([a-z]+)\/(a1|a2|b1|b2|c1|c2)|\/([a-z0-9-]+)\/(\d+|review))?$/.exec(h); try { if (SK && SK.rec) SK.rec.abort(); } catch (e) {}
    if (!m || (!m[1] && !m[4])) { SK = null; skHub(); return; }
    if (m[1]) { skSkillStart(m[2], m[3]); return; }
    skStart(m[4], m[5]); }
  document.addEventListener("click", (e) => { const b = e.target.closest && e.target.closest("[data-act^='sk-']"); if (!b) return; const a = b.dataset.act;
    if (a === "sk-go") { skMark(b); return; }
    if (a === "sk-lv") { e.preventDefault(); try { S.level = b.dataset.lv; save(); } catch (x) {} skHub(); return; }
    if (!SK) return; const d = SK.list[SK.i], st = SK.st;
    if (a === "sk-play") { skSay(b.dataset.t, !!b.dataset.slow); return; }
    if (a === "sk-again") { skRoute(location.hash.slice(1)); return; }
    if (a === "sk-coach-play") { skCoachSay(SK.coach ? SK.coach.say : ""); return; }
    if (a === "sk-coach-stop") { try { speechSynthesis.cancel(); } catch (x) {} return; }
    if (a === "sk-next") { SK.i++; SK.st = {}; skRender(); scrollTo(0, 0); return; }
    if (a === "sk-claim" && st.res === "no") { st.res = "ok"; st.claim = 0; SK.ok++; if (!d.retry) SK.first++; SK.retry = SK.retry.filter((x) => x.s !== d.s); st.note = "Counted as right. Your answer: «" + esc(st.val || "") + "» · model: <b>" + esc(d.s[0]) + "</b>"; try { (S.skClaims = S.skClaims || []).push({ t: Date.now(), q: d.s[1], model: d.s[0], said: st.val }); S.skClaims = S.skClaims.slice(-200); save(); } catch (e) {} skRender(); return; }
    if (st.res) return;
    if (a === "sk-skip") { const ans = d.type === "tiles" || d.type === "dict" || d.type === "say" || d.type === "translate" ? d.s[0] : d.ans ? [].concat(d.ans)[0] : d.it ? (d.it.t === "mc" ? d.it.opts[d.it.c] : d.it.a[0]) : d.type === "syll" ? d.syl.join("-") : d.type === "stress" ? d.syl[d.k] : d.type === "misspell" ? d.bad + " → " + d.good : "";
      skResult(false, ans ? "Answer: <b>" + esc(ans) + "</b>" : "", d.it || null); return; }
    if (a === "sk-nomic") { skResult("skip-free", "No problem: this one doesn't count."); return; }
    if (a === "sk-mic") { skMic(); return; }
    if (a === "sk-acc") { const i = document.querySelector(".sk-in"); if (i) { const p = i.selectionStart || i.value.length; i.value = i.value.slice(0, p) + b.dataset.c + i.value.slice(p); i.focus(); i.setSelectionRange(p + 1, p + 1); st.val = i.value; } return; }
    if (a === "sk-pick") { const k = +b.dataset.k; st.picked = k; const ok = k === st.correct, it = d.it;
      const why = d.type === "misspell" ? "<b>" + esc(d.bad) + "</b> should be <b>" + esc(d.good) + "</b>." : d.type === "whichsound" ? "Right pronunciation: " + ["A", "B"][st.correct] + ". The stress falls on <b>" + esc(skSyl(d.w)[skStress(d.w)]) + "</b> (" + esc(skSyl(d.w).join("-")) + ")." :
        d.type === "stress" ? (d.why ? esc(d.why) : "Stressed: <b>" + esc(d.syl[d.k]) + "</b> (" + esc(d.syl.join("-")) + ").") : it ? esc(it.why || "") : (d.type === "hearpick" || d.type === "meaning") && d.en ? "«" + esc(d.say) + "» = " + esc(d.en) : d.type === "gap" ? esc(d.why || "") : "";
      const mi = it || (d.opts ? { t: "mc", k: skHash(d.type + (d.say || d.q || d.w || "")) % 100000, q: d.type === "hearmean" ? "🔊 " + d.say : d.q || d.show || d.say || d.w || "", opts: d.opts, c: st.correct, why: "" } : null);
      skResult(ok, (ok ? "" : "Answer: <b>" + esc((d.opts || (it && it.opts) || d.syl || [])[st.correct] || "") + "</b><br>") + why, ok ? null : mi); return; }
    if (a === "sk-m") { const side = b.dataset.side, i = +b.dataset.i; if (!st.sel || st.sel[0] === side) { st.sel = side + i; skRender(); return; }
      const j = +st.sel.slice(1); st.sel = null; if (i === j) { st.done.push(i); try { sfx(true); } catch (x) {} if (st.done.length === d.pairs.length) skResult(!st.err, st.err ? "All matched, with " + st.err + " slip" + (st.err > 1 ? "s" : "") + "." : ""); else skRender(); }
      else { st.err = (st.err || 0) + 1; try { sfx(false); } catch (x) {} skRender(); } return; }
    if (a === "sk-tile") { st.pick.push(+b.dataset.k); skRender(); return; }
    if (a === "sk-un") { st.pick.splice(+b.dataset.j, 1); skRender(); return; }
    if (a === "sk-cut") { const k = +b.dataset.k, i = st.cut.indexOf(k); if (i >= 0) st.cut.splice(i, 1); else st.cut.push(k); skRender(); return; }
    if (a === "sk-check") {
      if (d.type === "tiles") { const v = st.pick.map((k) => st.pool[k]).join(" "); if (!v) return; const ok = skNA(v) === skNA(d.s[0].replace(/[¿¡]/g, "")); skResult(ok, ok ? "«" + esc(d.s[0]) + "»" : "It was: <b>" + esc(d.s[0]) + "</b>", ok ? null : { t: "tr", k: skHash(d.s[0]) % 100000, q: d.s[1], a: [d.s[0]], why: "" }); return; }
      if (d.type === "syll") { const L = [...d.w], cuts = st.cut.slice().sort((x, y) => x - y); let out = "", p = 0; cuts.forEach((c) => { out += L.slice(p, c).join("") + "-"; p = c; }); out += L.slice(p).join("");
        const ok = out === d.syl.join("-"); skResult(ok, (ok ? "" : "It's <b>" + esc(d.syl.join("-")) + "</b>. ") + d.syl.length + " syllables; stressed: <b>" + esc(d.syl[skStress(d.w)]) + "</b>.", ok ? null : { t: "x", k: skHash(d.w) % 100000, q: "Split «" + d.w + "» into syllables", a: [d.syl.join("-")], why: "" }); return; }
      skTyped(d); }
  });
  document.addEventListener("keydown", (e) => { if (e.key === "Enter" && SK && e.target.classList && e.target.classList.contains("sk-in") && !e.target.matches("textarea")) { e.preventDefault(); const b = document.querySelector('[data-act="sk-check"]'); if (b) b.click(); else { const n = document.querySelector('[data-act="sk-next"]'); if (n) n.click(); } } });
  document.addEventListener("input", (e) => { if (SK && e.target.classList && e.target.classList.contains("sk-in")) SK.st.val = e.target.value; });
  // keyboard: when it opens, keep the top of the question (and the drill's progress bar) in view instead of letting the page slide up
  (function () { const vv = window.visualViewport; if (!vv) return; let was = false;
    const fit = () => { const open = window.innerHeight - vv.height > 140; document.body.classList.toggle("kb-open", open); if (open && !was) setTimeout(() => { const f = document.activeElement; if (!f || !/^(INPUT|TEXTAREA)$/.test(f.tagName)) return;
        const top = f.closest(".sk") ? document.querySelector(".sk .drtop") : f.closest("#runner") ? (f.closest("#runner").querySelector(".pxq, .pxcard, h3, p") || f) : f.closest(".drill") ? document.querySelector(".drill .drtop") : null;
        if (top) { const y = top.getBoundingClientRect().top + scrollY - 6; scrollTo(0, Math.max(0, y)); } }, 120); was = open; };
    vv.addEventListener("resize", fit); })();
  window.__sk = { check: ansCheck, render: () => skRender(), bank: skBank, review: skReview, topic: skTopic, gen: skGen, types: SK_T, syl: skSyl, stress: skStress, moveStress: skMoveStress, misspell: skMisspell, outcomes: skOutcomes, state: () => SK, P: SK_P };
