'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Gamepad2, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export function RiotAccountButton() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [gameName, setGameName] = useState('')
  const [tagLine, setTagLine] = useState('')
  const [region, setRegion] = useState('euw1')

  const handleAddAccount = async () => {
    if (!gameName || !tagLine) {
      toast.error('Veuillez remplir tous les champs')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/riot/add-account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          gameName,
          tagLine,
          region,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        toast.error('Erreur lors de l\'ajout du compte', {
          description: data.error || 'Une erreur est survenue'
        })
        return
      }

      toast.success('Compte Riot ajouté avec succès !')
      setOpen(false)
      setGameName('')
      setTagLine('')
      window.location.reload()
    } catch (error) {
      toast.error('Erreur lors de la recherche du compte', {
        description: error instanceof Error ? error.message : 'Vérifiez que le nom et le tag sont corrects'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className="gap-2 border-[#1a1a1a] text-[#888] hover:text-white hover:bg-[#1a1a1a]"
        >
          <Gamepad2 className="h-4 w-4" />
          Lier compte Riot
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-[#141414] border-[#1a1a1a]">
        <DialogHeader>
          <DialogTitle className="text-white">Lier un compte Riot Games</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="gameName" className="text-[#888]">Nom d&apos;invocateur</Label>
            <Input
              id="gameName"
              placeholder="Faker"
              value={gameName}
              onChange={(e) => setGameName(e.target.value)}
              disabled={loading}
              className="bg-[#0a0a0a] border-[#1a1a1a] text-white"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tagLine" className="text-[#888]">Tag</Label>
            <Input
              id="tagLine"
              placeholder="EUW"
              value={tagLine}
              onChange={(e) => setTagLine(e.target.value.toUpperCase())}
              disabled={loading}
              className="bg-[#0a0a0a] border-[#1a1a1a] text-white"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="region" className="text-[#888]">Région</Label>
            <Select value={region} onValueChange={setRegion} disabled={loading}>
              <SelectTrigger className="bg-[#0a0a0a] border-[#1a1a1a] text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#141414] border-[#1a1a1a]">
                <SelectItem value="euw1">EUW (Europe West)</SelectItem>
                <SelectItem value="eune1">EUNE (Europe Nordic & East)</SelectItem>
                <SelectItem value="na1">NA (North America)</SelectItem>
                <SelectItem value="kr">KR (Korea)</SelectItem>
                <SelectItem value="br1">BR (Brazil)</SelectItem>
                <SelectItem value="la1">LAN (Latin America North)</SelectItem>
                <SelectItem value="la2">LAS (Latin America South)</SelectItem>
                <SelectItem value="oc1">OCE (Oceania)</SelectItem>
                <SelectItem value="tr1">TR (Turkey)</SelectItem>
                <SelectItem value="ru">RU (Russia)</SelectItem>
                <SelectItem value="jp1">JP (Japan)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button 
            onClick={handleAddAccount} 
            className="w-full bg-[#c8ff00] text-black hover:bg-[#b8ef00] font-semibold"
            disabled={loading}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Ajouter le compte
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

