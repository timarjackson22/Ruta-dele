// Video page: controls under the video, Profe tucks with the menu, scroll on play, ads hold the captions
const { chromium, devices } = require("playwright"); const fs = require("fs");
const R = []; const rec = (n, ok, info) => { R.push(ok); console.log((ok ? "PASS " : "FAIL ") + n + (info ? "  " + info : "")); };
const MOCK = fs.readFileSync(__dirname + "/vid.js", "utf8").match(/const MOCK = `([\s\S]*?)`;/)[1];
const src = fs.readFileSync(__dirname + "/vcap.js", "utf8"); const CAPS = new Function(src.slice(src.indexOf("const LINES"), src.indexOf("(async () =>")) + "; return CAPS;")();
(async () => {
  const b = await chromium.launch(); const c = await b.newContext({ ...devices["Pixel 7"], serviceWorkers: "block" });
  await c.route("**/www.youtube.com/iframe_api", (r) => r.fulfill({ contentType: "text/javascript", body: MOCK }));
  await c.route("**/i.ytimg.com/**", (r) => r.fulfill({ status: 404, body: "" }));
  await c.addInitScript((CAPS) => { window.AndroidCap = { fetch(id, vid) { setTimeout(() => window.__acap.ev(id, JSON.stringify(CAPS[vid] || { none: true }), ""), 80); } }; }, CAPS);
  const p = await c.newPage(); const er = []; p.on("pageerror", (x) => er.push(x.message));
  const go = async (h) => { await p.goto("http://localhost:8766/#" + h); await p.waitForTimeout(1100); };
  const S = () => p.evaluate(() => JSON.parse(localStorage.getItem("ruta-dele-v1") || "{}"));
  const onTxt = () => p.evaluate(() => { const r = document.querySelector("#vcap .vcue.on .ves"); return r ? r.textContent : ""; });
  const fab = () => p.evaluate(() => { const f = document.querySelector(".tutor-fab"); if (!f) return null; const r = f.getBoundingClientRect(), cs = getComputedStyle(f); return { shown: +cs.opacity > 0.5 && r.top < innerHeight && cs.pointerEvents !== "none", top: Math.round(r.top) }; });
  await go("video-WLXiu-qp8Lw"); await p.waitForTimeout(400);
  // layout
  const lay = await p.evaluate(() => { const q = (s) => document.querySelector(s).getBoundingClientRect(); const f = q(".vframe"), c = q(".vctl"), w = q("#vcapw"); return { gap1: Math.round(c.top - f.bottom), gap2: Math.round(w.top - c.bottom), order: f.bottom <= c.top && c.bottom <= w.top }; });
  rec("Controls sit just below the video, above the caption window", lay.order && lay.gap1 >= 0 && lay.gap1 < 30 && lay.gap2 < 40, JSON.stringify(lay));
  // Profe tucks with the menu
  await p.waitForTimeout(500); let f1 = await fab();
  rec("Profe button tucked away with the bottom menu", f1 && !f1.shown, JSON.stringify(f1));
  await p.click("#tabpeek"); await p.waitForTimeout(600); const f2 = await fab();
  rec("Bring the menu up: Profe comes up with it", f2 && f2.shown, JSON.stringify(f2));
  await p.click("#tabpeek"); await p.waitForTimeout(600); rec("Menu down again: Profe goes too", !(await fab()).shown);
  await go("practicar"); rec("Other pages keep the Profe button", (await fab()).shown);
  // scroll on play
  await go("video-WLXiu-qp8Lw"); await p.evaluate(() => scrollTo(0, 0)); await p.waitForTimeout(300);
  const algn = () => p.evaluate(() => { const h = document.querySelector("header.top").getBoundingClientRect().bottom; return Math.round(document.querySelector(".vframe").getBoundingClientRect().top - h); });
  const before = await algn();
  await p.evaluate(() => { window.__yt.p.playVideo(); window.__yt.p.o.events.onStateChange({ data: 1 }); }); await p.waitForTimeout(1200); const a1 = await algn();
  rec("Play: page slides so the video's top edge is at the top", before > 40 && a1 >= 0 && a1 < 16, before + " → " + a1);
  await p.evaluate(() => { window.__yt.p.pauseVideo(); window.__yt.p.o.events.onStateChange({ data: 2 }); scrollTo(0, 700); }); await p.waitForTimeout(500);
  await p.evaluate(() => { window.__yt.p.playVideo(); window.__yt.p.o.events.onStateChange({ data: 1 }); }); await p.waitForTimeout(1200); const a2 = await algn();
  rec("…every time it starts playing (here: scrolled down, then play)", a2 >= 0 && a2 < 16, String(a2));
  // ads
  await p.evaluate(() => { const S = JSON.parse(localStorage.getItem("ruta-dele-v1") || "{}"); S.vid = S.vid || {}; S.vid["WLXiu-qp8Lw"] = Object.assign(S.vid["WLXiu-qp8Lw"] || { c: [] }, { at: 100, w: 0 }); localStorage.setItem("ruta-dele-v1", JSON.stringify(S)); });
  await go("practicar"); await p.evaluate(() => { const S = JSON.parse(localStorage.getItem("ruta-dele-v1") || "{}"); S.vid = S.vid || {}; S.vid["WLXiu-qp8Lw"] = Object.assign(S.vid["WLXiu-qp8Lw"] || { c: [] }, { at: 100, w: 0 }); localStorage.setItem("ruta-dele-v1", JSON.stringify(S)); });
  await p.goto("http://localhost:8766/?r=1#video-WLXiu-qp8Lw"); await p.waitForTimeout(1300);
  rec("(setup) last place 1:40 is saved", (await S()).vid["WLXiu-qp8Lw"].at === 100);
  await p.evaluate(() => { const y = window.__yt.p; y.adId = "AdAdAdAdAd1"; y.dur = 15; y.t = 0; y.playVideo(); y.o.events.onStateChange({ data: 1 }); window.__yt.log.splice(0); });
  await p.waitForTimeout(1500); await p.evaluate(() => { window.__yt.p.t = 6; }); await p.waitForTimeout(800);
  const adSt = await p.evaluate(() => ({ chip: !document.getElementById("vadchip").hidden, on: !!document.querySelector("#vcap .vcue.on"), tf: getComputedStyle(document.getElementById("vcap-in")).transform, dis: [...document.querySelectorAll(".vctl .btn")].every((b) => b.disabled) }));
  rec("Ad playing: the captions stay at the start (no line moving)", !adSt.on && (adSt.tf === "none" || /, 0\)$/.test(adSt.tf)), JSON.stringify(adSt));
  rec("…a note says an ad is playing and the controls wait", adSt.chip && adSt.dis);
  await p.evaluate(() => { window.__yt.p.t = 14; }); await p.waitForTimeout(700);
  let sv = await S(); rec("…nothing saved or counted during the ad (no 'watched', place kept)", !sv.vid["WLXiu-qp8Lw"].w && sv.vid["WLXiu-qp8Lw"].at === 100, JSON.stringify({ w: sv.vid["WLXiu-qp8Lw"].w, at: sv.vid["WLXiu-qp8Lw"].at }));
  rec("…and no jump to your last place while the ad plays", !(await p.evaluate(() => window.__yt.log.some((x) => x[0] === "seek"))));
  // ad ends, the video starts at 0
  await p.evaluate(() => { const y = window.__yt.p; y.adId = null; y.dur = 300; y.t = 0; y.st = 1; }); await p.waitForTimeout(700);
  const L = await p.evaluate(() => window.__yt.log.splice(0));
  rec("Ad over: note goes, controls come back", await p.evaluate(() => document.getElementById("vadchip").hidden && [...document.querySelectorAll(".vctl .btn")].every((b) => !b.disabled)));
  rec("…then it picks up where you left off (0:98)", L.some((x) => x[0] === "seek" && Math.abs(x[1] - 98) < 0.6), JSON.stringify(L));
  await p.evaluate(() => { window.__yt.p.t = 4; window.__yt.p.st = 2; }); await p.waitForTimeout(500);
  rec("…and the captions follow the video", /^Está chévere/.test(await onTxt()), await onTxt());
  // ad recognised by length alone (same id, length doesn't match the video's 600 s)
  await p.evaluate(() => { const y = window.__yt.p; y.dur = 30; y.t = 3; y.st = 1; }); await p.waitForTimeout(700);
  rec("An ad is also recognised by its length (30 s, not the video's 300 s)", await p.evaluate(() => !document.getElementById("vadchip").hidden && !document.querySelector("#vcap .vcue.on")));
  await p.evaluate(() => { const y = window.__yt.p; y.dur = 300; y.t = 4; y.st = 2; }); await p.waitForTimeout(600);
  rec("…and released when the video comes back", /^Está chévere/.test(await onTxt()));
  rec("No script errors", !er.length, er.join(" | "));
  console.log(R.filter(Boolean).length + "/" + R.length + " passed"); await b.close();
})();
