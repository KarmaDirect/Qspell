'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { toast } from 'sonner'
import { Loader2, Save, Link as LinkIcon } from 'lucide-react'
import type { Database } from '@/lib/types/database.types'

type Profile = Database['public']['Tables']['profiles']['Row']

interface EditProfileFormProps {
  profile: Profile
  onUpdate?: () => void
}

export function EditProfileForm({ profile, onUpdate }: EditProfileFormProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    display_name: profile.display_name || '',
    bio: profile.bio || '',
    discord_username: profile.discord_username || '',
    youtube_url: profile.youtube_url || '',
    twitch_url: profile.twitch_url || '',
    twitter_url: profile.twitter_url || '',
    instagram_url: profile.instagram_url || '',
    tiktok_url: profile.tiktok_url || '',
  })

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/profile/update', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        toast.error('Erreur lors de la mise à jour', {
          description: data.error
        })
        return
      }

      toast.success('Profil mis à jour avec succès !')
      onUpdate?.()
    } catch (error) {
      toast.error('Erreur de mise à jour', {
        description: error instanceof Error ? error.message : 'Une erreur est survenue'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-6">Modifier le profil</h2>

        <div className="space-y-6">
          {/* Informations de base */}
          <div className="space-y-4">
            <h3 className="font-medium text-sm text-muted-foreground">
              Informations de base
            </h3>

            <div className="space-y-2">
              <Label htmlFor="display_name">Nom d&apos;affichage</Label>
              <Input
                id="display_name"
                value={formData.display_name}
                onChange={(e) => handleChange('display_name', e.target.value)}
                placeholder="Votre nom d'affichage"
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Biographie</Label>
              <textarea
                id="bio"
                className="w-full min-h-[100px] px-3 py-2 rounded-md border border-input bg-background text-sm resize-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={formData.bio}
                onChange={(e) => handleChange('bio', e.target.value)}
                placeholder="Parlez-nous de vous..."
                disabled={loading}
                maxLength={500}
              />
              <p className="text-xs text-muted-foreground">
                {formData.bio.length}/500 caractères
              </p>
            </div>
          </div>

          {/* Réseaux sociaux */}
          <div className="space-y-4 pt-6 border-t">
            <div className="flex items-center gap-2">
              <LinkIcon className="h-4 w-4" />
              <h3 className="font-medium text-sm text-muted-foreground">
                Réseaux sociaux
              </h3>
            </div>

            <div className="space-y-2">
              <Label htmlFor="discord">
                🎮 Discord
              </Label>
              <Input
                id="discord"
                value={formData.discord_username}
                onChange={(e) => handleChange('discord_username', e.target.value)}
                placeholder="username#1234"
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="youtube">
                📹 YouTube
              </Label>
              <Input
                id="youtube"
                value={formData.youtube_url}
                onChange={(e) => handleChange('youtube_url', e.target.value)}
                placeholder="https://youtube.com/@username"
                disabled={loading}
                type="url"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="twitch">
                🎥 Twitch
              </Label>
              <Input
                id="twitch"
                value={formData.twitch_url}
                onChange={(e) => handleChange('twitch_url', e.target.value)}
                placeholder="https://twitch.tv/username"
                disabled={loading}
                type="url"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="twitter">
                🐦 Twitter / X
              </Label>
              <Input
                id="twitter"
                value={formData.twitter_url}
                onChange={(e) => handleChange('twitter_url', e.target.value)}
                placeholder="https://twitter.com/username"
                disabled={loading}
                type="url"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="instagram">
                📷 Instagram
              </Label>
              <Input
                id="instagram"
                value={formData.instagram_url}
                onChange={(e) => handleChange('instagram_url', e.target.value)}
                placeholder="https://instagram.com/username"
                disabled={loading}
                type="url"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tiktok">
                🎵 TikTok
              </Label>
              <Input
                id="tiktok"
                value={formData.tiktok_url}
                onChange={(e) => handleChange('tiktok_url', e.target.value)}
                placeholder="https://tiktok.com/@username"
                disabled={loading}
                type="url"
              />
            </div>
          </div>

          {/* Boutons d'action */}
          <div className="flex justify-end gap-3 pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => window.location.reload()}
              disabled={loading}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Enregistrement...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Enregistrer
                </>
              )}
            </Button>
          </div>
        </div>
      </Card>
    </form>
  )
}
