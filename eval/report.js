// Merges the shard results into report.md and summary.json
const fs = require("fs"), dir = process.argv[2] || "out";
const R = fs.readdirSync(dir).filter((f) => /^results-\d+\.json$/.test(f)).flatMap((f) => JSON.parse(fs.readFileSync(dir + "/" + f, "utf8")));
let turns = 0, clean = 0; const flagCount = {}; const secs = [];
R.forEach((r) => r.conv.forEach((c) => { turns++; if (!c.flags.length) clean++; secs.push(c.secs); c.flags.forEach((f) => { const k = f.split(":")[0]; flagCount[k] = (flagCount[k] || 0) + 1; }); }));
secs.sort((a, b) => a - b);
const sum = { model: process.env.MODEL_NAME || "", scenarios: R.length, turns, clean, score: turns ? Math.round((clean / turns) * 1000) / 10 : 0, flags: flagCount, medianSecs: secs[Math.floor(secs.length / 2)] || 0 };
let md = "# Profe eval — " + sum.score + "% clean turns (" + clean + "/" + turns + ")\n\nFlags: " + JSON.stringify(flagCount) + " · median reply time on the runner " + sum.medianSecs + " s\n\n";
R.forEach((r) => {
  md += "## " + r.id + " (" + r.lvl + ")" + (r.note ? " — " + r.note : "") + "\n\n";
  r.conv.forEach((c) => { md += "**Learner:** " + c.u + "\n\n**Profe:** " + c.reply.replace(/\n+/g, " ⏎ ") + "\n\n" + (c.fix ? "_Card:_ " + c.fix.replace(/\n+/g, " · ") + "\n\n" : "") + (c.flags.length ? "⚠️ " + c.flags.join(", ") + "\n\n" : "") ; });
  if (r.errs.length) md += "Page errors: " + r.errs.join("; ") + "\n\n";
});
fs.writeFileSync(dir + "/report.md", md); fs.writeFileSync(dir + "/summary.json", JSON.stringify(sum, null, 1));
console.log(JSON.stringify(sum));
