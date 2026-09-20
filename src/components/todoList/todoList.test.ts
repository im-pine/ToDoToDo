import TodoList, { UNSET_KEY } from '@/components/todoList/_core'
import { TodoSummary } from '@/components/todo/_core'
import { TodoState } from '@prisma/client'

/** 테스트 기준일: 2026-01-10 */
const TODAY = new Date('2026-01-10T09:00:00')

const at = (days: number): string => {
  const date = new Date(TODAY)
  date.setDate(date.getDate() + days)
  return date.toISOString()
}

const todo = (id: number, deadline: string | null, state: TodoState = TodoState.PENDING): TodoSummary => ({
  id,
  title: `할일 ${id}`,
  state,
  deadline,
})

describe('TodoList.groupByDeadline', () => {
  test('마감일(yyyy-MM-dd)별로 묶는다', () => {
    const list = new TodoList([todo(1, at(0)), todo(2, at(0)), todo(3, at(1))])
    const grouped = list.groupByDeadline()

    expect(Object.keys(grouped)).toHaveLength(2)
    expect(Object.values(grouped).flat()).toHaveLength(3)
  })

  test('마감일이 없으면 UNSET_KEY로 모인다', () => {
    const grouped = new TodoList([todo(1, null), todo(2, null)]).groupByDeadline()

    expect(grouped[UNSET_KEY]).toHaveLength(2)
  })

  test('마감일이 잘못된 값이어도 UNSET_KEY로 흘러간다', () => {
    const grouped = new TodoList([todo(1, 'not-a-date')]).groupByDeadline()

    expect(grouped[UNSET_KEY]).toHaveLength(1)
  })
})

describe('TodoList.withinDays', () => {
  test('오늘은 포함된다', () => {
    expect(new TodoList([todo(1, at(0))]).withinDays(7, TODAY).length).toBe(1)
  })

  test('경계값인 7일째는 포함된다', () => {
    expect(new TodoList([todo(1, at(7))]).withinDays(7, TODAY).length).toBe(1)
  })

  test('8일째는 제외된다', () => {
    expect(new TodoList([todo(1, at(8))]).withinDays(7, TODAY).length).toBe(0)
  })

  test('기한이 지난 항목은 제외된다', () => {
    expect(new TodoList([todo(1, at(-1))]).withinDays(7, TODAY).length).toBe(0)
  })

  test('마감일 미정 항목은 제외된다', () => {
    expect(new TodoList([todo(1, null)]).withinDays(7, TODAY).length).toBe(0)
  })

  test('원본 인스턴스를 바꾸지 않는다', () => {
    const list = new TodoList([todo(1, at(0)), todo(2, at(30))])
    list.withinDays(7, TODAY)

    expect(list.length).toBe(2)
  })
})

describe('TodoList.sortKeys', () => {
  test('날짜 오름차순으로 정렬한다', () => {
    expect(TodoList.sortKeys(['2026-01-12', '2026-01-10', '2026-01-11'])).toEqual([
      '2026-01-10',
      '2026-01-11',
      '2026-01-12',
    ])
  })

  test('마감일 미정 그룹은 항상 마지막이다', () => {
    const sorted = TodoList.sortKeys([UNSET_KEY, '2026-01-12', '2026-01-10'])

    expect(sorted[sorted.length - 1]).toBe(UNSET_KEY)
  })
})
