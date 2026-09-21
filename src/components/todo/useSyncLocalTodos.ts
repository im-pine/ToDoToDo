'use client'

import { useCallback, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { todoKeys } from '@/lib/api/todoGateway'
import { clearLocalTodos, getLocalTodosForSync } from '@/lib/storage/localTodo'

/**
 * 로컬(기기) 할일을 서버 계정으로 마이그레이션하는 공통 로직.
 * 사이드바의 수동 동기화 모달과, 로그인 직후 자동으로 뜨는 프롬프트가 이 훅을 공유한다.
 */
export function useSyncLocalTodos() {
  const queryClient = useQueryClient()
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const sync = useCallback(async (): Promise<boolean> => {
    setPending(true)
    setError(null)

    try {
      const res = await fetch('/api/todo/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ todos: getLocalTodosForSync() }),
      })

      if (!res.ok) {
        const body = await res.json().catch(() => null)
        throw new Error(body?.message ?? '동기화에 실패했습니다.')
      }

      try {
        clearLocalTodos()
      } catch {
        // 마이그레이션 자체는 성공했으므로 실패로 취급하지 않되, 재동기화 시 중복되지 않도록 별도로 알린다
        setError('마이그레이션은 완료됐지만 이 기기의 데이터를 정리하지 못했습니다. 브라우저 저장소를 수동으로 비워주세요.')
      }

      await queryClient.resetQueries({ queryKey: todoKeys.all })
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : '동기화에 실패했습니다.')
      return false
    } finally {
      setPending(false)
    }
  }, [queryClient])

  return { sync, pending, error }
}
