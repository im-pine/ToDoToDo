'use client'

import { useTodoListCore, UseTodoListOptions } from '@/components/todoList/_core'
import TodoCompactUI from '@/components/todo/TodoCompactUI'
import formatDateToKr from '@/lib/formatDateToKr'
import { Stack, Text } from '@mantine/core'

/**
 * 사이드바용 목록.
 *
 * TodoListUI 와 동일한 useTodoListCore 를 쓰고 표현만 다르다.
 * 마감 임박한 할일을 좁은 폭에서 훑어보는 용도라 라벨과 행을 모두 축약했다.
 */
export default function TodoListCompactUI({ withinDays }: UseTodoListOptions = {}) {
  const { groups, keys, isEmpty, isLoading } = useTodoListCore({ withinDays })

  if (isLoading) return null

  if (isEmpty) {
    return (
      <Text c={'black.5'} size={'sm'} py={'12px'}>
        임박한 할일이 없습니다.
      </Text>
    )
  }

  return (
    <Stack gap={16}>
      {keys.map((key) => (
        <Stack key={key} gap={4}>
          <Text size={'xs'} fw={700} c={'black.4'} tt={'uppercase'}>
            {formatDateToKr(key)}
          </Text>
          <Stack gap={2}>
            {groups[key].map((todo) => (
              <TodoCompactUI key={todo.id} todo={todo} />
            ))}
          </Stack>
        </Stack>
      ))}
    </Stack>
  )
}
