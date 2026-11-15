"""Profe as a teacher (tools/PROFE_EVAL_BRIEF.md §5–6): reliable checks before the AI answers, the 5-step correction, a next step every practice turn,
repeated mistakes tracked and sent to My mistakes."""
import sys
p = sys.argv[1]; s = open(p, encoding="utf-8").read()
if "function teachPrep" in s: sys.exit("already patched")
def rep(a, b, n=1):
    global s
    assert s.count(a) == n, ("anchor", a[:90], s.count(a)); s = s.replace(a, b)
rep("  function route() {\n", open("/home/claude/app/teach.js", encoding="utf-8").read() + "\n  function route() {\n")
rep('''  function rules(ctx, compact) { return rules0(ctx, compact) + (compact ? TASK_RULES_SHORT : TASK_RULES_FULL) + taskNote(false) + turnNote(); }''',
    '''  function rules(ctx, compact) { return rules0(ctx, compact) + (compact ? TASK_RULES_SHORT : TASK_RULES_FULL) + taskNote(false) + turnNote() + teachNote(); }''')
rep('''    const um = { r: "u", c: text, t: Date.now() }; tCur.msgs.push(um); tCur.updated = Date.now(); tView = "chat"; TASK_TAG = null; try { taskTrack(text); } catch (e) {}''',
    '''    const um = { r: "u", c: text, t: Date.now() }; tCur.msgs.push(um); tCur.updated = Date.now(); tView = "chat"; TASK_TAG = null; try { taskTrack(text); } catch (e) {}
    try { teachPrep(text); } catch (e) {}''')
rep('''    if (live.superseded) { const real =''', '''    try { if (!live.superseded) teachAfter(live, um); } catch (e) {}
    if (live.superseded) { const real =''')
# the rule-based conversation coach: the app's own checks (and the new ones), in the brief's 5-step order, tracked for review
rep('''    let fx = []; try { fx = quickFixes(text); } catch (e) {}
    const better = fx.length ? applyFx(text, fx) : "";''', '''    let fx = []; try { fx = teachChecks(text); } catch (e) { try { fx = quickFixes(text); } catch (e2) {} }
    const better = fx.length ? applyFx(text, fx) : "";''')
rep('''      if (fx.length) { tCur.coached = text; return { prefix: tline("reveal") + "\\nSay it like this: **" + better + "**\\n" + fx.map((f) => f.why).join(" ") + "\\n**¡Sigamos!** *Let’s keep going.*" }; }''',
    '''      if (fx.length) { tCur.coached = text; try { teachTrack({ items: fx, better, text }); } catch (e) {} return { prefix: tline("reveal") + "\\nSay it like this: **" + better + "**\\n" + fx.map((f) => f.why).join(" ") + "\\n**¡Sigamos!** *Let’s keep going.*" }; }''')
rep('''      return { stop: true, text: tline("retry") + "\\n" + fx.map((f) => "«" + f.from + "» → **" + f.to + "**: " + f.why).join("\\n") + "\\n\\n👉 **¡Inténtalo otra vez!** Di la frase completa.\\n*Try again: say the whole sentence.*" };''',
    '''      try { teachTrack({ items: fx, better, text }); } catch (e) {}
      return { stop: true, text: teachCoachText(text, fx, better) };''')
open(p, "w", encoding="utf-8").write(s)
print("teach ok")
