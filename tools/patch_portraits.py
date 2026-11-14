"""Profe's picture: illustrated portrait headshots (drawn as SVG, so they're crisp at every size and work offline)
replace the emoji choices. The monogram stays. Old emoji choices map to a portrait automatically."""
import sys
p = sys.argv[1]; s = open(p, encoding="utf-8").read()
if "PV_PORTRAITS" in s: sys.exit("already patched")
def rep(a, b, n=1):
    global s
    assert s.count(a) == n, ("anchor", a[:90], s.count(a)); s = s.replace(a, b)
JS = r'''
  /* ---------- Profe's portraits ---------- */
  const PV_PORTRAITS = {
    "p:ana":    { n: "Ana",    skin: "#c98b62", hair: "#2b1a12", style: "long",  bg: "#dbe7f7", shirt: "#1f4fa3", lips: "#a2554e" },
    "p:luis":   { n: "Luis",   skin: "#b7774d", hair: "#1d1410", style: "short", beard: 1, bg: "#e6f1e8", shirt: "#2c7449", lips: "#8e4b40" },
    "p:sofia":  { n: "Sofía",  skin: "#8a5a3b", hair: "#1a110c", style: "curly", bg: "#f6e3d3", shirt: "#b0365e", lips: "#7c3b33" },
    "p:diego":  { n: "Diego",  skin: "#e2b28d", hair: "#5a3a22", style: "side",  glasses: 1, bg: "#ece4f6", shirt: "#3b3f4a", lips: "#a8625a" },
    "p:carmen": { n: "Carmen", skin: "#e8bf9c", hair: "#b9b4ad", style: "bob",   glasses: 1, bg: "#f7ecd2", shirt: "#7d2c82", lips: "#b06a63" },
    "p:mateo":  { n: "Mateo",  skin: "#6e4630", hair: "#120c09", style: "buzz",  bg: "#d7eef0", shirt: "#11627a", lips: "#6a3229" },
  };
  const PV_OLD = { "👩🏽‍🏫": "p:ana", "👨🏽‍🏫": "p:luis", "🧑🏽‍🎓": "p:mateo" };
  function portrait(k, uid) {
    const o = PV_PORTRAITS[k]; if (!o) return ""; const id = "pp" + (uid || k.slice(2));
    const shade = (hex, f) => { const n = parseInt(hex.slice(1), 16), c = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => Math.max(0, Math.min(255, Math.round(v * f)))); return "#" + c.map((v) => v.toString(16).padStart(2, "0")).join(""); };
    const sk = o.skin, skD = shade(sk, 0.82), skL = shade(sk, 1.12), hr = o.hair, hrL = shade(hr, 1.5);
    const back = { long: '<path d="M27 46C26 25 37 15 50 15s24 10 23 31l2 30c-8-5-15-7-25-7s-17 2-25 7z" fill="' + hr + '"/>', bob: '<path d="M27 47C26 26 37 16 50 16s24 10 23 31v9c0 4-3 7-7 6l-4-1H38l-4 1c-4 1-7-2-7-6z" fill="' + hr + '"/>', curly: [[30, 30], [37, 21], [47, 17], [58, 18], [67, 24], [72, 34], [29, 41], [73, 44], [28, 52], [74, 54], [31, 61], [70, 62]].map(([x, y]) => '<circle cx="' + x + '" cy="' + y + '" r="8" fill="' + hr + '"/>').join("") }[o.style] || "";
    const front = {
      long: '<path d="M31 42c1-14 9-21 20-21 11 0 18 7 18 21-5-8-12-12-20-11-8 0-14 4-18 11z" fill="' + hr + '"/><path d="M38 27c5-3 11-4 17-2" stroke="' + hrL + '" stroke-width="1.2" fill="none" opacity=".5"/>',
      bob: '<path d="M30 45c0-15 8-24 20-24 12 0 20 9 20 24-3-7-6-10-10-12-6 3-15 4-24 1-3 3-5 6-6 11z" fill="' + hr + '"/>',
      curly: '<path d="M32 40c2-12 9-18 18-18s16 6 18 18c-4-6-10-9-18-9s-14 3-18 9z" fill="' + hr + '"/>' + [[38, 27], [46, 23], [55, 23], [63, 28]].map(([x, y]) => '<circle cx="' + x + '" cy="' + y + '" r="5.5" fill="' + hr + '"/>').join(""),
      short: '<path d="M31 43c-2-15 7-24 19-24 13 0 21 9 19 24-2-7-5-11-9-12-6-3-15-3-21 0-4 2-7 6-8 12z" fill="' + hr + '"/>',
      side: '<path d="M31 44c-2-16 7-25 20-25 12 0 20 8 18 23-3-6-6-9-10-10-9-1-17 1-22 5-3 2-5 4-6 7z" fill="' + hr + '"/><path d="M40 26c7-3 15-3 22 1" stroke="' + hrL + '" stroke-width="1.3" fill="none" opacity=".45"/>',
      buzz: '<path d="M32 40c0-12 8-19 18-19s18 7 18 19c-3-6-9-9-18-9s-15 3-18 9z" fill="' + hr + '" opacity=".92"/>',
    }[o.style] || "";
    const beard = o.beard ? '<path d="M33 49c1 10 7 18 17 18s16-8 17-18c-2 5-5 7-8 7-3-2-6-3-9-3s-6 1-9 3c-3 0-6-2-8-7z" fill="' + hr + '" opacity=".9"/>' : "";
    const glasses = o.glasses ? '<g fill="none" stroke="#2d2a28" stroke-width="1.4"><rect x="37.5" y="42" width="10" height="7.5" rx="3"/><rect x="52.5" y="42" width="10" height="7.5" rx="3"/><path d="M47.5 45h5M37.5 44.5l-4-1M62.5 44.5l4-1"/></g>' : "";
    return '<svg class="pp" viewBox="12 10 76 76" aria-hidden="true"><defs><radialGradient id="' + id + 's" cx="42%" cy="36%" r="70%"><stop offset="0" stop-color="' + skL + '"/><stop offset="1" stop-color="' + skD + '"/></radialGradient><clipPath id="' + id + 'c"><circle cx="50" cy="50" r="50"/></clipPath></defs><g clip-path="url(#' + id + 'c)">' +
      '<rect width="100" height="100" fill="' + o.bg + '"/>' + back +
      '<path d="M12 100c2-17 15-27 38-27s36 10 38 27z" fill="' + o.shirt + '"/><path d="M41 73l9 11 9-11" fill="' + shade(o.shirt, 0.75) + '"/>' +
      '<path d="M43 58h14v13c-4 4-10 4-14 0z" fill="' + skD + '"/>' +
      '<ellipse cx="31.5" cy="47" rx="3.2" ry="4.6" fill="' + skD + '"/><ellipse cx="68.5" cy="47" rx="3.2" ry="4.6" fill="' + skD + '"/>' +
      '<ellipse cx="50" cy="44" rx="18.5" ry="22" fill="url(#' + id + 's)"/>' + front +
      '<path d="M39.5 40.5q3.5-2 7 0M53.5 40.5q3.5-2 7 0" stroke="' + shade(hr, 0.9) + '" stroke-width="1.6" fill="none" stroke-linecap="round"/>' +
      '<ellipse cx="43" cy="45.5" rx="1.9" ry="2.1" fill="#2a1d17"/><ellipse cx="57" cy="45.5" rx="1.9" ry="2.1" fill="#2a1d17"/><circle cx="43.6" cy="44.8" r=".55" fill="#fff"/><circle cx="57.6" cy="44.8" r=".55" fill="#fff"/>' +
      '<path d="M50 47.5c-.6 3-1.6 5-2.6 6 1.4.8 3.8.8 5.2 0" stroke="' + skD + '" stroke-width="1.2" fill="none" stroke-linecap="round"/>' +
      '<circle cx="40" cy="53" r="3.4" fill="#e26d5c" opacity=".14"/><circle cx="60" cy="53" r="3.4" fill="#e26d5c" opacity=".14"/>' +
      beard + '<path d="M44.5 57.5q5.5 4 11 0" stroke="' + o.lips + '" stroke-width="1.8" fill="none" stroke-linecap="round"/>' + glasses +
      "</g></svg>";
  }
  const pvKey = () => { const a = TS.pav || "P"; return PV_PORTRAITS[a] ? a : PV_OLD[a] || "P"; };
'''
rep("  function pAvatar(big) {", JS + "  function pAvatar(big) {")
rep('''    const a = TS.pav || "P", c = TS.pcol || "";
    return '<span class="av a pav' + (big ? " big" : "") + '" aria-hidden="true"' + (c ? ' style="background:' + c + ';color:#fff"' : "") + ">" + esc(a === "P" ? pName()[0].toUpperCase() : a) + "</span>";''',
    '''    const a = pvKey(), c = TS.pcol || "";
    if (PV_PORTRAITS[a]) return '<span class="av a pav photo' + (big ? " big" : "") + '" aria-hidden="true">' + portrait(a, "m" + Math.random().toString(36).slice(2, 7)) + "</span>";
    return '<span class="av a pav' + (big ? " big" : "") + '" aria-hidden="true"' + (c ? ' style="background:' + c + ';color:#fff"' : "") + ">" + esc(pName()[0].toUpperCase()) + "</span>";''')
