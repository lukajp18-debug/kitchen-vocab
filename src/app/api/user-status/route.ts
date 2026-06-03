import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'

export async function GET(req: NextRequest) {
  const uid = req.nextUrl.searchParams.get('uid')
  if (!uid) return NextResponse.json({ error: 'Missing uid' }, { status: 400 })

  try {
    const snap = await adminDb.collection('users').doc(uid).get()
    if (!snap.exists) {
      return NextResponse.json({ exists: false })
    }
    const data = snap.data()!
    return NextResponse.json({
      exists: true,
      pendingApproval: data.pendingApproval ?? false,
      onboardingComplete: data.onboardingComplete ?? false,
      studentName: data.studentName ?? '',
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { uid, onboardingComplete, studentName } = await req.json()
    if (!uid) {
      return NextResponse.json({ error: 'Missing uid' }, { status: 400 })
    }

    const updates: any = {}
    if (onboardingComplete !== undefined) updates.onboardingComplete = onboardingComplete
    if (studentName !== undefined) updates.studentName = studentName

    // Fallback if neither was provided, to preserve compatibility
    if (onboardingComplete === undefined && studentName === undefined) {
      updates.onboardingComplete = true
    }

    await adminDb.collection('users').doc(uid).update(updates)

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('Update user status error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
