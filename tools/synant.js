  /* ==SYNANT== Library › Synonyms & antonyms (#sinonimos) and Profe › Practice › Synonyms (v281).
     The list (SA_DATA, tools/synant_data.js) is shown in the Library, searchable and by level. Profe's practice shows each word like
     a flashcard (SINÓNIMO / ANTÓNIMO), the learner says or types ONE right word (any gender/number, accents not judged when spoken),
     then the card turns over with every synonym and antonym. Three tries with clues (first letter, then half of the word), like the
     other practices; after the answer the mic stays off and one big Next waits.
     Spaced repetition, Anki style (SM-2), decided in the background from the number of tries (v282, no buttons): first try = Good,
     second try = Hard, third try or shown = Again. Again comes back in the same session after three other cards; due cards first, then up to 20 new cards a day
     (the chosen level first). Saved in S.syn (cards {key: {e ease, i interval days, r reps, l lapses, d due ms}}, nd/nn new per day).
     Source of truth: tools/synant.js + tools/synant.css + tools/synant_data.js, embedded by python3 tools/patch_synant.py index.html. */
  const SY_LV = ["a1", "a2", "b1", "b2", "c1"], SY_POS = { adj: "adjective", verb: "verb", noun: "noun", adv: "adverb", prep: "preposition" }, SY_NEW = 20, SY_DAY = 864e5;
  const SA = SA_DATA.map(([w, en, lv, pos, s, a]) => ({ w, en, lv, pos, syn: s ? s.split("|") : [], ant: a ? a.split("|") : [] }));
  const syHash = (t) => { let h = 2166136261; for (const ch of String(t)) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); } return (h >>> 0) % 100000; };
  const SY_CARDS = []; SA.forEach((e) => { if (e.syn.length) SY_CARDS.push({ k: e.w + "|s", t: "s", e }); if (e.ant.length) SY_CARDS.push({ k: e.w + "|a", t: "a", e }); });
  const syByKey = (k) => SY_CARDS.find((c) => c.k === k);
  const syN = (s) => String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[¿?¡!.,;:«»"“”()…]/g, " ").replace(/\s+/g, " ").trim();
  function sySt() { S.syn = S.syn || { c: {}, nd: "", nn: 0, cap: 0 }; S.syn.c = S.syn.c || {}; const d = new Date().toDateString(); if (S.syn.nd !== d) { S.syn.nd = d; S.syn.nn = 0; S.syn.cap = 0; } return S.syn; }
  const syNewLeft = () => { const s = sySt(); return SY_NEW + (s.cap || 0) - (s.nn || 0); };
  // the forms a right answer may take: adjectives in any gender and number, reflexive verbs with or without «se»
  function syForms(w, pos) {
    const b = syN(w), out = new Set([b.replace(/^(el|la|los|las|un|una|lo) /, "")]);
    if (pos === "adj" && !/\s/.test(b)) {
      if (/o$/.test(b)) { const r = b.slice(0, -1); ["a", "os", "as"].forEach((x) => out.add(r + x)); }
      else if (/e$|a$/.test(b)) out.add(b + "s");
      else if (/z$/.test(b)) out.add(b.slice(0, -1) + "ces");
      else if (/(or|on|an|in)$/.test(b)) { out.add(b + "a"); out.add(b + "as"); out.add(b + "es"); }
      else out.add(b + "es");
    }
    if (pos === "verb" && /se$/.test(b)) out.add(b.slice(0, -2));
    return out;
  }
  // which word of a list the learner said (a whole word or phrase inside what they said), else null
  function syFind(said, list, pos) {
    const s = " " + syN(said).replace(/^(un|una|el|la|es|son|seria|sería|creo que|pues|mmm|eh) /, "") + " ";
    for (const w of list) for (const f of syForms(w, pos)) if (f && s.includes(" " + f + " ")) return w;
    // typed with one letter wrong in a longer word: right, with the spelling shown
    const t = syN(said); if (window.__prTyped && t.length >= 5 && !/\s/.test(t)) for (const w of list) { const b = syN(w); if (Math.abs(b.length - t.length) <= 1 && syLev(b, t) <= 1) return w; }
    return null;
  }
  function syLev(a, b) { const m = a.length, n = b.length, d = Array.from({ length: m + 1 }, (_, i) => [i]); for (let j = 1; j <= n; j++) d[0][j] = j; for (let i = 1; i <= m; i++) for (let j = 1; j <= n; j++) d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)); return d[m][n]; }
  // SM-2 (Anki): what each grade does to a card, without saving (the buttons show it)
  function syPlan(c0, g) {
    const c = Object.assign({ e: 2.5, i: 0, r: 0, l: 0, d: 0 }, c0 || {}); let ms;
    if (!c.i) { ms = g === 1 ? 60e3 : g === 2 ? 10 * 60e3 : g === 3 ? SY_DAY : 4 * SY_DAY; c.i = g >= 3 ? ms / SY_DAY : 0; if (g === 1 && c.r) c.l++; }
    else if (g === 1) { c.l++; c.e = Math.max(1.3, c.e - 0.2); c.i = 0; ms = 10 * 60e3; }
    else { if (g === 2) { c.e = Math.max(1.3, c.e - 0.15); c.i = Math.max(1, c.i * 1.2); } else if (g === 3) c.i = Math.max(c.i + 1, c.i * c.e); else { c.e += 0.15; c.i = Math.max(c.i + 2, c.i * c.e * 1.3); } c.i = Math.min(Math.round(c.i * 10) / 10, 365); ms = c.i * SY_DAY; }
    c.r++; c.d = Date.now() + ms; c.g = g; return { c, ms };
  }
  const syWhen = (ms) => ms < 60 * 60e3 ? Math.max(1, Math.round(ms / 60e3)) + " min" : ms < SY_DAY ? Math.round(ms / 3600e3) + " h" : ms < 30 * SY_DAY ? Math.round(ms / SY_DAY) + (Math.round(ms / SY_DAY) === 1 ? " day" : " days") : Math.round(ms / (30 * SY_DAY)) + " mo";
  function syGrade(k, g, isNew) {
    const s = sySt(), { c, ms } = syPlan(s.c[k], g); s.c[k] = c; if (isNew) s.nn = (s.nn || 0) + 1;
    try { window.__tm && window.__tm("syn", g >= 2, "profe", k.replace(/\|[sa]$/, "")); } catch (e) {}
    PR.relearn = PR.relearn.filter((x) => x.k !== k); if (g === 1) PR.relearn.push({ k, n: 4 }); else if (g === 2 && c.i === 0) PR.relearn.push({ k, n: 7 }); // n counts down on every pick: back after 3 (or 6) other cards
    try { save(); } catch (e) {} return ms;
  }
  function syCounts(lv) {
    const s = sySt(), now = Date.now(), idx = SY_LV.indexOf(lv), el = SY_CARDS.filter((c) => SY_LV.indexOf(c.e.lv) <= idx);
    return { due: el.filter((c) => s.c[c.k] && s.c[c.k].d <= now).length, seen: el.filter((c) => s.c[c.k]).length, total: el.length, fresh: el.filter((c) => !s.c[c.k]).length };
  }
  function syPick() {
    const s = sySt(), now = Date.now(), idx = SY_LV.indexOf(PR.lv), lastW = PR.it ? PR.it.e.w : "";
    const el = SY_CARDS.filter((c) => SY_LV.indexOf(c.e.lv) <= idx), queued = (k) => PR.relearn.some((x) => x.k === k);
    PR.relearn.forEach((x) => x.n--);
    let r = PR.relearn.filter((x) => x.n <= 0).sort((a, b) => a.n - b.n).find((x) => syByKey(x.k).e.w !== lastW);
    if (r) { PR.relearn = PR.relearn.filter((x) => x !== r); return syByKey(r.k); }
    const due = el.filter((c) => s.c[c.k] && s.c[c.k].d <= now && !queued(c.k) && c.e.w !== lastW).sort((a, b) => s.c[a.k].d - s.c[b.k].d);
    if (due.length) return due[0];
    if (syNewLeft() > 0) {
      const nw = el.filter((c) => !s.c[c.k] && !queued(c.k) && c.e.w !== lastW && !PR.shown.has(c.k));
      if (nw.length) { nw.sort((a, b) => ((a.e.lv === PR.lv ? 0 : 1) - (b.e.lv === PR.lv ? 0 : 1)) || (SY_LV.indexOf(b.e.lv) - SY_LV.indexOf(a.e.lv)) || (syHash(a.k) - syHash(b.k))); return nw[0]; }
    }
    if (PR.relearn.length) { const r2 = PR.relearn.slice().sort((a, b) => a.n - b.n).find((x) => syByKey(x.k).e.w !== lastW) || PR.relearn[0]; PR.relearn = PR.relearn.filter((x) => x !== r2); return syByKey(r2.k); }
    if (PR.extra) { const seen = el.filter((c) => s.c[c.k] && c.e.w !== lastW); if (seen.length) { seen.sort((a, b) => ((s.c[b.k].l || 0) - (s.c[a.k].l || 0)) || (s.c[a.k].d - s.c[b.k].d)); return seen[Math.floor(Math.random() * Math.min(8, seen.length))]; } }
    return null;
  }
  function startSyn(lv) {
    try { stopListening(); } catch (e) {} tCur = null;
    const l0 = lv || PRL || (typeof curLvl === "function" ? curLvl() : "a1"); const L = SY_LV.includes(l0) ? l0 : l0 === "c2" ? "c1" : "a1";
    PR = { kind: "sy", lv: L, it: null, tries: 0, fb: null, over: false, done: 0, first: 0, autoMic: true, relearn: [], shown: new Set(), extra: false, hist: [] };
    ensureSession("Synonyms", "Synonyms & antonyms"); tView = "practice"; syNext(true);
  }
  function syNext(first) {
    if (!PR || PR.kind !== "sy") return; try { stopListening(); } catch (e) {}
    PR.it = syPick(); PR.tries = 0; PR.fb = null; PR.over = false; PR.t0 = Date.now(); PR.wasNew = PR.it ? !sySt().c[PR.it.k] : false; if (PR.it) PR.shown.add(PR.it.k);
    tRender(); if (PR.it) syAsk(); else { try { speakMixed([["¡Terminado por hoy!", true], ["All done for now.", false]], () => {}); } catch (e) {} }
  }
  const syQ = (it) => (it.t === "s" ? "Dime un sinónimo de «" : "Dime un antónimo de «") + it.e.w + "».";
  function syAsk() {
    if (!PR || !PR.it) return; const go = () => { if (PR && PR.kind === "sy" && PR.autoMic && CAN_MIC && !PR.over) listen(prAnswer); };
    let u; try { u = utter(syQ(PR.it), "es", 0.9); u.onend = go; speechSynthesis.cancel(); speechSynthesis.speak(u); } catch (e) { go(); }
  }
  const SY_SHOW = /^(no s[eé]|no lo s[eé]|ni idea|show( me)?( the)? answer|i don'?t know|dime( la respuesta)?|me rindo|give up|la respuesta|reveal)(?![\p{L}])/iu, SY_NEXT = /^(siguiente|next|otra|vale|ok|s[ií]|sigue|continue)(?![\p{L}])/iu, SY_END = /^(termina(r)?|terminamos|basta|stop|end( the)? (practice|session)|i'?m done|that'?s all)$/i, SY_SKIP = /^(skip|salta|pasa)$/i;
  function syAnswer(said) {
    if (!PR || PR.kind !== "sy") return; const s = String(said || "").trim(); if (!s) return;
    if (SY_END.test(s)) return syEnd();
    if (PR.over) { if (SY_NEXT.test(s)) syNext(); return; }
    if (!PR.it) return;
    if (SY_SHOW.test(s)) return syFinish(false, null, true);
    if (SY_SKIP.test(s)) return syNext();
    const it = PR.it, want = it.t === "s" ? it.e.syn : it.e.ant, other = it.t === "s" ? it.e.ant : it.e.syn;
    try { logMsg("u", s); } catch (e) {}
    const hit = syFind(s, want, it.e.pos);
    PR.tries++;
    if (hit) return syFinish(true, hit);
    // what went wrong: the same word, the opposite kind, or just not one of them — then a clue from the second try
    let line;
    if (syFind(s, [it.e.w], it.e.pos)) line = "That's the word itself: I need " + (it.t === "s" ? "another word that means the same." : "a word that means the opposite.");
    else { const o = syFind(s, other, it.e.pos); line = o ? "«" + o + "» is " + (it.t === "s" ? "an antonym (the opposite)" : "a synonym (it means the same)") + ". I asked for " + (it.t === "s" ? "a synonym." : "an antonym.") : "«" + s + "» isn't " + (it.t === "s" ? "a synonym" : "an antonym") + " of «" + it.e.w + "» in my list."; }
    if (PR.tries >= 3) return syFinish(false, null, false, line);
    const c = want[0], lvl = PR.tries >= 2 ? 2 : 1;
    const clue = "🧩 " + c.split(" ").map((w) => adGap(w, lvl)).join(" ") + " (" + c.replace(/\s/g, "").length + " letters)";
    PR.fb = { ok: false, said: s, lines: [line, clue], left: 3 - PR.tries };
    try { logMsg("a", "¡Casi! " + line + " " + clue); } catch (e) {}
    tRender();
    speakMixed([["¡Casi!", true], [lvl >= 2 ? "Te doy otra pista." : "Inténtalo otra vez.", true]], () => { if (PR && PR.kind === "sy" && PR.autoMic && CAN_MIC && !PR.over) listen(prAnswer); });
  }
  function syFinish(pass, hit, gaveUp, why) {
    const it = PR.it, want = it.t === "s" ? it.e.syn : it.e.ant, g = pass ? (PR.tries <= 1 ? 3 : PR.tries === 2 ? 2 : 1) : 1; // v282: how hard it was = how many tries it took
    const ms = syGrade(it.k, g, PR.wasNew);
    const ans = hit || want[0], others = want.filter((x) => x !== ans);
    PR.over = true; PR.done++; if (pass && PR.tries <= 1) PR.first++;
    const [pes, pen] = tpick(pass ? (PR.tries > 1 ? TEACH.again : TEACH.first) : TEACH.reveal);
    PR.fb = { ok: pass, said: PR.fb && PR.fb.said, ans, others, g, ms, praise: pes + " " + pen, gaveUp, why };
    PR.hist.push({ k: it.k, ok: pass, g });
    try { logMsg("a", pes + " " + (pass ? "✓ " : "") + "**" + ans + "**" + (others.length ? " — también: " + others.join(", ") : "")); } catch (e) {}
    try { stopListening(); } catch (e) {}
    tRender();
    const tam = others.length ? " También: " + others.slice(0, 3).join(", ") + "." : "";
    speakMixed([[pes.replace(/[^\p{L}\p{P}\s]/gu, "").trim(), true], [(pass ? "«" + ans + "»." : "La respuesta: «" + ans + "».") + tam, true]], () => {});
  }
  function syEnd() {
    if (!PR) return; const done = PR.done, first = PR.first; try { stopListening(); } catch (e) {}
    try { logMsg("a", "Session ended: " + done + " cards, " + first + " right first time."); } catch (e) {}
    PR = null; tCur = null; tView = "practice"; tRender();
    try { coachToast("Synonyms · " + done + " cards, " + first + " first try"); } catch (e) {}
  }
  function syHTML() {
    const it = PR.it, n = syCounts(PR.lv), left = Math.max(0, syNewLeft());
    let h = '<div class="tscroll adwrap sywrap"><div class="row adexit" style="justify-content:space-between;align-items:center"><button class="btn small" data-act="pr-exit">‹ All practice</button><span class="small muted adstat">' + PR.lv.toUpperCase() + " · " + n.due + " due · " + Math.min(left, n.fresh) + " new today · " + n.seen + "/" + n.total + " started</span></div>";
    h += "<h3>Synonyms &amp; antonyms</h3>";
    if (!it) {
      const s = sySt(), idx = SY_LV.indexOf(PR.lv), nxt = SY_CARDS.filter((c) => SY_LV.indexOf(c.e.lv) <= idx && s.c[c.k]).map((c) => s.c[c.k].d).sort((a, b) => a - b)[0];
      h += '<div class="prbox ok sydone"><p><b>🎉 All caught up!</b></p><p class="small">' + PR.done + " cards this session, " + PR.first + " right first time." + (nxt ? " Next review in " + syWhen(Math.max(60e3, nxt - Date.now())) + "." : "") + "</p>" +
        '<div class="row">' + (n.fresh ? '<button class="btn primary small" data-act="sy-more">Learn 10 more new words</button>' : "") + (n.seen ? '<button class="btn small" data-act="sy-extra">Practise again anyway</button>' : "") + "</div></div></div>";
      return h;
    }
    const want = it.t === "s" ? it.e.syn : it.e.ant, fb = PR.fb;
    h += '<div class="sycard' + (PR.over ? " over" : "") + '"><span class="sytag ' + (it.t === "s" ? "syn" : "ant") + '">' + (it.t === "s" ? "≈ Sinónimo" : "≠ Antónimo") + "</span>" + (PR.wasNew ? '<span class="synew">New</span>' : "") +
      '<p class="syword" lang="es">' + esc(it.e.w) + " " + sayBtn(it.e.w) + '</p><p class="syen">' + esc(it.e.en) + " · " + (SY_POS[it.e.pos] || it.e.pos) + "</p>" +
      (PR.over ? '<div class="syback"><p class="syans ' + (fb.ok ? "ok" : "bad") + '">' + (fb.ok ? "✓ " : "") + '<b lang="es">' + esc(fb.ans) + "</b> " + sayBtn(fb.ans) + "</p>" +
        (fb.others.length ? '<p class="small">' + (it.t === "s" ? "Other synonyms" : "Other antonyms") + ': <span lang="es">' + fb.others.map(esc).join(", ") + "</span></p>" : "") +
        '<p class="small muted">' + (it.t === "s" ? "Antonyms" : "Synonyms") + ': <span lang="es">' + ((it.t === "s" ? it.e.ant : it.e.syn).map(esc).join(", ") || "—") + "</span></p></div>"
        : '<p class="syask">' + (it.t === "s" ? "Say or type a word that means the <b>same</b>." : "Say or type a word that means the <b>opposite</b>.") + "</p>") + "</div>";
    if (fb && !fb.ok && !PR.over) h += '<div class="prbox bad"><p><b>¡Casi!</b> <span class="muted">' + (fb.left === 1 ? "One more try, then I'll show you." : "Try again: " + fb.left + " tries left.") + "</span></p>" + fb.lines.map((l) => (/^🧩/.test(l) ? '<p class="adshape"><span aria-hidden="true">🧩</span> ' + esc(l.replace(/^🧩\s*/, "")).replace(/_+/g, (m) => '<i aria-label="' + m.length + ' letters">' + "_".repeat(m.length) + "</i>") + "</p>" : "<p>" + esc(l) + "</p>")).join("") + "</div>";
    if (PR.over) {
      h += '<div class="prbox ' + (fb.ok ? "ok" : "bad") + ' syres"><p><b>' + esc(fb.praise) + "</b></p>" + (fb.ok ? "" : '<p class="small muted">' + (fb.gaveUp ? "Here's the answer." : (fb.why ? esc(fb.why) + " " : "") + "Here's the answer, after three tries.") + "</p>") +
        "</div>";
    } else h += '<div class="row adbtns"><button class="btn small" data-act="sy-show">Show the answer</button></div>';
    h += "</div>";
    if (PR.over) return h + '<div class="prnextbar"><button class="btn primary prnext" data-act="pr-next">Next <span aria-hidden="true">›</span></button></div>';
    return h + '<div class="t-live" id="t-live" hidden></div><form class="tform" id="pr-form">' + (CAN_MIC ? '<button class="micbtn" type="button" data-act="pr-mic" aria-label="Speak">' + MIC + "</button>" : "") + '<label class="sr" for="pr-input">Type your answer</label><input id="pr-input" autocomplete="off" autocapitalize="off" placeholder="' + (CAN_MIC ? "Say or type" : "Type") + ' one word"><button class="btn primary" type="submit">OK</button></form>';
  }
  document.addEventListener("click", (e) => {
    const b = e.target.closest && e.target.closest('[data-act^="sy-"],[data-act^="syn-"]'); if (!b) return; const a = b.dataset.act;
    if (a === "sy-show") { if (PR && PR.kind === "sy" && PR.it && !PR.over) syFinish(false, null, true); }
    else if (a === "sy-more") { const s = sySt(); s.cap = (s.cap || 0) + 10; try { save(); } catch (x) {} syNext(); }
    else if (a === "sy-extra") { if (PR) PR.extra = true; syNext(); }
    else if (a === "syn-lv") { S.synLv = b.dataset.v; try { save(); } catch (x) {} synList(); document.querySelectorAll('[data-act="syn-lv"]').forEach((x) => x.setAttribute("aria-pressed", x.dataset.v === S.synLv)); }
    else if (a === "syn-prac") { try { tOpen(); } catch (x) {} setTimeout(() => startSyn(S.synLv && S.synLv !== "all" ? S.synLv : null), 60); }
  });
  // ---------- the Library page (v283: progress card, word spotlight, kind / level filters, A–Z bar, rows that open) ----------
  const SY_KINDS = [["all", "All"], ["adj", "Adjectives"], ["verb", "Verbs"], ["noun", "Nouns"], ["adv", "Adverbs & more"]];
  const syKindOf = (e) => (e.pos === "prep" ? "adv" : e.pos);
  const syLetter = (w) => syN(w).charAt(0).toUpperCase();
  function synHub() {
    const lv = S.synLv || "all", kd = S.synPos || "all", s = sySt(), now = Date.now();
    const seen = SY_CARDS.filter((c) => s.c[c.k]).length, learned = SY_CARDS.filter((c) => s.c[c.k] && s.c[c.k].i >= 21).length, due = SY_CARDS.filter((c) => s.c[c.k] && s.c[c.k].d <= now).length;
    const pct = Math.round(100 * seen / SY_CARDS.length), R = 26, C = 2 * Math.PI * R;
    app.innerHTML = '<div class="ui-page syn">' + uiTitle("Synonyms &amp; antonyms", SA.length + " words · ≈ same meaning · ≠ opposite", "", "Sinónimos y antónimos") +
      '<div class="syn-hero"><svg class="syn-ring" viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="' + R + '" class="bg"/><circle cx="32" cy="32" r="' + R + '" class="fg" stroke-dasharray="' + (C * pct / 100).toFixed(1) + " " + C.toFixed(1) + '"/><text x="32" y="37" text-anchor="middle">' + pct + '%</text></svg>' +
      '<div class="syn-stats"><b>' + seen + "</b> of " + SY_CARDS.length + " cards started<br><b>" + learned + "</b> learned · <b>" + due + '</b> due now</div><button class="btn primary syn-go" data-act="syn-prac">⚡ ' + (due ? "Practise · " + due + " due" : "Practise") + "</button></div>" +
      '<div class="row syn-ra"><button class="btn syn-rab" data-act="syn-ra">🔊 Read the list aloud</button><span class="small muted">Hands-free: each word, its meaning, then its synonyms and antonyms.</span></div>' +
      '<input id="syn-q" type="search" placeholder="Search a word in Spanish or English" aria-label="Search" autocomplete="off">' +
      '<div class="syn-kinds" role="group" aria-label="Kind of word">' + SY_KINDS.map(([k, n]) => '<button class="syn-kind k-' + k + '" data-act="syn-pos" data-v="' + k + '" aria-pressed="' + (k === kd) + '">' + n + " <small>" + (k === "all" ? SA.length : SA.filter((e) => syKindOf(e) === k).length) + "</small></button>").join("") + "</div>" +
      '<div class="row syn-lvs" role="group" aria-label="Level">' + ["all"].concat(SY_LV).map((l) => '<button class="btn small" data-act="syn-lv" data-v="' + l + '" aria-pressed="' + (l === lv) + '">' + (l === "all" ? "All levels" : l.toUpperCase()) + "</button>").join("") + "</div>" +
      '<nav class="syn-az" id="syn-az" aria-label="Jump to a letter"></nav><div id="syn-list"></div></div>';
    const q = document.getElementById("syn-q"); if (q) q.addEventListener("input", () => synList());
    synList();
  }
  function synList() {
    const box = document.getElementById("syn-list"); if (!box) return; const lv = S.synLv || "all", kd = S.synPos || "all", q = syN((document.getElementById("syn-q") || {}).value || ""), s = sySt();
    const hit = (e) => (lv === "all" || e.lv === lv) && (kd === "all" || syKindOf(e) === kd) && (!q || [e.w, e.en].concat(e.syn, e.ant).some((x) => syN(x).includes(q)));
    const chip = (w) => '<button class="sychip" data-act="say" data-t="' + esc(w) + '" lang="es">' + esc(w) + "</button>";
    const L = SA.filter(hit).sort((a, b) => syN(a.w).localeCompare(syN(b.w))); SY_L = L; if (SYR.on) { SYR.i = 0; synRaGo(0); }
    const groups = []; L.forEach((e) => { const k = syLetter(e.w); if (!groups.length || groups[groups.length - 1][0] !== k) groups.push([k, []]); groups[groups.length - 1][1].push(e); });
    const az = document.getElementById("syn-az"); if (az) az.innerHTML = groups.length > 1 ? groups.map(([k]) => '<button data-act="syn-az" data-v="' + k + '">' + k + "</button>").join("") : "";
    box.innerHTML = groups.length ? '<p class="small muted syn-count">' + L.length + " word" + (L.length === 1 ? "" : "s") + " · tap a word to open it</p>" + groups.map(([k, G]) => '<h2 class="syn-h" id="syn-l-' + k + '">' + k + "</h2><div class=\"syn-grid\">" + G.map((e) => {
      const st = [s.c[e.w + "|s"], s.c[e.w + "|a"]].filter(Boolean), dot = !st.length ? "" : st.some((c) => c.i >= 21) ? '<i class="sydot ok" title="Learned"></i>' : '<i class="sydot" title="Practising"></i>';
      return '<div class="syrow p-' + syKindOf(e) + (q ? " open" : "") + '" data-w="' + esc(e.w) + '"><div class="syh" data-act="syn-open"><button class="sychip head" data-act="say" data-t="' + esc(e.w) + '" lang="es">' + esc(e.w) + "</button>" + dot + '<small class="sy-en">' + esc(e.en) + '</small><span class="sy-meta"><i class="sylv">' + e.lv.toUpperCase() + "</i>" + (e.syn.length ? '<i class="sycnt syn">≈' + e.syn.length + "</i>" : "") + (e.ant.length ? '<i class="sycnt ant">≠' + e.ant.length + "</i>" : "") + '<i class="sychev" aria-hidden="true">›</i></span></div>' +
        '<div class="sybody">' + (e.syn.length ? '<p class="syl"><span class="syk syn" title="Synonyms">≈</span>' + e.syn.map(chip).join("") + "</p>" : "") + (e.ant.length ? '<p class="syl"><span class="syk ant" title="Antonyms">≠</span>' + e.ant.map(chip).join("") + "</p>" : "") + "</div></div>"; }).join("") + "</div>").join("")
      : '<p class="muted">No word matches' + (q ? " «" + esc(q) + "»" : "") + ".</p>";
  }
  // ---------- read the list aloud (v284): hands-free, follows the filters; the word being read is lit and opened, the list scrolls with it
  let SY_L = [];
  const SYR = { on: 0, i: 0, paused: 0, gen: 0, rate: 1 }, SYR_RATES = [0.75, 1, 1.25];
  window.__synSeq = [];
  function synRaSay(txt, lang, g, done) {
    if (g !== SYR.gen || !document.querySelector(".syn")) return; window.__synSeq.push(lang + ":" + txt);
    let fin = 0; const next = () => { if (fin) return; fin = 1; if (g === SYR.gen) setTimeout(() => g === SYR.gen && done(), (lang === "en" ? 350 : 450) / SYR.rate); };
    try { const u = utter(txt, lang, (lang === "es" ? 0.88 : 0.95) * SYR.rate); u.onend = next; u.onerror = next; speechSynthesis.speak(u); setTimeout(next, (1200 + txt.length * 140) / SYR.rate); } catch (x) { next(); }
  }
  function synRaUI() {
    const on = !!SYR.on, b = document.querySelector('[data-act="syn-ra"]'); if (b) b.textContent = on ? "⏹ Stop reading" : "🔊 Read the list aloud";
    document.body.classList.toggle("syn-on", on); let bar = document.getElementById("syn-player");
    if (on && !bar && document.querySelector(".syn")) { document.querySelector(".syn").insertAdjacentHTML("beforeend", '<div class="player vd-player syn-player" id="syn-player" role="group" aria-label="List reader"><button class="pbtn" data-act="syn-ra-prev" aria-label="Previous word">' + PREV + '</button><button class="pbtn main" id="syn-ra-play" data-act="syn-ra-play" aria-label="Pause">' + PAUSE + '</button><button class="pbtn" data-act="syn-ra-next" aria-label="Next word">' + NEXT + '</button><span class="ppos" id="syn-ra-pos"></span><button class="pbtn vd-rate" data-act="syn-ra-rate" id="syn-ra-rate" aria-label="Speed">1×</button><button class="pbtn vd-x" data-act="syn-ra-x" aria-label="Stop reading">✕</button></div>'); }
    if (!on && bar) bar.remove(); if (!on) document.querySelectorAll(".syrow.on").forEach((r) => r.classList.remove("on")); synRaBar();
  }
  function synRaBar() { const b = document.getElementById("syn-ra-play"), pos = document.getElementById("syn-ra-pos"), r = document.getElementById("syn-ra-rate");
    if (b) { b.innerHTML = SYR.paused ? PLAY : PAUSE; b.setAttribute("aria-label", SYR.paused ? "Play" : "Pause"); } if (pos) pos.textContent = (SY_L.length ? Math.min(SY_L.length, SYR.i + 1) : 0) + " / " + SY_L.length; if (r) r.textContent = String(SYR.rate).replace(/^0/, "") + "×"; }
  function synRaShow(i) {
    document.querySelectorAll(".syrow.on").forEach((r) => r.classList.remove("on")); const e = SY_L[i]; if (!e) return;
    const r = document.querySelector('.syrow[data-w="' + CSS.escape(e.w) + '"]'); if (!r) return; r.classList.add("on", "open");
    const az = document.getElementById("syn-az"), top = (az ? az.getBoundingClientRect().bottom : 110) + 8, bar = document.getElementById("syn-player"), bot = (bar ? bar.getBoundingClientRect().top : innerHeight) - 10, R = r.getBoundingClientRect();
    if (R.top < top || R.bottom > bot) scrollTo({ top: Math.max(0, scrollY + R.top - top - 4), behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  }
  function synRaStep(g) {
    if (g !== SYR.gen || SYR.paused || !SYR.on) return;
    if (SYR.i >= SY_L.length) { SYR.paused = 1; SYR.i = Math.max(0, SY_L.length - 1); synRaBar(); return; }
    const e = SY_L[SYR.i]; synRaShow(SYR.i); synRaBar();
    const seq = [[e.w, "es"], [e.en, "en"]]; if (e.syn.length) seq.push(["Sinónimos: " + e.syn.join(", ") + ".", "es"]); if (e.ant.length) seq.push(["Antónimos: " + e.ant.join(", ") + ".", "es"]);
    const run = (k) => { if (k >= seq.length) { SYR.i++; setTimeout(() => synRaStep(g), 700 / SYR.rate); return; } synRaSay(seq[k][0], seq[k][1], g, () => run(k + 1)); };
    run(0);
  }
  function synRaGo(i) { const g = ++SYR.gen; try { speechSynthesis.cancel(); } catch (x) {} SYR.i = Math.max(0, Math.min(SY_L.length - 1, i)); if (SYR.paused) { synRaShow(SYR.i); synRaBar(); } else synRaStep(g); }
  function synRaStop() { SYR.gen++; SYR.on = 0; SYR.paused = 0; try { speechSynthesis.cancel(); } catch (x) {} synRaUI(); }
  addEventListener("hashchange", () => { if (SYR.on) { SYR.gen++; SYR.on = 0; try { speechSynthesis.cancel(); } catch (x) {} document.body.classList.remove("syn-on"); } });
  document.addEventListener("click", (e) => {
    const b = e.target.closest && e.target.closest('[data-act="syn-pos"],[data-act="syn-az"],[data-act="syn-open"],[data-act^="syn-ra"]'); if (!b) return; const a = b.dataset.act;
    if (a === "syn-pos") { S.synPos = b.dataset.v; try { save(); } catch (x) {} document.querySelectorAll('[data-act="syn-pos"]').forEach((x) => x.setAttribute("aria-pressed", x.dataset.v === S.synPos)); synList(); }
    else if (a === "syn-az") { const h = document.getElementById("syn-l-" + b.dataset.v); if (h) { const top = h.getBoundingClientRect().top + scrollY - ((document.getElementById("syn-az") || {}).offsetHeight || 0) - (parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--hdrH")) || 56) - 6; scrollTo({ top, behavior: "smooth" }); } }
    else if (a === "syn-open") { if (SYR.on) { const k = SY_L.findIndex((x) => x.w === b.parentElement.dataset.w); if (k >= 0) { e.preventDefault(); e.stopPropagation(); SYR.paused = 0; synRaGo(k); return; } } if (e.target.closest('[data-act="say"]')) return; b.parentElement.classList.toggle("open"); }
    else if (a === "syn-ra") { if (SYR.on) synRaStop(); else { const v = document.querySelector(".syrow"), k = Math.max(0, SY_L.findIndex((x) => { const r = document.querySelector('.syrow[data-w="' + CSS.escape(x.w) + '"]'); return r && r.getBoundingClientRect().top > 120; })); SYR.on = 1; SYR.paused = 0; synRaUI(); synRaGo(v ? k : 0); } }
    else if (a === "syn-ra-play") { SYR.paused = SYR.paused ? 0 : 1; if (SYR.paused) { SYR.gen++; try { speechSynthesis.cancel(); } catch (x) {} synRaBar(); } else synRaGo(SYR.i); }
    else if (a === "syn-ra-prev") synRaGo(SYR.i - 1);
    else if (a === "syn-ra-next") synRaGo(SYR.i + 1);
    else if (a === "syn-ra-rate") { SYR.rate = SYR_RATES[(SYR_RATES.indexOf(SYR.rate) + 1) % SYR_RATES.length]; synRaBar(); if (!SYR.paused) synRaGo(SYR.i); }
    else if (a === "syn-ra-x") synRaStop();
  });
  window.__synRa = () => ({ on: SYR.on, i: SYR.i, paused: SYR.paused, rate: SYR.rate, n: SY_L.length, w: SY_L[SYR.i] && SY_L[SYR.i].w, seq: window.__synSeq });
  window.__sy = { cards: () => SY_CARDS.length, words: () => SA.length, find: (s, l, p) => syFind(s, l, p), plan: (c, g) => syPlan(c, g), st: () => sySt(), pr: () => PR, start: (lv) => startSyn(lv), answer: (s) => syAnswer(s), next: () => syNext(), counts: (lv) => syCounts(lv), when: syWhen };
  /* ==/SYNANT== */
