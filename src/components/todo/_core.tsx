import { createTodo, deleteTodo, detailsReadTodo, readTodo, updateTodo } from '@/lib/api/todoGateway'
import type { UpdateTodoPayload } from '@/lib/api/todoGateway'
import { differenceInCalendarDays, isValid } from 'date-fns'
import { Todo, TodoState } from '@prisma/client'

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

export type TodoChildSummary = {
  id: number
  title: string
  state: TodoState
}

/** 목록 카드에서 진행률만 계산하면 되므로 state/id 만 내려받는다. */
export type TodoChildState = Pick<TodoChildSummary, 'id' | 'state'>

export type TodoSummary = {
  id: number
  title: string
  state: TodoState
  contents?: string | null
  deadline: string | null // JSON 응답이라 string(ISO)로 옴
  children?: TodoChildState[]
}

export type TodoDetails = {
  id: number
  parentId: number | null
  title: string
  contents: string | null
  state: TodoState
  date: string
  deadline: string | null
  children: Array<TodoChildSummary>
}

/** 마감일이 있는 하위 작업(깊이 무관) — 사이드바 '마감 임박 순' 이 최상위 외 항목도 보여주기 위한 요약 */
export type TodoSubtaskSummary = {
  id: number
  title: string
  state: TodoState
  deadline: string | null
  /** 소속을 표시하기 위한 직속 상위 작업의 최소 정보 */
  parent: { id: number; title: string }
}

/* -------------------------------------------------------------------------- */
/* 상태 메타                                                                   */
/* -------------------------------------------------------------------------- */

export type TodoStateMeta = {
  label: string
  /** 카드 좌측 보더 · 상태 점 · 배지에 공통으로 쓰는 대표 색 */
  color: string
}

/**
 * UI 가 상태별 색/라벨을 각자 정의하지 않도록 코어가 단일 출처를 제공한다.
 * 색은 globals.css 의 팔레트 변수를 그대로 참조해 테마 교체에 대응한다.
 */
export const TODO_STATE_META: Record<TodoState, TodoStateMeta> = {
  [TodoState.PENDING]: { label: '대기', color: 'var(--state-pending-color)' },
  [TodoState.IN_PROGRESS]: { label: '진행중', color: 'var(--secondary-colors-6)' },
  [TodoState.ON_HOLD]: { label: '보류', color: 'var(--primary-colors-5)' },
  [TodoState.DONE]: { label: '완료', color: 'var(--state-done-color)' },
}

export const TODO_STATE_ORDER: TodoState[] = [
  TodoState.PENDING,
  TodoState.IN_PROGRESS,
  TodoState.ON_HOLD,
  TodoState.DONE,
]

/** 상태 정렬 가중치 (진행중 → 대기 → 보류 → 완료) */
const TODO_STATE_WEIGHT: Record<TodoState, number> = {
  [TodoState.IN_PROGRESS]: 0,
  [TodoState.PENDING]: 1,
  [TodoState.ON_HOLD]: 2,
  [TodoState.DONE]: 3,
}

/* -------------------------------------------------------------------------- */
/* 마감일 메타                                                                 */
/* -------------------------------------------------------------------------- */

export type DeadlineTone = 'over' | 'today' | 'urgent' | 'soon' | 'normal' | 'none'

export type DeadlineMeta = {
  /** 오늘 기준 남은 일수. 마감일이 없으면 null */
  days: number | null
  /** D-2 / D-DAY / D+3 / 미정 */
  label: string
  tone: DeadlineTone
  color: string
}

const DEADLINE_TONE_COLOR: Record<DeadlineTone, string> = {
  over: 'var(--primary-colors-4)',
  today: 'var(--primary-colors-4)',
  urgent: 'var(--primary-colors-4)',
  soon: 'var(--secondary-colors-3)',
  normal: 'var(--black-colors-4)',
  none: 'var(--black-colors-5)',
}

const NO_DEADLINE: DeadlineMeta = {
  days: null,
  label: '미정',
  tone: 'none',
  color: DEADLINE_TONE_COLOR.none,
}

