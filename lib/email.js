import { Resend } from 'resend'
import { CATEGORIES } from './constants'

const resend = new Resend(process.env.RESEND_API_KEY)

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'noreply@shoutout.com'

export async function sendShoutoutEmail({ recipientEmail, recipientName, senderName, message, category, points }) {
  const categoryInfo = CATEGORIES.find(c => c.value === category)
  const categoryLabel = categoryInfo?.label || category
  const categoryEmoji = categoryInfo?.emoji || '🎉'

  try {
    const { data, error } = await resend.emails.send({
      from: `Shoutout <${FROM_EMAIL}>`,
      to: recipientEmail,
      subject: `${categoryEmoji} You received a Shoutout from ${senderName}!`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc; margin: 0; padding: 40px 20px;">
            <div style="max-width: 480px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <div style="background-color: #6366f1; background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 32px; text-align: center;">
                <div style="font-size: 48px; margin-bottom: 8px;">${categoryEmoji}</div>
                <h1 style="color: #ffffff; margin: 0; font-size: 24px; text-shadow: 0 1px 2px rgba(0,0,0,0.2);">Hey ${recipientName}!</h1>
                <p style="color: #e0e7ff; margin: 8px 0 0; font-size: 16px;">You got a Shoutout!</p>
              </div>
              <div style="padding: 32px;">
                <p style="color: #64748b; margin: 0 0 8px;">From <strong style="color: #1e293b;">${senderName}</strong></p>
                <p style="color: #64748b; margin: 0 0 24px;">Category: <strong style="color: #1e293b;">${categoryLabel}</strong></p>
                <div style="background: #f8fafc; border-left: 4px solid #6366f1; padding: 16px; border-radius: 0 8px 8px 0; margin-bottom: 24px;">
                  <p style="color: #1e293b; margin: 0; font-size: 16px; line-height: 1.6;">"${message}"</p>
                </div>
                <div style="background: #fef3c7; border-radius: 8px; padding: 16px; text-align: center;">
                  <p style="color: #92400e; margin: 0; font-size: 14px;">You earned</p>
                  <p style="color: #78350f; margin: 8px 0 0; font-size: 28px; font-weight: bold;">${points} points</p>
                </div>
              </div>
              <div style="background: #f8fafc; padding: 16px; text-align: center; border-top: 1px solid #e2e8f0;">
                <p style="color: #94a3b8; margin: 0; font-size: 12px;">Sent via Shoutout - Celebrate your team</p>
              </div>
            </div>
          </body>
        </html>
      `,
    })

    if (error) {
      console.error('Error sending shoutout email:', error)
      return { success: false, error }
    }

    return { success: true, data }
  } catch (error) {
    console.error('Error sending shoutout email:', error)
    return { success: false, error }
  }
}
