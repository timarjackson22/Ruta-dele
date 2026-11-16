"""Curriculum register builder (DELE Curriculum Coverage dashboard, requested 15 Nov 2026).

Writes tools/curric/register.json: official sources, competencies, learning outcomes, DELE task families and the
Master Topic-to-Skills Mapping defaults. tools/curric/patch_curric.py embeds it in index.html as <script id="curric-data">.
Coverage is NOT computed here: the page computes it live from the real lessons, guides, exams and activities.

Honesty rules (see METRICS.md):
- Outcome texts are short paraphrases written for this app, not quotations. Each cites its source and section/page.
- "status" says how far a row has been checked: "source-checked" = the cited section/page was opened on `rev`;
  "pending" = written from the source's known structure but not yet compared line by line by a reviewer.
- Mastery criteria and topic weights are this app's internal design targets, not official requirements.
"""
import json, os, re, datetime
T = os.path.dirname(os.path.abspath(__file__))
TODAY = "2026-11-15"
LV = ["a1", "a2", "b1", "b2", "c1", "c2"]

SOURCES = {
  "cefr": {"name": "Council of Europe (2020). CEFR – Companion volume", "short": "CEFR CV 2020", "url": "https://rm.coe.int/16809ea0d4",
           "version": "2020", "checked": TODAY, "review_months": 24, "note": "Descriptor scale names and page numbers checked against the table of contents."},
  "pcic": {"name": "Instituto Cervantes (2006). Plan curricular del Instituto Cervantes – Niveles de referencia para el español", "short": "PCIC", "url": "https://cvc.cervantes.es/ensenanza/biblioteca_ele/plan_curricular/",
           "version": "2006", "checked": None, "review_months": 24, "note": "The PCIC site could not be opened from the build environment, so PCIC rows are pending a line-by-line check against the inventories."},
  "dele-a1": {"name": "Instituto Cervantes. Guía del examen DELE A1 (v2020)", "short": "DELE A1 guide", "url": "https://agenda.cervantes.es/sites/default/files/DELE_A1_v2020_Guia-de-examen.pdf", "version": "v2020", "checked": TODAY, "review_months": 12},
  "dele-a2": {"name": "Instituto Cervantes. Guía del examen DELE A2 (v2020, ed. 2022)", "short": "DELE A2 guide", "url": "https://agenda.cervantes.es/sites/default/files/DELE_A2_v2020_Gu%C3%ADa_de_examen_0.pdf", "version": "v2020", "checked": TODAY, "review_months": 12},
  "dele-b1": {"name": "Instituto Cervantes. Guía del examen DELE B1", "short": "DELE B1 guide", "url": "https://agenda.cervantes.es/sites/default/files/guia_examen_dele_b1_1.pdf", "version": "2014", "checked": TODAY, "review_months": 12},
  "dele-b2": {"name": "Instituto Cervantes. Guía del examen DELE B2", "short": "DELE B2 guide", "url": "https://agenda.cervantes.es/sites/default/files/guia_examen_dele_b2_0.pdf", "version": "2014", "checked": TODAY, "review_months": 12},
  "dele-c1": {"name": "Instituto Cervantes. Cuadro de especificaciones del DELE C1 (from April 2024)", "short": "DELE C1 specs 2024", "url": "https://formacion.icervantes.org/pluginfile.php/2524474/mod_resource/content/8/Cuadro%20de%20especificaciones%20DELE%20C1%20%282024%29.pdf", "version": "2024", "checked": TODAY, "review_months": 12},
  "dele-c2": {"name": "Instituto Cervantes. Guía del examen DELE C2 (2014)", "short": "DELE C2 guide 2014", "url": "https://agenda.cervantes.es/sites/default/files/guia_examen_dele_c2.pdf", "version": "2014", "checked": TODAY, "review_months": 12,
              "superseded_by": {"name": "Guía del examen DELE C2 (2024)", "url": "https://examenes.cervantes.es/sites/default/files/Guia_examen_dele_C2_2024_1.pdf", "note": "A 2024 C2 exam (with mediation, renamed papers) replaced the 2014 format; the 2024 guide could not be opened from the build environment. C2 task rows need reassessment."}},
}

COMP = [  # id, name, kind (r = receptive, p = productive, k = knowledge, x = cross)
  ["lis", "Listening comprehension", "r"], ["rea", "Reading comprehension", "r"], ["wex", "Written expression", "p"], ["wint", "Written interaction", "p"],
  ["oex", "Oral expression", "p"], ["oint", "Oral interaction", "p"], ["pro", "Pronunciation and phonological control", "p"], ["gra", "Grammar", "k"],
  ["voc", "Vocabulary", "k"], ["pra", "Pragmatic competence", "x"], ["dis", "Discourse competence", "x"], ["med", "Mediation", "x"]]

# ---------- CEFR CV outcomes: one per competency per level, paraphrased (scale, page) ----------
CEFR_SCALE = {"lis": ("Overall oral comprehension", 48), "rea": ("Overall reading comprehension", 54), "wex": ("Overall written production", 66),
  "wint": ("Overall written interaction", 82), "oex": ("Overall oral production", 62), "oint": ("Overall oral interaction", 72),
  "pro": ("Phonological control", 133), "gra": ("Grammatical accuracy", 132), "voc": ("Vocabulary range", 131),
  "pra": ("Sociolinguistic appropriateness", 136), "dis": ("Coherence and cohesion", 140), "med": ("Overall mediation", 91)}
