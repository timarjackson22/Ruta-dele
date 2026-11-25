"""C1 spelling and pronunciation top-up plus A2 grammar items (17 Nov 2026), from the coverage dashboard's progression
findings (B2 → C1 pronunciation and oral expression; A1 → A2 grammar and pronunciation). Each C1 unit gets a short block on
the current RAE accent and spelling rules its topic brings (Ortografía 2010), 1 example, 3 fill-in items and 2
corrections; one C1 speaking task; and each A2 unit gets 4 more grammar items and 1 more stress item.
Appended; re-runnable.   Usage: python3 tools/content/add_pron_c1.py index.html"""
import json, re, sys
P = sys.argv[1] if len(sys.argv) > 1 else "index.html"
s = open(P, encoding="utf-8").read()
m = re.search(r"(  const LXS = )(\{.*?\});\n", s)
L = json.loads(m.group(2))

def B(t, r, rows, e, x, fix):
    return dict(g={"t": t, "r": r, "h": ["Form", "Example"], "rows": rows, "n": []}, e=e, x=x, fix=fix)

C1 = {
 "Subjuntivo avanzado": B("Ortografía: solo, este, ese sin tilde (RAE 2010)",
   "Since the 2010 Ortografía, solo (only) and the demonstratives este, ese, aquel never need an accent, even as pronouns. The accent is only accepted on solo where the sentence would truly be ambiguous.",
   [["solo = solamente", "Solo quiero que me escuches."], ["este · ese · aquel", "Prefiero este a ese."], ["sólo, éste (old spelling)", "Not wrong in old texts, but not used today."]],
   [["Solo te pido que me digas la verdad, aunque esta no me guste.", "I only ask you to tell me the truth, even if I don't like it."]],
   [["___ (only) espero que lo entiendas.", "Solo|Solamente", "Current spelling: solo, without an accent."], ["De todos los proyectos, prefiero ___ (this one).", "este", "Demonstrative pronoun: este, no accent (RAE 2010)."], ["No es que ___ (only) quiera dinero.", "solo|solamente", "Solo, no accent."]],
   [["Sólo quiero que me lo expliques.", "Solo quiero que me lo expliques.", "Current RAE spelling: solo, without an accent."], ["Ésta es la propuesta que más me convence.", "Esta es la propuesta que más me convence.", "Demonstrative pronouns don't take an accent: esta."]]),
 "Conectores y cohesión": B("Ortografía: la puntuación de los conectores",
   "Connectors that open or interrupt a sentence go between commas: Sin embargo, … · El proyecto, no obstante, … After a semicolon, the connector is followed by a comma: …; por consiguiente, … Porque and aunque are not separated by a comma from what follows.",
   [["sin embargo, no obstante", "El plan es bueno; sin embargo, es caro."], ["es decir, o sea", "Llegó tarde, es decir, a las once."], ["por consiguiente", "No hubo acuerdo; por consiguiente, se aplazó."]],
   [["El informe es riguroso; no obstante, algunas conclusiones resultan discutibles.", "The report is rigorous; nevertheless, some conclusions are debatable."]],
   [["Es un buen candidato; ___, le falta experiencia.", "sin embargo|no obstante", "Contrast after a semicolon: sin embargo / no obstante, followed by a comma."], ["Los precios suben; ___, el consumo baja.", "por consiguiente|por lo tanto|en consecuencia", "Consequence: por consiguiente, followed by a comma."], ["Llegó a las once, ___, dos horas tarde.", "es decir|o sea", "Reformulation: es decir, between commas."]],
   [["El plan es bueno sin embargo es caro.", "El plan es bueno; sin embargo, es caro.", "Sin embargo links two sentences: semicolon before it, comma after it."], ["No vino, porque, estaba enfermo.", "No vino porque estaba enfermo.", "Porque introduces the cause directly: no commas around it."]]),
 "Expresiones idiomáticas": B("Pronunciación: el ritmo de las frases hechas",
   "Set phrases are said as one rhythmic unit, with the main stress on the last content word: estar en las NUBES, tomar el PELO, meter la PATA. Don't pause inside them.",
   [["estar en las nubes", "es-ta-ren-las-NU-bes"], ["meter la pata", "me-ter-la-PA-ta"], ["no tener pelos en la lengua", "no-te-ner-pe-los-en-la-LEN-gua"]],
   [["No te enfades, que solo te estaba tomando el pelo.", "Don't get angry, I was only pulling your leg."]],
   [["Cuando hablé de su ex, metí la ___.", "pata", "Meter la pata: to put your foot in it."], ["No me escuchas: estás en las ___.", "nubes", "Estar en las nubes: to be daydreaming."], ["Dice lo que piensa: no tiene pelos en la ___.", "lengua", "No tener pelos en la lengua: to be outspoken."]],
   [["Me estás tomando el cabello.", "Me estás tomando el pelo.", "The set phrase is tomar el pelo: words in idioms can't be swapped."], ["Metí la pierna en la reunión.", "Metí la pata en la reunión.", "The idiom is meter la pata."]]),
 "Registro formal": B("Ortografía: abreviaturas y tratamientos",
   "Abbreviations of titles keep their accent and end in a full stop: Sr., Sra., D., D.ª, Ud., Uds., Lic., Dr., Dra. Usted written in full has no capital: le ruego que usted…",
   [["Sr. · Sra. · Srta.", "Estimado Sr. Ortega:"], ["D. · D.ª", "D.ª Carmen Ruiz"], ["Ud. · Uds. (usted, ustedes)", "Les ruego que Uds. confirmen la asistencia."]],
   [["Estimada Sra. Ruiz: le agradecería que me enviara el contrato firmado.", "Dear Ms Ruiz: I would be grateful if you could send me the signed contract."]],
   [["Estimado ___ (Mr.) López:", "Sr.", "Abbreviation of señor: Sr., with a full stop."], ["Le escribo para solicitar ___ (information) sobre el curso.", "información", "Información, with an accent on the -ón."], ["Quedo a la espera de su ___ (reply).", "respuesta", "Formal closing: quedo a la espera de su respuesta."]],
   [["Estimado Sr Pérez,", "Estimado Sr. Pérez:", "Sr. takes a full stop, and formal letters in Spanish open with a colon."], ["Estimado Sr. Pérez, le escribo para solicitar informacion.", "Estimado Sr. Pérez: le escribo para solicitar información.", "Formal letters open with a colon, and información has an accent on -ón."]]),
 "Régimen preposicional": B("Pronunciación: preposición y artículo: al, del",
   "A + el and de + el contract to al and del, in speech and in writing, except with names that include the article (El Salvador, El País) and in quotes: viajó a El Salvador.",
   [["a + el = al", "Voy al médico."], ["de + el = del", "Vengo del trabajo."], ["names with El", "Viajó a El Salvador · el director de El País"]],
   [["Me acordé del cumpleaños de mi madre cuando llegué al trabajo.", "I remembered my mother's birthday when I got to work."]],
   [["Me he olvidado ___ libro en casa.", "del", "Olvidarse de + el: del."], ["Se negó ___ trabajo extra.", "al", "Negarse a + el: al."], ["Volvió ___ El Salvador después de diez años.", "a", "Name with the article El: no contraction, a El Salvador."]],
   [["Pienso de él todos los días.", "Pienso en él todos los días.", "Pensar en (think about)."], ["Viajamos al Salvador en enero.", "Viajamos a El Salvador en enero.", "El is part of the country's name: no contraction."]]),
 "Verbos de cambio": B("Ortografía: el acento en se volvió, se hizo, llegó a ser",
   "Past forms of change verbs are stressed on the last syllable and carry an accent: se volvió, se quedó, llegó a ser, se convirtió. Hizo and puso have no accent (irregular stems).",
   [["volvió · quedó · convirtió", "Se volvió más tranquilo."], ["hizo · puso (no accent)", "Se hizo médico · se puso rojo."], ["llegó a ser", "Llegó a ser directora."]],
   [["Después del accidente se volvió más prudente y llegó a ser una conductora ejemplar.", "After the accident she became more careful and became an exemplary driver."]],
   [["Con los años, mi abuelo se ___ (volver) muy cariñoso.", "volvió", "Change of character: se volvió, with an accent."], ["Al oír la noticia, se ___ (poner) pálido.", "puso", "Sudden change of state: se puso, no accent."], ["Estudió mucho y se ___ (hacer) abogada.", "hizo", "Change through effort: se hizo, no accent."]],
   [["Se convirtio en una ciudad moderna.", "Se convirtió en una ciudad moderna.", "Convirtió: stressed on the last syllable, with an accent."], ["Se quedo sin palabras.", "Se quedó sin palabras.", "Quedó: stressed on -dó, with an accent."]]),
}
A2_X = {
 "El pretérito indefinido": [["Anoche no ___ (dormir, yo) bien.", "dormí", "Dormir, yo: dormí."], ["Mi hermana ___ (pedir) una pizza.", "pidió", "Pedir, ella: pidió (e → i)."], ["¿A qué hora ___ (volver, vosotros)?", "volvisteis|volvieron", "Volver: volvisteis (Spain), volvieron (Latin America)."], ["Ayer ___ (haber) un accidente en la autopista.", "hubo", "Haber, indefinido: hubo."]],
 "El pretérito imperfecto": [["Antes la gente no ___ (usar) el móvil para todo.", "usaba", "Habit in the past: usaba."], ["Eran las diez y ___ (llover).", "llovía", "Weather as background: llovía."], ["Cuando éramos niños, ___ (jugar, nosotros) en la calle.", "jugábamos", "Nosotros, -ar: jugábamos."], ["Mi abuelo ___ (ser) pescador.", "era", "Ser in the imperfect: era."]],
 "El pretérito perfecto": [["¿Qué ___ (hacer, tú) hoy?", "has hecho", "Today, a period that includes now: has hecho."], ["Todavía no ___ (abrir, ellos) la tienda.", "han abierto", "Abrir → abierto."], ["Este mes ___ (ir, nosotros) dos veces al cine.", "hemos ido", "Ir → ido."], ["Ya te ___ (decir, yo) todo lo que sé.", "he dicho", "Decir → dicho (irregular participle)."]],
 "Ropa y comparaciones": [["Este es el vestido ___ bonito de la tienda.", "más", "Superlative: el más bonito."], ["Mi casa es ___ grande como la tuya.", "tan", "Equality with an adjective: tan … como."], ["Tengo ___ libros como tú.", "tantos", "Equality with a noun: tantos, agreeing with libros."], ["Este café es ___ (better) que el de ayer.", "mejor", "Bueno → mejor."]],
 "La salud": [["¿Qué te ___ (pasar)? Tienes mala cara.", "pasa", "¿Qué te pasa?: what's wrong?"], ["Tienes que ___ (tomar) el jarabe después de comer.", "tomar", "Tener que + infinitive."], ["No ___ (deber, tú) fumar tanto.", "debes", "Advice: deber + infinitive."], ["Me ___ (doler) la espalda desde ayer.", "duele", "Singular subject (la espalda): duele."]],
 "Viajes y transporte": [["El tren ___ (salir) a las ocho en punto.", "sale", "Timetable: present tense, sale."], ["¿Cuánto ___ (costar) el billete?", "cuesta", "Costar (o → ue): cuesta."], ["___ (ir, nosotros) a la estación en taxi.", "Vamos|Fuimos", "Ir: vamos (present) or fuimos (past)."], ["El avión ___ (llegar) con retraso ayer.", "llegó", "Past, ayer: llegó."]],
 "El trabajo y el futuro": [["Mañana ___ (saber, nosotros) los resultados.", "sabremos", "Saber → sabr-: sabremos."], ["¿___ (venir, tú) a la reunión?", "Vendrás", "Venir → vendr-: vendrás."], ["El jefe ___ (decir) algo mañana.", "dirá", "Decir → dir-: dirá."], ["Mis compañeros ___ (salir) a las seis.", "saldrán", "Salir → saldr-: saldrán."]],
}
A2_P = {"El pretérito indefinido": ["Ellos ___ (cantar) en la fiesta.", "cantaron", "Ellos: cantaron, stressed on -TA-, no accent."],
 "El pretérito imperfecto": ["Ella ___ (querer) un perro.", "quería", "Imperfect: quería, with an accent on the í."],
 "El pretérito perfecto": ["¿___ (oír, tú) la noticia?", "Has oído", "Oír → oído, with an accent on the í."],
 "Ropa y comparaciones": ["Este jersey es muy ___ (expensive).", "caro", "Caro has one tapped r; carro, with rr, is a car."],
 "La salud": ["Me pica la ___ (skin).", "piel", "Piel: one syllable, no accent."],
 "Viajes y transporte": ["¿___ (where) está la parada?", "Dónde", "Question word: dónde, with an accent."],
 "El trabajo y el futuro": ["Ellos ___ (trabajar) mañana.", "trabajarán", "Future, ellos: trabajarán, with an accent."]}