export function getDeadlineMeta(deadline?: string | Date | null): DeadlineMeta {
  if (!deadline) return NO_DEADLINE

  const parsed = typeof deadline === 'string' ? new Date(deadline) : deadline
  if (!isValid(parsed)) return NO_DEADLINE

  const days = differenceInCalendarDays(parsed, new Date())

  if (days < 0) return { days, label: `D+${Math.abs(days)}`, tone: 'over', color: DEADLINE_TONE_COLOR.over }
  if (days === 0) return { days, label: 'D-DAY', tone: 'today', color: DEADLINE_TONE_COLOR.today }

  const tone: DeadlineTone = days <= 3 ? 'urgent' : days <= 7 ? 'soon' : 'normal'
  return { days, label: `D-${days}`, tone, color: DEADLINE_TONE_COLOR[tone] }
}

/** 마감이 임박(초과·오늘·3일 이내)했는지 */
export function isUrgentDeadline(meta: DeadlineMeta): boolean {
  return meta.tone === 'over' || meta.tone === 'today' || meta.tone === 'urgent'
}

/* -------------------------------------------------------------------------- */
/* 진행률                                                                      */
/* -------------------------------------------------------------------------- */

export type TodoProgress = {
  done: number
  total: number
  percent: number
}

/**
 * 하위 할일의 완료 비율. 하위 할일이 없으면 자신의 상태로 0% / 100% 를 판단한다.
 */
export function getChildrenProgress(children?: Array<{ state: TodoState }>, state?: TodoState | null): TodoProgress {
  const total = children?.length ?? 0
  if (total === 0) {
    const percent = state === TodoState.DONE ? 100 : 0
    return { done: 0, total: 0, percent }
  }

  const done = children!.filter((child) => child.state === TodoState.DONE).length
  return { done, total, percent: Math.round((done / total) * 100) }
}

/* -------------------------------------------------------------------------- */
/* 목록 필터 · 정렬 · 통계                                                      */
/* -------------------------------------------------------------------------- */

/** 'ACTIVE' 는 완료를 제외한 전부. 나머지는 상태 단건 필터 */
export type TodoFilter = 'ALL' | 'ACTIVE' | TodoState

export const TODO_FILTER_LABEL: Record<TodoFilter, string> = {
  ALL: '모든 할일',
  ACTIVE: '진행중인 할일',
  [TodoState.PENDING]: '대기중인 할일',
  [TodoState.IN_PROGRESS]: '진행중인 할일',
  [TodoState.ON_HOLD]: '보류된 할일',
  [TodoState.DONE]: '완료된 할일',
}

export function filterTodos<T extends { state: TodoState }>(todos: T[], filter: TodoFilter): T[] {
  if (filter === 'ALL') return todos
  if (filter === 'ACTIVE') return todos.filter((todo) => todo.state !== TodoState.DONE)
  return todos.filter((todo) => todo.state === filter)
}

/** 미완료 우선 → 상태 가중치 → 마감 임박 순 (마감 없음은 뒤로) */
export function sortTodos<T extends { state: TodoState; deadline: string | Date | null }>(todos: T[]): T[] {
  return [...todos].sort((a, b) => {
    const weight = TODO_STATE_WEIGHT[a.state] - TODO_STATE_WEIGHT[b.state]
    if (weight !== 0) return weight

    return toDeadlineTime(a.deadline) - toDeadlineTime(b.deadline)
  })
}

/** 마감 임박 순으로 미완료 할일을 추린다 (사이드바용) */
export function getUpcomingTodos<T extends { state: TodoState; deadline: string | Date | null }>(
  todos: T[],
  limit = 6
): T[] {
  return todos
    .filter((todo) => todo.state !== TodoState.DONE && todo.deadline)
    .sort((a, b) => toDeadlineTime(a.deadline) - toDeadlineTime(b.deadline))
    .slice(0, limit)
}

/** 사이드바 '마감 임박 순' 한 줄 — 최상위 할일이거나, 소속을 알 수 있는 하위 작업이다 */
export type UpcomingSidebarItem =
  | { kind: 'root'; id: number; title: string; state: TodoState; deadline: string | null }
  | { kind: 'subtask'; id: number; title: string; state: TodoState; deadline: string | null; parentTitle: string }

