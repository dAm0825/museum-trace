import Image from "next/image";
import Link from "next/link";
import { BlueWhiteArchive } from "@/components/blue-white-archive";
import { DetectiveStudio } from "@/components/detective-studio";
import { ArrowRight, ArrowUpRight, Spark } from "@/components/icons";
import {
  blueWhiteStats,
  defaultArtifact,
} from "@/lib/blue-white";
import { investigate } from "@/lib/investigation";

export default function Home() {
  const initialReport = investigate({
    question: "为什么这件青花瓷上的人物画像值得继续追问？",
    artifactId: defaultArtifact.id,
  });
  const primaryMotif =
    defaultArtifact.motifs.find((motif) => motif !== "纹饰未标注") ?? "人物纹";

  return (
    <main>
      <header className="site-header detective-header">
        <Link className="brand" href="/" aria-label="青花侦探首页">
          <span className="brand-mark">
            <i />
            <i />
            <i />
          </span>
          <span className="brand-words">
            <strong>青花侦探</strong>
            <small>青花瓷证据探究工具</small>
          </span>
        </Link>
        <nav aria-label="主导航">
          <a href="#investigator">探案台</a>
          <a href="#method">推理机制</a>
          <a href="#archive">馆藏档案</a>
        </nav>
        <a className="header-action" href="#investigator">
          开始探查
          <ArrowRight />
        </a>
      </header>

      <section className="detective-hero">
        <div className="hero-grid-lines" />
        <div className="hero-copy">
          <div className="eyebrow">
            <span className="eyebrow-dot" />
            可解释知识图谱检索
          </div>
          <h1>
            <span className="hero-line">不是“这是什么”，</span>
            <span className="hero-line">
              而是<em>“它为何如此？”</em>
            </span>
          </h1>
          <p>
            青花侦探把一件瓷器拆成纹饰、器型、年代与工艺关系。
            每个判断都带出处，每处分歧都值得继续追问。
          </p>
          <div className="hero-actions">
            <a className="primary-action" href="#investigator">
              <Spark />
              开始一桩文物探查
            </a>
            <a className="text-action" href="#method">
              查看推理机制
              <ArrowRight />
            </a>
          </div>
          <div className="hero-metrics">
            <div>
              <strong>{blueWhiteStats.total.toLocaleString("zh-CN")}</strong>
              <span>件蓝白瓷档案</span>
            </div>
            <div>
              <strong>{blueWhiteStats.explicitChinese.toLocaleString("zh-CN")}</strong>
              <span>件明确中国青花</span>
            </div>
            <div>
              <strong>{Object.keys(blueWhiteStats.motifCounts).length}</strong>
              <span>类可检索纹饰</span>
            </div>
          </div>
        </div>

        <div className="hero-case">
          <div className="hero-case-topline">
            <span>实时馆藏案卷</span>
            <span>
              {defaultArtifact.museumShortName} / {defaultArtifact.accessionNumber}
            </span>
          </div>
          <div className="hero-case-image">
            <Image
              src={defaultArtifact.image}
              alt={defaultArtifact.title}
              fill
              priority
              unoptimized
              sizes="(max-width: 900px) 100vw, 48vw"
            />
            <span className="scan-cross cross-one">+</span>
            <span className="scan-cross cross-two">+</span>
            <span className="scan-cross cross-three">+</span>
            <span className="hero-image-label label-motif">01 / {primaryMotif}</span>
            <span className="hero-image-label label-period">
              02 / {defaultArtifact.periodBucket}
            </span>
          </div>
          <div className="hero-case-footer">
            <div>
              <span>探案对象</span>
              <strong>{defaultArtifact.title}</strong>
              <small>
                {defaultArtifact.period} · {defaultArtifact.medium}
              </small>
            </div>
            <span className="case-actions-link">
              <ArrowUpRight />
            </span>
          </div>
          <div className="hero-evidence-card">
            <span>证据 · 来源线索</span>
            <p>
              “馆藏摘要明确提到人物装饰，且制作年代约为 1680 年。”
            </p>
            <div>
              <strong>馆藏原始记录</strong>
              <small>可回到原始记录</small>
            </div>
          </div>
        </div>

        <a className="hero-scroll" href="#investigator">
          <span>向下开始探查</span>
          <i />
        </a>
      </section>

      <div className="ticker" aria-hidden="true">
        <div>
          <span>图像色彩线索</span><b>◇</b>
          <span>纹饰关系</span><b>◇</b>
          <span>器型谱系</span><b>◇</b>
          <span>年代分布</span><b>◇</b>
          <span>来源交叉核验</span><b>◇</b>
          <span>保留证据分歧</span><b>◇</b>
          <span>图像色彩线索</span><b>◇</b>
          <span>纹饰关系</span><b>◇</b>
          <span>器型谱系</span><b>◇</b>
          <span>年代分布</span><b>◇</b>
        </div>
      </div>

      <DetectiveStudio initialReport={initialReport} stats={blueWhiteStats} />

      <section className="method-section" id="method">
        <div className="section-label">
          <span>四步探究流程</span>
          <i />
          <span>四个步骤</span>
        </div>
        <div className="method-heading">
          <h2>
            一个答案，
            <br />
            必须经过<em>四次质询。</em>
          </h2>
          <p>
            这不是“上传一张图，返回一段百科”。系统把图像观察、馆藏对象、
            关系图遍历和反证检查拆成可查看的执行步骤。
          </p>
        </div>
        <div className="method-grid">
          <article>
            <span>01</span>
            <strong>看见线索</strong>
            <p>提取图像的蓝色色域与亮度；配置视觉模型后，再提取纹饰和器型候选。</p>
            <i>图像 → 特征</i>
          </article>
          <article>
            <span>02</span>
            <strong>定位对象</strong>
            <p>从 {blueWhiteStats.total.toLocaleString("zh-CN")} 条蓝白瓷馆藏中寻找证据最接近的候选。</p>
            <i>文字 → 器物</i>
          </article>
          <article>
            <span>03</span>
            <strong>遍历关系</strong>
            <p>沿“文物→纹饰→年代/器型”展开多跳检索，并用当前语料的分布支持判断。</p>
            <i>器物 → 图谱</i>
          </article>
          <article>
            <span>04</span>
            <strong>保留分歧</strong>
            <p>年代假设错位、纹饰证据不足或视觉候选冲突时，系统明确标注不确定性。</p>
            <i>判断 → 核验</i>
          </article>
        </div>
      </section>

      <BlueWhiteArchive stats={blueWhiteStats} />

      <section className="research-note">
        <div>
          <span>研究说明</span>
          <h2>馆藏记录是证据，不是终点。</h2>
        </div>
        <div className="research-note-copy">
          <p>
            当前语料由维多利亚与艾尔伯特博物馆馆藏数据与大都会艺术博物馆开放馆藏
            筛选生成。主数据只纳入材质或官方摘要能够证明“瓷质且带蓝彩”的记录；
            纹饰关系来自馆藏名称、摘要和主题字段，并保留对应原文与来源链接。
          </p>
          <p>
            自动提取仍可能漏掉画面中未被文字记录的细节。“产地待考”会明确显示为未知，
            不通过模型补写。未配置视觉模型时，系统只做浏览器端色彩统计，不据此鉴定年代。
          </p>
        </div>
        <a href="#investigator">
          从证据出发
          <ArrowRight />
        </a>
      </section>

      <footer className="site-footer detective-footer">
        <div>
          <Link className="brand footer-brand" href="/">
            <span className="brand-mark">
              <i />
              <i />
              <i />
            </span>
            <span className="brand-words">
              <strong>青花侦探</strong>
              <small>青花瓷证据探究工具</small>
            </span>
          </Link>
          <p>让判断有出处，让不确定也有位置。</p>
        </div>
        <div className="footer-links">
          <a href="#investigator">探案台</a>
          <a href="#method">推理机制</a>
          <a href="#archive">馆藏档案</a>
          <a href={defaultArtifact.sourceUrl} target="_blank" rel="noreferrer">
            数据来源
          </a>
        </div>
        <div className="footer-meta">
          <span>© 2026 青花侦探</span>
          <span>AI 网站开发挑战赛参赛作品</span>
        </div>
      </footer>
    </main>
  );
}
