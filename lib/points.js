/**
 * Calculate user's points balance from shoutouts and redemptions
 * This is the single source of truth for points calculation
 */
export async function calculatePointsBalance(supabase, userId) {
  // Get total points earned from shoutouts
  const { data: receivedShoutouts } = await supabase
    .from('shoutouts')
    .select('points')
    .eq('recipient_id', userId)

  const totalEarned = receivedShoutouts?.reduce((sum, s) => sum + (s.points || 0), 0) || 0

  // Get total points spent on redemptions
  const { data: redemptions } = await supabase
    .from('reward_redemptions')
    .select('points_spent')
    .eq('user_id', userId)

  const totalSpent = redemptions?.reduce((sum, r) => sum + (r.points_spent || 0), 0) || 0

  return {
    totalEarned,
    totalSpent,
    balance: totalEarned - totalSpent,
  }
}
