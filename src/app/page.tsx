'use client'

import { useDisclosure } from '@mantine/hooks'
import { AppShell, Box, Burger, Container, Divider, Input, TextInput, Title } from '@mantine/core'
import Logo from '@/layout/Logo'
import SideBar from '@/layout/SideBar'
import TodoUI from '@/components/todo/TodoUI'
import dummyTodo from '../../public/dummyTodo'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPaperPlane } from '@fortawesome/free-solid-svg-icons'
import TodoSend from '@/components/input/TodoSend'

export default function Home() {
  const [opened, { toggle }] = useDisclosure()

  return (
    <AppShell
      padding={'md'}
      // header={{ height: 60 }}
      navbar={{
        width: 256,
        breakpoint: 'sm',
        collapsed: { mobile: !opened },
      }}
    >
      {/*<AppShell.Header>*/}
      {/*  <Burger*/}
      {/*    opened={opened}*/}
      {/*    onClick={toggle}*/}
      {/*    hiddenFrom="sm"*/}
      {/*    size="sm"*/}
      {/*  />*/}

      {/*  <div>Logo</div>*/}
      {/*</AppShell.Header>*/}
      <SideBar />
      <AppShell.Main bg={'black.7'}>
        <Container size={'768px'} py={'64px'}>
          <Title order={2}>오늘</Title>
          <TodoUI todo={dummyTodo[0]} />
          <TodoUI todo={dummyTodo[1]} />
          <TodoUI todo={dummyTodo[2]} />
          <TodoUI todo={dummyTodo[4]} />
          <Divider color={'black.6'} />
          <Title order={2}>내일</Title>
          <TodoUI todo={dummyTodo[3]} />
          <TodoUI todo={dummyTodo[5]} />
          <Divider color={'black.6'} />
          <TodoSend />
        </Container>
      </AppShell.Main>
    </AppShell>
  )
}
