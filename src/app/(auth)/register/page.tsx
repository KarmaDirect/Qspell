import Link from 'next/link'
import { RegisterForm } from '@/components/auth/register-form'

export default function RegisterPage() {
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
              Rejoins les Q Gods
            </p>
          </div>

          <RegisterForm />

          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">Vous avez déjà un compte ? </span>
            <Link 
              href="/login" 
              className="text-primary hover:underline font-medium"
            >
              Se connecter
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

