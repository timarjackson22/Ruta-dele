# Sentence patterns 101–150: time and duration, frequency and routine, opinions, feelings and states, the past.
P = [
("tiempo", "a2", "Hace + time + que + present", "I've been … for (time)", "Something that started in the past and continues: hace dos años que vivo aquí.", [
 ("pres", "Hace dos años que vivo en Panamá.", "I've been living in Panama for two years."),
 ("impf", "Hacía mucho que no te veía.", "I hadn't seen you for a long time."),
 ("pres", "¿Cuánto tiempo hace que estudias español?", "How long have you been studying Spanish?"),
 ("pres", "Hace una semana que no llueve.", "It hasn't rained for a week.")]),
("tiempo", "a2", "Verb + hace + time", "… (time) ago", "Hace + time after a past verb = ago: llegué hace una hora.", [
 ("pret", "Llegué hace una hora.", "I arrived an hour ago."),
 ("pret", "Nos conocimos hace diez años.", "We met ten years ago."),
 ("pret", "Lo vi hace un momento.", "I saw him a moment ago."),
 ("pret", "¿Cuándo pasó? —Hace un rato.", "When did it happen? —A while ago.")]),
("tiempo", "b1", "Llevo + time + gerund", "I've been …ing for (time)", "Very natural: llevo una hora esperando.", [
 ("pres", "Llevo una hora esperando el autobús.", "I've been waiting for the bus for an hour."),
 ("pres", "Llevamos tres años viviendo juntos.", "We've been living together for three years."),
 ("impf", "Llevaba días sin dormir bien.", "I had gone days without sleeping well."),
 ("pres", "¿Cuánto tiempo llevas trabajando aquí?", "How long have you been working here?")]),
("tiempo", "a2", "Acabo de + infinitive", "I've just …", "Something that has just happened.", [
 ("pres", "Acabo de llegar a casa.", "I've just got home."),
 ("impf", "Acababa de salir cuando llamaste.", "I had just left when you called."),
 ("pres", "¿Acabas de despertarte?", "Have you just woken up?"),
 ("pres", "El tren acaba de salir.", "The train has just left.")]),
("tiempo", "a2", "Vuelvo a + infinitive", "I … again", "Volver a + infinitive = to do something again.", [
 ("pres", "Vuelvo a intentarlo mañana.", "I'll try again tomorrow."),
 ("pret", "Volví a ver la película.", "I watched the film again."),
 ("fut", "No voy a volver a hacerlo.", "I'm not going to do it again."),
 ("perf", "Ha vuelto a llover.", "It's started raining again.")]),
("tiempo", "a2", "Sigo + gerund", "I'm still …", "Seguir + gerund = to keep / still be doing.", [
 ("pres", "Sigo trabajando en la misma empresa.", "I'm still working at the same company."),
 ("impf", "Seguía lloviendo cuando salimos.", "It was still raining when we left."),
 ("pres", "¿Sigues viviendo en el centro?", "Do you still live in the centre?"),
 ("fut", "Vamos a seguir practicando.", "We're going to keep practising.")]),
("tiempo", "b1", "Dejé de + infinitive", "I stopped …", "Dejar de + infinitive = to stop doing something.", [
 ("pret", "Dejé de fumar hace cinco años.", "I stopped smoking five years ago."),
 ("pres", "No dejes de llamarme.", "Don't forget to call me. / Make sure you call me."),
 ("perf", "Ha dejado de llover.", "It has stopped raining."),
 ("fut", "Voy a dejar de comer azúcar.", "I'm going to stop eating sugar.")]),
("tiempo", "a2", "Empecé a + infinitive", "I started to …", "Empezar a / comenzar a + infinitive.", [
 ("pret", "Empecé a estudiar español el año pasado.", "I started studying Spanish last year."),
 ("pres", "Empieza a hacer frío.", "It's starting to get cold."),
 ("perf", "Ha empezado a llover.", "It's started to rain."),
 ("fut", "Mañana voy a empezar a correr.", "Tomorrow I'm going to start running.")]),
("tiempo", "a2", "Mientras + verb, + verb", "While …", "Mientras for two things at the same time.", [
 ("pres", "Escucho música mientras cocino.", "I listen to music while I cook."),
 ("impf", "Mientras yo trabajaba, él dormía.", "While I was working, he was sleeping."),
 ("impf", "Mientras esperaba, leí el periódico.", "While I was waiting, I read the paper."),
 ("subj", "Mientras estés aquí, puedes usar mi carro.", "As long as you're here, you can use my car.")]),
("tiempo", "b1", "Desde que + verb", "Since …", "Desde que llegué = since I arrived.", [
 ("pret", "Desde que llegué, no ha parado de llover.", "Since I arrived, it hasn't stopped raining."),
 ("pres", "Desde que tengo perro, salgo más.", "Since I've had a dog, I go out more."),
 ("impf", "Desde que era niño, quería ser piloto.", "Ever since I was a child, I wanted to be a pilot."),
 ("perf", "Desde que te fuiste, todo ha cambiado.", "Since you left, everything has changed.")]),
("rutina", "a1", "Normalmente + present", "Normally / Usually I …", "Adverbs of frequency: siempre, normalmente, a veces, nunca.", [
 ("pres", "Normalmente desayuno a las siete.", "I normally have breakfast at seven."),
 ("impf", "Normalmente íbamos en autobús.", "We usually went by bus."),
 ("pres", "¿Qué haces normalmente los domingos?", "What do you normally do on Sundays?"),
 ("pres", "Normalmente no trabajo los fines de semana.", "I don't normally work at weekends.")]),
("rutina", "a2", "Suelo + infinitive", "I usually …", "Soler is only used in present and imperfect: suelo / solía.", [
 ("pres", "Suelo levantarme temprano.", "I usually get up early."),
 ("impf", "Solía ir al gimnasio todos los días.", "I used to go to the gym every day."),
 ("pres", "¿Sueles cocinar en casa?", "Do you usually cook at home?"),
 ("pres", "Aquí suele llover por la tarde.", "Here it usually rains in the afternoon.")]),
("rutina", "a1", "Siempre / Nunca + verb", "I always / never …", "Nunca before the verb, or no + verb + nunca.", [
 ("pres", "Siempre llego tarde.", "I'm always late."),
 ("pres", "Nunca como carne.", "I never eat meat."),
 ("pres", "No bebo café nunca.", "I never drink coffee."),
 ("perf", "Nunca he estado en Europa.", "I've never been to Europe.")]),
("rutina", "a1", "Todos los días / Cada + time + verb", "Every day / Every …", "Todos los lunes, cada semana, cada dos días.", [
 ("pres", "Corro todos los días.", "I run every day."),
 ("pres", "Voy al mercado cada semana.", "I go to the market every week."),
 ("impf", "Todos los veranos íbamos a la playa.", "Every summer we went to the beach."),
 ("pres", "Tomo la pastilla cada ocho horas.", "I take the pill every eight hours.")]),
("rutina", "a1", "A veces + verb", "Sometimes I …", "Also: de vez en cuando (from time to time).", [
 ("pres", "A veces trabajo desde casa.", "Sometimes I work from home."),
 ("pres", "De vez en cuando vamos al cine.", "We go to the cinema from time to time."),
 ("impf", "A veces mi padre nos llevaba al río.", "Sometimes my father took us to the river."),
 ("pres", "Casi nunca veo la tele.", "I hardly ever watch TV.")]),
("rutina", "a1", "Me levanto / Me acuesto a las + time", "I get up / go to bed at …", "Reflexive verbs for routine: levantarse, ducharse, acostarse.", [
 ("pres", "Me levanto a las seis y me ducho.", "I get up at six and have a shower."),
 ("pret", "Ayer me acosté muy tarde.", "Yesterday I went to bed very late."),
 ("impf", "De niño me acostaba a las ocho.", "As a child I went to bed at eight."),
 ("fut", "Mañana me voy a levantar temprano.", "Tomorrow I'm going to get up early.")]),
("rutina", "a2", "Tardo + time + en + infinitive", "It takes me (time) to …", "Tardar en = take time to do something.", [
 ("pres", "Tardo media hora en llegar al trabajo.", "It takes me half an hour to get to work."),
 ("pret", "Tardé mucho en encontrar la casa.", "It took me a long time to find the house."),
 ("pres", "¿Cuánto tardas en arreglarte?", "How long does it take you to get ready?"),
 ("fut", "No tardo nada, ya vuelvo.", "I won't be long, I'll be right back.")]),
("rutina", "a2", "Estoy + gerund", "I'm …ing (right now)", "Estar + gerund for actions in progress.", [
 ("pres", "Estoy cocinando, te llamo después.", "I'm cooking, I'll call you later."),
 ("impf", "Estaba durmiendo cuando sonó el teléfono.", "I was sleeping when the phone rang."),
 ("pret", "Estuve trabajando toda la tarde.", "I was working all afternoon."),
 ("fut", "A esta hora estaré volando.", "At this time I'll be flying.")]),
("rutina", "a1", "Por la mañana / tarde / noche + verb", "In the morning / afternoon / evening …", "De la mañana with clock times: a las ocho de la mañana.", [
 ("pres", "Por la mañana trabajo y por la tarde estudio.", "In the morning I work and in the afternoon I study."),
 ("pret", "Anoche salí con mis amigos.", "Last night I went out with my friends."),
 ("impf", "Por las noches leíamos cuentos.", "In the evenings we used to read stories."),
 ("fut", "Mañana por la tarde voy al médico.", "Tomorrow afternoon I'm going to the doctor.")]),
("rutina", "a2", "Tengo la costumbre de + infinitive", "I have a habit of …", "Also: estoy acostumbrado a + infinitive (I'm used to).", [
 ("pres", "Tengo la costumbre de leer antes de dormir.", "I'm in the habit of reading before bed."),
 ("pres", "Estoy acostumbrado a madrugar.", "I'm used to getting up early."),
 ("impf", "Tenía la costumbre de llegar tarde.", "He had a habit of arriving late."),
 ("fut", "Te vas a acostumbrar al calor.", "You'll get used to the heat.")]),
("opinion", "a1", "Creo que + indicative", "I think that …", "Creo que + indicative; no creo que + subjunctive.", [
 ("pres", "Creo que es una buena idea.", "I think it's a good idea."),
 ("fut", "Creo que va a llover.", "I think it's going to rain."),
 ("impf", "Creía que eras de aquí.", "I thought you were from here."),
 ("subj", "No creo que sea tan difícil.", "I don't think it's that difficult.")]),
("opinion", "a1", "Me parece + adjective / que + indicative", "I think … / It seems …", "Me parece bien = it's fine with me.", [
 ("pres", "Me parece bien.", "That's fine with me."),
 ("pres", "Me parece que tienes razón.", "I think you're right."),
 ("pret", "La película me pareció aburrida.", "I found the film boring."),
 ("subj", "Me parece increíble que no lo sepas.", "I find it incredible that you don't know.")]),
("opinion", "a2", "En mi opinión, + sentence", "In my opinion, …", "Also: para mí, desde mi punto de vista, a mi modo de ver.", [
 ("pres", "En mi opinión, el transporte público es caro.", "In my opinion, public transport is expensive."),
 ("pres", "Para mí, lo más importante es la familia.", "For me, the most important thing is family."),
 ("pret", "Desde mi punto de vista, fue un error.", "From my point of view, it was a mistake."),
 ("cond", "En mi opinión, sería mejor esperar.", "In my opinion, it would be better to wait.")]),
("opinion", "a2", "Estoy de acuerdo con + noun / que + subjunctive", "I agree with …", "No estoy de acuerdo = I disagree.", [
 ("pres", "Estoy de acuerdo contigo.", "I agree with you."),
 ("pres", "No estoy de acuerdo con esa decisión.", "I don't agree with that decision."),
 ("subj", "Estoy de acuerdo en que lo hagamos así.", "I agree that we do it like that."),
 ("pret", "Al final nos pusimos de acuerdo.", "In the end we reached an agreement.")]),
("opinion", "a1", "Tienes razón", "You're right", "Tener razón (not ser): no tienes razón = you're wrong.", [
 ("pres", "Tienes toda la razón.", "You're absolutely right."),
 ("impf", "Tenías razón, era tarde.", "You were right, it was late."),
 ("pret", "Al final tuvo razón ella.", "In the end she was right."),
 ("pres", "Creo que no tienes razón.", "I don't think you're right.")]),
("opinion", "a2", "Es + adjective + que + subjunctive", "It's … that …", "Value judgements take the subjunctive: es normal que, es raro que, es una pena que.", [
 ("subj", "Es normal que estés nervioso.", "It's normal that you're nervous."),
 ("subj", "Es una pena que no puedas venir.", "It's a shame you can't come."),
 ("impsub", "Era raro que no contestara.", "It was strange that he didn't answer."),
 ("subj", "Es mejor que lo hablemos.", "It's better that we talk about it.")]),
("opinion", "b1", "Dudo que + subjunctive", "I doubt that …", "Doubt always takes the subjunctive.", [
 ("subj", "Dudo que llegue a tiempo.", "I doubt he'll arrive on time."),
 ("impsub", "Dudaba que fuera verdad.", "I doubted it was true."),
 ("subj", "No estoy seguro de que sea buena idea.", "I'm not sure it's a good idea."),
 ("pres", "No dudo que tienes talento.", "I don't doubt that you have talent.")]),
("opinion", "a2", "Lo importante es + infinitive / que + subjunctive", "The important thing is …", "Also: lo malo es, lo bueno es, lo raro es.", [
 ("pres", "Lo importante es participar.", "The important thing is taking part."),
 ("subj", "Lo importante es que estés bien.", "The important thing is that you're OK."),
 ("pret", "Lo bueno fue que nadie se hizo daño.", "The good thing was that nobody got hurt."),
 ("pres", "Lo malo es que no tengo tiempo.", "The bad thing is that I don't have time.")]),
("opinion", "a2", "Supongo que + indicative", "I suppose …", "Supongo que sí / supongo que no = I suppose so / not.", [
 ("pres", "Supongo que tienes hambre.", "I suppose you're hungry."),
 ("fut", "Supongo que vendrá más tarde.", "I suppose he'll come later."),
 ("pres", "¿Vienes? —Supongo que sí.", "Are you coming? —I suppose so."),
 ("impf", "Suponía que estabas ocupado.", "I assumed you were busy.")]),
("opinion", "b1", "Puede que + subjunctive", "Maybe … / It may be that …", "Also: quizás / tal vez + subjunctive for something uncertain.", [
 ("subj", "Puede que llueva esta tarde.", "It may rain this afternoon."),
 ("subj", "Quizás tengas razón.", "Maybe you're right."),
 ("subj", "Tal vez venga mañana.", "Perhaps she'll come tomorrow."),
 ("subj", "Puede que no lo sepa.", "He may not know.")]),
("sentimientos", "a1", "Estoy + adjective", "I'm … (feeling)", "Estar for feelings and states: cansado, contento, nervioso, enfermo.", [
 ("pres", "Estoy muy cansado hoy.", "I'm very tired today."),
 ("impf", "Estaba nerviosa antes del examen.", "I was nervous before the exam."),
 ("pret", "Estuve enfermo toda la semana.", "I was sick all week."),
 ("perf", "He estado muy ocupado.", "I've been very busy.")]),
("sentimientos", "a1", "Tengo hambre / sed / sueño / frío / calor", "I'm hungry / thirsty / sleepy / cold / hot", "Tener + noun for physical states: tengo mucha hambre.", [
 ("pres", "Tengo mucha hambre, ¿comemos?", "I'm really hungry, shall we eat?"),
 ("impf", "Tenía tanto sueño que me dormí.", "I was so sleepy that I fell asleep."),
 ("pret", "Ayer tuve mucho calor en el bus.", "Yesterday I was really hot on the bus."),
 ("pres", "¿Tienes frío?", "Are you cold?")]),
("sentimientos", "a2", "Tengo miedo de + noun / infinitive", "I'm afraid of …", "Also: me da miedo + noun / infinitive.", [
 ("pres", "Tengo miedo de volar.", "I'm afraid of flying."),
 ("pres", "Me dan miedo las arañas.", "Spiders scare me."),
 ("impf", "De niño me daba miedo la oscuridad.", "As a child I was afraid of the dark."),
 ("subj", "Tengo miedo de que se enoje.", "I'm afraid he'll get angry.")]),
("sentimientos", "a2", "Me pone + adjective", "It makes me …", "Ponerse = sudden change: me pone nervioso, se puso rojo.", [
 ("pres", "El tráfico me pone de mal humor.", "Traffic puts me in a bad mood."),
 ("pret", "Se puso muy contento con la noticia.", "He was really happy about the news."),
 ("impf", "Me ponía nerviosa hablar en público.", "Speaking in public used to make me nervous."),
 ("imp", "No te pongas triste.", "Don't be sad.")]),
("sentimientos", "a2", "Me alegro de + infinitive / que + subjunctive", "I'm glad …", "Me alegro = I'm glad. Me alegro mucho de verte.", [
 ("pres", "Me alegro mucho de verte.", "I'm really glad to see you."),
 ("subj", "Me alegro de que estés mejor.", "I'm glad you're better."),
 ("impsub", "Me alegré de que vinieras.", "I was glad you came."),
 ("pret", "Se alegró mucho de la noticia.", "She was really pleased with the news.")]),
("sentimientos", "a2", "Me preocupa + noun / que + subjunctive", "I'm worried about …", "Works like gustar.", [
 ("pres", "Me preocupa la salud de mi madre.", "I'm worried about my mother's health."),
 ("subj", "Me preocupa que no conteste.", "I'm worried he isn't answering."),
 ("impf", "Me preocupaba no encontrar trabajo.", "I was worried about not finding work."),
 ("imp", "No te preocupes.", "Don't worry.")]),
("sentimientos", "a1", "¡Qué + adjective / noun!", "How …! / What a …!", "¡Qué bonito! ¡Qué calor! ¡Qué bien!", [
 ("pres", "¡Qué bonito es esto!", "How beautiful this is!"),
 ("pres", "¡Qué calor hace hoy!", "It's so hot today!"),
 ("pret", "¡Qué bien la pasamos!", "What a great time we had!"),
 ("pres", "¡Qué pena!", "What a shame!")]),
("sentimientos", "a2", "Echo de menos / Extraño + noun", "I miss …", "Extrañar is more common in Latin America; echar de menos in Spain.", [
 ("pres", "Extraño mucho a mi familia.", "I miss my family a lot."),
 ("pres", "Echo de menos la comida de mi país.", "I miss the food from my country."),
 ("impf", "Te extrañaba mucho.", "I missed you a lot."),
 ("fut", "Te voy a extrañar.", "I'm going to miss you.")]),
("sentimientos", "b1", "Me da vergüenza + infinitive", "I'm embarrassed to …", "Also: me da pena (Latin America, 'I'm shy/embarrassed').", [
 ("pres", "Me da vergüenza hablar en público.", "I'm embarrassed to speak in public."),
 ("pres", "Me da pena pedirle dinero.", "I feel awkward asking him for money."),
 ("pret", "Me dio mucha vergüenza.", "I was really embarrassed."),
 ("impf", "De niño me daba vergüenza todo.", "As a child everything embarrassed me.")]),
("sentimientos", "a2", "Estoy harto de + noun / infinitive", "I'm fed up with …", "Colloquial and very common.", [
 ("pres", "Estoy harto de esperar.", "I'm fed up with waiting."),
 ("pres", "Estoy harta de este calor.", "I'm sick of this heat."),
 ("impf", "Estaba harto de su actitud.", "I was fed up with his attitude."),
 ("subj", "Estoy harto de que me interrumpas.", "I'm fed up with you interrupting me.")]),
("pasado", "a1", "Ayer + preterite", "Yesterday I …", "Finished actions at a specific time: ayer, anoche, el lunes pasado.", [
 ("pret", "Ayer fui al supermercado.", "Yesterday I went to the supermarket."),
 ("pret", "Anoche cenamos en casa de unos amigos.", "Last night we had dinner at some friends' house."),
 ("pret", "El lunes pasado empecé un curso.", "Last Monday I started a course."),
 ("pret", "¿Qué hiciste el fin de semana?", "What did you do at the weekend?")]),
("pasado", "a2", "Cuando era + adjective / noun, + imperfect", "When I was …, I used to …", "Imperfect for background and habits in the past.", [
 ("impf", "Cuando era niño, vivía en el campo.", "When I was a child, I lived in the countryside."),
 ("impf", "Cuando era joven, salía todas las noches.", "When I was young, I went out every night."),
 ("impf", "Cuando éramos estudiantes, no teníamos dinero.", "When we were students, we had no money."),
 ("impf", "Cuando tenía tu edad, trabajaba en una tienda.", "When I was your age, I worked in a shop.")]),
("pasado", "a2", "Estaba + gerund + cuando + preterite", "I was …ing when …", "Background (imperfect) interrupted by an event (preterite).", [
 ("impf", "Estaba duchándome cuando sonó el teléfono.", "I was having a shower when the phone rang."),
 ("impf", "Íbamos a la playa cuando empezó a llover.", "We were going to the beach when it started to rain."),
 ("impf", "Dormía cuando llegaste.", "I was asleep when you arrived."),
 ("impf", "Estábamos cenando cuando se fue la luz.", "We were having dinner when the power went out.")]),
("pasado", "a2", "He + participle (alguna vez / nunca / ya / todavía no)", "I have …", "Pretérito perfecto for experiences and recent events.", [
 ("perf", "¿Has estado alguna vez en Cuba?", "Have you ever been to Cuba?"),
 ("perf", "Ya he terminado el informe.", "I've already finished the report."),
 ("perf", "Todavía no he comido.", "I haven't eaten yet."),
 ("perf", "Nunca he visto la nieve.", "I've never seen snow.")]),
("pasado", "a2", "La última vez que + preterite", "The last time I …", "Also: la primera vez que …", [
 ("pret", "La última vez que la vi, estaba bien.", "The last time I saw her, she was fine."),
 ("pret", "La primera vez que viajé solo, tenía veinte años.", "The first time I travelled alone, I was twenty."),
 ("pret", "¿Cuándo fue la última vez que fuiste al médico?", "When was the last time you went to the doctor?"),
 ("fut", "Esta va a ser la última vez.", "This is going to be the last time.")]),
("pasado", "b1", "Ya había + participle + cuando …", "I had already … when …", "Pluscuamperfecto: one past action before another.", [
 ("pqp", "Cuando llegué, la película ya había empezado.", "When I arrived, the film had already started."),
 ("pqp", "Nunca había comido algo tan rico.", "I had never eaten anything so delicious."),
 ("pqp", "Me dijo que ya había pagado.", "He told me he had already paid."),
 ("pqp", "Ya habíamos salido cuando llamaste.", "We had already left when you called.")]),
("pasado", "a2", "Fue + adjective / noun", "It was …", "Fue for a finished event; era for a description.", [
 ("pret", "Fue un día increíble.", "It was an incredible day."),
 ("pret", "El viaje fue muy largo.", "The trip was very long."),
 ("impf", "La casa era grande y tenía jardín.", "The house was big and had a garden."),
 ("pret", "¿Cómo fue la entrevista?", "How did the interview go?")]),
("pasado", "a2", "Se me olvidó + noun / infinitive", "I forgot …", "Accidental se: se me olvidó, se me cayó, se me rompió.", [
 ("pret", "Se me olvidó traer el cargador.", "I forgot to bring the charger."),
 ("pret", "Se me olvidaron las llaves.", "I forgot my keys."),
 ("perf", "Se me ha olvidado tu nombre.", "I've forgotten your name."),
 ("subj", "Que no se te olvide.", "Don't forget.")]),
("pasado", "b1", "Me acuerdo de + noun / infinitive", "I remember …", "Acordarse de; also recordar (without de).", [
 ("pres", "Me acuerdo de mi primer día de colegio.", "I remember my first day at school."),
 ("pres", "¿Te acuerdas de mí?", "Do you remember me?"),
 ("pret", "No me acordé de llamarla.", "I didn't remember to call her."),
 ("imp", "Acuérdate de comprar pan.", "Remember to buy bread.")]),
]
