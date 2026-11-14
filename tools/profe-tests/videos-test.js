// Videos (tools/VIDEO_BRIEF.md): tested against a simulated YouTube player, since YouTube can't be reached from here
const { chromium, devices } = require("playwright");
const R = []; const rec = (n, ok, info) => { R.push(ok); console.log((ok ? "PASS " : "FAIL ") + n + (info ? "  " + info : "")); };
const MOCK = `(() => {
  window.__yt = { made: [], log: [] };
  function Player(el, o) {
    const self = this; window.__yt.made.push(o); window.__yt.p = this; this.o = o; this.t = 0; this.rate = 1; this.st = -1; this.dur = 300; this.destroyed = 0;
    const node = typeof el === "string" ? document.getElementById(el) : el; const f = document.createElement("iframe"); f.id = node.id; f.src = (o.host || "https://www.youtube.com") + "/embed/" + o.videoId; node.replaceWith(f);
    this._iv = setInterval(() => { if (self.st === 1) self.t += 0.1 * self.rate; }, 100);
    if (!window.__ytSilent) setTimeout(() => o.events && o.events.onReady && o.events.onReady({ target: self }), 50);
  }
  Player.prototype = {
    getCurrentTime() { return this.t; }, getDuration() { return this.dur; },
    seekTo(t) { window.__yt.log.push(["seek", Math.round(t * 10) / 10]); this.t = t; },
    playVideo() { window.__yt.log.push(["play"]); this.st = 1; }, pauseVideo() { window.__yt.log.push(["pause"]); this.st = 2; },
    getPlayerState() { return this.st; }, getVideoData() { return { video_id: this.adId || this.o.videoId }; }, unloadModule(m) { window.__yt.log.push(["unload", m]); },
    setPlaybackRate(r) { window.__yt.log.push(["rate", r]); this.rate = r; },
    destroy() { this.destroyed = 1; window.__yt.log.push(["destroy"]); clearInterval(this._iv); },
    _end() { this.st = 0; this.o.events.onStateChange({ data: 0 }); }, _err(c) { this.o.events.onError({ data: c }); },
  };
  window.YT = { Player, PlayerState: { ENDED: 0, PLAYING: 1, PAUSED: 2 } };
  window.onYouTubeIframeAPIReady && window.onYouTubeIframeAPIReady();
})();`;
(async () => {
  const b = await chromium.launch(); const c = await b.newContext({ ...devices["Pixel 7"], serviceWorkers: "block" });
  await c.route("**/www.youtube.com/iframe_api", (r) => r.fulfill({ contentType: "text/javascript", body: MOCK }));
  await c.route("**/www.youtube.com/oembed**", (r) => r.fulfill({ contentType: "application/json", body: JSON.stringify({ title: "Mi rutina de la mañana", author_name: "Canal Prueba" }) }));
  await c.route("**/i.ytimg.com/**", (r) => r.fulfill({ status: 404, body: "" }));
  await c.addInitScript(() => {
    window.__heard = "perro";
    window.SpeechRecognition = function () { const r = this; this.start = () => { setTimeout(() => { r.onresult && r.onresult({ resultIndex: 0, results: [Object.assign([{ transcript: window.__heard, confidence: 0.9 }], { isFinal: true })] }); r.onend && r.onend(); }, 200); }; this.stop = () => {}; this.abort = () => {}; };
    Object.defineProperty(window, "speechSynthesis", { configurable: true, value: { speaking: false, getVoices: () => [{ name: "es", lang: "es-MX", localService: true }], speak(u) { setTimeout(() => u.onend && u.onend({}), 50); }, cancel() {}, pause() {}, resume() {} } });
  });
  const p = await c.newPage(); const er = []; p.on("pageerror", (x) => er.push(x.message));
  const go = async (h) => { await p.goto("http://localhost:8766/#" + h); await p.waitForTimeout(900); };
  const st = () => p.evaluate(() => ({ tab: (document.querySelector('.tabbar a[aria-current="page"]') || {}).dataset?.s || null, back: (document.getElementById("nb-back") || {}).hidden ? "" : (document.getElementById("nb-back-t") || {}).textContent, tucked: document.body.classList.contains("no-tabs"), wide: document.documentElement.scrollWidth > innerWidth + 1 }));
  const S = () => p.evaluate(() => JSON.parse(localStorage.getItem("ruta-dele-v1") || "{}"));
  const log = () => p.evaluate(() => window.__yt.log.splice(0));
  const T = (v) => p.evaluate((v) => { window.__yt.p.t = v; }, v);

  // Practice → Videos
  await go("practicar"); const row = await p.$('a[href="#videos"]'); rec("Practice has a Videos row", !!row);
  await row.click(); await p.waitForTimeout(700);
  let s = await st(); const cards = await p.$$eval(".vcard", (a) => a.map((x) => x.getAttribute("href")));
  const per = await p.$$eval("h2.ghead", (hs) => hs.map((h) => [h.textContent.replace(/\s*\(.*$/, ""), h.nextElementSibling.querySelectorAll(".vcard").length]));
  rec("Library: at least 4 videos in each of the 7 types", ["Everyday dialogues", "Interviews", "News", "Weather", "Sports", "Music", "Podcasts"].every((c) => (per.find((x) => x[0] === c) || [0, 0])[1] >= 4) && cards.includes("#video-WLXiu-qp8Lw"), JSON.stringify(per));
  rec("Only videos that play in apps: the 4 not allowed are gone", !["2GrDFoMl978", "rqiOwOmYO80", "-VxpA-9x0jc", "4oay8Hwdpjc", "O07zoqmdmrk", "xYYz5RTqbEs"].some((i) => cards.includes("#video-" + i)));
  rec("Music has Thiago Navarro's 4 most-viewed songs", ["i5neBtAgc-c", "6S243h-V3p4", "cEsp1dMTM1w", "aR0GjIVIAdo"].every((i) => cards.includes("#video-" + i)));
  rec("Videos list: menu shown, Practice tab lit, back to Practice", !s.tucked && s.tab === "practicar" && s.back === "Practice" && !s.wide, JSON.stringify(s));
  // paste a link
  await p.fill("#vlink", "hola que tal"); await p.click('#vadd button[type="submit"]'); await p.waitForTimeout(300);
  rec("A non-YouTube link is refused with a message", /doesn't look like/.test(await p.textContent("#vadd-msg")));
  await p.fill("#vlink", "https://youtu.be/AbCdEfGhIjK?si=xyz"); await p.click('#vadd button[type="submit"]'); await p.waitForTimeout(1200);
  rec("A pasted youtu.be link opens its page", p.url().endsWith("#video-AbCdEfGhIjK"), p.url());
  let mine = (await S()).myv || []; rec("…is saved to My videos with the title fetched", mine[0] && mine[0].yt === "AbCdEfGhIjK" && mine[0].t === "Mi rutina de la mañana", JSON.stringify(mine[0]));
  for (const l of ["https://www.youtube.com/watch?v=ZZZZZZZZZZ1&t=30s", "https://m.youtube.com/shorts/ZZZZZZZZZZ2", "https://www.youtube.com/live/ZZZZZZZZZZ3?feature=share"]) {
    await go("videos"); await p.fill("#vlink", l); await p.click('#vadd button[type="submit"]'); await p.waitForTimeout(500);
    rec("Link form recognised: " + l.split("/")[3].slice(0, 12), /#video-ZZZZZZZZZZ\d$/.test(p.url()), p.url());
  }
  // starter video page
  await go("video-WLXiu-qp8Lw"); await p.waitForTimeout(600); s = await st();
  rec("Video page: menu tucked, Practice tab lit, back to Videos, fits the screen", s.tucked && s.tab === "practicar" && s.back === "Videos" && !s.wide, JSON.stringify(s));
  const made = await p.evaluate(() => window.__yt.made.at(-1));
  rec("Player: right video, tells YouTube the site, Spanish captions on, inline", made.videoId === "WLXiu-qp8Lw" && made.playerVars.origin === "http://localhost:8766" && made.playerVars.cc_load_policy === 1 && made.playerVars.cc_lang_pref === "es" && made.playerVars.playsinline === 1, JSON.stringify(made.playerVars));
  const fr = await p.$eval(".vframe", (x) => { const r = x.getBoundingClientRect(); return [Math.round(r.width), Math.round(r.height)]; });
  rec("Player is full width and 16:9", Math.abs(fr[0] / fr[1] - 16 / 9) < 0.03 && fr[0] > 340, fr.join("x"));
  // controls
  await p.evaluate(() => window.__yt.p.playVideo()); await T(20); await log();
  await p.click('[data-act="v-back5"]'); let L = await log(); rec("Back 5 s", L.some((x) => x[0] === "seek" && Math.abs(x[1] - 15) < 0.3), JSON.stringify(L));
  await T(30); await p.click('[data-act="v-loop"]'); L = await log();
  rec("Replay line: jumps back 5 s and plays", L.some((x) => x[0] === "seek" && Math.abs(x[1] - 25) < 0.3) && L.some((x) => x[0] === "play") && (await p.getAttribute('[data-act="v-loop"]', "aria-pressed")) === "true", JSON.stringify(L));
  await T(30.4); await p.waitForTimeout(500); L = await log(); rec("Replay line: loops back when the line ends", L.some((x) => x[0] === "seek" && Math.abs(x[1] - 25) < 0.3), JSON.stringify(L));
  await p.click('[data-act="v-loop"]'); await T(31); await p.waitForTimeout(500); L = await log(); rec("Replay line: off stops the loop", !L.some((x) => x[0] === "seek"), JSON.stringify(L));
  await p.click('[data-act="v-rate"]'); L = await log(); rec("Speed 0.75×", L.some((x) => x[0] === "rate" && x[1] === 0.75));
  await p.click('[data-act="v-rate"]'); L = await log(); rec("Speed back to 1×", L.some((x) => x[0] === "rate" && x[1] === 1));
  // catch a word
  await T(42.3); await p.click('[data-act="v-catch"]'); await p.waitForTimeout(200); L = await log();
  rec("Catch a word pauses and shows the moment", L.some((x) => x[0] === "pause") && (await p.isVisible("#vcatch")) && /0:42/.test(await p.textContent("#vcat-t")));
  await p.fill("#vcin", "perro"); await p.waitForTimeout(150); const mean = await p.textContent("#vcat-mean");
  rec("Meaning shown from the dictionary as you type", /dog/i.test(mean), mean);
  await p.click('#vcatch button[type="submit"]'); await p.waitForTimeout(300); L = await log();
  const items = await p.$$eval("#vcaught li", (a) => a.map((x) => x.innerText.replace(/\s+/g, " ")));
  rec("Caught word listed with time and meaning, video resumes", items.length === 1 && /0:42/.test(items[0]) && /perro/.test(items[0]) && /dog/i.test(items[0]) && L.some((x) => x[0] === "play"), items[0]);
  await T(80); await log(); await p.click('#vcaught [data-act="v-seek"]'); L = await log(); rec("Tap the time to jump back to that moment", L.some((x) => x[0] === "seek" && Math.abs(x[1] - 41) < 0.3), JSON.stringify(L));
  await p.click('[data-act="v-catch"]'); await p.fill("#vcin", "la cita"); await p.click('#vcatch button[type="submit"]'); await p.waitForTimeout(200);
  await p.click('[data-act="v-deck"]'); await p.waitForTimeout(300);
  const deck = await p.evaluate(() => (JSON.parse(localStorage.getItem("ruta-dele-srs-v1")).decks || []).find((d) => d.name === "Videos"));
  rec("Add all to flashcards → 'Videos' deck", deck && deck.w.length === 2 && deck.w[0].es === "perro" && /dog/i.test(deck.w[0].en), JSON.stringify(deck && deck.w));
  await p.click('[data-act="v-deck"]'); await p.waitForTimeout(200); rec("Adding again doesn't duplicate", /Already/.test(await p.textContent("#dktoast")));
  // shadowing
  await log(); await p.click('#vcaught li:first-child [data-act="v-shadow"]'); await p.waitForTimeout(300); L = await log();
  rec("Shadowing replays the moment", L.some((x) => x[0] === "seek" && Math.abs(x[1] - 39) < 0.3) && L.some((x) => x[0] === "play"), JSON.stringify(L));
  await p.waitForTimeout(5000); const sh = await p.$eval("#vcaught li:first-child", (x) => x.innerText);
  rec("…then listens and scores what you said", /Said it: 100%/.test(sh), sh.replace(/\s+/g, " "));
  await p.evaluate(() => (window.__heard = "pero no")); await p.click('#vcaught li:first-child [data-act="v-shadow"]'); await p.waitForTimeout(5200);
  const sh2 = await p.$eval("#vcaught li:first-child", (x) => x.innerText); const pc = +(/(\d+)%/.exec(sh2) || [])[1];
  rec("…and a different phrase scores lower", pc < 100, sh2.replace(/\s+/g, " "));
  // retell
  await p.fill("#vret", "En el vídeo Gabriel es de España. Él tiene una cita con tres mujeres. Yo tiene mucho interés en la historia porque es divertida, pero al final Sofía no quiere salir con él.");
  await p.click('[data-act="v-ret-check"]'); await p.waitForTimeout(300); const rr = await p.$eval("#vret-res", (x) => x.innerText.replace(/\s+/g, " "));
  rec("Retell checked: scores and corrections", /Organisation/.test(rr) && /Accuracy/.test(rr) && /tengo/.test(rr) && /connectors: .*porque/.test(rr), rr.slice(0, 220));
  await p.reload(); await p.waitForTimeout(1200);
  rec("Retell, catches and answers are kept after reload", (await p.inputValue("#vret")).startsWith("En el vídeo") && (await p.$$("#vcaught li")).length === 2);
  await log(); await p.click('[data-act="v-ret-profe"]'); await p.waitForTimeout(900); L = await log();
  const tut = await p.evaluate(() => { const t = document.getElementById("tutor"); return t && !t.hidden ? t.innerText.replace(/\s+/g, " ") : ""; });
  rec("Ask Profe: opens with the video and your summary, video paused", /Looking at: Video · ¿Es cara Barcelona\?/.test(tut) && /cara Barcelona/.test(tut) && /Gabriel es de España/.test(tut) && L.some((x) => x[0] === "pause"), tut.slice(0, 160));
  await p.evaluate(() => { const x = document.querySelector('#tutor [data-act="t-close"]'); x && x.click(); }); await p.waitForTimeout(400);
  // watched
  const before = Object.values((await S()).act || {}).reduce((a, b) => a + b, 0);
  await p.evaluate(() => window.__yt.p._end()); await p.waitForTimeout(400);
  const sv = await S(); const after = Object.values(sv.act || {}).reduce((a, b) => a + b, 0);
  rec("Watching to the end marks it watched and gives points", sv.vid["WLXiu-qp8Lw"].w > 0 && after - before === 5 && sv.tot.video === 1, "points +" + (after - before));
  await p.evaluate(() => window.__yt.p._end()); await p.waitForTimeout(200); rec("…only once", Object.values((await S()).act).reduce((a, b) => a + b, 0) === after);
  await go("video-ot5L3fIl0z0"); await p.evaluate(() => { window.__yt.p.dur = 100; window.__yt.p.t = 90; }); await p.waitForTimeout(500);
  rec("Watching 85% also counts", ((await S()).vid["ot5L3fIl0z0"] || {}).w > 0);
  await log(); await go("videos"); L = await log(); rec("Leaving the page stops the player", L.some((x) => x[0] === "destroy"), JSON.stringify(L));
  const wb = await p.$$eval(".vcard", (a) => a.filter((x) => /Watched/.test(x.innerText)).length); const cc = await p.$eval('.vcard[href="#video-WLXiu-qp8Lw"]', (x) => x.innerText);
  rec("List shows watched videos and words caught", wb === 2 && /2 words caught/.test(cc), cc.replace(/\s+/g, " "));
  await go("practicar"); rec("Practice row shows the count", /2 watched/.test(await p.$eval('a[href="#videos"]', (x) => x.innerText)));
  // library clips: 4 minutes at most
  await go("video-kRt2sRyup6A"); const mk = await p.evaluate(() => window.__yt.made.at(-1).playerVars);
  rec("Library clip plays 0:00–4:00 only", mk.start === 0 && mk.end === 240 && /Clip: 0:00–4:00/.test(await p.textContent(".vpage-act")), JSON.stringify([mk.start, mk.end]));
  await p.evaluate(() => { window.__yt.p.dur = 600; window.__yt.p.playVideo(); }); await T(100); await log(); await p.click('[data-act="v-loop"]'); await p.click('[data-act="v-loop"]');
  await T(250); await p.waitForTimeout(400); L = await log(); rec("Playing past the clip's end stops it at 4:00", L.some((x) => x[0] === "pause") && L.some((x) => x[0] === "seek" && x[1] < 240 && x[1] > 230), JSON.stringify(L));
  await T(10); await p.evaluate(() => window.__yt.p.seekTo(0)); await T(210); await p.waitForTimeout(400);
  const kd = (await S()).vid["kRt2sRyup6A"]; rec("85% of the clip counts as watched; length saved as 4:00", kd.w > 0 && kd.len === 240, JSON.stringify({ w: !!kd.w, len: kd.len }));
  await go("videos"); rec("Card shows the clip length", /4:00/.test(await p.$eval('.vcard[href="#video-kRt2sRyup6A"]', (x) => x.innerText)));
  // filters
  await p.click('.vchip[data-k="c"][data-v="noticias"]'); await p.waitForTimeout(200);
  let hrefs = await p.$$eval(".vcard", (a) => a.map((x) => x.getAttribute("href").slice(7)));
  rec("Filter: News shows only news", hrefs.length >= 4 && hrefs.includes("tjmp1fEk9d4") && !hrefs.includes("kRt2sRyup6A"), hrefs.join(" "));
  await p.click('.vchip[data-k="l"][data-v="C1"]'); await p.waitForTimeout(200); hrefs = await p.$$eval(".vcard", (a) => a.map((x) => x.getAttribute("href").slice(7)));
  rec("Filter: News + C1", hrefs.length === 2 && hrefs.includes("tjmp1fEk9d4"), hrefs.join(" "));
  await p.reload(); await p.waitForTimeout(900); rec("Filters are remembered", (await p.getAttribute('.vchip[data-k="l"][data-v="C1"]', "aria-pressed")) === "true");
  await p.click('.vchip[data-k="c"][data-v=""]'); await p.click('.vchip[data-k="l"][data-v=""]'); await p.waitForTimeout(200);
  // remove / undo / restore
  await p.click('[data-act="v-edit"]'); await p.waitForTimeout(200); const nrm = (await p.$$('[data-act="v-rm"]')).length; const ncard = (await p.$$(".vcard")).length;
  rec("Edit: every video gets a Remove button", nrm === ncard && nrm > 30, nrm + "/" + ncard);
  await p.click('[data-act="v-rm"][data-id="TiPRNqJnI_k"]'); await p.waitForTimeout(250);
  rec("Remove takes it off the list, with Undo", !(await p.$('.vcard[href="#video-TiPRNqJnI_k"]:not(.vmore .vcard)')) && /Removed/.test(await p.textContent("#dktoast")), await p.textContent("#dktoast"));
  await p.click('#dktoast [data-act="v-undo"]'); await p.waitForTimeout(250); rec("Undo brings it back", !!(await p.$('.vgrid .vcard[href="#video-TiPRNqJnI_k"]')) && !((await S()).vhide || {})["TiPRNqJnI_k"]);
  await p.click('[data-act="v-rm"][data-id="TiPRNqJnI_k"]'); await p.waitForTimeout(250);
  rec("Removed videos listed at the bottom", /Removed videos \(1\)/.test(await p.textContent(".vmore summary")));
  await p.click(".vmore summary"); await p.click('[data-act="v-restore"][data-id="TiPRNqJnI_k"]'); await p.waitForTimeout(250);
  rec("Restore brings it back", !(await p.$(".vmore")) && !!(await p.$('.vcard[href="#video-TiPRNqJnI_k"]')));
  await p.fill("#vlink", "https://youtu.be/MyOwnVideo1"); await p.click('#vadd button[type="submit"]'); await p.waitForTimeout(600); await go("videos"); await p.click('[data-act="v-edit"]'); await p.waitForTimeout(200);
  await p.click('[data-act="v-rm"][data-id="MyOwnVideo1"]'); await p.waitForTimeout(250);
  rec("Delete one of my videos", !((await S()).myv || []).some((v) => v.yt === "MyOwnVideo1") && /Deleted/.test(await p.textContent("#dktoast")));
  await p.click('#dktoast [data-act="v-undo"]'); await p.waitForTimeout(250); rec("…Undo restores it", ((await S()).myv || []).some((v) => v.yt === "MyOwnVideo1"));
  await p.click('[data-act="v-edit"]'); rec("Done leaves edit mode", !(await p.$('[data-act="v-rm"]')));
  await go("video-v2Ph5hBmqYA"); await p.click('[data-act="v-remove"]'); await p.waitForTimeout(500);
  rec("Remove from the video page", p.url().endsWith("#videos") && ((await S()).vhide || {})["v2Ph5hBmqYA"] > 0);
  await p.click('#dktoast [data-act="v-undo"]'); await p.waitForTimeout(300);
  // blocked embed
  await go("video-CoIL9IsJXiA"); await p.evaluate(() => window.__yt.p._err(150)); await p.waitForTimeout(200);
  rec("Blocked embed: says why, with the code", /only allows it on YouTube \(code 150\)/.test(await p.textContent("#vfail p")));
  rec("Blocked embed: says so and offers Open in YouTube", (await p.isVisible("#vfail")) && (await p.getAttribute('#vfail a', "href")) === "https://www.youtube.com/watch?v=CoIL9IsJXiA");
  rec("…exercises still there", await p.isVisible("#vret"));
  await go("videos"); rec("Unplayable video leaves the list, with no separate section", !(await p.$('.vcard[href="#video-CoIL9IsJXiA"]')) && !/Not playable/.test(await p.textContent("body")));
  // shared from the YouTube app (Android share sheet)
  await p.goto("http://localhost:8766/?text=" + encodeURIComponent("Mira esto https://youtu.be/ShArEdViD01?si=abc")); await p.waitForTimeout(1300);
  mine = (await S()).myv || [];
  rec("Shared YouTube link opens its video page", p.url().endsWith("/#video-ShArEdViD01") && !p.url().includes("?text") && mine.some((v) => v.yt === "ShArEdViD01"), p.url());
  await p.goto("http://localhost:8766/?text=" + encodeURIComponent("Un texto en español para leer.")); await p.waitForTimeout(1200);
  rec("Shared plain text still goes to Add a text", p.url().endsWith("#leer-add"), p.url());
  // my video: rename / remove
  await go("video-ShArEdViD01"); p.once("dialog", (d) => d.accept("Mi vídeo compartido")); await p.click('[data-act="v-rename"]'); await p.waitForTimeout(500);
  rec("Rename my video", (await p.textContent("#app h1")) === "Mi vídeo compartido");
  await p.click('[data-act="v-remove"]'); await p.waitForTimeout(700); rec("Remove my video", p.url().endsWith("#videos") && !((await S()).myv || []).some((v) => v.yt === "ShArEdViD01"));
  // player loads but never reports ready (seen on a phone): keep it visible, offer YouTube under it
  await p.evaluate(() => localStorage.setItem("x", 1)); await c.addInitScript(() => { window.__ytSilent = 1; });
  const p4 = await c.newPage(); p4.on("pageerror", (x) => er.push(x.message)); await p4.goto("http://localhost:8766/#video-WLXiu-qp8Lw"); await p4.waitForTimeout(11000);
  rec("Silent player stays visible, with an Open in YouTube hint", !(await p4.isVisible("#vfail")) && (await p4.isVisible("#vslow")) && (await p4.$eval("#vplayer", (x) => getComputedStyle(x).visibility)) === "visible");
  await p4.evaluate(() => window.__yt.p.o.events.onStateChange({ data: 1 })); await p4.waitForTimeout(100);
  rec("…the hint goes once the video starts playing", !(await p4.isVisible("#vslow")));
  // player can't load at all (offline / blocked) → fallback after a wait
  await c.unroute("**/www.youtube.com/iframe_api"); await c.route("**/www.youtube.com/iframe_api", (r) => r.abort());
  const p2 = await c.newPage(); p2.on("pageerror", (x) => er.push(x.message)); await p2.goto("http://localhost:8766/#video-WLXiu-qp8Lw"); await p2.waitForTimeout(13000);
  rec("No YouTube at all → Open in YouTube fallback", await p2.isVisible("#vfail"));
  // dark theme / small phone fit
  const p3 = await (await b.newContext({ ...devices["iPhone SE"], colorScheme: "dark", serviceWorkers: "block" })).newPage(); await p3.goto("http://localhost:8766/#videos"); await p3.waitForTimeout(900);
  rec("Small phone: list fits without sideways scroll", !(await p3.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1)));
  await p.screenshot({ path: "/tmp/claude-0/-home-claude/d337dd92-af3a-59a5-8489-72aae6454dab/scratchpad/vid-list.png", fullPage: false });
  await go("video-WLXiu-qp8Lw"); await p.screenshot({ path: "/tmp/claude-0/-home-claude/d337dd92-af3a-59a5-8489-72aae6454dab/scratchpad/vid-page.png", fullPage: true });
  rec("No script errors", !er.length, er.join(" | "));
  console.log(R.filter(Boolean).length + "/" + R.length + " passed"); await b.close();
})();
