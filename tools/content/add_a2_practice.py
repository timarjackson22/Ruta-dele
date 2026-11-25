"""A2 practice top-up (17 Nov 2026), from the coverage dashboard's "Practice drops from A1 to A2" findings (grammar,
pronunciation). A2 has 7 units against A1's 10, so each A2 unit gets one pronunciation-and-spelling block tied to its
grammar (rule, table, notes), 3 example sentences (they feed the listen/say/stress drills), and 5 fill-in, 4 correction
and 2 multiple-choice items. Appended, so saved answers keep their indexes. Re-runnable: a block already present is skipped.
Usage: python3 tools/content/add_a2_practice.py index.html"""
import json, re, sys
P = sys.argv[1] if len(sys.argv) > 1 else "index.html"
s = open(P, encoding="utf-8").read()
m = re.search(r"(  const LXS = )(\{.*?\});\n", s)
L = json.loads(m.group(2))

ADD = {
 "El pretérito indefinido": dict(
  g={"t": "Pronunciación: el acento que cambia el tiempo", "r": "Regular yo and él/ella forms of the indefinido are stressed on the last syllable and carry an accent; without it, it is another tense or person. Irregular forms with a special stem have no accent.",
     "h": ["Without accent", "With accent", "Why"],
     "rows": [["hablo (I speak, present)", "habló (he spoke)", "Stress on -ló: written accent."],
              ["llegue (that I arrive, subjunctive)", "llegué (I arrived)", "Stress on -gué: written accent."],
              ["compro (I buy)", "compró (she bought)", "The accent marks the past."],
              ["fue · fui · vio · dio", "—", "One-syllable forms never take an accent."],
              ["tuvo · hizo · puso · dijo", "—", "Irregular stems: stress on the stem, no accent."]],
     "n": ["Say it|HA-blo (now) and ha-BLÓ (then): read the pairs aloud and exaggerate the stress.",
           "In the exam|A missing accent on the indefinido counts as a spelling mistake in DELE A2 writing, and can change who did what."]},
  e=[["Ayer mi hermano llegó tarde y cenó solo.", "Yesterday my brother arrived late and had dinner alone."],
     ["Yo trabajo en casa, pero el lunes trabajé en la oficina.", "I work at home, but on Monday I worked at the office."],
     ["¿Quién fue al mercado? Fui yo.", "Who went to the market? It was me."]],
  x=[["Ayer Ana ___ (comprar) un vestido nuevo.", "compró", "Él/ella, regular -ar verb in the indefinido: compró, with an accent on the last syllable."],
     ["El lunes yo ___ (llegar) a las nueve.", "llegué", "Yo form of llegar: g → gu before -é, and the accent: llegué."],
     ["¿Quién ___ (hacer) la cena anoche?", "hizo", "Hacer is irregular: hizo, with z and no accent."],
     ["Mis padres ___ (ir) a Panamá en 2019.", "fueron", "Ir and ser share the indefinido: fueron."],
     ["Tú ___ (decir) la verdad, ¿no?", "dijiste", "Decir has the stem dij-: dijiste."]],
  fix=[["Ayer mi jefe hablo con todos los clientes.", "Ayer mi jefe habló con todos los clientes.", "Past, él form: habló needs the accent. «Hablo» is I speak (present)."],
       ["Anoche yo cené y despues vi una película.", "Anoche yo cené y después vi una película.", "«Después» is stressed on -pués and ends in -s: it takes an accent."],
       ["El sábado fué a la playa.", "El sábado fue a la playa.", "One-syllable forms (fue, fui, dio, vio) never take an accent."],
       ["Yo pagé la cuenta del restaurante.", "Yo pagué la cuenta del restaurante.", "Pagar → pagué: g becomes gu before e to keep the hard g sound."]],
  mc=[["«Hablo» y «habló»: ¿cuál significa «he spoke»?", ["habló", "hablo", "Son iguales"], 0, "The accent moves the stress to the end and marks the past: habló = he/she spoke. Hablo = I speak."],
      ["¿Qué forma lleva tilde?", ["comí", "fui", "vio"], 0, "Comí is stressed on the last syllable and ends in a vowel. Fui and vio have one syllable: no accent."]]),
 "El pretérito imperfecto": dict(
  g={"t": "Pronunciación: -ía, dos vocales que no se juntan", "r": "In -er and -ir imperfect endings (-ía, -ías, -íamos, -ían) the í is stressed and pronounced apart from the a: it always carries an accent. -ar endings (-aba) have none, except nosotros (-ábamos).",
     "h": ["Verb", "Imperfecto", "Say it"],
     "rows": [["tener", "tenía · teníamos", "te-NÍ-a (three syllables)"],
              ["vivir", "vivía · vivían", "vi-VÍ-a"],
              ["hablar", "hablaba · hablábamos", "ha-BLA-ba · ha-BLÁ-ba-mos"],
              ["ser · ir", "era · iba", "E-ra · I-ba (no accent)"],
              ["ver", "veía", "ve-Í-a"]],
     "n": ["Hiatus|The accent on í breaks the diphthong: «tenia» would be read as te-NIA in two syllables.",
           "Nosotros|-ábamos is stressed on the third syllable from the end, so it always takes an accent: estábamos, íbamos, éramos."]},
  e=[["Cuando era pequeña, vivía en un pueblo cerca del mar.", "When I was little, I lived in a village near the sea."],
     ["Todos los veranos íbamos a casa de mis abuelos.", "Every summer we used to go to my grandparents' house."],
     ["Mi padre leía el periódico mientras desayunábamos.", "My father read the newspaper while we had breakfast."]],
  x=[["De niño yo ___ (tener) un perro.", "tenía", "-er verb, imperfect: tenía, with an accent on the í."],
     ["Nosotros ___ (estar) muy cansados.", "estábamos", "Nosotros -ar form: estábamos, always with an accent."],
     ["Antes mis tíos ___ (vivir) en Colón.", "vivían", "-ir verb, imperfect, ellos: vivían."],
     ["Cuando ___ (ser, yo) joven, jugaba al fútbol.", "era", "Ser is irregular: era, no accent."],
     ["Los domingos ___ (ir, nosotros) a misa.", "íbamos", "Ir: íbamos, with an accent on the first í."]],
  fix=[["Cuando era niño, comia mucho arroz.", "Cuando era niño, comía mucho arroz.", "The imperfect ending -ía needs the accent: comía."],
       ["Nosotros siempre estabamos en casa.", "Nosotros siempre estábamos en casa.", "Nosotros -ar imperfect: estábamos, with an accent."],
       ["Mi abuela sabia cocinar muy bien.", "Mi abuela sabía cocinar muy bien.", "Without an accent «sabia» is the adjective wise; the verb is sabía."],
       ["De pequeños íbamos a la playa y jugabámos todo el día.", "De pequeños íbamos a la playa y jugábamos todo el día.", "The accent goes on the stressed syllable, -gá-: jugábamos."]],
  mc=[["¿Cuántas sílabas tiene «tenía»?", ["Tres: te-ní-a", "Dos: te-nia", "Cuatro: te-n-í-a"], 0, "The accent separates i and a into two syllables: te-ní-a."],
      ["¿Qué forma está bien escrita?", ["vivíamos", "viviamos", "vivíamós"], 0, "Vivíamos: the stressed í carries the accent; no other accent."]]),
 "El pretérito perfecto": dict(
  g={"t": "Pronunciación: la h muda y el enlace", "r": "The h in haber (he, has, ha, hemos, han) is silent, so the words join: «lo he hecho» sounds like lo-e-E-cho. Vowels that meet across words run together.",
     "h": ["Written", "Said", "Note"],
     "rows": [["He hecho", "e-E-cho", "Both h silent."],
              ["Ha ido", "a-I-do", "One smooth sound, no pause."],
              ["Lo he visto", "lo-e-BIS-to", "b and v sound the same."],
              ["Hemos hablado", "E-mo-sa-BLA-do", "The s links to the next vowel."],
              ["Ya han llegado", "ya-an-ye-GA-do", "ll sounds like y in most regions."]],
     "n": ["Spelling|Because h is silent, learners drop it in writing: «e comido» is wrong, it is «he comido». Remember ha (has) vs a (to).",
           "Listening|In DELE A2 listening, «ha ido» and «a ido» can sound alike: only the context tells you, and only «ha ido» is correct."]},
  e=[["Hoy he hablado con mi jefa por teléfono.", "Today I have spoken with my boss on the phone."],
     ["¿Has estado alguna vez en Bocas del Toro?", "Have you ever been to Bocas del Toro?"],
     ["Todavía no hemos hecho los deberes.", "We still haven't done the homework."]],
  x=[["Este año ___ (yo, viajar) mucho.", "he viajado", "Pretérito perfecto: he + participle, with a silent h."],
     ["¿___ (tú, ver) la nueva película?", "Has visto", "Ver has an irregular participle: visto."],
     ["Mis amigos todavía no ___ (llegar).", "han llegado", "Ellos: han + llegado."],
     ["Esta mañana ___ (nosotros, hacer) la compra.", "hemos hecho", "Hacer → hecho (irregular participle)."],
     ["Mi hermana ___ (escribir) un libro.", "ha escrito", "Escribir → escrito (irregular participle)."]],
  fix=[["Hoy e comido paella.", "Hoy he comido paella.", "The h of haber is silent but written: he comido."],
       ["Mi madre a llamado tres veces.", "Mi madre ha llamado tres veces.", "«Ha» (has) is the verb; «a» is the preposition to."],
       ["¿Has escribido el correo?", "¿Has escrito el correo?", "Escribir has an irregular participle: escrito."],
       ["Nunca he vuelvido a ese hotel.", "Nunca he vuelto a ese hotel.", "Volver → vuelto (irregular participle)."]],
  mc=[["«Ya ha ___ a casa.»", ["ido", "hido", "ído"], 0, "Ir → ido: no h and no accent."],
      ["¿Cómo suena «lo he hecho»?", ["lo-e-E-cho", "lo-he-HE-cho, con h", "lo-je-JE-cho"], 0, "The h is silent and the vowels link: lo-e-E-cho."]]),
 "Ropa y comparaciones": dict(
  g={"t": "Pronunciación: r y rr", "r": "Spanish has two r sounds: a single tap (pero, caro) and a trill (perro, carro). Write rr between vowels for the trill; at the start of a word, and after l, n or s, a single r is already trilled.",
     "h": ["Tap (one r)", "Trill (rr or r)", "Meaning"],
     "rows": [["pero", "perro", "but · dog"],
              ["caro", "carro", "expensive · car (LatAm)"],
              ["coral", "corral", "coral · farmyard"],
              ["—", "ropa · rojo · regalo", "Initial r is always trilled."],
              ["—", "Enrique · alrededor · Israel", "After n, l, s: one r, trilled."]],
     "n": ["Practise|Start the trill from a tap: «pero, pero, perro». Say «tr» fast (tres, otro) to feel the tongue tip.",
           "Clothes words|ropa, rebajas, corbata, camisa de rayas, marrón: the r is everywhere in a clothes shop."]},
  e=[["Esta corbata roja es más cara que la marrón.", "This red tie is more expensive than the brown one."],
     ["En las rebajas compré una camisa de rayas.", "In the sales I bought a striped shirt."],
     ["El carro de Enrique es tan rápido como el mío.", "Enrique's car is as fast as mine."]],
  x=[["Busco una camisa de ___ (stripes).", "rayas", "Rayas starts with r: trilled, and written with a single r."],
     ["Este vestido es ___ (expensive) para mí.", "caro", "Caro (expensive) has a single tapped r; carro is a car."],
     ["Me encantan tus zapatos ___ (red).", "rojos", "Rojo agrees with zapatos: rojos."],
     ["La falda azul es ___ (prettier) que la verde.", "más bonita", "Comparison: más + adjective + que, agreeing with falda."],
     ["Mi chaqueta es ___ (older) que la tuya.", "más vieja|más antigua", "Más vieja (más antigua): más + adjective."]],
  fix=[["En las rrebajas todo es más barato.", "En las rebajas todo es más barato.", "Initial r is already trilled: never write rr at the start of a word."],
       ["Me he comprado una corbata marón.", "Me he comprado una corbata marrón.", "Marrón has a trill between vowels: rr."],
       ["Este abrigo es más mejor que el otro.", "Este abrigo es mejor que el otro.", "Mejor already means better: no más."],
       ["Tengo tan camisas como mi hermano.", "Tengo tantas camisas como mi hermano.", "Before a noun use tanto/a/os/as, agreeing: tantas camisas."]],
  mc=[["¿Qué palabra se escribe con rr?", ["perro (dog)", "ropa (clothes)", "Enrique"], 0, "Trill between vowels is written rr. Ropa and Enrique have a trilled single r."],
      ["«Pero» y «perro»: ¿qué significa «perro»?", ["dog", "but", "expensive"], 0, "Perro, with the trill, is dog; pero, with a tap, is but."]]),
 "La salud": dict(
  g={"t": "Pronunciación: g, j y la «g suave»", "r": "J, and g before e or i, are a throaty h sound: jarabe, gente, alergia. G before a, o, u or a consonant (garganta, gotas, gripe), and gu before e or i (guía), is a soft g. Gü keeps the u sound: pingüino.",
     "h": ["Sound", "Spelling", "Health words"],
     "rows": [["Strong (like h)", "j · ge · gi", "jarabe · ojo · urgencias · alergia"],
              ["Soft g", "ga · go · gu · gr · gue · gui", "garganta · gotas · guantes · gripe"],
              ["g + u sounded", "güe · güi", "pingüino · vergüenza"],
              ["b = v", "b · v", "vómitos · brazo · vacuna: same sound"],
              ["Silent h", "h", "hospital · herida · hinchado"]],
     "n": ["Regional|In Panama and the Caribbean the j is soft, like an English h; in central Spain it is stronger.",
           "At the doctor's|Me duele la garganta · Tengo alergia · Necesito un jarabe para la tos: say each one aloud."]},
  e=[["Me duele la garganta y tengo un poco de fiebre.", "My throat hurts and I have a bit of a fever."],
     ["El médico me ha recetado un jarabe y unas gotas para los ojos.", "The doctor has prescribed me a syrup and some eye drops."],
     ["Tengo alergia al polen, por eso estornudo mucho.", "I'm allergic to pollen, so I sneeze a lot."]],
  x=[["Me duele la ___ (throat).", "garganta", "Garganta: soft g before a."],
     ["Tome este ___ (syrup) tres veces al día.", "jarabe", "Jarabe: j, the throaty h sound."],
     ["Tengo ___ (allergy) a los gatos.", "alergia", "Alergia: g before i is the strong sound."],
     ["Si te duele mucho, ve a ___ (A&E).", "urgencias", "Urgencias: ge/gi is the strong sound, spelled g here."],
     ["Me he roto el ___ (arm).", "brazo", "Brazo: b, the same sound as v in Spanish."]],
  fix=[["Me duele mucho la garjanta.", "Me duele mucho la garganta.", "Soft g before a: garganta."],
       ["El médico me dio un garabe para la tos.", "El médico me dio un jarabe para la tos.", "Jarabe is spelled with j."],
       ["Tengo alerjia al marisco.", "Tengo alergia al marisco.", "Alergia is spelled with g: g before i already has the strong sound."],
       ["Me duelen los ojos y tengo bómitos.", "Me duelen los ojos y tengo vómitos.", "Vómitos is spelled with v (b and v sound the same, so learn the spelling)."]],
  mc=[["¿En qué palabra la g suena como la j?", ["gente", "gota", "guantes"], 0, "G before e or i sounds like j: gente. Before a, o, u it is soft."],
      ["«Me ___ la cabeza.»", ["duele", "duelen", "duelo"], 0, "Doler works like gustar: the thing that hurts is the subject. La cabeza (singular) → duele."]]),
 "Viajes y transporte": dict(
  g={"t": "Pronunciación: la entonación de las preguntas", "r": "Yes/no questions rise at the end (¿Sale el tren a las ocho? ↗). Questions with a question word fall (¿A qué hora sale el tren? ↘). Spanish marks both ends: ¿…?",
     "h": ["Type", "Example", "Tune"],
     "rows": [["Yes/no question", "¿Hay un autobús al aeropuerto?", "Rises at the end ↗"],
              ["Question word", "¿Dónde está la estación?", "Falls at the end ↘"],
              ["Statement", "El vuelo sale a las diez.", "Falls ↘"],
              ["Choice", "¿Ida o ida y vuelta?", "Rises on ida ↗, falls on vuelta ↘"],
              ["Polite request", "¿Me puede decir dónde está el andén?", "Rises ↗"]],
     "n": ["Accents in questions|Question words take an accent in questions, direct or indirect: ¿cuándo?, ¿dónde?, ¿qué?; No sé dónde está.",
           "Same words, different meaning|«El tren sale a las ocho.» ↘ is information; «¿El tren sale a las ocho?» ↗ is a question."]},
  e=[["¿A qué hora sale el próximo autobús para David?", "What time does the next bus to David leave?"],
     ["¿Tiene un billete de ida y vuelta?", "Do you have a return ticket?"],
     ["Perdone, ¿sabe dónde está la parada del metro?", "Excuse me, do you know where the metro stop is?"]],
  x=[["¿___ sale el tren? A las nueve.", "Cuándo|A qué hora", "Question about time: ¿cuándo? or ¿a qué hora?, with an accent."],
     ["No sé ___ está el andén 3.", "dónde", "Indirect question: dónde keeps its accent."],
     ["¿___ cuesta el billete?", "Cuánto", "How much: ¿cuánto?, with an accent."],
     ["Quiero un billete de ida y ___.", "vuelta", "Return ticket: billete de ida y vuelta."],
     ["El avión ___ (aterrizar) a las seis.", "aterriza|aterrizó|aterrizará", "Aterrizar: aterriza (present), aterrizó (past) or aterrizará (future)."]],
  fix=[["¿Donde está la estación de autobuses?", "¿Dónde está la estación de autobuses?", "Question words take an accent: dónde."],
       ["Perdone, no sé cuando sale el vuelo.", "Perdone, no sé cuándo sale el vuelo.", "Indirect questions keep the accent: cuándo."],
       ["A qué hora llega el tren?", "¿A qué hora llega el tren?", "Spanish opens questions with ¿."],
       ["¿Que andén es para Colón?", "¿Qué andén es para Colón?", "Question word qué: with an accent."]],
  mc=[["¿Cómo suena el final de «¿Dónde está el hotel?»?", ["Baja ↘", "Sube ↗", "Igual"], 0, "Questions with a question word fall at the end."],
      ["¿Cómo suena el final de «¿Hay wifi en el tren?»?", ["Sube ↗", "Baja ↘", "Igual"], 0, "Yes/no questions rise at the end."]]),
 "El trabajo y el futuro": dict(
  g={"t": "Pronunciación: el acento del futuro", "r": "The future is stressed on the ending: trabajaré, trabajarás, trabajará, trabajarán all take an accent. Only nosotros (trabajaremos) has none. The same endings go on irregular stems: tendré, podrás, haremos.",
     "h": ["Person", "Future", "Stress"],
     "rows": [["yo", "trabajaré · tendré", "tra-ba-ja-RÉ"],
              ["tú", "trabajarás · podrás", "tra-ba-ja-RÁS"],
              ["él / ella / usted", "trabajará · hará", "tra-ba-ja-RÁ"],
              ["nosotros", "trabajaremos · saldremos", "tra-ba-ja-RE-mos (no accent)"],
              ["ellos / ustedes", "trabajarán · vendrán", "tra-ba-ja-RÁN"]],
     "n": ["Don't confuse|trabajara (subjunctive, no accent) vs trabajará (future): the accent changes the tense.",
           "Job talk|Trabajaré en una empresa grande; Ganaré más; Tendré mi propio negocio: plans and predictions use the future."]},
  e=[["El año que viene trabajaré en una empresa de logística.", "Next year I'll work at a logistics company."],
     ["Con este curso tendrás más oportunidades.", "With this course you'll have more opportunities."],
     ["Mañana hablaremos con el director.", "Tomorrow we'll talk to the director."]],
  x=[["El próximo año yo ___ (buscar) otro trabajo.", "buscaré", "Future, yo: buscaré, with an accent."],
     ["¿___ (tú, poder) venir a la reunión?", "Podrás", "Poder → podr- + -ás: podrás."],
     ["Mis compañeros ___ (tener) vacaciones en julio.", "tendrán", "Tener → tendr- + -án: tendrán."],
     ["Nosotros ___ (hacer) la entrevista el lunes.", "haremos", "Hacer → har- + -emos: haremos, no accent."],
     ["La empresa ___ (abrir) una oficina en Panamá.", "abrirá", "Future, ella: abrirá."]],
  fix=[["Mañana trabajare desde casa.", "Mañana trabajaré desde casa.", "Future, yo: trabajaré needs the accent."],
       ["El jefe hablara con nosotros el viernes.", "El jefe hablará con nosotros el viernes.", "Future: hablará, with an accent (hablara is a subjunctive form)."],
       ["Nosotros saldrémos temprano.", "Nosotros saldremos temprano.", "Nosotros future forms have no accent: saldremos."],
       ["Mis hijos venirán en diciembre.", "Mis hijos vendrán en diciembre.", "Venir has the stem vendr-: vendrán."]],
  mc=[["¿Qué forma del futuro NO lleva tilde?", ["trabajaremos", "trabajaré", "trabajarán"], 0, "Only nosotros: trabajaremos."],
      ["«El lunes ___ la nueva directora.»", ["llegará", "llegara", "llegaría"], 0, "A future arrival: llegará (future). Llegara is subjunctive; llegaría is conditional."]]),
}

