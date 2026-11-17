  /* ==FRASES== Library › Sentence patterns (#frases): the most-used everyday structures, each in several tenses.
     Data: tools/frases/data*.py → FRASES (embedded by tools/frases/build.py). Also a flashcard deck (VPRO "frases") and Profe practice (PR.pat). */
  const FR_T = { pres: ["Present", "a1"], imp: ["Command", "a1"], fut: ["Future", "a1"], pret: ["Past (preterite)", "a2"], impf: ["Past (imperfect)", "a2"], perf: ["Present perfect", "a2"], cond: ["Conditional", "a2"], subj: ["Subjunctive", "b1"], impsub: ["Past subjunctive", "b1"], pqp: ["Past perfect", "b1"] };
  const FR_TG = { all: ["All", null], pres: ["Present", ["pres", "imp"]], past: ["Past", ["pret", "impf", "perf", "pqp"]], fut: ["Future", ["fut", "cond"]], subj: ["Subj.", ["subj", "impsub"]] };
  const FRV = { cat: "all", tg: "all", lv: "all", q: "" };
  const frLvN = (l) => ["a1", "a2", "b1", "b2", "c1", "c2"].indexOf(l);
  try { VPRO.push({ id: "frases", t: "Estructuras de frases", en: "Sentence patterns · " + FRASES.pats.reduce((n, p) => n + p.v.length, 0) + " everyday sentences",
    themes: Object.keys(FRASES.cats).map((c) => ({ t: FRASES.cats[c][1], en: FRASES.cats[c][0], w: [].concat(...FRASES.pats.filter((p) => p.c === c).map((p) => p.v.map((v) => [v[1], v[2]]))) })) }); } catch (e) {}
  function frMatch(p) {
    if (FRV.cat !== "all" && p.c !== FRV.cat) return null;
    if (FRV.lv !== "all" && frLvN(p.l) > frLvN(FRV.lv)) return null;
    const T = FR_TG[FRV.tg][1], q = FRV.q.trim().toLowerCase();
    const vs = p.v.filter((v) => !T || T.includes(v[0]));
    if (!vs.length) return null;
    if (q && !(p.es + " " + p.en + " " + p.v.map((v) => v[1] + " " + v[2]).join(" ")).toLowerCase().includes(q)) return null;
    return vs;
  }
  function frasesView() {
    const C = FRASES.cats, nS = FRASES.pats.reduce((n, p) => n + p.v.length, 0);
    const pill = (act, v, cur, label) => '<button type="button" data-act="' + act + '" data-v="' + v + '" aria-pressed="' + (cur === v) + '">' + label + "</button>";
    const groups = Object.keys(C).map((c) => {
      const items = FRASES.pats.map((p, pi) => [p, pi, p.c === c ? frMatch(p) : null]).filter((x) => x[2]);
      if (!items.length) return "";
      return '<section class="fr-g"><h2 class="fr-gh"><span>' + esc(C[c][0]) + '</span><small lang="es">' + esc(C[c][1]) + "</small></h2>" + items.map(([p, pi, vs]) =>
        '<article class="fr-p"><header><span class="fr-lv">' + p.l.toUpperCase() + '</span><h3 lang="es">' + esc(p.es) + "</h3><p>" + esc(p.en) + "</p></header>" +
        (p.tip ? '<p class="fr-tip">' + esc(p.tip) + "</p>" : "") +
        '<ul class="fr-vs">' + vs.map((v) => '<li class="fr-v" data-es="' + esc(v[1]) + '" data-en="' + esc(v[2]) + '"><span class="fr-t t-' + v[0] + '">' + FR_T[v[0]][0] + '</span><div><b lang="es">' + esc(v[1]) + "</b><span>" + esc(v[2]) + "</span></div>" + sayBtn(v[1]) + "</li>").join("") + "</ul>" +
        '<button type="button" class="fr-ask" data-act="fr-profe" data-p="' + pi + '">Practise this pattern with Profe ›</button></article>').join("") + "</section>";
    }).join("");
    app.innerHTML = '<div class="stack fr">' +
      '<p class="crumbs"><a href="#biblioteca">Library</a><span aria-hidden="true">›</span><span>Sentence patterns</span></p>' +
      '<header class="fr-head"><p class="eyebrow">Estructuras de frases</p><h1>Sentence patterns</h1><p class="fr-sub">' + FRASES.pats.length + " structures that carry everyday conversation, " + nS.toLocaleString("en") + " example sentences in the present, past, future and more. Tap ▶ to hear one, or play them all.</p>" +
      '<div class="fr-acts"><button type="button" class="btn primary" data-act="gp-play">▶ Play all: English, then Spanish</button><a class="btn" href="#repaso-frases">Flashcards</a><button type="button" class="btn" data-act="fr-profe" data-c="' + FRV.cat + '">Practise with Profe</button></div></header>' +
      '<input class="fr-q" type="search" placeholder="Search: quiero, tener que, I used to…" value="' + esc(FRV.q) + '" data-act="fr-q" aria-label="Search sentence patterns">' +
      '<div class="lh-pills fr-cats" role="group" aria-label="Topic">' + pill("fr-cat", "all", FRV.cat, "All topics") + Object.keys(C).map((c) => pill("fr-cat", c, FRV.cat, esc(C[c][0]))).join("") + "</div>" +
      '<div class="lh-seg" role="group" aria-label="Tense">' + Object.keys(FR_TG).map((k) => pill("fr-tg", k, FRV.tg, FR_TG[k][0])).join("") + "</div>" +
      '<div class="lh-seg" role="group" aria-label="Level">' + [["all", "All levels"], ["a1", "A1"], ["a2", "A2"], ["b1", "B1"], ["b2", "B2"]].map(([v, n]) => pill("fr-lv", v, FRV.lv, n)).join("") + "</div>" +
      (groups || '<p class="lh-empty">No patterns match. Try another word or topic.</p>') +
      '<p class="lh-foot">Spanish as spoken in Latin America (ustedes), with notes where Spain differs.</p></div>';
  }
  document.addEventListener("click", (e) => {
    const b = e.target.closest && e.target.closest('[data-act^="fr-"]'); if (!b) return; const a = b.dataset.act;
    if (a === "fr-cat" || a === "fr-tg" || a === "fr-lv") { FRV[a.slice(3) === "tg" ? "tg" : a.slice(3)] = b.dataset.v; frasesView(); }
    else if (a === "fr-profe") { const pi = b.dataset.p != null ? +b.dataset.p : null, c = b.dataset.c && b.dataset.c !== "all" ? b.dataset.c : null; try { tOpen(); } catch (x) {} setTimeout(() => startPatterns(pi != null ? { p: pi } : c ? { cat: c } : {}), 60); }
  });
  document.addEventListener("input", (e) => { const t = e.target; if (t && t.dataset && t.dataset.act === "fr-q") { FRV.q = t.value; clearTimeout(t._t); t._t = setTimeout(() => { const pos = t.selectionStart; frasesView(); const n = app.querySelector(".fr-q"); if (n) { n.focus(); try { n.setSelectionRange(pos, pos); } catch (x) {} } }, 250); } });
  // Profe: Profe says the English, you say it in Spanish (the adaptive translation engine, fed with these sentences)
  function frBank(lv, sel) {
    const L = frLvN(lv), out = [];
    FRASES.pats.forEach((p, pi) => {
      if (sel && sel.p != null && pi !== sel.p) return; if (sel && sel.cat && p.c !== sel.cat) return;
      if (!(sel && sel.p != null) && frLvN(p.l) > L) return;
      p.v.forEach((v, vi) => { if (!(sel && sel.p != null) && frLvN(FR_T[v[0]][1]) > L) return;
        const it = { id: "fr-" + pi + "-" + vi, dir: "en-es", src: v[2], ans: [v[1]], note: p.es + " · " + FR_T[v[0]][0], topic: "fr", ui: 0 };
        try { it.tags = adTags(v[1]); } catch (x) { it.tags = []; } it.tags.push("d:en-es"); try { it.len = adToks(v[1]).length; } catch (x) { it.len = 6; } out.push(it); });
    });
    return out;
  }
  function frPick(lv) { const recent = new Set((PR && PR.recent) || []), B = frBank(lv, PR && PR.pat), fresh = B.filter((it) => !recent.has(it.id)); const P = fresh.length ? fresh : B; return P.length ? P[Math.floor(Math.random() * P.length)] : null; }
  async function startPatterns(sel) { await adStart("tr", { pat: sel || {} }); }
  /* ==/FRASES== */
