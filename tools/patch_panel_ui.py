# Profe panel UI (round 4): gear tab, flag, hand icon, no chips row, no engine/"Looking at" line,
# practice-type dropdown, and level-appropriate vocabulary / conjugation drills.
import sys
P = sys.argv[1] if len(sys.argv) > 1 else "index.html"
s = open(P, encoding="utf-8").read()
def rep(a, b, n=1):
    global s
    assert s.count(a) == n, (s.count(a), a[:90]); s = s.replace(a, b)

# tabs: Chat · Practice · ⚙ (settings) · ✋ hands-free
rep('''const tabs = [["chat", "Chat"], ["practice", "Practice"], ["hist", "History & settings"]].map(([k, n]) => '<button class="btn small" data-act="t-tab" data-v="' + k + '" aria-pressed="' + (tView === k) + '">' + n + "</button>").join("")''',
    '''const tabs = [["chat", "Chat", ""], ["practice", "Practice", ""], ["hist", "⚙️", "History & settings"]].map(([k, n, al]) => '<button class="btn small' + (al ? " ticon" : "") + '" data-act="t-tab" data-v="' + k + '" aria-pressed="' + (tView === k) + '"' + (al ? ' aria-label="' + al + '" title="' + al + '"' : "") + ">" + n + "</button>").join("")''')
rep('''aria-pressed="' + on + '">🎙️ Hands-free ' + (on ? "on" : "off") + "</button>"''',
    '''aria-pressed="' + on + '" aria-label="Hands-free ' + (on ? "on" : "off") + '" title="Hands-free: say “Ok Profe”">✋ ' + (on ? "On" : "Off") + "</button>"''')
# head: name only, flag toggle for the English line
rep('''<b>' + esc(pName()) + '</b><span class="muted small"> · ' + esc(engineLabel()) + '</span><p class="t-ctx">' + (window.__IC ? __IC("pin") : "") + ' Looking at: <b>' + esc(ctx.label || "Ruta DELE") + '</b></p></div>''',
    '''<b>' + esc(pName()) + '</b></div>''')
rep('''title="English under Profe’s Spanish">EN</button>''', '''title="English under Profe’s Spanish" aria-label="English translations">🇬🇧</button>''')
# chips row removed
import re
i = s.index("'<div class=\"tchips\">'"); j = s.index('"</div>" +', i) + len('"</div>" +')
s = s[:i] + s[j:]

# practice tab: one dropdown of practice types + level chips that apply to every type
old_head = s[s.index("      const lvl = curLvl(), rl = PRL || lvl, rps"):s.index("        \"<h3>Role-plays <span")]
new_head = '''      const lvl = PRL || curLvl(), rl = lvl, rps = VOICE.roleplays.filter((r) => r.lvl === rl), sps = VOICE.speaking.filter((r) => r.lvl === lvl);
      const cats = [...new Set(rps.map((r) => r.cat || "other"))];
      const aiOK = TB === "claude" || TB === "api";
      const PT = [["", "Choose a practice…"], ["vocab", "Vocabulary by voice"], ["conj", "Conjugation by voice"], ["rp", "Role-plays (" + rps.length + ")"], ["sp", "DELE speaking tasks (" + sps.length + ")"]], pt = TS.prType || "";
      return '<div class="tscroll"><label class="small prsel-l" for="t-prsel">Practice type</label><select id="t-prsel" class="prsel">' + PT.map(([v, n]) => '<option value="' + v + '"' + (pt === v ? " selected" : "") + ">" + n + "</option>").join("") + "</select>" +
        '<div class="row prlv" aria-label="Practice level">' + ["a1", "a2", "b1", "b2", "c1", "c2"].map((l) => '<button class="btn small" data-act="pr-lvl" data-v="' + l + '" aria-pressed="' + (l === lvl) + '">' + l.toUpperCase() + "</button>").join("") + "</div>" +
        '<p class="muted small">Level ' + lvl.toUpperCase() + (PRL ? "" : " (from the page you’re on)") + ": words and verbs come from the " + lvl.toUpperCase() + " course. Works offline." + (CAN_MIC ? " Profe speaks, then listens." : " Type your answers.") + "</p>" +
        (pt === "" ? '<div class="prgrid"><button class="prc" data-act="pr-vocab"><b>Vocabulary by voice</b><span>Profe says a word in English; you say it in Spanish.</span></button><button class="prc" data-act="pr-conj"><b>Conjugation by voice</b><span>Profe names a verb, person and tense; you say the form.</span></button><button class="prc" data-act="pr-type" data-v="rp"><b>Role-plays</b><span>' + rps.length + ' situations at ' + lvl.toUpperCase() + '</span></button><button class="prc" data-act="pr-type" data-v="sp"><b>DELE speaking tasks</b><span>' + sps.length + " tasks at " + lvl.toUpperCase() + "</span></button></div>" : "") +
        (pt !== "rp" ? "" :
'''
s = s.replace(old_head, new_head)
# close the role-play block and gate speaking tasks on the chosen type
rep('''        "<h3>Role-plays <span class=\\"muted small\\">" + VOICE.roleplays.length + " situations</span></h3>" +
        '<div class="row prlv">' + ["a1", "a2", "b1", "b2", "c1", "c2"].map((l) => '<button class="btn small" data-act="pr-lvl" data-v="' + l + '" aria-pressed="' + (l === rl) + '">' + l.toUpperCase() + "</button>").join("") + "</div>" +
''', '''        "<h3>Role-plays <span class=\\"muted small\\">" + rps.length + " at " + rl.toUpperCase() + "</span></h3>" +
''')
k = s.index('"<h3>DELE speaking tasks</h3>"')
# the role-play section ends right before the speaking header: close the ternary there
s = s[:k] + ') +\n        (pt !== "sp" ? "" : ' + s[k:]
rep('''"</span></button>").join("") + "</div>" : "") + "</div>";
    }
    let h = '<div class="tscroll"><div class="row" style="justify-content:space-between"><button class="btn small" data-act="pr-exit">''',
    '''"</span></button>").join("") + "</div>" : '<p class="muted small">No speaking tasks at this level yet.</p>')) + "</div>";
    }
    let h = '<div class="tscroll"><div class="row" style="justify-content:space-between"><button class="btn small" data-act="pr-exit">''')
