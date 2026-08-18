'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { cn } from '@/lib/utils'
import { Plus, Trash2, Briefcase, Building2, Clock, ListPlus, GripVertical } from 'lucide-react'

export interface ExperienceEntry {
  id: string
  company: string
  role: string
  duration: string
  responsibilities: string[]
}

interface ExperienceStepProps {
  data: ExperienceEntry[]
  onChange: (data: ExperienceEntry[]) => void
}

const emptyEntry: ExperienceEntry = {
  id: '',
  company: '',
  role: '',
  duration: '',
  responsibilities: [''],
}

function generateId() {
  return Math.random().toString(36).substring(2, 11)
}

function FormField({
  label,
  icon: Icon,
  value,
  onChange,
  placeholder,
}: {
  label: string
  icon: React.ElementType
  value: string
  onChange: (val: string) => void
  placeholder: string
}) {
  return (
    <div className="space-y-2">
      <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
        <Icon className="h-4 w-4" />
        {label}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border-2 border-border bg-background px-4 py-3 text-sm outline-none transition-all duration-300 focus:border-primary focus:shadow-lg focus:shadow-primary/10 hover:border-muted-foreground/50"
      />
    </div>
  )
}

export default function ExperienceStep({ data, onChange }: ExperienceStepProps) {
  const [newResponsibility, setNewResponsibility] = useState<string>({})

  const addEntry = () => {
    onChange([...data, { ...emptyEntry, id: generateId() }])
  }

  const removeEntry = (id: string) => {
    if (data.length <= 1) return
    onChange(data.filter((entry) => entry.id !== id))
  }

  const updateEntry = (id: string, field: keyof ExperienceEntry, value: string) => {
    onChange(
      data.map((entry) =>
        entry.id === id ? { ...entry, [field]: value } : entry
      )
    )
  }

  const addResponsibility = (entryId: string) => {
    const entry = data.find((e) => e.id === entryId)
    if (!entry) return
    const text = (newResponsibility as Record<string, string>)[entryId] || ''
    if (!text.trim()) return
    updateEntry(entryId, 'responsibilities', [...entry.responsibilities, text.trim()])
    setNewResponsibility((prev) => ({ ...prev, [entryId]: '' }))
  }

  const removeResponsibility = (entryId: string, index: number) => {
    const entry = data.find((e) => e.id === entryId)
    if (!entry || entry.responsibilities.length <= 1) return
    updateEntry(
      entryId,
      'responsibilities',
      entry.responsibilities.filter((_, i) => i !== index)
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      <div className="mb-8">
        <h2 className="text-2xl font-bold">Work Experience</h2>
        <p className="mt-1 text-muted-foreground">
          Detail your professional experience and key achievements.
        </p>
      </div>

      <div className="space-y-6">
        <AnimatePresence mode="popLayout">
          {data.map((entry, index) => (
            <motion.div
              key={entry.id}
              layout
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, x: -100 }}
              transition={{ duration: 0.3 }}
              className="relative rounded-xl border-2 border-border bg-card p-6"
            >
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <GripVertical className="h-4 w-4 text-muted-foreground/50" />
                  <span className="text-sm font-semibold text-primary">
                    Experience #{index + 1}
                  </span>
                </div>
                {data.length > 1 && (
                  <motion.button
                    onClick={() => removeEntry(entry.id)}
                    className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-red-500/10 hover:text-red-500"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </motion.button>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  label="Company"
                  icon={Building2}
                  value={entry.company}
                  onChange={(val) => updateEntry(entry.id, 'company', val)}
                  placeholder="Google"
                />
                <FormField
                  label="Role / Title"
                  icon={Briefcase}
                  value={entry.role}
                  onChange={(val) => updateEntry(entry.id, 'role', val)}
                  placeholder="Senior Software Engineer"
                />
              </div>

              <div className="mt-4">
                <FormField
                  label="Duration"
                  icon={Clock}
                  value={entry.duration}
                  onChange={(val) => updateEntry(entry.id, 'duration', val)}
                  placeholder="Jan 2022 - Present"
                />
              </div>

              {/* Responsibilities */}
              <div className="mt-6">
                <label className="mb-3 flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <ListPlus className="h-4 w-4" />
                  Responsibilities
                </label>

                <div className="space-y-2">
                  <AnimatePresence>
                    {entry.responsibilities.map((resp, rIndex) => (
                      <motion.div
                        key={rIndex}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="flex items-center gap-2"
                      >
                        <span className="shrink-0 text-xs text-muted-foreground">•</span>
                        <input
                          type="text"
                          value={resp}
                          onChange={(e) => {
                            const newResps = [...entry.responsibilities]
                            newResps[rIndex] = e.target.value
                            updateEntry(entry.id, 'responsibilities', newResps)
                          }}
                          className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none transition-all focus:border-primary"
                          placeholder="Describe your responsibility or achievement"
                        />
                        {entry.responsibilities.length > 1 && (
                          <motion.button
                            onClick={() => removeResponsibility(entry.id, rIndex)}
                            className="shrink-0 rounded p-1 text-muted-foreground hover:text-red-500"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <Trash2 className="h-3 w-3" />
                          </motion.button>
                        )}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                <div className="mt-3 flex gap-2">
                  <input
                    type="text"
                    value={(newResponsibility as Record<string, string>)[entry.id] || ''}
                    onChange={(e) =>
                      setNewResponsibility((prev) => ({
                        ...prev,
                        [entry.id]: e.target.value,
                      }))
                    }
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        addResponsibility(entry.id)
                      }
                    }}
                    placeholder="Add a responsibility..."
                    className="flex-1 rounded-lg border border-dashed border-border bg-transparent px-3 py-2 text-sm outline-none transition-all focus:border-primary"
                  />
                  <motion.button
                    onClick={() => addResponsibility(entry.id)}
                    className="rounded-lg bg-primary/10 px-3 py-2 text-xs font-medium text-primary transition-colors hover:bg-primary/20"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Plus className="h-4 w-4" />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <motion.button
        onClick={addEntry}
        className={cn(
          'flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-primary/30',
          'bg-primary/5 py-4 text-sm font-medium text-primary transition-all duration-300',
          'hover:border-primary hover:bg-primary/10'
        )}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
      >
        <Plus className="h-4 w-4" />
        Add Another Experience
      </motion.button>
    </motion.div>
  )
}
