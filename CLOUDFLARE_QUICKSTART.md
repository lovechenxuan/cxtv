# LunaTV Cloudflare KV 部署快速开始指南

## 🎉 项目已升级：支持 Cloudflare KV！

我们已经将项目升级，现在支持使用 Cloudflare KV 作为存储后端，无需 Upstash Redis！

### 主要改动

1. ✅ 新增 `cloudflare-kv` 存储类型
2. ✅ 创建 Cloudflare KV 存储实现
3. ✅ 更新所有配置文件支持 KV
4. ✅ 创建详细的 KV 部署文档

---

## 🚀 快速部署步骤（使用 Cloudflare KV）

### 第一步：在 Cloudflare 创建 KV 命名空间

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 点击 "Workers & Pages" → "KV" 标签
3. 点击 "Create namespace"
4. 命名为 `LUNATV_KV`，点击 "Add"
5. 复制创建后的命名空间 ID（稍后可能需要）

### 第二步：在 Cloudflare Pages 创建项目并连接 GitHub

1. 在 Cloudflare Dashboard 中，进入 "Workers & Pages" → "Create application"
2. 点击 "Pages" 标签 → "Connect to Git"
3. 选择你的 GitHub 仓库（授权后）
4. 选择你的仓库和分支（main）

### 第三步：配置部署设置

在 "Build settings" 中：
- **Framework preset**: 选择 `Next.js`
- **Build command**: `npx pnpm build`
- **Build output directory**: `.next`

在 "Environment variables" 中，添加：

| 变量名 | 值 |
|--------|-----|
| `USERNAME` | 你的管理员用户名（至少 3 位） |
| `PASSWORD` | 你的管理员密码（至少 6 位） |
| `NEXT_PUBLIC_STORAGE_TYPE` | `cloudflare-kv` |
| `NEXT_PUBLIC_SITE_NAME` | `LunaTV`（可选） |
| `NEXT_PUBLIC_ALLOW_REGISTRATION` | `true`（可选，是否允许注册） |

### 第四步：完成部署并绑定 KV

1. 点击 "Save and Deploy"，等待部署完成
2. **重要**：部署成功后，进入项目的 "Settings"
3. 点击左侧 "Functions"
4. 找到 "KV namespaces bindings"，点击 "Add binding"
5. **Variable name** 输入 `LUNATV_KV`
6. **KV namespace** 选择你刚才创建的命名空间
7. 点击 "Save"

### 第五步：访问你的网站！

Cloudflare Pages 会提供一个访问地址，类似 `https://你的项目名.pages.dev`

---

## 📖 详细文档

- [CLOUDFLARE_KV_DEPLOY.md](./CLOUDFLARE_KV_DEPLOY.md) - Cloudflare KV 详细部署指南
- [README.md](./README.md) - 项目主文档
- [CLOUDFLARE_DEPLOY.md](./CLOUDFLARE_DEPLOY.md) - 如果你想继续使用 Upstash

---

## ✨ 新增的注册功能

项目现在包含完整的用户注册功能：

- 用户可以通过 `/register` 页面注册新账号
- 用户名限制：3-20 字符，只能包含字母、数字和下划线
- 密码限制：至少 6 位
- 可以通过 `NEXT_PUBLIC_ALLOW_REGISTRATION` 环境变量开关注册功能
- 注册成功后会跳转到登录页面并显示成功提示

---

## 📝 环境变量说明

| 变量 | 必填 | 说明 | 默认值 |
|------|------|------|--------|
| `USERNAME` | ✅ | 管理员用户名 | - |
| `PASSWORD` | ✅ | 管理员密码 | - |
| `NEXT_PUBLIC_STORAGE_TYPE` | ✅ | 存储类型（`cloudflare-kv` 或 `upstash`） | `cloudflare-kv` |
| `NEXT_PUBLIC_SITE_NAME` | ❌ | 站点显示名称 | `LunaTV` |
| `NEXT_PUBLIC_ALLOW_REGISTRATION` | ❌ | 是否允许新用户注册 | `true` |
| `UPSTASH_URL` | ❌ | Upstash Redis URL（仅使用 upstash 时） | - |
| `UPSTASH_TOKEN` | ❌ | Upstash Redis Token（仅使用 upstash 时） | - |

---

## 🎯 下一步

部署成功后：

1. 使用管理员账号登录
2. 进入管理后台配置视频源
3. 享受你的视频聚合网站！

---

## ❓ 常见问题

### Q: 部署后显示错误，无法访问？

**A:** 检查以下几点：
1. 确认在 Pages 项目设置中正确绑定了 KV 命名空间
2. 确认环境变量 `NEXT_PUBLIC_STORAGE_TYPE=cloudflare-kv`
3. 确认环境变量 USERNAME 和 PASSWORD 已设置

### Q: 如何绑定 KV 命名空间？

**A:** 在 Cloudflare Dashboard 中：
- Pages 项目 → Settings → Functions → KV namespaces bindings
- 添加绑定，Variable name 必须是 `LUNATV_KV`

### Q: 想回退到 Upstash 怎么办？

**A:** 很简单，只需：
1. 修改环境变量 `NEXT_PUBLIC_STORAGE_TYPE=upstash`
2. 添加 UPSTASH_URL 和 UPSTASH_TOKEN 环境变量
3. 重新部署

### Q: 数据会丢失吗？

**A:** Cloudflare KV 提供持久化存储，只要不手动删除数据，就不会丢失！

---

希望你使用愉快！🎉
