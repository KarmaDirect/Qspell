'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ImageUpload } from '@/components/ui/image-upload'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Loader2, X } from 'lucide-react'

interface CoachingSessionModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function CoachingSessionModal({ isOpen, onClose, onSuccess }: CoachingSessionModalProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    banner_url: '',
    type: 'private', // private, group, course
    price: '',
    duration: '',
    max_participants: '',
    topics: '',
  })

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const supabase = createClient()

      // Here you would insert into a coaching_sessions table
      // For now, just show success
      toast.success('Session de coaching créée avec succès')
      onSuccess()
      onClose()
    } catch (error) {
      console.error('Error creating coaching session:', error)
      toast.error('Erreur lors de la création de la session')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
      <div className="relative w-full max-w-2xl bg-[#141414] border border-[#1a1a1a] rounded-lg shadow-xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-[#141414] border-b border-[#1a1a1a] p-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Créer une session de coaching</h2>
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
            aspectRatio="wide"
            label="Bannière de la session"
            description="Image d'en-tête pour la session de coaching (recommandé: 1920x1080px)"
            bucket="coaching"
            path="sessions"
            maxSize={5}
          />

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-white">Titre *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Ex: Coaching Mid Lane Avancé"
              disabled={loading}
              required
              className="bg-[#0a0a0a] border-[#1a1a1a] text-white"
            />
          </div>

          {/* Type */}
          <div className="space-y-2">
            <Label className="text-white">Type de session *</Label>
            <Select
              value={formData.type}
              onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}
              disabled={loading}
            >
              <SelectTrigger className="bg-[#0a0a0a] border-[#1a1a1a] text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="private">Coaching Privé (1-on-1)</SelectItem>
                <SelectItem value="group">Coaching Groupe</SelectItem>
                <SelectItem value="course">Cours en ligne</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Price & Duration */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price" className="text-white">Prix (€) *</Label>
              <Input
                id="price"
                type="number"
                value={formData.price}
                onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                placeholder="25"
                disabled={loading}
                required
                className="bg-[#0a0a0a] border-[#1a1a1a] text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration" className="text-white">Durée (minutes) *</Label>
              <Input
                id="duration"
                type="number"
                value={formData.duration}
                onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                placeholder="60"
                disabled={loading}
                required
                className="bg-[#0a0a0a] border-[#1a1a1a] text-white"
              />
            </div>
          </div>

          {/* Max Participants (for group sessions) */}
          {formData.type === 'group' && (
            <div className="space-y-2">
              <Label htmlFor="max_participants" className="text-white">
                Participants maximum
              </Label>
              <Input
                id="max_participants"
                type="number"
                value={formData.max_participants}
                onChange={(e) => setFormData(prev => ({ ...prev, max_participants: e.target.value }))}
                placeholder="5"
                disabled={loading}
                className="bg-[#0a0a0a] border-[#1a1a1a] text-white"
              />
            </div>
          )}

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-white">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Décrivez cette session de coaching..."
              rows={4}
              disabled={loading}
              className="bg-[#0a0a0a] border-[#1a1a1a] text-white resize-none"
            />
          </div>

          {/* Topics */}
          <div className="space-y-2">
            <Label htmlFor="topics" className="text-white">Sujets abordés</Label>
            <Input
              id="topics"
              value={formData.topics}
              onChange={(e) => setFormData(prev => ({ ...prev, topics: e.target.value }))}
              placeholder="Macro, Wave Management, Trading..."
              disabled={loading}
              className="bg-[#0a0a0a] border-[#1a1a1a] text-white"
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
                  Création...
                </>
              ) : (
                'Créer'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

