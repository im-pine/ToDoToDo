'use client'

import TodoDeadlineBadgeUI from '@/components/todo/TodoDeadlineBadgeUI'
import TodoStateBadgeUI from '@/components/todo/TodoStateBadgeUI'
import TodoModalUI, { useTodoDetail } from '@/components/todoModal'
import { Flex, Text } from '@mantine/core'
import { TodoState } from '@prisma/client'
import { format } from 'date-fns'

type TodoBriefUIProps = {
  id: number
  title: string
  state: TodoState
  deadline: string | null
  /** 하위 작업일 때 상위 작업 제목을 작게 표시해 소속을 명시한다 */
  parentTitle?: string
  /** 모달을 연 뒤 모바일 사이드바를 닫는 등의 후처리 */
  onSelect?: () => void
}

/** 이미지 2번 좌측 — 사이드바 '마감 임박 순' 요약형 할일. 하위 작업도 같은 모양으로 보여줄 수 있다. */
export default function TodoBriefUI({ id, title, state, deadline, parentTitle, onSelect }: TodoBriefUIProps) {
  const controller = useTodoDetail(id)

  const handleClick = () => {
    controller.open()
    onSelect?.()
  }

  return (
    <>
      <TodoModalUI controller={controller} />

      <div className={'todo-brief'} onClick={handleClick} role={'button'} tabIndex={0}>
        {parentTitle && (
          <Text size={'9px'} c={'black.6'} truncate={'end'} className={'mb-1'}>
            ↳ {parentTitle}
          </Text>
        )}
        <Flex align={'flex-start'} justify={'space-between'} gap={6}>
          <Text size={'12px'} c={'black.2'} className={'flex-1 leading-snug'} lineClamp={2}>
            {title}
          </Text>
          <TodoDeadlineBadgeUI deadline={deadline} className={'shrink-0 text-[10px]'} />
        </Flex>
        <Flex align={'center'} gap={6} mt={4}>
          <TodoStateBadgeUI state={state} dotOnly={true} className={'!h-1.5 !w-1.5'} />
          <Text size={'10px'} c={'black.5'} className={'font-mono'}>
            {deadline ? format(new Date(deadline), 'yyyy-MM-dd') : '미정'}
          </Text>
        </Flex>
      </div>
    </>
  )
}
