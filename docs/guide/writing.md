# 写作指南

内容在 `docs/`。三类入口：

| 栏目 | 目录 | 一页是什么 |
| --- | --- | --- |
| 工作项目 | `docs/projects/` | 项目总览；项目 Skill 各一篇 |
| Skill 记录 | `docs/skills/` | 一个通用 Skill 一篇 |
| AI 工具 | `docs/tools/` | 一个产品一篇 |

踩坑写进对应条目，不要再往 `docs/pitfalls/` 加主导航文章。

## 本地预览

```sh
npm ci
npm run docs:dev
```

## 归类

- 只属于某个仓库的 Skill → 工作项目。
- 换项目还能用的 Skill → Skill 记录。
- Cursor、模型、MCP → AI 工具。
- 一次工作既用了项目流程又用了通用 Skill：拆两篇，互链，不复制全文。

## 新增工作项目

1. 在 `docs/projects/` 建总览，例如 `chongrong.md`。
2. 在 `docs/projects/index.md` 加链接。
3. 项目 Skill 要写成独立页时再新建文件，并改 `docs/.vitepress/config.mjs` 侧栏。

## 新增通用 Skill 或工具

1. 复制[记录模板](../templates/skill-note.md)里对应骨架。
2. 放到 `docs/skills/` 或 `docs/tools/`。
3. 在该类 `index.md` 和侧栏加上链接。

文件名用小写英文和短横线。首页卡片会统计非目录页的篇数，保存后刷新即可。

## 插入图片

```text
docs/skills/
├── grill-me.md
└── images/
    └── result.png
```

```md
![本次任务的输出结果](./images/result.png)
```

发布前去掉密码、令牌和个人信息。

## 维护侧栏

`docs/.vitepress/config.mjs` 的 `sidebar`。目录页负责列出文章；侧栏只挂常用入口。

## 构建与发布

```sh
npm run docs:build
npm run docs:preview
```

产物在 `docs/.vitepress/dist/`。部署方式见仓库 `README.md`。
