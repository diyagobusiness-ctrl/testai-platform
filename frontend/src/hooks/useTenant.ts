'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from './useAuth'
import api from '@/lib/api'

export interface TenantData {
  id: string
  name: string
  slug: string
  logoUrl?: string
  subscriptionPlan: string
  maxStudents: number
  currentStudentsCount: number
  isActive: boolean
  createdAt: string
}

export interface TenantStats {
  totalStudents: number
  activeStudents: number
  suspendedStudents: number
  engagementRate: number
  moduleUsage: {
    voiceAI: number
    yCodes: number
    jobHunt: number
    resumeCraft: number
    aptitudeArena: number
  }
}

export function useTenant() {
  const { tenant, isTenantAdmin } = useAuth()
  const [tenantData, setTenantData] = useState<TenantData | null>(null)
  const [stats, setStats] = useState<TenantStats | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchTenantData = useCallback(async () => {
    if (!tenant?.id) return
    
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await api.get(`/api/tenant/${tenant.id}`)
      const data = response.data as unknown as TenantData
      setTenantData(data || null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch tenant data')
    } finally {
      setIsLoading(false)
    }
  }, [tenant?.id])

  const fetchTenantStats = useCallback(async () => {
    if (!tenant?.id) return
    
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await api.get(`/api/tenant/${tenant.id}/stats`)
      const data = response.data as unknown as TenantStats
      setStats(data || null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch tenant stats')
    } finally {
      setIsLoading(false)
    }
  }, [tenant?.id])

  const updateTenant = useCallback(async (data: Partial<TenantData>) => {
    if (!tenant?.id) return
    
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await api.put(`/api/tenant/${tenant.id}`, data)
      const responseData = response.data as unknown as TenantData
      setTenantData(responseData || null)
      return { success: true }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update tenant')
      return { success: false, error: err instanceof Error ? err.message : 'Update failed' }
    } finally {
      setIsLoading(false)
    }
  }, [tenant?.id])

  useEffect(() => {
    if (isTenantAdmin && tenant?.id) {
      fetchTenantData()
      fetchTenantStats()
    }
  }, [isTenantAdmin, tenant?.id, fetchTenantData, fetchTenantStats])

  const isAtStudentLimit = tenantData 
    ? tenantData.currentStudentsCount >= tenantData.maxStudents 
    : false

  const studentUsagePercentage = tenantData
    ? (tenantData.currentStudentsCount / tenantData.maxStudents) * 100
    : 0

  return {
    tenantData,
    stats,
    isLoading,
    error,
    fetchTenantData,
    fetchTenantStats,
    updateTenant,
    isAtStudentLimit,
    studentUsagePercentage,
  }
}

export default useTenant
