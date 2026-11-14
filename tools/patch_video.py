"""Videos: watch Spanish videos inside the app (YouTube's free embedded player) and practise with them.
See tools/VIDEO_BRIEF.md."""
import sys, os
p = sys.argv[1]; s = open(p, encoding="utf-8").read()
if "VID_START" in s: sys.exit("already patched")
def rep(a, b, n=1):
    global s
    assert s.count(a) == n, ("anchor", a[:90], s.count(a)); s = s.replace(a, b)
_D = os.path.dirname(os.path.abspath(__file__))
JS = open(os.path.join(_D, "video.js"), encoding="utf-8").read() + open(os.path.join(_D, "vcap.js"), encoding="utf-8").read()
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
.vchips { display: flex; gap: 6px; overflow-x: auto; padding: 2px 0 4px; margin: 4px -16px 0; padding-left: 16px; padding-right: 16px; scrollbar-width: none }
.vchips::-webkit-scrollbar { display: none }
.vchip { flex: 0 0 auto; border: 1px solid var(--line); background: var(--surface); color: var(--ink); border-radius: 99px; padding: 7px 13px; font: inherit; font-size: 13.5px; cursor: pointer; white-space: nowrap }
.vchip[aria-pressed="true"] { background: var(--cobalt); border-color: var(--cobalt); color: #fff }
.vcw { min-width: 0 }
.vcw.has-act { display: flex; align-items: center; gap: 8px }
.vcw.has-act .vcard { flex: 1; min-width: 0 }
.vrm { flex: 0 0 auto; display: inline-flex; align-items: center; gap: 4px }
.vrm .ic { width: 15px; height: 15px }
.vmore { margin-top: 18px } .vmore > summary { cursor: pointer; font-weight: 600; padding: 8px 0 }
.vmore .vgrid { margin-top: 8px }
.vedit-note { margin: 10px 0 0 }
.vpage-act { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; margin: 8px 0 0 }
.vpage-act .btn { display: inline-flex; align-items: center; gap: 5px } .vpage-act .ic { width: 15px; height: 15px }
/* caption window */
.vcapw { margin-top: -2px }
.vcap-head { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 6px }
.vkey { display: inline-flex; align-items: center; gap: 6px; font-size: 12.5px; color: var(--muted) }
.vkey i { width: 10px; height: 10px; border-radius: 3px; background: var(--vinf) }
.vcap-tg { display: inline-flex; gap: 6px }
.vcap-tg .btn[aria-pressed="true"] { background: color-mix(in srgb, var(--cobalt) 16%, var(--surface)); border-color: var(--cobalt) }
:root { --vinf: #c2410c } @media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) { --vinf: #fb923c } } :root[data-theme="dark"] { --vinf: #fb923c }
.vcap { position: relative; height: clamp(190px, calc(100svh - 56vw - 210px), 360px); overflow: hidden; overflow: clip; border-radius: 14px; border: 1px solid var(--line); background: var(--surface);
  -webkit-mask-image: linear-gradient(to bottom, transparent 0, #000 11%, #000 84%, transparent 100%); mask-image: linear-gradient(to bottom, transparent 0, #000 11%, #000 84%, transparent 100%) }
.vcap.vcap-empty { height: auto; -webkit-mask-image: none; mask-image: none }
.vcap-in { position: relative; padding: 0 14px; transition: transform .7s cubic-bezier(.22, .61, .36, 1); will-change: transform }
.vcap-pad { height: 44px } .vcap-pad.end { height: 240px }
.vcap-msg { margin: 0; padding: 14px 0; font-size: 14px; color: var(--muted) }
.vcue { display: flex; gap: 10px; align-items: flex-start; margin: 0 0 1.25em; opacity: .55; transition: opacity .4s }
.vcue.on { opacity: 1 } .vcue.past { opacity: .28 }
.vct { flex: 0 0 auto; margin-top: 2px; font: 600 11.5px/1 ui-monospace, monospace; padding: 4px 6px; border-radius: 6px; border: 0; background: color-mix(in srgb, var(--cobalt) 12%, transparent); color: var(--cobalt); cursor: pointer }
.vcl { flex: 1; min-width: 0 }
.ves { margin: 0; font-size: 18px; line-height: 1.45; color: var(--ink) }
.ven { display: none; margin: 1px 0 0; font-size: 14.5px; line-height: 1.4; color: var(--muted) }
.vcap.show-en .ven:not(:empty) { display: block }
.vword { cursor: pointer; border-radius: 4px; transition: background .15s, color .15s }
.vcue.on .vword.said:not(.vinf) { color: var(--ink) }
.vcue.on .vword.now { background: color-mix(in srgb, var(--cobalt) 20%, transparent); box-shadow: 0 0 0 2px color-mix(in srgb, var(--cobalt) 20%, transparent) }
.vword.vinf { color: var(--vinf); font-weight: 600; text-decoration: underline dotted; text-underline-offset: 3px }
.vword.vinf-jargon { text-decoration-style: dashed }
.vcap-listen { display: none; position: absolute; inset: 0; align-items: center; justify-content: center; font-weight: 600; color: var(--muted); pointer-events: none }
.vcap.hide-text .vcl { filter: blur(7px); user-select: none } .vcap.hide-text .vcl * { pointer-events: none }
.vcap.hide-text .vcap-listen { display: flex }
.vcap-note { margin: 6px 0 0; display: flex; flex-wrap: wrap; gap: 4px 10px; align-items: center }
.vcue.mark .ves { font-size: 14px; font-style: italic; color: var(--muted) }
.vtip { position: absolute; z-index: 3; max-width: 220px; padding: 5px 10px; border-radius: 10px; background: var(--ink); color: var(--surface); font-size: 13.5px; font-weight: 600; line-height: 1.25; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  box-shadow: 0 6px 16px rgba(0,0,0,.22); transition: left .28s cubic-bezier(.22,.61,.36,1), top .28s cubic-bezier(.22,.61,.36,1); pointer-events: none }
.vtip::after { content: ""; position: absolute; left: var(--ax, 50%); bottom: -5px; width: 10px; height: 10px; background: inherit; transform: translateX(-50%) rotate(45deg); border-radius: 2px }
.vtip[hidden] { display: none }
.vad-chip { margin: 0; padding: 8px 12px; border-radius: 10px; background: color-mix(in srgb, #e8a317 18%, var(--surface)); border: 1px solid color-mix(in srgb, #e8a317 40%, transparent); font-weight: 600 }
.vad-chip[hidden] { display: none }
.vctl .btn:disabled { opacity: .45; pointer-events: none }
/* video page: Profe tucks away with the bottom menu and comes back up with it */
@media (max-width: 820px) {
  body.vpage-on .tutor-fab { transition: transform .35s cubic-bezier(.3, .8, .3, 1), opacity .25s, bottom .35s cubic-bezier(.3, .8, .3, 1) }
  body.vpage-on.no-tabs:not(.tabs-peek) .tutor-fab { transform: translateY(calc(100% + 60px)); opacity: 0; pointer-events: none }
}
.vinfo { margin: 8px 0; padding: 8px 10px; border-radius: 10px; background: color-mix(in srgb, var(--vinf) 10%, transparent); border-left: 3px solid var(--vinf) }
.lnk { border: 0; background: none; color: inherit; font: inherit; font-weight: 700; text-decoration: underline; padding: 0 2px; cursor: pointer }
@media (max-width: 560px) { .vgrid { grid-template-columns: 1fr; gap: 10px } .vcard { display: flex; align-items: stretch } .vthumb { flex: 0 0 132px; aspect-ratio: 16/9; align-self: center; margin: 8px 0 8px 8px; border-radius: 10px; overflow: hidden } .vplay { width: 32px; height: 32px } .vplay .ic { width: 15px; height: 15px } .vdone { left: 4px; bottom: 4px; font-size: 11px; padding: 2px 6px } .vtxt { padding: 10px 12px; align-self: center } .vtxt b { font-size: 14.5px } }
'''
rep('Translation cue tips <span class="muted small">· Reading and Listening</span>', 'Translation cue tips <span class="muted small">· Reading, Listening and Videos</span>')
k = s.rindex("</style>", 0, s.index("</head>")); s = s[:k] + CSS + s[k:]
open(p, "w", encoding="utf-8").write(s)
print("video ok")
