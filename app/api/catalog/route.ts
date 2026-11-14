import { NextResponse } from "next/server";
import { catalogArtifacts } from "@/lib/catalog";

function stableRank(id: string) {
  let hash = 2166136261;
  for (let index = 0; index < id.length; index += 1) {
    hash ^= id.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = (searchParams.get("q") ?? "").trim().toLowerCase().slice(0, 80);
  const museum = searchParams.get("museum") ?? "";
  const category = searchParams.get("category") ?? "";
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const pageSize = Math.min(24, Math.max(6, Number(searchParams.get("pageSize")) || 12));

  const filtered = catalogArtifacts
    .filter((artifact) => {
      if (museum && artifact.museum !== museum) return false;
      if (category && artifact.category !== category) return false;
      if (!query) return true;
      return [
        artifact.title,
        artifact.museum,
        artifact.category,
        artifact.period,
        artifact.medium,
        ...artifact.tags,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(query);
    })
    .sort((a, b) => stableRank(a.id) - stableRank(b.id));

  const start = (page - 1) * pageSize;
  const items = filtered.slice(start, start + pageSize).map((artifact) => ({
    id: artifact.id,
    title: artifact.title,
    subtitle: artifact.englishTitle,
    museum: artifact.museum,
    category: artifact.category,
    period: artifact.period,
    material: artifact.medium,
    image: artifact.image ?? "",
    imagePage: artifact.imagePage ?? "",
    source: artifact.sources[0]?.url ?? "",
    code: artifact.code,
    accent: artifact.accent,
  }));

  return NextResponse.json({
    items,
    total: filtered.length,
    page,
    pageSize,
    hasMore: start + items.length < filtered.length,
  });
}
