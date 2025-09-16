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

  // Show password protection banner if not authenticated
  if (isPasswordProtected && !isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full mx-auto">
          <div className="bg-white shadow-lg rounded-lg p-8">
            <div className="text-center mb-6">
              <h1 className="text-3xl font-bold text-mongodb-dark mb-2">
                MongoDB Arena Portal
              </h1>
              <p className="text-gray-600">
                Access to the portal has been temporarily disabled due to too many requests. Please try again later.
              </p>
            </div>
            
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Enter Password
                </label>
                <input
                  type="password"
                  id="password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-mongodb-green focus:border-mongodb-green"
                  placeholder="Password"
                  required
                />
              </div>
              
              {passwordError && (
                <div className="text-red-600 text-sm">
                  {passwordError}
                </div>
              )}
              
              <button
                type="submit"
                className="w-full bg-mongodb-green text-white py-2 px-4 rounded-md hover:bg-mongodb-green-dark focus:outline-none focus:ring-2 focus:ring-mongodb-green focus:ring-offset-2 transition-colors"
              >
                Access Portal
              </button>
            </form>
            
            <div className="mt-6 text-center text-xs text-gray-500">
              Protected by environment variable authentication
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold text-mongodb-dark mb-4">
            MongoDB Arena Portal
          </h1>
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
              <TakeParticipantForm
                onSuccess={handleSuccess}
                onError={handleError}
                onLoading={setFormLoading}
              />
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
            <Leaderboard refreshTrigger={refreshKey} />
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
