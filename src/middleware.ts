import { NextRequest, NextResponse } from 'next/server';
import { getClientIp, limitApiRoute, limitByIp } from '@lib/rateLimit';

const PROTECTED_API_PREFIXES = [
  '/api/auth/login-challenge',
  '/api/auth/login-verify',
  '/api/auth/register-challenge',
  '/api/auth/register-verify',
  '/api/auth/faceid/login-challenge',
  '/api/auth/faceid/login-verify',
  '/api/auth/faceid/register-challenge',
  '/api/auth/faceid/register-verify',
];

const isAuthPage = (pathname: string) =>
  pathname.startsWith('/sign-in') ||
  pathname.startsWith('/sign-up') ||
  pathname.startsWith('/faceid');

const matchProtectedApi = (pathname: string) =>
  PROTECTED_API_PREFIXES.find((prefix) => pathname.startsWith(prefix));

const buildRetryResponse = (retryAfterSeconds: number) =>
  NextResponse.json(
    { error: 'Bạn đã gửi quá nhiều yêu cầu. Vui lòng thử lại sau.' },
    {
      status: 429,
      headers: { 'Retry-After': String(Math.max(1, retryAfterSeconds)) },
    },
  );

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const clientIp = getClientIp(request.headers);

  // Rate limit các API auth nhạy cảm theo IP + route
  const matchedApi = matchProtectedApi(pathname);
  if (matchedApi) {
    const { success, reset } = await limitApiRoute(clientIp, matchedApi);
    if (!success) {
      const retrySeconds = Math.ceil(((reset ?? Date.now()) - Date.now()) / 1000);
      return buildRetryResponse(retrySeconds);
    }
    return NextResponse.next();
  }

  // Cho phép truy cập các trang auth/faceid công khai
  if (isAuthPage(pathname) || pathname.startsWith('/api')) {
    return NextResponse.next();
  }

  // Rate limit các route dashboard/profile
  const { success, reset } = await limitByIp(clientIp);
  if (!success) {
    const retrySeconds = Math.ceil(((reset ?? Date.now()) - Date.now()) / 1000);
    return buildRetryResponse(retrySeconds);
  }

  // Kiểm tra cookie phiên
  const sessionCookieName = process.env.SESSION_COOKIE_NAME ?? 'myapp-webauthn';
  const sessionCookie = request.cookies.get(sessionCookieName)?.value;
  const tokenCookie = request.cookies.get('token')?.value;
  const legacySessionCookie = request.cookies.get('session')?.value;

  if (sessionCookie || tokenCookie || legacySessionCookie) {
    return NextResponse.next();
  }

  const loginUrl = new URL('/sign-in', request.url);
  loginUrl.searchParams.set('next', pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: [
    '/profile',
    '/(dashboard)(.*)',
    '/api/auth/:path*',
  ],
};
