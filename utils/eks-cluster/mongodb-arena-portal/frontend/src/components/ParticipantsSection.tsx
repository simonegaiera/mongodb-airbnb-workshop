'use client'

import { useState, useEffect } from 'react'
import ParticipantsGrid from './ParticipantsGrid'

interface Participant {
  _id: string
  name?: string
  email?: string
  taken?: boolean
  insert_timestamp?: string
  decommissioned?: boolean
  decommissioned_timestamp?: string
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
  
  // State for showing decommissioned participants (default hidden)
  const [showDecommissioned, setShowDecommissioned] = useState(false)

  const toggleParticipants = () => {
    setParticipantsExpanded(prev => !prev)
  }

  const toggleShowDecommissioned = () => {
    setShowDecommissioned(prev => !prev)
  }

  // Filter participants based on decommissioned status
  const filteredParticipants = participants.filter(participant => 
    showDecommissioned || !participant.decommissioned
  )

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
      <div className="card-arena rounded-lg shadow-lg p-6">
        <div className="text-center py-8">
          <div className="animate-spin inline-block w-8 h-8 border-4 border-current border-t-transparent text-arena-neon-green rounded-full" role="status" aria-label="loading">
            <span className="sr-only">Loading...</span>
          </div>
          <p className="mt-4 text-gray-300">Loading participants...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="card-arena rounded-lg shadow-lg border-red-500/50 p-6">
        <div className="text-center py-8">
          <div className="text-red-400 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-red-300 font-medium">Error loading participants</p>
          <p className="text-gray-300 text-sm mt-2">{error}</p>
          <button 
            onClick={fetchParticipants}
            className="mt-4 px-4 py-2 bg-arena-neon-green text-arena-dark text-sm font-bold rounded-md hover:bg-arena-bright-green transition-colors shadow-lg"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="card-arena rounded-lg shadow-lg p-6">
      <div 
        className="flex items-center justify-between mb-6 cursor-pointer"
        onClick={toggleParticipants}
      >
        <div className="flex items-center">
          <h2 className="text-2xl font-semibold text-arena-neon-green">
            Participants
          </h2>
          <div className="ml-2 p-1 text-arena-neon-green hover:text-arena-bright-green transition-colors">
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
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-arena-teal/40 text-arena-neon-green border border-arena-neon-green/50">
            {filteredParticipants.length} of {participants.length} total
          </span>
          
          <button
            onClick={(e) => {
              e.stopPropagation() // Prevent triggering the collapse toggle
              toggleShowDecommissioned()
            }}
            className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-md transition-colors ${
              showDecommissioned
                ? 'bg-orange-900/40 text-orange-300 border border-orange-500/50 hover:bg-orange-900/60'
                : 'bg-arena-dark-light text-gray-300 border border-arena-teal hover:bg-arena-teal'
            }`}
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L12 12m-3.172-3.172a4 4 0 005.656 0M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
            </svg>
            {showDecommissioned ? 'Hide Decommissioned' : 'Show Decommissioned'}
          </button>
          
          <button 
            onClick={(e) => {
              e.stopPropagation() // Prevent triggering the collapse toggle
              fetchParticipants()
            }}
            disabled={loading}
            className="inline-flex items-center px-3 py-1 text-sm font-medium text-arena-neon-green hover:text-arena-bright-green transition-colors disabled:text-gray-500"
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
          participants={filteredParticipants} 
          onRefresh={fetchParticipants} 
        />
      </div>
    </div>
  )
}

export default ParticipantsSection
