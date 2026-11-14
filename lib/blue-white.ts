import dpmData from "@/data/dpm-blue-white-corpus.json";
import type {
  BlueWhiteArtifact,
  BlueWhiteStats,
  EvidenceRelation,
} from "@/lib/detective-types";

type DpmRecord = {
  id: string;
  sourceId: string;
  museum: string;
  museumShortName: string;
  accessionNumber: string;
  title: string;
  objectName: string;
  period: string;
  periodBucket: string;
  dateText: string;
  medium: string;
  sourceMedium: string;
  summary: string;
  image: string;
  sourceUrl: string;
  sourceLabel: string;
  motifs: string[];
  forms: string[];
};

const periodOrder = [
  "13世纪",
  "14世纪",
  "15世纪",
  "16世纪",
  "17世纪",
  "18世纪",
  "19世纪",
  "20世纪",
  "元代",
  "明代",
  "清代",
  "宋代",
  "辽代",
  "金代",
  "年代待考",
];

function makeArtifact(record: DpmRecord): BlueWhiteArtifact {
  const relations: EvidenceRelation[] = [
    {
      predicate: "藏于",
      object: record.museum,
      evidence: `故宫博物院数字文物库馆藏编号：${record.accessionNumber}`,
      sourceUrl: record.sourceUrl,
      kind: "collection",
    },
    {
      predicate: "工艺",
      object: "陶瓷 · 青花",
      evidence: `故宫博物院陶瓷类馆藏，正式名称明确含“青花”：“${record.title}”`,
      sourceUrl: record.sourceUrl,
      kind: "technique",
    },
    {
      predicate: "文化传统",
      object: "中国青花",
      evidence: `故宫博物院陶瓷类馆藏记录：“${record.title}”`,
      sourceUrl: record.sourceUrl,
      kind: "tradition",
    },
    {
      predicate: "年代",
      object: record.period,
      evidence: `故宫博物院馆藏年代字段：“${record.period}”`,
      sourceUrl: record.sourceUrl,
      kind: "period",
    },
    ...record.motifs
      .filter((motif) => motif !== "纹饰未标注")
      .map((motif) => ({
        predicate: "纹饰线索",
        object: motif,
        evidence: `文物正式名称明确包含“${motif}”相关描述：“${record.title}”`,
        sourceUrl: record.sourceUrl,
        kind: "motif" as const,
      })),
    ...record.forms
      .filter((form) => form !== "陶瓷器")
      .map((form) => ({
        predicate: "器型线索",
        object: form,
        evidence: `文物正式名称支持“${form}”器型线索：“${record.title}”`,
        sourceUrl: record.sourceUrl,
        kind: "form" as const,
      })),
  ];

  return {
    ...record,
    sourceTitle: record.title,
    sourceObjectName: record.title,
    maker: "制作者未标注",
    productionPlace: "中国",
    tradition: "中国青花",
    sourcePeriod: record.period,
    relations,
    analysis: {
      observation: `${record.objectName}。正式名称为“${record.title}”，可核对纹饰线索为${
        record.motifs[0] === "纹饰未标注"
          ? "名称未注明具体纹饰"
          : record.motifs.join("、")
      }。`,
      technique:
        "故宫博物院将记录归入陶瓷类，且正式名称明确含“青花”，据此建立青花工艺关系。",
      chronology: `故宫博物院馆藏年代字段记录为“${record.period}”。`,
      uncertainty:
        "器物关系来自正式名称与馆藏年代字段；更细的工艺、尺寸和图像细节应以故宫博物院原始馆藏页面为准。",
    },
  };
}

export const blueWhiteArtifacts = (
  dpmData as { records: DpmRecord[] }
).records.map(makeArtifact);

export const blueWhiteById = new Map(
  blueWhiteArtifacts.map((artifact) => [artifact.id, artifact]),
);

function countBy(values: string[]) {
  const counts: Record<string, number> = {};
  for (const value of values) counts[value] = (counts[value] ?? 0) + 1;
  return counts;
}

export const blueWhiteStats: BlueWhiteStats = {
  total: blueWhiteArtifacts.length,
  explicitChinese: blueWhiteArtifacts.filter(
    (artifact) => artifact.tradition === "中国青花",
  ).length,
  motifCounts: countBy(
    blueWhiteArtifacts.flatMap((artifact) =>
      artifact.motifs.filter((motif) => motif !== "纹饰未标注"),
    ),
  ),
  traditionCounts: countBy(blueWhiteArtifacts.map((artifact) => artifact.tradition)),
  periodCounts: countBy(blueWhiteArtifacts.map((artifact) => artifact.periodBucket)),
};

export const defaultArtifact =
  blueWhiteArtifacts.find(
    (artifact) =>
      artifact.image &&
      artifact.title.includes("青花") &&
      artifact.motifs.length > 0,
  ) ?? blueWhiteArtifacts[0];

export function periodSortValue(period: string) {
  const index = periodOrder.indexOf(period);
  return index === -1 ? periodOrder.length : index;
}

export function hasMotif(artifact: BlueWhiteArtifact, motif: string) {
  return artifact.motifs.includes(motif);
}

export function getSimilarArtifacts(
  artifact: BlueWhiteArtifact,
  limit = 5,
) {
  return blueWhiteArtifacts
    .filter((candidate) => candidate.id !== artifact.id && candidate.image)
    .map((candidate) => {
      const sharedMotifs = candidate.motifs.filter((motif) =>
        artifact.motifs.includes(motif),
      ).length;
      const sharedForms = candidate.forms.filter((form) =>
        artifact.forms.includes(form),
      ).length;
      const periodScore =
        candidate.periodBucket === artifact.periodBucket ? 1 : 0;
      return {
        artifact: candidate,
        score: sharedMotifs * 6 + sharedForms * 3 + periodScore,
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ artifact: candidate }) => candidate);
}

export function searchBlueWhite(query: string, limit = 6) {
  const normalized = query.toLowerCase();
  return blueWhiteArtifacts
    .map((artifact) => {
      let score = 0;
      for (const motif of artifact.motifs) {
        if (motif !== "纹饰未标注" && normalized.includes(motif)) score += 20;
      }
      for (const form of artifact.forms) {
        if (form !== "陶瓷器" && normalized.includes(form)) score += 10;
      }
      for (const value of [
        artifact.title,
        artifact.objectName,
        artifact.period,
        artifact.medium,
        artifact.tradition,
        artifact.accessionNumber,
      ]) {
        if (value && normalized.includes(value.toLowerCase())) score += 5;
      }
      if (
        normalized.includes(artifact.periodBucket) ||
        (artifact.period && normalized.includes(artifact.period.toLowerCase()))
      ) {
        score += 6;
      }
      return { artifact, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}
