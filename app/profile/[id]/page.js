import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Navbar from '@/components/layout/navbar'
import ProfileHeader from '@/components/profile/profile-header'
import BadgeGrid from '@/components/profile/badge-grid'
import ShoutoutHistory from '@/components/profile/shoutout-history'
import ColleagueProfileActions from './colleague-profile-actions'

export const dynamic = 'force-dynamic'

export default async function ColleagueProfilePage({ params }) {
  const { id } = await params
  const supabase = await createClient()

  // Get current user
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // If viewing own profile, redirect to /profile
  if (id === user.id) {
    redirect('/profile')
  }

  // Get current user's profile for navbar
  const { data: currentUserProfile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Get colleague's profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single()

  if (!profile || !profile.full_name) {
    notFound()
  }

  // Get all badges
  const { data: badges } = await supabase
    .from('badges')
    .select('*')
    .order('name')

  // Get colleague's earned badges
  const { data: userBadges } = await supabase
    .from('user_badges')
    .select('*')
    .eq('user_id', id)

  // Get received shoutouts (public)
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
    .eq('recipient_id', id)
    .order('created_at', { ascending: false })
    .limit(20)

  // Get all profiles for shoutout dialog (excluding current user)
  const { data: allProfiles } = await supabase
    .from('profiles')
    .select('id, full_name, department')
    .not('id', 'eq', user.id)
    .not('full_name', 'is', null)
    .order('full_name')

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar user={user} profile={currentUserProfile} />

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Profile Header with Send Shoutout button */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
            <ProfileHeader profile={profile} showDetails={false} />
            <ColleagueProfileActions
              colleague={profile}
              currentUserProfile={currentUserProfile}
              allProfiles={allProfiles}
            />
          </div>
        </div>

        {/* Badges */}
        <BadgeGrid badges={badges} userBadges={userBadges} />

        {/* Shoutout History (received only) */}
        <ShoutoutHistory
          receivedShoutouts={receivedShoutouts}
          sentShoutouts={[]}
          showSentTab={false}
        />
      </main>
    </div>
  )
}
