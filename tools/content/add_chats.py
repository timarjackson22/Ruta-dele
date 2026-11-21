"""Read & Listen › Chats & messages, batch v263 (21 Nov 2026): more WhatsApp-style chats, laid out as a phone chat.
Each paragraph is one bubble; its first sentence starts «Name, HH:MM: …» (the layout turns it into the bubble's name and time).
x.group = group name (group chat, «you» = x.me on the right); p.day = a day separator («Ayer», «Hoy», «Lunes»).
All texts are original. Re-runnable (replaces items with the same id).   Usage: python3 tools/content/add_chats.py index.html"""
import json, sys
P = sys.argv[1] if len(sys.argv) > 1 else "index.html"
s = open(P, encoding="utf-8").read()

def b(name, time, *pairs, day=None):
    ss = [[f"{name}, {time}: {pairs[0][0]}", f"{name}, {time}: {pairs[0][1]}"]] + [list(x) for x in pairs[1:]]
    d = {"s": ss}
    if day: d["day"] = day
    return d

def chat(id, lvl, country, t, s_, paras, gl, q, **kw):
    x = {"id": id, "cat": "reading", "kind": "chat", "lay": "chat", "lvl": lvl, "country": country, "t": t, "s": "WhatsApp chat · " + s_, "paras": paras, "gl": gl, "q": q}
    x.update(kw); return x

