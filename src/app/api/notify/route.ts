import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { studentName, parentEmail } = await request.json()

    const token = process.env.TELEGRAM_BOT_TOKEN
    const chatId = process.env.TELEGRAM_CHAT_ID

    if (!token || !chatId) {
      console.warn('Telegram credentials not configured. Skipping notification.')
      return NextResponse.json({ success: true, warning: 'Credentials missing' })
    }

    const text = `🎉 *¡Nuevo Registro en la App!*\n\n👦 *Niño/a:* ${studentName}\n✉️ *Padre:* ${parentEmail}`

    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'Markdown',
      }),
    })

    if (!response.ok) {
      console.error('Telegram API error:', await response.text())
      // We don't throw, we just log it. We don't want to break the user's flow.
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error sending Telegram notification:', error)
    // Always return success so the frontend doesn't crash if Telegram fails
    return NextResponse.json({ success: true, error: 'Failed to send' })
  }
}
