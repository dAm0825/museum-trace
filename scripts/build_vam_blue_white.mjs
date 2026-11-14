import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dataDirectory = path.join(projectRoot, "data");
const outputPath = path.join(dataDirectory, "vam-blue-white-corpus.json");
const checkpointPath = path.join(dataDirectory, "vam-blue-white-checkpoint.json");
const targetCount = 1100;
const concurrency = 7;

const searchQueries = [
  "Chinese porcelain underglaze blue",
  "Chinese blue and white porcelain",
  "Ming dynasty blue and white porcelain",
  "Qing dynasty blue and white porcelain",
];

const motifPatterns = [
  { label: "龙纹", pattern: /\bdragon\b|龙|龍/i },
  { label: "凤纹", pattern: /\b(phoenix|fenghuang)\b|凤|鳳/i },
  { label: "缠枝纹", pattern: /缠枝|纏枝|scrolling vine|scrollwork/i },
  { label: "莲纹", pattern: /lotus|莲|蓮/i },
  { label: "牡丹纹", pattern: /peony|牡丹/i },
  { label: "菊纹", pattern: /chrysanthemum|菊/i },
  { label: "梅纹", pattern: /\bplum\b|梅/i },
  { label: "花卉纹", pattern: /flower|floral|blossom|花/i },
  { label: "山水纹", pattern: /landscape|mountain|river|山水/i },
  { label: "人物纹", pattern: /figure|figural|personage|lady|ladies|woman|women|人物|高士|仕女/i },
  { label: "禽鸟纹", pattern: /bird|pheasant|duck|goose|parrot|禽|鸟|鳥/i },
  { label: "鱼藻纹", pattern: /\bfish\b|fishpond|鱼|魚/i },
  { label: "瑞果纹", pattern: /fruit|peach|pomegranate|persimmon|grape|果|桃|石榴|柿|葡萄/i },
  { label: "水波纹", pattern: /wave|water|sea|波|海浪|海水/i },
  { label: "云纹", pattern: /cloud|雲|云/i },
  { label: "几何纹", pattern: /geometric|diaper|trellis|几何|幾何/i },
  { label: "文字纹", pattern: /inscription|calligraphy|character|poem|文字|诗句|詩句/i },
  { label: "人物故事纹", pattern: /narrative|story|legend|故事/i },
];

const formPatterns = [
  { label: "梅瓶", pattern: /meiping|plum vase|梅瓶/i },
  { label: "抱月瓶", pattern: /moon flask|bianhu|抱月瓶|扁壶|扁壺/i },
  { label: "瓶", pattern: /vase|bottle|瓶/i },
  { label: "罐", pattern: /\bjar\b|罐/i },
  { label: "盘", pattern: /dish|plate|saucer|盘|盤/i },
  { label: "碗", pattern: /\bbowl\b|碗/i },
  { label: "杯", pattern: /\bcup\b|beaker|盃|杯/i },
  { label: "壶", pattern: /ewer|teapot|winepot|jug|kettle|壶|壺/i },
  { label: "盒", pattern: /\bbox\b|盒/i },
  { label: "香炉", pattern: /censer|incense burner|香炉|香爐/i },
  { label: "枕", pattern: /pillow|枕/i },
  { label: "笔筒", pattern: /brush pot|brush holder|笔筒|筆筒/i },
  { label: "瓷板", pattern: /\btile\b|plaque|screen|板|屏/i },
];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchJson(url, attempts = 4) {
  let lastError;
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      const response = await fetch(url, {
        headers: {
          Accept: "application/json",
          "User-Agent": "BlueWhiteDetective/1.0 (museum education project)",
        },
        signal: AbortSignal.timeout(30_000),
      });
      if (response.status === 429 || response.status >= 500) {
        throw new Error(`Retryable HTTP ${response.status}`);
      }
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (error) {
      lastError = error;
      if (attempt < attempts - 1) await sleep(500 * 2 ** attempt);
    }
  }
  throw lastError;
}

function clean(value) {
  return typeof value === "string" ? value.trim() : "";
}

function extractLabels(text, patterns, fallback) {
  const found = patterns
    .filter(({ pattern }) => pattern.test(text))
    .map(({ label }) => label);
  return [...new Set(found)].slice(0, 4).length
    ? [...new Set(found)].slice(0, 4)
    : [fallback];
}

function detailText(detail) {
  return [
    ...(detail.titles ?? []).map((title) => title.title),
    detail.objectType,
    detail.summaryDescription,
    detail.materialsAndTechniques,
    ...(detail.styles ?? []).map((style) => style.text),
  ]
    .filter(Boolean)
    .join(" ");
}

