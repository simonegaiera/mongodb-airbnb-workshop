'use client'

import { useState, useEffect } from 'react'
import ParticipantsGrid from '@/components/ParticipantsGrid'
import TakeParticipantForm from '@/components/TakeParticipantForm'
import AvailableCount from '@/components/AvailableCount'
import Alert from '@/components/Alert'

interface Participant {
  id: string
  name?: string
  email?: string
  taken?: boolean
  insert_timestamp?: string
}

export default function Home() {
  const [participants, setParticipants] = useState<Participant[]>([])
  const [loading, setLoading] = useState(true)
  const [formLoading, setFormLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [refreshKey, setRefreshKey] = useState(0)

  // Extract the domain from the API URL to create the instructions URL
  const getInstructionsUrl = () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
    
    try {
      const url = new URL(apiUrl)
      const hostname = url.hostname
      
      // If it's localhost or IP, use fallback
      if (hostname === 'localhost' || /^\d+\.\d+\.\d+\.\d+$/.test(hostname)) {
        return 'https://instructions.mongoai.mongogameday.com/'
      }
      
      // Extract the base domain (last two parts of the hostname)
      const parts = hostname.split('.')
      if (parts.length >= 2) {
        const baseDomain = parts.slice(-2).join('.')
        return `https://instructions.${baseDomain}/`
      }
      
      // Fallback
      return `https://instructions.${hostname}/`
    } catch (error) {
      // Fallback for invalid URLs
      return 'https://instructions.mongoai.mongogameday.com/'
    }
  }

  const fetchParticipants = async () => {
    try {
      setLoading(true)
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
      const response = await fetch(`${apiUrl}/api/participants`)
      const data = await response.json()
      
      if (data.success) {
        setParticipants(data.data)
        setError('')
      } else {
        setError(data.error || 'Failed to fetch participants')
      }
    } catch (err) {
      setError('Network error: ' + (err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchParticipants()
  }, [])

  const handleSuccess = () => {
    setSuccess('Participant successfully assigned!')
    fetchParticipants()
    setRefreshKey(prev => prev + 1) // Trigger refresh for AvailableCount
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <div className="animate-spin inline-block w-8 h-8 border-4 border-current border-t-transparent text-mongodb-green rounded-full" role="status" aria-label="loading">
              <span className="sr-only">Loading...</span>
            </div>
            <p className="mt-4 text-gray-600">Loading participants...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-mongodb-dark mb-4">
            MongoDB Arena Portal
          </h1>
          <p className="text-xl text-gray-700 flex items-center justify-center gap-2">
            <span className="font-semibold">Instructions to:</span>
            <a
              href={getInstructionsUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="text-mongodb-green font-extrabold underline hover:text-mongodb-dark transition-colors"
              style={{ textDecorationThickness: '2px' }}
            >
              AI Arena
            </a>
          </p>
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* New to Arena Form - Top Left */}
            <div>
              <TakeParticipantForm
                onSuccess={handleSuccess}
                onError={handleError}
                onLoading={setFormLoading}
              />
            </div>
            
            {/* Active Participants Count - Top Right */}
            <div>
              <AvailableCount refreshTrigger={refreshKey} />
            </div>
          </div>

          {/* Bottom Row: Participants Section - Full Width */}
          <div className="w-full">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-gray-900">
                  Participants
                </h2>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-mongodb-light text-mongodb-dark">
                  {participants.length} total
                </span>
              </div>
              
              <ParticipantsGrid 
                participants={participants} 
                onRefresh={fetchParticipants} 
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
