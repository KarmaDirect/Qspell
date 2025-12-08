'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ImageUpload } from '@/components/ui/image-upload'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Loader2, X } from 'lucide-react'
import type { Database } from '@/lib/types/database.types'

type Profile = Database['public']['Tables']['profiles']['Row']

interface ProfileEditModalProps {
  profile: Profile
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function ProfileEditModal({ profile, isOpen, onClose, onSuccess }: ProfileEditModalProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    display_name: profile.display_name || '',
    bio: profile.bio || '',
    avatar_url: profile.avatar_url || '',
    banner_url: profile.banner_url || ''
  })

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const supabase = createClient()

      const { error } = await supabase
        .from('profiles')
        .update({
          display_name: formData.display_name || null,
          bio: formData.bio || null,
          avatar_url: formData.avatar_url || null,
          banner_url: formData.banner_url || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', profile.id)

      if (error) throw error

      toast.success('Profil mis à jour avec succès')
      onSuccess()
      onClose()
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error('Erreur lors de la mise à jour du profil')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
      <div className="relative w-full max-w-2xl bg-[#141414] border border-[#1a1a1a] rounded-lg shadow-xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-[#141414] border-b border-[#1a1a1a] p-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Modifier le profil</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-[#666] hover:text-white"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Banner Upload */}
          <ImageUpload
            value={formData.banner_url}
            onChange={(url) => setFormData(prev => ({ ...prev, banner_url: url }))}
            onRemove={() => setFormData(prev => ({ ...prev, banner_url: '' }))}
            disabled={loading}
            aspectRatio="banner"
            label="Bannière"
            description="Image d'arrière-plan de votre profil (recommandé: 1200x400px)"
            bucket="profiles"
            path="banners"
            maxSize={5}
          />

          {/* Avatar Upload */}
          <ImageUpload
            value={formData.avatar_url}
            onChange={(url) => setFormData(prev => ({ ...prev, avatar_url: url }))}
            onRemove={() => setFormData(prev => ({ ...prev, avatar_url: '' }))}
            disabled={loading}
            aspectRatio="square"
            label="Photo de profil"
            description="Votre avatar (recommandé: 400x400px)"
            bucket="profiles"
            path="avatars"
            maxSize={2}
          />

          {/* Display Name */}
          <div className="space-y-2">
            <Label htmlFor="display_name" className="text-white">Nom d'affichage</Label>
            <Input
              id="display_name"
              value={formData.display_name}
              onChange={(e) => setFormData(prev => ({ ...prev, display_name: e.target.value }))}
              placeholder="Votre nom complet"
              disabled={loading}
              className="bg-[#0a0a0a] border-[#1a1a1a] text-white"
            />
          </div>

          {/* Bio */}
          <div className="space-y-2">
            <Label htmlFor="bio" className="text-white">Biographie</Label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
              placeholder="Parlez-nous de vous..."
              rows={4}
              disabled={loading}
              className="bg-[#0a0a0a] border-[#1a1a1a] text-white resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="flex-1 border-[#1a1a1a] text-[#888] hover:text-white hover:bg-[#1a1a1a]"
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-[#c8ff00] text-black hover:bg-[#b8ef00] font-semibold"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Enregistrement...
                </>
              ) : (
                'Enregistrer'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

