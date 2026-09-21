'use client'

import { useQuery, useQueryClient } from '@tanstack/react-query'
import { TodoState } from '@prisma/client'
import { useCallback, useState } from 'react'
import { readUpcomingSubtasks, todoKeys } from '@/lib/api/todoGateway'
import ToDo, { TodoSubtaskSummary } from '@/components/todo/_core'

/**
 * ToDo 코어(도메인) ↔ React Query(캐시) 를 잇는 얇은 바인딩.
 * 어떤 UI 든 이 훅만 붙이면 동일한 쓰기 동작을 얻는다.
 */
export function useTodoActions(id: number) {
  const queryClient = useQueryClient()
  const [pending, setPending] = useState(false)

  const run = useCallback(
    async <T,>(task: (todo: ToDo) => Promise<T>): Promise<T | null> => {
      setPending(true)
      try {
        const result = await task(new ToDo(id))
        await queryClient.invalidateQueries({ queryKey: todoKeys.all })
        return result
      } catch (error) {
        console.error(error)
        return null
      } finally {
        setPending(false)
      }
    },
    [id, queryClient]
  )

  const changeState = useCallback((state: TodoState) => run((todo) => todo.changeState(state)), [run])

  const toggleDone = useCallback(
    (current: TodoState) => changeState(current === TodoState.DONE ? TodoState.PENDING : TodoState.DONE),
    [changeState]
  )

  const changeContents = useCallback(
    (contents: string) =>
      run((todo) => {
        todo.contents = contents
        return todo.update()
      }),
    [run]
  )

  const changeDeadline = useCallback(
    (deadline: string) => run((todo) => todo.changeDeadline(deadline ? new Date(deadline) : null)),
    [run]
  )

  const addChild = useCallback((title: string) => run((todo) => todo.addChild(title)), [run])

  const remove = useCallback(() => run((todo) => todo.delete()), [run])

  const removeChild = useCallback(
    (childId: number) =>
      run(async () => {
        await new ToDo(childId).delete()
      }),
    [run]
  )

  const toggleChild = useCallback(
    (childId: number, current: TodoState) =>
      run(async () => {
        await new ToDo(childId).changeState(current === TodoState.DONE ? TodoState.PENDING : TodoState.DONE)
      }),
    [run]
  )

  return { pending, changeState, toggleDone, changeContents, changeDeadline, addChild, toggleChild, removeChild, remove }
}

/**
 * 마감일이 있는 미완료 하위 작업을 깊이 무관하게 가져온다 (사이드바 '마감 임박 순' 용).
 * todoKeys.all 이 무효화될 때 함께 갱신되도록 그 하위 키를 사용한다.
 */
export function useUpcomingSubtasks(): TodoSubtaskSummary[] {
  const { data } = useQuery({
    queryKey: todoKeys.upcomingSubtasks(),
    queryFn: readUpcomingSubtasks,
  })

  return data ?? []
}
