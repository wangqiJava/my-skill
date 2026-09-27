---
title: archify
description: 把想法、计划或系统结构变成一份自包含、可交互的 HTML 图表，交付前经过强制校验。
date: 2026-09-26
---

# archify

`archify` 是一个把技术意图变成「可交互架构图」的 Skill。你用一句话描述一个系统、流程或计划，Agent 按它的规范生成一份 typed JSON 源文件，经内置校验器逐项通过后，渲染成一个自包含的 HTML 文件——不需要任何安装或服务，双击就能看，支持聚焦节点、追踪路径、分章演示和导出分享卡。

它的定位很克制：不是通用画图编辑器，也不是 Mermaid 主题。自动解析 Mermaid、通用自动布局、托管分享和所见即所得编辑都被明确排除在范围之外；它只做一件事，把「讲清楚一个结构」变成可复查、可迭代的交付物。这篇记录根据 [skills.sh 的 archify 页面](https://www.skills.sh/tt-a1i/archify/archify) 与上游 README、SKILL.md 整理；本地完整实战案例仍需单独补录。

## 基本信息

| 项目 | 内容 |
| --- | --- |
| 记录日期 | 2026-09-26 |
| Skill 名称 | `archify` |
| 来源 | [tt-a1i/archify](https://github.com/tt-a1i/archify)，MIT 协议 |
| 入口文件 | [`archify/SKILL.md`](https://github.com/tt-a1i/archify/blob/main/archify/SKILL.md) |
| 版本 | skills.sh 首见于 2026-05-11；仓库开发版 `v2.17.0-dev.1`（未锁定提交） |
| 安装量 | skills.sh 页面显示约 104.1K |
| 使用环境 | 支持 Skills 的编码 Agent（Claude Code、Cursor、Codex CLI、OpenCode 等），本机需 Node.js |
| 输出 | 单文件 HTML，支持亮暗主题、导出 PNG / 视频与 1200×630 分享卡 |

## 它解决什么

架构图常见的困境是两边不讨好：手画的图好看但改不动，Mermaid 能进版本库但表达力有限；Agent 生成的图又往往是一锤子买卖——布局失控、箭头乱堆、说错了也没法查证。`archify` 的做法是把图变成一份**带类型规范的 JSON 源文件**，图只是它的渲染结果：

- 每种图表都有 schema，源文件可进版本库、可增量修改
- 交付前必须通过校验器（schema、布局、HTML/SVG、路径、标签间距等逐项检查），失败时返回结构化的修复建议而不是报错堆栈
- 交互基于源文件里真实写下的节点和关系，不凭空发明拓扑

适合的场景：

- 给新同事或协作方解释系统架构、请求链路、CI/CD 流程
- 设计或 PR 评审时对比改动前后的结构（Architecture Delta）
- 把学习笔记、旅行计划这类「结构化想法」变成可分享的交互页面
- 读一个陌生仓库后产出有源码依据的运行时架构图（Evidence 节点标注 `SRC n`，锚定到具体 commit 的文件行号）

不适合：随手涂鸦、需要自由布局的设计稿，或想要一张纯静态图片——静态图有更轻的工具。

## 五种图表类型

| 类型 | 适用 | 写提示词时要给 |
| --- | --- | --- |
| Architecture | 组件、服务、存储、信任边界 | 范围、核心组件、主路径 |
| Workflow | CI/CD、审批、工具调用、runbook | 参与者、顺序、分支、异常 |
| Sequence | API 调用、缓存回退、异步时序 | 调用方、被调方、返回、时序 |
| Data Flow | 管道、数据血缘、PII、消费方 | 来源、变换、存储、边界 |
| Lifecycle | 状态机、重试、等待、终态 | 状态、事件、重试与取消路径 |

拿不准选哪个时，可以让 Agent 跑 `node archify/bin/archify.mjs guide "<描述>"`，或用上游的交互式场景指南。

## 工作方式

一次完整的生成流程是「写源 → 校验 → 交付」三步，校验是强制的：

1. **选类型并读规范。** Agent 根据问题从 `schemas/` 里读对应 schema 和一个 JSON 示例（只读这两个文件）；示例只提供字段形状，文案和布局要重新起稿。
2. **先写候选文件。** 一条清晰主路径、少量侧分支、精简标签，主节点不超过 12 个；`meta.quality_profile` 默认 `"showcase"`。自动路由和标签优先，诊断出问题前不手动指定几何参数。
3. **校验。**

```bash
node bin/archify.mjs validate <type> <candidate.json> --quality showcase --json
```

showcase 级通过要求 9 项 artifact 检查全部通过、0 组合错误、0 警告；只过 4 项基础检查不算数。失败输出带 `supportedFixes` 的诊断 JSON，在两轮修正内修完。
4. **交付。** 对最终 HTML，`deliver` 是验收命令：候选渲染并通过检查后，原子替换目标文件。通过的候选即冻结，不再改动，后续迭代改源文件。

关于动效有一条值得注意的约定：**静态输出是默认**，只有用户明确要演示或展示时才开启 motion，且动效尊重 `prefers-reduced-motion`、不进入正式导出。这与本站「动效克制」的原则一致。

## 安装与准备

按 skills.sh 页面安装单个 Skill：

```bash
npx skills add https://github.com/tt-a1i/archify --skill archify
```

全局安装可用 `npx skills add tt-a1i/archify -g`；不想安装可先试用 `npx skills use tt-a1i/archify@archify --agent codex`。

开始前准备三样即可：要画的对象描述、图表类型（或让 Agent 帮选）、是否有源码仓库可查。画已知系统时给出核心组件和主路径，比让 Agent 自由发挥效果好。

## 实际用法

### 输入示例

```text
Use Archify to diagram a web request: Browser calls the API,
the API checks Redis, and a cache miss queries PostgreSQL and fills the cache.
```

拿到第一版后在对话里继续收敛，例如「加上认证层」「高亮 cache-miss 路径」「切亮色主题」。源文件保持不变的部分不会被动到，可以小步迭代。

### 输出与效果

一次完整生成应留下：

1. 一份通过 showcase 校验的 JSON 源文件（可入库、可追溯）
2. 一个自包含 HTML，支持聚焦、上下游追踪（`#route=`、`#lens=`、`#focus=` 等稳定链接可直接分享）
3. 按需的分享卡（普通分享卡或路线分享卡，1200×630 PNG）

## 踩坑与解决

- **跳过校验直接交 HTML。** 上游把校验设计成交付的一部分；只做基础检查或手改渲染产物都会失去「可复查」这个核心价值。
- **一上来就手动摆坐标。** 自动路由是默认，几何控制参数（`via`、`channelX` 等）应在诊断指出问题后按修复建议逐个加，一次最多一个。
- **把示例 JSON 的事实照搬进新图。** 示例只提供字段形状；ID、文案、布局都应是新起稿的。
- **期待通用画图能力。** Mermaid 解析、自由布局、托管分享都不在范围内；需求偏离时换个工具更省时间。
- **把示例当成实战结论。** 本页目前是基于上游公开文档的整理，尚未记录本地完整安装、生成和验证结果。

## 使用心得

从上游文档看，这个 Skill 最有价值的两点：一是「图有源文件」——迭代、评审、复用都建立在可 diff 的 JSON 上；二是「校验先行」——交付物经过机器检查，错误以修复建议的形式返回。代价是流程比一句提示词出图要重，适合值得讲清楚的结构，不适合随手草图。

它对动效的态度（默认静态、按需开启、尊重系统偏好）也值得借鉴到自己的前端工作里。实际体验如何——校验循环是否顺手、中文文案渲染质量、大图是否还稳定——等本地跑过真实案例再补。

## 项目实战

暂未记录本地项目中完整走通的一次 `archify` 生成。后续有真实案例时，补充描述、源文件、校验回执和截图，不把假设写成结论。

## 参考资料

- [skills.sh：tt-a1i/archify/archify](https://www.skills.sh/tt-a1i/archify/archify)
- [tt-a1i/archify 仓库](https://github.com/tt-a1i/archify)
- [`archify/SKILL.md`](https://github.com/tt-a1i/archify/blob/main/archify/SKILL.md)
- [Proof Lab 在线示例](https://tt-a1i.github.io/archify/gallery.html)
- [Schema 参考](https://github.com/tt-a1i/archify/blob/main/archify/schemas/README.md)