CEFR_TXT = {
 "lis": ["Follows very slow, careful speech with long pauses on familiar everyday matters.", "Understands phrases and the main point of short, clear, slow messages about immediate needs.",
         "Understands the main points of clear standard speech on familiar matters, including short narratives.", "Understands standard speech, live or broadcast, on familiar and unfamiliar topics, including technical discussion in their field.",
         "Understands extended speech on abstract and complex topics, even when not clearly structured and with idiomatic usage.", "Understands any kind of spoken language, live or broadcast, at natural speed, including non-standard usage."],
 "rea": ["Understands very short, simple texts a phrase at a time, picking up familiar names and words.", "Understands short, simple texts on familiar matters written in high-frequency everyday language.",
         "Reads straightforward factual texts on familiar subjects with a satisfactory level of comprehension.", "Reads with a large degree of independence, adapting style and speed to different texts and purposes.",
         "Understands long, complex texts in detail, whether or not related to own field, re-reading difficult sections.", "Understands virtually all forms of written language, including abstract, structurally complex or highly colloquial texts."],
 "wex": ["Writes simple isolated phrases and sentences about themselves and imaginary people.", "Writes a series of simple phrases and sentences linked with simple connectors like y, pero, porque.",
         "Writes straightforward connected texts on familiar subjects by linking shorter elements into a linear sequence.", "Writes clear, detailed texts on a range of subjects, synthesising and evaluating information and arguments.",
         "Writes clear, well-structured texts on complex subjects, expanding and supporting points of view with reasons and examples.", "Writes clear, smoothly flowing, complex texts in an appropriate and effective style with a logical structure."],
 "wint": ["Asks for or passes on personal details in writing.", "Writes short, simple formulaic notes relating to matters of immediate need.",
          "Conveys information and ideas on abstract and concrete topics, checks information and asks about problems in writing.", "Expresses news and views effectively in writing and relates to those of others.",
          "Expresses themselves with clarity and precision in writing, relating to the addressee flexibly and effectively.", "Writes with full appropriacy of register and style for any situation, including emotional, allusive and joking usage."],
 "oex": ["Produces simple, mainly isolated phrases about people and places.", "Gives a simple description or presentation of people, living conditions, daily routines and likes, as a short list of phrases.",
         "Reasonably fluently sustains a straightforward description of a subject within their field, presented as a linear sequence of points.", "Gives clear, systematically developed descriptions and presentations, highlighting significant points with supporting detail.",
         "Gives clear, detailed descriptions and presentations on complex subjects, integrating sub-themes and rounding off with a conclusion.", "Produces clear, smoothly flowing, well-structured speech with an effective logical structure that helps the listener."],
 "oint": ["Interacts in a simple way, relying on repetition, rephrasing and repair; asks and answers simple questions on immediate needs.", "Interacts with reasonable ease in structured situations and short conversations, with help if needed.",
          "Communicates with some confidence on familiar routine and non-routine matters; exchanges, checks and confirms information.", "Interacts with a degree of fluency and spontaneity that makes regular interaction with speakers quite possible, without strain.",
          "Expresses themselves fluently and spontaneously, almost effortlessly, with a broad lexical repertoire and few noticeable searches for words.", "Has a good command of idiomatic expressions and colloquialisms; backtracks around difficulties so smoothly the listener hardly notices."],
 "pro": ["Pronunciation of a very limited repertoire of words and phrases can be understood with some effort by sympathetic listeners.", "Pronunciation is generally clear enough to be understood, but conversational partners will need to ask for repetition from time to time.",
         "Pronunciation is generally intelligible; intonation and stress at utterance and word level do not prevent understanding of the message.", "Can generally use appropriate intonation, place stress correctly and articulate individual sounds clearly.",
         "Can employ the full range of phonological features with sufficient control to ensure intelligibility throughout.", "Can employ the full range of phonological features with a high level of control, including prosody, for finer aspects of meaning."],
 "gra": ["Shows only limited control of a few simple grammatical structures and sentence patterns from a learnt repertoire.", "Uses some simple structures correctly, but still systematically makes basic mistakes.",
         "Communicates with reasonable accuracy in familiar contexts; generally good control though with noticeable mother-tongue influence.", "Good grammatical control; occasional slips or non-systematic errors may still occur but are rare and often self-corrected.",
         "Consistently maintains a high degree of grammatical accuracy; errors are rare and difficult to spot.", "Maintains consistent grammatical control of complex language, even while attention is otherwise engaged."],
 "voc": ["Has a basic vocabulary repertoire of words and phrases related to particular concrete situations.", "Has sufficient vocabulary to conduct routine everyday transactions involving familiar situations and topics.",
         "Has a good range of vocabulary related to familiar topics and everyday situations.", "Has a good range of vocabulary for matters connected to their field and most general topics; varies formulation to avoid repetition.",
         "Has a good command of a broad lexical repertoire, including idiomatic expressions and colloquialisms; can select terms with precision.", "Has a good command of a very broad lexical repertoire including idiomatic expressions and colloquialisms; shows awareness of connotation."],
 "pra": ["Establishes basic social contact using the simplest everyday polite forms: greetings, farewells, please, thank you, sorry.", "Handles very short social exchanges using everyday polite forms of greeting and address; makes and responds to invitations and apologies.",
         "Performs and responds to a wide range of language functions using their most common exponents in a neutral register.", "Expresses themselves confidently, clearly and politely in a formal or informal register appropriate to the situation.",
         "Recognises a wide range of idiomatic expressions and register shifts; uses language flexibly for social purposes, including emotional and allusive usage.", "Appreciates fully the sociolinguistic and sociocultural implications of language used by proficient speakers and reacts accordingly."],
 "dis": ["Links words or groups of words with very basic linear connectors like y or entonces.", "Links groups of words with simple connectors like y, pero and porque.",
         "Links a series of shorter, discrete simple elements into a connected, linear sequence of points.", "Uses a limited number of cohesive devices to link utterances into clear, coherent discourse.",
         "Produces clear, smoothly flowing, well-structured speech, showing controlled use of organisational patterns, connectors and cohesive devices.", "Creates coherent and cohesive text making full and appropriate use of a variety of organisational patterns and a wide range of cohesive devices."],
 "med": ["Conveys simple, predictable information of immediate interest given in short, simple signs and notices.", "Conveys the main point of short, simple texts on everyday subjects of immediate interest, if clearly expressed.",
         "Introduces people from different backgrounds; conveys the main points of straightforward texts on familiar subjects.", "Conveys detailed information and arguments reliably; summarises a wide range of texts, commenting on and discussing viewpoints.",
         "Acts effectively as a mediator, helping to maintain positive interaction; summarises long, demanding texts and conveys subtle distinctions.", "Mediates effectively and naturally, taking on different roles; explains in clear, fluent, well-structured language the way facts and arguments are presented."]}

