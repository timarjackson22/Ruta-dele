"""Bottom menu: shown only on hubs and lists (tools/MENU_BRIEF.md); every other page tucks it behind the arrow."""
import sys
p = sys.argv[1]; s = open(p, encoding="utf-8").read()
if "MENU_HUBS" in s: sys.exit("already patched")
def rep(a, b, n=1):
    global s
    assert s.count(a) == n, ("anchor", a[:90], s.count(a)); s = s.replace(a, b)
i = s.index('    document.body.classList.toggle("no-tabs", (typeof LI !== "undefined" && !!LI[h])'); j = s.index("\n", i)
s = s[:i] + '    document.body.classList.toggle("no-tabs", !MENU_HUBS.test(h));' + s[j:]
rep("  function uiNav() {", "  // the menu shows only where you pick where to go next; any other page (including new ones) tucks it\n  const MENU_HUBS = /^(|inicio|hoy|curso|practicar|biblioteca|repaso|escuchar|leer|escritura|verbos|gramatica|guias|palabras|examenes|recursos|esc|a1|a2|b1|b2|c1|c2|(a1|a2|b1|b2|c1|c2)-examenes)$/;\n  function uiNav() {")
rep('    document.body.classList.toggle("no-tabs", !!paper);', '    document.body.classList.toggle("no-tabs", !MENU_HUBS.test(location.hash.slice(1)));')
rep('    if (h === "ajustes") return ["#inicio", "Today"];', '    if (h === "ajustes" || h === "progreso" || h === "hoy") return ["#inicio", "Today"];\n    if (h === "drill") return ["#hoy", "Today’s session"];\n    if (/^palabra-/.test(h)) return ["#palabras", "Words"];\n    if (h === "examenes") return ["#practicar", "Practice"];')
open(p, "w", encoding="utf-8").write(s)
print("menu ok")
