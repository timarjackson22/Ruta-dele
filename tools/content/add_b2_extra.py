"""B2 top-up (17 Nov 2026), from the coverage dashboard's "Practice drops from B1 to B2: Oral expression / Vocabulary"
findings: two B2 speaking tasks (DELE B2 oral task types: give and justify an opinion on a proposal; describe a
situation in a photo and speculate) and two B2 vocabulary themes (housing and the city; official procedures).
Re-runnable: entries already present are skipped.   Usage: python3 tools/content/add_b2_extra.py index.html"""
import json, re, sys
P = sys.argv[1] if len(sys.argv) > 1 else "index.html"
s = open(P, encoding="utf-8").read()

def patch(name, fn):
    global s
    m = re.search(r"(const " + name + r" = )(\{.*?\});\n", s)
    D = json.loads(m.group(2)); k = fn(D)
    s = s[:m.start(2)] + json.dumps(D, ensure_ascii=False, separators=(",", ":")) + s[m.end(2):]
    return k

SPEAK = [
 {"id": "sp-b2-07", "lvl": "b2", "task": "Valorar propuestas (Tarea 1)", "prompt": ["El ayuntamiento quiere cerrar al tráfico el centro histórico los fines de semana. Valora tres propuestas: prohibir los carros, poner más autobuses gratuitos o crear aparcamientos fuera del centro. Di cuál te parece mejor y por qué.", "The city council wants to close the historic centre to traffic at weekends. Assess three proposals: banning cars, adding free buses, or building car parks outside the centre. Say which seems best and why."],
  "points": [["valorar cada propuesta", ["me parece", "por un lado", "por otro lado", "el problema es que"]], ["elegir y justificar", ["lo mejor sería", "en mi opinión", "porque", "ya que"]], ["matizar", ["aunque", "siempre que", "sin embargo", "no creo que"]]], "minWords": 120,
  "model": "Me parece una idea interesante, pero cada propuesta tiene ventajas e inconvenientes. Prohibir los carros sería lo más eficaz para reducir el ruido y la contaminación; sin embargo, no creo que los comerciantes estén de acuerdo, porque temen perder clientes. Poner más autobuses gratuitos es una buena solución, siempre que pasen con frecuencia, ya que si hay que esperar media hora, la gente seguirá usando el carro. Crear aparcamientos fuera del centro me parece útil, aunque es caro. En mi opinión, lo mejor sería combinar la segunda y la tercera: aparcamientos en las afueras conectados con autobuses gratuitos. Así nadie se quedaría sin poder llegar al centro."},
 {"id": "sp-b2-08", "lvl": "b2", "task": "Describir una situación y hacer hipótesis (Tarea 2)", "prompt": ["Imagina una foto: en un aeropuerto, una familia con mucho equipaje habla con una empleada en el mostrador; el niño llora y el padre mira el reloj. Describe la escena, imagina qué ha pasado y cómo crees que va a terminar.", "Imagine a photo: at an airport, a family with lots of luggage talks to an employee at the desk; the child is crying and the father checks his watch. Describe the scene, imagine what has happened and how you think it will end."],
  "points": [["describir", ["en la foto se ve", "parece que", "al fondo", "están"]], ["hacer hipótesis", ["quizás", "puede que", "seguramente", "habrán perdido", "estarán"]], ["imaginar el final", ["creo que", "al final", "lo más probable es que", "ojalá"]]], "minWords": 120,
  "model": "En la foto se ve a una familia en el mostrador de una aerolínea. Llevan muchas maletas, así que seguramente se van de vacaciones largas. Parece que tienen un problema: puede que hayan perdido el vuelo o que la reserva no aparezca, porque el padre mira el reloj con cara de preocupación y el niño llora, quizás porque está cansado. La empleada parece tranquila; estará buscando una solución en el ordenador. Lo más probable es que les ofrezca un vuelo más tarde. Creo que al final podrán viajar, aunque tendrán que esperar unas horas en el aeropuerto. Ojalá les den un vale para comer algo mientras tanto."},
 {"id": "sp-c1-05", "lvl": "c1", "task": "Exponer y defender una postura (Tarea 1, monólogo)", "prompt": ["Lee la situación: una empresa quiere implantar la semana laboral de cuatro días. Expón durante tres o cuatro minutos las ventajas y los riesgos, y defiende la opción que te parezca más razonable.", "A company wants to introduce a four-day working week. Speak for three or four minutes on the advantages and risks, and defend the option you find most reasonable."],
  "points": [["presentar el tema", ["cabe señalar", "en primer lugar", "se plantea"]], ["ventajas y riesgos", ["a favor", "en cambio", "no obstante", "conviene tener en cuenta"]], ["defender una postura", ["a mi juicio", "por consiguiente", "de ahí que", "en definitiva"]]], "minWords": 150,
  "model": "La semana laboral de cuatro días se plantea cada vez más como respuesta al agotamiento de los trabajadores. En primer lugar, cabe señalar sus ventajas: los estudios piloto indican que la productividad se mantiene e incluso mejora, y que disminuyen las bajas por estrés. Además, las empresas que la aplican atraen talento con más facilidad. No obstante, conviene tener en cuenta los riesgos. En sectores como la sanidad o la atención al cliente no es fácil reducir los días sin contratar a más personal, de ahí que el coste pueda dispararse. También existe el peligro de que se concentren las mismas horas en menos días y aumente la presión. A mi juicio, la opción más razonable es introducirla de forma gradual, con un periodo de prueba de seis meses y objetivos medibles. En definitiva, no se trata de trabajar menos por trabajar menos, sino de trabajar mejor."},
]
THEMES = [
 {"t": "Vivienda, barrio y urbanismo", "en": "Housing, neighbourhood and urban planning", "w": [["el alquiler", "rent"], ["el inquilino", "tenant"], ["el propietario", "owner, landlord"], ["la fianza", "deposit"], ["la hipoteca", "mortgage"], ["la comunidad de vecinos", "residents' association"], ["los gastos de comunidad", "service charges"], ["la reforma", "renovation"], ["el desahucio", "eviction"], ["la vivienda social", "social housing"], ["las afueras", "outskirts"], ["el casco antiguo", "old town"], ["la gentrificación", "gentrification"], ["el carril bici", "bike lane"], ["la zona peatonal", "pedestrian area"], ["el atasco", "traffic jam"], ["mudarse", "to move house"], ["empadronarse", "to register as a resident"], ["habitable", "fit to live in"], ["céntrico", "central"]]},
 {"t": "Trámites, administración y servicios", "en": "Official procedures and services", "w": [["el trámite", "procedure, formality"], ["la solicitud", "application"], ["el formulario", "form"], ["el plazo", "deadline, period"], ["la cita previa", "appointment"], ["la ventanilla", "service window, counter"], ["el certificado", "certificate"], ["el documento de identidad", "identity document"], ["la renovación", "renewal"], ["la tasa", "fee"], ["el recibo", "receipt, bill"], ["la reclamación", "formal complaint"], ["el justificante", "proof, receipt"], ["la firma", "signature"], ["presentar", "to submit"], ["tramitar", "to process"], ["caducar", "to expire"], ["adjuntar", "to attach"], ["rellenar", "to fill in"], ["vigente", "valid, in force"]]},
]
def add_speak(V):
    have = {x["id"] for x in V["speaking"]}; n = 0
    for x in SPEAK:
        if x["id"] not in have: V["speaking"].append(x); n += 1
    return n
def add_themes(V):
    have = {x["t"] for x in V["b2"]}; n = 0
    for x in THEMES:
        if x["t"] not in have: V["b2"].append(x); n += 1
    return n
a = patch("VOICE", add_speak); b = patch("VOCAB", add_themes)
open(P, "w", encoding="utf-8").write(s)
print("added", a, "speaking tasks,", b, "themes")
