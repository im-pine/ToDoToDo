'use server'

import { NextResponse } from 'next/server'
import { Prisma, TodoState } from '@prisma/client'
import { prisma } from '@/lib/prisma'

type MappingType = 'deadline' | undefined

const toYmd = (date: Date): string => {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const mappingType = (searchParams.get('mappingType') ?? undefined) as MappingType

    const todos = await prisma.todo.findMany({
      where: {
        state: { in: [TodoState.PENDING, TodoState.IN_PROGRESS, TodoState.DONE] },
      },
      select: {
        id: true,
        title: true,
        state: true,
        deadline: true,
      },
      orderBy: [{ deadline: 'asc' }, { id: 'asc' }],
    })

    if (!mappingType) {
      return NextResponse.json(todos, { status: 200 })
    }

    if (mappingType !== 'deadline') {
      return NextResponse.json({ message: 'invalid mappingType' }, { status: 400 })
    }

    const grouped: Record<string, typeof todos> = {}

    for (const t of todos) {
      const key = t.deadline ? toYmd(new Date(t.deadline)) : 'null'
      ;(grouped[key] ??= []).push(t)
    }

    return NextResponse.json(grouped, { status: 200 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const title = String(body.title ?? '').trim()
    if (!title) {
      return NextResponse.json({ message: 'title is required' }, { status: 400 })
    }

    const data: Prisma.TodoCreateInput = {
      title,
      contents: body.contents ?? undefined,
      state: body.state ?? undefined,
      deadline: body.deadline ? new Date(body.deadline) : undefined,
    }

    ;(data as any).parentId = typeof body.parentId === 'number' ? body.parentId : undefined

    const created = await prisma.todo.create({ data })

    return NextResponse.json(created, { status: 201 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 })
  }
}
