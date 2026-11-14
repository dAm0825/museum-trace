import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputDirectory = path.join(projectRoot, "data");
const outputFile = path.join(outputDirectory, "catalog.json");

const museums = [
  {
    qid: "Q2047427",
    name: "故宫博物院",
    shortName: "故宫",
    target: 650,
    imageRequired: true,
    officialUrl: "https://www.dpm.org.cn/collection.html",
  },
  {
    qid: "Q6373",
    name: "大英博物馆",
    shortName: "大英博物馆",
    target: 350,
    imageRequired: true,
    officialUrl: "https://www.britishmuseum.org/collection",
  },
  {
    qid: "Q1151210",
    name: "陕西历史博物馆",
    shortName: "陕历博",
    target: 120,
    imageRequired: false,
    officialUrl: "https://www.sxhm.com/",
  },
  {
    qid: "Q1815891",
    name: "南京博物院",
    shortName: "南京博物院",
    target: 5,
    imageRequired: false,
    officialUrl: "https://www.njmuseum.com/",
  },
];

const metQueries = [
  { query: "chinese bronze", category: "青铜器", limit: 55 },
  { query: "chinese porcelain", category: "陶瓷", limit: 55 },
  { query: "chinese jade", category: "玉器", limit: 35 },
  { query: "chinese coin", category: "古钱币", limit: 25 },
  { query: "chinese painting", category: "字画", limit: 55 },
];

const sleep = (milliseconds) =>
  new Promise((resolve) => setTimeout(resolve, milliseconds));

async function fetchJson(url, options = {}, attempts = 4) {
  let lastError;

  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          Accept: "application/json",
          "User-Agent":
            "MuseumTraceCompetition/1.0 (open collection research; contact: project demo)",
          ...options.headers,
        },
        signal: AbortSignal.timeout(120_000),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status} for ${url}`);
      }

      return await response.json();
    } catch (error) {
      lastError = error;
      if (attempt < attempts - 1) {
        await sleep(1000 * (attempt + 1));
      }
    }
  }

  throw lastError;
}

function getBindingValue(binding, key) {
  return binding[key]?.value?.trim() ?? "";
}

function normalizeImageUrl(value) {
  if (!value) return "";
  try {
    const imageUrl = new URL(value.replace(/^http:/, "https:"));
    imageUrl.searchParams.set("width", "900");
    return imageUrl.toString();
  } catch {
    return "";
  }
}

function getCommonsPage(value) {
  if (!value) return "";
  try {
    const imageUrl = new URL(value);
    const fileName = decodeURIComponent(
      imageUrl.pathname.split("/Special:FilePath/")[1] ?? "",
    );
    return fileName
      ? `https://commons.wikimedia.org/wiki/File:${encodeURIComponent(fileName)}`
      : "";
  } catch {
    return "";
  }
}

function normalizeTypes(types) {
  return types
    .split("|")
    .map((type) => type.trim())
    .filter(Boolean)
    .filter((type) => !["收藏品", "維基媒體重複頁面"].includes(type));
}

function normalizeMaterial(materials) {
  const clean = [...new Set(
    materials
      .split("|")
      .map((material) => material.trim())
      .filter(Boolean),
  )];
  return clean.join("、");
}

