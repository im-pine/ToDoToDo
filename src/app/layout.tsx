import { config } from '@fortawesome/fontawesome-svg-core'
import { ColorSchemeScript, MantineProvider, mantineHtmlProps } from '@mantine/core'
import { Notifications } from '@mantine/notifications'
import type { Metadata } from 'next'
import theme from '@/styles/mantine'
import { ReactNode } from 'react'

import '@fortawesome/fontawesome-svg-core/styles.css'
import '@mantine/core/styles.css'
import '@mantine/notifications/styles.css'
import '../styles/globals.css'
import QueryProvider from '@/app/QueryProvider'
import { AuthProvider } from '@/app/AuthProvider'

config.autoAddCss = false

export const metadata: Metadata = {
  title: 'ToDoToDo',
  description: '마감 임박 순으로 관리하는 다크 테마 할일 관리 서비스',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode
}>) {
  return (
    <html lang={'ko'} {...mantineHtmlProps}>
      <head>
        <ColorSchemeScript defaultColorScheme={'dark'} />
      </head>
      <body>
        <QueryProvider>
          <AuthProvider>
            <MantineProvider theme={theme} defaultColorScheme={'dark'}>
              <Notifications position={'bottom-center'} />
              {children}
            </MantineProvider>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  )
}
