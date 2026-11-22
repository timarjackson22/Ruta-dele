  /* ==SYNANT== Library › Synonyms & antonyms (#sinonimos) and Profe › Practice › Synonyms (v281).
     The list (SA_DATA, tools/synant_data.js) is shown in the Library, searchable and by level. Profe's practice shows each word like
     a flashcard (SINÓNIMO / ANTÓNIMO), the learner says or types ONE right word (any gender/number, accents not judged when spoken),
     then the card turns over with every synonym and antonym. Three tries with clues (first letter, then half of the word), like the
     other practices; after the answer the mic stays off and one big Next waits.
     Spaced repetition, Anki style (SM-2), decided in the background from the number of tries (v282, no buttons): first try = Good,
     second try = Hard, third try or shown = Again. Again comes back in the same session after three other cards; due cards first, then up to 20 new cards a day
     (the chosen level first). Saved in S.syn (cards {key: {e ease, i interval days, r reps, l lapses, d due ms}}, nd/nn new per day).
     Source of truth: tools/synant.js + tools/synant.css + tools/synant_data.js, embedded by python3 tools/patch_synant.py index.html. */
  const SY_LV = ["a1", "a2", "b1", "b2", "c1"], SY_POS = { adj: "adjective", verb: "verb", noun: "noun", adv: "adverb" }, SY_NEW = 20, SY_DAY = 864e5;
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
  // ---------- the Library page ----------
  function synHub() {
    const lv = S.synLv || "all";
    app.innerHTML = '<div class="ui-page syn">' + uiTitle("Synonyms &amp; antonyms", SA.length + " words with their synonyms (≈ same meaning) and antonyms (≠ opposite), A1 to C1. Tap any word to hear it. Practise them with Profe: he shows each word like a flashcard and brings back the ones you find hard more often.", "", "Sinónimos y antónimos") +
      '<div class="row syn-top"><button class="btn primary" data-act="syn-prac">⚡ Practise with Profe</button><input id="syn-q" type="search" placeholder="Search a word (Spanish or English)" aria-label="Search" autocomplete="off"></div>' +
      '<div class="row syn-lvs" role="group" aria-label="Level">' + ["all"].concat(SY_LV).map((l) => '<button class="btn small" data-act="syn-lv" data-v="' + l + '" aria-pressed="' + (l === lv) + '">' + (l === "all" ? "All" : l.toUpperCase()) + "</button>").join("") + "</div>" +
      '<div id="syn-list"></div></div>';
    const q = document.getElementById("syn-q"); if (q) q.addEventListener("input", () => synList());
    synList();
  }
  function synList() {
    const box = document.getElementById("syn-list"); if (!box) return; const lv = S.synLv || "all", q = syN((document.getElementById("syn-q") || {}).value || ""), s = sySt();
    const hit = (e) => !q || [e.w, e.en].concat(e.syn, e.ant).some((x) => syN(x).includes(q));
    const chip = (w) => '<button class="sychip" data-act="say" data-t="' + esc(w) + '" lang="es">' + esc(w) + "</button>";
    let h = "", n = 0;
    SY_LV.filter((l) => lv === "all" || l === lv).forEach((l) => {
      const L = SA.filter((e) => e.lv === l && hit(e)); if (!L.length) return; n += L.length;
      h += '<h2 class="syn-h">' + l.toUpperCase() + ' <span class="muted small">' + L.length + " words</span></h2><div class=\"syn-grid\">" + L.map((e) => {
        const st = [s.c[e.w + "|s"], s.c[e.w + "|a"]].filter(Boolean), dot = !st.length ? "" : st.some((c) => c.i >= 21) ? '<i class="sydot ok" title="Learned"></i>' : '<i class="sydot" title="Practising"></i>';
        return '<div class="syrow"><p class="syh"><button class="sychip head" data-act="say" data-t="' + esc(e.w) + '" lang="es">' + esc(e.w) + "</button>" + dot + ' <small>' + esc(e.en) + " · " + (SY_POS[e.pos] || e.pos) + "</small></p>" +
          (e.syn.length ? '<p class="syl"><span class="syk syn" title="Synonyms">≈</span>' + e.syn.map(chip).join("") + "</p>" : "") + (e.ant.length ? '<p class="syl"><span class="syk ant" title="Antonyms">≠</span>' + e.ant.map(chip).join("") + "</p>" : "") + "</div>"; }).join("") + "</div>";
    });
    box.innerHTML = h || '<p class="muted">No word matches «' + esc(q) + "».</p>";
  }
  window.__sy = { cards: () => SY_CARDS.length, words: () => SA.length, find: (s, l, p) => syFind(s, l, p), plan: (c, g) => syPlan(c, g), st: () => sySt(), pr: () => PR, start: (lv) => startSyn(lv), answer: (s) => syAnswer(s), next: () => syNext(), counts: (lv) => syCounts(lv), when: syWhen };
  /* ==/SYNANT== */