function normalizePeriod(detail) {
  const productionDate = detail.productionDates?.[0]?.date?.text;
  return clean(productionDate) || "年代未标注";
}

function inferTradition(text) {
  if (/\b(china|chinese|jingdezhen)\b|中国|景德镇|景德鎮/i.test(text)) return "中国青花";
  if (/\b(korea|korean|choson|chosen|koryo)\b|朝鲜|朝鮮|高丽|高麗/i.test(text)) {
    return "朝鲜半岛蓝白瓷";
  }
  if (/\b(japan|japanese|arita|imari|kyoto)\b|日本|伊万里|有田/i.test(text)) {
    return "日本蓝白瓷";
  }
  if (/\b(iran|persia|samarqand|syria|damascus|islamic)\b|伊朗|波斯|撒马尔罕|叙利亚/i.test(text)) {
    return "伊斯兰蓝白陶";
  }
  if (/\b(england|english|britain|british|worcester|delft|staffordshire|europe)\b|英国|歐洲|欧洲/i.test(text)) {
    return "欧洲蓝白瓷";
  }
  return "产地待考";
}

function isValidDetail(detail) {
  const media = [
    detail.materialsAndTechniques,
    detail.summaryDescription,
    ...(detail.styles ?? []).map((style) => style.text),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return (
    Array.isArray(detail.images) &&
    detail.images.length > 0 &&
    /porcelain/.test(media) &&
    /underglaze blue|blue[-\s]and[-\s]white|blue and white|cobalt blue|painted in blue/.test(
      media,
    )
  );
}

function isValidRecord(record) {
  return (
    record.image &&
    /porcelain/i.test(record.materialsAndTechniques) &&
    /underglaze blue|blue[-\s]and[-\s]white|blue and white|cobalt blue|painted in blue/i.test(
      `${record.materialsAndTechniques} ${record.summary}`,
    )
  );
}

function imageFor(primaryImageId) {
  return primaryImageId
    ? `https://framemark.vam.ac.uk/collections/${primaryImageId}/full/!900,900/0/default.jpg`
    : "";
}

function makeRecord(searchRecord, detail) {
  const systemNumber = searchRecord.systemNumber;
  const title =
    clean(detail.titles?.[0]?.title) ||
    clean(searchRecord._primaryTitle) ||
    clean(detail.objectType) ||
    `V&A ${systemNumber}`;
  const objectName = clean(detail.objectType);
  const medium = clean(detail.materialsAndTechniques);
  const maker = clean(detail.artistMakerPerson?.[0]?.name?.text) ||
    clean(searchRecord._primaryMaker?.name);
  const productionPlace =
    clean(detail.productionPlaces?.[0]?.place?.text) ||
    clean(searchRecord._primaryPlace);
  const period = normalizePeriod(detail);
  const sourceUrl = `https://collections.vam.ac.uk/item/${systemNumber}/`;
  const imageId =
    detail.images?.[0] ||
    searchRecord._primaryImageId ||
    "";
  const motifText = `${title} ${objectName} ${detail.summaryDescription ?? ""} ${medium}`;
  const tradition = inferTradition(`${motifText} ${productionPlace}`);
  const motifs = extractLabels(motifText, motifPatterns, "纹饰未标注");
  const forms = extractLabels(
    `${title} ${objectName}`,
    formPatterns,
    objectName || "器型未标注",
  );
  const lowerMedium = medium.toLowerCase();
  const technique =
    /underglaze blue|blue[-\s]and[-\s]white/.test(lowerMedium)
      ? "釉下青花"
      : "青花瓷";

  const relations = [
    {
      predicate: "藏于",
      object: "Victoria and Albert Museum",
      evidence: `馆藏编号：${detail.accessionNumber || systemNumber}`,
      sourceUrl,
      kind: "collection",
    },
    {
      predicate: "工艺",
      object: technique,
      evidence: `材质与技法字段：“${medium || "未标注"}”`,
      sourceUrl,
      kind: "technique",
    },
    {
      predicate: "文化传统",
      object: tradition,
      evidence: `材质、摘要与制作地线索：“${motifText.slice(0, 220)}”`,
      sourceUrl,
      kind: "tradition",
    },
    {
      predicate: "年代",
      object: period,
      evidence: `制作年代字段：“${period}”`,
      sourceUrl,
      kind: "period",
    },
    ...motifs
      .filter((motif) => motif !== "纹饰未标注")
      .map((motif) => ({
        predicate: "纹饰线索",
        object: motif,
        evidence: `名称或官方摘要支持该线索：“${motifText.slice(0, 220)}”`,
        sourceUrl,
        kind: "motif",
      })),
    ...forms
      .filter((form) => form !== "器型未标注")
      .map((form) => ({
        predicate: "器型线索",
        object: form,
        evidence: `名称或器名支持该线索：“${`${title} ${objectName}`.slice(0, 180)}”`,
        sourceUrl,
        kind: "form",
      })),
  ];

  const motifAnalysis =
    motifs[0] === "纹饰未标注"
      ? "官方名称和摘要没有提供具体纹饰线索，不进行题材猜测。"
      : `可核对纹饰线索为${motifs.join("、")}；具体构图仍需结合高清图与摘要原文核对。`;

  return {
    id: `vam-${systemNumber}`,
    sourceId: systemNumber,
    accessionNumber: clean(detail.accessionNumber) || clean(searchRecord.accessionNumber),
    title,
    objectName,
    maker,
    productionPlace,
    tradition,
    period,
    dateText: period,
    materialsAndTechniques: medium,
    summary: clean(detail.summaryDescription),
    image: imageFor(imageId),
    sourceUrl,
    sourceLabel: "Victoria and Albert Museum · Collections API",
    motifs,
    forms,
    relations,
    analysis: {
      observation: `${forms.join("、")}。${motifAnalysis}`,
      technique: `官方材质与技法记录为“${medium || "未标注"}”，据此建立“${technique}”关系。`,
      chronology: `官方制作年代记录为“${period}”。该结论保留为馆藏元数据。`,
      uncertainty:
        motifs[0] === "纹饰未标注"
          ? "纹饰信息不足，因此不加入纹饰—年代统计的强证据。"
          : "纹饰由标题、器名或摘要关键词提取，仍需回到完整馆藏记录确认。",
    },
  };
}

async function collectCandidates() {
  const ids = new Set();
  for (const query of searchQueries) {
    let page = 1;
    while (page <= 12 && ids.size < 2200) {
      const url = new URL("https://api.vam.ac.uk/v2/objects/search");
      url.searchParams.set("q", query);
      url.searchParams.set("images_exist", "1");
      url.searchParams.set("page_size", "100");
      url.searchParams.set("page", String(page));
      const result = await fetchJson(url.toString());
      for (const record of result.records ?? []) ids.add(record.systemNumber);
      if (page >= (result.info?.pages ?? 1)) break;
      page += 1;
    }
    console.log(`“${query}” collected; ${ids.size} unique IDs.`);
  }
  return [...ids];
}

async function loadCheckpoint() {
  try {
    const checkpoint = JSON.parse(await readFile(checkpointPath, "utf8"));
    checkpoint.records = checkpoint.records.map((record) => {
      const tradition =
        record.tradition ||
        inferTradition(
          `${record.title} ${record.objectName} ${record.summary} ${record.materialsAndTechniques}`,
        );
      const motifText = `${record.title} ${record.objectName} ${record.summary} ${record.materialsAndTechniques}`;
      const motifs = extractLabels(motifText, motifPatterns, "纹饰未标注");
      const forms = extractLabels(
        `${record.title} ${record.objectName}`,
        formPatterns,
        record.objectName || "器型未标注",
      );
      const hasTraditionRelation = record.relations.some(
        (relation) => relation.kind === "tradition",
      );
      const motifSummary =
        motifs[0] === "纹饰未标注"
          ? "官方名称和摘要没有提供具体纹饰线索，不进行题材猜测。"
          : `可核对纹饰线索为${motifs.join("、")}；具体构图仍需结合高清图与摘要原文核对。`;
      return {
        ...record,
        tradition,
        motifs,
        forms,
        analysis: {
          ...record.analysis,
          observation: `${forms.join("、")}。${motifSummary}`,
          uncertainty:
            motifs[0] === "纹饰未标注"
              ? "纹饰信息不足，因此不加入纹饰—年代统计的强证据。"
              : "纹饰由标题、器名或摘要关键词提取，仍需回到完整馆藏记录确认。",
        },
        relations: hasTraditionRelation
          ? [
              ...record.relations.filter(
                (relation) =>
                  relation.kind !== "motif" && relation.kind !== "form",
              ),
              ...motifs
                .filter((motif) => motif !== "纹饰未标注")
                .map((motif) => ({
                  predicate: "纹饰线索",
                  object: motif,
                  evidence: `名称、摘要或技法支持该线索：“${motifText.slice(0, 220)}”`,
                  sourceUrl: record.sourceUrl,
                  kind: "motif",
                })),
              ...forms
                .filter((form) => form !== "器型未标注")
                .map((form) => ({
                  predicate: "器型线索",
                  object: form,
                  evidence: `名称或摘要支持该器型线索：“${`${record.title} ${record.objectName}`.slice(0, 180)}”`,
                  sourceUrl: record.sourceUrl,
                  kind: "form",
                })),
            ]
          : [
              ...record.relations.filter(
                (relation) =>
                  relation.kind !== "motif" && relation.kind !== "form",
              ),
              {
                predicate: "文化传统",
                object: tradition,
                evidence: `名称、摘要与材质线索：“${`${record.title} ${record.summary} ${record.materialsAndTechniques}`.slice(0, 220)}”`,
                sourceUrl: record.sourceUrl,
                kind: "tradition",
              },
              ...motifs
                .filter((motif) => motif !== "纹饰未标注")
                .map((motif) => ({
                  predicate: "纹饰线索",
                  object: motif,
                  evidence: `名称、摘要或技法支持该线索：“${motifText.slice(0, 220)}”`,
                  sourceUrl: record.sourceUrl,
                  kind: "motif",
                })),
              ...forms
                .filter((form) => form !== "器型未标注")
                .map((form) => ({
                  predicate: "器型线索",
                  object: form,
                  evidence: `名称或摘要支持该器型线索：“${`${record.title} ${record.objectName}`.slice(0, 180)}”`,
                  sourceUrl: record.sourceUrl,
                  kind: "form",
                })),
            ],
      };
    });
    return checkpoint;
  } catch {
    return { processedIds: [], records: [] };
  }
}

async function saveCheckpoint(checkpoint) {
  await mkdir(dataDirectory, { recursive: true });
  await writeFile(checkpointPath, JSON.stringify(checkpoint), "utf8");
}

async function main() {
  const checkpoint = await loadCheckpoint();
  const processed = new Set(checkpoint.processedIds);
  const recordsById = new Map(
    checkpoint.records
      .filter(isValidRecord)
      .map((record) => [record.id, record]),
  );
  const candidates = await collectCandidates();
  const remaining = candidates.filter((id) => !processed.has(id));
  console.log(`Candidates ${candidates.length}; remaining ${remaining.length}.`);

  let cursor = 0;
  let completed = 0;
  const workers = Array.from({ length: concurrency }, async () => {
    while (cursor < remaining.length && recordsById.size < targetCount) {
      const currentIndex = cursor;
      cursor += 1;
      const systemNumber = remaining[currentIndex];
      try {
        const detailResponse = await fetchJson(
          `https://api.vam.ac.uk/v2/museumobject/${systemNumber}`,
          4,
        );
        const detail = detailResponse.record;
        processed.add(systemNumber);
        if (detail && isValidDetail(detail)) {
          const searchRecord = { systemNumber };
          const record = makeRecord(searchRecord, detail);
          recordsById.set(record.id, record);
        }
      } catch {
        // Preserve progress if one museum record is unavailable.
      }
      completed += 1;
      if (completed % 100 === 0) {
        console.log(
          `Evaluated ${completed}; valid ${recordsById.size}; processed ${processed.size}.`,
        );
        await saveCheckpoint({
          processedIds: [...processed],
          records: [...recordsById.values()],
        });
      }
    }
  });
  await Promise.all(workers);

  const records = [...recordsById.values()].slice(0, targetCount);
  if (records.length < 1000) {
    throw new Error(`Only ${records.length} validated V&A records; checkpoint kept.`);
  }

  const motifCounts = {};
  const periodCounts = {};
  const formCounts = {};
  for (const record of records) {
    for (const motif of record.motifs) {
      if (motif !== "纹饰未标注") motifCounts[motif] = (motifCounts[motif] ?? 0) + 1;
    }
    periodCounts[record.period] = (periodCounts[record.period] ?? 0) + 1;
    for (const form of record.forms) {
      if (form !== "器型未标注") formCounts[form] = (formCounts[form] ?? 0) + 1;
    }
  }

  await writeFile(
    outputPath,
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        source: "Victoria and Albert Museum Collections API",
        total: records.length,
        motifCounts,
        periodCounts,
        formCounts,
        records,
      },
      null,
      2,
    ),
    "utf8",
  );
  console.log(`Wrote ${records.length} V&A records.`);
  console.log("Motifs:", motifCounts);
  console.log("Periods:", periodCounts);
  console.log("Forms:", formCounts);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
