'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { showToast } from '../lib/toast'

interface SchedulerContextType {
  isGlobalSchedulerEnabled: boolean
  toggleGlobalScheduler: () => Promise<void>
}

const SchedulerContext = createContext<SchedulerContextType | undefined>(undefined)

export const useScheduler = () => {
  const context = useContext(SchedulerContext)
  if (!context) {
    throw new Error('useScheduler must be used within a SchedulerProvider')
  }
  return context
}

export const SchedulerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isGlobalSchedulerEnabled, setIsGlobalSchedulerEnabled] = useState(true)

  useEffect(() => {
    const fetchSchedulerState = async () => {
      try {
        const response = await fetch('/api/scheduler')
        if (response.ok) {
          const data = await response.json()
          setIsGlobalSchedulerEnabled(data.isEnabled)
        }
      } catch (error) {
        console.error('Failed to fetch scheduler state:', error)
      }
    }

    fetchSchedulerState()
  }, [])

  const toggleGlobalScheduler = async () => {
    try {
      const response = await fetch('/api/scheduler', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isEnabled: !isGlobalSchedulerEnabled }),
      })

      if (response.ok) {
        setIsGlobalSchedulerEnabled(!isGlobalSchedulerEnabled)
        showToast.success(`Global scheduler ${!isGlobalSchedulerEnabled ? 'enabled' : 'disabled'}`)
      } else {
        throw new Error('Failed to update scheduler state')
      }
    } catch (error) {
      console.error('Error toggling global scheduler:', error)
      showToast.error('Failed to update scheduler state')
    }
  }

  return (
    <SchedulerContext.Provider value={{ isGlobalSchedulerEnabled, toggleGlobalScheduler }}>
      {children}
    </SchedulerContext.Provider>
  )
}

