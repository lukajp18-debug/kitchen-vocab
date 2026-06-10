import { NextResponse } from 'next/server'
import { adminDb, adminAuth } from '@/lib/firebase-admin'

// TEMPORARY diagnostic endpoint — compares Firebase Auth vs Firestore.
// Delete this file once the user/data sync is confirmed working.
export async function GET() {
  try {
    // List Auth accounts
    const authList = await adminAuth.listUsers(100)
    const authUsers = authList.users.map(u => ({
      uid: u.uid,
      email: u.email,
      created: u.metadata.creationTime,
    }))

    // List Firestore profile docs
    const snap = await adminDb.collection('users').get()
    const firestoreUsers = snap.docs.map(d => ({
      uid: d.id,
      email: d.data().email,
      studentName: d.data().studentName,
      pendingApproval: d.data().pendingApproval,
      hasCustomRewards: Array.isArray(d.data().customRewards) && d.data().customRewards.length > 0,
    }))

    return NextResponse.json({
      authCount: authUsers.length,
      firestoreCount: firestoreUsers.length,
      authUsers,
      firestoreUsers,
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message, code: err.code }, { status: 500 })
  }
}
