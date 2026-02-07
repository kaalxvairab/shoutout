import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Navbar from '@/components/layout/navbar'
import DashboardContent from './dashboard-content'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
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

  // Check if profile is complete
  if (!profile?.full_name) {
    redirect('/onboarding')
  }

  // Get recent shoutouts with sender, recipient, and reactions
  const { data: shoutouts } = await supabase
    .from('shoutouts')
    .select(`
      id,
      message,
      category,
      points,
      created_at,
      sender:profiles!shoutouts_sender_id_fkey(id, full_name),
      recipient:profiles!shoutouts_recipient_id_fkey(id, full_name),
      reactions:shoutout_reactions(user_id, emoji)
    `)
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

  // Get all profiles for recipient selection
  const { data: allProfiles } = await supabase
    .from('profiles')
    .select('id, full_name, department')
    .not('id', 'eq', user.id)
    .not('full_name', 'is', null)
    .order('full_name')

  // Get team and company leaderboards (same month). Defensive: RPC may not exist in all envs.
  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)
  const leaderboardParams = {
    start_date: startOfMonth.toISOString(),
    limit_count: 5,
  }

  let teamLeaderboard = null
  let companyLeaderboard = null
  try {
    const [teamRes, companyRes] = await Promise.all([
      supabase.rpc('get_leaderboard', {
        department_filter: profile.department,
        ...leaderboardParams,
      }),
      supabase.rpc('get_leaderboard', {
        department_filter: null,
        ...leaderboardParams,
      }),
    ])
    teamLeaderboard = teamRes.data ?? null
    companyLeaderboard = companyRes.data ?? null
  } catch {
    // RPC may be missing or fail in some environments (e.g. migration not applied)
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar user={user} profile={profileWithPoints} />
      <DashboardContent
        user={user}
        profile={profileWithPoints}
        shoutouts={shoutouts || []}
        allProfiles={allProfiles || []}
        teamLeaderboard={teamLeaderboard || []}
        companyLeaderboard={companyLeaderboard || []}
      />
    </div>
  )
}
