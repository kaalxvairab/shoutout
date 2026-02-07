import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export default function BadgeGrid({ badges, userBadges }) {
  // Create a map of earned badge IDs
  const earnedBadgeIds = new Set(userBadges?.map((ub) => ub.badge_id) || [])

  // Get awarded date for a badge
  const getAwardedDate = (badgeId) => {
    const userBadge = userBadges?.find((ub) => ub.badge_id === badgeId)
    if (!userBadge) return null
    return new Date(userBadge.awarded_at).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Badges</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {badges?.map((badge) => {
            const isEarned = earnedBadgeIds.has(badge.id)
            const awardedDate = getAwardedDate(badge.id)

            return (
              <div
                key={badge.id}
                className={cn(
                  'flex flex-col items-center p-4 rounded-lg text-center',
                  isEarned
                    ? 'bg-amber-50 border border-amber-200'
                    : 'bg-slate-100 opacity-50'
                )}
              >
                <span className="text-3xl mb-2">
                  {isEarned ? badge.icon : '🔒'}
                </span>
                <span className="text-sm font-medium">{badge.name}</span>
                {isEarned && awardedDate && (
                  <span className="text-xs text-muted-foreground mt-1">
                    {awardedDate}
                  </span>
                )}
                {!isEarned && (
                  <span className="text-xs text-muted-foreground mt-1">
                    {badge.criteria}
                  </span>
                )}
              </div>
            )
          })}
        </div>

        {(!badges || badges.length === 0) && (
          <p className="text-center text-muted-foreground py-4">
            No badges available
          </p>
        )}
      </CardContent>
    </Card>
  )
}
