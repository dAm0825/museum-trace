import { NextResponse } from "next/server";
import { curateExhibition } from "@/lib/curator";
import type { CurateInput } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const input = (await request.json()) as Partial<CurateInput>;

    if (!input.prompt || typeof input.prompt !== "string") {
      return NextResponse.json({ error: "请先描述你想看的文物或主题。" }, { status: 400 });
    }

    const normalized: CurateInput = {
      prompt: input.prompt.slice(0, 160),
      duration:
        input.duration === "20" || input.duration === "60" ? input.duration : "40",
      audience:
        input.audience === "亲子" || input.audience === "专业观众"
          ? input.audience
          : "成人",
      lens:
        input.lens === "工艺美学" || input.lens === "文明互鉴"
          ? input.lens
          : "历史脉络",
      seed:
        typeof input.seed === "number" && Number.isFinite(input.seed)
          ? Math.trunc(input.seed)
          : Date.now(),
      excludeIds: Array.isArray(input.excludeIds)
        ? input.excludeIds.filter((id): id is string => typeof id === "string").slice(0, 20)
        : [],
    };

    return NextResponse.json(curateExhibition(normalized));
  } catch {
    return NextResponse.json({ error: "生成失败，请稍后再试。" }, { status: 500 });
  }
}
