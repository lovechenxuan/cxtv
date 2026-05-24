/* eslint-disable no-console, @typescript-eslint/no-explicit-any, @typescript-eslint/no-non-null-assertion */

import { AdminConfig } from './admin.types';
import { hashPassword, isHashed, verifyPassword } from './password';
import { Favorite, IStorage, PlayRecord, SkipConfig } from './types';

// 搜索历史最大条数
const SEARCH_HISTORY_LIMIT = 20;

// Cloudflare KV 存储实现
export class CloudflareKVStorage implements IStorage {
  private kv: any;

  constructor() {
    // 获取 KV 实例
    this.kv = getCloudflareKV();
  }

  // ---------- 播放记录 ----------
  private prKey(user: string) {
    return `u:${user}:pr`; // 一个用户的所有播放记录存储为一个对象
  }

  async getPlayRecord(
    userName: string,
    key: string
  ): Promise<PlayRecord | null> {
    const allRecords = await this.kv.get(this.prKey(userName), { type: 'json' });
    return allRecords?.[key] || null;
  }

  async setPlayRecord(
    userName: string,
    key: string,
    record: PlayRecord
  ): Promise<void> {
    const allRecords = await this.kv.get(this.prKey(userName), { type: 'json' }) || {};
    allRecords[key] = record;
    await this.kv.put(this.prKey(userName), JSON.stringify(allRecords));
  }

  async getAllPlayRecords(
    userName: string
  ): Promise<Record<string, PlayRecord>> {
    const allRecords = await this.kv.get(this.prKey(userName), { type: 'json' });
    return allRecords || {};
  }

  async deletePlayRecord(userName: string, key: string): Promise<void> {
    const allRecords = await this.kv.get(this.prKey(userName), { type: 'json' }) || {};
    delete allRecords[key];
    await this.kv.put(this.prKey(userName), JSON.stringify(allRecords));
  }

  async deleteAllPlayRecords(userName: string): Promise<void> {
    await this.kv.delete(this.prKey(userName));
  }

  // ---------- 收藏 ----------
  private favKey(user: string) {
    return `u:${user}:fav`;
  }

  async getFavorite(userName: string, key: string): Promise<Favorite | null> {
    const allFavorites = await this.kv.get(this.favKey(userName), { type: 'json' });
    return allFavorites?.[key] || null;
  }

  async setFavorite(
    userName: string,
    key: string,
    favorite: Favorite
  ): Promise<void> {
    const allFavorites = await this.kv.get(this.favKey(userName), { type: 'json' }) || {};
    allFavorites[key] = favorite;
    await this.kv.put(this.favKey(userName), JSON.stringify(allFavorites));
  }

  async getAllFavorites(userName: string): Promise<Record<string, Favorite>> {
    const allFavorites = await this.kv.get(this.favKey(userName), { type: 'json' });
    return allFavorites || {};
  }

  async deleteFavorite(userName: string, key: string): Promise<void> {
    const allFavorites = await this.kv.get(this.favKey(userName), { type: 'json' }) || {};
    delete allFavorites[key];
    await this.kv.put(this.favKey(userName), JSON.stringify(allFavorites));
  }

  async deleteAllFavorites(userName: string): Promise<void> {
    await this.kv.delete(this.favKey(userName));
  }

  // ---------- 用户注册 / 登录 ----------
  private userPwdKey(user: string) {
    return `u:${user}:pwd`;
  }

  async registerUser(userName: string, password: string): Promise<void> {
    const hashed = hashPassword(password);
    await this.kv.put(this.userPwdKey(userName), hashed);
    // 维护用户集合
    await this.addUserToSet(userName);
  }

  async verifyUser(userName: string, password: string): Promise<boolean> {
    const stored = await this.kv.get(this.userPwdKey(userName));
    if (!stored) return false;
    const ok = verifyPassword(password, stored);
    // 平滑迁移：如果是明文密码且验证通过，自动升级为加盐哈希
    if (ok && !isHashed(stored)) {
      const hashed = hashPassword(password);
      await this.kv.put(this.userPwdKey(userName), hashed);
    }
    return ok;
  }

  // 检查用户是否存在
  async checkUserExist(userName: string): Promise<boolean> {
    const exists = await this.kv.get(this.userPwdKey(userName));
    return !!exists;
  }

  // 修改用户密码
  async changePassword(userName: string, newPassword: string): Promise<void> {
    const hashed = hashPassword(newPassword);
    await this.kv.put(this.userPwdKey(userName), hashed);
  }

  // 删除用户及其所有数据
  async deleteUser(userName: string): Promise<void> {
    // 删除用户密码
    await this.kv.delete(this.userPwdKey(userName));

    // 从用户集合中移除
    await this.removeUserFromSet(userName);

    // 删除搜索历史
    await this.kv.delete(this.shKey(userName));

    // 删除播放记录
    await this.kv.delete(this.prKey(userName));

    // 删除收藏夹
    await this.kv.delete(this.favKey(userName));

    // 删除跳过片头片尾配置
    await this.kv.delete(this.skipKey(userName));
  }

  // ---------- 搜索历史 ----------
  private shKey(user: string) {
    return `u:${user}:sh`;
  }

  async getSearchHistory(userName: string): Promise<string[]> {
    const history = await this.kv.get(this.shKey(userName), { type: 'json' });
    return history || [];
  }

