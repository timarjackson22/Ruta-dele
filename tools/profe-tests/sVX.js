// v217 voice engine: every speech path uses the same ranked voices; robotic voices are never chosen; English/Spanish tag-team is right.
const { chromium } = require("playwright");
const URL = process.env.URL || "http://localhost:8766/";
const SETS = {
  android: [["es-ES","es-es-x-eea-local",1],["es-ES","es-es-x-eee-network",0],["es-US","es-us-x-esc-local",1],["es-US","es-us-x-esd-network",0],["es-US","es-us-x-esf-network",0],["en-US","en-us-x-sfg-local",1],["en-US","en-us-x-iom-network",0],["es-ES","Samsung Spanish",1]],
  iphone: [["es-ES","Mónica",1],["es-MX","Paulina",1],["es-MX","Paulina (Enhanced)",1],["es-ES","Eddy (Spanish (Spain))",1],["es-MX","Grandpa (Spanish (Mexico))",1],["en-US","Fred",1],["en-US","Samantha",1],["en-US","Ava (Premium)",1],["en-US","Zarvox",1]],
  chrome: [["es-ES","Google español",0],["es-US","Google español de Estados Unidos",0],["en-US","Google US English",0],["en-GB","Google UK English Female",0],["es-ES","Microsoft Helena - Spanish (Spain)",1],["en-US","Microsoft David - English (United States)",1]],
};
const CASES = [
 ["Great job, Timar. Now say: ¿Dónde está el baño?", "EN[Great job, Timar.] EN[Now say:] ES[¿Dónde está el baño?]"],
 ["The word «once» means eleven in Spanish.", "EN[The word] ES[once] EN[means eleven in Spanish.]"],
 ["Hola Timar, ¿cómo estás hoy?", "ES[Hola] EN[Timar,] ES[¿cómo estás hoy?]"],
 ["Correct! «Pan» means bread.", "EN[Correct!] ES[Pan] EN[means bread.]"],
 ["La palabra «red» en español significa internet o una malla.", "ES[La palabra red en español significa internet o una malla.]"],
 ["«Me llamo Carlos» means «My name is Carlos».", "ES[Me llamo Carlos] EN[means My name is Carlos.]"],
 ["Perfecto. Now, how do you say 'I have a red car'?", "ES[Perfecto.] EN[Now, how do you say I have a red car?]"],
 ["Use «me gusta» with one thing: Me gusta el café.", "EN[Use] ES[me gusta] EN[with one thing:] ES[Me gusta el café.]"],
 ["Me too! A mí también me gusta la playa.", "EN[Me too!] ES[A mí también me gusta la playa.]"],
 ["¡Muy bien, lo lograste! la nota", "ES[¡Muy bien, lo lograste!] ES[la nota]"],
 ["Lo lograste", "ES[Lo lograste]"],
 ["Hablábamos rápidamente.", "ES[Hablábamos rápidamente.]"],
];
let fail = 0; const ok = (c, m) => { if (!c) { fail++; console.log("FAIL", m); } };
(async () => {
  const b = await chromium.launch();
  for (const [set, list] of Object.entries(SETS)) for (const region of ["latam", "es"]) {
    const p = await b.newPage();
    await p.addInitScript(([list, region]) => {
      const vs = list.map(([lang, name, local]) => ({ lang, name, voiceURI: name, localService: !!local, default: false }));
      window.__said = [];
      const ss = window.speechSynthesis;
      Object.defineProperty(ss, "getVoices", { value: () => vs });
      Object.defineProperty(ss, "speak", { value: (u) => { window.__said.push({ t: u.text, v: u.voice && u.voice.name, lang: u.lang, rate: u.rate }); setTimeout(() => { try { u.onend && u.onend({}); } catch (e) {} }, 5); } });
      Object.defineProperty(ss, "cancel", { value: () => {} });
      window.SpeechSynthesisUtterance = function (t) { this.text = t; this.voice = null; this.lang = ""; this.rate = 1; this.pitch = 1; };
      try { const st = JSON.parse(localStorage.getItem("ruta-dele-v1") || "{}"); st.region = region; localStorage.setItem("ruta-dele-v1", JSON.stringify(st)); } catch (e) {}
    }, [list, region]);
    await p.goto(URL + "#inicio"); await p.waitForTimeout(1200);
    await p.evaluate((r) => { window.__setName("Timar"); }, region);
    const r = await p.evaluate(() => { window.__said = []; const out = {};
      document.querySelector('[data-act="say"]') ? document.querySelector('[data-act="say"]').click() : null; out.say = window.__said.slice(); return out; });
    const vx = await p.evaluate(() => window.__vx());
    const tag = `${set}/${region}`;
    const robot = /espeak|pico|samsung|fred|zarvox|eddy|grandpa|helena|david/i;
    ok(vx.es && !robot.test(vx.es), tag + " Spanish voice is natural: " + vx.es);
    ok(vx.en && !robot.test(vx.en), tag + " English voice is natural: " + vx.en);
    ok(vx.es2 && vx.es2 !== vx.es, tag + " dialogue has a second voice: " + vx.es2);
    if (region === "es") ok(/^es-ES/.test(vx.esLang) || !list.some((v) => v[0] === "es-ES" && !robot.test(v[1])), tag + " Spain region uses es-ES: " + vx.esLang);
    else ok(!/^es-ES/.test(vx.esLang), tag + " LatAm region avoids es-ES: " + vx.esLang);
    // every path: play button speak(), utter(), sayText
    const paths = await p.evaluate(() => { window.__said = []; window.__vxPaths(); return window.__said.map((x) => x.v); });
    ok(paths.length >= 3 && paths.every((v) => v === vx.es), tag + " every Spanish path uses " + vx.es + ": " + paths.join(" | "));
    console.log(tag.padEnd(14), "es:", vx.es, "· es2:", vx.es2, "· en:", vx.en);
    await p.close();
  }
  // tag-team split
  const p = await b.newPage(); await p.goto(URL + "#inicio"); await p.waitForTimeout(1200); await p.evaluate(() => window.__setName("Timar"));
  for (const [c, want] of CASES) { const got = await p.evaluate((t) => window.__tagSpeech(t).map(([x, es]) => (es ? "ES[" : "EN[") + x + "]").join(" "), c); ok(got === want, "split: " + c + "\n   got  " + got + "\n   want " + want); }
  // every praise phrase: the Spanish half to the Spanish voice, the English half to the English voice
  const tb = await p.evaluate(() => { const bad = []; Object.values(window.__TEACH()).forEach((l) => l.forEach((x) => { if (!Array.isArray(x)) return; const c = (y) => y.replace(/[^\p{L}\p{P}\s]/gu, "").trim(); if (window.__tagSpeech(c(x[0])).some((q) => !q[1])) bad.push(x[0]); if (window.__tagSpeech(c(x[1])).some((q) => q[1])) bad.push(x[1]); })); return bad; });
  ok(!tb.length, "praise phrases tagged right: " + tb.join(" | "));
  // spoken homophones: «por qué» heard for «porque» counts; typed answers keep their spelling
  const hz = await p.evaluate(() => [window.__spokenAs("por qué", "porque"), window.__spokenAs("si no", "No es rojo sino azul."), (window.__prTyped = 1, window.__spokenAs("por qué", "porque"))]);
  ok(hz[0] === "porque" && /sino/.test(hz[1]) && hz[2] === "por qué", "homophones: " + JSON.stringify(hz));
  // text clean-up
  const n = await p.evaluate(() => [window.__ttsNorm("**Ud.** → «usted» 🙂 (formal)", "es"), window.__ttsNorm("e.g. ser vs. estar", "en")]);
  ok(n[0] === "usted, usted, formal", "norm es: " + n[0]); ok(n[1] === "for example, ser versus estar", "norm en: " + n[1]);
  await b.close();
  console.log(fail ? fail + " FAILED" : "sVX OK"); process.exit(fail ? 1 : 0);
})();
