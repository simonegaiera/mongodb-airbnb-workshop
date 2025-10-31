'use client'

import { useState, useEffect } from 'react'

interface TakeParticipantFormProps {
  onSuccess: () => void
  onError: (error: string) => void
  onLoading: (loading: boolean) => void
}

export default function TakeParticipantForm({ onSuccess, onError, onLoading }: TakeParticipantFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: ''
  })
  
  const [isMobile, setIsMobile] = useState(false)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    
    const detectMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera
      
      // Check for mobile user agents
      const mobileRegex = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i
      const isMobileUserAgent = mobileRegex.test(userAgent.toLowerCase())
      
      // Check for touch capability and screen size
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0
      const isSmallScreen = window.innerWidth <= 768
      
      // Consider it mobile if it has mobile user agent OR (is touch device AND small screen)
      return isMobileUserAgent || (isTouchDevice && isSmallScreen)
    }
    
    setIsMobile(detectMobile())
    
    // Also check on window resize
    const handleResize = () => {
      setIsMobile(detectMobile())
    }
    
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])
  
  // Don't render anything until client-side hydration is complete
  if (!isClient) {
    return (
      <div className="card-arena rounded-lg shadow-lg p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-arena-dark-light rounded mb-4 w-1/3"></div>
          <div className="space-y-3">
            <div className="h-4 bg-arena-dark-light rounded w-1/4"></div>
            <div className="h-10 bg-arena-dark-light rounded"></div>
          </div>
        </div>
      </div>
    )
  }
  
  // Show mobile restriction message if user is on mobile
  if (isMobile) {
    return (
      <div className="card-arena rounded-lg shadow-lg border-red-400 p-6">
        <div className="text-center">
          <div className="mb-4">
            <svg
              className="mx-auto h-12 w-12 text-red-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 18.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-arena-neon-green mb-2">
            Laptop Required
          </h3>
          <div className="bg-yellow-900/30 border border-yellow-500/50 rounded-md p-3">
            <p className="text-sm text-yellow-300">
              💻 Please switch to a laptop or desktop computer to join the MongoDB Arena challenge.
            </p>
          </div>
        </div>
      </div>
    )
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name || !formData.email) {
      onError('Please fill in all fields')
      return
    }

    try {
      onLoading(true)
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
      const response = await fetch(`${apiUrl}/api/participants/take`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (data.success) {
        onError('') // Clear any previous errors
        setFormData({ name: '', email: '' })
        onSuccess()
      } else {
        onError(data.error || 'Failed to take participant')
      }
    } catch (err) {
      onError('Network error: ' + (err as Error).message)
    } finally {
      onLoading(false)
    }
  }

  return (
    <div className="card-arena rounded-lg shadow-lg p-6 card-arena-hover">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-arena-neon-green mb-2">
            Join the Challenge
          </h3>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 items-end">
          <div className="flex-1">
            <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">
              Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter your name"
              required
              className="w-full px-3 py-2 bg-arena-dark-light border border-arena-teal rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-arena-neon-green focus:border-arena-neon-green transition-all"
            />
          </div>
          
          <div className="flex-1">
            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Enter your email"
              required
              className="w-full px-3 py-2 bg-arena-dark-light border border-arena-teal rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-arena-neon-green focus:border-arena-neon-green transition-all"
            />
          </div>

          <div className="flex-shrink-0">
            <button 
              type="submit" 
              className="bg-arena-neon-green text-arena-dark font-bold py-2 px-6 rounded-md hover:bg-arena-bright-green focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-arena-neon-green focus:ring-offset-arena-dark transition-all duration-200 whitespace-nowrap shadow-lg hover:shadow-arena-neon-green/50"
            >
              Start Challenge
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