/**
 * 최상위 할일과 (깊이 무관한) 하위 작업의 마감일을 한 타임라인으로 합쳐 임박 순으로 추린다.
 * 하위 작업은 서버에서 이미 "미완료 + 마감일 있음" 으로 걸러져 오므로 여기선 정렬만 한다.
 */
export function getUpcomingSidebarItems<T extends { id: number; title: string; state: TodoState; deadline: string | Date | null }>(
  todos: T[],
  subtasks: TodoSubtaskSummary[],
  limit = 8
): UpcomingSidebarItem[] {
  const rootItems: UpcomingSidebarItem[] = todos
    .filter((todo) => todo.state !== TodoState.DONE && todo.deadline)
    .map((todo) => ({
      kind: 'root',
      id: todo.id,
      title: todo.title,
      state: todo.state,
      deadline: typeof todo.deadline === 'string' ? todo.deadline : (todo.deadline as Date).toISOString(),
    }))

  const subtaskItems: UpcomingSidebarItem[] = subtasks.map((subtask) => ({
    kind: 'subtask',
    id: subtask.id,
    title: subtask.title,
    state: subtask.state,
    deadline: subtask.deadline,
    parentTitle: subtask.parent.title,
  }))

  return [...rootItems, ...subtaskItems]
    .sort((a, b) => toDeadlineTime(a.deadline) - toDeadlineTime(b.deadline))
    .slice(0, limit)
}

export type TodoStats = {
  total: number
  done: number
  urgent: number
}

export function getTodoStats<T extends { state: TodoState; deadline: string | Date | null }>(todos: T[]): TodoStats {
  return {
    total: todos.length,
    done: todos.filter((todo) => todo.state === TodoState.DONE).length,
    urgent: todos.filter((todo) => todo.state !== TodoState.DONE && isUrgentDeadline(getDeadlineMeta(todo.deadline)))
      .length,
  }
}

export function countByState<T extends { state: TodoState }>(todos: T[], state: TodoState): number {
  return todos.filter((todo) => todo.state === state).length
}

function toDeadlineTime(deadline: string | Date | null): number {
  if (!deadline) return Number.MAX_SAFE_INTEGER
  const parsed = typeof deadline === 'string' ? new Date(deadline) : deadline
  return isValid(parsed) ? parsed.getTime() : Number.MAX_SAFE_INTEGER
}

/* -------------------------------------------------------------------------- */
/* ToDo 코어                                                                   */
/* -------------------------------------------------------------------------- */

export default class ToDo {
  public id: number | null
  public parentId: number | null
  public title: string | null
  public contents: string | null
  public state: TodoState | null
  public date: Date | null
  public deadline: Date | null
  public children: TodoChildSummary[]

  constructor(arg?: string | number | Todo | TodoSummary | TodoDetails) {
    this.id = null
    this.parentId = null
    this.title = null
    this.contents = null
    this.state = null
    this.date = null
    this.deadline = null
    this.children = []

    if (arg === undefined) return

    if (typeof arg === 'string') {
      this.title = arg
      return
    }

    // id 만으로 인스턴스를 만드는 경우 (상태 변경·삭제 등 단건 조작)
    if (typeof arg === 'number') {
      this.id = arg
      return
    }

    const todo = arg
    this.id = todo?.id || null
    this.parentId = 'parentId' in todo ? (todo.parentId ?? null) : null
    this.title = todo?.title || null
    this.contents = 'contents' in todo ? (todo.contents ?? null) : null
    this.state = todo?.state || null
    this.date = 'date' in todo && todo.date ? new Date(todo.date) : null
    this.deadline = todo?.deadline ? new Date(todo.deadline) : null
    this.children = 'children' in todo ? (asChildSummaries(todo.children) ?? []) : []
  }

  public get() {
    return {
      id: this.id,
      parentId: this.parentId,
      title: this.title,
      contents: this.contents,
      state: this.state,
      date: this.date,
      deadline: this.deadline,
      children: this.children,
    }
  }

  /** 하위 할일 기준 진행률 */
  public get progress(): TodoProgress {
    return getChildrenProgress(this.children, this.state)
  }

