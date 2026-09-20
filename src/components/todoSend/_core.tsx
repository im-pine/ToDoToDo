'use client'

import { FormEvent, useCallback, useRef, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import ToDo from '@/components/todo/_core'

export type UseTodoSendOptions = {
  /** 지정하면 해당 투두의 하위로 생성된다. 모달의 '하위 작업 추가'가 이 경로를 쓴다. */
  parentId?: number | null
  onCreated?: () => void
}

/**
 * 할일 입력 → 생성 로직.
 *
 * parentId 만 바꿔 끼우면 최상위 입력창과 모달의 하위 작업 추가가 같은 core 를 공유한다.
 */
export function useTodoSendCore({ parentId = null, onCreated }: UseTodoSendOptions = {}) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const formRef = useRef<HTMLFormElement>(null)
  const queryClient = useQueryClient()

  const submit = useCallback(
    async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault()

      const formData = Object.fromEntries(new FormData(e.currentTarget))
      const title = String(formData.title ?? '')

      setLoading(true)
      setError(null)

      try {
        const todo = new ToDo(title)
        todo.parentId = parentId

        // 빈 제목 검증은 ToDo.create() 가 담당한다(단일 진입점)
        await todo.create()

        formRef.current?.reset()
        await queryClient.invalidateQueries({ queryKey: ['todo'] })
        onCreated?.()
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)))
      } finally {
        setLoading(false)
      }
    },
    [parentId, onCreated, queryClient]
  )

  return { submit, loading, error, formRef }
}

export default useTodoSendCore
