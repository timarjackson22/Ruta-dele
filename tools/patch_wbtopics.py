"""Word bank (v285): the old «7,000 most-used words» list, renamed, with the learner's textbook topics merged in.
Data: tools/wordbank/themes.py (topics) + tools/synant_data.js (every synonyms & antonyms headword, as one more topic).
Words the list already has are only linked to their topics; new words are appended in the order kept in
tools/wordbank/added.json (append-only), so saved «known» marks (S.w[index]) never move. Re-runnable: a no-op when the
page already matches the sources."""
import sys, os, re, json
_D = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(_D, "wordbank"))
from themes import T
p = sys.argv[1]; s = open(p, encoding="utf-8").read(); s0 = s
dump = lambda x: json.dumps(x, ensure_ascii=False, separators=(",", ":"))

def load_w(src):
    i = src.index("const W = ["); j = src.index("\n", i)
    W = json.loads(src[i + len("const W = "):j].rstrip().rstrip(";"))
    k = src.index("const WBIZ0 = W.length; W.push(..."); l = src.index("\n", k)
    W += json.loads(src[k + len("const WBIZ0 = W.length; W.push(..."):l].rstrip().rstrip(";").rstrip(")"))
    return W
W = load_w(s)
nb = len(W)  # words before the topic block
low = lambda x: x.strip().lower()
idx = {}
for i, e in enumerate(W):
    for h in e[0].split(","):
        idx.setdefault(low(h), i)
for i, e in enumerate(W):
    if e[1] == "noun":
        for f in (e[3] or "").split(","):
            if f.strip(): idx.setdefault(low(f), i)

ART = re.compile(r"^(el/la|los/las|el|la|los|las)\s+")
def fem(word):
    def one(m):
        base, suf = m.group(1), m.group(2)
        if suf == "a": return (base[:-1] + "a") if base[-1] in "oe" else base + "a"
        if suf == "ora": return base + "a"
        if suf == "esa": return base[:-1] + "esa" if base.endswith("e") else base + "esa"
        return base
    return re.sub(r"(\w+)\(-(\w+)\)", one, word)
POS = {"v": "verb", "a": "adj", "x": "expr", "d": "adv"}
def parse(entry):
    entry = entry.strip()
    pos = "noun"
    m = re.match(r"^([vaxd]):", entry)
    if m: pos = POS[m.group(1)]; entry = entry[2:]
    es, en = [x.strip() for x in entry.split("|", 1)]
    label = es
    word = ART.sub("", es)
    forms = ""
    if "(-" in word:
        forms = fem(word); word = re.sub(r"\(-\w+\)", "", word)
        label = ART.sub(lambda m: m.group(1) + " ", es)
        label = re.sub(r"\(-(\w+)\)", r"/\1", label)
    return word.strip(), pos, en, forms, label

reg_p = os.path.join(_D, "wordbank", "added.json")
reg = json.load(open(reg_p, encoding="utf-8")) if os.path.exists(reg_p) else []
regi = {low(r[0]): k for k, r in enumerate(reg)}
themes = []
def place(word, pos, en, forms):
    k = low(word)
    if k in idx and idx[k] < nb: return idx[k]
    if k not in regi:
        regi[k] = len(reg); reg.append([word, pos, en, forms])
    return nb + regi[k]
for es, en, body in T:
    ids, deck = [], []
    for e in [x for x in body.replace("\n", " ").split(";") if x.strip()]:
        word, pos, gl, forms, label = parse(e)
        i = place(word, pos, gl, forms)
        if i not in ids: ids.append(i)
        deck.append([label, gl])
    themes.append([es, en, ids, deck])
# every synonyms & antonyms headword
sa = []
for line in open(os.path.join(_D, "synant_data.js"), encoding="utf-8"):
    line = line.strip().rstrip(",")
    if line.startswith('["'): sa.append(json.loads(line))
ids, deck = [], []
for r in sa:
    i = place(r[0], {"prep": "prep"}.get(r[3], r[3]), r[1], "")
    if i not in ids: ids.append(i)
    deck.append([r[0], r[1]])
themes.append(["Sinónimos y antónimos", "Synonyms & antonyms", ids, deck])
json.dump(reg, open(reg_p, "w", encoding="utf-8"), ensure_ascii=False, indent=0)

