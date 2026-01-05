import { queryClient } from '@/lib/queryClient'
import { Todo, TodoState } from '@prisma/client'
import { fetcher } from '@/lib/fetcher'
import { TodoDetails, TodoSummary } from '@/components/todo/_core'

export type CreateTodoPayload = {
  title: string
  parentId?: number | null
  contents?: string | null
  state?: string | null
  deadline?: Date | null
}
export type UpdateTodoPayload = {
  // 부분 업데이트: 들어온 것만 수정
  title?: string
  contents?: string
  state?: TodoState
  deadline?: Date | null
}

export async function readTodo(id: number): Promise<TodoSummary> {
  return queryClient.fetchQuery({
    queryKey: ['todo', id],
    queryFn: () => fetcher<TodoSummary>(`/api/todo/${id}`),
    staleTime: 30_000,
  })
}

export async function detailsReadTodo(id: number): Promise<TodoDetails> {
  return queryClient.fetchQuery({
    queryKey: ['todo', 'detail', id],
    queryFn: () => fetcher<TodoDetails>(`/api/todo/${id}/detail`),
    staleTime: 30_000,
  })
}

export async function createTodo(payload: CreateTodoPayload): Promise<Todo> {
  const created = await queryClient.fetchQuery({
    // mutation 성격이지만 hook 없이 실행하려고 fetchQuery 사용
    queryKey: ['todo', 'create', payload.title],
    queryFn: () =>
      fetcher<Todo>('/api/todo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }),
    staleTime: 0,
  })

  await queryClient.invalidateQueries({ queryKey: ['todo', 'list'] })

  return created
}

export async function updateTodo(id: number, payload: UpdateTodoPayload): Promise<Todo> {
  const updated = await queryClient.fetchQuery({
    queryKey: ['todo', 'update', id],
    queryFn: () =>
      fetcher<Todo>(`/api/todo/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }),
    staleTime: 0,
  })

  await queryClient.invalidateQueries({ queryKey: ['todo', 'list'] })
  await queryClient.invalidateQueries({ queryKey: ['todo', 'detail', id] })

  return updated
}

export async function deleteTodo(id: number): Promise<number[]> {
  const result = await queryClient.fetchQuery({
    queryKey: ['todo', 'delete', id],
    queryFn: () =>
      fetcher<number[]>(`/api/todo/${id}`, {
        method: 'DELETE',
      }),
    staleTime: 0,
  })

  // 목록/상세 캐시 갱신
  await queryClient.invalidateQueries({ queryKey: ['todo', 'list'] })
  await queryClient.invalidateQueries({ queryKey: ['todo', 'detail', id] })

  return result
}
