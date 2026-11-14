// transitions audit (tools/TRANSITIONS_BRIEF.md)
const { chromium, devices } = require("playwright");
const fs = require("fs"); const BRIDGE = fs.readFileSync("/home/claude/ruta-dele/android/app/src/main/assets/bridge.js", "utf8");
const R = []; const rec = (n, ok, info) => { R.push(ok); console.log((ok ? "PASS " : "FAIL ") + n + (info ? "  " + info : "")); };
const TAB = { "": "hoy", hoy: "hoy", ajustes: "hoy", progreso: "hoy", drill: "hoy", curso: "curso", a1: "curso", "a1-u1": "curso", "a1-cards": "curso", "a1-examen-1": "curso", nivel: "curso", errores: "practicar", practicar: "practicar", repaso: "practicar", "repaso-a1": "practicar", escuchar: "practicar", leer: "practicar", "reading-b1-01": "practicar", escritura: "practicar", "escritura-a1-1": "practicar", examenes: "practicar", biblioteca: "biblioteca", verbos: "biblioteca", "verbo-1": "biblioteca", gramatica: "biblioteca", "g-presente": "biblioteca", guias: "biblioteca", "guia-ser-estar": "biblioteca", palabras: "biblioteca", "palabra-casa": "biblioteca", recursos: "biblioteca" };
(async () => {
  const b = await chromium.launch(); const c = await b.newContext({ ...devices["Pixel 7"], serviceWorkers: "block" });
  await c.addInitScript(() => { window.__said = []; let cur = null; Object.defineProperty(window, "speechSynthesis", { configurable: true, value: { speaking: false, getVoices: () => [{ name: "es", lang: "es-MX", localService: true }, { name: "en", lang: "en-US", localService: true }], speak(u) { cur = u; window.__said.push(u.text); this.speaking = true; setTimeout(() => u.onstart && u.onstart({}), 30); u._t = setTimeout(() => { if (cur === u) { this.speaking = false; u.onend && u.onend({}); } }, 1500 + u.text.length * 40); }, cancel() { if (cur) { clearTimeout(cur._t); const u = cur; cur = null; this.speaking = false; u.onerror && u.onerror({ error: "interrupted" }); } }, pause() {}, resume() {} } }); });
  const p = await c.newPage(); const er = []; p.on("pageerror", (x) => er.push(x.message));
  const go = async (h) => { await p.goto("http://localhost:8766/#" + h); await p.waitForTimeout(800); };
  const state = () => p.evaluate(() => ({ tab: (document.querySelector('.tabbar a[aria-current="page"]') || {}).dataset?.s || null, back: (document.getElementById("nb-back") || {}).innerText?.trim() || "", title: (document.getElementById("nb-title") || {}).innerText?.trim() || "", y: Math.round(scrollY) }));
  // 1. where am I
  const wrongTab = [];
  for (const [h, want] of Object.entries(TAB)) { await go(h); const s = await state(); if (s.tab !== want) wrongTab.push("#" + h + " → " + s.tab + " (want " + want + ")"); }
  rec("1 highlighted tab matches the page", !wrongTab.length, wrongTab.join(" | "));
  // 2. going back keeps the scroll position on long lists
  for (const [list, item] of [["verbos", '.vlist .vrow'], ["leer", 'a[href^="#reading-"]'], ["a1", 'a[href^="#a1-u"]'], ["palabras", 'a.wlink, a[href^="#palabra-"]']]) {
    await go(list); await p.evaluate(() => scrollTo(0, 1400)); await p.waitForTimeout(300); const y0 = await p.evaluate(() => scrollY);
    const link = await p.evaluateHandle((sel) => [...document.querySelectorAll(sel)].find((a) => { const r = a.getBoundingClientRect(); return r.top > 80 && r.bottom < innerHeight - 120; }) || null, item);
    if (!(await link.evaluate((x) => !!x))) { rec("2 back to #" + list + " keeps its place", false, "no link in view"); continue; }
    await link.evaluate((x) => x.click()); await p.waitForTimeout(800); await p.goBack(); await p.waitForTimeout(1000);
    const y1 = await p.evaluate(() => scrollY); rec("2 back to #" + list + " keeps its place", Math.abs(y1 - y0) < 60, "scroll " + Math.round(y0) + " → " + Math.round(y1));
  }
  // 3. switching tabs stops page audio
  await go("reading-b1-01"); await p.click('[data-act="l-play"]'); await p.waitForTimeout(600); await p.click("#tabpeek"); await p.waitForTimeout(400);
  await p.click('.tabbar a[data-s="biblioteca"]'); await p.waitForTimeout(800); const n0 = await p.evaluate(() => window.__said.length); await p.waitForTimeout(2500);
  rec("3 leaving a text by tab stops its audio", (await p.evaluate(() => window.__said.length)) === n0 && !(await p.evaluate(() => speechSynthesis.speaking)), "");
  // 4. opening Profe: context shown, page audio paused, page keeps its place
  await go("reading-b1-01"); await p.click('[data-act="l-play"]'); await p.waitForTimeout(700); await p.evaluate(() => scrollTo(0, 600)); const yb = await p.evaluate(() => scrollY);
  await p.click("#tabpeek"); await p.waitForTimeout(300); await p.click("#tabpeek"); await p.waitForTimeout(300);
  await p.evaluate(() => { const f = document.getElementById("tutor-fab"); f && f.click(); }); await p.waitForTimeout(900);
  const ctx = await p.evaluate(() => { const t = document.getElementById("tutor"); return t && !t.hidden ? t.innerText.replace(/\s+/g, " ").slice(0, 400) : ""; });
  const playing = await p.evaluate(() => { try { return document.getElementById("pl-play").getAttribute("aria-label") === "Pause"; } catch (e) { return null; } });
  rec("4 Profe says which page it's looking at", /Bocas del Toro/.test(ctx), ctx.slice(0, 160));
  rec("4 page audio pauses when Profe opens", playing === false && !(await p.evaluate(() => speechSynthesis.speaking)), "player still playing: " + playing);
  // 5. leaving Profe: back where you were
  await p.click('#tutor [data-act="t-close"]'); await p.waitForTimeout(600); const ya = await p.evaluate(() => scrollY);
  rec("5 closing Profe keeps the page's place", Math.abs(ya - yb) < 40, yb + " → " + Math.round(ya));
  // 5b. Ask Profe from a practice question → return button back to that question
  await go("a1-u2"); const st = await p.$('#runner [data-act="px-restart"], #runner [data-act="px-go"]'); if (st) { await st.evaluate((x) => x.click()); await p.waitForTimeout(600); } const dn = await p.$('#runner [data-act="px-pick"], #runner [data-act="px-dunno"]'); if (dn) { await dn.evaluate((x) => x.click()); await p.waitForTimeout(600); }
  const ask = await p.$('#runner [data-act="t-ask"], .pxfb [data-act="t-ask"]');
  if (ask) { await ask.evaluate((x) => x.click()); await p.waitForTimeout(900); const ret = await p.evaluate(() => (document.querySelector('[data-act="t-ret"]') || {}).getAttribute?.("aria-label") || ""); rec("5 'Ask Profe' offers a way back", !!ret, ret); if (ret) { await p.click('[data-act="t-ret"]'); await p.waitForTimeout(800); rec("5 the way back closes Profe", await p.evaluate(() => document.getElementById("tutor").hidden), ""); } }
  else rec("5 'Ask Profe' offers a way back", false, "no Ask Profe button found");
  // 5c. tab while Profe open → Profe closes, goes to that tab, stops talking
  await go("curso"); await p.evaluate(() => document.getElementById("tutor-fab").click()); await p.waitForTimeout(500);
  await p.evaluate(() => { const b = document.querySelector('#tutor [data-act="t-say"]') || null; });
  await p.evaluate(() => document.querySelector('.tabbar a[data-s="practicar"]').click()); await p.waitForTimeout(800);
  rec("5 a tab tap while Profe is open closes Profe and goes there", (await p.evaluate(() => document.getElementById("tutor").hidden)) && /practicar/.test(p.url()), p.url());
  // 6. long moves are labelled
  await go("hoy"); await p.click('[data-hoy="drill"]'); await p.waitForTimeout(800); await go("escuchar");
  rec("6 Hoy return pill is labelled", /Today’s session/.test(await p.evaluate(() => (document.getElementById("hoypill") || {}).innerText || "")), "");
  console.log(R.filter((x) => !x).length ? R.filter((x) => !x).length + " FAILED of " + R.length : "ALL " + R.length + " PASS", er);
  await b.close();
})();
