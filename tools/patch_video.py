"""Videos: watch Spanish videos inside the app (YouTube's free embedded player) and practise with them.
See tools/VIDEO_BRIEF.md."""
import sys, os
p = sys.argv[1]; s = open(p, encoding="utf-8").read()
if "VID_START" in s: sys.exit("already patched")
def rep(a, b, n=1):
    global s
    assert s.count(a) == n, ("anchor", a[:90], s.count(a)); s = s.replace(a, b)
JS = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "video.js"), encoding="utf-8").read()
# module goes before the share handler, so a shared YouTube link is claimed first (it clears ?text= before the reading handler sees it)
rep("  /* ---------- shared from another app (Android share sheet) ---------- */", JS + "\n  /* ---------- shared from another app (Android share sheet) ---------- */")
# routes
rep('''    else if (h === "examenes") { setSec("curso"); navChips(null); exAll(); }''',
    '''    else if (h === "examenes") { setSec("curso"); navChips(null); exAll(); }
    else if (h === "videos") { setSec("practicar"); navChips(null); videosHub(); }
    else if (/^video-[\\w-]{11}$/.test(h)) { setSec("practicar"); navChips(null); videoPage(h.slice(6)); }''')
# tab highlight, back button, menu
rep('''    if (/^(practicar|escuchar|leer|leer-add|escritura|repaso|errores|examenes)$/.test(h)''', '''    if (/^(practicar|escuchar|leer|leer-add|escritura|repaso|errores|examenes|videos)$/.test(h) || /^video-/.test(h)''')
rep('''    if (h === "examenes") return ["#practicar", "Practice"];''', '''    if (h === "examenes" || h === "videos") return ["#practicar", "Practice"];
    if (/^video-/.test(h)) return ["#videos", "Videos"];''')
rep('''|examenes|recursos|esc|a1|''', '''|examenes|videos|recursos|esc|a1|''')
# Profe's "Looking at" context
rep('''    if (h === "palabras") return { label: "7.000 palabras",''', '''    if (/^video-[\\w-]{11}$/.test(h)) { const c = vCtx(h.slice(6)); if (c) return c; }
    if (h === "videos") return { label: "Videos", text: "List of Spanish videos to watch and practise with." };
    if (h === "palabras") return { label: "7.000 palabras",''')
# Practice hub row
rep('''        uiRow({ ic: "mist", t: "My mistakes", href: "#errores",''', '''        uiRow({ ic: "video", t: "Videos", href: "#videos", val: (() => { const n = Object.values(S.vid || {}).filter((d) => d.w).length; return n ? '<span class="muted small">' + n + " watched</span>" : ""; })(), sub: "Watch real Spanish, then catch words, shadow, answer and retell" }),
        uiRow({ ic: "mist", t: "My mistakes", href: "#errores",''')
