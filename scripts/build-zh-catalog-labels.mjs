import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const dataFiles = [
  "data/vam-blue-white-corpus.json",
  "data/met-blue-white-corpus.json",
];

async function readEnvValue(name) {
  const env = await readFile(path.join(root, ".env.local"), "utf8");
  const line = env
    .split(/\r?\n/)
    .find((item) => item.startsWith(`${name}=`));
  if (!line) throw new Error(`${name} is missing from .env.local`);
  return line.slice(name.length + 1).trim();
}

const records = (
  await Promise.all(
    dataFiles.map(async (file) =>
      JSON.parse(await readFile(path.join(root, file), "utf8")).records,
    ),
  )
).flat();

const labels = [
  ...new Set(
    records.flatMap((record) => [record.title, record.objectName]).filter(Boolean),
  ),
].sort((a, b) => a.localeCompare(b));

const mediums = [
  ...new Set(
    records
      .flatMap((record) => [record.materialsAndTechniques, record.medium])
      .filter(Boolean),
  ),
].sort((a, b) => a.localeCompare(b));

const periods = [
  ...new Set(records.map((record) => record.period).filter(Boolean)),
].sort((a, b) => a.localeCompare(b));

const apiKey = await readEnvValue("LLM_API_KEY");
const baseUrl = (await readEnvValue("LLM_BASE_URL")).replace(/\/$/, "");
const model = await readEnvValue("LLM_TEXT_MODEL");

async function translateValues(values, instruction) {
  const translations = {};
  const batchSize = 30;

  for (let start = 0; start < values.length; start += batchSize) {
    const batch = values.slice(start, start + batchSize);
    console.log(`Translating items ${start + 1}-${start + batch.length}`);
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        temperature: 0.05,
        max_tokens: 8_000,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content: `${instruction}只返回 JSON 对象，键必须与输入原文完全一致，值不得包含拉丁字母。繁体中文须转为简体中文。`,
          },
          {
            role: "user",
            content: JSON.stringify(batch),
          },
        ],
      }),
      signal: AbortSignal.timeout(90_000),
    });

    if (!response.ok) {
      throw new Error(`Translation request failed: ${response.status}`);
    }

    const payload = await response.json();
    const content = payload.choices?.[0]?.message?.content ?? "";
    if (!content) {
      throw new Error(
        `Empty translation response: ${payload.choices?.[0]?.finish_reason ?? "unknown"}`,
      );
    }
    Object.assign(translations, JSON.parse(content));
  }

  const missing = values.filter((value) => !translations[value]);
  const latin = Object.entries(translations).filter(
    ([source, value]) =>
      source !== value && /[A-Za-z]/.test(String(value)),
  );

  if (missing.length || latin.length) {
    throw new Error(JSON.stringify({ missing, latin }, null, 2));
  }

  return Object.fromEntries(
    values.map((value) => [value, translations[value]]),
  );
}

const catalogTranslations = await translateValues(
  labels,
  "你是博物馆中文编目专家。把输入的馆藏标题和器名逐项翻译成自然、准确、简洁的简体中文。保持藏品类型和组合关系，专名采用通行音译。",
);
const mediumTranslations = await translateValues(
  mediums,
  "你是中国陶瓷工艺编目专家。把输入的材质与技法描述逐项翻译成准确、简洁的中文术语，保留景德镇窑、釉下青花、釉上彩、金银镶嵌等关键信息。",
);
const periodTranslations = await translateValues(
  periods,
  "你是中国文物年代编目专家。把输入的馆藏年代逐项转换为自然、准确的中文，保留具体年份、世纪、朝代和帝王纪年；区间使用中文连接号。",
);

const output = {
  generatedAt: new Date().toISOString(),
  counts: {
    labels: Object.keys(catalogTranslations).length,
    mediums: Object.keys(mediumTranslations).length,
    periods: Object.keys(periodTranslations).length,
  },
  labels: catalogTranslations,
  mediums: mediumTranslations,
  periods: periodTranslations,
};

await writeFile(
  path.join(root, "data/zh-catalog-labels.json"),
  `${JSON.stringify(output, null, 2)}\n`,
);

console.log(
  `Wrote ${output.counts.labels} labels, ${output.counts.mediums} mediums, and ${output.counts.periods} periods.`,
);
