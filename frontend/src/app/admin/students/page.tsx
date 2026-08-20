'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { cn } from '@/lib/utils'
import { CardHover } from '@/components/animations/CardHover'
import { api } from '@/lib/api'
import {
  Search,
  Users,
  Filter,
  ChevronLeft,
  ChevronRight,
  X,
  CheckCircle,
  XCircle,
  Trash2,
  Upload,
  UserPlus,
  Coins,
  Pencil,
  RotateCcw,
  AlertTriangle,
} from 'lucide-react'

interface Student {
  id: string
  user_id: string
  email: string
  first_name: string
  last_name: string
  is_active: boolean
  total_credits: number
  current_credits: number
  enrollment_date: string
}

interface Pagination {
  page: number
  limit: number
  total: number
  pages: number
}

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([])
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 10, total: 0, pages: 0 })
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'suspended'>('all')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [createLoading, setCreateLoading] = useState(false)
  const [createForm, setCreateForm] = useState({ email: '', firstName: '', lastName: '' })
  const [tempPassword, setTempPassword] = useState<string | null>(null)

  // Credits modal
  const [creditsModal, setCreditsModal] = useState<{ open: boolean; student: Student | null }>({ open: false, student: null })
  const [creditsForm, setCreditsForm] = useState({ totalCredits: 0, currentCredits: 0 })
  const [creditsLoading, setCreditsLoading] = useState(false)

  const fetchStudents = useCallback(async (page = 1) => {
    setLoading(true)
    try {
      const params: Record<string, unknown> = { page, limit: 10 }
      if (search) params.search = search
      if (statusFilter !== 'all') params.status = statusFilter

      const res = await api.getStudents(params)
      setStudents(res.data.students || [])
      setPagination(res.data.pagination || { page: 1, limit: 10, total: 0, pages: 0 })
    } catch (err) {
      console.error('Failed to fetch students:', err)
    } finally {
      setLoading(false)
    }
  }, [search, statusFilter])

  useEffect(() => {
    fetchStudents(1)
  }, [fetchStudents])

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreateLoading(true)
    try {
      const res = await api.createStudent(createForm)
      setTempPassword(res.data.tempPassword)
      setCreateForm({ email: '', firstName: '', lastName: '' })
      fetchStudents(1)
    } catch (err) {
      console.error('Failed to create student:', err)
    } finally {
      setCreateLoading(false)
    }
  }

  const handleSuspendStudent = async (id: string) => {
    if (!confirm('Are you sure you want to suspend this student?')) return
    try {
      await api.suspendStudent(id)
      fetchStudents(pagination.page)
    } catch (err) {
      console.error('Failed to suspend student:', err)
    }
  }

  const handleReactivateStudent = async (id: string) => {
    try {
      await api.reactivateStudent(id)
      fetchStudents(pagination.page)
    } catch (err) {
      console.error('Failed to reactivate student:', err)
    }
  }

  const openCreditsModal = (student: Student) => {
    setCreditsForm({
      totalCredits: student.total_credits,
      currentCredits: student.current_credits,
    })
    setCreditsModal({ open: true, student })
  }

  const handleUpdateCredits = async () => {
    if (!creditsModal.student) return
    setCreditsLoading(true)
    try {
      await api.updateStudentCredits(creditsModal.student.id, {
        totalCredits: creditsForm.totalCredits,
        currentCredits: creditsForm.currentCredits,
      })
      setCreditsModal({ open: false, student: null })
      fetchStudents(pagination.page)
    } catch (err) {
      console.error('Failed to update credits:', err)
    } finally {
      setCreditsLoading(false)
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
            <span className="gradient-text">Student</span> Management
          </h1>
          <p className="mt-2 text-muted-foreground">
            Manage students in your organization.
          </p>
        </div>
        <div className="flex gap-3">
          <motion.button
            className="flex items-center gap-2 rounded-xl border border-border px-4 py-2.5 font-semibold hover:bg-muted"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Upload className="h-4 w-4" />
            Import CSV
          </motion.button>
          <motion.button
            className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 font-semibold text-white"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowCreateModal(true)}
          >
            <UserPlus className="h-4 w-4" />
            Add Student
          </motion.button>
        </div>
      </motion.div>

      {/* Filters */}
      <CardHover intensity="low">
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search students..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-lg border border-border bg-background py-2.5 pl-10 pr-4 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'suspended')}
                className="appearance-none rounded-lg border border-border bg-background py-2.5 pl-10 pr-8 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
          </div>
        </div>
      </CardHover>

      {/* Students Table */}
      <CardHover intensity="low">
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          {loading ? (
            <div className="flex h-40 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : students.length === 0 ? (
            <div className="flex h-40 items-center justify-center text-muted-foreground">
              No students found
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-muted/50">
                      <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Student</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Email</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Credits</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Status</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Enrolled</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <AnimatePresence mode="popLayout">
                      {students.map((student, index) => (
                        <motion.tr
                          key={student.id}
                          className="border-b border-border transition-colors hover:bg-muted/30"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ delay: index * 0.03 }}
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                                <Users className="h-4 w-4 text-primary" />
                              </div>
                              <span className="font-medium">{student.first_name} {student.last_name}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-muted-foreground">{student.email}</td>
                          <td className="px-6 py-4">
                            <button
                              onClick={() => openCreditsModal(student)}
                              className="group flex items-center gap-1.5 rounded-lg px-2 py-1 transition hover:bg-muted/50"
                              title="Edit credits"
                            >
                              <Coins className="h-3.5 w-3.5 text-yellow-500" />
                              <span className="font-medium">{student.current_credits}</span>
                              <span className="text-muted-foreground">/ {student.total_credits}</span>
                              <Pencil className="h-3 w-3 text-muted-foreground opacity-0 transition group-hover:opacity-100" />
                            </button>
                          </td>
                          <td className="px-6 py-4">
                            <span className={cn(
                              'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium',
                              student.is_active ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                            )}>
                              {student.is_active ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                              {student.is_active ? 'Active' : 'Suspended'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-muted-foreground">
                            {new Date(student.enrollment_date).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              {student.is_active ? (
                                <motion.button
                                  className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-red-500 hover:bg-red-500/10"
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => handleSuspendStudent(student.id)}
                                  title="Suspend"
                                >
                                  <XCircle className="h-3.5 w-3.5" />
                                  Suspend
                                </motion.button>
                              ) : (
                                <motion.button
                                  className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-green-500 hover:bg-green-500/10"
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => handleReactivateStudent(student.id)}
                                  title="Reactivate"
                                >
                                  <RotateCcw className="h-3.5 w-3.5" />
                                  Activate
                                </motion.button>
                              )}
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>

              {pagination.pages > 1 && (
                <div className="flex items-center justify-between border-t border-border px-6 py-4">
                  <p className="text-sm text-muted-foreground">
                    Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
                    {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                    {pagination.total} students
                  </p>
                  <div className="flex items-center gap-2">
                    <motion.button
                      className="rounded-lg border border-border p-2 text-muted-foreground hover:bg-muted disabled:opacity-50"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      disabled={pagination.page === 1}
                      onClick={() => fetchStudents(pagination.page - 1)}
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
                        onClick={() => fetchStudents(page)}
                      >
                        {page}
                      </motion.button>
                    ))}
                    <motion.button
                      className="rounded-lg border border-border p-2 text-muted-foreground hover:bg-muted disabled:opacity-50"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      disabled={pagination.page === pagination.pages}
                      onClick={() => fetchStudents(pagination.page + 1)}
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

      {/* Credits Modal */}
      <AnimatePresence>
        {creditsModal.open && creditsModal.student && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setCreditsModal({ open: false, student: null })}
            />
            <motion.div
              className="relative z-10 w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-500/10">
                    <Coins className="h-5 w-5 text-yellow-500" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold">Edit Credits</h2>
                    <p className="text-sm text-muted-foreground">
                      {creditsModal.student.first_name} {creditsModal.student.last_name}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setCreditsModal({ open: false, student: null })}
                  className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium">Total Credits (Monthly Allowance)</label>
                  <input
                    type="number"
                    min="0"
                    value={creditsForm.totalCredits}
                    onChange={(e) => setCreditsForm({ ...creditsForm, totalCredits: parseInt(e.target.value) || 0 })}
                    className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                  <p className="mt-1 text-xs text-muted-foreground">
                    Maximum credits this student can use per month.
                  </p>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium">Current Credits (Available Now)</label>
                  <input
                    type="number"
                    min="0"
                    max={creditsForm.totalCredits}
                    value={creditsForm.currentCredits}
                    onChange={(e) => setCreditsForm({ ...creditsForm, currentCredits: parseInt(e.target.value) || 0 })}
                    className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                  <p className="mt-1 text-xs text-muted-foreground">
                    Credits remaining right now. Set to 0 to block the student.
                  </p>
                </div>

                {creditsForm.currentCredits === 0 && (
                  <div className="flex items gap-2 rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-3">
                    <AlertTriangle className="h-4 w-4 text-yellow-500 shrink-0 mt-0.5" />
                    <p className="text-xs text-yellow-500">
                      Setting current credits to 0 will prevent the student from using paid features. They will need to contact the tenant admin to get more credits.
                    </p>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-6">
                <motion.button
                  type="button"
                  className="rounded-lg border border-border px-4 py-2.5 text-sm font-medium hover:bg-muted"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setCreditsModal({ open: false, student: null })}
                >
                  Cancel
                </motion.button>
                <motion.button
                  disabled={creditsLoading}
                  className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleUpdateCredits}
                >
                  {creditsLoading ? 'Saving...' : 'Save Credits'}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create Student Modal */}
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
              onClick={() => { setShowCreateModal(false); setTempPassword(null) }}
            />
            <motion.div
              className="relative z-10 w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-xl"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">
                  {tempPassword ? 'Student Created' : 'Add New Student'}
                </h2>
                <button
                  onClick={() => { setShowCreateModal(false); setTempPassword(null) }}
                  className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {tempPassword ? (
                <div className="space-y-4">
                  <div className="rounded-lg border border-green-500/30 bg-green-500/10 p-4">
                    <p className="text-sm text-green-500 font-medium">Student created successfully!</p>
                    <p className="mt-2 text-sm">Temporary password:</p>
                    <code className="mt-1 block rounded bg-muted p-2 text-sm font-mono">{tempPassword}</code>
                    <p className="mt-2 text-xs text-muted-foreground">
                      Share this password with the student. They should change it on first login.
                    </p>
                  </div>
                  <div className="flex justify-end">
                    <motion.button
                      className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => { setShowCreateModal(false); setTempPassword(null) }}
                    >
                      Done
                    </motion.button>
                  </div>
                </div>
              ) : (
                <form className="space-y-4" onSubmit={handleCreateStudent}>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium">Email</label>
                    <input
                      type="email"
                      value={createForm.email}
                      onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                      placeholder="student@example.com"
                      required
                      className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium">First Name</label>
                      <input
                        type="text"
                        value={createForm.firstName}
                        onChange={(e) => setCreateForm({ ...createForm, firstName: e.target.value })}
                        placeholder="John"
                        required
                        className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium">Last Name</label>
                      <input
                        type="text"
                        value={createForm.lastName}
                        onChange={(e) => setCreateForm({ ...createForm, lastName: e.target.value })}
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
                      {createLoading ? 'Creating...' : 'Create Student'}
                    </motion.button>
                  </div>
                </form>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
