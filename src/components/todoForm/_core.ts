'use client'

import { useQueryClient } from '@tanstack/react-query'
import { TodoState } from '@prisma/client'
import { useCallback, useRef, useState } from 'react'
import ToDo from '@/components/todo/_core'
import { todoKeys } from '@/lib/api/todoGateway'

export type TodoFormValues = {
  title: string
  contents: string
  state: TodoState
  /** input[type=date] 값 (yyyy-MM-dd). 빈 문자열이면 마감일 없음 */
  deadline: string
}

export const EMPTY_TODO_FORM: TodoFormValues = {
  title: '',
  contents: '',
  state: TodoState.PENDING,
  deadline: '',
}

export type TodoFormController = {
  values: TodoFormValues
  setValue: <K extends keyof TodoFormValues>(key: K, value: TodoFormValues[K]) => void
  reset: () => void
  submit: () => Promise<boolean>
  loading: boolean
  error: string | null
}

type UseTodoFormOptions = {
  /** 하위 할일로 생성할 경우 부모 id */
  parentId?: number | null
  initialValues?: Partial<TodoFormValues>
  onSuccess?: () => void
}

/**
 * 생성 폼의 상태·검증·저장을 담당한다.
 * 모달이든 한 줄 입력이든 같은 컨트롤러를 공유한다.
 */
export function useTodoForm({ parentId = null, initialValues, onSuccess }: UseTodoFormOptions = {}): TodoFormController {
  // 초기값은 마운트 시점에 고정한다 (reset 이 항상 같은 기준으로 돌아가도록)
  const initialRef = useRef<TodoFormValues>({ ...EMPTY_TODO_FORM, ...initialValues })
  const [values, setValues] = useState<TodoFormValues>(initialRef.current)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const queryClient = useQueryClient()

  const setValue = useCallback(<K extends keyof TodoFormValues>(key: K, value: TodoFormValues[K]) => {
    setError(null)
    setValues((prev) => ({ ...prev, [key]: value }))
  }, [])

  const reset = useCallback(() => {
    setValues(initialRef.current)
    setError(null)
  }, [])

  const submit = useCallback(async () => {
    const title = values.title.trim()
    if (!title) {
      setError('제목을 입력해 주세요.')
      return false
    }

    setLoading(true)
    try {
      const todo = new ToDo(title)
      todo.parentId = parentId
      todo.contents = values.contents.trim() || null
      todo.state = values.state
      todo.deadline = values.deadline ? new Date(values.deadline) : null

      await todo.create()
      await queryClient.invalidateQueries({ queryKey: todoKeys.all })

      reset()
      onSuccess?.()
      return true
    } catch (err) {
      console.error(err)
      setError('할일을 저장하지 못했습니다. 잠시 후 다시 시도해 주세요.')
      return false
    } finally {
      setLoading(false)
    }
  }, [onSuccess, parentId, queryClient, reset, values])

  return { values, setValue, reset, submit, loading, error }
}
