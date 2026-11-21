// Photo-reader quality on real phone photos of book pages (curved, tilted, running header, facing page in the shot).
// The photos are NOT in the repo (copyrighted book): put them in OCR_PAGES (default /tmp/pages/p1.jpg … p5.jpg). Skips if absent.
// Library served locally like sOCR: OCR_LIB=/tmp/tj (tesseract.js 5.1.1 + core), /tmp/tdata (spa best_int).
const { chromium, devices } = require("playwright"); const fs = require("fs"); const path = require("path");
const LIB = process.env.OCR_LIB || "/tmp/tj", PG = process.env.OCR_PAGES || "/tmp/pages";
const files = fs.existsSync(PG) ? fs.readdirSync(PG).filter((f) => /^p\d\.jpg$/.test(f)).sort() : [];
if (!files.length) { console.log("SKIP no photos in " + PG); process.exit(0); }
(async () => {
  const b = await chromium.launch(); const c = await b.newContext({ ...devices["Pixel 7"], serviceWorkers: "block" });
  await c.route(/cdn\.jsdelivr\.net\/npm\/(tesseract\.js@[^/]+\/dist|tesseract\.js-core@[^/]+|@tesseract\.js-data\/spa@[^/]+\/4\.0\.0_best_int)\/(.+)$/, (route) => {
    const u = route.request().url(), m = u.match(/(tesseract\.js@[^/]+\/dist|tesseract\.js-core@[^/]+|@tesseract\.js-data\/spa@[^/]+\/4\.0\.0_best_int)\/([^?]+)/);
    const dir = /core/.test(m[1]) ? path.join(LIB, "core/package") : /data/.test(m[1]) ? "/tmp/tdata/package/4.0.0_best_int" : path.join(LIB, "package/dist");
    const f = path.join(dir, m[2]); if (!fs.existsSync(f)) return route.fulfill({ status: 404, body: "" });
    route.fulfill({ status: 200, body: fs.readFileSync(f), contentType: /\.wasm$/.test(f) ? "application/wasm" : "application/javascript", headers: { "access-control-allow-origin": "*" } }); });
  await c.route(/\/__pages\/(p\d\.jpg)$/, (r) => r.fulfill({ status: 200, body: fs.readFileSync(path.join(PG, r.request().url().match(/(p\d\.jpg)$/)[1])), contentType: "image/jpeg" }));
  const p = await c.newPage(); const errs = []; p.on("pageerror", (e) => errs.push(e.message));
  await p.goto("http://localhost:8766/#leer-add"); await p.waitForTimeout(1200);
  let fails = 0; const ok = (c, m) => { console.log((c ? "PASS " : "FAIL ") + m); if (!c) fails++; };
  for (const f of files) {
    const r = await p.evaluate(async (f) => { const bl = await (await fetch("/__pages/" + f)).blob(); try { return await window.__readPhotos([new File([bl], f, { type: "image/jpeg" })]); } catch (e) { return { err: e.message }; } }, f);
    if (r.err) { ok(false, f + " read: " + r.err); continue; }
    const all = r.blocks.join(" "), first = r.blocks[0] || "", words = all.split(/\s+/);
    const junk = words.filter((w) => w.length > 2 && /[^\p{L}\d.,;:¿?¡!«»"“”'’()—–-]/u.test(w)).length;
    ok(r.blocks.length >= 2 && r.blocks.length <= 10, f + ": paragraphs, not rows (" + r.blocks.length + ")");
    const head = first.split(/\s+/).slice(0, 8), caps = head.filter((w) => /^\p{Lu}{3,}[.,]?$/u.test(w)).length, pn = head.some((w) => /^\d{2,3}$/.test(w));
    ok(caps < 2 && !pn, f + ": running header and page number not kept as text («" + head.join(" ") + "»)");
    ok(junk <= words.length * 0.04, f + ": little junk (" + junk + "/" + words.length + ")");
    ok(!r.title || r.title.split(/\s+/).length <= 14, f + ": short title «" + (r.title || "") + "»");
  }
  ok(!errs.length, "No page errors " + errs.join(" | "));
  console.log(fails ? "FAILED " + fails : "ALL PASS"); await b.close(); process.exit(fails ? 1 : 0);
})();
