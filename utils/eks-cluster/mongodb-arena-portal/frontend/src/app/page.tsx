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
