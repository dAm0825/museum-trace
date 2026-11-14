import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "青花侦探 Blue & Trace｜可解释 AI 文物探究",
  description:
    "从图片、纹饰、器型与年代追问一件青花瓷。聚合 1,000+ 件开放馆藏，以可解释关系图、来源引用和证据冲突生成文物探案报告。",
  keywords: ["青花瓷", "文物侦探", "博物馆", "Graph-RAG", "AI Agent", "文化遗产"],
  openGraph: {
    title: "青花侦探 Blue & Trace",
    description: "不只是识别青花瓷，而是把纹饰、器型、年代与来源关系摊开。",
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
