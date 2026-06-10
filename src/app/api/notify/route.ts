import { NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

export async function POST(request: Request) {
  try {
    const { studentName, parentEmail, approvalToken, appUrl } = await request.json()

    // ── Telegram ──────────────────────────────────────────────────────────────
    const tgToken = process.env.TELEGRAM_BOT_TOKEN
    const chatId  = process.env.TELEGRAM_CHAT_ID

    if (tgToken && chatId) {
      const approveLink = approvalToken ? `${appUrl}/api/approve?token=${approvalToken}` : null
      const isHttps = appUrl?.startsWith('https://')

      // Plain-text link (Markdown links to localhost don't render in Telegram;
      // plain text is always visible and copyable)
      const tgText = approveLink
        ? `🎉 ¡Nuevo Registro en Study App!\n\n👦 Niño/a: ${studentName}\n✉️ Padre: ${parentEmail}\n\n👉 Aprobar acceso:\n${approveLink}\n\nO entra al panel de admin:\n${appUrl}/admin`
        : `🎉 ¡Nuevo Registro en Study App!\n\n👦 Niño/a: ${studentName}\n✉️ Padre: ${parentEmail}`

      const body: any = {
        chat_id: chatId,
        text: tgText,
      }

      // Inline button only works with https (production)
      if (approveLink && isHttps) {
        body.reply_markup = {
          inline_keyboard: [[{ text: '✅ Aprobar acceso', url: approveLink }]],
        }
      }

      const tgRes = await fetch(`https://api.telegram.org/bot${tgToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const tgData = await tgRes.json()
      if (!tgData.ok) console.error('Telegram error:', tgData)
    }

    // ── Email al admin ─────────────────────────────────────────────────────────
    const gmailUser = process.env.GMAIL_USER
    const gmailPass = process.env.GMAIL_APP_PASSWORD
    const adminEmail = process.env.ADMIN_EMAIL || gmailUser

    if (gmailUser && gmailPass && adminEmail && approvalToken) {
      const approveLink = `${appUrl}/api/approve?token=${approvalToken}`

      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { user: gmailUser, pass: gmailPass },
      })

      await transporter.sendMail({
        from: `"Study App 🦉" <${gmailUser}>`,
        to: adminEmail,
        subject: `✅ Aprobar nuevo registro — ${studentName}`,
        html: `
          <div style="font-family:system-ui,sans-serif;max-width:480px;margin:auto;padding:2rem">
            <div style="text-align:center;font-size:3rem;margin-bottom:1rem">🦉</div>
            <h2 style="text-align:center;color:#1e293b">¡Nuevo Registro en Study App!</h2>
            <div style="background:#f8fafc;border-radius:1rem;padding:1.5rem;margin:1.5rem 0;border:1px solid #e2e8f0">
              <p style="margin:0 0 0.5rem"><strong>👦 Niño/a:</strong> ${studentName}</p>
              <p style="margin:0"><strong>✉️ Correo padre:</strong> ${parentEmail}</p>
            </div>
            <div style="text-align:center;margin-top:2rem">
              <a href="${approveLink}"
                 style="display:inline-block;background:#16a34a;color:white;font-weight:700;
                        font-size:1.1rem;padding:1rem 2rem;border-radius:999px;
                        text-decoration:none">
                ✅ Aprobar acceso
              </a>
            </div>
            <p style="text-align:center;margin-top:1.5rem;font-size:0.8rem;color:#94a3b8">
              Si no reconoces este registro, simplemente ignora este correo.
            </p>
          </div>
        `,
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error sending notification:', error)
    return NextResponse.json({ success: true, error: 'Failed to send' })
  }
}
