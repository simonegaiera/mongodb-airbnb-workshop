'use client'

import { useState, useEffect } from 'react'

interface AvailableCountProps {
  refreshTrigger?: number
}

export default function AvailableCount({ refreshTrigger }: AvailableCountProps) {
  const [availableCount, setAvailableCount] = useState<number | null>(null)
  const [activeCount, setActiveCount] = useState<number | null>(null)
  const [totalCount, setTotalCount] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchAvailableCount = async () => {
    try {
      setLoading(true)
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
      const response = await fetch(`${apiUrl}/api/participants/available`)
      const data = await response.json()
      
      if (data.success) {
        setAvailableCount(data.available_count)
        setActiveCount(data.active_count)
        setTotalCount(data.total_count)
        setError('')
      } else {
        setError(data.error || 'Failed to fetch participant count')
        setAvailableCount(null)
        setActiveCount(null)
        setTotalCount(null)
      }
    } catch (err) {
      setError('Network error: ' + (err as Error).message)
      setAvailableCount(null)
      setActiveCount(null)
      setTotalCount(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAvailableCount()
  }, [refreshTrigger])

  if (loading) {
    return (
      <div className="card-arena rounded-lg shadow-lg p-6">
        <div className="text-center">
          <div className="animate-spin inline-block w-5 h-5 border-2 border-current border-t-transparent text-arena-neon-green rounded-full" role="status" aria-label="loading">
            <span className="sr-only">Loading...</span>
          </div>
          <p className="mt-2 text-sm text-gray-300">Loading count...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="card-arena rounded-lg shadow-lg p-6">
        <div className="text-center">
          <div className="text-red-400 text-sm">
            <svg className="w-5 h-5 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
          <button 
            onClick={fetchAvailableCount}
            className="mt-2 text-xs text-arena-neon-green hover:text-arena-bright-green font-medium"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="card-arena rounded-lg shadow-lg p-6 card-arena-hover">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-arena-neon-green mb-2">
          Active Participants
        </h3>
        <div className="flex items-center justify-center space-x-2">
          <button 
          onClick={fetchAvailableCount}
          className="mt-3 text-xs text-gray-400 hover:text-arena-neon-green font-medium flex items-center justify-center space-x-1 transition-colors"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
          <div className={`text-3xl font-bold ${
            availableCount === 0 ? 'text-red-400' : 
            activeCount && availableCount !== null && (availableCount / activeCount) < 0.2 ? 'text-yellow-400' : 
            'text-arena-neon-green'
          }`}>
            {activeCount && availableCount !== null ? (activeCount - availableCount) : 0}
          </div>
          <div className="text-2xl font-bold text-gray-500">/</div>
          <div className="text-2xl font-bold text-gray-300">
            {activeCount}
          </div>
        </div>
        <div className="mt-2">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            availableCount === 0 ? 'bg-red-900/40 text-red-300 border border-red-500/50' :
            activeCount && availableCount !== null && (availableCount / activeCount) < 0.2 ? 'bg-yellow-900/40 text-yellow-300 border border-yellow-500/50' :
            'bg-arena-teal/40 text-arena-neon-green border border-arena-neon-green/50'
          }`}>
            {availableCount === 0 ? 'All assigned' :
             activeCount && availableCount !== null && (availableCount / activeCount) < 0.2 ? 'Nearly full' :
             `${availableCount || 0} available`}
          </span>
        </div>
      </div>
    </div>
  )
}
