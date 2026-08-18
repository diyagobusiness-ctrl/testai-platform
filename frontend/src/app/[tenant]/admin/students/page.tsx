'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { cn } from '@/lib/utils'
import { CardHover } from '@/components/animations/CardHover'
import {
  Search,
  Plus,
  Upload,
  MoreHorizontal,
  Users,
  Filter,
  ChevronLeft,
  ChevronRight,
  X,
  CheckCircle,
  XCircle,
  Clock,
  Download,
  Trash2,
  Edit,
  Key,
  AlertTriangle,
  Mail,
  CreditCard,
} from 'lucide-react'

type StudentStatus = 'active' | 'suspended'

interface Student {
  id: string
  name: string
  email: string
  status: StudentStatus
  credits: number
  joinedAt: string
}

const mockStudents: Student[] = [
  { id: '1', name: 'Alex Johnson', email: 'alex.j@techcorp.com', status: 'active', credits: 850, joinedAt: '2025-01-15' },
  { id: '2', name: 'Maria Garcia', email: 'maria.g@techcorp.com', status: 'active', credits: 720, joinedAt: '2025-02-20' },
  { id: '3', name: 'James Wilson', email: 'james.w@techcorp.com', status: 'active', credits: 640, joinedAt: '2025-03-10' },
  { id: '4', name: 'Sarah Chen', email: 'sarah.c@techcorp.com', status: 'suspended', credits: 120, joinedAt: '2025-01-28' },
  { id: '5', name: 'David Kim', email: 'david.k@techcorp.com', status: 'active', credits: 900, joinedAt: '2025-04-05' },
  { id: '6', name: 'Emily Brown', email: 'emily.b@techcorp.com', status: 'active', credits: 430, joinedAt: '2025-05-12' },
  { id: '7', name: 'Michael Lee', email: 'michael.l@techcorp.com', status: 'active', credits: 560, joinedAt: '2025-02-08' },
  { id: '8', name: 'Jessica Taylor', email: 'jessica.t@techcorp.com', status: 'active', credits: 380, joinedAt: '2025-06-15' },
  { id: '9', name: 'Chris Anderson', email: 'chris.a@techcorp.com', status: 'suspended', credits: 50, joinedAt: '2025-03-18' },
  { id: '10', name: 'Amanda White', email: 'amanda.w@techcorp.com', status: 'active', credits: 770, joinedAt: '2025-04-22' },
  { id: '11', name: 'Ryan Martinez', email: 'ryan.m@techcorp.com', status: 'active', credits: 620, joinedAt: '2025-07-01' },
  { id: '12', name: 'Lisa Thompson', email: 'lisa.t@techcorp.com', status: 'active', credits: 810, joinedAt: '2025-07-10' },
]

const ITEMS_PER_PAGE = 8

const statusConfig: Record<StudentStatus, { label: string; color: string; bgColor: string; icon: typeof CheckCircle }> = {
  active: { label: 'Active', color: 'text-green-500', bgColor: 'bg-green-500/10', icon: CheckCircle },
  suspended: { label: 'Suspended', color: 'text-red-500', bgColor: 'bg-red-500/10', icon: XCircle },
}

export default function StudentManagement() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<StudentStatus | 'all'>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [studentStatuses, setStudentStatuses] = useState<Record<string, StudentStatus>>(
    Object.fromEntries(mockStudents.map((s) => [s.id, s.status]))
  )

  const filteredStudents = useMemo(() => {
    return mockStudents.filter((student) => {
      const matchesSearch =
        student.name.toLowerCase().includes(search.toLowerCase()) ||
        student.email.toLowerCase().includes(search.toLowerCase())
      const currentStatus = studentStatuses[student.id] || student.status
      const matchesStatus = statusFilter === 'all' || currentStatus === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [search, statusFilter, studentStatuses])

  const totalPages = Math.ceil(filteredStudents.length / ITEMS_PER_PAGE)
  const paginatedStudents = filteredStudents.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  const toggleStatus = (id: string) => {
    setStudentStatuses((prev) => ({
      ...prev,
      [id]: prev[id] === 'active' ? 'suspended' : 'active',
    }))
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
            className="flex items-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-semibold hover:bg-muted"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Upload className="h-4 w-4" />
            Import CSV
          </motion.button>
          <motion.button
            className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowCreateModal(true)}
          >
            <Plus className="h-4 w-4" />
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
                placeholder="Search students by name or email..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setCurrentPage(1) }}
                className="w-full rounded-lg border border-border bg-background py-2.5 pl-10 pr-4 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <select
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value as StudentStatus | 'all'); setCurrentPage(1) }}
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
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Name</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Email</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Credits</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Joined</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence mode="popLayout">
                  {paginatedStudents.map((student, index) => {
                    const currentStatus = studentStatuses[student.id] || student.status
                    const status = statusConfig[currentStatus]
                    const StatusIcon = status.icon
                    return (
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
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                              {student.name.split(' ').map((n) => n[0]).join('')}
                            </div>
                            <span className="font-medium">{student.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                            <Mail className="h-3.5 w-3.5" />
                            {student.email}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium', status.bgColor, status.color)}>
                            <StatusIcon className="h-3 w-3" />
                            {status.label}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5">
                            <CreditCard className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="font-medium">{student.credits.toLocaleString()}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">{student.joinedAt}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1">
                            <motion.button
                              className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => toggleStatus(student.id)}
                              title={currentStatus === 'active' ? 'Suspend' : 'Activate'}
                            >
                              {currentStatus === 'active' ? (
                                <AlertTriangle className="h-4 w-4" />
                              ) : (
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              )}
                            </motion.button>
                            <motion.button
                              className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              title="Reset Password"
                            >
                              <Key className="h-4 w-4" />
                            </motion.button>
                            <motion.button
                              className="rounded-lg p-1.5 text-muted-foreground hover:bg-red-500/10 hover:text-red-500"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              title="Delete"
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
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-border px-6 py-4">
              <p className="text-sm text-muted-foreground">
                Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to{' '}
                {Math.min(currentPage * ITEMS_PER_PAGE, filteredStudents.length)} of{' '}
                {filteredStudents.length} students
              </p>
              <div className="flex items-center gap-2">
                <motion.button
                  className="rounded-lg border border-border p-2 text-muted-foreground hover:bg-muted disabled:opacity-50"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => p - 1)}
                >
                  <ChevronLeft className="h-4 w-4" />
                </motion.button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <motion.button
                    key={page}
                    className={cn(
                      'h-8 w-8 rounded-lg text-sm font-medium',
                      currentPage === page
                        ? 'bg-primary text-white'
                        : 'text-muted-foreground hover:bg-muted'
                    )}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </motion.button>
                ))}
                <motion.button
                  className="rounded-lg border border-border p-2 text-muted-foreground hover:bg-muted disabled:opacity-50"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => p + 1)}
                >
                  <ChevronRight className="h-4 w-4" />
                </motion.button>
              </div>
            </div>
          )}
        </div>
      </CardHover>

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
              onClick={() => setShowCreateModal(false)}
            />
            <motion.div
              className="relative z-10 w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-xl"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">Add New Student</h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); setShowCreateModal(false) }}>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium">First Name</label>
                    <input
                      type="text"
                      placeholder="John"
                      className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium">Last Name</label>
                    <input
                      type="text"
                      placeholder="Doe"
                      className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium">Email Address</label>
                  <input
                    type="email"
                    placeholder="student@example.com"
                    className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium">Initial Credits</label>
                  <input
                    type="number"
                    defaultValue={500}
                    className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
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
                    className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Add Student
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
