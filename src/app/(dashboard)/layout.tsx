import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { DashboardSidebar } from '@/components/shared/dashboard-sidebar'
import { WalletDisplay } from '@/components/shared/wallet-display'
import { Bell, Search } from 'lucide-react'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createServerClient()
  
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Sidebar */}
      <DashboardSidebar />
      
      {/* Main Content */}
      <div className="ml-64">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 h-16 bg-[#0a0a0a]/90 backdrop-blur-xl border-b border-[#1a1a1a] flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#444]" />
              <input 
                type="text" 
                placeholder="Rechercher..." 
                className="w-72 h-10 pl-10 pr-4 rounded-lg bg-[#141414] border border-[#1a1a1a] text-sm text-white placeholder:text-[#444] focus:outline-none focus:border-[#c8ff00]/50 focus:ring-1 focus:ring-[#c8ff00]/20 transition-all"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Wallet Display */}
            <WalletDisplay />
            
            <button className="relative w-10 h-10 rounded-lg bg-[#141414] border border-[#1a1a1a] flex items-center justify-center text-[#666] hover:text-white hover:border-[#c8ff00]/30 transition-all">
              <Bell className="h-5 w-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-[#c8ff00] rounded-full" />
            </button>
          </div>
        </header>
        
        {/* Page Content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
