'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { auth, db } from '@/lib/firebase'
import { doc, getDoc } from 'firebase/firestore'
import { signOut } from 'firebase/auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useI18n } from '@/components/I18nProvider'

export default function PendingApprovalPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const user = auth.currentUser
  const { lang } = useI18n()

  const token = searchParams.get('token')
  const isLocalhost = typeof window !== 'undefined' && window.location.hostname === 'localhost'
  const approveUrl = token ? `${typeof window !== 'undefined' ? window.location.origin : ''}/api/approve?token=${token}` : null

  useEffect(() => {
    if (!user) {
      router.push('/auth')
      return
    }

    const interval = setInterval(async () => {
      try {
        const snap = await getDoc(doc(db, 'users', user.uid))
        const data = snap.data()
        if (data && !data.pendingApproval) {
          clearInterval(interval)
          router.push('/onboarding')
        }
      } catch {
        // silent
      }
    }, 3000)

    return () => clearInterval(interval)
  }, [user, router])

  const handleSignOut = async () => {
    await signOut(auth)
    router.push('/auth')
  }

  return (
    <div className="min-h-screen bg-[#F7F7F7] flex flex-col items-center justify-center p-4">
      <div className="text-center mb-8">
        <div className="text-6xl mb-4 animate-bounce-custom">🦉</div>
        <h1 className="text-3xl font-bold text-gray-800">
          {lang === 'es' ? '¡Ya casi!' : 'Almost there!'}
        </h1>
      </div>

      <Card className="w-full max-w-md border-0 shadow-lg">
        <CardContent className="p-8 text-center">
          <div className="text-5xl mb-5 animate-pulse">⏳</div>
          <h2 className="text-xl font-bold text-gray-800 mb-3">
            {lang === 'es' ? 'Esperando aprobación' : 'Waiting for approval'}
          </h2>
          <p className="text-gray-500 mb-4 leading-relaxed text-sm">
            {lang === 'es'
              ? 'Tu registro fue enviado al administrador. Esta página se actualiza sola cuando seas aprobado.'
              : 'Your registration was sent to the administrator. This page updates automatically when approved.'}
          </p>

          {/* Dev mode: show direct approve link on localhost */}
          {isLocalhost && approveUrl && (
            <div className="mb-6 p-4 bg-amber-50 border-2 border-amber-300 rounded-2xl text-left">
              <p className="text-xs font-black text-amber-700 mb-2">🔧 MODO LOCAL — Enlace de aprobación:</p>
              <a
                href={approveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full text-center bg-green-500 hover:bg-green-600 text-white font-black text-sm py-3 px-4 rounded-xl transition-all"
              >
                ✅ Aprobar este registro
              </a>
              <p className="text-[10px] text-amber-600 mt-2 text-center">
                En producción este link llega por Telegram
              </p>
            </div>
          )}

          <div className="flex items-center justify-center gap-2 text-indigo-500 font-semibold text-sm mb-6">
            <span className="w-2 h-2 bg-indigo-400 rounded-full animate-ping" />
            {lang === 'es' ? 'Revisando estado...' : 'Checking status...'}
          </div>

          <Button
            onClick={handleSignOut}
            variant="outline"
            className="w-full font-bold py-5 rounded-2xl text-gray-500 hover:text-gray-700"
          >
            {lang === 'es' ? 'Volver al inicio' : 'Back to login'}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