# ---------- PCIC grammar (selected inventory points by level; kw = accent-free regex over the app's own teaching text) ----------
G = [  # id, level, PCIC section, outcome, kw, prerequisites
 ("g-gen-num", "a1", "Gramática · 2. El sustantivo", "Recognise and form gender and number of nouns.", r"genero|plural|singular|sustantiv|masculin|feminin", []),
 ("g-art", "a1", "Gramática · 3. El artículo", "Use definite and indefinite articles, including contractions al and del.", r"articul|article|contrac", ["g-gen-num"]),
 ("g-adj", "a1", "Gramática · 4. El adjetivo", "Make adjectives agree with the noun in gender and number.", r"adjetiv|concordanc|agree", ["g-gen-num"]),
 ("g-dem", "a1", "Gramática · 5.2 Demostrativos", "Use demonstratives este, ese, aquel by distance.", r"demostrativ|demonstrativ|este, ese|aquel", []),
 ("g-pos", "a1", "Gramática · 5.3 Posesivos", "Use unstressed possessives mi, tu, su, nuestro.", r"posesiv|possessive", []),
 ("g-subj-pron", "a1", "Gramática · 7.1 Pronombres personales sujeto", "Use subject pronouns and know when they can be dropped.", r"pronombres? (personales|sujeto)|subject pronoun|personal pronoun", []),
 ("g-pres", "a1", "Gramática · 9. Tiempos verbales: presente de indicativo", "Conjugate regular and common irregular verbs in the present indicative.", r"\bpresente\b|present tense|conjugac|regular verbs|irregular", []),
 ("g-ser-estar", "a1", "Gramática · 9. Ser y estar; hay", "Choose between ser, estar and hay for identity, states and existence.", r"ser y estar|ser or estar|ser vs|\bser\b.*\bestar\b|\bhay\b", ["g-pres"]),
 ("g-gustar", "a1", "Gramática · 7.2 Pronombres de objeto indirecto con gustar", "Express likes with gustar and similar verbs (me gusta, te encanta).", r"gustar|encantar|me gusta", ["g-pres"]),
 ("g-interr", "a1", "Gramática · 14. Oraciones interrogativas", "Ask questions with qué, quién, dónde, cuándo, cuánto, cómo, por qué.", r"interrogativ|question word|questions|preguntas", []),
 ("g-num", "a1", "Gramática · 6. Cuantificadores: numerales", "Use cardinal numbers, quantities and basic quantifiers.", r"numer|number|cuantificador|quantif|mucho|poco", []),
 ("g-prep1", "a1", "Gramática · 12. Preposiciones (a, de, en, con)", "Use basic prepositions of place, origin and direction.", r"preposici|preposition", []),
 ("g-ir-a", "a1", "Gramática · 9.3 Perífrasis: ir a + infinitivo", "Talk about plans with ir a + infinitive.", r"ir a \+|\bvoy a\b|futuro proximo|going to", ["g-pres"]),
 ("g-tener-que", "a1", "Gramática · 9.3 Perífrasis de obligación", "Express obligation with tener que and hay que.", r"tener que|hay que|obligac", ["g-pres"]),
 ("g-refl", "a1", "Gramática · 7.3 Pronombres reflexivos", "Use common reflexive verbs for daily routines.", r"reflexiv|levantarse|ducharse|\bme llamo\b", ["g-pres"]),
 ("g-perf", "a2", "Gramática · 9. Pretérito perfecto", "Use the present perfect for recent past and experiences.", r"preterito perfecto|present perfect|\bperfecto\b", ["g-pres"]),
 ("g-indef", "a2", "Gramática · 9. Pretérito indefinido", "Use the preterite of regular and frequent irregular verbs for completed past events.", r"indefinido|preterite", ["g-pres"]),
 ("g-impf", "a2", "Gramática · 9. Pretérito imperfecto", "Use the imperfect for habits and descriptions in the past.", r"imperfecto|imperfect|used to", ["g-pres"]),
 ("g-past-contrast", "a2", "Gramática · 9. Contraste de pasados", "Contrast imperfecto and indefinido in simple narratives.", r"imperfecto (or|o|y) indefinido|indefinido (or|o|y) imperfecto|contrast|pasados", ["g-indef", "g-impf"]),
 ("g-gerund", "a2", "Gramática · 9.3 Estar + gerundio", "Describe actions in progress with estar + gerund.", r"gerundio|gerund|estar \+|progressive", ["g-ser-estar"]),
 ("g-od-oi", "a2", "Gramática · 7.2 Pronombres átonos de OD y OI", "Use direct and indirect object pronouns and their position.", r"objeto (directo|indirecto)|direct object|indirect object|object pronoun|pronombres? (atonos?|de objeto)", ["g-subj-pron"]),
 ("g-imper-af", "a2", "Gramática · 9. Imperativo afirmativo", "Give instructions with the affirmative imperative (tú, usted).", r"imperativ|command|instrucc", ["g-pres"]),
 ("g-comp", "a2", "Gramática · 4.3 Comparación", "Compare with más/menos… que, tan… como, mejor, peor.", r"comparativ|compar|tan \w+ como", ["g-adj"]),
 ("g-superl", "a2", "Gramática · 4.3 Superlativos y diminutivos", "Use superlatives (el más…, -ísimo) and common diminutives.", r"superlativ|isimo|diminutiv|-ito", ["g-comp"]),
 ("g-indefpron", "a2", "Gramática · 6. Indefinidos (algo, nada, alguien, nadie)", "Use indefinite pronouns and double negation.", r"alguien|nadie|indefinid|negacion|negation|negative|ningun", []),
 ("g-fut", "a2", "Gramática · 9. Futuro imperfecto", "Use the simple future for predictions and promises.", r"\bfuturo\b|future", ["g-pres"]),
 ("g-conn-basic", "a2", "Gramática · 15. Conectores (y, pero, porque, entonces)", "Link ideas with basic coordinating and causal connectors.", r"conector|connector|linking|porque", []),
 ("g-subj-pres", "b1", "Gramática · 9. Presente de subjuntivo", "Form the present subjunctive and use it for wishes, purpose and value judgements.", r"subjuntivo|subjunctive", ["g-pres"]),
 ("g-imper-neg", "b1", "Gramática · 9. Imperativo negativo", "Give negative commands (no hables, no lo hagas).", r"imperativo negativo|negative (command|imperative)|negativ", ["g-imper-af", "g-subj-pres"]),
 ("g-plusc", "b1", "Gramática · 9. Pretérito pluscuamperfecto", "Use the pluperfect for a past before another past.", r"pluscuamperfecto|pluperfect|past perfect", ["g-past-contrast"]),
 ("g-cond", "b1", "Gramática · 9. Condicional simple", "Use the conditional for advice, polite requests and hypotheses.", r"condicional|conditional", ["g-fut"]),
 ("g-rel", "b1", "Gramática · 16. Oraciones de relativo (que, donde, quien)", "Build relative clauses with que, donde and quien in the indicative.", r"relativ|relative", []),
 ("g-indirect", "b1", "Gramática · 17. Estilo indirecto (presente)", "Report what others say: dice que…, me ha preguntado si….", r"estilo indirecto|reported speech|indirect speech", ["g-pres"]),
 ("g-por-para", "b1", "Gramática · 12. Por y para", "Distinguish por (cause, means, through) and para (purpose, destination, deadline).", r"por y para|por or para|por vs|\bpor\b.*\bpara\b", ["g-prep1"]),
 ("g-periph", "b1", "Gramática · 9.3 Perífrasis (acabar de, dejar de, seguir + gerundio)", "Use common verbal periphrases of phase and aspect.", r"perifrasis|acabar de|dejar de|seguir \+|volver a|empezar a", ["g-gerund"]),
 ("g-combo", "b1", "Gramática · 7.2 Combinación de pronombres (se lo)", "Combine indirect and direct object pronouns (se lo, te la).", r"\bse lo\b|combinac|double object|two pronouns|both pronouns", ["g-od-oi"]),
 ("g-subj-impf", "b2", "Gramática · 9. Pretérito imperfecto de subjuntivo", "Form and use the imperfect subjunctive after past triggers.", r"imperfecto de subjuntivo|imperfect subjunctive|past subjunctive", ["g-subj-pres"]),
 ("g-si-cond", "b2", "Gramática · 18. Oraciones condicionales", "Express real and hypothetical conditions (si + presente / si + imperfecto de subjuntivo).", r"\bsi \+|condicionales|if-clause|hypothetical|conditional sentences|oraciones con si", ["g-cond", "g-subj-impf"]),
 ("g-subj-rel", "b2", "Gramática · 16. Relativas con subjuntivo", "Use the subjunctive in relative clauses with unknown or non-existent antecedents.", r"busco (a )?(alguien|un)|antecedent|relativ.*subjun|subjun.*relativ|no hay nadie que", ["g-rel", "g-subj-pres"]),
 ("g-concess", "b2", "Gramática · 18. Oraciones concesivas (aunque)", "Express concession with aunque + indicative or subjunctive.", r"\baunque\b|concesiv|concession|a pesar de", ["g-subj-pres"]),
 ("g-indirect-past", "b2", "Gramática · 17. Estilo indirecto en pasado", "Report past speech with tense shifts (dijo que vendría).", r"estilo indirecto|reported speech|indirect speech|tense shift|backshift", ["g-indirect"]),
 ("g-passive", "b2", "Gramática · 9. Voz pasiva y pasiva refleja", "Use ser + participle and the pasiva refleja (se venden pisos).", r"pasiva|passive", []),
 ("g-prob", "b2", "Gramática · 9. Futuro y condicional de probabilidad", "Express probability with future and conditional forms (serán las diez).", r"probabilidad|probability|conjetura|guess|speculat", ["g-fut", "g-cond"]),
 ("g-counterarg", "b2", "Gramática · 15. Conectores contraargumentativos", "Organise arguments with sin embargo, no obstante, en cambio.", r"sin embargo|no obstante|en cambio|contraargument", ["g-conn-basic"]),
 ("g-subj-plusc", "c1", "Gramática · 9. Pluscuamperfecto de subjuntivo", "Use the pluperfect subjunctive for unreal past situations.", r"pluscuamperfecto de subjuntivo|pluperfect subjunctive|hubiera \+", ["g-subj-impf", "g-plusc"]),
 ("g-cond-past", "c1", "Gramática · 18. Condicionales irreales de pasado", "Express unreal past conditions and mixed conditionals.", r"si hubiera|mixed conditional|condicional compuesto|irreal|unreal past", ["g-si-cond"]),
 ("g-se", "c1", "Gramática · 7.3 Valores de se", "Distinguish the values of se: reflexive, reciprocal, impersonal, passive, involuntary.", r"valores de se|uses of se|impersonal|involuntar|reciproc", ["g-refl", "g-passive"]),
 ("g-nominal", "c1", "Gramática · Nominalización y registro culto", "Use nominalisation and formal structures typical of academic writing.", r"nominaliz|registro (culto|formal)|academic", []),
 ("g-periph-adv", "c1", "Gramática · 9.3 Perífrasis de matiz (llegar a, venir a, andar + gerundio)", "Use nuanced periphrases to express attitude and aspect.", r"llegar a|venir a|andar \+|perifrasis", ["g-periph"]),
 ("g-corr", "c1", "Gramática · 9. Correlación de tiempos", "Keep tense sequence across complex sentences.", r"correlacion|sequence of tenses|consecutio", ["g-subj-impf"]),
 ("g-modal-nuance", "c2", "Gramática · Valores modales y estilísticos", "Exploit modal and stylistic values of tenses and moods for nuance.", r"matiz|nuance|estilistic|stylistic", ["g-corr"]),
 ("g-idiom", "c2", "Gramática y léxico · Locuciones y expresiones idiomáticas", "Understand and use idiomatic expressions and fixed phrases appropriately.", r"locucion|modismo|idiom|expresion(es)? idiomatic", []),
]
# ---------- PCIC functions ----------
F = [
 ("f-intro", "a1", "Funciones · 5. Relacionarse socialmente: saludar, presentarse", "Greet, introduce yourself and others, and say goodbye.", r"salud|presenta|greeting|introduc|mucho gusto|me llamo", "oint"),
 ("f-info", "a1", "Funciones · 1. Dar y pedir información personal", "Ask for and give basic personal information.", r"de donde eres|como te llamas|cuantos anos|personal (details|information|questions)|datos personales", "oint"),
 ("f-likes", "a1", "Funciones · 3. Expresar gustos y preferencias", "Express likes, dislikes and preferences.", r"gusta|prefiero|encanta|likes", "oex"),
 ("f-describe", "a1", "Funciones · 1. Describir personas, lugares y objetos", "Describe people, places and things in simple terms.", r"describ|es alto|es grande", "oex"),
 ("f-narrate", "a2", "Funciones · 1. Narrar en pasado", "Tell what happened in simple past narratives.", r"narr|cuenta(r)? (que|lo que)|what happened|ayer|el fin de semana pasado", "oex"),
 ("f-plans", "a2", "Funciones · 4. Proponer, invitar, quedar", "Make plans, invite, accept and decline.", r"invit|quedar|propon|te apetece|vamos a", "oint"),
 ("f-request", "a2", "Funciones · 4. Pedir permiso, favores y objetos", "Ask for permission, favours and things politely.", r"puedo|me (puedes|podria)|permiso|favor", "oint"),
 ("f-advice-a2", "a2", "Funciones · 4. Dar consejos e instrucciones", "Give advice and simple instructions.", r"consej|deberias|tienes que|instruc", "oint"),
 ("f-opinion", "b1", "Funciones · 2. Expresar opinión, acuerdo y desacuerdo", "Give and ask for opinions, agree and disagree.", r"opin|creo que|(no )?estoy de acuerdo|agree", "oint"),
 ("f-wish", "b1", "Funciones · 3. Expresar deseos y sentimientos", "Express wishes, feelings and reactions.", r"ojala|espero que|me alegra|deseo|feelings", "oex"),
 ("f-hypo", "b1", "Funciones · 2. Formular hipótesis", "Speculate and make hypotheses about present and future.", r"hipotesis|quizas|tal vez|a lo mejor|puede que", "oex"),
 ("f-complain", "b1", "Funciones · 4. Reclamar y quejarse", "Make complaints and ask for solutions in transactions.", r"reclam|queja|complain|devolver|roto", "oint"),
 ("f-argue", "b2", "Funciones · 2. Argumentar y contraargumentar", "Argue a point, counter-argue and concede.", r"argument|por un lado|por otro lado|ventajas e inconvenientes", "wex"),
 ("f-evaluate", "b2", "Funciones · 2. Valorar propuestas", "Evaluate proposals and weigh pros and cons.", r"valor(ar|a)|propuesta|pros and cons|ventaja", "oint"),
 ("f-condition", "b2", "Funciones · 4. Expresar condiciones y requisitos", "State conditions and requirements.", r"siempre que|con tal de|a condicion|condici", "wex"),
 ("f-hedge", "b2", "Funciones · 2. Matizar y atenuar", "Qualify statements and soften disagreement.", r"en cierto modo|hasta cierto punto|matiz|atenu", "pra"),
 ("f-persuade", "c1", "Funciones · 4. Persuadir y convencer", "Persuade and convince using reasoned arguments.", r"persuad|convenc|negoci", "oint"),
 ("f-summarise", "c1", "Funciones · 1. Resumir y reformular", "Summarise and reformulate information from texts.", r"resum|summar|reformul|sintesis", "med"),
 ("f-irony", "c2", "Funciones · 6. Ironía, humor y doble sentido", "Recognise and use irony, humour and double meaning.", r"ironi|humor|doble sentido|sarcas", "pra"),
 ("f-register", "c2", "Funciones · Adecuación al registro", "Shift register precisely for audience and genre.", r"registro|register|formal|coloquial", "pra"),
]
# ---------- PCIC Nociones específicas (themes): first level band at which each theme is expected ----------
N = [("n-individuo", "a1", "Individuo: dimensión física y anímica", r"cuerpo|aspecto|caracter|sentimiento"), ("n-relaciones", "a1", "Relaciones personales", r"familia|relacion"),
     ("n-alimentacion", "a1", "Alimentación", r"comida|bebida|aliment|restaurante"), ("n-educacion", "a1", "Educación", r"escuela|estudios|educacion"),
     ("n-trabajo", "a1", "Trabajo", r"trabajo|profesion|empleo"), ("n-ocio", "a1", "Ocio", r"tiempo libre|ocio|deporte"),
     ("n-vivienda", "a1", "Vivienda", r"casa|vivienda|mueble"), ("n-compras", "a1", "Compras, tiendas y establecimientos", r"compras|tienda|ropa"),
     ("n-salud", "a2", "Salud e higiene", r"salud|medic|enfermedad"), ("n-viajes", "a1", "Viajes, alojamiento y transporte", r"viaje|transporte|alojamiento|hotel"),
     ("n-servicios", "a2", "Servicios (banco, correos, administración)", r"servicio|banco|correos|administracion|tramite"), ("n-medios", "b1", "Información y medios de comunicación", r"medios|noticia|prensa|comunicacion"),
     ("n-economia", "b1", "Economía e industria", r"economia|industria|empresa|dinero"), ("n-ciencia", "b1", "Ciencia y tecnología", r"ciencia|tecnolog|internet"),
     ("n-politica", "b2", "Gobierno, política y sociedad", r"politic|sociedad|gobierno|ciudadan"), ("n-arte", "b1", "Arte y cultura", r"arte|cultura|literatura|cine|musica"),
     ("n-religion", "c1", "Religión y filosofía", r"religion|filosof|creencia"), ("n-geografia", "a2", "Geografía y naturaleza", r"geograf|naturaleza|clima|medio ambiente|tiempo"),
     ("n-ciudad", "a1", "Ciudad y lugares", r"ciudad|lugares|barrio")]

