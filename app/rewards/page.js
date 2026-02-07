import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Navbar from '@/components/layout/navbar'
import RewardsContent from './rewards-content'

export const dynamic = 'force-dynamic'

export default async function RewardsPage() {
  const supabase = await createClient()

  // Get current user
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile?.full_name) {
    redirect('/onboarding')
  }

  // Get available rewards
  const { data: rewards } = await supabase
    .from('rewards')
    .select('*')
    .eq('active', true)
    .order('cost')

  // Calculate actual points balance from received shoutouts
  const { data: allReceivedPoints } = await supabase
    .from('shoutouts')
    .select('points')
    .eq('recipient_id', user.id)

  const totalEarned = allReceivedPoints?.reduce((sum, s) => sum + (s.points || 0), 0) || 0

  // Get total points spent on redemptions
  const { data: redemptions } = await supabase
    .from('reward_redemptions')
    .select('points_spent')
    .eq('user_id', user.id)

  const totalSpent = redemptions?.reduce((sum, r) => sum + (r.points_spent || 0), 0) || 0

  // Calculate available balance
  const calculatedPointsBalance = totalEarned - totalSpent

  const profileWithPoints = {
    ...profile,
    points_balance: calculatedPointsBalance,
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar user={user} profile={profileWithPoints} />
      <RewardsContent rewards={rewards || []} profile={profileWithPoints} />
    </div>
  )
}
