'use client'

import { TODO_FILTER_LABEL, TodoFilter } from '@/components/todo'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus } from '@fortawesome/free-solid-svg-icons'
import { ActionIcon, AppShell, Burger, Button, Flex, Stack, Text } from '@mantine/core'
import { TodoState } from '@prisma/client'

type HeaderProps = {
  filter: TodoFilter
  onFilterChange: (filter: TodoFilter) => void
  count: number
  onAdd: () => void
  navOpened: boolean
  onToggleNav: () => void
}

// '진행중' 탭은 사이드바의 '상태 → 진행중' 필터와 같은 의미(TodoState.IN_PROGRESS)를 가리키도록
// 맞춰서, 같은 이름의 필터가 서로 다르게 동작하는 혼란을 없앤다.
const TABS: { value: TodoFilter; label: string }[] = [
  { value: 'ALL', label: '전체' },
  { value: TodoState.IN_PROGRESS, label: '진행중' },
  { value: TodoState.DONE, label: '완료' },
]

/** 이미지 2번 상단 — 현재 필터 제목 · 탭 · 추가 버튼 */
export default function Header({ filter, onFilterChange, count, onAdd, navOpened, onToggleNav }: HeaderProps) {
  return (
    <AppShell.Header bg={'black.8'} withBorder={false} className={'border-black-800 !border-b'}>
      <Flex align={'center'} gap={12} h={'100%'} px={24}>
        <Burger opened={navOpened} onClick={onToggleNav} hiddenFrom={'sm'} size={'sm'} color={'var(--black-colors-4)'} />

        <Stack gap={2} className={'min-w-0 flex-1'}>
          <Text component={'h1'} size={'20px'} c={'black.1'} className={'font-display font-bold tracking-wider'}>
            {TODO_FILTER_LABEL[filter]}
          </Text>
          <Text size={'12px'} c={'black.5'}>
            {count}개의 항목
          </Text>
        </Stack>

        <Flex gap={4} className={'shrink-0'}>
          {TABS.map((tab) => (
            <button
              key={tab.value}
              type={'button'}
              onClick={() => onFilterChange(tab.value)}
              className={`filter-tab ${filter === tab.value ? 'filter-tab--active' : ''}`}
            >
              {tab.label}
            </button>
          ))}
        </Flex>

        <Button
          onClick={onAdd}
          color={'primary.6'}
          leftSection={<FontAwesomeIcon icon={faPlus} />}
          className={'font-display !font-bold'}
          visibleFrom={'sm'}
        >
          추가
        </Button>
        <ActionIcon
          onClick={onAdd}
          color={'primary.6'}
          variant={'filled'}
          size={'lg'}
          hiddenFrom={'sm'}
          aria-label={'할일 추가'}
        >
          <FontAwesomeIcon icon={faPlus} />
        </ActionIcon>
      </Flex>
    </AppShell.Header>
  )
}
