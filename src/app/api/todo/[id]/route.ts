'use server'

import { NextResponse } from 'next/server'
import { TodoState } from '@prisma/client'
import { prisma } from '@/lib/prisma'

async function getChildrenIds(rootId: number): Promise<number[]> {
  const descendants: number[] = []
  let frontier: number[] = [rootId]

  while (frontier.length > 0) {
    const children = await prisma.todo.findMany({
      where: { parentId: { in: frontier } },
      select: { id: true },
    })

    const childIds = children.map((c) => c.id)
    if (childIds.length === 0) break

    descendants.push(...childIds)
    frontier = childIds
  }

  return descendants
}

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
        title: true,
        state: true,
        deadline: true,
      },
    })

    if (!todo) {
      return NextResponse.json({ message: 'not found' }, { status: 404 })
    }

    return NextResponse.json(todo, { status: 200 })
  } catch (err) {
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 })
  }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const id = Number(params.id)
    if (!Number.isInteger(id)) {
      return NextResponse.json({ message: 'invalid id' }, { status: 400 })
    }

    const body = await req.json()

    const data: Record<string, unknown> = {}

    if (body.title !== undefined) {
      const title = String(body.title).trim()
      if (!title) return NextResponse.json({ message: 'title is invalid' }, { status: 400 })
      data.title = title
    }

    if (body.contents !== undefined) {
      data.contents = String(body.contents ?? '')
    }

    if (body.state !== undefined) {
      if (!Object.values(TodoState).includes(body.state))
        return NextResponse.json({ message: 'state is invalid' }, { status: 400 })
      data.state = body.state
    }

    if (body.deadline !== undefined) {
      data.deadline = body.deadline ? new Date(body.deadline) : null
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ message: 'nothing to update' }, { status: 400 })
    }

    const updated = await prisma.todo.update({ where: { id }, data })

    return NextResponse.json(updated, { status: 200 })
  } catch (err: any) {
    console.error(err)
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 })
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    const id = Number(params.id)
    if (!Number.isInteger(id)) {
      return NextResponse.json({ message: 'invalid id' }, { status: 400 })
    }

    const descendantIds = await getChildrenIds(id)

    await prisma.$transaction(async (tx) => {
      if (descendantIds.length > 0) {
        await tx.todo.deleteMany({
          where: { id: { in: descendantIds } },
        })
      }

      await tx.todo.delete({
        where: { id },
      })
    })

    return NextResponse.json({ deletedId: id, deletedDescendantsCount: descendantIds.length }, { status: 200 })
  } catch (err: any) {
    console.error(err)
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 })
  }
}
