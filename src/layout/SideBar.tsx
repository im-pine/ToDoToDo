import { AppShell, Divider } from '@mantine/core'
import Logo from '@/layout/Logo'
import TodoUI from '@/components/todo/TodoUI'
import dummyTodo from '../../public/dummyTodo'

export default function SideBar() {
  return (
    <AppShell.Navbar bg={'black.8'} withBorder={false} p={'sm'}>
      <Logo />
      <Divider my="md" color={'black.6'} />
      {dummyTodo.map((todo) => (
        <TodoUI todo={todo} key={`side-todo-${todo.id}`} />
      ))}
    </AppShell.Navbar>
  )
}
