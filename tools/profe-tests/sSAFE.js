// v250 — the 3rd S24 log: the app restarted twice in the first 15 s of a call (the AI model loading while the scene started
// and the greeting played). The model now loads after the greeting; a restart during a call is logged as such and turns on
// the call's safe mode (no blur filters, no early model load).
const { open } = require("./h.js");
(async () => {
  const R = []; const rec = (n, ok, i) => { R.push(!!ok); console.log((ok ? "PASS " : "FAIL ") + n + (ok ? "" : "  " + (i || ""))); };
  const H = await open(); const p = H.p; await p.evaluate(() => { window.__setName("Ana", true); window.__pre = []; const o = AndroidLLM.preload; AndroidLLM.preload = function () { window.__pre.push([performance.now(), window.__vc.state()]); }; });
  await p.evaluate(() => document.querySelector('[data-act="vc-open"]').click()); await H.wait(800);
  const early = await p.evaluate(() => window.__pre.length);
  await p.waitForFunction(() => window.__vc.state() === "listening", null, { timeout: 15000 }); await H.wait(2000);
  const pre = await p.evaluate(() => window.__pre);
  rec("The AI model is not loaded while the call starts and Profe greets", early === 0, early);
  rec("…it loads once the greeting is over and the call is listening", pre.length === 1 && pre[0][1] === "listening", JSON.stringify(pre));
  // the heartbeat notes a call; a restart that interrupted a call turns on safe mode
  const beat = await p.evaluate(() => { const b = JSON.parse(localStorage.getItem("rd-live") || "{}"); return b.c; });
  rec("The app's heartbeat records that a call is on", beat === 1, beat);
  await p.evaluate(() => document.querySelector('[data-act="vc-end"]').click()); await H.wait(1500);
  // simulate the app dying: no clean heartbeat on the way out
  await p.evaluate(() => { const o = window.lsSet; window.lsSet = (k, v) => (k === "rd-live" ? true : o(k, v)); localStorage.setItem("rd-live", JSON.stringify({ t: Date.now() - 6000, h: "", clean: false, b: "x", c: 1, m: "loading" })); });
  await p.reload(); await H.wait(2500);
  const v = await p.evaluate(() => window.__vitals().join("\n"));
  rec("After a restart in a call, the log says so (and the model state)", /DURING A CALL, AI model loading/.test(v), v.split("\n").filter((l) => /restart/.test(l)).join(" | "));
  await p.evaluate(() => { document.body.classList.add("tabs-peek"); document.querySelector('[data-act="t-open"]').click(); }); await H.wait(600);
  await p.evaluate(() => { window.__pre = []; AndroidLLM.preload = function () { window.__pre.push(1); }; document.querySelector('[data-act="vc-open"]').click(); }); await H.wait(800);
  await p.waitForFunction(() => window.__vc.state() === "listening", null, { timeout: 15000 }); await H.wait(2000);
  const s = await p.evaluate(() => { const r = document.getElementById("vcall"), el = r.querySelector(".vc-scene [filter]"); return { safe: r.classList.contains("vc-safe"), filter: el ? getComputedStyle(el).filter : "none", pre: window.__pre.length }; });
  rec("Next call runs in safe mode: no blur filters, no early model load", s.safe && s.filter === "none" && s.pre === 0, JSON.stringify(s));
  rec("No page errors", !H.errs.length, H.errs.join(" | "));
  await H.close(); const bad = R.filter((x) => !x).length; console.log(bad ? bad + " FAILED of " + R.length : "ALL " + R.length + " PASS"); process.exit(bad ? 1 : 0);
})();
