'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { createShoutout } from '@/app/actions/shoutouts'
import { getInitials, getAvatarColor, cn } from '@/lib/utils'
import {
  CATEGORIES,
  CATEGORY_COLORS,
  MIN_SHOUTOUT_POINTS,
  MAX_SHOUTOUT_POINTS,
  SHOUTOUT_POINTS_STEP,
  MIN_MESSAGE_LENGTH,
  MAX_MESSAGE_LENGTH,
} from '@/lib/constants'

export default function CreateShoutoutDialog({
  open,
  onOpenChange,
  profiles,
  currentUser,
  pointsRemaining,
  onSuccess,
  preselectedRecipient = null,
}) {
  const [recipientId, setRecipientId] = useState(preselectedRecipient?.id || '')
  const [recipientName, setRecipientName] = useState(preselectedRecipient?.full_name || '')
  const [category, setCategory] = useState('')
  const [message, setMessage] = useState('')
  const [points, setPoints] = useState(MIN_SHOUTOUT_POINTS)
  const [loading, setLoading] = useState(false)
  const [recipientOpen, setRecipientOpen] = useState(false)

  const maxPoints = Math.min(MAX_SHOUTOUT_POINTS, pointsRemaining)
  const isValid =
    recipientId &&
    category &&
    message.length >= MIN_MESSAGE_LENGTH &&
    message.length <= MAX_MESSAGE_LENGTH &&
    points >= MIN_SHOUTOUT_POINTS &&
    points <= maxPoints

  function resetForm() {
    if (!preselectedRecipient) {
      setRecipientId('')
      setRecipientName('')
    }
    setCategory('')
    setMessage('')
    setPoints(MIN_SHOUTOUT_POINTS)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!isValid) return

    setLoading(true)

    const formData = new FormData()
    formData.append('recipientId', recipientId)
    formData.append('category', category)
    formData.append('message', message)
    formData.append('points', points.toString())

    const result = await createShoutout(formData)

    setLoading(false)

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success(`🎉 Shoutout sent to ${recipientName}!`)
      resetForm()
      onSuccess?.()
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Send a Shoutout 🎉</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Recipient selection */}
          <div className="space-y-2">
            <Label>Who are you recognizing?</Label>
            <Popover open={recipientOpen} onOpenChange={setRecipientOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  className="w-full justify-start"
                  disabled={!!preselectedRecipient}
                >
                  {recipientName ? (
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className={`${getAvatarColor(recipientName)} text-white text-xs`}>
                          {getInitials(recipientName)}
                        </AvatarFallback>
                      </Avatar>
                      {recipientName}
                    </div>
                  ) : (
                    <span className="text-muted-foreground">Select a colleague...</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0" align="start">
                <Command>
                  <CommandInput placeholder="Search colleagues..." />
                  <CommandList>
                    <CommandEmpty>No colleagues found.</CommandEmpty>
                    <CommandGroup>
                      {profiles.map((profile) => (
                        <CommandItem
                          key={profile.id}
                          value={profile.full_name}
                          onSelect={() => {
                            setRecipientId(profile.id)
                            setRecipientName(profile.full_name)
                            setRecipientOpen(false)
                          }}
                        >
                          <Avatar className="h-6 w-6 mr-2">
                            <AvatarFallback className={`${getAvatarColor(profile.full_name)} text-white text-xs`}>
                              {getInitials(profile.full_name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <span className="font-medium">{profile.full_name}</span>
                            <span className="text-muted-foreground text-xs ml-2">
                              {profile.department}
                            </span>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {/* Category selection */}
          <div className="space-y-2">
            <Label>What are you recognizing them for?</Label>
            <div className="grid grid-cols-2 gap-2">
              {CATEGORIES.map((cat) => {
                const colors = CATEGORY_COLORS[cat.value]
                const isSelected = category === cat.value
                return (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => setCategory(cat.value)}
                    className={cn(
                      'flex items-center gap-2 p-3 rounded-lg border-2 transition-all text-left',
                      isSelected
                        ? `${colors.border} ${colors.bg} ${colors.text}`
                        : 'border-transparent bg-slate-50 hover:bg-slate-100'
                    )}
                  >
                    <span className="text-lg">{cat.emoji}</span>
                    <span className="text-sm font-medium">{cat.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Message */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label>Your message</Label>
              <span className={cn(
                'text-xs',
                message.length < MIN_MESSAGE_LENGTH ? 'text-muted-foreground' :
                message.length > MAX_MESSAGE_LENGTH ? 'text-red-500' : 'text-green-600'
              )}>
                {message.length} / {MAX_MESSAGE_LENGTH}
              </span>
            </div>
            <Textarea
              placeholder="What did they do that deserves recognition?"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="min-h-24"
            />
            {message.length > 0 && message.length < MIN_MESSAGE_LENGTH && (
              <p className="text-xs text-muted-foreground">
                {MIN_MESSAGE_LENGTH - message.length} more characters needed
              </p>
            )}
          </div>

          {/* Points slider */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label>Points to give</Label>
              <span className="text-lg font-bold text-amber-600">{points} pts</span>
            </div>
            <Slider
              value={[points]}
              onValueChange={(value) => setPoints(value[0])}
              min={MIN_SHOUTOUT_POINTS}
              max={maxPoints}
              step={SHOUTOUT_POINTS_STEP}
              className="py-2"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{MIN_SHOUTOUT_POINTS} pts</span>
              <span>{pointsRemaining} pts remaining</span>
              <span>{maxPoints} pts</span>
            </div>
          </div>

          {/* Submit */}
          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={!isValid || loading}
          >
            {loading ? 'Sending...' : '🎉 Send Shoutout'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
