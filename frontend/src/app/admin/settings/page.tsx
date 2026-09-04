'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion } from 'motion/react'
import { cn } from '@/lib/utils'
import { CardHover } from '@/components/animations/CardHover'
import { api } from '@/lib/api'
import { useAuth } from '@/hooks'
import {
  Save,
  Upload,
  Palette,
  Users,
  Bell,
  Globe,
  Image,
  AlertCircle,
  CheckCircle,
  Loader2,
  Building2,
  X,
  Sparkles,
  MessageSquare,
  Type,
} from 'lucide-react'

interface TenantSettings {
  name: string
  slug: string
  logo_url: string | null
  subscription_plan: string
  max_students: number
  business_name: string | null
  primary_color: string
  accent_color: string
  custom_domain: string | null
  welcome_message: string | null
  footer_text: string | null
  favicon_url: string | null
}

export default function SettingsPage() {
  const { role, tenant } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const faviconInputRef = useRef<HTMLInputElement>(null)

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const [siteName, setSiteName] = useState('')
  const [businessName, setBusinessName] = useState('')
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [faviconUrl, setFaviconUrl] = useState<string | null>(null)
  const [faviconPreview, setFaviconPreview] = useState<string | null>(null)
  const [primaryColor, setPrimaryColor] = useState('#6366f1')
  const [accentColor, setAccentColor] = useState('#8b5cf6')
  const [customDomain, setCustomDomain] = useState('')
  const [welcomeMessage, setWelcomeMessage] = useState('')
  const [footerText, setFooterText] = useState('')
  const [studentLimit, setStudentLimit] = useState(500)
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [smsNotifications, setSmsNotifications] = useState(false)
  const [weeklyReports, setWeeklyReports] = useState(true)

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        if (role === 'SUPER_ADMIN') {
          const res = await api.get('/api/super-admin/settings')
          const data = res.data as Record<string, unknown>
          const settings = (data?.settings as Record<string, string>) || {}
          setSiteName(settings.platform_name || '')
          setPrimaryColor(settings.primary_color || '#6366f1')
          setAccentColor(settings.accent_color || '#8b5cf6')
          setStudentLimit(Number(settings.max_students) || 500)
        } else {
          const res = await api.getTenantSettings()
          const data = res.data as Record<string, unknown>
          const settings = data?.settings as TenantSettings | undefined
          if (settings) {
            setSiteName(settings.name || '')
            setBusinessName(settings.business_name || '')
            setLogoUrl(settings.logo_url || null)
            setLogoPreview(settings.logo_url || null)
            setFaviconUrl(settings.favicon_url || null)
            setFaviconPreview(settings.favicon_url || null)
            setPrimaryColor(settings.primary_color || '#6366f1')
            setAccentColor(settings.accent_color || '#8b5cf6')
            setCustomDomain(settings.custom_domain || '')
            setWelcomeMessage(settings.welcome_message || '')
            setFooterText(settings.footer_text || '')
            setStudentLimit(settings.max_students || 500)
          }
        }
      } catch (err) {
        console.error('Failed to fetch settings:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchSettings()
  }, [role])

  const handleLogoUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) {
      alert('Logo must be less than 2MB')
      return
    }
    const reader = new FileReader()
    reader.onload = (ev) => {
      const result = ev.target?.result as string
      setLogoPreview(result)
      setLogoUrl(result)
    }
    reader.readAsDataURL(file)
  }, [])

  const handleFaviconUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 500 * 1024) {
      alert('Favicon must be less than 500KB')
      return
    }
    const reader = new FileReader()
    reader.onload = (ev) => {
      const result = ev.target?.result as string
      setFaviconPreview(result)
      setFaviconUrl(result)
    }
    reader.readAsDataURL(file)
  }, [])

  const removeLogo = useCallback(() => {
    setLogoPreview(null)
    setLogoUrl(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }, [])

  const removeFavicon = useCallback(() => {
    setFaviconPreview(null)
    setFaviconUrl(null)
    if (faviconInputRef.current) faviconInputRef.current.value = ''
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      if (role === 'SUPER_ADMIN') {
        await api.put('/api/super-admin/settings', {
          settings: {
            platform_name: siteName,
            primary_color: primaryColor,
            accent_color: accentColor,
            max_students: studentLimit,
          },
        })
      } else {
        await api.updateTenantSettings({
          name: siteName,
          logoUrl: logoUrl,
          businessName: businessName,
          primaryColor: primaryColor,
          accentColor: accentColor,
          customDomain: customDomain || null,
          welcomeMessage: welcomeMessage || null,
          footerText: footerText || null,
          faviconUrl: faviconUrl,
        })
      }
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      console.error('Failed to save settings:', err)
      alert('Failed to save settings. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-12 w-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      </div>
    )
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
            Configure your organization&apos;s white-label branding and preferences.
          </p>
        </div>
        <motion.button
          className="flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary/20"
          whileHover={{ scale: 1.02, boxShadow: '0 0 20px rgba(99, 102, 241, 0.4)' }}
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

      {/* White-Label Branding Section */}
      {role !== 'SUPER_ADMIN' && (
        <CardHover intensity="low">
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="mb-6 flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-2">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">White-Label Branding</h2>
                <p className="text-sm text-muted-foreground">Customize how your platform appears to students</p>
              </div>
            </div>
            <div className="space-y-6">
              <div>
                <label className="mb-1.5 block text-sm font-medium">Platform Name</label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    value={siteName}
                    onChange={(e) => setSiteName(e.target.value)}
                    placeholder="e.g. My Academy"
                    className="w-full rounded-lg border border-border bg-background py-2.5 pl-10 pr-4 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <p className="mt-1 text-xs text-muted-foreground">Displayed in the sidebar and browser tab</p>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium">Business / Organization Name</label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="e.g. Acme Corp Inc."
                    className="w-full rounded-lg border border-border bg-background py-2.5 pl-10 pr-4 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <p className="mt-1 text-xs text-muted-foreground">Official business name for branding and reports</p>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium">Platform Logo</label>
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/svg+xml"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                    {logoPreview ? (
                      <div className="relative h-24 w-24 overflow-hidden rounded-xl border-2 border-border bg-background">
                        <img
                          src={logoPreview}
                          alt="Logo preview"
                          className="h-full w-full object-contain p-2"
                        />
                        <button
                          onClick={removeLogo}
                          className="absolute -right-1 -top-1 rounded-full bg-destructive p-1 text-white shadow-sm hover:bg-destructive/90"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="flex h-24 w-24 flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/50 transition-colors hover:border-primary/50 hover:bg-muted"
                      >
                        <Image className="h-8 w-8 text-muted-foreground" />
                        <span className="mt-1 text-xs text-muted-foreground">Upload</span>
                      </button>
                    )}
                  </div>
                  <div>
                    <motion.button
                      className="flex items-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-medium hover:bg-muted"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="h-4 w-4" />
                      {logoPreview ? 'Change Logo' : 'Choose Logo'}
                    </motion.button>
                    <p className="mt-1 text-xs text-muted-foreground">PNG, JPG, or SVG. Max 2MB. Recommended: 200x200px</p>
                  </div>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium">Favicon</label>
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <input
                      ref={faviconInputRef}
                      type="file"
                      accept="image/png,image/x-icon"
                      onChange={handleFaviconUpload}
                      className="hidden"
                    />
                    {faviconPreview ? (
                      <div className="relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-lg border-2 border-border bg-background">
                        <img src={faviconPreview} alt="Favicon preview" className="h-8 w-8 object-contain" />
                        <button
                          onClick={removeFavicon}
                          className="absolute -right-1 -top-1 rounded-full bg-destructive p-0.5 text-white shadow-sm hover:bg-destructive/90"
                        >
                          <X className="h-2.5 w-2.5" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => faviconInputRef.current?.click()}
                        className="flex h-12 w-12 flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/50 transition-colors hover:border-primary/50 hover:bg-muted"
                      >
                        <Image className="h-4 w-4 text-muted-foreground" />
                      </button>
                    )}
                  </div>
                  <div>
                    <motion.button
                      className="flex items-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-medium hover:bg-muted"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => faviconInputRef.current?.click()}
                    >
                      <Upload className="h-4 w-4" />
                      {faviconPreview ? 'Change Favicon' : 'Choose Favicon'}
                    </motion.button>
                    <p className="mt-1 text-xs text-muted-foreground">PNG or ICO. Max 500KB. Recommended: 32x32px</p>
                  </div>
                </div>
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium">Primary Color</label>
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
                  <div className="mt-2 flex gap-2">
                    {['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#3b82f6', '#8b5cf6', '#ef4444', '#06b6d4'].map((color) => (
                      <motion.button
                        key={color}
                        className={cn(
                          'h-6 w-6 rounded-md transition-all',
                          primaryColor === color && 'ring-2 ring-offset-2 ring-offset-card'
                        )}
                        style={{ backgroundColor: color }}
                        whileHover={{ scale: 1.15 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setPrimaryColor(color)}
                      />
                    ))}
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium">Accent Color</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={accentColor}
                      onChange={(e) => setAccentColor(e.target.value)}
                      className="h-10 w-10 cursor-pointer rounded-lg border border-border"
                    />
                    <input
                      type="text"
                      value={accentColor}
                      onChange={(e) => setAccentColor(e.target.value)}
                      className="w-32 rounded-lg border border-border bg-background px-3 py-2 text-sm font-mono focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <div className="mt-2 flex gap-2">
                    {['#8b5cf6', '#06b6d4', '#f97316', '#ec4899', '#14b8a6', '#6366f1', '#22c55e', '#e11d48'].map((color) => (
                      <motion.button
                        key={color}
                        className={cn(
                          'h-6 w-6 rounded-md transition-all',
                          accentColor === color && 'ring-2 ring-offset-2 ring-offset-card'
                        )}
                        style={{ backgroundColor: color }}
                        whileHover={{ scale: 1.15 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setAccentColor(color)}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-border bg-muted/30 p-4">
                <p className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">Preview</p>
                <div className="flex gap-3">
                  <div
                    className="flex h-10 items-center justify-center rounded-lg px-4 text-sm font-semibold text-white"
                    style={{ backgroundColor: primaryColor }}
                  >
                    Primary Button
                  </div>
                  <div
                    className="flex h-10 items-center justify-center rounded-lg px-4 text-sm font-semibold text-white"
                    style={{ backgroundColor: accentColor }}
                  >
                    Accent Button
                  </div>
                  <div
                    className="flex h-10 items-center justify-center rounded-lg border-2 px-4 text-sm font-semibold"
                    style={{ borderColor: primaryColor, color: primaryColor }}
                  >
                    Outlined
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardHover>
      )}

      {/* Custom Domain & Messages */}
      {role !== 'SUPER_ADMIN' && (
        <CardHover intensity="low">
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="mb-6 flex items-center gap-3">
              <div className="rounded-lg bg-secondary/10 p-2">
                <Type className="h-5 w-5 text-secondary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Custom Domain & Messages</h2>
                <p className="text-sm text-muted-foreground">Personalize domain and messaging for your platform</p>
              </div>
            </div>
            <div className="space-y-6">
              <div>
                <label className="mb-1.5 block text-sm font-medium">Custom Domain</label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    value={customDomain}
                    onChange={(e) => setCustomDomain(e.target.value)}
                    placeholder="e.g. academy.yourcompany.com"
                    className="w-full rounded-lg border border-border bg-background py-2.5 pl-10 pr-4 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <p className="mt-1 text-xs text-muted-foreground">Optional. Point your own domain to this platform.</p>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">Welcome Message</label>
                <div className="relative">
                  <MessageSquare className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <textarea
                    value={welcomeMessage}
                    onChange={(e) => setWelcomeMessage(e.target.value)}
                    placeholder="Welcome to our learning platform! Start your journey to success."
                    rows={3}
                    className="w-full rounded-lg border border-border bg-background py-2.5 pl-10 pr-4 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                  />
                </div>
                <p className="mt-1 text-xs text-muted-foreground">Displayed on the student login page.</p>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">Footer Text</label>
                <div className="relative">
                  <Type className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    value={footerText}
                    onChange={(e) => setFooterText(e.target.value)}
                    placeholder="© 2026 Your Company. All rights reserved."
                    className="w-full rounded-lg border border-border bg-background py-2.5 pl-10 pr-4 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <p className="mt-1 text-xs text-muted-foreground">Custom text shown in the platform footer.</p>
              </div>
            </div>
          </div>
        </CardHover>
      )}

      {/* Student Limits */}
      <CardHover intensity="low">
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-lg bg-accent/10 p-2">
              <Users className="h-5 w-5 text-accent" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Student Limits</h2>
              <p className="text-sm text-muted-foreground">Configure resource limits for your organization</p>
            </div>
          </div>
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
            <div className="rounded-lg bg-primary/10 p-2">
              <Bell className="h-5 w-5 text-primary" />
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
