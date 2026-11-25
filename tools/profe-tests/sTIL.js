// v298 — «tilde» → «accent» in English, clear pronunciation drills, punctuation names in A1 unit 1.
// 1. No English sentence calls the accent a «tilde» (Spanish «lleva tilde», «sin tilde» … stay: that is correct Spanish).
// 2. Pronunciation drills send real words to the voice: «Which word do you hear?» uses real stress pairs, never a made-up
//    stress; «Split into syllables» is a choice of whole splits; «Which syllable is stressed?» shows the word.
// 3. The voice never reads grammar notes or Roman numerals letter by letter («+ inf», «siglo XX», «DELE»).
// 4. A1 unit 1 has «Punctuation and written signs» with the Spanish names (and the «» quote marks visible).
const fs = require("fs"), path = require("path");
const { open } = require("./h.js");
(async () => {
  const R = []; const rec = (n, ok, i) => { R.push(!!ok); console.log((ok ? "PASS " : "FAIL ") + n + (ok ? "" : "  " + String(i || "").slice(0, 400))); };
  const html = fs.readFileSync(path.join(__dirname, "../../index.html"), "utf8");
  const en = html.split("\n").filter((l) => !/SK_INSTR|\.test\(/.test(l)).join("\n").match(/\b(a|has a|have a|needs a|need a|with a|without a|no|the|its|their|carry a|carries a|takes a|missing the)\s+tildes?\b/gi) || [];
  rec("No English «a tilde / no tilde / the tilde …» left in the course", en.length === 0, en.slice(0, 8).join(" | "));
  const H = await open({ hash: "#inicio", noOpen: true }); const p = H.p;
  const D = await p.evaluate(() => { const ids = [...new Set(window.__sk.audit().map((x) => x.id))], out = { ws: [], sy: [], st: [] };
    ids.forEach((id) => window.__sk.topic(id).secs.forEach((s, si) => ["bank", "s1"].forEach((seed) => window.__sk.bank(id, si, seed).forEach((d) => {
      if (d.type === "whichsound") out.ws.push(d); if (d.type === "syll") out.sy.push(d); if (d.type === "stress") out.st.push(d); })))); return out; });
  rec("«Which word do you hear?»: every drill is a pair of real words with meanings (no made-up stress)", D.ws.length > 50 && D.ws.every((d) => Array.isArray(d.pair) && d.pair.length >= 2 && d.pair.every((x) => x[0] && x[1]) && d.k >= 0 && d.k < d.pair.length), D.ws.length + " " + JSON.stringify(D.ws.find((d) => !d.pair)));
  rec("«Split into syllables»: three whole splits, the right one among them", D.sy.length > 50 && D.sy.every((d) => d.opts && d.opts.length === 3 && d.opts.includes(d.ans) && new Set(d.opts).size === 3), JSON.stringify(D.sy.find((d) => !(d.opts && d.opts.length === 3 && d.opts.includes(d.ans)))));
  const tn = await p.evaluate(() => ["nada más + inf", "el siglo XX", "Estudio para aprobar el DELE.", "ingeniero / ingeniera"].map((t) => window.__utter(t, "es", 0.85).text));
  rec("Speech clean-up: «+ inf» dropped, «siglo XX» → veinte, «DELE» said as a word, «/» → o", tn[0] === "nada más" && tn[1] === "el siglo veinte" && /Dele/.test(tn[2]) && tn[3] === "ingeniero o ingeniera", JSON.stringify(tn));
  // the quick drill's Pronunciation focus, screen by screen
  await p.evaluate(() => { window.__said = []; const o = speechSynthesis.speak.bind(speechSynthesis); speechSynthesis.speak = (u) => { window.__said.push(u.text); try { o(u); } catch (e) {} }; location.hash = "#drill"; }); await H.wait(900);
  await p.click('[data-act="qd-f"][data-v="pro"]'); await H.wait(600);
  const seen = []; for (let i = 0; i < 10; i++) {
    const r = await p.evaluate(() => { const q = (document.querySelector("#app .drq") || {}).textContent || ""; window.__said = []; const b = document.querySelector('#app [data-act="sk-play"]'); if (b) b.click(); return q; }); await H.wait(120);
    const said = await p.evaluate(() => window.__said.slice()); seen.push([r, said.join("|")]);
    await p.evaluate(() => { const A = [...document.querySelectorAll("#app [data-act]")]; const s = A.find((x) => x.dataset.act === "sk-skip"); if (s) s.click(); }); await H.wait(200);
    await p.evaluate(() => { const A = [...document.querySelectorAll("#app [data-act]")]; const s = A.find((x) => /^(sk-next|qd-next)$/.test(x.dataset.act)); if (s) s.click(); }); await H.wait(300); }
  const bad = seen.filter(([q, s]) => /Which pronunciation|Tap between the letters/.test(q) || /[A-ZÁÉÍÓÚ]{2,}|[áéíóú][a-zñ]*[áéíóú]/.test(s));
  rec("Quick drill › Pronunciation: no old drills, every spoken text a real word or sentence", seen.length >= 8 && !bad.length, JSON.stringify(bad.length ? bad : seen));
  rec("«Which syllable is stressed?» shows the word", await p.evaluate(() => { const ids = window.__sk.audit().filter((x) => /stress/.test(x.types)); return ids.length > 0; }) && /Which syllable is stressed in/.test(fs.readFileSync(path.join(__dirname, "../skilldrills.js"), "utf8")));
  // punctuation block
  await p.evaluate(() => { location.hash = "#a1-u1"; }); await H.wait(1500);
  const pu = await p.evaluate(() => { const secs = window.__sk.topic("a1-u1").secs.map((x) => x.name); const t = [...document.querySelectorAll("table")].find((x) => /las comillas/.test(x.textContent)); const row = t && [...t.querySelectorAll("tr")].find((r) => /las comillas/.test(r.textContent));
    return { secs, has: !!t, names: t ? ["la tilde", "la diéresis", "la eñe", "el punto", "la coma", "los dos puntos", "los signos de interrogación", "la raya", "la arroba"].filter((n) => !t.textContent.includes(n)) : null, quotes: row ? row.textContent : "" }; });
  rec("A1 unit 1: «Punctuation and written signs» with the Spanish names; «» visible in the quote-marks row", pu.secs.includes("Punctuation and written signs (los signos)") && pu.has && pu.names.length === 0 && /«»/.test(pu.quotes), JSON.stringify(pu));
  rec("No page errors", !H.errs.length, H.errs.join(" | "));
  await H.close(); const f = R.filter((x) => !x).length; console.log(f ? f + " FAILED of " + R.length : "ALL " + R.length + " PASS"); process.exit(f ? 1 : 0);
})().catch((e) => { console.log("CRASH", e.message); process.exit(1); });
