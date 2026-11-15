"""Word bank (tools/WORDBANK_BRIEF.md): Wiktionary expressions, slang and regional words wired into Verbatim, word cards,
video captions, Words › Informal and Profe's "what does … mean"."""
import sys
p = sys.argv[1]; s = open(p, encoding="utf-8").read()
if "function loadXP" in s: sys.exit("already patched")
def rep(a, b, n=1):
    global s
    assert s.count(a) == n, ("anchor", a[:90], s.count(a)); s = s.replace(a, b)

xp = open("/home/claude/app/xpbank.js", encoding="utf-8").read()
import json as _j
_pan = _j.load(open("/home/claude/ruta-dele/tools/panama_words.json", encoding="utf-8"))
xp = xp.replace("/*PANAMA_W*/", "const PANAMA_W = " + _j.dumps({"words": _pan["words"], "extra": _pan.get("extra", [])}, ensure_ascii=False, separators=(",", ":")) + ";")
rep("  function route() {\n", xp + "\n  function route() {\n")

# base forms: the app's table first, then the bank's
rep('''const cLem = (t) => { const g = TG[t]; return g && g[0] ? g[0].toLowerCase() : t; };''',
    '''const cLem = (t) => { const g = TG[t]; return g && g[0] ? g[0].toLowerCase() : (typeof XP !== "undefined" && XP && XP.F[t] ? XP.F[t].split("|")[0] : t); };''')

# Verbatim: the bank's expressions join the phrase list. Idioms and labelled expressions are trusted even when the sentence's English words differ
rep('''    const add = (es, en, sure) => {''', '''    const add = (es, en, sure, idi) => {''')
rep('''      const ph = { pt, en, sure }; (CPH[key] = CPH[key] || []).push(ph);''', '''      const ph = { pt, en, sure, idi }; (CPH[key] = CPH[key] || []).push(ph);''')
rep('''    Object.keys(CPH).forEach((k) => CPH[k].sort((a, b) => b.pt.length - a.pt.length || b.sure - a.sure));
    return CPH;''', '''    try { if (typeof XP !== "undefined" && XP) {
      XP.P.forEach((e) => { if (e[1] === "verb") { const h = e[0].toLowerCase().split(" ")[0]; CVL.add(h.endsWith("se") ? h.slice(0, -2) : h); } });
      XP.P.forEach((e) => { if (e.risky) return; const lab = (e[3] && e[3].length) || (e[4] && e[4].length), idi = lab || /^(verb|phrase|proverb|intj)$/.test(e[1]); add(e[0].replace(/\\b(alguien|algo)\\b/g, "").replace(/\\s+/g, " ").trim(), xpFirst(e[2]), !!(lab || /^(phrase|proverb|intj|adv|conj|prep_phrase|prep)$/.test(e[1])), !!idi); });
    } } catch (e) {}
    Object.keys(CPH).forEach((k) => CPH[k].sort((a, b) => b.pt.length - a.pt.length || b.sure - a.sure));
    return CPH;''')
rep('''        if (!ev && hasEn && (!ph.sure || loose''', '''        if (!ev && hasEn && !(ph.idi && !loose) && (!ph.sure || loose''')

# informal words: the bank's words that are only ever informal
rep('''    if (tg(x)) return null;
''', '''    if (tg(x)) return null;
    { const b = xpInf(x); if (b) return b; } // not one of the app's words: the bank knows it as informal
''')

# video captions: expressions of 2-4 words from the bank (informal or regional ones) coloured as one, like the app's own list
rep('''      if (nx && VPHRASE[lower[i] + " " + nx]) { const ph = lower[i] + " " + nx; inf = { k: "slang", mean: VPHRASE[ph][0], where: VPHRASE[ph][1], ph }; }''',
    '''      if (nx && VPHRASE[lower[i] + " " + nx]) { const ph = lower[i] + " " + nx; inf = { k: "slang", mean: VPHRASE[ph][0], where: VPHRASE[ph][1], ph }; }
      if (!inf && XP) { const rest = lower.slice(i).filter((y) => /\\p{L}/u.test(y)).slice(0, 5).join(" "), m = xpFind(rest)[0];
        if (m && m.a === 0 && m.n >= 2 && ((m.e[3] || []).some((r) => XP_INF.has(r)) || (m.e[4] || []).length)) { const ws = rest.split(" ").slice(0, m.n), lab = xpLabels(m.e[3], m.e[4]);
          inf = { k: "slang", mean: xpFirst(m.e[2]), where: lab, ph: m.e[0] }; let j = i, left = m.n;
          while (j < toks.length && left > 0) { if (/\\p{L}/u.test(toks[j])) { out += '<span class="vword vinf vinf-slang" data-act="vc-w" data-wi="' + wi + '" data-inf="' + esc(JSON.stringify(inf)) + '">' + esc(toks[j]) + "</span>"; wi++; left--; } else out += esc(toks[j]); j++; }
          i = j - 1; prev = ws[ws.length - 1]; continue; } }''')

