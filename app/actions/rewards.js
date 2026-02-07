'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function redeemReward(rewardId) {
  const supabase = await createClient()

  // Get current user
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  // Calculate user's actual points balance from shoutouts received
  const { data: allReceivedPoints } = await supabase
    .from('shoutouts')
    .select('points')
    .eq('recipient_id', user.id)

  const totalEarned = allReceivedPoints?.reduce((sum, s) => sum + (s.points || 0), 0) || 0

  // Get total points already spent on redemptions
  const { data: existingRedemptions } = await supabase
    .from('reward_redemptions')
    .select('points_spent')
    .eq('user_id', user.id)

  const totalSpent = existingRedemptions?.reduce((sum, r) => sum + (r.points_spent || 0), 0) || 0

  // Calculate available balance
  const pointsBalance = totalEarned - totalSpent

  // Get reward details
  const { data: reward } = await supabase
    .from('rewards')
    .select('*')
    .eq('id', rewardId)
    .eq('active', true)
    .single()

  if (!reward) {
    return { error: 'Reward not found or inactive' }
  }

  // Check if user has enough points
  if (pointsBalance < reward.cost) {
    return { error: `Not enough points. You have ${pointsBalance} pts but need ${reward.cost} pts.` }
  }

  // Create redemption record
  const { error: redemptionError } = await supabase
    .from('reward_redemptions')
    .insert({
      user_id: user.id,
      reward_id: rewardId,
      points_spent: reward.cost,
    })

  if (redemptionError) {
    console.error('Error creating redemption:', redemptionError)
    return { error: 'Failed to redeem reward' }
  }

  revalidatePath('/rewards')
  revalidatePath('/profile')
  revalidatePath('/dashboard')

  return { success: true, message: `Successfully redeemed ${reward.name}!` }
}
