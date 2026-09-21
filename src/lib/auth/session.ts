import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import {
  REMEMBER_MAX_AGE_SECONDS,
  SESSION_COOKIE,
  SHORT_SESSION_MAX_AGE_SECONDS,
} from '@/lib/auth/constants'

export type SessionPayload = { userId: number }

function getSecretKey(): Uint8Array {
  const secret = process.env.SESSION_JWT_SECRET
  if (!secret) throw new Error('SESSION_JWT_SECRET is not set')
  return new TextEncoder().encode(secret)
}

/** remember=true 면 7일, 아니면 24시간짜리 JWT를 발급한다. */
export async function signSession(payload: SessionPayload, remember: boolean): Promise<string> {
  const maxAgeSeconds = remember ? REMEMBER_MAX_AGE_SECONDS : SHORT_SESSION_MAX_AGE_SECONDS

  return new SignJWT({ userId: payload.userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(Math.floor(Date.now() / 1000) + maxAgeSeconds)
    .sign(getSecretKey())
}

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey())
    if (typeof payload.userId !== 'number') return null
    return { userId: payload.userId }
  } catch {
    return null
  }
}

type CookieOptions = {
  httpOnly: boolean
  secure: boolean
  sameSite: 'lax'
  path: string
  maxAge?: number
}

const isProd = process.env.NODE_ENV === 'production'

/** remember=false 면 maxAge를 생략해 브라우저 세션쿠키(창을 닫으면 사라짐)로 만든다. */
export function sessionCookieOptions(remember: boolean): CookieOptions {
  const base: CookieOptions = { httpOnly: true, secure: isProd, sameSite: 'lax', path: '/' }
  return remember ? { ...base, maxAge: REMEMBER_MAX_AGE_SECONDS } : base
}

export function authHintCookieOptions(remember: boolean): CookieOptions {
  const base: CookieOptions = { httpOnly: false, secure: isProd, sameSite: 'lax', path: '/' }
  return remember ? { ...base, maxAge: REMEMBER_MAX_AGE_SECONDS } : base
}

/**
 * Route Handler(서버)에서 현재 로그인한 사용자 id를 검증해 반환한다.
 * 쿠키가 없거나 서명/만료가 유효하지 않으면 null — 호출부가 401로 응답해야 한다.
 */
export async function requireUserId(): Promise<number | null> {
  const store = await cookies()
  const token = store.get(SESSION_COOKIE)?.value
  if (!token) return null

  const payload = await verifySessionToken(token)
  return payload?.userId ?? null
}
