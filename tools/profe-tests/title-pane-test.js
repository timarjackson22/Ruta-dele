// Title pane v3 (tools/TITLE_PANE_BRIEF.md): never collapses, edge to edge, no border; the line being read ~½ inch below it;
// a flowing stream; the stream sound plays only while reading.
const { chromium, devices } = require("playwright");
const R = []; const rec = (n, ok, info) => { R.push(!!ok); console.log((ok ? "PASS " : "FAIL ") + n + (!ok && info != null ? "  " + info : "")); };
const SPEECH = () => { class U { constructor(t) { this.text = t; } } window.SpeechSynthesisUtterance = U; const ss = { speaking: false, pending: false, paused: false, getVoices: () => [{ name: "es-ES", lang: "es-ES", localService: true, voiceURI: "es" }], speak(u) { ss.speaking = true; setTimeout(() => { u.onstart && u.onstart({}); }, 30); u.__t = setTimeout(() => { ss.speaking = false; u.onend && u.onend({}); }, 2600); ss.cur = u; }, cancel() { ss.speaking = false; if (ss.cur) clearTimeout(ss.cur.__t); }, pause() {}, resume() {}, addEventListener() {} }; Object.defineProperty(window, "speechSynthesis", { value: ss, configurable: true });
  window.__ac = 0; const AC = window.AudioContext; window.AudioContext = function () { window.__ac++; return new AC(); }; };
const innerHeightOf = () => 915; // Pixel 7
(async () => {
  const b = await chromium.launch(); const shots = process.argv[2];
  for (const scheme of ["light", "dark"]) {
    const c = await b.newContext({ ...devices["Pixel 7"], serviceWorkers: "block", colorScheme: scheme }); await c.addInitScript(SPEECH); await c.route("**/fonts.googleapis.com/**", (r) => r.fulfill({ contentType: "text/css", body: "" }));
    const p = await c.newPage(); const er = []; p.on("pageerror", (x) => er.push(x.message));
    await p.goto("http://localhost:8766/#reading-b1-01"); await p.waitForTimeout(1500);
    const a = await p.evaluate(() => { const h = document.getElementById("lhead"), r = h.getBoundingClientRect(), cs = getComputedStyle(h); return { left: Math.round(r.left), right: Math.round(r.right), w: innerWidth, h: Math.round(r.height), bw: cs.borderTopWidth + cs.borderLeftWidth, rad: cs.borderTopLeftRadius, shadow: cs.boxShadow, fs: parseFloat(getComputedStyle(h.querySelector(".ltitle")).fontSize), anim: getComputedStyle(document.querySelector(".lh-valley .fl")).animationName, valley: !!document.querySelector(".lh-valley .w1") }; });
    if (scheme === "light") {
      const edge = await p.evaluate(() => { const r = document.getElementById("lhead").getBoundingClientRect(), y = r.top + r.height / 2, at = (x) => { const e = document.elementFromPoint(x, y); return !!e && !!e.closest("#lhead"); }; return { l: at(1), r: at(innerWidth - 2) }; });
      rec("Pane spans the full width, edge to edge (visible at both screen edges)", a.left === 0 && a.right === a.w && edge.l && edge.r, JSON.stringify({ a, edge }));
      rec("…with no border, corners or shadow", /^0px0px$/.test(a.bw) && a.rad === "0px" && a.shadow === "none", JSON.stringify(a));
      rec("A valley with a stream whose surface flows", a.valley && a.anim === "lhflow", JSON.stringify(a));
      rec("The pane takes at most a quarter of the screen", a.h <= innerHeightOf(p) * 0.25 + 1, a.h + " of " + (await p.evaluate(() => innerHeight)));
      rec("The background-sound switch is at the top of the pane", await p.evaluate(() => { const b = document.querySelector("#lhead .lh-top .lamb"); return !!b && /stream/i.test(b.getAttribute("aria-label")); }));
    }
    if (shots) await p.screenshot({ path: shots + "-" + scheme + "-top.png" });
    await p.click("#pl-play"); await p.waitForTimeout(1200);
    rec("[" + scheme + "] Stream sound starts while the text is read", await p.evaluate(() => window.__lStream()));
    await p.evaluate(() => scrollBy(0, 420)); await p.waitForTimeout(9000);
    const f = await p.evaluate(() => { const h = document.getElementById("lhead"), r = h.getBoundingClientRect(), hb = document.querySelector("header.top").getBoundingClientRect().bottom, pl = document.querySelector("#ltext .playing, #ltext [data-pi].playing"); const pr = pl && pl.getBoundingClientRect(); return { h: Math.round(r.height), top: Math.round(r.top - hb), fs: parseFloat(getComputedStyle(h.querySelector(".ltitle")).fontSize), sub: getComputedStyle(h.querySelector(".lh-sub")).display, gap: pr ? Math.round(pr.top - r.bottom) : null, playing: document.body.classList.contains("lplaying") }; });
    if (scheme === "light") {
      rec("Reading: the pane stays the same size (no collapse)", f.playing && Math.abs(f.h - a.h) <= 3 && Math.abs(f.fs - a.fs) < 0.6 && f.sub !== "none", JSON.stringify({ a: a.h, afs: a.fs, f }));
      rec("…stuck under the top bar", Math.abs(f.top) <= 2, f.top);
      rec("…the sentence being read sits about ½ inch below the pane (30–75 px), not under it", f.gap != null && f.gap >= 30 && f.gap <= 75, f.gap);
    }
    if (shots) await p.screenshot({ path: shots + "-" + scheme + "-reading.png" });
    await p.click("#pl-play"); await p.waitForTimeout(1200);
    rec("[" + scheme + "] Pausing stops the stream sound", !(await p.evaluate(() => window.__lStream())));
    if (scheme === "light") {
      await p.click('[data-act="l-amb"]'); await p.waitForTimeout(150); await p.click("#pl-play"); await p.waitForTimeout(1200);
      rec("Tap once: birdsong while reading", (await p.evaluate(() => window.__lAmb())) === "birds", await p.evaluate(() => window.__lAmb()));
      await p.click('[data-act="l-amb"]'); await p.waitForTimeout(400);
      rec("Tap again: background sound off, straight away (even mid-reading)", !(await p.evaluate(() => window.__lStream())) && /off/i.test(await p.getAttribute('[data-act="l-amb"]', "aria-label")));
      await p.click("#pl-play");
      const ov = await p.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1);
      rec("No sideways scroll", !ov);
    }
    rec("[" + scheme + "] No script errors", !er.length, er.join(" | "));
    await c.close();
  }
  for (const dev of ["iPhone SE", "iPhone 13"]) { const c2 = await b.newContext({ ...devices[dev], serviceWorkers: "block" }); const q2 = await c2.newPage(); await q2.goto("http://localhost:8766/#reading-b1-01"); await q2.waitForTimeout(1200);
    const hh = await q2.evaluate(() => [document.getElementById("lhead").getBoundingClientRect().height, innerHeight]); rec(dev + ": the pane takes at most a quarter of the screen", hh[0] <= hh[1] * 0.25 + 1, hh.join(" of ")); await c2.close(); }
  const rm = await b.newContext({ ...devices["Pixel 7"], serviceWorkers: "block", reducedMotion: "reduce" }); const q = await rm.newPage(); await q.goto("http://localhost:8766/#reading-b1-01"); await q.waitForTimeout(1200);
  rec("Reduced motion: the stream is still", (await q.evaluate(() => getComputedStyle(document.querySelector(".lh-valley .fl")).animationName)) === "none");
  console.log(R.filter(Boolean).length + "/" + R.length + " passed"); await b.close();
})();
