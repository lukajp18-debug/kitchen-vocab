import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/progress?name=Santiago — Load progress by name
export async function GET(req: NextRequest) {
  const name = req.nextUrl.searchParams.get('name')?.trim()
  if (!name) {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 })
  }

  const student = await db.student.findUnique({ where: { name } })

  if (!student) {
    // Return fresh progress for new student
    return NextResponse.json({
      xp: 0,
      streak: 0,
      completedLessons: [],
      unlockedRewards: [],
      lastPlayedDate: '',
      isNew: true,
    })
  }

  return NextResponse.json({
    xp: student.xp,
    streak: student.streak,
    completedLessons: JSON.parse(student.completedLessons),
    unlockedRewards: JSON.parse(student.unlockedRewards),
    lastPlayedDate: student.lastPlayedDate,
    isNew: false,
  })
}

// POST /api/progress — Save progress
export async function POST(req: NextRequest) {
  const body = await req.json()
  const { name, xp, streak, completedLessons, unlockedRewards, lastPlayedDate } = body

  if (!name) {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 })
  }

  const student = await db.student.upsert({
    where: { name },
    update: {
      xp,
      streak,
      completedLessons: JSON.stringify(completedLessons),
      unlockedRewards: JSON.stringify(unlockedRewards),
      lastPlayedDate,
    },
    create: {
      name,
      xp,
      streak,
      completedLessons: JSON.stringify(completedLessons),
      unlockedRewards: JSON.stringify(unlockedRewards),
      lastPlayedDate,
    },
  })

  return NextResponse.json({ success: true, student: { name: student.name, xp: student.xp } })
}
