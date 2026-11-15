// "Download Spanish" for on-device speech recognition (Samsung S24 case: on-device recogniser present, Spanish model missing)
const { chromium, devices } = require("playwright");
const R = []; const rec = (n, ok, i) => { R.push(!!ok); console.log((ok ? "PASS " : "FAIL ") + n + (!ok && i ? "  " + i : "")); };
(async () => { const b = await chromium.launch(); const c = await b.newContext({ ...devices["Pixel 7"], serviceWorkers: "block" });
  await c.addInitScript(() => { window.__dl = 0; window.AndroidWake = { status: () => "ok", info: () => "{}", start() {}, stop() {},
    modelInfo(l) { setTimeout(() => window.__awake.ev("model", JSON.stringify({ lang: l, state: window.__dl ? "installed" : "available" })), 30); },
    modelDownload(l) { window.__dl = 1; setTimeout(() => window.__awake.ev("model-dl", "progress:40"), 50); setTimeout(() => window.__awake.ev("model-dl", "done"), 300); } }; });
  const p = await c.newPage(); const er = []; p.on("pageerror", (x) => er.push(x.message));
  await p.goto("http://localhost:8766/#curso"); await p.waitForTimeout(1300);
  await p.click('[data-act="t-open"]'); await p.waitForTimeout(300); await p.click('[data-act="t-tab"][data-v="hist"]'); await p.waitForTimeout(500);
  rec("Settings show whether Spanish speech recognition is downloaded, with a Download button", /not downloaded yet/.test(await p.textContent("#pv-model")) && (await p.isVisible('#tutor [data-act="pv-model-dl"]')), await p.textContent("#pv-model"));
  await p.click('#tutor [data-act="pv-model-dl"]'); await p.waitForTimeout(120);
  rec("…the download shows its progress", /downloading/.test(await p.textContent("#pv-model")), await p.textContent("#pv-model"));
  await p.waitForTimeout(600);
  rec("…and when done says so, and the button goes away", /downloaded/.test(await p.textContent("#pv-model")) && !(await p.isVisible('#tutor [data-act="pv-model-dl"]')), await p.textContent("#pv-model"));
  rec("No script errors", !er.length, er.join(" | "));
  console.log(R.filter(Boolean).length + "/" + R.length + " passed"); await b.close(); })();
