/* eslint-disable no-console */

import { NextRequest, NextResponse } from 'next/server';

import { db } from '@/lib/db';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  const storageType = process.env.NEXT_PUBLIC_STORAGE_TYPE || 'localstorage';
  const allowRegistration = process.env.NEXT_PUBLIC_ALLOW_REGISTRATION === 'true';

  if (!allowRegistration) {
    return NextResponse.json(
      {
        error: '注册功能已关闭',
      },
      { status: 403 }
    );
  }

  if (storageType === 'localstorage') {
    return NextResponse.json(
      {
        error: '本地存储模式不支持用户注册',
      },
      { status: 400 }
    );
  }

  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || typeof username !== 'string') {
      return NextResponse.json(
        { error: '用户名不能为空' },
        { status: 400 }
      );
    }

    if (!password || typeof password !== 'string') {
      return NextResponse.json(
        { error: '密码不能为空' },
        { status: 400 }
      );
    }

    const trimmedUsername = username.trim();
    const trimmedPassword = password.trim();

    if (trimmedUsername.length < 3) {
      return NextResponse.json(
        { error: '用户名至少需要3个字符' },
        { status: 400 }
      );
    }

    if (trimmedPassword.length < 6) {
      return NextResponse.json(
        { error: '密码至少需要6个字符' },
        { status: 400 }
      );
    }

    if (trimmedUsername.length > 20) {
      return NextResponse.json(
        { error: '用户名不能超过20个字符' },
        { status: 400 }
      );
    }

    if (!/^[a-zA-Z0-9_]+$/.test(trimmedUsername)) {
      return NextResponse.json(
        { error: '用户名只能包含字母、数字和下划线' },
        { status: 400 }
      );
    }

    if (trimmedUsername.toLowerCase() === process.env.USERNAME?.toLowerCase()) {
      return NextResponse.json(
        { error: '该用户名已被注册' },
        { status: 400 }
      );
    }

    const userExists = await db.checkUserExist(trimmedUsername);
    if (userExists) {
      return NextResponse.json(
        { error: '该用户名已被注册' },
        { status: 400 }
      );
    }

    await db.registerUser(trimmedUsername, trimmedPassword);

    return NextResponse.json({
      ok: true,
      message: '注册成功',
    });
  } catch (error) {
    console.error('注册失败:', error);
    return NextResponse.json(
      {
        error: '注册失败',
        details: (error as Error).message,
      },
      { status: 500 }
    );
  }
}
