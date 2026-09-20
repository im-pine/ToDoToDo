import { config } from '@fortawesome/fontawesome-svg-core'
import { ColorSchemeScript } from '@mantine/core'
import type { Metadata } from 'next'
import { ReactNode } from 'react'

import '@fortawesome/fontawesome-svg-core/styles.css'
import '@mantine/core/styles.css'
import '../styles/globals.css'
import AppProviders from '@/app/AppProviders'

config.autoAddCss = false

const TITLE = 'ToDoToDo'
export const metadata: Metadata = {
  title: TITLE,
  description: '계층형 할일 관리 서비스',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode
}>) {
  return (
    // ColorSchemeScript가 하이드레이션 전에 html에 data-mantine-color-scheme을 심어서 불일치 경고가 난다
    <html lang={'ko'} suppressHydrationWarning={true}>
      <head>
        <ColorSchemeScript defaultColorScheme={'dark'} />
      </head>
      <body suppressHydrationWarning={true}>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  )
}
