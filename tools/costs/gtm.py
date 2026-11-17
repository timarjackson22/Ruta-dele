"""Go-to-market and unit economics model (Admin › Go to market). Reads tools/costs/gtm.json (assumptions, prices, sources) and
tools/costs/costs.json (running costs per growth stage, from model.py), writes tools/costs/gtm_out.json.
All arithmetic is here and shown in the app; change an assumption in gtm.json and run again.   Run: python3 tools/costs/gtm.py"""
import json, os
D = os.path.dirname(os.path.abspath(__file__))
G = json.load(open(os.path.join(D, "gtm.json"), encoding="utf-8"))
C = json.load(open(os.path.join(D, "costs.json"), encoding="utf-8"))
A = G["assumptions"]; U = C["usage"]; O = {o["id"]: o for o in G["options"]}
TIER = {"t": A["cost_tier"]}; out = {"asof": G["asof"], "note": G["note"], "benchmarks": G["benchmarks"], "options": G["options"], "assumptions": A}

VAR = ("ai", "stt", "pron", "tts", "tr")  # grow with each learner who uses them; the rest are fixed (licences, hosting, accounts)
def part(sid, var, t=None):
    t = t or TIER["t"]
    return sum((next(x for x in g["tiers"] if x["t"] == t)["year"][sid] or 0) for g in C["gaps"] if (g["id"] in VAR) == var)
def run_cost(sid, t=None): return C["totals"][t or TIER["t"]][sid]["sum"]
def quotes(sid, t=None): return C["totals"][t or TIER["t"]][sid]["quotes"]

def stage(sid, name, users, conv):
    mau = users * U["mau_share"][sid]
    pro = mau * conv * O["pro"]["arppu_month"] * 12 * (1 - O["pro"]["fee"])
    pas = mau * O["pass"]["buy_share"] * O["pass"]["price_once"] * (1 - O["pass"]["fee"])
    b2b = O["b2b"]["accounts"].get(sid, 0) * O["b2b"]["seats_per_account"] * O["b2b"]["seat_year"] * (1 - O["b2b"]["fee"])
    loc = mau * conv * O["local"]["arppu_month"] * 12 * (1 - O["local"]["fee"])
    seats = O["b2b"]["accounts"].get(sid, 0) * O["b2b"]["seats_per_account"]; cloud = min(1.0, (mau * conv + mau * O["pass"]["buy_share"] * 3 / 12 + seats) / mau) if mau else 0
    run_all = run_cost(sid); run = part(sid, True) * cloud + part(sid, False); acq = users * A["new_users_share_per_year"][sid] * A["paid_install_share"] * A["cpi"]; ppl = A["people_year"].get(sid, 0)
    rev = pro + pas + b2b
    return {"id": sid, "name": name, "users": users, "mau": round(mau), "payers": round(mau * conv), "rev": {"pro": round(pro), "pass": round(pas), "b2b": round(b2b), "local_alt": round(loc), "total": round(rev)},
            "cloud_share": round(cloud, 3), "cost": {"running": round(run), "running_all": round(run_all), "running_cheap_all": round(run_cost(sid, "cheap")), "quotes": quotes(sid), "acquisition": round(acq), "people": ppl, "total": round(run + acq + ppl)},
            "net": round(rev - run - acq - ppl), "net_all": round(rev - run_all - acq - ppl)}

out["tiers"] = {}
for tname in ("cheap", "modest"):
    TIER["t"] = tname; R = out["tiers"][tname] = {"stages": [], "unit": {}}
    for lvl in ("low", "base", "high"):
        conv = A["conversion"][lvl]
        R["stages"].append({"scenario": lvl, "conv": conv, "rows": [stage(sid, name, users, conv) for sid, name, users in C["stages"] if sid != "test"]})

    # unit economics per paying learner, base conversion, at each stage
    conv = A["conversion"]["base"]; net_arppu = O["pro"]["arppu_month"] * (1 - O["pro"]["fee"])
    for sid, name, users in C["stages"]:
        if sid == "test": continue
        mau = users * U["mau_share"][sid]; cpm = run_cost(sid) / mau / 12  # everyone on cloud: cost to serve one active learner a month
        payers = mau * conv; per_payer = part(sid, True) / mau / 12 + part(sid, False) / payers / 12  # recommended: a payer's own cloud use + a share of the fixed costs
        contrib = net_arppu - per_payer
        cac = A["cpi"] * A["paid_install_share"] / (conv * U["mau_share"][sid])  # ad spend per paying learner
        ltv = contrib * A["paid_months"]
        R["unit"][sid] = {"name": name, "net_arppu": round(net_arppu, 2), "cost_per_mau_month_all_cloud": round(cpm, 3), "cost_per_payer_month_all_cloud": round(cpm / conv, 2), "cost_per_payer_month": round(per_payer, 2), "contribution_month": round(contrib, 2),
                            "ltv": round(ltv, 2), "cac": round(cac, 2), "ltv_cac": round(ltv / cac, 1) if cac else None, "payback_months": round(cac / contrib, 1) if contrib > 0 else None}

    # break-even (base conversion): registered users at which revenue covers running + people + acquisition, stepping through the stages' unit costs
    def breakeven(conv):
        pts = []
        for sid, name, users in C["stages"]:
            if sid == "test": continue
            pts.append((users, stage(sid, name, users, conv)["net"]))
        pts.append((pts[-1][0] * 2, stage("mature", "x", pts[-1][0] * 2, conv)["net"]))  # one step past maturity (200k users, maturity's unit costs)
        for (u0, n0), (u1, n1) in zip(pts, pts[1:]):
            if n0 < 0 <= n1: return round(u0 + (u1 - u0) * (-n0) / (n1 - n0), -2)
        return None if pts[-1][1] < 0 else pts[0][0]
    R["breakeven"] = {lvl: breakeven(A["conversion"][lvl]) for lvl in ("low", "base", "high")}
json.dump(out, open(os.path.join(D, "gtm_out.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
for s in out["tiers"]["cheap"]["stages"]:
    print(s["scenario"], " ".join("%s rev %s cost %s net %s" % (r["id"], f'{r["rev"]["total"]:,}', f'{r["cost"]["total"]:,}', f'{r["net"]:,}') for r in s["rows"]))
for t in out["tiers"]: print(t, "unit", {k: (v["ltv"], v["cac"], v["ltv_cac"]) for k, v in out["tiers"][t]["unit"].items()}, "breakeven", out["tiers"][t]["breakeven"])
