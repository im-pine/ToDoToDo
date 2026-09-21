import { TODO_STATE_META } from '@/components/todo/_core'
import { TodoState } from '@prisma/client'

type TodoStateBadgeUIProps = {
  state: TodoState
  /** 점만 찍고 라벨은 생략 */
  dotOnly?: boolean
  className?: string
}

/** 상태 칩. 색/라벨은 코어의 TODO_STATE_META 단일 출처를 따른다. */
export default function TodoStateBadgeUI({ state, dotOnly = false, className = '' }: TodoStateBadgeUIProps) {
  const { label, color } = TODO_STATE_META[state]

  if (dotOnly) {
    return <span className={`todo-dot ${className}`} style={{ background: color }} aria-label={label} />
  }

  return (
    <span
      className={`todo-chip font-mono ${className}`}
      style={{
        color,
        background: `color-mix(in srgb, ${color} 16%, transparent)`,
        borderColor: `color-mix(in srgb, ${color} 45%, transparent)`,
      }}
    >
      {label}
    </span>
  )
}
