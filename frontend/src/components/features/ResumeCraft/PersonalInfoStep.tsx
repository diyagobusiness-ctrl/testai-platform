'use client'

import { useState } from 'react'
import { motion } from 'motion/react'
import { cn } from '@/lib/utils'
import { MapPin, Linkedin, Globe, Mail, Phone, User } from 'lucide-react'

export interface PersonalInfo {
  firstName: string
  lastName: string
  email: string
  phone: string
  location: string
  linkedin: string
  portfolio: string
}

interface PersonalInfoStepProps {
  data: PersonalInfo
  onChange: (data: PersonalInfo) => void
}

function FloatingInput({
  label,
  icon: Icon,
  value,
  onChange,
  type = 'text',
  placeholder,
}: {
  label: string
  icon: React.ElementType
  value: string
  onChange: (val: string) => void
  type?: string
  placeholder?: string
}) {
  const [isFocused, setIsFocused] = useState(false)
  const hasValue = value.length > 0

  return (
    <div className="relative">
      <div
        className={cn(
          'relative rounded-xl border-2 bg-background transition-all duration-300',
          isFocused
            ? 'border-primary shadow-lg shadow-primary/10'
            : 'border-border hover:border-muted-foreground/50'
        )}
      >
        <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
          <Icon
            className={cn(
              'h-5 w-5 transition-colors duration-300',
              isFocused ? 'text-primary' : 'text-muted-foreground'
            )}
          />
        </div>

        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className={cn(
            'w-full rounded-xl bg-transparent px-11 py-4 text-sm outline-none transition-all duration-300',
            isFocused || hasValue ? 'pt-6 pb-2' : 'py-4'
          )}
        />

        <motion.label
          className={cn(
            'pointer-events-none absolute left-11 text-sm transition-all duration-300',
            isFocused || hasValue
              ? 'text-primary -translate-y-2 text-xs'
              : 'text-muted-foreground top-1/2 -translate-y-1/2'
          )}
        >
          {label}
        </motion.label>
      </div>

      {isFocused && (
        <motion.div
          className="absolute inset-0 rounded-xl border-2 border-primary/30 pointer-events-none"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2 }}
        />
      )}
    </div>
  )
}

export default function PersonalInfoStep({ data, onChange }: PersonalInfoStepProps) {
  const update = (field: keyof PersonalInfo, value: string) => {
    onChange({ ...data, [field]: value })
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
        <h2 className="text-2xl font-bold">Personal Information</h2>
        <p className="mt-1 text-muted-foreground">
          Tell us about yourself to get started.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FloatingInput
          label="First Name"
          icon={User}
          value={data.firstName}
          onChange={(val) => update('firstName', val)}
          placeholder="John"
        />
        <FloatingInput
          label="Last Name"
          icon={User}
          value={data.lastName}
          onChange={(val) => update('lastName', val)}
          placeholder="Doe"
        />
      </div>

      <FloatingInput
        label="Email Address"
        icon={Mail}
        value={data.email}
        onChange={(val) => update('email', val)}
        type="email"
        placeholder="john@example.com"
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <FloatingInput
          label="Phone Number"
          icon={Phone}
          value={data.phone}
          onChange={(val) => update('phone', val)}
          type="tel"
          placeholder="+1 (555) 123-4567"
        />
        <FloatingInput
          label="Location"
          icon={MapPin}
          value={data.location}
          onChange={(val) => update('location', val)}
          placeholder="San Francisco, CA"
        />
      </div>

      <FloatingInput
        label="LinkedIn URL"
        icon={Linkedin}
        value={data.linkedin}
        onChange={(val) => update('linkedin', val)}
        placeholder="https://linkedin.com/in/johndoe"
      />

      <FloatingInput
        label="Portfolio URL"
        icon={Globe}
        value={data.portfolio}
        onChange={(val) => update('portfolio', val)}
        placeholder="https://johndoe.dev"
      />
    </motion.div>
  )
}
