"""Curriculum gap fixes, batch 3 (16 Nov 2026): B1 -> B2 practice drops in grammar and listening (coverage dashboard "progression").
- 21 "correct the sentence" items, 3 per B2 unit, appended to each unit's fix list (so saved answers keep their indexes).
- 4 short B2 news listenings with questions (Escuchar), original texts.
Re-runnable.   Usage: python3 tools/content/add_b2_practice.py index.html"""
import json, re, sys
P = sys.argv[1] if len(sys.argv) > 1 else "index.html"
s = open(P, encoding="utf-8").read()
FIX = {
 "Imperfecto de subjuntivo": [
  ["Me pidió que le ayudo con la mudanza.", "Me pidió que le ayudara con la mudanza|Me pidió que le ayudase con la mudanza", "A past request («me pidió que») takes the imperfect subjunctive: ayudara."],
  ["Espero que mañana no llueve: tenemos la boda.", "Espero que mañana no llueva: tenemos la boda", "«Esperar que» expresses a wish, so the verb goes in the subjunctive: llueva."],
  ["Era necesario que todos firman el documento.", "Era necesario que todos firmaran el documento|Era necesario que todos firmasen el documento", "«Era necesario que» (past) + imperfect subjunctive: firmaran."]],
 "Oraciones condicionales": [
  ["Si habría sabido la verdad, no habría venido.", "Si hubiera sabido la verdad, no habría venido|Si hubiese sabido la verdad, no habría venido", "Past unreal condition: si + pluperfect subjunctive (hubiera sabido), never the conditional."],
  ["Si tienes tiempo, me llamarías.", "Si tienes tiempo, llámame|Si tienes tiempo, me llamas", "A real condition with present indicative is followed by present, future or imperative, not the conditional."],
  ["De haberlo sabido antes, te lo diría ayer.", "De haberlo sabido antes, te lo habría dicho ayer|De haberlo sabido antes, te lo hubiera dicho ayer", "«De + infinitive compuesto» refers to the past, so the result is the conditional perfect: habría dicho."]],
 "Tiempo, finalidad y concesión": [
  ["Te lo explico para que lo entiendes.", "Te lo explico para que lo entiendas", "«Para que» always takes the subjunctive: entiendas."],
  ["Aunque mañana hará frío, iremos a la playa.", "Aunque mañana haga frío, iremos a la playa", "A possible future obstacle after «aunque» takes the subjunctive: haga."],
  ["En cuanto llegaré, te escribo.", "En cuanto llegue, te escribo", "No future after «en cuanto» for a future action: present subjunctive llegue."]],
 "Oraciones de relativo": [
  ["Es el profesor cuyo el libro leímos en clase.", "Es el profesor cuyo libro leímos en clase", "«Cuyo» already works as a determiner: never add an article after it."],
  ["No conozco a nadie que habla ruso.", "No conozco a nadie que hable ruso", "After a negative antecedent («nadie») the relative clause takes the subjunctive: hable."],
  ["La chica que te hablé ayer es mi prima.", "La chica de la que te hablé ayer es mi prima|La chica de quien te hablé ayer es mi prima", "«Hablar de» keeps its preposition before the relative: de la que / de quien."],
  ["El pueblo donde que nací es muy pequeño.", "El pueblo donde nací es muy pequeño|El pueblo en el que nací es muy pequeño", "Use «donde» or «en el que», never both together."]],
 "Pasiva e impersonalidad": [
  ["Se alquila habitaciones para estudiantes.", "Se alquilan habitaciones para estudiantes", "Pasiva refleja: the verb agrees with the plural subject «habitaciones» → se alquilan."],
  ["Se informó a los vecinos del corte de agua y se les avisaron.", "Se informó a los vecinos del corte de agua y se les avisó", "With a person introduced by «a» or «les», the impersonal «se» stays singular: se les avisó."],
  ["Los resultados serán anunciado mañana.", "Los resultados serán anunciados mañana", "In the passive with «ser», the participle agrees with the subject: anunciados."],
  ["En esta empresa se trabajan mucho.", "En esta empresa se trabaja mucho", "Impersonal «se» with an intransitive verb is always singular: se trabaja."]],
 "Perífrasis y argumentación": [
  ["Llevo tres años a estudiar español.", "Llevo tres años estudiando español", "«Llevar + time + gerund» for duration: llevo tres años estudiando."],
  ["Dejé fumar el año pasado.", "Dejé de fumar el año pasado", "«Dejar de» + infinitive (stop doing): the «de» is required."],
  ["Tengo de terminar el informe hoy.", "Tengo que terminar el informe hoy", "Obligation is «tener que» + infinitive, not «tener de»."]],
 "Estilo indirecto en pasado": [
  ["Me preguntó si quiero venir a la cena del sábado pasado.", "Me preguntó si quería venir a la cena del sábado pasado", "A past reporting verb about a past event: the present «quiero» shifts to the imperfect «quería»."],
  ["Dijo que mañana iría al médico. (said last week)", "Dijo que al día siguiente iría al médico", "In reported speech in the past, «mañana» becomes «al día siguiente» when the day has passed."],
  ["Me pidió que no le llamo tan tarde.", "Me pidió que no le llamara tan tarde|Me pidió que no le llamase tan tarde", "A reported command in the past takes the imperfect subjunctive: llamara."]],
}
def news(i, t, sub, paras, gl, q):
    return {"id": "news-b2-%02d" % i, "cat": "news", "lvl": "b2", "country": "España", "t": t, "s": sub, "paras": [{"s": p} for p in paras], "gl": gl, "q": q}
