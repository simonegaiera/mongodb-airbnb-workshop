'use client'

import { useState, useEffect } from 'react'
import ParticipantsSection from '@/components/ParticipantsSection'
import TakeParticipantForm from '@/components/TakeParticipantForm'
import AvailableCount from '@/components/AvailableCount'
import Alert from '@/components/Alert'
import Leaderboard from '@/components/Leaderboard'
import ThreeStepsSection from '@/components/ThreeStepsSection'

export default function Home() {
  const [formLoading, setFormLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [refreshKey, setRefreshKey] = useState(0)
  
  // Password protection state
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [passwordInput, setPasswordInput] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [isPasswordProtected, setIsPasswordProtected] = useState(false)
  
  // Leaderboard freeze date
  const [closeDate, setCloseDate] = useState<string | null>(null)

  // Check if password protection is enabled and validate stored auth
  useEffect(() => {
    const requiredPassword = process.env.NEXT_PUBLIC_ACCESS_PASSWORD
    
    // Only enable password protection if environment variable is set and not empty
    if (requiredPassword && requiredPassword.trim() !== '') {
      setIsPasswordProtected(true)
      // Check if user was previously authenticated in this session
      const storedAuth = sessionStorage.getItem('arena_authenticated')
      if (storedAuth === 'true') {
        setIsAuthenticated(true)
      }
    } else {
      // No password required - env var is null, undefined, or empty string
      setIsAuthenticated(true)
      setIsPasswordProtected(false)
    }
  }, [])

  // Fetch prize close date
  useEffect(() => {
    const fetchCloseDate = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
        const response = await fetch(`${apiUrl}/api/admin/prizes/close-date`)
        const data = await response.json()
        
        if (data.success && data.close_on) {
          setCloseDate(data.close_on)
        }
      } catch (err) {
        console.error('Error fetching close date:', err)
      }
    }
    
    fetchCloseDate()
  }, [])

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const requiredPassword = process.env.NEXT_PUBLIC_ACCESS_PASSWORD
    
    if (requiredPassword && requiredPassword.trim() !== '' && passwordInput === requiredPassword) {
      setIsAuthenticated(true)
      sessionStorage.setItem('arena_authenticated', 'true')
      setPasswordError('')
    } else {
      setPasswordError('Incorrect password. Please try again.')
      setPasswordInput('')
    }
  }

  const handleSuccess = () => {
    setSuccess('Participant successfully assigned!')
    setRefreshKey(prev => prev + 1) // Trigger refresh for both AvailableCount and ParticipantsSection
    // Clear success message after 5 seconds
    setTimeout(() => setSuccess(''), 5000)
  }

  const handleError = (errorMessage: string) => {
    setError(errorMessage)
    if (errorMessage) {
      // Clear error message after 10 seconds
      setTimeout(() => setError(''), 10000)
    }
  }


  return (
    <div className="min-h-screen circuit-bg py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div className="flex-1"></div>
          <div className="flex-1 text-center">
            <h1 className="text-5xl font-bold text-arena-neon-green mb-2 neon-glow whitespace-nowrap">
              Step Into the AI Arena
            </h1>
            <p className="text-white text-xl font-light">
              MongoDB Arena Portal
            </p>
          </div>
          <div className="flex-1 flex justify-end">
            {/* Admin Button */}
            <a
              href="/admin"
              className="bg-arena-teal text-white py-2 px-4 rounded-md hover:bg-opacity-80 transition-colors font-semibold"
            >
              Admin Portal
            </a>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <Alert 
            type="error" 
            message={error} 
            onClose={() => setError('')} 
          />
        )}

        {success && (
          <Alert 
            type="success" 
            message={success} 
            onClose={() => setSuccess('')} 
          />
        )}

        {/* Main Content Layout */}
        <div className="space-y-8">
          {/* Top Row: Form (left) and Active Count (right) */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* New to Arena Form - Takes 3/4 width */}
            <div className="lg:col-span-3">
              {isPasswordProtected && !isAuthenticated ? (
                <div className="card-arena rounded-lg shadow-lg p-6">
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-arena-neon-green mb-2">
                      New to Arena?
                    </h3>
                    <p className="text-gray-300 text-sm mb-4">
                      Access to the form has been temporarily disabled due to too many requests. Please try again later.
                    </p>
                  </div>
                  
                  <form onSubmit={handlePasswordSubmit} className="space-y-4">
                    <div>
                      <div className="flex gap-2">
                        <input
                          type="password"
                          id="password"
                          value={passwordInput}
                          onChange={(e) => setPasswordInput(e.target.value)}
                          className="flex-1 px-3 py-2 bg-arena-dark-light border border-arena-teal rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-arena-neon-green focus:border-arena-neon-green"
                          placeholder="Password"
                          required
                        />
                        <button
                          type="submit"
                          className="bg-arena-neon-green text-arena-dark py-2 px-4 rounded-md hover:bg-arena-bright-green focus:outline-none focus:ring-2 focus:ring-arena-neon-green focus:ring-offset-2 focus:ring-offset-arena-dark transition-colors whitespace-nowrap font-semibold"
                        >
                          Access Form
                        </button>
                      </div>
                    </div>
                    
                    {passwordError && (
                      <div className="text-red-400 text-sm">
                        {passwordError}
                      </div>
                    )}
                  </form>
                </div>
              ) : (
                <TakeParticipantForm
                  onSuccess={handleSuccess}
                  onError={handleError}
                  onLoading={setFormLoading}
                />
              )}
            </div>
            
            {/* Active Participants Count - Takes 1/4 width */}
            <div className="lg:col-span-1">
              <AvailableCount refreshTrigger={refreshKey} />
            </div>
          </div>

          {/* Three Steps Section - Full Width */}
          <div className="w-full">
            <ThreeStepsSection />
          </div>

          {/* Leaderboard Section - Full Width */}
          <div className="w-full">
            <Leaderboard refreshTrigger={refreshKey} closeDate={closeDate} />
          </div>

          {/* Bottom Row: Participants Section - Full Width */}
          <div className="w-full">
            <ParticipantsSection refreshTrigger={refreshKey} />
          </div>
        </div>
      </div>
    </div>
  )
}
