import { NextResponse } from 'next/server'
import { TodoState } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { requireUserId } from '@/lib/auth/session'

/** 로컬스토리지 용량/동기화 payload 크기 보호용 상한 */
const MAX_SYNC_ITEMS = 1000

type LocalTodoInput = {
  localId: number
  parentLocalId: number | null
  title: string
  contents?: string | null
  state?: TodoState
  date?: string | null
  deadline?: string | null
}

class SyncError extends Error {}

export async function POST(req: Request) {
  try {
    const userId = await requireUserId()
    if (!userId) return NextResponse.json({ message: 'unauthorized' }, { status: 401 })

    const body = await req.json()
    const todos: LocalTodoInput[] = Array.isArray(body?.todos) ? body.todos : []

    if (todos.length === 0) {
      return NextResponse.json({ importedCount: 0, idMap: {} }, { status: 200 })
    }

    if (todos.length > MAX_SYNC_ITEMS) {
      return NextResponse.json({ message: `sync payload exceeds ${MAX_SYNC_ITEMS} items` }, { status: 400 })
    }

    for (const item of todos) {
      if (typeof item.localId !== 'number' || !Number.isFinite(item.localId)) {
        return NextResponse.json({ message: 'invalid localId' }, { status: 400 })
      }
      if (item.parentLocalId !== null && typeof item.parentLocalId !== 'number') {
        return NextResponse.json({ message: 'invalid parentLocalId' }, { status: 400 })
      }
      if (!item.title || !item.title.trim()) {
        return NextResponse.json({ message: 'title is required' }, { status: 400 })
      }
      if (item.state !== undefined && !Object.values(TodoState).includes(item.state)) {
        return NextResponse.json({ message: 'invalid state' }, { status: 400 })
      }
    }

    // parentLocalId 기준으로 레벨을 나눠, 부모가 먼저 생성되어야 자식의 parentId를 해석할 수 있게 한다.
    const byParent = new Map<number | null, LocalTodoInput[]>()
    for (const item of todos) {
      const key = item.parentLocalId
      const list = byParent.get(key) ?? []
      list.push(item)
      byParent.set(key, list)
    }

    const localToDbId = new Map<number, number>()

    await prisma.$transaction(async (tx) => {
      let currentLevel = byParent.get(null) ?? []

      while (currentLevel.length > 0) {
        for (const item of currentLevel) {
          // 이 시점에 도달한 항목은 루트이거나, 이미 처리된 부모의 localId로 조회됐으므로 dbParentId가 반드시 존재한다.
          const dbParentId = item.parentLocalId === null ? null : (localToDbId.get(item.parentLocalId) ?? null)

          const created = await tx.todo.create({
            data: {
              title: item.title.trim(),
              contents: item.contents ?? '',
              state: item.state ?? TodoState.PENDING,
              date: item.date ? new Date(item.date) : new Date(),
              deadline: item.deadline ? new Date(item.deadline) : null,
              parentId: dbParentId,
              userId,
            },
          })

          localToDbId.set(item.localId, created.id)
        }

        currentLevel = currentLevel.flatMap((item) => byParent.get(item.localId) ?? [])
      }

      // 루트에서 도달할 수 없던 항목(끊긴 참조/순환)이 있으면 전체 롤백
      if (localToDbId.size !== todos.length) {
        throw new SyncError('unreachable todos in payload (broken parent reference or cycle)')
      }
    })

    return NextResponse.json(
      { importedCount: localToDbId.size, idMap: Object.fromEntries(localToDbId) },
      { status: 200 }
    )
  } catch (err) {
    if (err instanceof SyncError) {
      return NextResponse.json({ message: err.message }, { status: 400 })
    }
    console.error(err)
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 })
  }
}
