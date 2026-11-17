# Sentence patterns 201–250: directions and transport, phone and messages, problems and apologies,
# conversation reactions and fillers, work and study, weather, permission, health, talking about others.
P = [
("direcciones", "a1", "¿Cómo llego a + place?", "How do I get to …?", "Also: ¿cómo se va a…?", [
 ("pres", "¿Cómo llego al aeropuerto?", "How do I get to the airport?"),
 ("pres", "¿Cómo se va al centro?", "How do you get to the centre?"),
 ("pret", "¿Cómo llegaste hasta aquí?", "How did you get here?"),
 ("fut", "¿Cómo vas a llegar?", "How are you going to get there?")]),
("direcciones", "a1", "Siga / Gire a la + direction", "Go / Turn …", "Commands with usted: siga recto, gire a la derecha, cruce la calle.", [
 ("imp", "Siga derecho y gire a la izquierda.", "Go straight on and turn left."),
 ("imp", "Sigue derecho dos cuadras.", "Go straight for two blocks."),
 ("imp", "Cruce la calle y está a la derecha.", "Cross the street and it's on the right."),
 ("pret", "Giré donde me dijiste.", "I turned where you told me.")]),
("direcciones", "a1", "Voy en + transport", "I go by …", "En bus, en metro, en taxi, en carro; but a pie (on foot).", [
 ("pres", "Voy al trabajo en metro.", "I go to work by metro."),
 ("pret", "Fuimos a pie.", "We went on foot."),
 ("impf", "Antes iba en bicicleta.", "I used to go by bike."),
 ("fut", "Vamos a ir en taxi.", "We're going to go by taxi.")]),
("direcciones", "a2", "Tarda + time + en llegar", "It takes … to get there", "¿Cuánto tarda el bus? = How long does the bus take?", [
 ("pres", "El bus tarda veinte minutos en llegar.", "The bus takes twenty minutes to get there."),
 ("pret", "El vuelo tardó más de lo normal.", "The flight took longer than usual."),
 ("fut", "¿Cuánto va a tardar?", "How long is it going to take?"),
 ("pres", "Se tarda una hora en carro.", "It takes an hour by car.")]),
("direcciones", "a2", "Me perdí / Estoy perdido", "I got lost / I'm lost", "Perderse = to get lost.", [
 ("pres", "Perdón, estoy perdido. ¿Me ayuda?", "Excuse me, I'm lost. Can you help me?"),
 ("pret", "Me perdí en el casco viejo.", "I got lost in the old town."),
 ("perf", "Creo que nos hemos perdido.", "I think we've got lost."),
 ("fut", "No te vas a perder, es fácil.", "You won't get lost, it's easy.")]),
("direcciones", "a2", "Me bajo en + stop", "I get off at …", "Subirse (get on), bajarse (get off), hacer trasbordo (change).", [
 ("pres", "Me bajo en la próxima parada.", "I get off at the next stop."),
 ("pret", "Nos bajamos en la estación equivocada.", "We got off at the wrong station."),
 ("imp", "Bájate en la tercera parada.", "Get off at the third stop."),
 ("pres", "¿Este bus va al centro?", "Does this bus go to the centre?")]),
("telefono", "a1", "¿Aló? / ¿Bueno? / ¿Diga?", "Hello? (on the phone)", "Aló in much of Latin America, bueno in Mexico, diga or dígame in Spain.", [
 ("pres", "¿Aló? ¿Con quién hablo?", "Hello? Who am I speaking to?"),
 ("pres", "¿Está María, por favor?", "Is María there, please?"),
 ("pres", "¿De parte de quién?", "Who's calling?"),
 ("pres", "Un momento, ya te la paso.", "One moment, I'll put her on.")]),
("telefono", "a1", "Te llamo + time", "I'll call you …", "The present for immediate promises: te llamo luego.", [
 ("pres", "Te llamo más tarde.", "I'll call you later."),
 ("pret", "Te llamé, pero no contestaste.", "I called you, but you didn't answer."),
 ("fut", "Te voy a llamar mañana.", "I'm going to call you tomorrow."),
 ("imp", "Llámame cuando puedas.", "Call me when you can.")]),
("telefono", "a2", "Te mando / Te escribo + noun", "I'll send / write you …", "Mandar un mensaje, escribir por WhatsApp.", [
 ("pres", "Te mando la dirección por WhatsApp.", "I'll send you the address on WhatsApp."),
 ("pret", "Te escribí anoche.", "I wrote to you last night."),
 ("perf", "¿Has visto mi mensaje?", "Have you seen my message?"),
 ("imp", "Escríbeme cuando llegues.", "Text me when you get there.")]),
("telefono", "a2", "¿Le puedo dejar un recado?", "Can I leave a message?", "Recado = message (spoken); mensaje = text message.", [
 ("pres", "¿Le puedo dejar un recado?", "Can I leave him a message?"),
 ("pres", "¿Quiere dejarle un mensaje?", "Would you like to leave her a message?"),
 ("subj", "Dígale que me llame, por favor.", "Tell him to call me, please."),
 ("pret", "Te dejé un mensaje de voz.", "I left you a voice message.")]),
("telefono", "a2", "Se cortó / No se oye bien", "It got cut off / I can't hear well", "Phone problems.", [
 ("pret", "Perdón, se cortó la llamada.", "Sorry, the call got cut off."),
 ("pres", "No te oigo bien, hay mucho ruido.", "I can't hear you well, it's very noisy."),
 ("pres", "Me estoy quedando sin batería.", "I'm running out of battery."),
 ("pres", "Se me va la señal.", "I'm losing signal.")]),
("problemas", "a2", "Se me rompió / cayó / perdió + noun", "My … broke / I dropped / lost …", "Accidental se: the thing is the subject.", [
 ("pret", "Se me cayó el teléfono.", "I dropped my phone."),
 ("pret", "Se me rompieron los lentes.", "My glasses broke."),
 ("pret", "Se me perdió la billetera.", "I lost my wallet."),
 ("perf", "Se nos ha acabado la leche.", "We've run out of milk.")]),
("problemas", "a1", "No funciona + noun", "The … doesn't work", "Funcionar for machines; servir for usefulness.", [
 ("pres", "El aire acondicionado no funciona.", "The air conditioning doesn't work."),
 ("impf", "El ascensor no funcionaba.", "The lift wasn't working."),
 ("pret", "Ayer dejó de funcionar.", "It stopped working yesterday."),
 ("pres", "Esto no sirve para nada.", "This is no use at all.")]),
("problemas", "a1", "Perdón por + noun / infinitive", "Sorry for …", "Disculpa / disculpe por + infinitive also works.", [
 ("pres", "Perdón por llegar tarde.", "Sorry for being late."),
 ("pres", "Disculpe la molestia.", "Sorry to bother you."),
 ("perf", "Perdón por no haberte llamado.", "Sorry for not having called you."),
 ("pret", "Perdón, no fue mi intención.", "Sorry, it wasn't my intention.")]),
("problemas", "a1", "No pasa nada / No te preocupes", "It's OK / Don't worry", "Answers to an apology.", [
 ("pres", "No pasa nada, tranquilo.", "It's OK, don't worry."),
 ("pres", "No te preocupes, no es grave.", "Don't worry, it's not serious."),
 ("pret", "No pasó nada grave.", "Nothing serious happened."),
 ("fut", "Todo va a salir bien.", "Everything's going to be fine.")]),
("problemas", "a2", "Tengo un problema con + noun", "I have a problem with …", "Also: hay un problema con…", [
 ("pres", "Tengo un problema con mi reserva.", "I have a problem with my booking."),
 ("pret", "Tuvimos un problema con el vuelo.", "We had a problem with the flight."),
 ("perf", "Ha habido un error en la factura.", "There's been a mistake on the bill."),
 ("cond", "¿Me podría ayudar a solucionarlo?", "Could you help me sort it out?")]),
("problemas", "a2", "Quería quejarme de + noun", "I'd like to complain about …", "Formal complaint: quiero poner una reclamación.", [
 ("impf", "Quería quejarme del ruido.", "I'd like to complain about the noise."),
 ("pres", "Quiero poner una reclamación.", "I want to make a formal complaint."),
 ("pret", "Me cobraron dos veces.", "They charged me twice."),
 ("subj", "Exijo que me devuelvan el dinero.", "I demand that you give me my money back.")]),
("problemas", "b1", "No es culpa mía / Fue culpa de + person", "It's not my fault / It was …'s fault", "Tener la culpa = to be to blame.", [
 ("pres", "No es culpa mía.", "It's not my fault."),
 ("pret", "Fue culpa del conductor.", "It was the driver's fault."),
 ("pres", "Nadie tiene la culpa.", "Nobody's to blame."),
 ("impf", "Yo no sabía nada.", "I didn't know anything.")]),
("conversacion", "a1", "¿En serio?", "Really? / Seriously?", "Also: ¿de verdad?, ¡no me digas!", [
 ("pres", "¿En serio? No lo sabía.", "Really? I didn't know."),
 ("pres", "¡No me digas! ¿Y qué pasó?", "No way! And what happened?"),
 ("pres", "¿De verdad te vas?", "Are you really leaving?"),
 ("pret", "¿En serio dijo eso?", "Did he really say that?")]),
("conversacion", "a1", "A ver, + sentence", "Let's see, …", "A filler to think or to look at something.", [
 ("pres", "A ver, ¿qué tenemos aquí?", "Let's see, what have we got here?"),
 ("pres", "A ver si nos vemos pronto.", "Let's try to meet up soon."),
 ("fut", "Vamos a ver qué dice.", "Let's see what he says."),
 ("imp", "Déjame ver.", "Let me see.")]),
("conversacion", "a2", "O sea, + sentence", "I mean / So …", "To clarify or rephrase.", [
 ("pres", "O sea, que no vienes.", "So, you're not coming."),
 ("pres", "Es caro, o sea, carísimo.", "It's expensive, I mean really expensive."),
 ("pret", "O sea, que lo sabías.", "So you knew."),
 ("pres", "Es decir, tenemos que empezar de nuevo.", "In other words, we have to start again.")]),
("conversacion", "a1", "¡Claro! / ¡Por supuesto!", "Of course!", "Also: ¡cómo no!, ¡dale! (Latin America), ¡vale! (Spain).", [
 ("pres", "¿Me ayudas? —¡Claro!", "Will you help me? —Of course!"),
 ("pres", "¡Por supuesto que puedes venir!", "Of course you can come!"),
 ("pres", "¿Vamos? —¡Dale!", "Shall we go? —Sure!"),
 ("pres", "¡Cómo no!", "Of course! / Certainly!")]),
("conversacion", "a2", "Bueno, + sentence", "Well, …", "Bueno and pues to start or soften an answer.", [
 ("pres", "Bueno, me tengo que ir.", "Well, I have to go."),
 ("pres", "Pues no sé qué decirte.", "Well, I don't know what to tell you."),
 ("pret", "Bueno, al final no fui.", "Well, in the end I didn't go."),
 ("pres", "Bueno, ¿y tú qué opinas?", "Well, and what do you think?")]),
("conversacion", "a2", "¿Me explico? / ¿Sabes?", "Do you see what I mean? / You know?", "Checking you've been understood.", [
 ("pres", "Necesito tiempo, ¿me explico?", "I need time, do you see what I mean?"),
 ("pres", "Es complicado, ¿sabes?", "It's complicated, you know?"),
 ("pres", "¿Me entiendes?", "Do you understand me?"),
 ("pret", "¿Me expliqué bien?", "Did I explain myself clearly?")]),
("conversacion", "a1", "No entiendo. ¿Puede repetir?", "I don't understand. Can you repeat?", "Also: ¿cómo?, ¿perdón?, más despacio, por favor.", [
 ("pres", "Perdón, no entiendo. ¿Puede repetir?", "Sorry, I don't understand. Can you repeat?"),
 ("pret", "No entendí lo que dijiste.", "I didn't understand what you said."),
 ("cond", "¿Podría hablar más despacio?", "Could you speak more slowly?"),
 ("pres", "¿Qué quiere decir eso?", "What does that mean?")]),
("conversacion", "a2", "Por cierto, + sentence", "By the way, …", "To change the subject.", [
 ("pres", "Por cierto, ¿cómo está tu madre?", "By the way, how's your mother?"),
 ("pret", "Por cierto, ayer vi a Pedro.", "By the way, I saw Pedro yesterday."),
 ("fut", "Por cierto, mañana no voy a estar.", "By the way, I won't be here tomorrow."),
 ("pres", "Cambiando de tema, ¿qué tal el trabajo?", "Changing the subject, how's work?")]),
("conversacion", "a2", "Me han dicho que + indicative", "I've been told that …", "Also: dicen que, he oído que.", [
 ("perf", "Me han dicho que el restaurante es muy bueno.", "I've been told the restaurant is very good."),
 ("pres", "Dicen que va a llover toda la semana.", "They say it's going to rain all week."),
 ("perf", "He oído que te casas.", "I've heard you're getting married."),
 ("pret", "Me dijeron que estabas enfermo.", "They told me you were ill.")]),
("conversacion", "b1", "Me dijo que + reported speech", "He told me that …", "Reported speech shifts tense: «Voy» → dijo que iba.", [
 ("impf", "Me dijo que estaba cansado.", "He told me he was tired."),
 ("cond", "Me dijo que vendría más tarde.", "She told me she'd come later."),
 ("pqp", "Me dijo que ya había comido.", "He told me he had already eaten."),
 ("impsub", "Me dijo que la esperara.", "She told me to wait for her.")]),
("conversacion", "a2", "¡Qué bueno que + subjunctive!", "It's great that …!", "Very common in Latin America: ¡qué bueno que viniste!", [
 ("subj", "¡Qué bueno que estés aquí!", "It's so good you're here!"),
 ("pret", "¡Qué bueno que viniste!", "So glad you came!"),
 ("subj", "¡Qué lástima que no puedas venir!", "What a pity you can't come!"),
 ("subj", "¡Qué raro que no conteste!", "How strange that he isn't answering!")]),
("trabajo", "a1", "Trabajo en + place / company", "I work at / in …", "Trabajar en (place), trabajar de / como (job).", [
 ("pres", "Trabajo en un banco.", "I work at a bank."),
 ("impf", "Antes trabajaba en un hotel.", "I used to work in a hotel."),
 ("perf", "He trabajado aquí tres años.", "I've worked here for three years."),
 ("fut", "El mes que viene empiezo en otra empresa.", "Next month I start at another company.")]),
("trabajo", "a2", "Estoy buscando trabajo de + job", "I'm looking for work as …", "Buscar trabajo; solicitar un puesto (apply for a position).", [
 ("pres", "Estoy buscando trabajo de diseñadora.", "I'm looking for work as a designer."),
 ("pret", "Solicité el puesto la semana pasada.", "I applied for the position last week."),
 ("perf", "Me han llamado para una entrevista.", "They've called me for an interview."),
 ("cond", "Me encantaría trabajar en esta empresa.", "I'd love to work for this company.")]),
("trabajo", "a1", "Estudio + subject / en + place", "I study …", "Estudiar una carrera = to do a degree.", [
 ("pres", "Estudio Ingeniería en la universidad.", "I study Engineering at university."),
 ("pret", "Estudié en un colegio bilingüe.", "I studied at a bilingual school."),
 ("pres", "Estoy estudiando para el examen.", "I'm studying for the exam."),
 ("fut", "Voy a estudiar una maestría.", "I'm going to do a master's.")]),
("trabajo", "a2", "Tengo una reunión con + person", "I have a meeting with …", "Reunión (meeting), cita (appointment).", [
 ("pres", "Tengo una reunión con el cliente a las tres.", "I have a meeting with the client at three."),
 ("pret", "La reunión duró dos horas.", "The meeting lasted two hours."),
 ("fut", "Vamos a tener una reunión el lunes.", "We're going to have a meeting on Monday."),
 ("perf", "Han cancelado la reunión.", "They've cancelled the meeting.")]),
("trabajo", "a2", "Estoy encargado de + noun", "I'm in charge of …", "Ser responsable de / encargarse de.", [
 ("pres", "Estoy encargada de las ventas.", "I'm in charge of sales."),
 ("pres", "Yo me encargo de las bebidas.", "I'll take care of the drinks."),
 ("impf", "Él se encargaba de todo.", "He used to take care of everything."),
 ("fut", "¿Quién se va a encargar del proyecto?", "Who's going to be in charge of the project?")]),
("trabajo", "b1", "Le escribo para + infinitive", "I'm writing to …", "The formal opening of an email or letter.", [
 ("pres", "Le escribo para solicitar información.", "I'm writing to request information."),
 ("pres", "Me pongo en contacto con usted para pedir una cita.", "I'm getting in touch with you to ask for an appointment."),
 ("pres", "Quedo a la espera de su respuesta.", "I look forward to your reply."),
 ("cond", "Le agradecería que me respondiera pronto.", "I'd be grateful if you replied soon.")]),
("clima", "a1", "Hace + calor / frío / sol / viento", "It's hot / cold / sunny / windy", "Hacer for weather; hay for things: hay niebla, hay humedad.", [
 ("pres", "Hoy hace mucho calor.", "It's very hot today."),
 ("impf", "Hacía un frío horrible.", "It was horribly cold."),
 ("pret", "Ayer hizo un día precioso.", "Yesterday was a beautiful day."),
 ("fut", "Mañana va a hacer sol.", "Tomorrow it's going to be sunny.")]),
("clima", "a1", "Está lloviendo / Llueve", "It's raining / It rains", "Llover is only used in the 3rd person: llueve, llovió, va a llover.", [
 ("pres", "Está lloviendo mucho.", "It's raining a lot."),
 ("pres", "Aquí llueve casi todas las tardes.", "Here it rains almost every afternoon."),
 ("pret", "Anoche llovió toda la noche.", "Last night it rained all night."),
 ("fut", "Parece que va a llover.", "It looks like it's going to rain.")]),
("clima", "a2", "¡Qué + weather noun + hace!", "What … weather!", "¡Qué calor hace! ¡Qué frío! ¡Qué día tan bonito!", [
 ("pres", "¡Qué bochorno hace!", "It's so muggy!"),
 ("pres", "¡Qué día tan bonito!", "What a beautiful day!"),
 ("impf", "¡Qué frío hacía en la montaña!", "It was so cold in the mountains!"),
 ("pret", "¡Qué tormenta hubo anoche!", "What a storm there was last night!")]),
("permiso", "a1", "Se puede + infinitive", "You can … / Is it allowed to …?", "Impersonal se for rules.", [
 ("pres", "¿Se puede entrar con perros?", "Can you go in with dogs?"),
 ("pres", "Aquí no se puede fumar.", "You can't smoke here."),
 ("impf", "Antes se podía estacionar aquí.", "You used to be able to park here."),
 ("fut", "¿Se podrá pagar en dólares?", "Will it be possible to pay in dollars?")]),
("permiso", "a2", "Está prohibido + infinitive", "… is not allowed", "Also: no está permitido, prohibido + infinitive on signs.", [
 ("pres", "Está prohibido tomar fotos.", "Taking photos is not allowed."),
 ("pres", "No está permitido comer en el bus.", "Eating on the bus is not allowed."),
 ("impf", "Estaba prohibido hablar en clase.", "Talking in class was forbidden."),
 ("pres", "Prohibido estacionar.", "No parking.")]),
("permiso", "a2", "Déjame + infinitive", "Let me …", "Dejar + infinitive = let/allow; déjame ayudarte.", [
 ("imp", "Déjame ayudarte.", "Let me help you."),
 ("pres", "Mis padres no me dejan salir.", "My parents don't let me go out."),
 ("impf", "No me dejaban ver la tele.", "They didn't let me watch TV."),
 ("imp", "Déjame pensarlo.", "Let me think about it.")]),
("salud", "a1", "Me duele + body part", "My … hurts", "Works like gustar: me duele la cabeza, me duelen los pies.", [
 ("pres", "Me duele la cabeza.", "I have a headache."),
 ("pres", "Me duelen los pies de tanto caminar.", "My feet hurt from so much walking."),
 ("pret", "Ayer me dolió el estómago.", "Yesterday I had a stomach ache."),
 ("impf", "Le dolía mucho la espalda.", "Her back hurt a lot.")]),
("salud", "a1", "Me siento + adjective", "I feel …", "Sentirse + adjective; me siento mal / bien / mejor.", [
 ("pres", "No me siento bien.", "I don't feel well."),
 ("pres", "Hoy me siento mucho mejor.", "Today I feel much better."),
 ("pret", "Me sentí muy solo al principio.", "I felt very lonely at first."),
 ("impf", "Se sentía cansado todo el tiempo.", "He felt tired all the time.")]),
("salud", "a2", "Tengo + illness / symptom", "I have …", "Tengo fiebre, tengo tos, tengo gripe, estoy resfriado.", [
 ("pres", "Tengo fiebre y dolor de garganta.", "I have a fever and a sore throat."),
 ("pres", "Estoy resfriado.", "I have a cold."),
 ("pret", "Tuve gripe la semana pasada.", "I had flu last week."),
 ("perf", "He tenido tos toda la noche.", "I've been coughing all night.")]),
("salud", "a2", "Tienes que + infinitive (doctor's advice)", "You need to …", "Advice with tener que, deber, es mejor que.", [
 ("pres", "Tienes que tomar mucho líquido.", "You need to drink lots of fluids."),
 ("subj", "Es mejor que descanses unos días.", "It's better if you rest for a few days."),
 ("imp", "Tome una pastilla cada ocho horas.", "Take a tablet every eight hours."),
 ("cond", "Deberías ir a urgencias.", "You should go to the emergency room.")]),
("otros", "a1", "Mi + family member + es / tiene / vive …", "My … is / has / lives …", "Describing people you know.", [
 ("pres", "Mi hermana es médica y vive en Chile.", "My sister is a doctor and lives in Chile."),
 ("impf", "Mi abuelo era pescador.", "My grandfather was a fisherman."),
 ("perf", "Mi primo ha tenido un bebé.", "My cousin has had a baby."),
 ("fut", "Mis padres van a venir en Navidad.", "My parents are going to come at Christmas.")]),
("otros", "a2", "Se parece a + person", "He/she looks like …", "Parecerse a = to look like; parecer = to seem.", [
 ("pres", "Se parece mucho a su madre.", "She looks a lot like her mother."),
 ("pres", "Parece cansado.", "He seems tired."),
 ("impf", "De niño me parecía a mi padre.", "As a child I looked like my father."),
 ("pres", "Parece que no está en casa.", "It seems he isn't home.")]),
("otros", "a2", "Le encanta / Le gusta + noun / infinitive", "He/she loves / likes …", "Le for him, her and usted; les for them.", [
 ("pres", "A mi hijo le encanta el fútbol.", "My son loves football."),
 ("pres", "A mis padres les gusta viajar.", "My parents like travelling."),
 ("pret", "A Ana no le gustó la película.", "Ana didn't like the film."),
 ("impf", "A mi abuela le encantaba cocinar.", "My grandmother loved cooking.")]),
("otros", "b1", "Dile que + subjunctive", "Tell him/her to …", "Decir que + subjunctive for orders; + indicative for information.", [
 ("subj", "Dile que me llame.", "Tell him to call me."),
 ("pres", "Dile que estoy en camino.", "Tell her I'm on my way."),
 ("impsub", "Le dije que viniera temprano.", "I told him to come early."),
 ("subj", "Dígale que no se preocupe.", "Tell her not to worry.")]),
]
