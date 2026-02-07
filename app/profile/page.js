import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Navbar from '@/components/layout/navbar'
import ProfileHeader from '@/components/profile/profile-header'
import PointsSummary from '@/components/profile/points-summary'
import BadgeGrid from '@/components/profile/badge-grid'
import ShoutoutHistory from '@/components/profile/shoutout-history'

export const dynamic = 'force-dynamic'

export default async function ProfilePage() {
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

  // Get all badges
  const { data: badges } = await supabase
    .from('badges')
    .select('*')
    .order('name')

  // Get user's earned badges
  const { data: userBadges } = await supabase
    .from('user_badges')
    .select('*')
    .eq('user_id', user.id)

  // Get received shoutouts
  const { data: receivedShoutouts } = await supabase
    .from('shoutouts')
    .select(`
      id,
      message,
      category,
      points,
      created_at,
      sender:profiles!shoutouts_sender_id_fkey(id, full_name)
    `)
    .eq('recipient_id', user.id)
    .order('created_at', { ascending: false })
    .limit(20)

  // Calculate actual points balance from all received shoutouts
  const { data: allReceivedPoints } = await supabase
    .from('shoutouts')
    .select('points')
    .eq('recipient_id', user.id)

  const calculatedPointsBalance = allReceivedPoints?.reduce((sum, s) => sum + (s.points || 0), 0) || 0

  // Create profile with calculated points balance
  const profileWithPoints = {
    ...profile,
    points_balance: calculatedPointsBalance,
  }

  // Get sent shoutouts
  const { data: sentShoutouts } = await supabase
    .from('shoutouts')
    .select(`
      id,
      message,
      category,
      points,
      created_at,
      recipient:profiles!shoutouts_recipient_id_fkey(id, full_name)
    `)
    .eq('sender_id', user.id)
    .order('created_at', { ascending: false })
    .limit(20)

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar user={user} profile={profileWithPoints} />

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Profile Header */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <ProfileHeader profile={profileWithPoints} />
        </div>

        {/* Points Summary */}
        <PointsSummary profile={profileWithPoints} />

        {/* Badges */}
        <BadgeGrid badges={badges} userBadges={userBadges} />

        {/* Shoutout History */}
        <ShoutoutHistory
          receivedShoutouts={receivedShoutouts}
          sentShoutouts={sentShoutouts}
          showSentTab={true}
        />
      </main>
    </div>
  )
}
