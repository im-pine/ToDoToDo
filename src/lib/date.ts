/** 로컬 타임존 기준 YYYY-MM-DD. DB 라우트와 로컬스토리지 모듈이 동일한 날짜별 그룹핑 키를 쓰기 위해 공유한다. */
export function toYmd(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}
