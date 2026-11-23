"""Topic mastery (v293): embeds tools/topics.js + topics.css, adds the route #dominio, the Home / Progress entries and the
hooks that report every graded answer (lessons, quick drill, Check yourself, practice, exams, flashcards, Profe's practice,
conversation corrections). Re-runnable: a no-op when the page already matches.   Usage: python3 tools/patch_topics.py index.html"""
import re, sys, os
P = sys.argv[1] if len(sys.argv) > 1 else "index.html"; T = os.path.dirname(os.path.abspath(__file__))
s = open(P, encoding="utf-8").read(); s0 = s
def rep(a, b, path=None):
    """apply once; skip when already applied. With path, the same change is made in that tools/ source too."""
    global s
    if b not in s:
        assert s.count(a) == 1, ("anchor", a[:90], s.count(a)); s = s.replace(a, b)
    if path:
        f = os.path.join(T, path); src = open(f, encoding="utf-8").read()
        if b not in src:
            assert src.count(a) == 1, ("source anchor", path, a[:90]); open(f, "w", encoding="utf-8").write(src.replace(a, b))
js = open(os.path.join(T, "topics.js"), encoding="utf-8").read(); css = open(os.path.join(T, "topics.css"), encoding="utf-8").read()
s = re.sub(r"  /\* ==TOPICS== .*?/\* ==/TOPICS== \*/\n", "", s, flags=re.S)
_anc = "  /* ==SYNANT-DATA== " if "  /* ==SYNANT-DATA== " in s else "  /* ==CURRIC== */"  # before synonyms / picture dictionary, so their embeds stay no-ops
assert s.count(_anc) == 1; s = s.replace(_anc, js + _anc)
m = re.search(r"/\* ==TOPICS-CSS== .*?/\* ==/TOPICS-CSS== \*/\n", s, flags=re.S)
if m: s = s[:m.start()] + css + s[m.end():]
else: i = s.rfind("</style>", 0, s.find('<style id="wb-frame">')); s = s[:i] + css + s[i:]
# route + back link
rep('    else if (h === "progreso") { setSec("hoy"); navChips(null); progView(); }', '    else if (h === "progreso") { setSec("hoy"); navChips(null); progView(); }\n    else if (h === "dominio") { setSec("hoy"); navChips(null); tmView(); }')
rep('    if (h === "ajustes" || h === "progreso" || h === "hoy" || h === "plan") return ["#inicio", "Home"];', '    if (h === "ajustes" || h === "progreso" || h === "hoy" || h === "plan") return ["#inicio", "Home"];\n    if (h === "dominio") return ["#progreso", "Progress"];')
# Home «Today»: topics to work on (only when there are some)
rep('      nm ? uiRow({ ic: "mist", t: "My mistakes", sub: "To fix", val: \'<span class="hm-badge">\' + nm + "</span>", href: "#errores" }) : "",',
    '      nm ? uiRow({ ic: "mist", t: "My mistakes", sub: "To fix", val: \'<span class="hm-badge">\' + nm + "</span>", href: "#errores" }) : "",\n      (() => { const tz = window.__tmTeaser && window.__tmTeaser(); return tz ? uiRow({ lead: \'<span class="ic2" aria-hidden="true">🎯</span>\', t: "Topics to work on", sub: tz.top, val: \'<span class="hm-badge">\' + tz.n + "</span>", href: "#dominio" }) : ""; })(),')
# Progress overview: a link card
rep("    if (PG.tab === \"exam\") { app.innerHTML = '<div class=\"stack prog\"><div><p class=\"eyebrow\">Your progress</p><h1>Progreso</h1></div>' + pgTabs + exPrepHTML() + '</div>'; return; }",
    "    if (PG.tab === \"exam\") { app.innerHTML = '<div class=\"stack prog\"><div><p class=\"eyebrow\">Your progress</p><h1>Progreso</h1></div>' + pgTabs + exPrepHTML() + '</div>'; return; }\n    setTimeout(() => { try { const h = app.querySelector(\".pgtabs\"); if (h && !app.querySelector(\".tm-link\")) { const tz = window.__tmTeaser && window.__tmTeaser(), n = window.__tmList ? window.__tmList().length : 0; h.insertAdjacentHTML(\"afterend\", '<a class=\"card tm-link\" href=\"#dominio\" style=\"display:block;text-decoration:none;color:inherit;margin:10px 0\"><b>🎯 Topic mastery</b><br><span class=\"muted small\">' + (tz ? tz.n + \" topic\" + (tz.n > 1 ? \"s\" : \"\") + \" to work on · start with \" + esc(tz.top) : n ? n + \" topics tracked · nothing needs attention\" : \"How well each topic is going, from every answer you give\") + ' ›</span></a>'); } } catch (e) {} }, 0);")
