'use client'

import { useState, useEffect } from 'react'

interface UserProgressData {
  username: string
  name: string
  exercises_completed: number
  last_exercise: string | null
  last_activity: string | null
  minutes_since_last: number | null
  status: 'not_started' | 'stuck' | 'active'
}

interface ProgressSummary {
  total: number
  stuck: number
  not_started: number
  active: number
}

interface UserProgressProps {
  refreshTrigger?: number
}

const UserProgress: React.FC<UserProgressProps> = ({ refreshTrigger = 0 }) => {
  const [progressData, setProgressData] = useState<UserProgressData[]>([])
  const [summary, setSummary] = useState<ProgressSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState<'all' | 'stuck' | 'not_started'>('all')
  const [searchTerm, setSearchTerm] = useState('')

  const fetchProgress = async () => {
    try {
      setLoading(true)
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
      const response = await fetch(`${apiUrl}/api/users/progress`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      setProgressData(data.users || [])
      setSummary(data.summary || null)
      setError('')
    } catch (err) {
      setError('Failed to fetch user progress: ' + (err as Error).message)
      setProgressData([])
      setSummary(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProgress()
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchProgress, 30000)
    return () => clearInterval(interval)
  }, [refreshTrigger])

  const filteredData = progressData.filter(user => {
    // Filter by status
    if (filter !== 'all' && user.status !== filter) return false

    // Filter by search term (search in both name and username)
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase()
      const nameMatch = user.name.toLowerCase().includes(search)
      const usernameMatch = user.username.toLowerCase().includes(search)
      return nameMatch || usernameMatch
    }

    return true
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'stuck':
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-900/50 text-red-300 border border-red-500">🚨 Stuck</span>
      case 'not_started':
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-900/50 text-yellow-300 border border-yellow-500">⏸️ Not Started</span>
      case 'active':
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-900/50 text-green-300 border border-green-500">✅ Active</span>
      default:
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-700 text-gray-300">Unknown</span>
    }
  }

  if (loading && !progressData.length) {
    return (
      <div className="card-arena rounded-lg shadow-lg p-6">
        <div className="text-center py-8">
          <div className="animate-spin inline-block w-8 h-8 border-4 border-current border-t-transparent text-arena-neon-green rounded-full" role="status" aria-label="loading">
            <span className="sr-only">Loading...</span>
          </div>
          <p className="mt-4 text-gray-300">Loading user progress...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="card-arena rounded-lg shadow-lg p-6">
        <div className="bg-red-900/30 border border-red-500 text-red-300 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    )
  }

  return (
    <div className="card-arena rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-arena-neon-green">
          User Progress Monitor
        </h2>

        {summary && (
          <div className="flex items-center space-x-4">
            <div className="text-sm">
              <span className="text-red-400 font-semibold">{summary.stuck}</span>
              <span className="text-gray-400"> stuck</span>
            </div>
            <div className="text-sm">
              <span className="text-yellow-400 font-semibold">{summary.not_started}</span>
              <span className="text-gray-400"> not started</span>
            </div>
            <div className="text-sm">
              <span className="text-green-400 font-semibold">{summary.active}</span>
              <span className="text-gray-400"> active</span>
            </div>
          </div>
        )}
      </div>

      <div>
        <div className="mb-4 space-y-4">
          {/* Search Input */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search by name or username..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 pl-10 bg-arena-dark-light border border-arena-teal rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-arena-neon-green focus:border-arena-neon-green"
            />
            <svg
              className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          {/* Filter Buttons */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-arena-neon-green text-arena-dark'
                  : 'bg-arena-dark-light text-gray-300 hover:bg-arena-teal'
              }`}
            >
              All ({progressData.length})
            </button>
            <button
              onClick={() => setFilter('stuck')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'stuck'
                  ? 'bg-red-600 text-white'
                  : 'bg-arena-dark-light text-gray-300 hover:bg-arena-teal'
              }`}
            >
              Stuck ({summary?.stuck || 0})
            </button>
            <button
              onClick={() => setFilter('not_started')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'not_started'
                  ? 'bg-yellow-600 text-white'
                  : 'bg-arena-dark-light text-gray-300 hover:bg-arena-teal'
              }`}
            >
              Not Started ({summary?.not_started || 0})
            </button>
          </div>
        </div>

        {filteredData.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-400">No users match the selected filter</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-arena-teal">
                  <th className="px-4 py-3 text-left text-xs font-medium text-arena-neon-green uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-arena-neon-green uppercase tracking-wider">
                    Username
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-arena-neon-green uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-arena-neon-green uppercase tracking-wider">
                    Exercises
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-arena-neon-green uppercase tracking-wider">
                    Last Exercise
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-arena-neon-green uppercase tracking-wider">
                    Time Since Last
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-arena-teal/50">
                {filteredData.map((user) => (
                  <tr key={user.username} className="hover:bg-arena-dark-light">
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-white">
                      {user.name}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-400">
                      {user.username}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      {getStatusBadge(user.status)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-white text-right">
                      {user.exercises_completed}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-white">
                      {user.last_exercise || '-'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-white text-right">
                      {user.minutes_since_last !== null
                        ? `${Math.floor(user.minutes_since_last)}m ago`
                        : '-'
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default UserProgress

