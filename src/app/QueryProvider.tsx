'use client'

import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from '@/lib/queryClient'
import { ReactNode } from 'react'

export default function QueryProvider({ children }: { children: ReactNode }) {
  // core 클래스(@/lib/api/todo)가 훅 없이 같은 캐시를 무효화해야 하므로 싱글턴을 공유한다
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}
