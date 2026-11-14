"""Practice › Review: inviting cards instead of a plain list (tinted tiles, icon, big number when something is waiting, action pill);
Videos gets a wide card with thumbnails of what to watch next."""
import sys, re
p = sys.argv[1]; s = open(p, encoding="utf-8").read()
if "rvgrid" in s: sys.exit("already patched")
i = s.index('      uiGroup("Review", [', s.index("function practiceHub()")); j = s.index('      ]) + "</div>";', i) + len('      ]) + "</div>";')
NEW = r'''      '<h2 class="ghead">Review</h2>' + reviewCards(due, nm, cl) + "</div>";'''
s = s[:i] + NEW + s[j:]
JS = r'''
  /* ---------- Practice › Review cards ---------- */
  function reviewCards(due, nm, cl) {
    const card = (o) => '<a class="rvc' + (o.wide ? " wide" : "") + (o.hot ? " hot" : "") + '" href="' + o.href + '" style="--a:' + o.c + '">' +
      '<span class="rvtop"><span class="rvi" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + UIC[o.ic][1] + "</svg></span>" + (o.num != null ? '<span class="rvn">' + o.num + "</span>" : "") + "</span>" +
      '<b class="rvt">' + o.t + '</b><small class="rvs">' + o.sub + "</small>" + (o.extra || "") + '<span class="rvgo">' + o.go + ' <span aria-hidden="true">›</span></span></a>';
    const vids = typeof VID_START !== "undefined" ? VID_START.filter((v) => !(S.vhide || {})[v.yt] && !(S.vbad || {})[v.yt]) : [];
    const watched = Object.values(S.vid || {}).filter((d) => d.w).length, next = vids.filter((v) => !((S.vid || {})[v.yt] || {}).w).slice(0, 3);
    const thumbs = next.length ? '<span class="rvth" aria-hidden="true">' + next.map((v) => '<img src="https://i.ytimg.com/vi/' + v.yt + '/mqdefault.jpg" alt="" loading="lazy" onerror="this.remove()">').join("") + "</span>" : "";
    return '<div class="rvgrid">' +
      card({ ic: "cards", c: "#e8a317", t: "Flashcards", href: "#repaso", num: due || null, hot: due > 0, sub: due ? (due === 1 ? "card is due now" : "cards are due now") : "All caught up. New words wait in your decks.", go: due ? "Review now" : "Open decks" }) +
      card({ ic: "mist", c: "#e5484d", t: "My mistakes", href: "#errores", num: nm || null, hot: nm > 0, sub: nm ? (nm === 1 ? "question to try again" : "questions to try again") : "Nothing to fix. Nice work.", go: nm ? "Fix them" : "Take a look" }) +
      card({ ic: "video", c: "#d93a62", wide: true, t: "Videos", href: "#videos", sub: (vids.length ? vids.length + " short clips of real Spanish, with captions that read along" : "Watch real Spanish with captions that read along") + (watched ? " · " + watched + " watched" : ""), extra: thumbs, go: watched ? "Keep watching" : "Start watching" }) +
      card({ ic: "mock", c: "#0f9f8f", t: "Full DELE exams", href: "#examenes", sub: "15 complete A1 exams, marked with the DELE criteria", go: "Choose an exam" }) +
      card({ ic: "mock", c: "#3d7bd9", t: "Mock exam · " + LV[cl].name, href: "#" + cl + "-mock", sub: "A quick 10-question check of your level", go: "Start" }) +
      "</div>";
  }
'''
s = s.replace("  function practiceHub() {", JS + "  function practiceHub() {", 1)
CSS = r'''
/* Practice › Review cards */
.rvgrid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin: 2px 0 8px }
.rvc { position: relative; overflow: hidden; display: flex; flex-direction: column; gap: 3px; min-height: 150px; padding: 14px; border-radius: 18px; text-decoration: none; color: var(--ink);
  background: linear-gradient(160deg, color-mix(in srgb, var(--a) 16%, var(--surface)), color-mix(in srgb, var(--a) 5%, var(--surface)) 70%);
  border: 1px solid color-mix(in srgb, var(--a) 28%, transparent); box-shadow: 0 8px 22px color-mix(in srgb, var(--a) 16%, transparent); transition: transform .15s, box-shadow .15s; animation: lqPop .5s cubic-bezier(.34, 1.4, .64, 1) }
.rvc::after { content: ""; position: absolute; right: -30px; top: -30px; width: 96px; height: 96px; border-radius: 50%; background: color-mix(in srgb, var(--a) 12%, transparent); pointer-events: none }
.rvc:active { transform: scale(.97); box-shadow: 0 4px 12px color-mix(in srgb, var(--a) 14%, transparent) }
.rvc.wide { grid-column: 1 / -1; min-height: 0 }
.rvtop { display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px }
.rvi { width: 40px; height: 40px; border-radius: 12px; display: grid; place-items: center; background: linear-gradient(150deg, color-mix(in srgb, var(--a) 70%, #fff), var(--a)); box-shadow: 0 6px 14px color-mix(in srgb, var(--a) 35%, transparent) }
.rvi svg { width: 21px; height: 21px }
.rvn { position: relative; z-index: 1; font-size: 2rem; font-weight: 800; line-height: 1; color: var(--a); letter-spacing: -.02em; font-variant-numeric: tabular-nums }
.rvc.hot .rvn::after { content: ""; position: absolute; right: -9px; top: -2px; width: 9px; height: 9px; border-radius: 50%; background: var(--a); box-shadow: 0 0 0 0 var(--a); animation: rvPulse 2s infinite }
@keyframes rvPulse { 0% { box-shadow: 0 0 0 0 color-mix(in srgb, var(--a) 60%, transparent) } 70% { box-shadow: 0 0 0 8px transparent } 100% { box-shadow: 0 0 0 0 transparent } }
.rvt { font-size: 1.05rem; line-height: 1.2 }
.rvs { font-size: .84rem; line-height: 1.3; color: var(--muted) }
.rvgo { margin-top: auto; padding-top: 10px; align-self: flex-start; font-size: .84rem; font-weight: 700; color: #fff; background: var(--a); border-radius: 99px; padding: 6px 12px; box-shadow: 0 4px 10px color-mix(in srgb, var(--a) 30%, transparent) }
.rvc .rvgo { margin-top: auto } .rvc:not(.wide) .rvs { margin-bottom: 10px }
.rvth { position: absolute; right: 18px; top: 16px; display: flex; z-index: 1 }
.rvth img { width: 66px; aspect-ratio: 16/9; object-fit: cover; border-radius: 9px; border: 2px solid var(--surface); box-shadow: 0 4px 10px rgba(0,0,0,.18); margin-left: -28px; background: #222 }
.rvth img:first-child { margin-left: 0; transform: rotate(-5deg) } .rvth img:nth-child(2) { transform: translateY(-8px) } .rvth img:nth-child(3) { transform: rotate(5deg) }
@media (prefers-reduced-motion: reduce) { .rvc { animation: none } .rvc.hot .rvn::after { animation: none } }
'''
k = s.rindex("</style>", 0, s.index("</head>")); s = s[:k] + CSS + s[k:]
open(p, "w", encoding="utf-8").write(s)
print("review ok")
