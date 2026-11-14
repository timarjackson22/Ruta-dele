"""Profe pipeline fixes found by the end-to-end harness (issue log in tools/PROFE_ISSUES.md)."""
import sys
p = sys.argv[1]; s = open(p, encoding="utf-8").read()
if "PIPE_V1" in s: sys.exit("already patched")
def rep(a, b, n=1):
    global s
    assert s.count(a) == n, ("anchor", a[:90], s.count(a)); s = s.replace(a, b)
# B1/B2/B3: segmentation clean-up — labels never spoken, punctuation never its own segment, English outside «» stays English
RULES = r"""
      // PIPE_V1 D-rules. plural subject + «es»: «los niños es» → «son»
      if (w === "es" && i >= 2 && /s$/.test(low[i - 1]) && /^(los|las|unos|unas|mis|tus|sus|nuestros|nuestras|estos|estas|esos|esas)$/.test(low[i - 2])) add(words[i], "son", "«" + words[i - 2] + " " + words[i - 1] + "» is plural, so the verb is plural too: «son».", i);
      // adjective agreement after a noun: «una chica muy simpático» → «simpática»
      if (/^(una|la|esta|esa|mi|tu|su)$/.test(w) && i + 2 < low.length && /a$/.test(low[i + 1]) && !/(ma|ta|pa)$/.test(low[i + 1])) { let j = i + 2; if (/^(muy|bastante|tan|más|poco)$/.test(low[j])) j++; const a = low[j]; if (a && /o$/.test(a) && TG[a] && /adj/.test(TG[a][1]) && TG[a.slice(0, -1) + "a"] && !(TG[low[i + 1]] && /verb/.test(TG[low[i + 1]][1]))) add(words[j], words[j].slice(0, -1) + "a", "«" + words[i + 1] + "» is feminine, so the adjective is too: «" + words[j].slice(0, -1) + "a».", j); }
      if (/^(un|el|este|ese)$/.test(w) && i + 2 < low.length && /o$/.test(low[i + 1])) { let j = i + 2; if (/^(muy|bastante|tan|más|poco)$/.test(low[j])) j++; const a = low[j]; if (a && /a$/.test(a) && !/(ista|ita)$/.test(a) && TG[a] && /adj/.test(TG[a][1]) && TG[a.slice(0, -1) + "o"]) add(words[j], words[j].slice(0, -1) + "o", "«" + words[i + 1] + "» is masculine, so the adjective is too: «" + words[j].slice(0, -1) + "o».", j); }
      // «ir a» + a conjugated verb: «voy a comí» → «voy a comer»
      if (/^(voy|vas|va|vamos|van|vais|iba|ibas|íbamos|iban)$/.test(w) && low[i + 1] === "a" && i + 2 < low.length) { const n = low[i + 2], rd = verbReadings(n); if (rd.length && TG[n] && TG[n][1] === "verb" && !/(ar|er|ir)$/.test(n)) add(words[i + 2], rd[0].v, "After «" + words[i] + " a» the verb stays in the infinitive: «" + words[i] + " a " + rd[0].v + "».", i + 2); }
      // a finished past time with the present: «ayer voy» → «ayer fui»
      { const PASTX = /\b(ayer|anoche|anteayer|la semana pasada|el (año|mes|lunes|martes|miércoles|jueves|viernes|sábado|domingo) pasado|hace (dos|tres|unos|un|una) \w+)\b/i;
        if (PASTX.test(text) && !/\b(que|si|cuando|mañana|siempre|todos los)\b/i.test(text) && !(i > 0 && /^(que|si)$/.test(low[i - 1]))) { const rd0 = verbReadings(w), rd = rd0.filter((r) => r.t === "pres"); if (rd.length && !rd0.some((r) => r.t === "pret" || r.t === "impf") && rd[0].R.pret && rd[0].R.pret[rd[0].pi] && !/^(es|son|está|hay|tengo|tiene)$/.test(w)) { const r = rd[0]; add(words[i], r.R.pret[r.pi], "«" + (PASTX.exec(text) || [""])[0] + "» is a finished time in the past, so use the preterite: «" + r.R.pret[r.pi] + "».", i); } } }
      // «quiero que» + indicative → subjunctive: «quiero que tú vienes» → «vengas»
      if (w === "que" && i > 0 && /^(quiero|quieres|quiere|queremos|quieren|espero|esperamos|necesito|prefiero|ojalá|ojala|pido|deseo)$/.test(low[i - 1])) { let j = i + 1; if (low[j] in FXP) j++; while (j < low.length && SKIP.test(low[j])) j++; const n = low[j]; if (n) { const rd = verbReadings(n); if (rd.length && rd.every((r) => r.t === "pres") && rd[0].R.subj && rd[0].R.subj[rd[0].pi] && rd[0].R.subj[rd[0].pi] !== n) { const r = rd[0]; add(words[j], r.R.subj[r.pi], "After «" + words[i - 1] + " que» (a wish about someone else) the verb goes in the subjunctive: «" + r.R.subj[r.pi] + "».", j); } } }
      // «tengo treinta años viejo»: Spanish doesn't add «viejo»
      if (/^(viej[oa]s?)$/.test(w) && low[i - 1] === "años" && /^(tengo|tienes|tiene|tenemos|tienen|tenía|tenías)$/.test(low[i - 3] || low[i - 2] || "")) add(words[i], "(leave it out)", "Age is just «" + words[i - 3] + " " + words[i - 2] + " años»: Spanish doesn't add «viejo».", i);
      // «pienso de mi familia» → «pienso en» (thinking about); «¿qué piensas de…?» (an opinion) is right
      if (/^(pienso|piensas|piensa|pensamos|piensan|pensé|pensaste|pensó)$/.test(w) && low[i + 1] === "de" && !/^(qu[eé])$/.test(low[i - 1] || "")) add(words[i + 1], "en", "To think about someone or something is «pensar en»: «" + words[i] + " en…».", i + 1);
"""
rep("  function forVoice(full) {\n    let t = taskStrip(full);", "  function forVoice(full) { /* PIPE_V1 */\n    let t = taskStrip(full).replace(/(^|[\\s(\\n])(?:EN|ES|English|Spanish|Ingl[eé]s|Espa[ñn]ol)\\s*:\\s*/g, \"$1\");")
rep("  { const _tp = tagParts; tagParts = function (x) {", '''  const segTidy = (arr) => { const out = []; arr.forEach(([t, es]) => { t = String(t); if (!/[\\p{L}\\d]/u.test(t)) { if (out.length) out[out.length - 1][0] += t.trim(); return; } const lead = /^[\\s,.;:!?…)»”]+/.exec(t); if (lead && out.length) { out[out.length - 1][0] += lead[0].trim(); t = t.slice(lead[0].length); } t = t.trim(); if (!t) return; const last = out[out.length - 1]; if (last && last[1] === es) last[0] += " " + t; else out.push([t, es]); }); return out; };
  // outside «guillemets» in an English sentence: only clearly Spanish words go to the Spanish voice (not «use», «come», «red»)
  const strictSplit = (t) => { const L = raLex(); return String(t).split(/(\\s+)/).filter((w) => w !== "").map((w) => { const x = w.toLowerCase().replace(/[^a-záéíóúüñ]/g, ""); const es = !!x && (/[áéíóúñ¿¡]/i.test(w) || (x.length >= 3 && L.es.has(x) && !L.en.has(x) && !L.common.has(x))); return [w, es]; }).reduce((a, [w, es]) => { if (/^\\s+$/.test(w)) { if (a.length) a[a.length - 1][0] += w; return a; } const last = a[a.length - 1]; if (last && last[1] === es) last[0] += w; else a.push([w, es]); return a; }, []); };
  { const _tp = tagParts; tagParts = function (x) {''')