rep('''PV_AVATARS.map(([a, n]) => '<button class="pvb" data-act="pv-av" data-v="' + esc(a) + '" aria-pressed="' + ((TS.pav || "P") === a) + '" aria-label="' + n + '">' + esc(a === "P" ? pName()[0].toUpperCase() : a) + "</button>").join("")''',
    '''[["P", "Letter"]].concat(Object.keys(PV_PORTRAITS).map((k) => [k, PV_PORTRAITS[k].n])).map(([a, n]) => '<button class="pvb' + (a === "P" ? "" : " photo") + '" data-act="pv-av" data-v="' + esc(a) + '" aria-pressed="' + (pvKey() === a) + '" aria-label="' + n + '" title="' + n + '">' + (a === "P" ? esc(pName()[0].toUpperCase()) : portrait(a, "b" + a.slice(2))) + "</button>").join("")''')
rep('''  function fabLook() { const f = document.getElementById("tutor-fab"); if (!f) return; const sp = f.querySelector("span"); if (sp) { sp.textContent = (TS.pav || "P") === "P" ? pName()[0].toUpperCase() : TS.pav; if (TS.pcol) { sp.style.background = TS.pcol; sp.style.color = "#fff"; } }''',
    '''  function fabLook() { const f = document.getElementById("tutor-fab"); if (!f) return; const sp = f.querySelector("span"); if (sp) { const k = pvKey(); if (PV_PORTRAITS[k]) { sp.innerHTML = portrait(k, "fab"); sp.classList.add("photo"); sp.style.background = "transparent"; } else { sp.classList.remove("photo"); sp.textContent = pName()[0].toUpperCase(); if (TS.pcol) { sp.style.background = TS.pcol; sp.style.color = "#fff"; } } }''')
CSS = r'''
/* Profe portraits */
.pav.photo, .pvb.photo, .tutor-fab span.photo { padding: 0; overflow: hidden; background: transparent !important }
.pp { width: 100%; height: 100%; display: block; border-radius: 50% }
.pvb.photo { width: 52px; height: 52px; border-width: 2px }
.pvb.photo[aria-pressed="true"] { border-color: var(--cobalt); box-shadow: 0 0 0 3px color-mix(in srgb, var(--cobalt) 30%, transparent) }
.pvrow { gap: 10px }
'''
k = s.rindex("</style>", 0, s.index("</head>")); s = s[:k] + CSS + s[k:]
open(p, "w", encoding="utf-8").write(s)
print("portraits ok")
