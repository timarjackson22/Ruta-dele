// v262: the highlight follows the SOUND, not the voice's word reports. Replays what an S24 recording showed: Google's online
// voice reports words ~2.2× faster than it says them, starts late, or reports nothing. Every 120 ms the lit word must be the word
// being heard (within 2 words behind / 1 ahead) — measured from a mock voice whose sound runs at 15 letters a second with pauses.
const { chromium, devices } = require("playwright");
const MODES = (process.argv[2] || "honest,early,late,none").split(",");
const ROUTES = ["reading-a1-01", "historia-a1-1"];
const SPEECH = (mode) => {
  window.__mode = mode; window.__samples = []; window.__badS = [];
  class U { constructor(t) { this.text = t; this.rate = 1; } } window.SpeechSynthesisUtterance = U;
  const LET = 0.066, P_STOP = 0.34, P_COMMA = 0.17;
  const ss = { speaking: false, pending: false, paused: false, onvoiceschanged: null,
    getVoices: () => [{ name: "Google español de Estados Unidos", lang: "es-US", localService: false, voiceURI: "g" }, { name: "Google US English", lang: "en-US", localService: false, voiceURI: "ge" }],
    cancel() { ss.gen = (ss.gen || 0) + 1; ss.speaking = false; ss.cur = null; window.__now = null; },
    speak(u) {
      const g = (ss.gen = (ss.gen || 0) + 1); ss.speaking = true; ss.cur = u;
      const words = [...u.text.matchAll(/[\p{L}\d]+/gu)]; let t = 0; const at = [];
      words.forEach((m, k) => { at.push(t); const nx = words[k + 1], gap = u.text.slice(m.index + m[0].length, nx ? nx.index : u.text.length); t += (m[0].length + 1) * LET + (/[.!?…;:]/.test(gap) ? P_STOP : /,/.test(gap) ? P_COMMA : 0); });
      const dur = t, lag = mode === "late" ? 0.6 : 0.05; // Android: «start» and sound 0.5–0.9 s after speak()
      const live = () => ss.gen === g && ss.cur === u;
      setTimeout(() => { if (!live()) return; const t0 = performance.now(); window.__now = { u, words, at, t0 }; try { u.onstart && u.onstart({}); } catch (e) {}
        if (mode !== "none") words.forEach((m, k) => setTimeout(() => { if (live()) try { u.onboundary && u.onboundary({ name: "word", charIndex: m.index }); } catch (e) {} }, (mode === "early" ? at[k] / 2.2 : at[k]) * 1000));
        setTimeout(() => { if (!live()) return; ss.speaking = false; window.__now = null; try { u.onend && u.onend({}); } catch (e) {} }, dur * 1000 + 40);
      }, lag * 1000);
    } };
  Object.defineProperty(window, "speechSynthesis", { value: ss });
  setInterval(() => { const n = window.__now; if (!n) return; const el = (performance.now() - n.t0) / 1000; let k = 0; for (let j = 0; j < n.at.length; j++) if (n.at[j] <= el) k = j;
    if (el - n.at[k] < 0.12) return; // just changed: skip the boundary instant
    const NUMW = /^(las|la|y|cero|uno|un|una|dos|tres|cuatro|cinco|seis|siete|ocho|nueve|diez|once|doce|trece|catorce|quince|cuarto|media|veinte|veinti\S+|treinta|cuarenta|cincuenta|dieci\S+)$/i; if (NUMW.test(n.words[k][0]) && !/\b(las|la|y)\b/i.test(n.words[k][0] + "x")) { const pageW = [...document.querySelectorAll("#ltext .w")].some((w) => w.textContent.toLowerCase() === n.words[k][0].toLowerCase()); if (!pageW) return; } /* a number spoken as words has no word on the page (10:15 → «diez y cuarto») */
    const lit = [...document.querySelectorAll("#ltext .w.spk")].map((x) => x.textContent.normalize("NFC").toLowerCase()); if (!lit.length) { const head = n.words.slice(0, 3).map((m) => m[0].toLowerCase()).join(" "), inText = [...document.querySelectorAll("#ltext .sent")].some((s) => (s.textContent.toLowerCase().match(/[\p{L}\d]+/gu) || []).slice(0, 3).join(" ") === head); if (!inText) return; /* the title is read but is not in the text */ window.__samples.push(0); window.__badS.push("(none) @" + n.words[k][0]); return; }
    const near = n.words.slice(Math.max(0, k - 2), k + 2).map((m) => m[0].toLowerCase()), ok = lit.some((w) => near.includes(w) || /\d/.test(w));
    window.__samples.push(ok ? 1 : 0); if (!ok) window.__badS.push(lit.join(" ") + " @" + n.words[k][0]); }, 120);
};
(async () => {
  const b = await chromium.launch(); let fail = 0;
  for (const mode of MODES) for (const r of ROUTES) {
    const c = await b.newContext({ ...devices["Pixel 7"], serviceWorkers: "block" }); await c.addInitScript(SPEECH, mode);
    const p = await c.newPage(); const er = []; p.on("pageerror", (e) => er.push(e.message));
    await p.goto((process.env.URL || "http://localhost:8766/") + "#" + r); await p.waitForTimeout(1400);
    await p.click("#pl-play").catch(() => {}); await p.waitForTimeout(16000);
    const res = await p.evaluate(() => ({ n: window.__samples.length, ok: window.__samples.filter(Boolean).length, bad: window.__badS.slice(0, 5), pace: window.__cuePace && window.__cuePace() }));
    const pct = res.n ? res.ok / res.n : 0, pass = res.n > 60 && pct >= 0.85 && !er.length; if (!pass) fail++;
    console.log((pass ? "PASS " : "FAIL ") + mode + " · " + r + ": lit word = heard word in " + Math.round(pct * 100) + "% of " + res.n + " moments (learned pace " + (res.pace ? res.pace.toFixed(3) : "–") + ")" + (pass ? "" : " " + JSON.stringify(res.bad) + " " + er.join(" | ")));
    await c.close();
  }
  await b.close(); console.log(fail ? fail + " FAILED" : "sSYNC2 OK"); process.exit(fail ? 1 : 0);
})();