function inferCategory(title, types, materials, fallback = "") {
  const haystack = `${title} ${types} ${materials}`.toLowerCase();

  if (
    /(硬幣|硬币|貨幣|货币|铜币|銅幣|coin|通宝|通寶|银钱|銀錢|金币|金幣|铜钱|銅錢|钱币|錢幣|银铤|銀鋌|银饼|銀餅|florin|denarius|aureus|drachm|stater|shilling|penny)/i.test(
      haystack,
    )
  ) {
    return "古钱币";
  }
  if (
    /(瓷器|青花|粉彩|珐琅|琺瑯|三彩|陶瓷|陶器|陶俑|porcelain|ceramic|stoneware|釉|窑|窯)/i.test(
      haystack,
    )
  ) {
    return "陶瓷";
  }
  if (/(青铜|青銅|bronze|铜镜|銅鏡|铜器|銅器)/i.test(haystack)) {
    return "青铜器";
  }
  if (/(玉器|jade|nephrite|玉璧|玉环|玉環)/i.test(haystack)) {
    return "玉器";
  }
  if (
    /(書法|书法|畫作|画作|绘画|繪畫|painting|calligraphy|版画|版畫|素描|水彩|etching|woodblock|ink)/i.test(
      haystack,
    ) ||
    /(图|圖|画|畫|卷|軸|轴|册|冊|页|頁|扇|书法|書法|山水|花鸟|花鳥|墨迹|墨跡|写生|寫生)/.test(
      title,
    )
  ) {
    return "字画";
  }
  if (/(雕塑|塑像|造像|sculpture|figure|雕像)/i.test(haystack)) {
    return "雕塑造像";
  }
  if (/(丝绸|絲綢|织物|織物|textile|silk|服饰|服飾)/i.test(haystack)) {
    return "织绣服饰";
  }
  if (/(武器|剑|劍|斧|刀|weapon|armour|armor)/i.test(haystack)) {
    return "兵器";
  }
  return fallback || "其他文物";
}

function formatPeriod(value, title, category = "") {
  if (!value) {
    const explicitEra = title.match(
      /^(新石器时代|新石器時代|夏代|商代|西周|东周|東周|春秋|战国|戰國|秦代|汉代|漢代|三国|三國|晋代|晉代|隋代|唐代|宋代|辽代|遼代|金代|元代|明代|清代|民国|民國)/,
    );
    if (explicitEra?.[0]) return explicitEra[0];

    const personEra = title.match(
      /^(夏|商|秦|汉|漢|晋|晉|隋|唐|宋|辽|遼|金|元|明|清)人/,
    );
    if (personEra?.[1]) return `${personEra[1]}代`;

    if (category !== "字画") {
      const objectEra = title.match(
        /^(夏|商|秦|汉|漢|晋|晉|隋|唐|宋|辽|遼|金|元|明|清)/,
      );
      if (objectEra?.[0]) return `${objectEra[0]}代`;
    }

    return "年代待考";
  }
  const match = value.match(/^(-?\d{1,4})-(\d{2})-(\d{2})/);
  if (!match) return value;
  const year = Number(match[1]);
  if (year < 0) return `公元前 ${Math.abs(year)} 年`;
  return `${year} 年`;
}

function categoryAccent(category) {
  return (
    {
      青铜器: "#587061",
      陶瓷: "#60778b",
      古钱币: "#9b7a42",
      字画: "#8b6a4e",
      玉器: "#6d8068",
      雕塑造像: "#8a6553",
      织绣服饰: "#9a5750",
      兵器: "#59606b",
    }[category] ?? "#6c746b"
  );
}