from crossthemes import CT
allw = W + [r for r in reg]
tnames = {t[0]: t[2] for t in themes}
def matcher(kw):
    keys = kw.split(); ex = {k.rstrip("*") for k in keys if not k.endswith("*") or len(k) < 6}; pre = [k[:-1] for k in keys if k.endswith("*") and len(k) >= 6]
    def f(gl):
        g = re.sub(r"\([^)]*\)", "", gl.split(";")[0]).lower()
        for w in re.findall(r"[a-z][a-z'-]*", g):
            b = w[:-2] if w.endswith("es") else w[:-1] if w.endswith("s") else w
            if w in ex or b in ex or any(w.startswith(q) for q in pre): return True
        return False
    return f
WCT = []
for key, ic, en, es, tops, kw in CT:
    f = matcher(kw); ids = [i for i, e in enumerate(allw) if e[1] not in ("det", "pron", "conj", "prep", "art", "contr") and f(e[2])]
    seen = set(ids)
    for tn in tops:
        for i in tnames.get(tn, []):
            if i not in seen: seen.add(i); ids.append(i)
    ids.sort(); WCT.append([key, ic, en, es, ids])
# v286: the textbook topics join the theme chips (English names; the topic dropdown is gone)
TOPIC_CHIP = {}  # v290: every topic is folded into a broad theme; synonyms & antonyms have their own page (#sinonimos)
for es_, en_, ids_, deck_ in themes:
    if en_ in TOPIC_CHIP:
        ic_, nm_ = TOPIC_CHIP[en_].split(" ", 1); WCT.append(["t:" + en_, ic_, nm_, es_, sorted(set(ids_))])
block = ("/* ==WTHEME== */ const WTH0 = W.length; W.push(..." + dump(reg) + "); const WTHT = " +
         dump([[t[0], t[1], t[2]] for t in themes]) + "; const WCT = " + dump(WCT) + "; const WTHS = new Set(WTHT.flatMap((t) => t[2])); /* ==/WTHEME== */")
if "/* ==WTHEME== */" in s:
    a = s.index("/* ==WTHEME== */"); b = s.index("/* ==/WTHEME== */") + len("/* ==/WTHEME== */"); s = s[:a] + block + s[b:]
else:
    k = s.index("const WBIZR = "); l = s.index("\n", k); s = s[:l + 1] + block + "\n" + s[l + 1:]
deckjs = "  /* ==WTDECK== */ VPRO.push(" + dump({"id": "temas", "t": "Vocabulario temático", "en": "Topics from your textbook",
          "themes": [{"t": t[0], "en": t[1], "w": t[3]} for t in themes]}) + "); /* ==/WTDECK== */"
if "/* ==WTDECK== */" in s:
    a = s.index("  /* ==WTDECK== */"); b = s.index("/* ==/WTDECK== */") + len("/* ==/WTDECK== */"); s = s[:a] + deckjs + s[b:]
else:
    i = s.index("  const VPRO = "); j = s.index("\n", i); s = s[:j + 1] + deckjs + "\n" + s[j + 1:]

def rep(a, b):
    """apply once: skip when the new text is already there"""
    global s
    if b in s: return
    assert s.count(a) == 1, ("anchor", a[:90], s.count(a)); s = s.replace(a, b)
# topic pool
rep('''  function wvPool() { if (WV.types.length)''', '''  WV.th = -1;
  WV.ct = -1;
  const wvList = () => { if (WV.th >= 0 && WTHT[WV.th]) return WTHT[WV.th][2]; if (WV.ct >= 0 && WCT[WV.ct]) return WV.types.length ? WCT[WV.ct][4].filter((i) => WV.types.includes(POSGRP(W[i][1])) || (WV.types.includes("biz") && WBIZS.has(i))) : WCT[WV.ct][4]; return null; };
  function wvPool() { const L = wvList(); if (L) return L.slice(WV.page * BAND, (WV.page + 1) * BAND); if (WV.types.length)''')
rep('''idx = idx.filter((i) => (!WV.types.length || WV.types''', '''idx = idx.filter((i) => (WV.th >= 0 || WV.ct >= 0 || !WV.types.length || WV.types''')
rep('''(i < WN ? i + 1 : i >= WBIZ0 ?''', '''(i < WN ? i + 1 : i >= WTH0 ? '<span class="core th" title="Word from your textbook topics">topic</span>' : i >= WBIZ0 ?''')
rep('''" matches across all " + W.length.toLocaleString("en") + " words (7,000 most used + core and business words)</p>"''',
    '''" matches across all " + W.length.toLocaleString("en") + " words in the word bank</p>"''')
