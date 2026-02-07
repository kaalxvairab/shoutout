'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

export default function RewardCard({ reward, userPoints, onRedeem }) {
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const canAfford = userPoints >= reward.cost

  async function handleRedeem() {
    setLoading(true)
    const result = await onRedeem(reward.id)
    setLoading(false)

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success(`🎉 Redeemed ${reward.name}!`)
      setConfirmOpen(false)
    }
  }

  return (
    <>
      <Card className="flex flex-col">
        <CardContent className="pt-6 flex-1">
          <div className="text-center">
            <span className="text-4xl">{reward.icon}</span>
            <h3 className="mt-3 font-semibold">{reward.name}</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {reward.description}
            </p>
            <p className="text-lg font-bold text-amber-600 mt-3">
              {reward.cost} pts
            </p>
          </div>
        </CardContent>
        <CardFooter>
          <Button
            className="w-full"
            disabled={!canAfford}
            onClick={() => setConfirmOpen(true)}
          >
            {canAfford ? 'Redeem' : 'Not enough points'}
          </Button>
        </CardFooter>
      </Card>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Redemption</DialogTitle>
            <DialogDescription>
              Are you sure you want to redeem <strong>{reward.name}</strong> for{' '}
              <strong>{reward.cost} points</strong>?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleRedeem} disabled={loading}>
              {loading ? 'Redeeming...' : 'Confirm'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
