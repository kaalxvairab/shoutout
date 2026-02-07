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

  return (
    <main className="container mx-auto px-4 py-6">
      {/* Quick Actions */}
      <Card className="mb-6">
        <CardContent className="py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-semibold">Hey {firstName} 👋</h1>
              <p className="text-muted-foreground text-sm">
                You have{' '}
                <span className="font-medium text-amber-600">{pointsRemaining} points</span>{' '}
                left to give this month
              </p>
            </div>
            <Button onClick={() => setIsCreateOpen(true)} size="lg">
              🎉 Send a Shoutout
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Feed - takes 2 columns on large screens */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-semibold">Recent Shoutouts</h2>
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
