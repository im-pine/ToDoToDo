'use client'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import defaultStatusConfig from '@/components/todo/statusConfig'
import { useTodoModal } from '@/components/todoModal/_core'
import { TodoSummary } from '@/components/todo/_core'
import { Todo, TodoState } from '@prisma/client'
import { Flex, Text } from '@mantine/core'

export default function TodoUI({ todo }: { todo: Todo | TodoSummary }) {
  const { open } = useTodoModal()
  const { icon, color } = defaultStatusConfig[todo.state]
  const cancelLine = todo.state === TodoState.DONE ? 'line-through' : ''

  return (
    <Flex className={'cursor-pointer'} align={'center'} gap={8} c={color} onClick={() => open(todo.id)}>
      <FontAwesomeIcon icon={icon} />
      <Text td={cancelLine}>{todo.title}</Text>
    </Flex>
  )
}
