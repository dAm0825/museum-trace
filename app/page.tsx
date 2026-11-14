import Image from "next/image";
import Link from "next/link";
import { CuratorStudio } from "@/components/curator-studio";
import { ArrowRight, ArrowUpRight, Globe, Quote, Spark } from "@/components/icons";
import { artifacts } from "@/lib/artifacts";

export default function Home() {
  return (
    <main>
      <header className="site-header">
        <Link className="brand" href="/" aria-label="物证首页">
          <span className="brand-seal">物</span>
          <span className="brand-words">
            <strong>物证</strong>
            <small>MUSEUM TRACE</small>
          </span>
        </Link>

        <nav aria-label="主导航">
          <a href="#studio">AI 策展</a>
          <a href="#method">我们如何做</a>
          <a href="#collection">开放馆藏</a>
        </nav>

        <a className="header-action" href="#studio">
          开始策展
          <ArrowRight />
        </a>
      </header>

      <section className="hero" aria-labelledby="hero-title">
        <div className="hero-orbit hero-orbit-one" />
        <div className="hero-orbit hero-orbit-two" />
        <div className="hero-copy">
          <div className="eyebrow">
            <span className="eyebrow-dot" />
            可溯源 · 可共创 · 可访问
          </div>
          <h1 id="hero-title">
            每一件文物，
            <br />
            都有可被追问的
            <em>来路。</em>
          </h1>
          <p className="hero-lede">
            物证用 AI 把散落的馆藏信息重新编织成一条路线。
            每段叙述都能回到它的证据，每个观众都能改写自己的展览。
          </p>
          <div className="hero-actions">
            <a className="primary-action" href="#studio">
              <Spark />
              生成一条文物路线
            </a>
            <a className="text-action" href="#method">
              看看它如何思考
              <ArrowRight />
            </a>
          </div>
          <div className="hero-proof">
            <span>OPEN COLLECTION</span>
            <strong>07</strong>
            <p>件开放馆藏，21 条可核对证据</p>
          </div>
        </div>

        <div className="hero-collage" aria-label="文物图片拼贴">
          <div className="collage-main">
            <Image
              src="/images/jue.jpg"
              alt="商代青铜爵"
              fill
              priority
              sizes="(max-width: 900px) 80vw, 40vw"
            />
            <div className="image-overlay" />
            <div className="collage-caption">
              <span>01 / OBJECT</span>
              <strong>青铜爵</strong>
              <small>商代 · 约公元前 16 世纪</small>
            </div>
          </div>
          <div className="collage-secondary">
            <Image
              src="/images/waterfall.jpg"
              alt="南宋高士观瀑图"
              fill
              sizes="220px"
            />
            <span>南宋 · 山水</span>
          </div>
          <div className="evidence-float">
            <div className="quote-mark">
              <Quote />
            </div>
            <span>馆藏记录</span>
            <p>
              “长流、尖尾与三足共同构成爵的轮廓。”
            </p>
            <div className="float-source">
              <strong>MET OBJECT 72272</strong>
              <span>已核对</span>
            </div>
          </div>
          <span className="vertical-note">让判断有出处，让想象有边界</span>
        </div>

        <a className="scroll-cue" href="#studio" aria-label="向下浏览">
          <span>SCROLL TO EXPLORE</span>
          <i />
        </a>
      </section>

      <div className="marquee" aria-hidden="true">
        <div>
          <span>看见器物</span>
          <i>◆</i>
          <span>理解材料</span>
          <i>◆</i>
          <span>追问历史</span>
          <i>◆</i>
          <span>连接今天</span>
          <i>◆</i>
          <span>看见器物</span>
          <i>◆</i>
          <span>理解材料</span>
          <i>◆</i>
          <span>追问历史</span>
          <i>◆</i>
          <span>连接今天</span>
        </div>
      </div>

      <CuratorStudio artifacts={artifacts} />

      <section className="method-section" id="method">
        <div className="section-shell">
          <div className="section-kicker">
            <span className="kicker-line" />
            <span>WHY MUSEUM TRACE</span>
            <span className="kicker-index">03</span>
          </div>
          <div className="method-intro">
            <h2>
              好故事需要想象，
              <br />
              <em>也需要诚实。</em>
            </h2>
            <p>
              博物馆 AI 最珍贵的不是“什么都能说”，而是知道什么有依据、
              什么是解释、什么仍然未知。
            </p>
          </div>

          <div className="principles-grid">
            <article className="principle-card principle-featured">
              <div className="principle-number">01</div>
              <Quote />
              <h3>每一句，都能回看出处</h3>
              <p>
                馆藏事实、历史背景、学术解读分组呈现。点击来源即可回到原始馆藏记录，
                不让流畅的语言掩盖证据的边界。
              </p>
              <div className="claim-example">
                <span>馆藏记录</span>
                <p>“商代青铜爵，约公元前 16 世纪。”</p>
                <span className="claim-verified">SOURCE VERIFIED</span>
              </div>
            </article>
            <article className="principle-card">
              <div className="principle-number">02</div>
              <Globe />
              <h3>同一件文物，不止一种讲法</h3>
              <p>
                在成人、亲子和无障碍描述之间切换，改变的是语言与进入方式，
                不改变可靠的事实骨架。
              </p>
              <div className="perspective-preview">
                <span>成人</span>
                <span>亲子</span>
                <span>无障碍</span>
              </div>
            </article>
            <article className="principle-card">
              <div className="principle-number">03</div>
              <Spark />
              <h3>AI 是策展搭档，不是答案机器</h3>
              <p>
                检索、编排、改写与审校分步运行。你能看见 AI 做了什么，
                也能替换展品、改变主题，拿回策展的决定权。
              </p>
              <div className="mini-agent-flow">
                <span>检索</span>
                <i />
                <span>编排</span>
                <i />
                <span>审校</span>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section className="collection-section" id="collection">
        <div className="section-shell">
          <div className="section-kicker">
            <span className="kicker-line" />
            <span>OPEN COLLECTION</span>
            <span className="kicker-index">04</span>
          </div>
          <div className="collection-heading">
            <div>
              <h2>
                从七件器物出发，
                <br />
                走进<em>更辽阔的时间。</em>
              </h2>
            </div>
            <p>
              当前演示馆藏来自 The Metropolitan Museum of Art 开放收藏，
              所有图片为 Public Domain，并保留原始馆藏链接。
            </p>
          </div>

          <div className="collection-grid">
            {artifacts.map((artifact, index) => (
              <article
                className={`collection-card card-${index + 1}`}
                key={artifact.id}
              >
                <a href={artifact.sources[0].url} target="_blank" rel="noreferrer">
                  <div className="collection-image">
                    <Image
                      src={artifact.image}
                      alt={artifact.title}
                      fill
                      sizes="(max-width: 700px) 100vw, 33vw"
                      style={{
                        objectPosition: artifact.imagePosition ?? "center",
                      }}
                    />
                    <span>{artifact.code}</span>
                    <div className="collection-open">
                      <ArrowUpRight />
                    </div>
                  </div>
                  <div className="collection-info">
                    <span>
                      {artifact.period} · {artifact.medium}
                    </span>
                    <h3>{artifact.title}</h3>
                    <p>{artifact.englishTitle}</p>
                  </div>
                </a>
              </article>
            ))}
            <article className="collection-card collection-manifesto">
              <span>OPEN DATA / OPEN QUESTIONS</span>
              <h3>不止展示答案，也邀请你继续追问。</h3>
              <p>
                下一步，物证将继续接入更多开放馆藏、考古报告和策展人工作流。
              </p>
              <a href="#studio">
                用这些文物策展
                <ArrowRight />
              </a>
            </article>
          </div>
        </div>
      </section>

      <section className="closing-section">
        <div className="closing-mark">物</div>
        <p className="closing-kicker">A NEW WAY TO MEET THE PAST</p>
        <h2>
          文物不属于过去，
          <br />
          它正在<em>等待你的问题。</em>
        </h2>
        <a href="#studio">
          开始你的第一次策展
          <ArrowRight />
        </a>
      </section>

      <footer className="site-footer">
        <div>
          <Link className="brand footer-brand" href="/">
            <span className="brand-seal">物</span>
            <span className="brand-words">
              <strong>物证</strong>
              <small>MUSEUM TRACE</small>
            </span>
          </Link>
          <p>让判断有出处，让想象有边界。</p>
        </div>
        <div className="footer-links">
          <a href="#studio">体验策展</a>
          <a href="#method">技术理念</a>
          <a
            href="https://www.metmuseum.org/about-the-met/policies-and-documents/open-access"
            target="_blank"
            rel="noreferrer"
          >
            Open Access
          </a>
        </div>
        <div className="footer-meta">
          <span>© 2026 MUSEUM TRACE</span>
          <span>AI WEB DEVELOPMENT CHALLENGE</span>
        </div>
      </footer>
    </main>
  );
}
