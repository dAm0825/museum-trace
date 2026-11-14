"use client";

import Image from "next/image";
import { ChangeEvent, FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, ArrowUpRight, Spark } from "@/components/icons";
import type {
  BlueWhiteStats,
  GraphNode,
  InvestigationReport,
  VisualObservation,
} from "@/lib/detective-types";

type DetectiveStudioProps = {
  initialReport: InvestigationReport;
  stats: BlueWhiteStats;
};

const examples = [
  "为什么这件青花瓷上的人物故事值得追问？",
  "青花中的莲纹在哪些年代更集中？",
  "比较龙纹瓶和莲纹罐的器型与年代关系",
];

async function extractColorObservation(file: File) {
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  const source = await new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new window.Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = dataUrl;
  });

  const maxEdge = 960;
  const scale = Math.min(1, maxEdge / Math.max(source.width, source.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(source.width * scale));
  canvas.height = Math.max(1, Math.round(source.height * scale));
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) throw new Error("Canvas is unavailable");
  context.drawImage(source, 0, 0, canvas.width, canvas.height);
  const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
  let red = 0;
  let green = 0;
  let blue = 0;
  let bluePixels = 0;
  let brightness = 0;
  const totalPixels = pixels.length / 4;

  for (let index = 0; index < pixels.length; index += 16) {
    const r = pixels[index];
    const g = pixels[index + 1];
    const b = pixels[index + 2];
    red += r;
    green += g;
    blue += b;
    brightness += (r + g + b) / 3;
    if (b > r * 1.08 && b > g * 1.03 && b > 70) bluePixels += 1;
  }

  const sampled = Math.ceil(pixels.length / 16);
  const observation: VisualObservation = {
    dominantColor: `rgb(${Math.round(red / sampled)}, ${Math.round(
      green / sampled,
    )}, ${Math.round(blue / sampled)})`,
    blueRatio: Number((bluePixels / sampled).toFixed(3)),
    brightness: Number((brightness / sampled / 255).toFixed(3)),
    note: `浏览器端色彩统计：蓝色像素约 ${((bluePixels / sampled) * 100).toFixed(
      1,
    )}%，平均亮度 ${(brightness / sampled / 255).toFixed(2)}。该结果只描述色彩，不鉴定年代。`,
  };

  return {
    dataUrl: canvas.toDataURL("image/jpeg", 0.84),
    observation,
    pixelCount: totalPixels,
  };
}

function nodeClass(node: GraphNode) {
  return `chain-node node-${node.type}`;
}

