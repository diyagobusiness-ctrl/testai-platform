'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { cn } from '@/lib/utils'
import { CardHover } from '@/components/animations/CardHover'
import { api } from '@/lib/api'
import {
  Search,
  Plus,
  Building2,
  Users,
  Filter,
  ChevronLeft,
  ChevronRight,
  X,
  CheckCircle,
  XCircle,
  Clock,
  Trash2,
  Edit,
  AlertTriangle,
  Key,
  Mail,
} from 'lucide-react'

type TenantStatus = 'active' | 'suspended' | 'trial'

interface Tenant {
  id: string
  name: string
  slug: string
  subscription_plan: string
  student_count: number
  max_students: number
  is_active: boolean
  suspended_at: string | null
  created_at: string
  admin_email?: string
}

interface Pagination {
  page: number
  limit: number
  total: number
  pages: number
}

const ITEMS_PER_PAGE = 6

const statusConfig: Record<TenantStatus, { label: string; color: string; bgColor: string; icon: typeof CheckCircle }> = {
  active: { label: 'Active', color: 'text-green-500', bgColor: 'bg-green-500/10', icon: CheckCircle },
  suspended: { label: 'Suspended', color: 'text-red-500', bgColor: 'bg-red-500/10', icon: XCircle },
  trial: { label: 'Trial', color: 'text-yellow-500', bgColor: 'bg-yellow-500/10', icon: Clock },
}

function getStatus(tenant: Tenant): TenantStatus {
  if (tenant.suspended_at) return 'suspended'
  if (tenant.subscription_plan === 'TRIAL') return 'trial'
  return 'active'
}

