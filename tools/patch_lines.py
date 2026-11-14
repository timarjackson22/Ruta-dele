"""Reading & listening: one sentence per line with a blank line between sentences, its English right under it,
and the text gliding up smoothly while it is read."""
import sys
p = sys.argv[1]; s = open(p, encoding="utf-8").read()
if "class=\\\"sl\\\"" in s or "function glTick" in s: sys.exit("already patched")
def rep(a, b, n=1):
    global s
    assert s.count(a) == n, ("anchor", a[:90], s.count(a)); s = s.replace(a, b)
# stories: one sentence per line, English under each sentence
rep('''    return '<div class="story">' + x.paras.map((p) => '<div class="para"><p>' + p.s.map((s) => sent(s, 0)).join(" ") + '</p><p class="en">' + esc(p.s.map((s) => s[1]).join(" ")) + "</p></div>").join("") + "</div>";''',
    '''    return '<div class="story">' + x.paras.map((p) => '<div class="para">' + p.s.map((s) => '<div class="sl"><p class="es">' + sent(s, 0) + '</p><p class="en">' + esc(s[1] || "") + "</p></div>").join("") + "</div>").join("") + "</div>";''')
# podcasts: the same inside each speaker's turn
rep('''<p class="txt">' + p.s.map((s) => sent(s, sp)).join(" ") + '</p><p class="en">' + esc(p.s.map((s) => s[1]).join(" ")) + "</p></div></div>"; }''',
    '''<div class="txt">' + p.s.map((s) => '<div class="sl"><p class="es">' + sent(s, sp) + '</p><p class="en">' + esc(s[1] || "") + "</p></div>").join("") + "</div></div></div>"; }''')
# translations that arrive later (your own texts) go under their own sentence
rep('''    document.querySelectorAll("#ltext .para").forEach((el, pi) => { const en = el.querySelector(".en"); if (en && x.paras[pi]) en.textContent = x.paras[pi].s.map((s) => s[1]).filter(Boolean).join(" "); });''',
    '''    document.querySelectorAll("#ltext .para").forEach((el, pi) => { if (!x.paras[pi]) return; el.querySelectorAll(".sl .en").forEach((en, si) => { const t = (x.paras[pi].s[si] || [])[1]; if (t) en.textContent = t; }); });''')
# the glide replaces the jump to the next sentence
rep('''    if (PL.playing && PL.follow) { const el = document.querySelector('#ltext [data-pi="' + PL.i + '"]');''',
    '''    if (PL.playing) glStart();
    if (PL.playing && PL.follow && !document.querySelector("#ltext .story, #ltext .pod")) { const el = document.querySelector('#ltext [data-pi="' + PL.i + '"]');''')
rep('''  // ---- translation cue tips ----
  const CUE = { w: null, k: -1 };''', '''  // the text glides up while it is read: the spoken word rises to about a third of the screen, never jumping
  const GL = { on: false, y: null };
  function glStart() { if (GL.on) return; GL.on = true; GL.y = null; requestAnimationFrame(glTick); }
  function glTick() {
    const box = document.querySelector("#ltext .story, #ltext .pod");
    if (!PL.playing || !box || FOL.free || PL.follow === false || document.hidden) { GL.on = false; return; }
    const onT = PL.cur && PL.cur === PL.tu;
    const sent = onT ? null : document.querySelector('#ltext [data-pi="' + PL.i + '"]'), row = sent && sent.closest(".sl");
    if (row) {
      // a point that moves steadily through the sentence (and down to the next one) as the words are spoken
      const ws = [...sent.querySelectorAll(".w")], k = ws.findIndex((w) => w.classList.contains("spk")), f = ws.length ? Math.max(0, k) / ws.length : 0;
      const rr = row.getBoundingClientRect(), nx = row.nextElementSibling || (row.parentElement.nextElementSibling || {}).firstElementChild;
      const span = nx && nx.getBoundingClientRect ? nx.getBoundingClientRect().top - rr.top : rr.height;
      const want = innerHeight * 0.3, d = rr.top + span * f - want;
      const max = document.documentElement.scrollHeight - innerHeight;
      if (GL.y == null || Math.abs(GL.y - scrollY) > 2) GL.y = scrollY; // you moved the page: carry on from there
      const step = Math.max(-3, Math.min(d * 0.02, 3)); // gentle, speed-limited
      if (Math.abs(d) > 0.5) { GL.y = Math.max(0, Math.min(max, GL.y + step)); window.scrollTo(0, GL.y); }
    }
    requestAnimationFrame(glTick);
  }
  // ---- translation cue tips ----
  const CUE = { w: null, k: -1 };''')
rep("Press play, then tap “Show text” to read along.", "Press play, then tap ⋯ › “Show text” to read along.")
CSS = r'''
/* ===== one sentence per line ===== */
#ltext .story { gap: 1.6em }
#ltext .para { display: flex; flex-direction: column; gap: 1.15em }
#ltext .sl p { margin: 0 }
#ltext .story .sl .en, #ltext .pod .sl .en { margin-top: 2px; font-size: .95rem; line-height: 1.45 }
#ltext .pod .txt { display: flex; flex-direction: column; gap: 1em; font-size: 1.08rem; line-height: 1.6 }
#ltext .pline.playing .txt { background: none; box-shadow: none }
#ltext .story, #ltext .pod { padding-bottom: 30vh }
'''
k = s.rindex("</style>", 0, s.index("</head>")); s = s[:k] + CSS + s[k:]
open(p, "w", encoding="utf-8").write(s)
print("lines ok")
