"""Turns tools/costs/gaps.json into yearly cost estimates per gap, tier and growth stage (tools/costs/costs.json).
The arithmetic is here, not in anyone's head: change a price or an assumption in gaps.json and run this again.
Run: python3 tools/costs/model.py"""
import json, os, math
D = os.path.dirname(os.path.abspath(__file__))
G = json.load(open(os.path.join(D, "gaps.json"), encoding="utf-8"))
U = G["usage"]
def qty(stage_users, stage):
    mau = stage_users * U["mau_share"][stage]; d = U["days_per_month"]
    return {"mau": mau, "ai_turns": mau * d * U["ai_turns_per_day"], "stt_min": mau * d * U["stt_min_per_day"],
            "tts_chars": mau * d * U["tts_chars_per_day"] * (1 - U["tts_cache_saving"]), "tr_chars": mau * d * U["tr_chars_per_day"], "pron_min": mau * d * U["pron_min_per_day"], "call_min": mau * d * U.get("call_min_per_day", 0), "ocr_pages": mau * U.get("ocr_pages_per_month", 0)}  # per month
def year_cost(calc, q):
    t = calc["type"]
    if t == "quote": return None
    if t == "fixed": return calc["year"]
    if t == "once": return calc["once"]  # one-off purchase, shown in the year it is bought
    if t == "llm":  # per month: input tokens (cached share at 0.1x) + output tokens
        tin = q["ai_turns"] * U["ai_in_tokens"]; eff = tin * (1 - U["ai_cached_share"]) + tin * U["ai_cached_share"] * 0.1
        return 12 * (eff * calc["in"] + q["ai_turns"] * U["ai_out_tokens"] * calc["out"]) / 1e6
    if t == "per":
        m = max(0.0, q[calc["qty"]] - calc.get("free", 0)) * calc["per"] + calc.get("fixed_month", 0); return 12 * m
    if t == "tiered":  # monthly volume bands, each band at its own rate
        left, prev, m = q[calc["qty"]], 0.0, 0.0
        for top, rate in calc["bands"]:
            n = max(0.0, min(left, top - prev)); m += n * rate; left -= n; prev = top
            if left <= 0: break
        return 12 * m
    if t == "library":  # whole video library once, then new videos each month (not per user)
        return U["video_minutes_library"] * calc["per"] + 12 * U["video_minutes_new_per_month"] * calc["per"]
    if t == "picovoice": return calc["foundation"] if q["mau"] <= calc["cap_mau"] else max(calc["enterprise"], calc["foundation"])
    if t == "firebase":
        auth = max(0.0, q["mau"] - 50000) * 0.0055; reads = q["mau"] * U["days_per_month"] * 50 * 0.06 / 1e5; writes = q["mau"] * U["days_per_month"] * 10 * 0.18 / 1e5
        return 12 * (auth + reads + writes)
    if t == "supabase": return 12 * (calc["month"] + max(0.0, q["mau"] - calc["incl"]) * calc["per"])
    if t == "workers":
        req = q["ai_turns"]; return 12 * (calc["month"] + max(0.0, req - 10e6) / 1e6 * 0.30) + calc.get("once", 0)
    raise ValueError(t)
out = {"asof": G["asof"], "note": G["note"], "hybrid_note": G.get("hybrid_note", ""), "stages": G["stages"], "usage": U, "metrics": G["metrics"], "revenue_note": G["revenue_note"], "gaps": [], "totals": {}}
for g in G["gaps"]:
    gg = {k: g[k] for k in ("id", "name", "today", "gap", "driver")}; gg["tiers"] = []
    for tr in g["tiers"]:
        costs = {}
        for sid, _, users in G["stages"]:
            v = year_cost(tr["calc"], qty(users, sid)); costs[sid] = None if v is None else round(v, 2)
        gg["tiers"].append({"t": tr["t"], "name": tr["name"], "unit": tr["unit"], "src": tr["src"], "impact": tr["impact"], "from": bool(tr["calc"].get("from")) or tr["calc"]["type"] == "picovoice", "quote": tr["calc"]["type"] == "quote", "once": tr["calc"]["type"] == "once", "year": costs})
    out["gaps"].append(gg)
for t in ("cheap", "modest", "best"):
    out["totals"][t] = {}
    for sid, _, _ in G["stages"]:
        s = 0.0; q = 0
        for g in out["gaps"]:
            x = next(x for x in g["tiers"] if x["t"] == t)
            if x["year"][sid] is None: q += 1
            else: s += x["year"][sid]
        out["totals"][t][sid] = {"sum": round(s, 2), "quotes": q}
for t in out["totals"]:
    for sid, _, users in G["stages"]:
        mau = users * U["mau_share"][sid]; out["totals"][t][sid]["per_mau"] = round(out["totals"][t][sid]["sum"] / mau, 2) if mau else None
json.dump(out, open(os.path.join(D, "costs.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
for t in ("cheap", "modest", "best"):
    print(t.ljust(7), " ".join("%s $%s%s" % (sid, f"{out['totals'][t][sid]['sum']:,.0f}", "+q" * (out['totals'][t][sid]['quotes'] > 0)) for sid, _, _ in G["stages"]))
