'use client'

import { useState, useEffect } from 'react'
import { motion } from 'motion/react'
import { cn } from '@/lib/utils'
import { CardHover } from '@/components/animations/CardHover'
import { useAuth } from '@/hooks'
import { api } from '@/lib/api'
import {
  Settings,
  User,
  Building2,
  Bell,
  Shield,
  Save,
  Mail,
  Globe,
  Lock,
} from 'lucide-react'

export default function SettingsPage() {
  const { role, user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [platformSettings, setPlatformSettings] = useState<Record<string, string>>({})
  const [profileForm, setProfileForm] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
  })

  useEffect(() => {
    if (role === 'SUPER_ADMIN') {
      api.get('/api/super-admin/settings')
        .then((res) => setPlatformSettings(res.data.settings || {}))
        .catch(() => {})
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [role])

  const handleSavePlatformSettings = async () => {
    setSaving(true)
    try {
      await api.put('/api/super-admin/settings', { settings: platformSettings })
    } catch (err) {
      console.error('Failed to save settings:', err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold">
          <span className="gradient-text">Settings</span>
        </h1>
        <p className="mt-2 text-muted-foreground">
          Manage your account and platform settings.
        </p>
      </motion.div>

      {loading ? (
        <div className="flex h-40 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Profile Settings */}
          <CardHover intensity="low" className="lg:col-span-2">
            <div className="rounded-xl border border-border bg-card p-6">
              <div className="mb-6 flex items-center gap-3">
                <div className="rounded-lg bg-primary/10 p-2">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <h2 className="text-lg font-semibold">Profile Settings</h2>
              </div>
              <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium">First Name</label>
                    <input
                      type="text"
                      value={profileForm.firstName}
                      onChange={(e) => setProfileForm({ ...profileForm, firstName: e.target.value })}
                      className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium">Last Name</label>
                    <input
                      type="text"
                      value={profileForm.lastName}
                      onChange={(e) => setProfileForm({ ...profileForm, lastName: e.target.value })}
                      className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium">Email</label>
                  <input
                    type="email"
                    value={profileForm.email}
                    disabled
                    className="w-full rounded-lg border border-border bg-muted px-4 py-2.5 text-sm opacity-60"
                  />
                </div>
                <div className="flex justify-end">
                  <motion.button
                    type="submit"
                    className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Save className="h-4 w-4" />
                    Save Profile
                  </motion.button>
                </div>
              </form>
            </div>
          </CardHover>

          {/* Quick Settings */}
          <CardHover intensity="low">
            <div className="rounded-xl border border-border bg-card p-6">
              <div className="mb-6 flex items-center gap-3">
                <div className="rounded-lg bg-purple-500/10 p-2">
                  <Bell className="h-5 w-5 text-purple-500" />
                </div>
                <h2 className="text-lg font-semibold">Notifications</h2>
              </div>
              <div className="space-y-4">
                {[
                  { label: 'Email notifications', defaultChecked: true },
                  { label: 'Student enrollment alerts', defaultChecked: true },
                  { label: 'Billing reminders', defaultChecked: false },
                  { label: 'Weekly reports', defaultChecked: true },
                ].map((item) => (
                  <label key={item.label} className="flex items-center justify-between">
                    <span className="text-sm">{item.label}</span>
                    <input
                      type="checkbox"
                      defaultChecked={item.defaultChecked}
                      className="h-4 w-4 rounded accent-primary"
                    />
                  </label>
                ))}
              </div>
            </div>
          </CardHover>

          {/* Platform Settings (Super Admin only) */}
          {role === 'SUPER_ADMIN' && (
            <CardHover intensity="low" className="lg:col-span-3">
              <div className="rounded-xl border border-border bg-card p-6">
                <div className="mb-6 flex items-center gap-3">
                  <div className="rounded-lg bg-yellow-500/10 p-2">
                    <Globe className="h-5 w-5 text-yellow-500" />
                  </div>
                  <h2 className="text-lg font-semibold">Platform Settings</h2>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {Object.entries(platformSettings).map(([key, value]) => (
                    <div key={key}>
                      <label className="mb-1.5 block text-sm font-medium capitalize">
                        {key.replace(/_/g, ' ')}
                      </label>
                      <input
                        type={key.includes('password') || key.includes('secret') ? 'password' : 'text'}
                        value={value}
                        onChange={(e) => setPlatformSettings({ ...platformSettings, [key]: e.target.value })}
                        className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                  ))}
                </div>
                <div className="mt-6 flex justify-end">
                  <motion.button
                    onClick={handleSavePlatformSettings}
                    disabled={saving}
                    className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Save className="h-4 w-4" />
                    {saving ? 'Saving...' : 'Save Settings'}
                  </motion.button>
                </div>
              </div>
            </CardHover>
          )}

          {/* Security Settings */}
          <CardHover intensity="low" className="lg:col-span-3">
            <div className="rounded-xl border border-border bg-card p-6">
              <div className="mb-6 flex items-center gap-3">
                <div className="rounded-lg bg-red-500/10 p-2">
                  <Lock className="h-5 w-5 text-red-500" />
                </div>
                <h2 className="text-lg font-semibold">Security</h2>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div className="rounded-lg border border-border p-4">
                  <h3 className="font-medium">Change Password</h3>
                  <p className="mt-1 text-sm text-muted-foreground">Update your account password</p>
                  <motion.button
                    className="mt-3 rounded-lg border border-border px-3 py-1.5 text-sm font-medium hover:bg-muted"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Change Password
                  </motion.button>
                </div>
                <div className="rounded-lg border border-border p-4">
                  <h3 className="font-medium">Two-Factor Auth</h3>
                  <p className="mt-1 text-sm text-muted-foreground">Add an extra layer of security</p>
                  <motion.button
                    className="mt-3 rounded-lg border border-border px-3 py-1.5 text-sm font-medium hover:bg-muted"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Enable 2FA
                  </motion.button>
                </div>
                <div className="rounded-lg border border-border p-4">
                  <h3 className="font-medium">Active Sessions</h3>
                  <p className="mt-1 text-sm text-muted-foreground">Manage your active sessions</p>
                  <motion.button
                    className="mt-3 rounded-lg border border-border px-3 py-1.5 text-sm font-medium hover:bg-muted"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    View Sessions
                  </motion.button>
                </div>
              </div>
            </div>
          </CardHover>
        </div>
      )}
    </div>
  )
}
