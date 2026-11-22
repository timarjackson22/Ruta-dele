"""Popularity ranks for every word bank entry past the 7,000 ranked words (core, business and topic words).
Source: FrequencyWords es_50k (Hermit Dave, OpenSubtitles 2018, CC BY-SA 4.0), the same family of data as the 7,000 list.
Each entry gets an estimated frequency: a single word = its count plus the counts of its listed forms (and plural -s/-es);
a phrase = its rarest content word / 20 (phrases are rarer than their parts). Entries that are the same word as one of the 7,000 share its rank; the rest are numbered 7001… by that
estimate, so every word in the bank has a rank. Run: python3 tools/wordbank/rank_extra.py index.html  → tools/wordbank/ranks.json"""
import sys, os, json, re, unicodedata, urllib.request
D = os.path.dirname(os.path.abspath(__file__)); SRC = "/tmp/fq/es_50k.txt"
if not os.path.exists(SRC):
    os.makedirs("/tmp/fq", exist_ok=True)
    urllib.request.urlretrieve("https://raw.githubusercontent.com/hermitdave/FrequencyWords/master/content/2018/es/es_50k.txt", SRC)
cnt = {}
for line in open(SRC, encoding="utf-8"):
    p = line.split()
    if len(p) == 2: cnt[p[0].lower()] = int(p[1])
s = open(sys.argv[1], encoding="utf-8").read()
def arr(after, stop=")"):
    i = s.index(after) + len(after); j = s.index("\n", i); return json.loads(s[i:j].rstrip().rstrip(";").rstrip(")"))
W = arr("const W = ") + arr("const WBIZ0 = W.length; W.push(...")
i = s.index("/* ==WTHEME== */ const WTH0 = W.length; W.push(...") + len("/* ==WTHEME== */ const WTH0 = W.length; W.push(...")
dec = json.JSONDecoder(); W += dec.raw_decode(s[i:])[0]
WN = 7000; STOP = {"el", "la", "los", "las", "un", "una", "de", "del", "a", "al", "en", "y", "o", "con", "por", "para", "se", "que", "lo", "su", "sus", "mi", "tu"}
def one(t):
    t = t.lower(); c = cnt.get(t, 0)
    for suf in ("s", "es"): c += cnt.get(t + suf, 0) // 2
    return c
def est(e):
    best = 0
    for v in (e[0].split(",") if e[1] not in ("expr", "interj") else [e[0]]):
        v = re.sub(r"\([^)]*\)|[¡!¿?.…'\"«»]", " ", v).strip().lower()
        toks = [t for t in re.split(r"[\s/]+", v) if t]
        cont = [t for t in toks if t not in STOP] or toks
        if not cont: continue
        if len(cont) == 1:
            f = one(cont[0]) + sum(cnt.get(x.strip().lower(), 0) for x in (e[3] or "").split(",") if x.strip() and " " not in x.strip())
        else:
            f = min(one(t) for t in cont) / 20
        best = max(best, f)
    return best
# a word already in the 7,000 (another part of speech, a business or topic copy) shares that word's rank
twin = {}
for k in range(WN):
    for v in W[k][0].split(","):
        twin.setdefault(v.strip().lower(), k + 1)
ranks = [0] * (len(W) - WN)
for k in range(WN, len(W)):
    r = twin.get(W[k][0].split(",")[0].strip().lower())
    if r: ranks[k - WN] = r
extra = [k for k in range(WN, len(W)) if not ranks[k - WN]]
sc = {k: est(W[k]) for k in extra}
# a word as common as part of the 7,000 gets the rank it would have among them (the 7,000's own estimates, from the same
# counts); rarer ones continue after 7,000 in order of frequency
import bisect
base = sorted(est(W[k]) for k in range(WN))  # ascending
floor = base[int(len(base) * 0.05)]          # the rarest 5 % of the 7,000: below this a word counts as rarer than the list
tail = []
for k in extra:
    f = sc[k]
    if f > floor: ranks[k - WN] = max(1, WN - bisect.bisect_left(base, f))
    else: tail.append(k)
order = sorted(tail, key=lambda k: (-sc[k], k))
for n, k in enumerate(order): ranks[k - WN] = WN + 1 + n
json.dump({"n": len(W), "ranks": ranks}, open(os.path.join(D, "ranks.json"), "w"), separators=(",", ":"))
print(len(W), "entries;", len(W) - WN - len(extra), "share a top-7,000 rank;", len(extra) - len(tail), "placed among the 7,000;", len(tail), "ranked 7001–" + str(WN + len(tail)), "; no frequency data:", sum(1 for k in extra if not sc[k]))
print("top:", [W[k][0] for k in order[:12]]); print("bottom:", [W[k][0] for k in order[-8:]])
