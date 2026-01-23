'use client'

import { useState, useEffect, useMemo } from 'react'

// Helper function to convert milliseconds to hours and minutes format
const formatTime = (milliseconds: number): string => {
  if (milliseconds === 0) return '0m';

  const seconds = Math.floor(milliseconds / 1000);
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  let result = '';
  if (hours > 0) {
    result += `${hours}h `;
  }
  if (minutes > 0) {
    result += `${minutes}m`;
  } else if (hours === 0 && remainingSeconds > 0) {
    result += `${remainingSeconds}s`;
  }

  return result.trim();
};

interface TimedResult {
  name?: string;
  _id: string;
  count?: number;
  delta?: {
    $numberLong?: string;
  } | number;
}

interface ScoreResult {
  [username: string]: number;
}

interface LeaderboardData {
  results: TimedResult[] | ScoreResult;
  data: any[];
  leaderboardType: 'timed' | 'score';
}

interface LeaderboardProps {
  refreshTrigger?: number;
  closeDate?: string | null;
}

const Leaderboard: React.FC<LeaderboardProps> = ({ refreshTrigger = 0, closeDate = null }) => {
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(5) // Show 10 results per page by default

  // State for collapsible leaderboard (default collapsed based on screen size)
  const [leaderboardExpanded, setLeaderboardExpanded] = useState(false)

  // State for user details modal
  const [selectedUser, setSelectedUser] = useState<string | null>(null)
  const [userResults, setUserResults] = useState<any>(null)
  const [userResultsLoading, setUserResultsLoading] = useState(false)
  const [userResultsError, setUserResultsError] = useState('')

  // Read prizes configuration from environment variables
  const prizesEnabled = process.env.NEXT_PUBLIC_PRIZES_ENABLED === 'true'
  const prizesWhere = process.env.NEXT_PUBLIC_PRIZES_WHERE || ''
  const prizesWhen = process.env.NEXT_PUBLIC_PRIZES_WHEN || ''

  const toggleLeaderboard = () => {
    setLeaderboardExpanded(prev => !prev)
  }

  // Set initial state based on screen size
  useEffect(() => {
    const checkScreenSize = () => {
      // Consider screens >= 1600px as "big screens" (large desktop monitors)
      // Most laptops are typically 1366px, 1440px, or 1536px wide
      const isBigScreen = window.innerWidth >= 1600
      setLeaderboardExpanded(isBigScreen)
    }

    // Check on mount
    checkScreenSize()

    // Listen for resize events
    window.addEventListener('resize', checkScreenSize)

    // Cleanup
    return () => window.removeEventListener('resize', checkScreenSize)
  }, [])

  const fetchResults = async () => {
    try {
      setLoading(true)
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
      const response = await fetch(`${apiUrl}/api/results`)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      setLeaderboardData(data)
      setError('')
    } catch (err) {
      setError('Failed to fetch leaderboard data: ' + (err as Error).message)
      setLeaderboardData(null)
    } finally {
      setLoading(false)
    }
  }

  const fetchUserResults = async (username: string) => {
    try {
      setUserResultsLoading(true)
      setUserResultsError('')
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
      const response = await fetch(`${apiUrl}/api/results/user/${encodeURIComponent(username)}`)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      setUserResults(data)
    } catch (err) {
      setUserResultsError('Failed to fetch user results: ' + (err as Error).message)
      setUserResults(null)
    } finally {
      setUserResultsLoading(false)
    }
  }

  const handleUserClick = (username: string) => {
    setSelectedUser(username)
    fetchUserResults(username)
  }

  const closeUserModal = () => {
    setSelectedUser(null)
    setUserResults(null)
    setUserResultsError('')
  }

  useEffect(() => {
    fetchResults()
  }, [refreshTrigger])

  // Filter and paginate results
  const filteredAndSortedData = useMemo(() => {
    if (!leaderboardData) return []

    const { results, leaderboardType } = leaderboardData

    if (!results || 
        (Array.isArray(results) && results.length === 0) || 
        (typeof results === 'object' && Object.keys(results).length === 0)) {
      return []
    }

    let sortedData: Array<{ user: string; _id: string; count?: number; delta?: number; points?: number; originalRank: number }> = []

    if (leaderboardType === 'timed' && Array.isArray(results)) {
      sortedData = results.map((user: TimedResult) => ({
        user: user.name || user._id,
        _id: user._id,
        count: user.count || 0,
        delta: user.delta && typeof user.delta === 'object' && user.delta.$numberLong
          ? parseInt(user.delta.$numberLong)
          : (typeof user.delta === 'number' ? user.delta : 0),
        originalRank: 0 // Will be set below
      }))
      .sort((a, b) => {
        if (b.count !== a.count) {
          return (b.count || 0) - (a.count || 0) // Higher count is better
        }
        return (a.delta || 0) - (b.delta || 0) // Lower delta (time) is better
      })
      .map((item, index) => ({ ...item, originalRank: index + 1 })) // Assign original ranks
    } else if (leaderboardType === 'score' && typeof results === 'object') {
      sortedData = Object.entries(results as ScoreResult)
        .map(([user, points]) => ({ user, _id: user, points, originalRank: 0 }))
        .sort((a, b) => (b.points || 0) - (a.points || 0))
        .map((item, index) => ({ ...item, originalRank: index + 1 })) // Assign original ranks
    }

    // Filter by search term while preserving original ranks
    if (searchTerm.trim()) {
      return sortedData.filter(row => 
        row.user.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    return sortedData
  }, [leaderboardData, searchTerm])

  // Calculate pagination
  const totalPages = Math.ceil(filteredAndSortedData.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentResults = filteredAndSortedData.slice(startIndex, endIndex)

  // Reset to first page when search changes or data changes
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, leaderboardData])

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = []
    const maxVisiblePages = 5
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i)
        pages.push('...')
        pages.push(totalPages)
      } else if (currentPage >= totalPages - 2) {
        pages.push(1)
        pages.push('...')
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i)
      } else {
        pages.push(1)
        pages.push('...')
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i)
        pages.push('...')
        pages.push(totalPages)
      }
    }
    return pages
  }

  if (loading) {
    return (
      <div className="card-arena rounded-lg shadow-lg p-6">
        <div className="text-center py-8">
          <div className="animate-spin inline-block w-8 h-8 border-4 border-current border-t-transparent text-arena-neon-green rounded-full" role="status" aria-label="loading">
            <span className="sr-only">Loading...</span>
          </div>
          <p className="mt-4 text-gray-300">Loading leaderboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="card-arena rounded-lg shadow-lg p-6 border-red-500/50">
        <div className="text-center py-8">
          <div className="text-red-400 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-red-300 font-medium">Error loading leaderboard</p>
          <p className="text-gray-300 text-sm mt-2">{error}</p>
          <button 
            onClick={fetchResults}
            className="mt-4 px-4 py-2 bg-arena-neon-green text-arena-dark text-sm font-bold rounded-md hover:bg-arena-bright-green transition-colors shadow-lg"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  if (!leaderboardData) {
    return (
      <div className="card-arena rounded-lg shadow-lg p-6">
        <div className="text-center py-8">
          <p className="text-gray-300">No leaderboard data available</p>
        </div>
      </div>
    )
  }

  const { results, leaderboardType } = leaderboardData

  // Check if results is empty
  if (!results || 
      (Array.isArray(results) && results.length === 0) || 
      (typeof results === 'object' && Object.keys(results).length === 0)) {
    return (
      <div className="card-arena rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-arena-neon-green">
            Leaderboard
          </h2>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-arena-teal/40 text-arena-neon-green border border-arena-neon-green/50">
            {leaderboardType === 'timed' ? 'Timed' : 'Score'} Mode
          </span>
        </div>
        <div className="text-center py-8">
          <p className="text-gray-300">No results available yet</p>
        </div>
      </div>
    )
  }

  return (
    <div className="card-arena rounded-lg shadow-lg p-6">
      <div 
        className="flex items-center justify-between mb-6 cursor-pointer"
        onClick={toggleLeaderboard}
      >
        <div className="flex items-center">
          <h2 className="text-2xl font-semibold text-arena-neon-green">
            Leaderboard
          </h2>
          <div className="ml-2 p-1 text-arena-neon-green hover:text-arena-bright-green transition-colors">
            <svg 
              className={`w-5 h-5 transition-transform duration-200 ${leaderboardExpanded ? 'rotate-180' : ''}`}
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
            {leaderboardType === 'timed' ? 'Timed' : 'Score'} Mode
          </span>
          <button 
            onClick={(e) => {
              e.stopPropagation() // Prevent triggering the collapse toggle
              fetchResults()
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

      {/* Close Date Notice */}
      {closeDate && (() => {
        const closeDateObj = new Date(closeDate)
        const now = new Date()
        const isClosed = now > closeDateObj
        
        return (
          <div className={`mb-6 p-4 rounded-lg ${
            isClosed 
              ? 'bg-red-900/30 border border-red-500/50' 
              : 'bg-blue-900/30 border border-blue-500/50'
          }`}>
            <p className={`text-center ${isClosed ? 'text-red-200' : 'text-blue-200'}`}>
              {isClosed ? (
                <>
                  🏁 <strong>Challenge Complete!</strong> Leaderboard closed on{' '}
                  <span className="font-semibold">
                    {closeDateObj.toLocaleString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      timeZoneName: 'short'
                    })}
                  </span>
                </>
              ) : (
                <>
                  🚀 <strong>Challenge Ends</strong>{' '}
                  <span className="font-semibold">
                    {closeDateObj.toLocaleString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      timeZoneName: 'short'
                    })}
                  </span>
                  {' '}— Race to the top and claim your spot!
                </>
              )}
            </p>
          </div>
        )
      })()}

      {/* Collapsible Content */}
      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${leaderboardExpanded ? 'max-h-none opacity-100' : 'max-h-0 opacity-0'}`}>
        <div>
        {/* More Scenarios Section & Winners Announcement - Side by Side */}
        <div className={`mb-6 grid grid-cols-1 ${prizesEnabled ? 'lg:grid-cols-2' : ''} gap-4`}>
          {/* More Scenarios Section */}
          <div className="p-6 bg-gradient-to-r from-arena-teal/30 to-arena-dark-light rounded-lg border border-arena-neon-green/30">
            <div className="text-center">
              <div className="flex items-center justify-center mb-3">
                <svg className="w-8 h-8 text-arena-neon-green mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <h3 className="text-xl font-semibold text-white">
                  What's Next?
                </h3>
              </div>
               <p className="text-gray-300 mb-4">
                 Having trouble or need assistance? We're here to help! <br />
                 Loved this challenge? We've got more scenarios for your team!
               </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <div className="flex items-center text-arena-neon-green font-medium">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span>Reach out at:</span>
                </div>
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText('arena@mongodb.com').then(() => {
                      // Could add a toast notification here if desired
                      console.log('Email copied to clipboard');
                    }).catch(() => {
                      // Fallback: try to open mailto as backup
                      window.location.href = 'mailto:arena@mongodb.com';
                    });
                  }}
                  className="inline-flex items-center px-4 py-2 bg-arena-neon-green text-arena-dark font-bold rounded-md hover:bg-arena-bright-green transition-colors duration-200 shadow-lg"
                >
                  arena@mongodb.com
                  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Winners & Prizes Announcement - Only show if enabled */}
          {prizesEnabled && (
            <div className="p-6 bg-gradient-to-r from-blue-900/30 to-indigo-900/30 rounded-lg border border-blue-400/50">
              <div className="text-center">
                <div className="flex items-center justify-center mb-3">
                  <svg className="w-8 h-8 text-blue-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h3 className="text-xl font-semibold text-white">
                    Winners & Prizes Announcement
                  </h3>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                  <div className="bg-arena-dark-light/60 rounded-lg p-4 border border-blue-400/50">
                    <div className="flex items-center justify-center mb-2">
                      <svg className="w-5 h-5 text-blue-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="text-sm font-medium text-gray-300">WHERE</span>
                    </div>
                    <p className="text-lg font-bold text-blue-300">{prizesWhere || 'TBD'}</p>
                  </div>
                  
                  <div className="bg-arena-dark-light/60 rounded-lg p-4 border border-blue-400/50">
                    <div className="flex items-center justify-center mb-2">
                      <svg className="w-5 h-5 text-blue-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-sm font-medium text-gray-300">WHEN</span>
                    </div>
                    <p className="text-lg font-bold text-blue-300">{prizesWhen || 'TBD'}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        </div>

        {/* Search Bar */}
        <div className="mb-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-arena-teal rounded-md leading-5 bg-arena-dark-light text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-arena-neon-green focus:border-arena-neon-green"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <svg className="h-5 w-5 text-gray-400 hover:text-arena-neon-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Search Results Info */}
        {searchTerm && (
          <div className="text-sm text-gray-300 mb-4">
            Found {filteredAndSortedData.length} result{filteredAndSortedData.length !== 1 ? 's' : ''} 
            {searchTerm && ` matching "${searchTerm}"`}
          </div>
        )}

        {/* Pagination Info */}
        {filteredAndSortedData.length > 0 && (
          <div className="flex justify-between items-center text-sm text-gray-300 mb-4">
            <div>
              Showing {startIndex + 1} to {Math.min(endIndex, filteredAndSortedData.length)} of {filteredAndSortedData.length} results
            </div>
            {totalPages > 1 && (
              <div className="text-xs text-gray-400">
                Page {currentPage} of {totalPages}
              </div>
            )}
          </div>
        )}

        {/* No Results Message */}
        {searchTerm && filteredAndSortedData.length === 0 && (
          <div className="text-center py-8">
            <svg className="mx-auto h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-white">No results found</h3>
            <p className="mt-1 text-sm text-gray-400">No users match your search term "{searchTerm}"</p>
            <button
              onClick={() => setSearchTerm('')}
              className="mt-2 text-sm text-arena-neon-green hover:text-arena-bright-green font-medium"
            >
              Clear search
            </button>
          </div>
        )}

        {/* Leaderboard Table */}
        {currentResults.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-arena-teal">
                  <th className="px-4 py-3 text-left text-xs font-medium text-arena-neon-green uppercase tracking-wider">
                    Rank
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-arena-neon-green uppercase tracking-wider">
                    User
                    <span className="ml-2 text-xs text-gray-400 normal-case">(click for details)</span>
                  </th>
                  {leaderboardType === 'timed' ? (
                    <>
                      <th className="px-4 py-3 text-right text-xs font-medium text-arena-neon-green uppercase tracking-wider">
                        Exercises
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-arena-neon-green uppercase tracking-wider">
                        Time
                      </th>
                    </>
                  ) : (
                    <th className="px-4 py-3 text-right text-xs font-medium text-arena-neon-green uppercase tracking-wider">
                      Points
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-arena-teal/50">
                {currentResults.map((row, index) => {
                  const actualRank = row.originalRank
                  return (
                    <tr key={row.user} className={actualRank <= 3 ? 'bg-gradient-to-r from-slate-600/30 to-gray-500/25 hover:from-slate-500/40 hover:to-gray-400/35' : 'hover:bg-arena-dark-light'}>
                      <td className={`px-4 py-2 whitespace-nowrap text-sm font-medium text-white ${actualRank <= 3 ? 'rounded-l-xl' : ''}`}>
                        <div className="flex items-center justify-start min-w-[2.5rem]">
                          {actualRank <= 3 ? (
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-base shadow-lg ${
                              actualRank === 1 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600' : 
                              actualRank === 2 ? 'bg-gradient-to-br from-gray-300 to-gray-500' : 
                              'bg-gradient-to-br from-orange-400 to-orange-700'
                            }`}>
                              {actualRank}
                            </div>
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-arena-neon-green text-arena-dark flex items-center justify-center text-sm font-bold">
                              {actualRank}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-white">
                        <button
                          onClick={() => handleUserClick(row._id || row.user)}
                          className="text-arena-neon-green hover:text-arena-bright-green underline cursor-pointer transition-colors"
                        >
                          {row.user}
                        </button>
                      </td>
                      {leaderboardType === 'timed' ? (
                        <>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-white text-right">
                            {row.count || 0}
                          </td>
                          <td className={`px-4 py-2 whitespace-nowrap text-sm text-white text-right ${actualRank <= 3 ? 'rounded-r-xl' : ''}`}>
                            {formatTime(row.delta || 0)}
                          </td>
                        </>
                      ) : (
                        <td className={`px-4 py-2 whitespace-nowrap text-sm text-white text-right ${actualRank <= 3 ? 'rounded-r-xl' : ''}`}>
                          {row.points || 0}
                        </td>
                      )}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-arena-teal pt-4 mt-4">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-300 bg-arena-dark-light border border-arena-teal rounded-md hover:bg-arena-teal disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Previous
              </button>
              
              <div className="flex items-center space-x-1">
                {getPageNumbers().map((page, index) => (
                  <button
                    key={index}
                    onClick={() => typeof page === 'number' && setCurrentPage(page)}
                    disabled={page === '...'}
                    className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      page === currentPage
                        ? 'bg-arena-neon-green text-arena-dark border border-arena-neon-green font-bold'
                        : page === '...'
                        ? 'text-gray-400 cursor-default'
                        : 'text-gray-300 bg-arena-dark-light border border-arena-teal hover:bg-arena-teal'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-300 bg-arena-dark-light border border-arena-teal rounded-md hover:bg-arena-teal disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {/* Items per page selector */}
            <div className="flex items-center space-x-2 text-sm text-gray-300">
              <span>Items per page:</span>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  const newItemsPerPage = parseInt(e.target.value)
                  setItemsPerPage(newItemsPerPage)
                  setCurrentPage(1) // Reset to first page when changing items per page
                }}
                className="border border-arena-teal rounded-md px-2 py-1 text-sm bg-arena-dark-light text-white focus:ring-2 focus:ring-arena-neon-green focus:border-arena-neon-green"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>
        )}

        {filteredAndSortedData.length === 0 && !searchTerm && (
          <div className="text-center py-8">
            <p className="text-gray-400">No results available yet</p>
          </div>
        )}
      </div>

      {/* User Results Modal */}
      {selectedUser && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75"
          onClick={closeUserModal}
        >
          <div
            className="bg-arena-dark border-2 border-arena-neon-green rounded-lg shadow-2xl p-6 max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-2xl font-semibold text-arena-neon-green">
                  User Results
                </h3>
                {userResults && (
                  <p className="text-gray-300 mt-1">
                    {userResults.participant_name} ({userResults.username})
                  </p>
                )}
              </div>
              <button
                onClick={closeUserModal}
                className="text-gray-400 hover:text-arena-neon-green text-3xl leading-none transition-colors"
              >
                ×
              </button>
            </div>

            {userResultsLoading && (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-arena-neon-green border-t-transparent mx-auto"></div>
                <p className="text-gray-300 mt-4">Loading results...</p>
              </div>
            )}

            {userResultsError && (
              <div className="bg-red-900/30 border border-red-500 text-red-300 px-4 py-3 rounded">
                {userResultsError}
              </div>
            )}

            {userResults && userResults.results && (
              <div>
                <div className="mb-4 text-gray-300">
                  <strong>Total Exercises Completed:</strong> {userResults.count}
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="border-b border-arena-teal">
                        <th className="px-4 py-3 text-left text-xs font-medium text-arena-neon-green uppercase tracking-wider">
                          #
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-arena-neon-green uppercase tracking-wider">
                          Exercise Name
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-arena-neon-green uppercase tracking-wider">
                          Timestamp
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-arena-teal/50">
                      {userResults.results.map((result: any, index: number) => (
                        <tr key={index} className="hover:bg-arena-dark-light">
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-white">
                            {index + 1}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-white">
                            {result.name}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-white">
                            {new Date(result.timestamp).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className="mt-6 flex justify-end">
              <button
                onClick={closeUserModal}
                className="px-6 py-2 bg-arena-neon-green text-arena-dark rounded-lg hover:bg-arena-bright-green transition-colors font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Leaderboard
