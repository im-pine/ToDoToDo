import { faSquare, faCircle as faSolidCircle } from '@fortawesome/free-solid-svg-icons'
import { faCircle, faCircleCheck } from '@fortawesome/free-regular-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { StatusConfig, TodoSummary } from '@/components/todo/_core'
import { Todo, TodoState } from '@prisma/client'
import { Flex, Modal, Text } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import TodoModal from '@/components/todoModal/TodoModal'
import ToDo from '@/components/todo/index'
import { useState } from 'react'

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

export default function TodoUI({ todo }: { todo: Todo | TodoSummary }) {
  const [modalData, setModalData] = useState<null | ToDo>(null)
  const [opened, { open, close }] = useDisclosure(false)
  const icon = config[todo.state].icon
  const cancelLine = todo.state === TodoState.DONE ? 'line-through' : ''
  const color = config[todo.state].color

  const openModal = async () => {
    const todoClass = new ToDo(todo)
    const todoDetail = await todoClass.detailsRead()
    const modal = new ToDo(todoDetail)
    setModalData(modal)
    console.log('todoDetail::', todoDetail)
    open()
  }
  return (
    <>
      <TodoModal opened={opened} onClose={close} title={'Authentication'} todo={modalData}>
        {/* Modal content */}
      </TodoModal>
      <Flex className={'cursor-pointer'} align={'center'} gap={8} c={color} onClick={openModal}>
        <FontAwesomeIcon icon={icon} />
        <Text td={cancelLine}>{todo.title}</Text>
      </Flex>
    </>
  )
}
