import { NextRequest, NextResponse } from 'next/server'
import { adminDb, adminAuth } from '@/lib/firebase-admin'

export async function GET() {
  try {
    const snapshot = await adminDb.collection('users').get()
    const users = snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() }))
    return NextResponse.json({ users })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// Approve (or revoke) a user from the admin panel
export async function POST(req: NextRequest) {
  try {
    const { uid, approve } = await req.json()
    if (!uid) {
      return NextResponse.json({ error: 'Missing uid' }, { status: 400 })
    }
    const updates: Record<string, any> = approve === false
      ? { pendingApproval: true, approvedAt: null }
      : { pendingApproval: false, approvedAt: new Date().toISOString() }
    await adminDb.collection('users').doc(uid).update(updates)
    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// Delete a user from BOTH Firebase Authentication and Firestore.
// Keeps the two systems in sync — no orphaned profile documents.
export async function DELETE(req: NextRequest) {
  try {
    const { uid } = await req.json()
    if (!uid) {
      return NextResponse.json({ error: 'Missing uid' }, { status: 400 })
    }

    // Delete the Auth account (ignore "user not found" — it may already be gone)
    try {
      await adminAuth.deleteUser(uid)
    } catch (err: any) {
      if (err.code !== 'auth/user-not-found') throw err
    }

    // Delete the Firestore profile + progress docs
    await adminDb.collection('users').doc(uid).delete()
    await adminDb.collection('progress').doc(uid).delete().catch(() => {})

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
