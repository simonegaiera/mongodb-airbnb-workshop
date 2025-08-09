'use client'

import { useState } from 'react'

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
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            New to Arena?
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-mongodb-green focus:border-mongodb-green"
            />
          </div>
          
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-mongodb-green focus:border-mongodb-green"
            />
          </div>
        </div>
        
        <button 
          type="submit" 
          className="w-full bg-mongodb-green text-mongodb-light font-semibold py-2 px-4 rounded-md hover:bg-green-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-mongodb-green transition-colors duration-200"
        >
          Start Challenge
        </button>
      </form>
    </div>
  )
}