# ---------- DELE task families (from the guides opened on TODAY; page numbers are the guides') ----------
# level: [prueba, tarea, focus, format, items or length, criteria, comp, page]
P = {"lectura": "Comprensión de lectura", "auditiva": "Comprensión auditiva", "escritura": "Expresión e interacción escritas", "oral": "Expresión e interacción orales"}
D = {
 "a1": {"time": {"lectura": 45, "auditiva": 25, "escritura": 25, "oral": 10}, "prep": {"oral": 10}, "tasks": [
  ["lectura", 1, "Understand short, simple messages", "Emails, postcards; 3-option multiple choice", 5, None, "rea", 8], ["lectura", 2, "Specific information in notes and signs", "Match 6 of 9 short texts", 6, None, "rea", 8],
  ["lectura", 3, "General sense of informative material", "Match short adverts with statements", 6, None, "rea", 9], ["lectura", 4, "Specific information in informative texts", "Adverts, notices, labels, tickets; 3 options", 8, None, "rea", 9],
  ["auditiva", 1, "Gist and details of short conversations", "2–3-turn dialogues; picture options", 5, None, "lis", 10], ["auditiva", 2, "Gist of very short messages", "Announcements; match 5 of 8 pictures", 5, None, "lis", 11],
  ["auditiva", 3, "Gist and details of simple statements", "Monologue statements; match beginnings and endings", 8, None, "lis", 11], ["auditiva", 4, "Names, words or phrases in a conversation", "Conversation; complete with 1 of 8 options", 7, None, "lis", 11],
  ["escritura", 1, "Basic personal details in writing", "Form with short fields", "15–25 words", "Holistic scale 0–3 per task", "wint", 12], ["escritura", 2, "Courtesy messages and simple personal information", "Postcard, email, short note", "30–40 words", "Holistic scale 0–3 per task", "wint", 12],
  ["oral", 1, "Basic information about oneself", "Short prepared monologue", "1–2 min", "Language use + task fulfilment (0–3)", "oex", 18], ["oral", 2, "Oneself and one's surroundings", "Short prepared monologue on a familiar topic", "2–3 min", "Language use + task fulfilment (0–3)", "oex", 18],
  ["oral", 3, "Short exchanges with the interviewer", "Conversation; ask 2 prepared questions", "3–4 min", "Language use + task fulfilment; interviewer global scale", "oint", 19]]},
 "a2": {"time": {"lectura": 60, "auditiva": 40, "escritura": 45, "oral": 12}, "prep": {"oral": 12}, "tasks": [
  ["lectura", 1, "Main idea and simple specific information", "Personal letters/emails (250–300 words)", 5, None, "rea", 8], ["lectura", 2, "Relevant ideas in informative material", "Notices, posters, adverts (50–80 words each)", 8, None, "rea", 9],
  ["lectura", 3, "Specific, predictable information", "Recipes, job offers, listings (100–120 words each)", 6, None, "rea", 9], ["lectura", 4, "Essential ideas and topic changes", "Narrative text (375–425 words)", 6, None, "rea", 9],
  ["auditiva", 1, "Main ideas of informal conversations", "Six face-to-face conversations", 6, None, "lis", 10], ["auditiva", 2, "Gist of news or radio items", "Six short items", 6, None, "lis", 11],
  ["auditiva", 3, "Main ideas and details in a conversation", "Match statements with man, woman or neither", 6, None, "lis", 11], ["auditiva", 4, "Essential information in recorded messages", "Announcements and voicemail (30–50 words each)", 7, None, "lis", 11],
  ["escritura", 1, "Reply to a text with personal information", "Note, postcard, email or short letter", "60–70 words", "Holistic 0–3: language use 66%, task fulfilment 34%", "wint", 12], ["escritura", 2, "Short description, narration or likes", "Option A personal topic / option B biography from photos or data", "70–80 words", "Holistic 0–3: language use 66%, task fulfilment 34%", "wex", 13],
  ["oral", 1, "Short prepared presentation on daily life", "Monologue on 1 of 2 topics", "2–3 min", "Language use + task fulfilment", "oex", 17], ["oral", 2, "Describe an everyday scene", "Monologue from a photo", "2–3 min", "Language use + task fulfilment", "oex", 18],
  ["oral", 3, "Short transactional or informal conversation", "Role-play with the interviewer based on the T2 photo", "3–4 min", "Rater scale T3 + interviewer global scale", "oint", 18]]},
 "b1": {"time": {"lectura": 70, "auditiva": 40, "escritura": 60, "oral": 15}, "prep": {"oral": 15}, "tasks": [
  ["lectura", 1, "Main idea and specific information in short texts", "Ads, messages, notices; matching", 6, None, "rea", 8], ["lectura", 2, "Key ideas in a simple informative text", "Informative text (400–450 words); 3 options", 6, None, "rea", 9],
  ["lectura", 3, "Specific information in descriptive/narrative texts", "Three texts; matching", 6, None, "rea", 9], ["lectura", 4, "Rebuild a text from cohesion clues", "Complete paragraphs with fragments", 6, None, "dis", 9],
  ["lectura", 5, "Select grammatical structures", "Letter/email cloze, 3 options", 6, None, "gra", 10],
  ["auditiva", 1, "Main idea of short promotional/informative texts", "Short monologues; 3 options", 6, None, "lis", 12], ["auditiva", 2, "Key and detailed information in a long monologue", "Personal-experience monologue", 6, None, "lis", 12],
  ["auditiva", 3, "Main idea of news items", "Radio/TV news; 3 options", 6, None, "lis", 12], ["auditiva", 4, "Gist of short informal monologues", "Anecdotes; matching", 6, None, "lis", 13], ["auditiva", 5, "Specific information in informal conversation", "Two-person conversation", 6, None, "lis", 13],
  ["escritura", 1, "Short cohesive informative text in reply to a prompt", "Note, letter, email, forum or blog message", "100–120 words", "Analytic (adecuación, coherencia, corrección, alcance) 60% + holistic 40%", "wint", 14],
  ["escritura", 2, "Descriptive or narrative text with opinion", "Composition, diary or biography (1 of 2)", "130–150 words", "Analytic 60% + holistic 40%", "wex", 15],
  ["oral", 1, "Rehearsed presentation with opinions and experiences", "Prompt card, 1 of 2", "2–3 min", "Analytic (coherencia, fluidez, corrección, alcance) + holistic", "oex", 24], ["oral", 2, "Conversation about the T1 topic", "Interviewer-led conversation", "3–4 min", "Analytic + holistic", "oint", 25],
  ["oral", 3, "Describe a photo and relate it to own experience", "Photo with prompts (unprepared)", "2–3 min", "Analytic + holistic", "oex", 25], ["oral", 4, "Simulated everyday situation", "Role cards: complaints, changes, appointments", "2–3 min", "Analytic + holistic", "oint", 25]]},
 "b2": {"time": {"lectura": 70, "auditiva": 40, "escritura": 80, "oral": 20}, "prep": {"oral": 20}, "tasks": [
  ["lectura", 1, "Essential ideas and specific information", "Complex informative text (400–450 words); 3 options", 6, None, "rea", 8], ["lectura", 2, "Specific information; infer attitudes and opinions", "Four personal texts; match statements", 10, None, "rea", 8],
  ["lectura", 3, "Text structure and relations between ideas", "Complete paragraphs with 6 of 8 sentences", 6, None, "dis", 9], ["lectura", 4, "Grammatical structures in a long text", "Cloze, 3 options", 14, None, "gra", 9],
  ["auditiva", 1, "Main ideas in short conversations", "Formal/informal conversations; 3 options", 6, None, "lis", 10], ["auditiva", 2, "Specific information in a conversation", "Match ideas with speakers", 6, None, "lis", 11],
  ["auditiva", 3, "Detailed information and implications", "Radio/TV interview; 3 options", 6, None, "lis", 11], ["auditiva", 4, "Essence of short monologues", "Match statements with speakers", 6, None, "lis", 12], ["auditiva", 5, "Detailed information and implications", "Lecture or speech; 3 options", 6, None, "lis", 12],
  ["escritura", 1, "Take relevant content from an oral text and give an opinion", "Formal or informal letter/email from a listening input", "150–180 words", "Analytic (adecuación, coherencia, corrección, alcance) 60% + holistic 40%", "wint", 13],
  ["escritura", 2, "Argue, evaluate or give an opinion from a text or graph", "Opinion article (A: graph; B: blog or review)", "150–180 words", "Analytic 60% + holistic 40%", "wex", 14],
  ["oral", 1, "Evaluate proposals and converse", "Problem card with 5–7 proposals", "6–7 min", "Analytic (coherencia, fluidez, corrección, alcance) + holistic", "oint", 27], ["oral", 2, "Describe an imagined situation and converse", "Photo card with prompts", "5–6 min", "Analytic + holistic", "oex", 28],
  ["oral", 3, "Give an opinion on survey data", "Survey or trend card (unprepared)", "3–4 min", "Analytic + holistic", "oint", 28]]},
 "c1": {"time": {"lectura": 90, "auditiva": 50, "escritura": 80, "oral": 20}, "prep": {"oral": 20}, "tasks": [
  ["lectura", 1, "Main and supporting ideas; specific information", "Administrative/legal/commercial text (650–750 words)", 6, None, "rea", 1], ["lectura", 2, "Text structure and relations between ideas", "Match 7 fragments to 6 gaps", 6, None, "dis", 1],
  ["lectura", 3, "Implicit information; author's opinion and attitude", "Opinion articles, editorials (550–650 words)", 6, None, "rea", 1], ["lectura", 4, "Main ideas and specific information", "Match 8 statements to 6 short texts", 8, None, "rea", 1],
  ["lectura", 5, "Grammatical structures and adequate vocabulary", "Cloze, 3 options (375–425 words)", 14, None, "gra", 1],
  ["auditiva", 1, "Main ideas of a monologue and details", "Pick 6 true statements of 12 (talk, lecture)", 6, None, "lis", 2], ["auditiva", 2, "Implicit information; speakers' opinions and attitudes", "Four conversations, 2 questions each", 8, None, "lis", 2],
  ["auditiva", 3, "Essential ideas and implications in long interaction", "Interview or debate; 3 options", 6, None, "lis", 2], ["auditiva", 4, "Meaning of idioms and colloquial expressions", "Ten short dialogues", 10, None, "voc", 2],
  ["escritura", 1, "Mediate an audio text in writing: summary, evaluation and opinion", "Listen twice to a talk, take notes, write", "220–250 words", "Mediation descriptors (CEFR CV) + analytic/holistic scales", "med", 3],
  ["escritura", 2, "Formal text for a specific context from graphic or written prompts", "Report/article from graph, or formal letter", "180–220 words", "Analytic + holistic scales", "wex", 3],
  ["oral", 1, "Mediate a long written text orally: summary and evaluation", "Presentation from notes on an article (750–850 words)", "3–5 min", "Mediation descriptors + analytic/holistic scales", "med", 4], ["oral", 2, "Answer complex questions; argue and give examples", "Examiner questions on the T1 topic", "4–6 min", "Analytic + holistic", "oint", 4],
  ["oral", 3, "Exchange and evaluate opinions to reach agreement", "Negotiate 1 of 4 options with the examiner", "4–6 min", "Analytic + holistic", "oint", 4]]},
 "c2": {"time": {"lectura": 105, "escritura": 150, "oral": 20}, "prep": {"oral": 30}, "papers": "2014 format: Paper 1 combines use of language, reading and listening; papers 2 and 3 are integrated skills.", "tasks": [
  ["lectura", 1, "Subtle distinctions of style and meaning", "Complex/literary text; gap fill, 3 options", 12, None, "voc", 9], ["lectura", 2, "Text structure and relations between ideas", "Long texts; complete with statements", 6, None, "dis", 9],
  ["lectura", 3, "Specific information in short academic texts", "Reviews, abstracts; matching", 8, None, "rea", 9], ["auditiva", 4, "Main points and details of an oral text", "Lecture, speech or news; pick 5 ideas", 5, None, "lis", 10],
  ["auditiva", 5, "Intentions and implications of different speakers", "Debates, interviews; match statements with people", 15, None, "lis", 10], ["auditiva", 6, "Specific data in debates or interviews", "Radio/TV; 3 options", 6, None, "lis", 10],
  ["escritura", 1, "Professional/academic text from oral and written sources", "Minutes, letters, reports, reviews, articles", "400–450 words", "Analytic (adecuación, coherencia, corrección, alcance) 60% + holistic 40%", "med", 11],
  ["escritura", 2, "Rework a text into another genre or register, correcting it", "Drafts, machine-translated texts", "150–250 words", "Analytic + holistic", "wex", 12], ["escritura", 3, "Text of a given genre from images or short prompts", "Graphs, cartoons, phrases", "200–250 words", "Analytic + holistic", "wex", 12],
  ["oral", 1, "Monologue transferring information from texts and images", "2–3 texts and graphics on one topic", "6–8 min", "Analytic (coherencia, fluidez, corrección, alcance) + holistic", "med", 28], ["oral", 2, "Conversation about the presentation", "Examiner's comments and questions", "—", "Analytic + holistic", "oint", 29],
  ["oral", 3, "Improvised conversation on headlines", "3–4 press headlines on one theme", "5–6 min", "Analytic + holistic", "oint", 29]]}}

