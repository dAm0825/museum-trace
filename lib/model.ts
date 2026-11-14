import type {
  BlueWhiteArtifact,
  InvestigationReport,
  VisualObservation,
} from "@/lib/detective-types";

type ChatResponse = {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
};

function getConfig() {
  const apiKey =
    process.env.LLM_API_KEY ||
    process.env.OPENAI_API_KEY ||
    process.env.DEEPSEEK_API_KEY ||
    "";
  const baseUrl = (
    process.env.LLM_BASE_URL ||
    process.env.OPENAI_BASE_URL ||
    "https://api.deepseek.com"
  ).replace(/\/$/, "");
  const visionModel =
    process.env.LLM_VISION_MODEL || process.env.OPENAI_MODEL || "deepseek-flash";
  const textModel =
    process.env.LLM_TEXT_MODEL || process.env.OPENAI_MODEL || "deepseek-flash";
  return { apiKey, baseUrl, visionModel, textModel };
}

export function hasModelProvider() {
  return Boolean(getConfig().apiKey);
}

async function callChat(
  model: string,
  messages: Array<Record<string, unknown>>,
) {
  const { apiKey, baseUrl } = getConfig();
  if (!apiKey) return "";

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature: 0.15,
      max_tokens: 2000,
      response_format: { type: "json_object" },
      messages,
    }),
    signal: AbortSignal.timeout(45_000),
  });

  if (!response.ok) throw new Error(`Model request failed: ${response.status}`);
  const data = (await response.json()) as ChatResponse;
  return data.choices?.[0]?.message?.content ?? "";
}

function parseJsonObject(value: string) {
  const cleaned = value
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/\s*```$/, "");
  return JSON.parse(cleaned) as Record<string, unknown>;
}

export async function analyzeImageWithModel(
  imageDataUrl: string,
  allowedMotifs: string[],
  allowedForms: string[],
): Promise<VisualObservation | null> {
  if (!imageDataUrl || !hasModelProvider()) return null;
  const { visionModel } = getConfig();

  try {
    const content = await callChat(visionModel, [
      {
        role: "system",
        content:
          "你是青花瓷视觉研究助手。只描述可见线索，不做真伪或价值鉴定。必须返回 JSON。",
      },
      {
        role: "user",
        content: [
          {
            type: "text",
            text: `观察图片中的青花瓷。候选纹饰必须来自：${allowedMotifs.join(
              "、",
            )}；候选器型必须来自：${allowedForms.join(
              "、",
            )}。返回 {"motifs":[],"forms":[],"dominantColor":"","blueRatio":0,"brightness":0,"confidence":0,"note":""}。看不清就留空并降低 confidence。`,
          },
          { type: "image_url", image_url: { url: imageDataUrl } },
        ],
      },
    ]);
    const parsed = parseJsonObject(content);
    return {
      modelMotifs: Array.isArray(parsed.motifs)
        ? parsed.motifs
            .filter((item): item is string => typeof item === "string")
            .filter((item) => allowedMotifs.includes(item))
            .slice(0, 3)
        : [],
      modelForms: Array.isArray(parsed.forms)
        ? parsed.forms
            .filter((item): item is string => typeof item === "string")
            .filter((item) => allowedForms.includes(item))
            .slice(0, 3)
        : [],
      dominantColor:
        typeof parsed.dominantColor === "string"
          ? parsed.dominantColor
          : undefined,
      blueRatio:
        typeof parsed.blueRatio === "number" ? parsed.blueRatio : undefined,
      brightness:
        typeof parsed.brightness === "number" ? parsed.brightness : undefined,
      modelConfidence:
        typeof parsed.confidence === "number" ? parsed.confidence : undefined,
      note: typeof parsed.note === "string" ? parsed.note : undefined,
    };
  } catch {
    return null;
  }
}

export async function enrichReportWithModel(
  report: InvestigationReport,
  artifact: BlueWhiteArtifact,
) {
  if (!hasModelProvider()) return report;
  const { textModel } = getConfig();

  try {
    const content = await callChat(textModel, [
      {
        role: "system",
        content:
          "你是文物探究报告编辑。只能使用输入中的事实与证据，不得补充没给出的年代、产地或纹饰。输出 JSON：{opening, synthesis, caveat}。",
      },
      {
        role: "user",
        content: JSON.stringify({
          question: report.question,
          artifact: {
            title: artifact.title,
            museum: artifact.museum,
            period: artifact.period,
            medium: artifact.medium,
            motifs: artifact.motifs,
            forms: artifact.forms,
            analysis: artifact.analysis,
          },
          findings: report.findings,
          conflicts: report.conflicts,
        }),
      },
    ]);
    const parsed = parseJsonObject(content);
    const synthesis =
      typeof parsed.synthesis === "string" ? parsed.synthesis.trim() : "";
    if (!synthesis) return report;

    return {
      ...report,
      mode: "llm-assisted" as const,
      findings: [
        ...report.findings,
        {
          id: "finding-synthesis",
          title: "证据综合",
          statement: synthesis,
          evidence:
            "由已列出的馆藏字段和跨记录统计综合生成；不引入外部事实。",
          sourceUrl: artifact.sourceUrl,
          kind: "interpretation" as const,
        },
      ],
    };
  } catch {
    return report;
  }
}
