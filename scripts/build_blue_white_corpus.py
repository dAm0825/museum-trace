#!/usr/bin/env python3
"""Build a source-linked Chinese blue-and-white corpus from Met Open Access CSV."""

from __future__ import annotations

import csv
import json
import re
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "work" / "MetObjects.csv"
OUTPUT = ROOT / "data" / "met-blue-white-corpus.json"

MOTIFS = [
    ("龙纹", re.compile(r"\b(dragon|long)\b|龙|龍", re.I)),
    ("凤纹", re.compile(r"\b(phoenix|fenghuang)\b|凤|鳳", re.I)),
    ("缠枝纹", re.compile(r"缠枝|纏枝|scrolling vine|scrollwork", re.I)),
    ("莲纹", re.compile(r"lotus|莲|蓮", re.I)),
    ("牡丹纹", re.compile(r"peony|牡丹", re.I)),
    ("菊纹", re.compile(r"chrysanthemum|菊", re.I)),
    ("梅纹", re.compile(r"\bplum\b|梅", re.I)),
    ("花卉纹", re.compile(r"flower|floral|blossom|花", re.I)),
    ("山水纹", re.compile(r"landscape|mountain|river|山水", re.I)),
    ("人物纹", re.compile(r"figure|figural|personage|人物|高士|仕女", re.I)),
    ("禽鸟纹", re.compile(r"bird|pheasant|duck|goose|parrot|禽|鸟|鳥", re.I)),
    ("鱼藻纹", re.compile(r"\bfish\b|fishpond|鱼|魚", re.I)),
    ("瑞果纹", re.compile(r"fruit|peach|pomegranate|persimmon|grape|果|桃|石榴|柿|葡萄", re.I)),
    ("水波纹", re.compile(r"wave|water|sea|波|海浪|海水", re.I)),
    ("云纹", re.compile(r"cloud|雲|云", re.I)),
    ("几何纹", re.compile(r"geometric|diaper|trellis|几何|幾何", re.I)),
    ("文字纹", re.compile(r"inscription|calligraphy|character|poem|文字|诗句|詩句", re.I)),
    ("人物故事纹", re.compile(r"narrative|story|legend|故事", re.I)),
]

FORMS = [
    ("梅瓶", re.compile(r"meiping|plum vase|梅瓶", re.I)),
    ("抱月瓶", re.compile(r"moon flask|bianhu|抱月瓶|扁壶|扁壺", re.I)),
    ("瓶", re.compile(r"vase|bottle|瓶", re.I)),
    ("罐", re.compile(r"\bjar\b|罐", re.I)),
    ("盘", re.compile(r"dish|plate|saucer|盘|盤", re.I)),
    ("碗", re.compile(r"\bbowl\b|碗", re.I)),
    ("杯", re.compile(r"\bcup\b|beaker|盃|杯", re.I)),
    ("壶", re.compile(r"ewer|teapot|winepot|jug|kettle|壶|壺", re.I)),
    ("盒", re.compile(r"\bbox\b|盒", re.I)),
    ("香炉", re.compile(r"censer|incense burner|香炉|香爐", re.I)),
    ("枕", re.compile(r"pillow|枕", re.I)),
    ("笔筒", re.compile(r"brush pot|brush holder|笔筒|筆筒", re.I)),
    ("瓷板", re.compile(r"\btile\b|plaque|screen|板|屏", re.I)),
]

DYNASTY_PATTERN = re.compile(
    r"\b(Yuan|Ming|Qing|Song|Tang|Sui|Jin|Liao)\b|元|明|清|宋|唐|隋|金|辽|遼|北宋|南宋",
    re.I,
)


def labels(text: str, patterns: list[tuple[str, re.Pattern]], fallback: str) -> list[str]:
    found: list[str] = []
    for label, pattern in patterns:
        if pattern.search(text) and label not in found:
            found.append(label)
    return found[:4] or [fallback]


def normalize_period(row: dict[str, str]) -> str:
    dynasty = row.get("Dynasty", "").strip()
    period = row.get("Period", "").strip()
    date = row.get("Object Date", "").strip()
    if dynasty and DYNASTY_PATTERN.search(dynasty):
        return dynasty
    if period and DYNASTY_PATTERN.search(period):
        return period
    return period or date or "年代未标注"


def matches(row: dict[str, str]) -> bool:
    culture = row.get("Culture", "").lower()
    medium = row.get("Medium", "").lower()
    title = row.get("Title", "").lower()
    department = row.get("Department", "").lower()
    tags = row.get("Tags", "").lower()
    source_text = f"{title} {medium} {tags}"
    return (
        row.get("Is Public Domain", "").lower() == "true"
        and "asian art" in department
        and ("china" in culture or "chinese" in culture)
        and ("underglaze blue" in source_text or "blue-and-white" in source_text)
        and bool(re.search(r"porcelain|stoneware|ceramic|瓷", source_text))
    )


