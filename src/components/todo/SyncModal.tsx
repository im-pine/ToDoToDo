'use client'

import { Button, Flex, Modal, Stack, Text } from '@mantine/core'
import { useEffect, useState } from 'react'
import { countLocalTodos } from '@/lib/storage/localTodo'
import { useSyncLocalTodos } from '@/components/todo/useSyncLocalTodos'

type SyncModalProps = {
  opened: boolean
  onClose: () => void
}

type SyncStep = 'confirm' | 'success'

/** 로그인 사용자가 기기(localStorage)의 할일을 계정(DB)으로 마이그레이션하는 최종 동의 모달 */
export default function SyncModal({ opened, onClose }: SyncModalProps) {
  const { sync, pending, error } = useSyncLocalTodos()
  const [step, setStep] = useState<SyncStep>('confirm')
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (opened) {
      setStep('confirm')
      setCount(countLocalTodos())
    }
  }, [opened])

  const handleConfirm = async () => {
    const success = await sync()
    if (success) setStep('success')
  }

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      centered={true}
      size={420}
      withCloseButton={false}
      overlayProps={{ backgroundOpacity: 0.8, blur: 4 }}
      classNames={{ content: 'todo-modal' }}
    >
      {step === 'confirm' ? (
        <Stack gap={16} p={24}>
          <Text className={'font-display font-bold'} size={'18px'} c={'black.1'}>
            기기에 저장된 할일 동기화
          </Text>
          <Text size={'13px'} c={'black.4'}>
            로그인 전 작성한 <b>{count}개</b>의 할일을 불러오시겠습니까?
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
              onClick={onClose}
              disabled={pending}
              className={'font-display flex-1 !font-semibold'}
              classNames={{ root: 'todo-button-ghost' }}
            >
              취소
            </Button>
            <Button
              color={'primary.6'}
              onClick={handleConfirm}
              loading={pending}
              disabled={count === 0}
              className={'font-display !font-bold'}
              style={{ flex: 2 }}
            >
              동의하고 동기화
            </Button>
          </Flex>
        </Stack>
      ) : (
        <Stack gap={16} align={'center'} p={24}>
          <Text className={'font-display font-bold'} size={'16px'} c={'black.1'}>
            동기화가 완료되었습니다
          </Text>
          {error && (
            <Text size={'12px'} c={'primary.4'} ta={'center'}>
              {error}
            </Text>
          )}
          <Button color={'primary.6'} onClick={onClose} className={'font-display !font-bold'}>
            확인
          </Button>
        </Stack>
      )}
    </Modal>
  )
}
