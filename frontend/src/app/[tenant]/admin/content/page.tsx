'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { cn } from '@/lib/utils'
import { CardHover } from '@/components/animations/CardHover'
import {
  Plus,
  Search,
  X,
  Edit,
  Trash2,
  FileText,
  Briefcase,
  Tag,
  BarChart3,
  Clock,
  Filter,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Eye,
} from 'lucide-react'

type Tab = 'questions' | 'jobs'

interface Question {
  id: string
  title: string
  category: string
  difficulty: 'easy' | 'medium' | 'hard'
  createdAt: string
  attempts: number
}

interface JobListing {
  id: string
  title: string
  company: string
  location: string
  type: 'Full-time' | 'Part-time' | 'Contract' | 'Internship'
  createdAt: string
  applications: number
}

const questions: Question[] = [
  { id: '1', title: 'What is the time complexity of binary search?', category: 'Quantitative', difficulty: 'easy', createdAt: '2025-08-01', attempts: 1240 },
  { id: '2', title: 'Solve: 2x + 5 = 15', category: 'Quantitative', difficulty: 'easy', createdAt: '2025-08-02', attempts: 980 },
  { id: '3', title: 'Permutation vs Combination', category: 'Logical Reasoning', difficulty: 'medium', createdAt: '2025-08-03', attempts: 756 },
  { id: '4', title: 'Critical reasoning: Strengthen/Weaken', category: 'Verbal Ability', difficulty: 'hard', createdAt: '2025-08-04', attempts: 432 },
  { id: '5', title: 'Profit and Loss problems', category: 'Quantitative', difficulty: 'medium', createdAt: '2025-08-05', attempts: 890 },
  { id: '6', title: 'Coding: Two Sum Problem', category: 'Coding', difficulty: 'easy', createdAt: '2025-08-06', attempts: 1560 },
  { id: '7', title: 'Coding: Merge Intervals', category: 'Coding', difficulty: 'hard', createdAt: '2025-08-07', attempts: 340 },
  { id: '8', title: 'Data Interpretation: Pie Charts', category: 'Quantitative', difficulty: 'medium', createdAt: '2025-08-08', attempts: 620 },
]

const jobs: JobListing[] = [
  { id: '1', title: 'Frontend Developer', company: 'Google', location: 'Bangalore, India', type: 'Full-time', createdAt: '2025-08-01', applications: 245 },
  { id: '2', title: 'Backend Engineer', company: 'Microsoft', location: 'Hyderabad, India', type: 'Full-time', createdAt: '2025-08-02', applications: 189 },
  { id: '3', title: 'Data Science Intern', company: 'Amazon', location: 'Pune, India', type: 'Internship', createdAt: '2025-08-03', applications: 320 },
  { id: '4', title: 'ML Engineer', company: 'Meta', location: 'Remote', type: 'Full-time', createdAt: '2025-08-04', applications: 156 },
  { id: '5', title: 'DevOps Engineer', company: 'Netflix', location: 'Mumbai, India', type: 'Contract', createdAt: '2025-08-05', applications: 98 },
  { id: '6', title: 'Full Stack Developer', company: 'Stripe', location: 'Bangalore, India', type: 'Full-time', createdAt: '2025-08-06', applications: 210 },
]

const difficultyConfig = {
  easy: { label: 'Easy', color: 'text-green-500', bgColor: 'bg-green-500/10' },
  medium: { label: 'Medium', color: 'text-yellow-500', bgColor: 'bg-yellow-500/10' },
  hard: { label: 'Hard', color: 'text-red-500', bgColor: 'bg-red-500/10' },
}

const ITEMS_PER_PAGE = 5

