'use client'

import { useState, useEffect } from 'react'
import ParticipantsGrid from './ParticipantsGrid'

interface Participant {
  _id: string
  name?: string
  email?: string
  taken?: boolean
  insert_timestamp?: string
}

interface ParticipantsSectionProps {
  refreshTrigger?: number
}

const ParticipantsSection: React.FC<ParticipantsSectionProps> = ({ refreshTrigger = 0 }) => {
  const [participants, setParticipants] = useState<Participant[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  
  // State for collapsible participants (default expanded)
  const [participantsExpanded, setParticipantsExpanded] = useState(true)

  const toggleParticipants = () => {
    setParticipantsExpanded(prev => !prev)
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
  }, [refreshTrigger])

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="text-center py-8">
          <div className="animate-spin inline-block w-8 h-8 border-4 border-current border-t-transparent text-mongodb-green rounded-full" role="status" aria-label="loading">
            <span className="sr-only">Loading...</span>
          </div>
          <p className="mt-4 text-gray-600">Loading participants...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-red-200 p-6">
        <div className="text-center py-8">
          <div className="text-red-600 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-red-600 font-medium">Error loading participants</p>
          <p className="text-gray-600 text-sm mt-2">{error}</p>
          <button 
            onClick={fetchParticipants}
            className="mt-4 px-4 py-2 bg-mongodb-green text-white text-sm font-medium rounded-md hover:bg-mongodb-dark transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div 
        className="flex items-center justify-between mb-6 cursor-pointer"
        onClick={toggleParticipants}
      >
        <div className="flex items-center">
          <h2 className="text-2xl font-semibold text-gray-900">
            Participants
          </h2>
          <div className="ml-2 p-1 text-mongodb-green hover:text-mongodb-dark transition-colors">
            <svg 
              className={`w-5 h-5 transition-transform duration-200 ${participantsExpanded ? 'rotate-180' : ''}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-mongodb-light text-mongodb-dark">
            {participants.length} total
          </span>
          <button 
            onClick={(e) => {
              e.stopPropagation() // Prevent triggering the collapse toggle
              fetchParticipants()
            }}
            disabled={loading}
            className="inline-flex items-center px-3 py-1 text-sm font-medium text-mongodb-green hover:text-mongodb-dark transition-colors disabled:text-gray-400"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>
      </div>
      
      {/* Collapsible Content */}
      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${participantsExpanded ? 'max-h-none opacity-100' : 'max-h-0 opacity-0'}`}>
        <ParticipantsGrid 
          participants={participants} 
          onRefresh={fetchParticipants} 
        />
      </div>
    </div>
  )
}

export default ParticipantsSection
