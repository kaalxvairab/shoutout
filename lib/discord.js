import { CATEGORIES } from './constants'

const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL

/**
 * Send a shoutout notification to Discord
 */
export async function sendDiscordNotification({ senderName, recipientName, message, category, points }) {
  if (!DISCORD_WEBHOOK_URL) {
    return { success: false, error: 'Discord webhook URL not configured' }
  }

  const categoryInfo = CATEGORIES.find(c => c.value === category)
  const categoryEmoji = categoryInfo?.emoji || '🎉'
  const categoryLabel = categoryInfo?.label || category

  try {
    const response = await fetch(DISCORD_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        embeds: [{
          title: `${categoryEmoji} New Shoutout!`,
          description: `**${senderName}** recognized **${recipientName}** for **${categoryLabel}**`,
          color: 0x6366f1, // Indigo color
          fields: [
            {
              name: 'Message',
              value: `"${message}"`,
            },
            {
              name: 'Points Awarded',
              value: `${points} pts`,
              inline: true,
            },
          ],
          footer: {
            text: 'Shoutout - Celebrate your team',
          },
          timestamp: new Date().toISOString(),
        }],
      }),
    })

    if (!response.ok) {
      console.error('Discord webhook failed:', response.status)
      return { success: false, error: `Discord returned ${response.status}` }
    }

    return { success: true }
  } catch (error) {
    console.error('Error sending Discord notification:', error)
    return { success: false, error }
  }
}
