/* eslint-disable no-console */

import { NextRequest, NextResponse } from 'next/server';

import { getConfig } from '@/lib/config';
import { CURRENT_VERSION } from '@/lib/version'

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  console.log('server-config called: ', request.url);

  const config = await getConfig();
  const storageType = process.env.NEXT_PUBLIC_STORAGE_TYPE || 'localstorage';
  const allowRegistration = process.env.NEXT_PUBLIC_ALLOW_REGISTRATION === 'true';
  const allowChangePassword = process.env.NEXT_PUBLIC_ALLOW_CHANGE_PASSWORD !== 'false';

  const result = {
    SiteName: config.SiteConfig.SiteName,
    StorageType: storageType,
    Version: CURRENT_VERSION,
    allowRegistration: storageType !== 'localstorage' && allowRegistration,
    allowChangePassword: storageType !== 'localstorage' && allowChangePassword,
  };
  return NextResponse.json(result);
}
