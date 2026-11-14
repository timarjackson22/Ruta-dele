// Caption window (tools/VIDEO_CAPTIONS_BRIEF.md): simulated player + simulated Android caption fetch; sample lines are invented
const { chromium, devices } = require("playwright");
const fs = require("fs");
const R = []; const rec = (n, ok, info) => { R.push(ok); console.log((ok ? "PASS " : "FAIL ") + n + (info ? "  " + info : "")); };
const MOCK = fs.readFileSync(__dirname + "/vid.js", "utf8").match(/const MOCK = `([\s\S]*?)`;/)[1];
const LINES = [
  [0, "Hola, ¿qué tal? Hoy vamos pa' la playa.", "Hi, how are you? Today we're going to the beach."],
  [3, "Está chévere, mae, pero el agua está fría.", "It's great, dude, but the water is cold."],
  [6, "Mi tío vive allí, tío, ¿qué onda?", "My uncle lives there, man, what's up?"],
  [9.5, "Estoy cansao de trabajar todo el día.", "I'm tired of working all day."],
  [13, "Hubo un golazo y luego una borrasca.", "There was a great goal and then a storm."],
];
for (let i = 0; i < 16; i++) LINES.push([17 + i * 4, "Esta es la frase número " + (i + 6) + " del vídeo de prueba.", "This is sentence number " + (i + 6) + " of the test video."]);
LINES.push([250, "Esta frase está fuera del clip.", "This sentence is outside the clip."]);
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/'/g, "&amp;#39;");
const srv1 = (k) => '<?xml version="1.0" encoding="utf-8" ?><transcript>' + LINES.map((l, i) => '<text start="' + l[0] + '" dur="' + ((LINES[i + 1] || [l[0] + 4])[0] - l[0]) + '">' + esc(l[k]) + "</text>").join("") + "</transcript>";
// automatic captions with word timings (srv3): each word 0.4 s apart
const W3 = [[0, "hola amigos bienvenidos al canal"], [2.5, "hoy hablamos de comida"], [5, "vamos pa la cocina"], [7.5, "oye qué vamos a comer hoy"], [10.6, "está muy rico verdad"], [13.2, "pero no sé si te gusta o no"]];
const srv3 = '<?xml version="1.0" encoding="utf-8" ?><timedtext format="3"><body>' + W3.map(([s, t]) => '<p t="' + s * 1000 + '" d="2500" w="1">' + t.split(" ").map((w, i) => (i ? '<s t="' + i * 400 + '" ac="0"> ' + w + "</s>" : "<s>" + w + "</s>")).join("") + "</p>").join("") + "</body></timedtext>";
const CAPS = { "WLXiu-qp8Lw": { lang: "es", kind: "manual", es: srv1(1), en: srv1(2), secs: "300" }, "CoIL9IsJXiA": { lang: "es", kind: "asr", es: srv3, en: "" }, "yOaxqV8Rzf0": { none: true } };
(async () => {
  const b = await chromium.launch(); const c = await b.newContext({ ...devices["Pixel 7"], serviceWorkers: "block" });
  await c.route("**/www.youtube.com/iframe_api", (r) => r.fulfill({ contentType: "text/javascript", body: MOCK }));
  await c.route("**/i.ytimg.com/**", (r) => r.fulfill({ status: 404, body: "" }));
  const page0 = await c.newPage(); const er = []; page0.on("pageerror", (x) => er.push(x.message));
  await page0.goto("http://localhost:8766/#video-WLXiu-qp8Lw"); await page0.waitForTimeout(1200);
  rec("Web/iPhone (no Android app): the window explains captions need the Android app", /works in the Ruta DELE app for Android/.test(await page0.textContent("#vcap")));
  await page0.close();
  await c.addInitScript((CAPS) => {
    window.__capCalls = 0;
    window.AndroidCap = { available: () => true, fetch(id, vid) { window.__capCalls++; setTimeout(() => window.__acap.ev(id, (localStorage.getItem("capErr") || "") ? "" : JSON.stringify(CAPS[vid] || { none: true }), localStorage.getItem("capErr") || ""), 120); } };
  }, CAPS);
  const p = await c.newPage(); p.on("pageerror", (x) => er.push(x.message));
  const go = async (h) => { await p.goto("http://localhost:8766/#" + h); await p.waitForTimeout(1000); };
  const T = (v, st) => p.evaluate(([v, st]) => { window.__yt.p.t = v; if (st != null) window.__yt.p.st = st; }, [v, st]);
  const log = () => p.evaluate(() => window.__yt.log.splice(0));
  const on = () => p.evaluate(() => { const r = document.querySelector("#vcap .vcue.on"); return r ? +r.dataset.i : -1; });
  const onTxt = () => p.evaluate(() => { const r = document.querySelector("#vcap .vcue.on .ves"); return r ? r.textContent : ""; });
  const tipOf = () => p.evaluate(() => { const t = document.getElementById("vtip"); if (!t || t.hidden) return null; const k = t.dataset.k.split(":"), w = document.querySelectorAll("#vcap .vcue")[+k[0]].querySelectorAll(".ves .vword")[+k[1]], a = t.getBoundingClientRect(), b = w.getBoundingClientRect(); return { tip: t.textContent, word: w.textContent, above: a.bottom <= b.top + 1, centred: Math.abs((a.left + a.right) / 2 - (b.left + b.right) / 2) < 40 || a.left <= b.left + 2 || a.right >= b.right - 2 }; });
  const nowWord = () => p.evaluate(() => { const w = document.querySelector("#vcap .vcue.on .vword.now"); return w ? w.textContent : null; });
  await go("video-WLXiu-qp8Lw");
  const n = await p.$$eval("#vcap .vcue", (a) => a.length);
  const sents = await p.$$eval("#vcap .ves", (a) => a.map((x) => x.textContent));
  rec("One sentence per line: 'Hola, ¿qué tal?' and 'Hoy vamos pa' la playa.' become two lines", n === LINES.length && sents[0] === "Hola, ¿qué tal?" && sents[1] === "Hoy vamos pa' la playa.", n + " | " + sents.slice(0, 3).join(" | "));
  rec("No timing buttons beside the lines", !(await p.$("#vcap .vct")));
  rec("Lines outside the 4-minute clip are left out", !/fuera del clip/.test(await p.textContent("#vcap")));
  rec("Source shown: the channel's own captions", /channel's own Spanish captions/.test(await p.textContent("#vcap-note")));
  rec("Subtitles on the video are switched off (the window replaces them)", (await log()).some((x) => x[0] === "unload" && x[1] === "captions"));
  // sync
  await T(4, 2); await p.waitForTimeout(150); rec("At 0:04 the line being said is current", /^Está chévere/.test(await onTxt()), await onTxt());
  await T(0.5, 2); await p.waitForTimeout(150); const s0 = await onTxt(); await T(2.0, 2); await p.waitForTimeout(150); const s1 = await onTxt();
  rec("Within one caption, the second sentence takes over when it's spoken", s0 === "Hola, ¿qué tal?" && s1 === "Hoy vamos pa' la playa.", s0 + " → " + s1);
  await T(10, 2); await p.waitForTimeout(150); rec("At 0:10 the fourth caption", /^Estoy cansao/.test(await onTxt()));
  await T(9.35, 2); await p.waitForTimeout(150); rec("Just before 0:09.5 (0:09.35) still the one before", /^Mi tío/.test(await onTxt()));
  await T(13.1, 2); await p.waitForTimeout(150); const w1 = await nowWord(); await T(16.6, 2); await p.waitForTimeout(150); const w2 = await nowWord();
  rec("Current word moves through the line as it's said", w1 === "Hubo" && w2 === "borrasca", w1 + " → " + w2);
  await T(30, 1); await p.waitForTimeout(120); const a1 = await on(); await p.waitForTimeout(1200); const a2 = await on();
  rec("While playing, lines advance on their own", a1 === 8 && a2 === 8 || a2 >= a1, a1 + " → " + a2);
  await p.evaluate(() => window.__yt.p.pauseVideo()); const tp = await p.evaluate(() => window.__yt.p.t); await p.waitForTimeout(800);
  rec("Paused: the window stays on the same line", (await onTxt()) === LINES[LINES.findLastIndex((l) => l[0] <= tp + 0.05)][1]);
  await T(45.2, 2); await p.waitForTimeout(900);
  rec("A jump in the video: the window follows at once", /número 13 /.test(await onTxt()), await onTxt());
  // glide: current line near the top, earlier lines fade above
  const g = await p.evaluate(() => { const w = document.getElementById("vcap"), r = w.querySelector(".vcue.on").getBoundingClientRect(), wr = w.getBoundingClientRect(), past = w.querySelector(".vcue.past"); return { y: (r.top - wr.top) / wr.height, op: +getComputedStyle(past).opacity, tf: getComputedStyle(w.querySelector("#vcap-in")).transform }; });
  await T(2, 2); await p.waitForTimeout(900); const top0 = await p.evaluate(() => { const w = document.getElementById("vcap"); return w.querySelector(".vcue.on").getBoundingClientRect().top - w.getBoundingClientRect().top; });
  rec("Text glides up: the current line sits near the top of the window", g.y > 0.08 && g.y < 0.4 && g.tf !== "none", JSON.stringify(g));
  rec("Earlier lines fade out as they rise", g.op < 0.5);
  // layout: English right under its line, blank line between lines
  await p.click('[data-act="vc-en"]'); await p.waitForTimeout(400);
  const lay = await p.evaluate(() => { const r = document.querySelectorAll("#vcap .vcue"); const es0 = r[0].querySelector(".ves").getBoundingClientRect(), en0 = r[0].querySelector(".ven").getBoundingClientRect(), es1 = r[1].querySelector(".ves").getBoundingClientRect(); return { enGap: en0.top - es0.bottom, lineGap: es1.top - en0.bottom, en: r[0].querySelector(".ven").textContent }; });
  rec("English on: each English line sits directly under its Spanish line", lay.en === LINES[0][2] && lay.enGap >= 0 && lay.enGap < 6, JSON.stringify(lay));
  rec("…with a blank line before the next Spanish line", lay.lineGap > 14);
  // cue tips above the word being said
  await T(3.05, 2); await p.waitForTimeout(400); let tp1 = await tipOf();
  rec("Cue tip: English above the word being said (Está → is)", tp1 && tp1.word === "Está" && /^is/.test(tp1.tip) && tp1.above && tp1.centred, JSON.stringify(tp1));
  await T(3.7, 2); await p.waitForTimeout(400); tp1 = await tipOf();
  rec("…follows the speech: chévere → great", tp1 && tp1.word === "chévere" && /great/.test(tp1.tip) && tp1.above, JSON.stringify(tp1));
  await T(4.6, 2); await p.waitForTimeout(400); tp1 = await tipOf();
  rec("…little words skip ahead: on 'el', the tip is already on agua → water", tp1 && tp1.word === "agua" && /water/.test(tp1.tip), JSON.stringify(tp1) + " now=" + (await nowWord()));
  await T(0.3, 2); await p.waitForTimeout(400); tp1 = await tipOf(); await T(1.85, 2); await p.waitForTimeout(400); const tp2 = await tipOf();
  rec("…shortened forms say what they stand for (pa' → for (para))", tp2 && tp2.word === "pa'" && /\(para\)/.test(tp2.tip), JSON.stringify(tp2));
  await p.click('[data-act="vc-cue"]'); await p.waitForTimeout(300);
  rec("Cue tips button turns them off", !(await tipOf()) && (await p.getAttribute('[data-act="vc-cue"]', "aria-pressed")) === "false");
  await p.reload(); await p.waitForTimeout(1300); await T(3.7, 2); await p.waitForTimeout(400);
  rec("…and it's remembered (same setting as Reading and Listening)", !(await tipOf()) && (await p.evaluate(() => JSON.parse(localStorage.getItem("ruta-ui") || "{}").cues)) === false);
  await p.click('[data-act="vc-cue"]'); await p.waitForTimeout(400); rec("…and back on", !!(await tipOf()));
  await p.click('[data-act="vc-hide"]'); await p.waitForTimeout(200);
  rec("Just listen: text hidden (blurred) with a note", await p.evaluate(() => document.getElementById("vcap").classList.contains("hide-text") && getComputedStyle(document.querySelector("#vcap .vcl")).filter.includes("blur") && getComputedStyle(document.querySelector(".vcap-listen")).display === "flex"));
  await p.reload(); await p.waitForTimeout(1300);
  rec("English and Just listen are remembered", await p.evaluate(() => { const w = document.getElementById("vcap"); return w.classList.contains("show-en") && w.classList.contains("hide-text"); }));
  rec("Captions come from the saved copy on reopening (no second download)", (await p.evaluate(() => window.__capCalls)) === 0);
  await p.click('[data-act="vc-hide"]'); await p.waitForTimeout(200);
  // informal words
  const inf = await p.$$eval("#vcap .vword", (a) => a.filter((x) => x.classList.contains("vinf")).map((x) => x.textContent + ":" + [...x.classList].find((c) => /^vinf-/.test(c)).slice(5)));
  rec("Informal words coloured: pa', chévere, mae, tío (as 'dude'), qué onda, cansao, golazo, borrasca", ["pa':short", "chévere:slang", "mae:slang", "tío:slang", "qué:slang", "onda:slang", "cansao:short", "golazo:jargon", "borrasca:jargon"].every((x) => inf.includes(x)), inf.join(" "));
  rec("…but not 'mi tío' (family), or ordinary words", inf.filter((x) => x.startsWith("tío")).length === 1 && !inf.some((x) => /^(playa|agua|Hola|trabajar)/.test(x)));
  const col = await p.evaluate(() => [getComputedStyle(document.querySelector("#vcap .vinf")).color, getComputedStyle(document.querySelector('#vcap .vword:not(.vinf)')).color]);
  rec("Informal words are a different colour", col[0] !== col[1], col.join(" vs "));
  await T(5.9, 2); await p.waitForTimeout(300);
  const col2 = await p.evaluate(() => { const x = document.querySelector('#vcap .vcue.on .vword.vinf.said'); return x ? getComputedStyle(x).color : null; });
  rec("…also in the line being read, after the word has been said", col2 === col[0], col2);
  await T(1, 1); await log();
  await p.click('#vcap .vword.vinf-short'); await p.waitForTimeout(300); let sh = await p.textContent("#sheet");
  rec("Tap pa': card says it's the shortened form of «para», video pauses", /Shortened form of\s*para\b/.test(sh) && (await log()).some((x) => x[0] === "pause"), sh.slice(0, 90));
  await p.click('[data-act="vc-close"]'); await p.waitForTimeout(150); rec("Close the card: video carries on", (await log()).some((x) => x[0] === "play") && (await p.isHidden("#sheet")));
  await p.click('#vcap .vword.vinf-slang >> text=chévere'); await p.waitForTimeout(200); sh = await p.textContent("#sheet");
  rec("Tap chévere: informal word, meaning and where it's used", /Informal word: great, cool/.test(sh) && /Caribbean/.test(sh), sh.slice(0, 100)); await p.click('[data-act="vc-close"]');
  await p.click('#vcap .vword >> text=cansao'); await p.waitForTimeout(200); sh = await p.textContent("#sheet");
  rec("Tap cansao: shortened form of «cansado»", /Shortened form of\s*cansado\b/.test(sh)); await p.click('[data-act="vc-close"]');
  await p.click('#vcap .vword >> text=onda'); await p.waitForTimeout(200); sh = await p.textContent("#sheet");
  rec("Tap a phrase: «qué onda» explained", /qué onda/.test(sh) && /what's up/.test(sh)); await p.click('[data-act="vc-close"]');
  await p.click('#vcap .vword >> text=golazo'); await p.waitForTimeout(200); sh = await p.textContent("#sheet");
  rec("Tap golazo: jargon, a great goal", /Jargon: a great goal/.test(sh)); await p.click('[data-act="vc-close"]');
  await p.evaluate(() => window.__yt.p.pauseVideo()); await T(3.5, 2); await p.waitForTimeout(900);
  await p.click('#vcap .vcue[data-i="2"] .vword >> text=agua'); await p.waitForTimeout(250); sh = await p.textContent("#sheet");
  rec("Tap an ordinary word: its meaning from the dictionary", /water/i.test(sh), sh.replace(/\s+/g, " ").slice(0, 100));
  await p.click('[data-act="vc-catch"]'); await p.waitForTimeout(250);
  rec("Catch it: the word goes to Words you caught", /agua/.test(await p.textContent("#vcaught")) && /water/i.test(await p.textContent("#vcaught")));
  // automatic captions with word timings
  await go("video-CoIL9IsJXiA"); await T(0.85, 2); await p.waitForTimeout(200); const ww1 = await nowWord(); await T(4.15, 2); await p.waitForTimeout(200); const ww2 = await nowWord();
  rec("Automatic captions: the highlighted word follows YouTube's word timings", ww1 === "bienvenidos" && ww2 === "comida", ww1 + ", " + ww2);
  rec("…labelled as automatic captions", /automatic Spanish captions/.test(await p.textContent("#vcap-note")));
  const as = await p.$$eval("#vcap .ves", (a) => a.map((x) => x.textContent));
  rec("Automatic captions: sentences at the pauses, with punctuation added", JSON.stringify(as) === JSON.stringify(["Hola, amigos bienvenidos al canal.", "Hoy hablamos de comida.", "Vamos pa la cocina.", "Oye, ¿qué vamos a comer hoy?", "Está muy rico, ¿verdad?", "Pero no sé si te gusta o no."]), as.join(" | "));
  await p.evaluate(() => { window.__trEn = async (t) => "EN: " + t; }); if ((await p.getAttribute('[data-act="vc-en"]', "aria-pressed")) !== "true") await p.click('[data-act="vc-en"]'); else { await p.click('[data-act="vc-en"]'); await p.click('[data-act="vc-en"]'); }
  await T(8.0, 2); await p.waitForFunction(() => { const r = document.querySelector("#vcap .vcue.on"); return r && /^Oye/.test(r.querySelector(".ves").textContent) && r.querySelector(".ven").textContent; }, null, { timeout: 4000 }).catch(() => {}); const ent = await p.$eval("#vcap .vcue.on .ven", (x) => x.textContent);
  rec("Automatic captions: English line = the whole punctuated sentence, translated by the app", ent === "EN: Oye, ¿qué vamos a comer hoy?", ent);
  rec("…and the note says the punctuation was added", /punctuation added by the app/.test(await p.textContent("#vcap-note")));
  rec("'pa' in automatic captions is still marked as short for para", await p.$eval("#vcap", (w) => [...w.querySelectorAll(".vinf-short")].some((x) => x.textContent === "pa")));
  // no captions / error / retry
  await go("video-yOaxqV8Rzf0"); rec("No Spanish captions: says so", /no Spanish captions/.test(await p.textContent("#vcap")));
  await p.evaluate(() => { localStorage.removeItem("vcap:WLXiu-qp8Lw"); localStorage.setItem("capErr", "IOException: HTTP 429"); }); await p.reload(); await p.waitForTimeout(400); await go("video-WLXiu-qp8Lw");
  rec("Error: says it couldn't load, with Try again", /Couldn't load the captions/.test(await p.textContent("#vcap")) && !!(await p.$('[data-act="vc-retry"]')));
  await p.evaluate(() => localStorage.removeItem("capErr")); await p.click('[data-act="vc-retry"]'); await p.waitForTimeout(500);
  rec("Try again loads them", (await p.$$("#vcap .vcue")).length > 10);
  // leaving stops everything
  await go("videos"); rec("Leaving the video stops the window", await p.evaluate(() => !document.getElementById("vcap")));
  await go("video-WLXiu-qp8Lw"); await T(14, 2); await p.waitForTimeout(800);
  await p.evaluate(() => scrollTo(0, 0)); await p.screenshot({ path: "/tmp/claude-0/-home-claude/d337dd92-af3a-59a5-8489-72aae6454dab/scratchpad/vcap.png", fullPage: false });
  const wide = await p.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1); rec("Fits the phone screen", !wide);
  rec("No script errors", !er.length, er.join(" | "));
  console.log(R.filter(Boolean).length + "/" + R.length + " passed"); await b.close();
})();
