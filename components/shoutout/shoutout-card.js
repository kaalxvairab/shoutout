import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { getInitials, getAvatarColor, getRelativeTime } from '@/lib/utils'
import { CATEGORIES, CATEGORY_COLORS } from '@/lib/constants'

export default function ShoutoutCard({ shoutout }) {
  const { sender, recipient, message, category, points, created_at } = shoutout

  const categoryInfo = CATEGORIES.find((c) => c.value === category)
  const categoryColors = CATEGORY_COLORS[category] || CATEGORY_COLORS.teamwork

  return (
    <Card className={`border-l-4 ${categoryColors.border}`}>
      <CardContent className="pt-4">
        <div className="flex items-start gap-3">
          {/* Sender avatar */}
          <Link href={`/profile/${sender.id}`}>
            <Avatar className="h-10 w-10 cursor-pointer hover:opacity-80">
              <AvatarFallback className={`${getAvatarColor(sender.full_name)} text-white text-sm`}>
                {getInitials(sender.full_name)}
              </AvatarFallback>
            </Avatar>
          </Link>

          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-center gap-2 flex-wrap">
              <Link
                href={`/profile/${sender.id}`}
                className="font-medium hover:underline"
              >
                {sender.full_name}
              </Link>
              <span className="text-muted-foreground">shouted out</span>
              <Link
                href={`/profile/${recipient.id}`}
                className="font-medium hover:underline"
              >
                {recipient.full_name}
              </Link>
            </div>

            {/* Category badge */}
            <div className="mt-2">
              <Badge
                variant="secondary"
                className={`${categoryColors.bg} ${categoryColors.text} border-0`}
              >
                {categoryInfo?.emoji} {categoryInfo?.label}
              </Badge>
            </div>

            {/* Message */}
            <p className="mt-3 text-sm text-foreground">{message}</p>

            {/* Footer */}
            <div className="mt-3 flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                {getRelativeTime(created_at)}
              </span>
              <span className="text-sm font-medium text-amber-600">
                +{points} pts
              </span>
            </div>
          </div>

          {/* Recipient avatar */}
          <Link href={`/profile/${recipient.id}`}>
            <Avatar className="h-10 w-10 cursor-pointer hover:opacity-80">
              <AvatarFallback className={`${getAvatarColor(recipient.full_name)} text-white text-sm`}>
                {getInitials(recipient.full_name)}
              </AvatarFallback>
            </Avatar>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