async function fetchWikidataMuseum(museum) {
  const imageTriple = museum.imageRequired ? "?item wdt:P18 ?image." : "";
  const query = `
    SELECT ?item ?itemLabel ?museumLabel
      (GROUP_CONCAT(DISTINCT ?typeLabel; separator="|") AS ?types)
      (GROUP_CONCAT(DISTINCT ?materialLabel; separator="|") AS ?materials)
      (SAMPLE(?date) AS ?date)
      (SAMPLE(?image) AS ?image)
      (SAMPLE(?inventory) AS ?inventory)
    WHERE {
      VALUES ?museum { wd:${museum.qid} }
      ?item wdt:P195 ?museum.
      ${imageTriple}
      OPTIONAL { ?item wdt:P31 ?type. }
      OPTIONAL { ?item wdt:P186 ?material. }
      OPTIONAL { ?item wdt:P571 ?date. }
      OPTIONAL { ?item wdt:P217 ?inventory. }
      SERVICE wikibase:label {
        bd:serviceParam wikibase:language "zh,en".
      }
    }
    GROUP BY ?item ?itemLabel ?museumLabel
    LIMIT ${museum.target}
  `;
  const endpoint = new URL("https://query.wikidata.org/sparql");
  endpoint.searchParams.set("query", query);
  endpoint.searchParams.set("format", "json");

  const data = await fetchJson(endpoint.toString(), {
    headers: { Accept: "application/sparql-results+json" },
  });

  const seen = new Set();
  return data.results.bindings
    .map((row) => {
      const itemUrl = getBindingValue(row, "item");
      const qid = itemUrl.split("/").pop();
      const title = getBindingValue(row, "itemLabel");
      const types = normalizeTypes(getBindingValue(row, "types"));
      const material = normalizeMaterial(getBindingValue(row, "materials"));
      const image = normalizeImageUrl(getBindingValue(row, "image"));
      const category = inferCategory(title, types.join(" "), material);
      const inventory = getBindingValue(row, "inventory");
      const uniqueKey = `${qid}:${inventory}`;

      if (
        !qid ||
        qid === "Q42859084" ||
        !title ||
        /^Q\d+$/.test(title) ||
        seen.has(uniqueKey) ||
        /(人類|人物|human|person)/i.test(types.join(" "))
      ) {
        return null;
      }
      seen.add(uniqueKey);

      return {
        id: `wikidata-${qid}-${inventory || "object"}`.replace(/[^\w-]+/g, "-"),
        title,
        museum: museum.name,
        museumShortName: museum.shortName,
        category,
        type: types[0] || category,
        period: formatPeriod(getBindingValue(row, "date"), title, category),
        material: material || "馆藏资料未标注",
        inventoryNumber: inventory || "馆藏资料未标注",
        image,
        imagePage: getCommonsPage(getBindingValue(row, "image")),
        source: itemUrl,
        sourceLabel: "Wikidata 馆藏记录",
        museumUrl: museum.officialUrl,
        accent: categoryAccent(category),
      };
    })
    .filter(Boolean);
}

async function fetchMetObject(objectId, category) {
  const data = await fetchJson(
    `https://collectionapi.metmuseum.org/public/collection/v1/objects/${objectId}`,
  );

  if (!data.isPublicDomain || !data.primaryImageSmall || !data.title) {
    return null;
  }

  const inferredCategory = inferCategory(
    data.title,
    `${data.objectName} ${data.classification}`,
    data.medium,
    category,
  );

  return {
    id: `met-${objectId}`,
    title: data.title,
    museum: "大都会艺术博物馆",
    museumShortName: "The Met",
    category: inferredCategory,
    type: data.objectName || inferredCategory,
    period: data.period || data.dynasty || data.objectDate || "年代待考",
    material: data.medium || "馆藏资料未标注",
    inventoryNumber: String(data.objectID),
    image: data.primaryImageSmall,
    imagePage: data.objectURL,
    source: data.objectURL,
    sourceLabel: "The Met Open Access",
    museumUrl: "https://www.metmuseum.org/art/collection",
    accent: categoryAccent(inferredCategory),
  };
}

async function fetchMetCatalog() {
  const ids = new Map();

  for (const spec of metQueries) {
    const endpoint = new URL(
      "https://collectionapi.metmuseum.org/public/collection/v1.1/search",
    );
    endpoint.searchParams.set("q", spec.query);
    endpoint.searchParams.set("hasImages", "true");
    endpoint.searchParams.set("limit", String(spec.limit));
    const result = await fetchJson(endpoint.toString());
    for (const objectId of result.objectIDs ?? []) {
      if (!ids.has(objectId)) ids.set(objectId, spec.category);
    }
    await sleep(120);
  }

  const queue = [...ids.entries()];
  const results = [];
  const workerCount = 8;

  async function worker() {
    while (queue.length) {
      const next = queue.shift();
      if (!next) return;
      try {
        const artifact = await fetchMetObject(next[0], next[1]);
        if (artifact) results.push(artifact);
      } catch {
        // A single unavailable object should not stop the catalog refresh.
      }
    }
  }

  await Promise.all(Array.from({ length: workerCount }, () => worker()));
  return results;
}

