'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { getInitials, getAvatarColor } from '@/lib/utils'

const RANK_STYLES = {
  1: 'text-yellow-500',
  2: 'text-slate-400',
  3: 'text-amber-600',
}

function LeaderboardItem({ user, rank, points }) {
  const rankStyle = RANK_STYLES[rank] || 'text-slate-500'
  const medals = { 1: '🥇', 2: '🥈', 3: '🥉' }
  const isTopThree = rank <= 3

  return (
    <div className={`flex items-center gap-3 py-2.5 px-2 -mx-2 rounded-lg transition-colors duration-150 hover:bg-muted/50 ${isTopThree ? 'font-medium' : ''}`}>
      <span className={`w-7 text-center font-bold text-base ${rankStyle}`}>
        {medals[rank] || <span className="text-sm text-muted-foreground">{rank}</span>}
      </span>
      <Link href={`/profile/${user.id}`} className="flex items-center gap-2.5 flex-1 group">
        <Avatar className={`h-8 w-8 transition-transform duration-150 group-hover:scale-110 ${isTopThree ? 'ring-2 ring-amber-200' : ''}`}>
          <AvatarFallback className={`${getAvatarColor(user.full_name)} text-white text-xs font-semibold`}>
            {getInitials(user.full_name)}
          </AvatarFallback>
        </Avatar>
        <span className="text-sm truncate group-hover:text-purple-700 transition-colors">{user.full_name}</span>
      </Link>
      <span className="text-sm font-semibold text-amber-600 tabular-nums">{points} pts</span>
    </div>
  )
}

export default function Leaderboard({
  title,
  data,
  loading,
  showTabs = false,
  onTabChange,
  activeTab = 'month',
}) {
  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <Skeleton className="h-5 w-32" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-6 w-6" />
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-4 w-24 flex-1" />
                <Skeleton className="h-4 w-12" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow duration-200">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-bold">{title}</CardTitle>
          {showTabs && (
            <Tabs value={activeTab} onValueChange={onTabChange}>
              <TabsList className="h-8">
                <TabsTrigger value="month" className="text-xs px-2">
                  This Month
                </TabsTrigger>
                <TabsTrigger value="all" className="text-xs px-2">
                  All Time
                </TabsTrigger>
              </TabsList>
            </Tabs>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {!data || data.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No data available
          </p>
        ) : (
          <div className="divide-y">
            {data.map((item, index) => (
              <LeaderboardItem
                key={item.user.id}
                user={item.user}
                rank={index + 1}
                points={item.points}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
