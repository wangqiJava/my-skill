---
title: 冲融
description: 冲融工作区里 AGENTS.md 与项目 Skill 的协作总览。
date: 2026-09-18
---

# 冲融

工作区路径：`E:\code\work\chongrong`。

这是项目总览页。下面列出已经存在的项目 Skill 和文档分层。具体某条 Skill 的用法还没写，需要哪篇再补哪篇，不在这里编造实操。

## 文档分层

| 位置 | 管什么 |
| --- | --- |
| `AGENTS.md` | 工作区长期规则、安全边界、AI 工作流 |
| `doc/` | 已确认或待确认的业务基线 |
| `docs/feature-packets/` | 功能包：需求、设计、任务、验证 |
| `.agents/skills/` | 项目专用 Skill |

推荐顺序：

```text
先确认事实
→ 业务基线（chongrong-business-doc）
→ 需求（chongrong-feature-brief）
→ 设计（chongrong-feature-design）
→ 改代码（chongrong-ai-coding）
→ 验证（chongrong-test-manual / chongrong-mes-overall-testing）
```

## 项目 Skill（待写）

这些 Skill 只属于冲融，不进通用 [Skill 记录](/skills/)。

| Skill | 记录页 |
| --- | --- |
| `chongrong-business-doc` | 待写 |
| `chongrong-feature-brief` | 待写 |
| `chongrong-feature-design` | 待写 |
| `chongrong-ai-coding` | 待写 |
| `chongrong-test-manual` | 待写 |
| `chongrong-mes-overall-testing` | 待写 |

## 通用能力在本项目里怎么用

在冲融里用过、但本身可换项目的 Skill 或工具，正文写在第 2、3 类，这里只留入口。例如架构图约定用 `archify`，产物放 `doc/系统流程图/`。

## 还没写的

- 各项目 Skill 的一页说明（场景、输入、输出、坑）
- 一次真实功能从基线到验证的走通记录
