'use client'

import { faCalendarDays, faChevronDown, faChevronUp, faEllipsis, faTrash, faXmark } from '@fortawesome/free-solid-svg-icons'
import { ActionIcon, Box, Divider, Flex, Menu, Modal, Stack, Text, Textarea } from '@mantine/core'
import defaultStatusConfig, { statusOrder } from '@/components/todo/statusConfig'
import { useTodoModalCore } from '@/components/todoModal/_core'
import InlineTodoSend from '@/components/todoSend/TodoSendInlineUI'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { ChildSummary } from '@/components/todo/_core'
// 마감일 숨김에 맞춰 함께 비활성화: import formatDateToKr from '@/lib/formatDateToKr'
import { TodoState } from '@prisma/client'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'

function ChildRow({ child, onEnter }: { child: ChildSummary; onEnter: (id: number) => void }) {
  const { icon, color } = defaultStatusConfig[child.state]
  const cancelLine = child.state === TodoState.DONE ? 'line-through' : ''

  return (
    <Flex
      align={'center'}
      gap={12}
      py={14}
      c={color}
      className={'cursor-pointer border-t border-t-black-600 transition-colors hover:bg-black-700'}
      onClick={() => onEnter(child.id)}
    >
      <FontAwesomeIcon icon={icon} />
      <Text c={'black.1'} td={cancelLine}>
        {child.title}
      </Text>
    </Flex>
  )
}

function SidePanelField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <Box>
      <Text fw={700} size={'sm'} c={'black.0'} mb={8}>
        {label}
      </Text>
      {children}
    </Box>
  )
}

