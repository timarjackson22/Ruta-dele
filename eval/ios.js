// Opens the app in WebKit (Safari's engine) as an iPhone; reports errors and whether content is visible.
const { webkit, devices } = require("playwright");
(async () => {
  const b = await webkit.launch();
  for (const dev of ["iPhone 15 Pro", "iPhone SE"]) {
    const ctx = await b.newContext({ ...devices[dev] });
    const p = await ctx.newPage(); const errs = [];
    p.on("pageerror", (e) => errs.push("pageerror: " + e.message + " " + (e.stack || "").split("\n").slice(0, 3).join(" | ")));
    p.on("console", (m) => { if (m.type() === "error") errs.push("console: " + m.text().slice(0, 300)); });
    for (const h of ["", "#curso", "#practicar", "#a1-u1", "#ajustes"]) {
      await p.goto("http://127.0.0.1:8766/" + h); await p.waitForTimeout(2500);
      const st = await p.evaluate(() => { const a = document.getElementById("app"), f = a && a.firstElementChild; return { len: a ? a.innerHTML.length : -1, op: f ? getComputedStyle(f).opacity : null, txt: document.body.innerText.slice(0, 60).replace(/\n/g, " ") }; }).catch((e) => ({ err: e.message }));
      console.log(dev, h || "(home)", JSON.stringify(st));
    }
    await p.screenshot({ path: "out/ios-" + dev.replace(/ /g, "") + ".png" });
    console.log(dev, "ERRORS:", errs.join("\n") || "none");
    await ctx.close();
  }
  await b.close();
})();
