import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputPath = path.join(projectRoot, "data", "dpm-blue-white-corpus.json");
const apiUrl = "https://digicol.dpm.org.cn/cultural/queryList";
const targetCount = 1200;
const pageSize = 32;

const motifPatterns = [
  {
    label: "人物故事纹",
    pattern: /故事|高士|仕女|婴戏|八仙|西厢|三国|竹林七贤|携琴访友|文会图/,
  },
  { label: "龙纹", pattern: /龙|龍/ },
  { label: "凤纹", pattern: /凤|鳳/ },
  { label: "缠枝纹", pattern: /缠枝|纏枝/ },
  { label: "莲纹", pattern: /莲|蓮/ },
  { label: "牡丹纹", pattern: /牡丹/ },
  { label: "菊纹", pattern: /菊/ },
  {
    label: "梅纹",
    pattern: /梅纹|梅圖|梅图|梅竹|鹊梅|鵲梅|松竹梅|梅花|折枝梅|墨梅|冰梅/,
  },
  {
    label: "花卉纹",
    pattern:
      /花卉|花纹|花紋|宝相花|寶相花|折枝花|四季花|缠枝花|纏枝花|团花|團花|松竹梅|梅竹|竹石|灵芝|靈芝|兰石|蘭石|菊花/,
  },
  { label: "山水纹", pattern: /山水|海屋添筹|溪山|江|舟|亭/ },
  { label: "人物纹", pattern: /人物|高士|仕女|婴戏|童子|老人/ },
  { label: "禽鸟纹", pattern: /鸟|鳥|鹤|鶴|雁|鸳鸯|鴛鴦|雉|孔雀|喜鹊|鵲/ },
  { label: "鱼藻纹", pattern: /鱼|魚|藻/ },
  { label: "瑞果纹", pattern: /瑞果|瓜果|桃|石榴|葡萄|葫芦纹|葫蘆紋/ },
  { label: "水波纹", pattern: /海水|波浪|水波|江崖/ },
  { label: "云纹", pattern: /云|雲/ },
  { label: "几何纹", pattern: /几何|幾何|回纹|回紋|卍字|锦地|錦地|蕉叶|蕉葉/ },
  {
    label: "文字纹",
    pattern: /文字|铭文|銘文|诗句|詩句|题诗|題詩|御题|御題|寿字|壽字|福字|禄字|祿字/,
  },
];

const formPatterns = [
  ["抱月瓶", /抱月瓶|扁壶|扁壺/],
  ["玉壶春瓶", /玉壶春瓶|玉壺春瓶/],
  ["天球瓶", /天球瓶/],
  ["梅瓶", /梅瓶/],
  ["葫芦瓶", /葫芦瓶|葫蘆瓶/],
  ["贯耳瓶", /贯耳瓶|貫耳瓶/],
  ["蒜头瓶", /蒜头瓶|蒜頭瓶/],
  ["赏瓶", /赏瓶|賞瓶/],
  ["胆瓶", /胆瓶|膽瓶/],
  ["四方瓶", /四方瓶|六方瓶|八方瓶|方瓶/],
  ["双联瓶", /双联瓶|雙聯瓶/],
  ["执壶", /执壶|執壺/],
  ["壶", /壶|壺/],
  ["瓶", /瓶/],
  ["罐", /罐/],
  ["盖碗", /盖碗|蓋碗/],
  ["碗", /碗/],
  ["高足杯", /高足杯/],
  ["压手杯", /压手杯|壓手杯/],
  ["杯", /杯|盅|鍾/],
  ["盘", /盘|盤/],
  ["碟", /碟/],
  ["笔洗", /笔洗|筆洗/],
  ["洗", /洗/],
  ["尊", /尊/],
  ["觚", /觚/],
  ["盒", /盒|匣/],
  ["香炉", /香炉|香爐|炉|爐/],
  ["笔筒", /笔筒|筆筒/],
  ["花盆", /花盆/],
  ["盆", /盆/],
  ["渣斗", /渣斗/],
  ["缸", /缸/],
  ["枕", /枕/],
  ["瓷板", /瓷板|屏/],
];

