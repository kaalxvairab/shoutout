'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import {
  MIN_SHOUTOUT_POINTS,
  MAX_SHOUTOUT_POINTS,
  MIN_MESSAGE_LENGTH,
  MAX_MESSAGE_LENGTH,
  MONTHLY_POINTS_ALLOWANCE,
  CATEGORIES,
} from '@/lib/constants'
import { sendShoutoutEmail } from '@/lib/email'

export async function createShoutout(formData) {
  const supabase = await createClient()

  // Get current user
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const recipientId = formData.get('recipientId')
  const category = formData.get('category')
  const message = formData.get('message')
  const points = parseInt(formData.get('points'), 10)

  // Validate recipient
  if (!recipientId) {
    return { error: 'Please select a recipient' }
  }

  if (recipientId === user.id) {
    return { error: 'You cannot send a shoutout to yourself' }
  }

  // Validate category
  const validCategories = CATEGORIES.map((c) => c.value)
  if (!validCategories.includes(category)) {
    return { error: 'Please select a valid category' }
  }

  // Validate message
  if (!message || message.length < MIN_MESSAGE_LENGTH) {
    return { error: `Message must be at least ${MIN_MESSAGE_LENGTH} characters` }
  }

  if (message.length > MAX_MESSAGE_LENGTH) {
    return { error: `Message must be less than ${MAX_MESSAGE_LENGTH} characters` }
  }

  // Validate points
  if (isNaN(points) || points < MIN_SHOUTOUT_POINTS || points > MAX_SHOUTOUT_POINTS) {
    return { error: `Points must be between ${MIN_SHOUTOUT_POINTS} and ${MAX_SHOUTOUT_POINTS}` }
  }

  // Check sender's remaining points and get their name
  const { data: senderProfile } = await supabase
    .from('profiles')
    .select('full_name, points_given_this_month')
    .eq('id', user.id)
    .single()

  const pointsRemaining = MONTHLY_POINTS_ALLOWANCE - (senderProfile?.points_given_this_month || 0)

  if (points > pointsRemaining) {
    return { error: `You only have ${pointsRemaining} points remaining this month` }
  }

  // Create the shoutout
  const { error: insertError } = await supabase
    .from('shoutouts')
    .insert({
      sender_id: user.id,
      recipient_id: recipientId,
      category,
      message,
      points,
    })

  if (insertError) {
    console.error('Error creating shoutout:', insertError)
    return { error: 'Failed to create shoutout' }
  }

  // Update sender's points_given_this_month
  const { error: senderError } = await supabase
    .from('profiles')
    .update({
      points_given_this_month: (senderProfile?.points_given_this_month || 0) + points,
    })
    .eq('id', user.id)

  if (senderError) {
    console.error('Error updating sender points:', senderError)
  }

  // Update recipient's points_balance
  const { data: recipientProfile } = await supabase
    .from('profiles')
    .select('points_balance, full_name')
    .eq('id', recipientId)
    .single()

  const { error: recipientError } = await supabase
    .from('profiles')
    .update({
      points_balance: (recipientProfile?.points_balance || 0) + points,
    })
    .eq('id', recipientId)

  if (recipientError) {
    console.error('Error updating recipient points:', recipientError)
  }

  // Get recipient email from auth.users via database function
  const { data: recipientEmail, error: emailError } = await supabase.rpc('get_user_email', {
    user_id: recipientId,
  })

  console.log('Email lookup result:', { recipientEmail, emailError, recipientId })

  // Send email notification to recipient
  if (recipientEmail) {
    console.log('Sending shoutout email to:', recipientEmail)
    sendShoutoutEmail({
      recipientEmail,
      recipientName: recipientProfile?.full_name || 'Team Member',
      senderName: senderProfile?.full_name || 'A colleague',
      message,
      category,
      points,
    }).then(result => {
      console.log('Email send result:', result)
    }).catch(err => {
      console.error('Failed to send shoutout email:', err)
    })
  } else {
    console.log('No recipient email found, skipping email notification')
  }

  revalidatePath('/dashboard')
  revalidatePath('/profile')

  return { success: true }
}
