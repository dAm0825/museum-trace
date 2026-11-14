"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import { ArrowUpRight } from "@/components/icons";

type CatalogItem = {
  id: string;
  title: string;
  subtitle: string;
  museum?: string;
  category?: string;
  period: string;
  material: string;
  image: string;
  imagePage: string;
  source: string;
  code: string;
  accent: string;
};

type CatalogExplorerProps = {
  total: number;
  categories: string[];
  museums: string[];
};

const suggestions = ["青花", "青铜", "开元通宝", "山水", "佛像", "玉"];

export function CatalogExplorer({
  total,
  categories,
  museums,
}: CatalogExplorerProps) {
  const [query, setQuery] = useState("");
  const [museum, setMuseum] = useState("");
  const [category, setCategory] = useState("");
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [resultTotal, setResultTotal] = useState(total);
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
          museum,
          category,
          page: String(page),
          pageSize: "12",
        });
        const response = await fetch(`/api/catalog?${params}`, {
          signal: controller.signal,
        });
        if (!response.ok) throw new Error("catalog request failed");
        const data = (await response.json()) as {
          items: CatalogItem[];
          total: number;
          hasMore: boolean;
        };
        setItems((current) =>
          page === 1 ? data.items : [...current, ...data.items],
        );
        setResultTotal(data.total);
        setHasMore(data.hasMore);
      } catch (error) {
        if (!(error instanceof DOMException && error.name === "AbortError")) {
          setItems([]);
        }
      } finally {
        setLoading(false);
      }
    }, query ? 260 : 30);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [query, museum, category, page]);

  function updateQuery(value: string) {
    setQuery(value);
    setPage(1);
  }

  function updateMuseum(value: string) {
    setMuseum(value);
    setPage(1);
  }

  function updateCategory(value: string) {
    setCategory(value);
    setPage(1);
  }

  return (
    <div className="catalog-explorer">
      <div className="catalog-toolbar">
        <div className="catalog-search">
          <span>SEARCH / {resultTotal.toLocaleString("zh-CN")}</span>
          <label htmlFor="catalog-query">在馆藏中寻找一件文物</label>
          <input
            id="catalog-query"
            type="search"
            value={query}
            onChange={(event) => updateQuery(event.target.value)}
            placeholder="输入青花、青铜、开元通宝、山水……"
          />
        </div>
        <div className="catalog-filters">
          <label>
            <span>博物馆</span>
            <select value={museum} onChange={(event) => updateMuseum(event.target.value)}>
              <option value="">全部博物馆</option>
              {museums.map((name) => (
                <option key={name}>{name}</option>
              ))}
            </select>
          </label>
          <label>
            <span>类别</span>
            <select
              value={category}
              onChange={(event) => updateCategory(event.target.value)}
            >
              <option value="">全部类别</option>
              {categories.map((name) => (
                <option key={name}>{name}</option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <div className="catalog-suggestions">
        <span>快速检索</span>
        {suggestions.map((suggestion) => (
          <button key={suggestion} type="button" onClick={() => updateQuery(suggestion)}>
            {suggestion}
          </button>
        ))}
        {(query || museum || category) && (
          <button
            className="catalog-reset"
            type="button"
            onClick={() => {
              setQuery("");
              setMuseum("");
              setCategory("");
              setPage(1);
            }}
          >
            清除筛选
          </button>
        )}
      </div>

      <div className={`catalog-results ${loading ? "is-loading" : ""}`}>
        {items.map((item) => (
          <article className="catalog-item" key={item.id}>
            <div className="catalog-thumb">
              {item.image ? (
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  sizes="(max-width: 700px) 100vw, 30vw"
                  unoptimized
                />
              ) : (
                <div
                  className="catalog-thumb-fallback"
                  style={{ "--artifact-accent": item.accent } as CSSProperties}
                >
                  <span>{item.category ?? "馆藏"}</span>
                  <strong>{item.title.slice(0, 1)}</strong>
                  <small>暂无开放图像</small>
                </div>
              )}
              <span className="catalog-code">{item.code}</span>
              <span className="catalog-category">{item.category ?? "其他文物"}</span>
            </div>
            <div className="catalog-item-copy">
              <span>{item.museum}</span>
              <h3>{item.title}</h3>
              <p>{item.period} · {item.material}</p>
              {item.source ? (
                <a href={item.source} target="_blank" rel="noreferrer">
                  核对馆藏记录
                  <ArrowUpRight />
                </a>
              ) : null}
            </div>
          </article>
        ))}
      </div>

      {!loading && items.length === 0 ? (
        <div className="catalog-empty">
          <strong>没有匹配的馆藏</strong>
          <p>试试“青花”“铜镜”“山水”或切换博物馆。</p>
        </div>
      ) : null}

      {hasMore && items.length > 0 ? (
        <button
          className="catalog-more"
          type="button"
          disabled={loading}
          onClick={() => setPage((current) => current + 1)}
        >
          {loading ? "正在检索馆藏…" : "加载更多馆藏"}
          <span>{items.length} / {resultTotal.toLocaleString("zh-CN")}</span>
        </button>
      ) : null}
    </div>
  );
}