CSS = r'''
/* Videos */
.vadd { display: flex; gap: 8px; margin-top: 4px }
.vadd input { flex: 1; min-width: 0; padding: 12px 14px; border-radius: 12px; border: 1px solid var(--line); background: var(--surface); color: var(--ink); font: inherit }
.sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0) }
.vgrid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 12px }
.vcard { display: block; text-decoration: none; color: inherit; background: var(--surface); border: 1px solid var(--line); border-radius: 14px; overflow: hidden }
.vcard:active { transform: scale(.985) }
.vthumb { position: relative; display: block; aspect-ratio: 16/9; background: #111 }
.vthumb img { width: 100%; height: 100%; object-fit: cover; display: block }
.vplay { position: absolute; inset: 0; margin: auto; width: 44px; height: 44px; border-radius: 50%; background: rgba(0,0,0,.55); color: #fff; display: grid; place-items: center }
.vplay .ic { width: 20px; height: 20px; fill: #fff; stroke: none; margin-left: 3px }
.vdone { position: absolute; left: 8px; bottom: 8px; background: rgba(0,0,0,.65); color: #fff; font-size: 12px; padding: 3px 8px; border-radius: 99px; display: flex; gap: 4px; align-items: center }
.vdone .ic { width: 14px; height: 14px }
.vtxt { display: block; padding: 10px 12px 12px }
.vtxt b { display: block; font-size: 15px; line-height: 1.3 }
.vtxt small { display: block; color: var(--muted); margin-top: 3px; font-size: 12.5px }
.vpage h1 { margin-bottom: 4px }
.vframe { position: relative; aspect-ratio: 16/9; width: 100%; background: #000; border-radius: 14px; overflow: hidden }
.vframe iframe, .vframe #vplayer { position: absolute; inset: 0; width: 100%; height: 100%; border: 0 }
.vfail { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px; padding: 16px; text-align: center; color: #fff; background: #15171c }
.vfail[hidden] { display: none }
.vfail p { margin: 0; font-size: 14px; max-width: 34ch }
.vctl { display: flex; flex-wrap: wrap; gap: 8px }
.vctl .btn { display: inline-flex; align-items: center; gap: 6px }
.vctl .btn[aria-pressed="true"] { background: color-mix(in srgb, var(--cobalt) 16%, var(--surface)); border-color: var(--cobalt) }
.vcatch { background: var(--surface); border: 1px solid var(--line); border-radius: 14px; padding: 12px }
.vcatch[hidden] { display: none }
.vcatch .row { display: flex; gap: 8px; margin-top: 6px }
.vcatch input { flex: 1; min-width: 0; padding: 10px 12px; border-radius: 10px; border: 1px solid var(--line); background: var(--bg); color: var(--ink); font: inherit }
.shead { display: flex; justify-content: space-between; align-items: center; gap: 8px }
.shead h2 { margin: 0 }
.vcaught { list-style: none; padding: 0; margin: 8px 0 0; display: grid; gap: 8px }
.vcaught li { display: flex; align-items: center; gap: 10px; padding: 8px 10px; border: 1px solid var(--line); border-radius: 12px; background: var(--surface) }
.vcaught li.vempty { display: block; border-style: dashed }
.vcaught li.vbusy { border-color: var(--cobalt); box-shadow: 0 0 0 3px color-mix(in srgb, var(--cobalt) 25%, transparent) }
.vts { font: 600 12.5px/1 ui-monospace, monospace; padding: 6px 8px; border-radius: 8px; border: 0; background: color-mix(in srgb, var(--cobalt) 14%, transparent); color: var(--cobalt); cursor: pointer }
.vw { flex: 1; min-width: 0; display: flex; flex-direction: column }
.vw small { color: var(--muted); font-size: 12.5px }
.vw .vsc.ok { color: #1a9c6b }
.vx { border: 0; background: none; color: var(--muted); font-size: 15px; padding: 6px; cursor: pointer }
.vret-box { margin-top: 10px; padding: 12px; border-radius: 12px; border: 1px solid var(--line); background: var(--surface) }
.vsk { display: grid; grid-template-columns: 110px 1fr 34px; gap: 8px; align-items: center; font-size: 13.5px; margin: 4px 0 }
.vsk .qbar { display: block; height: 8px; border-radius: 99px; background: var(--line); overflow: hidden }
.vsk .qbar i { display: block; height: 100%; background: var(--cobalt); border-radius: 99px }
.vfix { margin: 0; padding-left: 18px }
.vslow { margin: -4px 0 0; color: var(--muted) } .vslow[hidden] { display: none }
@media (max-width: 560px) { .vgrid { grid-template-columns: 1fr; gap: 10px } .vcard { display: flex; align-items: stretch } .vthumb { flex: 0 0 132px; aspect-ratio: 16/9; align-self: center; margin: 8px 0 8px 8px; border-radius: 10px; overflow: hidden } .vplay { width: 32px; height: 32px } .vplay .ic { width: 15px; height: 15px } .vdone { left: 4px; bottom: 4px; font-size: 11px; padding: 2px 6px } .vtxt { padding: 10px 12px; align-self: center } .vtxt b { font-size: 14.5px } }
'''
k = s.rindex("</style>", 0, s.index("</head>")); s = s[:k] + CSS + s[k:]
open(p, "w", encoding="utf-8").write(s)
print("video ok")
