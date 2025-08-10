'use client'

import { useState, useEffect, useMemo } from 'react'

interface Participant {
  id: string
  name?: string
  email?: string
  taken?: boolean
  insert_timestamp?: string
}

export default function ParticipantsGrid({ participants, onRefresh }: {
  participants: Participant[]
  onRefresh: () => void
}) {
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(20) // Show 20 participants per page by default

  // Get base domain for workspace URLs
  const getBaseDomain = () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
    
    try {
      const url = new URL(apiUrl)
      const hostname = url.hostname
      
      // If it's localhost or IP, use fallback
      if (hostname === 'localhost' || /^\d+\.\d+\.\d+\.\d+$/.test(hostname)) {
        return 'mongogameday.com'
      }
      
      // Extract the base domain (preserve mongoai.mongogameday.com structure)
      const parts = hostname.split('.')
      if (parts.length >= 3) {
        // For mongoai.mongogameday.com structure, keep the full domain
        const baseDomain = parts.slice(-3).join('.')
        return `https://instructions.${baseDomain}/`
      } else if (parts.length >= 2) {
        // Fallback to last two parts for other domains
        const baseDomain = parts.slice(-2).join('.')
        return `https://instructions.${baseDomain}/`
      }
      
      // Fallback
      return hostname
    } catch (error) {
      // Fallback for invalid URLs
      return 'mongogameday.com'
    }
  }

  const getWorkspaceUrls = (participant: Participant, index: number) => {
    const baseDomain = getBaseDomain()
    const repoName = process.env.NEXT_PUBLIC_REPO_NAME || 'mongodb-airbnb-workshop'
    const serverPath = process.env.NEXT_PUBLIC_SERVER_PATH || 'server'
    
    // Use participant.id if available, otherwise generate from name or use index
    let participantId = participant.id
    if (!participantId || participantId.trim() === '') {
      // Generate ID from name (lowercase, remove spaces and special chars)
      if (participant.name) {
        participantId = participant.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
      } else {
        participantId = 'participant-' + (index + 1)
      }
    }
    
    return {
      app: `https://${participantId}.${baseDomain}/app`,
      server: `https://${participantId}.${baseDomain}/?folder=/home/workspace/${repoName}/${serverPath}`
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
        <h3 className="mt-2 text-sm font-medium text-gray-900">No participants</h3>
        <p className="mt-1 text-sm text-gray-500">No participants found in the database.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
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

      {/* Search Results Info */}
      {searchTerm && (
        <div className="text-sm text-gray-600">
          Found {filteredParticipants.length} participant{filteredParticipants.length !== 1 ? 's' : ''} 
          {searchTerm && ` matching "${searchTerm}"`}
        </div>
      )}

      {/* Pagination Info */}
      {filteredParticipants.length > 0 && (
        <div className="flex justify-between items-center text-sm text-gray-600">
          <div>
            Showing {startIndex + 1} to {Math.min(endIndex, filteredParticipants.length)} of {filteredParticipants.length} participants
          </div>
          {totalPages > 1 && (
            <div className="text-xs text-gray-500">
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
          <h3 className="mt-2 text-sm font-medium text-gray-900">No results found</h3>
          <p className="mt-1 text-sm text-gray-500">No participants match your search term "{searchTerm}"</p>
          <button
            onClick={() => setSearchTerm('')}
            className="mt-2 text-sm text-mongodb-green hover:text-green-600 font-medium"
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
            return (
              <div 
                key={participant.id || index} 
                className="relative rounded-lg border-2 p-4 transition-all duration-200 hover:shadow-md border-gray-200 bg-gray-50"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-medium text-gray-900 truncate">
                      {participant.name || 'Unnamed Participant'}
                    </h3>
                    
                    {/* Always show workspace links for all participants */}
                    <div className="mt-2 flex items-center space-x-4">
                      <a 
                        href={workspaceUrls.server} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-md hover:bg-green-200 transition-colors"
                      >
                        🖥️ Workspace
                      </a>
                      <a 
                        href={workspaceUrls.app} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-md hover:bg-blue-200 transition-colors"
                      >
                        📱 App
                      </a>
                    </div>
                    
                    {participant.insert_timestamp && (
                      <p className="text-xs text-gray-500 mt-2">
                        <span className="font-medium">Created:</span> {new Date(participant.insert_timestamp).toLocaleString()}
                      </p>
                    )}
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    participant.taken || participant.insert_timestamp
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {participant.taken || participant.insert_timestamp ? 'Assigned' : 'Available'}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-gray-200 pt-4">
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
