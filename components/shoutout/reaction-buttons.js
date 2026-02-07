'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { toggleReaction } from '@/app/actions/reactions'
import { cn } from '@/lib/utils'

const REACTIONS = [
  { emoji: 'celebrate', icon: '🎉', label: 'Celebrate' },
  { emoji: 'applause', icon: '👏', label: 'Applause' },
  { emoji: 'love', icon: '❤️', label: 'Love' },
  { emoji: 'fire', icon: '🔥', label: 'Fire' },
]

export default function ReactionButtons({ shoutoutId, reactions = [], currentUserId }) {
  const [isPending, startTransition] = useTransition()
  const [optimisticReactions, setOptimisticReactions] = useState(reactions)

  // Count reactions by emoji type
  const reactionCounts = optimisticReactions.reduce((acc, r) => {
    acc[r.emoji] = (acc[r.emoji] || 0) + 1
    return acc
  }, {})

  // Check which reactions the current user has made
  const userReactions = new Set(
    optimisticReactions
      .filter((r) => r.user_id === currentUserId)
      .map((r) => r.emoji)
  )

  function handleReaction(emoji) {
    startTransition(async () => {
      // Optimistic update
      const hasReacted = userReactions.has(emoji)
      if (hasReacted) {
        setOptimisticReactions((prev) =>
          prev.filter((r) => !(r.user_id === currentUserId && r.emoji === emoji))
        )
      } else {
        setOptimisticReactions((prev) => [
          ...prev,
          { user_id: currentUserId, emoji, shoutout_id: shoutoutId },
        ])
      }

      await toggleReaction(shoutoutId, emoji)
    })
  }

  return (
    <div className="flex items-center gap-1 flex-wrap">
      {REACTIONS.map(({ emoji, icon, label }) => {
        const count = reactionCounts[emoji] || 0
        const hasReacted = userReactions.has(emoji)

        return (
          <Button
            key={emoji}
            variant="ghost"
            size="sm"
            disabled={isPending}
            onClick={() => handleReaction(emoji)}
            className={cn(
              'h-7 px-2 text-xs gap-1 hover:bg-slate-100',
              hasReacted && 'bg-slate-100 ring-1 ring-slate-200'
            )}
            title={label}
          >
            <span>{icon}</span>
            {count > 0 && <span className="text-muted-foreground">{count}</span>}
          </Button>
        )
      })}
    </div>
  )
}
