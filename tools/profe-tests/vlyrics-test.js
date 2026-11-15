// Song lyrics as captions (tools/VIDEO_LYRICS_BRIEF.md): simulated player, simulated Android caption fetch, mocked LRCLIB (invented sample lines)
const { chromium, devices } = require("playwright");
const fs = require("fs");
const R = []; const rec = (n, ok, info) => { R.push(ok); console.log((ok ? "PASS " : "FAIL ") + n + (info ? "  " + info : "")); };
const MOCK = fs.readFileSync(__dirname + "/videos-test.js", "utf8").match(/const MOCK = `([\s\S]*?)`;/)[1];
const L = [[12.5, "primera línea de la canción"], [16.0, "segunda línea que se canta"], [19.8, "tercera línea con café y campo"], [24.1, "cuarta línea del coro"], [28.0, "quinta línea final del verso"], [32.2, "sexta línea para terminar"]];
const lrc = (off) => L.map(([t, x]) => { t += off; return "[" + String(Math.floor(t / 60)).padStart(2, "0") + ":" + (t % 60).toFixed(2).padStart(5, "0") + "] " + x; }).join("\n");
const ASR = '<?xml version="1.0" encoding="utf-8" ?><transcript><text start="12" dur="4">primera linea de la cancion mal oída</text><text start="16" dur="4">segunda cosa</text></transcript>';
const CAPS = { "TiPRNqJnI_k": { lang: "es", kind: "asr", es: ASR, en: "", secs: "300" }, "kRt2sRyup6A": { none: true, secs: "300" }, "WLXiu-qp8Lw": { lang: "es", kind: "asr", es: ASR, en: "", secs: "300" } };
(async () => {
  const b = await chromium.launch(); const c = await b.newContext({ ...devices["Pixel 7"], serviceWorkers: "block" });
  const Q = [];
  await c.route("**/www.youtube.com/iframe_api", (r) => r.fulfill({ contentType: "text/javascript", body: MOCK }));
  await c.route("**/i.ytimg.com/**", (r) => r.fulfill({ status: 404, body: "" }));
  await c.route("**/lrclib.net/**", (r) => { const u = new URL(r.request().url()); Q.push(Object.fromEntries(u.searchParams)); const tn = u.searchParams.get("track_name") || u.searchParams.get("q") || "";
    let rows = [];
    if (/Ojal/.test(tn)) rows = [{ id: 1, trackName: "Ojalá que llueva café", artistName: "Juan Luis Guerra", duration: 241, syncedLyrics: lrc(5), plainLyrics: "x" }, { id: 2, trackName: "Ojalá que llueva café", artistName: "Juan Luis Guerra", duration: 299, syncedLyrics: lrc(0) }, { id: 3, trackName: "Ojalá que llueva café", artistName: "Juan Luis Guerra", duration: 300, syncedLyrics: null, plainLyrics: "x" }];
    if (/camisa/.test(tn)) rows = [{ id: 9, trackName: "La camisa negra", artistName: "Juanes", duration: 287, syncedLyrics: lrc(0).replace(/^\[00:12.50\]/, "[00:01.00]") }];
    r.fulfill({ contentType: "application/json", headers: { "access-control-allow-origin": "*" }, body: JSON.stringify(rows) }); });
  await c.addInitScript((CAPS) => {
    window.AndroidCap = { available: () => true, fetch(id, vid) { setTimeout(() => window.__acap.ev(id, JSON.stringify(CAPS[vid] || { none: true }), ""), 60); } };
    window.__audCalls = [];
    window.AndroidAud = { available: () => true, start(l) { window.__audCalls.push(["start", l]); setTimeout(() => window.__aaud.ev("state", "listening"), 80); }, stop() { window.__audCalls.push(["stop"]); setTimeout(() => window.__aaud.ev("state", "stopped"), 30); } };
  }, CAPS);
  const p = await c.newPage(); const er = []; p.on("pageerror", (x) => er.push(x.message));
  const go = async (h) => { await p.goto("http://localhost:8766/#" + h); await p.waitForTimeout(1300); };
  const T = (v, st) => p.evaluate(([v, st]) => { window.__yt.p.t = v; if (st != null) window.__yt.p.st = st; }, [v, st]);
  const onTxt = () => p.evaluate(() => { const r = document.querySelector("#vcap .vcue.on .ves"); return r ? r.textContent : ""; });
  const lines = () => p.$$eval("#vcap .ves", (a) => a.map((x) => x.textContent));
  // 1. a song with YouTube's automatic captions: the real lyrics win
  await go("video-TiPRNqJnI_k");
  let ls = await lines();
  rec("Song with automatic captions: the real lyrics are shown instead", ls.length === 6 && ls[0] === "Primera línea de la canción", ls.join(" | "));
  rec("One caption per sung line (lines are not merged)", ls[2] === "Tercera línea con café y campo");
  rec("Searched LRCLIB by title and artist", Q[0] && Q[0].track_name === "Ojalá que llueva café" && Q[0].artist_name === "Juan Luis Guerra", JSON.stringify(Q[0]));
  const note = await p.textContent("#vcap-note");
  rec("Source shown: the song's lyrics from LRCLIB, with sync buttons", /song's lyrics \(LRCLIB: Juan Luis Guerra – Ojalá que llueva café\)/.test(note) && !!(await p.$('[data-act="vl-late"]')) && !!(await p.$('[data-act="vl-tap"]')), note);
  const sv = await p.evaluate(() => JSON.parse(localStorage.getItem("lrc:TiPRNqJnI_k")));
  rec("The recording whose length matches the video is chosen (299 s for a 300 s video, synced)", sv && sv.src === 2 && sv.off === 0, sv && sv.src + " off " + sv.off);
  await T(20.5, 2); await p.waitForTimeout(250); rec("At 0:20.5 the third line is current", (await onTxt()) === "Tercera línea con café y campo", await onTxt());
  await T(19.6, 2); await p.waitForTimeout(250); rec("Just before 0:19.8 it's still the second line", (await onTxt()) === "Segunda línea que se canta", await onTxt());
  // nudge
  await p.click('[data-act="vl-late"]'); await p.click('[data-act="vl-late"]'); await p.waitForTimeout(250); await T(20.5, 2); await p.waitForTimeout(250);
  const off1 = (await p.evaluate(() => JSON.parse(localStorage.getItem("lrc:TiPRNqJnI_k")))).off;
  rec("+½ s twice: lyrics one second later (0:20.5 is now the second line)", off1 === 1 && (await onTxt()) === "Segunda línea que se canta", off1 + " " + (await onTxt()));
  // tap at the first line
  await T(15.0, 1); await p.click('[data-act="vl-tap"]'); await p.waitForTimeout(250);
  const off2 = (await p.evaluate(() => JSON.parse(localStorage.getItem("lrc:TiPRNqJnI_k")))).off;
  rec("Tap at the first line (at 0:15): offset becomes 2.2 s", Math.abs(off2 - 2.2) <= 0.15, String(off2));
  await T(15.2, 2); await p.waitForTimeout(250); rec("…and the first line is current then", (await onTxt()) === "Primera línea de la canción", await onTxt());
  // stays after reload, no new search
  const nq = Q.length; await go("video-TiPRNqJnI_k");
  rec("Reopening: saved lyrics and sync used, no new search", Q.length === nq && (await lines()).length === 6 && (await p.evaluate(() => JSON.parse(localStorage.getItem("lrc:TiPRNqJnI_k")).off)) === off2, JSON.stringify({ q: Q.length - nq, n: (await lines()).length }));
  // auto-sync from the sound
  await p.click('[data-act="vl-auto"]'); await p.waitForTimeout(400);
  rec("Auto-sync: records the video's sound, the lyrics stay on screen", (await p.evaluate(() => window.__audCalls.some((x) => x[0] === "start"))) && (await lines()).length === 6 && /line up the lyrics/.test(await p.textContent("#vabar")));
  const say = async (t0, t1, fin) => { await T(t0, 1); await p.evaluate(() => window.__aaud.ev("partial", "algo")); await T(t1, 1); await p.evaluate((x) => window.__aaud.ev("final", x), fin); await p.waitForTimeout(120); };
  // true offset 3.0 s: lines sung at 15.5, 19.0, 22.8
  await say(16.7, 18.5, "primera linea de la cancion"); await say(20.2, 22, "segunda linea que se canta");
  const off3 = (await p.evaluate(() => JSON.parse(localStorage.getItem("lrc:TiPRNqJnI_k")))).off;
  rec("Two heard lines that agree set the offset (≈3 s) and listening stops", Math.abs(off3 - 3) <= 0.6 && (await p.evaluate(() => window.__audCalls.some((x) => x[0] === "stop"))) && !(await p.$("#vabar")), off3 + " " + JSON.stringify(await p.evaluate(() => window.__audCalls)));
  rec("…no audio captions were saved from the singing", !(await p.evaluate(() => localStorage.getItem("va:TiPRNqJnI_k") || Object.keys(localStorage).find((k) => /^va/.test(k) && /TiPRNqJnI_k/.test(k)))));
  // use YouTube's captions instead
  await p.click('[data-act="vl-off"]'); await p.waitForTimeout(800);
  rec("“Use YouTube/audio captions instead”: back to YouTube's automatic captions", /automatic Spanish captions/.test(await p.textContent("#vcap-note")) && !(await p.$('[data-act="vl-tap"]')), await p.textContent("#vcap-note"));
  // 2. a song with no captions on YouTube: lyrics instead of the "no captions" message; intro guessed from the length
  await go("video-kRt2sRyup6A"); await p.waitForTimeout(500);
  ls = await lines(); const s2 = await p.evaluate(() => JSON.parse(localStorage.getItem("lrc:kRt2sRyup6A")));
  rec("Song with no captions on YouTube: lyrics shown", ls.length === 6 && !/no Spanish captions/.test(await p.textContent("#vcap")), ls.length + "");
  rec("Video 13 s longer than the record and the singing starts at once: a 13 s intro is assumed, and the learner is asked to check", s2 && s2.off === 13 && s2.guessed && /Words early or late/.test(await p.textContent("#vcap-note")), JSON.stringify(s2 && { off: s2.off, g: s2.guessed }));
  // 3. not a song: no lyrics search
  const nq2 = Q.length; await go("video-WLXiu-qp8Lw");
  rec("A spoken video: no lyrics lookup, YouTube's captions as before", Q.length === nq2 && /automatic Spanish captions/.test(await p.textContent("#vcap-note")));
  // 4. LRCLIB unreachable: falls back
  await c.unroute("**/lrclib.net/**"); await c.route("**/lrclib.net/**", (r) => r.abort());
  await p.evaluate(() => { localStorage.removeItem("lrc:TiPRNqJnI_k"); localStorage.removeItem("lrc-off:TiPRNqJnI_k"); }); await go("video-TiPRNqJnI_k"); await p.waitForTimeout(600);
  rec("Lyrics service unreachable: YouTube's captions still shown", /automatic Spanish captions/.test(await p.textContent("#vcap-note")), await p.textContent("#vcap-note"));
  rec("No script errors", er.length === 0, er.join(" | "));
  console.log(R.filter(Boolean).length + "/" + R.length + " passed"); await b.close(); process.exit(R.every(Boolean) ? 0 : 1);
})();
