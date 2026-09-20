'use client'

import { AppShell, Box, Container, Divider, Stack, Title } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import TodoSend from '@/components/input/TodoSend'
import TodoUI from '@/components/todo/TodoUI'
import SideBar from '@/layout/SideBar'
import { useQuery } from '@tanstack/react-query'
import { fetcher } from '@/lib/fetcher'
import { TodoSummary } from '@/components/todo/_core'
import formatDateToKr from '@/lib/formatDateToKr'

type TodoMappingData = Record<string, TodoSummary[]>

export default function Home() {
  const [opened, { toggle }] = useDisclosure()
  const { data, isLoading, error } = useQuery<TodoMappingData>({
    queryKey: ['todo'],
    queryFn: () => fetcher<TodoMappingData>('/api/todo?mappingType=deadline'),
  })
  console.log(data)
  // if (isLoading) return null
  // if (error) return null
  return (
    <AppShell padding={'md'} navbar={{ width: 256, breakpoint: 'sm', collapsed: { mobile: !opened } }}>
      <SideBar />
      <AppShell.Main bg={'black.7'}>
        <Container size={'768px'} py={'64px'} h={'94dvh'} className={'relative h-full'}>
          {data &&
            Object.entries(data).map(([key, value]) => (
              <Stack key={key} gap={20}>
                <Title order={2}>{formatDateToKr(key)}</Title>
                <Stack gap={4}>
                  {value.map((todo) => (
                    <TodoUI key={todo.id} todo={todo} />
                  ))}
                </Stack>
                <Divider color={'black.6'} />
              </Stack>
            ))}
          <TodoSend />
        </Container>
      </AppShell.Main>
    </AppShell>
  )
}
