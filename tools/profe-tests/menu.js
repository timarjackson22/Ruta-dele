// walk every kind of page, tab by tab, and check the bottom menu against tools/MENU_BRIEF.md
const { chromium, devices } = require("playwright");
const T = {
  Today: [["", 1], ["hoy", 1], ["ajustes", 0], ["progreso", 0], ["drill", 0]],
  Course: [["curso", 1], ["a1", 1], ["b2", 1], ["esc", 1], ["a1-examenes", 1], ["a1-u1", 0], ["a1-cards", 0], ["a1-vocab", 0], ["a1-mock", 0], ["a1-exam", 0], ["a1-examen-1", 0], ["a1-examen-1-lectura", 0], ["nivel", 0], ["errores", 0]],
  Practice: [["practicar", 1], ["repaso", 1], ["escuchar", 1], ["leer", 1], ["escritura", 1], ["examenes", 1], ["historia-a1-1", 0], ["reading-b1-01", 0], ["podcast-a1-1", 0], ["repaso-a1", 0], ["repaso-bizfin", 0], ["escritura-a1-1", 0], ["leer-add", 0]],
  Library: [["biblioteca", 1], ["verbos", 1], ["gramatica", 1], ["guias", 1], ["palabras", 1], ["recursos", 1], ["verbo-1", 0], ["verbos-reflexivos", 0], ["g-presente", 0], ["guia-ser-estar", 0], ["palabra-casa", 0]],
};
(async () => {
  const b = await chromium.launch(); const p = await (await b.newContext({ ...devices["Pixel 7"], serviceWorkers: "block" })).newPage(); const er = []; p.on("pageerror", (x) => er.push(x.message));
  let bad = 0, n = 0;
  for (const [tab, list] of Object.entries(T)) {
    console.log("== " + tab);
    for (const [h, want] of list) {
      await p.goto("http://localhost:8766/#" + h); await p.waitForTimeout(900); n++;
      const st = await p.evaluate(() => { const t = document.querySelector(".tabbar"), r = t.getBoundingClientRect(), k = document.getElementById("tabpeek"); return { shown: r.top < innerHeight - 5 && +getComputedStyle(t).opacity > 0.5, arrow: getComputedStyle(k).display !== "none", back: !!(document.getElementById("nb-back") && !document.getElementById("nb-back").hidden && getComputedStyle(document.getElementById("nb-back")).display !== "none") }; });
      let ok = want ? st.shown && !st.arrow : !st.shown && st.arrow && st.back, note = "";
      if (!want && ok) { // the arrow opens and closes it
        await p.click("#tabpeek"); await p.waitForTimeout(450); const o = await p.evaluate(() => document.querySelector(".tabbar").getBoundingClientRect().top < innerHeight - 5);
        await p.click("#tabpeek"); await p.waitForTimeout(450); const c = await p.evaluate(() => document.querySelector(".tabbar").getBoundingClientRect().top >= innerHeight - 5);
        if (!(o && c)) { ok = false; note = " arrow didn't toggle"; }
      }
      if (!ok) bad++;
      console.log((ok ? "  ok   " : "  FAIL ") + ("#" + h).padEnd(22) + (want ? "menu shown" : "menu tucked") + "  " + JSON.stringify(st) + note);
    }
  }
  // moving on tucks it again
  await p.goto("http://localhost:8766/#a1-u1"); await p.waitForTimeout(700); await p.click("#tabpeek"); await p.waitForTimeout(400); await p.goto("http://localhost:8766/#a1-u2"); await p.waitForTimeout(800);
  const again = await p.evaluate(() => document.querySelector(".tabbar").getBoundingClientRect().top >= innerHeight - 5); if (!again) bad++;
  console.log((again ? "ok " : "FAIL ") + "menu tucks again after moving to another page");
  console.log(bad ? bad + " FAILED of " + (n + 1) : "ALL " + (n + 1) + " PASS", er);
  await b.close();
})();
