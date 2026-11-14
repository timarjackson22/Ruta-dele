"""Checks YouTube videos for Ruta DELE: plays in other apps (embeds)? caption tracks? channel, views, length.
Prints facts only, never caption text. Run on GitHub Actions (workflow video-check): python tools/video_check.py ID ID ..."""
import sys, re, json, html, urllib.request, urllib.error, http.cookiejar
cj = http.cookiejar.CookieJar(); op = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(cj))
H = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36", "Accept-Language": "es,en;q=0.8"}
def get(u, data=None, hdr=None):
    r = urllib.request.Request(u, data=data, headers=dict(H, **(hdr or {}))); return op.open(r, timeout=30).read().decode("utf-8", "replace")
CLIENTS = [("ANDROID", "20.10.38", {}), ("WEB_EMBEDDED_PLAYER", "1.20241009.01.00", {"thirdParty": {"embedUrl": "https://timarjackson22.github.io/Ruta-dele/"}}), ("TVHTML5_SIMPLY_EMBEDDED_PLAYER", "2.0", {"thirdParty": {"embedUrl": "https://timarjackson22.github.io/Ruta-dele/"}}), ("IOS", "19.45.4", {}), ("MWEB", "2.20241010.01.00", {})]
def oembed(v):
    try: j = json.loads(get("https://www.youtube.com/oembed?format=json&url=https://www.youtube.com/watch?v=" + v)); return 200, j.get("title"), j.get("author_name")
    except urllib.error.HTTPError as e: return e.code, None, None
    except Exception as e: return str(e)[:40], None, None
def check(v):
    oc, ot, oa = oembed(v)
    base = {"id": v, "oembed": oc, "title": ot, "author": oa}
    for name, ver, extra in CLIENTS:
        try:
            ctx = {"client": dict({"clientName": name, "clientVersion": ver, "hl": "es"})}; ctx.update(extra)
            pr = json.loads(get("https://www.youtube.com/youtubei/v1/player?prettyPrint=false", json.dumps({"context": ctx, "videoId": v}).encode(), {"Content-Type": "application/json"}))
        except Exception as e: continue
        ps = pr.get("playabilityStatus", {})
        if ps.get("status") != "OK": base.setdefault("tried", []).append(name + ":" + str(ps.get("status"))); continue
        vd = pr.get("videoDetails", {}); tr = (pr.get("captions") or {}).get("playerCaptionsTracklistRenderer", {}).get("captionTracks", [])
        es = [t for t in tr if t.get("languageCode", "").startswith("es")]; n = None
        if es:
            t = sorted(es, key=lambda t: t.get("kind") == "asr")[0]
            try: n = len(re.findall(r"<text |<p ", get(t["baseUrl"].replace("&fmt=srv3", ""))))
            except Exception as e: n = "fetch failed: " + str(e)[:50]
        base.update({"client": name, "embed_player": ps.get("playableInEmbed"), "views": int(vd.get("viewCount", 0) or 0), "secs": int(vd.get("lengthSeconds", 0) or 0), "author": vd.get("author") or oa, "title": vd.get("title") or ot,
                     "tracks": [t.get("languageCode", "") + ("(auto)" if t.get("kind") == "asr" else "") for t in tr], "es_lines": n})
        return base
    return base
def check_old(v):
    page = html.unescape(get("https://www.youtube.com/watch?v=" + v))
    if 'action="https://consent.youtube.com/s"' in page:
        m = re.search('name="v" value="(.*?)"', page); cj.set_cookie(http.cookiejar.Cookie(0, "CONSENT", "YES+" + m.group(1), None, False, ".youtube.com", True, True, "/", True, False, None, False, None, None, {}))
        page = html.unescape(get("https://www.youtube.com/watch?v=" + v))
    key = re.search(r'"INNERTUBE_API_KEY":\s*"([a-zA-Z0-9_-]+)"', page)
    if not key: return {"id": v, "err": "no key" + (" (captcha)" if "g-recaptcha" in page else "")}
    emb = re.search(r'"playableInEmbed":\s*(true|false)', page)
    pr = json.loads(get("https://www.youtube.com/youtubei/v1/player?key=" + key.group(1), json.dumps({"context": {"client": {"clientName": "ANDROID", "clientVersion": "20.10.38"}}, "videoId": v}).encode(), {"Content-Type": "application/json"}))
    ps = pr.get("playabilityStatus", {}); vd = pr.get("videoDetails", {})
    tr = (pr.get("captions") or {}).get("playerCaptionsTracklistRenderer", {}).get("captionTracks", [])
    tracks = [t.get("languageCode", "") + ("(auto)" if t.get("kind") == "asr" else "") for t in tr]
    n = None; es = [t for t in tr if t.get("languageCode", "").startswith("es")]
    if es:
        t = sorted(es, key=lambda t: t.get("kind") == "asr")[0]
        try: n = len(re.findall(r"<text ", get(t["baseUrl"].replace("&fmt=srv3", ""))))
        except Exception as e: n = "fetch failed: " + str(e)[:60]
    return {"id": v, "status": ps.get("status"), "reason": ps.get("reason"), "embed_page": emb.group(1) if emb else None, "embed_player": ps.get("playableInEmbed"),
            "title": vd.get("title"), "author": vd.get("author"), "views": int(vd.get("viewCount", 0) or 0), "secs": int(vd.get("lengthSeconds", 0) or 0), "tracks": tracks, "es_lines": n}
out = []
def rss(ch):
    x = get("https://www.youtube.com/feeds/videos.xml?channel_id=" + ch)
    for e in re.findall(r"<entry>(.*?)</entry>", x, re.S):
        g = lambda p: (re.search(p, e, re.S) or [None, None])[1]
        print("RSS " + json.dumps({"ch": ch, "id": g(r"<yt:videoId>(.*?)<"), "title": html.unescape(g(r"<title>(.*?)<") or ""), "author": html.unescape(g(r"<name>(.*?)<") or ""), "date": g(r"<published>(.*?)<"), "views": int(g(r'views="(\d+)"') or 0)}, ensure_ascii=False), flush=True)
for v in sys.argv[1:]:
    if v.startswith("chan:"):
        try:
            j = json.loads(get("https://www.youtube.com/oembed?format=json&url=https://www.youtube.com/watch?v=" + v[5:])); au = j.get("author_url")
            pg = get(au); cid = (re.search(r'"(?:externalId|channelId)":"(UC[\w-]{22})"', pg) or re.search(r'channel/(UC[\w-]{22})', pg))
            print("RSS " + json.dumps({"ch": "lookup", "title": au + " -> " + (cid.group(1) if cid else "?")}))
            if cid: rss(cid.group(1))
        except Exception as e: print("RSS " + json.dumps({"ch": v, "err": str(e)[:100]}))
        continue
    if v.startswith("rss:"):
        try: rss(v[4:])
        except Exception as e: print("RSS " + json.dumps({"ch": v, "err": str(e)[:100]}))
        continue
    try: r = check(v)
    except Exception as e: r = {"id": v, "err": str(e)[:120]}
    out.append(r); print("ROW " + json.dumps(r, ensure_ascii=False), flush=True)