# the page: new name, topic picker
rep('''<p class="eyebrow">Vocabulary by frequency</p><h1>The 7,000 most-used words</h1><p class="es-sub">Las 7.000 palabras más usadas</p><p class="lead2">The 7,000 most-used Spanish words, ranked by how often they occur in real speech. The first 1,000 cover roughly 80% of everyday conversation. Play a band as continuous audio (Spanish, English, Spanish again), test yourself, and mark the ones you know.</p></div>''',
    '''<p class="eyebrow">Vocabulary · ' + W.length.toLocaleString("en") + ' words</p><h1>Word bank</h1><p class="es-sub">Banco de palabras</p><p class="lead2">The 7,000 most-used words, core and business words, and your textbook topics. Filter by theme or word type, listen, quiz yourself and tick the words you know.</p></div>''')
rep('''" / 7,000</b><div class=\\"bar\\" style=\\"margin-top:6px\\"><i style=\\"width:" + pct + '%"></i></div></div><div><span class="muted">How to study</span><p>Pick a band of 250, or choose word types to study them across all 7,000 (250 per page).''',
    '''" / 7,000 most used</b><div class=\\"bar\\" style=\\"margin-top:6px\\"><i style=\\"width:" + pct + '%"></i></div></div><div><span class="muted">How to study</span><p>200 words a page: move with ‹ Back and Next ›. Choose a topic or word types to narrow the list.''')
rep('''      typeChips() + (WV.types.length ?''', '''      ctChips() + typeChips() + (WV.th < 0 && WV.ct < 0 && WV.types.length ?''')
UI = '''  /* ==WCTUI== */
  function ctChips() {
    const chip = (t, k) => '<button class="btn small" data-act="w-ct" data-k="' + k + '" aria-pressed="' + (k === WV.ct) + '"><span aria-hidden="true">' + t[1] + "</span> " + esc(t[2]) + ' <span class="muted">' + t[4].length.toLocaleString("en") + "</span></button>";
    return '<div class="wsec"><p class="wlab">Themes' + (WV.ct >= 0 ? ' <button class="wclr" data-act="w-ct" data-k="' + WV.ct + '">Clear ✕</button>' : "") + '</p><div class="wct" role="group" aria-label="Themes">' + WCT.map(chip).join("") + "</div></div>";
  }
  document.addEventListener("click", (e) => { const t = e.target.closest && e.target.closest('[data-act="w-ct"]'); if (!t) return; e.stopImmediatePropagation(); const k = +t.dataset.k; WV.ct = WV.ct === k ? -1 : k; WV.th = -1; WV.page = 0; WV.q = ""; WV.quiz = null; wpStop(); const y = scrollY; wordsView(); scrollTo(0, y); const on = document.querySelector('.wct [aria-pressed="true"]'), row = document.querySelector(".wct"); if (on && row) { const r = on.getBoundingClientRect(), q = row.getBoundingClientRect(); row.scrollLeft += r.left - q.left - (q.width - r.width) / 2; } }, true);
  /* ==/WCTUI== */
'''
if '/* ==WCTUI== */' in s:
    a_ = s.index('  /* ==WCTUI== */'); b_ = s.index('/* ==/WCTUI== */') + len('/* ==/WCTUI== */\n'); s = s[:a_] + UI + s[b_:]
else:
    s = s.replace('  function typeChips() {', UI + '  function typeChips() {', 1)
# other names of the list
rep('''id === "w2500" ? "7,000 most-used words (7.000 palabras)"''', '''id === "w2500" ? "Word bank (Banco de palabras)"''')
rep('''["words", "Words", "7,000 palabras", "#palabras",''', '''["words", "Word bank", W.length.toLocaleString("en") + " words · topics", "#palabras",''')
rep('''las 7.000 palabras más usadas.">''', '''un banco de más de 10.000 palabras con temas.">''')
rep('''    if (h === "palabras") return { label: "7.000 palabras", text: "Most-used words list, band " + (WV.band * 250 + 1) + "–" + (WV.band + 1) * 250 + "." };''',
    '''    if (h === "palabras") return { label: "Banco de palabras", text: WV.th >= 0 ? "Word bank, topic " + WTHT[WV.th][0] + "." : WV.ct >= 0 ? "Word bank, theme " + WCT[WV.ct][3] + "." : "Word bank, most-used band " + (WV.band * 250 + 1) + "–" + (WV.band + 1) * 250 + "." };''')