const genericNames = new Set([
  "青花",
  "青花瓷",
  "青花瓶",
  "青花瓶",
  "青花罐",
  "青花碗",
  "青花盘",
  "青花盤",
  "青花杯",
  "青花壶",
  "青花壺",
  "青花盒",
]);

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function stripHtml(value) {
  return String(value ?? "")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

function labelsFor(text, patterns) {
  const labels = patterns
    .filter(({ pattern }) => pattern.test(text))
    .map(({ label }) => label);
  return [...new Set(labels)].slice(0, 4);
}

function formsFor(text) {
  const labels = formPatterns
    .filter(([, pattern]) => pattern.test(text))
    .map(([label]) => label);
  return [...new Set(labels)].slice(0, 3);
}

function periodBucket(period) {
  if (/元/.test(period)) return "元代";
  if (/明/.test(period)) return "明代";
  if (/清/.test(period)) return "清代";
  if (/宋/.test(period)) return "宋代";
  if (/辽|遼/.test(period)) return "辽代";
  if (/金/.test(period)) return "金代";
  return "年代待考";
}

async function fetchPage(page) {
  let lastError;
  for (let attempt = 0; attempt < 5; attempt += 1) {
    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json;charset=UTF-8",
          Referer: "https://digicol.dpm.org.cn/list",
          "User-Agent": "BlueTrace/1.0 museum education project",
        },
        body: JSON.stringify({
          page,
          pageSize,
          categoryList: ["6"],
          keyWord: "青花",
        }),
        signal: AbortSignal.timeout(30_000),
      });
      if (!response.ok) {
        throw new Error(`Palace Museum query failed: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      lastError = error;
      await sleep(800 * 2 ** attempt);
    }
  }
  throw lastError;
}

function makeRecord(source) {
  const title = stripHtml(source.suggestName || source.name);
  const accessionNumber = stripHtml(
    source.suggestCulturalNo || source.culturalRelicNo,
  );
  const period = stripHtml(source.suggestDynastyName || source.dynastyName) || "年代待考";
  const motifs = labelsFor(title, motifPatterns);
  const forms = formsFor(title);
  const primaryForm = forms[0] || "陶瓷器";
  const sourceUrl = `https://digicol.dpm.org.cn/list?k=${encodeURIComponent(title)}`;
  const sourceId = source.uuid;
  const image = String(source.centerImage ?? "").trim();
  return {
    id: `dpm-${sourceId}`,
    sourceId,
    museum: "故宫博物院",
    museumShortName: "故宫博物院",
    accessionNumber,
    title,
    objectName: primaryForm,
    period,
    periodBucket: periodBucket(period),
    dateText: period,
    medium: "陶瓷 · 青花",
    sourceMedium: "故宫博物院陶瓷类馆藏",
    summary: `故宫博物院数字文物库陶瓷类馆藏，正式名称为“${title}”，馆藏年代为“${period}”。`,
    image,
    sourceUrl,
    sourceLabel: "故宫博物院数字文物库 · 陶瓷馆藏",
    motifs: motifs.length ? motifs : ["纹饰未标注"],
    forms: forms.length ? forms : ["陶瓷器"],
  };
}

async function main() {
  const records = [];
  const seen = new Set();
  const seenTitles = new Set();
  let page = 1;
  let pageCount = 1;

  while (records.length < targetCount && page <= pageCount) {
    const data = await fetchPage(page);
    pageCount = Number(data.pagecount) || pageCount;
    for (const source of data.rows ?? []) {
      const title = stripHtml(source.suggestName || source.name);
      const image = String(source.centerImage ?? "").trim();
      const id = String(source.uuid ?? "").trim();
      if (
        !id ||
        seen.has(id) ||
        !image ||
        !title.includes("青花") ||
        title.length < 6 ||
        genericNames.has(title) ||
        seenTitles.has(title)
      ) {
        continue;
      }
      seen.add(id);
      seenTitles.add(title);
      records.push(makeRecord(source));
      if (records.length >= targetCount) break;
    }
    console.log(`Page ${page}/${pageCount}: ${records.length} complete names`);
    page += 1;
    await sleep(250);
  }

  if (records.length < 1000) {
    throw new Error(`Only ${records.length} complete names collected`);
  }

  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(
    outputPath,
    `${JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        source:
          "故宫博物院数字文物库公开陶瓷馆藏检索结果；仅使用正式名称、年代、馆藏编号与图片地址。",
        rights:
          "馆藏元数据与影像权利归故宫博物院所有，仅用于非商业比赛研究与展示，原页面链接保留供核对。",
        total: records.length,
        records,
      },
      null,
      0,
    )}\n`,
  );
  console.log(`Wrote ${records.length} fully named Palace Museum records.`);
}

await main();
