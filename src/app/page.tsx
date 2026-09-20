'use client'

import TodoListUI from '@/components/todoList/TodoListUI'
import TodoSendUI from '@/components/todoSend/TodoSendUI'
import { AppShell, Container } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import SideBar from '@/layout/SideBar'

export default function Home() {
  const [opened] = useDisclosure()

  return (
    <AppShell padding={'md'} navbar={{ width: 256, breakpoint: 'sm', collapsed: { mobile: !opened } }}>
      <SideBar />
      <AppShell.Main bg={'black.7'}>
        <Container size={'768px'} py={'64px'} h={'94dvh'} className={'relative h-full'}>
          <TodoListUI />
          <TodoSendUI />
        </Container>
      </AppShell.Main>
    </AppShell>
  )
}
