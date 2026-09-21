import { AUTH_HINT_COOKIE } from '@/lib/auth/constants'

/**
 * 클라이언트가 실제 인가 없이 "지금 로그인 상태로 보이는가"만 동기적으로 판단하기 위한 힌트.
 * 절대 인가 목적으로 서버에서 신뢰하지 않는다 — 실제 인가는 항상 httpOnly 세션 쿠키를 서버가 재검증한다.
 * 순수하게 게이트웨이가 로컬/DB 저장소 중 어디로 위임할지 고르는 UX 스위치일 뿐이다.
 */
export function isLoggedInClient(): boolean {
  if (typeof document === 'undefined') return false

  return document.cookie
    .split('; ')
    .some((entry) => entry === AUTH_HINT_COOKIE || entry.startsWith(`${AUTH_HINT_COOKIE}=`))
}
