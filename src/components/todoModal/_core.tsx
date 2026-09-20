'use client'

import { createContext, ReactNode, useCallback, useContext, useMemo, useState } from 'react'
import ToDo, { TodoDetails } from '@/components/todo/_core'
import { useQuery } from '@tanstack/react-query'
import { TodoState } from '@prisma/client'

/**
 * 모달의 탐색 스택.
 *
 * 하위 투두를 타고 들어갈 때마다 id 가 쌓이고, 뒤로가기는 스택을 하나 꺼낸다.
 * parentId 를 역추적하지 않는 이유는 두 가지다.
 *  - 사용자가 실제로 타고 들어온 경로를 그대로 되짚어야 한다
 *  - 상위로 가려고 추가 요청을 보낼 필요가 없다
 *
 * React state 에 그대로 담기 위해 모든 조작은 새 인스턴스를 반환한다(불변).
 */
export default class TodoModalCore {
  private readonly stack: readonly number[]
  private readonly forwardStack: readonly number[]

  constructor(stack: readonly number[] = [], forwardStack: readonly number[] = []) {
    this.stack = stack
    this.forwardStack = forwardStack
  }

  /** 현재 보고 있는 투두 id. 없으면 모달이 닫힌 상태다. */
  public get currentId(): number | null {
    return this.stack.length > 0 ? this.stack[this.stack.length - 1] : null
  }

  public get opened(): boolean {
    return this.stack.length > 0
  }

  /** 1 이면 최상위에서 연 것, 2 부터 하위 투두로 진입한 상태 */
  public get depth(): number {
    return this.stack.length
  }

  public get canGoBack(): boolean {
    return this.stack.length > 1
  }

  public get canGoForward(): boolean {
    return this.forwardStack.length > 0
  }

  /** 하위 투두로 진입. 새 경로로 들어가므로 앞으로가기 기록은 버린다. */
  public push(id: number): TodoModalCore {
    if (id === this.currentId) return this
    return new TodoModalCore([...this.stack, id], [])
  }

  /** 상위 투두로 복귀. 꺼낸 id 는 앞으로가기용으로 보관한다. */
  public pop(): TodoModalCore {
    if (!this.canGoBack) return this

    const next = this.stack.slice(0, -1)
    const popped = this.stack[this.stack.length - 1]

    return new TodoModalCore(next, [popped, ...this.forwardStack])
  }

  /** 뒤로가기로 빠져나온 하위 투두로 다시 진입 */
  public forward(): TodoModalCore {
    if (!this.canGoForward) return this

    const [head, ...rest] = this.forwardStack
    return new TodoModalCore([...this.stack, head], rest)
  }

  /** 새 투두로 모달을 연다(스택 초기화) */
  public reset(id: number): TodoModalCore {
    return new TodoModalCore([id], [])
  }

  public clear(): TodoModalCore {
    return new TodoModalCore([], [])
  }
}

// ─────────────────────────────────────────────
// 전역 모달 상태 (앱 전체에 인스턴스 1개)
// ─────────────────────────────────────────────

type TodoModalContextValue = {
  nav: TodoModalCore
  open: (id: number) => void
  close: () => void
  enterChild: (id: number) => void
  goBack: () => void
  goForward: () => void
}

const TodoModalContext = createContext<TodoModalContextValue | null>(null)

export function TodoModalStateProvider({ children }: { children: ReactNode }) {
  const [nav, setNav] = useState(() => new TodoModalCore())

  const value = useMemo<TodoModalContextValue>(
    () => ({
      nav,
      open: (id: number) => setNav((current) => current.reset(id)),
      close: () => setNav((current) => current.clear()),
      enterChild: (id: number) => setNav((current) => current.push(id)),
      goBack: () => setNav((current) => current.pop()),
      goForward: () => setNav((current) => current.forward()),
    }),
    [nav]
  )

  return <TodoModalContext.Provider value={value}>{children}</TodoModalContext.Provider>
}

/** 어디서든 모달을 열고 닫는다. 목록 행에서 사용. */
export function useTodoModal(): TodoModalContextValue {
  const context = useContext(TodoModalContext)
  if (!context) throw new Error('useTodoModal must be used within TodoModalStateProvider')
  return context
}

// ─────────────────────────────────────────────
// 모달 UI 가 쓰는 core 훅
// ─────────────────────────────────────────────

export type TodoModalCoreValue = ReturnType<typeof useTodoModalCore>

export function useTodoModalCore() {
  const { nav, close, enterChild, goBack, goForward } = useTodoModal()
  const currentId = nav.currentId

  const [pending, setPending] = useState(false)
  const [actionError, setActionError] = useState<Error | null>(null)

  const {
    data: detail,
    isLoading,
    error,
  } = useQuery<TodoDetails>({
    queryKey: ['todo', 'detail', currentId],
    queryFn: () => {
      const target = new ToDo()
      target.id = currentId
      return target.detailsRead()
    },
    enabled: currentId !== null,
  })

  // 모든 데이터 조작은 ToDo 클래스를 단일 진입점으로 거친다
  const todo = useMemo(() => (detail ? new ToDo(detail) : null), [detail])

  const run = useCallback(async (action: () => Promise<unknown>) => {
    setPending(true)
    setActionError(null)
    try {
      await action()
    } catch (err) {
      setActionError(err instanceof Error ? err : new Error(String(err)))
    } finally {
      setPending(false)
    }
  }, [])

  const changeState = useCallback(
    (next: TodoState) => run(async () => todo && todo.stateUpdate(next)),
    [run, todo]
  )

  const toggleDone = useCallback(() => run(async () => todo && todo.toggleDone()), [run, todo])

  const saveContents = useCallback(
    (contents: string) => {
      if (!todo || contents === (detail?.contents ?? '')) return
      return run(async () => todo.update({ contents }))
    },
    [run, todo, detail]
  )

  const changeDate = useCallback((date: Date) => run(async () => todo && todo.update({ date })), [run, todo])

  const changeDeadline = useCallback(
    (deadline: Date | null) => run(async () => todo && todo.update({ deadline })),
    [run, todo]
  )

  const addChild = useCallback((title: string) => run(async () => todo && todo.addChild(title)), [run, todo])

  /** 하위 투두까지 함께 삭제된다. 확인은 UI 쪽 책임. */
  const remove = useCallback(
    () =>
      run(async () => {
        if (!todo) return
        await todo.delete()
        if (nav.canGoBack) goBack()
        else close()
      }),
    [run, todo, nav, goBack, close]
  )

  const doneCount = detail?.children.filter((child) => child.state === TodoState.DONE).length ?? 0

  return {
    // 상태
    opened: nav.opened,
    detail: detail ?? null,
    children: detail?.children ?? [],
    doneCount,
    isLoading,
    pending,
    error: (error as Error | null) ?? actionError,
    canGoBack: nav.canGoBack,
    canGoForward: nav.canGoForward,
    depth: nav.depth,
    // 탐색
    close,
    enterChild,
    goBack,
    goForward,
    // 편집
    changeState,
    toggleDone,
    saveContents,
    changeDate,
    changeDeadline,
    addChild,
    remove,
  }
}
