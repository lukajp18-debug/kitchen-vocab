'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'
import { signOut } from 'firebase/auth'
import { auth } from '@/lib/firebase'

const ADMIN_EMAIL = 'santragoj@gmail.com'

interface UserRecord {
  uid: string
  studentName?: string
  email: string
  pendingApproval: boolean
  createdAt: string
  approvedAt?: string
  isAdmin?: boolean
}

export default function AdminPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [users, setUsers] = useState<UserRecord[]>([])
  const [fetching, setFetching] = useState(true)

  useEffect(() => {
    if (loading) return
    if (!user || user.email !== ADMIN_EMAIL) {
      router.replace('/landing')
      return
    }
    fetch('/api/admin/users')
      .then(res => res.json())
      .then(data => { setUsers(data.users || []); setFetching(false) })
      .catch(() => setFetching(false))
  }, [user, loading, router])

  const handleLogout = async () => {
    await signOut(auth)
    router.replace('/landing')
  }

  if (loading || fetching) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-5xl animate-bounce">🦉</div>
      </div>
    )
  }

  const students = users.filter(u => !u.isAdmin && u.email !== ADMIN_EMAIL)
  const approved = students.filter(u => !u.pendingApproval).length
  const pending  = students.filter(u =>  u.pendingApproval).length

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-black text-gray-800">🦉 Admin Panel</h1>
            <p className="text-sm text-gray-500 mt-0.5">Study App · {user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="text-sm font-bold text-red-500 hover:text-red-700 border border-red-200 px-4 py-2 rounded-xl transition-colors"
          >
            Cerrar sesión
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 text-center">
            <div className="text-3xl font-black text-indigo-600">{students.length}</div>
            <div className="text-xs text-gray-500 mt-1 font-semibold">Registrados</div>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 text-center">
            <div className="text-3xl font-black text-green-500">{approved}</div>
            <div className="text-xs text-gray-500 mt-1 font-semibold">Aprobados</div>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 text-center">
            <div className="text-3xl font-black text-yellow-500">{pending}</div>
            <div className="text-xs text-gray-500 mt-1 font-semibold">Pendientes</div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-bold text-gray-700">Usuarios Registrados</h2>
            <span className="text-xs text-gray-400 font-semibold">{students.length} total</span>
          </div>

          {students.length === 0 ? (
            <div className="p-10 text-center">
              <div className="text-4xl mb-3">🎓</div>
              <p className="text-gray-400 font-semibold">No hay estudiantes registrados aún.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {students.map((u) => (
                <div key={u.uid} className="px-5 py-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-xl shrink-0">
                      🎓
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-gray-800 text-sm leading-tight">
                        {u.studentName || <span className="text-gray-400 italic">Sin nombre</span>}
                      </p>
                      <p className="text-xs text-gray-400 truncate">{u.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                      u.pendingApproval
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-green-100 text-green-700'
                    }`}>
                      {u.pendingApproval ? '⏳ Pendiente' : '✅ Aprobado'}
                    </span>
                    <span className="text-xs text-gray-400 hidden sm:block">
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString('es-CO') : '—'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
