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
}

const Leaderboard: React.FC<LeaderboardProps> = ({ refreshTrigger = 0 }) => {
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(5) // Show 10 results per page by default
  
  // State for collapsible leaderboard (default collapsed based on screen size)
  const [leaderboardExpanded, setLeaderboardExpanded] = useState(false)

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

    let sortedData: Array<{ user: string; count?: number; delta?: number; points?: number; originalRank: number }> = []
    
    if (leaderboardType === 'timed' && Array.isArray(results)) {
      sortedData = results.map((user: TimedResult) => ({
        user: user.name || user._id,
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
        .map(([user, points]) => ({ user, points, originalRank: 0 }))
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
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="text-center py-8">
          <div className="animate-spin inline-block w-8 h-8 border-4 border-current border-t-transparent text-mongodb-green rounded-full" role="status" aria-label="loading">
            <span className="sr-only">Loading...</span>
          </div>
          <p className="mt-4 text-gray-600">Loading leaderboard...</p>
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
          <p className="text-red-600 font-medium">Error loading leaderboard</p>
          <p className="text-gray-600 text-sm mt-2">{error}</p>
          <button 
            onClick={fetchResults}
            className="mt-4 px-4 py-2 bg-mongodb-green text-white text-sm font-medium rounded-md hover:bg-mongodb-dark transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  if (!leaderboardData) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="text-center py-8">
          <p className="text-gray-600">No leaderboard data available</p>
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
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-gray-900">
            Leaderboard
          </h2>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-mongodb-light text-mongodb-dark">
            {leaderboardType === 'timed' ? 'Timed' : 'Score'} Mode
          </span>
        </div>
        <div className="text-center py-8">
          <p className="text-gray-600">No results available yet</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div 
        className="flex items-center justify-between mb-6 cursor-pointer"
        onClick={toggleLeaderboard}
      >
        <div className="flex items-center">
          <h2 className="text-2xl font-semibold text-gray-900">
            Leaderboard
          </h2>
          <div className="ml-2 p-1 text-mongodb-green hover:text-mongodb-dark transition-colors">
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
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-mongodb-light text-mongodb-dark">
            {leaderboardType === 'timed' ? 'Timed' : 'Score'} Mode
          </span>
          <button 
            onClick={(e) => {
              e.stopPropagation() // Prevent triggering the collapse toggle
              fetchResults()
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
      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${leaderboardExpanded ? 'max-h-none opacity-100' : 'max-h-0 opacity-0'}`}>
        <div>
        {/* More Scenarios Section & Winners Announcement - Side by Side */}
        <div className="mb-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* More Scenarios Section */}
          <div className="p-6 bg-gradient-to-r from-mongodb-light to-green-50 rounded-lg border border-mongodb-green/20">
            <div className="text-center">
              <div className="flex items-center justify-center mb-3">
                <svg className="w-8 h-8 text-mongodb-green mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <h3 className="text-xl font-semibold text-gray-900">
                  What's Next?
                </h3>
              </div>
               <p className="text-gray-700 mb-4">
                 Having trouble or need assistance? We're here to help! <br />
                 Loved this challenge? We've got more scenarios for your team!
               </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <div className="flex items-center text-mongodb-green font-medium">
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
                  className="inline-flex items-center px-4 py-2 bg-mongodb-green text-white font-medium rounded-md hover:bg-mongodb-dark transition-colors duration-200 shadow-sm"
                >
                  arena@mongodb.com
                  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Winners & Prizes Announcement */}
          <div className="p-6 bg-gradient-to-r from-blue-100 to-indigo-50 rounded-lg border border-blue-200">
            <div className="text-center">
              <div className="flex items-center justify-center mb-3">
                <svg className="w-8 h-8 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="text-xl font-semibold text-gray-900">
                  Winners & Prizes Announcement
                </h3>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                <div className="bg-white/60 rounded-lg p-4 border border-blue-200">
                  <div className="flex items-center justify-center mb-2">
                    <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="text-sm font-medium text-gray-600">WHERE</span>
                  </div>
                  <p className="text-lg font-bold text-blue-800">Product Booth</p>
                </div>
                
                <div className="bg-white/60 rounded-lg p-4 border border-blue-200">
                  <div className="flex items-center justify-center mb-2">
                    <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-sm font-medium text-gray-600">WHEN</span>
                  </div>
                  <p className="text-lg font-bold text-blue-800">5:15 PM</p>
                </div>
              </div>
            </div>
          </div>
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
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-mongodb-green focus:border-mongodb-green"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Search Results Info */}
        {searchTerm && (
          <div className="text-sm text-gray-600 mb-4">
            Found {filteredAndSortedData.length} result{filteredAndSortedData.length !== 1 ? 's' : ''} 
            {searchTerm && ` matching "${searchTerm}"`}
          </div>
        )}

        {/* Pagination Info */}
        {filteredAndSortedData.length > 0 && (
          <div className="flex justify-between items-center text-sm text-gray-600 mb-4">
            <div>
              Showing {startIndex + 1} to {Math.min(endIndex, filteredAndSortedData.length)} of {filteredAndSortedData.length} results
            </div>
            {totalPages > 1 && (
              <div className="text-xs text-gray-500">
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
            <h3 className="mt-2 text-sm font-medium text-gray-900">No results found</h3>
            <p className="mt-1 text-sm text-gray-500">No users match your search term "{searchTerm}"</p>
            <button
              onClick={() => setSearchTerm('')}
              className="mt-2 text-sm text-mongodb-green hover:text-green-600 font-medium"
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
                <tr className="border-b border-gray-200">
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rank
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  {leaderboardType === 'timed' ? (
                    <>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Exercises
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Time
                      </th>
                    </>
                  ) : (
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Points
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {currentResults.map((row, index) => {
                  const actualRank = row.originalRank
                  return (
                    <tr key={row.user} className={actualRank <= 3 ? 'bg-yellow-50' : 'hover:bg-gray-50'}>
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        <div className="flex items-center">
                          {actualRank <= 3 ? (
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                              actualRank === 1 ? 'bg-yellow-500' : 
                              actualRank === 2 ? 'bg-gray-400' : 
                              'bg-orange-600'
                            }`}>
                              {actualRank}
                            </div>
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-mongodb-green text-white flex items-center justify-center text-sm font-bold">
                              {actualRank}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                        {row.user}
                      </td>
                      {leaderboardType === 'timed' ? (
                        <>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                            {row.count || 0}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                            {formatTime(row.delta || 0)}
                          </td>
                        </>
                      ) : (
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
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
          <div className="flex items-center justify-between border-t border-gray-200 pt-4 mt-4">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
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
                    className={`px-3 py-2 text-sm font-medium rounded-md ${
                      page === currentPage
                        ? 'bg-mongodb-green text-mongodb-dark border border-mongodb-green'
                        : page === '...'
                        ? 'text-gray-400 cursor-default'
                        : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {/* Items per page selector */}
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <span>Items per page:</span>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  const newItemsPerPage = parseInt(e.target.value)
                  setItemsPerPage(newItemsPerPage)
                  setCurrentPage(1) // Reset to first page when changing items per page
                }}
                className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:ring-1 focus:ring-mongodb-green focus:border-mongodb-green"
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
            <p className="text-gray-500">No results available yet</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Leaderboard
