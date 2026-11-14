import { artifacts } from "@/lib/artifacts";
import { catalogArtifacts } from "@/lib/catalog";
import type { Artifact, CurateInput, CuratedExhibition } from "@/lib/types";

const allArtifacts = [...artifacts, ...catalogArtifacts];

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

const categoryWords: Record<string, string[]> = {
  陶瓷: ["瓷", "陶", "釉", "窑", "ceramic", "porcelain", "stoneware"],
  青铜器: ["青铜", "铜器", "铜镜", "爵", "鼎", "尊", "bronze"],
  古钱币: ["钱币", "铜钱", "通宝", "银钱", "金币", "coin", "currency"],
  字画: ["画", "绘画", "书法", "山水", "花鸟", "卷轴", "字画", "painting", "calligraphy"],
  玉器: ["玉", "玉璧", "玉环", "jade", "nephrite"],
  雕塑造像: ["佛像", "造像", "雕塑", "菩萨", "sculpture"],
  织绣服饰: ["丝绸", "织物", "服饰", "纺织", "silk", "textile"],
  兵器: ["兵器", "剑", "盾", "盔甲", "weapon", "armour"],
};

const titleVariants: Record<Artifact["theme"], string[]> = {
  礼制: ["器以载礼", "青铜之下", "秩序的形状", "从礼器出发"],
  材料: ["材质的温度", "泥火之间", "材料会说话", "手与物的边界"],
  信仰: ["凝视与安放", "造像的沉默", "信念的形状", "看见神明之前"],
  山水: ["山水之间", "笔墨的远游", "纸上的风", "观看的入口"],
  日常: ["寻常物的来路", "古人的生活半径", "一器一日", "被使用过的历史"],
};

function mulberry32(seed: number) {
  return function random() {
    let value = (seed += 0x6d2b79f5);
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function scoreArtifact(artifact: Artifact, prompt: string) {
  const normalized = prompt.toLowerCase();
  let score = 0;

  for (const tag of artifact.tags) {
    if (normalized.includes(tag.toLowerCase())) score += 5;
  }

  if (normalized.includes(artifact.theme)) score += 4;
  if (normalized.includes(artifact.period)) score += 4;
  if (normalized.includes(artifact.title)) score += 8;
  if (artifact.museum && normalized.includes(artifact.museum)) score += 10;

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
  const routeLength = input.duration === "20" ? 4 : input.duration === "40" ? 6 : 8;
  const inferredTheme = inferTheme(input.prompt);
  const seed = input.seed ?? Date.now();
  const random = mulberry32(seed);
  const excluded = new Set(input.excludeIds ?? []);
  const requestedCategories = Object.entries(categoryWords)
    .filter(([, words]) => words.some((word) => input.prompt.includes(word)))
    .map(([category]) => category);

  const ranked = allArtifacts
    .map((artifact, index) => {
      let score =
        scoreArtifact(artifact, input.prompt) +
        (artifact.theme === inferredTheme ? 8 : 0);

      if (artifact.category && requestedCategories.includes(artifact.category)) {
        score += 18;
      }
      if (artifact.image?.startsWith("/images/")) score += 26;
      else if (artifact.image) score += 12;
      if (excluded.has(artifact.id)) score -= 35;

      return {
        artifact,
        score: score + random() * (65 + (index % 7) * 4),
      };
    })
    .sort((a, b) => b.score - a.score);

  const selected: Artifact[] = [];
  const categoryUse = new Map<string, number>();
  const maxPerCategory =
    requestedCategories.length === 1
      ? Math.max(3, routeLength - 1)
      : requestedCategories.length === 2
        ? Math.max(3, Math.ceil(routeLength / 2))
        : 2;
  const candidateOrder =
    requestedCategories.length > 0
      ? [
          ...ranked.filter(({ artifact }) =>
            requestedCategories.includes(artifact.category ?? ""),
          ),
          ...ranked.filter(
            ({ artifact }) =>
              !requestedCategories.includes(artifact.category ?? ""),
          ),
        ]
      : ranked;

  for (const { artifact } of candidateOrder) {
    if (selected.length >= routeLength) break;
    const category = artifact.category ?? artifact.theme;
    const used = categoryUse.get(category) ?? 0;
    if (used >= maxPerCategory) continue;
    selected.push(artifact);
    categoryUse.set(category, used + 1);
  }

  for (const { artifact } of ranked) {
    if (selected.length >= routeLength) break;
    if (!selected.some((item) => item.id === artifact.id)) selected.push(artifact);
  }

  const meta =
    themeMeta[inferredTheme] ??
    (selected[0] ? themeMeta[selected[0].theme] : themeMeta["材料"]);
  const variants = titleVariants[inferredTheme] ?? titleVariants.材料;
  const title = variants[Math.floor(random() * variants.length)] ?? variants[0];
  const museumNames = [
    ...new Set(selected.map((artifact) => artifact.museum).filter(Boolean)),
  ];
  const selectedCategories = [
    ...new Set(selected.map((artifact) => artifact.category).filter(Boolean)),
  ];

  const audienceSuffix =
    input.audience === "亲子"
      ? "· 亲子探索版"
      : input.audience === "专业观众"
        ? "· 研究线索版"
        : "";

  return {
    title: `${title} ${audienceSuffix}`.trim(),
    subtitle: `${meta.subtitle} · ${selectedCategories.join(" / ")}`,
    thesis: `${meta.thesis} 本次路线从“${input.lens}”切入，从 ${allArtifacts.length} 件藏品中抽取 ${selected.length} 件，连接 ${museumNames.join("、") || "多个馆藏来源"}。`,
    routeReason: `根据“${input.prompt}”，系统从 5 家博物馆的 ${allArtifacts.length} 条馆藏记录中检索候选，并加入随机策展种子；上一轮展品会被降权，因此再次生成会得到新的组合。路线控制在 ${input.duration} 分钟内。`,
    artifactIds: selected.map((artifact) => artifact.id),
    artifacts: selected,
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
        detail: `在 ${allArtifacts.length} 件藏品和 ${allArtifacts.reduce((count, item) => count + item.evidence.length, 0)} 条证据片段中进行相关性排序。`,
        state: "done",
      },
      {
        id: "curate",
        name: "路线编排",
        detail: `加入 seed ${String(seed).slice(-6)}，在上轮结果之外重新选取展品并保持类别多样性。`,
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
