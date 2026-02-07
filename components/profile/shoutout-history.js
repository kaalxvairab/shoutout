'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { getRelativeTime } from '@/lib/utils'
import { CATEGORIES, CATEGORY_COLORS } from '@/lib/constants'

function ShoutoutHistoryItem({ shoutout, type }) {
  const categoryInfo = CATEGORIES.find((c) => c.value === shoutout.category)
  const categoryColors = CATEGORY_COLORS[shoutout.category] || CATEGORY_COLORS.teamwork

  const otherPerson = type === 'received' ? shoutout.sender : shoutout.recipient

  return (
    <div className="py-3 border-b last:border-0">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            {type === 'received' ? (
              <span className="text-sm">
                From{' '}
                <Link
                  href={`/profile/${otherPerson.id}`}
                  className="font-medium hover:underline"
                >
                  {otherPerson.full_name}
                </Link>
              </span>
            ) : (
              <span className="text-sm">
                To{' '}
                <Link
                  href={`/profile/${otherPerson.id}`}
                  className="font-medium hover:underline"
                >
                  {otherPerson.full_name}
                </Link>
              </span>
            )}
            <Badge
              variant="secondary"
              className={`${categoryColors.bg} ${categoryColors.text} border-0 text-xs`}
            >
              {categoryInfo?.emoji} {categoryInfo?.label}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
            {shoutout.message}
          </p>
        </div>
        <div className="text-right shrink-0">
          <span className="text-sm font-medium text-amber-600">
            {type === 'received' ? '+' : '-'}{shoutout.points} pts
          </span>
          <p className="text-xs text-muted-foreground">
            {getRelativeTime(shoutout.created_at)}
          </p>
        </div>
      </div>
    </div>
  )
}

export default function ShoutoutHistory({
  receivedShoutouts,
  sentShoutouts,
  showSentTab = true,
}) {
  const [activeTab, setActiveTab] = useState('received')

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Shoutout History</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="received">
              Received ({receivedShoutouts?.length || 0})
            </TabsTrigger>
            {showSentTab && (
              <TabsTrigger value="sent">
                Sent ({sentShoutouts?.length || 0})
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="received" className="mt-0">
            {receivedShoutouts && receivedShoutouts.length > 0 ? (
              <div className="divide-y">
                {receivedShoutouts.map((shoutout) => (
                  <ShoutoutHistoryItem
                    key={shoutout.id}
                    shoutout={shoutout}
                    type="received"
                  />
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                No shoutouts received yet
              </p>
            )}
          </TabsContent>

          {showSentTab && (
            <TabsContent value="sent" className="mt-0">
              {sentShoutouts && sentShoutouts.length > 0 ? (
                <div className="divide-y">
                  {sentShoutouts.map((shoutout) => (
                    <ShoutoutHistoryItem
                      key={shoutout.id}
                      shoutout={shoutout}
                      type="sent"
                    />
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No shoutouts sent yet
                </p>
              )}
            </TabsContent>
          )}
        </Tabs>
      </CardContent>
    </Card>
  )
}
