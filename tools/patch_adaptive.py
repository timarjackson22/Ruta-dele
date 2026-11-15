# Round 5: adaptive sentence translation and conjugation in Profe's Practice tab.
# Puts tools/adaptive.js into index.html (between ==ADAPTIVE== markers; re-running replaces it) and wires it in once.
import re, sys
P = sys.argv[1] if len(sys.argv) > 1 else "index.html"
s = open(P, encoding="utf-8").read()
js = open("tools/adaptive.js", encoding="utf-8").read().rstrip() + "\n"
if "/* ==ADAPTIVE==" in s:
    i = s.index("  /* ==ADAPTIVE=="); j = s.index("/* ==/ADAPTIVE== */", i) + len("/* ==/ADAPTIVE== */\n")
    s = s[:i] + js + s[j:]
    open(P, "w", encoding="utf-8").write(s); print("adaptive block updated"); sys.exit()
def rep(a, b):
    global s
    assert s.count(a) == 1, (s.count(a), a[:100]); s = s.replace(a, b)
rep("  function prAnswer(said) {\n    if (!PR) return;\n", js + "  function prAnswer(said) {\n    if (!PR) return;\n    if (PR.kind === \"tr\" || PR.kind === \"cj\") return adAnswer(said);\n")
rep("""    let h = '<div class="tscroll"><div class="row" style="justify-content:space-between"><button class="btn small" data-act="pr-exit">""",
    """    if (PR.kind === "tr" || PR.kind === "cj") return adHTML();
    let h = '<div class="tscroll"><div class="row" style="justify-content:space-between"><button class="btn small" data-act="pr-exit">""")
rep("  function prNext() { if (!PR || !PR.items) return;", "  function prNext() { if (PR && (PR.kind === \"tr\" || PR.kind === \"cj\")) return adNext(); if (!PR || !PR.items) return;")
i = s.index("  async function startConj() {"); j = s.index("  function prAskConj()", i)
s = s[:i] + '  function startConj() { return adStart("cj"); } // adaptive (tools/adaptive.js)\n' + s[j:]
rep('if (v === "vocab") return startVocab(); if (v === "conj") return startConj(); tRender();', 'if (v === "vocab") return startVocab(); if (v === "conj") return startConj(); if (v === "trans") return adStart("tr"); tRender();')
rep('["vocab", "Vocabulary by voice"], ["conj", "Conjugation by voice"],', '["vocab", "Vocabulary by voice"], ["trans", "Sentence translation (adaptive)"], ["conj", "Conjugation (adaptive)"],')
rep('<button class="prc" data-act="pr-conj"><b>Conjugation by voice</b><span>Profe names a verb, person and tense; you say the form.</span></button>',
    '<button class="prc" data-act="pr-type" data-v="trans"><b>Sentence translation</b><span>English ⇄ Spanish sentences in every tense, mood and register of your level. Adapts to your mistakes.</span></button><button class="prc" data-act="pr-conj"><b>Conjugation</b><span>Profe names a verb, person and tense; you say the form. Verbs like the ones you miss come back.</span></button>')
rep('    else if (act === "pr-type") prGo(t.dataset.v);', '''    else if (act === "pr-type") prGo(t.dataset.v);
    else if (act === "ad-new") { if (PR && PR.it) adNew(t.dataset.v === "1"); }
    else if (act === "ad-next") { if (PR && PR.it) adNext(); }
    else if (act === "ad-show") { if (PR && PR.it && !PR.over) adFinish(false, null, true); }
    else if (act === "ad-skip") adSkip();''')
rep('else if (act === "pr-mic") { if (listening) stopListening(); else listen(prAnswer, { continuous: PR && PR.kind === "sp" }); }',
    'else if (act === "pr-mic") { if (listening) stopListening(); else { window.__sttOver = PR && PR.kind === "tr" && PR.it && PR.it.dir === "es-en" && !PR.over && !PR.ask ? "en-US" : null; listen(prAnswer, { continuous: PR && PR.kind === "sp" }); } }')
rep('else if (act === "pr-exit") { PR = null;', 'else if (act === "pr-exit") { window.__sttOver = null; PR = null;')
rep('  function sttLang() { return TS.sttLang ||', '  function sttLang() { return window.__sttOver || TS.sttLang ||')
rep('.prsel-l { display: block; font-weight: 600 }', '.prsel-l { display: block; font-weight: 600 } .adfocus { margin: 2px 0 6px; padding: 6px 10px; border-radius: 10px; background: var(--cobalt-soft, #e7f1fb); } .addots { letter-spacing: 2px; color: var(--cobalt) } .adans { font-size: 1.05rem } .addiff { color: var(--terra, #b4471f); text-decoration: underline } .adbtns { gap: 6px; flex-wrap: wrap; margin: 8px 0 } .adask { border-color: var(--cobalt) }')
open(P, "w", encoding="utf-8").write(s); print("wired")
