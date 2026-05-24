/* eslint-disable @typescript-eslint/no-explicit-any */

'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { CURRENT_VERSION } from '@/lib/version';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useSite } from '@/components/SiteProvider';

export default function RegisterPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [registrationAllowed, setRegistrationAllowed] = useState(true);
  const [registrationEnabled, setRegistrationEnabled] = useState(false);

  const { siteName } = useSite();

  useEffect(() => {
    const checkRegistration = async () => {
      try {
        const res = await fetch('/api/server-config');
        if (res.ok) {
          const data = await res.json();
          setRegistrationEnabled(data.allowRegistration || false);
          setRegistrationAllowed(data.allowRegistration || false);
        }
      } catch (_) {
        setRegistrationAllowed(false);
      }
    };

    checkRegistration();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!registrationAllowed) {
      setError('注册功能已关闭');
      return;
    }

    if (!username || !password || !confirmPassword) {
      setError('请填写所有字段');
      return;
    }

    if (password !== confirmPassword) {
      setError('两次输入的密码不一致');
      return;
    }

    try {
      setLoading(true);
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (res.ok) {
        router.replace('/login?registered=true');
      } else {
        setError(data.error || '注册失败');
      }
    } catch (_) {
      setError('网络错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  if (!registrationAllowed && !registrationEnabled) {
    return (
      <div className='relative min-h-screen flex items-center justify-center px-4'>
        <div className='absolute top-4 right-4'>
          <ThemeToggle />
        </div>
        <div className='text-center'>
          <h2 className='text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4'>
            注册功能已关闭
          </h2>
          <p className='text-gray-600 dark:text-gray-400 mb-6'>
            当前站点不允许新用户注册
          </p>
          <a
            href='/login'
            className='inline-flex items-center justify-center rounded-lg bg-green-600 py-3 px-6 text-base font-semibold text-white shadow-lg transition-all duration-200 hover:bg-green-700'
          >
            返回登录
          </a>
        </div>
        <div className='absolute bottom-4 left-1/2 transform -translate-x-1/2 text-xs text-gray-500 dark:text-gray-400'>
          v{CURRENT_VERSION}
        </div>
      </div>
    );
  }

  return (
    <div className='relative min-h-screen flex items-center justify-center px-4 overflow-hidden'>
      <div className='absolute top-4 right-4'>
        <ThemeToggle />
      </div>
      <div className='relative z-10 w-full max-w-md rounded-3xl bg-gradient-to-b from-white/90 via-white/70 to-white/40 dark:from-zinc-900/90 dark:via-zinc-900/70 dark:to-zinc-900/40 backdrop-blur-xl shadow-2xl p-10 dark:border dark:border-zinc-800'>
        <h1 className='text-green-600 tracking-tight text-center text-3xl font-extrabold mb-2'>
          {siteName}
        </h1>
        <p className='text-gray-600 dark:text-gray-400 text-center mb-8'>
          创建新账户
        </p>
        <form onSubmit={handleSubmit} className='space-y-6'>
          <div>
            <label htmlFor='username' className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
              用户名
            </label>
            <input
              id='username'
              type='text'
              autoComplete='username'
              className='block w-full rounded-lg border-0 py-3 px-4 text-gray-900 dark:text-gray-100 shadow-sm ring-1 ring-white/60 dark:ring-white/20 placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:ring-2 focus:ring-green-500 focus:outline-none sm:text-base bg-white/60 dark:bg-zinc-800/60 backdrop-blur'
              placeholder='输入用户名'
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <p className='mt-1 text-xs text-gray-500 dark:text-gray-400'>
              3-20个字符，只能包含字母、数字和下划线
            </p>
          </div>

          <div>
            <label htmlFor='password' className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
              密码
            </label>
            <input
              id='password'
              type='password'
              autoComplete='new-password'
              className='block w-full rounded-lg border-0 py-3 px-4 text-gray-900 dark:text-gray-100 shadow-sm ring-1 ring-white/60 dark:ring-white/20 placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:ring-2 focus:ring-green-500 focus:outline-none sm:text-base bg-white/60 dark:bg-zinc-800/60 backdrop-blur'
              placeholder='输入密码'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <p className='mt-1 text-xs text-gray-500 dark:text-gray-400'>
              至少6个字符
            </p>
          </div>

          <div>
            <label htmlFor='confirmPassword' className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
              确认密码
            </label>
            <input
              id='confirmPassword'
              type='password'
              autoComplete='new-password'
              className='block w-full rounded-lg border-0 py-3 px-4 text-gray-900 dark:text-gray-100 shadow-sm ring-1 ring-white/60 dark:ring-white/20 placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:ring-2 focus:ring-green-500 focus:outline-none sm:text-base bg-white/60 dark:bg-zinc-800/60 backdrop-blur'
              placeholder='再次输入密码'
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          {error && (
            <p className='text-sm text-red-600 dark:text-red-400'>{error}</p>
          )}

          <button
            type='submit'
            disabled={!username || !password || !confirmPassword || loading}
            className='inline-flex w-full justify-center rounded-lg bg-green-600 py-3 text-base font-semibold text-white shadow-lg transition-all duration-200 hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50'
          >
            {loading ? '注册中...' : '注册'}
          </button>

          <div className='text-center'>
            <a
              href='/login'
              className='text-sm text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300'
            >
              已有账号？立即登录
            </a>
          </div>
        </form>
      </div>

      <div className='absolute bottom-4 left-1/2 transform -translate-x-1/2 text-xs text-gray-500 dark:text-gray-400'>
        v{CURRENT_VERSION}
      </div>
    </div>
  );
}
