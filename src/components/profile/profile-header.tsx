'use client'

import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Settings, MapPin } from 'lucide-react'
import type { Database } from '@/lib/types/database.types'

type Profile = Database['public']['Tables']['profiles']['Row']

export function ProfileHeader({ profile }: { profile: Profile | null }) {
  if (!profile) return null

  const initials = profile.display_name
    ?.split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase() || profile.username?.substring(0, 2).toUpperCase()

  return (
    <div className="bg-card border rounded-lg overflow-hidden">
      {/* Banner */}
      <div 
        className="h-32 bg-linear-to-r from-blue-600 to-purple-600"
        style={profile.banner_url ? { backgroundImage: `url(${profile.banner_url})`, backgroundSize: 'cover' } : {}}
      />

      {/* Profile Info */}
      <div className="p-6">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
          {/* Avatar */}
          <Avatar className="h-24 w-24 -mt-16 border-4 border-background">
            <AvatarImage src={profile.avatar_url || undefined} />
            <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
          </Avatar>

          {/* Info */}
          <div className="flex-1">
            <div className="flex flex-col md:flex-row md:items-center gap-2 mb-2">
              <h1 className="text-2xl font-bold">
                {profile.display_name || profile.username}
              </h1>
              <Badge variant="secondary">@{profile.username}</Badge>
            </div>
            
            {profile.bio && (
              <p className="text-muted-foreground mb-3">{profile.bio}</p>
            )}

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>Région non définie</span>
            </div>
          </div>

          {/* Actions */}
          <Button variant="outline" className="gap-2">
            <Settings className="h-4 w-4" />
            Modifier le profil
          </Button>
        </div>
      </div>
    </div>
  )
}

