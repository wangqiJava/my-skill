# Skill 手记

用 Markdown 记录个人 Skill 学习、使用心得和踩坑过程，使用 VitePress 构建静态网站。

## 本地开发

建议使用 Node.js 22 LTS 和 npm。

```sh
npm ci
npm run docs:dev
```

打开终端显示的地址，编辑 `docs/` 下的 Markdown 即可实时预览。

## 内容目录

- `docs/skills/`：Skill 使用心得。
- `docs/pitfalls/`：踩坑与解决办法。
- `docs/templates/skill-note.md`：可复制的心得模板。
- `docs/guide/writing.md`：新增文章、插图和导航维护指南。
- `docs/.vitepress/config.mjs`：网站标题、中文导航和本地搜索配置。

新增文章后，请在对应分类的 `index.md` 添加链接；需要展示在侧边栏时，再修改网站配置。

## 构建与预览

```sh
npm run docs:build
npm run docs:preview
```

构建产物位于 `docs/.vitepress/dist/`，该目录和依赖、缓存都不会提交到 Git。

## 阿里云服务器部署准备

网站默认使用根路径 `/`，可以部署到服务器的公网 IP 根路径。服务器只需提供静态文件访问，不需要运行 Node.js 或数据库。

以下为 Linux + Nginx 的配置示例，尚未连接或修改任何服务器。实际部署前需确认服务器系统、已有站点和端口占用情况。

1. 在本地执行 `npm run docs:build`。
2. 将 `docs/.vitepress/dist/` **里面的全部内容**上传到服务器的站点目录，例如 `/var/www/my-skills`，确保该目录下直接包含 `index.html`。
3. 为站点添加 Nginx 配置，将 `YOUR_PUBLIC_IP` 替换为服务器公网 IP，并按实际情况调整网站目录：

```nginx
server {
    listen 80;
    server_name YOUR_PUBLIC_IP;

    root /var/www/my-skills;
    index index.html;

    location / {
        try_files $uri $uri/ =404;
    }

    error_page 404 /404.html;
    location = /404.html {
        internal;
    }
}
```

4. 确保 Nginx 对站点目录有读取权限；使用 `nginx -t` 验证配置后，再按服务器的服务管理方式重新加载 Nginx。
5. 在阿里云安全组和系统防火墙中按需放行 TCP 80 端口，通过 `http://服务器公网IP` 访问。

网站保留 `.html` 页面地址，无需配置单页应用的首页回退规则。若服务器已有网站，应合并到合适的 Nginx 配置中，避免覆盖现有站点。

公网 IP 访问用于部署验证，不代表免除服务器所在地适用的网站备案要求。

## 更新网站

修改 Markdown 后重新构建，将最新产物上传到相同的网站目录。当前没有配置自动部署，推送 GitHub 只会更新仓库。

后续若部署到子路径（例如 `/notes/`），需要同步调整 VitePress 的 `base` 和 Nginx 配置；绑定域名并继续使用根路径时，通常不需要修改文章内容。
