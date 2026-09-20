'use client'

import { differenceInCalendarDays, isValid } from 'date-fns'
import { TodoSummary } from '@/components/todo/_core'
import { TodoMappingData } from '@/lib/api/todo'
import { useQuery } from '@tanstack/react-query'
import { fetcher } from '@/lib/fetcher'
import { useMemo } from 'react'

/** 마감일이 없는 투두가 모이는 그룹 키 */
export const UNSET_KEY = 'null'

const toYmd = (date: Date): string => {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/**
 * 투두 목록의 그룹핑·필터링 로직.
 *
 * UI 와 무관한 순수 클래스라서 렌더링 없이 그대로 테스트할 수 있다.
 * 모든 조작은 새 인스턴스를 반환해 체이닝이 가능하다.
 */
export default class TodoList {
  private readonly todos: readonly TodoSummary[]

  constructor(todos: readonly TodoSummary[] = []) {
    this.todos = todos
  }

  public get length(): number {
    return this.todos.length
  }

  public get items(): readonly TodoSummary[] {
    return this.todos
  }

  /** 마감일(yyyy-MM-dd) 기준 그룹. 마감일이 없으면 UNSET_KEY 로 모인다. */
  public groupByDeadline(): Record<string, TodoSummary[]> {
    const grouped: Record<string, TodoSummary[]> = {}

    for (const todo of this.todos) {
      const deadline = todo.deadline ? new Date(todo.deadline) : null
      const key = deadline && isValid(deadline) ? toYmd(deadline) : UNSET_KEY
      ;(grouped[key] ??= []).push(todo)
    }

    return grouped
  }

  /**
   * 오늘부터 days 일 이내에 마감인 투두만 남긴다.
   * 마감일이 없는 투두와 기한이 지난 투두는 제외된다.
   */
  public withinDays(days: number, from: Date = new Date()): TodoList {
    const filtered = this.todos.filter((todo) => {
      if (!todo.deadline) return false

      const deadline = new Date(todo.deadline)
      if (!isValid(deadline)) return false

      const diff = differenceInCalendarDays(deadline, from)
      return diff >= 0 && diff <= days
    })

    return new TodoList(filtered)
  }

  /** 날짜 오름차순. 마감일 미정 그룹은 항상 마지막. */
  public static sortKeys(keys: string[]): string[] {
    return [...keys].sort((a, b) => {
      if (a === UNSET_KEY) return 1
      if (b === UNSET_KEY) return -1
      return a.localeCompare(b)
    })
  }

  public sortedKeys(): string[] {
    return TodoList.sortKeys(Object.keys(this.groupByDeadline()))
  }
}

// ─────────────────────────────────────────────
// UI 가 쓰는 core 훅
// ─────────────────────────────────────────────

export type UseTodoListOptions = {
  /** 지정하면 마감이 N일 이내인 투두만 남긴다 */
  withinDays?: number
}

export function useTodoListCore({ withinDays }: UseTodoListOptions = {}) {
  const { data, isLoading, error } = useQuery<TodoMappingData>({
    queryKey: ['todo'],
    queryFn: () => fetcher<TodoMappingData>('/api/todo?mappingType=deadline'),
  })

  const { groups, keys, isEmpty } = useMemo(() => {
    const flat = data ? Object.values(data).flat() : []
    const list = withinDays === undefined ? new TodoList(flat) : new TodoList(flat).withinDays(withinDays)
    const grouped = list.groupByDeadline()

    return {
      groups: grouped,
      keys: TodoList.sortKeys(Object.keys(grouped)),
      isEmpty: list.length === 0,
    }
  }, [data, withinDays])

  return { groups, keys, isEmpty, isLoading, error: (error as Error | null) ?? null }
}
