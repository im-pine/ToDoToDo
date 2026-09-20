'use client'

import { useTodoSendCore, UseTodoSendOptions } from '@/components/todoSend/_core'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPaperPlane } from '@fortawesome/free-solid-svg-icons'
import { ActionIcon, Box, TextInput } from '@mantine/core'

export default function TodoSendUI({ parentId, onCreated }: UseTodoSendOptions = {}) {
  const { submit, loading, formRef } = useTodoSendCore({ parentId, onCreated })

  return (
    <Box component={'form'} onSubmit={submit} className={'absolute right-0 bottom-0 left-0'} ref={formRef}>
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
