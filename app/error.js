'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

export default function Error({ error, reset }) {
  useEffect(() => {
    // Log to your reporting service in production
    console.error('App error:', error?.message, error?.digest)
  }, [error])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4">
      <div className="text-center max-w-md space-y-4">
        <div className="text-5xl">😕</div>
        <h1 className="text-xl font-semibold text-slate-800">Something went wrong</h1>
        <p className="text-slate-600 text-sm">
          We couldn’t load this page. Try again, or head back to the dashboard.
        </p>
        <div className="flex gap-3 justify-center">
          <Button onClick={() => reset()}>Try again</Button>
          <Button variant="outline" onClick={() => (window.location.href = '/dashboard')}>
            Go to dashboard
          </Button>
        </div>
      </div>
    </div>
  )
}
