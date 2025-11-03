'use client'

import { useState, useEffect, useMemo } from 'react'

interface Participant {
  _id: string
  name?: string
  email?: string
  taken?: boolean
  insert_timestamp?: string
  decommissioned?: boolean
  decommissioned_timestamp?: string
}

interface HealthStatus {
  status: 'checking' | 'healthy' | 'unhealthy' | 'unknown'
  lastChecked?: string
}

export default function ParticipantsGrid({ participants, onRefresh }: {
  participants: Participant[]
  onRefresh: () => void
}) {
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10) // Show 10 participants per page by default
  const [healthStatuses, setHealthStatuses] = useState<Record<string, HealthStatus>>({})

  // Get base domain for workspace URLs
  const getBaseDomain = () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
    
    try {
      const url = new URL(apiUrl)
      const hostname = url.hostname
      
      // If it's localhost or IP, use fallback
      if (hostname === 'localhost' || /^\d+\.\d+\.\d+\.\d+$/.test(hostname)) {
        return 'mongoarena.com'
      }
      
      // Extract the base domain (last two parts of the hostname)
      const parts = hostname.split('.')
      if (parts.length >= 3) {
        return parts.slice(-3).join('.')
      } else if (parts.length >= 2) {
        return parts.slice(-2).join('.')
      }
      
      // Fallback
      return hostname
    } catch (error) {
      // Fallback for invalid URLs
      return 'mongoarena.com'
    }
  }

  const getWorkspaceUrls = (participant: Participant, index: number) => {
    const baseDomain = getBaseDomain()
    const repoName = process.env.NEXT_PUBLIC_REPO_NAME || 'mongodb-airbnb-workshop'
    const serverPath = process.env.NEXT_PUBLIC_SERVER_PATH || 'server'

    // Use participant._id for workspace URLs
    let participantId = participant._id

    return {
      app: `https://${participantId}.${baseDomain}/app`,
      server: `https://${participantId}.${baseDomain}/?folder=/home/workspace/${repoName}/${serverPath}`,
      health: `https://${participantId}.${baseDomain}/backend/health`
    }
  }

  // Check health for a single participant
  const checkHealth = async (participantId: string) => {
    const baseDomain = getBaseDomain()
    const healthUrl = `https://${participantId}.${baseDomain}/backend/health`
    
    setHealthStatuses(prev => ({
      ...prev,
      [participantId]: { status: 'checking' }
    }))

    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 second timeout
      
      const response = await fetch(healthUrl, {
        method: 'GET',
        signal: controller.signal,
        headers: {
          'Accept': 'application/json'
        }
      })
      
      clearTimeout(timeoutId)
      
      if (response.ok) {
        const data = await response.json()
        setHealthStatuses(prev => ({
          ...prev,
          [participantId]: {
            status: data.status === 'healthy' ? 'healthy' : 'unhealthy',
            lastChecked: new Date().toISOString()
          }
        }))
      } else {
        setHealthStatuses(prev => ({
          ...prev,
          [participantId]: {
            status: 'unhealthy',
            lastChecked: new Date().toISOString()
          }
        }))
      }
    } catch (error) {
      setHealthStatuses(prev => ({
        ...prev,
        [participantId]: {
          status: 'unhealthy',
          lastChecked: new Date().toISOString()
        }
      }))
    }
  }

  // Filter participants based on search term
  const filteredParticipants = useMemo(() => {
    if (!searchTerm.trim()) {
      return participants
    }
    
    return participants.filter(participant => 
      participant.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      participant.email?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [participants, searchTerm])

  // Calculate pagination
  const totalPages = Math.ceil(filteredParticipants.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentParticipants = filteredParticipants.slice(startIndex, endIndex)

  // Check health for all visible participants
  const checkAllHealth = () => {
    currentParticipants.forEach(participant => {
      if (!participant.decommissioned) {
        checkHealth(participant._id)
      }
    })
  }

  // Check health when participants change or page changes
  useEffect(() => {
    if (currentParticipants.length > 0) {
      // Only check health for non-decommissioned participants
      currentParticipants.forEach(participant => {
        if (!participant.decommissioned && !healthStatuses[participant._id]) {
          checkHealth(participant._id)
        }
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentParticipants.map(p => p._id).join(',')])

  // Reset to first page when search changes or participants change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, participants.length])

  // Clear search when participants change (e.g., after refresh)
  useEffect(() => {
    setSearchTerm('')
  }, [participants.length])

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

  if (participants.length === 0) {
    return (
      <div className="text-center py-12">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-white">No participants</h3>
        <p className="mt-1 text-sm text-gray-400">No participants found in the database.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Search Bar and Health Check Button */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search participants..."
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
        <button
          onClick={checkAllHealth}
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-arena-teal/40 border border-arena-teal rounded-md hover:bg-arena-teal transition-colors whitespace-nowrap"
          title="Check health status for all visible participants"
        >
          <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Check Health
        </button>
      </div>

      {/* Search Results Info */}
      {searchTerm && (
        <div className="text-sm text-gray-300">
          Found {filteredParticipants.length} participant{filteredParticipants.length !== 1 ? 's' : ''} 
          {searchTerm && ` matching "${searchTerm}"`}
        </div>
      )}

      {/* Pagination Info */}
      {filteredParticipants.length > 0 && (
        <div className="flex justify-between items-center text-sm text-gray-300">
          <div>
            Showing {startIndex + 1} to {Math.min(endIndex, filteredParticipants.length)} of {filteredParticipants.length} participants
          </div>
          {totalPages > 1 && (
            <div className="text-xs text-gray-400">
              Page {currentPage} of {totalPages}
            </div>
          )}
        </div>
      )}

      {/* No Results Message */}
      {searchTerm && filteredParticipants.length === 0 && (
        <div className="text-center py-8">
          <svg className="mx-auto h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-white">No results found</h3>
          <p className="mt-1 text-sm text-gray-400">No participants match your search term "{searchTerm}"</p>
          <button
            onClick={() => setSearchTerm('')}
            className="mt-2 text-sm text-arena-neon-green hover:text-arena-bright-green font-medium"
          >
            Clear search
          </button>
        </div>
      )}

      {/* Participants Grid */}
      {currentParticipants.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {currentParticipants.map((participant, index) => {
            const workspaceUrls = getWorkspaceUrls(participant, index)
            const health = healthStatuses[participant._id] || { status: 'unknown' }
            
            return (
              <div 
                key={participant._id || index} 
                className={`relative rounded-lg border-2 p-4 ${
                  participant.decommissioned 
                    ? 'border-gray-600 bg-arena-dark-light opacity-60' 
                    : 'tile-arena tile-arena-hover'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className={`text-lg font-medium truncate ${
                        participant.decommissioned ? 'text-gray-500' : 'text-white'
                      }`}>
                        {participant.name || 'Unnamed Participant'}
                      </h3>
                      {!participant.decommissioned && (
                        <button
                          onClick={() => checkHealth(participant._id)}
                          className="flex items-center gap-1 group"
                          title={`Backend Health: ${health.status}${health.lastChecked ? '\nLast checked: ' + new Date(health.lastChecked).toLocaleString() : ''}`}
                        >
                          <div className="relative">
                            {health.status === 'checking' && (
                              <svg className="animate-spin h-4 w-4 text-yellow-400" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                            )}
                            {health.status === 'healthy' && (
                              <div className="h-3 w-3 rounded-full bg-green-500 animate-pulse shadow-lg shadow-green-500/50"></div>
                            )}
                            {health.status === 'unhealthy' && (
                              <div className="h-3 w-3 rounded-full bg-red-500 shadow-lg shadow-red-500/50"></div>
                            )}
                            {health.status === 'unknown' && (
                              <div className="h-3 w-3 rounded-full bg-gray-500"></div>
                            )}
                          </div>
                          <svg className="h-3 w-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                        </button>
                      )}
                    </div>
                    
                    {/* Show workspace links for all participants but dim for decommissioned */}
                    <div className={`mt-2 flex items-center space-x-4 ${
                      participant.decommissioned ? 'opacity-60' : ''
                    }`}>
                      <a 
                        href={workspaceUrls.server} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                          participant.decommissioned 
                            ? 'bg-gray-700 text-gray-400 hover:bg-gray-600' 
                            : 'bg-arena-neon-green/20 text-arena-neon-green border border-arena-neon-green/50 hover:bg-arena-neon-green hover:text-arena-dark'
                        }`}
                      >
                        🖥️ Workspace
                      </a>
                      <a 
                        href={workspaceUrls.app} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                          participant.decommissioned 
                            ? 'bg-gray-700 text-gray-400 hover:bg-gray-600' 
                            : 'bg-blue-900/40 text-blue-300 border border-blue-400/50 hover:bg-blue-400 hover:text-arena-dark'
                        }`}
                      >
                        📱 App
                      </a>
                    </div>
                    
                    {participant.insert_timestamp && (
                      <p className="text-xs text-gray-400 mt-2">
                        <span className="font-medium">Created:</span> {new Date(participant.insert_timestamp).toLocaleString()}
                      </p>
                    )}
                    
                    {participant.decommissioned_timestamp && (
                      <p className="text-xs text-gray-400 mt-1">
                        <span className="font-medium">Decommissioned:</span> {new Date(participant.decommissioned_timestamp).toLocaleString()}
                      </p>
                    )}
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                    participant.decommissioned
                      ? 'bg-gray-800 text-gray-400 border-gray-600' 
                      : participant.taken || participant.insert_timestamp
                        ? 'bg-arena-teal/40 text-arena-neon-green border-arena-neon-green/50' 
                        : 'bg-blue-900/40 text-blue-300 border-blue-400/50'
                  }`}>
                    {participant.decommissioned 
                      ? 'Decommissioned' 
                      : participant.taken || participant.insert_timestamp 
                        ? 'Assigned' 
                        : 'Available'
                    }
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-arena-teal pt-4">
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
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>
      )}
    </div>
  )
}
