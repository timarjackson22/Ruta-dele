"""The live word-by-word / phrase-by-phrase translation is called Verbatim everywhere you can see it (tools/VERBATIM_BRIEF.md)."""
import sys, re
p = sys.argv[1]; s = open(p, encoding="utf-8").read()
if "Verbatim: live word-by-word" in s: sys.exit("already patched")
def rep(a, b, n=1):
    global s
    assert s.count(a) == n, ("anchor", a[:90], s.count(a)); s = s.replace(a, b)
rep('''aria-pressed="' + (UI.cues !== false) + '" title="Translation cue tips">''', '''aria-pressed="' + (UI.cues !== false) + '" title="Verbatim: live word-by-word translation" aria-label="Verbatim: live word-by-word translation">''')
rep('''<path d="M8.5 10.5h7M8.5 13.5h4.5"/></svg>Cues</button>''', '''<path d="M8.5 10.5h7M8.5 13.5h4.5"/></svg>Verbatim</button>''')
rep('''" · cue tips follow the voice word by word"''', '''" · Verbatim translates word by word as the voice reads"''')
rep('''<p class="setl">Translation cue tips <span class="muted small">· Reading, Listening and Videos</span></p>''', '''<p class="setl">Verbatim <span class="muted small">· live word-by-word translation in Reading, Listening and Videos</span></p>''')
rep('''data-act="vc-cue" aria-pressed="' + cueOn() + '">Cue tips</button>''', '''data-act="vc-cue" aria-pressed="' + cueOn() + '" title="Verbatim: live word-by-word translation">Verbatim</button>''')
vis = re.findall(r">[^<]*\b[Cc]ue tips?\b[^<]*<|\"[^\"]*\b[Cc]ue tips?\b[^\"]*\"", s)
vis = [v for v in vis if "//" not in v and "/*" not in v]
assert not vis, vis[:3]
open(p, "w", encoding="utf-8").write(s)
print("verbatim ok")