# more example sentences (they feed the listen, say, stress and syllable drills): added once each
MORE_E = {
 "El pretérito indefinido": [["El sábado fuimos al cine y después cenamos en el centro.", "On Saturday we went to the cinema and then had dinner in the centre."], ["¿Qué hiciste el fin de semana?", "What did you do at the weekend?"], ["Mi abuelo nació en Chitré y trabajó toda su vida en el campo.", "My grandfather was born in Chitré and worked in the countryside all his life."], ["Llegué al aeropuerto a las seis y el avión salió a las ocho.", "I got to the airport at six and the plane left at eight."]],
 "El pretérito imperfecto": [["En mi colegio había un patio muy grande con árboles.", "In my school there was a very big playground with trees."], ["Mi madre siempre cantaba mientras cocinaba.", "My mother always sang while she cooked."], ["Antes no teníamos internet en casa.", "We didn't use to have internet at home."], ["Hacía mucho calor y todos estábamos en la piscina.", "It was very hot and we were all in the pool."]],
 "El pretérito perfecto": [["Esta semana he trabajado mucho y estoy cansada.", "This week I've worked a lot and I'm tired."], ["¿Alguna vez has probado el sancocho?", "Have you ever tried sancocho?"], ["Mis padres nunca han viajado a Europa.", "My parents have never travelled to Europe."], ["Ya he leído el libro que me prestaste.", "I've already read the book you lent me."]],
 "Ropa y comparaciones": [["Estos zapatos son más cómodos que los otros, pero son más caros.", "These shoes are more comfortable than the others, but they are more expensive."], ["¿Me puedo probar esta chaqueta en una talla más grande?", "Can I try this jacket on in a bigger size?"], ["Mi hermana es la más alta de la familia.", "My sister is the tallest in the family."], ["Esta tienda tiene tantas ofertas como la de enfrente.", "This shop has as many offers as the one opposite."]],
 "La salud": [["Tienes que descansar y beber mucha agua.", "You have to rest and drink lots of water."], ["Me duelen las piernas porque ayer corrí diez kilómetros.", "My legs hurt because I ran ten kilometres yesterday."], ["El médico me ha dicho que no puedo comer sal.", "The doctor has told me I can't eat salt."], ["Si tienes fiebre, es mejor quedarte en casa.", "If you have a fever, it's better to stay at home."]],
 "Viajes y transporte": [["El tren sale del andén cuatro dentro de diez minutos.", "The train leaves from platform four in ten minutes."], ["Perdí el autobús y tuve que tomar un taxi.", "I missed the bus and had to take a taxi."], ["¿Cuánto tarda el viaje de Panamá a Boquete?", "How long does the journey from Panama City to Boquete take?"], ["Prefiero viajar de noche porque hay menos tráfico.", "I prefer to travel at night because there is less traffic."]],
 "El trabajo y el futuro": [["Dentro de cinco años tendré mi propia empresa.", "In five years I'll have my own company."], ["Mañana empezaré a buscar trabajo en internet.", "Tomorrow I'll start looking for work online."], ["¿Qué harás cuando termines la universidad?", "What will you do when you finish university?"], ["En mi trabajo nuevo ganaré más, pero viajaré menos.", "In my new job I'll earn more, but I'll travel less."]],
}
# three more fill-in items per unit (grammar practice at A2 keeps pace with A1): added once each
MORE_X = {
 "El pretérito indefinido": [["El año pasado ___ (viajar, nosotros) a Costa Rica.", "viajamos", "Nosotros, -ar verb: viajamos (same form as the present; the time phrase tells you it is past)."], ["¿Dónde ___ (estar, tú) ayer por la tarde?", "estuviste", "Estar has the stem estuv-: estuviste."], ["Ellos no ___ (poder) venir a la boda.", "pudieron", "Poder has the stem pud-: pudieron."]],
 "El pretérito imperfecto": [["Cuando ___ (vivir, yo) en Colón, iba a la playa cada fin de semana.", "vivía", "Background or habit in the past: imperfect, vivía."], ["Mientras mi padre ___ (cocinar), nosotros poníamos la mesa.", "cocinaba", "Two actions in progress at the same time: imperfect, cocinaba."], ["De pequeño, mi hermano ___ (ver) dibujos animados todas las mañanas.", "veía", "Ver in the imperfect: veía."]],
 "El pretérito perfecto": [["Esta semana ___ (llover) mucho.", "ha llovido", "A period that includes now (esta semana): pretérito perfecto, ha llovido."], ["¿Ya ___ (poner, tú) la lavadora?", "has puesto", "Poner → puesto (irregular participle)."], ["Nunca ___ (romper, yo) un plato.", "he roto", "Romper → roto (irregular participle)."]],
 "Ropa y comparaciones": [["Esta tienda es ___ (worse) que la otra.", "peor", "Irregular comparative: malo → peor."], ["Mi abuelo es ___ (older) que mi abuela.", "mayor", "For people's age: mayor (older), not más viejo."], ["Estos pantalones me quedan ___ (too) grandes.", "demasiado", "Too + adjective: demasiado grandes (no agreement)."]],
 "La salud": [["A mi madre le ___ (doler) las rodillas.", "duelen", "Doler agrees with what hurts: las rodillas → duelen."], ["Usted ___ (deber) dormir más.", "debe", "Advice: deber + infinitive."], ["Hace tres días que ___ (estar, yo) resfriado.", "estoy", "Hace + time + que + present: an ongoing state."]],
 "Viajes y transporte": [["Prefiero ir ___ tren porque es más rápido.", "en", "Means of transport: en tren, en autobús (a pie is the exception)."], ["El vuelo sale ___ las diez y media.", "a", "Time of an event: a las…"], ["Voy ___ aeropuerto en taxi.", "al", "A + el = al."]],
 "El trabajo y el futuro": [["Si no llueve, mañana ___ (ir, nosotros) a la playa.", "iremos", "Si + present, then future: iremos."], ["Creo que el examen ___ (ser) difícil.", "será", "Prediction: future of ser, será."], ["El año que viene ___ (haber) más trabajo en el puerto.", "habrá", "Haber, future: habrá."]],
}

n = 0
for title, x in ADD.items():
    u = next(u for u in L["a2"] if u["t"] == title)
    if any(g["t"] == x["g"]["t"] for g in u.get("g", [])): continue
    assert all(len(i) == 3 for i in x["x"] + x["fix"]) and all(len(i) == 4 for i in x["mc"]), title
    u.setdefault("g", []).append(x["g"])
    for k in ("e", "x", "fix", "mc"): u.setdefault(k, []).extend(x[k])
    n += 1
for title, xx in MORE_X.items():
    u = next(u for u in L["a2"] if u["t"] == title); have = {i[0] for i in u.get("x", [])}
    for it in xx:
        assert len(it) == 3, it
        if it[0] not in have: u.setdefault("x", []).append(it); n += 1
for title, ee in MORE_E.items():
    u = next(u for u in L["a2"] if u["t"] == title); have = {e[0] for e in u.get("e", [])}
    for e in ee:
        if e[0] not in have: u.setdefault("e", []).append(e); n += 1
s = s[:m.start(2)] + json.dumps(L, ensure_ascii=False, separators=(",", ":")) + s[m.end(2):]
open(P, "w", encoding="utf-8").write(s)
print("added", n, "blocks")