def strip(s): return s

def mastery(kind, comp, lv):
    if kind == "grammar": return "Internal target: at least 80% correct over 10+ items in two separate sessions, including 3+ items where the learner writes the form."
    if kind == "function": return "Internal target: performs the function appropriately in a role-play or written task, rated band 2 or higher on the app's 0–3 scale."
    if kind == "theme": return "Internal target: recognises 80% of the theme's core words in a review deck and uses 5+ of them correctly in production."
    if kind == "dele": return "Internal target: 60%+ on the matching mock-exam task (comprehension) or band 2 of 3 on its scale (production) on two attempts."
    return {"r": "Internal target: 70%+ on comprehension questions for texts at this level on two separate days.",
            "p": "Internal target: band 2 of 3 (the DELE pass band) on the matching production scale in two attempts.",
            "k": "Internal target: 80% accuracy on mixed review items at this level.", "x": "Internal target: rated band 2 of 3 on the matching criterion in a production task."}[dict((c[0], c[2]) for c in COMP)[comp]]

O = []
for c, (scale, page) in CEFR_SCALE.items():
    for i, lv in enumerate(LV):
        O.append({"id": "cefr-%s-%s" % (c, lv), "src": "cefr", "lvl": lv, "ref": "%s, p. %d" % (scale, page), "comp": c, "kind": "skill", "text": CEFR_TXT[c][i],
                  "w": 3, "status": "source-checked", "rev": TODAY, "mastery": mastery("skill", c, lv), "pre": ["cefr-%s-%s" % (c, LV[i - 1])] if i else []})
