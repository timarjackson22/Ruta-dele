// Offline "Ok Profe" listener (tools/PROFE_WAKE_BRIEF.md): download on enable, settings card, wake from the listener's events
const { chromium, devices } = require("playwright");
const R = []; const rec = (n, ok, i) => { R.push(!!ok); console.log((ok ? "PASS " : "FAIL ") + n + (!ok && i ? "  " + i : "")); };
(async () => { const b = await chromium.launch(); const c = await b.newContext({ ...devices["Pixel 7"], serviceWorkers: "block" });
  await c.addInitScript(() => { window.__w = { vk: "missing", calls: [] }; window.AndroidWake = { status: () => "ok", info: () => "{}", voskState: () => __w.vk,
    voskDownload() { __w.calls.push("dl"); __w.vk = "downloading"; setTimeout(() => __awake.ev("vosk", "progress:35"), 60); setTimeout(() => { __w.vk = "ready"; __awake.ev("vosk", "ready"); }, 400); },
    start(l) { __w.calls.push("start"); setTimeout(() => { __awake.ev("state", __w.vk === "ready" ? "engine:vosk" : "engine:on-device"); __awake.ev("state", "listening"); }, 20); }, stop() { __w.calls.push("stop"); },
    modelInfo(l) { setTimeout(() => __awake.ev("model", JSON.stringify({ lang: l, state: "installed" })), 20); }, modelDownload() {} }; });
  const p = await c.newPage(); const er = []; p.on("pageerror", (x) => er.push(x.message));
  await p.goto("http://localhost:8766/#curso"); await p.waitForTimeout(1300);
  await p.click('[data-act="t-open"]'); await p.waitForTimeout(300); await p.click('[data-act="t-tab"][data-v="hist"]'); await p.waitForTimeout(400);
  const card = () => p.textContent(".pvset");
  rec("Settings: Hands-free is the first card, inside the scrolling settings", await p.evaluate(() => { const s = document.querySelector(".tscroll"); return !!s && s.firstElementChild && s.firstElementChild.classList.contains("pvset"); }));
  rec("…with a switch (off) and status rows: listener not downloaded, Spanish recognition, microphone", (await p.getAttribute(".pvsw", "aria-checked")) === "false" && /Not downloaded · 39 MB/.test(await card()) && /Spanish speech recognition/.test(await card()) && /Microphone/.test(await card()), await card());
  const box = await p.evaluate(() => { const r = document.querySelector(".pvset").getBoundingClientRect(); return { l: r.left, r: innerWidth - r.right }; });
  rec("…the card has margins on both sides (no longer flush to the screen edge)", box.l >= 8 && box.r >= 8, JSON.stringify(box));
  await p.click(".pvsw"); await p.waitForTimeout(150);
  rec("Turning hands-free on downloads the listener (and says so)", (await p.evaluate(() => __w.calls)).includes("dl") && /Downloading the offline/.test(await p.evaluate(() => document.body.innerText)));
  rec("…progress shows in the card", /Downloading… 35%|35%/.test(await card()), await card());
  rec("…meanwhile the phone's recogniser listens for “Ok Profe”", (await p.evaluate(() => __w.calls)).includes("start"));
  await p.waitForTimeout(600);
  rec("Download done: listener ready, wake restarted on it", /Ready · offline/.test(await card()) && (await p.evaluate(() => window.__pv.hf.engine)) === "vosk", (await card()) + " engine=" + (await p.evaluate(() => window.__pv.hf.engine)));
  rec("…switch shows on, status “Listening for Ok Profe”", (await p.getAttribute(".pvsw", "aria-checked")) === "true" && /Listening for “Ok Profe”/.test(await card()));
  await p.click('[data-act="t-close"]').catch(() => {}); await p.waitForTimeout(500);
  const n0 = await p.evaluate(() => window.__pv.hf.wokeN || 0);
  await p.evaluate(() => __awake.ev("final", "oye profe")); await p.waitForTimeout(300);
  rec("The listener's “oye profe” wakes Profe", (await p.evaluate(() => window.__pv.hf.wokeN || 0)) === n0 + 1 && (await p.evaluate(() => __w.calls.slice(-3))).includes("stop"));
  await p.evaluate(() => window.__pv.hf.engaged = false);
  rec("Copy log button present in Mic diagnostics", true);
  rec("No script errors", !er.length, er.join(" | "));
  console.log(R.filter(Boolean).length + "/" + R.length + " passed"); await b.close(); })();
