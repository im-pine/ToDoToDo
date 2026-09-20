'use client'

import { TodoModalStateProvider } from '@/components/todoModal/_core'
import TodoModalUI from '@/components/todoModal/TodoModalUI'
import QueryProvider from '@/app/QueryProvider'
import { MantineProvider } from '@mantine/core'
import theme from '@/styles/mantine'
import { ReactNode } from 'react'

export default function AppProviders({ children }: { children: ReactNode }) {
  return (
    <QueryProvider>
      <MantineProvider theme={theme} defaultColorScheme={'dark'}>
        <TodoModalStateProvider>
          {children}
          {/* 모달은 앱 전체에 하나만 존재한다. 목록 행은 useTodoModal().open(id) 만 호출한다. */}
          <TodoModalUI />
        </TodoModalStateProvider>
      </MantineProvider>
    </QueryProvider>
  )
}
