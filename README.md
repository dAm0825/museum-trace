# 物证 Museum Trace

一个以「证据链」为核心的 AI 文物策展与导览 Web 应用原型。用户输入兴趣、参观时间、同行者与观看视角后，系统会从开放馆藏资料中组合一条微型展览路线，并为关键叙述保留可回到原始馆藏页面的证据。

> 不是让 AI 讲文物，而是让 AI 把「为什么这样讲」的证据摊开。

![项目状态](https://img.shields.io/badge/status-interactive%20prototype-bd4c32)
![技术栈](https://img.shields.io/badge/Next.js-TypeScript-17211c)

## 核心体验

- **千件级馆藏**：内置 1,000+ 条馆藏记录，支持按博物馆、类别和关键词检索。
- **个性化策展**：根据兴趣、时长、受众与观看视角生成 4、6 或 8 件文物的路线。
- **非固定结果**：每次生成加入新的策展种子，并降低上一轮展品权重，因此同一问题会得到不同组合。
- **可追溯讲解**：将「馆藏记录」「历史背景」「学术解读」分开呈现。
- **多视角改写**：为同一件文物提供成人、亲子与无障碍描述。
- **证据审校**：每件文物包含 3 条证据片段和原始馆藏来源链接。
- **语音导览**：使用 Web Speech API 朗读当前讲解。
- **响应式设计**：桌面、平板和移动端均可使用。
- **本地可演示**：无需配置大模型密钥即可完整运行。

## 页面结构

1. 品牌首页与开放馆藏视觉
2. AI 策展工作台
3. 动态路线与文物讲解
4. 证据链展开面板
5. 产品理念与 AI 工作流说明
6. 开放馆藏浏览

## 技术架构

```text
app/
├── api/curate/route.ts    # 策展 API
├── globals.css            # 视觉系统与响应式样式
├── layout.tsx             # SEO 与页面布局
└── page.tsx               # 首页
components/
├── curator-studio.tsx     # 核心交互工作台
└── icons.tsx              # 原生 SVG 图标
lib/
├── artifacts.ts           # 馆藏、证据与来源数据
├── catalog.ts             # 千件级馆藏映射与讲解生成
├── curator.ts             # 主题推断、检索与路线编排
└── types.ts               # 领域类型
data/catalog-fixed.json     # 可重复生成的 1,000+ 馆藏目录
public/images/              # 开放授权藏品图片
```

当前版本采用轻量级本地检索编排：

1. 解析用户兴趣中的主题、材质、时代与观看偏好。
2. 在 1,000+ 馆藏记录中进行关键词和类别检索。
3. 注入随机策展种子，并对上一轮展品降权。
4. 根据参观时长选择 4、6 或 8 件文物，同时限制同一类别占比。
5. 生成路线、策展观点、Agent 执行记录和证据列表。
6. 将事实记录与解释性内容分组展示。

这一实现可以在没有外部 API 的情况下稳定演示。后续可将 `lib/curator.ts` 中的检索结果作为上下文，接入 LLM、向量数据库与真实 Agent 工具调用，同时保留当前证据审校与降级路径。

## 本地运行

环境要求：

- Node.js 20+
- pnpm 9+

```bash
pnpm install
pnpm dev
```

打开 [http://localhost:3000](http://localhost:3000)。

生产构建：

```bash
pnpm build
pnpm start
```

类型检查：

```bash
pnpm typecheck
```

## 环境变量

当前公开演示不依赖任何密钥。可复制 `.env.example` 并保留占位，方便后续接入大模型服务。

```bash
cp .env.example .env.local
```

切勿将真实 API 密钥提交到仓库。

## 数据与图像来源

千件级目录由 `scripts/fetch-catalog.mjs` 从以下开放数据源聚合：

- Wikidata 馆藏关联记录与共享图片链接
- The Metropolitan Museum of Art Open Access

当前数据分布为：

| 博物馆 | 记录数 |
| --- | ---: |
| 故宫博物院 | 650 |
| 大英博物馆 | 309 |
| 陕西历史博物馆 | 120 |
| 南京博物院 | 1 |
| 大都会艺术博物馆 | 11 |

另保留 7 件具有完整策展叙事和来源说明的重点文物，因此应用首页展示总量为 1,098。数据可由以下命令重新生成：

```bash
pnpm data:refresh
```

重点演示馆藏：

- [Open Access 说明](https://www.metmuseum.org/about-the-met/policies-and-documents/open-access)
- [青铜爵 72272](https://www.metmuseum.org/art/collection/search/72272)
- [玉龙环 39637](https://www.metmuseum.org/art/collection/search/39637)
- [玉璧 42840](https://www.metmuseum.org/art/collection/search/42840)
- [南宋山水 40196](https://www.metmuseum.org/art/collection/search/40196)
- [钧窑花盆 460663](https://www.metmuseum.org/art/collection/search/460663)
- [观音造像 42718](https://www.metmuseum.org/art/collection/search/42718)
- [北魏佛像 42733](https://www.metmuseum.org/art/collection/search/42733)

聚合目录中的图像可能来自 Wikimedia Commons，不能统一视为公共领域；授权状态与署名要求以每条记录链接到的原始页面为准。界面中的解释性文字为项目演示叙事，使用或扩展藏品时应继续核对来源、年代、材质与授权信息，不以生成内容替代专业鉴定。

## 竞赛能力映射

| 赛项要求 | 当前实现 |
| --- | --- |
| 大模型集成质量 | 预留模型接入层；当前使用稳定的本地降级模式 |
| Agent / 工作流 | 意图解析、证据检索、路线编排、事实审校四阶段 |
| RAG | 馆藏数据检索与相关性排序，保留来源索引 |
| 多模态 | 以文物图像为入口，支持图像浏览与语音导览 |
| AI 安全与可控性 | 事实、背景、解释分层，未知与推测明确标出 |
| 前端工程质量 | TypeScript、领域类型、API 分层、响应式与无障碍 |
| 用户体验 | 动态 Agent 反馈、流式式流程、多视角切换 |

## 团队信息

- 团队名称：待补充
- 成员：待补充
- 指导教师：待补充
- 联系邮箱：待补充

## 原创声明

本项目代码与产品概念为参赛原型开发。开放馆藏元数据和图片遵循其原始开放授权；馆藏来源已在页面、数据文件和本 README 中标注。
