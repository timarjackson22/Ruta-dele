"""Calmer reading and listening pages: fix the title staying highlighted, softer highlights, no tab bar or Profe bubble
over the text, a one-row player (extra options behind ⋯), and the how-to line shown only for the first few texts."""
import sys
p = sys.argv[1]; s = open(p, encoding="utf-8").read()
if "pl-more" in s: sys.exit("already patched")
def rep(a, b, n=1):
    global s
    assert s.count(a) == n, ("anchor", a[:90], s.count(a)); s = s.replace(a, b)
# the title's words were never cleared once the voice moved on to the text
rep('document.querySelectorAll("#ltext .w.spk")', 'document.querySelectorAll("#litem .w.spk")')
rep('document.querySelectorAll("#ltext .w.cue-on").forEach((x) => x.classList.remove("cue-on")); F.els', 'document.querySelectorAll("#litem .w.cue-on").forEach((x) => x.classList.remove("cue-on")); F.els')
rep('function cueDrop() { if (!CUE.w) return; document.querySelectorAll("#ltext .w.cue-on")', 'function cueDrop() { if (!CUE.w) return; document.querySelectorAll("#litem .w.cue-on")')
# no tab bar on a text: the player sits at the bottom instead
rep('classList.toggle("no-tabs", /^(a1|a2|b1|b2|c1|c2|esc)-u\\d+$/.test(h)', 'classList.toggle("no-tabs", (typeof LI !== "undefined" && !!LI[h]) || /^(a1|a2|b1|b2|c1|c2|esc)-u\\d+$/.test(h)')
# one-row player: Hide text / English / Rhythm behind ⋯
rep('''      '<button class="btn small" data-act="l-text" aria-pressed="false" id="l-text">Hide text</button>' +''',
    '''      '<button class="pbtn pmore" data-act="pl-more" aria-label="More options" aria-expanded="false">⋯</button>' +
      '<button class="btn small" data-act="l-text" aria-pressed="false" id="l-text">Hide text</button>' +''')
rep('''    else if (act === "l-en") {''', '''    else if (act === "pl-more") { const pl = t.closest(".player"); const on = pl.classList.toggle("more"); t.setAttribute("aria-expanded", on); }
    else if (act === "l-en") {''')
# the how-to line: only for the first three texts
rep('''      '<p class="muted small">Tap a word for its meaning · highlight any part of the text to see it in English' + (UI.cues !== false ? " · cue tips follow the voice word by word" : "") + "</p>" +''',
    '''      ((UI.lhint = (UI.lhint || 0) + 1) <= 3 ? '<p class="muted small lhint">Tap a word for its meaning · highlight any part of the text to see it in English' + (UI.cues !== false ? " · cue tips follow the voice word by word" : "") + "</p>" : "") +''')
rep('''    afterItem(x);
    plUI();''', '''    try { uiSave(); } catch (e) {} document.body.classList.add("litem-on");
    afterItem(x);
    plUI();''')
rep('''  window.addEventListener("hashchange", route);''', '''  window.addEventListener("hashchange", () => setTimeout(() => { if (!document.getElementById("litem")) document.body.classList.remove("litem-on"); }, 0));
  window.addEventListener("hashchange", route);''')
CSS = r'''
/* ===== calmer reading & listening ===== */
#litem .sent.playing { background: color-mix(in srgb, var(--saffron-soft) 60%, transparent); box-shadow: none; border-radius: 3px }
#litem h1.playing { background: none; box-shadow: none }
#litem .w.spk { background: none; color: inherit; box-shadow: none; text-decoration: underline 3px var(--saffron); text-underline-offset: 5px; text-decoration-skip-ink: none; transition: text-decoration-color .12s }
#litem .w.cue-on { background: none; box-shadow: none }
#litem .sent:not(.playing) .w.spk { text-decoration: none }
body.litem-on .tutor-fab { display: none !important }
#litem .player { flex-wrap: nowrap; gap: 6px; padding: 8px 10px; bottom: calc(10px + env(safe-area-inset-bottom, 0px)) !important; border-radius: 18px }
#litem .player.more { flex-wrap: wrap }
#litem .player > #l-text, #litem .player > #l-en, #litem .player > #rh-btn { display: none; order: 3 }
#litem .player.more > #l-text, #litem .player.more > #l-en, #litem .player.more > #rh-btn { display: inline-flex }
#litem .player .pmore { order: 2; margin-left: auto; font-size: 1.3rem; line-height: 1; font-weight: 700 }
#litem .player.more .pmore { background: var(--surface-2) }
#litem .player .cue-sw { order: 1; margin-left: auto }
#litem .player .cue-sw + .pmore, #litem .player .pmore { margin-left: 0 }
#litem .player #pl-rate { padding-left: 8px; padding-right: 4px; min-width: 0 }
#litem .player .ppos { font-size: .85rem; white-space: nowrap }
@media (max-width: 420px) { #litem .player .ppos { display: none } #litem .player .cue-sw { padding-left: 8px !important; padding-right: 10px !important } }
'''
k = s.rindex("</style>", 0, s.index("</head>")); s = s[:k] + CSS + s[k:]
open(p, "w", encoding="utf-8").write(s)
print("focus ok")