# v285: pages of 200 with ‹ › instead of a grid of band chips (all words, word types or a topic)
a = s.index("  function bandChips() {"); b = s.index("  function knownIn(")
PAGER = '''  function bandChips() {
    if (WV.inf) return "";
    const L = wvList(), typed = !!L || WV.types.length, tot = L ? L.length : WV.types.length ? wvTyped().length : W.length;
    const pages = Math.max(1, Math.ceil(tot / BAND)); let pg = typed ? WV.page : WV.band; if (pg >= pages) { pg = pages - 1; if (typed) WV.page = pg; else WV.band = pg; }
    if (!tot) return '<p class="muted">No words left in these types.</p>';
    const a = pg * BAND + 1, b = Math.min(tot, (pg + 1) * BAND), k = (() => { let n = 0; wvPool().forEach((i) => { if (S.w[i]) n++; }); return n; })();
    if (pages < 2) return "";
    return '<div class="wpager" role="group" aria-label="Pages"><button class="btn" data-act="w-pg" data-d="-1"' + (pg ? "" : " disabled") + ' aria-label="Previous 200 words (' + a + "–" + b + " of " + tot + ')">‹ Back</button>' +
      '<button class="btn" data-act="w-pg" data-d="1"' + (pg < pages - 1 ? "" : " disabled") + ' aria-label="Next 200 words">Next ›</button></div>';
  }
  document.addEventListener("click", (e) => { const t = e.target.closest && e.target.closest('[data-act="w-pg"]'); if (!t || t.disabled) return; e.stopImmediatePropagation();
    const d = +t.dataset.d, bottom = !!t.closest(".wpager.bot"); if (wvList() || WV.types.length) WV.page = Math.max(0, WV.page + d); else WV.band = Math.max(0, WV.band + d);
    WV.q = ""; WV.quiz = null; wpStop(); wordsView(); if (bottom) { const w = document.querySelector(".wpager"); if (w) scrollTo({ top: Math.max(0, w.getBoundingClientRect().top + scrollY - 80) }); } }, true);
'''
s = s[:a] + PAGER + s[b:]
rep('''  const BAND = 250;''', '''  const BAND = 200;''')
rep('''      '<div id="wbody"></div>' +''', '''      '<div id="wbody"></div>' + (WV.q || WV.quiz ? "" : bandChips().replace('class="wpager"', 'class="wpager bot"')) +''')
rep('''>Quiz this band</button>''', '''>Quiz this page</button>''')
rep(''' · 250 per page</p>"''', ''' · 200 per page</p>"''')
CSS = '''
.wpager { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin: 8px 0 } .wpager > span { text-align: center; line-height: 1.25 } .wpager .btn { min-width: 110px } .wpager .btn[disabled] { opacity: .35 }
.core.th { background: color-mix(in srgb, #2e9d6a 16%, transparent); color: #1f7a50 }
.wct { display: flex; flex-wrap: nowrap; scroll-snap-type: x proximity; overflow-x: auto; scrollbar-width: none; gap: 6px; align-items: center; margin: 4px -4px 8px; padding: 2px 4px } .wct::-webkit-scrollbar { display: none } .wct .btn { flex: none; white-space: nowrap }
.wth { display: flex; flex-wrap: wrap; align-items: center; gap: 8px 10px; margin: 4px 0 10px } .wth select { flex: 1 1 240px; min-width: 0; max-width: 100%; padding: 9px 10px; border-radius: 12px; border: 1px solid var(--line); background: var(--surface); color: var(--ink); font: inherit }
'''
if ".core.th {" not in s:
    k = s.index("\n", s.index(".core.biz {")); s = s[:k + 1] + CSS.lstrip("\n") + s[k + 1:]
