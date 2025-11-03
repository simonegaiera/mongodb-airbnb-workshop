'use client'

import { useState, useEffect } from 'react'

// Common timezones
const TIMEZONES = [
  { value: 'UTC', label: 'UTC (Coordinated Universal Time)', offset: 0 },
  { value: 'America/New_York', label: 'EST/EDT (New York, Toronto)', offset: -5 },
  { value: 'America/Chicago', label: 'CST/CDT (Chicago, Mexico City)', offset: -6 },
  { value: 'America/Denver', label: 'MST/MDT (Denver, Phoenix)', offset: -7 },
  { value: 'America/Los_Angeles', label: 'PST/PDT (Los Angeles, Vancouver)', offset: -8 },
  { value: 'America/Sao_Paulo', label: 'BRT (São Paulo, Buenos Aires)', offset: -3 },
  { value: 'Europe/London', label: 'GMT/BST (London, Dublin)', offset: 0 },
  { value: 'Europe/Paris', label: 'CET/CEST (Paris, Berlin, Rome)', offset: 1 },
  { value: 'Europe/Istanbul', label: 'TRT (Istanbul)', offset: 3 },
  { value: 'Asia/Dubai', label: 'GST (Dubai)', offset: 4 },
  { value: 'Asia/Kolkata', label: 'IST (Mumbai, Delhi)', offset: 5.5 },
  { value: 'Asia/Shanghai', label: 'CST (Beijing, Shanghai, Hong Kong)', offset: 8 },
  { value: 'Asia/Tokyo', label: 'JST (Tokyo, Seoul)', offset: 9 },
  { value: 'Australia/Sydney', label: 'AEST/AEDT (Sydney, Melbourne)', offset: 10 },
]

// Detect browser timezone
const getBrowserTimezone = () => {
  const browserTz = Intl.DateTimeFormat().resolvedOptions().timeZone
  const matchedTimezone = TIMEZONES.find(tz => tz.value === browserTz)
  return matchedTimezone ? browserTz : 'UTC'
}

