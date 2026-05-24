# LunaTV Cloudflare KV 部署指南

本指南将帮助你在 Cloudflare Pages 上使用 Cloudflare KV 部署 LunaTV，无需 Upstash。

## 优势

使用 Cloudflare KV 的优势：
- ✅ 完全在 Cloudflare 生态系统中，无需第三方服务
- ✅ 免费额度非常慷慨（每天 100,000 次读取，1,000 次写入）
- ✅ 数据持久化，不会自动清理
- ✅ 全球边缘网络，访问速度快
- ✅ 与 Cloudflare Pages 完美集成

## 前置准备

### 1. Cloudflare 账号
访问 [Cloudflare Dashboard](https://dash.cloudflare.com/) 注册并登录。

### 2. 创建 KV 命名空间
在 Cloudflare 控制台中创建 KV 命名空间：
1. 登录 Cloudflare Dashboard
2. 在左侧菜单点击 "Workers & Pages"
3. 点击 "KV" 标签
4. 点击 "Create namespace"
5. 命名为 `LUNATV_KV`（或你喜欢的其他名称）
6. 点击 "Add"
7. 创建完成后，复制命名空间的 ID（需要在配置中使用）

## 部署步骤

### 方法一：通过 Cloudflare Dashboard 手动部署（推荐新手）

#### 1. 准备项目
确保你的项目已经上传到 GitHub（你已经完成了这一步！）

#### 2. 在 Cloudflare Pages 创建项目
1. 进入 Cloudflare Dashboard → "Workers & Pages" → "Create application"
2. 点击 "Pages" 标签，然后点击 "Connect to Git"
3. 选择你的 GitHub 仓库（如果提示授权，先完成授权）
4. 选择仓库和分支（通常是 main）
5. 点击 "Begin setup"

#### 3. 配置构建设置
在 "Build settings" 部分：
- **Framework preset**: 选择 `Next.js` 或 `Next.js (Static)`
- **Build command**: 输入 `npx pnpm build`
- **Build output directory**: 输入 `.next`

#### 4. 配置环境变量
在 "Environment variables (advanced)" 部分，点击 "Add variable" 添加以下变量：

| 变量名 | 值 | 说明 |
|--------|-----|------|
| `USERNAME` | 你的管理员用户名 | 至少 3 个字符 |
| `PASSWORD` | 你的管理员密码 | 至少 6 个字符 |
| `NEXT_PUBLIC_STORAGE_TYPE` | `cloudflare-kv` | 固定值 |
| `NEXT_PUBLIC_SITE_NAME` | `LunaTV`（可选） | 站点名称 |
| `NEXT_PUBLIC_ALLOW_REGISTRATION` | `true`（可选） | 是否允许注册 |

#### 5. 配置 KV 命名空间绑定
1. 部署完成后（或者在部署前配置），进入你的 Pages 项目
2. 点击 "Settings" 标签
3. 在左侧菜单点击 "Functions"
4. 找到 "KV namespaces bindings" 部分
5. 点击 "Add binding"
6. **Variable name**: 输入 `LUNATV_KV`
7. **KV namespace**: 选择你刚才创建的 KV 命名空间
8. 点击 "Save"

#### 6. 完成部署
1. 点击 "Save and Deploy"
2. 等待部署完成（通常需要 1-3 分钟）
3. 部署完成后，Cloudflare 会提供一个访问地址（如 `https://your-project.pages.dev`）

---

### 方法二：使用 Wrangler CLI 部署（适合开发者）

#### 1. 安装 Wrangler
```bash
npm install -g wrangler
```

#### 2. 登录 Cloudflare
```bash
wrangler login
```

#### 3. 创建 KV 命名空间（如果还没有）
```bash
wrangler kv:namespace create "LUNATV_KV"
```
复制输出中的 `id`，稍后需要用到。

#### 4. 配置 wrangler.toml
编辑项目根目录的 `wrangler.toml`：
```toml
name = "lunatv"
compatibility_date = "2024-01-01"

[vars]
NEXT_PUBLIC_SITE_NAME = "LunaTV"
NEXT_PUBLIC_STORAGE_TYPE = "cloudflare-kv"

[[kv_namespaces]]
binding = "LUNATV_KV"
id = "你的-kv-namespace-id"  # 替换为你的 ID
```

#### 5. 部署
```bash
# 先构建项目
pnpm build

# 部署到 Cloudflare Pages
wrangler pages deploy .next --project-name=lunatv
```

---

## 重要：配置 KV 绑定到 API 路由

**关键步骤**：Cloudflare KV 需要在 Pages 的 Functions 设置中绑定，否则 API 路由无法访问 KV！

如果你使用的是自动部署（GitHub Actions 或 Git 连接），请确保在部署后手动配置 KV 绑定：

1. 进入 Cloudflare Dashboard → 你的 Pages 项目 → "Settings"
2. 点击左侧的 "Functions"
3. 找到 "KV namespaces bindings" → "Add binding"
4. Variable name: `LUNATV_KV`
5. KV namespace: 选择你创建的命名空间
6. 保存

## 更新 GitHub Actions 工作流（可选）

如果你想使用 GitHub Actions 自动部署，请更新 `.github/workflows/cloudflare-pages.yml`：

```yaml
name: Deploy to Cloudflare Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  deployments: write

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 10

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install

      - name: Build application
        env:
          NEXT_PUBLIC_SITE_NAME: ${{ vars.NEXT_PUBLIC_SITE_NAME || 'LunaTV' }}
          NEXT_PUBLIC_STORAGE_TYPE: cloudflare-kv
          USERNAME: ${{ secrets.USERNAME }}
          PASSWORD: ${{ secrets.PASSWORD }}
          NEXT_PUBLIC_ALLOW_REGISTRATION: ${{ vars.NEXT_PUBLIC_ALLOW_REGISTRATION || 'true' }}
        run: pnpm build

      - name: Deploy to Cloudflare Pages
        uses: cloudflare/pages-action@v1
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          projectName: lunatv
          directory: .next
          gitHubToken: ${{ secrets.GITHUB_TOKEN }}
```

注意：使用 GitHub Actions 部署后，你仍然需要在 Cloudflare Dashboard 中手动配置 KV 绑定！

## 验证部署

1. 访问你的 Cloudflare Pages 地址（如 `https://your-project.pages.dev`）
2. 使用管理员账号登录（USERNAME 和 PASSWORD 环境变量）
3. 尝试注册一个新用户（如果启用了注册功能）
4. 播放视频，然后刷新页面，检查播放记录是否保存
5. 添加收藏，检查收藏是否正常

## KV 数据管理

### 查看数据
在 Cloudflare Dashboard 中：
1. "Workers & Pages" → "KV"
2. 选择 `LUNATV_KV` 命名空间
3. 你可以查看、编辑、删除所有存储的键值对

### 备份数据
1. 在 KV 命名空间页面，点击 "More" → "Export"
2. 下载备份文件
3. 或者使用 Wrangler CLI：
   ```bash
   wrangler kv:key list --namespace-id=你的-namespace-id
   ```

### 清理数据
如果需要清空所有数据：
1. 可以逐个删除键
2. 或者删除命名空间并重新创建（谨慎操作！）

## 常见问题

### Q: KV 绑定不生效怎么办？
A: 确保以下几点：
1. 在 Pages 项目的 Settings → Functions → KV namespaces bindings 中正确配置了
2. Variable name 必须是 `LUNATV_KV`（和代码中一致）
3. 重新部署一次项目（或重新触发部署）

### Q: 免费额度够吗？
A: 对个人使用完全足够：
- 每天 100,000 次读取
- 每天 1,000 次写入
- 1 GB 存储
- 一个命名空间最多 500 MB

### Q: 如何从 Upstash 迁移到 Cloudflare KV？
A: 目前没有自动迁移工具，你需要：
1. 先从 Upstash 导出数据
2. 手动或编写脚本将数据导入 Cloudflare KV

### Q: 本地开发怎么使用 KV？
A: 代码中已经包含了开发环境的模拟 KV（内存存储），你可以直接开发，无需配置真实 KV。

## 回退到 Upstash

如果需要回退到 Upstash，只需修改环境变量：
- `NEXT_PUBLIC_STORAGE_TYPE=upstash`
- 添加 `UPSTASH_URL` 和 `UPSTASH_TOKEN`

---

## 下一步

部署成功后：
1. 登录管理后台配置视频源
2. 自定义站点设置
3. 分享给朋友使用！

有问题请查看 [README.md](./README.md) 或提交 Issue。
