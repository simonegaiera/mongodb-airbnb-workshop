'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import LeaderboardDownload from '@/components/LeaderboardDownload'
import LeaderboardExclusion from '@/components/LeaderboardExclusion'

export default function AdminPage() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [passwordInput, setPasswordInput] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  // Check authentication on mount
  useEffect(() => {
    const requiredPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD
    
    if (!requiredPassword || requiredPassword.trim() === '') {
      // No admin password set - redirect to home
      router.push('/')
      return
    }

    // Check if user was previously authenticated in this session
    const storedAuth = sessionStorage.getItem('admin_authenticated')
    if (storedAuth === 'true') {
      setIsAuthenticated(true)
    }
    
    setIsLoading(false)
  }, [router])

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const requiredPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD
    
    if (requiredPassword && passwordInput === requiredPassword) {
      setIsAuthenticated(true)
      sessionStorage.setItem('admin_authenticated', 'true')
      setPasswordError('')
      setPasswordInput('')
    } else {
      setPasswordError('Incorrect admin password. Please try again.')
      setPasswordInput('')
    }
  }

  const handleLogout = () => {
    sessionStorage.removeItem('admin_authenticated')
    setIsAuthenticated(false)
    setPasswordInput('')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen circuit-bg flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen circuit-bg flex items-center justify-center py-8">
        <div className="max-w-md w-full mx-4">
          <div className="card-arena rounded-lg shadow-lg p-8">
            {/* Header */}
            <div className="text-center mb-6">
              <h1 className="text-3xl font-bold text-arena-neon-green mb-2 neon-glow">
                Admin Portal
              </h1>
              <p className="text-gray-300 text-sm">
                Enter the admin password to continue
              </p>
            </div>

            {/* Password Form */}
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                  Admin Password
                </label>
                <input
                  type="password"
                  id="password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className="w-full px-4 py-2 bg-arena-dark-light border border-arena-teal rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-arena-neon-green focus:border-arena-neon-green"
                  placeholder="Enter admin password"
                  required
                  autoFocus
                />
              </div>
              
              {passwordError && (
                <div className="text-red-400 text-sm">
                  {passwordError}
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-arena-neon-green text-arena-dark py-2 px-4 rounded-md hover:bg-arena-bright-green focus:outline-none focus:ring-2 focus:ring-arena-neon-green focus:ring-offset-2 focus:ring-offset-arena-dark transition-colors font-semibold"
              >
                Access Admin Portal
              </button>
            </form>

            {/* Back to Home Link */}
            <div className="mt-6 text-center">
              <button
                onClick={() => router.push('/')}
                className="text-arena-teal hover:text-arena-neon-green transition-colors text-sm"
              >
                ← Back to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Authenticated - Show Admin Page
  return (
    <div className="min-h-screen circuit-bg py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-5xl font-bold text-arena-neon-green mb-2 neon-glow">
              Admin Portal
            </h1>
            <p className="text-white text-xl font-light">
              MongoDB Arena Administration
            </p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => router.push('/')}
              className="bg-arena-teal text-white py-2 px-4 rounded-md hover:bg-opacity-80 transition-colors font-semibold"
            >
              View Public Site
            </button>
            <button
              onClick={handleLogout}
              className="bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors font-semibold"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-8">
          <LeaderboardExclusion />
          <LeaderboardDownload />
        </div>
      </div>
    </div>
  )
}