rep("else _tp(p).forEach((q) => out.push(q)); }); return out; } return _tp(x); }; }", "else strictSplit(p).forEach((q) => out.push(q)); }); return segTidy(out); } return segTidy(_tp(x)); }; }")
# B4: a voice that fails is reported once (never replaced by the other language's voice; the Java side refuses to)
rep("try { cgStart(u, t); } catch (e) {} return u;", "try { cgStart(u, t); } catch (e) {} try { const P0 = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(u), \"onerror\"); let h0 = null; Object.defineProperty(u, \"onerror\", { configurable: true, get: () => h0, set: (fn) => { h0 = function (ev) { if (ev && ev.error === \"synthesis-failed\") voiceFail(es); return fn && fn.call(this, ev); }; if (P0 && P0.set) P0.set.call(u, h0); } }); } catch (e) {} return u;")
rep("  function profeUtter(t, es) {", "  const VFAIL = {};\n  function voiceFail(es) { const k = es ? \"es\" : \"en\"; if (VFAIL[k]) return; VFAIL[k] = 1; try { coachToast(\"🔇 The \" + (es ? \"Spanish\" : \"English\") + \" voice isn’t available on this phone, so those parts were skipped. Choose or install one in Profe › History & settings › Voice.\"); } catch (e) {} }\n  function profeUtter(t, es) {")
# A5: pressing the mic again while it is still closing must open it again (the state flips at once, not when the phone confirms)
rep("  function stopListening() { if (rec) try { rec.stop(); } catch (e) {} }", "  function stopListening() { if (rec) try { rec.stop(); } catch (e) {} if (listening) { listening = false; try { uiVoice(); } catch (e) {} } }")
rep("""      if (w === "soy" && low[i + 1] === "de" && low[i + 2] === "acuerdo") add(words[i], "estoy", "The expression is «estoy de acuerdo».", i);
""", """      if (w === "soy" && low[i + 1] === "de" && low[i + 2] === "acuerdo") add(words[i], "estoy", "The expression is «estoy de acuerdo».", i);
""" + RULES)
# C: "slower" and "repeat" are handled by the app at once (no AI round trip): exact replay, slower voice
rep("""    text = String(text || "").trim(); if (!text) return;""", """    text = String(text || "").trim(); if (!text) return;
    try { if (localTurn(text)) return; } catch (e) {}""")
