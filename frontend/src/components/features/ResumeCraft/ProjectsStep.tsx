'use client'

import { motion, AnimatePresence } from 'motion/react'
import { cn } from '@/lib/utils'
import { Plus, Trash2, FolderKanban, Link, Code2, FileText } from 'lucide-react'

export interface ProjectEntry {
  id: string
  title: string
  description: string
  technologies: string
  link: string
}

interface ProjectsStepProps {
  data: ProjectEntry[]
  onChange: (data: ProjectEntry[]) => void
}

const emptyEntry: ProjectEntry = {
  id: '',
  title: '',
  description: '',
  technologies: '',
  link: '',
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
  isTextarea = false,
}: {
  label: string
  icon: React.ElementType
  value: string
  onChange: (val: string) => void
  placeholder: string
  isTextarea?: boolean
}) {
  const baseClasses =
    'w-full rounded-xl border-2 border-border bg-background px-4 py-3 text-sm outline-none transition-all duration-300 focus:border-primary focus:shadow-lg focus:shadow-primary/10 hover:border-muted-foreground/50'

  return (
    <div className="space-y-2">
      <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
        <Icon className="h-4 w-4" />
        {label}
      </label>
      {isTextarea ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={3}
          className={cn(baseClasses, 'resize-none')}
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={baseClasses}
        />
      )}
    </div>
  )
}

export default function ProjectsStep({ data, onChange }: ProjectsStepProps) {
  const addEntry = () => {
    onChange([...data, { ...emptyEntry, id: generateId() }])
  }

  const removeEntry = (id: string) => {
    if (data.length <= 1) return
    onChange(data.filter((entry) => entry.id !== id))
  }

  const updateEntry = (id: string, field: keyof ProjectEntry, value: string) => {
    onChange(
      data.map((entry) =>
        entry.id === id ? { ...entry, [field]: value } : entry
      )
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
        <h2 className="text-2xl font-bold">Projects</h2>
        <p className="mt-1 text-muted-foreground">
          Showcase your best projects and technical achievements.
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
                <span className="text-sm font-semibold text-primary">
                  Project #{index + 1}
                </span>
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
                  label="Project Title"
                  icon={FolderKanban}
                  value={entry.title}
                  onChange={(val) => updateEntry(entry.id, 'title', val)}
                  placeholder="E-Commerce Platform"
                />
                <FormField
                  label="Technologies Used"
                  icon={Code2}
                  value={entry.technologies}
                  onChange={(val) => updateEntry(entry.id, 'technologies', val)}
                  placeholder="React, Node.js, MongoDB"
                />
              </div>

              <div className="mt-4">
                <FormField
                  label="Description"
                  icon={FileText}
                  value={entry.description}
                  onChange={(val) => updateEntry(entry.id, 'description', val)}
                  placeholder="Built a full-stack e-commerce platform with real-time inventory management and payment processing..."
                  isTextarea
                />
              </div>

              <div className="mt-4">
                <FormField
                  label="Project Link"
                  icon={Link}
                  value={entry.link}
                  onChange={(val) => updateEntry(entry.id, 'link', val)}
                  placeholder="https://github.com/username/project"
                />
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
        Add Another Project
      </motion.button>
    </motion.div>
  )
}
