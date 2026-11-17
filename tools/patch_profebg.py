"""Profe screen backgrounds, by Spanish variety (16 Nov 2026).
latam -> Casco Viejo, Panamá (tools/profe-bg/latam.svg); es -> Andalusian white village (tools/profe-bg/es.svg). Original illustrations, no photos.
Text stays readable: the scene sits low in the chat area under a light veil (a dark one in dark mode); bubbles stay opaque.
Embeds the SVGs as data URIs between /* ==PROFEBG== */ markers. Re-runnable.   Usage: python3 tools/patch_profebg.py index.html"""
import sys, urllib.parse, re
P = sys.argv[1] if len(sys.argv) > 1 else "index.html"
s = open(P, encoding="utf-8").read()
def uri(f):
    svg = open(f, encoding="utf-8").read().replace('"', "'")
    return "data:image/svg+xml," + urllib.parse.quote(svg, safe=" =:/,;'-()")
la, es = uri("tools/profe-bg/latam.svg"), uri("tools/profe-bg/es.svg")
css = f"""/* ==PROFEBG== */
.tutor .tscroll {{ --pbg: url("{la}"); background-color: var(--bg);
  background-image: linear-gradient(to bottom, color-mix(in srgb, var(--bg) 94%, transparent) 0%, color-mix(in srgb, var(--bg) 80%, transparent) 38%, color-mix(in srgb, var(--bg) 46%, transparent) 72%, color-mix(in srgb, var(--bg) 30%, transparent) 100%), var(--pbg);
  background-repeat: no-repeat; background-position: center, center bottom; background-size: 100% 100%, cover }}
html[data-region="es"] .tutor .tscroll {{ --pbg: url("{es}") }}
:root[data-theme="dark"] .tutor .tscroll {{ background-image: linear-gradient(to bottom, rgba(13,18,28,.95) 0%, rgba(13,18,28,.86) 40%, rgba(13,18,28,.7) 100%), var(--pbg) }}
@media (prefers-color-scheme: dark) {{ :root:not([data-theme="light"]) .tutor .tscroll {{ background-image: linear-gradient(to bottom, rgba(13,18,28,.95) 0%, rgba(13,18,28,.86) 40%, rgba(13,18,28,.7) 100%), var(--pbg) }} }}
/* anything that sits straight on the picture (not in a bubble) gets its own soft backing */
.tutor .tscroll > :not(.tm):not(.tmsg) {{ position: relative }}
/* ==/PROFEBG== */
"""
s = re.sub(r"/\* ==PROFEBG== \*/.*?/\* ==/PROFEBG== \*/\n", "", s, flags=re.S)
s = s.replace("</style>", css + "</style>", 1)
# the page knows the variety, so CSS can pick the scene
o = 'function regionUI() { const b = document.getElementById("regbtn");'
if 'dataset.region = S.region' not in s:
    assert o in s
    s = s.replace(o, 'function regionUI() { try { document.documentElement.dataset.region = S.region; } catch (e) {} const b = document.getElementById("regbtn");', 1)
open(P, "w", encoding="utf-8").write(s)
print("profe backgrounds embedded", len(la) + len(es), "bytes")
