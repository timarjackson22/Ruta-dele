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
    if (tn === "La Bicicleta" && /Carlos Vives/.test(u.searchParams.get("artist_name") || "")) rows = [{ id: 12, trackName: "La Bicicleta", artistName: "Carlos Vives", duration: 300, syncedLyrics: lrc(0) }];
    if (/camisa/.test(tn)) rows = [{ id: 9, trackName: "La camisa negra", artistName: "Juanes", duration: 287, syncedLyrics: lrc(0).replace(/^\[00:12.50\]/, "[00:01.00]") }];
    r.fulfill({ contentType: "application/json", headers: { "access-control-allow-origin": "*" }, body: JSON.stringify(rows) }); });
  await c.addInitScript((CAPS) => {
    window.__fetched = [];
    const BORROW = '<transcript>' + ["Paso a paso, todo llega", "a su tiempo, mi amor", "no te apures, corazón", "que la vida es un camino", "paso a paso, sin correr", "todo llega, ya verás"].map((t, i) => '<text start="' + (10 + i * 4) + '" dur="4">' + t + "</text>").join("") + "</transcript>";
    const SR = [{ id: "aaaaaaaaaa1", t: "Pasito a Pasito (letra)", secs: 250 }, { id: "cvNidoBil2I", t: "Pasito a Pasito - Thiago Navarro Music (LETRA)", secs: 300 }, { id: "zzzzzzzzzz9", t: "Bonito Bonito letra", secs: 300 }, { id: "bbbbbbbbbb2", t: "Pasito a pasito Thiago Navarro lyrics", secs: 296 }];
    window.AndroidCap = { available: () => true,
      fetch(id, vid) { if (!["TiPRNqJnI_k", "kRt2sRyup6A", "WLXiu-qp8Lw", "XCT5EyPc3Lg"].includes(vid)) window.__fetched.push(vid); const r = vid === "bbbbbbbbbb2" ? { lang: "es", kind: "manual", es: BORROW, en: "", secs: "296" } : CAPS[vid] || { none: true, secs: "300" }; setTimeout(() => window.__acap.ev(id, JSON.stringify(r), ""), 60); },
      search(id, q) { window.__searchQ = q; setTimeout(() => window.__acap.ev(id, JSON.stringify(SR), ""), 60); } };
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
  rec("Source shown simply, with ONE sync button (no nudge or tap buttons)", /Song lyrics: Juan Luis Guerra – Ojalá que llueva café/.test(note) && (await p.$$('#vmenu-x [data-act="vl-auto"]')).length === 1 && !!(await p.$('[data-act="vl-auto"]')) && !(await p.$('[data-act="vl-late"]')) && !(await p.$('[data-act="vl-tap"]')), note);
  const sv = await p.evaluate(() => JSON.parse(localStorage.getItem("lrc:TiPRNqJnI_k")));
  rec("The recording whose length matches the video is chosen (299 s for a 300 s video, synced)", sv && sv.src === 2 && sv.off === 0, sv && sv.src + " off " + sv.off);
  await T(20.5, 2); await p.waitForTimeout(250); rec("At 0:20.5 the third line is current", (await onTxt()) === "Tercera línea con café y campo", await onTxt());
  await T(19.6, 2); await p.waitForTimeout(250); rec("Just before 0:19.8 it's still the second line", (await onTxt()) === "Segunda línea que se canta", await onTxt());
  // one press: auto-sync from the sound
  await p.evaluate(() => { const b = document.getElementById("vbar"); if (b) b.classList.add("more"); }); await p.click('[data-act="vl-auto"]'); await p.waitForTimeout(400);
  rec("Sync: records the video's sound, the lyrics stay on screen, the button says Syncing…", (await p.evaluate(() => window.__audCalls.some((x) => x[0] === "start"))) && (await lines()).length === 6 && /Syncing/.test(await p.textContent("#vabar")) && /Syncing…/.test(await p.textContent("#vmenu-x")));
  const say = async (t0, t1, fin) => { await T(t0, 1); await p.evaluate(() => window.__aaud.ev("partial", "algo")); await T(t1, 1); await p.evaluate((x) => window.__aaud.ev("final", x), fin); await p.waitForTimeout(120); };
  await say(16.7, 18.5, "primera linea de la cancion"); await say(20.2, 22, "segunda linea que se canta");
  const off3 = (await p.evaluate(() => JSON.parse(localStorage.getItem("lrc:TiPRNqJnI_k")))).off;
  rec("Two heard lines that agree set the offset (≈3 s) and listening stops by itself", Math.abs(off3 - 3) <= 0.6 && (await p.evaluate(() => window.__audCalls.some((x) => x[0] === "stop"))) && !(await p.$("#vabar")), off3 + " " + JSON.stringify(await p.evaluate(() => window.__audCalls)));
  await T(19.4, 2); await p.waitForTimeout(250);
  rec("…the lyrics now follow the song (0:19.4 → second line, sung at 0:19.0)", (await onTxt()) === "Segunda línea que se canta", await onTxt());
  rec("…the note says synced ✓ and the button becomes “Sync again”", /synced ✓/.test(await p.textContent("#vcap-note")) && /Sync lyrics again/.test(await p.textContent("#vmenu-x")));
  rec("…no audio captions were saved from the singing", !(await p.evaluate(() => Object.keys(localStorage).find((k) => /^va/.test(k) && /TiPRNqJnI_k/.test(k)))));
  const nq = Q.length; await go("video-TiPRNqJnI_k");
  rec("Reopening: saved lyrics and sync used, no new search", Q.length === nq && (await lines()).length === 6 && Math.abs((await p.evaluate(() => JSON.parse(localStorage.getItem("lrc:TiPRNqJnI_k")).off)) - off3) < 0.01);
  await p.evaluate(() => { const b = document.getElementById("vbar"); if (b) b.classList.add("more"); }); await p.click('[data-act="vl-auto"]'); await p.waitForTimeout(400); await p.click('[data-act="va-stop"]'); await p.waitForTimeout(400);
  rec("Sync that hears nothing: offers one button, “Tap when the singing starts”", !!(await p.$('[data-act="vl-tap"]')) && !(await p.$('[data-act="vl-auto"]')), await p.textContent("#vcap-note"));
  await T(15.0, 2); await p.evaluate(() => { const b = document.getElementById("vbar"); if (b) b.classList.add("more"); }); await p.click('[data-act="vl-tap"]'); await p.waitForTimeout(250);
  const off2 = (await p.evaluate(() => JSON.parse(localStorage.getItem("lrc:TiPRNqJnI_k")))).off;
  rec("…tapping at 0:15 sets the first line there (offset 2.2 s)", Math.abs(off2 - 2.2) <= 0.15, String(off2));
  // use YouTube's captions instead
  await p.evaluate(() => { const b = document.getElementById("vbar"); if (b) b.classList.add("more"); }); await p.click('[data-act="vl-off"]'); await p.waitForTimeout(800);
  rec("“Wrong song?”: back to YouTube's automatic captions", /automatic Spanish captions/.test(await p.textContent("#vcap-note")) && !(await p.$('[data-act="vl-tap"]')), await p.textContent("#vcap-note"));
  // 2. a song with no captions on YouTube: lyrics instead of the "no captions" message; intro guessed from the length
  await go("video-kRt2sRyup6A"); await p.waitForTimeout(500);
  ls = await lines(); const s2 = await p.evaluate(() => JSON.parse(localStorage.getItem("lrc:kRt2sRyup6A")));
  rec("Song with no captions on YouTube: lyrics shown", ls.length === 6 && !/no Spanish captions/.test(await p.textContent("#vcap")), ls.length + "");
  rec("Video 13 s longer than the record and the singing starts at once: a 13 s intro is assumed until synced", s2 && s2.off === 13 && s2.guessed, JSON.stringify(s2 && { off: s2.off, g: s2.guessed }));
  // 3. a video you added: YouTube's own title and channel
  await p.evaluate(() => { const S = JSON.parse(localStorage.getItem("ruta-dele-v1") || "{}"); S.myv = [{ yt: "XCT5EyPc3Lg", t: "Carlos Vives, Shakira - La Bicicleta (Official Video)", ch: "CarlosVivesVEVO", lvl: "", added: Date.now(), mine: 1 }, { yt: "cvNidoBil2I", t: "Pasito a Pasito - Thiago Navarro Music (LETRA)", ch: "Music by Danyela", lvl: "", added: Date.now(), mine: 1 }]; localStorage.setItem("ruta-dele-v1", JSON.stringify(S)); const o = Storage.prototype.setItem; Storage.prototype.setItem = function (k, v) { if (k !== "ruta-dele-v1") o.call(this, k, v); }; });
  Q.length = 0; await p.goto("http://localhost:8766/#video-XCT5EyPc3Lg"); await p.reload(); await p.waitForTimeout(1800);
  rec("Added video titled “Carlos Vives, Shakira - La Bicicleta (Official Video)”: lyrics found as La Bicicleta by Carlos Vives", (await lines()).length === 6 && /Carlos Vives – La Bicicleta/.test(await p.textContent("#vcap-note")), JSON.stringify(Q) + " | " + (await p.textContent("#vcap-note")));
  await go("video-cvNidoBil2I"); await p.waitForTimeout(1200);
  ls = await lines();
  rec("Song not in the lyrics bank: captions borrowed from another upload of the same song and length", ls.length >= 6 && /another YouTube upload/.test(await p.textContent("#vcap-note")) && /Paso a paso/.test(ls[0]), ls.slice(0, 2).join(" | ") + " | " + (await p.textContent("#vcap-note")));
  rec("…only same-song uploads of the right length were opened (not the wrong-length or other songs)", JSON.stringify(await p.evaluate(() => window.__fetched)) === JSON.stringify(["cvNidoBil2I", "bbbbbbbbbb2"]), JSON.stringify(await p.evaluate(() => window.__fetched)));
  // 4. not a song: no lyrics search
  const nq2 = Q.length; await go("video-WLXiu-qp8Lw");
  rec("A spoken video: no lyrics lookup, YouTube's captions as before", Q.length === nq2 && /automatic Spanish captions/.test(await p.textContent("#vcap-note")));
  // 5. LRCLIB unreachable: falls back
  await c.unroute("**/lrclib.net/**"); await c.route("**/lrclib.net/**", (r) => r.abort());
  await p.evaluate(() => { localStorage.removeItem("lrc:TiPRNqJnI_k"); localStorage.removeItem("lrc-off:TiPRNqJnI_k"); }); await go("video-TiPRNqJnI_k"); await p.waitForTimeout(600);
  rec("Lyrics service unreachable: YouTube's captions still shown", /automatic Spanish captions/.test(await p.textContent("#vcap-note")), await p.textContent("#vcap-note"));
  rec("No script errors", er.length === 0, er.join(" | "));
  console.log(R.filter(Boolean).length + "/" + R.length + " passed"); await b.close(); process.exit(R.every(Boolean) ? 0 : 1);
})();
