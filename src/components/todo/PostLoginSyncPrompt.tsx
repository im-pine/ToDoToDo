'use client'

import { Button, Flex, Modal, Stack, Text } from '@mantine/core'
import { notifications } from '@mantine/notifications'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { countLocalTodos } from '@/lib/storage/localTodo'
import { useSyncLocalTodos } from '@/components/todo/useSyncLocalTodos'

/**
 * 카카오 로그인 콜백(`/?justLoggedIn=1`)에서 막 돌아왔고, 이 기기에 로그인 전 작성한 할일이
 * 남아있으면 곧바로 "불러올지" 물어본다. isLoggedIn===true 만으로는 "새로고침한 기존 로그인
 * 사용자"와 구분할 수 없어서, 콜백이 명시적으로 붙여준 쿼리 파라미터를 신호로 쓴다.
 */
export default function PostLoginSyncPrompt() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { sync, pending, error } = useSyncLocalTodos()
  const [opened, setOpened] = useState(false)
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (searchParams.get('justLoggedIn') !== '1') return

    // 다시 새로고침해도 프롬프트가 반복되지 않도록 쿼리를 즉시 제거한다
    router.replace('/', { scroll: false })

    const localCount = countLocalTodos()
    if (localCount > 0) {
      setCount(localCount)
      setOpened(true)
    }
  }, [searchParams, router])

  const handleLoad = async () => {
    const success = await sync()
    if (success) {
      setOpened(false)
      notifications.show({ color: 'green', message: '로그인 전 작성했던 할일 목록을 불러왔습니다.' })
    }
  }

  const handleSkip = () => {
    setOpened(false)
    notifications.show({ message: '사이드 메뉴의 "기기 데이터 동기화" 버튼으로 나중에 언제든 불러올 수 있어요.' })
  }

  return (
    <Modal
      opened={opened}
      onClose={handleSkip}
      centered={true}
      size={400}
      withCloseButton={false}
      overlayProps={{ backgroundOpacity: 0.8, blur: 4 }}
      classNames={{ content: 'todo-modal' }}
    >
      <Stack gap={16} p={24}>
        <Text className={'font-display font-bold'} size={'17px'} c={'black.1'}>
          로그인 전 작성했던 할일이 있어요
        </Text>
        <Text size={'13px'} c={'black.4'}>
          이 기기에 <b>{count}개</b>의 할일이 저장되어 있습니다. 로그인 전 작성했던 할일 목록을 불러오시겠습니까?
        </Text>

        {error && (
          <Text size={'12px'} c={'primary.4'}>
            {error}
          </Text>
        )}

        <Flex gap={10} mt={4}>
          <Button
            type={'button'}
            variant={'default'}
            onClick={handleSkip}
            disabled={pending}
            className={'font-display flex-1 !font-semibold'}
            classNames={{ root: 'todo-button-ghost' }}
          >
            나중에
          </Button>
          <Button
            color={'primary.6'}
            onClick={handleLoad}
            loading={pending}
            className={'font-display !font-bold'}
            style={{ flex: 2 }}
          >
            불러오기
          </Button>
        </Flex>
      </Stack>
    </Modal>
  )
}
