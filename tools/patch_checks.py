# Active learning: "Check yourself" questions after each part of a lesson and a guide (tools/checks.js). Re-running replaces the JS block.
import sys
P = sys.argv[1] if len(sys.argv) > 1 else "index.html"
s = open(P, encoding="utf-8").read()
js = open("tools/checks.js", encoding="utf-8").read().rstrip() + "\n"
if "/* ==CHECKS==" in s:
    i = s.index("  /* ==CHECKS=="); j = s.index("/* ==/CHECKS== */", i) + len("/* ==/CHECKS== */\n"); s = s[:i] + js + s[j:]
    open(P, "w", encoding="utf-8").write(s); print("checks block updated"); sys.exit()
def rep(a, b):
    global s
    assert s.count(a) == 1, (s.count(a), a[:120]); s = s.replace(a, b)
rep("  /* ==HOMEBANNER== ", js + "  /* ==HOMEBANNER== ")
# ---- lessons: after the vocabulary, each grammar block, the examples and the common mistakes
rep("""    let h = '<div class="stack"><p class="crumbs"><a href="#inicio">Ruta DELE</a><span aria-hidden="true">›</span><a href="' + home + '">'""",
    """    const qkey = location.hash.slice(1), qsecs = [{ text: JSON.stringify(u.v) }].concat(u.g.map((b) => ({ text: JSON.stringify(b) }))).concat(has.e ? [{ text: JSON.stringify(u.e) }] : []).concat(has.pit ? [{ text: JSON.stringify(u.pit) }] : []);
    let qc = []; try { qc = qcBuild(qkey, u, qsecs); } catch (e) { qc = []; }
    const qcAt = (n) => qc[n] || "", qcE = has.e ? 1 + u.g.length : -1, qcP = has.pit ? 1 + u.g.length + (has.e ? 1 : 0) : -1;
    let h = '<div class="stack" data-qckey="' + esc(qkey) + '"><p class="crumbs"><a href="#inicio">Ruta DELE</a><span aria-hidden="true">›</span><a href="' + home + '">'""")
rep("""h += '<section class="block" id="s-voc"><div class="shead"><h2>Vocabulary <span class="es">(Vocabulario)</span></h2><button class="btn small" data-act="hide-en" aria-pressed="false">Hide translations to test yourself</button></div>' + u.v.map(vocabGroup).j""",
    """h += '<section class="block" id="s-voc"><div class="shead"><h2>Vocabulary <span class="es">(Vocabulario)</span></h2><button class="btn small" data-act="hide-en" aria-pressed="false">Hide translations to test yourself</button></div>' + u.v.map(vocabGroup).join("") + qcAt(0) + [].j""")
rep("""h += '<section class="block" id="s-gra"><div class="shead"><h2>Grammar <span class="es">(Gramática)</span></h2></div>' + u.g.map(grammarBlock).join("")""",
    """h += '<section class="block" id="s-gra"><div class="shead"><h2>Grammar <span class="es">(Gramática)</span></h2></div>' + u.g.map((b, bi) => grammarBlock(b) + qcAt(1 + bi)).join("")""")
rep("""    if (has.pit) h += '<section class="block" id="s-err"><div class="shead"><h2>Common mistakes <span class="es">(Errores comunes)</span></h2></div>' + pitsTable(u.pit) + "</section>";""",
    """    if (has.pit) h += '<section class="block" id="s-err"><div class="shead"><h2>Common mistakes <span class="es">(Errores comunes)</span></h2></div>' + pitsTable(u.pit) + qcAt(qcP) + "</section>";""")
rep("""    h += '<section class="block" id="s-pra"><div class="shead"><h2>Practice <span class="es">(Práctica)</span></h2>' + (st.best != null""",
    """    h += '<section class="block" id="s-pra"><div class="shead"><h2>Review practice <span class="es">(Repaso)</span></h2>' + (st.best != null""")
