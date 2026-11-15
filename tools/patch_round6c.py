# Video page: the bottom controller sits right at the bottom; the menu handle tucks into the very edge under it; the bar fits narrow phones
import sys
P = sys.argv[1] if len(sys.argv) > 1 else "index.html"
s = open(P, encoding="utf-8").read()
a = "body.vpage-on .vpage { padding-bottom: 96px }"
assert s.count(a) == 1
s = s.replace(a, """body.vpage-on .vpage { padding-bottom: 76px }
body.vpage-on .vbar { bottom: calc(10px + env(safe-area-inset-bottom, 0px)); left: 8px; right: 8px; gap: 4px; padding: 6px 8px }
body.vpage-on .vbar > .btn { padding: 6px 9px; font-size: 13.5px; min-width: 0; flex: 0 1 auto; white-space: nowrap }
body.vpage-on .vbar > .btn svg { width: 16px; height: 16px }
@media (max-width: 380px) { body.vpage-on .vbar > [data-act="v-loop"] { font-size: 0; gap: 0 } body.vpage-on .vbar > [data-act="v-loop"] svg { width: 18px; height: 18px } }
/* the menu handle: a thin tab at the very bottom edge, under the controller */
body.vpage-on.no-tabs:not(.tabs-peek) #tabpeek { bottom: calc(-10px + env(safe-area-inset-bottom, 0px)); height: 20px; width: 46px; z-index: 13; opacity: .85; padding-bottom: 8px }
body.vpage-on.no-tabs:not(.tabs-peek) #tabpeek svg { width: 14px; height: 14px; margin-top: -6px }
body.vpage-on.tabs-peek .vbar { bottom: calc(150px + env(safe-area-inset-bottom, 0px)) }""")
open(P, "w", encoding="utf-8").write(s); print("ok")
