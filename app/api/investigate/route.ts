import { NextResponse } from "next/server";
import { blueWhiteArtifacts } from "@/lib/blue-white";
import { investigate } from "@/lib/investigation";
import { analyzeImageWithModel, enrichReportWithModel } from "@/lib/model";
import type { VisualObservation } from "@/lib/detective-types";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      question?: string;
      artifactId?: string;
      imageDataUrl?: string;
      visualObservation?: VisualObservation;
    };

    const question = String(body.question ?? "").trim().slice(0, 500);
    if (!question) {
      return NextResponse.json({ error: "请输入要探究的问题。" }, { status: 400 });
    }

    const allMotifs = [
      ...new Set(
        blueWhiteArtifacts.flatMap((artifact) =>
          artifact.motifs.filter((motif) => motif !== "纹饰未标注"),
        ),
      ),
    ];
    const allForms = [
      ...new Set(
        blueWhiteArtifacts.flatMap((artifact) =>
          artifact.forms.filter((form) => form !== "器型未标注"),
        ),
      ),
    ];

    const modelVision =
      body.imageDataUrl && body.imageDataUrl.length < 5_500_000
        ? await analyzeImageWithModel(body.imageDataUrl, allMotifs, allForms)
        : null;
    const visualObservation = {
      ...(body.visualObservation ?? {}),
      ...(modelVision ?? {}),
      note:
        modelVision?.note ??
        body.visualObservation?.note ??
        "当前未配置视觉模型；系统仅使用浏览器端色彩统计，不据此进行年代或真伪判断。",
    };

    let report = investigate({
      question,
      artifactId: body.artifactId,
      visualObservation,
    });
    report = await enrichReportWithModel(report, report.artifact);
    return NextResponse.json(report);
  } catch {
    return NextResponse.json(
      { error: "探查过程失败，请稍后再试。" },
      { status: 500 },
    );
  }
}