FORMS = {  # surface forms (accent-free) looked for in the keys of grammar cloze items (B1 T5, B2 T4, C1 T5, C2 T1)
 "g-subj-pres": r"\b(sea|seas|sean|tenga|tengas|tengan|haga|hagan|vaya|vayan|pueda|puedan|quiera|quieran|este|esten|haya|hayan|sepa|diga|digan|venga|vengan)\b",
 "g-subj-impf": r"\b\w+(ara|aras|aran|iera|ieras|ieran|ese|esen)\b|\bfuera\b|\bhubiera\b|\btuviera\b",
 "g-subj-plusc": r"\bhubiera(s|n)? \w+(ado|ido|to|cho)\b|\bhubiese",
 "g-cond": r"\b\w+(aria|arias|arian|eria|erian|iria|irian)\b|\b(podria|deberia|tendria|haria|diria|sabria)",
 "g-cond-past": r"\bhabria(n)? \w+(ado|ido|to|cho)\b",
 "g-plusc": r"\bhabia(n)? \w+(ado|ido|to|cho)\b",
 "g-perf": r"\b(he|has|ha|hemos|han) \w+(ado|ido|to|cho)\b",
 "g-por-para": r"\b(por|para)\b",
 "g-rel": r"\b(el que|la que|lo que|los que|las que|quien|quienes|donde|cuyo|cuya)\b",
 "g-concess": r"\b(aunque|a pesar de|si bien)\b",
 "g-counterarg": r"\b(sin embargo|no obstante|en cambio|aun asi)\b",
 "g-conn-basic": r"\b(porque|pero|entonces|ademas|asi que)\b",
 "g-passive": r"\b(fue|fueron|es|son) \w+(ado|ada|ados|adas|ido|ida|idos|idas)\b|\bse (venden|alquila|vende)",
 "g-periph": r"\b(acaba de|acabar de|deja de|dejo de|sigue|siguen|vuelve a|volvio a|empezo a)\b",
 "g-periph-adv": r"\b(llego a|llegar a|viene a|venir a|anda|andar)\b",
 "g-prep1": r"\b(a|de|en|con|desde|hasta|sobre|entre)\b",
 "g-od-oi": r"\b(lo|la|los|las|le|les)\b",
 "g-combo": r"\bse (lo|la|los|las)\b",
 "g-se": r"\bse\b",
 "g-indef": r"\b\w+(aron|ieron|aste|iste)\b|\b(fue|fueron|tuvo|hizo|dijo|pudo)\b",
 "g-impf": r"\b\w+(aba|aban|ia|ian)\b|\b(era|eran|iba|iban)\b",
}
for gid, lv, sec, txt, kw, pre in G:
    O.append({"id": gid, "forms": FORMS.get(gid), "src": "pcic", "lvl": lv, "ref": sec, "comp": "gra", "kind": "grammar", "text": txt, "kw": kw, "w": 2, "status": "pending", "rev": None, "mastery": mastery("grammar", "gra", lv), "pre": pre})
