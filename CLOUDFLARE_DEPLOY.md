# LunaTV Cloudflare Pages 部署指南

本文档详细介绍如何在 Cloudflare Pages 上部署 LunaTV 项目，并启用注册功能。

## 目录

- [前置准备](#前置准备)
- [部署方法](#部署方法)
  - [方法一：GitHub Actions 自动部署](#方法一github-actions-自动部署推荐)
  - [方法二：手动部署](#方法二手动部署)
- [配置说明](#配置说明)
- [常见问题](#常见问题)

## 前置准备

### 1. Cloudflare 账号

访问 [Cloudflare Dashboard](https://dash.cloudflare.com/) 注册账号并登录。

### 2. Upstash Redis 数据库

由于 Cloudflare Pages 是无服务器环境，需要使用外部数据库存储用户数据和播放记录。

1. 访问 [Upstash](https://upstash.com/) 注册账号
2. 点击 "Create Database"
3. 选择 **Global** 类型（提供全球低延迟访问）
4. 输入数据库名称，点击创建
5. 在数据库详情页面，复制以下信息：
   - **HTTPS URL**（格式：`https://xxx.upstash.io`）
   - **REST Token**（在 "REST API" 标签页）

> 💡 **提示**：Upstash 免费套餐足够个人使用，每日 10,000 次读取和 1,000 次写入。

### 3. Cloudflare API Token

1. 访问 [API Tokens](https://dash.cloudflare.com/profile/api-tokens)
2. 点击 "Create Token"
3. 选择 "Custom token" -> "Get started"
4. 配置权限：
   - Account: Cloudflare Pages - Edit
5. 点击 "Create Token" 并保存

### 4. Cloudflare Account ID

1. 登录 Cloudflare Dashboard
2. 在任意域名概览页面的右下角可以看到 "Account ID"
3. 复制并保存

## 部署方法

### 方法一：GitHub Actions 自动部署（推荐）

#### 步骤 1: Fork 项目

1. 访问 [LunaTV GitHub 仓库](https://github.com/MoonTechLab/LunaTV)
2. 点击右上角 "Fork" 按钮
3. 选择你的 GitHub 账号

#### 步骤 2: 配置 GitHub Secrets

1. 进入你 Fork 的仓库
2. 点击 "Settings" -> "Secrets and variables" -> "Actions"
3. 点击 "New repository secret" 添加以下 secrets：

| Secret Name | 说明 | 示例 |
|------------|------|------|
| CLOUDFLARE_API_TOKEN | Cloudflare API Token | Cfxxx... |
| CLOUDFLARE_ACCOUNT_ID | Cloudflare Account ID | abc123def456... |
| UPSTASH_URL | Upstash Redis URL | https://xxx.upstash.io |
| UPSTASH_TOKEN | Upstash REST Token | xxx... |
| USERNAME | 管理员用户名 | admin |
| PASSWORD | 管理员密码 | your_secure_password |

#### 步骤 3: 配置 GitHub Variables（可选）

1. 在同一个页面，点击 "Variables" 标签
2. 点击 "New repository variable" 添加：

| Variable Name | 说明 | 默认值 |
|--------------|------|--------|
| NEXT_PUBLIC_SITE_NAME | 站点名称 | LunaTV |
| NEXT_PUBLIC_ALLOW_REGISTRATION | 是否允许注册 | true |
| NEXT_PUBLIC_DOUBAN_PROXY_TYPE | 豆瓣代理类型 | cmliussss-cdn-tencent |

#### 步骤 4: 触发部署

1. 推送任何提交到 main 分支：
   ```bash
   git add .
   git commit -m "deploy to cloudflare"
   git push origin main
   ```

2. 访问仓库的 "Actions" 页面查看部署进度

3. 部署完成后，访问 `https://你的项目名.pages.dev`

---

### 方法二：手动部署

#### 步骤 1: 准备环境

确保已安装：
- Node.js 18+
- pnpm
- Wrangler CLI

```bash
npm install -g wrangler
```

#### 步骤 2: 克隆并配置

```bash
# 克隆项目
git clone https://github.com/你的用户名/LunaTV.git
cd LunaTV

# 安装依赖
pnpm install

# 复制环境变量模板
cp .env.cloudflare.example .env
```

#### 步骤 3: 编辑 .env 文件

```env
# 必填配置
USERNAME=你的管理员用户名
PASSWORD=你的管理员密码
NEXT_PUBLIC_STORAGE_TYPE=upstash
UPSTASH_URL=你的Upstash_URL
UPSTASH_TOKEN=你的Upstash_TOKEN

# 站点配置
NEXT_PUBLIC_SITE_NAME=LunaTV
NEXT_PUBLIC_ALLOW_REGISTRATION=true

# 豆瓣代理（推荐）
NEXT_PUBLIC_DOUBAN_PROXY_TYPE=cmliussss-cdn-tencent
NEXT_PUBLIC_DOUBAN_IMAGE_PROXY_TYPE=cmliussss-cdn-tencent
```

#### 步骤 4: 构建并部署

```bash
# 构建项目
pnpm build

# 部署到 Cloudflare Pages
wrangler pages deploy .next --project-name=lunatv
```

#### 步骤 5: 配置域名（可选）

1. 在 Cloudflare Dashboard 中进入 Pages
2. 选择你的项目
3. 点击 "Custom domains"
4. 添加你的域名并配置 DNS

## 配置说明

### 环境变量详解

| 变量名 | 说明 | 必填 | 可选值 | 默认值 |
|--------|------|------|--------|--------|
| USERNAME | 管理员账号 | 是 | 3-20位字母数字 | - |
| PASSWORD | 管理员密码 | 是 | 至少6位 | - |
| NEXT_PUBLIC_STORAGE_TYPE | 存储类型 | 是 | `upstash` | upstash |
| UPSTASH_URL | Upstash 连接地址 | 是 | URL | - |
| UPSTASH_TOKEN | Upstash API Token | 是 | Token | - |
| NEXT_PUBLIC_SITE_NAME | 站点显示名称 | 否 | 任意字符串 | LunaTV |
| NEXT_PUBLIC_ALLOW_REGISTRATION | 是否开放注册 | 否 | `true`/`false` | true |
| NEXT_PUBLIC_ALLOW_CHANGE_PASSWORD | 是否允许修改密码 | 否 | `true`/`false` | true |
| NEXT_PUBLIC_DOUBAN_PROXY_TYPE | 豆瓣数据代理 | 否 | 见下文 | cmliussss-cdn-tencent |
| NEXT_PUBLIC_DOUBAN_IMAGE_PROXY_TYPE | 豆瓣图片代理 | 否 | 见下文 | cmliussss-cdn-tencent |

### 豆瓣代理类型说明

- `direct`: 直接请求（可能失败）
- `cmliussss-cdn-tencent`: 腾讯云 CDN 加速（推荐）
- `cmliussss-cdn-ali`: 阿里云 CDN 加速
- `custom`: 自定义代理（需配合 NEXT_PUBLIC_DOUBAN_PROXY 使用）

## 常见问题

### Q1: 部署后访问显示空白页面

1. 检查浏览器控制台是否有错误
2. 确认环境变量是否正确配置
3. 检查 Upstash 数据库是否正常连接

### Q2: 无法注册新用户

1. 确认 `NEXT_PUBLIC_ALLOW_REGISTRATION=true`
2. 确认存储类型不是 `localstorage`
3. 检查 Upstash 数据库连接是否正常

### Q3: 播放记录不保存

1. 确认使用了 `upstash` 存储类型
2. 检查 Upstash 的日配额是否用完
3. 查看 Cloudflare Pages 函数日志

### Q4: 如何查看部署日志

1. 访问 Cloudflare Dashboard -> Pages
2. 选择你的项目
3. 点击 "Builds" 查看构建日志
4. 点击 "Functions" -> "Logs" 查看运行时日志

### Q5: 如何更新部署

只需推送新代码到 GitHub，GitHub Actions 会自动重新构建和部署。

### Q6: 如何回滚到旧版本

1. 访问 Cloudflare Dashboard -> Pages
2. 选择你的项目
3. 点击 "Deployments"
4. 找到旧版本，点击 "Promote to production"

## 安全建议

1. **使用强密码**：管理员密码至少12位，包含大小写字母、数字和特殊字符
2. **限制注册**：如果不需要公开注册，设置为 `NEXT_PUBLIC_ALLOW_REGISTRATION=false`
3. **定期备份**：定期导出 Upstash 数据
4. **启用 Cloudflare WAF**：在 Cloudflare 安全设置中启用 Web 应用防火墙

## 技术支持

如果遇到问题，可以：

1. 查看 [GitHub Issues](https://github.com/MoonTechLab/LunaTV/issues)
2. 提交新的 Issue 描述你的问题
3. 访问 [Upstash 文档](https://docs.upstash.com/) 了解数据库配置

---

祝你部署成功！🎉
