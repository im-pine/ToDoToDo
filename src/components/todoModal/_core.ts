'use client'

import ToDo, { getChildrenProgress, TodoDetails, TodoProgress } from '@/components/todo/_core'
import { useTodoActions } from '@/components/todo/_hooks'
import { detailsReadTodo, todoKeys } from '@/lib/api/todo'
import { useQuery } from '@tanstack/react-query'
import { useDisclosure } from '@mantine/hooks'
import { useCallback, useMemo, useState } from 'react'

/**
 * 상세 모달의 모든 상태/행위를 담는 컨트롤러.
 * UI(모달·드로어·상세 페이지 등)는 이 컨트롤러만 받으면 동일하게 동작한다.
 *
 * 하위 작업은 같은 모양(ToDo)의 데이터이므로, "현재 보고 있는 id" 를 스택으로 들고 있으면
 * depth 제한 없이 계속 파고들 수 있다. 뒤로가기는 스택에서 한 칸만 꺼내면 된다.
 */
export type TodoDetailController = {
  opened: boolean
  open: () => void
  close: () => void
  /** 하위 작업으로 진입한다 (스택에 push) */
  openChild: (childId: number) => void
  /** 바로 위 작업으로 돌아간다 (스택에서 pop). 최상위에서는 아무 동작도 하지 않는다 */
  goBack: () => void
  /** 뒤로가기 버튼을 보여줄지 여부 (최상위가 아닐 때) */
  canGoBack: boolean
  detail: TodoDetails | null
  todo: ToDo | null
  progress: TodoProgress
  isLoading: boolean
} & ReturnType<typeof useTodoActions>

export function useTodoDetail(rootId: number): TodoDetailController {
  const [opened, { open: openModal, close: closeModal }] = useDisclosure(false)
  const [stack, setStack] = useState<number[]>([rootId])
  const currentId = stack[stack.length - 1]

  const actions = useTodoActions(currentId)

  const { data, isLoading } = useQuery({
    queryKey: todoKeys.detail(currentId),
    queryFn: () => detailsReadTodo(currentId),
    // 모달을 연 순간에만 상세를 불러온다 (목록 렌더 비용 최소화)
    enabled: opened,
  })

  const open = useCallback(() => {
    setStack([rootId])
    openModal()
  }, [rootId, openModal])

  const close = useCallback(() => {
    closeModal()
    // 닫힘 애니메이션 중 내용이 바뀌어 보이지 않도록 스택 리셋은 다음 open() 시점에 한다
  }, [closeModal])

  const openChild = useCallback((childId: number) => {
    setStack((prev) => [...prev, childId])
  }, [])

  const goBack = useCallback(() => {
    setStack((prev) => (prev.length > 1 ? prev.slice(0, -1) : prev))
  }, [])

  const todo = useMemo(() => (data ? new ToDo(data) : null), [data])
  const progress = useMemo(() => getChildrenProgress(data?.children, data?.state), [data])

  return {
    opened,
    open,
    close,
    openChild,
    goBack,
    canGoBack: stack.length > 1,
    detail: data ?? null,
    todo,
    progress,
    isLoading: opened && isLoading,
    ...actions,
  }
}
