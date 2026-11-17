// Highlighted word follows the voice: boundary events from the spoken text must light the same word on the page.
const { chromium, devices } = require("playwright");
const ROUTES = (process.argv[2] || "reading-b1-01,reading-a2-03,reading-b2-02,reading-c1-01").split(",");
const SPEECH = () => {
  window.__bad = []; window.__n = 0;
  class U { constructor(t) { this.text = t; this.rate = 1; } } window.SpeechSynthesisUtterance = U;
  const ss = { speaking: false, pending: false, paused: false, onvoiceschanged: null,
    getVoices: () => [{ name: "Google español de Estados Unidos", lang: "es-US", localService: false, voiceURI: "g" }, { name: "Google US English", lang: "en-US", localService: false, voiceURI: "ge" }],
    cancel() { ss.q = []; ss.speaking = false; ss.cur = null; },
    speak(u) { ss.speaking = true; const words = [...u.text.matchAll(/[\p{L}\d]+(?:['’][\p{L}]+)?/gu)]; let k = 0; ss.cur = u;
      const step = () => { if (ss.cur !== u) return; if (k >= words.length) { ss.speaking = false; u.onend && u.onend({}); return; }
        const m = words[k++]; try { u.onstart && k === 1 && u.onstart({}); u.onboundary && u.onboundary({ name: "word", charIndex: m.index }); } catch (e) {}
        setTimeout(() => { const els = [...document.querySelectorAll("#ltext .w.spk")], el = els[0] && { textContent: els.map((x) => x.textContent).join(" ") }; if (el && u.onboundary) { window.__n++; const shown = el.textContent.normalize("NFC").toLowerCase().replace(/[^\p{L}\d]/gu, ""); if (!/\d/.test(m[0]) && !shown.includes(m[0].toLowerCase()) && !m[0].toLowerCase().includes(shown)) window.__bad.push(m[0] + " ≠ " + el.textContent); } setTimeout(step, 4); }, 8); };
      setTimeout(step, 5); } };
  Object.defineProperty(window, "speechSynthesis", { value: ss });
};
(async () => {
  const b = await chromium.launch(); const c = await b.newContext({ ...devices["Pixel 7"], serviceWorkers: "block" }); await c.addInitScript(SPEECH);
  let fail = 0;
  for (const r of ROUTES) {
    const p = await c.newPage(); await p.goto("http://localhost:8766/#" + r); await p.waitForTimeout(1400);
    await p.click("#pl-play").catch(() => {}); await p.waitForTimeout(6000);
    const res = await p.evaluate(() => ({ n: window.__n, bad: window.__bad.slice(0, 6), nb: window.__bad.length }));
    const ok = res.n > 20 && res.nb === 0; if (!ok) fail++;
    console.log((ok ? "PASS " : "FAIL ") + r + ": " + res.n + " words checked, " + res.nb + " out of sync " + (res.bad.length ? JSON.stringify(res.bad) : ""));
    await p.close();
  }
  await b.close(); console.log(fail ? fail + " FAILED" : "sSYNC OK"); process.exit(fail ? 1 : 0);
})();
