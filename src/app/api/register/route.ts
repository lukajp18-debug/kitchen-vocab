import { NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'

const ADMIN_EMAIL = 'santragoj@gmail.com'

export async function POST(req: Request) {
  try {
    const { uid, studentName, email, approvalToken } = await req.json()

    if (!uid || !studentName || !email || !approvalToken) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    const isAdmin = email.toLowerCase() === ADMIN_EMAIL.toLowerCase()

    await adminDb.collection('users').doc(uid).set({
      studentName,
      email,
      createdAt: new Date().toISOString(),
      onboardingComplete: false,
      pendingApproval: !isAdmin,
      approvalToken,
      ...(isAdmin && { approvedAt: new Date().toISOString(), isAdmin: true }),
    })

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('Register error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
