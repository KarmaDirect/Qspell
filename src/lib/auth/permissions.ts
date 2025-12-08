/**
 * Middleware et helpers pour la vérification des permissions
 * et la protection des routes basées sur les rôles
 */

import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { UserRole, Permission, hasPermission, isAdminRole } from './roles'

/**
 * Récupère le profil et le rôle de l'utilisateur connecté
 */
export async function getCurrentUserRole(): Promise<{
  userId: string
  role: UserRole
} | null> {
  const supabase = await createServerClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single<{ role: UserRole }>()

  if (!profile) {
    return null
  }

  return {
    userId: user.id,
    role: profile.role,
  }
}

/**
 * Vérifie si l'utilisateur connecté a une permission spécifique
 */
export async function checkPermission(permission: Permission): Promise<boolean> {
  const userRole = await getCurrentUserRole()
  
  if (!userRole) {
    return false
  }

  return hasPermission(userRole.role, permission)
}

/**
 * Vérifie si l'utilisateur connecté a un des rôles spécifiés
 */
export async function checkRole(allowedRoles: UserRole[]): Promise<boolean> {
  const userRole = await getCurrentUserRole()
  
  if (!userRole) {
    return false
  }

  return allowedRoles.includes(userRole.role)
}

/**
 * Vérifie si l'utilisateur connecté est un admin (admin ou CEO)
 */
export async function checkIsAdmin(): Promise<boolean> {
  const userRole = await getCurrentUserRole()
  
  if (!userRole) {
    return false
  }

  return isAdminRole(userRole.role)
}

/**
 * Middleware: Require une permission spécifique
 * Redirige vers /dashboard si l'utilisateur n'a pas la permission
 */
export async function requirePermission(permission: Permission) {
  const hasRequiredPermission = await checkPermission(permission)
  
  if (!hasRequiredPermission) {
    redirect('/dashboard')
  }
}

/**
 * Middleware: Require un des rôles spécifiés
 * Redirige vers /dashboard si l'utilisateur n'a pas le bon rôle
 */
export async function requireRole(allowedRoles: UserRole[]) {
  const hasRequiredRole = await checkRole(allowedRoles)
  
  if (!hasRequiredRole) {
    redirect('/dashboard')
  }
}

/**
 * Middleware: Require un rôle admin (admin ou CEO)
 * Redirige vers /dashboard si l'utilisateur n'est pas admin
 */
export async function requireAdmin() {
  const isAdmin = await checkIsAdmin()
  
  if (!isAdmin) {
    redirect('/dashboard')
  }
}

/**
 * Middleware: Require l'authentification
 * Redirige vers /login si l'utilisateur n'est pas connecté
 */
export async function requireAuth() {
  const supabase = await createServerClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return user
}

/**
 * Helper: Vérifie si l'utilisateur peut accéder à une ressource
 * basé sur la propriété (ownership)
 */
export async function checkOwnership(resourceOwnerId: string): Promise<boolean> {
  const userRole = await getCurrentUserRole()
  
  if (!userRole) {
    return false
  }

  // Les admins ont toujours accès
  if (isAdminRole(userRole.role)) {
    return true
  }

  // Sinon, vérifier la propriété
  return userRole.userId === resourceOwnerId
}

/**
 * Helper: Vérifie si l'utilisateur peut modifier une ressource
 * Soit il est propriétaire, soit il est admin
 */
export async function canModifyResource(resourceOwnerId: string): Promise<boolean> {
  return await checkOwnership(resourceOwnerId)
}

/**
 * Type guard pour vérifier qu'une valeur est un UserRole valide
 */
export function isValidUserRole(role: string): role is UserRole {
  return ['user', 'coach', 'tournament_organizer', 'manager', 'admin', 'ceo'].includes(role)
}