export function DetectiveStudio({
  initialReport,
  stats,
}: DetectiveStudioProps) {
  const [question, setQuestion] = useState(initialReport.question);
  const [report, setReport] = useState(initialReport);
  const [selectedNodeId, setSelectedNodeId] = useState("artifact");
  const [working, setWorking] = useState(false);
  const [traceProgress, setTraceProgress] = useState(5);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState("");
  const [imageDataUrl, setImageDataUrl] = useState("");
  const [visualObservation, setVisualObservation] =
    useState<VisualObservation>({});
  const fileInput = useRef<HTMLInputElement>(null);

  const selectedNode = useMemo(
    () =>
      report.nodes.find((node) => node.id === selectedNodeId) ??
      report.nodes[0],
    [report.nodes, selectedNodeId],
  );
  const selectedEdges = useMemo(
    () =>
      report.edges.filter(
        (edge) =>
          edge.from === selectedNode?.id || edge.to === selectedNode?.id,
      ),
    [report.edges, selectedNode?.id],
  );

  useEffect(() => {
    function handleOpenCase(event: Event) {
      const artifactId = (event as CustomEvent<string>).detail;
      if (!artifactId) return;
      analyze("请从视觉线索、纹饰关系与馆藏年代三个方面分析这件青花瓷。", artifactId);
    }
    window.addEventListener("open-blue-white-case", handleOpenCase);
    return () =>
      window.removeEventListener("open-blue-white-case", handleOpenCase);
  });

  async function onFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("请选择图片文件。");
      return;
    }
    try {
      setError("");
      const extracted = await extractColorObservation(file);
      setPreview(extracted.dataUrl);
      setImageDataUrl(extracted.dataUrl);
      setVisualObservation(extracted.observation);
    } catch {
      setError("图片读取失败，请换一张图片重试。");
    }
  }

  async function analyze(
    nextQuestion = question,
    artifactId?: string,
  ) {
    if (!nextQuestion.trim() || working) return;
    setWorking(true);
    setTraceProgress(0);
    setError("");
    setQuestion(nextQuestion);

    try {
      const request = fetch("/api/investigate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: nextQuestion,
          artifactId,
          imageDataUrl,
          visualObservation,
        }),
      });

      for (let step = 0; step < 5; step += 1) {
        await new Promise((resolve) => window.setTimeout(resolve, 330));
        setTraceProgress(step + 1);
      }

      const response = await request;
      if (!response.ok) throw new Error("Investigation request failed");
      const nextReport = (await response.json()) as InvestigationReport;
      setReport(nextReport);
      setSelectedNodeId("artifact");
    } catch {
      setError("探查请求失败，请稍后重试。");
    } finally {
      setWorking(false);
      setTraceProgress(5);
    }
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    analyze(question);
  }

  const artifact = report.artifact;

  return (
    <section className="detective-shell" id="investigator">
      <div className="detective-intro">
        <div className="section-label">
          <span>CASE WORKBENCH</span>
          <i />
          <span>{stats.total.toLocaleString("zh-CN")} RECORDS</span>
        </div>
        <div className="detective-intro-grid">
          <h2>
            提出问题，
            <br />
            然后让<em>证据接手。</em>
          </h2>
          <p>
            输入一个关于青花纹饰、器型或年代的问题，或上传一张图片提取可见色彩线索。
            系统会检索馆藏、遍历关系，并把结论与分歧一起摆出来。
          </p>
        </div>
      </div>

      <form className="investigation-form" onSubmit={submit}>
        <div className="question-field">
          <Spark />
          <label htmlFor="investigation-question">你的探究问题</label>
          <textarea
            id="investigation-question"
            rows={2}
            maxLength={500}
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            onKeyDown={(event) => {
              if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
                submit(event);
              }
            }}
          />
          <span>{question.length}/500</span>
        </div>

        <div className="question-tools">
          <div className="example-questions">
            <span>从这些问题开始</span>
            {examples.map((example) => (
              <button
                key={example}
                type="button"
                onClick={() => setQuestion(example)}
              >
                {example}
              </button>
            ))}
          </div>

          <div className="image-tools">
            {preview ? (
              <div className="upload-preview">
                <Image src={preview} alt="待分析图片预览" width={62} height={62} unoptimized />
                <div>
                  <strong>图像色彩线索已提取</strong>
                  <span>蓝色像素 {((visualObservation.blueRatio ?? 0) * 100).toFixed(1)}%</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setPreview("");
                    setImageDataUrl("");
                    setVisualObservation({});
                  }}
                >
                  移除
                </button>
              </div>
            ) : (
              <button
                type="button"
                className="upload-trigger"
                onClick={() => fileInput.current?.click()}
              >
                <span>＋</span>
                上传局部图片
              </button>
            )}
            <input
              ref={fileInput}
              type="file"
              accept="image/*"
              hidden
              onChange={onFileChange}
            />
            <button type="submit" className="investigate-button" disabled={working}>
              {working ? "正在建立证据链" : "开始探查"}
              <ArrowRight />
            </button>
          </div>
        </div>
      </form>

      {error ? <p className="investigation-error">{error}</p> : null}

      <div className={`case-workbench ${working ? "is-searching" : ""}`}>
        <div className="case-heading">
          <div>
            <span className="case-index">CASE / {artifact.sourceId}</span>
            <h3>{artifact.title}</h3>
            <p>
              {artifact.museumShortName} · {artifact.tradition} · {artifact.period}
            </p>
          </div>
          <div className="confidence">
            <span>证据置信度</span>
            <strong>{Math.round(report.confidence * 100)}</strong>
            <small>/100</small>
          </div>
        </div>

        <div className="case-grid">
          <article className="case-artifact">
            <div className="case-image">
              {artifact.image ? (
                <Image
                  src={artifact.image}
                  alt={artifact.title}
                  fill
                  sizes="(max-width: 900px) 100vw, 32vw"
                  unoptimized
                />
              ) : (
                <div className="no-image-artifact">
                  <span>MET OPEN RECORD</span>
                  <strong>{artifact.title.slice(0, 1)}</strong>
                  <small>该开放记录暂未提供图片</small>
                </div>
              )}
              <div className="image-coordinate top-left">A1</div>
              <div className="image-coordinate bottom-right">B4</div>
              <span className="image-credit">SOURCE IMAGE</span>
            </div>
            <div className="case-artifact-info">
              <div className="artifact-tags">
                {artifact.motifs
                  .filter((motif) => motif !== "纹饰未标注")
                  .map((motif) => (
                    <button
                      key={motif}
                      type="button"
                      onClick={() => {
                        const node = report.nodes.find(
                          (item) => item.type === "motif" && item.label === motif,
                        );
                        if (node) setSelectedNodeId(node.id);
                      }}
                    >
                      {motif}
                    </button>
                  ))}
                {artifact.forms.map((form) => (
                  <span key={form}>{form}</span>
                ))}
              </div>
              <dl>
                <div>
                  <dt>年代</dt>
                  <dd>{artifact.period}</dd>
                </div>
                <div>
                  <dt>工艺</dt>
                  <dd>{artifact.medium}</dd>
                </div>
                <div>
                  <dt>来源</dt>
                  <dd>{artifact.sourceLabel}</dd>
                </div>
              </dl>
              <a href={artifact.sourceUrl} target="_blank" rel="noreferrer">
                查看原始馆藏记录
                <ArrowUpRight />
              </a>
            </div>
          </article>

          <section className="question-chain" aria-label="问题链画布">
            <header>
              <span>QUESTION CHAIN</span>
              <small>{report.nodes.length} NODES / {report.edges.length} EDGES</small>
            </header>
            <div className="chain-nodes">
              {report.nodes.map((node, index) => (
                <button
                  key={node.id}
                  className={`${nodeClass(node)} ${
                    selectedNode?.id === node.id ? "is-active" : ""
                  }`}
                  type="button"
                  onClick={() => setSelectedNodeId(node.id)}
                >
                  <span className="node-index">{String(index + 1).padStart(2, "0")}</span>
                  <strong>{node.label}</strong>
                  <small>{node.detail}</small>
                  {index < report.nodes.length - 1 ? (
                    <i className="chain-connector" />
                  ) : null}
                </button>
              ))}
            </div>
            <div className="chain-legend">
              <span><i className="legend-question" />问题</span>
              <span><i className="legend-visual" />图像</span>
              <span><i className="legend-artifact" />对象</span>
              <span><i className="legend-relation" />证据关系</span>
              <span><i className="legend-conflict" />分歧</span>
            </div>
          </section>

          <aside className="evidence-drawer">
            <header>
              <span>EVIDENCE FOR THIS NODE</span>
              <h4>{selectedNode?.label}</h4>
            </header>
            <p className="node-detail">{selectedNode?.detail}</p>
            <div className="edge-evidence-list">
              {selectedEdges.map((edge) => (
                <article key={edge.id}>
                  <span>{edge.label}</span>
                  <p>{edge.evidence}</p>
                  <small>
                    {edge.supportCount} 条支持记录
                  </small>
                  {edge.sourceUrls[0] ? (
                    <a
                      href={edge.sourceUrls[0]}
                      target="_blank"
                      rel="noreferrer"
                    >
                      核对来源
                      <ArrowUpRight />
                    </a>
                  ) : null}
                </article>
              ))}
              {selectedEdges.length === 0 ? (
                <p className="edge-empty">这个节点是下一步问题，等待新的资料或追问。</p>
              ) : null}
            </div>

            <div className="finding-stack">
              <span>结论卡片</span>
              {report.findings.map((finding) => (
                <details key={finding.id}>
                  <summary>
                    <i>{finding.kind === "fact" ? "F" : finding.kind === "aggregate" ? "Σ" : "AI"}</i>
                    <strong>{finding.title}</strong>
                  </summary>
                  <p>{finding.statement}</p>
                  <small>{finding.evidence}</small>
                  <a href={finding.sourceUrl} target="_blank" rel="noreferrer">
                    查看馆藏记录
                    <ArrowUpRight />
                  </a>
                </details>
              ))}
            </div>
          </aside>
        </div>

        <div className="agent-console">
          <header>
            <span>AGENT TRACE / 真实执行记录</span>
            <small>
              {report.mode === "llm-assisted" ? "LLM 综合已启用" : "本地证据推理"}
            </small>
          </header>
          <div className="trace-grid">
            {report.trace.map((step, index) => (
              <article
                key={step.name}
                className={index < traceProgress || !working ? "done" : ""}
              >
                <span>{String(index + 1).padStart(2, "0")}</span>
                <strong>{step.name}</strong>
                <p>{step.detail}</p>
                <small>{step.durationMs} ms</small>
              </article>
            ))}
          </div>
        </div>

        <div className="case-bottom-grid">
          <section className="conflict-panel">
            <header>
              <span>OPEN QUESTIONS</span>
              <h4>没有强行统一的证据</h4>
            </header>
            {report.conflicts.length ? (
              report.conflicts.map((conflict) => (
                <article key={conflict.title}>
                  <strong>{conflict.title}</strong>
                  <p>{conflict.detail}</p>
                  <ul>
                    {conflict.questions.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </article>
              ))
            ) : (
              <p className="no-conflict">
                当前主证据没有显式冲突，但仍需注意：馆藏元数据不等于完整学术定论。
              </p>
            )}
          </section>

          <section className="next-questions">
            <header>
              <span>NEXT QUESTIONS</span>
              <h4>沿着证据继续追问</h4>
            </header>
            {report.nextQuestions.map((nextQuestion, index) => (
              <button
                type="button"
                key={nextQuestion}
                onClick={() => analyze(nextQuestion, artifact.id)}
              >
                <span>{String(index + 1).padStart(2, "0")}</span>
                {nextQuestion}
                <ArrowRight />
              </button>
            ))}
          </section>
        </div>

        {report.alternatives.length ? (
          <div className="alternative-cases">
            <span>相邻候选 / 不是唯一答案</span>
            <div>
              {report.alternatives.map((alternative) => (
                <button
                  type="button"
                  key={alternative.id}
                  onClick={() => analyze(report.question, alternative.id)}
                >
                  <i>
                    {alternative.image ? (
                      <Image
                        src={alternative.image}
                        alt=""
                        width={50}
                        height={50}
                        unoptimized
                      />
                    ) : (
                      <b>{alternative.title.slice(0, 1)}</b>
                    )}
                  </i>
                  <span>
                    <strong>{alternative.title}</strong>
                    <small>{alternative.museum}</small>
                  </span>
                  <ArrowRight />
                </button>
              ))}
            </div>
          </div>
        ) : null}

        {working ? (
          <div className="search-curtain" aria-live="polite">
            <div className="scan-line" />
            <Spark />
            <span>正在检索 {stats.total.toLocaleString("zh-CN")} 条馆藏关系</span>
            <small>{traceProgress} / 5</small>
          </div>
        ) : null}
      </div>
    </section>
  );
}
