"""Lessons read aloud: the page glides up slowly as it is read, like the reading texts (layout unchanged)."""
import sys
p = sys.argv[1]; s = open(p, encoding="utf-8").read()
if "function raGlide" in s: sys.exit("already patched")
def rep(a, b, n=1):
    global s
    assert s.count(a) == n, ("anchor", a[:90], s.count(a)); s = s.replace(a, b)
rep('''    const r = item.el.getBoundingClientRect(); if (r.top < 120 || r.bottom > innerHeight - 170) followTo(item.el);
    raPlayerUI();''', '''    const r = item.el.getBoundingClientRect(); if (r.bottom < -innerHeight || r.top > 2 * innerHeight) followTo(item.el); // far away: go there first
    RA.t0 = performance.now(); RA.est = (item.secs || (item.secs = raSecs(item))) * 1000; raGlide();
    raPlayerUI();''')
rep('''      if (k >= item.segs.length) { RA.i++;''', '''      if (k >= item.segs.length) { try { const real = performance.now() - RA.t0; if (RA.est > 800 && real > 300) RA.gf = Math.min(2.5, Math.max(0.4, (RA.gf || 1) * 0.7 + (real / RA.est) * 0.3)); } catch (e) {} RA.i++;''')
rep('''  function raPlay() {''', '''  // a point moves steadily through the part being read (and on to the next part); the page glides to keep it a third of the way down
  const RG = { on: false, y: null };
  function raGlide() { if (RG.on) return; RG.on = true; RG.y = null; requestAnimationFrame(raGTick); }
  function raGTick() {
    if (!RA.on || RA.paused || FOL.free || document.hidden || !RA.el || !RA.el.isConnected) { RG.on = false; return; }
    const el = RA.el, rr = el.getBoundingClientRect(), nx = RA.q[RA.i + 1] && RA.q[RA.i + 1].el;
    let span = rr.height; if (nx && nx.isConnected) { const t = nx.getBoundingClientRect().top - rr.top; if (t > 0 && t < innerHeight * 1.5) span = t; }
    const f = Math.min(1, (performance.now() - RA.t0) / Math.max(600, RA.est * (RA.gf || 1)));
    const d = rr.top + span * f - innerHeight * 0.3, max = document.documentElement.scrollHeight - innerHeight;
    if (RG.y == null || Math.abs(RG.y - scrollY) > 2) RG.y = scrollY;
    if (d < 0 && rr.top > 70) { requestAnimationFrame(raGTick); return; } // only glide up; go back only if the part being read has slipped off the top
    if (Math.abs(d) > 0.5) { RG.y = Math.max(0, Math.min(max, RG.y + Math.max(-3, Math.min(d * 0.02, 3)))); window.scrollTo(0, RG.y); }
    requestAnimationFrame(raGTick);
  }
  function raPlay() {''')
open(p, "w", encoding="utf-8").write(s)
print("raglide ok")
