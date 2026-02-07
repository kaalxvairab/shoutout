'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import CreateShoutoutDialog from '@/components/shoutout/create-shoutout-dialog'
import { MONTHLY_POINTS_ALLOWANCE } from '@/lib/constants'

export default function ColleagueProfileActions({
  colleague,
  currentUserProfile,
  allProfiles,
}) {
  const router = useRouter()
  const [isCreateOpen, setIsCreateOpen] = useState(false)

  const pointsRemaining =
    MONTHLY_POINTS_ALLOWANCE - (currentUserProfile?.points_given_this_month || 0)

  function handleShoutoutCreated() {
    setIsCreateOpen(false)
    router.refresh()
  }

  return (
    <>
      <Button onClick={() => setIsCreateOpen(true)} size="lg">
        🎉 Send Shoutout
      </Button>

      <CreateShoutoutDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        profiles={allProfiles}
        currentUser={currentUserProfile}
        pointsRemaining={pointsRemaining}
        onSuccess={handleShoutoutCreated}
        preselectedRecipient={colleague}
      />
    </>
  )
}
