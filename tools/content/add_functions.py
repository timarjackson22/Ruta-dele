"""Curriculum gap fixes (16 Nov 2026), from the coverage dashboard's "Not taught" findings:
  f-complain (B1, PCIC Funciones 4: reclamar y quejarse)  -> B1 unit 5 «El condicional»
  f-persuade (C1, PCIC Funciones 4: persuadir y convencer) -> C1 unit 2 «Conectores y cohesión»
  f-irony    (C2, PCIC Funciones 6: ironía, humor y doble sentido) -> C2 unit 2 «Refranes y registro coloquial»
Each adds a teaching block (rule + examples + notes) and four practice items (2 mc, 1 tr, 1 fix), appended so saved answers keep their indexes.
Re-runnable: a block already present is not added again.   Usage: python3 tools/content/add_functions.py index.html"""
import json, re, sys
P = sys.argv[1] if len(sys.argv) > 1 else "index.html"
s = open(P, encoding="utf-8").read()
m = re.search(r"(  const LXS = )(\{.*?\});\n", s)
L = json.loads(m.group(2))
ADD = {
 ("b1", "El condicional"): dict(
  g={"t": "Reclamar y quejarse: complaints and asking for a solution", "r": "Say what is wrong, give the facts, then ask politely for a solution: the conditional softens the request.",
     "h": ["Step", "Phrase", "Example"],
     "rows": [["Say there's a problem", "Quería hacer una reclamación / quejarme de…", "Quería hacer una reclamación: el móvil que compré ayer no funciona."],
              ["Give the facts", "Lo compré el… / Llevo… esperando", "Lo compré el lunes y la pantalla ya está rota."],
              ["Ask for a solution", "¿Podría(n)…? / Me gustaría que…", "¿Podrían cambiármelo por otro? Me gustaría que me devolvieran el dinero."],
              ["Insist politely", "Entiendo, pero… / Lo siento, pero no es aceptable", "Entiendo, pero el producto tiene dos años de garantía."],
              ["Close", "¿Qué solución me pueden dar?", "Si no, tendré que poner una reclamación por escrito."]],
     "n": ["Key verbs|devolver (give back, refund), cambiar (exchange), arreglar (fix), reembolsar (refund); la hoja de reclamaciones is the official complaints form in Spain.",
           "Me gustaría que + past subjunctive|Me gustaría que me lo cambiaran: the most polite way to ask someone else to do something."]},
  mc=[["Quería hacer una ___: el abrigo tiene un agujero.", ["reclamación", "receta", "recepción"], 0, "«Hacer una reclamación» is the set phrase for a formal complaint in a shop or service. «Receta» is a recipe or prescription; «recepción» is a reception desk."],
      ["¿___ cambiármelo por otro, por favor?", ["Podría", "Pudo", "Puede que"], 0, "A polite request uses the conditional: ¿Podría…? «Pudo» is past (managed to) and «puede que» means maybe."]],
  tr=[["I'd like you to give me my money back. (usted)", "Me gustaría que me devolviera el dinero|Quisiera que me devolviera el dinero|Me gustaría que me devolviese el dinero", "Polite request: me gustaría que + past subjunctive (devolviera)."]],
  fix=[["Quiero que me devuelven el dinero.", "Quiero que me devuelvan el dinero.", "After «quiero que» the verb goes in the subjunctive: devuelvan."]]),
 ("c1", "Conectores y cohesión"): dict(
  g={"t": "Persuadir y convencer: argumentar", "r": "To persuade, concede the other view, counter it with a reason and its consequence, then propose: soften with the conditional, propose with the subjunctive.",
     "h": ["Move", "Expressions", "Example"],
     "rows": [["Concede, then counter", "Es cierto que…; sin embargo… / Si bien…", "Si bien la medida es cara, a largo plazo ahorraría dinero."],
              ["Give a strong reason", "Lo fundamental es que… / No hay que olvidar que…", "No hay que olvidar que el 60 % de los vecinos lo ha pedido."],
              ["Show the consequence", "De ahí que + subjuntivo / Por consiguiente", "Los alquileres suben; de ahí que tantos jóvenes no puedan independizarse."],
              ["Appeal to the listener", "¿No le parece que…? / Piense que…", "¿No le parece que merecería la pena intentarlo?"],
              ["Push for agreement", "Le propongo que + subjuntivo / Lo mejor sería que + imperfecto de subjuntivo", "Lo mejor sería que lo probáramos durante un mes."]],
     "n": ["Mood|«No es que no quiera, es que no puedo»: «no es que» takes the subjunctive; the real reason that follows takes the indicative.",
           "DELE C1|The speaking paper's negotiation task and the formal letter or article in the writing paper reward exactly these moves."]},
  mc=[["Es verdad que es caro; ___, a la larga nos ahorraría dinero.", ["sin embargo", "por lo tanto", "de ahí que"], 0, "You concede a point (es verdad que…) and then counter it: sin embargo. «Por lo tanto» and «de ahí que» introduce a consequence, not a counter-argument."],
      ["Lo mejor sería que lo ___ durante un mes.", ["probáramos", "probamos", "probaremos"], 0, "«Lo mejor sería que» is followed by the imperfect subjunctive: probáramos."]],
  tr=[["It's not that I don't want to, it's that I can't.", "No es que no quiera, es que no puedo|No es que no quiera, sino que no puedo", "«No es que» + subjunctive rejects a reason; the real reason follows in the indicative."]],
  fix=[["Los precios suben, de ahí que la gente compra menos.", "Los precios suben, de ahí que la gente compre menos.", "«De ahí que» always takes the subjunctive."]]),
 ("c2", "Refranes y registro coloquial"): dict(
  g={"t": "Ironía, humor y doble sentido", "r": "Irony says the opposite of what is meant: the situation, the tone and a few set phrases give it away. A double meaning plays on a word or phrase with two senses.",
     "h": ["Resource", "Example", "What it really means"],
     "rows": [["Ironic praise", "¡Qué puntual! (to someone two hours late)", "You're very late."],
              ["Exaggerated thanks", "Muchas gracias por avisar con tanta antelación.", "You told me far too late."],
              ["Set ironic phrases", "¡Lo que faltaba! · ¡Estamos buenos! · ¡Hombre, claro! (ironic)", "That's all we needed · We're in trouble · Obviously not."],
              ["Understatement", "No es precisamente barato.", "It's very expensive."],
              ["Double meaning", "Estoy hecho polvo. · Un chiste verde.", "I'm exhausted (literally: turned to dust) · A risqué joke."]],
     "n": ["Spotting it|Look for a clash between the words and the situation, exaggeration (tanto, muchísimo) and ironic «¡Qué + adjetivo!».",
           "In the exam|Irony and humour appear in the reading and listening texts of DELE C2; in speaking, a light touch shows command of the language, but avoid it in formal writing."]},
  mc=[["Llegas dos horas tarde y tu amigo dice: «¡Qué puntual eres!». Quiere decir que…", ["llegas muy tarde", "eres muy puntual", "no le importa"], 0, "It is ironic praise: the words say the opposite of the situation."],
      ["«No es precisamente barato» significa que es…", ["muy caro", "bastante barato", "de precio normal"], 0, "«No es precisamente» + adjective is an understatement that means the opposite, strongly."]],
  tr=[["That's all we needed! (ironic)", "¡Lo que faltaba!|¡Solo faltaba eso!|¡Lo que nos faltaba!", "«¡Lo que faltaba!» is the set ironic phrase for one more problem on top of the others."]],
  fix=[["«¡Qué bien, otra vez lluvia!», dijo sin ironía, porque odia la lluvia.", "«¡Qué bien, otra vez lluvia!», dijo con ironía, porque odia la lluvia.", "If she hates rain, «¡Qué bien!» is ironic: the words say the opposite of what she means."]]),
}
n = 0
for (lv, title), x in ADD.items():
    u = next(u for u in L[lv] if u["t"] == title)
    if any(g["t"] == x["g"]["t"] for g in u.get("g", [])): continue
    u.setdefault("g", []).append(x["g"])
    for k in ("mc", "tr", "fix"): u.setdefault(k, []).extend(x[k])
    n += 1
s = s[:m.start(2)] + json.dumps(L, ensure_ascii=False, separators=(",", ":")) + s[m.end(2):]
open(P, "w", encoding="utf-8").write(s)
print("added", n, "blocks")