  async addSearchHistory(userName: string, keyword: string): Promise<void> {
    let history = await this.kv.get(this.shKey(userName), { type: 'json' }) || [];
    // 先去重
    history = history.filter((item: string) => item !== keyword);
    // 插入到最前
    history.unshift(keyword);
    // 限制最大长度
    if (history.length > SEARCH_HISTORY_LIMIT) {
      history = history.slice(0, SEARCH_HISTORY_LIMIT);
    }
    await this.kv.put(this.shKey(userName), JSON.stringify(history));
  }

  async deleteSearchHistory(userName: string, keyword?: string): Promise<void> {
    if (keyword) {
      let history = await this.kv.get(this.shKey(userName), { type: 'json' }) || [];
      history = history.filter((item: string) => item !== keyword);
      await this.kv.put(this.shKey(userName), JSON.stringify(history));
    } else {
      await this.kv.delete(this.shKey(userName));
    }
  }

  // ---------- 用户集合管理 ----------
  private usersKey() {
    return 'sys:users';
  }

  private async addUserToSet(userName: string): Promise<void> {
    const users = await this.kv.get(this.usersKey(), { type: 'json' }) || [];
    if (!users.includes(userName)) {
      users.push(userName);
      await this.kv.put(this.usersKey(), JSON.stringify(users));
    }
  }

  private async removeUserFromSet(userName: string): Promise<void> {
    let users = await this.kv.get(this.usersKey(), { type: 'json' }) || [];
    users = users.filter((u: string) => u !== userName);
    await this.kv.put(this.usersKey(), JSON.stringify(users));
  }

  async getAllUsers(): Promise<string[]> {
    const users = await this.kv.get(this.usersKey(), { type: 'json' });
    return users || [];
  }

  // ---------- 管理员配置 ----------
  private adminConfigKey() {
    return 'admin:config';
  }

  async getAdminConfig(): Promise<AdminConfig | null> {
    const config = await this.kv.get(this.adminConfigKey(), { type: 'json' });
    return config || null;
  }

  async setAdminConfig(config: AdminConfig): Promise<void> {
    await this.kv.put(this.adminConfigKey(), JSON.stringify(config));
  }

  // ---------- 跳过片头片尾配置 ----------
  private skipKey(user: string) {
    return `u:${user}:skip`;
  }

  private skipField(source: string, id: string) {
    return `${source}+${id}`;
  }

  async getSkipConfig(
    userName: string,
    source: string,
    id: string
  ): Promise<SkipConfig | null> {
    const allConfigs = await this.kv.get(this.skipKey(userName), { type: 'json' });
    const field = this.skipField(source, id);
    return allConfigs?.[field] || null;
  }

  async setSkipConfig(
    userName: string,
    source: string,
    id: string,
    config: SkipConfig
  ): Promise<void> {
    const allConfigs = await this.kv.get(this.skipKey(userName), { type: 'json' }) || {};
    const field = this.skipField(source, id);
    allConfigs[field] = config;
    await this.kv.put(this.skipKey(userName), JSON.stringify(allConfigs));
  }

  async deleteSkipConfig(
    userName: string,
    source: string,
    id: string
  ): Promise<void> {
    const allConfigs = await this.kv.get(this.skipKey(userName), { type: 'json' }) || {};
    const field = this.skipField(source, id);
    delete allConfigs[field];
    await this.kv.put(this.skipKey(userName), JSON.stringify(allConfigs));
  }

  async getAllSkipConfigs(
    userName: string
  ): Promise<{ [key: string]: SkipConfig }> {
    const allConfigs = await this.kv.get(this.skipKey(userName), { type: 'json' });
    return allConfigs || {};
  }

  // 清空所有数据
  async clearAllData(): Promise<void> {
    try {
      // 获取所有用户
      const allUsers = await this.getAllUsers();

      // 删除所有用户及其数据
      for (const username of allUsers) {
        await this.deleteUser(username);
      }

      // 删除管理员配置
      await this.kv.delete(this.adminConfigKey());

      // 删除用户集合
      await this.kv.delete(this.usersKey());

      console.log('所有数据已清空');
    } catch (error) {
      console.error('清空数据失败:', error);
      throw new Error('清空数据失败');
    }
  }
}

// 获取 Cloudflare KV 实例
function getCloudflareKV(): any {
  // 在 Cloudflare Pages 环境中，KV 通过环境变量绑定访问
  // 在开发环境中，我们使用模拟的本地存储
  if (typeof process !== 'undefined' && process.env.NODE_ENV === 'development') {
    return getMockKV();
  }

  // 在 Cloudflare Pages 环境中
  // 注意：在 Edge Runtime 中，我们通过 globalThis 或环境变量访问 KV
  const globalKey = 'LUNATV_KV';
  if ((globalThis as any)[globalKey]) {
    return (globalThis as any)[globalKey];
  }

  // 如果 KV 不可用（构建阶段），返回一个模拟的 KV，避免构建失败
  // 这个模拟 KV 在实际运行时不会被使用，因为真正的 KV 会在 Pages 环境中绑定
  return getMockKV();
}

// 开发环境的模拟 KV（使用内存存储）
function getMockKV() {
  const storage: Map<string, string> = new Map();

  return {
    async get(key: string, _options?: any) {
      const value = storage.get(key);
      if (!value) return null;
      if (_options?.type === 'json') {
        try {
          return JSON.parse(value);
        } catch {
          return value;
        }
      }
      return value;
    },
    async put(key: string, value: string) {
      storage.set(key, value);
    },
    async delete(key: string) {
      storage.delete(key);
    },
    async list(_options?: any) {
      const keys = Array.from(storage.keys());
      return { keys: keys.map((name) => ({ name })) };
    }
  };
}
