# shared pieces for the DELE A1 exams (format DELE A1, version 2020)
FORMAT = {
    "pass": "60/100 to pass, with at least 30/50 in each group (Group 1: reading + writing; Group 2: listening + speaking)",
    "lectura": "45 min · 4 tasks · 25 questions", "auditiva": "20 min · 4 tasks · 25 questions",
    "escritura": "25 min · 2 tasks", "oral": "15 min + 15 min prep · 4 tasks",
    "mins": {"lectura": 45, "auditiva": 20, "escritura": 25, "oral": 15},
}

def mc(q, o, a):
    return {"q": q, "o": o, "a": a}

def L1(text, qs, h=""):
    return {"t": "Tarea 1", "ins": "Lea el texto y conteste a las preguntas. Seleccione la opción correcta (a, b o c).", "en": "Read the text and answer questions 1–5. Choose a, b or c.", "texts": [{"h": h, "b": text}], "q": qs}

def L2(notices, qs):
    return {"t": "Tarea 2", "ins": "Lea estos anuncios y conteste a las preguntas. Seleccione la opción correcta (a, b o c).", "en": "Read the notices and answer questions 6–11.", "texts": [{"h": "Anuncio " + str(i + 1), "b": n} for i, n in enumerate(notices)], "q": qs}

def L3(intro, people, opts, answers):
    return {"t": "Tarea 3", "ins": intro + " Relacione cada persona con el texto adecuado. Hay tres textos que no debe seleccionar.", "en": "Match each person (12–17) with the right option. Three options are not used.",
            "texts": [{"h": p[0], "b": p[1]} for p in people], "opts": opts, "q": [{"q": "**" + people[i][0] + "**", "a": answers[i]} for i in range(len(people))]}

def L4(text, qs, h=""):
    return {"t": "Tarea 4", "ins": "Lea el texto y conteste a las preguntas. Seleccione la opción correcta (a, b o c).", "en": "Read the text and answer questions 18–25.", "texts": [{"h": h, "b": text}], "q": qs}

def A1t(dialogues, qs):  # five short dialogues
    audio = []
    for i, d in enumerate(dialogues):
        audio.append("Diálogo " + str(i + 1) + ".")
        audio += d
    return {"t": "Tarea 1", "ins": "Va a escuchar cinco diálogos breves. Escuchará cada diálogo dos veces. Después conteste a las preguntas. Seleccione la opción correcta (a, b o c).", "en": "Five short conversations, each played twice. Answer questions 1–5.", "audio": audio, "q": qs}

def A2t(msgs, qs):  # five announcements / messages
    audio = []
    for i, m in enumerate(msgs):
        audio.append("Mensaje " + str(i + 1) + ".")
        audio.append(m)
    return {"t": "Tarea 2", "ins": "Va a escuchar cinco anuncios o mensajes. Escuchará cada uno dos veces. Seleccione la opción correcta (a, b o c).", "en": "Five announcements or voice messages, each played twice. Answer questions 6–10.", "audio": audio, "q": qs}

def A3t(intro, conv, opts, items, answers):  # a conversation, match items to options
    return {"t": "Tarea 3", "ins": intro + " Relacione cada elemento con la opción correcta. Hay opciones que no debe seleccionar.", "en": "A conversation, played twice. Match items 11–18 with the options.",
            "audio": conv, "opts": opts, "q": [{"q": items[i], "a": answers[i]} for i in range(len(items))]}

def A4t(msgs, qs):  # seven short messages, catch the detail
    audio = []
    for i, m in enumerate(msgs):
        audio.append("Número " + str(i + 1) + ".")
        audio.append(m)
    return {"t": "Tarea 4", "ins": "Va a escuchar siete mensajes cortos. Escuchará cada uno dos veces. Seleccione la opción correcta (a, b o c).", "en": "Seven short messages, each played twice. Catch the detail: numbers, times, places. Questions 19–25.", "audio": audio, "q": qs}

def P(es, en, kw):
    return {"es": es, "en": en, "kw": kw}

def W1(task, form):
    return {"t": "Tarea 1", "ins": "Complete el formulario.", "en": "Fill in the form with your details.", "task": task, "form": form}

def W2(task_es, task_en, typ, reg, points, model):
    return {"t": "Tarea 2", "ins": task_es + " Número de palabras: entre 30 y 40.", "en": task_en + " (30–40 words)", "task": task_es, "type": typ, "reg": reg, "words": [30, 40], "points": points, "model": model}

O1 = {"t": "Tarea 1", "ins": "Presentación personal. Hable sobre usted durante 1 o 2 minutos: nombre, edad, nacionalidad, dónde vive, idiomas, profesión o estudios y aficiones.", "en": "Introduce yourself for 1–2 minutes.",
      "task": "Presentación personal del candidato", "prep": 0, "speak": 1.5, "words": [60, 160],
      "points": [P("nombre", "your name", ["me llamo", "mi nombre"]), P("edad", "age", ["anos"]), P("nacionalidad u origen", "nationality or origin", ["soy de", "soy ", "vengo de"]),
                 P("dónde vive", "where you live", ["vivo"]), P("idiomas", "languages", ["hablo", "idioma", "ingles", "espanol"]), P("trabajo o estudios", "job or studies", ["trabajo", "estudio", "soy profesor", "soy estudiante", "soy ingenier", "soy medic"]),
                 P("aficiones", "hobbies", ["me gusta", "en mi tiempo libre", "me encanta"])],
      "model": "Hola, me llamo Daniel y tengo veintiocho años. Soy canadiense, de Toronto, pero ahora vivo en Panamá. Hablo inglés, francés y un poco de español. Trabajo en una empresa de tecnología. En mi tiempo libre me gusta correr y cocinar con mis amigos."}

def O2(topic, prompts, points, model):
    return {"t": "Tarea 2", "ins": "Exposición de un tema. Hable durante 2 o 3 minutos sobre el tema de la lámina. Puede usar las preguntas como guía.", "en": "Talk for 2–3 minutes about the topic on the card.",
            "card": "**" + topic + "**\n" + "\n".join("• " + x for x in prompts), "task": "Exposición: " + topic, "prep": 15, "speak": 2.5, "words": [90, 250], "points": points, "model": model}

def O3(ask):
    return {"t": "Tarea 3", "ins": "Conversación con el entrevistador. Conteste a sus preguntas sobre su presentación y su exposición.", "en": "A conversation: the examiner asks you questions. Answer each one.",
            "ask": ask, "task": "Conversación con el entrevistador: responder a sus preguntas", "prep": 0, "speak": 3, "words": [60, 220], "points": []}

def O4(situation, ask, points, model):
    return {"t": "Tarea 4", "ins": "Diálogos basados en láminas. El entrevistador hace un papel; usted, el otro. Responda y pregunte según la situación.", "en": "Short role-plays: the examiner plays one part, you play the other.",
            "card": situation, "ask": ask, "task": "Diálogo: " + situation.split("\n")[0].replace("**", ""), "prep": 0, "speak": 2.5, "words": [30, 160], "points": points, "model": model}

QKW = ["y tu", "que te", "cuando", "donde", "como estas", "quieres", "tienes", "puedes", "vienes", "te gusta"]
