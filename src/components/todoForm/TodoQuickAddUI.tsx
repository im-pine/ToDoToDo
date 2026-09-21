'use client'

import { useTodoForm } from '@/components/todoForm/_core'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPaperPlane } from '@fortawesome/free-solid-svg-icons'
import { ActionIcon, Box, TextInput } from '@mantine/core'
import { FormEvent } from 'react'

type TodoQuickAddUIProps = {
  parentId?: number | null
  className?: string
}

/**
 * 제목만 입력받는 한 줄 추가 UI.
 * 모달 폼(TodoFormModalUI)과 동일한 코어를 공유한다.
 */
export default function TodoQuickAddUI({ parentId = null, className = '' }: TodoQuickAddUIProps) {
  const { values, setValue, submit, loading } = useTodoForm({ parentId })

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    await submit()
  }

  return (
    <Box component={'form'} onSubmit={handleSubmit} className={className}>
      <TextInput
        size={'md'}
        radius={'xl'}
        name={'title'}
        placeholder={'할일을 입력해 주세요.'}
        value={values.title}
        onChange={(event) => setValue('title', event.currentTarget.value)}
        classNames={{ input: '!bg-black-900 !border-primary-600 !text-black-100 border' }}
        rightSection={
          <ActionIcon color={'primary.6'} variant={'subtle'} type={'submit'} loading={loading} aria-label={'할일 추가'}>
            <FontAwesomeIcon icon={faPaperPlane} />
          </ActionIcon>
        }
      />
    </Box>
  )
}
