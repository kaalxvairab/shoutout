'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

const VALID_EMOJIS = ['celebrate', 'applause', 'love', 'fire']

export async function toggleReaction(shoutoutId, emoji) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  if (!VALID_EMOJIS.includes(emoji)) {
    return { error: 'Invalid emoji' }
  }

  // Check if reaction already exists
  const { data: existing } = await supabase
    .from('shoutout_reactions')
    .select('id')
    .eq('shoutout_id', shoutoutId)
    .eq('user_id', user.id)
    .eq('emoji', emoji)
    .single()

  if (existing) {
    // Remove reaction
    const { error } = await supabase
      .from('shoutout_reactions')
      .delete()
      .eq('id', existing.id)

    if (error) {
      console.error('Error removing reaction:', error)
      return { error: 'Failed to remove reaction' }
    }
  } else {
    // Add reaction
    const { error } = await supabase
      .from('shoutout_reactions')
      .insert({
        shoutout_id: shoutoutId,
        user_id: user.id,
        emoji,
      })

    if (error) {
      console.error('Error adding reaction:', error)
      return { error: 'Failed to add reaction' }
    }
  }

  revalidatePath('/dashboard')
  return { success: true }
}