rep("""'">Listen to all</button></div>' + exTable(u.e) + "</section>";""", """'">Listen to all</button></div>' + exTable(u.e) + qcAt(qcE) + "</section>";""")
rep('["pra", "Practice"]', '["pra", "Review"]')
# ---- guides: after each explanation part and the common mistakes
rep("""      '<section class="block"><div class="shead"><h2>Explanation <span class="es">(Explicación)</span></h2></div>' + g.sec.map((x) => grammarBlock(x)).join("") + "</section>" +
      (g.pit && g.pit.length ? '<section class="block"><div class="shead"><h2>Common mistakes <span class="es">(Errores comunes)</span></h2></div>' + pitsTable(g.pit) + "</section>" : "") +
      '<section class="block" id="s-pra"><div class="shead"><h2>Practice <span class="es">(Práctica)</span></h2>'""",
    """      '<section class="block"><div class="shead"><h2>Explanation <span class="es">(Explicación)</span></h2></div>' + g.sec.map((x, xi) => grammarBlock(x) + (gq[xi] || "")).join("") + "</section>" +
      (g.pit && g.pit.length ? '<section class="block"><div class="shead"><h2>Common mistakes <span class="es">(Errores comunes)</span></h2></div>' + pitsTable(g.pit) + (gq[g.sec.length] || "") + "</section>" : "") +
      '<section class="block" id="s-pra"><div class="shead"><h2>Review practice <span class="es">(Repaso)</span></h2>'""")
rep("""    const st = (S.gd || {})[id] || {};
    app.innerHTML = '<div class="stack"><p class="crumbs"><a href="#inicio">Ruta DELE</a><span aria-hidden="true">›</span><a href="#guias">Grammar guides</a>""",
    """    const st = (S.gd || {})[id] || {};
    let gq = []; try { gq = qcBuild("guia-" + id, g, g.sec.map((x) => ({ text: JSON.stringify(x) })).concat(g.pit && g.pit.length ? [{ text: JSON.stringify(g.pit) }] : [])); } catch (e) { gq = []; }
    app.innerHTML = '<div class="stack" data-qckey="guia-' + esc(id) + '"><p class="crumbs"><a href="#inicio">Ruta DELE</a><span aria-hidden="true">›</span><a href="#guias">Grammar guides</a>""")
CSS = """
/* Check yourself (active learning) */
.qchk { margin: 14px 0 6px; padding: 12px 14px; border-radius: 14px; border: 1.5px dashed color-mix(in srgb, var(--cobalt) 45%, var(--line)); background: color-mix(in srgb, var(--cobalt) 5%, var(--surface)) }
.qchk-h { display: flex; flex-wrap: wrap; align-items: baseline; gap: 4px 10px; margin-bottom: 8px } .qchk-h b { font-size: 16px } .qchk-h small { color: var(--muted) }
.qcitem { padding: 10px 0; border-top: 1px solid var(--line) } .qcitem:first-of-type { border-top: 0; padding-top: 2px }
.qcq { margin: 0 0 8px; font-size: 16.5px; line-height: 1.5 } .qct { display: block; font-size: 11px; font-weight: 700; letter-spacing: .06em; text-transform: uppercase; color: var(--muted); margin-bottom: 2px }
.qcopts { display: flex; flex-wrap: wrap; gap: 6px } .qcopts .ok { background: color-mix(in srgb, #16a36a 18%, var(--surface)); border-color: #16a36a } .qcopts .no { background: color-mix(in srgb, #e11d48 14%, var(--surface)); border-color: #e11d48 }
.qcform { display: flex; flex-wrap: wrap; gap: 6px } .qcin { flex: 1 1 180px; min-width: 0; font: inherit; font-size: 16px; padding: 8px 10px; border: 1px solid var(--line); border-radius: 10px; background: var(--surface); color: inherit }
.qcfb { margin-top: 8px; font-size: 15px; line-height: 1.5; padding: 8px 10px; border-radius: 10px; background: var(--surface) } .qcitem.ok .qcfb { border-left: 4px solid #16a36a } .qcitem.no .qcfb { border-left: 4px solid #e11d48 }
.qcfb .why { display: block; color: var(--muted); margin-top: 2px }
.qcmore > summary { cursor: pointer; font-weight: 700; color: var(--cobalt); padding: 8px 0 2px; list-style: none } .qcmore > summary::before { content: "＋ " } .qcmore[open] > summary::before { content: "－ " }
"""
rep("/* ==READABLE== */", CSS + "/* ==READABLE== */")
open(P, "w", encoding="utf-8").write(s); print("checks wired")
