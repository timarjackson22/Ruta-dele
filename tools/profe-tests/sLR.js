// v270 phone frame: the title pane stays full size and still (no slim bar), section links stacked in it, no tab bar, player flush at the bottom,
// text moving up behind the pane, and the page turning to the glossary when the reading ends.
// v237 Listen/Read presentation: sentence by sentence, follow-along pointer just above the spoken word (v261;
// never over the next line), a highlighted fragment gets its own translation, the top-bar title never under a button, voices that send no
// word positions are learned and ranked lower.
const { chromium, devices } = require("playwright"); const fs = require("fs");
const URL = process.env.URL || "http://localhost:8766/";
const src = fs.readFileSync(__dirname + "/sVC.js", "utf8"); const INIT = eval(src.match(/const INIT = (\(\) => \{[\s\S]*?\n\};)/)[1]);
(async () => {
  const b = await chromium.launch(); const R = []; const rec = (n, ok, i) => { R.push(!!ok); console.log((ok ? "PASS " : "FAIL ") + n + (ok ? "" : "  " + (i || ""))); };
  const c = await b.newContext({ ...devices["Pixel 7"], serviceWorkers: "block" }); await c.addInitScript(INIT); const p = await c.newPage(); const er = []; p.on("pageerror", (e) => er.push(e.message));
  await p.goto(URL + (process.env.LR_ID ? "#" + process.env.LR_ID : "#historia-a1-1")); await p.waitForTimeout(1500);
  const lay = await p.evaluate(() => { const s = [...document.querySelectorAll("#ltext .story .sl")].slice(0, 3).map((x) => x.getBoundingClientRect()); return { block: getComputedStyle(document.querySelector("#ltext .story .sl")).display, stacked: s.length === 3 && s[1].top >= s[0].bottom - 1 && s[2].top >= s[1].bottom - 1 }; });
  rec("A story reads sentence by sentence (each sentence starts on its own line)", lay.block === "block" && lay.stacked, JSON.stringify(lay));
  await p.evaluate(() => document.querySelector('[aria-label^="Play"]').click()); await p.waitForTimeout(2600);
  const hd = await p.evaluate(() => ({ h: document.querySelector("#litem .lhead").getBoundingClientRect().height, cue: (() => { const c = document.getElementById("cue"); if (!c || c.hidden) return null; const r = c.getBoundingClientRect(), pl = document.querySelector("#litem .player").getBoundingClientRect(); const sp = document.querySelector("#litem .w.spk"), sr = sp && sp.getBoundingClientRect(); let next = null; if (sr) { const ws = [...document.querySelectorAll("#ltext .w")].map((w) => w.getBoundingClientRect()).filter((q) => q.top > sr.bottom + 2); next = ws.length ? ws[0] : null; } return { up: c.classList.contains("up"), dock: c.classList.contains("dock"), aboveWord: !!sr && r.bottom <= sr.top + 1, near: !!sr && sr.top - r.bottom < 30, clearNext: !next || r.top >= next.bottom || r.bottom <= next.top, abovePlayer: r.bottom <= pl.top + 1 }; })() }));
  const fr = await p.evaluate(() => { const r = (s) => { const e = document.querySelector(s); return e ? e.getBoundingClientRect() : null; }, top = r("header.top"), hero = r("#litem .lhead"), pl = r("#litem .player"), bs = [...document.querySelectorAll("#litem .lhead .lh-jump button")].map((b) => b.getBoundingClientRect());
    const vis = (s) => { const e = document.querySelector(s); if (!e) return false; const q = e.getBoundingClientRect(), cs = getComputedStyle(e); return q.width > 0 && cs.display !== "none" && cs.visibility !== "hidden" && +cs.opacity > 0.1 && q.top < innerHeight; };
    return { rlf: document.body.classList.contains("rlf"), heroH: Math.round(hero.height), touch: Math.abs(hero.top - top.bottom) <= 1, links: bs.length, same: bs.every((q) => Math.abs(q.width - bs[0].width) < 1 && Math.abs(q.height - bs[0].height) < 1), stacked: bs.every((q, i) => !i || q.top >= bs[i - 1].bottom - 0.5), right: bs.every((q) => q.right > innerWidth - 30 && q.top >= hero.top && q.bottom <= hero.bottom),
      tabs: vis(".tabbar") || vis("#tabpeek"), flush: Math.abs(pl.bottom - innerHeight) <= 1 && pl.left <= 0.5 && Math.abs(pl.right - innerWidth) <= 0.5 }; });
  rec("Phone frame while playing: the title pane stays full size under the top bar (no slim bar), the four section links are stacked in its right corner, all the same size", fr.rlf && fr.heroH >= 200 && fr.touch && fr.links >= 3 && fr.same && fr.stacked && fr.right, JSON.stringify(fr));
  rec("No bottom menu or menu arrow on the reading page; the player sits flush on the bottom edge", !fr.tabs && fr.flush, JSON.stringify(fr));
  const ov = await p.evaluate(() => { const ti = document.querySelector("#litem .lhead .ltitle").getBoundingClientRect(), bad = []; document.querySelectorAll("#litem .lhead button, #litem .lhead .lh-ic").forEach((b) => { const q = b.getBoundingClientRect(); if (q.width && getComputedStyle(b).visibility !== "hidden" && +getComputedStyle(b).opacity > 0.1) { const words = [...document.querySelectorAll("#litem .lhead .ltitle .w")].filter((w) => { const r = w.getBoundingClientRect(); return r.right > q.left && r.left < q.right && r.bottom > q.top && r.top < q.bottom; }); if (words.length) bad.push((b.dataset.act || b.className) + ":" + words.map((w) => w.textContent).join(" ")); } }); return bad; });
  rec("While playing, the title never runs under the header buttons (v264)", !ov.length, JSON.stringify(ov));
  rec("The follow-along pointer sits just above the spoken word (v261), never over the next line or the player", hd.cue && hd.cue.up && hd.cue.aboveWord && hd.cue.near && hd.cue.clearNext && hd.cue.abovePlayer, JSON.stringify(hd.cue));
  // the text moves up behind the pane; the pane does not move
  const h0 = await p.evaluate(() => document.querySelector("#litem .lhead").getBoundingClientRect().top); await p.evaluate(() => scrollTo(0, 500)); await p.waitForTimeout(300);
  const mv = await p.evaluate(() => { const h = document.querySelector("#litem .lhead").getBoundingClientRect(), s = [...document.querySelectorAll("#ltext .sent")].find((x) => { const q = x.getBoundingClientRect(); return q.top < h.bottom && q.bottom > h.top; }); const el = s && document.elementFromPoint(40, Math.max(h.top + 5, Math.min(h.bottom - 5, s.getBoundingClientRect().top + 8))); return { top: h.top, behind: !!s && !!el && !!el.closest("#litem .lhead") }; });
  rec("Scrolled text goes up behind the title pane, which stays put", mv.behind && Math.abs(mv.top - h0) < 1, JSON.stringify({ h0, ...mv }));
  await p.evaluate(() => { const b = document.querySelector('[aria-label^="Pause"]'); b && b.click(); }); await p.waitForTimeout(300);
  await p.evaluate(() => { scrollTo(0, 0); window.__rlfDone(); }); await p.waitForTimeout(2300);
  const fl = await p.evaluate(() => { const g = document.getElementById("l-gl").getBoundingClientRect(), h = document.querySelector("#litem .lhead").getBoundingClientRect(); return { n: window.__rlfFlipped || 0, gap: Math.round(g.top - h.bottom), flip: document.getElementById("l-gl").classList.contains("rl-flip") }; });
  rec("When the reading ends, after a second the page turns down to the glossary (Words), just under the pane", fl.n >= 1 && fl.flip && fl.gap >= -2 && fl.gap <= 30, JSON.stringify(fl));
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
