'use client'

import { motion } from 'motion/react'
import { cn } from '@/lib/utils'
import { Check, Coins } from 'lucide-react'

export interface Template {
  id: string
  name: string
  colors: {
    primary: string
    secondary: string
    accent: string
  }
  preview: string
}

export const templates: Template[] = [
  {
    id: 'modern-blue',
    name: 'Modern Blue',
    colors: {
      primary: '#2563EB',
      secondary: '#1E40AF',
      accent: '#60A5FA',
    },
    preview: 'bg-gradient-to-br from-blue-500 to-blue-700',
  },
  {
    id: 'gradient-green',
    name: 'Gradient Green',
    colors: {
      primary: '#16A34A',
      secondary: '#166534',
      accent: '#4ADE80',
    },
    preview: 'bg-gradient-to-br from-green-500 to-emerald-700',
  },
  {
    id: 'bold-red',
    name: 'Bold Red',
    colors: {
      primary: '#DC2626',
      secondary: '#991B1B',
      accent: '#F87171',
    },
    preview: 'bg-gradient-to-br from-red-500 to-red-700',
  },
  {
    id: 'elegant-black',
    name: 'Elegant Black',
    colors: {
      primary: '#18181B',
      secondary: '#27272A',
      accent: '#A1A1AA',
    },
    preview: 'bg-gradient-to-br from-zinc-800 to-zinc-950',
  },
  {
    id: 'vibrant-purple',
    name: 'Vibrant Purple',
    colors: {
      primary: '#9333EA',
      secondary: '#6B21A8',
      accent: '#C084FC',
    },
    preview: 'bg-gradient-to-br from-purple-500 to-purple-800',
  },
]

interface TemplateSelectorProps {
  selectedTemplate: string
  onSelect: (templateId: string) => void
}

export default function TemplateSelector({
  selectedTemplate,
  onSelect,
}: TemplateSelectorProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold">Choose Template</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Select a professional template for your resume.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {templates.map((template) => {
          const isSelected = selectedTemplate === template.id
          return (
            <motion.button
              key={template.id}
              onClick={() => onSelect(template.id)}
              className={cn(
                'group relative overflow-hidden rounded-xl border-2 p-1 text-left transition-all duration-300',
                isSelected
                  ? 'border-primary shadow-lg shadow-primary/20'
                  : 'border-border hover:border-muted-foreground/50'
              )}
              whileHover={{ y: -4, rotateX: 5, rotateY: -5 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              style={{ perspective: 800, transformStyle: 'preserve-3d' }}
            >
              {/* Template Preview */}
              <div
                className={cn(
                  'relative h-36 w-full rounded-lg overflow-hidden',
                  template.preview
                )}
              >
                {/* Mini resume layout */}
                <div className="absolute inset-0 p-3">
                  <div className="h-2 w-16 rounded-full bg-white/40" />
                  <div className="mt-2 h-1.5 w-24 rounded-full bg-white/20" />
                  <div className="mt-4 space-y-1.5">
                    <div className="h-1 w-full rounded-full bg-white/15" />
                    <div className="h-1 w-4/5 rounded-full bg-white/15" />
                    <div className="h-1 w-3/5 rounded-full bg-white/15" />
                  </div>
                  <div className="mt-3 flex gap-1">
                    <div className="h-3 w-10 rounded-full bg-white/25" />
                    <div className="h-3 w-12 rounded-full bg-white/25" />
                    <div className="h-3 w-8 rounded-full bg-white/25" />
                  </div>
                </div>

                {/* Selected overlay */}
                {isSelected && (
                  <motion.div
                    className="absolute inset-0 flex items-center justify-center bg-black/30"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white">
                      <Check className="h-4 w-4 text-primary" />
                    </div>
                  </motion.div>
                )}

                {/* Hover 3D shine effect */}
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
              </div>

              {/* Template Info */}
              <div className="p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold">{template.name}</span>
                  <div className="flex items-center gap-1 text-xs text-yellow-500">
                    <Coins className="h-3 w-3" />
                    <span>25</span>
                  </div>
                </div>

                {/* Color dots */}
                <div className="mt-2 flex gap-1.5">
                  <div
                    className="h-3 w-3 rounded-full border border-white/20"
                    style={{ backgroundColor: template.colors.primary }}
                  />
                  <div
                    className="h-3 w-3 rounded-full border border-white/20"
                    style={{ backgroundColor: template.colors.secondary }}
                  />
                  <div
                    className="h-3 w-3 rounded-full border border-white/20"
                    style={{ backgroundColor: template.colors.accent }}
                  />
                </div>
              </div>
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
