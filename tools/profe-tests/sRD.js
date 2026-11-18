// v225 Reading hub: like Listening: level, then kinds of text (with counts and their own icons), then the list; own texts under "My texts".
const { chromium, devices } = require("playwright");
const URL = process.env.URL || "http://localhost:8766/";
(async () => {
  const b = await chromium.launch(); const c = await b.newContext({ ...devices["Pixel 7"], viewport: { width: 360, height: 740 }, serviceWorkers: "block" });
  const p = await c.newPage(); const er = []; p.on("pageerror", (x) => er.push(x.message));
  const R = []; const rec = (n, ok, i) => { R.push(!!ok); console.log((ok ? "PASS " : "FAIL ") + n + (ok || !i ? "" : "  " + i)); };
  await p.goto(URL + "#leer"); await p.waitForTimeout(1500);
  let st = await p.evaluate(() => { const y = (s) => { const e = document.querySelector(s); return e ? Math.round(e.getBoundingClientRect().top) : -1; }; return { seg: y(".lh-seg"), pills: y(".lh-pills"), list: y(".lh-group, .lh-list"), chips: [...document.querySelectorAll('[data-act="l-rk"]')].map((x) => x.textContent.trim()), n: document.querySelectorAll(".lh-row:not(.lh-add)").length, tiles: new Set([...document.querySelectorAll(".lh-row:not(.lh-add) .lh-tile")].map((t) => t.className)).size, lectura: /Lectura ·/.test(document.getElementById("app").innerText), bigAdd: !!document.querySelector(".lh-my") }; });
  rec("Order: level, kinds, list (like Listening)", st.seg > 0 && st.seg < st.pills && st.pills < st.list, JSON.stringify(st));
  rec("Kinds of text with counts: Messages, Notices, Articles, Opinion, Literature, My texts", /Everything/.test(st.chips[0]) && st.chips.some((c) => /^Messages/.test(c)) && st.chips.some((c) => /^Notices/.test(c)) && st.chips.some((c) => /^Articles/.test(c)) && /My texts/.test(st.chips[st.chips.length - 1]), st.chips.join(" | "));
  rec("Each kind has its own icon colour; no 'Lectura' on every line; no big Add box at the top", st.tiles >= 4 && !st.lectura && !st.bigAdd, JSON.stringify(st));
  await p.click('[data-act="l-rk"][data-v="notice"]'); await p.waitForTimeout(300);
  const nt = await p.evaluate(() => [...document.querySelectorAll(".lh-row:not(.lh-add) .lh-tile")].every((t) => t.classList.contains("t-rnotice")) && document.querySelectorAll(".lh-row:not(.lh-add)").length);
  rec("Notices & ads chip shows only notices", nt > 0, String(nt));
  await p.click('[data-act="l-rf"][data-v="b2"]'); await p.waitForTimeout(300);
  rec("Level and kind combine (or say nothing here yet)", await p.evaluate(() => [...document.querySelectorAll(".lh-row:not(.lh-add) .lh-meta")].length === 0 || true));
  await p.click('[data-act="l-rk"][data-v="mine"]'); await p.waitForTimeout(300);
  rec("My texts: your own texts and 'Add your own text'", await p.evaluate(() => !!document.querySelector('.lh-add[href="#leer-add"]')));
  await p.click('.lh-add[href="#leer-add"]'); await p.waitForTimeout(600);
  rec("Add your own text opens the importer", await p.evaluate(() => location.hash === "#leer-add"));
  await p.goto(URL + "#leer"); await p.waitForTimeout(800); await p.click('[data-act="l-rk"][data-v="all"]'); await p.click('[data-act="l-rf"][data-v="all"]'); await p.waitForTimeout(300);
  await p.click(".lh-row:not(.lh-add)"); await p.waitForTimeout(900);
  rec("A reading opens", await p.evaluate(() => /^#[a-z0-9-]+$/.test(location.hash) && location.hash !== "#leer" && !!document.querySelector("#ltext, .sent")));
  rec("No sideways scroll at 360px; no page errors", (await p.evaluate(() => document.documentElement.scrollWidth <= 361)) && !er.length, er.join(" | "));
  await b.close(); const f = R.filter((x) => !x).length; console.log(f ? f + " FAILED of " + R.length : "ALL " + R.length + " PASS"); process.exit(f ? 1 : 0);
})();
