"""B2 grammar practice top-up (17 Nov 2026), from the coverage dashboard's "Practice drops from B1 to B2: Grammar /
Listening" findings. Each B2 unit gets 4 fill-in items, 2 corrections and 1 example sentence (it feeds the listening and
sentence-building drills). Appended, so saved answers keep their indexes. Re-runnable: items already present are skipped.
Usage: python3 tools/content/add_b2_grammar.py index.html"""
import json, re, sys
P = sys.argv[1] if len(sys.argv) > 1 else "index.html"
s = open(P, encoding="utf-8").read()
m = re.search(r"(  const LXS = )(\{.*?\});\n", s)
L = json.loads(m.group(2))

ADD = {
 "Imperfecto de subjuntivo": dict(
  x=[["Me pidió que le ___ (ayudar, yo) con la mudanza.", "ayudara|ayudase", "Past main verb (pidió) + que → imperfect subjunctive: ayudara / ayudase."],
     ["Ojalá ___ (tener, nosotros) más tiempo libre.", "tuviéramos|tuviésemos", "Ojalá + imperfect subjunctive for an unlikely or impossible wish: tuviéramos."],
     ["Era normal que los niños ___ (estar) nerviosos.", "estuvieran|estuviesen", "Era normal que (past) + imperfect subjunctive: estuvieran."],
     ["No creía que ___ (ser) tan difícil.", "fuera|fuese", "No creía que (past doubt) + imperfect subjunctive: fuera."]],
  fix=[["Me dijo que lo llamaría cuando llegaba a casa.", "Me dijo que lo llamaría cuando llegara a casa.|Me dijo que lo llamaría cuando llegase a casa.", "A future event seen from the past: cuando + imperfect subjunctive (llegara)."],
       ["Quería que vienes a la fiesta.", "Quería que vinieras a la fiesta.|Quería que vinieses a la fiesta.", "Quería que (past) + imperfect subjunctive: vinieras."]],
  e=[["Mis padres siempre querían que estudiara medicina, pero yo elegí periodismo.", "My parents always wanted me to study medicine, but I chose journalism."], ["Me sorprendió que nadie protestara por la subida del alquiler.", "It surprised me that nobody complained about the rent increase."], ["Si pudiera elegir, viviría en una casa con jardín cerca del mar.", "If I could choose, I'd live in a house with a garden near the sea."]]),
 "Oraciones condicionales": dict(
  x=[["Si ___ (saber, yo) la respuesta, te la diría.", "supiera|supiese", "Unlikely condition: si + imperfect subjunctive, then conditional."],
     ["Si hubieras venido, te ___ (divertir).", "habrías divertido|hubieras divertido", "Past unreal condition: si + pluperfect subjunctive, then conditional perfect (habrías divertido)."],
     ["Te presto el coche ___ que me lo devuelvas mañana.", "siempre|con tal de|a condición de", "Siempre que / con tal de que / a condición de que + subjunctive set a condition."],
     ["___ llueva, el partido se jugará.", "Aunque", "Aunque + subjunctive: even if it rains (we don't know yet)."]],
  fix=[["Si tendría dinero, viajaría por el mundo.", "Si tuviera dinero, viajaría por el mundo.|Si tuviese dinero, viajaría por el mundo.", "Never the conditional after si: si + imperfect subjunctive (tuviera)."],
       ["Si habría estudiado, habría aprobado.", "Si hubiera estudiado, habría aprobado.|Si hubiese estudiado, habría aprobado.", "Past unreal condition: si + pluperfect subjunctive (hubiera estudiado)."]],
  e=[["Si hubiéramos salido antes, no habríamos perdido el vuelo.", "If we had left earlier, we wouldn't have missed the flight."], ["De haberlo sabido, habría reservado la habitación con antelación.", "Had I known, I would have booked the room in advance."], ["Te dejo las llaves siempre que cierres bien la puerta al salir.", "I'll leave you the keys as long as you lock the door properly when you go out."]]),
 "Tiempo, finalidad y concesión": dict(
  x=[["Te llamaré en cuanto ___ (llegar, yo) al hotel.", "llegue", "En cuanto + future event: present subjunctive (llegue)."],
     ["Hablo despacio para que me ___ (entender, vosotros).", "entendáis|entiendan", "Para que + subjunctive: entendáis (entiendan in Latin America)."],
     ["___ estaba cansado, terminó el informe.", "Aunque|A pesar de que", "A known fact conceded: aunque + indicative (estaba)."],
     ["Antes de que ___ (irse, tú), quiero darte algo.", "te vayas", "Antes de que always takes the subjunctive: te vayas."]],
  fix=[["Cuando tendré tiempo, iré al museo.", "Cuando tenga tiempo, iré al museo.", "Cuando + future event: present subjunctive (tenga), never the future."],
       ["Vine para que me ayudas.", "Vine para que me ayudaras.|Vine para que me ayudases.", "Para que after a past verb (vine): imperfect subjunctive (ayudaras)."]],
  e=[["Aunque el viaje fue largo, mereció la pena por las vistas.", "Although the journey was long, the views made it worth it."], ["En cuanto termine la reunión, te mando el presupuesto por correo.", "As soon as the meeting ends, I'll email you the budget."], ["Por mucho que insistas, no voy a cambiar de opinión.", "However much you insist, I'm not going to change my mind."]]),
 "Oraciones de relativo": dict(
  x=[["Busco un piso que ___ (tener) terraza.", "tenga", "Unknown or hypothetical antecedent: relative + subjunctive (tenga)."],
     ["La empresa para ___ trabajo es alemana.", "la que|la cual", "After a preposition, use el/la que or el/la cual: para la que."],
     ["Ese es el chico ___ padre es médico.", "cuyo", "Possession: cuyo agrees with the thing owned (padre)."],
     ["No hay nadie que ___ (saber) arreglarlo.", "sepa", "Negative antecedent (no hay nadie): subjunctive (sepa)."]],
  fix=[["La amiga que te hablé de ella vive en Madrid.", "La amiga de la que te hablé vive en Madrid.|La amiga de quien te hablé vive en Madrid.", "Hablar de: the preposition goes before the relative (de la que / de quien), with no extra pronoun."],
       ["Es el profesor cuyos clases son las mejores.", "Es el profesor cuyas clases son las mejores.", "Cuyo agrees with the noun that follows: cuyas clases."]],
  e=[["Necesitamos a alguien que hable inglés y tenga experiencia en ventas.", "We need someone who speaks English and has sales experience."], ["El barrio donde crecí ha cambiado tanto que ya casi no lo reconozco.", "The neighbourhood where I grew up has changed so much I hardly recognise it."], ["La periodista con la que hablamos ayer publicará el reportaje el domingo.", "The journalist we spoke to yesterday will publish the report on Sunday."]]),
 "Pasiva e impersonalidad": dict(
  x=[["El puente ___ (construir) en 1914.", "fue construido|se construyó", "Passive with ser (fue construido) or pasiva refleja (se construyó)."],
     ["En esta tienda ___ (vender) productos ecológicos.", "se venden", "Pasiva refleja: the verb agrees with the plural subject (productos): se venden."],
     ["___ dice que va a subir el precio de la gasolina.", "Se", "Impersonal se: se dice que…"],
     ["Las cartas ___ (enviar) ayer por la tarde.", "fueron enviadas|se enviaron", "Passive: fueron enviadas (agreeing with cartas) or se enviaron."]],
  fix=[["Se busca camareros con experiencia.", "Se buscan camareros con experiencia.", "Pasiva refleja: the verb agrees with camareros (plural): se buscan."],
       ["La novela fue escrito por una autora chilena.", "La novela fue escrita por una autora chilena.", "The participle in the passive agrees with the subject: escrita."]],
  e=[["El canal fue inaugurado en 1914 y se amplió cien años después.", "The canal was opened in 1914 and was expanded a hundred years later."], ["Se calcula que miles de barcos cruzan el canal cada año.", "It is estimated that thousands of ships cross the canal every year."], ["Los resultados de las elecciones fueron anunciados a medianoche.", "The election results were announced at midnight."]]),
 "Perífrasis y argumentación": dict(
  x=[["___ de llover hace una hora, pero las calles siguen mojadas.", "Dejó|Acabó|Paró", "Dejar de / parar de / acabar de + infinitive here: it stopped raining an hour ago."],
     ["Llevo tres años ___ (estudiar) español.", "estudiando", "Llevar + time + gerund: an action that continues up to now."],
     ["Hay que ___ (tener) en cuenta todos los datos.", "tener", "Hay que + infinitive: general obligation."],
     ["Volvió a ___ (intentar) y esta vez lo consiguió.", "intentarlo|intentar", "Volver a + infinitive: to do something again."]],
  fix=[["Dejé de fumar hace dos años y sigo sin fumo.", "Dejé de fumar hace dos años y sigo sin fumar.", "Seguir sin + infinitive: to still not do something."],
       ["Tengo de terminar el informe hoy.", "Tengo que terminar el informe hoy.", "Obligation: tener que + infinitive."]],
  e=[["Llevamos meses hablando del problema y todavía no hemos encontrado una solución.", "We've been talking about the problem for months and still haven't found a solution."], ["Sigo pensando que la propuesta es buena, aunque habría que ajustar el presupuesto.", "I still think the proposal is good, although the budget would need adjusting."], ["Acabo de leer el informe y tengo que reconocer que me ha convencido.", "I've just read the report and I have to admit it convinced me."]]),
 "Estilo indirecto en pasado": dict(
  x=[["«Iré mañana.» → Dijo que ___ al día siguiente.", "iría", "Future → conditional when reporting in the past: iría."],
     ["«Estoy cansada.» → Dijo que ___ cansada.", "estaba", "Present → imperfect: estaba."],
     ["«Cierra la puerta.» → Me pidió que ___ la puerta.", "cerrara|cerrase", "Command → que + imperfect subjunctive: cerrara."],
     ["«He terminado.» → Dijo que ___ terminado.", "había", "Pretérito perfecto → pluscuamperfecto: había terminado."]],
  fix=[["Me dijo que vendrá el lunes, pero no vino.", "Me dijo que vendría el lunes, pero no vino.", "Reported in the past: future → conditional (vendría)."],
       ["Me preguntó que si quiero ir con él.", "Me preguntó si quería ir con él.|Me preguntó que si quería ir con él.", "Reported in the past, the tense shifts: quiero → quería. (Me preguntó que si… is common and accepted.)"]],
  e=[["La directora nos dijo que la reunión se había cancelado y que nos avisaría de la nueva fecha.", "The director told us the meeting had been cancelled and that she would let us know the new date."], ["El médico me aconsejó que caminara media hora al día y que dejara el azúcar.", "The doctor advised me to walk half an hour a day and to cut out sugar."], ["Mi vecino me preguntó si sabía quién había aparcado delante de su garaje.", "My neighbour asked me if I knew who had parked in front of his garage."]]),
}
n = 0
for title, x in ADD.items():
    u = next(u for u in L["b2"] if u["t"] == title)
    for k in ("x", "fix", "e"):
        have = {i[0] for i in u.get(k, [])}
        for it in x[k]:
            assert len(it) == (2 if k == "e" else 3), (title, it)
            if it[0] not in have: u.setdefault(k, []).append(it); n += 1
s = s[:m.start(2)] + json.dumps(L, ensure_ascii=False, separators=(",", ":")) + s[m.end(2):]
open(P, "w", encoding="utf-8").write(s)
print("added", n, "items")
