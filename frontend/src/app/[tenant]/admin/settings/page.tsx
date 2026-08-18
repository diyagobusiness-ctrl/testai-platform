'use client'

import { useState } from 'react'
import { motion } from 'motion/react'
import { cn } from '@/lib/utils'
import { CardHover } from '@/components/animations/CardHover'
import {
  Save,
  Upload,
  Palette,
  Users,
  Bell,
  Settings,
  Globe,
  Image,
  AlertCircle,
  CheckCircle,
  Loader2,
} from 'lucide-react'

export default function TenantSettings() {
  const [siteName, setSiteName] = useState('TechCorp Academy')
  const [primaryColor, setPrimaryColor] = useState('#6366f1')
  const [studentLimit, setStudentLimit] = useState(500)
  const [monthlyCredits, setMonthlyCredits] = useState(10000)
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [smsNotifications, setSmsNotifications] = useState(false)
  const [weeklyReports, setWeeklyReports] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    await new Promise((r) => setTimeout(r, 1000))
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold">
            <span className="gradient-text">Settings</span>
          </h1>
          <p className="mt-2 text-muted-foreground">
            Configure your organization&apos;s settings and preferences.
          </p>
        </div>
        <motion.button
          className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : saved ? (
            <CheckCircle className="h-4 w-4" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Changes'}
        </motion.button>
      </motion.div>

      {/* Branding Section */}
      <CardHover intensity="low">
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-lg bg-primary/10 p-2">
              <Palette className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Branding</h2>
              <p className="text-sm text-muted-foreground">Customize your organization&apos;s appearance</p>
            </div>
          </div>
          <div className="space-y-6">
            <div>
              <label className="mb-1.5 block text-sm font-medium">Site Name</label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  value={siteName}
                  onChange={(e) => setSiteName(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background py-2.5 pl-10 pr-4 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Logo</label>
              <div className="flex items-center gap-4">
                <div className="flex h-20 w-20 items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/50">
                  <div className="text-center">
                    <Image className="mx-auto h-6 w-6 text-muted-foreground" />
                    <span className="mt-1 text-xs text-muted-foreground">Logo</span>
                  </div>
                </div>
                <motion.button
                  className="flex items-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-medium hover:bg-muted"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Upload className="h-4 w-4" />
                  Upload Logo
                </motion.button>
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Primary Color</label>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="h-10 w-10 cursor-pointer rounded-lg border border-border"
                  />
                  <input
                    type="text"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="w-32 rounded-lg border border-border bg-background px-3 py-2 text-sm font-mono focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div className="flex gap-2">
                  {['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#3b82f6', '#8b5cf6'].map((color) => (
                    <motion.button
                      key={color}
                      className={cn(
                        'h-8 w-8 rounded-lg transition-all',
                        primaryColor === color && 'ring-2 ring-offset-2 ring-offset-card'
                      )}
                      style={{ backgroundColor: color, ringColor: color }}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setPrimaryColor(color)}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardHover>

      {/* Student Limits */}
      <CardHover intensity="low">
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-lg bg-secondary/10 p-2">
              <Users className="h-5 w-5 text-secondary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Student Limits</h2>
              <p className="text-sm text-muted-foreground">Configure resource limits for your organization</p>
            </div>
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium">Maximum Students</label>
              <input
                type="number"
                value={studentLimit}
                onChange={(e) => setStudentLimit(Number(e.target.value))}
                className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <p className="mt-1 text-xs text-muted-foreground">Maximum number of students allowed</p>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Monthly Credits Per Student</label>
              <input
                type="number"
                value={monthlyCredits}
                onChange={(e) => setMonthlyCredits(Number(e.target.value))}
                className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <p className="mt-1 text-xs text-muted-foreground">Credits allocated per student per month</p>
            </div>
          </div>
          <div className="mt-4 rounded-lg bg-muted/50 p-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="mt-0.5 h-4 w-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Changes to limits will take effect immediately. Students exceeding new limits will be notified.
              </p>
            </div>
          </div>
        </div>
      </CardHover>

      {/* Notification Preferences */}
      <CardHover intensity="low">
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-lg bg-accent/10 p-2">
              <Bell className="h-5 w-5 text-accent" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Notification Preferences</h2>
              <p className="text-sm text-muted-foreground">Choose how you want to receive notifications</p>
            </div>
          </div>
          <div className="space-y-4">
            {[
              {
                label: 'Email Notifications',
                description: 'Receive email alerts for important events',
                value: emailNotifications,
                onChange: setEmailNotifications,
              },
              {
                label: 'SMS Notifications',
                description: 'Get text messages for critical alerts',
                value: smsNotifications,
                onChange: setSmsNotifications,
              },
              {
                label: 'Weekly Reports',
                description: 'Receive weekly analytics and summary reports',
                value: weeklyReports,
                onChange: setWeeklyReports,
              },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between rounded-lg border border-border p-4">
                <div>
                  <p className="font-medium">{item.label}</p>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
                <motion.button
                  className={cn(
                    'relative h-6 w-11 rounded-full transition-colors',
                    item.value ? 'bg-primary' : 'bg-muted'
                  )}
                  onClick={() => item.onChange(!item.value)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <motion.div
                    className="absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow-sm"
                    animate={{ x: item.value ? 20 : 0 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                </motion.button>
              </div>
            ))}
          </div>
        </div>
      </CardHover>
    </div>
  )
}
