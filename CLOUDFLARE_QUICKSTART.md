# LunaTV Cloudflare 部署快速开始指南

## 已完成的修改

### 1. Cloudflare 兼容性优化
- ✅ 修改 `next.config.js`，优化 webpack 配置以兼容 Cloudflare Pages
- ✅ 创建 `wrangler.toml` 配置文件

### 2. 注册功能
- ✅ 创建注册 API 路由 `/api/register`
- ✅ 创建注册页面 `/register`
- ✅ 更新登录页面，添加注册链接和成功提示
- ✅ 更新中间件，支持注册路由
- ✅ 更新 server-config API，返回注册配置

### 3. 配置文件
- ✅ 创建 `.env.cloudflare.example` 环境变量示例
- ✅ 创建 GitHub Actions 工作流 `cloudflare-pages.yml`
- ✅ 更新 README.md，添加 Cloudflare 部署说明
- ✅ 创建详细部署文档 `CLOUDFLARE_DEPLOY.md`

## 快速部署步骤

### 第一步：准备 Upstash Redis

1. 访问 [Upstash](https://upstash.com/)
2. 创建 Global 类型的 Redis 数据库
3. 复制 HTTPS URL 和 REST Token

### 第二步：Fork 并配置 GitHub 仓库

1. Fork LunaTV 到你的 GitHub
2. 添加以下 Secrets（在 Settings → Secrets and variables → Actions）：

```
CLOUDFLARE_API_TOKEN     = 你的 Cloudflare API Token
CLOUDFLARE_ACCOUNT_ID    = 你的 Cloudflare Account ID
UPSTASH_URL             = https://xxx.upstash.io
UPSTASH_TOKEN           = 你的 Upstash Token
USERNAME                = admin
PASSWORD                = 你的管理员密码
```

3. 可选，添加 Variables：
```
NEXT_PUBLIC_SITE_NAME           = LunaTV
NEXT_PUBLIC_ALLOW_REGISTRATION  = true
```

### 第三步：部署

推送代码到 main 分支，GitHub Actions 会自动：
1. 安装依赖
2. 构建项目
3. 部署到 Cloudflare Pages

完成后访问：`https://lunatv.pages.dev`

## 功能说明

### 注册功能

- 管理员可以通过登录页面的"注册"链接创建新账户
- 用户名：3-20个字符，只能包含字母、数字和下划线
- 密码：至少6个字符
- 管理员可以随时在环境变量中关闭注册功能

### 管理员账号

- 使用 USERNAME 和 PASSWORD 环境变量配置
- 第一个注册的普通用户需要管理员在后台添加权限

## 下一步

1. **配置播放源**：部署完成后，登录管理后台，配置你的播放源
2. **配置直播源**（可选）：添加直播源 URL
3. **自定义站点**：修改 NEXT_PUBLIC_SITE_NAME 等变量

## 详细文档

- [CLOUDFLARE_DEPLOY.md](CLOUDFLARE_DEPLOY.md) - 详细部署指南
- [README.md](README.md) - 项目完整文档

## 常见问题

### Q: 部署后无法访问？
A: 检查环境变量是否正确配置，特别是 Upstash 的 URL 和 Token。

### Q: 无法注册新用户？
A: 确认 NEXT_PUBLIC_ALLOW_REGISTRATION=true，并且存储类型不是 localstorage。

### Q: 如何关闭注册功能？
A: 在环境变量中设置 NEXT_PUBLIC_ALLOW_REGISTRATION=false。

---

有任何问题，请参考 CLOUDFLARE_DEPLOY.md 或提交 GitHub Issue。
