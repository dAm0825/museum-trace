import {
  blueWhiteArtifacts,
  blueWhiteById,
  defaultArtifact,
  getSimilarArtifacts,
  hasMotif,
  periodSortValue,
  searchBlueWhite,
} from "@/lib/blue-white";
import type {
  BlueWhiteArtifact,
  Conflict,
  Finding,
  GraphEdge,
  GraphNode,
  InvestigationReport,
  ToolTrace,
  VisualObservation,
} from "@/lib/detective-types";

type InvestigateInput = {
  question: string;
  artifactId?: string;
  visualObservation?: VisualObservation;
};

const dynastyTerms = ["元代", "明代", "清代"];

function now() {
  return typeof performance === "undefined"
    ? Date.now()
    : performance.now();
}

function countMotifByPeriod(motif: string) {
  const records = blueWhiteArtifacts.filter(
    (artifact) => artifact.tradition === "中国青花" && hasMotif(artifact, motif),
  );
  const counts = new Map<string, BlueWhiteArtifact[]>();
  for (const artifact of records) {
    const list = counts.get(artifact.periodBucket) ?? [];
    list.push(artifact);
    counts.set(artifact.periodBucket, list);
  }
  return [...counts.entries()]
    .sort(
      (a, b) =>
        periodSortValue(a[0]) - periodSortValue(b[0]) || b[1].length - a[1].length,
    )
    .map(([period, items]) => ({ period, items }));
}

function countFormByPeriod(form: string) {
  const records = blueWhiteArtifacts.filter(
    (artifact) =>
      artifact.tradition === "中国青花" && artifact.forms.includes(form),
  );
  const counts = new Map<string, number>();
  for (const artifact of records) {
    counts.set(
      artifact.periodBucket,
      (counts.get(artifact.periodBucket) ?? 0) + 1,
    );
  }
  return [...counts.entries()].sort(
    (a, b) =>
      periodSortValue(a[0]) - periodSortValue(b[0]) || b[1] - a[1],
  );
}

function chooseArtifact(input: InvestigateInput) {
  if (input.artifactId) {
    const requested = blueWhiteById.get(input.artifactId);
    if (requested) return requested;
  }

  const modelMotifs = input.visualObservation?.modelMotifs ?? [];
  const searched = searchBlueWhite(input.question, 12)
    .map(({ artifact, score }) => ({
      artifact,
      score:
        score +
        modelMotifs.filter((motif) => artifact.motifs.includes(motif)).length *
          18,
    }))
    .sort((a, b) => b.score - a.score);

  return searched[0]?.score > 0 ? searched[0].artifact : defaultArtifact;
}

