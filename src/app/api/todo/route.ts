'use server'

import { NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'

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
