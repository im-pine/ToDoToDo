import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const id = Number(params.id)
    if (!Number.isInteger(id)) {
      return NextResponse.json({ message: 'invalid id' }, { status: 400 })
    }

    const todo = await prisma.todo.findUnique({
      where: { id },
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
