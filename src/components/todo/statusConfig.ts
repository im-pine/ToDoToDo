import { faSquare, faCircle as faSolidCircle } from '@fortawesome/free-solid-svg-icons'
import { faCircle, faCircleCheck } from '@fortawesome/free-regular-svg-icons'
import { StatusConfig } from '@/components/todo/_core'
import { TodoState } from '@prisma/client'

/**
 * Todo UI 들이 공유하는 기본 상태 표현.
 *
 * 아이콘/색은 표현 계층의 관심사라서 _core 가 아니라 여기에 둔다.
 * (_core 는 StatusConfig 타입만 제공하고, 다른 UI 는 자기만의 config 를 만들어 쓸 수 있다)
 */
export const defaultStatusConfig: StatusConfig = {
  [TodoState.PENDING]: {
    icon: faCircle,
    color: 'black.4',
    label: '대기',
  },
  [TodoState.IN_PROGRESS]: {
    icon: faSolidCircle,
    color: 'blue',
    label: '진행',
  },
  [TodoState.ON_HOLD]: {
    icon: faSquare,
    color: 'yellow',
    label: '보류',
  },
  [TodoState.DONE]: {
    icon: faCircleCheck,
    color: 'green',
    label: '완료',
  },
}

export const statusOrder = [TodoState.PENDING, TodoState.IN_PROGRESS, TodoState.ON_HOLD, TodoState.DONE] as const

export default defaultStatusConfig
