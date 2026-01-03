import { Flex, Text } from '@mantine/core'
import { Todo, TodoState } from '@prisma/client'
import { faCircle, faCircleCheck, IconDefinition } from '@fortawesome/free-regular-svg-icons'
import { faSquare, faCircle as faSolidCircle } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

type StatusMeta = {
  icon: IconDefinition
  color: string
  label: string
}

const StatusConfig: Record<TodoState, StatusMeta> = {
  [TodoState.PENDING]: {
    icon: faCircle,
    color: 'black.4',
    label: '대기',
  },
  [TodoState.IN_PROGRESS]: {
    icon: faSolidCircle,
    color: 'blue',
    label: '진행',
  },
  [TodoState.ON_HOLD]: {
    icon: faSquare,
    color: 'black.4',
    label: '보류',
  },
  [TodoState.DONE]: {
    icon: faCircleCheck,
    color: 'green',
    label: '완료',
  },
}

export default function TodoUI({ todo }: { todo: Todo }) {
  const icon = StatusConfig[todo.state].icon
  const cancelLine = todo.state === TodoState.DONE ? 'line-through' : ''
  const color = StatusConfig[todo.state].color

  return (
    <Flex align={'center'} gap={8} c={color}>
      <FontAwesomeIcon icon={icon} />
      <Text td={cancelLine}>{todo.title}</Text>
    </Flex>
  )
}
