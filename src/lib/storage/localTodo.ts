import { Todo, TodoState } from '@prisma/client'
import { toYmd } from '@/lib/date'
import type {
  TodoChildSummary,
  TodoDetails,
  TodoSubtaskSummary,
  TodoSummary,
} from '@/components/todo/_core'
import type { CreateTodoPayload, DeleteTodoResult, TodoMappingData, UpdateTodoPayload } from '@/lib/api/todo'

/**
 * 비회원용 저장소. `src/app/api/todo/**` 라우트 핸들러와 동일한 필터링/정렬/부분업데이트/BFS 삭제
 * 규칙을 그대로 재현해, 로그인 여부에 따라 게이트웨이가 어느 쪽으로 위임하든 동작이 달라지지 않게 한다.
 */

const STORAGE_KEY = 'todotodo:v1:todos'
/** localStorage 용량과 /api/todo/sync payload 크기를 보호하기 위한 상한 */
export const LOCAL_TODO_HARD_CAP = 1000

type LocalTodoRecord = {
  id: number
  parentId: number | null
  title: string
  contents: string
  state: TodoState
  date: string // ISO
  deadline: string | null // ISO
}

export type LocalSyncItem = {
  localId: number
  parentLocalId: number | null
  title: string
  contents: string
  state: TodoState
  date: string
  deadline: string | null
}

function loadAll(): LocalTodoRecord[] {
  if (typeof window === 'undefined') return []

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function saveAll(records: LocalTodoRecord[]): void {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(records))
}

function nextId(records: LocalTodoRecord[]): number {
  return records.reduce((max, r) => Math.max(max, r.id), 0) + 1
}

function toDeadlineTime(deadline: string | null): number {
  return deadline ? new Date(deadline).getTime() : Number.MAX_SAFE_INTEGER
}

function sortByDeadlineThenId<T extends { deadline: string | null; id: number }>(items: T[]): T[] {
  return [...items].sort((a, b) => {
    const diff = toDeadlineTime(a.deadline) - toDeadlineTime(b.deadline)
    return diff !== 0 ? diff : a.id - b.id
  })
}

/** DB의 Todo 타입과 시그니처를 맞추기 위한 캐스팅. userId는 로컬 모드에 존재하지 않는 개념이라 채워 넣기만 한다. */
function toTodoShape(record: LocalTodoRecord): Todo {
  return { ...record, userId: 0 } as unknown as Todo
}

function getDescendantIds(records: LocalTodoRecord[], rootId: number): number[] {
  const descendants: number[] = []
  let frontier = [rootId]

  while (frontier.length > 0) {
    const childIds = records.filter((r) => r.parentId !== null && frontier.includes(r.parentId)).map((r) => r.id)
    if (childIds.length === 0) break
    descendants.push(...childIds)
    frontier = childIds
  }

  return descendants
}

export async function readTodoList(): Promise<TodoSummary[]> {
  const records = loadAll()
  const topLevel = records.filter((r) => r.parentId === null)

  const summaries: TodoSummary[] = topLevel.map((r) => ({
    id: r.id,
    title: r.title,
    state: r.state,
    contents: r.contents,
    deadline: r.deadline,
    children: records
      .filter((c) => c.parentId === r.id)
      .sort((a, b) => a.id - b.id)
      .map((c) => ({ id: c.id, state: c.state })),
  }))

  return sortByDeadlineThenId(summaries)
}

export async function readTodoListByDeadline(): Promise<TodoMappingData> {
  const list = await readTodoList()
  const grouped: TodoMappingData = {}

  for (const todo of list) {
    const key = todo.deadline ? toYmd(new Date(todo.deadline)) : 'null'
    ;(grouped[key] ??= []).push(todo)
  }

  return grouped
}

export async function readUpcomingSubtasks(): Promise<TodoSubtaskSummary[]> {
  const records = loadAll()
  const byId = new Map(records.map((r) => [r.id, r]))

  const subtasks = records.filter((r) => r.parentId !== null && r.deadline !== null && r.state !== TodoState.DONE)

  return subtasks
    .map((r) => {
      const parent = byId.get(r.parentId as number)
      return {
        id: r.id,
        title: r.title,
        state: r.state,
        deadline: r.deadline,
        parent: { id: parent?.id ?? (r.parentId as number), title: parent?.title ?? '' },
      }
    })
    .sort((a, b) => toDeadlineTime(a.deadline) - toDeadlineTime(b.deadline))
}

