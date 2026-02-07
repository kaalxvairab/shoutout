'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import ShoutoutFeed from '@/components/shoutout/shoutout-feed'
import Leaderboard from '@/components/leaderboard/leaderboard'
import CreateShoutoutDialog from '@/components/shoutout/create-shoutout-dialog'
import { MONTHLY_POINTS_ALLOWANCE } from '@/lib/constants'

export default function DashboardContent({
  user,
  profile,
  shoutouts,
  allProfiles,
  teamLeaderboard,
  companyLeaderboard,
}) {
  const router = useRouter()
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [companyTab, setCompanyTab] = useState('month')

  const firstName = profile?.full_name?.split(' ')[0] || 'there'
  const pointsRemaining = MONTHLY_POINTS_ALLOWANCE - (profile?.points_given_this_month || 0)

  function handleShoutoutCreated() {
    setIsCreateOpen(false)
    router.refresh()
  }

  // Transform leaderboard data to expected format
  const transformLeaderboard = (data) => {
    if (!data) return []
    return data.map((item) => ({
      user: {
        id: item.user_id,
        full_name: item.full_name,
      },
      points: item.total_points,
    }))
  }

  const pointsPercent = Math.round((pointsRemaining / MONTHLY_POINTS_ALLOWANCE) * 100)

  return (
    <main className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Quick Actions Hero */}
      <Card className="mb-8 overflow-hidden border-0 shadow-lg bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 text-white animate-fade-in-up">
        <CardContent className="py-6 px-6 sm:px-8 relative">
          {/* Decorative background circles */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
          <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
          <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Hey {firstName} 👋</h1>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-full px-4 py-1.5">
                  <span className="text-lg animate-float">✨</span>
                  <span className="font-semibold text-lg">{pointsRemaining}</span>
                  <span className="text-white/80 text-sm">points left to give</span>
                </div>
              </div>
              {/* Mini progress bar */}
              <div className="flex items-center gap-2 max-w-xs">
                <div className="flex-1 h-1.5 bg-white/20 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-300 rounded-full transition-all duration-500"
                    style={{ width: `${pointsPercent}%` }}
                  />
                </div>
                <span className="text-xs text-white/70">{pointsPercent}%</span>
              </div>
            </div>
            <Button
              onClick={() => setIsCreateOpen(true)}
              size="lg"
              className="bg-white text-purple-700 hover:bg-white/90 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02] font-semibold text-base px-6"
            >
              🎉 Send a Shoutout
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Feed - takes 2 columns on large screens */}
        <div className="lg:col-span-2 space-y-5">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold tracking-tight">Recent Shoutouts</h2>
            <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full font-medium">
              {shoutouts?.length || 0}
            </span>
          </div>
          <ShoutoutFeed shoutouts={shoutouts} />
        </div>

        {/* Leaderboards - takes 1 column on large screens */}
        <div className="space-y-6">
          <Leaderboard
            title={`🏆 ${profile?.department || 'Team'} Leaders`}
            data={transformLeaderboard(teamLeaderboard)}
          />
          <Leaderboard
            title="🌟 Company Leaders"
            data={transformLeaderboard(companyLeaderboard)}
            showTabs
            activeTab={companyTab}
            onTabChange={setCompanyTab}
          />
        </div>
      </div>

      {/* Create Shoutout Dialog */}
      <CreateShoutoutDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        profiles={allProfiles}
        currentUser={profile}
        pointsRemaining={pointsRemaining}
        onSuccess={handleShoutoutCreated}
      />
    </main>
  )
}
