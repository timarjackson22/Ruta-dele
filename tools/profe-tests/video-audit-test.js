// Video audit (tools/VIDEO_AUDIT_BRIEF.md): cleanup, captions from the audio, word check, Words › Informal, start at 0, replay sentence, library
const { chromium, devices } = require("playwright"); const fs = require("fs");
const R = []; const rec = (n, ok, info) => { R.push(ok); console.log((ok ? "PASS " : "FAIL ") + n + (info ? "  " + info : "")); };
const MOCK = fs.readFileSync(__dirname + "/vid.js", "utf8").match(/const MOCK = `([\s\S]*?)`;/)[1];
const X = (lines) => '<?xml version="1.0" encoding="utf-8" ?><transcript>' + lines.map(([s, d, t]) => '<text start="' + s + '" dur="' + d + '">' + t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;") + "</text>").join("") + "</transcript>";
const CAPS = {
  // YouTube automatic captions full of tags, an unknown slang word and a name mid-sentence
  "WLXiu-qp8Lw": { lang: "es", kind: "asr", secs: "300", en: "", es: X([[0, 2, "[Música]"], [2.2, 2.6, "♪ hola mi gente ♪"], [5.2, 2.6, ">> qué bonito es el chuchuwasi"], [8.2, 2.6, "- y yo vivo con Marta"], [11.2, 2.4, "[Aplausos] gracias a todos"]]) },
  "TiPRNqJnI_k": { none: true, secs: "300" },
};
(async () => {
  const b = await chromium.launch(); const c = await b.newContext({ ...devices["Pixel 7"], serviceWorkers: "block" });
  await c.route("**/www.youtube.com/iframe_api", (r) => r.fulfill({ contentType: "text/javascript", body: MOCK }));
  await c.route("**/i.ytimg.com/**", (r) => r.fulfill({ status: 404, body: "" }));
  await c.addInitScript((CAPS) => {
    window.AndroidCap = { fetch(id, vid) { setTimeout(() => window.__acap.ev(id, JSON.stringify(CAPS[vid] || { none: true }), ""), 60); } };
    window.AndroidTR = { available: () => true, translate(id, t) { setTimeout(() => window.__atr && window.__atr.ev(id, t === "chuchuwasi" ? "a jungle drink" : "EN(" + t + ")", ""), 20); } };
    window.__audCalls = [];
    window.AndroidAud = { available: () => true, start(l) { window.__audCalls.push(["start", l]); setTimeout(() => window.__aaud.ev("state", "asking"), 30); setTimeout(() => window.__aaud.ev("state", "listening"), 120); }, stop() { window.__audCalls.push(["stop"]); setTimeout(() => window.__aaud.ev("state", "stopped"), 30); } };
  }, CAPS);
  const p = await c.newPage(); const er = []; p.on("pageerror", (x) => er.push(x.message));
  const go = async (h) => { await p.goto("http://localhost:8766/#" + h); await p.waitForTimeout(1100); };
  const S = () => p.evaluate(() => JSON.parse(localStorage.getItem("ruta-dele-v1") || "{}"));
  const T = (v, st) => p.evaluate(([v, st]) => { window.__yt.p.t = v; if (st != null) window.__yt.p.st = st; }, [v, st]);
  // library
  await go("videos"); const cards = await p.$$eval(".vcard", (a) => a.map((x) => x.getAttribute("href").slice(7)));
  rec("Library: 3 sit-down interviews (Serrat, Mon Laferte, Fito Páez) replace the street interviews", ["LdRsZ1adZWw", "09Apgxuk65I", "XOlmCZFK5FA"].every((i) => cards.includes(i)) && !["DOa9b3JeEiU", "yOaxqV8Rzf0", "CoIL9IsJXiA"].some((i) => cards.includes(i)));
  rec("Library: Verano Rosa (KAROL G, Feid) in Music", cards.includes("FUHaycnjzKg"));
  // B. cleanup
  await go("video-WLXiu-qp8Lw"); await p.waitForTimeout(500);
  const txt = await p.$$eval("#vcap .ves", (a) => a.map((x) => x.textContent));
  rec("YouTube's tags removed: no [Música], [Aplausos], ♪, >> or leading dash", !txt.some((t) => /[\[\]♪>]|^-/.test(t)), txt.join(" | "));
  rec("Exclamations get ¡…! (¡Qué bonito…!)", txt.includes("¡Qué bonito es el chuchuwasi!"), txt.join(" | "));
  rec("…and the words around them kept, as sentences", /^Hola mi gente\.?$|^Hola, mi gente\.$/.test(txt[0]) && txt.some((t) => /gracias a todos/i.test(t)), txt.join(" | "));
  // D. word check
  await p.waitForTimeout(1500); let sv = await S();
  rec("Word check: the unknown word is translated and kept as a video word", sv.vlex && sv.vlex.chuchuwasi && sv.vlex.chuchuwasi.en === "a jungle drink" && sv.vlex.chuchuwasi.v === "WLXiu-qp8Lw", JSON.stringify(sv.vlex));
  rec("…names mid-sentence and known words are left alone", !sv.vlex.marta && !sv.vlex.bonito && !sv.vlex.hola);
  rec("…with a note saying the words were added", /new word.*Informal/.test(await p.evaluate(() => document.body.innerText)));
  await p.click('#vcap .vword >> text=chuchuwasi'); await p.waitForTimeout(250);
  rec("Word card for a video word shows its translation", /Heard in your videos:\s*a jungle drink/.test(await p.textContent("#sheet"))); await p.click('[data-act="vc-close"]');
  rec("Cards remember the caption kind", (await S()).vid["WLXiu-qp8Lw"].cap === "asr");
  // A. captions from the audio
  rec("Automatic captions: option to make them from the audio instead", !!(await p.$('[data-act="va-start"]')));
  await go("video-TiPRNqJnI_k"); await p.waitForTimeout(300);
  rec("No captions: 'Captions from the audio' offered", /no Spanish captions on YouTube/.test(await p.textContent("#vcap")) && !!(await p.$('#vcap [data-act="va-start"]')));
  await p.evaluate(() => window.__yt.log.splice(0)); await p.click('#vcap [data-act="va-start"]'); await p.waitForTimeout(400);
  const calls = await p.evaluate(() => window.__audCalls);
  rec("Start: asks Android to record, in Spanish", calls[0] && calls[0][0] === "start" && /^es-/.test(calls[0][1]), JSON.stringify(calls));
  const L0 = await p.evaluate(() => window.__yt.log.splice(0));
  rec("Listening: banner with Stop; the video plays from the start", /Listening to the video/.test(await p.textContent("#vabar")) && !!(await p.$('[data-act="va-stop"]')) && L0.some((x) => x[0] === "seek" && x[1] === 0) && L0.some((x) => x[0] === "play"), JSON.stringify(L0));
  const say = async (t0, partial, t1, fin) => { await T(t0, 1); await p.evaluate((x) => window.__aaud.ev("partial", x), partial); await T(t1, 1); await p.evaluate((x) => window.__aaud.ev("final", x), fin); await p.waitForTimeout(150); };
  await T(1.4, 1); await p.evaluate(() => window.__aaud.ev("partial", "ojalá que")); await p.waitForTimeout(120);
  rec("Words appear live while they're being recognised", /ojalá que/.test(await p.textContent("#vcap")));
  await T(4.0, 1); await p.evaluate(() => window.__aaud.ev("final", "ojalá que llueva café en el campo")); await p.waitForTimeout(150);
  await say(6.5, "pa que", 9.0, "pa que todos los niños canten");
  const ac = await p.$$eval("#vcap .ves", (a) => a.map((x) => x.textContent));
  rec("Recognised speech becomes punctuated sentences", ac[0] === "Ojalá que llueva café en el campo." && ac[1] === "Pa que todos los niños canten.", ac.join(" | "));
  rec("…in time with the video (first sentence starts ≈0:00.2, second ≈0:05.3)", await p.evaluate(() => { const v = JSON.parse(localStorage.getItem("vaud:TiPRNqJnI_k")); return Math.abs(v.cues[0].s - 0.2) < 0.3 && Math.abs(v.cues[1].s - 5.3) < 0.3; }));
  rec("…'pa' marked as short for para", await p.$eval("#vcap", (w) => [...w.querySelectorAll(".vinf-short")].some((x) => /^pa$/i.test(x.textContent))));
  await p.evaluate(() => { window.__yt.p.adId = "AdAdAdAdAd1"; }); await p.waitForTimeout(400); await say(12, "compre ahora", 14, "compre ahora con descuento");
  rec("Speech during an ad is ignored", !/descuento/i.test(await p.textContent("#vcap"))); await p.evaluate(() => { window.__yt.p.adId = null; }); await p.waitForTimeout(400);
  await p.click('[data-act="va-stop"]'); await p.waitForTimeout(400);
  rec("Stop: captions saved, with a note", /Captions saved/.test(await p.textContent("#vcapw")) && (await p.evaluate(() => JSON.parse(localStorage.getItem("vaud:TiPRNqJnI_k")).done)) === true);
  await go("videos"); await go("video-TiPRNqJnI_k"); await p.waitForTimeout(500);
  rec("Next time: the saved captions are there from the start", (await p.$$("#vcap .ves")).length === 2 && /made from the video's sound/.test(await p.textContent("#vcap-note")));
  await go("videos"); rec("The card says 'Captions from audio'", /Captions from audio/.test(await p.$eval('.vcard[href="#video-TiPRNqJnI_k"]', (x) => x.innerText)));
  // E. Words › Informal
  await go("palabras"); await p.click('[data-act="w-inf"]'); await p.waitForTimeout(400);
  const body = await p.textContent("#wbody");
  rec("Words › Informal: slang, shortened forms, jargon and your video words", /chévere/.test(body) && /mami/.test(body) && /short for «para»|short for para/.test(body) && /golazo/.test(body) && /chuchuwasi/.test(body) && /a jungle drink/.test(body), body.slice(0, 120));
  await p.fill("#w-search", "chuchu"); await p.waitForTimeout(400); const rows = await p.$$eval("#wbody tbody tr", (a) => a.length);
  rec("…searchable", rows === 1, rows + " rows");
  await p.fill("#w-search", ""); await p.click('[data-act="w-type"][data-t=""]'); await p.waitForTimeout(300);
  rec("…and 'All' goes back to the normal word list", !(await p.$("table.inf")) && !!(await p.$("table.words")));
  // C. start at 0, H. replay sentence + speed label
  await p.evaluate(() => { const S = JSON.parse(localStorage.getItem("ruta-dele-v1")); S.vid["WLXiu-qp8Lw"].at = 100; S.vid["WLXiu-qp8Lw"].w = 0; localStorage.setItem("ruta-dele-v1", JSON.stringify(S)); });
  await p.goto("http://localhost:8766/?r=2#video-WLXiu-qp8Lw"); await p.waitForTimeout(1400);
  const L1 = await p.evaluate(() => window.__yt.log.splice(0));
  rec("Opening a video: it starts at 0:00 (no automatic jump)", !L1.some((x) => x[0] === "seek") && /Continue from 1:40/.test(await p.textContent(".vctl")), JSON.stringify(L1));
  await T(9.0, 2); await p.waitForTimeout(300); await p.evaluate(() => window.__yt.log.splice(0)); await p.click('[data-act="v-loop"]'); await p.waitForTimeout(200);
  const L2 = await p.evaluate(() => window.__yt.log.splice(0)), cur = await p.evaluate(() => document.querySelector("#vcap .vcue.on .ves").textContent);
  rec("Replay sentence: loops the sentence being said", /Replay sentence/.test(await p.textContent('[data-act="v-loop"]')) && L2.some((x) => x[0] === "seek" && Math.abs(x[1] - 8.05) < 0.3), cur + " " + JSON.stringify(L2));
  await p.click('[data-act="v-loop"]'); await p.click('[data-act="v-rate"]'); rec("Speed button says the speed", (await p.textContent('[data-act="v-rate"]')) === "Speed 0.75×"); await p.click('[data-act="v-rate"]');
  // playback report
  await p.click('[data-act="v-report"]'); await p.waitForTimeout(300); const rep = await p.inputValue("#vrep");
  rec("Report a playback problem: a copyable log of what the player reported", /playback report/.test(rep) && /"d":/.test(rep) && /real length: 300/.test(rep), rep.slice(0, 120));
  rec("No script errors", !er.length, er.join(" | "));
  console.log(R.filter(Boolean).length + "/" + R.length + " passed"); await b.close();
})();
