'use server'

import { NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { toYmd } from '@/lib/date'
import { requireUserId } from '@/lib/auth/session'

type MappingType = 'deadline' | undefined

export async function GET(req: Request) {
  try {
    const userId = await requireUserId()
    if (!userId) return NextResponse.json({ message: 'unauthorized' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const mappingType = (searchParams.get('mappingType') ?? undefined) as MappingType

    // 최상위 할일만 목록에 노출한다. (하위 할일은 children 으로 따라온다)
    const todos = await prisma.todo.findMany({
      where: { parentId: null, userId },
      select: {
        id: true,
        title: true,
        contents: true,
        state: true,
        deadline: true,
        children: {
          select: { id: true, state: true },
          orderBy: { id: 'asc' },
        },
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
    const userId = await requireUserId()
    if (!userId) return NextResponse.json({ message: 'unauthorized' }, { status: 401 })

    const body = await req.json()

    const title = String(body.title ?? '').trim()
    if (!title) {
      return NextResponse.json({ message: 'title is required' }, { status: 400 })
    }

    // userId(관계)와 parentId(자기참조 FK)를 한 create 호출에서 같이 쓰려면 스칼라(unchecked) 입력으로
    // 통일해야 한다 — 관계 스타일(user: {connect})과 스칼라 FK를 섞으면 Prisma가 parentId를 거부한다.
    const data: Prisma.TodoUncheckedCreateInput = {
      title,
      contents: body.contents ?? undefined,
      state: body.state ?? undefined,
      deadline: body.deadline ? new Date(body.deadline) : undefined,
      userId,
      parentId: typeof body.parentId === 'number' ? body.parentId : undefined,
    }

    const created = await prisma.todo.create({ data })

    return NextResponse.json(created, { status: 201 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 })
  }
}
