'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import { Search, Shield, Edit, Loader2, User } from 'lucide-react'
import { 
  UserRole, 
  ROLE_LABELS, 
  ROLE_COLORS, 
  ROLE_DESCRIPTIONS,
  getAssignableRoles,
  getAllRoles,
  canAssignRole
} from '@/lib/auth/roles'

interface UserProfile {
  id: string
  username: string
  display_name: string
  avatar_url: string | null
  role: UserRole
  created_at: string
  riot_accounts: Array<{
    game_name: string
    tag_line: string
  }>
}

interface UserRoleManagerProps {
  currentUserRole: UserRole
}

export function UserRoleManager({ currentUserRole }: UserRoleManagerProps) {
  const supabase = createClient()
  const [users, setUsers] = useState<UserProfile[]>([])
  const [filteredUsers, setFilteredUsers] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all')
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null)
  const [newRole, setNewRole] = useState<UserRole>('user')
  const [updating, setUpdating] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)

  useEffect(() => {
    loadUsers()
  }, [])

  useEffect(() => {
    filterUsers()
  }, [searchQuery, roleFilter, users])

  const loadUsers = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/users')
      
      if (!response.ok) {
        throw new Error('Erreur lors du chargement des utilisateurs')
      }

      const data = await response.json()
      setUsers(data.users || [])
    } catch (error) {
      console.error('Error loading users:', error)
      toast.error('Erreur lors du chargement des utilisateurs')
    } finally {
      setLoading(false)
    }
  }

  const filterUsers = () => {
    let filtered = users

    // Filtrer par recherche
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(user => 
        user.username.toLowerCase().includes(query) ||
        user.display_name?.toLowerCase().includes(query) ||
        user.riot_accounts.some(acc => 
          `${acc.game_name}#${acc.tag_line}`.toLowerCase().includes(query)
        )
      )
    }

    // Filtrer par rôle
    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter)
    }

    setFilteredUsers(filtered)
  }

  const openEditDialog = (user: UserProfile) => {
    setSelectedUser(user)
    setNewRole(user.role)
    setDialogOpen(true)
  }

  const handleUpdateRole = async () => {
    if (!selectedUser) return

    // Vérifier si l'utilisateur actuel peut assigner ce rôle
    if (!canAssignRole(currentUserRole, newRole)) {
      toast.error('Vous n\'avez pas les permissions pour assigner ce rôle')
      return
    }

    if (newRole === selectedUser.role) {
      toast.info('Le rôle est déjà le même')
      setDialogOpen(false)
      return
    }

    try {
      setUpdating(true)

      const response = await fetch('/api/admin/users/update-role', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: selectedUser.id,
          newRole,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erreur lors de la mise à jour')
      }

      toast.success(`Rôle de ${selectedUser.username} mis à jour avec succès`)
      
      // Recharger les utilisateurs
      await loadUsers()
      setDialogOpen(false)
    } catch (error) {
      console.error('Error updating role:', error)
      toast.error(error instanceof Error ? error.message : 'Erreur lors de la mise à jour du rôle')
    } finally {
      setUpdating(false)
    }
  }

  const getRoleBadgeColor = (role: UserRole) => {
    const colorMap = {
      gray: 'bg-gray-500',
      green: 'bg-green-500',
      yellow: 'bg-yellow-500',
      blue: 'bg-blue-500',
      red: 'bg-red-500',
      purple: 'bg-purple-500',
    }
    return colorMap[ROLE_COLORS[role] as keyof typeof colorMap] || 'bg-gray-500'
  }

  const availableRoles = currentUserRole === 'ceo' ? getAllRoles() : getAssignableRoles()

  if (loading) {
    return (
      <Card className="p-12 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filtres */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher par nom, username ou Riot ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select
            value={roleFilter}
            onValueChange={(value) => setRoleFilter(value as UserRole | 'all')}
          >
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Filtrer par rôle" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les rôles</SelectItem>
              {availableRoles.map(role => (
                <SelectItem key={role} value={role}>
                  {ROLE_LABELS[role]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Stats rapides */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <Card className="p-4">
          <div className="text-2xl font-bold">{users.length}</div>
          <div className="text-sm text-muted-foreground">Total</div>
        </Card>
        {availableRoles.map(role => {
          const count = users.filter(u => u.role === role).length
          return (
            <Card key={role} className="p-4">
              <div className="text-2xl font-bold">{count}</div>
              <div className="text-sm text-muted-foreground">{ROLE_LABELS[role]}</div>
            </Card>
          )
        })}
      </div>

      {/* Table des utilisateurs */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Utilisateur</TableHead>
              <TableHead>Riot ID</TableHead>
              <TableHead>Rôle</TableHead>
              <TableHead>Inscrit le</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  Aucun utilisateur trouvé
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {user.avatar_url ? (
                        <img 
                          src={user.avatar_url} 
                          alt={user.username}
                          className="h-8 w-8 rounded-full"
                        />
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                          <User className="h-4 w-4 text-muted-foreground" />
                        </div>
                      )}
                      <div>
                        <div className="font-medium">{user.username}</div>
                        {user.display_name && (
                          <div className="text-xs text-muted-foreground">
                            {user.display_name}
                          </div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {user.riot_accounts.length > 0 ? (
                      <div className="text-sm">
                        {user.riot_accounts[0].game_name}#{user.riot_accounts[0].tag_line}
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">Non lié</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge className={getRoleBadgeColor(user.role)}>
                      {ROLE_LABELS[user.role]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {new Date(user.created_at).toLocaleDateString('fr-FR')}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditDialog(user)}
                      className="gap-2"
                    >
                      <Edit className="h-4 w-4" />
                      Modifier
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Dialog de modification du rôle */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Modifier le rôle de {selectedUser?.username}
            </DialogTitle>
            <DialogDescription>
              Attribuez un nouveau rôle à cet utilisateur. Cela changera ses permissions immédiatement.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Rôle actuel</label>
              <div className="flex items-center gap-2">
                <Badge className={selectedUser ? getRoleBadgeColor(selectedUser.role) : ''}>
                  {selectedUser && ROLE_LABELS[selectedUser.role]}
                </Badge>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Nouveau rôle</label>
              <Select
                value={newRole}
                onValueChange={(value) => setNewRole(value as UserRole)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {availableRoles.map(role => (
                    <SelectItem 
                      key={role} 
                      value={role}
                      disabled={!canAssignRole(currentUserRole, role)}
                    >
                      <div className="flex flex-col items-start">
                        <span>{ROLE_LABELS[role]}</span>
                        <span className="text-xs text-muted-foreground">
                          {ROLE_DESCRIPTIONS[role]}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              disabled={updating}
            >
              Annuler
            </Button>
            <Button
              onClick={handleUpdateRole}
              disabled={updating || newRole === selectedUser?.role}
            >
              {updating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Mettre à jour
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

