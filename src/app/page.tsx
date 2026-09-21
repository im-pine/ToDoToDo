'use client'

import { filterTodos, PostLoginSyncPrompt, sortTodos, TodoCardUI, TodoFilter, TodoSummary } from '@/components/todo'
import { readTodoList, todoKeys } from '@/lib/api/todoGateway'
import { TodoFormModalUI } from '@/components/todoForm'
import { AppShell, Center, Flex, Loader, Stack, Text } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { useQuery } from '@tanstack/react-query'
import SideBar from '@/layout/SideBar'
import Header from '@/layout/Header'
import { useMemo, useState } from 'react'

export default function Home() {
  const [navOpened, { toggle: toggleNav, close: closeNav }] = useDisclosure()
  const [formOpened, { open: openForm, close: closeForm }] = useDisclosure()
  const [filter, setFilter] = useState<TodoFilter>('ALL')

  const { data, isLoading, isError } = useQuery<TodoSummary[]>({
    queryKey: todoKeys.lists(),
    queryFn: readTodoList,
  })

  const todos = useMemo(() => data ?? [], [data])
  const visibleTodos = useMemo(() => sortTodos(filterTodos(todos, filter)), [todos, filter])

  return (
    <AppShell
      layout={'alt'}
      header={{ height: 72 }}
      navbar={{ width: 260, breakpoint: 'sm', collapsed: { mobile: !navOpened } }}
      bg={'black.9'}
    >
      <SideBar
        todos={todos}
        filter={filter}
        onFilterChange={setFilter}
        onAdd={openForm}
        onNavigate={closeNav}
      />

      <Header
        filter={filter}
        onFilterChange={setFilter}
        count={visibleTodos.length}
        onAdd={openForm}
        navOpened={navOpened}
        onToggleNav={toggleNav}
      />

      <AppShell.Main bg={'black.9'}>
        <Stack gap={8} px={{ base: 16, sm: 24 }} py={20}>
          {isLoading && (
            <Center py={80}>
              <Loader color={'primary.6'} />
            </Center>
          )}

          {isError && (
            <Center py={80}>
              <Text size={'14px'} c={'primary.4'}>
                할일을 불러오지 못했습니다.
              </Text>
            </Center>
          )}

          {!isLoading && !isError && visibleTodos.length === 0 && (
            <Flex direction={'column'} align={'center'} justify={'center'} py={80} c={'black.6'} gap={16}>
              <Text size={'48px'}>◎</Text>
              <Text className={'font-display font-semibold'} size={'16px'}>
                할일이 없습니다
              </Text>
            </Flex>
          )}

          {visibleTodos.map((todo) => (
            <TodoCardUI key={todo.id} todo={todo} />
          ))}
        </Stack>
      </AppShell.Main>

      <TodoFormModalUI opened={formOpened} onClose={closeForm} />
      <PostLoginSyncPrompt />
    </AppShell>
  )
}
