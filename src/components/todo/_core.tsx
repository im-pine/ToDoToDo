import { createTodo, deleteTodo, detailsReadTodo, readTodo, updateTodo } from '@/lib/api/todo'
import { IconDefinition } from '@fortawesome/free-regular-svg-icons'
import { Todo, TodoState } from '@prisma/client'

type StatusMeta = {
  icon: IconDefinition
  color: string
  label: string
}
type ChildrenSummary = {
  title: string
  state: TodoState
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
  children: Array<ChildrenSummary>
}

export default class ToDo {
  public id: number | null
  public parentId: number | null
  public title: string | null
  public contents: string | null
  public state: TodoState | null
  public date: Date | null
  public deadline: Date | null
  public children: ChildrenSummary[]

  constructor(arg?: string | Todo) {
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

    const todo = arg
    this.id = todo?.id || null
    this.parentId = todo?.parentId || null
    this.title = todo?.title || null
    this.contents = todo?.contents || null
    this.state = todo?.state || null
    this.date = todo?.date || null
    this.deadline = todo?.deadline || null
    this.children = []
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

    // children은 클래스 필드에 없으니 return으로 제공
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
    const payload: Record<string, unknown> = {}

    if (this.title !== null) payload.title = this.title
    if (this.contents !== null) payload.contents = this.contents
    if (this.state !== null) payload.state = this.state
    if (this.deadline !== null) payload.deadline = this.deadline

    if (Object.keys(payload).length === 0) {
      throw new Error('nothing to update')
    }

    const updated = await updateTodo(this.id, payload as any)
    this.set(updated)
    return updated
  }

  public async delete(): Promise<number[]> {
    if (!this.id) throw new Error('id is required')

    const deletedIds = await deleteTodo(this.id)

    this.reset()

    return deletedIds
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

export type StatusConfig<M extends StatusMeta = StatusMeta> = Record<TodoState, M>