A2_F = {"El pretérito indefinido": ["Ayer Pedro compro pan y leche.", "Ayer Pedro compró pan y leche.", "Past, él: compró, stressed on -PRÓ, with an accent."],
 "El pretérito imperfecto": ["Antes vivian en el campo.", "Antes vivían en el campo.", "Imperfect: vivían, the stressed í takes an accent."],
 "El pretérito perfecto": ["¿A ido alguna vez a Coiba?", "¿Ha ido alguna vez a Coiba?", "Ha (from haber) is written with a silent h."],
 "Ropa y comparaciones": ["Mi hermano tiene un caro rojo nuevo.", "Mi hermano tiene un carro rojo nuevo.", "Car is carro, with a trilled rr; caro means expensive."],
 "La salud": ["El médico me dio un jarave.", "El médico me dio un jarabe.", "Jarabe: j at the start, b in the middle."],
 "Viajes y transporte": ["¿Cuanto tarda el autobús?", "¿Cuánto tarda el autobús?", "Question word: cuánto, with an accent."],
 "El trabajo y el futuro": ["Mañana hablare con la directora.", "Mañana hablaré con la directora.", "Future, yo: hablaré, with an accent."]}
A2_F2 = [("El pretérito indefinido", ["El domingo jugé al fútbol.", "El domingo jugué al fútbol.", "Jugar → jugué: g becomes gu before e, and the accent on -gué."]),
 ("El pretérito imperfecto", ["Mi abuela hacia pan todos los días.", "Mi abuela hacía pan todos los días.", "Imperfect of hacer: hacía; «hacia» without an accent means towards."]),
 ("Viajes y transporte", ["No sé donde está la parada.", "No sé dónde está la parada.", "Indirect question: dónde keeps its accent."]),
 ("El trabajo y el futuro", ["El año que viene tendre mi propio negocio.", "El año que viene tendré mi propio negocio.", "Future, yo: tendré, with an accent."]),
 ("La salud", ["Me duele la garganta y tengo tos y fiebre, por eso fuí al médico.", "Me duele la garganta y tengo tos y fiebre, por eso fui al médico.", "Fui has one syllable: no accent."])]
