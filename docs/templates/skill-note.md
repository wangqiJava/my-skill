---
title: 记录模板
description: 工作项目、通用 Skill、AI 工具共用的记录骨架。
---

# 记录模板

先定栏目，再复制对应骨架到新文件。示例日期和结论必须改成事实。

写完后在对应 `index.md` 加链接；要出现在左侧目录时改 `docs/.vitepress/config.mjs`。说明见[写作指南](../guide/writing.md)。

## 通用 Skill / AI 工具

放到 `docs/skills/` 或 `docs/tools/`。

````md
---
title: 名称
description: 一句话说明它解决什么。
date: YYYY-MM-DD
---

# 名称

## 基本信息

| 项目 | 内容 |
| --- | --- |
| 记录日期 | YYYY-MM-DD |
| 名称 |  |
| 来源 |  |
| 版本 |  |
| 使用环境 |  |

## 适用场景

## 安装与准备

## 实际用法

### 输入与操作

```text
提示词或操作
```

### 输出与效果

## 踩坑与解决

## 使用心得

## 在项目里出现过

- [项目总览](../projects/chongrong.md)（按实际改链接）
````

## 工作项目总览

放到 `docs/projects/`。

````md
---
title: 项目名
description: 这个仓库里 AI 怎么协作。
date: YYYY-MM-DD
---

# 项目名

## 工作区与规则

## 文档分层

## 项目 Skill

| Skill | 记录页 |
| --- | --- |
|  | 待写或链接 |

## 通用 Skill / 工具在本项目中的入口

## 还没写的
````