rep("  async function tSend(text, byVoice) {", """  function localTurn(text) {
    if (!tCur || tBusy) return false; const l = text.toLowerCase().replace(/[.!?¡¿,]+/g, " ").replace(/\\s+/g, " ").trim();
    const slow = /^(slow(er)?( down)?( please)?|(please )?speak (more )?slow(ly|er)|too fast|m[aá]s despacio( por favor)?|m[aá]s lento( por favor)?|habla (m[aá]s )?(despacio|lento)( por favor)?)$/.test(l);
    const again = /^(repeat( that| it)?( please)?|say (that|it) again( please)?|again please|repite( por favor)?|rep[ií]telo( por favor)?|otra vez,? por favor|c[oó]mo|perd[oó]n)$/.test(l.replace(/,/g, ""));
    if (!slow && !again) return false;
    const last = [...tCur.msgs].reverse().find((m) => m.r === "a" && m.c && !m.pending && !m.local);
    if (!last) return false;
    if (slow) { TS.prate = Math.max(0.6, Math.round(((TS.prate || 1) - 0.15) * 100) / 100); tsave(); }
    const um = { r: "u", c: text, t: Date.now() }, am = { r: "a", c: slow ? "Vale, más despacio. *(Speed " + TS.prate.toFixed(2).replace(/0$/, "") + "×)*" : "Claro, otra vez:", t: Date.now(), local: 1 };
    tCur.msgs.push(um, am); tCur.updated = Date.now(); try { tPush(tCur); } catch (e) {} tRender();
    const q = pendingQ(), say = again && q && taskStrip(last.c).length > 220 ? q : taskStrip(last.c);
    speakMixed(say, () => { try { autoAgain(); } catch (e) {} });
    return true;
  }
  async function tSend(text, byVoice) {""")
rep("""    repeat: "The learner asks you to repeat: repeat your last question or model briefly, nothing new.",""", """    repeat: "The learner asks you to repeat: repeat your last question or model briefly, nothing new.",
    translate: "The learner asks for a translation: give the English of your last Spanish (or of what they ask about) briefly, then return to the exercise.",""")
rep("""    if (/^(i said|no,? i said|dije|no,? dije|i meant|quise decir)\\b/i.test(l)) return "fixheard";""", """    if (/^(i said|no,? i said|dije|no,? dije|i meant|quise decir)\\b/i.test(l)) return "fixheard";
    if (/^(translate|in english|what does (that|it) mean|what does .{1,40} mean|qu[eé] significa|trad[uú]ce(lo)?|en ingl[eé]s)\\b/i.test(l)) return "translate";""")
