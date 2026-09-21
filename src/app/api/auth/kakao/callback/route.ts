import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { authHintCookieOptions, sessionCookieOptions, signSession } from '@/lib/auth/session'
import { AUTH_HINT_COOKIE, OAUTH_STATE_COOKIE, SESSION_COOKIE } from '@/lib/auth/constants'

type KakaoTokenResponse = {
  access_token: string
}

type KakaoUserResponse = {
  id: number
  kakao_account?: {
    profile?: {
      nickname?: string
      profile_image_url?: string
    }
  }
}

function redirectWithFailure(origin: string, reason: string): NextResponse {
  const response = NextResponse.redirect(new URL(`/login?error=${reason}`, origin))
  response.cookies.set(OAUTH_STATE_COOKIE, '', { path: '/', maxAge: 0 })
  return response
}

export async function GET(req: Request) {
  const url = new URL(req.url)
  const code = url.searchParams.get('code')
  const state = url.searchParams.get('state')

  const store = await cookies()
  const expectedState = store.get(OAUTH_STATE_COOKIE)?.value

  if (!code || !state || !expectedState || state !== expectedState) {
    return redirectWithFailure(url.origin, 'invalid_state')
  }

  // state = `${nonce}.${remember ? '1' : '0'}` (login/route.ts 참고)
  const remember = state.endsWith('.1')

  const clientId = process.env.KAKAO_REST_API_KEY
  const clientSecret = process.env.KAKAO_CLIENT_SECRET
  const redirectUri = process.env.KAKAO_REDIRECT_URI
  if (!clientId || !redirectUri) {
    return redirectWithFailure(url.origin, 'not_configured')
  }

  try {
    const tokenBody = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: clientId,
      redirect_uri: redirectUri,
      code,
    })
    if (clientSecret) tokenBody.set('client_secret', clientSecret)

    const tokenRes = await fetch('https://kauth.kakao.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8' },
      body: tokenBody,
    })
    if (!tokenRes.ok) {
      console.error('kakao token exchange failed', tokenRes.status, await tokenRes.text())
      return redirectWithFailure(url.origin, 'token_exchange_failed')
    }
    const { access_token: accessToken } = (await tokenRes.json()) as KakaoTokenResponse

    const profileRes = await fetch('https://kapi.kakao.com/v2/user/me', {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
    if (!profileRes.ok) {
      console.error('kakao profile fetch failed', profileRes.status, await profileRes.text())
      return redirectWithFailure(url.origin, 'profile_fetch_failed')
    }
    const profile = (await profileRes.json()) as KakaoUserResponse

    const kakaoId = String(profile.id)
    const nickname = profile.kakao_account?.profile?.nickname ?? null
    const profileImage = profile.kakao_account?.profile?.profile_image_url ?? null

    // 매 로그인마다 최신 닉네임/프로필 사진으로 갱신 — 카카오 쪽에서 바뀌어도 다음 로그인 시 자동 동기화
    const user = await prisma.user.upsert({
      where: { kakaoId },
      update: { nickname, profileImage },
      create: { kakaoId, nickname, profileImage },
    })

    const token = await signSession({ userId: user.id }, remember)

    // justLoggedIn 쿼리로 "방금 로그인 콜백을 거쳐 왔다"는 것을 클라이언트에 명시적으로 알린다.
    // (그냥 isLoggedIn===true 만으로는 "새로고침한 기존 로그인 사용자"와 구분할 수 없다)
    const response = NextResponse.redirect(new URL('/?justLoggedIn=1', url.origin))
    response.cookies.set(SESSION_COOKIE, token, sessionCookieOptions(remember))
    response.cookies.set(AUTH_HINT_COOKIE, '1', authHintCookieOptions(remember))
    response.cookies.set(OAUTH_STATE_COOKIE, '', { path: '/', maxAge: 0 })

    return response
  } catch (err) {
    console.error(err)
    return redirectWithFailure(url.origin, 'unexpected_error')
  }
}
