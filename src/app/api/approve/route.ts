import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token')

  if (!token) {
    return new NextResponse(html('❌ Token inválido', 'No se encontró token de aprobación.'), {
      status: 400,
      headers: { 'Content-Type': 'text/html' },
    })
  }

  try {
    // Find user with this approval token
    const snapshot = await adminDb
      .collection('users')
      .where('approvalToken', '==', token)
      .limit(1)
      .get()

    if (snapshot.empty) {
      return new NextResponse(html('❌ Token no válido', 'Este enlace ya fue usado o no existe.'), {
        status: 404,
        headers: { 'Content-Type': 'text/html' },
      })
    }

    const userDoc = snapshot.docs[0]
    const userData = userDoc.data()

    if (!userData.pendingApproval) {
      return new NextResponse(
        html('✅ Ya aprobado', `El usuario ${userData.studentName} (${userData.email}) ya estaba aprobado.`),
        { status: 200, headers: { 'Content-Type': 'text/html' } }
      )
    }

    // Approve the user
    await userDoc.ref.update({
      pendingApproval: false,
      approvedAt: new Date().toISOString(),
    })

    return new NextResponse(
      html(
        '✅ ¡Usuario aprobado!',
        `<strong>${userData.studentName}</strong> (${userData.email}) ya puede ingresar a la app.`
      ),
      { status: 200, headers: { 'Content-Type': 'text/html' } }
    )
  } catch (err) {
    console.error('Approval error:', err)
    return new NextResponse(html('❌ Error', 'Ocurrió un error al aprobar. Intenta de nuevo.'), {
      status: 500,
      headers: { 'Content-Type': 'text/html' },
    })
  }
}

function html(title: string, message: string) {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <style>
    body { font-family: system-ui, sans-serif; display: flex; align-items: center; justify-content: center;
           min-height: 100vh; margin: 0; background: #f7f7f7; }
    .card { background: white; border-radius: 1.5rem; padding: 2.5rem 2rem; max-width: 420px;
            text-align: center; box-shadow: 0 8px 32px rgba(0,0,0,0.1); }
    h1 { font-size: 1.8rem; margin: 0 0 1rem; }
    p { color: #555; font-size: 1rem; line-height: 1.5; }
  </style>
</head>
<body>
  <div class="card">
    <div style="font-size:3.5rem;margin-bottom:1rem">🦉</div>
    <h1>${title}</h1>
    <p>${message}</p>
    <p style="margin-top:1.5rem;font-size:0.85rem;color:#aaa">Study App</p>
  </div>
</body>
</html>`
}