for fid, lv, sec, txt, kw, comp in F:
    O.append({"id": fid, "src": "pcic", "lvl": lv, "ref": sec, "comp": comp, "kind": "function", "text": txt, "kw": kw, "w": 2, "status": "pending", "rev": None, "mastery": mastery("function", comp, lv), "pre": []})
for nid, lv, name, kw in N:
    O.append({"id": nid, "src": "pcic", "lvl": lv, "ref": "Nociones específicas · " + name, "comp": "voc", "kind": "theme", "text": "Understand and use the core vocabulary of the theme: " + name.lower() + ".", "kw": kw, "w": 1, "status": "pending", "rev": None, "mastery": mastery("theme", "voc", lv), "pre": []})
TASKS = []
for lv, d in D.items():
    for pr, n, focus, fmt, items, crit, comp, page in d["tasks"]:
        tid = "dele-%s-%s-t%d" % (lv, pr, n)
        TASKS.append({"id": tid, "lvl": lv, "prueba": pr, "pname": P[pr], "n": n, "focus": focus, "format": fmt, "items": items if isinstance(items, int) else None,
                      "length": items if isinstance(items, str) else None, "criteria": crit or "Machine-scored: 1 point per correct item, no penalty", "comp": comp, "page": page, "src": "dele-" + lv})
        O.append({"id": tid, "src": "dele-" + lv, "lvl": lv, "ref": "%s · Tarea %d%s" % (P[pr], n, (", p. %d" % page) if lv != "c1" else ", specification table p. %d" % page), "comp": comp, "kind": "dele",
                  "text": focus + " (" + fmt + (", " + items if isinstance(items, str) else ", %d items" % items) + ").", "task": tid, "w": 3,
                  "status": "needs-reassessment" if lv == "c2" else "source-checked", "rev": TODAY, "mastery": mastery("dele", comp, lv), "pre": []})
