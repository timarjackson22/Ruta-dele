"""One icon family for the whole interface (tools/ICON_BRIEF.md): outline 24px icons replace emoji used as UI icons."""
import sys, json
p = sys.argv[1]; s = open(p, encoding="utf-8").read()
if "function icFix" in s: sys.exit("already patched")
def rep(a, b, n=1):
    global s
    assert s.count(a) == n, ("anchor", a[:90], s.count(a)); s = s.replace(a, b)
P = {
 "puzzle": '<path d="M19.4 13.5c.9 0 1.6-.7 1.6-1.6s-.7-1.6-1.6-1.6H18V7a1 1 0 0 0-1-1h-3.3V4.6C13.7 3.7 13 3 12.1 3s-1.6.7-1.6 1.6V6H7a1 1 0 0 0-1 1v3.3H4.6C3.7 10.3 3 11 3 11.9s.7 1.6 1.6 1.6H6V17a1 1 0 0 0 1 1h3.3v-1.4c0-.9.7-1.6 1.6-1.6s1.6.7 1.6 1.6V18H17a1 1 0 0 0 1-1v-3.5z"/>',
 "volume": '<path d="M11 5 6 9H2v6h4l5 4V5z"/><path d="M15.5 8.5a5 5 0 0 1 0 7M19 5a10 10 0 0 1 0 14"/>',
 "volume-off": '<path d="M11 5 6 9H2v6h4l5 4V5z"/><path d="m22 9-6 6M16 9l6 6"/>',
 "headphones": '<path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1v-6h3zM3 19a2 2 0 0 0 2 2h1v-6H3z"/>',
 "cards": '<rect x="7" y="7" width="13" height="13" rx="2.5"/><path d="M4 16.5V6.5A2.5 2.5 0 0 1 6.5 4h10"/>',
 "target": '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.2"/>',
 "flame": '<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.4-.5-2-1-3-1.1-2.1-.2-4 2-6 .5 2.5 2 4.9 4 6.5s3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.2.4-2.3 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>',
 "snowflake": '<path d="M12 2v20M2 12h20M4.9 4.9l14.2 14.2M19.1 4.9 4.9 19.1"/><path d="m9 4 3 2 3-2M9 20l3-2 3 2M4 9l2 3-2 3M20 9l-2 3 2 3"/>',
 "sun": '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
 "book": '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5z"/><path d="M4 19.5A2.5 2.5 0 0 0 6.5 22H20v-5"/>',
 "book-open": '<path d="M2 4h6a4 4 0 0 1 4 4v12a3 3 0 0 0-3-3H2zM22 4h-6a4 4 0 0 0-4 4v12a3 3 0 0 1 3-3h7z"/>',
 "pen": '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>',
 "speech": '<path d="M21 12a8 8 0 0 1-11.6 7.1L4 20.5l1.4-4.6A8 8 0 1 1 21 12z"/>',
 "mic": '<rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 10v1a7 7 0 0 0 14 0v-1M12 18v4"/>',
 "chart": '<path d="M3 3v18h18"/><path d="M8 17v-5M13 17V8M18 17v-9"/>',
 "star": '<path d="m12 2.5 2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5L2.5 9.4l6.6-.9z"/>',
 "medal": '<circle cx="12" cy="9" r="6"/><path d="m8.2 13.8-1.7 7.7L12 19l5.5 2.5-1.7-7.7"/>',
 "trophy": '<path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0z"/><path d="M17 5h3v2a3 3 0 0 1-3 3M7 5H4v2a3 3 0 0 0 3 3"/>',
 "graduation": '<path d="M22 10 12 5 2 10l10 5 10-5z"/><path d="M6 12v5c3 2.5 9 2.5 12 0v-5"/>',
 "file": '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M8 13h8M8 17h5"/>',
 "library": '<rect x="3" y="4" width="4" height="16" rx="1"/><rect x="9" y="4" width="4" height="16" rx="1"/><path d="m15.5 5.2 3.9-1 3.1 15.4-3.9 1z"/>',
 "tree": '<path d="M12 22v-7"/><path d="M8 15h8a4 4 0 0 0 1.5-7.7A5 5 0 0 0 7.6 6 4 4 0 0 0 8 15z"/>',
 "sprout": '<path d="M7 20h10M12 20v-8"/><path d="M12 12c0-3-2-5-6-5 0 3 2 5 6 5zM12 12c0-3.5 2.3-6 7-6 0 3.5-2.3 6-7 6z"/>',
 "leaf": '<path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.5 19 2c1 2 2 4.2 2 8 0 5.5-4.8 10-10 10z"/><path d="M2 21c0-3 1.9-5.4 5.2-6.1C9.5 14.4 12 13 13 12"/>',
 "mountain": '<path d="m8 3 4 8 5-5 5 15H2z"/>',
 "zap": '<path d="M13 2 3 14h9l-1 8 10-12h-9z"/>',
 "save": '<path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><path d="M17 21v-8H7v8M7 3v5h8"/>',
 "calendar": '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
 "folder": '<path d="M6 14 7.5 11.1A2 2 0 0 1 9.2 10H20a2 2 0 0 1 1.9 2.5l-1.5 6a2 2 0 0 1-1.9 1.5H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.7.9l.8 1.2a2 2 0 0 0 1.7.9H18a2 2 0 0 1 2 2v2"/>',
 "alarm": '<circle cx="12" cy="13" r="8"/><path d="M12 9v4l2 2M5 3 2 6M22 6l-3-3"/>',
 "timer": '<circle cx="12" cy="13" r="8"/><path d="M12 9v4l2 2M10 2h4"/>',
 "alert": '<path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/><path d="M12 9v4M12 17h.01"/>',
 "bulb": '<path d="M9 18h6M10 22h4"/><path d="M15.1 14c.2-1 .7-1.7 1.5-2.5A6 6 0 1 0 7.4 11.5c.8.8 1.3 1.5 1.5 2.5"/>',
 "sparkles": '<path d="M12 3 13.9 8.1 19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z"/><path d="M19 3v4M17 5h4M5 17v4M3 19h4"/>',
 "repeat": '<path d="m17 2 4 4-4 4"/><path d="M3 11v-1a4 4 0 0 1 4-4h14M7 22l-4-4 4-4"/><path d="M21 13v1a4 4 0 0 1-4 4H3"/>',
 "shuffle": '<path d="M2 18h1.4c1.3 0 2.5-.6 3.3-1.7l6.1-8.6c.7-1.1 2-1.7 3.3-1.7H22"/><path d="m18 2 4 4-4 4M2 6h1.9c1.5 0 2.9.9 3.6 2.2M22 18h-5.9c-1.3 0-2.6-.7-3.3-1.8l-.5-.8M18 14l4 4-4 4"/>',
 "briefcase": '<rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2M2 13h20"/>',
 "globe": '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>',
 "pin": '<path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/>',
 "back": '<path d="M9 14 4 9l5-5"/><path d="M20 20v-7a4 4 0 0 0-4-4H4"/>',
 "flag": '<path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1zM4 22v-7"/>',
 "bandage": '<path d="M18.4 5.6a4 4 0 0 0-5.7 0l-7.1 7.1a4 4 0 0 0 5.7 5.7l7.1-7.1a4 4 0 0 0 0-5.7z"/><path d="M10 10h.01M14 14h.01M12 12h.01M10 14h.01M14 10h.01"/>',
 "slow": '<circle cx="11" cy="12" r="6"/><path d="M11 12a2.5 2.5 0 1 0 2.5-2.5M5 18h11a5 5 0 0 0 5-5V8M19 4l.8 2M23 4l-.8 2"/>',
 "check": '<circle cx="12" cy="12" r="9"/><path d="m8.5 12 2.5 2.5 5-5"/>',
 "cross": '<circle cx="12" cy="12" r="9"/><path d="m15 9-6 6M9 9l6 6"/>',
 "arrow": '<path d="M5 12h14M13 6l6 6-6 6"/>',
 "play": '<path d="M7 4.5v15a1 1 0 0 0 1.5.9l12-7.5a1 1 0 0 0 0-1.8l-12-7.5A1 1 0 0 0 7 4.5z"/>',
 "pause": '<rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/>',
 "refresh": '<path d="M21 12a9 9 0 1 1-2.6-6.4L21 8"/><path d="M21 3v5h-5"/>',
 "hand": '<path d="M7 11V6a2 2 0 0 1 4 0v4M11 9V4a2 2 0 0 1 4 0v6M15 9a2 2 0 0 1 4 0v5a7 7 0 0 1-7 7h-1a7 7 0 0 1-5.4-2.6L3.3 15a2 2 0 0 1 3-2.6L7 13"/>',
}
EMO = {
 "🧩": "puzzle", "🔊": "volume", "🔈": "volume", "🔇": "volume-off", "🎧": "headphones", "🗂": "cards", "🎯": "target", "🔥": "flame", "🧊": "snowflake", "☀": "sun",
 "📘": "book", "📕": "book", "📗": "book", "📖": "book-open", "✍": "pen", "✏": "pen", "🗣": "speech", "💬": "speech", "🎙": "mic", "🎤": "mic", "📊": "chart", "📈": "chart",
 "⭐": "star", "🌟": "star", "🏅": "medal", "💯": "medal", "🏆": "trophy", "🎓": "graduation", "📝": "file", "📚": "library", "🌳": "tree", "🌱": "sprout", "🌿": "leaf",
 "🏔": "mountain", "🌋": "mountain", "🧠": "zap", "💾": "save", "📅": "calendar", "📂": "folder", "⏰": "alarm", "⏱": "timer", "⚠": "alert", "💡": "bulb",
 "✨": "sparkles", "🎉": "sparkles", "🙌": "sparkles", "👏": "sparkles", "🔁": "repeat", "🔀": "shuffle", "💼": "briefcase", "🌎": "globe", "🌍": "globe", "🌏": "globe",
 "📍": "pin", "↩": "back", "🏁": "flag", "🩹": "bandage", "🐢": "slow", "✅": "check", "❌": "cross", "👉": "arrow", "💪": "hand", "🤏": "hand", "😊": "sparkles", "👍": "check", "▶": "play", "⏸": "pause", "⏯": "play", "⟳": "refresh", "🔄": "refresh", "↻": "refresh",
}
JS = r'''
  /* ---------- one icon family (tools/ICON_BRIEF.md) ---------- */
  const ICP = __ICP__;
  const IC = (n, cls) => '<svg class="ic' + (cls ? " " + cls : "") + '" data-ic="' + n + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (ICP[n] || "") + "</svg>";
  window.__IC = IC;
  const EMO = __EMO__;
  const EMO_RE = new RegExp("(" + Object.keys(EMO).sort((a, b) => b.length - a.length).map((k) => k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|") + ")️?", "gu");
  const IC_SKIP = "#ltext, .fc .face, .cue, input, textarea, select, option, script, style, svg, [contenteditable], .verse, .no-ic";
  function icFix(root) {
    if (!root) return; const nodes = [];
    if (root.nodeType === 3) nodes.push(root); else { const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT); let n; while ((n = w.nextNode())) nodes.push(n); }
    nodes.forEach((n) => {
      const t = n.nodeValue; if (!t || !EMO_RE.test(t)) return; EMO_RE.lastIndex = 0;
      const el = n.parentElement; if (!el || el.closest(IC_SKIP)) return;
      const tpl = document.createElement("template");
      tpl.innerHTML = t.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c])).replace(EMO_RE, (m, e) => IC(EMO[e])).replace(/(<\/svg>)\s+/g, "$1 ");
      n.replaceWith(tpl.content);
    });
  }
  { let q = new Set(), tick = 0;
    const flush = () => { tick = 0; const arr = [...q]; q.clear(); arr.forEach((n) => { if (n.isConnected) icFix(n); }); };
    new MutationObserver((ms) => { ms.forEach((m) => { if (m.type === "characterData") q.add(m.target); else m.addedNodes.forEach((n) => (n.nodeType === 1 || n.nodeType === 3) && q.add(n)); }); if (!tick) tick = requestAnimationFrame(flush); })
      .observe(document.body, { childList: true, subtree: true, characterData: true });
    icFix(document.body); }
'''
JS = JS.replace("__ICP__", json.dumps(P, ensure_ascii=False)).replace("__EMO__", json.dumps(EMO, ensure_ascii=False))
rep("  function route() {\n", JS + "\n  function route() {\n")
CSS = r'''
/* ===== icons: one outline family, sized from the text ===== */
.ic { width: 1.15em; height: 1.15em; vertical-align: -0.2em; flex: none; display: inline-block }
.ic[data-ic="flame"] { color: #f0641e } .ic[data-ic="snowflake"] { color: #3d8bfd } .ic[data-ic="trophy"], .ic[data-ic="medal"], .ic[data-ic="star"], .ic[data-ic="sun"] { color: #e0a01a }
.ic[data-ic="tree"], .ic[data-ic="sprout"], .ic[data-ic="leaf"], .ic[data-ic="check"] { color: #2a9d6b } .ic[data-ic="cross"], .ic[data-ic="bandage"], .ic[data-ic="target"] { color: #e5484d }
.btn .ic, .tabbar .ic, .drfb .ic, #coach-toast .ic, .pa-toast .ic, #hoypill .ic, #lq-back .ic, .kcard .ic { color: inherit }
.hs-ic .ic, .hh-ic .ic { width: 1em; height: 1em }
.hs-ic { color: var(--saffron) } .hoysteps li.done .hs-ic { color: var(--surface) }
.quests li > span:first-child { color: var(--cobalt); display: grid; place-items: center }
.pstats b .ic { margin-right: 2px }
/* badges: medallions — gold ring when earned, grey when not */
.pbadges > div > span:first-child { width: 48px; height: 48px; margin: 0 auto 4px; border-radius: 50%; display: grid; place-items: center; font-size: 24px; border: 2px solid var(--line); color: var(--muted); background: var(--surface) }
.pbadges > div.on > span:first-child { border-color: #e0a01a; color: #b97c00; background: color-mix(in srgb, #e0a01a 14%, var(--surface)); box-shadow: 0 2px 8px color-mix(in srgb, #e0a01a 30%, transparent) }
.pbadges > div.on > span:first-child .ic { color: inherit }
.pbadges > div { filter: none; opacity: .6 } .pbadges > div.on { opacity: 1 }
.ic[data-ic="play"] { width: .95em; height: .95em; vertical-align: -0.12em }
.dr-big .ic { width: 64px; height: 64px; color: var(--saffron) }
'''
k = s.rindex("</style>", 0, s.index("</head>")); s = s[:k] + CSS + s[k:]
open(p, "w", encoding="utf-8").write(s)
print("icons ok", len(P), len(EMO))
