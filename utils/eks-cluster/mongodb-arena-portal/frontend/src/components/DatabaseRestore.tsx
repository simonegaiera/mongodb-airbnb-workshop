'use client'

import { useState, useEffect } from 'react'

interface Participant {
  _id: string
  name: string
  taken?: boolean | null
  decommissioned?: boolean
}

export default function DatabaseRestore() {
  const [participants, setParticipants] = useState<Participant[]>([])
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set())
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isRestoring, setIsRestoring] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [isTableOpen, setIsTableOpen] = useState(true)
  const [showDecommissioned, setShowDecommissioned] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  // Fetch participants on mount
  useEffect(() => {
    fetchParticipants()
  }, [])

  const fetchParticipants = async () => {
    setIsLoading(true)
    setError('')
    
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL
      const response = await fetch(`${apiUrl}/api/admin/leaderboard/status`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch participants')
      }
      
      const data = await response.json()
      
      if (data.success) {
        setParticipants(data.data)
      } else {
        throw new Error(data.error || 'Failed to fetch participants')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load participants')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRestoreDatabase = async (userIds?: string[]) => {
    const usersToRestore = userIds || Array.from(selectedUsers)

    if (usersToRestore.length === 0) {
      setError('Please select at least one user to restore')
      setTimeout(() => setError(''), 5000)
      return
    }

    const confirmMessage = `Are you sure you want to restore the database for ${usersToRestore.length} user(s)? This will reset their database to the original state.`
    if (!confirm(confirmMessage)) {
      return
    }

    setIsRestoring(true)
    setError('')
    setSuccess('')

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL
      const response = await fetch(`${apiUrl}/api/admin/database/restore`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_ids: usersToRestore })
      })

      const data = await response.json()

      if (data.success) {
        setSuccess(data.message)
        setTimeout(() => setSuccess(''), 10000)
        // Only clear selection if we were restoring selected users
        if (!userIds) {
          setSelectedUsers(new Set())
        }
      } else {
        throw new Error(data.error || 'Failed to restore databases')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to restore databases')
      setTimeout(() => setError(''), 10000)
    } finally {
      setIsRestoring(false)
    }
  }

  const handleRestoreSingleUser = async (userId: string, userName: string) => {
    const confirmMessage = `Are you sure you want to restore the database for "${userName}" (${userId})? This will reset their database to the original state.`
    if (!confirm(confirmMessage)) {
      return
    }

    await handleRestoreDatabase([userId])
  }

  const toggleUserSelection = (userId: string) => {
    const newSelection = new Set(selectedUsers)
    if (newSelection.has(userId)) {
      newSelection.delete(userId)
    } else {
      newSelection.add(userId)
    }
    setSelectedUsers(newSelection)
  }

  const toggleSelectAll = () => {
    if (selectedUsers.size === filteredParticipants.length) {
      setSelectedUsers(new Set())
    } else {
      setSelectedUsers(new Set(filteredParticipants.map(p => p._id)))
    }
  }

  // Only show taken participants (taken: true or taken field doesn't exist)
  // Exclude participants with taken: false (unclaimed generated users)
  // Optionally filter out decommissioned participants
  const takenParticipants = participants.filter(p => {
    if (p.taken === false) return false  // Hide unclaimed generated users
    if (!showDecommissioned && p.decommissioned) return false  // Hide decommissioned if toggle is off
    return true
  })

  const filteredParticipants = takenParticipants
    .filter(p => 
      p._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => a.name.localeCompare(b.name))

  // Calculate pagination
  const totalPages = Math.ceil(filteredParticipants.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentParticipants = filteredParticipants.slice(startIndex, endIndex)

  // Reset to first page when search changes
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, showDecommissioned])

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

  return (
    <div className="card-arena rounded-lg shadow-lg p-8">
      {/* Alert Messages */}
      {error && (
        <div className="mb-6 bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded-md flex justify-between items-center">
          <span>{error}</span>
          <button
            onClick={() => setError('')}
            className="text-red-200 hover:text-white"
          >
            ✕
          </button>
        </div>
      )}

      {success && (
        <div className="mb-6 bg-green-900/50 border border-green-500 text-green-200 px-4 py-3 rounded-md flex justify-between items-center">
          <span>{success}</span>
          <button
            onClick={() => setSuccess('')}
            className="text-green-200 hover:text-white"
          >
            ✕
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex items-start gap-3 mb-6">
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-white mb-1">
            Database Restore
          </h2>
          <p className="text-gray-200 text-base">
            Restore user databases to their original state
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-arena-dark-light/30 rounded-md p-4 border border-gray-700/50">
          <div className="text-gray-400 text-sm mb-1">Total Participants</div>
          <div className="text-white text-2xl font-bold">{takenParticipants.length}</div>
        </div>
        <div className="bg-blue-900/20 rounded-md p-4 border border-blue-700/50">
          <div className="text-gray-400 text-sm mb-1">Selected for Restore</div>
          <div className="text-blue-400 text-2xl font-bold">{selectedUsers.size}</div>
        </div>
        <div className="bg-arena-dark-light/30 rounded-md p-4 border border-gray-700/50">
          <div className="text-gray-400 text-sm mb-1">Filtered Results</div>
          <div className="text-white text-2xl font-bold">{filteredParticipants.length}</div>
        </div>
      </div>

      {/* Restore Button */}
      <div className="mb-6">
        <button
          onClick={() => handleRestoreDatabase()}
          disabled={isRestoring || selectedUsers.size === 0}
          className="bg-orange-600 hover:bg-orange-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-3 px-6 rounded-md transition-colors font-semibold flex items-center gap-2"
        >
          {isRestoring ? (
            <>
              <div className="inline-block animate-spin h-5 w-5 border-3 border-white border-t-transparent rounded-full"></div>
              Restoring...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Restore Selected Databases ({selectedUsers.size})
            </>
          )}
        </button>
      </div>

      {/* Collapsible Section */}
      <div className="bg-arena-dark-light/30 rounded-lg border border-gray-700/50 overflow-hidden">
        {/* Header Button */}
        <button
          onClick={() => setIsTableOpen(!isTableOpen)}
          className="w-full flex items-center gap-3 p-4 hover:bg-arena-dark-light/50 transition-colors"
        >
          <svg
            className={`h-6 w-6 text-arena-neon-green transition-transform ${isTableOpen ? 'rotate-90' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={2.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-white font-semibold text-lg">
            Select Participants
          </span>
        </button>

        {/* Collapsible Content */}
        {isTableOpen && (
          <div className="border-t border-gray-700/50">
            {/* Search Bar and Filter */}
            <div className="p-4 border-b border-gray-700/50 space-y-3">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by ID or name..."
                className="w-full px-4 py-2 bg-arena-dark-light border border-gray-700 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-arena-teal focus:border-arena-teal"
              />

              {/* Show Decommissioned Button */}
              <div className="flex items-center">
                <button
                  onClick={() => setShowDecommissioned(!showDecommissioned)}
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
              </div>
            </div>

            {/* Participants List */}
            {isLoading ? (
              <div className="text-center py-8 text-gray-400">
                <div className="inline-block animate-spin h-8 w-8 border-4 border-arena-teal border-t-transparent rounded-full mb-2"></div>
                <div>Loading participants...</div>
              </div>
            ) : (
              <>
                {/* Pagination Info */}
                {filteredParticipants.length > 0 && (
                  <div className="px-4 py-3 flex justify-between items-center text-sm text-gray-300 border-b border-gray-700/50">
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

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-700">
                        <th className="text-left py-3 px-4 text-gray-400 font-semibold">
                          <input
                            type="checkbox"
                            checked={selectedUsers.size === filteredParticipants.length && filteredParticipants.length > 0}
                            onChange={toggleSelectAll}
                            className="w-4 h-4 text-arena-teal bg-arena-dark-light border-gray-600 rounded focus:ring-arena-teal focus:ring-2"
                          />
                        </th>
                        <th className="text-left py-3 px-4 text-gray-400 font-semibold">User ID</th>
                        <th className="text-left py-3 px-4 text-gray-400 font-semibold">Name</th>
                        <th className="text-center py-3 px-4 text-gray-400 font-semibold">Status</th>
                        <th className="text-right py-3 px-4 text-gray-400 font-semibold">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredParticipants.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="text-center py-8 text-gray-400">
                            {searchTerm ? 'No participants match your search' : 'No active participants found'}
                          </td>
                        </tr>
                      ) : (
                        currentParticipants.map((participant) => (
                        <tr
                          key={participant._id}
                          className="border-b border-gray-800 hover:bg-arena-dark-light/20 transition-colors"
                        >
                          <td className="py-3 px-4">
                            <input
                              type="checkbox"
                              checked={selectedUsers.has(participant._id)}
                              onChange={() => toggleUserSelection(participant._id)}
                              className="w-4 h-4 text-arena-teal bg-arena-dark-light border-gray-600 rounded focus:ring-arena-teal focus:ring-2"
                            />
                          </td>
                          <td className="py-3 px-4 text-gray-300 font-mono text-sm">
                            {participant._id}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              {participant.name === participant._id ? (
                                <span className="text-gray-500 italic">(No name set)</span>
                              ) : (
                                <span className="text-white">{participant.name}</span>
                              )}
                              {participant.decommissioned && (
                                <span className="inline-block px-2 py-0.5 bg-gray-700/50 text-gray-400 rounded text-xs font-semibold border border-gray-600">
                                  Decommissioned
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className="inline-block px-3 py-1 bg-blue-900/30 text-blue-400 rounded-full text-sm font-semibold border border-blue-700/50">
                              Active
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => handleRestoreSingleUser(participant._id, participant.name)}
                              disabled={isRestoring}
                              className="bg-orange-600 hover:bg-orange-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-1 px-4 rounded-md transition-colors text-sm font-semibold inline-flex items-center gap-1"
                              title={`Restore database for ${participant.name}`}
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                              </svg>
                              Restore
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="px-4 py-4 flex items-center justify-between border-t border-gray-700/50">
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
                        setCurrentPage(1)
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
            </>
          )}
        </div>
      )}
    </div>
    </div>
  )
}


