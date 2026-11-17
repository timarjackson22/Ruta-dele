"""Library › Sentence patterns (#frases). Re-runnable.
Builds FRASES from tools/frases/data*.py, embeds it with the view (frases.js) and its CSS, and wires the route, the Library tile,
the flashcard deck, the global player, and Profe's practice.   Usage: python3 tools/frases/build.py index.html"""
import sys, os, re, json, importlib.util, glob
P = sys.argv[1] if len(sys.argv) > 1 else "index.html"; T = os.path.dirname(os.path.abspath(__file__))
CATS = {"cortesia": ["Courtesy and greetings", "Cortesía y saludos"], "identidad": ["Introducing yourself", "Presentarse"], "deseos": ["Wants, needs and wishes", "Deseos y necesidades"],
  "gustos": ["Likes and preferences", "Gustos y preferencias"], "capacidad": ["Ability and knowing", "Capacidad y conocimiento"], "obligacion": ["Obligation and advice", "Obligación y consejos"],
  "planes": ["Plans and suggestions", "Planes y propuestas"], "pedir": ["Asking, offering, favours", "Pedir y ofrecer"], "preguntas": ["Everyday questions", "Preguntas frecuentes"],
  "ubicacion": ["Where things are", "Ubicación"], "tiempo": ["Time and duration", "Tiempo y duración"], "rutina": ["Habits and routine", "Rutina y frecuencia"],
  "opinion": ["Opinions and agreeing", "Opinión y acuerdo"], "sentimientos": ["Feelings and states", "Sentimientos y estados"], "pasado": ["Telling what happened", "Hablar del pasado"],
  "futuro": ["Future and predictions", "Futuro y predicciones"], "comparar": ["Comparing", "Comparaciones"], "causa": ["Reasons and purpose", "Causa y finalidad"],
  "condicion": ["Conditions", "Condiciones"], "contraste": ["Contrast", "Contraste"], "compras": ["Shopping and money", "De compras"], "comida": ["Eating out", "En el restaurante"],
  "direcciones": ["Directions and transport", "Direcciones y transporte"], "telefono": ["Phone and messages", "Teléfono y mensajes"], "problemas": ["Problems and apologies", "Problemas y disculpas"],
  "conversacion": ["Keeping a conversation going", "Conversación"], "trabajo": ["Work and study", "Trabajo y estudios"], "clima": ["Weather", "El tiempo"],
  "permiso": ["Permission and rules", "Permiso y prohibición"], "salud": ["Health", "La salud"], "otros": ["Talking about others", "Hablar de otros"]}
pats = []
for f in sorted(glob.glob(os.path.join(T, "data*.py"))):
    sp = importlib.util.spec_from_file_location(os.path.basename(f)[:-3], f); m = importlib.util.module_from_spec(sp); sp.loader.exec_module(m)
    for c, l, es, en, tip, vs in m.P:
        assert c in CATS, c; assert all(v[0] in ("pres", "pret", "impf", "perf", "fut", "cond", "subj", "impsub", "imp", "pqp") for v in vs), es
        pats.append({"c": c, "l": l, "es": es, "en": en, "tip": tip, "v": [list(v) for v in vs]})
order = list(CATS); pats.sort(key=lambda p: order.index(p["c"]))  # stable: keeps the order inside each topic
seen = set()
for p in pats:
    for v in p["v"]: assert v[1] not in seen, v[1]; seen.add(v[1])
data = json.dumps({"cats": CATS, "pats": pats}, ensure_ascii=False, separators=(",", ":")).replace("</", "<\\/")
s = open(P, encoding="utf-8").read()
def rep(a, b):
    global s
    assert s.count(a) == 1, (a[:80], s.count(a)); s = s.replace(a, b)