SPEAK = {"id": "sp-c1-06", "lvl": "c1", "task": "Conversar sobre un tema y negociar (Tarea 3)", "prompt": ["Tu equipo tiene que elegir entre trabajar en remoto o volver a la oficina tres días por semana. Explica tu postura, responde a las objeciones habituales y propón un acuerdo.", "Your team has to choose between working remotely or going back to the office three days a week. Explain your position, answer the usual objections and propose an agreement."],
  "points": [["postura", ["a mi modo de ver", "considero que", "lo que está claro es que"]], ["responder a objeciones", ["entiendo que", "aun así", "eso no quita que"]], ["proponer un acuerdo", ["¿qué os parecería…?", "podríamos", "siempre y cuando"]]], "minWords": 150,
  "model": "A mi modo de ver, el trabajo en remoto ha demostrado que funciona: somos igual de productivos y nos ahorramos horas de tráfico. Entiendo que algunos echen de menos el contacto con los compañeros y que la empresa tema perder cohesión; aun así, eso no quita que podamos organizarnos de otra manera. Lo que está claro es que no todas las tareas son iguales: las reuniones creativas salen mejor en persona, mientras que el trabajo de concentración se hace mejor en casa. Por eso propondría un acuerdo: ¿qué os parecería venir a la oficina un día fijo por semana para reuniones y dejar el resto en remoto, siempre y cuando se cumplan los objetivos? Podríamos revisarlo dentro de tres meses."}