# C1: what the learner heard of an interrupted reply includes the part of the sentence that was playing
rep("    CG.seg = t.length; CG.t0 = performance.now();", "    CG.seg = t.length; CG.t0 = performance.now(); CG.segText = t;")
rep("if (a && !a.cut) a.cut = (SPOKEN.heard.join(\" \") || \"\").slice(0, 400) || \"(nothing yet)\";", "if (a && !a.cut) { let part = \"\"; try { const ws = String(CG.segText || \"\").split(/\\s+/), k = Math.floor(((performance.now() - CG.t0) / 1000) * 2.6 * (TS.prate || 1)); part = ws.slice(0, Math.max(0, Math.min(ws.length, k))).join(\" \"); } catch (e) {} a.cut = (SPOKEN.heard.concat(part ? [part + \"…\"] : []).join(\" \") || \"\").slice(0, 400) || \"(nothing yet)\"; }")
# C2: an instant answer from the app's own dictionary during an exercise brings the learner back to the pending question
rep("    if (TB === \"native\" || TB === \"local\") { try { if (!VI) await loadIndex(); } catch (e) {} const ex = expertAnswer(lastU); if (ex) { onText(ex); return ex; } }", "    if (TB === \"native\" || TB === \"local\") { try { if (!VI) await loadIndex(); } catch (e) {} let ex = expertAnswer(lastU); if (ex) { try { let q = tCur && tCur.task && !tCur.task.done && pendingQ(); if (!q && tCur && tCur.drill && !tCur.drill.done) { const la = [...tCur.msgs].reverse().find((m) => m.r === \"a\" && m.c && !m.pending && /\\*\\*\\d+ \\/ \\d+\\*\\*/.test(m.c)); if (la) q = la.c.split(\"\\n\").filter((x) => /\\*\\*\\d+ \\/ \\d+\\*\\*/.test(x)).pop(); } if (q && !ex.includes(q) && !/\\*\\*\\d+ \\/ \\d+\\*\\*/.test(ex)) ex += \"\\n\\n*Back to the exercise:* \" + q; } catch (e) {} onText(ex); return ex; } }")
# C2b: a question during a built-in drill doesn't end the drill
rep("      D.done = 1; return null; // the learner moved on to something else", "      if (!(/\\?\\s*$/.test(text) || [\"question\", \"translate\", \"help\", \"repeat\"].includes(turnKind(text)))) D.done = 1; return null; // the learner moved on to something else (a question doesn't end the drill)")
# A6b: a reply cut off by a newer message: drop it if nothing real was written, otherwise mark it
rep("""if (tBusy && tCtl) { try { tCtl.abort(); } catch (e) {}""", """if (tBusy && tCtl) { try { const pl = tCur && [...tCur.msgs].reverse().find((m) => m.r === "a" && m.pending); if (pl) pl.superseded = 1; } catch (e) {} try { tCtl.abort(); } catch (e) {}""")
rep("    tBusy = false; tCtl = null; tCur.updated = Date.now(); tPush(tCur); tRender();", """    if (live.superseded) { const real = String(live.c || "").split("\\n").filter((x) => x.trim() && !/💡|useful word|\\(stopped\\)/i.test(x)).join(" ").trim(); if (!real) { const k = tCur.msgs.indexOf(live); if (k >= 0) tCur.msgs.splice(k, 1); } else live.c = live.c + "\\n\\n*(interrupted)*"; }
    tBusy = false; tCtl = null; tCur.updated = Date.now(); tPush(tCur); tRender();""")
rep("""if (pl) pl.superseded = 1; } catch (e) {} try { tCtl.abort(); } catch (e) {}""", """if (pl) pl.superseded = 1; } catch (e) {} SPK_GEN++; try { speechSynthesis.cancel(); } catch (e) {} try { tCtl.abort(); } catch (e) {}""")
rep("    if (spk) { if (live.c && !live.err) { spk.finish(live.c);", "    if (live.superseded) { /* a newer message took over: this reply is never spoken */ }\n    else if (spk) { if (live.c && !live.err) { spk.finish(live.c);")
open(p, "w", encoding="utf-8").write(s)
print("pipeline ok")
