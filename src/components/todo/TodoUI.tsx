import { faSquare, faCircle as faSolidCircle } from '@fortawesome/free-solid-svg-icons'
import { faCircle, faCircleCheck } from '@fortawesome/free-regular-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { StatusConfig } from '@/components/todo/_core'
import { Todo, TodoState } from '@prisma/client'
import { Flex, Text } from '@mantine/core'

const config: StatusConfig = {
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
  const icon = config[todo.state].icon
  const cancelLine = todo.state === TodoState.DONE ? 'line-through' : ''
  const color = config[todo.state].color

  return (
    <Flex align={'center'} gap={8} c={color}>
      <FontAwesomeIcon icon={icon} />
      <Text td={cancelLine}>{todo.title}</Text>
    </Flex>
  )
}