n = 0
for title, x in C1.items():
    u = next(u for u in L["c1"] if u["t"] == title)
    if any(g["t"] == x["g"]["t"] for g in u.get("g", [])): continue
    assert all(len(i) == 3 for i in x["x"] + x["fix"]), title
    u.setdefault("g", []).append(x["g"])
    for k in ("e", "x", "fix"): u.setdefault(k, []).extend(x[k])
    n += 1
for title, xx in A2_X.items():
    u = next(u for u in L["a2"] if u["t"] == title); have = {i[0] for i in u.get("x", [])}
    for it in xx + [A2_P[title]]:
        assert len(it) == 3, it
        if it[0] not in have: u["x"].append(it); n += 1
for title, it in A2_F.items():
    u = next(u for u in L["a2"] if u["t"] == title)
    if it[0] not in {i[0] for i in u.get("fix", [])}: u["fix"].append(it); n += 1
for title, it in A2_F2:
    u = next(u for u in L["a2"] if u["t"] == title)
    if it[0] not in {i[0] for i in u.get("fix", [])}: u["fix"].append(it); n += 1
s = s[:m.start(2)] + json.dumps(L, ensure_ascii=False, separators=(",", ":")) + s[m.end(2):]
mv = re.search(r"(const VOICE = )(\{.*?\});\n", s); V = json.loads(mv.group(2))
if not any(x["id"] == SPEAK["id"] for x in V["speaking"]): V["speaking"].append(SPEAK); n += 1
s = s[:mv.start(2)] + json.dumps(V, ensure_ascii=False, separators=(",", ":")) + s[mv.end(2):]
open(P, "w", encoding="utf-8").write(s)
print("added", n)
