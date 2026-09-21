import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { verifySessionToken } from '@/lib/auth/session'
import { AUTH_HINT_COOKIE, SESSION_COOKIE } from '@/lib/auth/constants'

function clearedSession(): NextResponse {
  const response = NextResponse.json({ user: null }, { status: 200 })
  response.cookies.set(SESSION_COOKIE, '', { path: '/', maxAge: 0 })
  response.cookies.set(AUTH_HINT_COOKIE, '', { path: '/', maxAge: 0 })
  return response
}

export async function GET() {
  const store = await cookies()
  const token = store.get(SESSION_COOKIE)?.value
  if (!token) return NextResponse.json({ user: null }, { status: 200 })

  const payload = await verifySessionToken(token)
  if (!payload) return clearedSession()

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: { id: true, nickname: true, profileImage: true },
  })
  if (!user) return clearedSession()

  return NextResponse.json({ user }, { status: 200 })
}
