import { artifacts } from "@/lib/artifacts";
import type { Artifact, CurateInput, CuratedExhibition } from "@/lib/types";

const themeMeta: Record<
  Artifact["theme"],
  { title: string; subtitle: string; thesis: string }
> = {
  礼制: {
    title: "器以载礼",
    subtitle: "从一只酒杯，读懂秩序如何被铸造",
    thesis: "礼不是抽象的规定，它会落在器形、材料、工序与使用场景中。",
  },
  材料: {
    title: "材质的温度",
    subtitle: "泥、火、玉与手：看见器物真正的创作者",
    thesis: "材料从不只是作品的载体，它决定了匠人能和世界建立怎样的关系。",
  },
  信仰: {
    title: "凝视与安放",
    subtitle: "在造像的沉默里，听见时间的回声",
    thesis: "信仰通过身体、姿态与物质保存下来，也在岁月中被不断重写。",
  },
  山水: {
    title: "山水之间",
    subtitle: "古人的一次观看，如何穿过千年抵达我们",
    thesis: "山水画不仅描绘风景，也安排观看者与世界相遇的位置。",
  },
  日常: {
    title: "寻常物的来路",
    subtitle: "被使用过的器物，比陈列更接近生活",
    thesis: "日常器物的形状来自身体、习惯与环境，是文明最细密的注脚。",
  },
};

const keywordMap: Array<{ theme: Artifact["theme"]; words: string[] }> = [
  {
    theme: "礼制",
    words: ["礼", "青铜", "爵", "玉璧", "秩序", "国家", "仪式", "古代"],
  },
  {
    theme: "材料",
    words: ["材料", "工艺", "匠", "玉", "陶瓷", "釉", "火", "青铜", "制作"],
  },
  {
    theme: "信仰",
    words: ["佛", "信仰", "宗教", "造像", "观音", "精神", "安宁", "北魏"],
  },
  {
    theme: "山水",
    words: ["山水", "画", "自然", "风景", "宋", "审美", "艺术", "观看"],
  },
  {
    theme: "日常",
    words: ["生活", "日常", "酒", "花", "衣食", "居住", "普通人"],
  },
];

function scoreArtifact(artifact: Artifact, prompt: string) {
  const normalized = prompt.toLowerCase();
  let score = 0;

  for (const tag of artifact.tags) {
    if (normalized.includes(tag.toLowerCase())) score += 5;
  }

  if (normalized.includes(artifact.theme)) score += 4;
  if (normalized.includes(artifact.period)) score += 4;
  if (normalized.includes(artifact.title)) score += 8;

  return score;
}

function inferTheme(prompt: string): Artifact["theme"] {
  const scores = keywordMap.map(({ theme, words }) => ({
    theme,
    score: words.reduce((total, word) => total + (prompt.includes(word) ? 1 : 0), 0),
  }));
  scores.sort((a, b) => b.score - a.score);
  return scores[0]?.score > 0 ? scores[0].theme : "材料";
}

export function curateExhibition(input: CurateInput): CuratedExhibition {
  const routeLength = input.duration === "20" ? 3 : input.duration === "40" ? 5 : 7;
  const inferredTheme = inferTheme(input.prompt);
  const ranked = artifacts
    .map((artifact) => ({
      artifact,
      score:
        scoreArtifact(artifact, input.prompt) +
        (artifact.theme === inferredTheme ? 6 : 0),
    }))
    .sort((a, b) => b.score - a.score);

  const selected = ranked.slice(0, routeLength).map(({ artifact }) => artifact);
  const meta =
    themeMeta[inferredTheme] ??
    (selected[0] ? themeMeta[selected[0].theme] : themeMeta["材料"]);

  const audienceSuffix =
    input.audience === "亲子"
      ? "· 亲子探索版"
      : input.audience === "专业观众"
        ? "· 研究线索版"
        : "";

  return {
    title: `${meta.title} ${audienceSuffix}`.trim(),
    subtitle: meta.subtitle,
    thesis: `${meta.thesis} 本次路线从“${input.lens}”切入，用 ${selected.length} 件器物建立一条可回看的证据路径。`,
    routeReason: `根据“${input.prompt}”，检索到 ${selected.length} 件馆藏记录。系统优先保留材质、年代与主题证据完整的作品，并控制在你选择的 ${input.duration} 分钟参观时间内。`,
    artifactIds: selected.map((artifact) => artifact.id),
    agentSteps: [
      {
        id: "intent",
        name: "意图解析",
        detail: `识别出「${inferredTheme}」主题、${input.audience}受众与 ${input.duration} 分钟时长。`,
        state: "done",
      },
      {
        id: "retrieve",
        name: "证据检索",
        detail: `在 ${artifacts.length} 件藏品和 ${artifacts.reduce((count, item) => count + item.evidence.length, 0)} 条证据片段中进行相关性排序。`,
        state: "done",
      },
      {
        id: "curate",
        name: "路线编排",
        detail: "按时代、主题与观看节奏组合展品，形成起承转合的微型展览。",
        state: "done",
      },
      {
        id: "guard",
        name: "事实审校",
        detail: "区分馆藏记录、历史背景和学术解读，为每条关键叙述保留来源。",
        state: "done",
      },
    ],
    generatedAt: new Date().toISOString(),
    mode: "local-rag",
  };
}
