import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'

// GET /api/progress?uid=xxx
export async function GET(req: NextRequest) {
  const uid = req.nextUrl.searchParams.get('uid')?.trim()
  if (!uid) return NextResponse.json({ error: 'uid required' }, { status: 400 })

  try {
    const snap = await adminDb.collection('users').doc(uid).get()
    if (!snap.exists) {
      return NextResponse.json({ xp: 0, streak: 0, completedLessons: [], unlockedRewards: [], lastPlayedDate: '', isNew: true })
    }
    const p = snap.data()?.progress
    if (!p) {
      return NextResponse.json({ xp: 0, streak: 0, completedLessons: [], unlockedRewards: [], lastPlayedDate: '', isNew: true })
    }
    return NextResponse.json({
      xp:               Number(p.xp)     || 0,
      streak:           Number(p.streak) || 0,
      completedLessons: Array.isArray(p.completedLessons) ? p.completedLessons : [],
      unlockedRewards:  Array.isArray(p.unlockedRewards)  ? p.unlockedRewards  : [],
      lastPlayedDate:   p.lastPlayedDate || '',
      isNew: false,
    })
  } catch (err: any) {
    console.error('GET /api/progress error:', err)
    return NextResponse.json({ xp: 0, streak: 0, completedLessons: [], unlockedRewards: [], lastPlayedDate: '', isNew: true, dbError: true })
  }
}

// POST /api/progress  body: { uid, xp, streak, completedLessons, unlockedRewards, lastPlayedDate }
export async function POST(req: NextRequest) {
  try {
    const { uid, xp, streak, completedLessons, unlockedRewards, lastPlayedDate } = await req.json()
    if (!uid) return NextResponse.json({ error: 'uid required' }, { status: 400 })

    await adminDb.collection('users').doc(uid).set(
      { progress: { xp, streak, completedLessons, unlockedRewards, lastPlayedDate } },
      { merge: true }
    )
    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('POST /api/progress error:', err)
    return NextResponse.json({ success: false, error: err.message })
  }
}
