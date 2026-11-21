// v262: «Add your own» › Photos of pages: a photo of a book page becomes a text in My texts, read on the phone (Tesseract.js).
// The test serves the same library files locally (jsDelivr is not reachable here):
//   OCR_LIB=/path with tesseract.js/ (dist), core/ (tesseract.js-core) and spa/ (spa.traineddata.gz)
const { chromium, devices } = require("playwright"); const fs = require("fs"); const path = require("path");
const URL = process.env.URL || "http://localhost:8766/", LIB = process.env.OCR_LIB || "/tmp/tj", IMG = process.env.OCR_IMG || "/tmp/page.jpg";
(async () => {
  const b = await chromium.launch(); const c = await b.newContext({ ...devices["Pixel 7"], serviceWorkers: "block" });
  const R = []; const rec = (n, ok, i) => { R.push(!!ok); console.log((ok ? "PASS " : "FAIL ") + n + (ok ? "" : "  " + (i || ""))); };
  await c.route(/cdn\.jsdelivr\.net\/npm\/(tesseract\.js@[^/]+\/dist|tesseract\.js-core@[^/]+|@tesseract\.js-data\/spa@[^/]+\/4\.0\.0_best_int)\/(.+)$/, (route) => {
    const u = route.request().url(), m = u.match(/(tesseract\.js@[^/]+\/dist|tesseract\.js-core@[^/]+|@tesseract\.js-data\/spa@[^/]+\/4\.0\.0_best_int)\/([^?]+)/);
    const dir = /core/.test(m[1]) ? path.join(LIB, "core/package") : /data/.test(m[1]) ? "/tmp/tdata/package/4.0.0_best_int" : path.join(LIB, "package/dist");
    const f = path.join(dir, m[2]); if (!fs.existsSync(f)) return route.fulfill({ status: 404, body: "" });
    route.fulfill({ status: 200, body: fs.readFileSync(f), contentType: /\.wasm$/.test(f) ? "application/wasm" : /\.js$/.test(f) ? "application/javascript" : "application/octet-stream", headers: { "access-control-allow-origin": "*" } });
  });
  const p = await c.newPage(); const er = []; p.on("pageerror", (e) => er.push(e.message));
  await p.goto(URL + "#leer-add"); await p.waitForTimeout(1200);
  rec("Add your own has Paste / Photos / PDF or file / Link", await p.evaluate(() => ["paste", "photo", "file", "link"].every((v) => !!document.querySelector('[data-act="my-tab"][data-v="' + v + '"]'))));
  await p.click('[data-act="my-tab"][data-v="photo"]'); await p.waitForTimeout(300);
  rec("Photos: take a photo (camera) or choose several", await p.evaluate(() => { const a = document.getElementById("my-cam"), m = document.getElementById("my-pics"); return a && a.getAttribute("capture") === "environment" && m && m.multiple; }));
  await p.setInputFiles("#my-pics", IMG); await p.waitForTimeout(200);
  rec("The chosen photo is listed", await p.evaluate(() => /1 photo ready/.test(document.getElementById("my-picl").textContent)));
  await p.click('[data-act="my-import"]');
  let hash = ""; for (let i = 0; i < 90 && !/^#my-/.test(hash); i++) { await p.waitForTimeout(1000); hash = await p.evaluate(() => location.hash); }
  const got = await p.evaluate(() => ({ h: location.hash, title: (document.querySelector("#litem h1, .lhead h1") || {}).textContent || "", text: (document.getElementById("ltext") || {}).innerText || "", err: (document.getElementById("my-err") || {}).textContent || "" }));
  rec("The photo becomes a reading in My texts (text recognised on the phone)", /^#my-/.test(got.h) && /abuela/i.test(got.text + got.title) && /mercado/i.test(got.text), JSON.stringify(got).slice(0, 400));
  rec("Paragraphs are joined, not one line per row", /pueblo pequeño cerca de la montaña/i.test(got.text.replace(/\s+/g, " ")), got.text.slice(0, 200));
  await p.goto(URL + "#leer"); await p.waitForTimeout(1200);
  rec("It is listed under My texts at the bottom of Read & Listen", await p.evaluate(() => !!document.querySelector('#rl-mine a.lh-row[href^="#my-"]')));
  rec("No page errors", !er.length, er.join(" | "));
  await b.close(); const f = R.filter((x) => !x).length; console.log(f ? f + " FAILED of " + R.length : "ALL " + R.length + " PASS"); process.exit(f ? 1 : 0);
})();
