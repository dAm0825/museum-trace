"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import type { CSSProperties, FormEvent } from "react";
import type { CurateInput, CuratedExhibition } from "@/lib/types";
import { ArrowRight, ArrowUpRight, Play, Spark } from "@/components/icons";

type Perspective = "adult" | "child" | "accessible";

type CuratorStudioProps = {
  initialExhibition: CuratedExhibition;
};

const examplePrompts = [
  "我只有 40 分钟，想看青铜器和玉器",
  "带孩子认识古人的材料和工艺",
  "从佛像的变化看文明交流",
];

const defaultInput: CurateInput = {
  prompt: "我对青铜器和玉器感兴趣，想理解材料和礼制的关系",
  duration: "40",
  audience: "成人",
  lens: "历史脉络",
};

const perspectiveLabels: Record<Perspective, string> = {
  adult: "成人视角",
  child: "亲子视角",
  accessible: "无障碍描述",
};

function sleep(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

export function CuratorStudio({ initialExhibition }: CuratorStudioProps) {
  const [input, setInput] = useState<CurateInput>(defaultInput);
  const [result, setResult] = useState<CuratedExhibition>(initialExhibition);
  const [activeId, setActiveId] = useState(initialExhibition.artifactIds[0]);
  const [perspective, setPerspective] = useState<Perspective>("adult");
  const [working, setWorking] = useState(false);
  const [activeAgent, setActiveAgent] = useState(4);
  const [error, setError] = useState("");
  const [speaking, setSpeaking] = useState(false);

  const selectedArtifacts = useMemo(
    () => result.artifacts,
    [result.artifacts],
  );

  const activeArtifact =
    selectedArtifacts.find((artifact) => artifact.id === activeId) ??
    selectedArtifacts[0];

  async function generate(event?: FormEvent) {
    event?.preventDefault();
    if (!input.prompt.trim() || working) return;

    setWorking(true);
    setError("");
    setActiveAgent(0);

    try {
      const request = fetch("/api/curate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...input,
          seed: Date.now() + Math.floor(Math.random() * 10000),
          excludeIds: result.artifacts.map((artifact) => artifact.id),
        }),
      });

      for (let step = 0; step < 4; step += 1) {
        await sleep(360);
        setActiveAgent(step + 1);
      }

      const response = await request;
      if (!response.ok) throw new Error("curation failed");
      const data = (await response.json()) as CuratedExhibition;
      setResult(data);
      setActiveId(data.artifactIds[0]);
      setPerspective("adult");
    } catch {
      setError("策展引擎暂时没有响应，请稍后重试。");
    } finally {
      setWorking(false);
    }
  }

  function applyExample(prompt: string) {
    setInput((current) => ({ ...current, prompt }));
  }

  function speak() {
    if (!activeArtifact || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    if (speaking) {
      setSpeaking(false);
      return;
    }
    const text = activeArtifact.perspectives[perspective];
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "zh-CN";
    utterance.rate = 0.92;
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    setSpeaking(true);
    window.speechSynthesis.speak(utterance);
  }

  return (
    <section className="studio-section" id="studio" aria-labelledby="studio-title">
      <div className="section-shell">
        <div className="section-kicker light">
          <span className="kicker-line" />
          <span>AI CURATOR STUDIO</span>
          <span className="kicker-index">02</span>
        </div>

        <div className="studio-heading">
          <div>
            <h2 id="studio-title">
              说出你的好奇，
              <br />
              <em>让文物自己作答。</em>
            </h2>
          </div>
          <p>
            不是一键生成一篇介绍，而是选择展品、建立路线、核对证据，
            再把同一件器物换成不同观众能理解的语言。
          </p>
        </div>

        <form className="curator-form" onSubmit={generate}>
          <div className="prompt-field">
            <Spark aria-hidden="true" />
            <label htmlFor="curiosity">你想在博物馆里遇见什么？</label>
            <textarea
              id="curiosity"
              value={input.prompt}
              maxLength={160}
              rows={3}
              onChange={(event) =>
                setInput((current) => ({ ...current, prompt: event.target.value }))
              }
              placeholder="例如：我想用半小时看懂古人的工艺……"
            />
            <span className="character-count">{input.prompt.length}/160</span>
          </div>

          <div className="examples" aria-label="示例问题">
            <span>试试：</span>
            {examplePrompts.map((prompt) => (
              <button key={prompt} type="button" onClick={() => applyExample(prompt)}>
                {prompt}
              </button>
            ))}
          </div>

          <div className="form-options">
            <fieldset>
              <legend>参观时长</legend>
              <div className="segmented">
                {(["20", "40", "60"] as const).map((duration) => (
                  <button
                    className={input.duration === duration ? "selected" : ""}
                    key={duration}
                    type="button"
                    onClick={() =>
                      setInput((current) => ({ ...current, duration }))
                    }
                  >
                    {duration} 分钟
                  </button>
                ))}
              </div>
            </fieldset>

            <fieldset>
              <legend>同行者</legend>
              <div className="segmented">
                {(["成人", "亲子", "专业观众"] as const).map((audience) => (
                  <button
                    className={input.audience === audience ? "selected" : ""}
                    key={audience}
                    type="button"
                    onClick={() =>
                      setInput((current) => ({ ...current, audience }))
                    }
                  >
                    {audience}
                  </button>
                ))}
              </div>
            </fieldset>

            <fieldset>
              <legend>观看视角</legend>
              <select
                value={input.lens}
                onChange={(event) =>
                  setInput((current) => ({
                    ...current,
                    lens: event.target.value as CurateInput["lens"],
                  }))
                }
              >
                <option>历史脉络</option>
                <option>工艺美学</option>
                <option>文明互鉴</option>
              </select>
            </fieldset>

            <button className="curate-button" type="submit" disabled={working}>
              <span>{working ? "正在编织展览" : "生成我的展览"}</span>
              <ArrowRight />
            </button>
          </div>
        </form>

        <div className={`agent-strip ${working ? "is-working" : ""}`}>
          {result.agentSteps.map((step, index) => (
            <div
              className={`agent-step ${index < activeAgent ? "complete" : ""} ${
                working && index === activeAgent ? "active" : ""
              }`}
              key={step.id}
            >
              <span className="agent-number">0{index + 1}</span>
              <div>
                <strong>{step.name}</strong>
                <p>{step.detail}</p>
              </div>
              <span className="agent-check">{index < activeAgent ? "✓" : "·"}</span>
            </div>
          ))}
        </div>

        {error ? <p className="form-error">{error}</p> : null}

        <div className={`exhibition-result ${working ? "is-loading" : ""}`}>
          <div className="result-intro">
            <div>
              <span className="result-label">你的微型展览</span>
              <h3>{result.title}</h3>
              <p className="result-subtitle">{result.subtitle}</p>
            </div>
            <div className="result-note">
              <span>策展说明</span>
              <p>{result.routeReason}</p>
            </div>
          </div>

          <p className="exhibition-thesis">
            <span>策展观点</span>
            {result.thesis}
          </p>

          <div className="route-layout">
            <aside className="route-rail" aria-label="参观路线">
              <div className="route-line" />
              {selectedArtifacts.map((artifact, index) => (
                <button
                  key={artifact.id}
                  className={artifact.id === activeId ? "active" : ""}
                  type="button"
                  onClick={() => setActiveId(artifact.id)}
                >
                  <span className="route-dot">{String(index + 1).padStart(2, "0")}</span>
                  <span>
                    <strong>{artifact.title}</strong>
                    <small>
                      {artifact.period} · {artifact.medium}
                    </small>
                  </span>
                </button>
              ))}
            </aside>

            {activeArtifact ? (
              <article className="artifact-stage">
                <div className="artifact-visual">
                  {activeArtifact.image ? (
                    <Image
                      src={activeArtifact.image}
                      alt={`${activeArtifact.title}，${activeArtifact.period}，${activeArtifact.medium}`}
                      fill
                      sizes="(max-width: 900px) 100vw, 48vw"
                      style={{ objectPosition: activeArtifact.imagePosition ?? "center" }}
                      priority={activeArtifact.id === "jue"}
                    />
                  ) : (
                    <div
                      className="artifact-image-fallback"
                      style={{ "--artifact-accent": activeArtifact.accent } as CSSProperties}
                    >
                      <span>{activeArtifact.category ?? "馆藏"}</span>
                      <strong>{activeArtifact.title.slice(0, 1)}</strong>
                      <small>暂无开放图像 · 以馆藏记录展示</small>
                    </div>
                  )}
                  <span className="visual-index">{activeArtifact.code}</span>
                  <div className="artifact-caption">
                    <h4>{activeArtifact.title}</h4>
                    <p>{activeArtifact.englishTitle}</p>
                  </div>
                </div>

                <div className="artifact-content">
                  <div className="artifact-meta">
                    {activeArtifact.museum ? <span>{activeArtifact.museum}</span> : null}
                    {activeArtifact.category ? <span>{activeArtifact.category}</span> : null}
                    <span>{activeArtifact.period}</span>
                    <span>{activeArtifact.date}</span>
                    <span>{activeArtifact.medium}</span>
                  </div>
                  <p className="artifact-summary">{activeArtifact.summary}</p>
                  <div className="perspective-tabs" aria-label="讲解视角">
                    {(Object.keys(perspectiveLabels) as Perspective[]).map((key) => (
                      <button
                        className={perspective === key ? "active" : ""}
                        key={key}
                        type="button"
                        onClick={() => setPerspective(key)}
                      >
                        {perspectiveLabels[key]}
                      </button>
                    ))}
                  </div>
                  <p className="perspective-copy">
                    {activeArtifact.perspectives[perspective]}
                  </p>
                  <button className="audio-button" type="button" onClick={speak}>
                    <Play />
                    {speaking ? "停止朗读" : "朗读这段讲解"}
                  </button>
                </div>
              </article>
            ) : null}

            {activeArtifact ? (
              <aside className="evidence-panel">
                <div className="evidence-heading">
                  <div>
                    <span>EVIDENCE CHAIN</span>
                    <h4>这条讲解从哪里来？</h4>
                  </div>
                  <span className="verified-badge">已标源</span>
                </div>
                <div className="evidence-list">
                  {activeArtifact.evidence.map((item, index) => (
                    <details key={item.label} open={index === 0}>
                      <summary>
                        <span>{String(index + 1).padStart(2, "0")}</span>
                        <strong>{item.label}</strong>
                        <small>{item.kind}</small>
                      </summary>
                      <p>{item.detail}</p>
                      <a
                        href={activeArtifact.sources[item.sourceIndex].url}
                        target="_blank"
                        rel="noreferrer"
                      >
                        查看来源
                        <ArrowUpRight />
                      </a>
                    </details>
                  ))}
                </div>
                <div className="source-note">
                  <span>来源说明</span>
                  <p>
                    馆藏关联信息来自{" "}
                    {activeArtifact.sources[0]?.publisher ?? activeArtifact.museum}
                    的开放记录；图像授权状态以原始来源页为准，解释性文字已单独标示。
                  </p>
                </div>
              </aside>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
