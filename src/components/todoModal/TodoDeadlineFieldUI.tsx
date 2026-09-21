'use client'

import { getDeadlineMeta } from '@/components/todo/_core'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheck, faPen, faXmark } from '@fortawesome/free-solid-svg-icons'
import { ActionIcon, Flex, Text, TextInput } from '@mantine/core'
import { useState } from 'react'

type TodoDeadlineFieldUIProps = {
  deadline: string | null
  onChange: (value: string) => void
  disabled?: boolean
}

const toInputValue = (deadline: string | null) => (deadline ? deadline.slice(0, 10) : '')

/**
 * 상세 모달 전용 — 평소엔 배지처럼 보이다가 클릭하면 날짜 입력으로 바뀌는 마감일 필드.
 * 저장/취소를 명시적인 버튼으로 커밋한다. Mantine Modal 의 포커스 트랩이 blur 를 가로채
 * 다시 입력으로 포커스를 되돌리는 경우가 있어, blur 커밋 방식은 신뢰할 수 없었다.
 * 빈 값으로 저장하면 마감일이 지워진다.
 */
export default function TodoDeadlineFieldUI({ deadline, onChange, disabled }: TodoDeadlineFieldUIProps) {
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState(() => toInputValue(deadline))

  const startEditing = () => {
    setValue(toInputValue(deadline))
    setEditing(true)
  }

  const commit = () => {
    setEditing(false)
    if (value !== toInputValue(deadline)) onChange(value)
  }

  const cancel = () => {
    setValue(toInputValue(deadline))
    setEditing(false)
  }

  if (editing) {
    return (
      <Flex align={'center'} gap={4}>
        <TextInput
          type={'date'}
          size={'xs'}
          autoFocus={true}
          value={value}
          disabled={disabled}
          onChange={(event) => setValue(event.currentTarget.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') commit()
            if (event.key === 'Escape') cancel()
          }}
          classNames={{ input: 'todo-input !h-6 !min-h-0 !w-[132px] !py-0 !text-[11px]' }}
          styles={{ input: { colorScheme: 'dark' } }}
        />
        <ActionIcon size={'sm'} variant={'subtle'} color={'secondary.6'} onClick={commit} disabled={disabled} aria-label={'저장'}>
          <FontAwesomeIcon icon={faCheck} style={{ fontSize: 11 }} />
        </ActionIcon>
        <ActionIcon size={'sm'} variant={'subtle'} color={'black.5'} onClick={cancel} disabled={disabled} aria-label={'취소'}>
          <FontAwesomeIcon icon={faXmark} style={{ fontSize: 11 }} />
        </ActionIcon>
      </Flex>
    )
  }

  const meta = getDeadlineMeta(deadline)

  return (
    <Flex
      component={'button'}
      type={'button'}
      align={'center'}
      gap={6}
      disabled={disabled}
      onClick={startEditing}
      className={'todo-deadline-field'}
    >
      <Text size={'11px'} c={'black.2'} className={'font-mono'}>
        {deadline ? deadline.slice(0, 10) : '미정'}
      </Text>
      <Text size={'11px'} className={'font-mono'} style={{ color: meta.color }}>
        {meta.label}
      </Text>
      <FontAwesomeIcon icon={faPen} style={{ fontSize: 9 }} className={'text-black-600'} />
    </Flex>
  )
}
