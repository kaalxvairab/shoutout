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

  // Get user's current points balance
  const { data: profile } = await supabase
    .from('profiles')
    .select('points_balance')
    .eq('id', user.id)
    .single()

  if (!profile) {
    return { error: 'Profile not found' }
  }

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
  if (profile.points_balance < reward.cost) {
    return { error: 'Not enough points' }
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

  // Deduct points from user's balance
  const { error: updateError } = await supabase
    .from('profiles')
    .update({
      points_balance: profile.points_balance - reward.cost,
    })
    .eq('id', user.id)

  if (updateError) {
    console.error('Error updating points:', updateError)
  }

  revalidatePath('/rewards')
  revalidatePath('/profile')

  return { success: true }
}
