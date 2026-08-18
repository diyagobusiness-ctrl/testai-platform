'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from './useAuth'
import api from '@/lib/api'

export interface StudentData {
  id: string
  userId: string
  tenantId: string
  enrollmentDate: string
  isActive: boolean
  totalCredits: number
  currentCredits: number
  user: {
    id: string
    email: string
    firstName: string
    lastName: string
    avatarUrl?: string
  }
}

export interface StudentStats {
  overallProgress: number
  activityStreak: number
  completedModules: number
  totalModules: number
  recentScores: {
    aptitude: number[]
    voiceAI: number[]
    yCodes: number[]
  }
  upcomingDeadlines: {
    type: string
    title: string
    deadline: string
  }[]
}

export function useStudent() {
  const { user, isStudent, tenant } = useAuth()
  const [studentData, setStudentData] = useState<StudentData | null>(null)
  const [stats, setStats] = useState<StudentStats | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchStudentData = useCallback(async () => {
    if (!user?.id) return
    
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await api.getStudentProfile()
      setStudentData(response.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch student data')
    } finally {
      setIsLoading(false)
    }
  }, [user?.id])

  const fetchStudentStats = useCallback(async () => {
    if (!user?.id) return
    
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await api.getDashboard()
      setStats(response.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch student stats')
    } finally {
      setIsLoading(false)
    }
  }, [user?.id])

  const updateProfile = useCallback(async (data: Partial<StudentData>) => {
    if (!user?.id) return
    
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await api.updateProfile(data)
      setStudentData(response.data)
      return { success: true }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile')
      return { success: false, error: err instanceof Error ? err.message : 'Update failed' }
    } finally {
      setIsLoading(false)
    }
  }, [user?.id])

  const purchaseCredits = useCallback(async (amount: number) => {
    if (!user?.id) return
    
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await api.purchaseCredits(amount)
      setStudentData(prev => prev ? {
        ...prev,
        currentCredits: prev.currentCredits + amount,
      } : null)
      return { success: true }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to purchase credits')
      return { success: false, error: err instanceof Error ? err.message : 'Purchase failed' }
    } finally {
      setIsLoading(false)
    }
  }, [user?.id])

  useEffect(() => {
    if (isStudent && user?.id) {
      fetchStudentData()
      fetchStudentStats()
    }
  }, [isStudent, user?.id, fetchStudentData, fetchStudentStats])

  const hasEnoughCredits = (required: number) => {
    return studentData ? studentData.currentCredits >= required : false
  }

  const creditUsagePercentage = studentData
    ? ((studentData.totalCredits - studentData.currentCredits) / studentData.totalCredits) * 100
    : 0

  return {
    studentData,
    stats,
    isLoading,
    error,
    fetchStudentData,
    fetchStudentStats,
    updateProfile,
    purchaseCredits,
    hasEnoughCredits,
    creditUsagePercentage,
  }
}

export default useStudent
