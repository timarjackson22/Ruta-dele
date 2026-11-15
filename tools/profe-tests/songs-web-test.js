// Songs on the web and iPhone (no Android app): lyrics from LRCLIB in the caption window, one tap to sync, expressions and Verbatim as on Android
const { chromium, webkit, devices } = require("playwright"); const fs = require("fs");
const R = []; const rec = (n, ok, i) => { R.push(!!ok); console.log((ok ? "PASS " : "FAIL ") + n + (!ok && i ? "  " + i : "")); };
const MOCK = fs.readFileSync(__dirname + "/videos-test.js", "utf8").match(/const MOCK = `([\s\S]*?)`;/)[1];
const L = [[12.5, "ayer metí la pata con ella"], [16.0, "segunda línea que se canta"], [19.8, "tercera línea con café y campo"], [24.1, "cuarta línea del coro"], [28.0, "quinta línea final del verso"], [32.2, "sexta línea para terminar"]];
const lrc = L.map(([t, x]) => "[" + String(Math.floor(t / 60)).padStart(2, "0") + ":" + (t % 60).toFixed(2).padStart(5, "0") + "] " + x).join("\n");
(async () => {
  for (const [name, bt, dev] of [["Android browser", chromium, "Pixel 7"], ["iPhone (emulated in Chromium: Safari itself isn't available here)", chromium, "iPhone 13"]]) {
    const b = await bt.launch(); const c = await b.newContext({ ...devices[dev], serviceWorkers: "block" }); let pre = 0;
    await c.route("**/www.youtube.com/iframe_api", (r) => r.fulfill({ contentType: "text/javascript", body: MOCK })); await c.route("**/i.ytimg.com/**", (r) => r.fulfill({ status: 404, body: "" }));
    await c.route("**/lrclib.net/**", (r) => { if (r.request().method() === "OPTIONS") { pre++; return r.fulfill({ status: 404 }); } const u = new URL(r.request().url()); r.fulfill({ contentType: "application/json", headers: { "access-control-allow-origin": "*" }, body: JSON.stringify(/Ojal/.test(u.searchParams.get("track_name") || "") ? [{ id: 2, trackName: "Ojalá que llueva café", artistName: "Juan Luis Guerra", duration: 299, syncedLyrics: lrc }] : []) }); });
    const p = await c.newPage(); const er = []; p.on("pageerror", (x) => er.push(x.message));
    await p.goto("http://localhost:8766/#video-TiPRNqJnI_k"); await p.waitForTimeout(2500);
    const ls = await p.$$eval("#vcap .ves", (a) => a.map((x) => x.textContent));
    rec(name + ": a song shows its lyrics in the caption window (no Android app)", ls.length === 6 && ls[0] === "Ayer metí la pata con ella", ls.join(" | ") + " " + await p.textContent("#vcap"));
    rec(name + ": lyrics fetched without a CORS preflight", pre === 0, String(pre));
    const note = await p.textContent("#vcap-note");
    rec(name + ": one sync button that works here: “Tap when the singing starts”", !!(await p.$('[data-act="vl-tap"]')) && !(await p.$('[data-act="vl-auto"]')), note);
    await p.evaluate(() => { window.__yt.p.t = 15.0; window.__yt.p.st = 2; }); await p.click('[data-act="vl-tap"]'); await p.waitForTimeout(300);
    const off = await p.evaluate(() => JSON.parse(localStorage.getItem("lrc:TiPRNqJnI_k")).off);
    rec(name + ": tapping sets the timing (offset 2.2 s)", Math.abs(off - 2.2) <= 0.15, String(off));
    const tips = []; for (let t = 14.8; t < 17.5; t += 0.25) { await p.evaluate((t) => { window.__yt.p.t = t; window.__yt.p.st = 2; }, t); await p.waitForTimeout(140); const x = await p.evaluate(() => { const v = document.getElementById("vtip"); return v && !v.hidden ? v.textContent : null; }); if (x && tips[tips.length - 1] !== x) tips.push(x); }
    rec(name + ": Verbatim bubbles with the word bank: «metí la pata» → mess up", tips.some((x) => /mess up|screw up/.test(x)), JSON.stringify(tips));
    await p.goto("http://localhost:8766/#video-WLXiu-qp8Lw"); await p.waitForTimeout(1500);
    rec(name + ": a spoken video explains YouTube's subtitles are on the video here", /caption window needs the Ruta DELE app for Android/.test(await p.textContent("#vcap")));
    rec(name + ": no script errors", !er.length, er.join(" | ")); await b.close();
  }
  console.log(R.filter(Boolean).length + "/" + R.length + " passed"); process.exit(R.every(Boolean) ? 0 : 1);
})();
