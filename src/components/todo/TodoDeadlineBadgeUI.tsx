import { getDeadlineMeta } from '@/components/todo/_core'

type TodoDeadlineBadgeUIProps = {
  deadline?: string | Date | null
  /** 'D+2' 대신 'D+2 초과' 처럼 보조 문구까지 노출 */
  verbose?: boolean
  className?: string
}

/** 마감 임박도를 색으로 표현하는 D-day 배지 */
export default function TodoDeadlineBadgeUI({
  deadline,
  verbose = false,
  className = '',
}: TodoDeadlineBadgeUIProps) {
  const meta = getDeadlineMeta(deadline)
  const suffix = verbose && meta.tone === 'over' ? ' 초과' : ''

  return (
    <span className={`font-mono text-[11px] leading-none ${className}`} style={{ color: meta.color }}>
      {meta.label}
      {suffix}
    </span>
  )
}
