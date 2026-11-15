  /* ===== Word bank: expressions, slang and regional words from Wiktionary (CC BY-SA, via kaikki.org). tools/WORDBANK_BRIEF.md =====
     dictdata/es-xp.json: P = [[expression, pos, English, register tags, places, example]], W = {word: [pos, English, tags, places, forms, primary]}
     dictdata/es-xf.json: {form: base word} for forms the app can't work out (fuese → ir, ponte → poner). Loaded once, offline afterwards. */
  var XP = null, XPP = null;
  // Panamanian Spanish, curated for this app (tools/panama_words.json, tools/PANAMA_WORDS_BRIEF.md): [term, English, register, colour in captions, example, variants]
  /*PANAMA_W*/
  const PAN = new Map(); try { PANAMA_W.words.concat(PANAMA_W.extra || []).forEach((e) => { const o = { t: e[0], en: e[1], r: e[2], c: e[3], ex: e[4], pl: e[6] || ["Panama"] }; [e[0]].concat(e[5] || []).forEach((v) => { if (!PAN.has(v)) PAN.set(v, o); }); }); } catch (e) {}
  const PAN_TAG = { col: ["col"], slg: ["slg"], rude: ["rude"], reg: [], std: [] };
  const XP_TAG = { rude: "rude", col: "colloquial", slg: "slang", vul: "vulgar", der: "offensive", hum: "humorous", eup: "euphemism", net: "internet", aff: "affectionate", old: "dated", arc: "old-fashioned", rar: "rare" };
  const XP_INF = new Set(["col", "slg", "vul", "der"]);
  function loadXP() {
    if (XP) return Promise.resolve(XP);
    if (!XPP) XPP = Promise.all([fetch("dictdata/es-xp.json").then((r) => { if (!r.ok) throw new Error("word bank " + r.status); return r.json(); }), fetch("dictdata/es-xf.json").then((r) => (r.ok ? r.json() : {})).catch(() => ({}))]).then(([b, f]) => {
      const P = new Map(), H = new Map();
      b.P.forEach((e) => { const k = e[0].toLowerCase(); P.set(k, e); e.risky = xpRisky(e); const h = k.split(" ")[0]; (H.get(h) || H.set(h, []).get(h)).push(e); });
      XP = { P, H, W: b.W || {}, F: f || {} };
      // Panama first: its words and expressions join the bank, their Panamanian meaning ahead of any other
      PAN.forEach((o, k) => {
        if (k.includes(" ")) { const e = [k, "phrase", o.en, PAN_TAG[o.r] || [], o.pl, o.ex || null]; e.risky = false; e.pan = 1; P.set(k, e); const h = k.split(" ")[0]; (H.get(h) || H.set(h, []).get(h)).unshift(e); return; }
        const w = XP.W[k], pl = ["Panama"].concat(w ? w[3].filter((x) => x !== "Panama") : []);
        XP.W[k] = ["", o.en + (w ? "; " + w[1] : ""), (PAN_TAG[o.r] || []).concat(w ? w[2] : []), pl, w ? w[4] : [], !!o.c, o.ex || null, 1];
      });
      try { CPH = null; document.querySelectorAll("#ltext .sent").forEach((x) => (x._cue = null)); } catch (e) {} // Verbatim picks up the expressions
      return XP;
    }).catch((e) => { XPP = null; throw e; });
    return XPP;
  }
  // fetched quietly a few seconds after start (cached for offline), or as soon as something needs it
  setTimeout(() => { try { loadXP().catch(() => {}); } catch (e) {} }, 6000);
  // base words of a form: the bank's (a form can belong to several: pares → par, parar), then the app's own table
  const xpLems = (t) => { const out = []; if (XP && XP.F[t]) out.push(...XP.F[t].split("|")); if (typeof TG !== "undefined" && TG[t] && TG[t][0]) out.push(TG[t][0].toLowerCase()); out.push(t); return [...new Set(out)]; };
  const xpLem = (t) => xpLems(t)[0];
  // two-word expressions made of everyday words ("y qué" = so what?, "se puede" = may I?, "ser de"): only when said on their own, never inside a longer sentence
  const XP_STOP = new Set("de la el los las lo que un una unos unas en es y a o se me te le les nos al del con por para su sus mi mis tu tus este esta ese esa no sí si ser estar ha he hay más muy como hasta qué".split(" "));
  function xpRisky(e) { const w = e[0].toLowerCase().split(" "); if (w.length > 2) return false; if (XP_STOP.has(w[w.length - 1]) && !/^(conj|prep|prep_phrase)$/.test(e[1])) return true; if ((e[3] && e[3].length) || (e[4] && e[4].length)) return false; return !/^(adv|conj|prep|prep_phrase)$/.test(e[1]) && w.some((x) => XP_STOP.has(x)); } // labelled ones (qué onda: Mexico, Central America) are distinctive enough
  // places: Panama and its neighbours first (where the learner lives), then the rest
  const XP_NEAR = ["Panama", "Central America", "Costa Rica", "Colombia", "Caribbean", "Latin America"];
  const xpPlaces = (w) => (w || []).slice().sort((a, b) => ((XP_NEAR.indexOf(a) + 1 || 99) - (XP_NEAR.indexOf(b) + 1 || 99)));
  const xpLabels = (reg, where) => { const pl = xpPlaces(where); return [].concat((reg || []).filter((r) => XP_TAG[r]).map((r) => XP_TAG[r]), pl.length ? [pl.slice(0, 4).join(", ") + (pl.length > 4 ? " and more" : "")] : []).join(" · "); };
  const xpFirst = (g) => String(g || "").split(/;\s*/)[0].replace(/^synonym of [^:]+:\s*/i, "").replace(/\s*\([^)]*\)\s*/g, " ").replace(/\s+([.,!?])/g, "$1").replace(/\s+/g, " ").replace(/[.\s]+$/, "").trim();
  // a word that is ONLY informal (every meaning is colloquial/slang/vulgar): coloured like the app's own slang list
  function xpInf(x) {
    { const o = PAN.get(x); if (o && o.c && !o.t.includes(" ")) return { k: "slang", mean: o.en.replace(/\s*\(.*?\)\s*/g, " ").trim(), where: "Panama" }; }
    if (!XP || x.length < 3) return null; const e = XP.W[x]; if (!e || !e[5]) return null;
    try { if (typeof LEX !== "undefined" && LEX) { const k = lexIdx(x); if (k >= 0 && k < LEX.nf) return null; } } catch (er) {} // a common dictionary word is never coloured as slang
    if (!e[2].some((r) => XP_INF.has(r))) return null;
    return { k: "slang", mean: xpFirst(e[1]), where: xpPlaces(e[3]).slice(0, 4).join(", ") || XP_TAG[e[2].find((r) => XP_INF.has(r))] };
  }
  // expressions inside a sentence: literal words, the first word also by its base form (echó una mano → echar una mano; ponte las pilas → ponerse las pilas)
  function xpFind(text) {
    if (!XP || !text) return [];
    const toks = (String(text).toLowerCase().replace(/’/g, "'").match(/[\p{L}\p{M}]+(?:'[\p{L}\p{M}]+)*/gu) || []), out = [];
    for (let i = 0; i < toks.length; i++) {
      let best = null; const t = toks[i], Ls = xpLems(t), cands = [t].concat(Ls, Ls.map((x) => x + "se"), /^(me|te|se|nos|os)$/.test(t) && toks[i + 1] ? xpLems(toks[i + 1]).map((x) => x + "se") : []);
      for (const h of new Set(cands)) for (const e of XP.H.get(h) || []) {
        const w = e[0].toLowerCase().split(" "), refl = /^(me|te|se|nos|os)$/.test(t) && h !== t && h.endsWith("se"), st = refl ? i + 1 : i;
        if (e.risky && toks.length > w.length) continue;
        // a reflexive expression (ponerse las pilas) needs its pronoun: before the verb (me puse) or attached (ponte, ponerte)
        if (h.endsWith("se") && h !== t && !refl && !/(me|te|se|nos|os)$/.test(t)) continue;
        if (w.length < 2 || st + w.length > toks.length + (refl ? 0 : 0)) continue;
        let ok = true; for (let q = 1; q < w.length; q++) { const a = w[q], b = toks[st + q]; if (!(b === a || (a.length >= 4 && (b === a + "s" || b === a + "es")) || (/^(su|sus|mi|mis|tu|tus|nuestro|nuestra)$/.test(b) && /^(su|sus)$/.test(a)) || (a === "alguien" && b) )) { ok = false; break; } }
        if (ok && (!best || w.length > best.n)) best = { a: i, n: w.length + (refl ? 1 : 0), e };
      }
      if (best) { out.push(best); i += best.n - 1; }
    }
    return out;
  }
  // word cards: the expression the word belongs to in this sentence, and informal or regional meanings
  function xpLines(word, sentence, skip) {
    if (!XP) { try { loadXP(); } catch (e) {} return ""; }
    const w = String(word || "").toLowerCase(); let html = "";
    for (const m of xpFind(sentence)) {
      const words = (String(sentence).toLowerCase().replace(/’/g, "'").match(/[\p{L}\p{M}]+(?:'[\p{L}\p{M}]+)*/gu) || []).slice(m.a, m.a + m.n);
      if (!words.includes(w)) continue;
      const e = m.e, lab = xpLabels(e[3], e[4]); if (skip && skip === e[0]) continue; // already explained above
      html += '<p class="xpe"><span class="eyebrow">Expression</span><br><b lang="es">' + esc(e[0]) + "</b> · " + esc(xpFirst(e[2]) || e[2]) + (lab ? ' <span class="pill xpl">' + esc(lab) + "</span>" : "") + "</p>" + (e[5] ? '<p class="small xpx"><i lang="es">' + esc(e[5][0]) + "</i><br>" + esc(e[5][1]) + "</p>" : "");
    }
    const po = PAN.get(w);
    if (po && !po.t.includes(" ")) return html + '<p class="small xpw"><b>🇵🇦 In Panama:</b> ' + esc(po.en) + "</p>" + (po.ex ? '<p class="small xpx"><i lang="es">' + esc(po.ex[0]) + "</i><br>" + esc(po.ex[1]) + "</p>" : "") + (html ? '<p class="tiny muted xpsrc">Expressions and regional words: Wiktionary (CC BY-SA)</p>' : "");
    const x = XP.W[w] || XP.W[xpLem(w)];
    if (x && (!x[2].includes("vul") && !x[2].includes("der") || x[5])) { const lab = xpLabels(x[2], x[3]); if (lab) html += '<p class="small xpw"><b>' + (x[5] ? "Informal/regional" : "Also") + ":</b> " + esc(x[1]) + ' <span class="muted">· ' + esc(lab) + "</span></p>"; }
    return html ? html + '<p class="tiny muted xpsrc">Expressions and regional words: Wiktionary (CC BY-SA)</p>' : "";
  }
  // Profe: "what does … mean" for expressions and informal words
  function xpMeaning(q) {
    q = String(q || "").toLowerCase().replace(/[¿?¡!.,"“”«»]/g, "").trim();
    { const o = PAN.get(q); if (o) return (o.pl[0] === "Panama" ? "🇵🇦 " : "") + "**" + o.t + "** = " + o.en + " *(" + o.pl.slice(0, 3).join(", ") + (o.r === "rude" ? " · rude" : o.r === "slg" ? " · street slang" : o.r === "col" ? " · colloquial" : "") + ")*" + (o.ex ? "\n\n«" + o.ex[0] + "» = " + o.ex[1] : ""); }
    if (!XP) return null;
    let e = XP.P.get(q);
    if (!e) { const f = xpFind(q)[0]; if (f && f.n === q.split(/\s+/).length) e = f.e; }
    if (e) { const lab = xpLabels(e[3], e[4]); return "**" + e[0] + "** = " + e[2].split(/;\s*/).slice(0, 3).join("; ") + " *(expression" + (lab ? " · " + lab : "") + ")*" + (e[5] ? "\n\n«" + e[5][0] + "» = " + e[5][1] : ""); }
    const w = XP.W[q] || XP.W[xpLem(q)]; if (w) { const lab = xpLabels(w[2], w[3]); return "**" + q + "** = " + w[1] + (lab ? " *(" + lab + ")*" : ""); }
    return null;
  }
  // Words › Informal: Panama's words and expressions from the bank, next to the app's own list
  function xpPanamaRows() {
    if (!XP) return []; const rows = [];
    XP.P.forEach((e) => { if ((e[4] || []).includes("Panama") && !e[3].includes("vul")) rows.push([e[0], xpFirst(e[2]), "Expression · Panama" + (e[4].length > 1 ? " and more" : "")]); });
    Object.entries(XP.W).forEach(([w, e]) => { if ((e[3] || []).includes("Panama") && !e[2].includes("vul") && !e[2].includes("der")) rows.push([w, xpFirst(e[1]), "Panama" + (e[3].length > 1 ? " and more" : "")]); });
    return rows;
  }
  window.__xp = { load: loadXP, find: xpFind, inf: xpInf, meaning: xpMeaning, lines: xpLines, lem: xpLem, get: () => XP };
