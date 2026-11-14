import catalogData from "@/data/zh-catalog-labels.json";

type CatalogData = {
  labels: Record<string, string>;
  mediums: Record<string, string>;
  periods: Record<string, string>;
};

const catalog = catalogData as CatalogData;

function lookup(
  values: Record<string, string>,
  value: string | undefined | null,
) {
  if (!value) return "";
  if (values[value]) return values[value];

  const normalized = value.trim().replace(/\s+/g, " ").toLowerCase();
  const match = Object.entries(values).find(
    ([source]) =>
      source.trim().replace(/\s+/g, " ").toLowerCase() === normalized,
  );
  return match?.[1] ?? "";
}

export function zhCatalogLabel(value: string) {
  return lookup(catalog.labels, value) || (/[\u4e00-\u9fff]/.test(value) ? value : "青花器物");
}

export function zhMedium(value: string) {
  return lookup(catalog.mediums, value) || (/[\u4e00-\u9fff]/.test(value) ? value : "青花瓷");
}

export function zhPeriod(value: string, fallback = "年代待考") {
  return (
    lookup(catalog.periods, value) ||
    (/[\u4e00-\u9fff]/.test(value) && !/[A-Za-z]/.test(value)
      ? value
      : fallback)
  );
}

export function zhMuseumShortName(value: string) {
  if (/victoria|v&a/i.test(value)) return "维艾博物馆";
  if (/metropolitan|the met/i.test(value)) return "大都会博物馆";
  return /[A-Za-z]/.test(value) ? "博物馆" : value;
}

export function zhText(value: string) {
  const replacements: Array<[RegExp, string]> = [
    [/\bVictoria and Albert Museum\b/gi, "维多利亚与艾尔伯特博物馆"],
    [/\bThe Metropolitan Museum of Art\b/gi, "大都会艺术博物馆"],
    [/\bThe Met\b/gi, "大都会博物馆"],
    [/\bV&A\b/gi, "维艾博物馆"],
    [/\bChina\b/gi, "中国"],
    [/\bUnknown\b/gi, "未标注"],
  ];

  return replacements.reduce(
    (text, [pattern, replacement]) => text.replace(pattern, replacement),
    value,
  );
}
