'use client'

import {
  countByState,
  getTodoStats,
  getUpcomingSidebarItems,
  TODO_STATE_META,
  TODO_STATE_ORDER,
  TodoBriefUI,
  TodoFilter,
  TodoStateBadgeUI,
  TodoSummary,
  useUpcomingSubtasks,
} from '@/components/todo'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus, faXmark } from '@fortawesome/free-solid-svg-icons'
import { ActionIcon, AppShell, Button, Flex, ScrollArea, Stack, Text } from '@mantine/core'
import Logo from '@/layout/Logo'
import { ReactNode } from 'react'

type SideBarProps = {
  todos: TodoSummary[]
  filter: TodoFilter
  onFilterChange: (filter: TodoFilter) => void
  onAdd: () => void
  /** 모바일에서 항목 선택 시(또는 닫기 버튼으로) 네비게이션을 닫기 위한 콜백 */
  onNavigate?: () => void
}

/** 이미지 2번 좌측 — 통계 · 마감 임박 · 상태 필터 사이드바 */
export default function SideBar({ todos, filter, onFilterChange, onAdd, onNavigate }: SideBarProps) {
  const stats = getTodoStats(todos)
  const upcomingSubtasks = useUpcomingSubtasks()
  const upcoming = getUpcomingSidebarItems(todos, upcomingSubtasks)

  const select = (next: TodoFilter) => {
    onFilterChange(next)
    onNavigate?.()
  }

  return (
    <AppShell.Navbar bg={'black.8'} withBorder={false} className={'border-black-700 !border-r'}>
      <AppShell.Section px={20} pt={20} pb={16} className={'border-black-800 border-b'}>
        <Flex align={'flex-start'} justify={'space-between'} gap={12}>
          <Logo />
          {/* 모바일 전체화면 네비게이션에는 이 버튼 외에 닫을 방법이 없다 (버거 버튼이 뒤에 가려짐) */}
          <ActionIcon
            hiddenFrom={'sm'}
            variant={'subtle'}
            color={'black.4'}
            onClick={() => onNavigate?.()}
            aria-label={'메뉴 닫기'}
            className={'!-mt-1 !-mr-1'}
          >
            <FontAwesomeIcon icon={faXmark} />
          </ActionIcon>
        </Flex>
      </AppShell.Section>

      {/* 통계 */}
      <AppShell.Section px={20} py={14} className={'border-black-800 border-b'}>
        <Flex justify={'space-between'} gap={8}>
          <StatItem label={'전체'} value={stats.total} color={'var(--black-colors-1)'} />
          <StatItem label={'완료'} value={stats.done} color={'var(--state-done-color)'} />
          <StatItem label={'긴급'} value={stats.urgent} color={'var(--primary-colors-5)'} />
        </Flex>
      </AppShell.Section>

      <AppShell.Section grow={true} component={ScrollArea} px={20} py={14}>
        {/* 마감 임박 순 — 최상위 할일과 하위 작업을 함께 보여준다 */}
        <Stack gap={8}>
          <SectionTitle>마감 임박 순</SectionTitle>
          {upcoming.length === 0 ? (
            <Text size={'11px'} c={'black.5'}>
              마감일이 지정된 할일이 없습니다.
            </Text>
          ) : (
            <Stack gap={4}>
              {upcoming.map((item) => (
                <TodoBriefUI
                  key={`upcoming-${item.kind}-${item.id}`}
                  id={item.id}
                  title={item.title}
                  state={item.state}
                  deadline={item.deadline}
                  parentTitle={item.kind === 'subtask' ? item.parentTitle : undefined}
                  onSelect={onNavigate}
                />
              ))}
            </Stack>
          )}
        </Stack>

        {/* 상태 필터 */}
        <Stack gap={8} mt={16} pt={12} className={'border-black-800 border-t'}>
          <SectionTitle>상태</SectionTitle>
          <Stack gap={2}>
            {TODO_STATE_ORDER.map((state) => (
              <button
                key={state}
                type={'button'}
                onClick={() => select(state)}
                className={`sidebar-item ${filter === state ? 'sidebar-item--active' : ''}`}
              >
                <TodoStateBadgeUI state={state} dotOnly={true} />
                <Text size={'12px'} c={filter === state ? 'black.1' : 'black.4'} className={'flex-1 text-left'}>
                  {TODO_STATE_META[state].label}
                </Text>
                <Text size={'10px'} c={'black.5'} className={'font-mono'}>
                  {countByState(todos, state)}
                </Text>
              </button>
            ))}
          </Stack>
        </Stack>
      </AppShell.Section>

      <AppShell.Section px={20} pt={12} pb={16} className={'border-black-800 border-t'}>
        <Button
          fullWidth={true}
          onClick={() => {
            onAdd()
            onNavigate?.()
          }}
          leftSection={<FontAwesomeIcon icon={faPlus} />}
          className={'font-display !font-bold tracking-wider'}
          classNames={{ root: 'todo-button-primary' }}
        >
          새 할일 추가
        </Button>
      </AppShell.Section>
    </AppShell.Navbar>
  )
}

function StatItem({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <Stack gap={2} align={'center'} className={'flex-1'}>
      <Text className={'font-mono'} size={'20px'} fw={500} style={{ color }}>
        {value}
      </Text>
      <Text size={'9px'} c={'black.5'}>
        {label}
      </Text>
    </Stack>
  )
}

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <Flex align={'center'} gap={6}>
      <span className={'bg-secondary-600 block h-0.5 w-4'} />
      <Text size={'10px'} c={'secondary.6'} className={'font-mono tracking-widest'}>
        {children}
      </Text>
    </Flex>
  )
}
