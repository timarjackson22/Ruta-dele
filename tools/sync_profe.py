"""Rebuild Profe's parts of index.html from the sources in tools/ without the full patch pipeline:
the capability registry (profe_registry.py → <script id="pv-registry">) and the voice layer (pvoice.js, embedded verbatim).
Usage: python3 tools/sync_profe.py index.html OLD_PVOICE_SNAPSHOT  (the pvoice.js text currently inside index.html)."""
import sys, re, json, subprocess, os, datetime
T = os.path.dirname(os.path.abspath(__file__))
p, old = sys.argv[1], sys.argv[2]
s = open(p, encoding="utf-8").read()
reg = subprocess.run([sys.executable, os.path.join(T, "profe_registry.py")], capture_output=True, text=True, check=True).stdout
json.loads(reg)
s, n = re.subn(r'(<script type="application/json" id="pv-registry">)[\s\S]*?(</script>)', lambda m: m.group(1) + reg.replace("</", "<\\/") + m.group(2), s, count=1)
assert n == 1, "registry block not found"
# English names for the listening and reading texts (natural-language aliases Profe matches against)
te = json.dumps(json.load(open(os.path.join(T, "title_en.json"), encoding="utf-8")), ensure_ascii=False)
if 'id="pv-titles"' in s: s = re.sub(r'(<script type="application/json" id="pv-titles">)[\s\S]*?(</script>)', lambda m: m.group(1) + te.replace("</", "<\\/") + m.group(2), s, count=1)
else: s = s.replace('<script type="application/json" id="pv-registry">', '<script type="application/json" id="pv-titles">' + te.replace("</", "<\\/") + '</script>\n<script type="application/json" id="pv-registry">', 1)
# the service gaps & costs dashboard (tools/costs): recomputed from gaps.json every time
subprocess.run([sys.executable, os.path.join(T, "costs", "model.py")], capture_output=True, text=True, check=True)
cd = json.dumps(json.load(open(os.path.join(T, "costs", "costs.json"), encoding="utf-8")), ensure_ascii=False)
if 'id="cost-data"' in s: s = re.sub(r'(<script type="application/json" id="cost-data">)[\s\S]*?(</script>)', lambda m: m.group(1) + cd.replace("</", "<\\/") + m.group(2), s, count=1)
else: s = s.replace('<script type="application/json" id="pv-registry">', '<script type="application/json" id="cost-data">' + cd.replace("</", "<\\/") + '</script>\n<script type="application/json" id="pv-registry">', 1)
o, new = open(old, encoding="utf-8").read(), open(os.path.join(T, "pvoice.js"), encoding="utf-8").read()
if o != new:
    assert s.count(o) == 1, "old pvoice.js not found verbatim in index.html"
    s = s.replace(o, new)
stamp = datetime.datetime.now(datetime.UTC).strftime("%Y%m%d%H%M")
s = re.sub(r'var BUILD = "\d+";', 'var BUILD = "%s";' % stamp, s)
# one build stamp everywhere: the page's two stamps and version.json must match, or the update check
# sees a "newer" version.json than the page and reloads for ever
s = re.sub(r'window.__BUILD = "\d+"', 'window.__BUILD = "%s"' % stamp, s)
import os
open(os.path.join(os.path.dirname(os.path.abspath(sys.argv[1])), "version.json"), "w").write('{"v":"%s"}' % stamp)
open(p, "w", encoding="utf-8").write(s)
print("synced registry (%d bytes) and pvoice.js (%s)" % (len(reg), "changed" if o != new else "unchanged"))