DELE = {lv: {"time": d["time"], "prep": d.get("prep", {}), "papers": d.get("papers")} for lv, d in D.items()}

# ---------- Master Topic-to-Skills Mapping defaults (internal targets, %) ----------
SKILLMAP = {
 "defaults": {
  "unit": {"gra": 35, "voc": 15, "rea": 10, "lis": 10, "wex": 15, "oex": 5, "oint": 5, "pro": 5},
  "guide": {"gra": 45, "rea": 10, "wex": 20, "lis": 10, "oex": 10, "voc": 5},
  "guide:pronunciacion": {"lis": 30, "oex": 30, "wex": 15, "rea": 15, "gra": 10},
  "guide:conectores": {"dis": 40, "wex": 25, "rea": 20, "gra": 15},
  "guide:modismos": {"voc": 40, "pra": 25, "lis": 15, "oint": 10, "rea": 10},
  "guide:tener-hacer-dar-echar": {"voc": 45, "gra": 20, "rea": 15, "wex": 10, "oint": 10}},
 "note": "Targets are this app's design choices for how practice time in a topic should be shared out. Change them in tools/curric/build_register.py; they are not official weights.",
 "rev": TODAY}
_TP = json.load(open(os.path.join(T, "topics.json"), encoding="utf-8"))
SKILLMAP["topics"] = {}
for tid in _TP["topics"]:
    if tid.startswith("guia-"): SKILLMAP["topics"][tid] = dict(SKILLMAP["defaults"].get("guide:" + tid[5:], SKILLMAP["defaults"]["guide"]))
    else: SKILLMAP["topics"][tid] = dict(SKILLMAP["defaults"]["unit"])
SKILLMAP["mapped"] = _TP["mapped"]
# minutes of learner time per activity type (used to weight practice, so a multiple-choice item never counts as much as a speaking task)
EFFORT = {"mc": 0.4, "x": 0.6, "fix": 0.8, "tr": 1.2, "deck": 3, "listen": 5, "read": 6, "video": 4, "roleplay": 6, "speak": 4, "write": 20, "exam-q": 1.5, "exam-write": 25, "exam-oral": 6}
# which competencies each activity type exercises, and how (share of the activity's time)
ACT_COMP = {"mc": {"gra": .6, "rea": .4}, "x": {"gra": .7, "wex": .3}, "fix": {"gra": .6, "wex": .4}, "tr": {"gra": .3, "voc": .3, "wex": .4},
            "deck": {"voc": 1}, "listen": {"lis": .85, "voc": .15}, "read": {"rea": .85, "voc": .15}, "video": {"lis": 1}, "roleplay": {"oint": .7, "pra": .2, "pro": .1},
            "speak": {"oex": .75, "dis": .15, "pro": .1}, "write": {"wex": .6, "dis": .2, "wint": .2}}
QA = {"rules_version": "2026-11-15", "critical_cap": 59, "weights": {"align": 12, "cover": 14, "variety": 6, "balance": 8, "difficulty": 6, "accuracy": 12, "audio": 6, "validity": 12, "feedback": 8, "progress": 6, "retention": 5, "tech": 5},
      "thresholds": {"taught_examples": 2, "practice_items_grammar": 5, "practice_skill_activities": 3, "assessed_items_grammar": 1, "assessed_skill_tasks": 1, "mc_share_max": 0.5, "deviation_flag": 15, "review_months": 12}}

out = {"built": TODAY, "sources": SOURCES, "comps": COMP, "outcomes": O, "tasks": TASKS, "dele": DELE, "skillmap": SKILLMAP, "effort": EFFORT, "act_comp": ACT_COMP, "qa": QA}
# validation of the register itself
ids = [o["id"] for o in O]; assert len(ids) == len(set(ids)), "duplicate outcome ids"
for o in O:
    assert o["src"] in SOURCES and o["lvl"] in LV and o["comp"] in [c[0] for c in COMP], o["id"]
    for p in o["pre"]: assert p in ids, (o["id"], p)
    if "kw" in o: re.compile(o["kw"])
json.dump(out, open(os.path.join(T, "register.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=0)
print("register:", len(O), "outcomes,", len(TASKS), "DELE tasks,", len(SOURCES), "sources")
