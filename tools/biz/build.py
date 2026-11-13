import json, re, sys, unicodedata
sys.path.insert(0, "/home/claude/app")
from pro_decks import BUSINESS, FINANCE
D = json.load(open("/home/claude/ruta-dele/dictdata/es-en.json"))
html = open("/home/claude/ruta-dele/index.html", encoding="utf-8").read()
W = json.loads(re.search(r"const W = (\[.*?\]);\n", html, re.S).group(1))
VOC = json.loads(re.search(r"const VOCAB = (\{.*?\});\n", html, re.S).group(1))
TG = json.loads(re.search(r"const TG = (\{.*?\});\n", html, re.S).group(1))
NF = D["nf"]
rank = {}
for i in range(NF):
    for h in D["L"][i][0].split(", "):
        rank.setdefault(h.lower(), i)
ART = r"^(el|la|los|las|un|una|el/la|los/las)\s+"
def key(es):
    s = es.lower().strip().split(" / ")[0]
    s = re.sub(r"\s*\(.*?\)", "", s)
    s = re.sub(ART, "", s)
    s = re.sub(r"/(a|as|os|la|el)\b", "", s)  # abogado/a -> abogado
    s = re.sub(r"[¿?¡!.,:;…]", "", s)
    return re.sub(r"\s+", " ", s).strip()
STOP = set("de del el la los las un una y o a al en con por para que se su sus lo le me te nos sin sobre como más muy".split())
def wrank(w):
    w = w.lower()
    for c in (w, re.sub(r"(es|s)$", "", w), (TG.get(w) or [""])[0].lower()):
        if c and c in rank: return rank[c]
    return 26000
DOM = re.compile(r"\b(business|compan|firm|corporat|enterprise|entrepreneur|financ|money|monetar|bank|loan|credit|debt|invest|stock|share|bond|market|trad|commerc|merchant|sale|sell|buy|purchas|price|cost|expens|budget|profit|revenue|income|earn|salar|wage|pay|tax|account|audit|fiscal|econom|capital|asset|liabilit|equity|dividend|inflation|currenc|insur|contract|negotiat|deal|client|customer|supplier|employ|staff|hire|recruit|resign|dismiss|manag|director|executive|boss|meeting|office\\b|offices|desk|clerk|secretar|document|report|invoice|receipt|bill|warehouse|inventor|ship|export|import|customs|tariff|logistic|suppl|deliver|product|industr|factory|manufactur|brand|advertis|promot|consumer|competit|strateg|project|plan|schedule|agenda|presentation|proposal|partner|subsidiar|headquarter|franchise|merger|acqui|bankrupt|fund|saving|deposit|withdraw|cheque|cash|dollar|wealth|mortgage|lease|rent|propert|retail|wholesale|commission|fee|discount|quot|forecast|growth|recession|job|work|career|profession|labo|union|strike|pension|retire|bonus|computer|email|printer|signature|lawyer|regulat|licen|patent|treasur|broker|agent|consult|analy|statistic|data|percent|rate|margin)", re.I)
def dom(w):
    i = rank.get(w)
    return i is not None and bool(DOM.search(D["L"][i][2].split(";")[0]))
def score(es):
    k = key(es); ws = [w for w in re.findall(r"[a-záéíóúüñ]+", k) if w not in STOP and len(w) > 2]
    if not ws: return 30000
    if len(k.split()) == 1: return wrank(ws[0]) + (0 if dom(ws[0]) else 4000)
    return max(wrank(w) for w in ws) + 1500
items = {}
def add(es, en, src):
    k = key(es)
    if not k or len(k) > 60: return
    if k in items:
        if src != "dict" and items[k]["src"] == "dict": items[k].update(es=es, en=en, src=src)  # hand-written wording wins
        return
    items[k] = {"es": es, "en": en, "src": src, "score": score(es)}
# 1) ranked single words from the dictionary
noise = set(open("noise.txt", encoding="utf-8").read().split()) - {"inmueble","obligación","tasa","licencia","proporción","fábrica","pacto","exportador","delegado","apoderado","resguardo","cédula"}
for i, w, pos, g in json.load(open("pool.json")):
    if w in noise: continue
    en = re.sub(r"\s*\(.*?\)", "", g.split(";")[0]); en = ", ".join(en.split(", ")[:3])
    add(w, en, "dict")
# 2) hand-written terms
for d in (BUSINESS, FINANCE):
    for t in d["themes"]:
        for es, en in t["w"]: add(es, en, "pro")
for line in open("extra.txt", encoding="utf-8").read().splitlines() + open("extra2.txt", encoding="utf-8").read().splitlines() + open("extra3.txt", encoding="utf-8").read().splitlines() + open("extra4.txt", encoding="utf-8").read().splitlines():
    line = line.strip()
    if line and not line.startswith("#"):
        es, en = line.split("|"); add(es, en, "extra")
SKIPTH = {"El trabajo y las profesiones"}  # jobs in general (doctor, police…), not business
for lv, arr in VOC.items():
    for t in arr:
        if t["t"] not in SKIPTH and re.search(r"trabaj|emple|econom|finanz|oficina|negoci|empresa|banc|dinero|comerc|profesi|laboral|consum|mercado|precios y pagos|gestión", t["t"] + " " + t.get("en", ""), re.I):
            for w in t["w"]:
                if len(w) >= 2 and not re.search(r"___|\(Esp\.|queda|talla|probador|ropa|camis|zapat|vestido|pantal", w[0] + " " + w[1], re.I) and (len(key(w[0]).split()) > 1 or dom(key(w[0])) or DOM.search(w[1])): add(w[0], w[1], "course")
allit = sorted(items.values(), key=lambda x: (x["score"], x["es"]))
print("candidates", len(allit))
top = allit[:2000]
# the 7,000-word list: add only what it doesn't have
wkeys = set(); widx = {}
for i, e in enumerate(W):
    for h in e[0].split(", "): wkeys.add(key(h)); widx.setdefault(key(h), i)
wbiz = []
wadd = []
for it in top:
    k = key(it["es"])
    if k in wkeys:
        if k in widx and widx[k] not in wbiz: wbiz.append(widx[k])
        continue
    wkeys.add(k)
    multi = len(k.split()) > 1
    pos = "expr" if multi else (next((D["L"][i][1] for i in [rank.get(k)] if i is not None), "noun"))
    wadd.append([k if multi else k, pos, it["en"], ""]); wbiz.append(-len(wadd))  # new entry: its place in the additions
print("in deck", len(top), "already in the 7,000 list", len(top) - len(wadd), "added to the list", len(wadd))
json.dump({"deck": [[it["es"], it["en"]] for it in top], "wadd": wadd, "wbiz": list(dict.fromkeys(wbiz))}, open("bizout.json", "w", encoding="utf-8"), ensure_ascii=False)
print("first 40:", ", ".join(x["es"] for x in top[:40]))
print("around 1000:", ", ".join(x["es"] for x in top[1000:1015]))
print("last 15:", ", ".join(x["es"] for x in top[-15:]))
print("cut off just after:", ", ".join(x["es"] for x in allit[2000:2015]))