# ---- hooks: every graded answer reports its topic
CK = 'try { actAdd(ok ? 2 : 1); if (!ok) mistakeAdd(it, box.closest("[data-qckey]") ? box.closest("[data-qckey]").dataset.qckey : location.hash.slice(1)); } catch (e) {}'
CKN = CK + ' try { window.__tm && window.__tm(box.closest("[data-qckey]") ? box.closest("[data-qckey]").dataset.qckey : location.hash.slice(1), !!ok, "lesson", it.q); } catch (e) {}'
if CKN not in s: s = s.replace(CK, CKN)  # the page holds checks.js twice-embedded copies
f = os.path.join(T, "checks.js"); src = open(f, encoding="utf-8").read()
if CKN not in src: open(f, "w", encoding="utf-8").write(src.replace(CK, CKN))
rep('try { actAdd(r.ok ? 2 : 1); if (!r.ok && PX.key !== "errores" && PX.key !== "nivel") mistakeAdd(it, PX.key); } catch (e) {}',
    'try { actAdd(r.ok ? 2 : 1); if (!r.ok && PX.key !== "errores" && PX.key !== "nivel") mistakeAdd(it, PX.key); } catch (e) {} try { if (PX.key !== "errores" && PX.key !== "nivel") window.__tm && window.__tm(PX.key, !!r.ok, "practice", it.q); } catch (e) {}')
rep('    try { if (typeof ok === "boolean") sfx(ok); } catch (e) {}\n    if (ok === true) { SK.ok++;',
    '    try { if (typeof ok === "boolean") sfx(ok); } catch (e) {}\n    try { if (typeof ok === "boolean" && !d.retry) window.__tm && window.__tm(d.src || SK.id, ok, SK.qd ? "drill" : "check", d.q || d.verb || ""); } catch (e) {}\n    if (ok === true) { SK.ok++;', "skilldrills.js")
rep('mistakeAdd(it, "exam-" + EX.lv); } })); } catch (e) {}',
    'mistakeAdd(it, "exam-" + EX.lv); } })); } catch (e) {}\n      try { EX.tasks.forEach((t, ti) => t.q.forEach((q, qi) => window.__tm && window.__tm("exam-" + EX.lv + "-" + k, EX.ans[ti + "-" + qi] === q.a, "exam", q.q))); } catch (e) {}')
rep('SV.last = SV.card.id; SV.shown = false; SV.card = null;',
    'try { window.__tm && window.__tm(window.__tmCard(SV.deck, SV.card.src), +t.dataset.e > 1, "cards", SV.card.es || ""); } catch (x) {} SV.last = SV.card.id; SV.shown = false; SV.card = null;')
rep('    D.q.tries = D.q.tries || 0;\n    let out;', '    D.q.tries = D.q.tries || 0;\n    try { window.__tm && window.__tm(window.__tmTense(D.q.k), !!(right || close), "profe", D.v + " · " + D.q.k); } catch (e) {}\n    let out;')
rep('  function adRecord(it, pass, key) {\n', '  function adRecord(it, pass, key) {\n    try { window.__tm && window.__tm(PR.kind === "cj" ? window.__tmTense(it.t) : (/^(a1|a2|b1|b2|c1|c2)-u\\d+/.exec(it.id || "") || ["tr-" + PR.lv])[0], !!pass, "profe", it.src || it.v); } catch (e) {}\n', "adaptive.js")
rep('    const s = sySt(), { c, ms } = syPlan(s.c[k], g); s.c[k] = c; if (isNew) s.nn = (s.nn || 0) + 1;\n',
    '    const s = sySt(), { c, ms } = syPlan(s.c[k], g); s.c[k] = c; if (isNew) s.nn = (s.nn || 0) + 1;\n    try { window.__tm && window.__tm("syn", g >= 2, "profe", k.replace(/\\|[sa]$/, "")); } catch (e) {}\n', "synant.js")
rep('      cur.items.forEach((x) => { TCH.errs[x.rule] = (TCH.errs[x.rule] || 0) + 1; });',
    '      cur.items.forEach((x) => { TCH.errs[x.rule] = (TCH.errs[x.rule] || 0) + 1; }); try { cur.items.forEach((x) => window.__tm && window.__tm(window.__tmRule(x.rule), false, "talk", cur.text)); } catch (e) {}', "teach.js")
rep('  function qdResult(ok, note) { const st = QDR.state; if (st.res) return; try { sfx(ok); } catch (e) {}',
    '  function qdResult(ok, note) { const st = QDR.state; if (st.res) return; try { sfx(ok); } catch (e) {}\n    try { const e = QDR.ex[QDR.i], lv = qdLv(); window.__tm && window.__tm(e.w && e.w.t ? "pic-" + e.w.t : "sk-" + lv + "-" + ({ match: "words", hear: "listen", dict: "listen", build: "order", say: "speak" }[e.t] || "words"), !!ok, "drill", e.s ? e.s[0] : e.w ? (e.w.es || e.w[0]) : ""); } catch (x) {}')
if s != s0: open(P, "w", encoding="utf-8").write(s)
print("topics:", "embedded" if s != s0 else "no change")
