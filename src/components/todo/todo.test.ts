import ToDo from '@/components/todo/_core'
import { createTodo } from '@/lib/api/todo'

jest.mock('@/lib/api/todo', () => ({
  createTodo: jest.fn(),
}))

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
