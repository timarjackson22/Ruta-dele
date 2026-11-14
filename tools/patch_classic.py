"""Classic headline card for Reading & Listening (paper grain, mountains, earth, water) and one type system for the app:
Inter for the interface, Literata for titles and reading (tools/TYPE_AND_HEADER_BRIEF.md)."""
import sys
p = sys.argv[1]; s = open(p, encoding="utf-8").read()
if "lh-land" in s: sys.exit("already patched")
def rep(a, b, n=1):
    global s
    assert s.count(a) == n, ("anchor", a[:90], s.count(a)); s = s.replace(a, b)
# fonts: Inter (interface) + Literata (titles, reading; optical sizes 7–72) + Atkinson Hyperlegible (easy-read), loaded once
rep('''<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400..800&display=swap">''',
    '''<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,400..800&family=Literata:ital,opsz,wght@0,7..72,400..800;1,7..72,400..600&family=Atkinson+Hyperlegible:wght@400;700&display=swap">''')
# the landscape band replaces the faint icon in the corner
rep('''<span class="lh-deco" aria-hidden="true">' + ic(svg) + "</span></header>"''',
    """<svg class="lh-land" viewBox="0 0 400 70" preserveAspectRatio="none" aria-hidden="true"><path class="m1" d="M0 46 L28 32 L52 40 L86 16 L118 38 L150 26 L178 40 L214 12 L250 36 L284 24 L316 38 L352 20 L400 36 V70 H0Z"/><path class="m2" d="M0 54 C36 42 74 50 112 44 C160 36 198 52 248 47 C298 42 340 52 400 45 V70 H0Z"/><path class="e1" d="M0 58 C60 53 120 59 190 56 C260 53 330 59 400 56 V70 H0Z"/><rect class="w1" x="0" y="61" width="400" height="9"/><path class="w2" d="M0 63.5 q12 -2 24 0 t24 0 t24 0 t24 0 t24 0 t24 0 t24 0 t24 0 t24 0 t24 0 t24 0 t24 0 t24 0 t24 0 t24 0 t24 0 t24 0"/></svg></header>'""")
# default reading font: the book face (Literata) unless you've chosen one
rep('''  function lhState() {''', '''  try { if (!UI.rf) { UI.rf = "book"; document.documentElement.dataset.rf = "book"; } } catch (e) {}
  function lhState() {''')
GRAIN = "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='180' height='180'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='3' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 .32  0 0 0 0 .24  0 0 0 0 .15  0 0 0 .22 0'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>\")"
CSS = r'''
/* ===== type system: Inter for the interface, Literata for titles and reading ===== */
:root:root { --body: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, system-ui, sans-serif; --display: "Literata", Georgia, "Times New Roman", serif; --read-serif: "Literata", Georgia, serif }
body { font-family: var(--body); font-optical-sizing: auto; -webkit-font-smoothing: antialiased; text-rendering: optimizeLegibility }
h1, h2, .ltitle, .ui-title h1 { font-family: var(--display); font-optical-sizing: auto; letter-spacing: -.005em }
h1 { font-weight: 650 } h2 { font-weight: 620 }
.vbs { row-gap: 6px !important; column-gap: 6px } /* verb badges keep room when Inter wraps them on small phones */
/* ===== classic headline card: paper, mountains, earth, water ===== */
:root { --par1: #f6efe2; --par2: #ece0c9; --ink-c: #2a2119; --rule: #b9a27a; --m1: #8a9bab; --m2: #6f8a6a; --e1: #b58e5e; --w1: #6e9cb4; --w2: #e9f2f6; --chip-c: #6b5636 }
@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) { --par1: #2b2620; --par2: #221e19; --ink-c: #f1e7d6; --rule: #7d6a4c; --m1: #4b5866; --m2: #3f5440; --e1: #6e5537; --w1: #355a6e; --w2: #8fb4c6; --chip-c: #d9c39c } }
:root[data-theme="dark"] { --par1: #2b2620; --par2: #221e19; --ink-c: #f1e7d6; --rule: #7d6a4c; --m1: #4b5866; --m2: #3f5440; --e1: #6e5537; --w1: #355a6e; --w2: #8fb4c6; --chip-c: #d9c39c }
.lhead { color: var(--ink-c); border-radius: 18px; padding: 16px 18px 64px 22px; border: 1px solid var(--rule);
  background: GRAIN, radial-gradient(120% 90% at 0% 0%, color-mix(in srgb, var(--a) 10%, var(--par1)) 0%, var(--par1) 45%, var(--par2) 100%);
  box-shadow: inset 0 0 0 4px var(--par1), inset 0 0 0 5px color-mix(in srgb, var(--rule) 55%, transparent), 0 12px 28px rgba(60, 40, 15, .14) }
.lhead::before { width: 4px; background: linear-gradient(var(--a), color-mix(in srgb, var(--a) 40%, var(--rule))); opacity: .85 }
.lh-ic { width: 32px; height: 32px; border-radius: 50%; background: transparent; color: var(--a); box-shadow: inset 0 0 0 1.5px currentColor }
.lh-chip { background: transparent; color: var(--chip-c); border: 1px solid color-mix(in srgb, var(--rule) 70%, transparent); border-radius: 4px; padding: 2px 7px; font-family: var(--body); font-size: 10.5px; font-weight: 700; letter-spacing: .12em; text-transform: uppercase }
.lh-opts { background: color-mix(in srgb, var(--par1) 80%, transparent); border-color: var(--rule); color: var(--ink-c) }
.lhead .ltitle { font-family: var(--display); font-weight: 680; font-size: clamp(1.7rem, 7vw, 2.4rem); line-height: 1.12; letter-spacing: 0; margin: 14px 0 6px; font-variation-settings: "opsz" 60 }
.lh-sub { color: color-mix(in srgb, var(--ink-c) 66%, transparent); font-family: var(--display); font-style: italic; font-size: 1rem; font-variation-settings: "opsz" 14 }
.lh-deco { display: none }
.lh-land { position: absolute; left: 0; right: 0; bottom: 0; width: 100%; height: 58px; z-index: 0; pointer-events: none; transition: height .45s cubic-bezier(.3, .8, .3, 1) }
.lh-land .m1 { fill: var(--m1); opacity: .55 } .lh-land .m2 { fill: var(--m2); opacity: .75 } .lh-land .e1 { fill: var(--e1); opacity: .8 }
.lh-land .w1 { fill: var(--w1); opacity: .9 } .lh-land .w2 { fill: none; stroke: var(--w2); stroke-width: 1; opacity: .7 }
.lprog { background: color-mix(in srgb, var(--rule) 30%, transparent) }
/* frozen strip: the title stays big enough to read; the landscape shrinks to the waterline */
body.lplaying #litem .lhead { padding: 10px 16px 24px 20px; border-radius: 0 0 16px 16px }
body.lplaying #litem .lhead .ltitle { font-size: clamp(1.3rem, 5.4vw, 1.6rem); line-height: 1.18; margin: 8px 0 0; -webkit-line-clamp: 2 }
body.lplaying #litem .lh-land { height: 20px }
body.lplaying #litem .lh-land .m1 { opacity: .3 }
body.lplaying #litem .lprog { margin-top: 8px; position: relative; z-index: 1 }
'''.replace("GRAIN", GRAIN)
k = s.rindex("</style>", 0, s.index("</head>")); s = s[:k] + CSS + s[k:]
open(p, "w", encoding="utf-8").write(s)
print("classic ok")
