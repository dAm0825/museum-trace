"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { ArrowRight, ArrowUpRight } from "@/components/icons";
import type { BlueWhiteStats } from "@/lib/detective-types";

type ArchiveItem = {
  id: string;
  title: string;
  objectName: string;
  museum: string;
  tradition: string;
  period: string;
  motifs: string[];
  forms: string[];
  image: string;
  sourceUrl: string;
};

type ArchiveProps = {
  stats: BlueWhiteStats;
};

const motifOptions = Object.entries({
  "": "全部纹饰",
  龙纹: "龙纹",
  凤纹: "凤纹",
  缠枝纹: "缠枝纹",
  莲纹: "莲纹",
  牡丹纹: "牡丹纹",
  花卉纹: "花卉纹",
  山水纹: "山水纹",
  人物纹: "人物纹",
  禽鸟纹: "禽鸟纹",
  鱼藻纹: "鱼藻纹",
  水波纹: "水波纹",
  文字纹: "文字纹",
});

const periodOptions = Object.entries({
  "": "全部年代",
  元代: "元代",
  明代: "明代",
  清代: "清代",
  "14世纪": "14世纪",
  "15世纪": "15世纪",
  "16世纪": "16世纪",
  "17世纪": "17世纪",
  "18世纪": "18世纪",
  "19世纪": "19世纪",
});

export function BlueWhiteArchive({ stats }: ArchiveProps) {
  const [query, setQuery] = useState("");
  const [motif, setMotif] = useState("");
  const [period, setPeriod] = useState("");
  const [items, setItems] = useState<ArchiveItem[]>([]);
  const [resultTotal, setResultTotal] = useState(stats.total);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          q: query,
          motif,
          period,
          page: String(page),
          pageSize: "12",
        });
        const response = await fetch(`/api/blue-white?${params}`, {
          signal: controller.signal,
        });
        if (!response.ok) throw new Error("Archive request failed");
        const data = (await response.json()) as {
          items: ArchiveItem[];
          total: number;
          hasMore: boolean;
        };
        setItems((current) =>
          page === 1 ? data.items : [...current, ...data.items],
        );
        setResultTotal(data.total);
        setHasMore(data.hasMore);
      } catch (requestError) {
        if (
          !(requestError instanceof DOMException) ||
          requestError.name !== "AbortError"
        ) {
          setItems([]);
        }
      } finally {
        setLoading(false);
      }
    }, query ? 260 : 20);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [query, motif, period, page]);

  function resetPage() {
    setPage(1);
  }

  function investigate(id: string) {
    window.dispatchEvent(
      new CustomEvent("open-blue-white-case", { detail: id }),
    );
    document.querySelector("#investigator")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  return (
    <section className="archive-section" id="archive">
      <div className="archive-header">
        <div className="section-label">
          <span>OPEN EVIDENCE ARCHIVE</span>
          <i />
          <span>V&A + THE MET</span>
        </div>
        <div>
          <h2>
            {stats.total.toLocaleString("zh-CN")} 件青花，
            <br />
            <em>不是 1,172 个标签。</em>
          </h2>
          <p>
            每条记录都保留馆藏来源、时代字段、工艺字段及自动提取关系的证据片段。
            选择任意一件蓝白瓷，送入探案台继续追问。
          </p>
        </div>
      </div>

      <div className="archive-controls">
        <label className="archive-search">
          <span>SEARCH / {resultTotal.toLocaleString("zh-CN")}</span>
          <input
            type="search"
            value={query}
            placeholder="搜索龙纹、莲纹、瓶、罐、朝代或馆藏编号"
            onChange={(event) => {
              setQuery(event.target.value);
              resetPage();
            }}
          />
        </label>
        <select
          aria-label="按纹饰筛选"
          value={motif}
          onChange={(event) => {
            setMotif(event.target.value);
            resetPage();
          }}
        >
          {motifOptions.map(([value, label]) => (
            <option value={value} key={label}>
              {label}
            </option>
          ))}
        </select>
        <select
          aria-label="按年代筛选"
          value={period}
          onChange={(event) => {
            setPeriod(event.target.value);
            resetPage();
          }}
        >
          {periodOptions.map(([value, label]) => (
            <option value={value} key={label}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <div className={`archive-grid ${loading ? "is-loading" : ""}`}>
        {items.map((item, index) => (
          <article className="archive-card" key={item.id}>
            <div className="archive-image">
              {item.image ? (
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  sizes="(max-width: 720px) 100vw, 30vw"
                  unoptimized
                />
              ) : (
                <div className="archive-image-empty">
                  <span>{item.objectName || "青花瓷"}</span>
                  <strong>{item.title.slice(0, 1)}</strong>
                </div>
              )}
              <span className="archive-number">
                {String(index + 1 + (page - 1) * 12).padStart(3, "0")}
              </span>
              <span className="archive-museum">{item.museum}</span>
            </div>
            <div className="archive-copy">
              <span>
                {item.period} · {item.tradition}
              </span>
              <h3>{item.title}</h3>
              <div className="archive-tags">
                {item.motifs.map((value) => (
                  <span key={value}>{value}</span>
                ))}
                {item.forms.slice(0, 1).map((value) => (
                  <span key={value}>{value}</span>
                ))}
              </div>
              <div className="archive-actions">
                <button type="button" onClick={() => investigate(item.id)}>
                  送入探案台
                  <ArrowRight />
                </button>
                <a href={item.sourceUrl} target="_blank" rel="noreferrer">
                  来源
                  <ArrowUpRight />
                </a>
              </div>
            </div>
          </article>
        ))}
      </div>

      {!loading && items.length === 0 ? (
        <div className="archive-empty">
          没有匹配记录。尝试清除筛选，或换用“花卉纹”“15世纪”等条件。
        </div>
      ) : null}

      {hasMore ? (
        <button
          type="button"
          className="archive-more"
          disabled={loading}
          onClick={() => setPage((current) => current + 1)}
        >
          {loading ? "正在读取馆藏…" : "继续检索馆藏"}
          <span>{items.length} / {resultTotal.toLocaleString("zh-CN")}</span>
        </button>
      ) : null}
    </section>
  );
}
