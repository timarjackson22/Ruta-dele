// v241 selecting part of a text: nothing pops up while the finger is down, one helper per screen (lessons: Translate + Deck
// chip for up to 12 words; Listen/Read: the selection sheet only), the selection survives pressing Translate, page swipes
// ignore selection drags, and reading pages have a calm (still, fainter) background with no tap ripples.
const { chromium, devices } = require("playwright");
const URL = process.env.URL || "http://localhost:8766/";
(async () => {
  const b = await chromium.launch(); const R = []; const rec = (n, ok, i) => { R.push(!!ok); console.log((ok ? "PASS " : "FAIL ") + n + (ok ? "" : "  " + (i || ""))); };
  const c = await b.newContext({ ...devices["Pixel 7"], serviceWorkers: "block" }); const p = await c.newPage(); const er = []; p.on("pageerror", (e) => er.push(e.message));
  const selectWords = (sel, n) => p.evaluate(([sel, n]) => { const root = document.querySelector(sel); const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, { acceptNode: (t) => /[a-záéíóúñ]{2}.*\s.*[a-záéíóúñ]{2}/i.test(t.textContent) && t.textContent.trim().split(/\s+/).length >= n ? 1 : 3 }); const t = w.nextNode(); if (!t) return null;
    const words = [...t.textContent.matchAll(/\S+/g)]; const r = document.createRange(); r.setStart(t, words[0].index); const last = words[n - 1]; r.setEnd(t, last.index + last[0].length); const s = getSelection(); s.removeAllRanges(); s.addRange(r); return s.toString(); }, [sel, n]);
  await p.goto(URL + "#a1-u1"); await p.waitForTimeout(1500);
  await p.evaluate(() => { window.__touching = true; }); const t1 = await selectWords("#app main, #app", 8); await p.waitForTimeout(900);
  const whileDown = await p.evaluate(() => { const c = document.getElementById("dksel"); return !!(c && !c.hidden); });
  await p.evaluate(() => { window.__touching = false; }); await p.waitForTimeout(900);
  const chip = await p.evaluate(() => { const c = document.getElementById("dksel"); return c && !c.hidden ? { tr: !!c.querySelector(".dks-tr"), add: !!c.querySelector(".dks-add") } : null; });
  rec("Lesson: nothing pops up while the finger is still selecting", t1 && !whileDown, JSON.stringify({ t1, whileDown }));
  rec("Lesson: after letting go, one small helper with Translate and Deck (8 words selected)", chip && chip.tr && chip.add, JSON.stringify(chip));
  await p.click("#dksel .dks-tr"); await p.waitForTimeout(500);
  const tr = await p.evaluate(() => ({ out: document.querySelector("#dksel .dks-out").textContent, still: getSelection().toString().length > 0 }));
  rec("Translate shows an English version and keeps the selection", tr.out.length > 3 && tr.still, JSON.stringify(tr));
  const bg = await p.evaluate(() => { const i = document.querySelector("#liquid-bg i"); return i ? { anim: getComputedStyle(i).animationName, op: +getComputedStyle(i).opacity } : null; });
  rec("Lesson pages: the background wash is still and faint", !bg || (bg.anim === "none" && bg.op <= 0.35), JSON.stringify(bg));
  await p.goto(URL + "#inicio"); await p.waitForTimeout(1000);
  const bgHome = await p.evaluate(() => { const i = document.querySelector("#liquid-bg i"); return i ? getComputedStyle(i).animationName : "none-el"; });
  rec("Home keeps its moving background", bgHome !== "none", bgHome);
  // Listen/Read: the selection sheet, no extra chip
  await p.goto(URL + "#historia-a1-1"); await p.waitForTimeout(1500);
  await p.evaluate(() => { const s = [...document.querySelectorAll("#ltext .sent")].find((x) => /pero ahora vivo/.test(x.textContent)); const ws = [...s.querySelectorAll(".w")]; const a = ws.find((w) => w.textContent === "pero"), z = ws.find((w) => w.textContent === "Madrid"); const r = document.createRange(); r.setStart(a.firstChild, 0); r.setEnd(z.firstChild, z.textContent.length); const sel = getSelection(); sel.removeAllRanges(); sel.addRange(r); });
  await p.waitForTimeout(1200);
  const pl = await p.evaluate(() => ({ chip: !!(document.getElementById("dksel") && !document.getElementById("dksel").hidden), part: !!document.querySelector(".sel-part") }));
  rec("Listen/Read: one helper only (the sheet with «This part in English»), no extra chip", !pl.chip && pl.part, JSON.stringify(pl));
  rec("No page errors", !er.length, er.join(" | "));
  await b.close(); const bad = R.filter((x) => !x).length; console.log(bad ? bad + " FAILED of " + R.length : "ALL " + R.length + " PASS"); process.exit(bad ? 1 : 0);
})();
