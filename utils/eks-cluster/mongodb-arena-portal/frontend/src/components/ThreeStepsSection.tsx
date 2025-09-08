'use client'

import { useState, useEffect } from 'react'

const ThreeStepsSection: React.FC = () => {
  // State for collapsible steps (default based on screen size)
  const [stepsExpanded, setStepsExpanded] = useState(false)

  const toggleSteps = () => {
    setStepsExpanded(prev => !prev)
  }

  // Set initial state based on screen size
  useEffect(() => {
    const checkScreenSize = () => {
      // Consider screens >= 1600px as "big screens" (large desktop monitors)
      // Most laptops are typically 1366px, 1440px, or 1536px wide
      const isBigScreen = window.innerWidth >= 1600
      setStepsExpanded(isBigScreen)
    }

    // Check on mount
    checkScreenSize()

    // Listen for resize events
    window.addEventListener('resize', checkScreenSize)

    // Cleanup
    return () => window.removeEventListener('resize', checkScreenSize)
  }, [])

  // Extract the domain from the API URL to create the instructions URL
  const getInstructionsUrl = () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
    
    try {
      const url = new URL(apiUrl)
      const hostname = url.hostname
      
      // If it's localhost or IP, use fallback
      if (hostname === 'localhost' || /^\d+\.\d+\.\d+\.\d+$/.test(hostname)) {
        return 'https://mongoarena.com/'
      }
      
      // Extract the base domain (preserve mongoai.mongoarena.com structure)
      const parts = hostname.split('.')
      if (parts.length >= 3) {
        // For mongoai.mongoarena.com structure, keep the full domain
        const baseDomain = parts.slice(-3).join('.')
        return `https://instructions.${baseDomain}/`
      } else if (parts.length >= 2) {
        // Fallback to last two parts for other domains
        const baseDomain = parts.slice(-2).join('.')
        return `https://instructions.${baseDomain}/`
      }
      
      // Fallback
      return `https://instructions.${hostname}/`
    } catch (error) {
      // Fallback for invalid URLs
      return 'https://.mongoarena.com/'
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Step 1: Read Instructions */}
        <div className="p-4 bg-gray-50 rounded-lg border-2 border-gray-200 hover:border-mongodb-green transition-colors flex flex-col">
          <div 
            className="flex items-center justify-center mb-4 cursor-pointer"
            onClick={toggleSteps}
          >
            <div className="w-12 h-12 bg-mongodb-green text-white rounded-full flex items-center justify-center text-lg font-bold mr-3">
              1
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              Open the Instructions
            </h3>
            <div className="ml-2 p-1 text-mongodb-green hover:text-mongodb-dark transition-colors">
              <svg 
                className={`w-4 h-4 transition-transform duration-200 ${stepsExpanded ? 'rotate-180' : ''}`}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
          
          {/* Collapsible Content */}
          <div className={`overflow-hidden transition-all duration-300 ease-in-out ${stepsExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
            <div className="text-center mb-4 flex-grow flex flex-col min-h-60">
              <div className="flex-grow flex items-start justify-center pt-4">
                <img 
                  src="/step-first.png" 
                  alt="Step 1 - Read Instructions" 
                  className="h-52 mx-auto object-contain object-top"
                />
              </div>
            </div>
          </div>
          
          <div className="text-center mt-auto">
            <a
              href={getInstructionsUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 bg-mongodb-green text-white text-sm font-medium rounded-md hover:bg-mongodb-dark transition-colors"
            >
              Instructions
              <svg className="ml-1 w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
        </div>

        {/* Step 2: Open the Workload */}
        <div className="p-4 bg-gray-50 rounded-lg border-2 border-gray-200 hover:border-mongodb-green transition-colors flex flex-col">
          <div 
            className="flex items-center justify-center mb-4 cursor-pointer"
            onClick={toggleSteps}
          >
            <div className="w-12 h-12 bg-mongodb-green text-white rounded-full flex items-center justify-center text-lg font-bold mr-3">
              2
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              Open the Workspace
            </h3>
            <div className="ml-2 p-1 text-mongodb-green hover:text-mongodb-dark transition-colors">
              <svg 
                className={`w-4 h-4 transition-transform duration-200 ${stepsExpanded ? 'rotate-180' : ''}`}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
          
          {/* Collapsible Content */}
          <div className={`overflow-hidden transition-all duration-300 ease-in-out ${stepsExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
            <div className="text-center mb-4 flex-grow flex flex-col min-h-60">
              <div className="flex-grow flex items-start justify-center pt-4">
                <img 
                  src="/step-second.png" 
                  alt="Step 2 - Open Workload" 
                  className="h-30 mx-auto object-contain object-top"
                />
              </div>
              <div className="text-gray-600 text-sm mt-2">
                <ul className="text-left space-y-2 mb-3">
                  <li className="font-medium text-gray-800">- Open a new terminal:
                    <code className="bg-gray-800 text-green-400 px-2 py-1 rounded text-xs font-mono block mt-1">
                      ☰ {'>'} Terminal {'>'} New Terminal
                    </code>
                  </li>
                  <li className="font-medium text-gray-800">- Start the server:
                    <code className="bg-gray-800 text-green-400 px-2 py-1 rounded text-xs font-mono block mt-1">
                      npm start
                    </code>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="text-center mt-auto">
            <div className="inline-flex items-center px-4 py-2 bg-gray-300 text-gray-600 text-sm font-medium rounded-md cursor-not-allowed">
              Find Your Name Below
              <svg className="ml-1 w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </div>
          </div>
        </div>

        {/* Step 3: Open the App */}
        <div className="p-4 bg-gray-50 rounded-lg border-2 border-gray-200 hover:border-mongodb-green transition-colors flex flex-col">
          <div 
            className="flex items-center justify-center mb-4 cursor-pointer"
            onClick={toggleSteps}
          >
            <div className="w-12 h-12 bg-mongodb-green text-white rounded-full flex items-center justify-center text-lg font-bold mr-3">
              3
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              Open the App
            </h3>
            <div className="ml-2 p-1 text-mongodb-green hover:text-mongodb-dark transition-colors">
              <svg 
                className={`w-4 h-4 transition-transform duration-200 ${stepsExpanded ? 'rotate-180' : ''}`}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
          
          {/* Collapsible Content */}
          <div className={`overflow-hidden transition-all duration-300 ease-in-out ${stepsExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
            <div className="text-center mb-4">
              <div className="pt-4">
                <img 
                  src="/step-third.png" 
                  alt="Step 3 - Open App" 
                  className="h-30 mx-auto object-contain object-top"
                />
              </div>
              <div className="text-gray-600 text-sm mt-2">
                <div className="text-center">
                  <p className="text-gray-800 font-medium">
                    See your name on the homepage?<br />
                    ✅ You're in!
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="text-center mt-auto">
            <div className="inline-flex items-center px-4 py-2 bg-gray-300 text-gray-600 text-sm font-medium rounded-md cursor-not-allowed">
              Find Your Name Below
              <svg className="ml-1 w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ThreeStepsSection
