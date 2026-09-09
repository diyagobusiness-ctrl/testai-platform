'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { cn } from '@/lib/utils'
import {
  StepIndicator,
  PersonalInfoStep,
  SummaryStep,
  EducationStep,
  ExperienceStep,
  SkillsStep,
  ProjectsStep,
  CertificationsStep,
  TemplateSelector,
  ResumePreview,
} from '@/components/features/ResumeCraft'
import type { PersonalInfo } from '@/components/features/ResumeCraft'
import type { EducationEntry } from '@/components/features/ResumeCraft'
import type { ExperienceEntry } from '@/components/features/ResumeCraft'
import type { Skill } from '@/components/features/ResumeCraft'
import type { ProjectEntry } from '@/components/features/ResumeCraft'
import type { CertificationEntry } from '@/components/features/ResumeCraft'
import {
  Download,
  Coins,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Eye,
  EyeOff,
  Loader2,
  ArrowLeft,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks'

function generateId() {
  return Math.random().toString(36).substring(2, 11)
}

export default function ResumeCraftPage() {
  const router = useRouter()
  const { tenant } = useAuth()
  const [currentStep, setCurrentStep] = useState(0)
  const [showPreview, setShowPreview] = useState(true)
  const [isDownloading, setIsDownloading] = useState(false)

  // Form state
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    location: '',
    linkedin: '',
    portfolio: '',
  })

  const [summary, setSummary] = useState('')

  const [education, setEducation] = useState<EducationEntry[]>([
    {
      id: generateId(),
      degree: '',
      college: '',
      gpa: '',
      graduationYear: '',
    },
  ])

  const [experience, setExperience] = useState<ExperienceEntry[]>([
    {
      id: generateId(),
      company: '',
      role: '',
      duration: '',
      responsibilities: [''],
    },
  ])

  const [skills, setSkills] = useState<Skill[]>([])

  const [projects, setProjects] = useState<ProjectEntry[]>([
    {
      id: generateId(),
      title: '',
      description: '',
      technologies: '',
      link: '',
    },
  ])

  const [certifications, setCertifications] = useState<CertificationEntry[]>([
    {
      id: generateId(),
      name: '',
      issuer: '',
      date: '',
    },
  ])

  const [selectedTemplate, setSelectedTemplate] = useState('modern-blue')

  const totalSteps = 8
  const credits = 150

  const canGoNext = currentStep < totalSteps - 1
  const canGoPrev = currentStep > 0

  const goNext = useCallback(() => {
    if (canGoNext) setCurrentStep((s) => s + 1)
  }, [canGoNext])

  const goPrev = useCallback(() => {
    if (canGoPrev) setCurrentStep((s) => s - 1)
  }, [canGoPrev])

  const handleDownload = async () => {
    if (isDownloading) return
    
    setIsDownloading(true)
    
    try {
      const jsPDF = (await import('jspdf')).default
      const { templates } = await import('@/components/features/ResumeCraft/TemplateSelector')

      // Deduct credits first
      try {
        await api.deductCredits(25, 'Resume PDF download')
      } catch (creditError) {
        alert('Insufficient credits. Please contact your admin.')
        setIsDownloading(false)
        return
      }

      // Get template colors
      const template = templates.find((t) => t.id === selectedTemplate) || templates[0]
      const { primary, secondary } = template.colors

      // Convert hex to RGB
      const hexToRgb = (hex: string) => {
        const r = parseInt(hex.slice(1, 3), 16)
        const g = parseInt(hex.slice(3, 5), 16)
        const b = parseInt(hex.slice(5, 7), 16)
        return { r, g, b }
      }
      const primaryRgb = hexToRgb(primary)
      const secondaryRgb = hexToRgb(secondary)

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [612, 792],
      })

      const margin = 40
      let y = margin
      const pageWidth = 612
      const contentWidth = pageWidth - margin * 2
      const lineHeight = 16

      const hexColor = (hex: string) => {
        const r = parseInt(hex.slice(1, 3), 16)
        const g = parseInt(hex.slice(3, 5), 16)
        const b = parseInt(hex.slice(5, 7), 16)
        return [r, g, b] as [number, number, number]
      }

      const addText = (text: string, fontSize: number, isBold = false, color?: string) => {
        pdf.setFontSize(fontSize)
        pdf.setFont('helvetica', isBold ? 'bold' : 'normal')
        if (color) {
          const c = hexToRgb(color)
          pdf.setTextColor(c.r, c.g, c.b)
        } else {
          pdf.setTextColor(40, 40, 40)
        }

        const lines = pdf.splitTextToSize(text, contentWidth)
        lines.forEach((line: string) => {
          if (y > 750) {
            pdf.addPage()
            y = margin
          }
          pdf.text(line, margin, y)
          y += lineHeight
        })
      }

      const addSection = (title: string) => {
        if (y > 720) { pdf.addPage(); y = margin }
        y += 10
        // Colored accent bar
        pdf.setFillColor(primaryRgb.r, primaryRgb.g, primaryRgb.b)
        pdf.rect(margin, y - 12, contentWidth, 18, 'F')
        pdf.setFontSize(11)
        pdf.setFont('helvetica', 'bold')
        pdf.setTextColor(255, 255, 255)
        pdf.text(title.toUpperCase(), margin + 4, y)
        y += 16
      }

      const addLine = () => {
        if (y > 750) { pdf.addPage(); y = margin }
        pdf.setFontSize(10)
        pdf.setFont('helvetica', 'normal')
        pdf.setTextColor(60, 60, 60)
      }

      // === HEADER ===
      // Name with colored background bar
      const name = `${personalInfo.firstName || ''} ${personalInfo.lastName || ''}`.trim() || 'Your Name'
      pdf.setFillColor(primaryRgb.r, primaryRgb.g, primaryRgb.b)
      pdf.rect(0, 0, pageWidth, 80, 'F')
      // Secondary stripe
      pdf.setFillColor(secondaryRgb.r, secondaryRgb.g, secondaryRgb.b)
      pdf.rect(0, 80, pageWidth, 4, 'F')

      pdf.setFontSize(26)
      pdf.setFont('helvetica', 'bold')
      pdf.setTextColor(255, 255, 255)
      pdf.text(name, pageWidth / 2, 45, { align: 'center' })

      y = 95

      // Contact info
      const contacts: string[] = []
      if (personalInfo.email) contacts.push(personalInfo.email)
      if (personalInfo.phone) contacts.push(personalInfo.phone)
      if (personalInfo.location) contacts.push(personalInfo.location)
      if (personalInfo.linkedin) contacts.push(personalInfo.linkedin)
      if (personalInfo.website) contacts.push(personalInfo.website)
      if (contacts.length > 0) {
        pdf.setFontSize(9)
        pdf.setFont('helvetica', 'normal')
        pdf.setTextColor(100, 100, 100)
        pdf.text(contacts.join('  |  '), pageWidth / 2, y, { align: 'center' })
        y += 18
      }

      // Summary
      if (summary) {
        addSection('Professional Summary')
        addLine()
        addText(summary, 10)
      }

      // Experience
      if (experience.length > 0 && experience.some(e => e.company || e.position)) {
        addSection('Work Experience')
        experience.forEach((exp) => {
          if (y > 720) { pdf.addPage(); y = margin }
          pdf.setFontSize(11)
          pdf.setFont('helvetica', 'bold')
          pdf.setTextColor(primaryRgb.r, primaryRgb.g, primaryRgb.b)
          pdf.text(exp.position || 'Position', margin, y)
          pdf.setFont('helvetica', 'normal')
          pdf.setTextColor(130, 130, 130)
          const dateStr = `${exp.startDate || ''} - ${exp.current ? 'Present' : exp.endDate || ''}`
          pdf.text(dateStr, pageWidth - margin, y, { align: 'right' })
          y += 14
          pdf.setFontSize(10)
          pdf.setFont('helvetica', 'bold')
          pdf.setTextColor(60, 60, 60)
          pdf.text(exp.company || '', margin, y)
          y += 14
          if (exp.description) {
            addText(exp.description, 9)
          }
          y += 4
        })
      }

      // Education
      if (education.length > 0 && education.some(e => e.school || e.degree)) {
        addSection('Education')
        education.forEach((edu) => {
          if (y > 720) { pdf.addPage(); y = margin }
          pdf.setFontSize(11)
          pdf.setFont('helvetica', 'bold')
          pdf.setTextColor(primaryRgb.r, primaryRgb.g, primaryRgb.b)
          pdf.text(edu.degree || 'Degree', margin, y)
          pdf.setFont('helvetica', 'normal')
          pdf.setTextColor(130, 130, 130)
          const dateStr = `${edu.startDate || ''} - ${edu.endDate || ''}`
          pdf.text(dateStr, pageWidth - margin, y, { align: 'right' })
          y += 14
          pdf.setFontSize(10)
          pdf.setFont('helvetica', 'bold')
          pdf.setTextColor(60, 60, 60)
          pdf.text(edu.school || '', margin, y)
          if (edu.gpa) {
            pdf.setFont('helvetica', 'normal')
            pdf.text(`GPA: ${edu.gpa}`, pageWidth - margin, y, { align: 'right' })
          }
          y += 16
        })
      }

      // Skills
      if (skills.length > 0 && skills.some(s => s.name)) {
        addSection('Skills')
        const skillNames = skills.filter(s => s.name).map(s => s.name)
        addText(skillNames.join('  •  '), 10)
      }

      // Projects
      if (projects.length > 0 && projects.some(p => p.name)) {
        addSection('Projects')
        projects.forEach((proj) => {
          if (y > 720) { pdf.addPage(); y = margin }
          pdf.setFontSize(11)
          pdf.setFont('helvetica', 'bold')
          pdf.setTextColor(primaryRgb.r, primaryRgb.g, primaryRgb.b)
          pdf.text(proj.name || 'Project', margin, y)
          y += 14
          if (proj.description) {
            addText(proj.description, 9)
          }
          if (proj.techStack) {
            pdf.setFontSize(9)
            pdf.setFont('helvetica', 'italic')
            pdf.setTextColor(130, 130, 130)
            pdf.text(`Tech: ${proj.techStack}`, margin, y)
            y += 14
          }
          y += 4
        })
      }

      // Certifications
      if (certifications.length > 0 && certifications.some(c => c.name)) {
        addSection('Certifications')
        certifications.forEach((cert) => {
          if (y > 720) { pdf.addPage(); y = margin }
          addLine()
          pdf.setFontSize(10)
          pdf.setFont('helvetica', 'bold')
          pdf.setTextColor(primaryRgb.r, primaryRgb.g, primaryRgb.b)
          pdf.text(cert.name || '', margin, y)
          y += 13
          pdf.setFont('helvetica', 'normal')
          pdf.setTextColor(100, 100, 100)
          const parts = [cert.issuer, cert.date].filter(Boolean).join(' - ')
          if (parts) {
            pdf.text(parts, margin, y)
            y += 13
          }
          y += 2
        })
      }

      // Footer line
      pdf.setFillColor(primaryRgb.r, primaryRgb.g, primaryRgb.b)
      pdf.rect(0, 778, pageWidth, 2, 'F')

      pdf.save(`${personalInfo.firstName || 'Resume'}_${personalInfo.lastName || 'Craft'}.pdf`)

      // Refresh credits display
      try {
        const creditRes = await api.getCredits()
        const creditData = creditRes.data as Record<string, unknown>
        const credits = creditData?.credits as { current_credits: number; total_credits: number } | undefined
        if (credits) {
          // Update CreditCheck component by triggering a re-fetch
          window.dispatchEvent(new CustomEvent('credits-updated', { detail: credits }))
        }
      } catch {
        // Silently fail on credit refresh
      }
    } catch (error) {
      console.error('PDF download failed:', error)
      alert('Failed to generate PDF. Please try again.')
    } finally {
      setIsDownloading(false)
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <PersonalInfoStep data={personalInfo} onChange={setPersonalInfo} />
      case 1:
        return <SummaryStep data={summary} onChange={setSummary} />
      case 2:
        return <EducationStep data={education} onChange={setEducation} />
      case 3:
        return <ExperienceStep data={experience} onChange={setExperience} />
      case 4:
        return <SkillsStep data={skills} onChange={setSkills} />
      case 5:
        return <ProjectsStep data={projects} onChange={setProjects} />
      case 6:
        return (
          <CertificationsStep data={certifications} onChange={setCertifications} />
        )
      case 7:
        return (
          <div className="space-y-8">
            <TemplateSelector
              selectedTemplate={selectedTemplate}
              onSelect={setSelectedTemplate}
            />

            <div>
              <h3 className="text-lg font-bold">Download Your Resume</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Review your resume and download it as a PDF.
              </p>

              <motion.button
                onClick={handleDownload}
                disabled={isDownloading}
                className={cn(
                  'mt-4 flex items-center gap-3 rounded-xl bg-primary px-8 py-4 font-semibold text-white',
                  'shadow-lg shadow-primary/30 transition-all',
                  'disabled:opacity-60 disabled:cursor-not-allowed'
                )}
                whileHover={!isDownloading ? {
                  scale: 1.02,
                  boxShadow: '0 0 30px rgba(99, 102, 241, 0.4)',
                } : {}}
                whileTap={!isDownloading ? { scale: 0.98 } : {}}
              >
                {isDownloading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Download className="h-5 w-5" />
                )}
                {isDownloading ? 'Generating PDF...' : 'Download PDF'}
                {!isDownloading && (
                  <span className="ml-2 rounded-full bg-white/20 px-2 py-0.5 text-xs">
                    25 credits
                  </span>
                )}
              </motion.button>
            </div>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40"
      >
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => router.push(`/${tenant}/student/dashboard`)}
                className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition"
              >
                <ArrowLeft className="h-4 w-4" /> Back to Dashboard
              </motion.button>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Resume Craft</h1>
                <p className="text-xs text-muted-foreground">
                  Build your professional resume
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Credits */}
              <div className="flex items-center gap-2 rounded-xl border border-border bg-background px-4 py-2">
                <Coins className="h-4 w-4 text-yellow-500" />
                <span className="text-sm font-semibold">{credits}</span>
                <span className="text-xs text-muted-foreground">credits</span>
              </div>

              {/* Preview Toggle */}
              <motion.button
                onClick={() => setShowPreview(!showPreview)}
                className="flex items-center gap-2 rounded-xl border border-border bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-muted lg:hidden"
                whileTap={{ scale: 0.95 }}
              >
                {showPreview ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
                {showPreview ? 'Hide' : 'Show'} Preview
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Step Indicator */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <StepIndicator currentStep={currentStep} onStepClick={setCurrentStep} />
        </motion.div>

        {/* Main Content */}
        <div className="flex gap-8">
          {/* Form Area */}
          <div className={cn('flex-1 min-w-0', showPreview && 'lg:max-w-[55%]')}>
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="rounded-2xl border border-border bg-card p-6 sm:p-8"
              >
                {renderStep()}
              </motion.div>
            </AnimatePresence>

            {/* Navigation Buttons */}
            <div className="mt-6 flex items-center justify-between">
              <motion.button
                onClick={goPrev}
                disabled={!canGoPrev}
                className={cn(
                  'flex items-center gap-2 rounded-xl border border-border px-6 py-3 text-sm font-medium transition-all',
                  'disabled:opacity-30 disabled:cursor-not-allowed',
                  'hover:bg-muted'
                )}
                whileHover={canGoPrev ? { scale: 1.02 } : {}}
                whileTap={canGoPrev ? { scale: 0.98 } : {}}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </motion.button>

              <span className="text-sm text-muted-foreground">
                {currentStep + 1} / {totalSteps}
              </span>

              <motion.button
                onClick={goNext}
                disabled={!canGoNext}
                className={cn(
                  'flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white transition-all',
                  'disabled:opacity-30 disabled:cursor-not-allowed',
                  'shadow-lg shadow-primary/20'
                )}
                whileHover={canGoNext ? { scale: 1.02, boxShadow: '0 0 20px rgba(99, 102, 241, 0.3)' } : {}}
                whileTap={canGoNext ? { scale: 0.98 } : {}}
              >
                {currentStep === totalSteps - 1 ? 'Finish' : 'Next'}
                {currentStep < totalSteps - 1 && <ChevronRight className="h-4 w-4" />}
              </motion.button>
            </div>
          </div>

          {/* Live Preview */}
          <AnimatePresence>
            {showPreview && (
              <motion.div
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 40 }}
                transition={{ duration: 0.4 }}
                className="hidden lg:block flex-1"
              >
                <div className="sticky top-28">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-muted-foreground">
                      Live Preview
                    </h3>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Eye className="h-3 w-3" />
                      Real-time
                    </div>
                  </div>

                  <div className="overflow-hidden rounded-2xl border border-border bg-muted/30 p-4">
                    <div className="origin-top scale-[0.65] sm:scale-75">
                      <ResumePreview
                        personalInfo={personalInfo}
                        summary={summary}
                        education={education}
                        experience={experience}
                        skills={skills}
                        projects={projects}
                        certifications={certifications}
                        selectedTemplate={selectedTemplate}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Mobile Preview Modal */}
      <AnimatePresence>
        {showPreview && (
          <motion.div
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowPreview(false)}
          >
            <motion.div
              className="absolute inset-x-4 top-4 bottom-4 overflow-y-auto rounded-2xl bg-background p-4"
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Resume Preview</h3>
                <motion.button
                  onClick={() => setShowPreview(false)}
                  className="rounded-lg p-2 hover:bg-muted text-sm"
                  whileTap={{ scale: 0.9 }}
                >
                  Close
                </motion.button>
              </div>
              <ResumePreview
                personalInfo={personalInfo}
                summary={summary}
                education={education}
                experience={experience}
                skills={skills}
                projects={projects}
                certifications={certifications}
                selectedTemplate={selectedTemplate}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
