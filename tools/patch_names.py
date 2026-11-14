"""Verbatim says proper names back instead of skipping them (tools/VERBATIM_BRIEF.md, Names)."""
import sys
p = sys.argv[1]; s = open(p, encoding="utf-8").read()
if "VB_NAMES" in s: sys.exit("already patched")
def rep(a, b, n=1):
    global s
    assert s.count(a) == n, ("anchor", a[:90], s.count(a)); s = s.replace(a, b)
rep('''    if (el && /^[A-ZÁÉÍÓÚÑ]/.test(word) && cx.start === false) return "";''',
    '''    if (el && /^[A-ZÁÉÍÓÚÑ]/.test(word) && cx.start === false) return word; // VB_NAMES: a name is said back as written''')
rep('''    if (g.normalize("NFD").replace(/[\\u0300-\\u036f]/g, "").toLowerCase() === lw.normalize("NFD").replace(/[\\u0300-\\u036f]/g, "")) g = ""; // names: no echo''',
    '''    if (!g && /^[A-ZÁÉÍÓÚÑ]/.test(word)) g = word; // a capitalised word the dictionary doesn't know: a name, said back''')
# word forms (tools/WORD_FORMS_BRIEF.md): "diminutive of X" becomes a translation; unknown coined words are broken down
rep('''    if (!g && /^[A-ZÁÉÍÓÚÑ]/.test(word)) g = word; // a capitalised word the dictionary doesn't know: a name, said back''',
    '''    { const g2 = g.replace(/,\\s*(diminutive|augmentative|superlative|endearing form|affectionate form) of [a-záéíóúüñ]+\\s*$/i, "").trim(); if (g2) g = g2; } // "doggy, diminutive of perro" → "doggy"
    const dm = g.match(/^(?:an? )?(diminutive|augmentative|superlative|endearing form|affectionate form) of ([a-záéíóúüñ]+)/i);
    if (dm) { const L = vLook(dm[2].toLowerCase()); const lg = L ? L.g.replace(/^(an?|the) /i, "") : "", aj = L && /adj|adv/.test(L.pos) && VADJ_EN.test(lg.split(/[ ,]/)[0]); g = L ? (/^aug/i.test(dm[1]) ? (aj ? "really " : "big ") : /^sup/i.test(dm[1]) ? "very " : aj ? "nice and " : "little ") + lg : ""; }
    if (!g) { const m = vMorph(word); if (m) g = m.en; } // a new word built from a known one: cafecito → little coffee
    if (!g && /^[A-ZÁÉÍÓÚÑ]/.test(word)) g = word; // a capitalised word the dictionary doesn't know: a name, said back''')
rep('''    return out;
  }
  function openSheet(html) {''', '''    if (!out.length && !wordLines.busy) { // a word nobody lists (abracito): break it into a known word + an ending
      wordLines.busy = true;
      try { const m = vMorph(word); if (m) { out.push("<p><b>" + esc(word.toLowerCase()) + "</b> · " + esc(m.en) + "</p>"); if (m.base) out.push('<p class="small muted">«' + esc(m.base) + "» (" + esc(m.baseEn) + ") + " + esc(m.suf) + ": " + esc(VSUF_EN[m.how]) + "</p>"); } } catch (e) {} // the breakdown on its own line: cards show it, Verbatim only reads the first
      wordLines.busy = false;
    }
    return out;
  }
  function openSheet(html) {''')
rep('''    if (lw in CFN) return CFN[lw];
    let g = "";''', '''    if (lw in CFN) return CFN[lw];
    if (typeof VDIM !== "undefined" && VDIM[lw]) return VDIM[lw]; // common small forms with a natural English (poquito → a little bit)
    let g = "";''')
rep('''  function cueEl() {''', '''  window.__cueGloss = (w) => cueGloss(w);
  function cueEl() {''')
open(p, "w", encoding="utf-8").write(s)
print("names ok")
