import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { getInitials, getAvatarColor, getRelativeTime } from '@/lib/utils'
import { CATEGORIES, CATEGORY_COLORS } from '@/lib/constants'
import ReactionButtons from './reaction-buttons'

export default function ShoutoutCard({ shoutout, currentUserId }) {
  const { id, sender, recipient, message, category, points, created_at, reactions } = shoutout

  const categoryInfo = CATEGORIES.find((c) => c.value === category)
  const categoryColors = CATEGORY_COLORS[category] || CATEGORY_COLORS.teamwork

  return (
    <Card className={`border-l-4 ${categoryColors.border} group hover:shadow-md transition-all duration-200 hover:-translate-y-0.5`}>
      <CardContent className="pt-5 pb-4">
        <div className="flex items-start gap-3">
          {/* Sender avatar */}
          <Link href={`/profile/${sender.id}`}>
            <Avatar className="h-10 w-10 cursor-pointer ring-2 ring-transparent group-hover:ring-purple-200 transition-all duration-200">
              <AvatarFallback className={`${getAvatarColor(sender.full_name)} text-white text-sm font-semibold`}>
                {getInitials(sender.full_name)}
              </AvatarFallback>
            </Avatar>
          </Link>

          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-center gap-1.5 flex-wrap text-sm">
              <Link
                href={`/profile/${sender.id}`}
                className="font-semibold hover:underline decoration-purple-300 underline-offset-2"
              >
                {sender.full_name}
              </Link>
              <span className="text-muted-foreground">→</span>
              <Link
                href={`/profile/${recipient.id}`}
                className="font-semibold hover:underline decoration-purple-300 underline-offset-2"
              >
                {recipient.full_name}
              </Link>
            </div>

            {/* Category badge */}
            <div className="mt-2">
              <Badge
                variant="secondary"
                className={`${categoryColors.bg} ${categoryColors.text} border-0 font-medium shadow-sm`}
              >
                {categoryInfo?.emoji} {categoryInfo?.label}
              </Badge>
            </div>

            {/* Message */}
            <p className="mt-3 text-sm text-foreground leading-relaxed">{message}</p>

            {/* Reactions */}
            <div className="mt-3 pt-3 border-t">
              <ReactionButtons
                shoutoutId={id}
                reactions={reactions || []}
                currentUserId={currentUserId}
              />
            </div>

            {/* Footer */}
            <div className="mt-3 flex items-center justify-between pt-2 border-t border-dashed border-muted">
              <span className="text-xs text-muted-foreground">
                {getRelativeTime(created_at)}
              </span>
              <span className="text-sm font-bold text-amber-500 bg-amber-50 px-2 py-0.5 rounded-full">
                +{points} pts
              </span>
            </div>
          </div>

          {/* Recipient avatar */}
          <Link href={`/profile/${recipient.id}`}>
            <Avatar className="h-10 w-10 cursor-pointer ring-2 ring-transparent group-hover:ring-amber-200 transition-all duration-200">
              <AvatarFallback className={`${getAvatarColor(recipient.full_name)} text-white text-sm font-semibold`}>
                {getInitials(recipient.full_name)}
              </AvatarFallback>
            </Avatar>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
