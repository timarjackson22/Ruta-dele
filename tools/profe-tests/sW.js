// W. One verb or one dictionary word by name (round 3, 15 Nov 2026)
const { open } = require("./h.js");
const R = []; const rec = (n, ok, info) => { R.push(!!ok); console.log((ok ? "PASS " : "FAIL ") + n + (!ok && info != null ? "  " + String(info).slice(0, 300) : "")); };
(async () => {
  const H = await open({ hash: "#inicio", noOpen: true }); const p = H.p;
  const go = async (t, want) => { await p.evaluate(() => { location.hash = "#inicio"; }); await H.wait(700); await p.evaluate((t) => window.__pv.route(t, "chat"), t); if (want) await p.waitForFunction((w) => location.hash === w, want, { timeout: 6000 }).catch(() => {}); else await H.wait(1500); await H.wait(700); return p.evaluate(() => ({ h: decodeURIComponent(location.hash), last: window.__pvLast, txt: (document.querySelector("main h1") || {}).textContent || "" })); };
  let r = await go("open the verb comer"); rec("“open the verb comer” opens comer", /^#verbo-\d+$/.test(r.h) && /comer/i.test(r.txt), JSON.stringify(r));
  r = await go("show me the verb tengo"); rec("A form («tengo») opens tener", /tener/i.test(r.txt), JSON.stringify(r));
  r = await go("open the verb to eat"); rec("English (“the verb to eat”) opens comer", /comer/i.test(r.txt), JSON.stringify(r));
  r = await go("abre el verbo hablar"); rec("«abre el verbo hablar» opens hablar", /hablar/i.test(r.txt), JSON.stringify(r));
  r = await go("open the verb comr"); rec("A misheard verb («comr») offers the closest ones", r.h === "#inicio" && /Did you mean/.test((r.last || {}).say || "") && /comer/.test((r.last || {}).say || ""), JSON.stringify(r));
  r = await go("open the word casa", "#palabra-casa"); rec("“open the word casa” opens its dictionary page", r.h === "#palabra-casa", JSON.stringify(r));
  r = await go("look up perro in the dictionary", "#palabra-perro"); rec("“look up perro in the dictionary” opens perro", r.h === "#palabra-perro", JSON.stringify(r));
  r = await go("show me the word for dog"); rec("“the word for dog” opens perro", r.h === "#palabra-perro", JSON.stringify(r));
  r = await go("open the word xqzt"); rec("A word that doesn't exist: says so, doesn't open a page", r.h === "#inicio" && !(r.last || {}).ok || /Did you mean/.test((r.last || {}).say || ""), JSON.stringify(r));
  rec("No page errors", !H.errs.length, H.errs.join(" | "));
  await H.close();
  console.log(R.every(Boolean) ? "ALL " + R.length + " PASS" : R.filter((x) => !x).length + " FAILED of " + R.length);
})();
