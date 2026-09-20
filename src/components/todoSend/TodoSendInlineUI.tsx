'use client'

import { useTodoSendCore, UseTodoSendOptions } from '@/components/todoSend/_core'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus } from '@fortawesome/free-solid-svg-icons'
import { Box, Flex, Text, TextInput } from '@mantine/core'
import { useState } from 'react'

/**
 * 모달의 '하위 작업 추가' 입력.
 *
 * TodoSendUI 와 동일한 useTodoSendCore 를 쓰고 parentId 만 다르게 넘긴다.
 * 평소엔 링크처럼 보이다가 클릭하면 입력창으로 펼쳐진다.
 */
export default function TodoSendInlineUI({ parentId, onCreated }: UseTodoSendOptions = {}) {
  const [editing, setEditing] = useState(false)
  const { submit, loading, formRef } = useTodoSendCore({
    parentId,
    onCreated: () => {
      setEditing(false)
      onCreated?.()
    },
  })

  if (!editing) {
    return (
      <Flex
        align={'center'}
        gap={10}
        py={10}
        c={'black.5'}
        className={'cursor-pointer transition-colors hover:text-[var(--black-colors-3)]'}
        onClick={() => setEditing(true)}
      >
        <FontAwesomeIcon icon={faPlus} size={'sm'} />
        <Text size={'sm'}>하위 작업 추가</Text>
      </Flex>
    )
  }

  return (
    <Box component={'form'} onSubmit={submit} ref={formRef} py={6}>
      <TextInput
        name={'title'}
        size={'sm'}
        variant={'unstyled'}
        autoFocus={true}
        disabled={loading}
        placeholder={'하위 작업을 입력하고 Enter'}
        classNames={{ input: '!text-black-100' }}
        onBlur={() => setEditing(false)}
        onKeyDown={(e) => {
          if (e.key === 'Escape') setEditing(false)
        }}
      />
    </Box>
  )
}
