import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { getInitials, getAvatarColor } from '@/lib/utils'

export default function ProfileHeader({ profile, showDetails = true }) {
  const formatDate = (dateString) => {
    if (!dateString) return null
    const date = new Date(dateString)
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  return (
    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
      <Avatar className="h-24 w-24">
        <AvatarFallback className={`${getAvatarColor(profile.full_name)} text-white text-2xl`}>
          {getInitials(profile.full_name)}
        </AvatarFallback>
      </Avatar>

      <div className="text-center sm:text-left">
        <h1 className="text-2xl font-bold">{profile.full_name}</h1>
        <p className="text-muted-foreground">{profile.job_title}</p>
        <p className="text-sm text-muted-foreground">{profile.department}</p>

        {showDetails && (
          <div className="mt-4 flex flex-wrap gap-4 text-sm text-muted-foreground justify-center sm:justify-start">
            {profile.birthday && (
              <span className="flex items-center gap-1">
                🎂 {formatDate(profile.birthday)}
              </span>
            )}
            {profile.join_date && (
              <span className="flex items-center gap-1">
                📅 Joined {formatDate(profile.join_date)}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
