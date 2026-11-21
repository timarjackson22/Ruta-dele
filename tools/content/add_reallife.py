"""Read & Listen, batch v262 (21 Nov 2026): real-life texts laid out like the real thing.
Menus and price lists (fonda, beauty salon, barber), announcements (airport, train station, neighbourhood sound car),
weather alerts (flood, hurricane, heat, cold rain, a good weekend), checklists (travel, camping) and shopping lists
(groceries, household restock) with quantities and prices. All texts are original.
Each sentence is [Spanish, English] or [Spanish, English, meta]: meta.p = price, meta.q = quantity, meta.say = what the voice
says (prices and quantities in words), so the list looks like a list but is heard as natural Spanish.
Re-runnable (replaces items with the same id).   Usage: python3 tools/content/add_reallife.py index.html"""
import json, sys
P = sys.argv[1] if len(sys.argv) > 1 else "index.html"
s = open(P, encoding="utf-8").read()

def it(say, es, en, **m):
    d = dict(m); d["say"] = say
    return [es, en, d]

ITEMS = [
# ---------------------------------------------------------------- menus & price lists
{"id": "vida-menu-fonda", "cat": "reading", "kind": "menu", "lay": "menu", "theme": "food", "cur": "$", "lvl": "a1", "country": "Panamá",
 "t": "Fonda Doña Chela", "s": "Menu · Lunch prices at a fonda in Panama City",
 "note": "A fonda is a small, family-run restaurant with home cooking. In Panama prices are in dollars (balboas).",
 "paras": [
  {"s": [["Fonda Doña Chela", "Doña Chela's Fonda"], ["Comida casera en El Cangrejo · Abierto de lunes a sábado, de siete a tres.", "Home cooking in El Cangrejo · Open Monday to Saturday, seven to three."]]},
  {"h": "Desayunos", "hEn": "Breakfasts", "s": [
    it("Hojaldra con huevo frito: dos dólares con cincuenta.", "Hojaldra con huevo frito", "Fried dough with a fried egg", p=2.5),
    it("Tortilla de maíz con queso blanco: dos dólares.", "Tortilla de maíz con queso blanco", "Corn tortilla with white cheese", p=2),
    it("Café con leche: un dólar.", "Café con leche", "Coffee with milk", p=1)]},
  {"h": "Almuerzos", "hEn": "Lunches · with rice, beans and salad", "s": [
    it("Pollo guisado: cinco dólares.", "Pollo guisado", "Stewed chicken", p=5),
    it("Carne en salsa: cinco dólares con cincuenta.", "Carne en salsa", "Beef in sauce", p=5.5),
    it("Pescado frito con patacones: siete dólares.", "Pescado frito con patacones", "Fried fish with fried plantain", p=7),
    it("Sancocho de gallina, solo los viernes: cuatro dólares con cincuenta.", "Sancocho de gallina (solo los viernes)", "Hen soup (Fridays only)", p=4.5)]},
  {"h": "Bebidas", "hEn": "Drinks", "s": [
    it("Chicha de piña: un dólar con veinticinco.", "Chicha de piña", "Pineapple juice drink", p=1.25),
    it("Agua de pipa: un dólar con cincuenta.", "Agua de pipa", "Coconut water", p=1.5),
    it("Soda: un dólar.", "Soda", "Soft drink", p=1)]},
  {"h": "Postres", "hEn": "Desserts", "s": [
    it("Arroz con leche: un dólar con cincuenta.", "Arroz con leche", "Rice pudding", p=1.5),
    it("Flan de coco: dos dólares.", "Flan de coco", "Coconut flan", p=2)]},
  {"s": [["Aceptamos efectivo y Yappy.", "We accept cash and Yappy."]]}],
 "gl": [["guisado", "stewed"], ["el pescado frito", "fried fish"], ["los patacones", "fried green plantain slices"], ["la chicha", "fresh fruit drink"], ["el agua de pipa", "coconut water"], ["el efectivo", "cash"]],
 "q": [["¿Cuánto cuesta el pollo guisado?", ["cinco dólares", "siete dólares", "dos dólares"], 0],
       ["¿Qué día hay sancocho?", ["el lunes", "el viernes", "el sábado"], 1],
       ["¿Qué lleva el almuerzo además del plato?", ["sopa y postre", "arroz, frijoles y ensalada", "un café"], 1],
       ["¿Cuál es la bebida más cara?", ["el agua de pipa", "la soda", "el café con leche"], 0],
       ["¿Cuándo cierra la fonda?", ["los sábados", "los domingos", "los viernes"], 1]]},

{"id": "vida-menu-salon", "cat": "reading", "kind": "menu", "lay": "menu", "theme": "salon", "lvl": "a2", "country": "México",
 "t": "Estética Bella Luna", "s": "Price list · A beauty salon in Guadalajara",
 "note": "In Mexico a beauty salon is often called «estética». Prices are in Mexican pesos.",
 "paras": [
  {"s": [["Estética Bella Luna", "Bella Luna Beauty Salon"], ["Lista de precios · Cita por WhatsApp o sin cita de martes a domingo.", "Price list · Book on WhatsApp or walk in, Tuesday to Sunday."]]},
  {"h": "Cabello", "hEn": "Hair", "s": [
    it("Corte de dama: doscientos cincuenta pesos.", "Corte de dama", "Women's haircut", p="$250"),
    it("Corte de niño o niña: ciento cincuenta pesos.", "Corte de niño o niña", "Children's haircut", p="$150"),
    it("Lavado y secado: ciento ochenta pesos.", "Lavado y secado", "Wash and blow-dry", p="$180"),
    it("Tinte completo: desde seiscientos pesos.", "Tinte completo", "Full colour", p="desde $600"),
    it("Mechas o rayitos: desde ochocientos cincuenta pesos.", "Mechas o rayitos", "Highlights", p="desde $850"),
    it("Peinado para fiesta: cuatrocientos pesos.", "Peinado para fiesta", "Party hairstyle", p="$400")]},
  {"h": "Uñas", "hEn": "Nails", "s": [
    it("Manicure: doscientos pesos.", "Manicure", "Manicure", p="$200"),
    it("Pedicure: doscientos cincuenta pesos.", "Pedicure", "Pedicure", p="$250"),
    it("Uñas de gel: trescientos cincuenta pesos.", "Uñas de gel", "Gel nails", p="$350")]},
  {"h": "Cejas y pestañas", "hEn": "Brows and lashes", "s": [
    it("Diseño de cejas: ciento veinte pesos.", "Diseño de cejas", "Eyebrow shaping", p="$120"),
    it("Rizado de pestañas: trescientos pesos.", "Rizado de pestañas", "Lash lift", p="$300")]},
  {"s": [["Los martes, diez por ciento de descuento en tintes.", "On Tuesdays, ten percent off colour."], ["Si llegas tarde más de quince minutos, tenemos que cambiar tu cita.", "If you are more than fifteen minutes late, we have to move your appointment."]]}],
 "gl": [["el corte", "haircut"], ["el tinte", "hair colour, dye"], ["las mechas / los rayitos", "highlights"], ["el peinado", "hairstyle"], ["las cejas", "eyebrows"], ["las pestañas", "eyelashes"], ["la cita", "appointment"]],
 "q": [["¿Cuánto cuesta un corte para una niña?", ["ciento cincuenta pesos", "doscientos cincuenta pesos", "ciento veinte pesos"], 0],
       ["¿Qué servicio tiene descuento los martes?", ["las uñas", "los tintes", "los peinados"], 1],
       ["¿Qué pasa si llegas veinte minutos tarde?", ["pagas más", "cambian tu cita", "no pasa nada"], 1],
       ["¿Qué día está cerrada la estética?", ["el lunes", "el martes", "el domingo"], 0],
       ["¿Por qué el tinte dice «desde»?", ["porque el precio puede ser más alto", "porque es gratis", "porque es solo para niños"], 0]]},

{"id": "vida-menu-barber", "cat": "reading", "kind": "menu", "lay": "menu", "theme": "barber", "lvl": "a1", "country": "Colombia",
 "t": "Barbería El Bigote", "s": "Price list · A barbershop in Medellín",
 "note": "Colombian prices use a point for thousands: $25.000 is twenty-five thousand pesos.",
 "paras": [
  {"s": [["Barbería El Bigote", "El Bigote Barbershop"], ["Desde 1985 · Laureles, Medellín.", "Since 1985 · Laureles, Medellín."]]},
  {"h": "Servicios", "hEn": "Services", "s": [
    it("Corte clásico: veinticinco mil pesos.", "Corte clásico", "Classic cut", p="$25.000"),
    it("Corte degradado: treinta mil pesos.", "Corte degradado", "Fade", p="$30.000"),
    it("Arreglo de barba: quince mil pesos.", "Arreglo de barba", "Beard trim", p="$15.000"),
    it("Afeitado con navaja y toalla caliente: veinte mil pesos.", "Afeitado con navaja y toalla caliente", "Razor shave with a hot towel", p="$20.000"),
    it("Corte y barba: cuarenta mil pesos.", "Corte y barba", "Cut and beard", p="$40.000"),
    it("Corte para niños, hasta doce años: dieciocho mil pesos.", "Corte para niños (hasta 12 años)", "Kids' cut (up to 12)", p="$18.000")]},
  {"s": [["No necesitas cita: llega y espera tu turno.", "You don't need an appointment: come in and wait your turn."], ["El café es gratis.", "The coffee is free."]]}],
 "gl": [["la barbería", "barbershop"], ["el degradado", "fade (haircut)"], ["la barba", "beard"], ["el afeitado", "shave"], ["la navaja", "razor"], ["el turno", "turn (in a queue)"]],
 "q": [["¿Cuánto cuesta arreglar la barba?", ["quince mil pesos", "veinte mil pesos", "cuarenta mil pesos"], 0],
       ["¿Qué servicio cuesta cuarenta mil pesos?", ["el afeitado", "el corte y la barba", "el corte clásico"], 1],
       ["¿Necesitas cita?", ["sí, siempre", "no, esperas tu turno", "solo los sábados"], 1],
       ["¿Qué es gratis?", ["el café", "el corte para niños", "la toalla"], 0],
       ["¿Desde cuándo existe la barbería?", ["desde 1985", "desde 2015", "desde 1958"], 0]]},

# ---------------------------------------------------------------- announcements
{"id": "vida-anun-aeropuerto", "cat": "reading", "kind": "announce", "lay": "announce", "place": "airport", "lvl": "a2", "country": "Panamá",
 "t": "Última llamada en Tocumen", "s": "Airport announcement · Boarding and a gate change",
 "where": "Aeropuerto de Tocumen · Terminal 1", "whereEn": "Public address · Gate area",
 "board": [["Hora", "Destino", "Puerta", "Estado"], ["14:05", "Bogotá", "B12", "Última llamada"], ["14:30", "San José", "C3", "Cambio de puerta"], ["15:10", "Lima", "B8", "Retrasado"]],
 "paras": [
  {"s": [["Buenas tardes, señoras y señores.", "Good afternoon, ladies and gentlemen."], ["Esta es la última llamada para los pasajeros del vuelo 214 con destino a Bogotá.", "This is the final call for passengers on flight 214 to Bogotá."], ["Por favor, preséntense de inmediato en la puerta B12.", "Please go to gate B12 immediately."], ["La puerta se cierra en diez minutos.", "The gate closes in ten minutes."]]},
  {"s": [["Información para los pasajeros del vuelo 368 a San José.", "Information for passengers on flight 368 to San José."], ["Su vuelo ahora sale de la puerta C3, no de la puerta B5.", "Your flight now leaves from gate C3, not gate B5."], ["Les recordamos que el embarque empieza treinta minutos antes de la salida.", "We remind you that boarding starts thirty minutes before departure."]]},
  {"s": [["El vuelo 102 a Lima tiene un retraso de cuarenta minutos.", "Flight 102 to Lima is delayed by forty minutes."], ["Por razones de seguridad, no dejen su equipaje sin vigilancia.", "For security reasons, do not leave your luggage unattended."], ["Gracias por volar con nosotros.", "Thank you for flying with us."]]}],
 "gl": [["la última llamada", "final call"], ["el vuelo", "flight"], ["la puerta (de embarque)", "gate"], ["el embarque", "boarding"], ["el retraso", "delay"], ["el equipaje", "luggage"]],
 "q": [["¿A qué puerta tienen que ir los pasajeros a Bogotá?", ["B12", "C3", "B5"], 0],
       ["¿Qué cambia para el vuelo a San José?", ["la hora", "la puerta", "el destino"], 1],
       ["¿Cuándo empieza el embarque?", ["treinta minutos antes de la salida", "diez minutos antes", "una hora antes"], 0],
       ["¿Qué pasa con el vuelo a Lima?", ["está cancelado", "sale cuarenta minutos tarde", "sale antes"], 1],
       ["¿Qué no deben hacer los pasajeros?", ["comer en la puerta", "dejar su equipaje solo", "hablar por teléfono"], 1]]},

{"id": "vida-anun-tren", "cat": "reading", "kind": "announce", "lay": "announce", "place": "train", "lvl": "b1", "country": "España",
 "t": "Retraso en Atocha", "s": "Station announcement · A delayed high-speed train",
 "where": "Estación de Madrid-Puerta de Atocha", "whereEn": "Station public address",
 "board": [["Hora", "Destino", "Vía", "Estado"], ["10:30", "Sevilla", "12", "Retraso 25 min"], ["10:45", "Valencia", "8", "Vía cambiada"], ["11:00", "Málaga", "—", "Cancelado"]],
 "paras": [
  {"s": [["Atención, por favor.", "Your attention, please."], ["El tren de alta velocidad con destino Sevilla, con salida prevista a las diez y media, circula con un retraso aproximado de veinticinco minutos.", "The high-speed train to Seville, scheduled to depart at half past ten, is running approximately twenty-five minutes late."], ["Disculpen las molestias.", "We apologise for the inconvenience."]]},
  {"s": [["Se informa a los viajeros con destino Valencia de que su tren efectuará la salida por la vía ocho, en lugar de la vía cinco.", "Passengers travelling to Valencia are informed that their train will depart from platform eight instead of platform five."]]},
  {"s": [["Por una avería en la línea, el tren de las once con destino Málaga ha sido cancelado.", "Due to a fault on the line, the eleven o'clock train to Málaga has been cancelled."], ["Los viajeros afectados pueden cambiar su billete sin coste en las taquillas o en la aplicación.", "Affected passengers can change their ticket free of charge at the ticket offices or in the app."], ["También pueden solicitar la devolución del importe completo.", "They can also request a full refund."]]},
  {"s": [["Les recordamos que deben tener su billete y su documento de identidad preparados en el control de acceso.", "Please remember to have your ticket and ID ready at the access control."]]}],
 "gl": [["circular con retraso", "to run late"], ["la vía", "platform, track"], ["la avería", "breakdown, fault"], ["el billete", "ticket (Spain)"], ["la taquilla", "ticket office"], ["la devolución", "refund"]],
 "q": [["¿Cuántos minutos de retraso tiene el tren a Sevilla?", ["unos veinticinco", "unos cinco", "unos cuarenta"], 0],
       ["¿De qué vía sale ahora el tren a Valencia?", ["de la vía cinco", "de la vía ocho", "de la vía doce"], 1],
       ["¿Por qué se cancela el tren a Málaga?", ["por el mal tiempo", "por una avería en la línea", "porque no hay viajeros"], 1],
       ["¿Qué pueden hacer los viajeros a Málaga?", ["cambiar el billete o pedir el dinero", "esperar el tren de mañana sin billete", "viajar en el tren de Sevilla"], 0],
       ["¿Qué hay que mostrar en el control de acceso?", ["el billete y el documento de identidad", "solo la maleta", "el pasaporte y una foto"], 0]]},

{"id": "vida-anun-perifoneo", "cat": "reading", "kind": "announce", "lay": "announce", "place": "car", "lvl": "a2", "country": "Panamá",
 "t": "El carro parlante del barrio", "s": "Street announcement · A loudspeaker car in the neighbourhood",
 "where": "Carro parlante · Barrio de San Miguelito", "whereEn": "Loudspeaker car going down the street",
 "note": "In many Latin American neighbourhoods, cars or trucks with loudspeakers sell fruit and gas or announce community events (perifoneo).",
 "paras": [
  {"s": [["¡Atención, vecinos!", "Attention, neighbours!"], ["Llegó el carro de las frutas y las verduras frescas.", "The fresh fruit and vegetable truck is here."], ["Tenemos piña dulce a un dólar, tres aguacates por dos dólares y el plátano maduro a veinticinco centavos.", "We have sweet pineapple for a dollar, three avocados for two dollars and ripe plantain for twenty-five cents."], ["Salga, salga, que estamos en la esquina de la tienda.", "Come out, come out, we're on the corner by the shop."]]},
  {"s": [["Y un aviso importante de la junta comunal.", "And an important notice from the community council."], ["Este sábado hay jornada de vacunación gratis en la escuela del barrio, de ocho a doce.", "This Saturday there is a free vaccination day at the neighbourhood school, from eight to twelve."], ["Traigan su cédula y la tarjeta de vacunas de los niños.", "Bring your ID card and the children's vaccination card."]]},
  {"s": [["También les recordamos que el martes no pasa el camión de la basura por el día feriado.", "We also remind you that on Tuesday the rubbish truck won't come because of the public holiday."], ["Saquen la basura el miércoles.", "Put the rubbish out on Wednesday."], ["¡Gracias y feliz día, vecinos!", "Thank you and have a nice day, neighbours!"]]}],
 "gl": [["el carro parlante", "loudspeaker car"], ["el vecino / la vecina", "neighbour"], ["la esquina", "corner"], ["la jornada de vacunación", "vaccination day"], ["la cédula", "national ID card"], ["el día feriado", "public holiday"]],
 "q": [["¿Cuánto cuestan tres aguacates?", ["un dólar", "dos dólares", "veinticinco centavos"], 1],
       ["¿Dónde está el carro de las frutas?", ["en la escuela", "en la esquina de la tienda", "en la junta comunal"], 1],
       ["¿Qué hay el sábado en la escuela?", ["una fiesta", "vacunas gratis", "un mercado"], 1],
       ["¿Qué tienen que llevar a la vacunación?", ["la cédula y la tarjeta de vacunas", "dinero y una foto", "la basura"], 0],
       ["¿Por qué no pasa el camión de la basura el martes?", ["porque está roto", "porque es feriado", "porque llueve"], 1]]},

# ---------------------------------------------------------------- weather alerts
{"id": "vida-clima-inundacion", "cat": "reading", "kind": "weather", "lay": "weather", "alert": "red", "icon": "🌊", "lvl": "b1", "country": "Panamá",
 "t": "Alerta roja por inundaciones", "s": "Weather alert · Flooding in Panama City",
 "alertName": "Alerta roja · Inundaciones", "issuer": "Protección civil · válida hasta el jueves a las 6:00",
 "stats": [["120 mm", "lluvia en 24 h"], ["3", "ríos desbordados"], ["2", "albergues abiertos"]],
 "paras": [
  {"s": [["Se declara alerta roja en los distritos de Panamá y San Miguelito por fuertes lluvias.", "A red alert is declared in the districts of Panama and San Miguelito because of heavy rain."], ["En las últimas veinticuatro horas han caído más de ciento veinte milímetros de agua y tres ríos se han desbordado.", "In the last twenty-four hours more than one hundred and twenty millimetres of rain have fallen and three rivers have overflowed."]]},
  {"h": "Qué hacer", "s": [["No cruce calles ni ríos con agua: treinta centímetros de corriente pueden arrastrar un carro.", "Don't cross flooded streets or rivers: thirty centimetres of moving water can sweep a car away."], ["Desconecte los aparatos eléctricos si el agua entra en su casa.", "Unplug electrical appliances if water gets into your home."], ["Tenga a mano agua potable, linternas, medicinas y sus documentos en una bolsa plástica.", "Keep drinking water, torches, medicine and your documents in a plastic bag close at hand."]]},
  {"h": "Ayuda", "s": [["Hay dos albergues abiertos: el gimnasio de Pedregal y la escuela de Cerro Viento.", "Two shelters are open: the Pedregal gym and the Cerro Viento school."], ["Si necesita ayuda, llame al 911.", "If you need help, call 911."], ["Las clases de mañana están suspendidas.", "Tomorrow's classes are suspended."]]}],
 "gl": [["la inundación", "flood"], ["desbordarse", "to overflow (a river)"], ["la corriente", "current, moving water"], ["arrastrar", "to drag, sweep away"], ["el albergue", "shelter"], ["suspender", "to suspend, cancel"]],
 "q": [["¿Por qué hay alerta roja?", ["por un huracán", "por fuertes lluvias", "por mucho calor"], 1],
       ["¿Qué no se debe hacer?", ["cruzar calles con agua", "llamar al 911", "guardar los documentos"], 0],
       ["¿Dónde se deben guardar los documentos?", ["en el carro", "en una bolsa plástica", "en la escuela"], 1],
       ["¿Qué pasa con las clases de mañana?", ["empiezan tarde", "no hay clases", "son en el albergue"], 1],
       ["¿Hasta cuándo es válida la alerta?", ["hasta el jueves a las seis", "hasta el domingo", "hasta esta noche"], 0]]},

{"id": "vida-clima-huracan", "cat": "reading", "kind": "weather", "lay": "weather", "alert": "red", "icon": "🌀", "lvl": "b2", "country": "Puerto Rico",
 "t": "Aviso de huracán", "s": "Weather alert · A hurricane approaching Puerto Rico",
 "alertName": "Aviso de huracán · Categoría 2", "issuer": "Servicio Nacional de Meteorología · San Juan",
 "stats": [["165 km/h", "vientos máximos"], ["36 h", "llegada prevista"], ["250 mm", "lluvia posible"]],
 "paras": [
  {"s": [["El huracán Iris, de categoría dos, se encuentra a unos trescientos kilómetros al sureste de la isla y avanza hacia el noroeste a veinte kilómetros por hora.", "Hurricane Iris, a category two storm, is about three hundred kilometres southeast of the island and moving northwest at twenty kilometres an hour."], ["Se espera que sus efectos empiecen a sentirse en un plazo de treinta y seis horas.", "Its effects are expected to be felt within thirty-six hours."]]},
  {"s": [["Un aviso de huracán significa que se esperan condiciones de huracán en la zona; no debe confundirse con una vigilancia, que indica que son posibles.", "A hurricane warning means hurricane conditions are expected in the area; it should not be confused with a watch, which means they are possible."]]},
  {"h": "Recomendaciones", "s": [["Asegure ventanas y puertas y retire de patios y balcones cualquier objeto que el viento pueda lanzar.", "Secure windows and doors and remove from patios and balconies anything the wind could throw."], ["Prepare agua para al menos siete días, alimentos que no necesiten nevera y un radio de baterías.", "Prepare water for at least seven days, food that doesn't need a fridge and a battery radio."], ["Si vive en una zona inundable o en una casa de madera, acuda a un refugio antes de que lleguen los vientos fuertes.", "If you live in an area that floods or in a wooden house, go to a shelter before the strong winds arrive."]]},
  {"s": [["Cuando pase el ojo del huracán, no salga: tras la calma vuelven los vientos, ahora desde la dirección contraria.", "When the eye of the hurricane passes, do not go out: after the calm the winds return, now from the opposite direction."]]}],
 "gl": [["el aviso", "warning"], ["la vigilancia", "watch (weather)"], ["asegurar", "to secure"], ["la zona inundable", "flood-prone area"], ["el refugio", "shelter"], ["el ojo del huracán", "eye of the hurricane"]],
 "q": [["¿Qué diferencia hay entre un aviso y una vigilancia?", ["el aviso dice que las condiciones se esperan; la vigilancia, que son posibles", "son lo mismo", "la vigilancia es más grave"], 0],
       ["¿Cuándo empezarán a sentirse los efectos?", ["en unas treinta y seis horas", "esta noche", "en una semana"], 0],
       ["¿Cuánta agua hay que preparar?", ["para tres días", "para siete días como mínimo", "para un mes"], 1],
       ["¿Quién debe ir a un refugio antes?", ["quien vive en una zona inundable o en una casa de madera", "todos los turistas", "solo los niños"], 0],
       ["¿Por qué no hay que salir cuando pasa el ojo?", ["porque llueve más", "porque los vientos vuelven desde el otro lado", "porque no hay luz"], 1]]},

{"id": "vida-clima-calor", "cat": "reading", "kind": "weather", "lay": "weather", "alert": "orange", "icon": "🌡", "lvl": "b1", "country": "España",
 "t": "Ola de calor en Sevilla", "s": "Weather alert · A heatwave in Andalusia",
 "alertName": "Aviso naranja · Temperaturas máximas", "issuer": "Agencia Estatal de Meteorología · de martes a viernes",
 "stats": [["44 °C", "máxima"], ["27 °C", "mínima de noche"], ["10", "UV extremo"]],
 "paras": [
  {"s": [["Se activa el aviso naranja en la campiña sevillana por temperaturas de hasta cuarenta y cuatro grados.", "An orange warning is activated in the Seville countryside for temperatures of up to forty-four degrees."], ["Por la noche no bajarán de veintisiete grados, lo que se conoce como noches tropicales.", "At night they will not drop below twenty-seven degrees, what are known as tropical nights."]]},
  {"h": "Consejos", "s": [["Beba agua aunque no tenga sed y evite el alcohol y las bebidas con mucho azúcar.", "Drink water even if you're not thirsty and avoid alcohol and very sugary drinks."], ["No haga deporte al aire libre entre las doce y las siete de la tarde.", "Don't exercise outdoors between twelve and seven in the evening."], ["Cierre persianas y ventanas durante el día y ábralas por la noche para que entre aire fresco.", "Close blinds and windows during the day and open them at night to let fresh air in."], ["Nunca deje a niños ni animales dentro de un coche aparcado.", "Never leave children or animals inside a parked car."]]},
  {"s": [["Llame a sus vecinos mayores que viven solos: el calor es más peligroso para ellos.", "Call your elderly neighbours who live alone: the heat is more dangerous for them."], ["Las bibliotecas municipales abren hasta las diez como refugios climáticos.", "Municipal libraries open until ten as cooling centres."]]}],
 "gl": [["la ola de calor", "heatwave"], ["la noche tropical", "night above 20 °C"], ["la persiana", "blind, shutter"], ["al aire libre", "outdoors"], ["aparcado", "parked (Spain)"], ["el refugio climático", "cooling centre"]],
 "q": [["¿Cuál será la temperatura máxima?", ["veintisiete grados", "cuarenta y cuatro grados", "diez grados"], 1],
       ["¿Qué es una «noche tropical» en el texto?", ["una noche en la que la temperatura no baja mucho", "una fiesta en la playa", "una noche con lluvia"], 0],
       ["¿Cuándo no se recomienda hacer deporte fuera?", ["por la mañana temprano", "entre las doce y las siete", "por la noche"], 1],
       ["¿Qué hay que hacer con las persianas durante el día?", ["abrirlas", "cerrarlas", "quitarlas"], 1],
       ["¿Para qué abren las bibliotecas hasta tarde?", ["para estudiar para los exámenes", "para que la gente se refresque", "para un concierto"], 1]]},

{"id": "vida-clima-frio", "cat": "reading", "kind": "weather", "lay": "weather", "alert": "yellow", "icon": "🌧", "lvl": "a2", "country": "Colombia",
 "t": "Lluvia y frío en Bogotá", "s": "Weather alert · A cold, rainy week",
 "alertName": "Aviso amarillo · Lluvias y frío", "issuer": "IDEAM · esta semana",
 "stats": [["7 °C", "mínima"], ["16 °C", "máxima"], ["80 %", "probabilidad de lluvia"]],
 "paras": [
  {"s": [["Esta semana va a llover casi todas las tardes en Bogotá.", "This week it is going to rain almost every afternoon in Bogotá."], ["Las mañanas van a ser frías, con siete grados, y en la tarde la temperatura máxima va a ser de dieciséis grados.", "The mornings will be cold, seven degrees, and in the afternoon the high will be sixteen degrees."], ["Puede caer granizo en el norte de la ciudad.", "There may be hail in the north of the city."]]},
  {"h": "Recomendaciones", "s": [["Lleve paraguas y una chaqueta impermeable.", "Take an umbrella and a waterproof jacket."], ["Salga con tiempo: con lluvia hay más tráfico.", "Leave early: there is more traffic when it rains."], ["Maneje despacio y encienda las luces del carro.", "Drive slowly and turn on the car's lights."]]},
  {"s": [["El fin de semana el cielo va a estar parcialmente nublado y sin lluvia.", "At the weekend the sky will be partly cloudy with no rain."]]}],
 "gl": [["llover", "to rain"], ["el granizo", "hail"], ["el paraguas", "umbrella"], ["impermeable", "waterproof"], ["nublado", "cloudy"], ["salir con tiempo", "to leave early, allow time"]],
 "q": [["¿Cuándo va a llover?", ["casi todas las tardes", "solo el fin de semana", "por la noche"], 0],
       ["¿Cuál es la temperatura por la mañana?", ["dieciséis grados", "siete grados", "ochenta grados"], 1],
       ["¿Dónde puede caer granizo?", ["en el sur", "en el norte de la ciudad", "en el centro"], 1],
       ["¿Por qué hay que salir con tiempo?", ["porque hay más tráfico", "porque cierran las tiendas", "porque hace calor"], 0],
       ["¿Cómo va a estar el fin de semana?", ["con mucha lluvia", "parcialmente nublado y sin lluvia", "con mucho sol y calor"], 1]]},

{"id": "vida-clima-finde", "cat": "reading", "kind": "weather", "lay": "weather", "alert": "green", "icon": "☀", "lvl": "a2", "country": "México",
 "t": "Un fin de semana de sol", "s": "Weather forecast · A sunny weekend in Mexico City",
 "alertName": "Buen tiempo · Fin de semana", "issuer": "Pronóstico del tiempo · Ciudad de México",
 "stats": [["26 °C", "sábado"], ["24 °C", "domingo"], ["20 %", "lluvia el domingo"]],
 "paras": [
  {"s": [["¡Buenas noticias para el fin de semana!", "Good news for the weekend!"], ["El sábado va a hacer sol todo el día, con una máxima de veintiséis grados.", "On Saturday it will be sunny all day, with a high of twenty-six degrees."], ["Es un día perfecto para ir a Chapultepec o a Xochimilco.", "It's a perfect day to go to Chapultepec or Xochimilco."]]},
  {"s": [["El domingo va a estar un poco más fresco, con veinticuatro grados.", "On Sunday it will be a bit cooler, with twenty-four degrees."], ["Por la tarde puede haber algunas nubes, pero la probabilidad de lluvia es solo del veinte por ciento.", "In the afternoon there may be some clouds, but the chance of rain is only twenty percent."]]},
  {"h": "No olvides", "s": [["Usa protector solar y gorra: el sol es fuerte en la altura.", "Wear sunscreen and a cap: the sun is strong at altitude."], ["Lleva un suéter para la noche, porque baja a diez grados.", "Take a sweater for the evening, because it drops to ten degrees."]]}],
 "gl": [["hacer sol", "to be sunny"], ["fresco", "cool"], ["la nube", "cloud"], ["la probabilidad", "chance, probability"], ["el protector solar", "sunscreen"], ["la gorra", "cap"]],
 "q": [["¿Qué día hace más calor?", ["el sábado", "el domingo", "los dos igual"], 0],
       ["¿Qué recomiendan hacer el sábado?", ["quedarse en casa", "ir a Chapultepec o Xochimilco", "ir al cine"], 1],
       ["¿Va a llover mucho el domingo?", ["sí, todo el día", "no, es poco probable", "sí, por la mañana"], 1],
       ["¿Por qué hay que usar protector solar?", ["porque el sol es fuerte en la altura", "porque hace frío", "porque llueve"], 0],
       ["¿Para qué es el suéter?", ["para la playa", "para la noche", "para el mediodía"], 1]]},

# ---------------------------------------------------------------- checklists
{"id": "vida-lista-viaje", "cat": "reading", "kind": "list", "lay": "check", "lvl": "a2", "country": "Panamá",
 "t": "Lista para el viaje", "s": "Checklist · Packing for a week in Costa Rica",
 "note": "Tap the boxes to tick items off; your ticks are saved.",
 "paras": [
  {"h": "Documentos", "hEn": "Documents", "s": [["el pasaporte", "passport"], ["los boletos de avión impresos", "printed plane tickets"], ["el seguro de viaje", "travel insurance"], ["la reserva del hotel", "hotel booking"], ["un poco de dinero en efectivo", "a little cash"]]},
  {"h": "Ropa", "hEn": "Clothes", "s": [it("cinco camisetas", "camisetas", "T-shirts", q="×5"), it("dos pantalones", "pantalones", "trousers", q="×2"), ["el traje de baño", "swimsuit"], ["una chaqueta para la lluvia", "a rain jacket"], ["las sandalias y los tenis", "sandals and trainers"]]},
  {"h": "Aseo", "hEn": "Toiletries", "s": [["el cepillo y la pasta de dientes", "toothbrush and toothpaste"], ["el protector solar", "sunscreen"], ["el repelente de mosquitos", "mosquito repellent"], ["las medicinas", "medicine"]]},
  {"h": "Electrónica", "hEn": "Electronics", "s": [["el cargador del teléfono", "phone charger"], ["los audífonos", "headphones"], ["una batería externa", "a power bank"]]},
  {"h": "Antes de salir", "hEn": "Before leaving", "s": [["cerrar las ventanas", "close the windows"], ["desconectar los aparatos", "unplug the appliances"], ["dar la llave a la vecina para regar las plantas", "give the key to the neighbour to water the plants"]]}],
 "gl": [["el boleto", "ticket (Latin America)"], ["el seguro de viaje", "travel insurance"], ["el traje de baño", "swimsuit"], ["el repelente", "repellent"], ["el cargador", "charger"], ["regar", "to water (plants)"]],
 "q": [["¿Cuántas camisetas hay en la lista?", ["dos", "cinco", "siete"], 1],
       ["¿Qué hay en la sección de documentos?", ["el cargador", "el pasaporte", "las sandalias"], 1],
       ["¿Para qué es la chaqueta?", ["para la lluvia", "para la nieve", "para la fiesta"], 0],
       ["¿Por qué le dan la llave a la vecina?", ["para regar las plantas", "para cerrar las ventanas", "para limpiar"], 0],
       ["¿Qué se necesita contra los mosquitos?", ["el protector solar", "el repelente", "las medicinas"], 1]]},

{"id": "vida-lista-camping", "cat": "reading", "kind": "list", "lay": "check", "lvl": "b1", "country": "Chile",
 "t": "Camping en Torres del Paine", "s": "Checklist · Three nights of camping in Patagonia",
 "note": "Patagonian weather changes fast: wind, rain and sun can come on the same day.",
 "paras": [
  {"h": "Para dormir", "hEn": "Sleeping", "s": [["la carpa con estacas de repuesto", "the tent with spare pegs"], ["el saco de dormir para cero grados", "a sleeping bag rated to zero degrees"], ["el aislante", "the sleeping mat"], ["la linterna frontal con pilas nuevas", "a head torch with new batteries"]]},
  {"h": "Para cocinar", "hEn": "Cooking", "s": [["el hornillo y dos cartuchos de gas", "the camping stove and two gas canisters"], ["una olla, un cuchillo y cubiertos", "a pot, a knife and cutlery"], it("comida para tres días y una cena de reserva", "comida para tres días", "food for three days", q="+1 cena"), ["el filtro de agua", "the water filter"], ["bolsas para llevarse la basura", "bags to take your rubbish away"]]},
  {"h": "Ropa", "hEn": "Clothing", "s": [["ropa térmica", "thermal layers"], ["el polar", "the fleece"], ["la chaqueta cortavientos e impermeable", "the windproof, waterproof jacket"], ["el gorro, los guantes y calcetines de lana", "hat, gloves and wool socks"], ["las botas de montaña ya usadas, no nuevas", "hiking boots that are broken in, not new"]]},
  {"h": "Seguridad", "hEn": "Safety", "s": [["el botiquín", "the first-aid kit"], ["el mapa y la brújula, porque no hay señal", "map and compass, because there is no signal"], ["avisar a alguien de la ruta y de la fecha de regreso", "tell someone your route and return date"], ["la reserva de los campamentos", "the campsite bookings"]]},
  {"h": "Regla de oro", "hEn": "Golden rule", "s": [["No hacer fuego fuera de las zonas permitidas: en el parque está prohibido.", "No fires outside the permitted areas: in the park it is forbidden."]]}],
 "gl": [["la carpa", "tent (Latin America)"], ["el saco de dormir", "sleeping bag"], ["el hornillo", "camping stove"], ["el botiquín", "first-aid kit"], ["la brújula", "compass"], ["el cortavientos", "windbreaker"]],
 "q": [["¿Por qué hay que llevar mapa y brújula?", ["porque no hay señal", "porque es obligatorio en Chile", "para hacer fuego"], 0],
       ["¿Cuánta comida hay que llevar?", ["para tres días y una cena más", "para una semana", "solo para un día"], 0],
       ["¿Cómo deben ser las botas?", ["nuevas", "ya usadas", "de lluvia"], 1],
       ["¿Qué hay que hacer con la basura?", ["dejarla en el parque", "llevársela", "quemarla"], 1],
       ["¿A quién hay que avisar?", ["a la policía", "a alguien, con la ruta y la fecha de regreso", "a nadie"], 1]]},

# ---------------------------------------------------------------- shopping lists
{"id": "vida-compras-super", "cat": "reading", "kind": "list", "lay": "shop", "cur": "$", "lvl": "a1", "country": "Panamá",
 "t": "La lista del súper", "s": "Shopping list · Groceries for the week", "shop": "Supermercado · semana del 23 de noviembre",
 "paras": [
  {"h": "Frutas y verduras", "hEn": "Fruit and vegetables", "s": [
    it("Una piña: un dólar con cincuenta.", "piña", "pineapple", q="1", p=1.5),
    it("Seis guineos: un dólar con veinte.", "guineos", "bananas", q="6", p=1.2),
    it("Dos libras de tomates: dos dólares.", "tomates", "tomatoes", q="2 lb", p=2),
    it("Tres cebollas: noventa centavos.", "cebollas", "onions", q="3", p=0.9),
    it("Dos aguacates: dos dólares.", "aguacates", "avocados", q="2", p=2)]},
  {"h": "Despensa", "hEn": "Pantry", "s": [
    it("Cinco libras de arroz: tres dólares con setenta y cinco.", "arroz", "rice", q="5 lb", p=3.75),
    it("Una libra de frijoles: un dólar con diez.", "frijoles", "beans", q="1 lb", p=1.1),
    it("Una botella de aceite: tres dólares con cuarenta.", "aceite", "cooking oil", q="1", p=3.4),
    it("Un paquete de café: cuatro dólares con cincuenta.", "café", "coffee", q="1", p=4.5),
    it("Un kilo de azúcar: un dólar con quince.", "azúcar", "sugar", q="1 kg", p=1.15)]},
  {"h": "Lácteos y huevos", "hEn": "Dairy and eggs", "s": [
    it("Dos litros de leche: dos dólares con ochenta.", "leche", "milk", q="2 l", p=2.8),
    it("Una docena de huevos: dos dólares con setenta y cinco.", "huevos", "eggs", q="12", p=2.75),
    it("Media libra de queso blanco: dos dólares con veinticinco.", "queso blanco", "white cheese", q="½ lb", p=2.25)]},
  {"h": "Carne y pescado", "hEn": "Meat and fish", "s": [
    it("Un pollo entero: seis dólares con cincuenta.", "pollo entero", "whole chicken", q="1", p=6.5),
    it("Una libra de corvina: cinco dólares con noventa.", "corvina", "sea bass", q="1 lb", p=5.9)]}],
 "gl": [["la libra", "pound (weight)"], ["los guineos", "bananas (Panama)"], ["la despensa", "pantry"], ["el aceite", "cooking oil"], ["la docena", "dozen"], ["la corvina", "sea bass"]],
 "q": [["¿Cuántos huevos hay en la lista?", ["seis", "doce", "dos"], 1],
       ["¿Cuánto cuesta el arroz?", ["tres dólares con setenta y cinco", "un dólar con diez", "cuatro dólares con cincuenta"], 0],
       ["¿Qué es lo más caro de la lista?", ["el pollo entero", "el café", "la corvina"], 0],
       ["¿Cuántas libras de tomates compran?", ["una", "dos", "cinco"], 1],
       ["¿En qué sección está el queso?", ["despensa", "lácteos y huevos", "frutas y verduras"], 1]]},

{"id": "vida-compras-casa", "cat": "reading", "kind": "list", "lay": "shop", "cur": "€", "lvl": "a2", "country": "España",
 "t": "Reponer la casa", "s": "Shopping list · Household items to restock", "shop": "Droguería y supermercado · para todo el mes",
 "paras": [
  {"h": "Limpieza", "hEn": "Cleaning", "s": [
    it("Detergente para la lavadora, una botella de tres litros: ocho euros con noventa.", "detergente para la lavadora", "washing-machine detergent", q="3 l", p=8.9),
    it("Lavavajillas, dos botes: tres euros con veinte.", "lavavajillas", "washing-up liquid", q="2", p=3.2),
    it("Lejía, un litro: un euro con diez.", "lejía", "bleach", q="1 l", p=1.1),
    it("Bolsas de basura, un rollo de veinticinco: dos euros con cincuenta.", "bolsas de basura", "bin bags", q="25", p=2.5),
    it("Estropajos, un paquete de tres: un euro con cuarenta.", "estropajos", "scouring pads", q="3", p=1.4)]},
  {"h": "Baño", "hEn": "Bathroom", "s": [
    it("Papel higiénico, doce rollos: cinco euros con sesenta.", "papel higiénico", "toilet paper", q="12", p=5.6),
    it("Champú, un bote: tres euros con cuarenta y cinco.", "champú", "shampoo", q="1", p=3.45),
    it("Gel de ducha, dos botes: cuatro euros con ochenta.", "gel de ducha", "shower gel", q="2", p=4.8),
    it("Pasta de dientes, dos tubos: tres euros.", "pasta de dientes", "toothpaste", q="2", p=3)]},
  {"h": "Cocina", "hEn": "Kitchen", "s": [
    it("Papel de cocina, cuatro rollos: dos euros con noventa.", "papel de cocina", "kitchen roll", q="4", p=2.9),
    it("Papel de aluminio: un euro con setenta y cinco.", "papel de aluminio", "tin foil", q="1", p=1.75),
    it("Bombillas LED, dos: seis euros con cincuenta.", "bombillas LED", "LED light bulbs", q="2", p=6.5),
    it("Pilas, un paquete de cuatro: tres euros con noventa y nueve.", "pilas", "batteries", q="4", p=3.99)]}],
 "gl": [["reponer", "to restock"], ["la lejía", "bleach (Spain)"], ["el lavavajillas", "washing-up liquid; dishwasher"], ["el estropajo", "scouring pad"], ["el bote", "bottle, tub"], ["la bombilla", "light bulb (Spain)"]],
 "q": [["¿Cuántos rollos de papel higiénico compran?", ["cuatro", "doce", "veinticinco"], 1],
       ["¿Qué cuesta ocho euros con noventa?", ["el detergente", "el champú", "las pilas"], 0],
       ["¿En qué sección están las bombillas?", ["limpieza", "baño", "cocina"], 2],
       ["¿Para qué es la lejía?", ["para limpiar", "para cocinar", "para la ducha"], 0],
       ["¿Para cuánto tiempo es la compra?", ["para una semana", "para todo el mes", "para un día"], 1]]},
]

i = s.index("const LISTEN = ") + 15; j = s.index("];\n", i)
LI = json.loads(s[i:j + 1])
ids = {x["id"] for x in ITEMS}
LI = [x for x in LI if x["id"] not in ids] + ITEMS
s = s[:i] + json.dumps(LI, ensure_ascii=False, separators=(",", ":")) + s[j + 1:]
open(P, "w", encoding="utf-8").write(s)
print("Read & Listen real-life texts:", len(ITEMS), "items in place;", len(LI), "texts in all")
