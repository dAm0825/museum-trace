import vamData from "@/data/vam-blue-white-corpus.json";
import metData from "@/data/met-blue-white-corpus.json";
import type {
  BlueWhiteArtifact,
  BlueWhiteStats,
  EvidenceRelation,
} from "@/lib/detective-types";

type VamRecord = {
  id: string;
  sourceId: string;
  accessionNumber: string;
  title: string;
  objectName: string;
  maker: string;
  productionPlace: string;
  tradition: string;
  period: string;
  dateText: string;
  materialsAndTechniques: string;
  summary: string;
  image: string;
  sourceUrl: string;
  sourceLabel: string;
  motifs: string[];
  forms: string[];
  relations: EvidenceRelation[];
  analysis: {
    observation: string;
    technique: string;
    chronology: string;
    uncertainty: string;
  };
};

type MetRecord = {
  id: string;
  objectId: string;
  title: string;
  objectName: string;
  culture: string;
  period: string;
  dateText: string;
  medium: string;
  sourceUrl: string;
  sourceLabel: string;
  motifs: string[];
  forms: string[];
  relations: EvidenceRelation[];
  analysis: {
    observation: string;
    technique: string;
    chronology: string;
    uncertainty: string;
  };
};

const vamRecords = (vamData as { records: VamRecord[] }).records;
const metRecords = (metData as { records: MetRecord[] }).records;

const formAliases: Array<[RegExp, string]> = [
  [/teabowl/i, "茶碗"],
  [/coffee can|teacup|mug|tankard|stemcup/i, "杯"],
  [/sauce|butter boat|boat/i, "酱汁船"],
  [/tea ?caddy|canister/i, "茶叶罐"],
  [/tray|patty pan/i, "托盘"],
  [/salt|sugar|basin/i, "盛器"],
  [/tureen/i, "盖碗"],
  [/flask|bottle/i, "扁壶"],
  [/vase/i, "瓶"],
  [/dish|plate/i, "盘"],
  [/bowl/i, "碗"],
  [/jar/i, "罐"],
  [/jug|ewer|pot/i, "壶"],
  [/box/i, "盒"],
  [/sprinkler/i, "洒水器"],
  [/tile|tablet/i, "瓷板"],
];

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
  "年代待考",
];

function normalizeForm(value: string) {
  for (const [pattern, replacement] of formAliases) {
    if (pattern.test(value)) return replacement;
  }
  if (/[\u4e00-\u9fff]/.test(value)) return value;
  return value || "器型未标注";
}

function getPeriodBucket(period: string) {
  if (/\b(yuan|元)\b|元代/i.test(period)) return "元代";
  if (/\b(ming|明)\b|明代/i.test(period)) return "明代";
  if (/\b(qing|清)\b|清代/i.test(period)) return "清代";

  const years = [...period.matchAll(/\b(1[2-9]\d{2})\b/g)].map((match) =>
    Number(match[1]),
  );
  if (years.length) {
    const year = Math.min(...years);
    if (year >= 1200 && year < 1300) return "13世纪";
    if (year >= 1300 && year < 1400) return "14世纪";
    if (year >= 1400 && year < 1500) return "15世纪";
    if (year >= 1500 && year < 1600) return "16世纪";
    if (year >= 1600 && year < 1700) return "17世纪";
    if (year >= 1700 && year < 1800) return "18世纪";
    if (year >= 1800 && year < 1900) return "19世纪";
    if (year >= 1900 && year < 2000) return "20世纪";
  }

  if (/14th century/i.test(period)) return "14世纪";
  if (/15th century/i.test(period)) return "15世纪";
  if (/16th century/i.test(period)) return "16世纪";
  if (/17th century/i.test(period)) return "17世纪";
  if (/18th century/i.test(period)) return "18世纪";
  if (/19th century/i.test(period)) return "19世纪";
  return "年代待考";
}

function normalizeVam(record: VamRecord): BlueWhiteArtifact {
  return {
    id: record.id,
    sourceId: record.sourceId,
    museum: "维多利亚与艾尔伯特博物馆",
    museumShortName: "V&A",
    accessionNumber: record.accessionNumber,
    title: record.title,
    objectName: record.objectName,
    maker: record.maker || "制作者未标注",
    productionPlace: record.productionPlace || "制作地未标注",
    tradition: record.tradition || "产地待考",
    period: record.period,
    periodBucket: getPeriodBucket(record.period),
    dateText: record.dateText,
    medium: record.materialsAndTechniques,
    summary: record.summary,
    image: record.image,
    sourceUrl: record.sourceUrl,
    sourceLabel: record.sourceLabel,
    motifs: record.motifs,
    forms: [...new Set(record.forms.map(normalizeForm))],
    relations: record.relations,
    analysis: record.analysis,
  };
}

function normalizeMet(record: MetRecord): BlueWhiteArtifact {
  return {
    id: record.id,
    sourceId: record.objectId,
    museum: "大都会艺术博物馆",
    museumShortName: "The Met",
    accessionNumber: record.objectId,
    title: record.title,
    objectName: record.objectName,
    maker: "制作者未标注",
    productionPlace: record.culture,
    tradition: "中国青花",
    period: record.period,
    periodBucket: getPeriodBucket(record.period),
    dateText: record.dateText,
    medium: record.medium,
    summary: "",
    image: "",
    sourceUrl: record.sourceUrl,
    sourceLabel: record.sourceLabel,
    motifs: record.motifs,
    forms: [...new Set(record.forms.map(normalizeForm))],
    relations: record.relations,
    analysis: record.analysis,
  };
}

export const blueWhiteArtifacts: BlueWhiteArtifact[] = [
  ...vamRecords.map(normalizeVam),
  ...metRecords.map(normalizeMet),
];

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
  blueWhiteById.get("vam-O178815") ??
  blueWhiteArtifacts.find((artifact) => artifact.image) ??
  blueWhiteArtifacts[0];

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
        if (form !== "器型未标注" && normalized.includes(form)) score += 10;
      }
      for (const value of [
        artifact.title,
        artifact.objectName,
        artifact.period,
        artifact.tradition,
        artifact.maker,
        artifact.summary.slice(0, 800),
      ]) {
        if (value && normalized.includes(value.toLowerCase())) score += 5;
      }
      if (normalized.includes(artifact.periodBucket)) score += 6;
      if (artifact.image) score += 1;
      return { artifact, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}
