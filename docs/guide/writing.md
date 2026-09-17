# 写作指南

网站内容保存在仓库的 `docs/` 目录中。每个 Markdown 文件都会生成对应的网页。

## 本地预览

在仓库根目录执行：

```sh
npm ci
npm run docs:dev
```

打开终端显示的本地地址。保存 Markdown 后，预览页面会自动更新。

## 新增一篇心得

1. 复制[心得记录模板](../templates/skill-note.md)中的 Markdown。
2. 在 `docs/skills/` 下新建文件，例如 `my-first-skill.md`。
3. 填写真实的使用场景、过程和结论。
4. 在 `docs/skills/index.md` 的“文章目录”下添加链接：

```md
- [我的第一篇 Skill 使用心得](./my-first-skill.md)
```

文件名建议使用小写英文和短横线，文章标题可以使用中文。

::: tip 页面和目录
新增 Markdown 会生成网页，并参与本地搜索。分类目录中的链接需要手动添加；如果还希望文章出现在左侧导航，可按下文修改侧边栏。
:::

## 新增踩坑记录

将文章保存到 `docs/pitfalls/`，并在 `docs/pitfalls/index.md` 添加链接。可以参考该目录页给出的问题记录结构。

## 插入图片

可以在文章旁创建 `images` 目录保存图片，例如：

```text
docs/skills/
├── my-first-skill.md
└── images/
    └── result.png
```

在文章中使用相对路径：

```md
![本次任务的输出结果](./images/result.png)
```

截图和代码示例发布前，请移除密码、令牌及个人隐私信息。

## 维护侧边栏

网站导航保存在 `docs/.vitepress/config.mjs` 中。若希望文章直接出现在左侧目录，可在对应的 `items` 数组中增加一项：

```js
{ text: '我的第一篇 Skill 使用心得', link: '/skills/my-first-skill' }
```

顶部导航用于进入分类，分类目录页用于整理文章。文章较多时，可以优先维护分类目录页，让侧边栏保持简洁。

## 写提示与代码示例

提示块适合强调经验或限制：

```md
::: tip 实践经验
先用一个小任务验证输入和输出，再扩大任务范围。
:::
```

代码块可以指定语言以启用语法高亮。操作步骤、提示词和运行结果建议分开记录，便于复现。

## 构建与发布

在仓库根目录执行：

```sh
npm run docs:build
npm run docs:preview
```

构建会生成 `docs/.vitepress/dist/`。先在本地预览确认文章、链接和搜索正常，再将这个目录中的内容发布到服务器的网站目录。

服务器通过 Nginx 提供静态文件访问。每次更新文章后，需要重新构建并上传产物；仅提交 Markdown 到 GitHub 不会自动更新阿里云上的网站。公网 IP 部署示例见仓库根目录的 `README.md`。
