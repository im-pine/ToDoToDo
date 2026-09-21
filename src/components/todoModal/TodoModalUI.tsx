'use client'

import { TODO_STATE_META, TODO_STATE_ORDER } from '@/components/todo/_core'
import TodoStateBadgeUI from '@/components/todo/TodoStateBadgeUI'
import TodoProgressUI from '@/components/todo/TodoProgressUI'
import TodoDeadlineFieldUI from '@/components/todoModal/TodoDeadlineFieldUI'
import { TodoDetailController } from '@/components/todoModal/_core'
import { ActionIcon, Button, Checkbox, Flex, Loader, Modal, Stack, Text, Textarea, TextInput } from '@mantine/core'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowLeft, faChevronRight, faPlus, faXmark } from '@fortawesome/free-solid-svg-icons'
import { TodoState } from '@prisma/client'
import { FormEvent, useEffect, useState } from 'react'
import { format } from 'date-fns'

type TodoModalUIProps = {
  controller: TodoDetailController
}

const formatDate = (value?: string | Date | null) => (value ? format(new Date(value), 'yyyy-MM-dd') : '미정')

/** 이미지 1번 — 할일 상세 모달. 하위 작업 클릭 시 같은 모달이 그 하위 작업 데이터로 전환된다. */
export default function TodoModalUI({ controller }: TodoModalUIProps) {
  const { opened, close, detail, progress, isLoading, pending, canGoBack, openChild, goBack } = controller
  const { changeState, changeContents, changeDeadline, addChild, toggleChild, removeChild } = controller
  const [childTitle, setChildTitle] = useState('')

  // 하위 작업으로 이동하면(또는 뒤로가면) 이전에 입력 중이던 내용이 남지 않도록 비운다
  useEffect(() => {
    setChildTitle('')
  }, [detail?.id])

  const submitChild = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const title = childTitle.trim()
    if (!title) return

    setChildTitle('')
    await addChild(title)
  }

  return (
    <Modal
      opened={opened}
      onClose={close}
      centered={true}
      size={'560px'}
      padding={0}
      withCloseButton={false}
      overlayProps={{ backgroundOpacity: 0.8, blur: 4 }}
      classNames={{ content: 'todo-modal', body: '!p-0' }}
    >
      {isLoading || !detail ? (
        <Flex h={220} align={'center'} justify={'center'}>
          <Loader color={'primary.6'} size={'sm'} />
        </Flex>
      ) : (
        <>
          {/* 헤더 */}
          <Stack gap={12} px={24} pt={20} pb={16} className={'border-black-800 border-b'}>
            <Flex align={'flex-start'} justify={'space-between'} gap={12}>
              <Flex align={'center'} gap={8}>
                {canGoBack && (
                  <ActionIcon
                    variant={'subtle'}
                    color={'black.4'}
                    onClick={goBack}
                    aria-label={'상위 작업으로 돌아가기'}
                    className={'!-ml-1.5'}
                  >
                    <FontAwesomeIcon icon={faArrowLeft} />
                  </ActionIcon>
                )}
                <TodoStateBadgeUI state={detail.state} dotOnly={true} />
                <Text size={'11px'} className={'font-mono'} style={{ color: TODO_STATE_META[detail.state].color }}>
                  {TODO_STATE_META[detail.state].label}
                </Text>
              </Flex>
              <ActionIcon variant={'subtle'} color={'black.5'} onClick={close} aria-label={'닫기'}>
                <FontAwesomeIcon icon={faXmark} />
              </ActionIcon>
            </Flex>

            <Text
              component={'h2'}
              className={'font-display leading-tight font-bold'}
              size={'22px'}
              c={detail.state === TodoState.DONE ? 'black.5' : 'black.1'}
              td={detail.state === TodoState.DONE ? 'line-through' : undefined}
            >
              {detail.title}
            </Text>

            <Flex gap={16} wrap={'wrap'} align={'center'}>
              <Flex align={'center'} gap={6}>
                <Text size={'11px'} c={'black.5'}>
                  마감일
                </Text>
                <TodoDeadlineFieldUI deadline={detail.deadline} onChange={changeDeadline} disabled={pending} />
              </Flex>
              <Flex align={'center'} gap={6}>
                <Text size={'11px'} c={'black.5'}>
                  생성일
                </Text>
                <Text size={'11px'} c={'black.5'} className={'font-mono'}>
                  {formatDate(detail.date)}
                </Text>
              </Flex>
            </Flex>
          </Stack>

          {/* 본문 */}
          <Stack gap={20} px={24} py={16} className={'max-h-[60vh] overflow-y-auto'}>
            <Textarea
              key={detail.id}
              defaultValue={detail.contents ?? ''}
              placeholder={'세부 내용을 입력하세요'}
              autosize={true}
              minRows={2}
              maxRows={8}
              onBlur={(event) => {
                const next = event.currentTarget.value
                if (next !== (detail.contents ?? '')) void changeContents(next)
              }}
              classNames={{ input: 'todo-input !text-[13px] !leading-7' }}
            />

            {/* 상태 변경 */}
            <Stack gap={8}>
              <Text size={'12px'} c={'black.5'} className={'font-display font-semibold tracking-widest'}>
                상태
              </Text>
              <Flex gap={6} wrap={'wrap'}>
                {TODO_STATE_ORDER.map((state) => {
                  const { label, color } = TODO_STATE_META[state]
                  const selected = detail.state === state

                  return (
                    <button
                      key={state}
                      type={'button'}
                      disabled={pending}
                      onClick={() => changeState(state)}
                      className={'todo-state-option'}
                      style={
                        selected
                          ? {
                              color,
                              borderColor: `color-mix(in srgb, ${color} 55%, transparent)`,
                              background: `color-mix(in srgb, ${color} 16%, transparent)`,
                            }
                          : undefined
                      }
                    >
                      {label}
                    </button>
                  )
                })}
              </Flex>
            </Stack>

            {/* 진행률 */}
            {progress.total > 0 && (
              <TodoProgressUI progress={progress} label={'percent'} title={'진행률'} height={5} />
            )}

            {/* 하위 작업 */}
            <Stack gap={10}>
              <Text size={'12px'} c={'black.2'} className={'font-display font-semibold tracking-widest'}>
                하위 작업 ({progress.done}/{progress.total})
              </Text>

              <Stack gap={6}>
                {detail.children.map((child) => {
                  const done = child.state === TodoState.DONE

                  return (
                    <Flex key={child.id} align={'center'} gap={10} className={'todo-subtask'}>
                      <Checkbox
                        size={'xs'}
                        radius={'xl'}
                        color={'secondary.6'}
                        checked={done}
                        disabled={pending}
                        onChange={() => toggleChild(child.id, child.state)}
                        onClick={(event) => event.stopPropagation()}
                        aria-label={child.title}
                      />
                      {/* 클릭하면 이 하위 작업 자체로 모달이 전환된다 (그 안에서 또 하위 작업을 만들 수 있음) */}
                      <button
                        type={'button'}
                        onClick={() => openChild(child.id)}
                        className={'todo-subtask-title'}
                        aria-label={`${child.title} 열기`}
                      >
                        <Text
                          size={'13px'}
                          c={done ? 'black.5' : 'black.2'}
                          td={done ? 'line-through' : undefined}
                        >
                          {child.title}
                        </Text>
                        <FontAwesomeIcon icon={faChevronRight} className={'text-black-600'} style={{ fontSize: 10 }} />
                      </button>
                      <ActionIcon
                        size={'sm'}
                        variant={'subtle'}
                        color={'black.6'}
                        disabled={pending}
                        onClick={() => removeChild(child.id)}
                        aria-label={`${child.title} 삭제`}
                        className={'hover:!text-primary-500'}
                      >
                        <FontAwesomeIcon icon={faXmark} size={'xs'} />
                      </ActionIcon>
                    </Flex>
                  )
                })}
              </Stack>

              <form onSubmit={submitChild}>
                <Flex gap={8}>
                  <TextInput
                    className={'flex-1'}
                    placeholder={'하위 작업 추가...'}
                    value={childTitle}
                    onChange={(event) => setChildTitle(event.currentTarget.value)}
                    classNames={{ input: 'todo-input !text-[13px]' }}
                  />
                  <Button
                    type={'submit'}
                    color={'primary.6'}
                    loading={pending}
                    leftSection={<FontAwesomeIcon icon={faPlus} size={'xs'} />}
                    className={'font-display !font-bold'}
                  >
                    추가
                  </Button>
                </Flex>
              </form>
            </Stack>
          </Stack>
        </>
      )}
    </Modal>
  )
}
