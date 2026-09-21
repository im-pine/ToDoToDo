'use client'

import { TODO_STATE_META, TODO_STATE_ORDER } from '@/components/todo/_core'
import { useTodoForm } from '@/components/todoForm/_core'
import { ActionIcon, Button, Flex, Modal, Select, Stack, Text, Textarea, TextInput } from '@mantine/core'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faXmark } from '@fortawesome/free-solid-svg-icons'
import { TodoState } from '@prisma/client'
import { FormEvent } from 'react'

type TodoFormModalUIProps = {
  opened: boolean
  onClose: () => void
  parentId?: number | null
}

const STATE_OPTIONS = TODO_STATE_ORDER.map((state) => ({
  value: state,
  label: TODO_STATE_META[state].label,
}))

const labelClass = 'font-mono !text-[11px]'

/** 이미지 3번 — 새 할일 추가 모달 */
export default function TodoFormModalUI({ opened, onClose, parentId = null }: TodoFormModalUIProps) {
  const { values, setValue, submit, reset, loading, error } = useTodoForm({
    parentId,
    onSuccess: onClose,
  })

  const handleClose = () => {
    reset()
    onClose()
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    await submit()
  }

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      centered={true}
      size={'480px'}
      padding={0}
      withCloseButton={false}
      overlayProps={{ backgroundOpacity: 0.8, blur: 4 }}
      classNames={{ content: 'todo-modal todo-modal--gold', body: '!p-0' }}
    >
      <form onSubmit={handleSubmit}>
        <Flex align={'center'} justify={'space-between'} px={24} pt={20} pb={16} className={'border-black-800 border-b'}>
          <Stack gap={8}>
            <span className={'bg-secondary-600 block h-0.5 w-8'} />
            <Text component={'h2'} size={'20px'} c={'black.1'} className={'font-display font-bold'}>
              새 할일 추가
            </Text>
          </Stack>
          <ActionIcon variant={'subtle'} color={'black.5'} onClick={handleClose} aria-label={'닫기'}>
            <FontAwesomeIcon icon={faXmark} />
          </ActionIcon>
        </Flex>

        <Stack gap={12} px={24} pt={16} pb={24}>
          <TextInput
            label={'제목'}
            required={true}
            data-autofocus={true}
            placeholder={'할일 제목을 입력하세요'}
            value={values.title}
            onChange={(event) => setValue('title', event.currentTarget.value)}
            classNames={{ label: labelClass, input: 'todo-input' }}
          />

          <Textarea
            label={'설명'}
            placeholder={'세부 내용...'}
            autosize={true}
            minRows={3}
            maxRows={8}
            value={values.contents}
            onChange={(event) => setValue('contents', event.currentTarget.value)}
            classNames={{ label: labelClass, input: 'todo-input' }}
          />

          <Flex gap={12} className={'flex-col sm:flex-row'}>
            <Select
              label={'상태'}
              data={STATE_OPTIONS}
              value={values.state}
              allowDeselect={false}
              onChange={(value) => setValue('state', (value as TodoState) ?? TodoState.PENDING)}
              className={'flex-1'}
              classNames={{ label: labelClass, input: 'todo-input', dropdown: 'todo-dropdown' }}
            />
            <TextInput
              type={'date'}
              label={'마감일'}
              value={values.deadline}
              onChange={(event) => setValue('deadline', event.currentTarget.value)}
              className={'flex-1'}
              classNames={{ label: labelClass, input: 'todo-input' }}
              styles={{ input: { colorScheme: 'dark' } }}
            />
          </Flex>

          {error && (
            <Text size={'12px'} c={'primary.4'}>
              {error}
            </Text>
          )}

          <Flex gap={10} mt={4}>
            <Button
              type={'button'}
              variant={'default'}
              onClick={handleClose}
              className={'font-display flex-1 !font-semibold'}
              classNames={{ root: 'todo-button-ghost' }}
            >
              취소
            </Button>
            <Button
              type={'submit'}
              color={'primary.6'}
              loading={loading}
              className={'font-display !font-bold'}
              style={{ flex: 2 }}
            >
              할일 추가
            </Button>
          </Flex>
        </Stack>
      </form>
    </Modal>
  )
}
