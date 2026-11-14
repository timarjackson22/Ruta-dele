// D. the app's own (rule-based) correction layer: real mistakes must be corrected, correct and regional Spanish left alone
const { open } = require("./h.js");
const BAD = [ // [learner, a correct form that must appear]
  ["Yo quiere reservar una habitación", "quiero"], ["Ayer yo voy al mercado con mi madre", "fui"], ["La problema es muy grande", "el problema"],
  ["Tengo treinta años viejo", "tengo treinta años"], ["Soy cansado hoy", "estoy cansado"], ["Pienso de mi familia mucho", "pienso en"],
  ["Yo gusto el café", "me gusta"], ["Los niños es muy simpáticos", "son"], ["Ella es una chica muy simpático", "simpática"],
  ["Mañana yo voy a comí en casa", "comer"], ["Yo soy de acuerdo contigo", "estoy de acuerdo"], ["Hace dos años que vivo aquí desde 2020", null],
  ["Las casas es grandes", "son"], ["Nosotros vamos a la playa ayer", "fuimos"], ["Quiero que tú vienes mañana", "vengas"],
];
const GOOD = [
  "Ayer fui al mercado con mi madre", "Me gusta mucho el café", "Estoy cansado hoy", "Tengo treinta años", "Vosotros tenéis razón",
  "Ustedes tienen razón", "Voy a manejar el carro al trabajo", "Cogí el autobús esta mañana", "Ahorita vengo", "Quiero que vengas mañana",
  "Los niños son muy simpáticos", "Pienso en mi familia", "Estoy de acuerdo contigo", "Vos tenés razón",
];
(async () => {
  const H = await open(); const res = { caught: 0, missed: [], false: [] };
  await H.p.evaluate(() => { window.__L.def = { text: "Vale, entiendo. ¿Y luego? [[·]]", delay: 60, wordMs: 5 }; });
  const turn = async (t) => { await H.p.click('[data-act="t-new"]').catch(() => {}); await H.wait(200); await H.type(t); await H.idle(6000); await H.wait(600); const all = await H.p.evaluate(() => [...document.querySelectorAll("#t-msgs > *")].map((x) => x.innerText.replace(/\s+/g, " ").trim())); const k = all.findIndex((x) => x.includes(""));  return all.slice(1).join(" ⏐ "); };
  for (const [s, want] of BAD) {
    const out = (await turn(s)).toLowerCase();
    const hit = want ? out.includes(want) : /\*\*|→|instead|better|corr/i.test(out);
    if (hit) res.caught++; else res.missed.push(s + "  (want «" + want + "»)  got: " + out.slice(0, 160));
  }
  for (const s of GOOD) {
    const out = await turn(s);
    if (/→|✗|not quite|casi|instead of|should be|we say|use «|correct(ed)? (form|version)/i.test(out)) res.false.push(s + "  got: " + out.slice(0, 200));
  }
  console.log("mistakes caught by the app's own checker:", res.caught + "/" + BAD.length);
  res.missed.forEach((m) => console.log("  MISSED " + m));
  console.log("correct/regional Spanish wrongly corrected:", res.false.length + "/" + GOOD.length);
  res.false.forEach((m) => console.log("  FALSE " + m));
  console.log(H.errs); await H.close();
})();
