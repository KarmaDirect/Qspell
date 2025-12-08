import { ReactNode } from 'react'
import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { UserRole } from '@/lib/auth/roles'

interface AdminLayoutProps {
  children: ReactNode
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
  const supabase = await createServerClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single<{ role: UserRole }>()

  if (!profile || !['admin', 'ceo'].includes(profile.role)) {
    redirect('/dashboard')
  }

  // Same layout as user dashboard - just render children
  return <>{children}</>
}