function uniqueCatalog(records) {
  const seen = new Set();
  return records.filter((record) => {
    if (!record || seen.has(record.id)) return false;
    seen.add(record.id);
    return true;
  });
}

async function main() {
  if (process.argv.includes("--refine-only")) {
    const existing = JSON.parse(await readFile(outputFile, "utf8"));
    existing.records = existing.records
      .filter(
        (record) =>
          record.id !== "wikidata-Q42859084-object" &&
          !/^Q\d+$/.test(record.title),
      )
      .map((record) => {
        const category = inferCategory(
          record.title,
          "",
          record.material,
          record.category,
        );
        const period = record.title.startsWith("唐寅")
          ? "明代"
          : record.period === "年代待考"
            ? formatPeriod("", record.title, category)
            : record.period;
        const type = [
          "字画",
          "其他文物",
          "雕塑造像",
          "古钱币",
          "兵器",
          "青铜器",
          "陶瓷",
          "玉器",
          "织绣服饰",
        ].includes(record.type)
          ? category
          : record.type;
        return {
          ...record,
          category,
          type,
          period,
          accent: categoryAccent(category),
        };
      });
    existing.total = existing.records.length;
    existing.museumCounts = Object.fromEntries(
      [...new Set(existing.records.map((item) => item.museum))].map((museum) => [
        museum,
        existing.records.filter((item) => item.museum === museum).length,
      ]),
    );
    existing.categoryCounts = Object.fromEntries(
      [...new Set(existing.records.map((item) => item.category))].map(
        (category) => [
          category,
          existing.records.filter((item) => item.category === category).length,
        ],
      ),
    );
    await writeFile(outputFile, JSON.stringify(existing, null, 2), "utf8");
    console.log("Refined existing catalog:", existing.categoryCounts);
    return;
  }

  console.log("Fetching museum records from Wikidata…");
  const wikidataResults = [];
  for (const museum of museums) {
    console.log(`- ${museum.name}: up to ${museum.target}`);
    const records = await fetchWikidataMuseum(museum);
    console.log(`  received ${records.length} records`);
    wikidataResults.push(...records);
  }

  console.log("Fetching mixed Chinese collections from The Met…");
  const metResults = await fetchMetCatalog();
  console.log(`- The Met: received ${metResults.length} records`);

  const catalog = uniqueCatalog([...wikidataResults, ...metResults]);
  const museumCounts = Object.fromEntries(
    [...new Set(catalog.map((item) => item.museum))].map((museum) => [
      museum,
      catalog.filter((item) => item.museum === museum).length,
    ]),
  );
  const categoryCounts = Object.fromEntries(
    [...new Set(catalog.map((item) => item.category))].map((category) => [
      category,
      catalog.filter((item) => item.category === category).length,
    ]),
  );

  if (catalog.length < 1000) {
    throw new Error(
      `Catalog has only ${catalog.length} records; refusing to overwrite the dataset.`,
    );
  }

  await mkdir(outputDirectory, { recursive: true });
  await writeFile(
    outputFile,
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        sourceNote:
          "Museum collection statements from Wikidata and The Met Open Access. Image rights follow each linked source page.",
        total: catalog.length,
        museumCounts,
        categoryCounts,
        records: catalog,
      },
      null,
      2,
    ),
    "utf8",
  );

  console.log(`Wrote ${catalog.length} records to ${outputFile}`);
  console.log("Museum distribution:", museumCounts);
  console.log("Category distribution:", categoryCounts);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
