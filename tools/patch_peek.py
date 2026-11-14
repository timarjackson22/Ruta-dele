"""Task pages open with the bottom menu tucked away; a small arrow at the bottom brings it up (and takes it down)."""
import sys
p = sys.argv[1]; s = open(p, encoding="utf-8").read()
if "tabpeek" in s: sys.exit("already patched")
def rep(a, b, n=1):
    global s
    assert s.count(a) == n, ("anchor", a[:90], s.count(a)); s = s.replace(a, b)
rep('''|| /-examen-\\d+-[a-z]+$/.test(h) || h === "drill");''',
    '''|| /-examen-\\d+-[a-z]+$/.test(h) || h === "drill" || /^repaso-./.test(h) || /^escritura-./.test(h) || h === "errores" || h === "nivel" || /^(a1|a2|b1|b2|c1|c2|esc)-(mock|cards)$/.test(h));''')
rep('''<nav class="tabbar" aria-label="Sections">''', '''<button type="button" id="tabpeek" aria-label="Show the menu" aria-expanded="false"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 15l6-6 6 6"/></svg></button><nav class="tabbar" aria-label="Sections">''')
rep('''  window.addEventListener("hashchange", route);''', '''  document.addEventListener("click", (e) => { const t = e.target.closest && e.target.closest("#tabpeek"); if (!t) return; const on = document.body.classList.toggle("tabs-peek"); t.setAttribute("aria-expanded", on); t.setAttribute("aria-label", on ? "Hide the menu" : "Show the menu"); });
  window.addEventListener("hashchange", () => { document.body.classList.remove("tabs-peek"); const t = document.getElementById("tabpeek"); if (t) { t.setAttribute("aria-expanded", "false"); t.setAttribute("aria-label", "Show the menu"); } });
  window.addEventListener("hashchange", route);''')
CSS = r'''
/* ===== tucked-away menu on task pages ===== */
#tabpeek { display: none }
@media (max-width: 820px) {
  body.no-tabs #tabpeek { display: grid; place-items: center; position: fixed; left: 50%; transform: translateX(-50%); bottom: calc(6px + env(safe-area-inset-bottom, 0px)); z-index: 11; width: 58px; height: 24px; padding: 0; border-radius: 999px; border: 1px solid var(--line); background: color-mix(in srgb, var(--surface) 88%, transparent); -webkit-backdrop-filter: blur(12px); backdrop-filter: blur(12px); color: var(--muted); cursor: pointer; box-shadow: 0 2px 10px rgba(0, 0, 0, .1); transition: bottom .35s cubic-bezier(.3, .8, .3, 1) }
  #tabpeek svg { width: 18px; height: 18px; transition: transform .3s }
  body.no-tabs.tabs-peek .tabbar { transform: none; opacity: 1; pointer-events: auto }
  body.no-tabs.tabs-peek #tabpeek { bottom: calc(96px + env(safe-area-inset-bottom, 0px)) }
  body.no-tabs.tabs-peek #tabpeek svg { transform: rotate(180deg) }
  body.no-tabs #litem .player { bottom: calc(36px + env(safe-area-inset-bottom, 0px)) !important; transition: bottom .35s cubic-bezier(.3, .8, .3, 1) }
  body.no-tabs.tabs-peek #litem .player { bottom: calc(126px + env(safe-area-inset-bottom, 0px)) !important }
  body.no-tabs .tutor-fab { bottom: calc(36px + env(safe-area-inset-bottom, 0px)) !important }
  body.no-tabs.tabs-peek .tutor-fab { bottom: calc(126px + env(safe-area-inset-bottom, 0px)) !important }
  body.ra-on #tabpeek { display: none !important }
}
'''
k = s.rindex("</style>", 0, s.index("</head>")); s = s[:k] + CSS + s[k:]
open(p, "w", encoding="utf-8").write(s)
print("peek ok")
