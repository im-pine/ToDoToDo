import { format, isToday, isTomorrow, differenceInCalendarDays, isValid } from 'date-fns'
import { ko } from 'date-fns/locale'

export default function formatDateToKr(date?: string | Date) {
  if (!date) return '미정'

  const parsedDate = typeof date === 'string' ? new Date(date) : date
  if (!isValid(parsedDate)) return '미정'

  const today = new Date()

  if (isToday(date)) return '오늘'
  if (isTomorrow(date)) return '내일'

  const diff = differenceInCalendarDays(date, today)

  if (diff === -1) return '어제'
  if (diff > 1) return `${diff}일 후`
  if (diff < -1) return `${Math.abs(diff)}일 전`

  // 기본 포맷 fallback
  return format(date, 'yyyy-MM-dd', { locale: ko })
}
