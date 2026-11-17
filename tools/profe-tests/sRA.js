// v219: Read aloud is a Listen button in the top bar on every readable page (lessons, guides, grammar, level pages); scroll view starts where you are, page view on the current page; tap pauses/resumes.
const { chromium, devices } = require("playwright");
const SPEECH = () => { class U { constructor(t) { this.text = t; } } window.SpeechSynthesisUtterance = U; const ss = { speaking: false, pending: false, paused: false, getVoices: () => [{ name: "Google español", lang: "es-US", localService: false, voiceURI: "g" }], speak(u) { ss.speaking = true; setTimeout(() => { ss.speaking = false; u.onend && u.onend({}); }, 400); }, cancel() { ss.speaking = false; } }; Object.defineProperty(window, "speechSynthesis", { value: ss }); };
(async () => {
  const b = await chromium.launch(); const c = await b.newContext({ ...devices["Pixel 7"], viewport: { width: 360, height: 740 }, serviceWorkers: "block" }); await c.addInitScript(SPEECH);
  const p = await c.newPage(); const er = []; p.on("pageerror", (x) => er.push(x.message));
  const R = []; const rec = (n, ok, i) => { R.push(ok); console.log((ok ? "PASS " : "FAIL ") + n + (i ? "  " + i : "")); };
  const top = () => p.evaluate(() => { const b = document.getElementById("nb-ra"); if (!b) return null; const r = b.getBoundingClientRect(), h = document.querySelector("header.top").getBoundingClientRect(); return { txt: b.textContent, inHdr: r.top >= h.top && r.bottom <= h.bottom + 1, right: r.right, vis: r.width > 0 && getComputedStyle(b).display !== "none", ra: document.body.classList.contains("ra-on"), bar: !!document.getElementById("ra-bar"), title: (() => { const t = document.getElementById("nb-title"); return t && t.getBoundingClientRect().width; })() }; });
  for (const r of ["a1-u3", "b1-exam", "guia-ser-estar", "gramatica", "a2", "inicio", "biblioteca"]) {
    await p.goto("http://localhost:8766/#" + r); await p.waitForTimeout(1200); const t = await top();
    const want = !/inicio|biblioteca/.test(r);
    rec(r + (want ? ": Listen in the top bar" : ": no Listen button"), want ? !!(t && t.vis && t.inHdr && t.right <= 360 && !t.bar) : !t, JSON.stringify(t));
    await p.screenshot({ path: "/tmp/sra-" + r + ".png", clip: { x: 0, y: 0, width: 360, height: 120 }, scale: "css" });
  }
  // lesson, scrolled half way: starts where you are; tap = pause, tap = resume
  await p.goto("http://localhost:8766/#a1-u3"); await p.waitForTimeout(1200); await p.evaluate(() => scrollTo(0, document.documentElement.scrollHeight / 2)); await p.waitForTimeout(300);
  await p.click("#nb-ra"); await p.waitForTimeout(500);
  let st = await p.evaluate(() => ({ on: window.__ra().on, i: window.__ra().i, n: window.__ra().q.length, txt: document.getElementById("nb-ra").textContent }));
  rec("Scrolled lesson: reading starts where you are, not at the top", st.on && st.i > 2, JSON.stringify(st));
  rec("While reading the top button says Pause", st.txt === "Pause", st.txt);
  await p.click("#nb-ra"); await p.waitForTimeout(300); st = await p.evaluate(() => ({ on: window.__ra().on, paused: window.__ra().paused, txt: document.getElementById("nb-ra").textContent }));
  rec("Tap pauses (Resume)", st.on && st.paused && st.txt === "Resume", JSON.stringify(st));
  await p.click("#nb-ra"); await p.waitForTimeout(300); st = await p.evaluate(() => ({ paused: window.__ra().paused, txt: document.getElementById("nb-ra").textContent }));
  rec("Tap resumes", !st.paused && st.txt === "Pause", JSON.stringify(st));
  await p.screenshot({ path: "/tmp/sra-playing.png", scale: "css" });
  await p.evaluate(() => document.querySelector('[data-act="ra-stop"]').click()); await p.waitForTimeout(300);
  rec("Stopping returns it to Listen", (await top()).txt === "Listen");
  // page view: page 3 of a lesson, Listen from the top bar reads that page
  await p.goto("http://localhost:8766/#a1-u4"); await p.waitForTimeout(1000); await p.evaluate(() => document.querySelector('[data-act="pg-mode"]').click()); await p.waitForTimeout(1500);
  const paged = await p.evaluate(() => document.body.classList.contains("paged"));
  if (paged) { await p.evaluate(() => { for (let k = 0; k < 3; k++) document.querySelector('.lf-nav [data-act="pg-next"], [data-act="pg-next"]')?.click(); }); await p.waitForTimeout(600);
    const t = await top(); rec("Page view: Listen still in the top bar on a later page", !!(t && t.vis && t.inHdr), JSON.stringify(t));
    await p.click("#nb-ra"); await p.waitForTimeout(400); st = await p.evaluate(() => ({ i: window.__ra().i, pg: window.__lf && window.__lf.state().i, its: window.__lf && window.__lf.pageOf(window.__ra().q[window.__ra().i].el) }));
    rec("Page view: reads from the page you are on", st.pg > 0 && st.its === st.pg, JSON.stringify(st)); await p.screenshot({ path: "/tmp/sra-paged.png", scale: "css" }); }
  else rec("page view on", false);
  rec("No page errors", !er.length, er.join(" | "));
  await b.close(); console.log(R.every(Boolean) ? "ALL PASS" : "FAILED");
})();
