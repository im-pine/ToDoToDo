'use client'

import { getChildrenProgress, TODO_STATE_META, TodoSummary } from '@/components/todo/_core'
import { format } from 'date-fns'
import TodoDeadlineBadgeUI from '@/components/todo/TodoDeadlineBadgeUI'
import TodoStateBadgeUI from '@/components/todo/TodoStateBadgeUI'
import TodoProgressUI from '@/components/todo/TodoProgressUI'
import TodoModalUI, { useTodoDetail } from '@/components/todoModal'
import { Checkbox, Flex, Text } from '@mantine/core'
import { TodoState } from '@prisma/client'
import { MouseEvent } from 'react'

type TodoCardUIProps = {
  todo: TodoSummary
}

/** 이미지 2번 — 메인 목록의 카드형 할일 */
export default function TodoCardUI({ todo }: TodoCardUIProps) {
  const controller = useTodoDetail(todo.id)
  const done = todo.state === TodoState.DONE
  const progress = getChildrenProgress(todo.children, todo.state)
  const accent = done ? 'var(--black-colors-7)' : TODO_STATE_META[todo.state].color

  const stopPropagation = (event: MouseEvent) => event.stopPropagation()

  return (
    <>
      <TodoModalUI controller={controller} />

      <article
        className={'todo-card'}
        style={{ borderLeftColor: accent, opacity: done ? 0.55 : 1 }}
        onClick={controller.open}
      >
        <Flex align={'flex-start'} gap={12}>
          <Checkbox
            mt={2}
            size={'sm'}
            color={'primary.6'}
            checked={done}
            disabled={controller.pending}
            onChange={() => controller.toggleDone(todo.state)}
            onClick={stopPropagation}
            aria-label={`${todo.title} 완료`}
          />

          <div className={'min-w-0 flex-1'}>
            <Flex align={'flex-start'} justify={'space-between'} gap={8} wrap={'wrap'}>
              <Text
                className={'font-display leading-tight font-bold'}
                size={'16px'}
                c={done ? 'black.5' : 'black.1'}
                td={done ? 'line-through' : undefined}
              >
                {todo.title}
              </Text>
              <Flex align={'center'} gap={8} className={'shrink-0'}>
                <TodoStateBadgeUI state={todo.state} />
                <TodoDeadlineBadgeUI deadline={todo.deadline} />
              </Flex>
            </Flex>

            {todo.contents && (
              <Text size={'12px'} c={'black.5'} mt={4} lineClamp={1} className={'leading-relaxed'}>
                {todo.contents}
              </Text>
            )}

            <Flex align={'center'} justify={'space-between'} gap={8} mt={8} wrap={'wrap'}>
              <Flex align={'center'} gap={8}>
                <TodoStateBadgeUI state={todo.state} dotOnly={true} />
                <Text size={'11px'} c={'black.5'} className={'font-mono'}>
                  {todo.deadline ? format(new Date(todo.deadline), 'yyyy-MM-dd') : '마감일 없음'}
                </Text>
              </Flex>

              {progress.total > 0 && (
                <Flex align={'center'} gap={8}>
                  <Text size={'10px'} c={'black.5'} className={'font-mono'}>
                    {progress.done}/{progress.total}
                  </Text>
                  <TodoProgressUI progress={progress} className={'w-[60px]'} />
                </Flex>
              )}
            </Flex>
          </div>
        </Flex>
      </article>
    </>
  )
}
