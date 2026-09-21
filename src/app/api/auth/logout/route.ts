import { NextResponse } from 'next/server'
import { AUTH_HINT_COOKIE, SESSION_COOKIE } from '@/lib/auth/constants'

/**
 * 세션 쿠키만 지운다. 로컬스토리지 데이터는 서버가 손댈 수 없으므로 그대로 유지된다 —
 * 요구사항대로 "로그아웃해도 로컬 데이터는 보존" 이 자연히 성립한다.
 */
export async function POST() {
  const response = NextResponse.json({ ok: true }, { status: 200 })
  response.cookies.set(SESSION_COOKIE, '', { path: '/', maxAge: 0 })
  response.cookies.set(AUTH_HINT_COOKIE, '', { path: '/', maxAge: 0 })
  return response
}
