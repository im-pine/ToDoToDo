import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireUserId } from '@/lib/auth/session'

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = await requireUserId()
    if (!userId) return NextResponse.json({ message: 'unauthorized' }, { status: 401 })

    const { id: rawId } = await params
    const id = Number(rawId)
    if (!Number.isInteger(id)) {
      return NextResponse.json({ message: 'invalid id' }, { status: 400 })
    }

    const todo = await prisma.todo.findFirst({
      where: { id, userId },
      select: {
        id: true,
        parentId: true,
        title: true,
        contents: true,
        state: true,
        date: true,
        deadline: true,
        children: {
          select: {
            id: true,
            title: true,
            state: true,
          },
          orderBy: { id: 'asc' },
        },
      },
    })

    if (!todo) {
      return NextResponse.json({ message: 'not found' }, { status: 404 })
    }

    return NextResponse.json(todo, { status: 200 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 })
  }
}