export default function TenantManagement() {
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 6, total: 0, pages: 0 })
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<TenantStatus | 'all'>('all')
  const [planFilter, setPlanFilter] = useState<string>('all')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [createLoading, setCreateLoading] = useState(false)
  const [createForm, setCreateForm] = useState({ name: '', slug: '', subscriptionPlan: 'TRIAL', maxStudents: 50, adminEmail: '', adminFirstName: '', adminLastName: '' })
  const [createdAdmin, setCreatedAdmin] = useState<{ email: string; tempPassword: string } | null>(null)
  const [resetResult, setResetResult] = useState<{ tenantName: string; email: string; tempPassword: string } | null>(null)
  const [createAdminFor, setCreateAdminFor] = useState<Tenant | null>(null)
  const [adminForm, setAdminForm] = useState({ email: '', firstName: '', lastName: '' })
  const [adminCreating, setAdminCreating] = useState(false)

  const fetchTenants = useCallback(async (page = 1) => {
    setLoading(true)
    try {
      const params: Record<string, unknown> = { page, limit: ITEMS_PER_PAGE }
      if (search) params.search = search
      if (statusFilter !== 'all') params.status = statusFilter
      if (planFilter !== 'all') params.plan = planFilter

      const res = await api.getTenants(params)
      setTenants(res.data.tenants || [])
      setPagination(res.data.pagination || { page: 1, limit: 6, total: 0, pages: 0 })
    } catch (err) {
      console.error('Failed to fetch tenants:', err)
    } finally {
      setLoading(false)
    }
  }, [search, statusFilter, planFilter])

  useEffect(() => {
    fetchTenants(1)
  }, [fetchTenants])

  const handleCreateTenant = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreateLoading(true)
    try {
      const res = await api.createTenant(createForm)
      const { adminUser, tempPassword } = res.data
      if (adminUser && tempPassword) {
        setCreatedAdmin({ email: adminUser.email, tempPassword })
      } else {
        setShowCreateModal(false)
      }
      setCreateForm({ name: '', slug: '', subscriptionPlan: 'TRIAL', maxStudents: 50, adminEmail: '', adminFirstName: '', adminLastName: '' })
      fetchTenants(1)
    } catch (err) {
      console.error('Failed to create tenant:', err)
    } finally {
      setCreateLoading(false)
    }
  }

  const handleToggleStatus = async (tenant: Tenant) => {
    try {
      if (tenant.suspended_at) {
        await api.post(`/api/super-admin/tenants/${tenant.id}/reactivate`)
      } else {
        await api.suspendTenant(tenant.id)
      }
      fetchTenants(pagination.page)
    } catch (err) {
      console.error('Failed to toggle tenant status:', err)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this tenant?')) return
    try {
      await api.delete(`/api/super-admin/tenants/${id}`)
      fetchTenants(pagination.page)
    } catch (err) {
      console.error('Failed to delete tenant:', err)
    }
  }

  const handleResetPassword = async (tenant: Tenant) => {
    if (!confirm(`Reset admin password for ${tenant.name}?`)) return
    try {
      const res = await api.resetTenantAdminPassword(tenant.id)
      setResetResult({
        tenantName: tenant.name,
        email: res.data.admin.email,
        tempPassword: res.data.tempPassword,
      })
    } catch (err) {
      console.error('Failed to reset password:', err)
    }
  }

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!createAdminFor) return
    setAdminCreating(true)
    try {
      const res = await api.createTenantAdmin(createAdminFor.id, adminForm)
      setResetResult({
        tenantName: createAdminFor.name,
        email: res.data.admin.email,
        tempPassword: res.data.tempPassword,
      })
      setCreateAdminFor(null)
      setAdminForm({ email: '', firstName: '', lastName: '' })
      fetchTenants(pagination.page)
    } catch (err) {
      console.error('Failed to create admin:', err)
    } finally {
      setAdminCreating(false)
    }
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold">
            <span className="gradient-text">Tenant</span> Management
          </h1>
          <p className="mt-2 text-muted-foreground">
            Manage all tenant organizations on your platform.
          </p>
        </div>
        <motion.button
          className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 font-semibold text-white"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowCreateModal(true)}
        >
          <Plus className="h-4 w-4" />
          Create Tenant
        </motion.button>
      </motion.div>

      {/* Filters */}
      <CardHover intensity="low">
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search tenants..."
                value={search}
                onChange={(e) => { setSearch(e.target.value) }}
                className="w-full rounded-lg border border-border bg-background py-2.5 pl-10 pr-4 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div className="flex gap-3">
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as TenantStatus | 'all')}
                  className="appearance-none rounded-lg border border-border bg-background py-2.5 pl-10 pr-8 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="suspended">Suspended</option>
                  <option value="trial">Trial</option>
                </select>
              </div>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <select
                  value={planFilter}
                  onChange={(e) => setPlanFilter(e.target.value)}
                  className="appearance-none rounded-lg border border-border bg-background py-2.5 pl-10 pr-8 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="all">All Plans</option>
                  <option value="TRIAL">Trial</option>
                  <option value="BASIC">Basic</option>
                  <option value="PREMIUM">Premium</option>
                  <option value="ENTERPRISE">Enterprise</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </CardHover>

      {/* Tenants Table */}
      <CardHover intensity="low">
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          {loading ? (
            <div className="flex h-40 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : tenants.length === 0 ? (
            <div className="flex h-40 items-center justify-center text-muted-foreground">
              No tenants found
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-muted/50">
                      <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Name</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Slug</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Admin / Password</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Plan</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Students</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Status</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <AnimatePresence mode="popLayout">
                      {tenants.map((tenant, index) => {
                        const currentStatus = getStatus(tenant)
                        const status = statusConfig[currentStatus]
                        const StatusIcon = status.icon
                        return (
                          <motion.tr
                            key={tenant.id}
                            className="border-b border-border transition-colors hover:bg-muted/30"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ delay: index * 0.03 }}
                          >
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                                  <Building2 className="h-4 w-4 text-primary" />
                                </div>
                                <span className="font-medium">{tenant.name}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <code className="rounded bg-muted px-2 py-1 text-xs">{tenant.slug}</code>
                            </td>
                            <td className="px-6 py-4 text-sm">
                              {tenant.admin_email ? (
                                <div className="flex items-center gap-2">
                                  <span className="text-muted-foreground">{tenant.admin_email}</span>
                                  <motion.button
                                    className="rounded-md bg-yellow-500/10 px-2 py-1 text-xs font-medium text-yellow-500 hover:bg-yellow-500/20"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => handleResetPassword(tenant)}
                                    title="Reset Password"
                                  >
                                    Reset Password
                                  </motion.button>
                                </div>
                              ) : (
                                <motion.button
                                  className="rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary hover:bg-primary/20"
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => setCreateAdminFor(tenant)}
                                >
                                  + Create Admin
                                </motion.button>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              <span className={cn(
                                'rounded-full px-2.5 py-1 text-xs font-medium',
                                tenant.subscription_plan === 'ENTERPRISE' && 'bg-yellow-500/10 text-yellow-500',
                                tenant.subscription_plan === 'PREMIUM' && 'bg-purple-500/10 text-purple-500',
                                tenant.subscription_plan === 'BASIC' && 'bg-blue-500/10 text-blue-500',
                                tenant.subscription_plan === 'TRIAL' && 'bg-gray-500/10 text-gray-500',
                              )}>
                                {tenant.subscription_plan}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-1.5">
                                <Users className="h-4 w-4 text-muted-foreground" />
                                {tenant.student_count || 0} / {tenant.max_students}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium', status.bgColor, status.color)}>
                                <StatusIcon className="h-3 w-3" />
                                {status.label}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-muted-foreground">
                              {new Date(tenant.created_at).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <motion.button
                                  className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => handleToggleStatus(tenant)}
                                  title={currentStatus === 'active' ? 'Suspend' : 'Activate'}
                                >
                                  {currentStatus === 'active' ? (
                                    <AlertTriangle className="h-4 w-4" />
                                  ) : (
                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                  )}
                                </motion.button>
                                <motion.button
                                  className="rounded-lg p-1.5 text-muted-foreground hover:bg-red-500/10 hover:text-red-500"
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => handleDelete(tenant.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </motion.button>
                              </div>
                            </td>
                          </motion.tr>
                        )
                      })}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="flex items-center justify-between border-t border-border px-6 py-4">
                  <p className="text-sm text-muted-foreground">
                    Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
                    {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                    {pagination.total} tenants
                  </p>
                  <div className="flex items-center gap-2">
                    <motion.button
                      className="rounded-lg border border-border p-2 text-muted-foreground hover:bg-muted disabled:opacity-50"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      disabled={pagination.page === 1}
                      onClick={() => fetchTenants(pagination.page - 1)}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </motion.button>
                    {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
                      <motion.button
                        key={page}
                        className={cn(
                          'h-8 w-8 rounded-lg text-sm font-medium',
                          pagination.page === page
                            ? 'bg-primary text-white'
                            : 'text-muted-foreground hover:bg-muted'
                        )}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => fetchTenants(page)}
                      >
                        {page}
                      </motion.button>
                    ))}
                    <motion.button
                      className="rounded-lg border border-border p-2 text-muted-foreground hover:bg-muted disabled:opacity-50"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      disabled={pagination.page === pagination.pages}
                      onClick={() => fetchTenants(pagination.page + 1)}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </motion.button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </CardHover>

      {/* Create Tenant Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowCreateModal(false)}
            />
            <motion.div
              className="relative z-10 w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-xl"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">
                  {createdAdmin ? 'Tenant Created' : 'Create New Tenant'}
                </h2>
                <button
                  onClick={() => { setShowCreateModal(false); setCreatedAdmin(null) }}
                  className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {createdAdmin ? (
                <div className="space-y-4">
                  <div className="rounded-lg border border-green-500/30 bg-green-500/10 p-4">
                    <p className="text-sm text-green-500 font-medium">Tenant and admin user created successfully!</p>
                    <div className="mt-3 space-y-2">
                      <div>
                        <p className="text-xs text-muted-foreground">Admin Email:</p>
                        <code className="block rounded bg-muted p-2 text-sm font-mono">{createdAdmin.email}</code>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Temporary Password:</p>
                        <code className="block rounded bg-muted p-2 text-sm font-mono">{createdAdmin.tempPassword}</code>
                      </div>
                    </div>
                    <p className="mt-3 text-xs text-muted-foreground">
                      Share these credentials with the tenant admin. They should change the password on first login.
                    </p>
                  </div>
                  <div className="flex justify-end">
                    <motion.button
                      className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => { setShowCreateModal(false); setCreatedAdmin(null) }}
                    >
                      Done
                    </motion.button>
                  </div>
                </div>
              ) : (
                <form className="space-y-4" onSubmit={handleCreateTenant}>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium">Organization Name</label>
                    <input
                      type="text"
                      value={createForm.name}
                      onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                      placeholder="e.g. TechCorp Academy"
                      required
                      className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium">Slug</label>
                    <input
                      type="text"
                      value={createForm.slug}
                      onChange={(e) => setCreateForm({ ...createForm, slug: e.target.value })}
                      placeholder="e.g. techcorp"
                      required
                      className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium">Plan</label>
                      <select
                        value={createForm.subscriptionPlan}
                        onChange={(e) => setCreateForm({ ...createForm, subscriptionPlan: e.target.value })}
                        className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                      >
                        <option value="TRIAL">Trial</option>
                        <option value="BASIC">Basic</option>
                        <option value="PREMIUM">Premium</option>
                        <option value="ENTERPRISE">Enterprise</option>
                      </select>
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium">Max Students</label>
                      <input
                        type="number"
                        value={createForm.maxStudents}
                        onChange={(e) => setCreateForm({ ...createForm, maxStudents: parseInt(e.target.value) || 50 })}
                        min={1}
                        className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                  </div>
                  <div className="border-t border-border pt-4">
                    <p className="mb-3 text-sm font-medium text-muted-foreground">Admin User (optional)</p>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium">Admin Email</label>
                      <input
                        type="email"
                        value={createForm.adminEmail}
                        onChange={(e) => setCreateForm({ ...createForm, adminEmail: e.target.value })}
                        placeholder="admin@example.com"
                        className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-4">
                      <div>
                        <label className="mb-1.5 block text-sm font-medium">First Name</label>
                        <input
                          type="text"
                          value={createForm.adminFirstName}
                          onChange={(e) => setCreateForm({ ...createForm, adminFirstName: e.target.value })}
                          placeholder="John"
                          className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                      </div>
                      <div>
                        <label className="mb-1.5 block text-sm font-medium">Last Name</label>
                        <input
                          type="text"
                          value={createForm.adminLastName}
                          onChange={(e) => setCreateForm({ ...createForm, adminLastName: e.target.value })}
                          placeholder="Doe"
                          className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end gap-3 pt-4">
                    <motion.button
                      type="button"
                      className="rounded-lg border border-border px-4 py-2.5 text-sm font-medium hover:bg-muted"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setShowCreateModal(false)}
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      type="submit"
                      disabled={createLoading}
                      className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {createLoading ? 'Creating...' : 'Create Tenant'}
                    </motion.button>
                  </div>
                </form>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reset Password Result Modal */}
      <AnimatePresence>
        {resetResult && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setResetResult(null)}
            />
            <motion.div
              className="relative z-10 w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">Password Reset</h2>
                <button
                  onClick={() => setResetResult(null)}
                  className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div className="rounded-lg border border-blue-500/30 bg-blue-500/10 p-4">
                  <p className="text-sm text-blue-500 font-medium">Password reset for {resetResult.tenantName}</p>
                  <div className="mt-3 space-y-2">
                    <div>
                      <p className="text-xs text-muted-foreground">Admin Email:</p>
                      <code className="block rounded bg-muted p-2 text-sm font-mono">{resetResult.email}</code>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">New Temporary Password:</p>
                      <code className="block rounded bg-muted p-2 text-sm font-mono">{resetResult.tempPassword}</code>
                    </div>
                  </div>
                  <p className="mt-3 text-xs text-muted-foreground">
                    Share this password with the tenant admin. They should change it on next login.
                  </p>
                </div>
                <div className="flex justify-end">
                  <motion.button
                    className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setResetResult(null)}
                  >
                    Done
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create Admin Modal */}
      <AnimatePresence>
        {createAdminFor && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setCreateAdminFor(null)}
            />
            <motion.div
              className="relative z-10 w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">Create Admin for {createAdminFor.name}</h2>
                <button
                  onClick={() => setCreateAdminFor(null)}
                  className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <form className="space-y-4" onSubmit={handleCreateAdmin}>
                <div>
                  <label className="mb-1.5 block text-sm font-medium">Admin Email</label>
                  <input
                    type="email"
                    value={adminForm.email}
                    onChange={(e) => setAdminForm({ ...adminForm, email: e.target.value })}
                    placeholder="admin@example.com"
                    required
                    className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium">First Name</label>
                    <input
                      type="text"
                      value={adminForm.firstName}
                      onChange={(e) => setAdminForm({ ...adminForm, firstName: e.target.value })}
                      placeholder="John"
                      required
                      className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium">Last Name</label>
                    <input
                      type="text"
                      value={adminForm.lastName}
                      onChange={(e) => setAdminForm({ ...adminForm, lastName: e.target.value })}
                      placeholder="Doe"
                      required
                      className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <motion.button
                    type="button"
                    className="rounded-lg border border-border px-4 py-2.5 text-sm font-medium hover:bg-muted"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setCreateAdminFor(null)}
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    type="submit"
                    disabled={adminCreating}
                    className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {adminCreating ? 'Creating...' : 'Create Admin'}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
