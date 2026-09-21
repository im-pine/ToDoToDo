import { TodoProgress } from '@/components/todo/_core'

type TodoProgressUIProps = {
  progress: TodoProgress
  /** 'count' 는 2/5, 'percent' 는 40% 를 함께 노출한다 */
  label?: 'none' | 'count' | 'percent'
  title?: string
  height?: number
  className?: string
}

/** 하위 할일 진행률 바 */
export default function TodoProgressUI({
  progress,
  label = 'none',
  title,
  height = 3,
  className = '',
}: TodoProgressUIProps) {
  return (
    <div className={className}>
      {label !== 'none' && (
        <div className={'mb-1.5 flex items-center justify-between gap-2'}>
          <span className={'font-display text-black-500 text-xs font-semibold tracking-widest'}>{title}</span>
          <span className={'text-secondary-600 font-mono text-[11px]'}>
            {label === 'percent' ? `${progress.percent}%` : `${progress.done}/${progress.total}`}
          </span>
        </div>
      )}
      <div className={'todo-progress'} style={{ height }}>
        <div className={'todo-progress-fill'} style={{ width: `${progress.percent}%` }} />
      </div>
    </div>
  )
}
