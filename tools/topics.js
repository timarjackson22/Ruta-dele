  /* ==TOPICS== v293: topic mastery — every graded answer, anywhere in the app, counts towards its topic (a lesson unit,
     a grammar guide, a DELE paper, a flashcard theme, synonyms…). The page #dominio shows how well each topic is going
     and recommends the topics to work on next. Embedded by tools/patch_topics.py. */
  const TM_TENSE = { pres: "guia-presente-futuro", fut: "guia-presente-futuro", pret: "guia-pasados", impf: "guia-pret-imp", cond: "guia-presente-futuro", perf: "guia-haber-perifrasis", plusc: "guia-pasados", subj: "guia-subjuntivo", subjRa: "guia-subjuntivo", subjFut: "guia-subjuntivo", imp: "guia-imperativo" };
  const TM_RULE = (r) => /^ser-estar/.test(r) ? "guia-ser-estar" : /^gustar/.test(r) ? "guia-reflexivos-gustar" : /^pret-/.test(r) ? "guia-pasados" : /^tener-edad/.test(r) ? "guia-tener-hacer-dar-echar" : /^me-llamo/.test(r) ? "a1-u1" : /^(por|para)\b/.test(r) ? "guia-por-para" : "talk";
  const TM_SRC = { lesson: "Lesson checks", drill: "Quick drill", check: "Check yourself", practice: "Practice", exam: "Exams", cards: "Flashcards", profe: "Profe practice", talk: "Conversation with Profe" };
  const TM_EXK = { lectura: "Reading", auditiva: "Listening", escrita: "Writing", oral: "Speaking" };
  function tmSt() { S.tm = S.tm || {}; return S.tm; }
  // record one graded answer: key = topic id, ok = right or wrong, src = where it was answered, note = what was asked
  function tmRec(key, ok, src, note) {
    try {
      if (!key || typeof ok !== "boolean") return; key = String(key);
      const T = tmSt(), t = (T[key] = T[key] || { n: 0, ok: 0, e: 0.5, last: 0, s: {}, w: [] });
      t.n++; if (ok) t.ok++; t.e = t.n === 1 ? (ok ? 1 : 0) : t.e + 0.2 * ((ok ? 1 : 0) - t.e); t.last = Date.now();
      const s = (t.s[src || "practice"] = t.s[src || "practice"] || [0, 0]); s[0]++; if (ok) s[1]++;
      if (!ok) { t.lw = Date.now(); if (note) { t.w.unshift(String(note).slice(0, 90)); t.w = t.w.filter((x, i, a) => a.indexOf(x) === i).slice(0, 4); } }
      clearTimeout(tmRec.t); tmRec.t = setTimeout(() => { try { save(); } catch (e) {} }, 400);
    } catch (e) {}
  }
  window.__tm = tmRec;
  window.__tmTense = (k) => TM_TENSE[k] || "verbs";
  window.__tmRule = TM_RULE;
  function tmLevel(k) {
    const m = /^(a1|a2|b1|b2|c1|c2)\b/.exec(k) || /^(?:exam|tr|dk:|sk|pic)-?(a1|a2|b1|b2|c1|c2)/.exec(k); if (m) return m[1];
    const g = /^guia-(.+)$/.exec(k); if (g) { const x = GUIDES.find((y) => y.id === g[1]); return x && x.lvl ? x.lvl : "all"; }
    return "all";
  }
  const TM_SKN = { words: "Vocabulary", listen: "Listening (dictation)", order: "Word order", speak: "Speaking aloud" };
  function tmLabel(k) {
    let m;
    if (/^(a1|a2|b1|b2|c1|c2|esc)-u\d+$/.test(k) || /^guia-/.test(k)) return srcLabel(k);
    if ((m = /^exam-(\w+)-(\w+)$/.exec(k))) return "DELE " + m[1].toUpperCase() + " · " + (TM_EXK[m[2]] || m[2]);
    if ((m = /^tr-(\w+)$/.exec(k))) return "Translation · " + m[1].toUpperCase();
    if ((m = /^sk-(\w+)-(\w+)$/.exec(k))) return (TM_SKN[m[2]] || m[2]) + " · " + m[1].toUpperCase();
    if ((m = /^pic-(\w+)$/.exec(k))) { let n = m[1]; try { const x = window.__vd.topics().find((y) => y.id === m[1]); if (x && x.en) n = x.en; } catch (e) {} return "Picture words · " + n; }
    if ((m = /^dk:([^:]+)(?::(.+))?$/.exec(k))) { let n = m[1]; try { n = deckName(m[1]).replace(/\s*\(.*\)$/, ""); } catch (e) {} return m[1] === "mine" ? "Flashcards · My words" : m[2] ? m[2] + " (flashcards)" : "Flashcards · " + n; }
    return { syn: "Synonyms & antonyms", talk: "Everyday corrections in conversation", verbs: "Verb forms", words: "Vocabulary" }[k] || k;
  }
  function tmHref(k) {
    if (/^(a1|a2|b1|b2|c1|c2|esc)-u\d+$/.test(k) || /^guia-/.test(k)) return "#" + k;
    if (/^exam-/.test(k)) return "#examenes"; if (/^dk:/.test(k)) return "#repaso"; if (k === "syn") return "#sinonimos"; if (/^pic-/.test(k)) return "#visual/" + k.slice(4);
    if (/^tr-/.test(k) || k === "talk" || k === "verbs") return "#practicar"; return "#drill";
  }
  // mastery: a Bayesian average of all answers blended with the recent trend; confidence grows with the number of answers
  function tmScore(t) {
    const bay = (t.ok + 1) / (t.n + 2), m = t.n >= 3 ? 0.5 * bay + 0.5 * t.e : bay;
    const conf = 1 - Math.exp(-t.n / 6), days = (Date.now() - (t.last || 0)) / 864e5, recentWrong = t.lw && Date.now() - t.lw < 7 * 864e5;
    const status = t.n < 3 ? "new" : m >= 0.85 ? "strong" : m >= 0.65 ? "mid" : "weak";
    const prio = (1 - m) * conf * (recentWrong ? 1.4 : 1) + (status === "strong" && days > 30 ? 0.15 : 0);
    return { m, conf, days, status, prio, stale: status === "strong" && days > 30 };
  }
  function tmList() { const T = tmSt(); return Object.keys(T).filter((k) => T[k].n).map((k) => Object.assign({ k, t: T[k], lv: tmLevel(k), name: tmLabel(k), href: tmHref(k) }, tmScore(T[k]))); }
  // topics to work on: weakest first among topics with enough answers, plus strong topics not practised for a month
  function tmRecs(n) { return tmList().filter((x) => (x.t.n >= 3 && x.m < 0.75) || x.stale).sort((a, b) => b.prio - a.prio).slice(0, n || 5); }
  // a flashcard's topic: a level deck's «Unidad N» card belongs to that lesson; other decks by theme
  window.__tmCard = (deck, src) => { const m = /^Unidad (\d+)$/.exec(src || ""); if (m && /^(a1|a2|b1|b2|c1|c2)$/.test(deck)) return deck + "-u" + m[1]; if (deck === "w2500" || deck === "mine" || /^u-/.test(deck) || !src) return "dk:" + (/^u-/.test(deck) ? "mine" : deck); return "dk:" + deck + ":" + src; };
  window.__tmRecs = tmRecs; window.__tmList = tmList;
  function tmWhere(t) { const e = Object.entries(t.s || {}).map(([s, v]) => [s, v[0] - v[1], v[0]]).filter((x) => x[1] > 0).sort((a, b) => b[1] - a[1]); return e.slice(0, 2).map(([s, w]) => (TM_SRC[s] || s) + " (" + w + " wrong)").join(" · "); }
  const tmAgo = (d) => d < 1 ? "today" : d < 2 ? "yesterday" : Math.round(d) + " days ago";
  const TM_LV = ["all", "a1", "a2", "b1", "b2", "c1", "c2"];
  function tmBar(m) { return '<span class="tmbar"><i style="width:' + Math.round(m * 100) + '%"></i></span>'; }
  function tmView() {
    const L = tmList(), recs = tmRecs(5), lv = S.tmLv || "all", st = (s) => L.filter((x) => x.status === s).length;
    const card = (x) => '<a class="tmrec st-' + x.status + '" href="' + x.href + '"><div class="tmr-top"><span class="tmlv">' + (x.lv === "all" ? "All levels" : x.lv.toUpperCase()) + '</span><b>' + esc(x.name) + '</b></div>' +
      '<div class="tmr-mid">' + tmBar(x.m) + '<span class="tmpct">' + Math.round(x.m * 100) + "%</span></div>" +
      '<p class="tmr-why">' + (x.stale ? "Strong, but not practised for " + Math.round(x.days) + " days — a quick review keeps it." : x.t.ok + " of " + x.t.n + " right" + (tmWhere(x.t) ? " · mostly in " + tmWhere(x.t) : "") + " · last practised " + tmAgo(x.days)) + "</p>" +
      (x.t.w && x.t.w.length && !x.stale ? '<p class="tmr-ex">Recent slip: «' + esc(x.t.w[0]) + "»</p>" : "") + '<span class="tmr-go">Study this topic ›</span></a>';
    const groups = TM_LV.slice(1).concat(["all"]).filter((g) => lv === "all" || g === lv).map((g) => {
      const G = L.filter((x) => x.lv === g).sort((a, b) => a.m - b.m); if (!G.length) return "";
      return '<h2 class="tmh">' + (g === "all" ? "Across levels" : g.toUpperCase()) + "</h2>" + G.map((x) => '<a class="tmrow st-' + x.status + '" href="' + x.href + '"><span class="tmname">' + esc(x.name) + '<small>' + x.t.ok + "/" + x.t.n + " right · " + tmAgo(x.days) + "</small></span>" + tmBar(x.m) + '<span class="tmpct">' + (x.status === "new" ? "—" : Math.round(x.m * 100) + "%") + "</span></a>").join("");
    }).join("");
    app.innerHTML = '<div class="ui-page tmpage">' + uiTitle("Topic mastery", "How well each topic is going", "", "Dominio por temas") +
      '<p class="muted small tmnote">Every answer you give in lessons, drills, exams, flashcards and Profe’s practice counts towards its topic. A topic needs 3 answers before it is scored.</p>' +
      (L.length ? '<div class="tmsum"><span><b>' + L.length + "</b> topics practised</span><span class=\"st-strong\"><b>" + st("strong") + "</b> strong</span><span class=\"st-mid\"><b>" + st("mid") + "</b> getting there</span><span class=\"st-weak\"><b>" + st("weak") + "</b> need work</span></div>" : "") +
      (recs.length ? '<h2 class="tmh">Work on these next</h2><div class="tmrecs">' + recs.map(card).join("") + "</div>"
        : '<div class="tmempty">' + (L.length ? "Nothing needs attention right now — every scored topic is above 75 %. Keep practising to keep it that way." : "Answer a few questions — in a lesson, a quick drill, an exam or with Profe — and your topics will appear here.") + "</div>") +
      (L.length ? '<div class="row tmlvs" role="group" aria-label="Level">' + TM_LV.map((l) => '<button class="btn small" data-act="tm-lv" data-v="' + l + '" aria-pressed="' + (l === lv) + '">' + (l === "all" ? "All" : l.toUpperCase()) + "</button>").join("") + "</div>" + groups : "") + "</div>";
  }
  document.addEventListener("click", (e) => { const b = e.target.closest && e.target.closest('[data-act="tm-lv"]'); if (!b) return; S.tmLv = b.dataset.v; try { save(); } catch (x) {} tmView(); });
  // one line for Home / Progress: the top recommendation
  function tmTeaser() { const r = tmRecs(99); return r.length ? { n: r.length, top: r[0].name } : null; }
  window.__tmTeaser = tmTeaser;
  /* ==/TOPICS== */