def make_record(row: dict[str, str]) -> dict:
    object_id = row["Object ID"].strip()
    title = row.get("Title", "").strip()
    object_name = row.get("Object Name", "").strip()
    medium = row.get("Medium", "").strip()
    tags = row.get("Tags", "").strip()
    period = normalize_period(row)
    source_url = f"https://www.metmuseum.org/art/collection/search/{object_id}"
    text = " ".join([title, object_name, tags])
    motifs = labels(text, MOTIFS, "纹饰未标注")
    forms = labels(text, FORMS, "器型未标注")
    begin_year_text = row.get("Object Begin Date", "").strip()
    end_year_text = row.get("Object End Date", "").strip()
    begin_year = int(begin_year_text) if re.fullmatch(r"-?\d+", begin_year_text) else None
    end_year = int(end_year_text) if re.fullmatch(r"-?\d+", end_year_text) else None

    relations = [
        {
            "predicate": "藏于",
            "object": "The Metropolitan Museum of Art",
            "evidence": "Open Access 官方馆藏记录",
            "sourceUrl": source_url,
            "kind": "collection",
        },
        {
            "predicate": "工艺",
            "object": "釉下青花" if "underglaze blue" in medium.lower() else "青花瓷",
            "evidence": f"Medium 字段：{medium or '未标注'}",
            "sourceUrl": source_url,
            "kind": "technique",
        },
        {
            "predicate": "年代",
            "object": period,
            "evidence": " / ".join(
                filter(
                    None,
                    [
                        row.get("Dynasty", "").strip(),
                        row.get("Period", "").strip(),
                        row.get("Object Date", "").strip(),
                    ],
                )
            )
            or "年代字段未标注",
            "sourceUrl": source_url,
            "kind": "period",
        },
    ]

    for motif in motifs:
        if motif != "纹饰未标注":
            relations.append(
                {
                    "predicate": "纹饰线索",
                    "object": motif,
                    "evidence": f"标题、器名或 Tags 支持该线索：{text[:240]}",
                    "sourceUrl": source_url,
                    "kind": "motif",
                }
            )

    for form in forms:
        if form != "器型未标注":
            relations.append(
                {
                    "predicate": "器型线索",
                    "object": form,
                    "evidence": f"标题或器名支持该线索：{text[:240]}",
                    "sourceUrl": source_url,
                    "kind": "form",
                }
            )

    motif_text = (
        "馆藏标题与标签没有直接注明具体纹饰，因此不作题材猜测。"
        if motifs == ["纹饰未标注"]
        else f"开放元数据可识别的纹饰线索为{'、'.join(motifs)}；具体构图仍需结合原图核对。"
    )

    return {
        "id": f"met-{object_id}",
        "objectId": object_id,
        "title": title,
        "objectName": object_name,
        "culture": row.get("Culture", "").strip(),
        "dynasty": row.get("Dynasty", "").strip(),
        "periodLabel": row.get("Period", "").strip(),
        "period": period,
        "dateText": row.get("Object Date", "").strip(),
        "beginYear": begin_year,
        "endYear": end_year,
        "medium": medium,
        "dimensions": row.get("Dimensions", "").strip(),
        "classification": row.get("Classification", "").strip(),
        "tags": [tag.strip() for tag in re.split(r"[|;]", tags) if tag.strip()],
        "sourceUrl": source_url,
        "sourceLabel": "The Metropolitan Museum of Art · Open Access",
        "motifs": motifs,
        "forms": forms,
        "relations": relations,
        "analysis": {
            "observation": f"{'；'.join(forms)}。{motif_text}",
            "technique": (
                "Medium 字段直接包含 underglaze blue，可建立“釉下青花”工艺关系。"
                if "underglaze blue" in medium.lower()
                else "Medium 字段支持青花检索，但未使用 underglaze blue 的固定表述。"
            ),
            "chronology": f"馆藏记录将时代标为“{period}”。这是馆藏元数据，不是独立鉴定结论。",
            "uncertainty": (
                "纹饰字段不足，该记录不会作为纹饰—年代关系的强证据。"
                if motifs == ["纹饰未标注"]
                else "纹饰信息来自标题或标签，仍需以高清图像和馆藏说明复核。"
            ),
        },
    }


def main() -> None:
    records: list[dict] = []
    with SOURCE.open("r", encoding="utf-8-sig", newline="") as handle:
        reader = csv.DictReader(handle)
        for row in reader:
            if matches(row):
                records.append(make_record(row))

    records.sort(key=lambda record: (record["beginYear"] is None, record["beginYear"] or 0))
    motif_counts = Counter(
        motif
        for record in records
        for motif in record["motifs"]
        if motif != "纹饰未标注"
    )
    period_counts = Counter(record["period"] for record in records)
    form_counts = Counter(
        form
        for record in records
        for form in record["forms"]
        if form != "器型未标注"
    )

    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text(
        json.dumps(
            {
                "generatedAt": datetime.now(timezone.utc).isoformat(),
                "source": (
                    "The Metropolitan Museum of Art Open Access CSV, filtered to "
                    "public-domain Chinese blue-and-white ceramics."
                ),
                "total": len(records),
                "motifCounts": dict(motif_counts.most_common()),
                "periodCounts": dict(period_counts.most_common()),
                "formCounts": dict(form_counts.most_common()),
                "records": records,
            },
            ensure_ascii=False,
            indent=2,
        ),
        encoding="utf-8",
    )
    print(f"Wrote {len(records)} records to {OUTPUT}")
    print("Motifs:", motif_counts.most_common(20))
    print("Periods:", period_counts.most_common(20))
    print("Forms:", form_counts.most_common(20))


if __name__ == "__main__":
    main()
