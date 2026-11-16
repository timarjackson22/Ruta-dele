# Video page: a cassette-style "loop the whole video" key built into the right third of the Replay button.
import sys
P = sys.argv[1] if len(sys.argv) > 1 else "index.html"
s = open(P, encoding="utf-8").read()
def rep(a, b):
    global s
    assert s.count(a) == 1, (s.count(a), a[:100]); s = s.replace(a, b)
rep("""        '<button class="btn small vstk" data-act="v-loop" aria-pressed="false" aria-label="Replay sentence: the previous line and this one" title="Replay the previous line and this one">' + IC("repeat") + '<span>Replay</span></button>' +""",
    """        '<span class="vrep"><button class="btn small vstk" data-act="v-loop" aria-pressed="false" aria-label="Replay sentence: the previous line and this one" title="Replay the previous line and this one">' + IC("repeat") + '<span>Replay</span></button>' +
        '<button class="vrepvid" data-act="v-vloop" role="switch" aria-checked="' + !!VP.vloop + '" aria-pressed="' + !!VP.vloop + '" aria-label="Loop the whole video" title="Loop the whole video until you release it"><i class="vrepdot" aria-hidden="true"></i><span>Loop</span></button></span>' +""")
rep("""    else if (a === "v-loop") { // on: replay""", """    else if (a === "v-vloop") { VP.vloop = !VP.vloop; t.setAttribute("aria-pressed", String(VP.vloop)); t.setAttribute("aria-checked", String(VP.vloop)); try { coachToast(VP.vloop ? "🔁 This video will play again from the start until you release Loop." : "Loop off: when the video ends, Next video is ready at the top."); } catch (x) {} }
    else if (a === "v-loop") { // on: replay""")
# at the end: loop the whole video, or bring the Next video button into view
rep("onStateChange: (e) => { vlive(); if (e.data === 0 && !vAd()) { vWatched(id);",
    "onStateChange: (e) => { vlive(); if (e.data === 0 && !vAd()) { vEnded(id); vWatched(id);")
rep("  function vWatched(id) {", """  function vEnded(id) { // the video reached its end (or its clip end)
    if (VP.id !== id) return;
    if (VP.vloop) { setTimeout(() => { if (VP.id !== id || !VP.vloop) return; try { vpSeek(VP.clip ? VP.clip[0] : 0); vpPlay(); } catch (e) {} }, 250); return; }
    const nb = document.querySelector(".vnextbar"); if (!nb) return;
    const top = nb.getBoundingClientRect().top + window.scrollY - ((document.querySelector("header.top") || {}).offsetHeight || 0) - 12;
    try { window.scrollTo({ top: Math.max(0, top), behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" }); } catch (e) { window.scrollTo(0, Math.max(0, top)); }
    const b = nb.querySelector(".vnext:not([disabled])"); if (b) { b.classList.add("vnext-cue"); setTimeout(() => b.classList.remove("vnext-cue"), 2600); }
  }
  function vWatched(id) {""")
CSS = """
/* Replay + Loop: one button, the right third is a cassette-style key that stays sunk while the whole video loops */
body.vpage-on .vbar > .vrep { flex: 1.55 1 0; display: flex; align-items: stretch; min-width: 0; border-radius: 12px; border: 1px solid var(--line); background: var(--surface); overflow: hidden }
body.vpage-on .vbar > .vrep > .vstk { flex: 2 1 0; flex-direction: column; gap: 2px; padding: 5px 2px; border: 0; border-radius: 0; font-size: 11px; font-weight: 600; line-height: 1.1; min-width: 0; background: none }
body.vpage-on .vbar > .vrep > .vstk svg { width: 20px; height: 20px }
body.vpage-on .vbar > .vrep > .vstk > span:last-child { font-size: 10.5px; color: var(--muted) } body.vpage-on .vbar > .vrep > .vstk[aria-pressed="true"] > span:last-child { color: var(--cobalt) }
.vrepvid { flex: 0 0 34%; min-width: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 3px; padding: 4px 2px; border: 0; border-left: 1px solid var(--line); cursor: pointer; font: inherit; font-size: 9px; font-weight: 700; letter-spacing: -.01em; color: var(--muted);
  background: linear-gradient(180deg, color-mix(in srgb, var(--surface) 100%, #fff), color-mix(in srgb, var(--surface) 88%, #8a94a8)); box-shadow: inset 0 -3px 0 color-mix(in srgb, var(--line) 90%, #000 6%), inset 0 1px 0 rgba(255, 255, 255, .7); transition: transform .12s, box-shadow .12s, background .12s }
.vrepdot { width: 14px; height: 14px; border-radius: 50%; border: 2px solid currentColor; display: grid; place-items: center; background: var(--surface) }
.vrepvid[aria-pressed="true"] { transform: translateY(2px); color: var(--cobalt); background: linear-gradient(180deg, color-mix(in srgb, var(--cobalt) 16%, var(--surface)), color-mix(in srgb, var(--cobalt) 8%, var(--surface)));
  box-shadow: inset 0 3px 6px rgba(10, 20, 50, .28), inset 0 -1px 0 rgba(255, 255, 255, .4) }
.vrepvid[aria-pressed="true"] .vrepdot { background: var(--cobalt); border-color: var(--cobalt) }
.vrepvid[aria-pressed="true"] .vrepdot::after { content: ""; width: 4px; height: 7px; border: solid #fff; border-width: 0 2px 2px 0; transform: translateY(-1px) rotate(45deg) }
.vrepvid:focus-visible { outline: 2px solid var(--cobalt); outline-offset: -3px }
.vnext.vnext-cue { animation: vnextCue 1.2s ease 2 } @keyframes vnextCue { 50% { box-shadow: 0 0 0 6px color-mix(in srgb, var(--cobalt) 30%, transparent); transform: scale(1.04) } }
@media (prefers-reduced-motion: reduce) { .vnext.vnext-cue { animation: none; box-shadow: 0 0 0 3px var(--cobalt) } .vrepvid { transition: none } }
"""
rep("/* the menu handle: a thin tab at the very bottom edge, under the controller */", CSS + "/* the menu handle: a thin tab at the very bottom edge, under the controller */")
open(P, "w", encoding="utf-8").write(s); print("video loop key wired")
