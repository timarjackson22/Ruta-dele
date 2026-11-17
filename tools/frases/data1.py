# Sentence patterns 1–50: courtesy, introductions, wants and needs, likes, ability.
# (category, level, Spanish pattern, English pattern, tip, [(tense, Spanish, English), ...])
# tense: pres, pret (preterite), impf (imperfect), perf (present perfect), fut (future / ir a), cond, subj, impsub, imp (command), pqp (pluperfect)
P = [
("cortesia", "a1", "¿Cómo estás? / ¿Cómo está usted?", "How are you?", "Tú with friends; usted with strangers, older people and at work.", [
 ("pres", "¿Cómo estás? Bien, gracias, ¿y tú?", "How are you? Fine, thanks, and you?"),
 ("pret", "¿Cómo estuvo tu día?", "How was your day?"),
 ("perf", "¿Cómo has estado?", "How have you been?"),
 ("fut", "¿Cómo crees que te va a ir mañana?", "How do you think it'll go tomorrow?")]),
("cortesia", "a1", "¿Qué tal + noun?", "How's / How was …?", "Quick and friendly: ¿Qué tal el trabajo? ¿Qué tal todo?", [
 ("pres", "¿Qué tal el trabajo?", "How's work?"),
 ("pret", "¿Qué tal te fue en el examen?", "How did the exam go for you?"),
 ("perf", "¿Qué tal ha ido la reunión?", "How has the meeting gone?"),
 ("fut", "¿Qué tal va a estar el clima mañana?", "What's the weather going to be like tomorrow?")]),
("cortesia", "a1", "Mucho gusto / Encantado de + infinitive", "Nice to meet you", "Encantado if you're a man, encantada if you're a woman.", [
 ("pres", "Mucho gusto, soy Ana.", "Nice to meet you, I'm Ana."),
 ("pret", "Fue un placer conocerte.", "It was a pleasure to meet you."),
 ("perf", "Ha sido un gusto trabajar con ustedes.", "It has been a pleasure working with you."),
 ("fut", "Será un placer verte otra vez.", "It will be a pleasure to see you again.")]),
("cortesia", "a1", "Gracias por + noun / infinitive", "Thanks for …", "Gracias por + infinitive: gracias por venir, gracias por ayudarme.", [
 ("pres", "Gracias por tu ayuda.", "Thanks for your help."),
 ("pret", "Gracias por llamarme ayer.", "Thanks for calling me yesterday."),
 ("perf", "Gracias por haber venido.", "Thanks for having come."),
 ("fut", "Te lo agradeceré mucho.", "I'll really appreciate it.")]),
("cortesia", "a1", "Perdón, ¿+ question?", "Excuse me, …?", "Perdón or disculpe to get attention; con permiso to get past someone.", [
 ("pres", "Perdón, ¿dónde está el baño?", "Excuse me, where's the bathroom?"),
 ("pret", "Perdón, no te escuché.", "Sorry, I didn't hear you."),
 ("perf", "Disculpe, ¿ha visto mis llaves?", "Excuse me, have you seen my keys?"),
 ("cond", "Disculpe, ¿podría ayudarme?", "Excuse me, could you help me?")]),
("cortesia", "a1", "Lo siento, + sentence", "I'm sorry, …", "Lo siento for apologies and sympathy; perdón for small slips.", [
 ("pres", "Lo siento, no tengo cambio.", "I'm sorry, I don't have change."),
 ("pret", "Lo siento, se me olvidó.", "I'm sorry, I forgot."),
 ("perf", "Siento mucho lo que ha pasado.", "I'm very sorry about what has happened."),
 ("subj", "Siento que no puedas venir.", "I'm sorry you can't come.")]),
("cortesia", "a1", "De nada / No hay de qué", "You're welcome", "Con gusto is also very common in Panama and Colombia.", [
 ("pres", "De nada, es un placer.", "You're welcome, it's a pleasure."),
 ("pres", "Con gusto, para eso estamos.", "My pleasure, that's what we're here for."),
 ("pret", "No fue nada.", "It was nothing."),
 ("fut", "Cuando quieras, te ayudo otra vez.", "Whenever you want, I'll help you again.")]),
("cortesia", "a1", "¡Que + subjunctive!", "Have a … / I hope …", "A wish: ¡Que tengas buen día! ¡Que te mejores!", [
 ("subj", "¡Que tengas un buen día!", "Have a good day!"),
 ("subj", "¡Que te mejores pronto!", "Get well soon!"),
 ("subj", "¡Que te vaya bien!", "All the best! / Hope it goes well!"),
 ("subj", "¡Que la pasen bien!", "Have a good time (all of you)!")]),
("cortesia", "a1", "Nos vemos + time", "See you …", "Hasta luego, hasta mañana and nos vemos are the everyday goodbyes.", [
 ("pres", "Nos vemos mañana.", "See you tomorrow."),
 ("pres", "Nos vemos el lunes en la oficina.", "See you on Monday at the office."),
 ("fut", "Nos veremos pronto.", "We'll see each other soon."),
 ("pret", "Nos vimos la semana pasada.", "We saw each other last week.")]),
("cortesia", "a1", "Bienvenido a + place", "Welcome to …", "Agrees: bienvenido, bienvenida, bienvenidos.", [
 ("pres", "Bienvenidos a Panamá.", "Welcome to Panama."),
 ("pres", "Bienvenida a la empresa.", "Welcome to the company."),
 ("perf", "Siempre te hemos recibido con los brazos abiertos.", "We've always welcomed you with open arms."),
 ("fut", "Siempre serás bienvenido en esta casa.", "You'll always be welcome in this house.")]),
("identidad", "a1", "Me llamo + name", "My name is …", "Also: soy + name, mi nombre es + name.", [
 ("pres", "Me llamo Carlos.", "My name is Carlos."),
 ("pres", "¿Cómo te llamas?", "What's your name?"),
 ("impf", "De niño me llamaban Carlitos.", "As a child they called me Carlitos."),
 ("pres", "¿Cómo se llama usted?", "What's your name? (formal)")]),
("identidad", "a1", "Soy de + place", "I'm from …", "Ser de for origin; vivir en for where you live now.", [
 ("pres", "Soy de Colombia, pero vivo en Panamá.", "I'm from Colombia, but I live in Panama."),
 ("pres", "¿De dónde eres?", "Where are you from?"),
 ("impf", "Mis abuelos eran de España.", "My grandparents were from Spain."),
 ("perf", "He vivido aquí cinco años.", "I've lived here for five years.")]),
("identidad", "a1", "Tengo + number + años", "I'm … years old", "Spanish uses tener for age: tengo treinta años.", [
 ("pres", "Tengo treinta y dos años.", "I'm thirty-two years old."),
 ("pres", "¿Cuántos años tienes?", "How old are you?"),
 ("impf", "Cuando tenía diez años, vivía en el campo.", "When I was ten, I lived in the countryside."),
 ("fut", "El mes que viene voy a cumplir cuarenta.", "Next month I'm going to turn forty.")]),
("identidad", "a1", "Soy + profession / Trabajo de + profession", "I'm a … / I work as a …", "No article: soy enfermera (not una enfermera).", [
 ("pres", "Soy enfermera y trabajo en un hospital.", "I'm a nurse and I work in a hospital."),
 ("pres", "Trabajo de profesor en un colegio.", "I work as a teacher at a school."),
 ("impf", "Antes era contador.", "I used to be an accountant."),
 ("fut", "Algún día seré abogado.", "Some day I'll be a lawyer.")]),
("identidad", "a1", "Vivo en + place / con + people", "I live in / with …", "Vivir is regular: vivo, vives, vive, vivimos, viven.", [
 ("pres", "Vivo en un apartamento con mi hermana.", "I live in an apartment with my sister."),
 ("impf", "Antes vivía con mis padres.", "I used to live with my parents."),
 ("perf", "Siempre he vivido en la ciudad.", "I've always lived in the city."),
 ("fut", "El año que viene voy a vivir solo.", "Next year I'm going to live alone.")]),
("identidad", "a1", "Estoy casado/a / soltero/a", "I'm married / single", "Estar casado (state) is the most common; ser casado is also heard.", [
 ("pres", "Estoy casada y tengo dos hijos.", "I'm married and I have two children."),
 ("pret", "Nos casamos en 2015.", "We got married in 2015."),
 ("perf", "Llevamos diez años casados.", "We've been married for ten years."),
 ("fut", "Se van a casar en diciembre.", "They're going to get married in December.")]),
("identidad", "a1", "Hablo + language", "I speak …", "Languages have no capital letter: hablo inglés y un poco de español.", [
 ("pres", "Hablo inglés y un poco de español.", "I speak English and a little Spanish."),
 ("pres", "¿Hablas inglés?", "Do you speak English?"),
 ("impf", "De pequeño hablaba francés con mi abuela.", "As a child I spoke French with my grandmother."),
 ("fut", "Pronto voy a hablar español con fluidez.", "Soon I'm going to speak Spanish fluently.")]),
("identidad", "a1", "Tengo + family / things", "I have …", "Tener for possession and family: tengo un hermano, tengo carro.", [
 ("pres", "Tengo un hermano y dos hermanas.", "I have a brother and two sisters."),
 ("impf", "De niño tenía un perro.", "As a child I had a dog."),
 ("pret", "Tuve un accidente el año pasado.", "I had an accident last year."),
 ("fut", "Vamos a tener un bebé.", "We're going to have a baby.")]),
("identidad", "a1", "Me dedico a + noun / infinitive", "I do … for a living", "A natural way to say what you do: me dedico a la enseñanza.", [
 ("pres", "¿A qué te dedicas?", "What do you do for a living?"),
 ("pres", "Me dedico a la venta de seguros.", "I work in insurance sales."),
 ("impf", "Antes me dedicaba a la música.", "I used to work in music."),
 ("fut", "Me voy a dedicar a escribir.", "I'm going to devote myself to writing.")]),
("identidad", "a1", "Es + description (ser) / Está + state (estar)", "He/she is …", "Ser for what someone is like; estar for how they are right now.", [
 ("pres", "Mi jefe es simpático, pero hoy está de mal humor.", "My boss is nice, but today he's in a bad mood."),
 ("impf", "Mi abuela era muy alegre.", "My grandmother was very cheerful."),
 ("pret", "Estuvo enfermo toda la semana.", "He was sick all week."),
 ("fut", "Va a estar contenta con la noticia.", "She's going to be happy with the news.")]),
("deseos", "a1", "Quiero + noun / infinitive", "I want …", "Quisiera (softer) for requests in shops and with strangers.", [
 ("pres", "Quiero un café, por favor.", "I want a coffee, please."),
 ("impf", "Quería hablar contigo.", "I wanted to talk to you."),
 ("pret", "Quise llamarte, pero no tenía batería.", "I tried to call you, but I had no battery."),
 ("cond", "Quisiera reservar una mesa para dos.", "I'd like to book a table for two.")]),
("deseos", "a1", "Quiero que + subjunctive", "I want you/him to …", "A different subject after que needs the subjunctive.", [
 ("subj", "Quiero que vengas a mi fiesta.", "I want you to come to my party."),
 ("impsub", "Quería que me ayudaras.", "I wanted you to help me."),
 ("subj", "¿Quieres que te acompañe?", "Do you want me to go with you?"),
 ("impsub", "Mis padres querían que estudiara medicina.", "My parents wanted me to study medicine.")]),
("deseos", "a1", "Necesito + noun / infinitive", "I need …", "Necesitar + infinitive, no preposition: necesito descansar.", [
 ("pres", "Necesito descansar un poco.", "I need to rest a bit."),
 ("impf", "Necesitaba tu ayuda.", "I needed your help."),
 ("fut", "Vas a necesitar un abrigo.", "You're going to need a coat."),
 ("cond", "Necesitaría más tiempo.", "I'd need more time.")]),
("deseos", "a1", "Me hace falta + noun", "I need … / I'm missing …", "Works like gustar: me hace falta dinero, me hacen falta zapatos.", [
 ("pres", "Me hace falta una toalla.", "I need a towel."),
 ("pres", "Nos hacen falta dos sillas más.", "We need two more chairs."),
 ("impf", "Le hacía falta un descanso.", "He needed a break."),
 ("fut", "Te va a hacer falta paciencia.", "You're going to need patience.")]),
("deseos", "a2", "Tengo ganas de + infinitive", "I feel like …", "No tengo ganas de… = I don't feel like …", [
 ("pres", "Tengo ganas de ir a la playa.", "I feel like going to the beach."),
 ("impf", "Tenía muchas ganas de verte.", "I really wanted to see you."),
 ("pres", "No tengo ganas de cocinar hoy.", "I don't feel like cooking today."),
 ("fut", "Vas a tener ganas de volver.", "You're going to want to come back.")]),
("deseos", "a2", "Ojalá + subjunctive", "I hope … / If only …", "Present subjunctive = possible; imperfect subjunctive = unlikely or impossible.", [
 ("subj", "Ojalá haga buen tiempo mañana.", "I hope the weather is good tomorrow."),
 ("impsub", "Ojalá tuviera más tiempo libre.", "I wish I had more free time."),
 ("subj", "Ojalá que te vaya bien.", "I hope it goes well for you."),
 ("pqp", "Ojalá hubiera estudiado más.", "I wish I had studied more.")]),
("deseos", "a1", "Me gustaría + infinitive", "I'd like to …", "Polite and very common for wishes and plans.", [
 ("cond", "Me gustaría viajar a México.", "I'd like to travel to Mexico."),
 ("cond", "¿Te gustaría cenar conmigo?", "Would you like to have dinner with me?"),
 ("cond", "Nos gustaría hablar con el gerente.", "We'd like to speak to the manager."),
 ("impsub", "Me gustaría que vinieras.", "I'd like you to come.")]),
("deseos", "a2", "Espero + infinitive / que + subjunctive", "I hope …", "Same subject: espero llegar; different subject: espero que llegues.", [
 ("pres", "Espero llegar a tiempo.", "I hope to arrive on time."),
 ("subj", "Espero que te guste.", "I hope you like it."),
 ("impf", "Esperaba verte en la fiesta.", "I was hoping to see you at the party."),
 ("impsub", "Esperaba que me llamaras.", "I was hoping you'd call me.")]),
("deseos", "a2", "Prefiero + noun / infinitive", "I prefer …", "Preferir: prefiero, prefieres, prefiere, preferimos, prefieren.", [
 ("pres", "Prefiero el té al café.", "I prefer tea to coffee."),
 ("pres", "Prefiero quedarme en casa esta noche.", "I'd rather stay home tonight."),
 ("impf", "De joven prefería la playa.", "When I was young I preferred the beach."),
 ("subj", "Prefiero que me lo digas en persona.", "I'd rather you tell me in person.")]),
("deseos", "a2", "Me encantaría + infinitive", "I'd love to …", "Warmer than me gustaría: perfect for accepting invitations.", [
 ("cond", "Me encantaría ir contigo.", "I'd love to go with you."),
 ("cond", "Nos encantaría conocer a tu familia.", "We'd love to meet your family."),
 ("pres", "¡Claro! Me encanta la idea.", "Of course! I love the idea."),
 ("impsub", "Me encantaría que vinieras a cenar.", "I'd love you to come for dinner.")]),
("gustos", "a1", "Me gusta + noun / infinitive", "I like …", "Gusta with one thing or a verb; gustan with plural things.", [
 ("pres", "Me gusta bailar salsa.", "I like dancing salsa."),
 ("pres", "Me gustan mucho los perros.", "I really like dogs."),
 ("impf", "De niño me gustaba jugar al fútbol.", "As a child I liked playing football."),
 ("pret", "¿Te gustó la película?", "Did you like the film?")]),
("gustos", "a1", "No me gusta nada + noun", "I don't like … at all", "Nada after the verb makes it strong: no me gusta nada.", [
 ("pres", "No me gusta nada el tráfico.", "I don't like the traffic at all."),
 ("pret", "No me gustó nada el final.", "I didn't like the ending at all."),
 ("impf", "No me gustaban las verduras.", "I didn't use to like vegetables."),
 ("cond", "No me gustaría vivir allí.", "I wouldn't like to live there.")]),
("gustos", "a1", "Me encanta + noun / infinitive", "I love …", "For things and activities (for people, use querer or amar).", [
 ("pres", "Me encanta la comida panameña.", "I love Panamanian food."),
 ("pret", "Me encantó el concierto.", "I loved the concert."),
 ("impf", "Me encantaba ir a casa de mi abuela.", "I loved going to my grandmother's house."),
 ("perf", "Me ha encantado conocerte.", "I've loved meeting you.")]),
("gustos", "a1", "A mí también / A mí tampoco", "Me too / Me neither", "Agree with gustar sentences: A mí también (yes), A mí tampoco (no).", [
 ("pres", "Me gusta el cine. —A mí también.", "I like the cinema. —Me too."),
 ("pres", "No me gusta el frío. —A mí tampoco.", "I don't like the cold. —Me neither."),
 ("pres", "Me encanta el mar. —Pues a mí no.", "I love the sea. —Well, I don't."),
 ("pres", "No me gusta correr. —A mí sí.", "I don't like running. —I do.")]),
("gustos", "a2", "Me interesa + noun / infinitive", "I'm interested in …", "Works like gustar: me interesa la historia, me interesan los idiomas.", [
 ("pres", "Me interesa mucho la historia.", "I'm very interested in history."),
 ("impf", "Antes no me interesaba la política.", "I didn't use to be interested in politics."),
 ("pret", "Me interesó tu propuesta.", "Your proposal interested me."),
 ("cond", "¿Te interesaría trabajar con nosotros?", "Would you be interested in working with us?")]),
("gustos", "a2", "Me molesta + noun / que + subjunctive", "… bothers me", "Me molesta que + subjunctive: me molesta que llegues tarde.", [
 ("pres", "Me molesta el ruido.", "The noise bothers me."),
 ("subj", "Me molesta que no me escuches.", "It bothers me that you don't listen to me."),
 ("pret", "Le molestó mi comentario.", "My comment bothered him."),
 ("cond", "¿Te molestaría cerrar la ventana?", "Would you mind closing the window?")]),
("gustos", "a2", "Me cae bien / mal + person", "I like / don't like (someone)", "For people: me cae bien tu hermano (I like your brother).", [
 ("pres", "Tu hermano me cae muy bien.", "I really like your brother."),
 ("pret", "Me cayó mal desde el principio.", "I didn't like him from the start."),
 ("impf", "Al principio no me caía bien.", "At first I didn't like her."),
 ("fut", "Te va a caer bien, ya verás.", "You'll like him, you'll see.")]),
("gustos", "a1", "Lo que más me gusta es + noun / infinitive", "What I like most is …", "A great way to start a description in the DELE oral exam.", [
 ("pres", "Lo que más me gusta es viajar.", "What I like most is travelling."),
 ("pret", "Lo que más me gustó fue la comida.", "What I liked most was the food."),
 ("impf", "Lo que más me gustaba era la playa.", "What I used to like most was the beach."),
 ("pres", "Lo que menos me gusta es madrugar.", "What I like least is getting up early.")]),
("gustos", "a2", "Me da igual + noun / infinitive", "I don't mind / It's all the same to me", "Also: me da lo mismo.", [
 ("pres", "Me da igual dónde comamos.", "I don't mind where we eat."),
 ("pres", "¿Café o té? —Me da igual.", "Coffee or tea? —I don't mind."),
 ("pret", "Le dio igual lo que dijimos.", "He didn't care what we said."),
 ("impf", "Antes me daba igual, pero ahora no.", "I used to not care, but now I do.")]),
("gustos", "b1", "Me apetece / Se me antoja + noun / infinitive", "I fancy … / I feel like …", "Me apetece is very common in Spain; in Latin America people say tengo ganas de or se me antoja.", [
 ("pres", "¿Te apetece un helado?", "Do you fancy an ice cream?"),
 ("pres", "Se me antoja algo dulce.", "I'm craving something sweet."),
 ("pret", "No me apeteció salir.", "I didn't feel like going out."),
 ("cond", "¿Te apetecería ir al cine?", "Would you fancy going to the cinema?")]),
("capacidad", "a1", "Puedo + infinitive", "I can …", "Poder for ability and permission; saber for skills you learned.", [
 ("pres", "¿Puedo sentarme aquí?", "Can I sit here?"),
 ("impf", "No podía dormir por el calor.", "I couldn't sleep because of the heat."),
 ("pret", "No pude ir a la reunión.", "I couldn't go to the meeting."),
 ("fut", "¿Podrás venir mañana?", "Will you be able to come tomorrow?")]),
("capacidad", "a1", "¿Puedes + infinitive?", "Can you …?", "The everyday way to ask a favour; ¿podrías…? is softer.", [
 ("pres", "¿Puedes ayudarme con esto?", "Can you help me with this?"),
 ("cond", "¿Podrías hablar más despacio?", "Could you speak more slowly?"),
 ("pres", "¿Me lo puede repetir, por favor?", "Can you repeat that, please? (formal)"),
 ("cond", "¿Me podría decir la hora?", "Could you tell me the time? (formal)")]),
("capacidad", "a1", "Sé + infinitive", "I know how to …", "Saber + infinitive for skills: sé nadar, sé cocinar.", [
 ("pres", "Sé nadar, pero no muy bien.", "I can swim, but not very well."),
 ("pres", "¿Sabes manejar?", "Can you drive?"),
 ("impf", "De niño no sabía leer.", "As a child I couldn't read."),
 ("fut", "Pronto vas a saber hacerlo solo.", "Soon you'll know how to do it on your own.")]),
("capacidad", "a1", "No sé + question word", "I don't know …", "No sé qué, dónde, cuándo, si: question words keep their tilde.", [
 ("pres", "No sé dónde está la estación.", "I don't know where the station is."),
 ("pres", "No sé si puedo ir.", "I don't know if I can go."),
 ("impf", "No sabía qué decir.", "I didn't know what to say."),
 ("pret", "Nunca supe por qué se fue.", "I never found out why he left.")]),
("capacidad", "a1", "Conozco + person / place", "I know (someone / somewhere)", "Conocer for people and places; saber for facts and skills.", [
 ("pres", "¿Conoces a mi hermana?", "Do you know my sister?"),
 ("pret", "Conocí a mi esposa en la universidad.", "I met my wife at university."),
 ("perf", "Todavía no he conocido a tu novio.", "I still haven't met your boyfriend."),
 ("fut", "Vas a conocer a mucha gente.", "You're going to meet a lot of people.")]),
("capacidad", "a2", "Me cuesta + infinitive", "I find it hard to …", "Works like gustar: me cuesta entender, nos cuesta madrugar.", [
 ("pres", "Me cuesta entender a los nativos.", "I find it hard to understand native speakers."),
 ("impf", "Al principio me costaba mucho.", "At first it was very hard for me."),
 ("pret", "Me costó encontrar trabajo.", "It was hard for me to find a job."),
 ("fut", "Te va a costar un poco al principio.", "It's going to be a bit hard at first.")]),
("capacidad", "a2", "Soy capaz de + infinitive", "I'm able to …", "Stresses real capacity: no soy capaz de decirle que no.", [
 ("pres", "No soy capaz de decirle que no.", "I can't bring myself to say no to him."),
 ("pret", "Fue capaz de terminar la maratón.", "She managed to finish the marathon."),
 ("fut", "Serás capaz de hacerlo.", "You'll be able to do it."),
 ("impf", "No era capaz de concentrarme.", "I wasn't able to concentrate.")]),
("capacidad", "a2", "Logré / Conseguí + infinitive", "I managed to …", "Lograr and conseguir are interchangeable here.", [
 ("pret", "Por fin conseguí hablar con él.", "I finally managed to speak to him."),
 ("perf", "He logrado ahorrar un poco.", "I've managed to save a bit."),
 ("fut", "Vas a conseguir ese trabajo.", "You're going to get that job."),
 ("pres", "No consigo abrir la puerta.", "I can't get the door open.")]),
("capacidad", "a2", "Se me da bien / mal + noun / infinitive", "I'm good / bad at …", "Works like gustar: se me dan bien los idiomas.", [
 ("pres", "Se me da bien cocinar.", "I'm good at cooking."),
 ("pres", "Se me dan mal las matemáticas.", "I'm bad at maths."),
 ("impf", "De niño se me daba bien dibujar.", "As a child I was good at drawing."),
 ("fut", "Ya verás, se te va a dar bien.", "You'll see, you're going to be good at it.")]),
("capacidad", "a2", "Aprendí a + infinitive", "I learned to …", "Aprender a + infinitive; enseñar a + infinitive (teach to).", [
 ("pret", "Aprendí a nadar a los cinco años.", "I learned to swim at five."),
 ("pres", "Estoy aprendiendo a tocar la guitarra.", "I'm learning to play the guitar."),
 ("fut", "Vas a aprender a hablar sin miedo.", "You're going to learn to speak without fear."),
 ("pret", "Mi padre me enseñó a manejar.", "My father taught me to drive.")]),
]
