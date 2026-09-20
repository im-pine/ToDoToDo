import { queryClient } from '@/lib/queryClient'
import { Todo, TodoState } from '@prisma/client'
import { fetcher } from '@/lib/fetcher'
import { TodoDetails, TodoSummary } from '@/components/todo/_core'

export type CreateTodoPayload = {
  title: string
  parentId?: number | null
  contents?: string | null
  state?: TodoState | null
  deadline?: Date | null
}
export type UpdateTodoPayload = {
  // 부분 업데이트: 들어온 것만 수정
  title?: string
  contents?: string | null
  state?: TodoState
  date?: Date
  deadline?: Date | null
}

export type DeleteTodoResult = {
  deletedId: number
  deletedDescendantsCount: number
}

export type TodoMappingData = Record<string, TodoSummary[]>

/** 목록/상세 캐시를 함께 갱신한다. id가 있으면 해당 상세도 무효화. */
async function invalidateTodo(...ids: Array<number | null | undefined>) {
  await queryClient.invalidateQueries({ queryKey: ['todo'] })

  for (const id of ids) {
    if (typeof id === 'number') {
      await queryClient.invalidateQueries({ queryKey: ['todo', 'detail', id] })
    }
  }
}

export async function readTodo(id: number): Promise<TodoSummary> {
  return queryClient.fetchQuery({
    queryKey: ['todo', id],
    queryFn: () => fetcher<TodoSummary>(`/api/todo/${id}`),
    staleTime: 30_000,
  })
}

/**
 * 상세 조회는 캐시를 끼지 않는다.
 * UI 쪽에서 useQuery(['todo','detail',id]) 의 queryFn 으로 호출하기 때문에,
 * 여기서 같은 키로 fetchQuery 를 다시 부르면 자기 자신의 in-flight promise 를 기다리게 된다.
 */
export async function detailsReadTodo(id: number): Promise<TodoDetails> {
  return fetcher<TodoDetails>(`/api/todo/${id}/detail`)
}

// 아래 3개는 뮤테이션이므로 fetchQuery를 쓰지 않는다.
// fetchQuery는 queryKey 기준으로 캐시를 재사용하기 때문에, 예를 들어 같은 제목으로
// 두 번 생성하면 두 번째 요청이 아예 발생하지 않고 첫 결과가 돌아온다.

export async function createTodo(payload: CreateTodoPayload): Promise<Todo> {
  const created = await fetcher<Todo>('/api/todo', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  await invalidateTodo(payload.parentId)

  return created
}

export async function updateTodo(id: number, payload: UpdateTodoPayload): Promise<Todo> {
  const updated = await fetcher<Todo>(`/api/todo/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  await invalidateTodo(id, updated.parentId)

  return updated
}

export async function deleteTodo(id: number, parentId?: number | null): Promise<DeleteTodoResult> {
  const result = await fetcher<DeleteTodoResult>(`/api/todo/${id}`, {
    method: 'DELETE',
  })

  await invalidateTodo(id, parentId)

  return result
}
