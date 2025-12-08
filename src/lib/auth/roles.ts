/**
 * Système de rôles et permissions pour QSPELL
 * 
 * Ce fichier définit les types et fonctions pour gérer
 * les rôles utilisateurs et leurs permissions.
 */

export type UserRole = 
  | 'user'                    // Utilisateur standard
  | 'coach'                   // Coach - peut créer des sessions de coaching
  | 'tournament_organizer'    // Organisateur - peut créer et gérer des tournois
  | 'manager'                 // Manager - peut gérer des équipes
  | 'admin'                   // Admin - modération et gestion
  | 'ceo'                     // CEO - accès total

export type Permission =
  // Permissions CEO uniquement
  | 'manage_roles'
  | 'system_settings'
  
  // Permissions Admin+
  | 'manage_users'
  | 'moderate_content'
  | 'view_analytics'
  
  // Permissions de gestion
  | 'manage_tournaments'
  | 'create_tournament'
  | 'manage_own_tournaments'
  | 'view_tournament_analytics'
  
  | 'manage_teams'
  | 'view_team_analytics'
  
  | 'manage_coaching'
  | 'create_coaching_session'
  | 'manage_own_sessions'
  | 'view_coaching_analytics'
  
  | 'manage_calendar'
  
  // Permissions utilisateur basiques
  | 'join_tournament'
  | 'join_team'
  | 'book_coaching'

/**
 * Définition des permissions par rôle
 */
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  ceo: [
    'manage_roles',
    'system_settings',
    'manage_users',
    'moderate_content',
    'view_analytics',
    'manage_tournaments',
    'manage_teams',
    'manage_coaching',
    'manage_calendar',
    'create_tournament',
    'create_coaching_session',
    'join_tournament',
    'join_team',
    'book_coaching',
  ],
  
  admin: [
    'manage_users',
    'moderate_content',
    'view_analytics',
    'manage_tournaments',
    'manage_teams',
    'manage_coaching',
    'manage_calendar',
    'create_tournament',
    'create_coaching_session',
    'join_tournament',
    'join_team',
    'book_coaching',
  ],
  
  tournament_organizer: [
    'create_tournament',
    'manage_own_tournaments',
    'view_tournament_analytics',
    'join_tournament',
    'join_team',
    'book_coaching',
  ],
  
  coach: [
    'create_coaching_session',
    'manage_own_sessions',
    'view_coaching_analytics',
    'join_tournament',
    'join_team',
    'book_coaching',
  ],
  
  manager: [
    'manage_teams',
    'view_team_analytics',
    'join_tournament',
    'join_team',
    'book_coaching',
  ],
  
  user: [
    'join_tournament',
    'join_team',
    'book_coaching',
  ],
}

/**
 * Labels français pour les rôles
 */
export const ROLE_LABELS: Record<UserRole, string> = {
  user: 'Utilisateur',
  coach: 'Coach',
  tournament_organizer: 'Organisateur de tournois',
  manager: 'Manager',
  admin: 'Administrateur',
  ceo: 'CEO',
}

/**
 * Descriptions des rôles
 */
export const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  user: 'Utilisateur standard avec accès de base à la plateforme',
  coach: 'Peut créer et gérer des sessions de coaching',
  tournament_organizer: 'Peut créer et organiser des tournois',
  manager: 'Peut gérer des équipes et des joueurs',
  admin: 'Accès à la modération et à la gestion de la plateforme',
  ceo: 'Accès total à toutes les fonctionnalités de la plateforme',
}

/**
 * Couleurs associées aux rôles (pour l'UI)
 */
export const ROLE_COLORS: Record<UserRole, string> = {
  user: 'gray',
  coach: 'green',
  tournament_organizer: 'yellow',
  manager: 'blue',
  admin: 'red',
  ceo: 'purple',
}

/**
 * Vérifie si un rôle a une permission spécifique
 */
export function hasPermission(role: UserRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role].includes(permission)
}

/**
 * Vérifie si un rôle a au moins une des permissions spécifiées
 */
export function hasAnyPermission(role: UserRole, permissions: Permission[]): boolean {
  return permissions.some(permission => hasPermission(role, permission))
}

/**
 * Vérifie si un rôle a toutes les permissions spécifiées
 */
export function hasAllPermissions(role: UserRole, permissions: Permission[]): boolean {
  return permissions.every(permission => hasPermission(role, permission))
}

/**
 * Vérifie si un rôle est un rôle administratif (admin ou CEO)
 */
export function isAdminRole(role: UserRole): boolean {
  return role === 'admin' || role === 'ceo'
}

/**
 * Vérifie si un rôle est CEO
 */
export function isCEO(role: UserRole): boolean {
  return role === 'ceo'
}

/**
 * Obtient tous les rôles disponibles (sauf CEO qui est unique)
 */
export function getAssignableRoles(): UserRole[] {
  return ['user', 'coach', 'tournament_organizer', 'manager', 'admin']
}

/**
 * Obtient tous les rôles disponibles incluant CEO (pour les super admins)
 */
export function getAllRoles(): UserRole[] {
  return ['user', 'coach', 'tournament_organizer', 'manager', 'admin', 'ceo']
}

/**
 * Vérifie si un utilisateur peut assigner un rôle spécifique
 * Seul le CEO peut assigner le rôle admin ou CEO
 */
export function canAssignRole(assignerRole: UserRole, targetRole: UserRole): boolean {
  if (targetRole === 'ceo') {
    return assignerRole === 'ceo'
  }
  
  if (targetRole === 'admin') {
    return assignerRole === 'ceo'
  }
  
  return isAdminRole(assignerRole)
}

