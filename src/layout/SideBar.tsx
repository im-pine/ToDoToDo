'use client'

import TodoListCompactUI from '@/components/todoList/TodoListCompactUI'
import { AppShell, Divider, ScrollArea } from '@mantine/core'
import Logo from '@/layout/Logo'

/** 마감이 임박한 할일만 훑어보는 패널 */
const WITHIN_DAYS = 7

export default function SideBar() {
  return (
    <AppShell.Navbar bg={'black.8'} withBorder={false} p={'sm'}>
      <Logo />
      <Divider my={'md'} color={'black.6'} />
      <ScrollArea type={'hover'} scrollbarSize={6}>
        <TodoListCompactUI withinDays={WITHIN_DAYS} />
      </ScrollArea>
    </AppShell.Navbar>
  )
}
