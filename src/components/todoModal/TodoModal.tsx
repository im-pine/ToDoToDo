import { Flex, Modal, ModalProps, Stack, Text, Textarea } from '@mantine/core'
import ToDo from '@/components/todo/_core'

type TodoModalProps = ModalProps & {
  todo: ToDo | null
}
export default function TodoModal({ todo, ...props }: TodoModalProps) {
  const { opened, onClose } = props

  if (!todo && opened) {
    alert('유효하지 않은 접근입니다.')
    onClose()
    return
  }
  if (!todo) return <></>

  const data = todo.get()
  if (todo) console.log(data)
  const { title, contents } = data
  return (
    <Modal
      opened={opened}
      size={'880px'}
      onClose={onClose}
      title={title}
      classNames={{ header: '!bg-black-800', body: '!bg-black-800 !p-0 !border-t-2 !border-t-black-900' }}
    >
      <Flex>
        <Stack w={'100%'} py={20} px={10}>
          <Textarea>{contents}</Textarea>
        </Stack>
        <Stack w={'260px'} py={20} px={20} className={'bg-black-700'}>
          <Text>상태</Text>
        </Stack>
      </Flex>
    </Modal>
  )
}