NEWS = [
 news(6, "Las bibliotecas abren de noche", "News · Libraries open late during exams",
  [[["Varias bibliotecas municipales ampliarán su horario hasta las dos de la madrugada durante la época de exámenes.", "Several city libraries will extend their opening hours until 2 am during the exam period."], ["La medida, que se pondrá en marcha en mayo, responde a una petición de las asociaciones de estudiantes.", "The measure, which will start in May, responds to a request from student associations."]],
   [["Según el ayuntamiento, el año pasado las salas de estudio se llenaban antes de las diez de la mañana.", "According to the council, last year the study rooms were full before ten in the morning."], ["Para entrar después de las diez de la noche será necesario reservar plaza a través de una aplicación.", "To enter after 10 pm it will be necessary to book a place through an app."]]],
  [["ampliar", "to extend"], ["la madrugada", "early hours of the morning"], ["ponerse en marcha", "to start up"], ["la plaza", "place, seat"]],
  [["¿Por qué se toma esta medida?", ["porque lo pidieron los estudiantes", "porque sobran salas de estudio", "para ahorrar energía"], 0], ["¿Qué hay que hacer para entrar a partir de las diez de la noche?", ["pagar una entrada", "reservar con una aplicación", "presentar el carné universitario"], 1], ["¿Qué ocurría el año pasado?", ["las salas estaban vacías por la mañana", "las salas se llenaban muy pronto", "las bibliotecas cerraban en mayo"], 1]]),
 news(7, "Menos plástico en los mercados", "News · Markets switch to reusable bags",
  [[["Los mercados tradicionales de la ciudad dejarán de dar bolsas de plástico a partir del próximo mes.", "The city's traditional markets will stop giving out plastic bags from next month."], ["En su lugar, los comerciantes ofrecerán bolsas de tela a un precio simbólico de cincuenta céntimos.", "Instead, traders will offer cloth bags at a token price of fifty cents."]],
   [["Los vendedores reconocen que al principio algunos clientes protestaron, aunque la mayoría ya trae su propio carro.", "The traders admit some customers complained at first, although most now bring their own trolley."], ["La iniciativa forma parte de un plan para reducir a la mitad los residuos de los mercados en tres años.", "The initiative is part of a plan to halve market waste in three years."]]],
  [["dejar de", "to stop (doing)"], ["la tela", "cloth"], ["el carro", "shopping trolley"], ["los residuos", "waste"]],
  [["¿Qué ofrecerán los comerciantes?", ["bolsas de plástico gratis", "bolsas de tela baratas", "carros de la compra"], 1], ["¿Cómo reaccionaron los clientes?", ["todos protestaron", "algunos protestaron al principio", "nadie se dio cuenta"], 1], ["¿Cuál es el objetivo del plan?", ["reducir los residuos a la mitad", "cerrar los mercados tradicionales", "vender más carros"], 0]]),
 news(8, "Un tren nocturno vuelve a unir dos capitales", "News · A night train returns",
  [[["Tras diez años sin servicio, un tren nocturno volverá a conectar Madrid y Lisboa a partir de junio.", "After ten years without service, a night train will once again connect Madrid and Lisbon from June."], ["El viaje durará unas nueve horas y los billetes más baratos costarán treinta y cinco euros.", "The journey will take about nine hours and the cheapest tickets will cost thirty-five euros."]],
   [["La compañía espera atraer sobre todo a viajeros preocupados por el medio ambiente.", "The company hopes to attract above all travellers concerned about the environment."], ["Sin embargo, algunos expertos dudan de que pueda competir con los vuelos de bajo coste, que tardan poco más de una hora.", "However, some experts doubt it can compete with low-cost flights, which take just over an hour."]]],
  [["tras", "after"], ["volver a + inf.", "to do again"], ["el vuelo de bajo coste", "low-cost flight"], ["dudar de que", "to doubt that"]],
  [["¿Desde cuándo no había tren nocturno?", ["desde hacía diez años", "desde junio", "desde hacía nueve años"], 0], ["¿A quién quiere atraer la compañía?", ["a viajeros de negocios", "a viajeros preocupados por el medio ambiente", "a familias con niños"], 1], ["¿Qué dudan algunos expertos?", ["que el tren llegue a tiempo", "que pueda competir con el avión", "que los billetes sean baratos"], 1]]),
 news(9, "La semana de cuatro días, a prueba", "News · A four-day week trial",
  [[["Treinta empresas participarán durante un año en una prueba piloto de la semana laboral de cuatro días.", "Thirty companies will take part for a year in a pilot of the four-day working week."], ["Los empleados trabajarán treinta y dos horas semanales sin que se reduzca su sueldo.", "Employees will work thirty-two hours a week without their salary being cut."]],
   [["El Gobierno financiará parte del coste para las pequeñas empresas.", "The government will fund part of the cost for small firms."], ["Los primeros resultados de experiencias similares en otros países apuntan a una mayor productividad y a menos bajas por estrés, si bien no todos los sectores pueden adaptarse con facilidad.", "Early results from similar trials in other countries point to higher productivity and less sick leave for stress, although not every sector can adapt easily."]]],
  [["la prueba piloto", "pilot scheme"], ["el sueldo", "salary"], ["financiar", "to fund"], ["la baja", "sick leave"]],
  [["¿Qué pasará con el sueldo de los trabajadores?", ["bajará un poco", "no cambiará", "subirá"], 1], ["¿A quién ayudará el Gobierno?", ["a las grandes empresas", "a las pequeñas empresas", "a todos los trabajadores"], 1], ["¿Qué limitación menciona la noticia?", ["no todos los sectores se adaptan fácilmente", "la productividad baja", "hay más bajas por estrés"], 0]]),
]
m = re.search(r"(  const LXS = )(\{.*?\});\n", s); L = json.loads(m.group(2)); nf = 0
for u in L["b2"]:
    have = {f[0] for f in u.get("fix", [])}
    for f in FIX.get(u["t"], []):
        if f[0] not in have: u.setdefault("fix", []).append(f); nf += 1
s = s[:m.start(2)] + json.dumps(L, ensure_ascii=False, separators=(",", ":")) + s[m.end(2):]
i = s.index("const LISTEN = ") + 15; j = s.index("];\n", i); LI = json.loads(s[i:j + 1]); ids = {x["id"] for x in LI}; nn = 0
for x in NEWS:
    if x["id"] in ids: continue
    j = s.index("];\n", i); s = s[:j] + "," + json.dumps(x, ensure_ascii=False, separators=(",", ":")) + s[j:]; nn += 1
open(P, "w", encoding="utf-8").write(s)
print("B2 fix items +%d, B2 news +%d" % (nf, nn))
