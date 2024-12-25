'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { showToast } from '../lib/toast'

interface SchedulerContextType {
  isGlobalSchedulerEnabled: boolean;
  setIsGlobalSchedulerEnabled: (isEnabled: boolean) => void;
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
  toggleGlobalScheduler: () => Promise<void>;
}

const SchedulerContext = createContext<SchedulerContextType>({
  isGlobalSchedulerEnabled: false,
  isLoading: true,
  setIsGlobalSchedulerEnabled: () => {},
  setIsLoading: () => {},
  toggleGlobalScheduler: async () => {},
})

export function useScheduler() {
  const context = useContext(SchedulerContext)
  if (!context) {
    throw new Error('useScheduler must be used within a SchedulerProvider')
  }
  return context
}

export function SchedulerProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [isGlobalSchedulerEnabled, setIsGlobalSchedulerEnabled] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

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
      } finally {
        setIsLoading(false)
      }
    }

    fetchSchedulerState()
  }, [])

  const toggleGlobalScheduler = async () => {
    if (isLoading) return

    setIsLoading(true)
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
    } finally {
      setIsLoading(false)
    }
  }

  const value = {
    isGlobalSchedulerEnabled,
    setIsGlobalSchedulerEnabled,
    isLoading,
    setIsLoading,
    toggleGlobalScheduler,
  }

  return (
    <SchedulerContext.Provider value={value}>
      {children}
    </SchedulerContext.Provider>
  )
}

