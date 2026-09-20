'use client'

import { useTodoListCore, UseTodoListOptions } from '@/components/todoList/_core'
import { Divider, Stack, Text, Title } from '@mantine/core'
import TodoUI from '@/components/todo/TodoUI'
import formatDateToKr from '@/lib/formatDateToKr'

/** 메인 영역용 목록. 마감일 그룹마다 큰 제목 + 구분선. */
export default function TodoListUI({ withinDays }: UseTodoListOptions = {}) {
  const { groups, keys, isEmpty, isLoading } = useTodoListCore({ withinDays })

  if (isLoading) return null

  if (isEmpty) {
    return (
      <Text c={'black.4'} ta={'center'} py={'40px'}>
        등록된 할일이 없습니다.
      </Text>
    )
  }

  return (
    <Stack gap={32}>
      {keys.map((key) => (
        <Stack key={key} gap={20}>
          <Title order={2}>{formatDateToKr(key)}</Title>
          <Stack gap={4}>
            {groups[key].map((todo) => (
              <TodoUI key={todo.id} todo={todo} />
            ))}
          </Stack>
          <Divider color={'black.6'} />
        </Stack>
      ))}
    </Stack>
  )
}
