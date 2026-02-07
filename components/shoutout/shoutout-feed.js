import ShoutoutCard from './shoutout-card'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent } from '@/components/ui/card'

export default function ShoutoutFeed({ shoutouts, loading, currentUserId }) {
  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardContent className="pt-4">
              <div className="flex items-start gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-6 w-24" />
                  <Skeleton className="h-16 w-full" />
                  <div className="flex justify-between">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                </div>
                <Skeleton className="h-10 w-10 rounded-full" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!shoutouts || shoutouts.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <div className="text-4xl mb-4">🎉</div>
          <h3 className="text-lg font-medium">No shoutouts yet</h3>
          <p className="text-muted-foreground mt-1">
            Be the first to recognize a colleague!
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {shoutouts.map((shoutout) => (
        <ShoutoutCard key={shoutout.id} shoutout={shoutout} currentUserId={currentUserId} />
      ))}
    </div>
  )
}
