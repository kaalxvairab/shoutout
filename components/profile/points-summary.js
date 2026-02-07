import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { MONTHLY_POINTS_ALLOWANCE } from '@/lib/constants'

export default function PointsSummary({ profile }) {
  const pointsGiven = profile.points_given_this_month || 0
  const pointsRemaining = MONTHLY_POINTS_ALLOWANCE - pointsGiven
  const percentGiven = (pointsGiven / MONTHLY_POINTS_ALLOWANCE) * 100

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {/* Points Balance */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Points Balance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-amber-600">
              {profile.points_balance || 0}
            </span>
            <span className="text-muted-foreground">pts</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Available to redeem
          </p>
        </CardContent>
      </Card>

      {/* Points Given This Month */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Points Given This Month
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold">
              {pointsGiven}
            </span>
            <span className="text-muted-foreground">/ {MONTHLY_POINTS_ALLOWANCE}</span>
          </div>
          <Progress value={percentGiven} className="mt-2 h-2" />
          <p className="text-xs text-muted-foreground mt-1">
            {pointsRemaining} pts remaining to give
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
