import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "物证 Museum Trace｜可溯源 AI 文物策展",
  description:
    "物证是一个以证据链为核心的 AI 文物策展与导览 Web 应用。聚合 1,000+ 件开放馆藏，输入兴趣、时间和同行者，生成一条可追溯、可重写、可访问的微型展览。",
  keywords: ["博物馆", "文物", "AI策展", "RAG", "文化遗产", "数字博物馆"],
  openGraph: {
    title: "物证 Museum Trace",
    description: "不是让 AI 讲文物，而是让 AI 把“为什么这样讲”的证据摊开。",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
