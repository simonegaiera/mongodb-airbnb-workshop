'use client'

import { useState, useEffect } from 'react'

interface AvailableCountProps {
  refreshTrigger?: number
}

export default function AvailableCount({ refreshTrigger }: AvailableCountProps) {
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
        setActiveCount(data.active_count)
        setTotalCount(data.total_count)
        setError('')
      } else {
        setError(data.error || 'Failed to fetch participant count')
        setActiveCount(null)
        setTotalCount(null)
      }
    } catch (err) {
      setError('Network error: ' + (err as Error).message)
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
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="text-center">
          <div className="animate-spin inline-block w-5 h-5 border-2 border-current border-t-transparent text-mongodb-green rounded-full" role="status" aria-label="loading">
            <span className="sr-only">Loading...</span>
          </div>
          <p className="mt-2 text-sm text-gray-600">Loading count...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="text-center">
          <div className="text-red-500 text-sm">
            <svg className="w-5 h-5 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
          <button 
            onClick={fetchAvailableCount}
            className="mt-2 text-xs text-mongodb-green hover:text-green-600 font-medium"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Active Participants
        </h3>
        <div className="flex items-center justify-center space-x-2">
          <div className={`text-3xl font-bold ${
            activeCount === totalCount ? 'text-red-500' : 
            activeCount && totalCount && (activeCount / totalCount) > 0.8 ? 'text-yellow-500' : 
            'text-mongodb-green'
          }`}>
            {activeCount}
          </div>
          <div className="text-2xl font-bold text-gray-400">/</div>
          <div className="text-2xl font-bold text-gray-600">
            {totalCount}
          </div>
        </div>
        <div className="text-sm text-gray-500 mt-1">
          {activeCount === 1 ? '1 active participant' : `${activeCount} active participants`} of {totalCount} total
        </div>
        <div className="mt-2">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            activeCount === totalCount ? 'bg-red-100 text-red-800' :
            activeCount && totalCount && (activeCount / totalCount) > 0.8 ? 'bg-yellow-100 text-yellow-800' :
            'bg-green-100 text-green-800'
          }`}>
            {activeCount === totalCount ? 'All taken' :
             activeCount && totalCount && (activeCount / totalCount) > 0.8 ? 'Nearly full' :
             'Participants available'}
          </span>
        </div>
        <button 
          onClick={fetchAvailableCount}
          className="mt-3 text-xs text-gray-500 hover:text-mongodb-green font-medium flex items-center justify-center space-x-1"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span>Refresh</span>
        </button>
      </div>
    </div>
  )
}
