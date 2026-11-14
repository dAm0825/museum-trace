import { NextResponse } from "next/server";
import {
  blueWhiteArtifacts,
  blueWhiteStats,
} from "@/lib/blue-white";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = (searchParams.get("q") ?? "").trim().toLowerCase().slice(0, 100);
  const motif = searchParams.get("motif") ?? "";
  const tradition = searchParams.get("tradition") ?? "";
  const form = searchParams.get("form") ?? "";
  const period = searchParams.get("period") ?? "";
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const pageSize = Math.min(24, Math.max(6, Number(searchParams.get("pageSize")) || 12));

  const filtered = blueWhiteArtifacts.filter((artifact) => {
    if (motif && !artifact.motifs.includes(motif)) return false;
    if (tradition && artifact.tradition !== tradition) return false;
    if (form && !artifact.forms.includes(form)) return false;
    if (period && artifact.periodBucket !== period) return false;
    if (!query) return true;

    return [
      artifact.title,
      artifact.objectName,
      artifact.museum,
      artifact.tradition,
      artifact.period,
      artifact.medium,
      artifact.summary,
      ...artifact.motifs,
      ...artifact.forms,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
      .includes(query);
  });

  const start = (page - 1) * pageSize;
  const items = filtered.slice(start, start + pageSize).map((artifact) => ({
    id: artifact.id,
    title: artifact.title,
    objectName: artifact.objectName,
    museum: artifact.museumShortName,
    tradition: artifact.tradition,
    period: artifact.periodBucket,
    motifs: artifact.motifs,
    forms: artifact.forms,
    image: artifact.image,
    sourceUrl: artifact.sourceUrl,
  }));

  return NextResponse.json({
    items,
    total: filtered.length,
    page,
    pageSize,
    hasMore: start + items.length < filtered.length,
    stats: blueWhiteStats,
  });
}
