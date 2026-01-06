import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPaperPlane } from '@fortawesome/free-solid-svg-icons'
import { ActionIcon, Box, TextInput } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import ToDo from '@/components/todo'
import { FormEvent, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'

export default function TodoSend() {
  const [loading, { open: loadingOn, close }] = useDisclosure()
  const loadingOff = () => setTimeout(close, 1500)
  const formRef = useRef<HTMLFormElement>(null)
  const queryClient = useQueryClient()

  const createTodo = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    loadingOn()

    try {
      const formData = Object.fromEntries(new FormData(e.currentTarget))
      const title = String(formData.title ?? '')

      const todo = new ToDo(title)

      await todo.create()
      formRef.current?.reset()
      await queryClient.invalidateQueries({ queryKey: ['todo'] })
    } catch (err) {
      // 여기서 토스트/알림 처리
      console.error(err)
    } finally {
      loadingOff() // ✅ 성공/실패 상관없이 무조건 실행
    }
  }
  return (
    <Box component={'form'} onSubmit={createTodo} className={'absolute right-0 bottom-0 left-0'} ref={formRef}>
      <TextInput
        size={'md'}
        radius={'xl'}
        placeholder={'할일을 입력해 주세요.'}
        name={'title'}
        classNames={{ input: '!bg-black border !border-primary-600 !text-black-100' }}
        rightSection={
          <ActionIcon color={'primary.6'} variant={'subtle'} type={'submit'} loading={loading}>
            <FontAwesomeIcon icon={faPaperPlane} />
          </ActionIcon>
        }
      />
    </Box>
  )
}
