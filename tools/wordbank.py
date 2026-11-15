"""Spanish word bank from Wiktionary (via kaikki.org / wiktextract, CC BY-SA). tools/WORDBANK_BRIEF.md
Builds dictdata/es-xp.json: multi-word expressions (idioms, set phrases, proverbs) and words with a register or region label
(colloquial, slang, vulgar…; Panama, Mexico, Spain…), each with its English meaning, labels and an example.
Then measures coverage against the Spanish in the app (lessons, readings, exams, grammar data).
Usage: python3 tools/wordbank.py kaikki-Spanish.jsonl out_dir"""
import json, re, sys, os, collections, glob, gzip

SRC, OUT = sys.argv[1], sys.argv[2]
os.makedirs(OUT, exist_ok=True)

REG = {"colloquial": "col", "informal": "col", "slang": "slg", "vulgar": "vul", "derogatory": "der", "offensive": "der", "pejorative": "der",
       "humorous": "hum", "euphemistic": "eup", "familiar": "col", "childish": "col", "endearing": "aff", "affectionate": "aff", "Internet": "net", "dated": "old", "archaic": "arc", "obsolete": "arc", "rare": "rar"}
PLACES = ["Panama", "Mexico", "Spain", "Argentina", "Uruguay", "Chile", "Peru", "Colombia", "Venezuela", "Ecuador", "Bolivia", "Paraguay", "Cuba",
          "Puerto Rico", "Dominican Republic", "Costa Rica", "Nicaragua", "Honduras", "El Salvador", "Guatemala", "Central America", "Caribbean",
          "Latin America", "Rioplatense", "Andes", "Canary Islands", "Philippines", "US", "United States", "Equatorial Guinea", "Andalusia", "Mexico City"]
PLACE_N = {p.lower().replace(" ", "-"): p for p in PLACES}
PLACE_N.update({p.lower(): p for p in PLACES}); PLACE_N.update({"latin-america": "Latin America", "south-america": "South America", "spanish-america": "Latin America", "us": "US"})
CAT_PLACE = re.compile(r"^(Panamanian|Mexican|European|Peninsular|Argentine|Argentinian|Uruguayan|Chilean|Peruvian|Colombian|Venezuelan|Ecuadorian|Bolivian|Paraguayan|Cuban|Puerto Rican|Dominican Republic|Costa Rican|Nicaraguan|Honduran|Salvadoran|Guatemalan|Central American|Caribbean|Latin American|Rioplatense|Andean|Canarian|Philippine|US|Equatorial Guinean|Andalusian) Spanish$")
CAT_MAP = {"Panamanian": "Panama", "Mexican": "Mexico", "European": "Spain", "Peninsular": "Spain", "Argentine": "Argentina", "Argentinian": "Argentina", "Uruguayan": "Uruguay",
           "Chilean": "Chile", "Peruvian": "Peru", "Colombian": "Colombia", "Venezuelan": "Venezuela", "Ecuadorian": "Ecuador", "Bolivian": "Bolivia", "Paraguayan": "Paraguay", "Cuban": "Cuba",
           "Puerto Rican": "Puerto Rico", "Dominican Republic": "Dominican Republic", "Costa Rican": "Costa Rica", "Nicaraguan": "Nicaragua", "Honduran": "Honduras", "Salvadoran": "El Salvador",
           "Guatemalan": "Guatemala", "Central American": "Central America", "Caribbean": "Caribbean", "Latin American": "Latin America", "Rioplatense": "Rioplatense", "Andean": "Andes",
           "Canarian": "Canary Islands", "Philippine": "Philippines", "US": "US", "Equatorial Guinean": "Equatorial Guinea", "Andalusian": "Spain"}
SKIP_POS = {"name", "character", "symbol", "suffix", "prefix", "infix", "interfix", "abbrev", "romanization"}

def cats(s):
    out = []
    for c in s.get("categories", []) or []:
        n = c.get("name") if isinstance(c, dict) else c
        if n: out.append(n)
    return out

def labels(sense, entry):
    tags = set((sense.get("tags") or []) + (sense.get("raw_tags") or []))
    reg = sorted({REG[t] for t in tags if t in REG})
    where = set()
    for t in tags:
        k = t.lower()
        if k in PLACE_N: where.add(PLACE_N[k])
    for c in cats(sense):
        m = CAT_PLACE.match(c)
        if m: where.add(CAT_MAP[m.group(1)])
    return reg, sorted(where)