export default function TodoModalUI() {
  const {
    opened,
    detail,
    children,
    doneCount,
    canGoBack,
    canGoForward,
    goBack,
    goForward,
    close,
    enterChild,
    changeState,
    toggleDone,
    saveContents,
    changeDate,
    remove,
  } = useTodoModalCore()

  const status = detail ? defaultStatusConfig[detail.state] : null
  const cancelLine = detail?.state === TodoState.DONE ? 'line-through' : ''

  return (
    <Modal
      opened={opened}
      onClose={close}
      size={'880px'}
      withCloseButton={false}
      padding={0}
      classNames={{ body: '!bg-black-800 !p-0', content: '!bg-black-800' }}
    >
      {/* 헤더: 탐색/메뉴/닫기 */}
      <Flex justify={'flex-end'} align={'center'} gap={4} px={16} py={10} className={'bg-black-700'}>
        <ActionIcon
          variant={'subtle'}
          color={'black.1'}
          disabled={!canGoBack}
          onClick={goBack}
          aria-label={'상위 작업으로'}
          title={'상위 작업으로'}
        >
          <FontAwesomeIcon icon={faChevronUp} />
        </ActionIcon>
        <ActionIcon
          variant={'subtle'}
          color={'black.1'}
          disabled={!canGoForward}
          onClick={goForward}
          aria-label={'하위 작업으로'}
          title={'하위 작업으로'}
        >
          <FontAwesomeIcon icon={faChevronDown} />
        </ActionIcon>

        <Menu position={'bottom-end'} withinPortal={true}>
          <Menu.Target>
            <ActionIcon variant={'subtle'} color={'black.1'} aria-label={'더보기'}>
              <FontAwesomeIcon icon={faEllipsis} />
            </ActionIcon>
          </Menu.Target>
          <Menu.Dropdown className={'!border-black-600 !bg-black-800'}>
            <Menu.Item
              color={'primary.5'}
              leftSection={<FontAwesomeIcon icon={faTrash} size={'sm'} />}
              onClick={() => {
                if (confirm('하위 작업까지 모두 삭제됩니다. 삭제할까요?')) remove()
              }}
            >
              삭제
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>

        <ActionIcon variant={'subtle'} color={'black.1'} onClick={close} aria-label={'닫기'}>
          <FontAwesomeIcon icon={faXmark} size={'lg'} />
        </ActionIcon>
      </Flex>

      {detail && status && (
        <Flex align={'stretch'} mih={'520px'}>
          {/* 본문 */}
          <Stack w={'100%'} px={32} py={28} gap={0}>
            <Flex align={'center'} gap={14} c={status.color}>
              <FontAwesomeIcon
                icon={status.icon}
                size={'lg'}
                className={'cursor-pointer'}
                title={status.label}
                onClick={toggleDone}
              />
              <Text fz={'28px'} fw={700} c={'black.0'} td={cancelLine}>
                {detail.title}
              </Text>
            </Flex>

            <Textarea
              mt={18}
              autosize={true}
              minRows={2}
              variant={'unstyled'}
              defaultValue={detail.contents ?? ''}
              key={detail.id}
              placeholder={'상세 내용을 입력해 주세요.'}
              classNames={{ input: '!text-black-2 !px-0 !text-[16px] !leading-7' }}
              onBlur={(e) => saveContents(e.currentTarget.value)}
            />

            <Flex align={'center'} gap={10} mt={26} mb={4}>
              <FontAwesomeIcon icon={faChevronDown} size={'sm'} color={'var(--black-colors-1)'} />
              <Text fw={700} c={'black.0'}>
                하위 작업
              </Text>
              <Text size={'sm'} c={'black.4'}>
                {`${doneCount}/${children.length}`}
              </Text>
            </Flex>

            <Box>
              {children.map((child) => (
                <ChildRow key={child.id} child={child} onEnter={enterChild} />
              ))}
              <Box className={'border-t border-t-black-600'}>
                <InlineTodoSend parentId={detail.id} />
              </Box>
            </Box>
          </Stack>

          {/* 우측 속성 패널 */}
          <Stack w={'260px'} miw={'260px'} px={24} py={28} gap={22} className={'bg-black-700'}>
            <SidePanelField label={'상태'}>
              <Menu position={'bottom-start'} withinPortal={true}>
                <Menu.Target>
                  <Flex
                    align={'center'}
                    gap={10}
                    pb={8}
                    c={status.color}
                    className={'cursor-pointer border-b border-b-black-600'}
                  >
                    <FontAwesomeIcon icon={status.icon} size={'sm'} />
                    <Text size={'sm'}>{status.label}</Text>
                  </Flex>
                </Menu.Target>
                <Menu.Dropdown className={'!border-black-600 !bg-black-800'}>
                  {statusOrder.map((state) => (
                    <Menu.Item
                      key={state}
                      color={defaultStatusConfig[state].color}
                      onClick={() => changeState(state)}
                      leftSection={<FontAwesomeIcon icon={defaultStatusConfig[state].icon} size={'sm'} />}
                    >
                      {defaultStatusConfig[state].label}
                    </Menu.Item>
                  ))}
                </Menu.Dropdown>
              </Menu>
            </SidePanelField>

            <SidePanelField label={'날짜'}>
              <Flex
                component={'label'}
                align={'center'}
                gap={10}
                pb={8}
                className={'cursor-pointer border-b border-b-black-600'}
              >
                <FontAwesomeIcon icon={faCalendarDays} color={'var(--black-colors-3)'} size={'sm'} />
                <Text
                  component={'input'}
                  type={'date'}
                  key={detail.id}
                  defaultValue={format(new Date(detail.date), 'yyyy-MM-dd')}
                  onChange={(e) => {
                    if (!e.currentTarget.value) return
                    changeDate(new Date(e.currentTarget.value))
                  }}
                  size={'sm'}
                  c={'black.2'}
                  className={'w-full cursor-pointer border-none bg-transparent outline-none [color-scheme:dark]'}
                />
              </Flex>
            </SidePanelField>

            {/* 마감일: 당분간 숨김
            <SidePanelField label={'마감일'}>
              <Text size={'sm'} c={'black.2'}>
                {formatDateToKr(detail.deadline ?? undefined)}
              </Text>
            </SidePanelField>
            */}

            <Divider color={'black.6'} />

            <Text size={'xs'} c={'black.5'}>
              {canGoBack ? '위 화살표로 상위 작업으로 돌아갑니다.' : '하위 작업을 눌러 더 들어갈 수 있습니다.'}
            </Text>
          </Stack>
        </Flex>
      )}
    </Modal>
  )
}
