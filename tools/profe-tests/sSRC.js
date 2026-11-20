// v242: every tools/patch_*.py must be a no-op on the current index.html. A stale source file (older than what the page
// holds) silently reverts newer work the next time someone re-embeds it — five were stale before v242.
const { execFileSync } = require("child_process"); const fs = require("fs"); const path = require("path");
const ROOT = path.join(__dirname, "..", ".."); const page = fs.readFileSync(path.join(ROOT, "index.html"), "utf8"); let bad = 0, n = 0;
for (const f of fs.readdirSync(path.join(ROOT, "tools")).filter((x) => /^patch_.*\.py$/.test(x)).sort()) {
  const tmp = "/tmp/ssrc-" + process.pid + ".html"; fs.writeFileSync(tmp, page); n++;
  try { execFileSync("python3", [path.join("tools", f), tmp], { cwd: ROOT, stdio: "ignore" }); } catch (e) {}
  if (fs.readFileSync(tmp, "utf8") !== page) { bad++; console.log("FAIL " + f + " would change index.html (its source is out of date)"); }
}
console.log(bad ? bad + " FAILED of " + n : "ALL " + n + " PASS (every embed source matches the page)"); process.exit(bad ? 1 : 0);
