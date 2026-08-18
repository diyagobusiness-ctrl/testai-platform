'use client'

import { motion, AnimatePresence } from 'motion/react'
import { cn } from '@/lib/utils'
import { Plus, Trash2, GraduationCap, Building2, Award, Calendar } from 'lucide-react'

export interface EducationEntry {
  id: string
  degree: string
  college: string
  gpa: string
  graduationYear: string
}

interface EducationStepProps {
  data: EducationEntry[]
  onChange: (data: EducationEntry[]) => void
}

const emptyEntry: EducationEntry = {
  id: '',
  degree: '',
  college: '',
  gpa: '',
  graduationYear: '',
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

export default function EducationStep({ data, onChange }: EducationStepProps) {
  const addEntry = () => {
    onChange([...data, { ...emptyEntry, id: generateId() }])
  }

  const removeEntry = (id: string) => {
    if (data.length <= 1) return
    onChange(data.filter((entry) => entry.id !== id))
  }

  const updateEntry = (id: string, field: keyof EducationEntry, value: string) => {
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
        <h2 className="text-2xl font-bold">Education</h2>
        <p className="mt-1 text-muted-foreground">
          Add your educational background starting with the most recent.
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
                  Education #{index + 1}
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
                  label="Degree / Program"
                  icon={GraduationCap}
                  value={entry.degree}
                  onChange={(val) => updateEntry(entry.id, 'degree', val)}
                  placeholder="B.Tech Computer Science"
                />
                <FormField
                  label="College / University"
                  icon={Building2}
                  value={entry.college}
                  onChange={(val) => updateEntry(entry.id, 'college', val)}
                  placeholder="MIT"
                />
              </div>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <FormField
                  label="GPA"
                  icon={Award}
                  value={entry.gpa}
                  onChange={(val) => updateEntry(entry.id, 'gpa', val)}
                  placeholder="3.8 / 4.0"
                />
                <FormField
                  label="Graduation Year"
                  icon={Calendar}
                  value={entry.graduationYear}
                  onChange={(val) => updateEntry(entry.id, 'graduationYear', val)}
                  placeholder="2024"
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
        Add Another Education
      </motion.button>
    </motion.div>
  )
}
