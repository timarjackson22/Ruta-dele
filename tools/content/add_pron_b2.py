"""B2 spelling and pronunciation top-up (17 Nov 2026), from the coverage dashboard's "Practice drops from B1 to B2:
Pronunciation" finding. Each B2 unit gets a short block on the written accents and sounds that B2 grammar brings, 2 example
sentences, 3 fill-in items and 2 corrections. Appended; re-runnable.   Usage: python3 tools/content/add_pron_b2.py index.html"""
import json, re, sys
P = sys.argv[1] if len(sys.argv) > 1 else "index.html"
s = open(P, encoding="utf-8").read()
m = re.search(r"(  const LXS = )(\{.*?\});\n", s)
L = json.loads(m.group(2))

def B(t, r, rows, e, x, fix):
    return dict(g={"t": t, "r": r, "h": ["Form", "Example"], "rows": rows, "n": []}, e=e, x=x, fix=fix)

ADD = {
 "Imperfecto de subjuntivo": B("Ortografía: el acento en -áramos, -iéramos",
   "In the imperfect subjunctive only the nosotros form takes a tilde, because it is stressed three syllables from the end: habláramos, tuviéramos, fuésemos.",
   [["hablara · hablaras · habláramos", "Si habláramos más, nos entenderíamos mejor."], ["tuviera · tuviéramos", "Ojalá tuviéramos más tiempo."], ["fuese · fuésemos", "Me pidió que fuésemos puntuales."]],
   [["Ojalá pudiéramos vernos más a menudo.", "I wish we could see each other more often."], ["Nos pidieron que habláramos más despacio.", "They asked us to speak more slowly."]],
   [["Si ___ (tener, nosotros) dinero, compraríamos una casa.", "tuviéramos|tuviésemos", "Nosotros, imperfect subjunctive: tuviéramos, with a tilde."], ["Quería que ___ (ir, nosotros) con ella.", "fuéramos|fuésemos", "Nosotros: fuéramos, stressed on FUÉ-."], ["Me dijo que lo ___ (llamar, yo) al llegar.", "llamara|llamase", "Yo form: llamara, no tilde."]],
   [["Si estuvieramos juntos, sería más fácil.", "Si estuviéramos juntos, sería más fácil.", "Nosotros form: estuviéramos, with a tilde."], ["Ojalá lo supieramos antes.", "Ojalá lo supiéramos antes.", "Nosotros: supiéramos, stressed on -PIÉ-, with a tilde."]]),
 "Oraciones condicionales": B("Pronunciación: si condicional y sí afirmativo",
   "The conditional si (if) is unstressed and has no tilde; sí (yes, oneself) is stressed and has one. In speech, the if-clause rises and the main clause falls.",
   [["si (if)", "Si vienes, avísame. ↗ ↘"], ["sí (yes)", "Dijo que sí."], ["sí (oneself)", "Habla mucho de sí misma."]],
   [["Si me lo hubieras dicho antes, te habría ayudado.", "If you had told me before, I would have helped you."], ["Me preguntó si iba a ir y le dije que sí.", "He asked me if I was going and I told him yes."]],
   [["___ lloviera, no saldríamos.", "Si", "Conditional if: si, without a tilde."], ["Le pregunté si quería venir y me dijo que ___.", "sí", "Yes: sí, with a tilde."], ["Solo piensa en ___ mismo.", "sí", "Reflexive (oneself): sí, with a tilde."]],
   [["Sí hubiera sabido la verdad, no habría firmado.", "Si hubiera sabido la verdad, no habría firmado.", "Conditional if: si, no tilde."], ["Me contestó que si, que vendría.", "Me contestó que sí, que vendría.", "Yes: sí, with a tilde."]]),
 "Tiempo, finalidad y concesión": B("Ortografía: aun y aún, sino y si no",
   "Aún (still, yet) has a tilde; aun (even) has none. Sino (but rather, after a negative) is one word; si no (if not) is two.",
   [["aún = todavía", "Aún no ha llegado."], ["aun = incluso", "Aun cansado, siguió trabajando."], ["sino · si no", "No es caro, sino barato. · Si no llueve, iremos."]],
   [["Aún no sé si podré ir, pero lo intentaré.", "I still don't know if I'll be able to go, but I'll try."], ["No lo hizo por dinero, sino por amor.", "He didn't do it for money, but for love."]],
   [["___ no ha terminado la reunión.", "Aún|Todavía", "Still: aún (= todavía), with a tilde."], ["No quiero café, ___ té.", "sino", "After a negative, «but rather»: sino."], ["___ te das prisa, perderás el tren.", "Si no", "If not: si no, two words."]],
   [["Aun no he recibido tu mensaje.", "Aún no he recibido tu mensaje.", "Still/yet: aún, with a tilde."], ["No es mi hermano, si no mi primo.", "No es mi hermano, sino mi primo.", "Correction after a negative: sino, one word."]]),
 "Oraciones de relativo": B("Ortografía: que, quien, donde (relativos) y qué, quién, dónde",
   "Relatives have no tilde: el chico que vino, la ciudad donde vivo, la persona con quien hablé. Question and exclamation words do: ¿Quién vino? ¡Qué bonito! No sé dónde vive.",
   [["que · qué", "El libro que leí · ¿Qué leíste?"], ["donde · dónde", "El bar donde nos vimos · ¿Dónde nos vimos?"], ["quien · quién", "Es ella quien lo sabe · ¿Quién lo sabe?"]],
   [["La ciudad donde nací está junto al mar.", "The city where I was born is by the sea."], ["No sé quién ha dejado la puerta abierta.", "I don't know who has left the door open."]],
   [["Es la casa ___ vivió mi abuela.", "donde|en la que", "Relative: donde, no tilde."], ["¿___ te lo ha contado?", "Quién", "Question: quién, with a tilde."], ["La mujer con ___ hablaste es mi jefa.", "quien|la que", "Relative after a preposition: quien (no tilde) or la que."]],
   [["Este es el restaurante dónde cenamos.", "Este es el restaurante donde cenamos.", "Relative donde: no tilde."], ["No sé que quiere decir.", "No sé qué quiere decir.", "Indirect question: qué, with a tilde."]]),
 "Pasiva e impersonalidad": B("Ortografía: la tilde en los adverbios en -mente",
   "Adverbs in -mente keep the tilde of the adjective: rápido → rápidamente, fácil → fácilmente, común → comúnmente. If the adjective has none, the adverb has none: lento → lentamente.",
   [["rápido → rápidamente", "La noticia se difundió rápidamente."], ["fácil → fácilmente", "Se resuelve fácilmente."], ["común → comúnmente", "Se cree comúnmente que…"]],
   [["Se dice comúnmente que el clima ha cambiado rápidamente.", "It is commonly said that the climate has changed quickly."], ["El problema fue resuelto fácilmente por los técnicos.", "The problem was easily solved by the technicians."]],
   [["La noticia se publicó ___ (rápido + mente).", "rápidamente", "Rápido has a tilde, so rápidamente keeps it."], ["Se puede llegar ___ (fácil + mente) en metro.", "fácilmente", "Fácil → fácilmente."], ["El barco avanzaba ___ (lento + mente).", "lentamente", "Lento has no tilde, so neither does lentamente."]],
   [["Se resolvio el problema rapidamente.", "Se resolvió el problema rápidamente.", "Resolvió (past, stressed on -vió) and rápidamente (keeps the tilde of rápido)."], ["Esto se hace facilmente.", "Esto se hace fácilmente.", "Fácilmente keeps the tilde of fácil."]]),
 "Perífrasis y argumentación": B("Pronunciación: el énfasis al argumentar",
   "In an argument, stress the key word and pause before the connector: Es caro, | sin embargo, | merece la pena. Esdrújulas common in argument (lógico, práctico, económico, polémica) always carry a tilde.",
   [["lógico · práctico · económico", "Es lógico que la gente proteste."], ["polémica · pública · política", "Es una medida polémica."], ["pause before connectors", "Es caro; | sin embargo, | es útil."]],
   [["Es lógico que la propuesta resulte polémica.", "It's logical that the proposal is controversial."], ["La medida es económica y, además, práctica.", "The measure is cheap and, besides, practical."]],
   [["Es una decisión ___ (political).", "política", "Esdrújula: po-LÍ-ti-ca, always with a tilde."], ["Me parece ___ (logical) que pidan explicaciones.", "lógico", "Esdrújula: LÓ-gi-co."], ["Es la opción más ___ (economical).", "económica", "Esdrújula: e-co-NÓ-mi-ca."]],
   [["Es un tema muy polemico.", "Es un tema muy polémico.", "Esdrújula: po-LÉ-mi-co, with a tilde."], ["Desde el punto de vista practico, no funciona.", "Desde el punto de vista práctico, no funciona.", "Esdrújula: PRÁC-ti-co."]]),
 "Estilo indirecto en pasado": B("Ortografía: el acento en los tiempos del estilo indirecto",
   "Reported speech brings forms with a stressed í that needs a tilde: había (past perfect), habría (conditional perfect), decía and tenía (imperfect), diría, sería and tendría (conditional).",
   [["había · habría", "Dijo que había llegado · que habría llegado."], ["decía · diría", "Decía que vendría · que lo diría."], ["tenía · tendría", "Dijo que tenía hambre · que tendría tiempo."]],
   [["Me explicó que había perdido el tren y que llegaría tarde.", "She explained that she had missed the train and would arrive late."], ["Dijeron que no tenían tiempo y que lo harían otro día.", "They said they didn't have time and would do it another day."]],
   [["Dijo que ya ___ (haber) comido.", "había", "Past perfect: había, with a tilde."], ["Prometió que lo ___ (hacer) al día siguiente.", "haría", "Conditional: haría."], ["Me contó que no ___ (tener) dinero.", "tenía", "Imperfect: tenía."]],
   [["Dijo que habia terminado el informe.", "Dijo que había terminado el informe.", "Había: the stressed í needs a tilde."], ["Nos aseguró que lo sabria pronto.", "Nos aseguró que lo sabría pronto.", "Conditional: sabría, with a tilde."]]),
}
n = 0
for title, x in ADD.items():
    u = next(u for u in L["b2"] if u["t"] == title)
    if any(g["t"] == x["g"]["t"] for g in u.get("g", [])): continue
    assert all(len(i) == 3 for i in x["x"] + x["fix"]), title
    u.setdefault("g", []).append(x["g"])
    for k in ("e", "x", "fix"): u.setdefault(k, []).extend(x[k])
    n += 1
s = s[:m.start(2)] + json.dumps(L, ensure_ascii=False, separators=(",", ":")) + s[m.end(2):]
open(P, "w", encoding="utf-8").write(s)
print("added", n, "blocks")
