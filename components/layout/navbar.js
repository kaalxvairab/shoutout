'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { getInitials, getAvatarColor } from '@/lib/utils'
import { MONTHLY_POINTS_ALLOWANCE } from '@/lib/constants'

export default function Navbar({ user, profile }) {
  const [mounted, setMounted] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    setMounted(true)
  }, [])

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const pointsRemaining = MONTHLY_POINTS_ALLOWANCE - (profile?.points_given_this_month || 0)

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-lg supports-[backdrop-filter]:bg-white/60 shadow-sm">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2 group">
            <span className="text-2xl group-hover:animate-float transition-transform">🎉</span>
            <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">Shoutout</span>
          </Link>

          {/* Right side */}
          <div className="flex items-center gap-4">
            {/* Points earned */}
            <div className="hidden sm:flex items-center gap-2 text-sm bg-green-50 text-green-700 px-3 py-1.5 rounded-full">
              <span>⭐</span>
              <span className="font-medium">{profile?.points_balance || 0}</span>
              <span className="text-green-600">pts earned</span>
            </div>

            {/* Points remaining to give */}
            <div className="hidden sm:flex items-center gap-2 text-sm bg-amber-50 text-amber-700 px-3 py-1.5 rounded-full">
              <span>🎯</span>
              <span className="font-medium">{pointsRemaining} / {MONTHLY_POINTS_ALLOWANCE}</span>
              <span className="text-amber-600">to give</span>
            </div>

            {/* User dropdown */}
            {mounted ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className={`${getAvatarColor(profile?.full_name)} text-white`}>
                        {getInitials(profile?.full_name)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium">{profile?.full_name || 'User'}</p>
                      <p className="text-xs text-muted-foreground">{user?.email}</p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile">My Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/rewards">Rewards</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="text-red-600">
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className={`${getAvatarColor(profile?.full_name)} text-white`}>
                    {getInitials(profile?.full_name)}
                  </AvatarFallback>
                </Avatar>
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
