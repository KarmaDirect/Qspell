'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Loader2, Eye, EyeOff } from 'lucide-react'

export function RegisterForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Check if username is available
      const { data: existingProfile, error: checkError } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', username)
        .maybeSingle() // Use maybeSingle() instead of single() to avoid error on no results

      // If there's an error other than "not found", show it
      if (checkError && checkError.code !== 'PGRST116') {
        toast.error('Erreur de vérification', {
          description: checkError.message,
        })
        setLoading(false)
        return
      }

      if (existingProfile) {
        toast.error('Nom d\'utilisateur déjà pris', {
          description: 'Veuillez en choisir un autre',
        })
        setLoading(false)
        return
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
            display_name: displayName || username,
          },
        },
      })

      if (error) {
        toast.error('Erreur lors de l\'inscription', {
          description: error.message,
        })
        return
      }

      if (data.user) {
        toast.success('Compte créé avec succès !', {
          description: 'Vous pouvez maintenant vous connecter',
        })
        router.push('/login')
      }
    } catch (error) {
      toast.error('Une erreur est survenue', {
        description: error instanceof Error ? error.message : 'Veuillez réessayer plus tard',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="username">Nom d&apos;utilisateur</Label>
        <Input
          id="username"
          type="text"
          placeholder="votre_pseudo"
          value={username}
          onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
          required
          disabled={loading}
          minLength={3}
          maxLength={20}
          autoComplete="username"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="displayName">Nom d&apos;affichage (optionnel)</Label>
        <Input
          id="displayName"
          type="text"
          placeholder="Votre Nom"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          disabled={loading}
          maxLength={50}
          autoComplete="name"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="votreemail@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={loading}
          autoComplete="email"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Mot de passe</Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
            minLength={6}
            className="pr-10"
            autoComplete="new-password"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            disabled={loading}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
        <p className="text-xs text-muted-foreground">
          Minimum 6 caractères
        </p>
      </div>

      <Button 
        type="submit" 
        className="w-full" 
        disabled={loading}
      >
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        S&apos;inscrire
      </Button>
    </form>
  )
}