  public get deadlineMeta(): DeadlineMeta {
    return getDeadlineMeta(this.deadline)
  }

  public async read(): Promise<TodoSummary> {
    if (!this.id) throw new Error('id is required')

    const summary = await readTodo(this.id)

    this.title = summary.title
    this.state = summary.state
    this.deadline = summary.deadline ? new Date(summary.deadline) : null

    return summary
  }

  public async detailsRead(): Promise<TodoDetails> {
    if (!this.id) throw new Error('id is required')

    const details = await detailsReadTodo(this.id)

    this.id = details.id
    this.parentId = details.parentId
    this.title = details.title
    this.contents = details.contents ?? null
    this.state = details.state
    this.date = new Date(details.date)
    this.deadline = details.deadline ? new Date(details.deadline) : null
    this.children = details.children

    return details
  }

  public async create(): Promise<Todo> {
    if (!this.title || this.title.trim() === '') {
      throw new Error('title is required')
    }

    const created = await createTodo({
      title: this.title,
      parentId: this.parentId,
      contents: this.contents,
      state: this.state,
      deadline: this.deadline,
    })

    this.set(created)
    return created
  }

  public async update(): Promise<Todo> {
    if (!this.id) throw new Error('id is required')

    // 부분 업데이트 payload: "변경 의도 있는 것만" 넣기
    const payload: UpdateTodoPayload = {}

    if (this.title !== null) payload.title = this.title
    if (this.contents !== null) payload.contents = this.contents
    if (this.state !== null) payload.state = this.state
    if (this.deadline !== null) payload.deadline = this.deadline

    if (Object.keys(payload).length === 0) {
      throw new Error('nothing to update')
    }

    const updated = await updateTodo(this.id, payload)
    this.set(updated)
    return updated
  }

  /** 상태만 바꿔 저장한다. 목록/모달의 체크박스가 공통으로 사용 */
  public async changeState(state: TodoState): Promise<Todo> {
    if (!this.id) throw new Error('id is required')

    const updated = await updateTodo(this.id, { state })
    this.set(updated)
    return updated
  }

  /** 완료 ↔ 대기 토글 */
  public async toggleDone(): Promise<Todo> {
    return this.changeState(this.state === TodoState.DONE ? TodoState.PENDING : TodoState.DONE)
  }

  /**
   * 마감일만 바꿔 저장한다. null 을 넘기면 마감일을 지운다.
   * update() 는 null 필드를 "변경 없음"으로 취급해 지우기가 불가능하므로 별도 메서드로 분리했다.
   */
  public async changeDeadline(deadline: Date | null): Promise<Todo> {
    if (!this.id) throw new Error('id is required')

    const updated = await updateTodo(this.id, { deadline })
    this.set(updated)
    return updated
  }

  /** 하위 할일 생성 */
  public async addChild(title: string): Promise<Todo> {
    if (!this.id) throw new Error('id is required')

    const child = new ToDo(title)
    child.parentId = this.id

    return child.create()
  }

  public async delete(): Promise<number> {
    if (!this.id) throw new Error('id is required')

    const { deletedId } = await deleteTodo(this.id)

    this.reset()

    return deletedId
  }

  private set(todo: Todo) {
    this.id = todo.id
    this.parentId = todo.parentId
    this.title = todo.title
    this.contents = todo.contents
    this.state = todo.state
    this.date = new Date(todo.date)
    this.deadline = todo.deadline ? new Date(todo.deadline) : null
  }

  private reset() {
    this.id = null
    this.parentId = null
    this.title = null
    this.contents = null
    this.state = null
    this.date = null
    this.deadline = null
    this.children = []
  }
}

/** 목록 응답의 children 은 {id, state} 만 담고 있어 제목을 빈 값으로 채운다. */
function asChildSummaries(children?: Array<TodoChildSummary | TodoChildState>): TodoChildSummary[] {
  if (!children) return []

  return children.map((child) => ({
    id: child.id,
    title: 'title' in child ? child.title : '',
    state: child.state,
  }))
}

export type StatusConfig<M = TodoStateMeta> = Record<TodoState, M>
