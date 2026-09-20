import { createTodo, deleteTodo, detailsReadTodo, readTodo, updateTodo, UpdateTodoPayload } from '@/lib/api/todo'
import type { IconDefinition } from '@fortawesome/free-regular-svg-icons'
import { Todo, TodoState } from '@prisma/client'

type StatusMeta = {
  icon: IconDefinition
  color: string
  label: string
}

export type ChildSummary = {
  id: number
  title: string
  state: TodoState
  deadline: string | null
}

export type TodoSummary = {
  id: number
  title: string
  state: TodoState
  deadline: string | null // JSON 응답이라 string(ISO)로 옴
}

export type TodoDetails = {
  id: number
  parentId: number | null
  title: string
  contents: string | null
  state: TodoState
  date: string
  deadline: string | null
  children: Array<ChildSummary>
}

type TodoSource = Todo | TodoSummary | TodoDetails

const toDate = (value: Date | string | null | undefined): Date | null => {
  if (!value) return null
  return value instanceof Date ? value : new Date(value)
}

export default class ToDo {
  public id: number | null
  public parentId: number | null
  public title: string | null
  public contents: string | null
  public state: TodoState | null
  public date: Date | null
  public deadline: Date | null
  public children: ChildSummary[]

  constructor(arg?: string | TodoSource) {
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

    const todo = arg as Partial<Todo & TodoDetails>

    // ?? 를 쓰는 이유: || 는 id 0 이나 빈 문자열 contents 까지 null 로 떨어뜨린다
    this.id = todo.id ?? null
    this.parentId = todo.parentId ?? null
    this.title = todo.title ?? null
    this.contents = todo.contents ?? null
    this.state = todo.state ?? null
    this.date = toDate(todo.date)
    this.deadline = toDate(todo.deadline)
    // children 을 가진 소스(TodoDetails)로 생성할 때 하위 목록이 유실되면 안 된다
    this.children = todo.children ?? []
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

  public async read(): Promise<TodoSummary> {
    if (!this.id) throw new Error('id is required')

    const summary = await readTodo(this.id)

    this.title = summary.title
    this.state = summary.state
    this.deadline = toDate(summary.deadline)

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
    this.date = toDate(details.date)
    this.deadline = toDate(details.deadline)
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

  /**
   * patch 를 넘기면 그 값이 그대로 전송된다(null 로 비우는 것도 가능).
   * 넘기지 않으면 인스턴스에서 값이 있는 필드만 모아 부분 업데이트한다.
   */
  public async update(patch?: UpdateTodoPayload): Promise<Todo> {
    if (!this.id) throw new Error('id is required')

    const payload: UpdateTodoPayload = patch ?? {}

    if (!patch) {
      if (this.title !== null) payload.title = this.title
      if (this.contents !== null) payload.contents = this.contents
      if (this.state !== null) payload.state = this.state
      if (this.deadline !== null) payload.deadline = this.deadline
    }

    if (Object.keys(payload).length === 0) {
      throw new Error('nothing to update')
    }

    const updated = await updateTodo(this.id, payload)
    this.set(updated)
    return updated
  }

  public async delete(): Promise<number[]> {
    if (!this.id) throw new Error('id is required')

    const { deletedId } = await deleteTodo(this.id, this.parentId)

    this.reset()

    return [deletedId]
  }

  // ─────────────────────────────────────────────
  // Derived Functions — 기본 CRUD 를 조합한 파생 기능
  // ─────────────────────────────────────────────

  /** 상태만 변경한다. update() 조합. */
  public async stateUpdate(next: TodoState): Promise<Todo> {
    return this.update({ state: next })
  }

  /** 완료 ↔ 대기 토글. stateUpdate() 조합. */
  public async toggleDone(): Promise<Todo> {
    const next = this.state === TodoState.DONE ? TodoState.PENDING : TodoState.DONE
    return this.stateUpdate(next)
  }

  /** 현재 투두를 부모로 하는 하위 투두를 만든다. create() 조합. */
  public async addChild(title: string): Promise<Todo> {
    if (!this.id) throw new Error('id is required')

    const child = new ToDo(title)
    child.parentId = this.id

    return child.create()
  }

  private set(todo: Todo) {
    this.id = todo.id
    this.parentId = todo.parentId
    this.title = todo.title
    this.contents = todo.contents
    this.state = todo.state
    this.date = toDate(todo.date)
    this.deadline = toDate(todo.deadline)
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

export type StatusConfig<M extends StatusMeta = StatusMeta> = Record<TodoState, M>
