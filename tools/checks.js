  /* ==CHECKS== Active learning (15 Nov 2026): short "Check yourself" questions right after the part of a lesson or guide that teaches them.
     The questions come from the lesson's own practice pool, assigned by what they test; later checks also bring back one question from earlier.
     The full practice at the end stays as a mixed review (it is what completes a unit). Re-run tools/patch_checks.py to update. */
  const QC = {};
  function qcAssign(items, secs) { // items: pxItems(o); secs: [{ text }] → array (one per section) of item indices
    const T = secs.map((s) => toksOf(s.text)), df = {}; T.forEach((t) => t.forEach((w) => (df[w] = (df[w] || 0) + 1)));
    const idf = (w) => Math.log(1 + secs.length / (df[w] || 1)), cap = Math.ceil(items.length / Math.max(1, secs.length)) + 1;
    const out = secs.map(() => []), scored = items.map((it, k) => { const toks = toksOf([it.q, (it.a || []).join(" "), (it.opts || []).join(" "), it.why].join(" "));
      const sc = T.map((t) => { let n = 0; toks.forEach((w) => { if (t.has(w)) n += idf(w); }); return n; }); return { k, sc, best: Math.max(...sc) }; });
    scored.sort((a, b) => b.best - a.best).forEach((x) => { const order = x.sc.map((v, i) => [v, i]).sort((a, b) => b[0] - a[0] || a[1] - b[1]); const pick = order.find(([v, i]) => v > 0 && out[i].length < cap);
      if (pick) out[pick[1]].push(x.k); else { const i = out.map((o, j) => [o.length, j]).sort((a, b) => a[0] - b[0])[0][1]; out[i].push(x.k); } });
    out.forEach((o) => o.sort((a, b) => a - b));
    return out;
  }
  function qcBuild(key, o, secs) { // returns one HTML string per section ("" when it has no questions)
    const items = pxItems(o); if (!items.length) return secs.map(() => ""); const A = qcAssign(items, secs);
    QC[key] = { items, key };
    return A.map((ks, si) => { // from the third section on, one question from two sections back comes round again
      const back = si >= 2 ? (A[si - 2] || [])[0] : undefined, list = ks.map((k) => [k, 0]).concat(back != null && ks.length ? [[back, 1]] : []);
      if (!list.length) return "";
      return '<aside class="qchk" aria-label="Check yourself"><div class="qchk-h"><b>✍️ Check yourself</b><small>' + list.length + " question" + (list.length > 1 ? "s" : "") + " on what you just read</small></div>" +
        list.slice(0, 3).map(([k, rev]) => qcItem(key, k, items[k], rev)).join("") + (list.length > 3 ? '<details class="qcmore"><summary>' + (list.length - 3) + " more question" + (list.length - 3 > 1 ? "s" : "") + "</summary>" + list.slice(3).map(([k, rev]) => qcItem(key, k, items[k], rev)).join("") + "</details>" : "") + "</aside>";
    });
  }
  function qcItem(key, k, it, rev) {
    const head = '<p class="qcq"><span class="qct">' + (rev ? "↺ From earlier · " : "") + PXT[it.t][0] + "</span>" + blanks(it.q) + "</p>";
    const body = it.t === "mc" ? '<div class="qcopts">' + it.opts.map((o, i) => '<button class="btn small" data-act="qc-pick" data-key="' + esc(key) + '" data-k="' + k + '" data-v="' + i + '">' + esc(o) + "</button>").join("") + "</div>"
      : '<form class="qcform" data-key="' + esc(key) + '" data-k="' + k + '"><input class="qcin" autocomplete="off" autocapitalize="off" spellcheck="false" lang="es" aria-label="Your answer" placeholder="' + (it.t === "tr" ? "Translate…" : it.t === "fix" ? "Write it correctly…" : "Your answer…") + '"><button class="btn small primary" type="submit">Check</button><button class="btn small" type="button" data-act="qc-show" data-key="' + esc(key) + '" data-k="' + k + '">Show</button></form>';
    return '<div class="qcitem" data-k="' + k + '">' + head + body + '<div class="qcfb" hidden></div></div>';
  }
  function qcResult(box, it, ok, html) {
    box.classList.add(ok ? "ok" : "no"); const fb = box.querySelector(".qcfb"); fb.hidden = false; fb.innerHTML = html;
    box.querySelectorAll("button, input").forEach((b) => { if (!b.closest(".qcfb")) b.disabled = true; });
    try { sfx(ok); } catch (e) {} try { actAdd(ok ? 2 : 1); if (!ok) mistakeAdd(it, box.closest("[data-qckey]") ? box.closest("[data-qckey]").dataset.qckey : location.hash.slice(1)); } catch (e) {}
  }
  document.addEventListener("click", (e) => {
    const t = e.target.closest && e.target.closest('[data-act="qc-pick"],[data-act="qc-show"]'); if (!t) return; const Q = QC[t.dataset.key]; if (!Q) return; const it = Q.items[+t.dataset.k], box = t.closest(".qcitem");
    if (t.dataset.act === "qc-pick") { const v = +t.dataset.v, ok = v === it.c; box.querySelectorAll('[data-act="qc-pick"]').forEach((b, i) => { if (i === it.c) b.classList.add("ok"); }); if (!ok) t.classList.add("no");
      qcResult(box, it, ok, (ok ? "✓ Correct. " : "✗ Not quite. The answer is <b>" + esc(it.opts[it.c]) + "</b>. ") + (it.why ? '<span class="why">' + esc(it.why) + "</span>" : "")); }
    else qcResult(box, it, false, "The answer is <b>" + esc(it.a[0]) + "</b>" + (it.a.length > 1 ? ' <span class="muted">(also: ' + esc(it.a.slice(1).join(" · ")) + ")</span>" : "") + (it.why ? '<span class="why">' + esc(it.why) + "</span>" : ""));
  });
  document.addEventListener("submit", (e) => {
    const f = e.target.closest && e.target.closest(".qcform"); if (!f) return; e.preventDefault(); const Q = QC[f.dataset.key]; if (!Q) return; const it = Q.items[+f.dataset.k], inp = f.querySelector(".qcin"), val = inp.value;
    if (!val.trim()) { inp.classList.add("shake"); inp.focus(); setTimeout(() => inp.classList.remove("shake"), 400); return; }
    const ex = explainAns(val, it.a, it.why), ok = ex.cls === "ok"; qcResult(f.closest(".qcitem"), it, ok, ok ? "✓ Correct." + (it.why ? '<span class="why">' + esc(it.why) + "</span>" : "") : (ex.cls === "near" ? "" : "✗ Not quite. ") + ex.html);
  });
  window.__qc = { assign: qcAssign, store: QC };
  /* ==/CHECKS== */