ITEMS = [
chat("chat-a1-mama", "a1", "Panamá", "¿Pasas por el súper?", "Mum asks her son to buy a few things",
 [b("Mamá", "17:02", ["Hola, mi amor. ¿Ya saliste del trabajo?", "Hi, love. Have you left work yet?"]),
  b("Diego", "17:05", ["Sí, mamá. Estoy en el bus.", "Yes, Mum. I'm on the bus."], ["Llego a casa en media hora.", "I'll be home in half an hour."]),
  b("Mamá", "17:06", ["¿Puedes pasar por el súper?", "Can you stop at the supermarket?"], ["Necesito leche, pan y seis huevos.", "I need milk, bread and six eggs."]),
  b("Diego", "17:07", ["Claro. ¿Algo más?", "Sure. Anything else?"]),
  b("Mamá", "17:08", ["Sí, bananas y un poco de queso blanco. 🧀", "Yes, bananas and a bit of white cheese."], ["Gracias, eres un amor.", "Thanks, you're a sweetheart."]),
  b("Diego", "17:41", ["Ya tengo todo. El queso blanco no hay, compré queso amarillo.", "I've got everything. There's no white cheese, I bought yellow cheese."]),
  b("Mamá", "17:42", ["Perfecto. ¡Te espero para cenar!", "Perfect. I'll wait for you for dinner!"])],
 [["salir del trabajo", "to leave work"], ["pasar por", "to stop at, drop by"], ["el súper", "the supermarket (informal)"], ["necesitar", "to need"], ["¿algo más?", "anything else?"], ["eres un amor", "you're a sweetheart"]],
 [["¿Dónde está Diego al principio?", ["en el trabajo", "en el bus", "en el súper"], 1], ["¿Cuántos huevos necesita su mamá?", ["seis", "doce", "dos"], 0], ["¿Qué no hay en el súper?", ["leche", "queso blanco", "pan"], 1], ["¿Qué compra Diego en lugar de queso blanco?", ["queso amarillo", "más huevos", "nada"], 0], ["¿Para qué espera la mamá a Diego?", ["para ir al súper", "para cenar", "para trabajar"], 1]]),

chat("chat-a1-tacos", "a1", "México", "Pedido a Taquería Don Beto", "Ordering tacos for delivery on WhatsApp",
 [b("Taquería Don Beto", "20:10", ["¡Hola! Bienvenido a Taquería Don Beto. 🌮", "Hi! Welcome to Taquería Don Beto."], ["¿Qué te gustaría pedir hoy?", "What would you like to order today?"]),
  b("Carla", "20:12", ["Hola, buenas noches. Quiero seis tacos al pastor y cuatro de bistec.", "Hi, good evening. I'd like six al pastor tacos and four steak ones."], ["Y dos aguas de horchata, por favor.", "And two horchata drinks, please."]),
  b("Taquería Don Beto", "20:13", ["Perfecto. ¿Con cebolla y cilantro?", "Perfect. With onion and coriander?"]),
  b("Carla", "20:13", ["Sí, con todo. Y la salsa verde aparte, por favor.", "Yes, with everything. And the green sauce on the side, please."]),
  b("Taquería Don Beto", "20:15", ["Son doscientos ochenta pesos con el envío.", "That's two hundred and eighty pesos with delivery."], ["¿Me das tu dirección?", "Can you give me your address?"]),
  b("Carla", "20:16", ["Calle Hidalgo 45, departamento 3, colonia Roma.", "45 Hidalgo Street, apartment 3, Roma neighbourhood."], ["Pago en efectivo.", "I'll pay in cash."]),
  b("Taquería Don Beto", "20:17", ["Listo. Llega en unos treinta y cinco minutos. ¡Gracias!", "Done. It'll arrive in about thirty-five minutes. Thank you!"])],
 [["pedir", "to order"], ["al pastor", "spit-grilled pork (taco style)"], ["el bistec", "steak"], ["aparte", "on the side, separately"], ["el envío", "delivery (charge)"], ["en efectivo", "in cash"]],
 [["¿Cuántos tacos pide Carla en total?", ["seis", "diez", "cuatro"], 1], ["¿Qué bebida pide?", ["agua de horchata", "refresco", "café"], 0], ["¿Cómo quiere la salsa verde?", ["sin salsa", "aparte", "encima de los tacos"], 1], ["¿Cuánto cuesta el pedido con el envío?", ["doscientos ochenta pesos", "treinta y cinco pesos", "cuarenta y cinco pesos"], 0], ["¿Cómo va a pagar Carla?", ["con tarjeta", "en efectivo", "por transferencia"], 1]], me="Carla"),

chat("chat-a2-cumple", "a2", "Colombia", "Sorpresa para Vale", "A group chat planning a surprise birthday",
 [b("Andrés", "19:20", ["¡Hola, gente! El sábado es el cumpleaños de Vale. 🎂", "Hi, everyone! Saturday is Vale's birthday."], ["¿Le hacemos una fiesta sorpresa?", "Shall we throw her a surprise party?"], day="Ayer"),
  b("Laura", "19:22", ["¡Sí! Podemos hacerla en mi apartamento, tengo un balcón grande.", "Yes! We can have it at my apartment, I have a big balcony."]),
  b("Tú", "19:25", ["Me encanta la idea. Yo compro la torta.", "I love the idea. I'll buy the cake."], ["¿De chocolate o de tres leches?", "Chocolate or tres leches?"]),
  b("Andrés", "19:26", ["De tres leches, es su favorita.", "Tres leches, it's her favourite."]),
  b("Mateo", "19:40", ["Yo llevo la música y las bebidas.", "I'll bring the music and the drinks."], ["¿A qué hora llega ella?", "What time does she arrive?"]),
  b("Laura", "09:15", ["Su novio la trae a las ocho, pero ella no sabe nada. 🤫", "Her boyfriend is bringing her at eight, but she doesn't know anything."], ["Nosotros tenemos que estar a las siete.", "We have to be there at seven."], day="Hoy"),
  b("Tú", "09:20", ["Perfecto. Recojo la torta a las seis en la panadería.", "Perfect. I'll pick up the cake at six at the bakery."]),
  b("Mateo", "09:22", ["¡No le digan nada a Vale! 😂", "Don't tell Vale anything!"])],
 [["la fiesta sorpresa", "surprise party"], ["la torta", "cake (Colombia)"], ["el tres leches", "three-milk cake"], ["llevar", "to bring"], ["recoger", "to pick up"], ["no saber nada", "not to know anything"]],
 [["¿Dónde va a ser la fiesta?", ["en casa de Vale", "en el apartamento de Laura", "en una panadería"], 1], ["¿Qué torta van a comprar?", ["de chocolate", "de tres leches", "de fresa"], 1], ["¿Qué lleva Mateo?", ["la torta", "la música y las bebidas", "los globos"], 1], ["¿A qué hora tienen que llegar los amigos?", ["a las seis", "a las siete", "a las ocho"], 1], ["¿Quién trae a Vale a la fiesta?", ["Laura", "su novio", "Andrés"], 1]], group="Sorpresa para Vale 🎉", me="Tú", icon="🎉"),

chat("chat-a2-piso", "a2", "España", "Compañeros de piso", "Flatmates sort out cleaning and shopping",
 [b("Marta", "10:05", ["Chicos, la cocina está fatal otra vez. 😩", "Guys, the kitchen is a mess again."], ["¿Hacemos un turno de limpieza?", "Shall we make a cleaning rota?"]),
  b("Javi", "10:12", ["Vale, perdón, ayer cené tarde y no fregué.", "OK, sorry, I had dinner late yesterday and didn't wash up."], ["Esta semana friego yo todos los días.", "This week I'll do the washing-up every day."]),
  b("Tú", "10:15", ["Yo puedo limpiar el baño el sábado.", "I can clean the bathroom on Saturday."], ["Marta, ¿tú te encargas del salón?", "Marta, will you take care of the living room?"]),
  b("Marta", "10:16", ["Sí. Y hay que comprar papel higiénico y detergente.", "Yes. And we need to buy toilet paper and detergent."]),
  b("Javi", "10:20", ["Voy esta tarde al súper. ¿Pagamos a medias como siempre?", "I'm going to the supermarket this afternoon. Shall we split it as usual?"]),
  b("Tú", "10:21", ["Sí, mándame el tique y te hago un Bizum.", "Yes, send me the receipt and I'll send you a Bizum."]),
  b("Marta", "10:22", ["Genial. ¡Gracias, equipo! 💪", "Great. Thanks, team!"])],
 [["estar fatal", "to be in a terrible state"], ["el turno de limpieza", "cleaning rota"], ["fregar", "to wash up (Spain)"], ["encargarse de", "to take care of"], ["pagar a medias", "to split the cost"], ["el tique", "receipt (Spain)"]],
 [["¿Cuál es el problema?", ["la cocina está sucia", "no hay agua", "el baño está roto"], 0], ["¿Qué va a hacer Javi esta semana?", ["limpiar el baño", "fregar todos los días", "limpiar el salón"], 1], ["¿Qué día limpia el baño el autor de los mensajes?", ["el viernes", "el sábado", "el domingo"], 1], ["¿Qué hay que comprar?", ["papel higiénico y detergente", "comida para la semana", "un sofá"], 0], ["¿Cómo van a pagar?", ["paga Javi todo", "a medias", "paga Marta"], 1]], group="Piso Lavapiés 🏠", me="Tú", icon="🏠"),

chat("chat-a2-cuarto", "a2", "Costa Rica", "Cuarto en alquiler", "Asking a landlord about a room to rent",
 [b("Sofía", "14:30", ["Buenas tardes. Vi su anuncio del cuarto en San Pedro.", "Good afternoon. I saw your ad for the room in San Pedro."], ["¿Todavía está disponible?", "Is it still available?"]),
  b("Don Rafael", "14:45", ["Buenas tardes. Sí, todavía está disponible.", "Good afternoon. Yes, it's still available."], ["Es un cuarto con baño propio, cerca de la universidad.", "It's a room with its own bathroom, near the university."]),
  b("Sofía", "14:47", ["¡Qué bien! ¿Cuánto es el alquiler al mes?", "Great! How much is the rent per month?"], ["¿Incluye el agua y la luz?", "Does it include water and electricity?"]),
  b("Don Rafael", "14:50", ["Son ciento ochenta mil colones al mes, con agua, luz e internet.", "It's one hundred and eighty thousand colones a month, with water, electricity and internet."], ["Se paga un mes de depósito.", "You pay one month's deposit."]),
  b("Sofía", "14:52", ["Perfecto. ¿Puedo ver el cuarto mañana por la tarde?", "Perfect. Can I see the room tomorrow afternoon?"]),
  b("Don Rafael", "14:55", ["Claro, a las cuatro está bien.", "Of course, four o'clock is fine."], ["Le mando la ubicación. 📍", "I'll send you the location."]),
  b("Sofía", "14:56", ["Muchas gracias, don Rafael. ¡Hasta mañana!", "Thank you very much, don Rafael. See you tomorrow!"])],
 [["el anuncio", "advert"], ["disponible", "available"], ["el baño propio", "private bathroom"], ["el alquiler", "rent"], ["la luz", "electricity (bill)"], ["el depósito", "deposit"]],
 [["¿Dónde vio Sofía el cuarto?", ["en un anuncio", "en la universidad", "en la calle"], 0], ["¿Qué tiene el cuarto?", ["baño propio", "cocina propia", "balcón"], 0], ["¿Qué incluye el alquiler?", ["solo el agua", "agua, luz e internet", "nada"], 1], ["¿Cuánto es el depósito?", ["un mes", "dos meses", "no hay depósito"], 0], ["¿Cuándo va a ver Sofía el cuarto?", ["hoy a las cuatro", "mañana a las cuatro", "el sábado"], 1]], me="Sofía"),

chat("chat-a2-vecinos", "a2", "Chile", "Vecinos del edificio", "A building group chat: a water cut and a lost dog",
 [b("Administración", "08:00", ["Buenos días, vecinos. Mañana jueves no habrá agua de nueve a una.", "Good morning, neighbours. Tomorrow, Thursday, there will be no water from nine to one."], ["Están arreglando una cañería en el tercer piso.", "They are fixing a pipe on the third floor."]),
  b("Carmen 4B", "08:12", ["Gracias por avisar. Voy a guardar agua esta noche.", "Thanks for letting us know. I'll store some water tonight."]),
  b("Tú", "08:30", ["Una pregunta: ¿el ascensor también va a estar cerrado?", "A question: will the lift be closed too?"]),
  b("Administración", "08:34", ["No, el ascensor funciona normal.", "No, the lift works as normal."]),
  b("Pedro 2A", "11:47", ["¡Vecinos! Se perdió mi perro Toby. 🐶", "Neighbours! My dog Toby is lost."], ["Es pequeño, café con blanco, y tiene un collar rojo.", "He's small, brown and white, and has a red collar."], ["Salió por la puerta del estacionamiento.", "He went out through the car park door."]),
  b("Carmen 4B", "11:55", ["¡Lo vi hace diez minutos en la plaza, cerca del quiosco!", "I saw him ten minutes ago in the square, near the kiosk!"]),
  b("Pedro 2A", "12:20", ["¡Ya lo encontré! Muchísimas gracias, Carmen. ❤️", "I found him! Thank you so much, Carmen."])],
 [["avisar", "to let know, warn"], ["la cañería", "pipe"], ["el ascensor", "lift, elevator"], ["perderse", "to get lost"], ["el collar", "collar"], ["el estacionamiento", "car park (Chile)"]],
 [["¿Cuándo no va a haber agua?", ["mañana de nueve a una", "hoy por la tarde", "el sábado"], 0], ["¿Por qué no habrá agua?", ["por una cañería en reparación", "porque no pagaron", "por la lluvia"], 0], ["¿Funciona el ascensor?", ["no", "sí, normal", "solo por la mañana"], 1], ["¿Cómo es el perro de Pedro?", ["grande y negro", "pequeño, café con blanco", "blanco con collar azul"], 1], ["¿Dónde vio Carmen al perro?", ["en el estacionamiento", "en la plaza, cerca del quiosco", "en el tercer piso"], 1]], group="Edificio Los Aromos", me="Tú", icon="🏢"),

chat("chat-b1-cine", "b1", "Argentina", "¿Llegás al cine?", "Running late for the cinema in Buenos Aires",
 [b("Nico", "21:02", ["Ya estoy en la puerta del cine. ¿Vos dónde estás?", "I'm already at the cinema door. Where are you?"]),
  b("Flor", "21:04", ["¡Perdón! Se me pasó el colectivo y el siguiente tardó un montón.", "Sorry! I missed the bus and the next one took ages."], ["Llego en unos quince minutos.", "I'll be there in about fifteen minutes."]),
  b("Nico", "21:05", ["La película empieza a las nueve y veinte. Si querés, entro y te guardo el lugar.", "The film starts at twenty past nine. If you want, I'll go in and save you a seat."]),
  b("Flor", "21:06", ["Dale, buenísimo. Comprame pochoclos, que yo te invito la cena después. 🍿", "OK, great. Buy me some popcorn, and I'll treat you to dinner afterwards."]),
  b("Nico", "21:07", ["Trato hecho. Te dejo la entrada en la boletería a tu nombre.", "Deal. I'll leave your ticket at the box office in your name."]),
  b("Flor", "21:19", ["Ya bajé del colectivo, estoy a dos cuadras. 🏃‍♀️", "I've got off the bus, I'm two blocks away."]),
  b("Nico", "21:20", ["Fila ocho, butacas doce y trece. ¡Apurate que ya apagan las luces!", "Row eight, seats twelve and thirteen. Hurry, they're turning the lights off!"])],
 [["el colectivo", "bus (Argentina)"], ["tardar un montón", "to take ages"], ["guardar el lugar", "to save a seat"], ["los pochoclos", "popcorn (Argentina)"], ["la boletería", "box office"], ["la cuadra", "block (street)"]],
 [["¿Por qué llega tarde Flor?", ["se le pasó el colectivo", "se olvidó la entrada", "estaba trabajando"], 0], ["¿A qué hora empieza la película?", ["a las nueve", "a las nueve y veinte", "a las diez"], 1], ["¿Qué le pide Flor a Nico?", ["que compre pochoclos", "que la espere afuera", "que cambie de película"], 0], ["¿Qué va a hacer Flor para agradecerle?", ["pagar las entradas", "invitarle la cena", "comprar bebidas"], 1], ["¿Dónde deja Nico la entrada de Flor?", ["en la boletería", "en la puerta", "en la butaca"], 0]], me="Nico"),

chat("chat-b1-trabajo", "b1", "Panamá", "Equipo de ventas", "A work group: a meeting moved and a sick day",
 [b("Ricardo (jefe)", "07:45", ["Buenos días, equipo. Les aviso que la reunión con el cliente se cambió para las tres de la tarde.", "Good morning, team. Just letting you know the client meeting has been moved to three in the afternoon."], ["Será en la sala grande del piso doce.", "It will be in the big meeting room on the twelfth floor."]),
  b("Gabriela", "07:52", ["Entendido. ¿Llevo la presentación impresa o la mostramos en la pantalla?", "Understood. Shall I bring the presentation printed or shall we show it on the screen?"]),
  b("Ricardo (jefe)", "07:55", ["En la pantalla, pero trae cinco copias del presupuesto, por si acaso.", "On the screen, but bring five copies of the budget, just in case."]),
  b("Tú", "08:10", ["Buenos días. Lamentablemente amanecí con fiebre y no voy a poder ir hoy. 🤒", "Good morning. Unfortunately I woke up with a fever and won't be able to come in today."], ["Voy a ir al médico y les mando el certificado.", "I'm going to the doctor and I'll send you the certificate."]),
  b("Ricardo (jefe)", "08:12", ["Tranquilo, lo importante es que te recuperes.", "Don't worry, the important thing is that you get better."], ["¿Me puedes enviar los números del mes pasado antes de las doce?", "Can you send me last month's figures before twelve?"]),
  b("Tú", "08:13", ["Sí, claro, se los mando por correo en un rato.", "Yes, of course, I'll email them to you shortly."]),
  b("Gabriela", "08:15", ["¡Que te mejores! Yo me encargo de explicar esa parte en la reunión.", "Get well soon! I'll take care of explaining that part in the meeting."])],
 [["la reunión", "meeting"], ["el presupuesto", "budget, quote"], ["por si acaso", "just in case"], ["amanecer con fiebre", "to wake up with a fever"], ["el certificado médico", "doctor's note"], ["¡Que te mejores!", "Get well soon!"]],
 [["¿A qué hora es ahora la reunión?", ["a las ocho", "a las tres de la tarde", "a las doce"], 1], ["¿Cómo van a mostrar la presentación?", ["impresa", "en la pantalla", "por correo"], 1], ["¿Qué tiene que llevar Gabriela?", ["cinco copias del presupuesto", "la pantalla", "el certificado"], 0], ["¿Por qué no va a trabajar la persona que escribe «Tú»?", ["tiene fiebre", "tiene una cita con un cliente", "está de vacaciones"], 0], ["¿Qué le pide el jefe antes de las doce?", ["el certificado", "los números del mes pasado", "la presentación"], 1]], group="Ventas · Oficina Central", me="Tú", icon="💼"),

chat("chat-b1-tour", "b1", "Perú", "Tour a Machu Picchu", "Booking a tour with an agency in Cusco",
 [b("Inka Rutas", "09:00", ["¡Hola! Gracias por escribir a Inka Rutas. ¿En qué te podemos ayudar?", "Hi! Thanks for writing to Inka Rutas. How can we help you?"]),
  b("Tom", "09:03", ["Hola. Quiero reservar el tour de un día a Machu Picchu para dos personas.", "Hi. I'd like to book the one-day tour to Machu Picchu for two people."], ["Sería para el martes 14.", "It would be for Tuesday the 14th."]),
  b("Inka Rutas", "09:06", ["Para el martes nos quedan cuatro cupos.", "For Tuesday we have four places left."], ["El tour incluye tren de ida y vuelta, bus, entrada, guía y almuerzo.", "The tour includes return train, bus, entrance ticket, guide and lunch."], ["El precio es de trescientos veinte dólares por persona.", "The price is three hundred and twenty dollars per person."]),
  b("Tom", "09:10", ["¿A qué hora nos recogen en el hotel?", "What time do you pick us up at the hotel?"]),
  b("Inka Rutas", "09:12", ["A las cuatro y media de la mañana, porque el tren sale a las seis.", "At half past four in the morning, because the train leaves at six."], ["Necesitamos una foto de sus pasaportes para comprar las entradas.", "We need a photo of your passports to buy the entrance tickets."]),
  b("Tom", "09:15", ["Perfecto, ahora se las mando.", "Perfect, I'll send them now."], ["¿Hace falta llevar algo especial?", "Do we need to bring anything special?"]),
  b("Inka Rutas", "09:18", ["Lleven impermeable, protector solar y agua.", "Bring a rain jacket, sunscreen and water."], ["¡Va a ser un día inolvidable! 🏔️", "It's going to be an unforgettable day!"])],
 [["reservar", "to book"], ["el cupo", "place, spot (on a tour)"], ["de ida y vuelta", "return (ticket)"], ["recoger", "to pick up"], ["hace falta", "it's necessary"], ["inolvidable", "unforgettable"]],
 [["¿Para cuántas personas es el tour?", ["una", "dos", "cuatro"], 1], ["¿Qué incluye el tour?", ["solo la entrada", "tren, bus, entrada, guía y almuerzo", "el hotel"], 1], ["¿Cuánto cuesta en total para Tom y su acompañante?", ["trescientos veinte dólares", "seiscientos cuarenta dólares", "ciento sesenta dólares"], 1], ["¿Por qué los recogen tan temprano?", ["porque el tren sale a las seis", "porque hay mucho tráfico", "porque el parque cierra temprano"], 0], ["¿Para qué necesitan los pasaportes?", ["para el hotel", "para comprar las entradas", "para el tren"], 1]], me="Tom"),

chat("chat-b1-clinica", "b1", "México", "Cita en la clínica", "A clinic's reminder and a rescheduled appointment",
 [b("Clínica Santa Fe", "10:00", ["Hola, Ana. Le recordamos su cita con la doctora Ruiz mañana viernes a las 9:30.", "Hi, Ana. We remind you of your appointment with Dr Ruiz tomorrow, Friday, at 9:30."], ["Responda 1 para confirmar o 2 para cambiar la cita.", "Reply 1 to confirm or 2 to change the appointment."], day="Jueves"),
  b("Ana", "10:20", ["2", "2"]),
  b("Clínica Santa Fe", "10:21", ["Claro. Tenemos disponible el lunes a las 8:00 o el martes a las 17:30.", "Of course. We have Monday at 8:00 or Tuesday at 17:30 available."]),
  b("Ana", "10:23", ["El martes a las cinco y media, por favor. Por las mañanas trabajo.", "Tuesday at half past five, please. I work in the mornings."]),
  b("Clínica Santa Fe", "10:24", ["Listo, su cita quedó para el martes 18 a las 17:30.", "Done, your appointment is now Tuesday the 18th at 17:30."], ["Recuerde venir en ayunas, porque le harán un análisis de sangre.", "Remember to come without eating, because you'll have a blood test."]),
  b("Ana", "10:26", ["¿En ayunas también por la tarde? ¿Cuántas horas antes?", "Fasting in the afternoon too? How many hours before?"]),
  b("Clínica Santa Fe", "10:28", ["Sí, ocho horas sin comer. Puede tomar agua.", "Yes, eight hours without eating. You can drink water."], ["Traiga su identificación y su tarjeta del seguro.", "Bring your ID and your insurance card."])],
 [["la cita", "appointment"], ["confirmar", "to confirm"], ["disponible", "available"], ["en ayunas", "fasting, on an empty stomach"], ["el análisis de sangre", "blood test"], ["la tarjeta del seguro", "insurance card"]],
 [["¿Para cuándo era la cita al principio?", ["el viernes a las 9:30", "el lunes a las 8:00", "el martes a las 17:30"], 0], ["¿Qué significa la respuesta «2»?", ["confirmar", "cambiar la cita", "cancelar"], 1], ["¿Por qué elige Ana el martes?", ["porque trabaja por las mañanas", "porque está de viaje", "porque la doctora no puede"], 0], ["¿Qué tiene que hacer antes de la cita?", ["no comer durante ocho horas", "no tomar agua", "hacer ejercicio"], 0], ["¿Qué tiene que llevar?", ["el análisis", "su identificación y la tarjeta del seguro", "dinero en efectivo"], 1]], me="Ana"),

chat("chat-b2-internet", "b2", "España", "Atención al cliente", "Complaining to an internet provider's support chat",
 [b("Movinet", "18:30", ["Hola, soy Lucía, del servicio de atención al cliente. ¿En qué puedo ayudarte?", "Hi, I'm Lucía from customer service. How can I help you?"]),
  b("Pablo", "18:32", ["Hola. Llevo tres días sin internet en casa y nadie me ha dado una solución.", "Hi. I've been without internet at home for three days and nobody has given me a solution."], ["Trabajo desde casa, así que esto me está causando muchos problemas.", "I work from home, so this is causing me a lot of problems."]),
  b("Movinet", "18:34", ["Siento mucho las molestias. ¿Me podrías indicar tu número de cliente?", "I'm very sorry for the inconvenience. Could you give me your customer number?"]),
  b("Pablo", "18:35", ["Es el 48 22 19 07.", "It's 48 22 19 07."]),
  b("Movinet", "18:39", ["Gracias. He comprobado que hay una avería en la fibra de tu calle.", "Thanks. I've checked and there is a fault in the fibre line on your street."], ["Los técnicos ya están trabajando y calculan que quedará resuelta mañana antes de las dos.", "The technicians are already working on it and they expect it to be fixed tomorrow before two."]),
  b("Pablo", "18:41", ["Entiendo, pero estoy pagando por un servicio que no recibo.", "I understand, but I'm paying for a service I'm not receiving."], ["¿Me vais a descontar estos días de la factura?", "Are you going to take these days off my bill?"]),
  b("Movinet", "18:44", ["Por supuesto. Te aplicaremos un descuento proporcional en la próxima factura.", "Of course. We'll apply a proportional discount on your next bill."], ["Además, te enviamos ahora un código para tener datos ilimitados en el móvil hasta que se repare la avería.", "In addition, we're sending you a code now for unlimited mobile data until the fault is repaired."]),
  b("Pablo", "18:46", ["Vale, eso me soluciona el trabajo de mañana. Gracias, Lucía.", "OK, that solves tomorrow's work for me. Thanks, Lucía."])],
 [["llevar tres días sin", "to have been without … for three days"], ["las molestias", "inconvenience"], ["la avería", "fault, breakdown"], ["quedar resuelto", "to be fixed, resolved"], ["descontar", "to deduct, take off"], ["la factura", "bill, invoice"]],
 [["¿Cuánto tiempo lleva Pablo sin internet?", ["un día", "tres días", "una semana"], 1], ["¿Por qué es un problema especialmente grave para él?", ["porque estudia en línea", "porque trabaja desde casa", "porque tiene invitados"], 1], ["¿Cuál es la causa del problema?", ["una avería en la fibra de su calle", "un error en su factura", "su router está roto"], 0], ["¿Qué compensación le ofrecen?", ["un descuento y datos ilimitados en el móvil", "un router nuevo", "un mes gratis"], 0], ["¿Cuándo esperan arreglar la avería?", ["hoy por la noche", "mañana antes de las dos", "la semana que viene"], 1]], me="Pablo"),

chat("chat-a2-boda", "a2", "Puerto Rico", "La boda de Isa", "A family group sorting out a wedding weekend",
 [b("Tía Mari", "16:10", ["Familia, ya llegaron las invitaciones de la boda de Isa. 💍", "Family, the invitations for Isa's wedding have arrived."], ["Es el sábado 6 de diciembre a las cinco, en la playa de Luquillo.", "It's on Saturday 6 December at five, on Luquillo beach."]),
  b("Primo Jorge", "16:15", ["¡Qué emoción! ¿Hay que ir de traje?", "How exciting! Do we have to wear a suit?"]),
  b("Tía Mari", "16:17", ["No, la invitación dice ropa blanca y elegante, pero cómoda. Es en la arena. 😄", "No, the invitation says white, elegant but comfortable clothes. It's on the sand."]),
  b("Tú", "16:20", ["Yo vengo desde Nueva York el jueves.", "I'm coming from New York on Thursday."], ["¿Alguien me puede recoger en el aeropuerto?", "Can someone pick me up at the airport?"]),
  b("Primo Jorge", "16:22", ["Yo te busco. ¿A qué hora aterriza tu vuelo?", "I'll get you. What time does your flight land?"]),
  b("Tú", "16:23", ["A las siete y diez de la noche.", "At ten past seven in the evening."]),
  b("Tía Mari", "16:25", ["Perfecto. Y te quedas en casa conmigo, ya te preparé el cuarto. ❤️", "Perfect. And you'll stay at my house, I've already got the room ready for you."])],
 [["la invitación", "invitation"], ["la boda", "wedding"], ["ir de traje", "to wear a suit"], ["cómodo", "comfortable"], ["buscar (a alguien)", "to pick someone up (PR, Mexico)"], ["aterrizar", "to land"]],
 [["¿Dónde es la boda?", ["en una iglesia", "en la playa de Luquillo", "en Nueva York"], 1], ["¿Qué ropa hay que llevar?", ["un traje oscuro", "ropa blanca, elegante y cómoda", "traje de baño"], 1], ["¿Cuándo llega la persona que escribe «Tú»?", ["el jueves", "el sábado", "el viernes"], 0], ["¿Quién la va a recoger en el aeropuerto?", ["la tía Mari", "el primo Jorge", "Isa"], 1], ["¿Dónde se va a quedar?", ["en un hotel", "en casa de la tía Mari", "en casa de Jorge"], 1]], group="Familia Rivera 🌴", me="Tú", icon="🌴"),
]

i = s.index("const LISTEN = ") + 15; j = s.index("];\n", i)
LI = json.loads(s[i:j + 1])
ids = {x["id"] for x in ITEMS}
LI = [x for x in LI if x["id"] not in ids] + ITEMS
s = s[:i] + json.dumps(LI, ensure_ascii=False, separators=(",", ":")) + s[j + 1:]
open(P, "w", encoding="utf-8").write(s)
print("Chats:", len(ITEMS), "in place;", len(LI), "texts in all")
