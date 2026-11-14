// Reading & Listening headline pane + player drop-down (tools/READING_HEADER_BRIEF.md)
const { chromium, devices } = require("playwright");
const R = []; const rec = (n, ok, info) => { R.push(ok); console.log((ok ? "PASS " : "FAIL ") + n + (info ? "  " + info : "")); };
const SPEECH = () => { class U { constructor(t) { this.text = t; } } window.SpeechSynthesisUtterance = U; const ss = { speaking: false, pending: false, paused: false, getVoices: () => [{ name: "es-ES", lang: "es-ES", localService: true, voiceURI: "es" }], speak(u) { ss.speaking = true; setTimeout(() => { u.onstart && u.onstart({}); }, 30); u.__t = setTimeout(() => { ss.speaking = false; u.onend && u.onend({}); }, 2500); ss.cur = u; }, cancel() { ss.speaking = false; if (ss.cur) clearTimeout(ss.cur.__t); }, pause() {}, resume() {}, addEventListener() {} }; Object.defineProperty(window, "speechSynthesis", { configurable: true, value: ss }); };
(async () => {
  const b = await chromium.launch(); const c = await b.newContext({ ...devices["Pixel 7"], serviceWorkers: "block" }); await c.addInitScript(SPEECH);
  const p = await c.newPage(); const er = []; p.on("pageerror", (x) => er.push(x.message));
  await p.goto("http://localhost:8766/#reading-b1-01"); await p.waitForTimeout(1400);
  const top = await p.evaluate(() => { const h = document.getElementById("lhead"); return h && { chips: [...h.querySelectorAll(".lh-chip")].map((x) => x.textContent), title: h.querySelector(".ltitle").textContent, sub: (h.querySelector(".lh-sub") || {}).textContent, hint: !!document.querySelector(".lhint"), crumbs: getComputedStyle(document.querySelector("#litem .crumbs")).display }; });
  rec("Reading: a headline card with type · level · minutes chips, title and one line under it", top && top.chips.length >= 3 && /Lectura/.test(top.chips[0]) && /min/.test(top.chips.join(" ")) && top.title.length > 3 && !!top.sub, JSON.stringify(top));
  rec("…no hint line or breadcrumb clutter above the text", top && !top.hint && top.crumbs === "none");
  // drop-down
  const bar = await p.evaluate(() => { const pl = document.querySelector("#litem .player"), m = document.getElementById("pmenu"); return { cueOnBar: document.getElementById("l-cue").parentElement === pl, inMenu: ["pl-rate", "l-text", "l-en"].every((i) => m.contains(document.getElementById(i))), menuShown: getComputedStyle(m).display !== "none", glyph: pl.querySelector(".pmore").textContent.trim() }; });
  rec("Bar: Verbatim on the bar; Speed, Hide text, English in the ▾ drop-down (no •••)", bar.cueOnBar && bar.inMenu && !bar.menuShown && bar.glyph === "", JSON.stringify(bar));
  await p.click('[data-act="pl-more"]'); await p.waitForTimeout(250);
  const open = await p.evaluate(() => { const m = document.getElementById("pmenu"), r = m.getBoundingClientRect(), pr = document.querySelector("#litem .player").getBoundingClientRect(); return { shown: getComputedStyle(m).display !== "none", above: r.bottom <= pr.top + 2, wrap: pr.height < 80 }; });
  rec("▾ opens a panel above the bar; the bar stays one row", open.shown && open.above && open.wrap, JSON.stringify(open));
  await p.selectOption("#pl-rate", "0.8"); await p.click("#l-en"); await p.waitForTimeout(200);
  rec("…its controls work (speed 0.8×, English on)", (await p.inputValue("#pl-rate")) === "0.8" && (await p.getAttribute("#l-en", "aria-pressed")) === "true");
  await p.click("#lhead .ltitle", { position: { x: 5, y: 5 } }).catch(() => {}); await p.mouse.click(200, 300); await p.waitForTimeout(200);
  rec("…tapping elsewhere closes it", !(await p.evaluate(() => document.querySelector("#litem .player").classList.contains("more"))));
  // frozen while reading
  await p.click("#pl-play"); await p.waitForTimeout(1800); await p.evaluate(() => scrollBy(0, 500)); await p.waitForTimeout(900);
  const fr = await p.evaluate(() => { const h = document.getElementById("lhead"), hb = document.querySelector("header.top").getBoundingClientRect().bottom, r = h.getBoundingClientRect(); return { playing: document.body.classList.contains("lplaying"), top: Math.round(r.top - hb), fs: parseFloat(getComputedStyle(h.querySelector(".ltitle")).fontSize), prog: document.getElementById("lprog-i").style.width, sub: getComputedStyle(h.querySelector(".lh-sub")).display }; });
  rec("Reading aloud: the card freezes under the top bar as a compact strip", fr.playing && Math.abs(fr.top) <= 2 && fr.fs < 20 && fr.sub === "none", JSON.stringify(fr));
  rec("…with a progress line", parseInt(fr.prog) > 0, fr.prog);
  const under = await p.evaluate(() => { const h = document.getElementById("lhead").getBoundingClientRect(); const s = [...document.querySelectorAll("#ltext .sent")].find((x) => { const r = x.getBoundingClientRect(); return r.top < h.bottom && r.bottom > h.top; }); return !!s && getComputedStyle(document.getElementById("lhead")).zIndex >= 5; });
  rec("…the text slides underneath it", under);
  await p.click("#pl-play"); await p.waitForTimeout(500);
  const rel = await p.evaluate(() => ({ playing: document.body.classList.contains("lplaying"), pos: getComputedStyle(document.getElementById("lhead")).position }));
  rec("Paused: the card lets go and scrolls normally again", !rel.playing && rel.pos !== "sticky", JSON.stringify(rel));
  // a saved text: the tools are tucked into Options
  await p.goto("http://localhost:8766/#leer-add"); await p.waitForTimeout(800); await p.click('[data-act="my-tab"][data-v="paste"]'); await p.waitForTimeout(200);
  await p.fill("#my-text", "Panamá anuncia nuevas rutas aéreas. La aerolínea nacional abrirá vuelos a cuatro ciudades. Los pasajeros podrán viajar desde marzo. El gobierno espera más turismo este año.");
  await p.fill("#my-title", "Nuevas rutas"); await p.click('[data-act="my-import"]'); await p.waitForTimeout(2500);
  const mine = await p.evaluate(() => ({ url: location.hash, lvlVisible: (() => { const s = document.getElementById("my-lvl"); return !!s && s.offsetParent !== null; })(), opts: !!document.querySelector('[data-act="lh-opts"]'), chip: [...document.querySelectorAll(".lh-chip")].map((x) => x.textContent).join(" ") }));
  rec("Saved text: no admin rows above the text; an Options button instead", /^#my-/.test(mine.url) && !mine.lvlVisible && mine.opts, JSON.stringify(mine));
  await p.click('[data-act="lh-opts"]'); await p.waitForTimeout(200);
  const ins = await p.evaluate(() => { const o = document.getElementById("lopts"); return { shown: !o.hidden, lvl: !!o.querySelector("#my-lvl"), clean: !!o.querySelector('[data-act="my-clean"]'), ren: !!o.querySelector("#my-rename"), del: !!o.querySelector('[data-act="my-del"]') }; });
  rec("Options: level, clean-up, rename and delete are all there", ins.shown && ins.lvl && ins.clean && ins.ren && ins.del, JSON.stringify(ins));
  await p.evaluate(() => { document.querySelector("#lopts details") && (document.querySelector("#lopts details").open = true); }); await p.fill("#my-rename", "Rutas nuevas de Panamá"); await p.click('[data-act="my-rename"]'); await p.waitForTimeout(800);
  rec("Rename still works", /Rutas nuevas de Panamá/.test(await p.textContent("#lhead .ltitle")));
  // listening + small phone
  await p.goto("http://localhost:8766/#historia-a1-1"); await p.waitForTimeout(1200);
  rec("Listening pages get the same card (Historia)", await p.evaluate(() => /Historia/.test(document.querySelector("#lhead .lh-chips").textContent)));
  const se = await (await b.newContext({ ...devices["iPhone SE"], serviceWorkers: "block" })).newPage(); await se.goto("http://localhost:8766/#reading-b1-01"); await se.waitForTimeout(1200);
  const fit = await se.evaluate(() => { const pl = document.querySelector("#litem .player"), kids = [...pl.children].filter((x) => getComputedStyle(x).display !== "none" && x.id !== "pmenu"); return { wide: document.documentElement.scrollWidth > innerWidth + 1, rows: (() => { const cs = kids.map((k) => { const r = k.getBoundingClientRect(); return (r.top + r.bottom) / 2; }); return Math.max(...cs) - Math.min(...cs) < 12 ? 1 : 2; })(), right: Math.max(...kids.map((k) => k.getBoundingClientRect().right)) <= pl.getBoundingClientRect().right + 1 }; });
  rec("Small phone: no sideways scroll; bar on one row with nothing squeezed out", !fit.wide && fit.rows === 1 && fit.right, JSON.stringify(fit));
  rec("No script errors", !er.length, er.join(" | "));
  console.log(R.filter(Boolean).length + "/" + R.length + " passed"); await b.close();
})();