# v285: the word bank needs no tab bar; the word player sits flush at the bottom; ranks never break digit by digit
WBF = '''<style id="wb-frame">
body[data-sec="palabras"] .tabbar, body[data-sec="palabras"] #tabpeek, body[data-sec="palabras"] #px-dock { display: none !important }
body[data-sec="palabras"] .stack > .player { position: sticky !important; bottom: 0 !important; margin-bottom: 0 !important; border-radius: 16px 16px 0 0 !important; padding-bottom: calc(10px + env(safe-area-inset-bottom, 0px)) !important }
body[data-sec="palabras"] .ebar > div + div { display: none }
.rk .core.inf { color: #6d4bd0; background: color-mix(in srgb, #8b5cf6 13%, transparent); white-space: nowrap }
body[data-sec="palabras"] .winf-note { margin: 0 0 8px }
body[data-sec="palabras"] table.words th:nth-child(5), body[data-sec="palabras"] table.words td:nth-child(5) { display: none !important }
body[data-sec="palabras"] .ebar { grid-template-columns: 1fr }
.wsec { margin: 2px 0 10px } .wlab { margin: 0 0 6px; font-size: .74rem; font-weight: 800; letter-spacing: .06em; text-transform: uppercase; color: var(--muted); display: flex; align-items: center; gap: 8px }
.wclr { border: 0; background: none; color: var(--cobalt, #2f6fd6); font: inherit; font-size: .74rem; letter-spacing: .04em; cursor: pointer; padding: 0 }
body[data-sec="palabras"] .wct { display: grid; grid-auto-flow: column; grid-template-rows: auto auto; justify-content: start; gap: 6px; overflow-x: auto; margin: 0 -4px; padding: 2px 4px 4px }
body[data-sec="palabras"] .wtypes { display: flex; flex-wrap: nowrap; overflow-x: auto; scrollbar-width: none; gap: 6px; align-items: center; margin: 0 -4px 10px; padding: 2px 4px }
body[data-sec="palabras"] .wtypes::-webkit-scrollbar { display: none }
body[data-sec="palabras"] .wtypes > .btn { flex: none; white-space: nowrap }
body[data-sec="palabras"] .bands:empty { display: none }
body[data-sec="palabras"] .wtypes > .small.muted:first-child { flex: none; font-size: .74rem; font-weight: 800; letter-spacing: .06em; text-transform: uppercase }
body[data-sec="palabras"] .wtools { display: flex; flex-wrap: wrap; gap: 8px; align-items: center }
body[data-sec="palabras"] .wtools input[type=search] { flex: 1 1 100%; min-width: 0 }
/* the list as cards on phones: Spanish word + English, speaker on the left, tick on the right, rank small underneath */
@media (max-width: 600px) {
  body[data-sec="palabras"] table.words { table-layout: auto; border-collapse: separate; border-spacing: 0 }
  body[data-sec="palabras"] table.words thead { display: none }
  body[data-sec="palabras"] table.words tr { display: grid; grid-template-columns: 44px auto minmax(0, 1fr); grid-template-areas: "sp w tg" "sp gl gl" "sp fm fm" "sp rk rk"; column-gap: 10px; row-gap: 2px; padding: 10px 8px; border-bottom: 1px solid var(--line); align-items: start }
  body[data-sec="palabras"] table.words td { display: block; padding: 0 !important; border: 0; width: auto !important; min-width: 0 }
  body[data-sec="palabras"] table.words td.sp { grid-area: sp; align-self: center }
  body[data-sec="palabras"] table.words td.ww { display: contents }
  body[data-sec="palabras"] table.words td.ww > .wlink { grid-area: w; overflow-wrap: anywhere; font-size: 1.08rem }
  body[data-sec="palabras"] table.words td.ww > .tag { grid-area: tg; justify-self: start; align-self: center; font-size: .66rem }
  body[data-sec="palabras"] table.words td.ww > .forms { grid-area: fm; font-size: .8rem; margin: 0 }
  body[data-sec="palabras"] .bands .wpager { display: none }
  body[data-sec="palabras"] .bands { margin: 0 !important; min-height: 0 }
  body[data-sec="palabras"] table.words td.gl { grid-area: gl; font-size: .95rem; color: var(--ink) }
  body[data-sec="palabras"] table.words td.rk { grid-area: rk; font-size: .75rem; color: var(--muted) }
  body[data-sec="palabras"] table.words td.rk:not(:has(.core))::before { content: "#" }
  body[data-sec="palabras"] table.words .core { font-size: .7rem; padding: 1px 6px }
}
</style>
'''
if '<style id="wb-frame">' in s:
    a = s.index('<style id="wb-frame">'); b = s.index("</style>\n", a) + len("</style>\n"); s = s[:a] + WBF + s[b:]
else:
    k = s.index('<style id="rl-frame">'); s = s[:k] + WBF + s[k:]
if s != s0: open(p, "w", encoding="utf-8").write(s)
print("wordbank:", len(W) + len(reg), "words;", len(reg), "added;", len(themes), "topics", "(changed)" if s != s0 else "(no change)")
