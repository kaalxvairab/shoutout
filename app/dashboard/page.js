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

  // Get recent shoutouts with sender and recipient info
  const { data: shoutouts } = await supabase
    .from('shoutouts')
    .select(`
      id,
      message,
      category,
      points,
      created_at,
      sender:profiles!shoutouts_sender_id_fkey(id, full_name),
      recipient:profiles!shoutouts_recipient_id_fkey(id, full_name)
    `)
    .order('created_at', { ascending: false })
    .limit(20)

  // Get all profiles for recipient selection
  const { data: allProfiles } = await supabase
    .from('profiles')
    .select('id, full_name, department')
    .not('id', 'eq', user.id)
    .not('full_name', 'is', null)
    .order('full_name')

  // Get team leaderboard (same department, this month)
  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  const { data: teamLeaderboard } = await supabase.rpc('get_leaderboard', {
    department_filter: profile.department,
    start_date: startOfMonth.toISOString(),
    limit_count: 5,
  })

  // Get company leaderboard (all departments, this month)
  const { data: companyLeaderboard } = await supabase.rpc('get_leaderboard', {
    department_filter: null,
    start_date: startOfMonth.toISOString(),
    limit_count: 5,
  })

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar user={user} profile={profile} />
      <DashboardContent
        user={user}
        profile={profile}
        shoutouts={shoutouts || []}
        allProfiles={allProfiles || []}
        teamLeaderboard={teamLeaderboard || []}
        companyLeaderboard={companyLeaderboard || []}
      />
    </div>
  )
}
