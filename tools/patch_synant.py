"""Library › Synonyms & antonyms (#sinonimos) + Profe › Practice › Synonyms (spaced repetition). Embeds tools/synant_data.js,
tools/synant.js and tools/synant.css; adds the route, the Library tile, the practice icon and the hooks into Profe's practice.
Re-runnable (a no-op when the page already holds the current sources).   Usage: python3 tools/patch_synant.py index.html"""
import re, sys, os
P = sys.argv[1] if len(sys.argv) > 1 else "index.html"; T = os.path.dirname(os.path.abspath(__file__))
s = open(P, encoding="utf-8").read()
def rep(a, b):
    global s
    assert s.count(a) == 1, (a[:90], s.count(a)); s = s.replace(a, b)
data = open(os.path.join(T, "synant_data.js"), encoding="utf-8").read(); js = open(os.path.join(T, "synant.js"), encoding="utf-8").read(); css = open(os.path.join(T, "synant.css"), encoding="utf-8").read()
s = re.sub(r"  /\* ==SYNANT-DATA== .*?/\* ==/SYNANT-DATA== \*/\n", "", s, flags=re.S)
s = re.sub(r"  /\* ==SYNANT== .*?/\* ==/SYNANT== \*/\n", "", s, flags=re.S)
anchor = "  /* ==VISUAL== " if "  /* ==VISUAL== " in s else "  /* ==CURRIC== */"  # before the picture dictionary, so both embeds stay no-ops
rep(anchor, data + js + anchor)
m = re.search(r"/\* ==SYNANT-CSS== .*?/\* ==/SYNANT-CSS== \*/\n", s, flags=re.S)
if m: s = s[:m.start()] + css + s[m.end():]
else: i = s.rfind("</style>", 0, s.find("<style id=\"rl-frame\">") if "<style id=\"rl-frame\">" in s else len(s)); s = s[:i] + css + s[i:]
if 'h === "sinonimos"' not in s:
    rep('    else if (h === "visual") { setSec("biblioteca"); navChips(null); vdHub(); }', '    else if (h === "visual") { setSec("biblioteca"); navChips(null); vdHub(); }\n    else if (h === "sinonimos") { setSec("biblioteca"); navChips(null); synHub(); }')
if '"#sinonimos"' not in s:
    rep('["picture", "Picture dictionary", "Diccionario visual", "#visual", "#2bb3a3", "#0f7f86"]]', '["picture", "Picture dictionary", "Diccionario visual", "#visual", "#2bb3a3", "#0f7f86"], ["synant", "Synonyms & antonyms", "Sinónimos y antónimos", "#sinonimos", "#8b6cf0", "#5a3fc4"]]')
if 'synant:["' not in s:
    rep('const UIC = {', 'const UIC = {synant:["#5a3fc4",\'<path d="M4 9h7M4 13h7M14 8l6 8M20 8l-6 8"/>\'],')
if '"pa-sy"' not in s:
    rep('    "pa-cj": PA_TXT("-ar", 10.5),', '    "pa-cj": PA_TXT("-ar", 10.5),\n    "pa-sy": PA_TXT("≈≠", 11),')
    rep('["pr-conj", "", "pa-cj", "Verbs", "Conjugate verbs out loud"],', '["pr-conj", "", "pa-cj", "Verbs", "Conjugate verbs out loud"], ["pr-syn", "", "pa-sy", "Synonyms", "Synonyms and antonyms, spaced repetition"],')
if 'PR.kind === "sy") return syAnswer' not in s:
    rep('    if (PR.kind === "tr" || PR.kind === "cj") return adAnswer(said);\n', '    if (PR.kind === "tr" || PR.kind === "cj") return adAnswer(said);\n    if (PR.kind === "sy") return syAnswer(said);\n')
    rep('    if (PR.kind === "tr" || PR.kind === "cj") return adHTML();\n', '    if (PR.kind === "tr" || PR.kind === "cj") return adHTML();\n    if (PR.kind === "sy") return syHTML();\n')
    rep('  function prNext() { if (PR && (PR.kind === "tr" || PR.kind === "cj")) return adNext();', '  function prNext() { if (PR && PR.kind === "sy") return syNext(); if (PR && (PR.kind === "tr" || PR.kind === "cj")) return adNext();')
    rep('    else if (act === "pr-pat") startPatterns({});', '    else if (act === "pr-pat") startPatterns({});\n    else if (act === "pr-syn") startSyn();')
if 'if (/^sinonimos/.test(h)) return' not in s:
    rep('    if (/^visual\\//.test(h)) return ["#visual", "Picture dictionary"]; // v262', '    if (/^visual\\//.test(h)) return ["#visual", "Picture dictionary"]; // v262\n    if (/^sinonimos/.test(h)) return ["#biblioteca", "Library"]; // v281')
open(P, "w", encoding="utf-8").write(s)
print("synant: synonyms & antonyms embedded")