# video and song captions, Verbatim bubbles: an expression gets one bubble with its meaning ("echo de menos" → to miss), like a name does
rep('''    const key = spans.length + ":" + (c.en ? 1 : 0); if (c.gl && c.glk === key) return;
    c.glk = key; c.gl = []; c.grp = []; c.ctx = [];''', '''    const key = spans.length + ":" + (c.en ? 1 : 0) + (XP ? ":x" : ""); if (c.gl && c.glk === key) return;
    c.glk = key; c.gl = []; c.grp = []; c.ctx = [];
    if (!XP) try { loadXP().catch(() => {}); } catch (e) {} // captions on screen: fetch the bank now, not in 6 s
    try { if (XP) { const ws = spans.map((s) => vcWord(s).toLowerCase().replace(/’/g, "'"));
      for (const m of xpFind(ws.join(" "))) { if (m.n < 2 || m.a + m.n > spans.length) continue; const inf = spans[m.a].dataset.inf ? JSON.parse(spans[m.a].dataset.inf) : null;
        c.gl[m.a] = inf && inf.ph ? inf.mean : xpFirst(m.e[2]); c.ctx[m.a] = "phrase"; c.grp[m.a] = m.a; for (let q = m.a + 1; q < m.a + m.n; q++) { c.grp[q] = m.a; c.gl[q] = ""; } } } } catch (e) {}''')
rep('''      const lw0 = vcWord(spans[i]).toLowerCase(), inf0 = spans[i].dataset.inf ? JSON.parse(spans[i].dataset.inf) : null;''', '''      if (c.ctx[i] === "phrase" || (c.grp[i] != null && c.gl[i] === "")) continue; // part of an expression: its bubble is already set
      const lw0 = vcWord(spans[i]).toLowerCase(), inf0 = spans[i].dataset.inf ? JSON.parse(spans[i].dataset.inf) : null;''')
# word cards (reading and videos): the expression the word is part of, and informal/regional meanings
rep('''      (lines.length ? lines.join("") : '<p class="muted">No dictionary entry for this form.</p>') +''',
    '''      xpLines(word, it && it.text) + (lines.length ? lines.join("") : '<p class="muted">No dictionary entry for this form.</p>') +''')
rep('''") : "") + what + (lines.length ? lines.join("") : inf ? "" :''',
    '''") : "") + what + (() => { try { const row = span.closest(".vcue"), c = VCAP.cues[+row.dataset.i]; return xpLines(word, c ? c.text : "", inf && inf.ph); } catch (e) { return ""; } })() + (lines.length ? lines.join("") : inf ? "" :''')

# Profe: expressions and informal words
rep('''    w = w.trim(); if (!w || w.split(" ").length > 4) return null;
    const hits = [];''', '''    w = w.trim(); if (!w || w.split(" ").length > 6) return null;
    const hits = [];
    if (w.split(" ").length > 1) { const x = xpMeaning(w); if (x) return x + "\\n\\n*Want an example sentence? Ask me «use " + w + " in a sentence».*"; if (w.split(" ").length > 4) return null; }''')
rep('''    if (!hits.length && TG[w]) hits.push(''', '''    if (!hits.length) { const x = xpMeaning(w); if (x) hits.push(x); }
    else { const x = XP && XP.W[w]; if (x && x[3] && x[3].length && !x[2].includes("vul")) hits.push("*In " + x[3].slice(0, 3).join(", ") + ":* " + x[1]); }
    if (!hits.length && TG[w]) hits.push(''')

# Words › Informal: Panama's words and expressions from the bank
rep('''    Object.entries(VJARGON).forEach(([w, m]) => rows.push([w, m, "Jargon"]));''', '''    Object.entries(VJARGON).forEach(([w, m]) => rows.push([w, m, "Jargon"]));
    try { const have = new Set(rows.map((r) => r[0])); xpPanamaRows().forEach((r) => { if (!have.has(r[0])) rows.push(r); }); } catch (e) {}''')

# translations: the free translator sometimes returns its markup («<g id="1">I say one</g>», seen on a song, Nov 2026); and a line that is one
# known expression («A ver») gets the expression's meaning instead of a word-by-word guess («Really?»)
rep('''    const d = document.createElement("textarea"); d.innerHTML = out; return d.value;''', '''    const d = document.createElement("textarea"); d.innerHTML = out; return d.value.replace(/<\\/?[a-z][^>]*>/gi, "").replace(/\\s+([.,!?;:])/g, "$1").trim();''')
rep("\n  function route() {\n", '''
  { const tr0 = window.__trEn; if (tr0) window.__trEn = async (t, opt) => {
    const k = String(t || "").toLowerCase().replace(/[¿?¡!.,;:"“”«»…]/g, " ").replace(/\\s+/g, " ").trim();
    try { if (k && k.split(" ").length <= 4) { const o = PAN.get(k); if (o) return o.en.replace(/\\s*\\(.*?\\)\\s*/g, " ").trim(); if (!XP) await loadXP().catch(() => {}); const e = XP && XP.P.get(k); if (e) { /* the whole line is the expression, so even a two-word one counts */ const g = xpFirst(e[2]); return g.charAt(0).toUpperCase() + g.slice(1); } } } catch (e) {}
    const out = await tr0(t, opt); return String(out || "").replace(/<\\/?[a-z][^>]*>/gi, "").replace(/\\s+([.,!?;:])/g, "$1").trim();
  }; }
  function route() {
''')
rep("</head>", '''<style>.xpe{margin:6px 0 4px}.xpe .eyebrow{font-size:.7rem;letter-spacing:.06em;text-transform:uppercase;color:var(--muted,#667)}.pill.xpl{background:#fdf0d5;color:#8a5a00;border-radius:999px;padding:1px 7px;font-size:.72rem}.xpx{margin:0 0 8px;color:var(--muted,#556)}.xpw{margin:6px 0}.xpsrc{margin:8px 0 0;font-size:.68rem}</style></head>''')
open(p, "w", encoding="utf-8").write(s)
print("wordbank ok")