export default function ContentManagement() {
  const [activeTab, setActiveTab] = useState<Tab>('questions')
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [showQuestionModal, setShowQuestionModal] = useState(false)
  const [showJobModal, setShowJobModal] = useState(false)

  const filteredQuestions = questions.filter((q) => {
    const matchesSearch = q.title.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = categoryFilter === 'all' || q.category === categoryFilter
    const matchesDifficulty = difficultyFilter === 'all' || q.difficulty === difficultyFilter
    return matchesSearch && matchesCategory && matchesDifficulty
  })

  const filteredJobs = jobs.filter((j) => {
    const matchesSearch =
      j.title.toLowerCase().includes(search.toLowerCase()) ||
      j.company.toLowerCase().includes(search.toLowerCase())
    return matchesSearch
  })

  const currentData = activeTab === 'questions' ? filteredQuestions : filteredJobs
  const totalPages = Math.ceil(currentData.length / ITEMS_PER_PAGE)
  const paginatedData = currentData.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  const categories = ['all', ...new Set(questions.map((q) => q.category))]

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
            <span className="gradient-text">Content</span> Management
          </h1>
          <p className="mt-2 text-muted-foreground">
            Manage questions and job listings for your students.
          </p>
        </div>
        <motion.button
          className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => activeTab === 'questions' ? setShowQuestionModal(true) : setShowJobModal(true)}
        >
          <Plus className="h-4 w-4" />
          Add {activeTab === 'questions' ? 'Question' : 'Job'}
        </motion.button>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-xl border border-border bg-muted p-1">
        {[
          { key: 'questions' as Tab, label: 'Questions', icon: FileText, count: questions.length },
          { key: 'jobs' as Tab, label: 'Job Listings', icon: Briefcase, count: jobs.length },
        ].map((tab) => (
          <motion.button
            key={tab.key}
            className={cn(
              'flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium transition-all',
              activeTab === tab.key
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
            onClick={() => { setActiveTab(tab.key); setSearch(''); setCurrentPage(1) }}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
            <span className="rounded-full bg-muted-foreground/20 px-2 py-0.5 text-xs">{tab.count}</span>
          </motion.button>
        ))}
      </div>

      {/* Filters */}
      <CardHover intensity="low">
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder={activeTab === 'questions' ? 'Search questions...' : 'Search jobs or companies...'}
                value={search}
                onChange={(e) => { setSearch(e.target.value); setCurrentPage(1) }}
                className="w-full rounded-lg border border-border bg-background py-2.5 pl-10 pr-4 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            {activeTab === 'questions' && (
              <div className="flex gap-3">
                <div className="relative">
                  <Tag className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <select
                    value={categoryFilter}
                    onChange={(e) => { setCategoryFilter(e.target.value); setCurrentPage(1) }}
                    className="appearance-none rounded-lg border border-border bg-background py-2.5 pl-10 pr-8 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>{cat === 'all' ? 'All Categories' : cat}</option>
                    ))}
                  </select>
                </div>
                <div className="relative">
                  <BarChart3 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <select
                    value={difficultyFilter}
                    onChange={(e) => { setDifficultyFilter(e.target.value); setCurrentPage(1) }}
                    className="appearance-none rounded-lg border border-border bg-background py-2.5 pl-10 pr-8 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="all">All Difficulty</option>
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardHover>

      {/* Data Table */}
      <CardHover intensity="low">
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            {activeTab === 'questions' ? (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Question</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Category</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Difficulty</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Attempts</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Created</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {(paginatedData as Question[]).map((q, index) => {
                    const diff = difficultyConfig[q.difficulty]
                    return (
                      <motion.tr
                        key={q.id}
                        className="border-b border-border transition-colors hover:bg-muted/30"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.03 }}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                              <FileText className="h-4 w-4 text-primary" />
                            </div>
                            <span className="max-w-[300px] truncate font-medium">{q.title}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium">{q.category}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={cn('rounded-full px-2.5 py-1 text-xs font-medium', diff.bgColor, diff.color)}>
                            {diff.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm">{q.attempts.toLocaleString()}</td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">{q.createdAt}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1">
                            <motion.button className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                              <Edit className="h-4 w-4" />
                            </motion.button>
                            <motion.button className="rounded-lg p-1.5 text-muted-foreground hover:bg-red-500/10 hover:text-red-500" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                              <Trash2 className="h-4 w-4" />
                            </motion.button>
                          </div>
                        </td>
                      </motion.tr>
                    )
                  })}
                </tbody>
              </table>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Position</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Company</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Location</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Type</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Applications</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {(paginatedData as JobListing[]).map((job, index) => (
                    <motion.tr
                      key={job.id}
                      className="border-b border-border transition-colors hover:bg-muted/30"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.03 }}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-pink-500/10">
                            <Briefcase className="h-4 w-4 text-pink-500" />
                          </div>
                          <span className="font-medium">{job.title}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-medium">{job.company}</td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">{job.location}</td>
                      <td className="px-6 py-4">
                        <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium">{job.type}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5">
                          <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                          {job.applications}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          <motion.button className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                            <Edit className="h-4 w-4" />
                          </motion.button>
                          <motion.button className="rounded-lg p-1.5 text-muted-foreground hover:bg-red-500/10 hover:text-red-500" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                            <Trash2 className="h-4 w-4" />
                          </motion.button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-border px-6 py-4">
              <p className="text-sm text-muted-foreground">
                Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to{' '}
                {Math.min(currentPage * ITEMS_PER_PAGE, currentData.length)} of{' '}
                {currentData.length} items
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

      {/* Add Question Modal */}
      <AnimatePresence>
        {showQuestionModal && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowQuestionModal(false)} />
            <motion.div
              className="relative z-10 w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-xl"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">Add New Question</h2>
                <button onClick={() => setShowQuestionModal(false)} className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); setShowQuestionModal(false) }}>
                <div>
                  <label className="mb-1.5 block text-sm font-medium">Question Title</label>
                  <input type="text" placeholder="Enter the question" className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium">Category</label>
                    <select className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20">
                      <option>Quantitative</option>
                      <option>Logical Reasoning</option>
                      <option>Verbal Ability</option>
                      <option>Coding</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium">Difficulty</label>
                    <select className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20">
                      <option>Easy</option>
                      <option>Medium</option>
                      <option>Hard</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium">Options (comma-separated)</label>
                  <input type="text" placeholder="Option A, Option B, Option C, Option D" className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium">Correct Answer</label>
                  <input type="text" placeholder="e.g. Option A" className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" />
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <motion.button type="button" className="rounded-lg border border-border px-4 py-2.5 text-sm font-medium hover:bg-muted" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setShowQuestionModal(false)}>
                    Cancel
                  </motion.button>
                  <motion.button type="submit" className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    Add Question
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Job Modal */}
      <AnimatePresence>
        {showJobModal && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowJobModal(false)} />
            <motion.div
              className="relative z-10 w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-xl"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">Add Job Listing</h2>
                <button onClick={() => setShowJobModal(false)} className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); setShowJobModal(false) }}>
                <div>
                  <label className="mb-1.5 block text-sm font-medium">Job Title</label>
                  <input type="text" placeholder="e.g. Frontend Developer" className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium">Company</label>
                    <input type="text" placeholder="e.g. Google" className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium">Location</label>
                    <input type="text" placeholder="e.g. Bangalore, India" className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium">Employment Type</label>
                    <select className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20">
                      <option>Full-time</option>
                      <option>Part-time</option>
                      <option>Contract</option>
                      <option>Internship</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium">Apply URL</label>
                    <input type="url" placeholder="https://..." className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" />
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <motion.button type="button" className="rounded-lg border border-border px-4 py-2.5 text-sm font-medium hover:bg-muted" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setShowJobModal(false)}>
                    Cancel
                  </motion.button>
                  <motion.button type="submit" className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    Add Job
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
