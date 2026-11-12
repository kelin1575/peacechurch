#!/usr/bin/env python3
"""data/etf_latest.json + content/*.html → etf_report.html"""
import json, os, glob, datetime as dt, html

HERE = os.path.dirname(os.path.abspath(__file__))
D = os.path.join(HERE, "data")

def load(p):
    with open(p, encoding="utf-8") as f:
        return json.load(f)

def read(p, default=""):
    try:
        with open(p, encoding="utf-8") as f:
            return f.read()
    except FileNotFoundError:
        return default

def years_since(yyyymmdd, base):
    try:
        a = dt.datetime.strptime(yyyymmdd, "%Y%m%d"); b = dt.datetime.strptime(base, "%Y%m%d")
        return (b - a).days / 365.25
    except Exception:
        return 0

def long_term_score(i, base):
    """장기투자 적합도 0~100 (토론 합의 기준). 레버리지/인버스는 0."""
    if i.get("leveraged"):
        return 0
    s = 0.0
    fee = i.get("fee") if i.get("fee") is not None else 1.0
    s += max(0, 25 - fee * 50)                       # 보수: 0%→25, 0.5%↑→0
    aum = i.get("aum") or 0
    s += 20 if aum >= 10000 else 15 if aum >= 3000 else 10 if aum >= 1000 else 4   # 규모(억원)
    te = i.get("trackingError")
    s += 15 if te is not None and te < 1 else 10 if te is not None and te < 3 else 4 if te is not None and te < 6 else 0
    y = years_since(i.get("listedDate") or "", base)
    s += 15 if y >= 5 else 10 if y >= 3 else 5 if y >= 1 else 0                      # 운용 이력
    cat = i.get("category", "")
    s += 15 if cat in ("국내 시장지수", "해외 주식", "채권") else 8 if cat in ("원자재", "기타") else 5   # 분산도(테마는 감점)
    r1y = i.get("r1y")
    s += 10 if r1y is not None and r1y > 0 else 0 if r1y is None else 3               # 1년 실적
    return round(min(100, s))

def main():
    cur = load(os.path.join(D, "etf_latest.json"))
    base = cur["baseDate"]
    snaps = sorted(p for p in glob.glob(os.path.join(D, "etf_2*.json")) if os.path.basename(p) < f"etf_{base}.json")
    prev = load(snaps[-1]) if snaps else None
    prev_rank = {}
    if prev:
        for key in ("r1m", "r3m", "r6m"):
            ranked = sorted([x for x in prev["items"] if x.get(key) is not None], key=lambda x: -x[key])
            prev_rank[key] = {x["code"]: n + 1 for n, x in enumerate(ranked)}
    prev_codes = {x["code"] for x in prev["items"]} if prev else set()
    for i in cur["items"]:
        i["lt"] = long_term_score(i, base)
        i["new"] = bool(prev) and i["code"] not in prev_codes
        i["prevRank"] = {k: prev_rank.get(k, {}).get(i["code"]) for k in ("r1m", "r3m", "r6m")}
    payload = {"baseDate": base, "generatedAt": cur["generatedAt"], "minVolume": cur["minVolume"],
               "totalEtfs": cur["totalEtfs"], "prevDate": prev["baseDate"] if prev else None,
               "dropped": sorted([x["name"] for x in prev["items"] if x["code"] not in {i["code"] for i in cur["items"]}]) if prev else [],
               "items": cur["items"]}
    tpl = read(os.path.join(HERE, "template.html"))
    bd = f"{base[:4]}.{base[4:6]}.{base[6:]}"
    out = (tpl.replace("{{DATA}}", json.dumps(payload, ensure_ascii=False).replace("</", "<\\/"))
              .replace("{{BASE_DATE}}", bd)
              .replace("{{ANALYSIS}}", read(os.path.join(HERE, "content", "analysis.html")))
              .replace("{{DAILY_NOTE}}", read(os.path.join(HERE, "content", "daily_note.html"), "<p>첫 수집일입니다. 내일부터 전일 대비 순위 변동이 표시됩니다.</p>")))
    p = os.path.join(HERE, "etf_report.html")
    with open(p, "w", encoding="utf-8") as f:
        f.write(out)
    print(p)

if __name__ == "__main__":
    main()
