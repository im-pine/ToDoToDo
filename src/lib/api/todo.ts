import type { Todo, TodoState } from '@prisma/client'
import { fetcher } from '@/lib/fetcher'
import type { TodoDetails, TodoSubtaskSummary, TodoSummary } from '@/components/todo/_core'

export type CreateTodoPayload = {
  title: string
  parentId?: number | null
  contents?: string | null
  state?: TodoState | string | null
  deadline?: Date | null
}

export type UpdateTodoPayload = {
  // 부분 업데이트: 들어온 것만 수정
  title?: string
  contents?: string | null
  state?: TodoState
  deadline?: Date | null
}

export type DeleteTodoResult = {
  deletedId: number
  deletedDescendantsCount: number
}

export type TodoMappingData = Record<string, TodoSummary[]>

/**
 * React Query 키를 한곳에서 관리한다.
 * (캐싱/무효화는 UI 레이어의 책임, 이 모듈은 순수 전송 계층만 담당)
 */
export const todoKeys = {
  all: ['todo'] as const,
  lists: () => [...todoKeys.all, 'list'] as const,
  detail: (id: number) => [...todoKeys.all, 'detail', id] as const,
  upcomingSubtasks: () => [...todoKeys.all, 'subtasks', 'upcoming'] as const,
}

const jsonInit = (method: string, body: unknown): RequestInit => ({
  method,
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
})

export async function readTodoList(): Promise<TodoSummary[]> {
  return fetcher<TodoSummary[]>('/api/todo')
}

export async function readTodoListByDeadline(): Promise<TodoMappingData> {
  return fetcher<TodoMappingData>('/api/todo?mappingType=deadline')
}

export async function readUpcomingSubtasks(): Promise<TodoSubtaskSummary[]> {
  return fetcher<TodoSubtaskSummary[]>('/api/todo/subtasks')
}

export async function readTodo(id: number): Promise<TodoSummary> {
  return fetcher<TodoSummary>(`/api/todo/${id}`)
}

export async function detailsReadTodo(id: number): Promise<TodoDetails> {
  return fetcher<TodoDetails>(`/api/todo/${id}/detail`)
}

export async function createTodo(payload: CreateTodoPayload): Promise<Todo> {
  return fetcher<Todo>('/api/todo', jsonInit('POST', payload))
}

export async function updateTodo(id: number, payload: UpdateTodoPayload): Promise<Todo> {
  return fetcher<Todo>(`/api/todo/${id}`, jsonInit('PATCH', payload))
}

export async function deleteTodo(id: number): Promise<DeleteTodoResult> {
  return fetcher<DeleteTodoResult>(`/api/todo/${id}`, { method: 'DELETE' })
}
