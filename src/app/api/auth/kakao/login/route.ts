import { NextResponse } from 'next/server'
import { randomBytes } from 'crypto'
import { OAUTH_STATE_COOKIE, OAUTH_STATE_MAX_AGE_SECONDS } from '@/lib/auth/constants'

/**
 * 카카오 로그인 진입점. `state`에 CSRF 방지용 nonce와 "자동 로그인" 선택 여부를 함께 실어 보낸다.
 * 콜백에서 state 쿠키와 비교 검증한 뒤에만 그 값을 신뢰한다.
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const remember = searchParams.get('remember') === '1'

  const nonce = randomBytes(16).toString('hex')
  const state = `${nonce}.${remember ? '1' : '0'}`

  const clientId = process.env.KAKAO_REST_API_KEY
  const redirectUri = process.env.KAKAO_REDIRECT_URI
  if (!clientId || !redirectUri) {
    return NextResponse.json({ message: 'Kakao OAuth is not configured' }, { status: 500 })
  }

  const authorizeUrl = new URL('https://kauth.kakao.com/oauth/authorize')
  authorizeUrl.searchParams.set('client_id', clientId)
  authorizeUrl.searchParams.set('redirect_uri', redirectUri)
  authorizeUrl.searchParams.set('response_type', 'code')
  authorizeUrl.searchParams.set('state', state)

  const response = NextResponse.redirect(authorizeUrl)
  response.cookies.set(OAUTH_STATE_COOKIE, state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: OAUTH_STATE_MAX_AGE_SECONDS,
  })

  return response
}
