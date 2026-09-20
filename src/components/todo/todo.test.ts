import { createTodo, deleteTodo, updateTodo } from '@/lib/api/todo'
import ToDo, { TodoDetails } from '@/components/todo/_core'
import { TodoState } from '@prisma/client'

jest.mock('@/lib/api/todo', () => ({
  createTodo: jest.fn(),
  updateTodo: jest.fn(),
  deleteTodo: jest.fn(),
  readTodo: jest.fn(),
  detailsReadTodo: jest.fn(),
}))

const createTodoMock = createTodo as jest.Mock
const updateTodoMock = updateTodo as jest.Mock
const deleteTodoMock = deleteTodo as jest.Mock

/** update()/create() 는 응답으로 this 를 갱신하므로 mock 도 레코드를 돌려줘야 한다 */
const record = (over: Record<string, unknown> = {}) => ({
  id: 1,
  parentId: null,
  title: '할일',
  contents: '',
  state: TodoState.PENDING,
  date: new Date('2026-01-01T00:00:00.000Z'),
  deadline: null,
  ...over,
})

const details: TodoDetails = {
  id: 10,
  parentId: null,
  title: '기술 블로그 글 초안 작성',
  contents: '초안을 작성한다.',
  state: TodoState.IN_PROGRESS,
  date: '2026-01-01T09:00:00.000Z',
  deadline: '2026-01-03T23:59:59.000Z',
  children: [
    { id: 11, title: '목차 잡기', state: TodoState.DONE, deadline: null },
    { id: 12, title: '본문 쓰기', state: TodoState.PENDING, deadline: null },
  ],
}

describe('ToDo.create - validation & failure scenarios', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('title이 없으면 todo는 생성되지 않는다', async () => {
    const todo = new ToDo()

    await expect(todo.create()).rejects.toThrow('title is required')
    expect(createTodo).not.toHaveBeenCalled()
  })

  test('title이 빈 문자열이면 todo는 생성되지 않는다', async () => {
    const todo = new ToDo('') // 빈 문자열

    await expect(todo.create()).rejects.toThrow('title is required')
    expect(createTodo).not.toHaveBeenCalled()
  })
})

describe('ToDo constructor', () => {
  test('TodoDetails로 생성하면 children이 유지된다', () => {
    const todo = new ToDo(details)

    expect(todo.children).toHaveLength(2)
    expect(todo.children[0].id).toBe(11)
  })

  test('children이 없는 소스로 생성하면 빈 배열이다', () => {
    const todo = new ToDo({ id: 1, title: '할일', state: TodoState.PENDING, deadline: null })

    expect(todo.children).toEqual([])
  })

  test('문자열 날짜를 Date로 변환한다', () => {
    const todo = new ToDo(details)

    expect(todo.date).toBeInstanceOf(Date)
    expect(todo.deadline).toBeInstanceOf(Date)
  })

  test('contents가 빈 문자열이어도 null로 떨어지지 않는다', () => {
    const todo = new ToDo(record({ contents: '' }) as never)

    expect(todo.contents).toBe('')
  })
})

describe('ToDo derived functions', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('stateUpdate()는 상태만 담아 update를 호출한다', async () => {
    updateTodoMock.mockResolvedValue(record({ state: TodoState.DONE }))

    const todo = new ToDo(details)
    await todo.stateUpdate(TodoState.DONE)

    expect(updateTodoMock).toHaveBeenCalledWith(10, { state: TodoState.DONE })
  })

  test('toggleDone()은 DONE이면 PENDING으로 되돌린다', async () => {
    updateTodoMock.mockResolvedValue(record())

    const todo = new ToDo({ ...details, state: TodoState.DONE })
    await todo.toggleDone()

    expect(updateTodoMock).toHaveBeenCalledWith(10, { state: TodoState.PENDING })
  })

  test('addChild()는 현재 id를 parentId로 실어 생성한다', async () => {
    createTodoMock.mockResolvedValue(record({ id: 13, parentId: 10 }))

    const todo = new ToDo(details)
    await todo.addChild('새 하위 작업')

    expect(createTodoMock).toHaveBeenCalledWith(expect.objectContaining({ title: '새 하위 작업', parentId: 10 }))
  })

  test('addChild()는 id가 없으면 실패한다', async () => {
    const todo = new ToDo('부모 없음')

    await expect(todo.addChild('자식')).rejects.toThrow('id is required')
    expect(createTodoMock).not.toHaveBeenCalled()
  })
})

describe('ToDo.update', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('patch를 넘기면 null로 비우는 것도 전달된다', async () => {
    updateTodoMock.mockResolvedValue(record({ deadline: null }))

    const todo = new ToDo(details)
    await todo.update({ deadline: null })

    expect(updateTodoMock).toHaveBeenCalledWith(10, { deadline: null })
  })

  test('patch가 없으면 값이 있는 필드만 모아 보낸다', async () => {
    updateTodoMock.mockResolvedValue(record())

    const todo = new ToDo(details)
    await todo.update()

    const payload = updateTodoMock.mock.calls[0][1]
    expect(payload).toEqual(
      expect.objectContaining({ title: details.title, contents: details.contents, state: details.state })
    )
  })

  test('보낼 것이 없으면 실패한다', async () => {
    const todo = new ToDo()
    todo.id = 1

    await expect(todo.update()).rejects.toThrow('nothing to update')
    expect(updateTodoMock).not.toHaveBeenCalled()
  })
})

describe('ToDo.delete', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('삭제 후 인스턴스가 초기화된다', async () => {
    deleteTodoMock.mockResolvedValue({ deletedId: 10, deletedDescendantsCount: 2 })

    const todo = new ToDo(details)
    await todo.delete()

    expect(deleteTodoMock).toHaveBeenCalledWith(10, null)
    expect(todo.id).toBeNull()
    expect(todo.children).toEqual([])
  })
})
