export type RelationKind =
  | "collection"
  | "technique"
  | "tradition"
  | "period"
  | "motif"
  | "form";

export type EvidenceRelation = {
  predicate: string;
  object: string;
  evidence: string;
  sourceUrl: string;
  kind: RelationKind;
};

export type ArtifactAnalysis = {
  observation: string;
  technique: string;
  chronology: string;
  uncertainty: string;
};

export type BlueWhiteArtifact = {
  id: string;
  sourceId: string;
  museum: string;
  museumShortName: string;
  accessionNumber: string;
  title: string;
  sourceTitle: string;
  objectName: string;
  sourceObjectName: string;
  maker: string;
  productionPlace: string;
  tradition: string;
  period: string;
  sourcePeriod: string;
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
  relations: EvidenceRelation[];
  analysis: ArtifactAnalysis;
};

export type GraphNode = {
  id: string;
  type:
    | "question"
    | "visual"
    | "artifact"
    | "motif"
    | "period"
    | "form"
    | "conflict";
  label: string;
  detail: string;
};

export type GraphEdge = {
  id: string;
  from: string;
  to: string;
  label: string;
  evidence: string;
  supportCount: number;
  sourceUrls: string[];
};

export type Finding = {
  id: string;
  title: string;
  statement: string;
  evidence: string;
  sourceUrl: string;
  kind: "fact" | "aggregate" | "interpretation";
};

export type Conflict = {
  title: string;
  detail: string;
  questions: string[];
};

export type ToolTrace = {
  name: string;
  status: "complete" | "fallback";
  detail: string;
  durationMs: number;
};

export type VisualObservation = {
  blueRatio?: number;
  brightness?: number;
  dominantColor?: string;
  modelMotifs?: string[];
  modelForms?: string[];
  modelConfidence?: number;
  note?: string;
};

export type InvestigationReport = {
  id: string;
  createdAt: string;
  question: string;
  confidence: number;
  artifact: BlueWhiteArtifact;
  alternatives: Array<{
    id: string;
    title: string;
    museum: string;
    image: string;
    score: number;
  }>;
  visualObservation: VisualObservation;
  nodes: GraphNode[];
  edges: GraphEdge[];
  findings: Finding[];
  conflicts: Conflict[];
  nextQuestions: string[];
  trace: ToolTrace[];
  mode: "evidence-local" | "llm-assisted";
};

export type BlueWhiteStats = {
  total: number;
  explicitChinese: number;
  motifCounts: Record<string, number>;
  traditionCounts: Record<string, number>;
  periodCounts: Record<string, number>;
};
