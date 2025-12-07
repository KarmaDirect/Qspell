import Link from 'next/link'
import { LoginForm } from '@/components/auth/login-form'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-950 via-slate-900 to-purple-950">
      <div className="w-full max-w-md p-8">
        <div className="bg-card border rounded-lg shadow-2xl p-8">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <span className="text-4xl">⚡</span>
              <h1 className="text-3xl font-bold bg-linear-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                QSPELL
              </h1>
              <span className="text-4xl">⚡</span>
            </div>
            <p className="text-muted-foreground mt-2">
              Connecte-toi pour devenir un Q Master
            </p>
          </div>

          <LoginForm />

          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">Pas encore de compte ? </span>
            <Link 
              href="/register" 
              className="text-primary hover:underline font-medium"
            >
              S&apos;inscrire
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

