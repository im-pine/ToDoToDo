'use client'

import { createContext, ReactNode, useContext, useEffect, useRef } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { todoKeys } from '@/lib/api/todoGateway'

export type AuthUser = {
  id: number
  nickname: string | null
  profileImage: string | null
}

type AuthContextValue = {
  user: AuthUser | null
  isLoggedIn: boolean
  isLoading: boolean
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

const AUTH_ME_KEY = ['auth', 'me'] as const

async function fetchMe(): Promise<AuthUser | null> {
  const res = await fetch('/api/auth/me')
  if (!res.ok) return null
  const data = await res.json()
  return data.user ?? null
}

/**
 * 로그인 상태를 표시/전환하기 위한 컨텍스트.
 * 실제 게스트/로그인 데이터 분기는 `todoGateway`가 쿠키를 직접 동기적으로 읽어 처리하므로
 * 이 컨텍스트가 로딩 중이어도 할일 목록 조회는 지연되지 않는다 — 여기선 UI 표시와,
 * 로그인 ↔ 로그아웃 전환 시 이전 모드의 React Query 캐시를 비우는 역할만 담당한다.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: AUTH_ME_KEY,
    queryFn: fetchMe,
    refetchOnWindowFocus: true,
  })

  const user = data ?? null
  const isLoggedIn = user !== null
  const prevLoggedInRef = useRef<boolean | null>(null)

  useEffect(() => {
    if (prevLoggedInRef.current !== null && prevLoggedInRef.current !== isLoggedIn) {
      // 로그인 ↔ 로그아웃 전환(다른 탭에서의 로그인 포함) — 이전 모드의 목록이 잠깐이라도 그려지지 않게 비운다
      queryClient.resetQueries({ queryKey: todoKeys.all })
    }
    prevLoggedInRef.current = isLoggedIn
  }, [isLoggedIn, queryClient])

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    queryClient.resetQueries({ queryKey: todoKeys.all })
    await queryClient.invalidateQueries({ queryKey: AUTH_ME_KEY })
  }

  return <AuthContext.Provider value={{ user, isLoggedIn, isLoading, logout }}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
