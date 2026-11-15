"""Redo any answered question, anywhere (learner's request, 15 Nov 2026): clear one answer (right or wrong) and try it again.
- Practice runner (units, guides, grammar pages…): "↺ Redo this question" on an answered question; "Go through my answers" at the start/end.
- Multiple-choice lists (listening and reading texts, videos, mock tests, practice forms): "↺ Redo" on every answered question; what was
  saved for it (a video's quiz answers) is cleared too.
- Exam papers: answers can be changed until the paper is submitted; after that, "Start again".
Usage: python3 tools/patch_redo.py index.html"""
import sys
p = sys.argv[1]; s = open(p, encoding="utf-8").read()
if "function qRedo(" in s: sys.exit("already patched")
def rep(a, b, n=1):
    global s
    assert s.count(a) == n, ("anchor", a[:90], s.count(a)); s = s.replace(a, b)
rep('''(answered ? '<button class="btn primary" data-act="px-next">' + (PX.i + 1 < n ? "Next question →" : "See results") + "</button>"''',
    '''(answered ? '<button class="btn primary" data-act="px-next">' + (PX.i + 1 < n ? "Next question →" : "See results") + "</button>" + '<button class="btn" data-act="px-redo">↺ Redo this question</button>\'''')
rep('''<button class="btn" data-act="px-restart">Start again</button><button class="btn" data-act="t-ask"''', '''<button class="btn" data-act="px-restart">Start again</button><button class="btn" data-act="px-all">Go through my answers</button><button class="btn" data-act="t-ask"''')
rep(''''<button class="btn primary" data-act="px-restart">Start</button>')''', ''''<button class="btn primary" data-act="px-restart">Start</button>' + (done ? '<button class="btn" data-act="px-all">Go through my answers</button>' : ""))''')
rep('''    else if (act === "px-next" && PX)''', '''    else if (act === "px-redo" && PX) { const k = PX.order[PX.i]; PX.res[k] = null; PX.draft = ""; PX.phase = "q"; pxSave(); pxRender(); try { coachToast("Answer cleared. Try it again."); } catch (e) {} }
    else if (act === "px-all" && PX) { PX.i = 0; PX.phase = PX.res[PX.order[0]] ? "fb" : "q"; pxRender(); }
    else if (act === "px-next" && PX)''')
rep('''  function route() {''', '''  /* ---------- redo any answered multiple-choice question (tools/patch_redo.py) ---------- */
  function mcRedoScan() {
    document.querySelectorAll("ol.mc > li, #exf .xmc").forEach((li) => { const o = li.querySelector(".opt"); if (!o) return; const b = li.querySelector(":scope > .q-redo");
      if (o.disabled && !b) li.insertAdjacentHTML("beforeend", '<button type="button" class="q-redo" data-act="q-redo" aria-label="Redo this question">↺ Redo</button>'); else if (!o.disabled && b) b.remove(); });
  }
  setInterval(mcRedoScan, 600);
  document.addEventListener("click", (e) => { const b = e.target.closest && e.target.closest('[data-act="q-redo"]'); if (!b) return; e.preventDefault(); e.stopPropagation(); qRedo(b.parentElement); }, true);
  function qRedo(li) {
    if (!li) return false; const list = li.closest("ol.mc"), scope = list ? list.dataset.scope : "xmc", first = li.querySelector(".opt"), qi = first ? +first.dataset.q : -1;
    li.querySelectorAll(".opt").forEach((x) => { x.disabled = false; x.classList.remove("right", "wrong"); x.removeAttribute("aria-pressed"); });
    li.querySelectorAll(".lq-where, .q-redo").forEach((x) => x.remove());
    try { if (scope === "vq") { const d = vData(location.hash.replace(/^#video-/, "")); if (d.qa) { delete d.qa[qi]; save(); } const r = document.getElementById("vq-res"); if (r) r.textContent = ""; } } catch (x) {}
    try { const r = document.getElementById({ lq: "lq-res", mock: "mres" }[scope] || "-"); if (r) r.textContent = ""; } catch (x) {}
    try { if (scope === "xmc" && first) { if (PX && PX.mc) delete PX.mc[first.dataset.q]; const fb = document.getElementById("mcfb-" + first.dataset.q); if (fb) { fb.className = "fb"; fb.innerHTML = ""; } } } catch (x) {}
    try { first.focus({ preventScroll: true }); li.scrollIntoView({ block: "center", behavior: "smooth" }); } catch (x) {}
    return true;
  }
  window.__qRedo = qRedo;
  function route() {''')
s = s.replace("</style>", """.q-redo { margin-top: 8px; border: 1px solid var(--line); background: var(--surface); color: var(--ink); border-radius: 999px; padding: 4px 12px; font: inherit; font-size: .85rem; font-weight: 700; cursor: pointer }
.q-redo:hover, .q-redo:focus-visible { border-color: var(--cobalt) }
</style>""", 1)
open(p, "w", encoding="utf-8").write(s); print("patched", p)
