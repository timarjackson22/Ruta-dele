"""A1 · Unit 1 (Sonidos y alfabeto): «Punctuation and written signs» — the Spanish names of the accent, ñ, ü and the
punctuation marks and signs learners hear in class, in dictations and when someone spells an email (v298).
Re-runnable: inserts the block after «Accent pairs (tilde diacrítica)» once; replaces it in place when it changes.
Usage: python3 tools/content/add_punct.py index.html"""
import json, sys
P = sys.argv[1] if len(sys.argv) > 1 else "index.html"
s = open(P, encoding="utf-8").read()
BLOCK = {
    "t": "Punctuation and written signs (los signos)",
    "r": "Learn the Spanish names: you will hear them in class, in dictations and when someone spells an email. In Spanish, «tilde» is the written accent (´), not the ~.",
    "h": ["Spanish name", "Sign", "What it does"],
    "rows": [
        ["´  á é í ó ú", "la tilde (el acento gráfico)", "the written accent: marks the stressed syllable (café, árbol, teléfono)"],
        ["¨  ü", "la diéresis", "makes the u heard after g: pingüino, vergüenza"],
        ["ñ", "la eñe", "its own letter, not n + accent: año (year) ≠ ano"],
        [".", "el punto", "full stop; «punto y seguido» (same paragraph), «punto y aparte» (new paragraph), «punto final»"],
        [",", "la coma", "comma"],
        [";", "el punto y coma", "semicolon"],
        [":", "los dos puntos", "colon; letters open with «Querida Ana:»"],
        ["…", "los puntos suspensivos", "the three dots"],
        ["¿ ?", "los signos de interrogación", "a question opens with ¿ and closes with ?"],
        ["¡ !", "los signos de exclamación", "an exclamation opens with ¡ and closes with !"],
        ["«»  ·  “”", "las comillas", "quotation marks: «angulares» (usual in Spain) or “inglesas”"],
        ["( )", "los paréntesis", "brackets: «entre paréntesis»"],
        ["-", "el guion", "hyphen: hispano-árabe, and to split a word at the end of a line"],
        ["—", "la raya", "long dash: starts each speaker's line in a dialogue"],
        ["/", "la barra", "slash"],
        ["@", "la arroba", "at sign in emails"],
        ["_", "el guion bajo", "underscore"],
        ["*", "el asterisco", "asterisk"],
        ["A · a", "la mayúscula · la minúscula", "capital · small letter: days, months, languages and nationalities are lowercase (lunes, enero, español)"],
    ],
    "n": [
        "Dictation|«abre interrogación» = ¿ · «cierra exclamación» = ! · «entre comillas» = in quotation marks · «punto y aparte» = new paragraph",
        "Spelling an email|ana.lopez@correo.com = «ana punto lópez arroba correo punto com» · «todo junto» = all one word · «con mayúscula» = with a capital",
        "Spanish vs English|«tilde» = the accent mark ´ · «acento» = the stress (and also the mark, informally) · the ~ of ñ is «la virgulilla», but people just say «eñe»",
    ],
}
BLOCK["rows"] = [[r[1], r[0], r[2]] for r in BLOCK["rows"]]
new = json.dumps(BLOCK, ensure_ascii=False, separators=(",", ":"))
key = '{"t":"Punctuation and written signs (los signos)"'
if key in s:
    i = s.index(key); d = 0
    for j in range(i, len(s)):
        if s[j] == "{": d += 1
        elif s[j] == "}":
            d -= 1
            if d == 0: break
    if s[i:j + 1] != new: s = s[:i] + new + s[j + 1:]; print("punctuation block updated")
    else: print("punctuation block: no change")
else:
    anc = '{"t":"Accent pairs (tilde diacrítica)"'; assert s.count(anc) == 1, s.count(anc)
    i = s.index(anc); d = 0
    for j in range(i, len(s)):
        if s[j] == "{": d += 1
        elif s[j] == "}":
            d -= 1
            if d == 0: break
    s = s[:j + 1] + "," + new + s[j + 1:]; print("punctuation block added to A1 unit 1")
open(P, "w", encoding="utf-8").write(s)
