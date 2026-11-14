"""Profe chat: menu tucked away while chatting, the reply being spoken stays in view and glides up as it is read,
Profe stops talking when the chat is closed, and an EN button to show or hide English under Profe's Spanish."""
import sys
p = sys.argv[1]; s = open(p, encoding="utf-8").read()
if "function cgTick" in s: sys.exit("already patched")
def rep(a, b, n=1):
    global s
    assert s.count(a) == n, ("anchor", a[:90], s.count(a)); s = s.replace(a, b)
# EN toggle in the chat header
rep('''<button class="btn small" data-act="t-new">New chat</button>''', '''<button class="btn small t-enbtn" data-act="t-en" aria-pressed="' + !TS.noEnLine + '" title="English under Profe’s Spanish">EN</button><button class="btn small" data-act="t-new">New chat</button>''')
rep('''    else if (act === "t-close") {''', '''    else if (act === "t-en") { TS.noEnLine = !TS.noEnLine; tsave(); tRender();
      if (!TS.noEnLine && tCur) (async () => { for (const m of tCur.msgs.slice(-12)) { if (m.r === "a" && m.en == null) { try { await trReply(m); } catch (x) {} } } })(); }
    else if (act === "t-close") { SPK_GEN++; try { speechSynthesis.cancel(); } catch (x) {} CG.on = false; AG++;''')
# a reply that arrives after the chat was closed stays quiet
rep('''  function speakMixed(text, onDone) {
    if (!canSpeak) { if (onDone) onDone(); return; }''', '''  function speakMixed(text, onDone) {
    if (!canSpeak) { if (onDone) onDone(); return; }
    { const tp = document.getElementById("tutor"); if (tp && tp.hidden && !document.getElementById("litem") && !(typeof PR !== "undefined" && PR)) { if (onDone) onDone(); return; } }''')
rep('''      feed(full) { if (!canSpeak || gen !== SPK_GEN) return;''', '''      feed(full) { if (!canSpeak || gen !== SPK_GEN) return; { const tp = document.getElementById("tutor"); if (tp && tp.hidden) { SPK_GEN++; return; } }''')
# the glide: follows how much of the reply has been spoken
rep('''  function profeUtter(t, es) {''', '''  const CG = { on: false, y: 0, key: -1, done: 0, seg: 0, t0: 0, free: false };
  function cgStart(u, t) {
    const box = document.getElementById("t-msgs"); if (!box) return;
    const n = box.querySelectorAll(".tm").length; if (n !== CG.key) { CG.key = n; CG.done = 0; CG.free = false; }
    CG.seg = t.length; CG.t0 = performance.now(); // it is spoken right away: the queue plays one at a time
    try { const P = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(u), "onend"); let h = null;
      Object.defineProperty(u, "onend", { configurable: true, get: () => h, set: (fn) => { h = function (e) { if (CG.seg) { CG.done += CG.seg; CG.seg = 0; CG.last = performance.now(); } return fn && fn.call(this, e); }; if (P && P.set) P.set.call(u, h); } }); } catch (e) {}
    if (!CG.on) { CG.on = true; CG.y = box.scrollTop; requestAnimationFrame(cgTick); }
  }
  function cgTick() {
    const box = document.getElementById("t-msgs"), tp = document.getElementById("tutor");
    const now = performance.now(), busy = (CG.seg > 0 && now - CG.t0 < (CG.seg / (11 * (TS.prate || 1))) * 2500 + 4000) || now - (CG.last || 0) < 1200;
    if (!box || !tp || tp.hidden || !busy) { CG.on = false; return; }
    if (!CG.free) {
      const bs = box.querySelectorAll(".tm.a"), b = bs[bs.length - 1];
      if (b) {
        const total = Math.max(1, (b.querySelector(".tb") || b).textContent.length), cps = 13 * (TS.prate || 1);
        const f = Math.min(1, (CG.done + Math.min(CG.seg, ((performance.now() - CG.t0) / 1000) * cps)) / total);
        const top = b.offsetTop - box.offsetTop, want = Math.max(0, top - 10 + Math.max(0, b.offsetHeight - box.clientHeight * 0.55) * f);
        const maxY = box.scrollHeight - box.clientHeight, goal = Math.min(maxY, want);
        if (Math.abs(box.scrollTop - CG.y) > 3) CG.y = box.scrollTop;
        const d = goal - CG.y; if (Math.abs(d) > 0.5) { CG.y += Math.max(-8, Math.min(d * (d > 0 ? 0.05 : 0.12), 4)); box.scrollTop = CG.y; }
      }
    }
    requestAnimationFrame(cgTick);
  }
  // scrolling the chat yourself stops the glide until the next reply
  ["touchmove", "wheel"].forEach((ev) => document.addEventListener(ev, (e) => { if (CG.on && e.target.closest && e.target.closest("#t-msgs")) CG.free = true; }, { passive: true }));
  function profeUtter(t, es) {''')
rep('''    return utter(t, es ? "es" : "en", (es ? 0.92 : 1) * (TS.prate || 1), v || undefined, TS.ppitch || 1);''', '''    const u = utter(t, es ? "es" : "en", (es ? 0.92 : 1) * (TS.prate || 1), v || undefined, TS.ppitch || 1); try { cgStart(u, t); } catch (e) {} return u;''')
# while it glides, new renders don't throw the chat to the bottom
rep('''last.outerHTML = bubble(m, tCur.msgs.length - 1); box.scrollTop = box.scrollHeight; }''', '''last.outerHTML = bubble(m, tCur.msgs.length - 1); if (CG.on) box.scrollTop = CG.y; else box.scrollTop = box.scrollHeight; }''')
rep('''    const box = document.getElementById("t-msgs"); if (box) box.scrollTop = box.scrollHeight;''', '''    const box = document.getElementById("t-msgs"); if (box) box.scrollTop = CG.on ? CG.y : box.scrollHeight;''')
CSS = r'''
/* ===== Profe chat: no tab bar while chatting ===== */
@media (max-width: 820px) {
  html body.tutor-open .tabbar { transform: translateY(calc(100% + 30px)); opacity: 0; pointer-events: none }
  html body.tutor-open .tutor { bottom: 0 !important; padding-bottom: env(safe-area-inset-bottom, 0px) !important }
  html body.tutor-open #tabpeek { display: none !important }
}
.t-enbtn { font-weight: 700; letter-spacing: .04em } .t-enbtn[aria-pressed="true"] { background: var(--cobalt); color: var(--on-cobalt); border-color: transparent }
'''
k = s.rindex("</style>", 0, s.index("</head>")); s = s[:k] + CSS + s[k:]
open(p, "w", encoding="utf-8").write(s)
print("chat ok")
