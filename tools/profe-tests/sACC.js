// v233 Spanish variety controls every voice: a LatAm learner never gets a Spain voice (and the reverse), even when the
// other variety's voice is better quality, a voice was picked earlier, or the phone has no voice for the chosen country.
const { chromium, devices } = require("playwright");
const URL = process.env.URL || "http://localhost:8766/";
const LISTS = {
  android: [["es-es-x-eee-network", "es-ES", 400], ["es-us-x-sfb-local", "es-US", 300], ["es-us-x-esd-network", "es-US", 300], ["en-us-x-sfg-network", "en-US", 400]],
  androidOnlySpain: [["es-es-x-eee-network", "es-ES", 400], ["en-us-x-sfg-network", "en-US", 400]],
  chrome: [["Google español", "es-ES"], ["Google español de Estados Unidos", "es-US"], ["Microsoft Dalia Online (Natural) - Spanish (Mexico)", "es-MX"], ["Microsoft Margarita Online (Natural) - Spanish (Panama)", "es-PA"], ["Google US English", "en-US"]],
};
(async () => {
  const b = await chromium.launch(); const R = []; const rec = (n, ok, i) => { R.push(!!ok); console.log((ok ? "PASS " : "FAIL ") + n + (ok ? "" : "  " + (i || ""))); };
  for (const [name, list] of Object.entries(LISTS)) {
    const c = await b.newContext({ ...devices["Pixel 7"], serviceWorkers: "block" });
    await c.addInitScript((L) => { const V = L.map(([n, l, q]) => ({ name: n, lang: l, quality: q, localService: false, voiceURI: n, default: false }));
      try { Object.defineProperty(speechSynthesis, "getVoices", { value: () => V }); } catch (e) {} }, list);
    const p = await c.newPage(); await p.goto(URL + "#ajustes"); await p.waitForTimeout(1200);
    const set = async (acc, pick) => p.evaluate(([a, pk]) => { const b = document.querySelector('[data-act="accent"][data-v="' + a + '"]'); b && b.click();
      const t = JSON.parse(localStorage.getItem("ruta-dele-tutor-v1") || "{}"); if (pk !== undefined) { t.pvEs = pk; localStorage.setItem("ruta-dele-tutor-v1", JSON.stringify(t)); } return true; }, [acc, pick]);
    const look = () => p.evaluate(() => { const a = window.__acc(); const u = window.__vx ? null : null; return a; });
    for (const acc of ["es-419", "es-MX", "es-PA", "es-CO", "es-ES"]) {
      await set(acc); await p.waitForTimeout(200); const a = await look();
      const v1 = (a.voice || "").split(" ").pop(), v2 = (a.voice2 || "").split(" ").pop(), latam = acc !== "es-ES";
      const ok1 = name === "androidOnlySpain" && latam ? true : latam ? !/^es-ES$/i.test(v1) : /^es-ES$/i.test(v1);
      const okT = latam ? !/es-ES/i.test(a.tts) : a.tts === "es-ES";
      rec(name + " · " + acc + ": Profe's voice and fallback language are " + (latam ? "Latin American" : "from Spain"), ok1 && okT && (!v2 || name === "androidOnlySpain" || latam === !/^es-ES$/i.test(v2) || list.filter((x) => /^es/.test(x[1]) && (latam ? x[1] !== "es-ES" : x[1] === "es-ES")).length < 2), JSON.stringify(a));
      rec(name + " · " + acc + ": the mic asks the phone for a Spanish it really has (" + (latam ? "es-US" : "es-ES") + ")", a.lang === (latam ? "es-US" : "es-ES"), a.lang);
      if (name === "chrome" && (acc === "es-MX" || acc === "es-PA")) rec(name + " · " + acc + ": the country's own voice is used when the phone has one", new RegExp(acc).test(a.voice || ""), a.voice);
    }
    // a Spain voice picked in the past does not override Latin America
    await set("es-ES", list[0][0]); await set("es-PA"); await p.reload(); await p.waitForTimeout(1000);
    const a2 = await look(); rec(name + ": a Spain voice picked earlier is ignored while the variety is Latin America", name === "androidOnlySpain" || !/es-ES$/.test(a2.voice || ""), JSON.stringify(a2));
    await c.close();
  }
  // v235: Profe's voice matches Profe's look (woman's voice for Ana, man's for Luis), in Spanish and English; told when impossible
  { const c = await b.newContext({ ...devices["Pixel 7"], serviceWorkers: "block" });
    const L = [["es-us-x-esc-network", "es-US", 400], ["es-us-x-esd-network", "es-US", 400], ["es-es-x-eed-network", "es-ES", 500], ["en-us-x-sfg-network", "en-US", 400], ["en-us-x-iom-network", "en-US", 400]];
    await c.addInitScript((L) => { const V = L.map(([n, l, q]) => ({ name: n, lang: l, quality: q, localService: false, voiceURI: n, default: false })); try { Object.defineProperty(speechSynthesis, "getVoices", { value: () => V }); } catch (e) {} }, L);
    const p = await c.newPage(); await p.goto(URL + "#ajustes"); await p.waitForTimeout(1000);
    for (const [look, g] of [["p:luis", "m"], ["p:ana", "f"], ["p:mateo", "m"], ["p:carmen", "f"]]) {
      const m = await p.evaluate(([k]) => { const t = JSON.parse(localStorage.getItem("ruta-dele-tutor-v1") || "{}"); t.pav = k; delete t.pvEs; localStorage.setItem("ruta-dele-tutor-v1", JSON.stringify(t)); return true; }, [look]);
      await p.reload(); await p.waitForTimeout(900); await p.evaluate(() => { const b = document.querySelector('[data-act="accent"][data-v="es-PA"]'); b && b.click(); });
      const r = await p.evaluate(() => window.__pvVoiceMatch()); rec("Look " + look + ": Spanish and English voices are a " + (g === "m" ? "man's" : "woman's") + ", Latin American", r.esG === g && r.enG === g && r.m === "ok" && /es-us/.test(r.es), JSON.stringify(r));
    }
    // only women's Spanish voices on this phone + a man's look → said, not hidden
    await c.close(); const c2 = await b.newContext({ ...devices["Pixel 7"], serviceWorkers: "block" });
    await c2.addInitScript(() => { const V = [["es-us-x-esc-network", "es-US"], ["en-us-x-iom-network", "en-US"]].map(([n, l]) => ({ name: n, lang: l, localService: false, voiceURI: n, default: false })); try { Object.defineProperty(speechSynthesis, "getVoices", { value: () => V }); } catch (e) {} localStorage.setItem("ruta-dele-tutor-v1", JSON.stringify({ pav: "p:luis" })); });
    const p2 = await c2.newPage(); await p2.goto(URL + "#inicio"); await p2.waitForTimeout(900);
    const r2 = await p2.evaluate(() => window.__pvVoiceMatch()); rec("No man's Spanish voice on the phone: the mismatch is reported, not silent", r2.m === "mismatch", JSON.stringify(r2)); await c2.close(); }
  await b.close(); const bad = R.filter((x) => !x).length; console.log(bad ? bad + " FAILED of " + R.length : "ALL " + R.length + " PASS"); process.exit(bad ? 1 : 0);
})();
