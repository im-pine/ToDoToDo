'use server'

import { NextResponse } from 'next/server'
import { TodoState } from '@prisma/client'
import { prisma } from '@/lib/prisma'

/**
 * 마감일이 있는 미완료 하위 작업을 깊이에 상관없이 모두 반환한다.
 * parentId 는 자기 관계이므로 depth 와 무관하게 한 번의 평면 쿼리로 모든 조상 레벨을 커버한다.
 * 사이드바 '마감 임박 순' 이 최상위 할일뿐 아니라 하위 작업까지 보여주기 위한 전용 엔드포인트.
 */
export async function GET() {
  try {
    const subtasks = await prisma.todo.findMany({
      where: {
        parentId: { not: null },
        deadline: { not: null },
        state: { not: TodoState.DONE },
      },
      select: {
        id: true,
        title: true,
        state: true,
        deadline: true,
        parent: { select: { id: true, title: true } },
      },
      orderBy: { deadline: 'asc' },
    })

    // parentId 가 not null 이면 parent 는 FK 상 항상 존재하지만, 타입 안전을 위해 방어적으로 걸러낸다.
    const result = subtasks
      .filter((subtask) => subtask.parent !== null)
      .map((subtask) => ({ ...subtask, parent: subtask.parent! }))

    return NextResponse.json(result, { status: 200 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 })
  }
}
