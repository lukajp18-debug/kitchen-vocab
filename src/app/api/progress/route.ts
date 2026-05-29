import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@vercel/postgres'

// Ensure the students table exists (auto-creates on first request)
async function ensureTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS students (
      name VARCHAR(255) PRIMARY KEY,
      xp INTEGER DEFAULT 0,
      streak INTEGER DEFAULT 0,
      completed_lessons TEXT DEFAULT '[]',
      unlocked_rewards TEXT DEFAULT '[]',
      last_played_date TEXT DEFAULT '',
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    )
  `
}

// GET /api/progress?name=Santiago — Load progress by name
export async function GET(req: NextRequest) {
  try {
    await ensureTable()
    const name = req.nextUrl.searchParams.get('name')?.trim()
    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    const result = await sql`SELECT * FROM students WHERE name = ${name}`

    if (result.rows.length === 0) {
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

    const student = result.rows[0]
    return NextResponse.json({
      xp: Number(student.xp),
      streak: Number(student.streak),
      completedLessons: JSON.parse(String(student.completed_lessons)),
      unlockedRewards: JSON.parse(String(student.unlocked_rewards)),
      lastPlayedDate: String(student.last_played_date),
      isNew: false,
    })
  } catch (error) {
    console.error('GET /api/progress error:', error)
    // If DB is not configured yet, return empty progress so the app still works
    return NextResponse.json({
      xp: 0,
      streak: 0,
      completedLessons: [],
      unlockedRewards: [],
      lastPlayedDate: '',
      isNew: true,
      dbError: true,
    })
  }
}

// POST /api/progress — Save progress
export async function POST(req: NextRequest) {
  try {
    await ensureTable()
    const body = await req.json()
    const { name, xp, streak, completedLessons, unlockedRewards, lastPlayedDate } = body

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    await sql`
      INSERT INTO students (name, xp, streak, completed_lessons, unlocked_rewards, last_played_date, updated_at)
      VALUES (${name}, ${xp}, ${streak}, ${JSON.stringify(completedLessons)}, ${JSON.stringify(unlockedRewards)}, ${lastPlayedDate}, NOW())
      ON CONFLICT (name)
      DO UPDATE SET
        xp = ${xp},
        streak = ${streak},
        completed_lessons = ${JSON.stringify(completedLessons)},
        unlocked_rewards = ${JSON.stringify(unlockedRewards)},
        last_played_date = ${lastPlayedDate},
        updated_at = NOW()
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('POST /api/progress error:', error)
    // Silent fail - localStorage is the fallback
    return NextResponse.json({ success: false, dbError: true })
  }
}
