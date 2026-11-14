export type EvidenceKind = "馆藏记录" | "历史背景" | "学术解读";

export type Source = {
  title: string;
  publisher: string;
  url: string;
};

export type Evidence = {
  label: string;
  detail: string;
  kind: EvidenceKind;
  sourceIndex: number;
};

export type Artifact = {
  id: string;
  title: string;
  englishTitle: string;
  museum?: string;
  category?: string;
  period: string;
  date: string;
  medium: string;
  image?: string;
  imagePage?: string;
  imagePosition?: string;
  code: string;
  summary: string;
  tags: string[];
  theme: "礼制" | "材料" | "信仰" | "山水" | "日常";
  stop: number;
  accent: string;
  evidence: Evidence[];
  perspectives: {
    adult: string;
    child: string;
    accessible: string;
  };
  sources: Source[];
};

export type CurateInput = {
  prompt: string;
  duration: "20" | "40" | "60";
  audience: "成人" | "亲子" | "专业观众";
  lens: "历史脉络" | "工艺美学" | "文明互鉴";
  seed?: number;
  excludeIds?: string[];
};

export type AgentStep = {
  id: string;
  name: string;
  detail: string;
  state: "done";
};

export type CuratedExhibition = {
  title: string;
  subtitle: string;
  thesis: string;
  routeReason: string;
  artifactIds: string[];
  artifacts: Artifact[];
  agentSteps: AgentStep[];
  generatedAt: string;
  mode: "local-rag";
};
