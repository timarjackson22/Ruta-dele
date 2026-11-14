const { chromium, devices } = require("playwright"); const fs = require("fs");
const R = []; const rec = (n, ok, info) => { R.push(ok); console.log((ok ? "PASS " : "FAIL ") + n + (info ? "  " + info : "")); };
const MOCK = fs.readFileSync(__dirname + "/vid.js", "utf8").match(/const MOCK = `([\s\S]*?)`;/)[1];
(async () => { const b = await chromium.launch();
  for (const dev of ["Pixel 7", "iPhone SE"]) {
    const c = await b.newContext({ ...devices[dev], deviceScaleFactor: 1, serviceWorkers: "block" }); await c.route("**/www.youtube.com/iframe_api", (r) => r.fulfill({ contentType: "text/javascript", body: MOCK }));
    await c.addInitScript(() => { window.AndroidCap = { fetch(id) { setTimeout(() => window.__acap.ev(id, JSON.stringify({ none: true }), ""), 30); } }; });
    const p = await c.newPage(); const er = []; p.on("pageerror", (x) => er.push(x.message));
    // Listen: player bar
    const first = "#reading-b1-01"; await p.goto("http://localhost:8766/" + first); await p.waitForTimeout(1500);
    const lb = await p.evaluate(() => { const b = document.getElementById("l-cue"); if (!b) return null; const r = b.getBoundingClientRect(), bar = b.closest(".player").getBoundingClientRect(); return { txt: b.textContent.trim(), title: b.title, fits: r.right <= innerWidth && r.left >= 0 && r.bottom <= bar.bottom + 1, oneLine: r.height < 48 }; });
    rec(dev + ": Listen player switch reads 'Verbatim' and fits", lb && lb.txt === "Verbatim" && /Verbatim: live word-by-word/.test(lb.title) && lb.fits && lb.oneLine, JSON.stringify(lb) + " " + first);
    // Settings
    await p.goto("http://localhost:8766/#ajustes"); await p.waitForTimeout(800);
    rec(dev + ": Settings calls it Verbatim", /Verbatim · live word-by-word translation in Reading, Listening and Videos/.test((await p.textContent("body")).replace(/\s+/g, " ")));
    // Videos
    await p.goto("http://localhost:8766/#video-WLXiu-qp8Lw"); await p.waitForTimeout(1000);
    const vb = await p.evaluate(() => { const b = document.querySelector('[data-act="vc-cue"]'), r = b.getBoundingClientRect(), hs = [...document.querySelectorAll(".vcap-tg .btn")].map((x) => Math.round(x.getBoundingClientRect().top)); return { txt: b.textContent, fits: r.right <= innerWidth, row: new Set(hs).size === 1 }; });
    rec(dev + ": Video button reads 'Verbatim', buttons on one row", vb.txt === "Verbatim" && vb.fits && vb.row, JSON.stringify(vb));
    const any = await p.evaluate(() => /cue tips?|\bCues\b/i.test(document.body.innerText)); rec(dev + ": no old name on screen", !any);
    rec(dev + ": no script errors", !er.length, er.join("|")); await c.close(); }
  console.log(R.filter(Boolean).length + "/" + R.length + " passed"); await b.close(); })();
