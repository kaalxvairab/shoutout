/**
 * Badge awarding logic
 * Checks criteria and awards badges to users
 */

// Badge names (must match database seed values)
const BADGE_NAMES = {
  FIRST_SHOUTOUT_SENT: 'First Shoutout Sent',
  HIGH_FIVE: 'High Five',
  SHOUTOUT_STAR: 'Shoutout Star',
  TEAM_PLAYER: 'Team Player',
}

/**
 * Check and award badges after a shoutout is created
 * @param {Object} supabase - Supabase client
 * @param {string} senderId - The user who sent the shoutout
 * @param {string} recipientId - The user who received the shoutout
 */
export async function checkAndAwardBadges(supabase, senderId, recipientId) {
  try {
    // Get all badges from database
    const { data: allBadges } = await supabase
      .from('badges')
      .select('id, name')

    if (!allBadges) return

    const badgeMap = Object.fromEntries(allBadges.map(b => [b.name, b.id]))

    // Get sender's existing badges
    const { data: senderBadges } = await supabase
      .from('user_badges')
      .select('badge_id')
      .eq('user_id', senderId)

    const senderBadgeIds = new Set(senderBadges?.map(b => b.badge_id) || [])

    // Get recipient's existing badges
    const { data: recipientBadges } = await supabase
      .from('user_badges')
      .select('badge_id')
      .eq('user_id', recipientId)

    const recipientBadgeIds = new Set(recipientBadges?.map(b => b.badge_id) || [])

    // Check sender badges
    await checkSenderBadges(supabase, senderId, badgeMap, senderBadgeIds)

    // Check recipient badges
    await checkRecipientBadges(supabase, recipientId, badgeMap, recipientBadgeIds)
  } catch (error) {
    console.error('Error checking badges:', error)
  }
}

/**
 * Check and award badges for the sender
 */
async function checkSenderBadges(supabase, senderId, badgeMap, existingBadgeIds) {
  // Count total shoutouts sent by this user
  const { count: totalSent } = await supabase
    .from('shoutouts')
    .select('*', { count: 'exact', head: true })
    .eq('sender_id', senderId)

  // First Shoutout Sent - Send 1 shoutout
  const firstShoutoutBadgeId = badgeMap[BADGE_NAMES.FIRST_SHOUTOUT_SENT]
  if (firstShoutoutBadgeId && !existingBadgeIds.has(firstShoutoutBadgeId) && totalSent >= 1) {
    await awardBadge(supabase, senderId, firstShoutoutBadgeId)
  }

  // High Five - Send 5 shoutouts
  const highFiveBadgeId = badgeMap[BADGE_NAMES.HIGH_FIVE]
  if (highFiveBadgeId && !existingBadgeIds.has(highFiveBadgeId) && totalSent >= 5) {
    await awardBadge(supabase, senderId, highFiveBadgeId)
  }

  // Team Player - Send 5+ shoutouts in one month
  const teamPlayerBadgeId = badgeMap[BADGE_NAMES.TEAM_PLAYER]
  if (teamPlayerBadgeId && !existingBadgeIds.has(teamPlayerBadgeId)) {
    // Get first day of current month
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

    const { count: monthlyCount } = await supabase
      .from('shoutouts')
      .select('*', { count: 'exact', head: true })
      .eq('sender_id', senderId)
      .gte('created_at', startOfMonth)

    if (monthlyCount >= 5) {
      await awardBadge(supabase, senderId, teamPlayerBadgeId)
    }
  }
}

/**
 * Check and award badges for the recipient
 */
async function checkRecipientBadges(supabase, recipientId, badgeMap, existingBadgeIds) {
  // Count total shoutouts received by this user
  const { count: totalReceived } = await supabase
    .from('shoutouts')
    .select('*', { count: 'exact', head: true })
    .eq('recipient_id', recipientId)

  // Shoutout Star - Receive 10 shoutouts
  const shoutoutStarBadgeId = badgeMap[BADGE_NAMES.SHOUTOUT_STAR]
  if (shoutoutStarBadgeId && !existingBadgeIds.has(shoutoutStarBadgeId) && totalReceived >= 10) {
    await awardBadge(supabase, recipientId, shoutoutStarBadgeId)
  }
}

/**
 * Award a badge to a user
 */
async function awardBadge(supabase, userId, badgeId) {
  const { error } = await supabase
    .from('user_badges')
    .insert({
      user_id: userId,
      badge_id: badgeId,
    })

  if (error) {
    // Ignore unique constraint violations (badge already awarded)
    if (error.code !== '23505') {
      console.error('Error awarding badge:', error)
    }
  } else {
    console.log(`Badge ${badgeId} awarded to user ${userId}`)
  }
}
