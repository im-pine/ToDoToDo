'use client'

import { TodoSummary } from '@/components/todo/_core'
import TodoDeadlineBadgeUI from '@/components/todo/TodoDeadlineBadgeUI'
import TodoStateBadgeUI from '@/components/todo/TodoStateBadgeUI'
import TodoModalUI, { useTodoDetail } from '@/components/todoModal'
import { Flex, Text } from '@mantine/core'
import { TodoState } from '@prisma/client'

type TodoUIProps = {
  todo: TodoSummary
  /** 마감일 배지 노출 여부 */
  withDeadline?: boolean
}

/**
 * 가장 단순한 한 줄짜리 표현.
 * 카드(TodoCardUI)·요약(TodoBriefUI)과 동일한 코어를 쓰되 밀도만 다르다.
 */
export default function TodoUI({ todo, withDeadline = true }: TodoUIProps) {
  const controller = useTodoDetail(todo.id)
  const done = todo.state === TodoState.DONE

  return (
    <>
      <TodoModalUI controller={controller} />

      <Flex align={'center'} gap={8} className={'todo-line'} onClick={controller.open}>
        <TodoStateBadgeUI state={todo.state} dotOnly={true} />
        <Text size={'14px'} c={done ? 'black.5' : 'black.1'} td={done ? 'line-through' : undefined} lineClamp={1}>
          {todo.title}
        </Text>
        {withDeadline && <TodoDeadlineBadgeUI deadline={todo.deadline} className={'ml-auto'} />}
      </Flex>
    </>
  )
}
