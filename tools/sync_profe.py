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
o, new = open(old, encoding="utf-8").read(), open(os.path.join(T, "pvoice.js"), encoding="utf-8").read()
if o != new:
    assert s.count(o) == 1, "old pvoice.js not found verbatim in index.html"
    s = s.replace(o, new)
s = re.sub(r'var BUILD = "\d+";', 'var BUILD = "%s";' % datetime.datetime.now(datetime.UTC).strftime("%Y%m%d%H%M"), s)
open(p, "w", encoding="utf-8").write(s)
print("synced registry (%d bytes) and pvoice.js (%s)" % (len(reg), "changed" if o != new else "unchanged"))