view = "  const FRASES = " + data + ";\n" + open(os.path.join(T, "frases.js"), encoding="utf-8").read()
s = re.sub(r"  const FRASES = .*?/\* ==/FRASES== \*/\n", "", s, flags=re.S)  # remove any earlier copy, then insert one
rep("  /* ==CURRIC== */", view + "  /* ==CURRIC== */")
css = open(os.path.join(T, "frases.css"), encoding="utf-8").read()
s = re.sub(r"/\* ==FRASES-CSS== \*/.*?/\* ==/FRASES-CSS== \*/\n", "", s, flags=re.S); i = s.rfind("</style>"); s = s[:i] + "/* ==FRASES-CSS== */\n" + css + "/* ==/FRASES-CSS== */\n" + s[i:]
if 'h === "frases"' not in s:
    rep('    else if (h === "biblioteca") { setSec("biblioteca"); navChips(null); libraryHub(); }', '    else if (h === "biblioteca") { setSec("biblioteca"); navChips(null); libraryHub(); }\n    else if (h === "frases") { setSec("biblioteca"); navChips(null); frasesView(); }')
if '"#frases"' not in s:
    rep('["words", "Words", "7,000 palabras", "#palabras", "#3ccf8e", "#1a9c6b"]]', '["words", "Words", "7,000 palabras", "#palabras", "#3ccf8e", "#1a9c6b"], ["phrase", "Sentence patterns", "Estructuras de frases", "#frases", "#ff8a4c", "#d9581d"]]')
if 'phrase:["' not in s:
    rep('const UIC = {', 'const UIC = {phrase:["#d9581d",\'<path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z"/><path d="M8 10h8M8 14h5"/>\'],')
# the global player plays the sentences on screen
if 'location.hash.replace("#", "") === "frases"' not in s:
    rep('    const id = document.body.dataset.gcat;\n', '    if (location.hash.replace("#", "") === "frases") { const rows = [...app.querySelectorAll(".fr-v[data-es]")]; rows.forEach((r, k) => (r.id = "gi-" + k)); return { key: "f", list: rows.map((r, k) => ({ i: k, es: r.dataset.es, en: r.dataset.en, show: r.dataset.es })) }; }\n    const id = document.body.dataset.gcat;\n')
# Profe: adaptive translation fed with the patterns
if "opts && opts.pat" not in s:
    rep('  async function adStart(kind) {', '  async function adStart(kind, opts) {')
    rep('    tCur = null; PR = { kind, lv, recent: [], done: 0, first: 0, fb: null, autoMic: true, hist: adHistLoad(kind, lv), view: null, att: [] };\n    ensureSession(kind === "tr" ? "Sentence translation" : "Conjugation drill", (kind === "tr" ? "Sentence translation · " : "Conjugation · ") + lv.toUpperCase()); tView = "practice";',
        '    tCur = null; PR = { kind, lv, recent: [], done: 0, first: 0, fb: null, autoMic: true, hist: adHistLoad(kind, lv), view: null, att: [], pat: (opts && opts.pat) || null };\n    ensureSession(PR.pat ? "Sentence patterns" : kind === "tr" ? "Sentence translation" : "Conjugation drill", (PR.pat ? "Sentence patterns · " : kind === "tr" ? "Sentence translation · " : "Conjugation · ") + lv.toUpperCase()); tView = "practice";')
    rep('  function adPickTr(lv) {\n', '  function adPickTr(lv) {\n    if (PR && PR.pat) { const f = frPick(lv); if (f) return f; }\n')
    rep('const title = PR.kind === "tr" ? "Sentence translation" : "Conjugation";', 'const title = PR.pat ? "Sentence patterns" : PR.kind === "tr" ? "Sentence translation" : "Conjugation";')
if 'data-act="pr-pat"' not in s:
    rep('<button class="prc" data-act="pr-conj">', '<button class="prc" data-act="pr-pat"><i class="pri pr-i6" aria-hidden="true"></i><b>Sentence patterns</b><span>' + "Profe says an everyday sentence in English; you say it in Spanish, in every tense.</span></button><button class=\"prc\" data-act=\"pr-conj\">")
    rep('    else if (act === "pr-conj") startConj();', '    else if (act === "pr-conj") startConj();\n    else if (act === "pr-pat") startPatterns({});')
open(P, "w", encoding="utf-8").write(s)
print("frases:", len(pats), "patterns,", sum(len(p["v"]) for p in pats), "sentences")