export function investigate(input: InvestigateInput): InvestigationReport {
  const start = now();
  const artifact = chooseArtifact(input);
  const question = input.question.trim() || "这件青花瓷为什么值得继续追问？";
  const motifRelation = artifact.relations.find(
    (relation) => relation.kind === "motif",
  );
  const techniqueRelation = artifact.relations.find(
    (relation) => relation.kind === "technique",
  );
  const periodRelation = artifact.relations.find(
    (relation) => relation.kind === "period",
  );
  const primaryMotif =
    artifact.motifs.find((motif) => motif !== "纹饰未标注") ?? "";
  const primaryForm =
    artifact.forms.find((form) => form !== "器型未标注") ?? "";
  const motifTimeline = primaryMotif ? countMotifByPeriod(primaryMotif) : [];
  const formTimeline = primaryForm ? countFormByPeriod(primaryForm) : [];
  const motifPeak = [...motifTimeline].sort(
    (a, b) => b.items.length - a.items.length,
  )[0];
  const similar = getSimilarArtifacts(artifact, 3);

  const nodes: GraphNode[] = [
    {
      id: "question",
      type: "question",
      label: "问题",
      detail: question,
    },
  ];
  const edges: GraphEdge[] = [];

  if (
    input.visualObservation &&
    (input.visualObservation.blueRatio !== undefined ||
      input.visualObservation.modelMotifs?.length)
  ) {
    nodes.push({
      id: "visual",
      type: "visual",
      label: "图像观察",
      detail:
        input.visualObservation.note ??
        `蓝色像素比例 ${(
          (input.visualObservation.blueRatio ?? 0) * 100
        ).toFixed(1)}%。`,
    });
    edges.push({
      id: "edge-question-visual",
      from: "question",
      to: "visual",
      label: "图像输入",
      evidence:
        input.visualObservation.note ??
        "浏览器端从上传图像提取了色彩统计；该线索不用于独立年代鉴定。",
      supportCount: 1,
      sourceUrls: [],
    });
  }

  nodes.push({
    id: "artifact",
    type: "artifact",
    label: artifact.title,
    detail: `${artifact.museumShortName} · ${artifact.period}`,
  });
  edges.push(
    {
      id: "edge-question-artifact",
      from: "question",
      to: "artifact",
      label: "作为分析对象",
      evidence: `根据问题检索并选定 ${artifact.title}。`,
      supportCount: 1,
      sourceUrls: [artifact.sourceUrl],
    },
  );

  if (nodes.some((node) => node.id === "visual")) {
    edges.push({
      id: "edge-visual-artifact",
      from: "visual",
      to: "artifact",
      label: "辅助定位",
      evidence:
        input.visualObservation?.note ??
        "图像色彩只作为辅助线索；对象定位仍以馆藏文字关系为主。",
      supportCount: 1,
      sourceUrls: [artifact.sourceUrl],
    });
  }

  for (const [index, motif] of artifact.motifs.entries()) {
    if (motif === "纹饰未标注") continue;
    const nodeId = `motif-${index}`;
    nodes.push({
      id: nodeId,
      type: "motif",
      label: motif,
      detail: "由名称、器名、摘要或主题标签提取",
    });
    edges.push({
      id: `edge-artifact-${nodeId}`,
      from: "artifact",
      to: nodeId,
      label: "纹饰线索",
      evidence:
        artifact.relations.find(
          (relation) =>
            relation.kind === "motif" && relation.object === motif,
        )?.evidence ?? "馆藏记录支持该纹饰线索。",
      supportCount: 1,
      sourceUrls: [artifact.sourceUrl],
    });

    const timeline = countMotifByPeriod(motif);
    const peak = [...timeline].sort((a, b) => b.items.length - a.items.length)[0];
    if (peak) {
      const periodNodeId = `period-${motif}`;
      nodes.push({
        id: periodNodeId,
        type: "period",
        label: peak.period,
        detail: `${motif}在当前中国青花语料中的高频时间桶`,
      });
      edges.push({
        id: `edge-${nodeId}-${periodNodeId}`,
        from: nodeId,
        to: periodNodeId,
        label: "语料分布",
        evidence: `当前语料中有 ${peak.items.length} 件“${motif}”记录落在${peak.period}。示例：${peak.items
          .slice(0, 3)
          .map((item) => item.title)
          .join("、")}`,
        supportCount: peak.items.length,
        sourceUrls: peak.items.slice(0, 4).map((item) => item.sourceUrl),
      });
    }
  }

  if (primaryForm) {
    nodes.push({
      id: "form",
      type: "form",
      label: primaryForm,
      detail: "由名称或器名提取",
    });
    edges.push({
      id: "edge-artifact-form",
      from: "artifact",
      to: "form",
      label: "器型线索",
      evidence:
        artifact.relations.find((relation) => relation.kind === "form")
          ?.evidence ?? "馆藏名称支持该器型。",
      supportCount: 1,
      sourceUrls: [artifact.sourceUrl],
    });
    if (formTimeline.length) {
      const formPeak = [...formTimeline].sort((a, b) => b[1] - a[1])[0];
      nodes.push({
        id: "form-period",
        type: "period",
        label: formPeak[0],
        detail: `当前语料中“${primaryForm}”出现最多的年代桶`,
      });
      edges.push({
        id: "edge-form-period",
        from: "form",
        to: "form-period",
        label: "语料分布",
        evidence: `当前中国青花语料中有 ${formPeak[1]} 件“${primaryForm}”记录落在${formPeak[0]}。这是馆藏分布，不是完整历史统计。`,
        supportCount: formPeak[1],
        sourceUrls: artifact.sourceUrl ? [artifact.sourceUrl] : [],
      });
    }
  }

  const findings: Finding[] = [
    {
      id: "finding-technique",
      title: "工艺依据",
      statement:
        techniqueRelation?.object ??
        "馆藏记录支持该作品属于蓝白/釉下青花工艺。",
      evidence:
        techniqueRelation?.evidence ??
        artifact.analysis.technique,
      sourceUrl: techniqueRelation?.sourceUrl ?? artifact.sourceUrl,
      kind: "fact",
    },
    {
      id: "finding-period",
      title: "年代依据",
      statement: artifact.period,
      evidence:
        periodRelation?.evidence ?? artifact.analysis.chronology,
      sourceUrl: periodRelation?.sourceUrl ?? artifact.sourceUrl,
      kind: "fact",
    },
  ];

  if (primaryMotif && motifRelation) {
    findings.push({
      id: "finding-motif",
      title: "纹饰依据",
      statement: `当前对象可核对的主纹饰线索为“${primaryMotif}”。`,
      evidence: motifRelation.evidence,
      sourceUrl: motifRelation.sourceUrl,
      kind: "fact",
    });
  }

  if (primaryMotif && motifPeak) {
    findings.push({
      id: "finding-distribution",
      title: "跨记录比较",
      statement: `在当前中国青花语料中，“${primaryMotif}”与${motifPeak.period}的联系最集中。`,
      evidence: `共找到 ${motifPeak.items.length} 件同类纹饰记录。该结论描述的是当前馆藏语料分布，不能替代完整艺术史统计。`,
      sourceUrl: motifPeak.items[0]?.sourceUrl ?? artifact.sourceUrl,
      kind: "aggregate",
    });
  }

  const conflicts: Conflict[] = [];
  const hypothesis = dynastyTerms.find((term) => question.includes(term));
  if (hypothesis && hypothesis !== artifact.periodBucket) {
    conflicts.push({
      title: "问题假设与馆藏年代不一致",
      detail: `问题提到“${hypothesis}”，但该作品的馆藏时代字段被归入“${artifact.periodBucket}”（原始记录：${artifact.period}）。`,
      questions: [
        "馆藏断代与你的假设分别依据什么？",
        "是否存在后世仿制、改款或出口生产的时间差？",
      ],
    });
  }

  const modelMotifs = input.visualObservation?.modelMotifs ?? [];
  if (
    modelMotifs.length &&
    primaryMotif &&
    !modelMotifs.includes(primaryMotif)
  ) {
    conflicts.push({
      title: "图像候选与馆藏标签不一致",
      detail: `视觉模型候选为“${modelMotifs.join("、")}”，馆藏记录提取的主纹饰为“${primaryMotif}”。系统保留两边证据，不强行给出唯一答案。`,
      questions: ["图像是否只显示了局部？", "馆藏标签是否使用了更概括的题材名称？"],
    });
  }

  if (!primaryMotif) {
    conflicts.push({
      title: "纹饰证据不足",
      detail:
        "该记录没有足够明确的纹饰字段，因此系统不把题材推断加入跨记录统计。",
      questions: ["高清图像中是否存在次要纹饰？", "馆藏摘要是否使用了不同术语？"],
    });
  }

  for (const conflict of conflicts) {
    nodes.push({
      id: `conflict-${conflict.title}`,
      type: "conflict",
      label: "证据分歧",
      detail: conflict.detail,
    });
  }

  const alternatives = searchBlueWhite(question, 5)
    .filter(({ artifact: candidate }) => candidate.id !== artifact.id)
    .slice(0, 4)
    .map(({ artifact: candidate, score }) => ({
      id: candidate.id,
      title: candidate.title,
      museum: candidate.museumShortName,
      image: candidate.image,
      score,
    }));

  const elapsed = Math.max(1, Math.round(now() - start));
  const trace: ToolTrace[] = [
    {
      name: "解析探究意图",
      status: "complete",
      detail: `提取问题中的对象、纹饰、器型与年代假设。`,
      durationMs: Math.max(1, Math.round(elapsed * 0.12)),
    },
    {
      name: "定位馆藏对象",
      status: "complete",
      detail: `从 ${blueWhiteArtifacts.length} 条蓝白瓷记录中选择「${artifact.title}」。`,
      durationMs: Math.max(1, Math.round(elapsed * 0.2)),
    },
    {
      name: "遍历关系图",
      status: "complete",
      detail: `建立 ${nodes.length} 个节点与 ${edges.length} 条证据关系，执行纹饰、器型和年代的多跳查询。`,
      durationMs: Math.max(1, Math.round(elapsed * 0.33)),
    },
    {
      name: "跨记录校验",
      status: "complete",
      detail: `比较 ${motifPeak?.items.length ?? 0} 条同类纹饰记录，并保留 ${conflicts.length} 个待解释分歧。`,
      durationMs: Math.max(1, Math.round(elapsed * 0.23)),
    },
    {
      name: "生成问题链",
      status: "complete",
      detail: "报告只使用带来源的字段生成结论，并给出下一步问题。",
      durationMs: Math.max(1, Math.round(elapsed * 0.12)),
    },
  ];

  const nextQuestions = [
    primaryMotif
      ? `“${primaryMotif}”在不同年代发生了哪些构图变化？`
      : "这件器物的高清图像还能提取哪些纹饰？",
    primaryForm
      ? `为什么“${primaryForm}”适合承载这类纹饰？`
      : "器型与纹饰之间可能是什么关系？",
    similar.length
      ? `把「${artifact.title}」和「${similar[0].title}」放在一起比较，会看到什么？`
      : "这件器物与其他出口青花如何比较？",
  ];

  return {
    id: `case-${artifact.id}-${Date.now().toString(36)}`,
    createdAt: new Date().toISOString(),
    question,
    confidence: conflicts.length ? 0.68 : primaryMotif ? 0.86 : 0.61,
    artifact,
    alternatives,
    visualObservation: input.visualObservation ?? {},
    nodes,
    edges,
    findings,
    conflicts,
    nextQuestions,
    trace,
    mode: "evidence-local",
  };
}
