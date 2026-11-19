// v237 Listen/Read presentation: sentence by sentence, slim header while playing, follow-along meaning docked (never over
// the text), a highlighted fragment gets its own translation, the top-bar title never under a button, voices that send no
// word positions are learned and ranked lower.
const { chromium, devices } = require("playwright"); const fs = require("fs");
const URL = process.env.URL || "http://localhost:8766/";
const src = fs.readFileSync(__dirname + "/sVC.js", "utf8"); const INIT = eval(src.match(/const INIT = (\(\) => \{[\s\S]*?\n\};)/)[1]);
(async () => {
  const b = await chromium.launch(); const R = []; const rec = (n, ok, i) => { R.push(!!ok); console.log((ok ? "PASS " : "FAIL ") + n + (ok ? "" : "  " + (i || ""))); };
  const c = await b.newContext({ ...devices["Pixel 7"], serviceWorkers: "block" }); await c.addInitScript(INIT); const p = await c.newPage(); const er = []; p.on("pageerror", (e) => er.push(e.message));
  await p.goto(URL + "#historia-a1-1"); await p.waitForTimeout(1500);
  const lay = await p.evaluate(() => { const s = [...document.querySelectorAll("#ltext .story .sl")].slice(0, 3).map((x) => x.getBoundingClientRect()); return { block: getComputedStyle(document.querySelector("#ltext .story .sl")).display, stacked: s.length === 3 && s[1].top >= s[0].bottom - 1 && s[2].top >= s[1].bottom - 1 }; });
  rec("A story reads sentence by sentence (each sentence starts on its own line)", lay.block === "block" && lay.stacked, JSON.stringify(lay));
  await p.evaluate(() => document.querySelector('[aria-label^="Play"]').click()); await p.waitForTimeout(2600);
  const hd = await p.evaluate(() => ({ h: document.querySelector("#litem .lhead").getBoundingClientRect().height, cue: (() => { const c = document.getElementById("cue"); if (!c || c.hidden) return null; const r = c.getBoundingClientRect(), pl = document.querySelector("#litem .player").getBoundingClientRect(); return { fixed: getComputedStyle(c).position, above: r.bottom <= pl.top + 1 }; })() }));
  rec("While playing, the header is a slim bar (≤ 90 px)", hd.h <= 90, hd.h);
  rec("The follow-along meaning sits above the player, not over the next line", hd.cue && hd.cue.fixed === "fixed" && hd.cue.above, JSON.stringify(hd.cue));
  await p.evaluate(() => { const b = document.querySelector('[aria-label^="Pause"]'); b && b.click(); }); await p.waitForTimeout(300);
  await p.evaluate(() => { const s = [...document.querySelectorAll("#ltext .sent")].find((x) => /pero ahora vivo/.test(x.textContent)); const ws = [...s.querySelectorAll(".w")]; const a = ws.find((w) => w.textContent === "pero"), z = ws.find((w) => w.textContent === "Madrid"); const r = document.createRange(); r.setStart(a.firstChild, 0); r.setEnd(z.firstChild, z.textContent.length); const sel = getSelection(); sel.removeAllRanges(); sel.addRange(r); });
  await p.waitForTimeout(900);
  const part = await p.evaluate(() => ({ part: (document.querySelector(".sel-part") || {}).textContent || "", whole: [...document.querySelectorAll(".sent-en")].map((x) => x.textContent).join(" | ") }));
  rec("A highlighted fragment gets «This part in English», plus the whole sentence", /This part in English/.test(part.part) && /live in Madrid/.test(part.part) && /whole sentence/i.test(part.whole), JSON.stringify(part));
  // title fit
  await p.goto(URL + "#a1-u1"); await p.waitForTimeout(1200); await p.evaluate(() => document.getElementById("nb-ra").click()); await p.waitForTimeout(800); await p.evaluate(() => { document.body.classList.add("ttl"); window.dispatchEvent(new Event("resize")); }); await p.waitForTimeout(200);
  const tf = await p.evaluate(() => { const t = document.querySelector(".nb-title").getBoundingClientRect(), r = document.getElementById("nb-ra").getBoundingClientRect(); return { t: [t.left, t.right], ra: [r.left, r.right], ok: t.right <= r.left + 1 || t.width === 0 }; });
  rec("Top bar: the page title never runs under «Pause»", tf.ok, JSON.stringify(tf));
  await p.evaluate(() => document.getElementById("nb-ra").click());
  // voices that send no word events
  const nb = await p.evaluate(async () => { window.__noB = true; const sleep = (ms) => new Promise((r) => setTimeout(r, ms)); for (let i = 0; i < 2; i++) { const u = window.__utter("Esta es una frase bastante larga para probar.", "es"); if (!u) break; speechSynthesis.speak(u); await sleep(4500); } window.__noB = false; return window.__vxNoB(); });
  rec("A voice that never reports word positions is noticed (and ranked lower next time)", Object.values(nb).some((n) => n >= 2), JSON.stringify(nb));
  rec("No page errors", !er.length, er.join(" | "));
  await b.close(); const bad = R.filter((x) => !x).length; console.log(bad ? bad + " FAILED of " + R.length : "ALL " + R.length + " PASS"); process.exit(bad ? 1 : 0);
})();
