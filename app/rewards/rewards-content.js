'use client'

import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import RewardCard from '@/components/rewards/reward-card'
import { redeemReward } from '@/app/actions/rewards'

export default function RewardsContent({ rewards, profile }) {
  const router = useRouter()

  async function handleRedeem(rewardId) {
    const result = await redeemReward(rewardId)
    if (result.success) {
      router.refresh()
    }
    return result
  }

  return (
    <main className="container mx-auto px-4 py-6">
      {/* Points Balance */}
      <Card className="mb-6">
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold">Rewards Store</h1>
              <p className="text-muted-foreground text-sm">
                Redeem your points for amazing perks
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Your balance</p>
              <p className="text-2xl font-bold text-amber-600">
                {profile.points_balance || 0} pts
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rewards Grid */}
      {rewards.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {rewards.map((reward) => (
            <RewardCard
              key={reward.id}
              reward={reward}
              userPoints={profile.points_balance || 0}
              onRedeem={handleRedeem}
            />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="text-4xl mb-4">🎁</div>
            <h3 className="text-lg font-medium">No rewards available</h3>
            <p className="text-muted-foreground mt-1">
              Check back later for new rewards!
            </p>
          </CardContent>
        </Card>
      )}
    </main>
  )
}
