'use client'

import { useState } from 'react'

export default function LeaderboardDownload() {
  const [isDownloading, setIsDownloading] = useState(false)
  const [downloadError, setDownloadError] = useState('')
  const [downloadSuccess, setDownloadSuccess] = useState('')

  const downloadFile = async (url: string) => {
    const response = await fetch(url)

    if (!response.ok) {
      // Try to get error message from response
      let errorMessage = `Failed to download from ${url}`
      try {
        const errorData = await response.json()
        if (errorData.message || errorData.error) {
          errorMessage = `${errorMessage}: ${errorData.message || errorData.error}`
        }
      } catch {
        // If response is not JSON, use status text
        errorMessage = `${errorMessage} (Status: ${response.status} ${response.statusText})`
      }
      throw new Error(errorMessage)
    }

    // Get the blob from response
    const blob = await response.blob()
    
    // Create a download link and trigger it
    const downloadUrl = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = downloadUrl
    
    // Get filename from Content-Disposition header or use default
    const contentDisposition = response.headers.get('Content-Disposition')
    let filename = `download_${new Date().toISOString().split('T')[0]}.csv`
    
    if (contentDisposition) {
      // Try to extract filename from Content-Disposition header
      // Handles both: filename="file.csv" and filename=file.csv
      const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/)
      if (filenameMatch && filenameMatch[1]) {
        filename = filenameMatch[1].replace(/['"]/g, '')
      }
    }
    
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(downloadUrl)
  }

  const handleDownload = async () => {
    setIsDownloading(true)
    setDownloadError('')
    setDownloadSuccess('')

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL
      
      // Download both files
      await downloadFile(`${apiUrl}/api/admin/leaderboard/download`)
      await downloadFile(`${apiUrl}/api/results?format=csv`)

      setDownloadSuccess('Both files downloaded successfully!')
      setTimeout(() => setDownloadSuccess(''), 5000)
    } catch (error) {
      setDownloadError(error instanceof Error ? error.message : 'Failed to download leaderboard data')
      setTimeout(() => setDownloadError(''), 10000)
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <div className="card-arena rounded-lg shadow-lg p-8">
      {/* Alert Messages */}
      {downloadError && (
        <div className="mb-6 bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded-md flex justify-between items-center">
          <span>{downloadError}</span>
          <button
            onClick={() => setDownloadError('')}
            className="text-red-200 hover:text-white"
          >
            ✕
          </button>
        </div>
      )}

      {downloadSuccess && (
        <div className="mb-6 bg-green-900/50 border border-green-500 text-green-200 px-4 py-3 rounded-md flex justify-between items-center">
          <span>{downloadSuccess}</span>
          <button
            onClick={() => setDownloadSuccess('')}
            className="text-green-200 hover:text-white"
          >
            ✕
          </button>
        </div>
      )}

      {/* Header with Button */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-2xl font-bold text-arena-neon-green mb-1">
            Leaderboard Data Export
          </h2>
          <p className="text-gray-300 text-base">
            Download workshop participant and competition data
          </p>
        </div>
        
        <div className="flex-shrink-0 ml-4">
          <button
            onClick={handleDownload}
            disabled={isDownloading}
            className={`
              ${isDownloading 
                ? 'bg-gray-600 cursor-not-allowed' 
                : 'bg-arena-neon-green hover:bg-arena-bright-green'
              }
              text-arena-dark py-3 px-6 rounded-md transition-colors font-semibold
              flex items-center gap-2 whitespace-nowrap
            `}
          >
            {isDownloading ? (
              <>
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Downloading...
              </>
            ) : (
              <>
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download All Data (2 Files)
              </>
            )}
          </button>
        </div>
      </div>

      {/* Description */}
      <div className="border-t border-gray-700 pt-6">
        <p className="text-gray-300 mb-6">
          Click the button above to download <strong className="text-white">two CSV files</strong> containing complete workshop data:
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-arena-dark-light/50 rounded-md p-4 border-l-4 border-blue-500">
            <h4 className="text-white font-semibold text-base mb-3 flex items-center gap-2">
              <span className="text-2xl">📊</span>
              File 1: User List
            </h4>
            <ul className="text-gray-300 space-y-2 list-none ml-8">
              <li className="flex items-start">
                <span className="text-arena-teal mr-2">•</span>
                <span>User ID and display name</span>
              </li>
              <li className="flex items-start">
                <span className="text-arena-teal mr-2">•</span>
                <span>Email addresses (admin-only)</span>
              </li>
              <li className="flex items-start">
                <span className="text-arena-teal mr-2">•</span>
                <span>Number of exercises solved</span>
              </li>
            </ul>
          </div>
          
          <div className="bg-arena-dark-light/50 rounded-md p-4 border-l-4 border-yellow-500">
            <h4 className="text-white font-semibold text-base mb-3 flex items-center gap-2">
              <span className="text-2xl">🏆</span>
              File 2: Competition Results
            </h4>
            <ul className="text-gray-300 space-y-2 list-none ml-8">
              <li className="flex items-start">
                <span className="text-arena-teal mr-2">•</span>
                <span>Rankings with user IDs and participant names</span>
              </li>
              <li className="flex items-start">
                <span className="text-arena-teal mr-2">•</span>
                <span>Points/scores or completion times</span>
              </li>
              <li className="flex items-start">
                <span className="text-arena-teal mr-2">•</span>
                <span>Exercise counts and timestamps</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

