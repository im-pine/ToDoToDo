'use client'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import defaultStatusConfig from '@/components/todo/statusConfig'
import { useTodoModal } from '@/components/todoModal/_core'
import { TodoSummary } from '@/components/todo/_core'
import { Todo, TodoState } from '@prisma/client'
import { Flex, Text } from '@mantine/core'

/**
 * 사이드바용 축약 행.
 *
 * TodoUI 와 동일한 core(ToDo)·동일한 StatusConfig 를 쓰면서 표현만 다르다.
 * core 는 그대로 두고 UI 만 확장한다는 구조를 그대로 보여주는 예시.
 */
export default function TodoCompactUI({ todo }: { todo: Todo | TodoSummary }) {
  const { open } = useTodoModal()
  const { icon, color } = defaultStatusConfig[todo.state]
  const cancelLine = todo.state === TodoState.DONE ? 'line-through' : ''

  return (
    <Flex
      className={'cursor-pointer rounded px-2 py-1 transition-colors hover:bg-black-700'}
      align={'center'}
      gap={8}
      c={color}
      onClick={() => open(todo.id)}
    >
      <FontAwesomeIcon icon={icon} size={'xs'} />
      <Text size={'sm'} td={cancelLine} lineClamp={1}>
        {todo.title}
      </Text>
    </Flex>
  )
}