def clean_gloss(g):
    g = re.sub(r"\s+", " ", g).strip()
    return g[:160] + ("…" if len(g) > 160 else "")

phr, words, stats = {}, {}, collections.Counter()
FORMS = {}
place_n, reg_n = collections.Counter(), collections.Counter()
samples = collections.defaultdict(list)
op = gzip.open if SRC.endswith(".gz") else open
with op(SRC, "rt", encoding="utf-8") as f:
    for line in f:
        try: e = json.loads(line)
        except Exception: continue
        if e.get("lang_code") != "es": continue
        stats["entries"] += 1
        w, pos = e.get("word", ""), e.get("pos", "")
        if not w or pos in SKIP_POS: continue
        senses = []; nsense = 0
        for s in e.get("senses", []) or []:
            for fo in (s.get("form_of") or []) + (s.get("alt_of") or []):
                if fo.get("word") and " " not in w: FORMS.setdefault(w.lower(), fo["word"].lower())
            if s.get("form_of") or s.get("alt_of"): continue
            nsense += 1
            gl = s.get("glosses") or []
            if not gl: continue
            g = gl[-1]
            if re.match(r"^Used other than (figuratively|idiomatically)|^Used other than with a postpositional", g, re.I): continue
            if re.match(r"^(inflection|plural|feminine|masculine|alternative (form|spelling)|obsolete (form|spelling)|misspelling) of ", g, re.I): continue
            reg, where = labels(s, e)
            ex = None
            for x in s.get("examples", []) or []:
                t, en = x.get("text"), x.get("english") or x.get("translation")
                if t and en and len(t) < 160: ex = [t, en[:160]]; break
            senses.append((clean_gloss(g), reg, where, ex))
        if not senses: continue
        multi = " " in w.strip() and not w[0].isupper()
        if multi:
            stats["phrases"] += 1
            k = w.lower()
            cur = phr.get(k)
            reg = sorted({r for s in senses for r in s[1]}); where = sorted({p for s in senses for p in s[2]})
            gl = "; ".join(dict.fromkeys(s[0] for s in senses[:3]))
            ex = next((s[3] for s in senses if s[3]), None)
            if cur: cur[2] = (cur[2] + "; " + gl)[:300]; cur[3] = sorted(set(cur[3]) | set(reg)); cur[4] = sorted(set(cur[4]) | set(where))
            else: phr[k] = [w, pos, gl, reg, where, ex]
            for p in where: place_n[p] += 1
            for r in reg: reg_n[r] += 1
            if "Panama" in where and len(samples["Panama phrases"]) < 25: samples["Panama phrases"].append(w + " = " + gl[:60])
        else:
            lab = [(g, r, p) for g, r, p, x in senses if (set(r) - {"old", "arc", "rar"}) or p]
            if not lab: continue
            stats["labelled words"] += 1
            k = w.lower()
            reg = sorted({r for g, r, p in lab for r in r}); where = sorted({x for g, r, p in lab for x in p})
            gl = "; ".join(dict.fromkeys(g for g, r, p in lab[:3]))[:240]
            forms = sorted({x.get("form") for x in (e.get("forms") or []) if x.get("form") and " " not in x.get("form") and x.get("form") != w and pos in ("noun", "adj")} )[:6]
            primary = len(lab) == len(senses)
            if k in words: words[k][5] = words[k][5] and primary; words[k][1] = (words[k][1] + "; " + gl)[:300]; words[k][2] = sorted(set(words[k][2]) | set(reg)); words[k][3] = sorted(set(words[k][3]) | set(where))
            else: words[k] = [pos, gl, reg, where, forms, primary]
            for p in where: place_n["w:" + p] += 1
            if "Panama" in where and len(samples["Panama words"]) < 40: samples["Panama words"].append(w + " = " + gl[:60])
            if "slg" in reg and len(samples["slang"]) < 25: samples["slang"].append(w + " [" + ",".join(where) + "] = " + gl[:50])

# drop phrases that are only archaic/rare
P = [v for v in phr.values() if not (set(v[3]) and set(v[3]) <= {"old", "arc", "rar"})]
W = {k: v for k, v in words.items() if not (set(v[2]) and set(v[2]) <= {"old", "arc", "rar"} and not v[3])}
bank = {"v": 1, "src": "Wiktionary (CC BY-SA 4.0) via kaikki.org/wiktextract", "P": P, "W": W}
js = json.dumps(bank, ensure_ascii=False, separators=(",", ":"))
open(os.path.join(OUT, "es-xp.json"), "w").write(js)