export default function PrizeCloseDate() {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('')
  const [currentCloseDate, setCurrentCloseDate] = useState<string>('')
  const [currentTimezone, setCurrentTimezone] = useState<string>('')
  
  // Date/time form fields
  const [year, setYear] = useState('')
  const [month, setMonth] = useState('')
  const [date, setDate] = useState('')
  const [hour, setHour] = useState('')
  const [minute, setMinute] = useState('')
  const [ampm, setAmpm] = useState<'AM' | 'PM'>('AM')
  
  const [timezone, setTimezone] = useState(getBrowserTimezone())
  
  // Store UTC timestamp for conversion
  const [utcTimestamp, setUtcTimestamp] = useState<number | null>(null)

  // Use TIMEZONES constant
  const timezones = TIMEZONES

  // Fetch current close date from backend
  const fetchCurrentCloseDate = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
      const response = await fetch(`${apiUrl}/api/admin/prizes/close-date`)
      const data = await response.json()
      
      if (data.success && data.close_on) {
        setCurrentCloseDate(data.close_on)
        
        // Parse the date and store UTC timestamp
        const closeDate = new Date(data.close_on)
        setUtcTimestamp(closeDate.getTime())
        
        // Use browser timezone for display
        const browserTz = getBrowserTimezone()
        setTimezone(browserTz)
        setCurrentTimezone(browserTz)
        
        // Convert to browser timezone for display
        convertUTCToTimezone(closeDate.getTime(), browserTz)
      }
    } catch (err) {
      console.error('Error fetching close date:', err)
    }
  }

  useEffect(() => {
    fetchCurrentCloseDate()
  }, [])

  // Function to convert UTC timestamp to a specific timezone and populate fields
  const convertUTCToTimezone = (utcTime: number, tz: string) => {
    const date = new Date(utcTime)
    
    // Get date/time components in the target timezone (12-hour format)
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: tz,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })
    
    const parts = formatter.formatToParts(date)
    const getValue = (type: string) => parts.find(p => p.type === type)?.value || ''
    
    setYear(getValue('year'))
    setMonth(getValue('month'))
    setDate(getValue('day'))
    setHour(getValue('hour'))
    setMinute(getValue('minute'))
    setAmpm(getValue('dayPeriod') === 'PM' ? 'PM' : 'AM')
  }

  // Handle timezone change - convert existing time to new timezone
  const handleTimezoneChange = (newTimezone: string) => {
    setTimezone(newTimezone)
    
    // If we have a UTC timestamp, convert it to the new timezone
    if (utcTimestamp !== null) {
      convertUTCToTimezone(utcTimestamp, newTimezone)
    }
  }

  const handleSetNow = () => {
    const now = new Date()
    setUtcTimestamp(now.getTime())
    
    // Use browser timezone
    const browserTz = getBrowserTimezone()
    setTimezone(browserTz)
    convertUTCToTimezone(now.getTime(), browserTz)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage('')
    setMessageType('')

    // Validate inputs
    const yearNum = parseInt(year)
    const monthNum = parseInt(month)
    const dateNum = parseInt(date)
    let hourNum = parseInt(hour)
    const minuteNum = parseInt(minute)

    if (!year || !month || !date || !hour || !minute) {
      setMessage('Please fill in all fields')
      setMessageType('error')
      return
    }

    if (yearNum < 2024 || yearNum > 2100) {
      setMessage('Year must be between 2024 and 2100')
      setMessageType('error')
      return
    }

    if (monthNum < 1 || monthNum > 12) {
      setMessage('Month must be between 1 and 12')
      setMessageType('error')
      return
    }

    if (dateNum < 1 || dateNum > 31) {
      setMessage('Date must be between 1 and 31')
      setMessageType('error')
      return
    }

    if (hourNum < 1 || hourNum > 12) {
      setMessage('Hour must be between 1 and 12')
      setMessageType('error')
      return
    }

    if (minuteNum < 0 || minuteNum > 59) {
      setMessage('Minute must be between 0 and 59')
      setMessageType('error')
      return
    }

    // Convert 12-hour to 24-hour format
    if (ampm === 'PM' && hourNum !== 12) {
      hourNum += 12
    } else if (ampm === 'AM' && hourNum === 12) {
      hourNum = 0
    }

    try {
      setLoading(true)

      // Create date string in the specified timezone and convert to UTC
      const dateString = `${year}-${month.padStart(2, '0')}-${date.padStart(2, '0')}T${hour.padStart(2, '0')}:${minute.padStart(2, '0')}:00`
      
      // Parse the date string as if it's in the selected timezone
      // This creates a formatter that will interpret the date in the target timezone
      const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: timezone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      })
      
      // Create a UTC date from the input (treating it as UTC first)
      const inputAsUTC = new Date(`${dateString}Z`)
      
      // Format it in the target timezone
      const parts = formatter.formatToParts(inputAsUTC)
      const getValue = (type: string) => parts.find((p: Intl.DateTimeFormatPart) => p.type === type)?.value || ''
      
      // Calculate the offset
      const tzYear = parseInt(getValue('year'))
      const tzMonth = parseInt(getValue('month')) - 1
      const tzDay = parseInt(getValue('day'))
      const tzHour = parseInt(getValue('hour'))
      const tzMinute = parseInt(getValue('minute'))
      
      // The difference between what we want and what we got tells us the offset
      const wantedDate = new Date(Date.UTC(yearNum, monthNum - 1, dateNum, hourNum, minuteNum, 0))
      const gotDate = new Date(Date.UTC(tzYear, tzMonth, tzDay, tzHour, tzMinute, 0))
      const offset = wantedDate.getTime() - gotDate.getTime()
      
      // Apply offset to get the correct UTC time
      const closeDate = new Date(inputAsUTC.getTime() + offset)
      setUtcTimestamp(closeDate.getTime())

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
      const response = await fetch(`${apiUrl}/api/admin/prizes/close-date`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          close_on: closeDate.toISOString(),
          timezone: timezone
        })
      })

      const data = await response.json()

      if (data.success) {
        setMessage(data.message || 'Leaderboard freeze date updated successfully. Submissions after this time will not count.')
        setMessageType('success')
        setCurrentCloseDate(closeDate.toISOString())
        // Display the current timezone setting
        setCurrentTimezone(timezone)
      } else {
        setMessage(data.error || 'Failed to update freeze date')
        setMessageType('error')
      }
    } catch (err) {
      setMessage('Network error: ' + (err as Error).message)
      setMessageType('error')
    } finally {
      setLoading(false)
    }
  }

  const formatDisplayDate = (isoDate: string, tz: string) => {
    if (!isoDate) return 'Not set'
    const date = new Date(isoDate)
    const tzName = TIMEZONES.find(t => t.value === tz)?.label.split('(')[0].trim() || tz
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: tz,
      timeZoneName: 'short'
    }) + ` (${tzName})`
  }

  return (
    <div className="card-arena rounded-lg shadow-lg p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-arena-neon-green mb-2">
          Leaderboard Freeze Date
        </h2>
        <p className="text-gray-300 text-sm">
          Set when the leaderboard will freeze. Any submissions after this date will not count.
        </p>
        {currentCloseDate && (
          <p className="text-gray-400 text-sm mt-2">
            Leaderboard freezes at: <span className="text-arena-teal font-semibold">{formatDisplayDate(currentCloseDate, currentTimezone || 'UTC')}</span>
          </p>
        )}
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Timezone Selection - First */}
        <div>
          <label htmlFor="timezone" className="block text-sm font-medium text-gray-300 mb-2">
            Timezone
          </label>
          <select
            id="timezone"
            value={timezone}
            onChange={(e) => handleTimezoneChange(e.target.value)}
            className="w-full px-4 py-2 bg-arena-dark-light border border-arena-teal rounded-md text-white focus:outline-none focus:ring-2 focus:ring-arena-neon-green focus:border-arena-neon-green"
            required
          >
            {timezones.map((tz) => (
              <option key={tz.value} value={tz.value}>
                {tz.label}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-400 mt-1">
            Select timezone to enter the date. It will be stored as UTC in the database.
          </p>
        </div>

        {/* Calendar Date Row */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Calendar Date
          </label>
          <div className="grid grid-cols-3 gap-4">
            {/* Year Input */}
            <div>
              <input
                type="number"
                id="year"
                min="2024"
                max="2100"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="w-full px-4 py-2 bg-arena-dark-light border border-arena-teal rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-arena-neon-green focus:border-arena-neon-green"
                placeholder="YYYY"
                required
              />
            </div>

            {/* Month Input */}
            <div>
              <input
                type="number"
                id="month"
                min="1"
                max="12"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="w-full px-4 py-2 bg-arena-dark-light border border-arena-teal rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-arena-neon-green focus:border-arena-neon-green"
                placeholder="MM"
                required
              />
            </div>

            {/* Date Input */}
            <div>
              <input
                type="number"
                id="date"
                min="1"
                max="31"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-2 bg-arena-dark-light border border-arena-teal rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-arena-neon-green focus:border-arena-neon-green"
                placeholder="DD"
                required
              />
            </div>
          </div>
        </div>

        {/* Time Row */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Time
          </label>
          <div className="grid grid-cols-3 gap-4">
            {/* Hour Input */}
            <div>
              <input
                type="number"
                id="hour"
                min="1"
                max="12"
                value={hour}
                onChange={(e) => setHour(e.target.value)}
                className="w-full px-4 py-2 bg-arena-dark-light border border-arena-teal rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-arena-neon-green focus:border-arena-neon-green"
                placeholder="HH"
                required
              />
            </div>

            {/* Minute Input */}
            <div>
              <input
                type="number"
                id="minute"
                min="0"
                max="59"
                value={minute}
                onChange={(e) => setMinute(e.target.value)}
                className="w-full px-4 py-2 bg-arena-dark-light border border-arena-teal rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-arena-neon-green focus:border-arena-neon-green"
                placeholder="MM"
                required
              />
            </div>

            {/* AM/PM Selector */}
            <div>
              <select
                id="ampm"
                value={ampm}
                onChange={(e) => setAmpm(e.target.value as 'AM' | 'PM')}
                className="w-full px-4 py-2 bg-arena-dark-light border border-arena-teal rounded-md text-white focus:outline-none focus:ring-2 focus:ring-arena-neon-green focus:border-arena-neon-green"
                required
              >
                <option value="AM">AM</option>
                <option value="PM">PM</option>
              </select>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-4">
          <button
            type="button"
            onClick={handleSetNow}
            className="flex-1 bg-arena-teal text-white py-2 px-4 rounded-md hover:bg-opacity-80 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            Set to Now
          </button>
          <button
            type="submit"
            className="flex-1 bg-arena-neon-green text-arena-dark py-2 px-4 rounded-md hover:bg-arena-bright-green transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? 'Updating...' : 'Set Freeze Date'}
          </button>
        </div>

        {/* Message Display */}
        {message && (
          <div
            className={`p-3 rounded-md text-sm ${
              messageType === 'success'
                ? 'bg-green-900/50 text-green-300 border border-green-700'
                : 'bg-red-900/50 text-red-300 border border-red-700'
            }`}
          >
            {message}
          </div>
        )}
      </form>
    </div>
  )
}

