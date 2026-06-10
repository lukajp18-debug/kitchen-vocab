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
      rewardsType: data.rewardsType ?? null,
      customRewards: data.customRewards ?? [],
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { uid, onboardingComplete, studentName, rewardsType, customRewards } = await req.json()
    if (!uid) {
      return NextResponse.json({ error: 'Missing uid' }, { status: 400 })
    }

    const updates: any = {}
    if (onboardingComplete !== undefined) updates.onboardingComplete = onboardingComplete
    if (studentName !== undefined) updates.studentName = studentName
    if (rewardsType !== undefined) updates.rewardsType = rewardsType
    if (customRewards !== undefined) updates.customRewards = customRewards

    // Fallback if nothing was provided, to preserve compatibility
    if (Object.keys(updates).length === 0) {
      updates.onboardingComplete = true
    }

    // set(merge) so it works even if the user document does not exist yet
    // (update() rejects on a missing document).
    await adminDb.collection('users').doc(uid).set(updates, { merge: true })

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('Update user status error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
