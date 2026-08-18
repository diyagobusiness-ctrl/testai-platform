'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'motion/react'
import { useAuthStore } from '@/store'
import { ButtonGlow } from '@/components/animations'
import { Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react'
import dynamic from 'next/dynamic'

const Scene = dynamic(() => import('@/components/3d/Scene'), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-secondary/10 to-accent/20" />
  ),
})

export default function LoginPage() {
  const router = useRouter()
  const { login, getRedirectPath, isLoading } = useAuthStore()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!email || !password) {
      setError('Please fill in all fields')
      return
    }

    const result = await login(email, password)
    if (result.success) {
      router.push(getRedirectPath())
    } else {
      setError(result.error || 'Login failed')
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center px-4">
      <Scene className="fixed inset-0 z-0" />

      <motion.div
        className="relative z-10 w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="rounded-2xl border border-border bg-card/80 p-8 shadow-xl backdrop-blur-lg">
          <motion.div
            className="mb-8 flex justify-center"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary glow-primary">
              <span className="text-2xl font-bold text-white">T</span>
            </div>
          </motion.div>

          <div className="mb-8 text-center">
            <h1 className="mb-2 text-2xl font-bold">Welcome Back</h1>
            <p className="text-muted-foreground">Sign in to continue to TestAi</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-medium">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full rounded-xl border border-border bg-background py-3 pl-10 pr-4
                             focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20
                             transition-all duration-200"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="mb-2 block text-sm font-medium">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-border bg-background py-3 pl-10 pr-12
                             focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20
                             transition-all duration-200"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-border accent-primary"
                />
                <span className="text-sm text-muted-foreground">Remember me</span>
              </label>
              <Link
                href="/forgot-password"
                className="text-sm text-primary hover:underline"
              >
                Forgot password?
              </Link>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl bg-error/10 p-3 text-sm text-error"
              >
                {error}
              </motion.div>
            )}

            <ButtonGlow
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                'Sign In'
              )}
            </ButtonGlow>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-primary hover:underline">
              Sign up for free
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
