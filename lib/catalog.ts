import catalogData from "@/data/catalog.json";
import type { Artifact, EvidenceKind } from "@/lib/types";

type CatalogRecord = {
  id: string;
  title: string;
  museum: string;
  museumShortName: string;
  category: string;
  type: string;
  period: string;
  material: string;
  inventoryNumber: string;
  image: string;
  imagePage: string;
  source: string;
  sourceLabel: string;
  museumUrl: string;
  accent: string;
};

type CatalogData = {
  generatedAt: string;
  total: number;
  museumCounts: Record<string, number>;
  categoryCounts: Record<string, number>;
  records: CatalogRecord[];
};

const data = catalogData as CatalogData;
const categoryOrder = [
  "陶瓷",
  "青铜器",
  "古钱币",
  "字画",
  "玉器",
  "雕塑造像",
  "织绣服饰",
  "兵器",
  "其他文物",
];

function mapTheme(category: string): Artifact["theme"] {
  if (category === "字画") return "山水";
  if (category === "古钱币" || category === "陶瓷" || category === "玉器") {
    return "材料";
  }
  if (category === "雕塑造像") return "信仰";
  if (category === "青铜器") return "礼制";
  return "日常";
}

function makePerspective(record: CatalogRecord, audience: "adult" | "child" | "accessible") {
  const material =
    record.material === "馆藏资料未标注" ? "材质暂未在开放记录中标明" : record.material;

  if (audience === "child") {
    return `这件“${record.title}”由${record.museum}收藏。它属于${record.category}，年代是${record.period}。${material === "材质暂未在开放记录中标明" ? "馆藏记录暂时没有说明它用什么材料做成。" : `它使用了${material}。`}`;
  }

  if (audience === "accessible") {
    return `文物名称为“${record.title}”，现藏于${record.museum}，归入${record.category}。开放记录标注其年代为${record.period}，${material}。当前数据没有提供可靠的外形尺寸与触觉描述，因此不臆测器物的细节。`;
  }

  return `“${record.title}”现藏于${record.museum}，属于${record.category}。馆藏开放记录将其年代标记为${record.period}，${material}。这一页只使用可核对的字段进行介绍，不把题材猜测写成确定结论。`;
}

function recordToArtifact(record: CatalogRecord, index: number): Artifact {
  const evidence: Array<{
    label: string;
    detail: string;
    kind: EvidenceKind;
    sourceIndex: number;
  }> = [
    {
      label: "馆藏归属",
      detail: `${record.title}的馆藏记录关联至${record.museum}，藏品编号为${record.inventoryNumber}。`,
      kind: "馆藏记录",
      sourceIndex: 0,
    },
    {
      label: "分类与年代",
      detail: `当前目录将其归入“${record.category}”，开放记录中的年代为${record.period}。分类用于策展检索，不等同于最终鉴定。`,
      kind: "历史背景",
      sourceIndex: 0,
    },
    {
      label: "信息边界",
      detail:
        record.material === "馆藏资料未标注"
          ? "该记录暂未提供材质，讲解中不补写未经来源支持的材质信息。"
          : `记录标注的材质为${record.material}；具体工艺、用途与出土情境仍需查阅该馆正式研究资料。`,
      kind: "学术解读",
      sourceIndex: 1,
    },
  ];

  return {
    id: record.id,
    title: record.title,
    englishTitle: record.type || record.category,
    museum: record.museum,
    category: record.category,
    period: record.period,
    date: record.period,
    medium: record.material,
    image: record.image || undefined,
    imagePage: record.imagePage || undefined,
    code: `${record.museumShortName}·${String(index + 1).padStart(4, "0")}`,
    summary: `${record.title}现藏于${record.museum}。开放记录将其归入${record.category}，年代为${record.period}。`,
    tags: [
      record.title,
      record.museum,
      record.category,
      record.type,
      record.period,
      record.material,
      record.inventoryNumber,
    ].filter(Boolean),
    theme: mapTheme(record.category),
    stop: index + 1,
    accent: record.accent,
    evidence,
    perspectives: {
      adult: makePerspective(record, "adult"),
      child: makePerspective(record, "child"),
      accessible: makePerspective(record, "accessible"),
    },
    sources: [
      {
        title: record.sourceLabel,
        publisher: record.museum,
        url: record.source,
      },
      {
        title: `${record.museum}官方馆藏入口`,
        publisher: record.museum,
        url: record.museumUrl,
      },
    ],
  };
}

export const catalogArtifacts = data.records.map(recordToArtifact);

export const catalogStats = {
  generatedAt: data.generatedAt,
  total: catalogArtifacts.length,
  museumCounts: data.museumCounts,
  categoryCounts: Object.fromEntries(
    categoryOrder
      .filter((category) => data.categoryCounts[category])
      .map((category) => [category, data.categoryCounts[category]]),
  ) as Record<string, number>,
  museums: Object.keys(data.museumCounts),
  categories: categoryOrder.filter((category) => data.categoryCounts[category]),
};
