import { Flex, Text } from '@mantine/core'

/** 사이드바 상단 로고 */
export default function Logo() {
  return (
    <div>
      <Flex align={'center'} gap={10}>
        <Flex align={'center'} justify={'center'} w={28} h={28} className={'bg-primary-600 rounded'}>
          <Text className={'font-display text-secondary-600 font-bold'} size={'14px'}>
            T
          </Text>
        </Flex>
        <Text className={'font-display font-bold tracking-wider'} size={'18px'} c={'black.1'}>
          TODO<span className={'text-secondary-600'}>TODO</span>
        </Text>
      </Flex>
      <div className={'logo-underline mt-2'} />
    </div>
  )
}
