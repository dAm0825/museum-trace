# 青花侦探 Blue & Trace

一个面向探究式学习的可解释 AI 青花瓷研究工具。

**在线演示：** [blue-trace-detective.netlify.app](https://blue-trace-detective.netlify.app)

用户不只问“这是什么”，而是继续追问：

- 为什么这件青花瓷会出现这种纹饰？
- 这类纹饰与哪些年代、器型同时出现？
- 图像观察与馆藏记录是否一致？
- 哪一步是有来源的事实，哪一步只是解释？

项目把 **视觉观察、馆藏检索、关系图遍历、跨记录比较、冲突检测和问题链生成** 串成一条可查看的研究流程。

## 数据规模

当前内置 **1,172 条蓝白瓷分析记录**：

| 来源 | 记录数 | 说明 |
| --- | ---: | --- |
| Victoria and Albert Museum | 1,100 | 从 Collections API 获取；只保留 porcelain 且材质/摘要可证明带蓝彩或釉下蓝彩的记录 |
| The Metropolitan Museum of Art | 72 | 从 Open Access CSV 中筛选的明确中国釉下青花记录 |

每条记录包含：

- 标题、器名、馆藏编号
- 年代、原始年代文本、标准化年代桶
- 材质与技法
- 纹饰线索、器型线索
- 文化传统标签
- 自动生成的观察、工艺、年代与不确定性说明
- 带原文证据片段和馆藏来源链接的关系数组

“中国青花”与“其他蓝白瓷/产地待考”会明确区分，不把比较对象或仿制品冒充为中国青花。

## 核心流程

```text
用户问题 / 图片
      │
      ▼
图像色彩观察（可选视觉模型候选）
      │
      ▼
从 1,172 条馆藏中定位分析对象
      │
      ▼
文物 ── 纹饰 ── 年代
  │       │
  └──── 器型 ── 年代
      │
      ▼
跨记录比较 + 冲突保留
      │
      ▼
证据报告 + 下一步问题链
```

### 可解释 Graph-RAG

- 每条文物关系都保存 `predicate / object / evidence / sourceUrl / kind`
- 纹饰和年代关系会回溯到标题、摘要、材质或时代字段中的原文
- 跨记录统计明确标注为“当前馆藏语料分布”，不冒充完整艺术史统计
- 前端的证据面板可直接打开 V&A 或 The Met 原始馆藏页面

### Agent 执行记录

系统返回真实工具执行轨迹：

1. 解析问题中的对象、纹饰、器型与年代假设
2. 定位馆藏对象
3. 遍历纹饰、器型与年代关系
4. 对同类记录做跨来源比较
5. 生成可以继续追问的问题链

### 多模态输入

未配置模型密钥时：

- 浏览器端读取上传图片
- 提取平均色彩、蓝色像素比例和亮度
- 明确标注“只描述颜色，不据此鉴定年代或真伪”

配置 DeepSeek `deepseek-flash` 或其他兼容 OpenAI Chat Completions 的视觉模型后：

- 视觉模型返回纹饰、器型、颜色与置信度候选
- 候选必须来自当前知识语料允许的标签集合
- 视觉候选与馆藏标签冲突时保留分歧，不强制统一

## 本地运行

```bash
pnpm install
pnpm dev
```

打开 [http://localhost:3000](http://localhost:3000)。

类型检查和生产构建：

```bash
pnpm typecheck
pnpm build
```

## 可选模型配置

公开证据图谱演示不需要密钥。若需启用视觉识别和证据约束的叙事综合：

```bash
cp .env.example .env.local
```

配置：

```env
LLM_API_KEY=
LLM_BASE_URL=https://api.deepseek.com
LLM_VISION_MODEL=deepseek-flash
LLM_TEXT_MODEL=deepseek-flash
```

模型只接收当前问题和已检索证据；系统提示要求不得补写输入中没有的史实。

## 数据更新

V&A：

```bash
pnpm data:blue-white:vam
```

The Met：

1. 从 [The Met Open Access](https://github.com/metmuseum/openaccess) 下载 `MetObjects.csv`
2. 保存为 `work/MetObjects.csv`
3. 运行：

```bash
pnpm data:blue-white:met
```

数据生成脚本会保留可重试检查点，避免单条馆藏接口失败导致整体重建。

## 目录结构

```text
app/
├── api/
│   ├── blue-white/route.ts    # 馆藏检索
│   └── investigate/route.ts   # 探究 Agent API
├── globals.css
├── layout.tsx
└── page.tsx
components/
├── blue-white-archive.tsx     # 1,172 条馆藏档案
├── detective-studio.tsx       # 探案台与问题链画布
└── icons.tsx
data/
├── met-blue-white-corpus.json
└── vam-blue-white-corpus.json
lib/
├── blue-white.ts              # 数据标准化与检索
├── detective-types.ts         # 领域类型
├── investigation.ts           # Graph-RAG 与证据报告
└── model.ts                   # 可选视觉/文本模型集成
scripts/
├── build_blue_white_corpus.py
└── build_vam_blue_white.mjs
```

## 数据边界

- 馆藏元数据不等于独立鉴定结论。
- 标题、摘要或标签提取出的纹饰关系仍可能漏掉图中细节。
- V&A 图片通过官方 IIIF 地址显示；使用和发布时应继续遵守其馆藏记录中的权利说明。
- The Met 筛选记录为 Public Domain 元数据；当前 CSV 生成结果未内置图片 URL，因此使用明确的记录占位卡。
- “产地待考”会保留为未知，不通过猜测补齐。

## 团队信息

- 团队名称：待补充
- 成员：待补充
- 指导教师：待补充
- 联系邮箱：待补充

## 原创声明

项目概念、关系抽取、证据报告与前端交互为本项目原创实现。馆藏元数据和图片来自对应博物馆开放平台，来源已在每条记录和界面中链接。
