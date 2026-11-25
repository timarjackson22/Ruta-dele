"""B1 pronunciation and spelling top-up (17 Nov 2026), from the coverage dashboard's "Practice drops from A2 to B1:
Pronunciation" finding. Each B1 unit gets one block on the sounds and written accents its grammar brings (rule, table,
note), 4 example sentences (they feed the listen/say/stress/syllable drills), 3 fill-in items, 2 corrections and
1 multiple choice. Appended, so saved answers keep their indexes. Re-runnable.  Usage: python3 tools/content/add_pron_b1.py index.html"""
import json, re, sys
P = sys.argv[1] if len(sys.argv) > 1 else "index.html"
s = open(P, encoding="utf-8").read()
m = re.search(r"(  const LXS = )(\{.*?\});\n", s)
L = json.loads(m.group(2))

def B(t, r, h, rows, note, e, x, fix, mc):
    return dict(g={"t": t, "r": r, "h": h, "rows": rows, "n": [note]}, e=e, x=x, fix=fix, mc=mc)

ADD = {
 "Narrar en pasado": B("Pronunciación: leyó, oyó, cayó · leí, oí",
   "Verbs whose stem ends in a vowel (leer, oír, caer, creer, construir) change i to y between vowels in the indefinido (leyó, leyeron), and the stressed í of leí, leíste, oímos takes an accent.",
   ["Verb", "yo · tú", "él · ellos"],
   [["leer", "leí · leíste", "leyó · leyeron"], ["oír", "oí · oíste", "oyó · oyeron"], ["caer", "caí · caíste", "cayó · cayeron"], ["construir", "construí · construiste", "construyó · construyeron"]],
   "Say it|le-Í, le-ÍS-te: two separate vowels. Le-YÓ: the y is a consonant sound, like the y in yes.",
   [["Cuando leyó la carta, se puso a llorar.", "When she read the letter, she started to cry."], ["Oímos un ruido y salimos a la calle.", "We heard a noise and went out into the street."], ["El niño se cayó de la bicicleta, pero no se hizo daño.", "The boy fell off his bike, but he didn't hurt himself."], ["Nadie creyó su historia hasta que vieron las fotos.", "Nobody believed his story until they saw the photos."]],
   [["Ayer ella ___ (leer) el periódico en el tren.", "leyó", "Leer, él/ella: the i becomes y between vowels: leyó."], ["¿___ (oír, tú) lo que dijo el profesor?", "Oíste", "Oír, tú: oíste, with an accent on the stressed í."], ["Los niños ___ (construir) un castillo de arena.", "construyeron", "Construir, ellos: construyeron."]],
   [["El vaso se caió al suelo.", "El vaso se cayó al suelo.", "Caer, él: cayó, with y between vowels."], ["Anoche lei un libro entero.", "Anoche leí un libro entero.", "Leí: the stressed í needs an accent to separate it from the e."]],
   [["«Ellos ___ que era verdad.»", ["creyeron", "creieron", "creyieron"], 0, "Creer, ellos: creyeron (i → y between vowels)."]]),
 "El presente de subjuntivo": B("Pronunciación: el acento del subjuntivo · dé, esté",
   "Some subjunctive forms are stressed on the last syllable and take an accent: esté, estés, estén. Dé (give, subjunctive) takes an accent to tell it apart from the preposition de.",
   ["Verb", "Subjunctive", "Note"],
   [["estar", "esté · estés · esté · estemos · estéis · estén", "Accent except nosotros."], ["dar", "dé · des · dé · demos · deis · den", "Only dé (yo/él) has an accent."], ["ser · ir", "sea · vaya", "No accent."], ["enviar · continuar", "envíe · continúe", "The accent keeps í and ú stressed."]],
   "Spelling|Quiero que me dé el libro (give) · el libro de María (of): the accent changes the word.",
   [["Espero que estés bien y que tu familia esté contenta.", "I hope you're well and that your family is happy."], ["Dile que me dé su número de teléfono.", "Tell him to give me his phone number."], ["Es importante que envíes el formulario hoy.", "It's important that you send the form today."], ["Ojalá que continúe el buen tiempo este fin de semana.", "I hope the good weather continues this weekend."]],
   [["Ojalá que mañana no ___ (estar, tú) cansado.", "estés", "Estar, tú, subjunctive: estés, with an accent."], ["Pídele que te ___ (dar) la llave.", "dé", "Dar, él/ella, subjunctive: dé, with an accent (not the preposition de)."], ["Es necesario que lo ___ (enviar, usted) hoy.", "envíe", "Enviar: envíe, the í keeps its stress and its accent."]],
   [["Quiero que me de una respuesta pronto.", "Quiero que me dé una respuesta pronto.", "Dé (give, subjunctive) needs an accent; de is the preposition."], ["No creo que el jefe este en la oficina.", "No creo que el jefe esté en la oficina.", "Estar, subjunctive: esté. Este without an accent means this."]],
   [["¿Qué palabra es un verbo?", ["dé", "de", "del"], 0, "Dé with an accent is the verb dar (subjunctive); de and del are prepositions."]]),
 "Opinar, dudar, sentir": B("Pronunciación: sí y si, tú y tu, mí y mi",
   "One-syllable words don't take an accent, except to tell apart pairs with different meanings: sí (yes, himself) / si (if), tú (you) / tu (your), mí (me) / mi (my), él (he) / el (the), té (tea) / te (you, object), más (more) / mas (but, literary).",
   ["With accent", "Without accent", "Example"],
   [["sí (yes)", "si (if)", "Si puedes, dime que sí."], ["tú (you)", "tu (your)", "¿Tú crees que tu idea funciona?"], ["mí (me)", "mi (my)", "Para mí, mi barrio es el mejor."], ["él (he)", "el (the)", "Él opina que el plan es bueno."]],
   "Say it|The words with an accent are stressed in the sentence; the others lean on the next word: para MÍ · mi BA-rrio.",
   [["Para mí, el problema no es el dinero.", "For me, the problem isn't the money."], ["¿Tú qué piensas de tu nuevo trabajo?", "What do you think of your new job?"], ["Si no estás de acuerdo, dímelo.", "If you don't agree, tell me."], ["Él dice que sí, pero yo lo dudo.", "He says yes, but I doubt it."]],
   [["Para ___ (me), es una buena idea.", "mí", "After a preposition, me is mí, with an accent."], ["¿___ (you) qué opinas?", "Tú", "The pronoun tú has an accent; tu without it is your."], ["No sé ___ (if) tiene razón.", "si", "If is si, without an accent."]],
   [["Creo que tu tienes razón.", "Creo que tú tienes razón.", "The subject pronoun is tú, with an accent."], ["Para mi, el mejor plan es quedarnos.", "Para mí, el mejor plan es quedarnos.", "After para the pronoun is mí, with an accent."]],
   [["«¿Vienes?» «___, claro.»", ["Sí", "Si", "Se"], 0, "Yes is sí, with an accent."]]),
 "El imperativo": B("Pronunciación: dímelo, cómpralo, siéntate",
   "When pronouns are attached to an imperative the stress stays where it was, so the word often needs an accent: compra → cómpralo, di → dímelo, sienta → siéntate. Short forms with one pronoun (dame, ponlo) don't need one.",
   ["Imperative", "With pronouns", "Stress"],
   [["compra", "cómpralo · cómpraselo", "CÓM-pra-lo"], ["di", "dímelo", "DÍ-me-lo"], ["sienta", "siéntate", "SIÉN-ta-te"], ["da · pon", "dame · ponlo · dámelo", "DA-me (no accent) · DÁ-me-lo"]],
   "Rule|Count from the end: if the stress falls three syllables back or more, write the accent.",
   [["Siéntate aquí y cuéntame qué ha pasado.", "Sit down here and tell me what happened."], ["Si ves a Pedro, dile que me llame.", "If you see Pedro, tell him to call me."], ["Esas zapatillas son perfectas: cómpratelas.", "Those trainers are perfect: buy them."], ["Ponte la chaqueta, que hace frío.", "Put your jacket on, it's cold."]],
   [["Tengo la carta. ¡___ (dar, tú + me + la)!", "Dámela", "Da + me + la: dámela, stressed on DÁ, so it takes an accent."], ["Estás cansado: ___ (sentarse, tú).", "siéntate", "Sienta + te: siéntate, with an accent."], ["El libro es tuyo: ___ (llevar, tú + lo).", "llévalo|llévatelo", "Lleva + lo: llévalo."]],
   [["Explicamelo otra vez, por favor.", "Explícamelo otra vez, por favor.", "Explica + me + lo: the stress stays on -plí-, so it takes an accent."], ["Ponte la chaqueta y quitate la gorra.", "Ponte la chaqueta y quítate la gorra.", "Quita + te: quítate, stressed on QUÍ-, so it takes an accent. Ponte has two syllables: no accent."]],
   [["¿Qué forma está bien escrita?", ["cuéntamelo", "cuentamelo", "cuentámelo"], 0, "Cuenta + me + lo: the stress stays on CUÉN-: cuéntamelo."]]),
 "El condicional": B("Pronunciación: -ría en el condicional",
   "Every conditional form ends in stressed -ía, -ías, -íamos…, with an accent on the í: hablaría, podríamos, harían. The í and the a are said separately.",
   ["Verb", "Conditional", "Say it"],
   [["hablar", "hablaría · hablaríamos", "ha-bla-RÍ-a"], ["poder", "podría · podrían", "po-DRÍ-a"], ["hacer · decir", "haría · diría", "ha-RÍ-a · di-RÍ-a"], ["tener · salir", "tendría · saldría", "ten-DRÍ-a · sal-DRÍ-a"]],
   "Don't confuse|podría (could, would be able: conditional) and podía (could, was able: imperfect) both carry an accent on the í; the r of the future stem tells them apart.",
   [["¿Podría decirme dónde está la farmacia?", "Could you tell me where the pharmacy is?"], ["Yo en tu lugar hablaría con el director.", "If I were you, I'd talk to the director."], ["Nos encantaría vivir cerca de la playa.", "We'd love to live near the beach."], ["Dijeron que llegarían a las nueve.", "They said they'd arrive at nine."]],
   [["Yo en tu lugar no ___ (decir) nada.", "diría", "Decir → dir- + -ía: diría."], ["¿___ (poder, usted) ayudarme?", "Podría", "Poder → podr- + -ía: podría."], ["Nosotros ___ (salir) antes, pero hay mucho trabajo.", "saldríamos", "Salir → saldr- + -íamos: saldríamos."]],
   [["Me gustaria viajar a Japón.", "Me gustaría viajar a Japón.", "Conditional: gustaría, with an accent on the í."], ["Yo que tú, haria la reserva hoy.", "Yo que tú, haría la reserva hoy.", "Hacer, conditional: haría."]],
   [["¿Cuántas sílabas tiene «podría»?", ["Tres: po-drí-a", "Dos: po-dria", "Cuatro: po-d-rí-a"], 0, "The accent separates í and a: po-drí-a."]]),
 "Medio ambiente y conectores": B("Ortografía: porque, por qué, porqué, por que",
   "Porque (because) gives a reason. Por qué (why) asks, in direct and indirect questions. El porqué (the reason) is a noun. Por que is rare: preposition + relative (la razón por (la) que).",
   ["Form", "Meaning", "Example"],
   [["porque", "because", "Reciclo porque es importante."], ["por qué", "why?", "¿Por qué no reciclas? · No sé por qué."], ["el porqué", "the reason", "Explícame el porqué de tu decisión."], ["por que", "for which", "Esa es la razón por (la) que lucho."]],
   "Say it|Porque is stressed on POR-; por qué is stressed on QUÉ.",
   [["¿Por qué no usamos más el transporte público?", "Why don't we use public transport more?"], ["Reciclamos porque queremos un planeta más limpio.", "We recycle because we want a cleaner planet."], ["Nadie entiende el porqué de esa decisión.", "Nobody understands the reason for that decision."], ["No sé por qué hace tanto calor este año.", "I don't know why it's so hot this year."]],
   [["¿___ no apagas las luces?", "Por qué", "Direct question: por qué, two words and an accent."], ["Ahorro agua ___ hay sequía.", "porque", "Reason: porque, one word."], ["Explícame el ___ de tu respuesta.", "porqué", "The reason (a noun): el porqué."]],
   [["No entiendo porque contaminan tanto.", "No entiendo por qué contaminan tanto.", "Indirect question: por qué, two words with an accent."], ["Uso la bici por qué es más sano.", "Uso la bici porque es más sano.", "A reason: porque, one word, no accent."]],
   [["«Me voy ___ es tarde.»", ["porque", "por qué", "porqué"], 0, "A reason: porque."]]),
 "Estilo indirecto y relativos": B("Ortografía: que y qué, cuál, dónde en el estilo indirecto",
   "Question words keep their accent when a question is reported: Me preguntó qué quería / dónde vivía / cuándo volvía. The relative que and the linking que (dijo que…) have none.",
   ["Direct", "Reported", "Note"],
   [["«¿Qué quieres?»", "Me preguntó qué quería.", "Question word: accent."], ["«Estoy cansada.»", "Dijo que estaba cansada.", "Linking que: no accent."], ["«¿Dónde vives?»", "Quería saber dónde vivía.", "Accent kept."], ["«¿Vienes?»", "Me preguntó si iba.", "Yes/no question: si, no accent."]],
   "Say it|Qué, dónde, cuál are stressed; que and si are not: me preguntó QUÉ quería · dijo que es-TA-ba.",
   [["Me preguntó qué hacía los fines de semana.", "She asked me what I did at the weekend."], ["Le expliqué que no podía ir a la reunión.", "I explained to him that I couldn't go to the meeting."], ["No me dijo cuál era su número de habitación.", "He didn't tell me what his room number was."], ["Quería saber si había plazas libres.", "She wanted to know if there were places left."]],
   [["Me preguntó ___ hora era.", "qué", "Reported question with a question word: qué, with an accent."], ["Dijo ___ llegaría tarde.", "que", "Linking que after dijo: no accent."], ["Le pregunté ___ vivía, y me dijo que en Colón.", "dónde", "Reported question: dónde, with an accent."]],
   [["Me preguntó que quería comer.", "Me preguntó qué quería comer.", "Reported question: qué keeps its accent."], ["Nos dijo qué no podía venir.", "Nos dijo que no podía venir.", "Linking que (dijo que…): no accent."]],
   [["«Me preguntó ___ me llamaba.»", ["cómo", "como", "que"], 0, "Reported question: cómo, with an accent."]]),
}
n = 0
for title, x in ADD.items():
    u = next(u for u in L["b1"] if u["t"] == title)
    if any(g["t"] == x["g"]["t"] for g in u.get("g", [])): continue
    assert all(len(i) == 3 for i in x["x"] + x["fix"]) and all(len(i) == 4 for i in x["mc"]), title
    u.setdefault("g", []).append(x["g"])
    for k in ("e", "x", "fix", "mc"): u.setdefault(k, []).extend(x[k])
    n += 1
s = s[:m.start(2)] + json.dumps(L, ensure_ascii=False, separators=(",", ":")) + s[m.end(2):]
open(P, "w", encoding="utf-8").write(s)
print("added", n, "blocks")
