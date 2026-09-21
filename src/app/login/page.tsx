'use client'

import { Anchor, Button, Center, Checkbox, Stack, Text } from '@mantine/core'
import { useSearchParams } from 'next/navigation'
import { useState } from 'react'
import Logo from '@/layout/Logo'

const ERROR_MESSAGES: Record<string, string> = {
  invalid_state: '로그인 요청이 만료되었거나 유효하지 않습니다. 다시 시도해 주세요.',
  not_configured: '카카오 로그인이 아직 설정되지 않았습니다.',
  token_exchange_failed: '카카오 인증에 실패했습니다.',
  profile_fetch_failed: '카카오 프로필 정보를 가져오지 못했습니다.',
  unexpected_error: '알 수 없는 오류가 발생했습니다.',
}

export default function LoginPage() {
  const searchParams = useSearchParams()
  const errorCode = searchParams.get('error')
  const [remember, setRemember] = useState(true)

  const loginHref = `/api/auth/kakao/login${remember ? '?remember=1' : ''}`

  return (
    <Center mih={'100vh'} bg={'black.9'} px={16}>
      <Stack align={'center'} gap={28} w={320}>
        <Logo />

        <Stack gap={4} align={'center'}>
          <Text className={'font-display font-bold'} size={'18px'} c={'black.1'}>
            카카오로 로그인
          </Text>
          <Text size={'12px'} c={'black.5'} ta={'center'}>
            로그인하면 할일이 이 기기가 아닌 계정에 안전하게 저장됩니다.
          </Text>
        </Stack>

        {errorCode && (
          <Text size={'12px'} c={'primary.4'} ta={'center'}>
            {ERROR_MESSAGES[errorCode] ?? '로그인 중 오류가 발생했습니다.'}
          </Text>
        )}

        <Stack gap={16} w={'100%'}>
          <Checkbox
            label={'자동 로그인 유지 (7일)'}
            checked={remember}
            onChange={(event) => setRemember(event.currentTarget.checked)}
            color={'primary.6'}
            styles={{ label: { fontSize: 12, color: 'var(--black-colors-4)' } }}
          />

          <Button
            component={'a'}
            href={loginHref}
            fullWidth={true}
            color={'yellow'}
            className={'font-display !font-bold'}
            styles={{ root: { backgroundColor: '#FEE500', color: '#191600' } }}
          >
            카카오 간편로그인
          </Button>

          <Anchor href={'/'} size={'12px'} c={'black.5'} ta={'center'}>
            로그인 없이 계속하기
          </Anchor>
        </Stack>

        <Text size={'10px'} c={'black.6'} ta={'center'}>
          로그인 시 카카오 계정의 닉네임·프로필 사진을 서비스 제공 목적으로 저장합니다.
        </Text>
      </Stack>
    </Center>
  )
}
