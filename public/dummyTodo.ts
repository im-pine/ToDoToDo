import { TodoState, type Todo } from '@prisma/client'

export const todoDummyData: Todo[] = [
  {
    id: 1,
    parentId: null,
    title: '기술 블로그 글 초안 작성',
    contents: 'ToDo 웹 개발 과정을 정리하고 초안을 작성한다.',
    state: TodoState.IN_PROGRESS,
    date: new Date('2026-01-01T09:00:00'),
    deadline: new Date('2026-01-03T23:59:59'),
  },
  {
    id: 2,
    parentId: null,
    title: '독서 20페이지',
    contents: '자기계발서 또는 기술 서적 읽기',
    state: TodoState.PENDING,
    date: new Date('2026-01-01T10:00:00'),
    deadline: null,
  },
  {
    id: 3,
    parentId: null,
    title: '여행용 가방 점검',
    contents: '충전기, 여권, 세면도구 확인',
    state: TodoState.PENDING,
    date: new Date('2025-12-31T18:00:00'),
    deadline: new Date('2026-01-02T12:00:00'),
  },
  {
    id: 4,
    parentId: null,
    title: '영어 단어 20개 암기',
    contents: '단어장 앱 활용',
    state: TodoState.PENDING,
    date: new Date('2026-01-01T14:00:00'),
    deadline: null,
  },
  {
    id: 5,
    parentId: null,
    title: '아침 8시 기상 후 스트레칭',
    contents: '목, 어깨 위주 스트레칭 10분',
    state: TodoState.DONE,
    date: new Date('2026-01-02T08:00:00'),
    deadline: null,
  },
  {
    id: 6,
    parentId: null,
    title: '취침 전 내일 일정 확인',
    contents: '캘린더 및 할 일 정리',
    state: TodoState.DONE,
    date: new Date('2026-01-02T22:30:00'),
    deadline: new Date('2026-01-02T23:59:59'),
  },
]

export default todoDummyData