# ---------- coverage against the app's own Spanish ----------
def app_texts():
    T = []
    for fn in glob.glob("examdata/*.json") + glob.glob("gramdata/*.json") + glob.glob("verbdata/*.json")[:3]:
        try: d = json.load(open(fn))
        except Exception: continue
        def walk(x):
            if isinstance(x, str): T.append(x)
            elif isinstance(x, dict): [walk(v) for v in x.values()]
            elif isinstance(x, list): [walk(v) for v in x]
        walk(d)
    html = open("index.html", encoding="utf-8").read()
    for m in re.finditer(r'"((?:[^"\\\n]|\\.){12,})"', html): T.append(m.group(1))
    sp = re.compile(r"\b(el|la|los|las|que|de|en|un|una|por|para|con|es|está|muy|pero|como|más|se)\b", re.I)
    en = re.compile(r"\b(the|and|with|you|your|this|is|are|to|of|for|it|in|on|or|not|use|also|before|noun|verb)\b", re.I)
    return [t for t in T if len(sp.findall(t)) >= 3 and len(en.findall(t)) == 0 and not re.search(r"[{};=<>]|function", t)]
texts = app_texts(); corpus = " \n ".join(t.lower() for t in texts)
lex = json.load(open("dictdata/es-en.json")); F = set()
for e in lex["L"]:
    base = e[0].split(", ")[0]
    for l in e[0].split(", "): F.add(l.lower())
    if len(e) > 3 and e[3]:
        for x in e[3].split("|"):
            if x.startswith("~"): F.add(x[1:].lower())
            else:
                m = re.match(r"^(\d+)(.*)$", x)
                if m: F.add((base[:len(base) - int(m.group(1))] + m.group(2)).lower())
VF = set()
for fn in glob.glob("verbdata/*.json"):
    try: VF.update(re.findall(r'"([a-záéíóúüñ]{2,})"', open(fn).read().lower()))
    except Exception: pass
toks = re.findall(r"[a-záéíóúüñ]+", corpus); tc = collections.Counter(toks)
old = lambda t: t in F or t in VF
known_old = sum(n for t, n in tc.items() if old(t)); known_new = sum(n for t, n in tc.items() if old(t) or t in W or t in FORMS)
miss = [(t, n) for t, n in tc.most_common() if not old(t) and t not in W and t not in FORMS][:80]
newly = [(t, n, FORMS.get(t) or "") for t, n in tc.most_common() if not old(t) and (t in W or t in FORMS)][:60]
def hits(keys):
    n = 0; found = []
    for k in keys:
        if len(k) < 5: continue
        c = len(re.findall(r"(?<![a-záéíóúüñ])" + re.escape(k) + r"(?![a-záéíóúüñ])", corpus))
        if c: n += c; found.append((k, c))
    return n, sorted(found, key=lambda x: -x[1])
old_phr = [e[0].lower() for e in lex["L"] if " " in e[0] and "," not in e[0]]
ho, fo = hits(old_phr); hn, fn_ = hits([p[0].lower() for p in P])
slang_in = sorted(((t, n, W[t][1][:50]) for t, n in tc.items() if t in W and W[t][5]), key=lambda x: -x[1])[:60]
fo = {k: v for k, v in FORMS.items() if not old(k)}
open(os.path.join(OUT, "es-forms.json"), "w").write(json.dumps(fo, ensure_ascii=False, separators=(",", ":")))
stats["forms_total"] = len(FORMS); stats["forms_new"] = len(fo)
rep = {"entries": stats["entries"], "phrases_kept": len(P), "labelled_words_kept": len(W), "size_mb": round(len(js) / 1e6, 2),
       "phrases_by_register": dict(reg_n.most_common()), "places_top": dict(place_n.most_common(40)),
       "coverage": {"app_text_strings": len(texts), "word_tokens": len(toks), "known_before": round(known_old / max(1, len(toks)) * 100, 2), "known_after": round(known_new / max(1, len(toks)) * 100, 2),
                    "expressions_found_before": ho, "expressions_found_after": hn, "distinct_expressions_after": len(fn_), "top_expressions": fn_[:60], "unknown_words_top": miss, "newly_known_top": newly, "forms_total": stats["forms_total"], "forms_new_to_app": stats["forms_new"],
                    "colloquial_words_in_app": slang_in},
       "samples": samples}
open(os.path.join(OUT, "report.json"), "w").write(json.dumps(rep, ensure_ascii=False, indent=1))
print("REPORT " + json.dumps(rep, ensure_ascii=False))