# fix the dangling "+" left before the ternary close
s = s.replace('''No role-plays for this level yet.</p>') +
        ) +
        (pt !== "sp"''', '''No role-plays for this level yet.</p>')) +
        (pt !== "sp"''')

# dropdown change → go straight to that practice
rep('''    else if (id === "t-lvl") { TS.clvl = e.target.value; tsave(); tRender(); }''',
    '''    else if (id === "t-lvl") { TS.clvl = e.target.value; tsave(); tRender(); }
    else if (id === "t-prsel") prGo(e.target.value);''')
rep('''    else if (act === "pr-lvl") { PRL = t.dataset.v; tRender(); }''',
    '''    else if (act === "pr-lvl") { PRL = t.dataset.v; tRender(); }
    else if (act === "pr-type") prGo(t.dataset.v);''')

# level-appropriate drills
rep('''  function startVocab() {
    const L = LV[curLvl()]; const pool = (L.themes || []).flatMap((t) => t.w).concat(L.units.flatMap((u) => u.v.flatMap((g) => g.w)));
    const pick = []; for (let i = 0; i < 10 && pool.length; i++) pick.push(pool[Math.floor(Math.random() * pool.length)]);''',
'''  // practice dropdown: vocab/conj start at once; role-plays and speaking tasks show their list
  function prGo(v) {
    PR = null; TS.prType = v === "rp" || v === "sp" ? v : ""; tView = "practice";
    if (v === "vocab") return startVocab(); if (v === "conj") return startConj(); tRender();
  }
  // words for a level: that level's own course units first (what the lessons teach), then its themes;
  // single words and short phrases only, nothing marked as a higher-level form
  function prVocabPool(lv) {
    const L = LV[lv] || LV.a1, units = L.units.flatMap((u) => (u.v || []).filter((g) => !g.h || /english|ingl/i.test(g.h[1] || "")).flatMap((g) => g.w || [])), th = (L.themes || []).flatMap((t) => t.w || []);
    const ok = (w) => w && w[0] && w[1] && w[0].split(/\\s+/).length <= (lv === "a1" ? 3 : 4) && !/[\\/(]|\\.\\.\\./.test(w[0]) && w[1].length < 40;
    const seen = new Set(), out = [];
    units.concat(lv === "a1" ? th.filter((w) => w[0].split(/\\s+/).length <= 2) : th).forEach((w) => { if (ok(w) && !seen.has(w[0])) { seen.add(w[0]); out.push(w); } });
    return { units: units.filter(ok), all: out };
  }
  function startVocab() {
    const lv = PRL || curLvl(), L = LV[lv] || LV.a1, P2 = prVocabPool(lv), pool = P2.all;
    // at A1/A2 most words come from the lessons themselves (the easier core); higher levels mix freely
    const pick = [], used = new Set(), core = P2.units.length >= 10 && (lv === "a1" || lv === "a2") ? P2.units : pool;
    for (let i = 0; i < 40 && pick.length < 10 && pool.length; i++) { const src = i % 3 === 2 ? pool : core, w = src[Math.floor(Math.random() * src.length)]; if (!used.has(w[0])) { used.add(w[0]); pick.push(w); } }''')
rep('''    const lvl = curLvl(), ts = TENSES_BY[lvl] || TENSES_BY.a2, top = VI ? VI.slice(0, lvl === "a1" ? 60 : 300).filter((r) => r[2] !== "X" && !/se$/.test(r[0])) :''',
    '''    const lvl = PRL || curLvl(), ts = TENSES_BY[lvl] || TENSES_BY.a2, top = VI ? VI.slice(0, { a1: 40, a2: 120, b1: 300, b2: 600, c1: 1000, c2: 1500 }[lvl] || 300).filter((r) => r[2] !== "X" && !/se$/.test(r[0])) :''')

# CSS
rep('.t-enbtn { font-weight: 700; letter-spacing: .04em }', '.t-enbtn { font-size: 1.05rem; line-height: 1; padding: 4px 8px } .ttabs .ticon, .ttabs .hfchip { font-size: 1rem; min-width: 40px } .prsel { width: 100%; margin: 4px 0 8px; padding: 10px; font-size: 1rem; border-radius: 10px; border: 1px solid var(--line); background: var(--card); color: var(--ink) } .prsel-l { display: block; font-weight: 600 }')
open(P, "w", encoding="utf-8").write(s)
print("ok")