export async function readTodo(id: number): Promise<TodoSummary> {
  const record = loadAll().find((r) => r.id === id)
  if (!record) throw new Error('not found')

  return { id: record.id, title: record.title, state: record.state, deadline: record.deadline }
}

export async function detailsReadTodo(id: number): Promise<TodoDetails> {
  const records = loadAll()
  const record = records.find((r) => r.id === id)
  if (!record) throw new Error('not found')

  const children: TodoChildSummary[] = records
    .filter((r) => r.parentId === id)
    .sort((a, b) => a.id - b.id)
    .map((r) => ({ id: r.id, title: r.title, state: r.state }))

  return {
    id: record.id,
    parentId: record.parentId,
    title: record.title,
    contents: record.contents,
    state: record.state,
    date: record.date,
    deadline: record.deadline,
    children,
  }
}

export async function createTodo(payload: CreateTodoPayload): Promise<Todo> {
  const title = (payload.title ?? '').trim()
  if (!title) throw new Error('title is required')

  const records = loadAll()
  if (records.length >= LOCAL_TODO_HARD_CAP) {
    throw new Error('로컬 저장 한도를 초과했습니다. 로그인 후 동기화해주세요.')
  }

  const record: LocalTodoRecord = {
    id: nextId(records),
    parentId: typeof payload.parentId === 'number' ? payload.parentId : null,
    title,
    contents: payload.contents ?? '',
    state: (payload.state as TodoState | undefined) ?? TodoState.PENDING,
    date: new Date().toISOString(),
    deadline: payload.deadline ? new Date(payload.deadline).toISOString() : null,
  }

  saveAll([...records, record])
  return toTodoShape(record)
}

export async function updateTodo(id: number, payload: UpdateTodoPayload): Promise<Todo> {
  const records = loadAll()
  const index = records.findIndex((r) => r.id === id)
  if (index === -1) throw new Error('not found')

  const record = { ...records[index] }

  if (payload.title !== undefined) {
    const title = String(payload.title).trim()
    if (!title) throw new Error('title is invalid')
    record.title = title
  }
  if (payload.contents !== undefined) {
    record.contents = String(payload.contents ?? '')
  }
  if (payload.state !== undefined) {
    if (!Object.values(TodoState).includes(payload.state)) throw new Error('state is invalid')
    record.state = payload.state
  }
  if (payload.deadline !== undefined) {
    record.deadline = payload.deadline ? new Date(payload.deadline).toISOString() : null
  }

  records[index] = record
  saveAll(records)
  return toTodoShape(record)
}

export async function deleteTodo(id: number): Promise<DeleteTodoResult> {
  const records = loadAll()
  if (!records.some((r) => r.id === id)) throw new Error('not found')

  const descendantIds = getDescendantIds(records, id)
  const toRemove = new Set([id, ...descendantIds])

  saveAll(records.filter((r) => !toRemove.has(r.id)))

  return { deletedId: id, deletedDescendantsCount: descendantIds.length }
}

/** 동기화 확인 모달에 보여줄 로컬 항목 수 */
export function countLocalTodos(): number {
  return loadAll().length
}

/** `/api/todo/sync` 요청 바디로 그대로 보낼 수 있는 형태 */
export function getLocalTodosForSync(): LocalSyncItem[] {
  return loadAll().map((r) => ({
    localId: r.id,
    parentLocalId: r.parentId,
    title: r.title,
    contents: r.contents,
    state: r.state,
    date: r.date,
    deadline: r.deadline,
  }))
}

/** 동기화 성공 후 호출. 실패하면 던지므로 호출부가 "마이그레이션은 됐지만 로컬 정리는 실패했다"를 구분해 알릴 수 있다. */
export function clearLocalTodos(): void {
  if (typeof window === 'undefined') return

  try {
    window.localStorage.removeItem(STORAGE_KEY)
  } catch (err) {
    console.error(err)
    throw new Error('failed to clear local todos')
  }
}
