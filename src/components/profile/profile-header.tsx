'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { ProfileEditModal } from './profile-edit-modal'
import { RiotAccountButton } from './riot-account-button'
import { 
  Settings, 
  MapPin, 
  Calendar,
  Edit2,
  User
} from 'lucide-react'
import type { Database } from '@/lib/types/database.types'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

type Profile = Database['public']['Tables']['profiles']['Row']

export function ProfileHeader({ profile }: { profile: Profile | null }) {
  const router = useRouter()
  const [isEditOpen, setIsEditOpen] = useState(false)
  
  if (!profile) return null

  const initials = profile.display_name
    ?.split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase() || profile.username?.substring(0, 2).toUpperCase()

  const memberSince = profile.created_at 
    ? new Date(profile.created_at).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
    : 'Récemment'

  return (
    <Card className="overflow-hidden bg-[#141414] border-[#1a1a1a]">
      {/* Banner */}
      <div 
        className={`h-40 relative ${
          profile.banner_url 
            ? '' 
            : 'bg-gradient-to-br from-[#c8ff00]/20 via-[#1a1a1a] to-[#0a0a0a]'
        }`}
        style={profile.banner_url ? { 
          backgroundImage: `url(${profile.banner_url})`, 
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        } : {}}
      >
        {/* Overlay pattern - only if no banner */}
        {!profile.banner_url && (
          <div className="absolute inset-0 bg-[linear-gradient(rgba(200,255,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(200,255,0,0.02)_1px,transparent_1px)] bg-[size:32px_32px]" />
        )}
        
        {/* Subtle shadow at bottom - only if banner exists */}
        {profile.banner_url && (
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#141414]/80 to-transparent" />
        )}
        
        {/* Gradient overlay at bottom - only if no banner */}
        {!profile.banner_url && (
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#141414] to-transparent" />
        )}
      </div>

      {/* Profile Info */}
      <div className="px-6 pb-6 -mt-12 relative">
        <div className="flex flex-col md:flex-row gap-6 items-start">
          {/* Avatar */}
          <div className="relative">
            <Avatar className="h-28 w-28 border-4 border-[#141414] shadow-xl">
              <AvatarImage src={profile.avatar_url || undefined} />
              <AvatarFallback className="text-3xl bg-gradient-to-br from-[#c8ff00]/40 to-[#c8ff00]/20 text-[#c8ff00]">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="absolute bottom-1 right-1 w-6 h-6 bg-[#c8ff00] rounded-full border-2 border-[#141414]" />
          </div>

          {/* Info */}
          <div className="flex-1 mt-4 md:mt-8">
            {/* Title at the top */}
            <div className="mb-4">
              <Badge className="bg-[#c8ff00]/10 text-[#c8ff00] border-[#c8ff00]/20">
                <User className="h-3 w-3 mr-1" />
                Profil
              </Badge>
            </div>
            
            <div className="flex flex-col md:flex-row md:items-center gap-3 mb-3">
              <h2 className="text-xl font-bold text-white">
                {profile.display_name || profile.username}
              </h2>
              <Badge variant="secondary" className="w-fit bg-[#1a1a1a] text-[#888] border-[#1a1a1a]">
                @{profile.username}
              </Badge>
            </div>
            
            {profile.bio ? (
              <p className="text-[#666] mb-4 max-w-2xl">{profile.bio}</p>
            ) : (
              <p className="text-[#666] mb-4 italic">Aucune bio définie</p>
            )}

            <div className="flex flex-wrap items-center gap-4 text-sm text-[#666]">
              <Badge className="bg-[#c8ff00]/10 text-[#c8ff00] border-[#c8ff00]/20">
                <span className="capitalize">{profile.role || 'user'}</span>
              </Badge>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>Membre depuis {memberSince}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-4 md:mt-8 flex gap-2">
            <Button 
              variant="outline" 
              className="gap-2 border-[#1a1a1a] text-[#888] hover:text-white hover:bg-[#1a1a1a]"
              onClick={() => setIsEditOpen(true)}
            >
              <Edit2 className="h-4 w-4" />
              Modifier
            </Button>
            <RiotAccountButton />
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <ProfileEditModal
        profile={profile}
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        onSuccess={() => router.refresh()}
      />
    </Card>
  )
}
