/**
 * 서버 전용 코드(next/headers, jose)를 끌어오지 않는 순수 상수 모듈.
 * 클라이언트 컴포넌트(clientAuth.ts)와 서버 코드(session.ts)가 같은 쿠키 이름/수명을 공유하기 위해 분리했다.
 */
export const SESSION_COOKIE = 'todo_session'
export const AUTH_HINT_COOKIE = 'todo_auth_hint'
export const OAUTH_STATE_COOKIE = 'kakao_oauth_state'

/** 자동 로그인 체크 시 세션 수명 */
export const REMEMBER_MAX_AGE_SECONDS = 60 * 60 * 24 * 7
/** 자동 로그인 미체크 시 — 브라우저 세션쿠키 + JWT 만료 캡(탭을 오래 열어둬도 강제 만료) */
export const SHORT_SESSION_MAX_AGE_SECONDS = 60 * 60 * 24
/** OAuth state nonce 쿠키 수명 (콜백에서 즉시 정리되므로 짧게) */
export const OAUTH_STATE_MAX_AGE_SECONDS = 60 * 5
