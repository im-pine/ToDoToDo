import type { Todo } from '@prisma/client'
import { isLoggedInClient } from '@/lib/auth/clientAuth'
import * as dbTodo from '@/lib/api/todo'
import * as localTodo from '@/lib/storage/localTodo'
import type { CreateTodoPayload, DeleteTodoResult, TodoMappingData, UpdateTodoPayload } from '@/lib/api/todo'
import type { TodoDetails, TodoSubtaskSummary, TodoSummary } from '@/components/todo/_core'

/**
 * `lib/api/todo.ts`(로그인 사용자, DB)와 `lib/storage/localTodo.ts`(비회원, localStorage)를
 * 동일한 시그니처로 감싸 로그인 여부에 따라 위임하는 게이트웨이.
 * `_core.tsx`/`_hooks.ts`/`page.tsx`는 이 모듈만 알면 되고, 게스트/로그인 분기 로직을 신경 쓸 필요가 없다.
 */

export { todoKeys } from '@/lib/api/todo'
export type { CreateTodoPayload, DeleteTodoResult, TodoMappingData, UpdateTodoPayload }

export async function readTodoList(): Promise<TodoSummary[]> {
  return isLoggedInClient() ? dbTodo.readTodoList() : localTodo.readTodoList()
}

export async function readTodoListByDeadline(): Promise<TodoMappingData> {
  return isLoggedInClient() ? dbTodo.readTodoListByDeadline() : localTodo.readTodoListByDeadline()
}

export async function readUpcomingSubtasks(): Promise<TodoSubtaskSummary[]> {
  return isLoggedInClient() ? dbTodo.readUpcomingSubtasks() : localTodo.readUpcomingSubtasks()
}

export async function readTodo(id: number): Promise<TodoSummary> {
  return isLoggedInClient() ? dbTodo.readTodo(id) : localTodo.readTodo(id)
}

export async function detailsReadTodo(id: number): Promise<TodoDetails> {
  return isLoggedInClient() ? dbTodo.detailsReadTodo(id) : localTodo.detailsReadTodo(id)
}

export async function createTodo(payload: CreateTodoPayload): Promise<Todo> {
  return isLoggedInClient() ? dbTodo.createTodo(payload) : localTodo.createTodo(payload)
}

export async function updateTodo(id: number, payload: UpdateTodoPayload): Promise<Todo> {
  return isLoggedInClient() ? dbTodo.updateTodo(id, payload) : localTodo.updateTodo(id, payload)
}

export async function deleteTodo(id: number): Promise<DeleteTodoResult> {
  return isLoggedInClient() ? dbTodo.deleteTodo(id) : localTodo.deleteTodo(id)
}
