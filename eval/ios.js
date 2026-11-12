// Opens the app in WebKit (Safari's engine) as an iPhone and walks the main screens, reporting errors.
const { webkit, devices } = require("playwright");
(async () => {
  const b = await webkit.launch();
  const ctx = await b.newContext({ ...devices["iPhone 15 Pro"] });
  const p = await ctx.newPage(); const errs = [];
  p.on("pageerror", (e) => errs.push("pageerror: " + e.message + " " + (e.stack || "").split("\n").slice(0, 3).join(" | ")));
  p.on("console", (m) => { if (m.type() === "error") errs.push("console: " + m.text().slice(0, 300)); });
  p.on("crash", () => errs.push("PAGE CRASHED"));
  const go = async (h, w = 2500) => { const n = errs.length; const t0 = Date.now(); await p.goto("http://127.0.0.1:8766/" + h).catch((e) => errs.push("goto " + h + " " + e.message)); await p.waitForTimeout(w); const txt = await p.evaluate(() => (document.getElementById("app") || document.body).innerText.length).catch(() => -1); console.log(h || "(home)", "text", txt, (Date.now() - t0) + "ms", errs.slice(n).join(" || ")); };
  await go("");
  for (const h of ["#a1", "#a1-1", "#escritura", "#escritura-a2-2", "#escucha", "#lectura", "#gramatica", "#verbos", "#palabras", "#b1-3", "#examen-b1"]) await go(h);
  // open Profe
  const n = errs.length;
  await p.click("#tutor-fab").catch((e) => errs.push("fab " + e.message)); await p.waitForTimeout(2500);
  console.log("profe open", await p.evaluate(() => document.querySelector("#tutor") ? document.querySelector("#tutor").innerText.slice(0, 300).replace(/\n+/g, " | ") : "none"), errs.slice(n).join(" || "));
  await p.screenshot({ path: "out/ios-profe.png" });
  await p.click('[data-act="t-mic"]', { timeout: 3000 }).catch(() => {}); await p.waitForTimeout(1500);
  console.log("ALL ERRORS:\n" + errs.join("\n"));
  await b.close();
})();
