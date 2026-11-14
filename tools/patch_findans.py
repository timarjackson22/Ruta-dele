"""Readings & listening: after answering a comprehension question, a link takes you to the sentence in the text where the
answer is (highlighted), and a button takes you back to the question."""
import sys
p = sys.argv[1]; s = open(p, encoding="utf-8").read()
if "function lqWhere" in s: sys.exit("already patched")
def rep(a, b, n=1):
    global s
    assert s.count(a) == n, ("anchor", a[:90], s.count(a)); s = s.replace(a, b)
JS = r'''
  /* ---------- comprehension: where in the text is the answer? ---------- */
  function lqWhere(x, qi) {
    const q = x.q[qi]; if (!q) return -1;
    const stem = (w) => w.slice(0, Math.max(4, Math.min(6, w.length - 1)));
    const toks = (t) => [...ptoks(t)].map(stem);
    const A = toks(q[1][q[2]]), Q = toks(q[0]); let best = -1, bs = 0, k = 0;
    x.paras.forEach((p) => p.s.forEach((sn) => { const S2 = new Set(toks(sn[0] + " " + (sn[1] || ""))); let sc = 0; A.forEach((w) => S2.has(w) && (sc += 2)); Q.forEach((w) => S2.has(w) && (sc += 1)); if (sc > bs) { bs = sc; best = k; } k++; }));
    return bs >= 2 ? best : -1;
  }
  function lqLink(li, qi) {
    if (!CUR || li.querySelector(".lq-where")) return;
    const k = lqWhere(CUR, qi); if (k < 0) return;
    li.insertAdjacentHTML("beforeend", '<a href="#" class="lq-where small" data-act="lq-where" data-k="' + k + '" data-q="' + qi + '">📍 See where the answer is in the text</a>');
  }
  document.addEventListener("click", (e) => {
    const a = e.target.closest && e.target.closest('[data-act="lq-where"], [data-act="lq-back"]'); if (!a) return; e.preventDefault();
    if (a.dataset.act === "lq-where") {
      const el = document.querySelector('#ltext .sent[data-pi="' + a.dataset.k + '"]'); if (!el) return;
      const box = document.getElementById("litem"); if (box && box.classList.contains("hide-text")) { box.classList.remove("hide-text"); const b = document.getElementById("l-text"); if (b) { b.textContent = "Hide text"; b.setAttribute("aria-pressed", "false"); } }
      try { FOL.free = true; } catch (x) {}
      el.scrollIntoView({ block: "center", behavior: "smooth" });
      document.querySelectorAll("#ltext .lq-hit").forEach((x) => x.classList.remove("lq-hit")); el.classList.add("lq-hit");
      let bk = document.getElementById("lq-back"); if (!bk) { bk = document.createElement("a"); bk.id = "lq-back"; bk.href = "#"; bk.dataset.act = "lq-back"; document.body.appendChild(bk); }
      bk.dataset.q = a.dataset.q; bk.textContent = "↩ Back to question " + (+a.dataset.q + 1); bk.hidden = false;
    } else {
      const li = document.querySelectorAll('.mc[data-scope="lq"] > li')[+a.dataset.q]; a.hidden = true;
      if (li) { li.scrollIntoView({ block: "center", behavior: "smooth" }); li.classList.add("lq-flash"); setTimeout(() => li.classList.remove("lq-flash"), 1600); }
    }
  });
  addEventListener("hashchange", () => { const b = document.getElementById("lq-back"); if (b) b.hidden = true; });
'''
rep("  function mcList(qs, scope) {", JS + "  function mcList(qs, scope) {")
rep('''      if (oi !== right) t.classList.add("wrong");
      if (list.querySelectorAll(".opt.right").length === CUR.q.length) {''', '''      if (oi !== right) t.classList.add("wrong");
      try { lqLink(t.closest("li"), qi); } catch (e) {}
      if (list.querySelectorAll(".opt.right").length === CUR.q.length) {''')
CSS = r'''
.lq-where { display: inline-block; margin-top: 8px; color: var(--cobalt); font-weight: 600; text-decoration: none }
.mc li:has(.opt.wrong) .lq-where { padding: 6px 10px; border-radius: 10px; background: color-mix(in srgb, var(--cobalt) 10%, var(--surface)) }
#ltext .sent.lq-hit { background: color-mix(in srgb, var(--good, #2a9d6b) 22%, transparent); box-shadow: 0 0 0 3px color-mix(in srgb, var(--good, #2a9d6b) 22%, transparent); border-radius: 4px; transition: background .3s }
#lq-back { position: fixed; left: 50%; transform: translateX(-50%); bottom: calc(110px + env(safe-area-inset-bottom, 0px)); z-index: 30; padding: 10px 16px; border-radius: 999px; background: var(--ink); color: var(--bg); font-weight: 650; text-decoration: none; box-shadow: 0 6px 18px rgba(0,0,0,.25) }
.mc li.lq-flash { animation: lqf 1.6s ease } @keyframes lqf { 0%, 60% { background: color-mix(in srgb, var(--saffron) 25%, transparent) } 100% { background: transparent } }
'''
k = s.rindex("</style>", 0, s.index("</head>")); s = s[:k] + CSS + s[k:]
open(p, "w", encoding="utf-8").write(s)
print("findans ok")
